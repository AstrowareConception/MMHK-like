import test from 'node:test';
import assert from 'node:assert/strict';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {dispatchServerHeroMission} from './server-military-mission.mjs';
import {runOneDueMissionEvent,runDueMissionBatch} from './server-due-event-runner.mjs';
const hero=(id,owner,faction)=>({id,ownerId:owner,
 profile:{faction,archetype:0,level:30},
 army:[{count:60,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null],
 careers:[],legendarySelections:[],legendaryGrants:{},spellOrders:{}});
const opts=s=>({heroStore:s,workerId:'worker1',serverNowMs:2000,
 authenticateScheduler:()=>true,authorizeTarget:()=>true,leaseMs:100});
function setup(){
 const s=openTrustedHeroStore();
 for(const id of ['alice','bob'])s.registerPlayer(id);
 s.putHero(hero('a','alice',1));s.putHero(hero('d','bob',2));
 s.defineMilitaryWorld({worldId:'w',worldSize:100});
 s.registerMilitaryCity({worldId:'w',cityId:'ca',ownerPlayerId:'alice',x:1,y:1});
 s.registerMilitaryCity({worldId:'w',cityId:'cd',ownerPlayerId:'bob',x:10,y:10});
 s.stationHeroInCity({heroId:'a',cityId:'ca'});
 s.stationHeroInCity({heroId:'d',cityId:'cd'});
 dispatchServerHeroMission({
  heroStore:s,authContext:{token:'alice'},
  authenticate:c=>({authenticated:c.token==='alice',playerId:c.token}),
  authorizeTarget:()=>true,
  command:{missionId:'m',attackerHeroId:'a',defenderHeroId:'d'},
  trustedSchedule:{nowMs:1000,arrivalAtMs:2000}
 });
 return s;
}
test('not due and unauthorized scheduler never mutate mission or claim',()=>{
 const s=setup();
 try{
  assert.throws(()=>runOneDueMissionEvent({...opts(s),
   authenticateScheduler:()=>false}),/authentication denied/);
  assert.equal(s.getMissionDueEvent({missionId:'m',eventKind:'arrival'}).status,'pending');
  assert.equal(runOneDueMissionEvent({...opts(s),serverNowMs:1999}).kind,'idle');
  assert.equal(s.getMission('m').status,'traveling');
 }finally{s.close();}
});
test('approved scheduler marks arrival once and leaves combat untouched',()=>{
 const s=setup();
 try{
  const first=runOneDueMissionEvent(opts(s));
  assert.equal(first.kind,'processed');
  assert.equal(first.status,'arrived');
  assert.equal(s.getMission('m').status,'arrived');
  assert.equal(s.getBattleAuditCounts().commands,0);
  assert.equal(s.getMissionDueEvent({missionId:'m',eventKind:'arrival'}).status,'done');
  assert.equal(runOneDueMissionEvent(opts(s)).kind,'idle');
 }finally{s.close();}
});
test('denied policy blocks event, recoverable at lease expiration',()=>{
 const s=setup();
 try{
  const blocked=runOneDueMissionEvent({...opts(s),authorizeTarget:()=>false});
  assert.equal(blocked.kind,'blocked');
  assert.match(blocked.reason,/denied/);
  assert.equal(s.getMission('m').status,'traveling');
  assert.equal(s.getMissionDueEvent({missionId:'m',eventKind:'arrival'}).status,'leased');
  assert.equal(runOneDueMissionEvent({...opts(s),serverNowMs:2099}).kind,'idle');
  const recovered=runOneDueMissionEvent({...opts(s),serverNowMs:2100});
  assert.equal(recovered.kind,'processed');
  assert.equal(recovered.event.attempt,2);
 }finally{s.close();}
});
test('bounded batch processes only configured finite amount',()=>{
 const s=setup();
 try{
  assert.throws(()=>runDueMissionBatch({...opts(s),maxEvents:0}),/maxEvents/);
  const report=runDueMissionBatch({...opts(s),maxEvents:5});
  assert.equal(report.attempted,1);
  assert.equal(report.processed,1);
  assert.equal(report.blocked,0);
  assert.equal(report.automaticCombatResolution,false);
  assert.deepEqual(report.events.map(e=>e.event.missionId),['m']);
 }finally{s.close();}
});
test('invalid worker credentials and unsafe clock are refused',()=>{
 const s=setup();
 try{
  assert.throws(()=>runOneDueMissionEvent({...opts(s),workerId:'bad worker'}),/Invalid worker/);
  assert.throws(()=>runOneDueMissionEvent({...opts(s),serverNowMs:-1}),/Invalid server clock/);
  assert.throws(()=>runOneDueMissionEvent({...opts(s),authenticateScheduler:null}),/callback/);
 }finally{s.close();}
});
