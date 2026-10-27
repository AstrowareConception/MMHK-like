import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {dispatchServerHeroMission,arriveServerHeroMission,
 cancelServerUnresolvedMission,requestServerHeroRecall} from './server-military-mission.mjs';
import {runOneDueMissionEvent} from './server-due-event-runner.mjs';

const army=n=>[{count:n,weapon:'I',unitPower:10,goldCost:5},
 null,null,null,null,null,null];
const hero=(id,owner,faction)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},
 army:army(90),careers:[],legendarySelections:[],
 legendaryGrants:{},spellOrders:{}
});
const auth=c=>({authenticated:c?.token==='alice',playerId:c?.token});
const args=s=>({heroStore:s,authContext:{token:'alice'},
 authenticate:auth,authorizeTarget:()=>true});
const mission=(missionId,attackerHeroId,arrivalAtMs=2000)=>({
 command:{missionId,attackerHeroId,defenderHeroId:'d'},
 trustedSchedule:{nowMs:1000,arrivalAtMs}
});
function fixture(filename=':memory:',second=true){
 const s=openTrustedHeroStore({filename});
 s.registerPlayer('alice');s.registerPlayer('bob');
 for(const [h,o,f] of [['a1','alice',1],['a2','alice',1],['d','bob',2]])
  s.putHero(hero(h,o,f));
 s.defineMilitaryWorld({worldId:'w',worldSize:100});
 for(const [cityId,ownerPlayerId,x,y] of [
  ['ca1','alice',1,1],['ca2','alice',2,2],['cd','bob',10,10]])
  s.registerMilitaryCity({cityId,worldId:'w',ownerPlayerId,x,y});
 for(const [h,c] of [['a1','ca1'],['a2','ca2'],['d','cd']])
  s.stationHeroInCity({heroId:h,cityId:c});
 dispatchServerHeroMission({...args(s),...mission('m1','a1')});
 if(second)dispatchServerHeroMission({...args(s),...mission('m2','a2')});
 return s;
}
const runner=(s,workerId,nowMs=2000)=>runOneDueMissionEvent({
 heroStore:s,workerId,serverNowMs:nowMs,leaseMs:200,
 authenticateScheduler:()=>true,authorizeTarget:()=>true
});
const arrive=(s,id,now=2000)=>arriveServerHeroMission({
 ...args(s),command:{missionId:id},serverNowMs:now
});
test('same city and identical ETA fail closed before mission transition or combat',()=>{
 const s=fixture();
 try{
  const first=s.inspectSimultaneousArrivals('m1');
  assert.deepEqual(first.candidateMissionIds,['m2']);
  const armyBefore=s.getHero('a1');
  assert.throws(()=>arrive(s,'m1'),/Simultaneous target arrival/);
  assert.throws(()=>arrive(s,'m2'),/Simultaneous target arrival/);
  assert.equal(s.getMission('m1').status,'traveling');
  assert.equal(s.getMission('m2').status,'traveling');
  assert.deepEqual(s.getHero('a1'),armyBefore);
  assert.deepEqual(s.getBattleAuditCounts(),{commands:0,events:0});
  assert.deepEqual(s.getMissionEvents('m1').map(x=>x.event.phase),['dispatched']);
 }finally{s.close();}
});
test('two workers receive blocked arbitration signal and persist incidents, not arrival',()=>{
 const s=fixture();
 try{
  const a=runner(s,'workerA');
  const b=runner(s,'workerB');
  assert.equal(a.kind,'blocked');
  assert.equal(b.kind,'blocked');
  assert.equal(a.requiresArbitration,true);
  assert.equal(b.requiresArbitration,true);
  assert.equal(a.reasonCode,'mission_state');
  assert.equal(b.reasonCode,'mission_state');
  assert.equal(s.getMission('m1').status,'traveling');
  assert.equal(s.getMission('m2').status,'traveling');
  assert.equal(s.getMissionDueIncidents('m1')[0].reasonCode,'mission_state');
  assert.equal(s.getMissionDueIncidents('m2')[0].reasonCode,'mission_state');
  assert.equal(runner(s,'workerC',2199).kind,'idle');
 }finally{s.close();}
});
test('administrative cancellation of one mission lets the other arrive, not pick winner',()=>{
 const s=fixture();
 try{
  assert.throws(()=>arrive(s,'m1'),/Simultaneous/);
  assert.throws(()=>cancelServerUnresolvedMission({
   ...args(s),command:{missionId:'m2'},authorizeCancellation:()=>false
  }),/cancellation denied/);
  assert.equal(s.inspectSimultaneousArrivals('m1').requiresArbitration,true);
  assert.equal(cancelServerUnresolvedMission({
   ...args(s),command:{missionId:'m2'},authorizeCancellation:()=>true
  }).status,'cancelled');
  assert.equal(s.inspectSimultaneousArrivals('m1').requiresArbitration,false);
  assert.equal(arrive(s,'m1').status,'arrived');
  assert.equal(s.getBattleAuditCounts().commands,0);
  assert.equal(s.getMissionDueEvent({missionId:'m2',eventKind:'arrival'}).status,'cancelled');
 }finally{s.close();}
});
test('distinct scheduled arrival times do not create artificial collision',()=>{
 const s=fixture(':memory:',false);
 try{
  dispatchServerHeroMission({...args(s),...mission('m2','a2',2500)});
  assert.equal(s.inspectSimultaneousArrivals('m1').requiresArbitration,false);
  assert.equal(arrive(s,'m1').status,'arrived');
  assert.equal(arrive(s,'m2',2500).status,'arrived');
 }finally{s.close();}
});
test('owner recall is an auditable pending REQUEST, not a cancellation or ETA rewrite',()=>{
 const s=fixture(':memory:',false);
 try{
  const before=s.getMission('m1');
  const result=requestServerHeroRecall({...args(s),
   command:{missionId:'m1'},serverNowMs:1500});
  assert.equal(result.disposition,'pending');
  assert.equal(result.automaticRecall,false);
  assert.equal(result.replayed,false);
  assert.deepEqual(s.getMission('m1'),before);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'pending');
  assert.deepEqual(s.getMissionEvents('m1').map(x=>x.event.phase),
   ['dispatched','recall_requested']);
  assert.equal(requestServerHeroRecall({...args(s),
   command:{missionId:'m1'},serverNowMs:1600}).replayed,true);
  assert.equal(s.getMissionEvents('m1').length,2);
  assert.equal(arrive(s,'m1').status,'arrived');
  assert.equal(s.getMissionRecallRequest('m1').disposition,'pending');
 }finally{s.close();}
});
test('unauthorized, premature and post-arrival recall requests fail without new rows',()=>{
 const s=fixture(':memory:',false);
 try{
  assert.throws(()=>requestServerHeroRecall({...args(s),
   authContext:{token:'bob'},serverNowMs:1500,command:{missionId:'m1'}
  }),/Unauthenticated/);
  assert.throws(()=>requestServerHeroRecall({...args(s),
   command:{missionId:'m1',actorPlayerId:'alice'},serverNowMs:1500
  }),/forbidden fields/);
  assert.throws(()=>requestServerHeroRecall({...args(s),
   command:{missionId:'m1'},serverNowMs:999
  }),/precede recorded dispatch/);
  assert.throws(()=>requestServerHeroRecall({...args(s),
   command:{missionId:'m1'},serverNowMs:2000
  }),/still traveling/);
  assert.equal(s.getMissionRecallRequest('m1'),null);
  assert.equal(s.getMission('m1').status,'traveling');
 }finally{s.close();}
});
test('SQLite reopen preserves request and simultaneous conflict gate across connections',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-v70-conflict-'));
 const filename=path.join(temp,'world.sqlite');
 let a,b;
 try{
  a=fixture(filename);
  requestServerHeroRecall({...args(a),command:{missionId:'m1'},serverNowMs:1500});
  b=openTrustedHeroStore({filename});
  assert.equal(b.getMissionRecallRequest('m1').disposition,'pending');
  assert.deepEqual(b.inspectSimultaneousArrivals('m1').candidateMissionIds,['m2']);
  assert.throws(()=>arrive(b,'m1'),/Simultaneous target arrival/);
  assert.equal(a.getMission('m1').status,'traveling');
  a.close();a=null;
  assert.throws(()=>arrive(b,'m2'),/Simultaneous target arrival/);
  cancelServerUnresolvedMission({
   ...args(b),command:{missionId:'m2'},authorizeCancellation:()=>true
  });
  assert.equal(arrive(b,'m1').status,'arrived');
  assert.equal(b.getMissionRecallRequest('m1').requestedAtMs,1500);
 }finally{a?.close();b?.close();fs.rmSync(temp,{recursive:true,force:true});}
});
