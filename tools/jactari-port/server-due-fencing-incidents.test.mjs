import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {dispatchServerHeroMission,arriveServerHeroMission,
 scheduleServerHeroReturn,completeServerHeroReturn}
 from './server-military-mission.mjs';
import {runOneDueMissionEvent} from './server-due-event-runner.mjs';
import {commitServerAuthorizedJactariBattle} from './server-transactional-battle.mjs';

const army=n=>[{count:n,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null];
const hero=(id,owner,faction)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},
 army:army(180),careers:[],legendarySelections:[],
 legendaryGrants:{},spellOrders:{}
});
const authContext={token:'alice'};
const authenticate=c=>({authenticated:c?.token==='alice',playerId:c?.token});
const options=s=>({heroStore:s,authContext,authenticate,authorizeTarget:()=>true});
const rules={context:{weaponAdvantageFactor:.5},
 lossPolicy:{lossFactor:.3,source:'TEST_NOT_UBISOFT_S2'},
 unitCatalog:[],maxRounds:100};
function setup(filename=':memory:',twoAttacks=false){
 const s=openTrustedHeroStore({filename});
 s.registerPlayer('alice');s.registerPlayer('bob');
 s.putHero(hero('a','alice',1));
 if(twoAttacks)s.putHero(hero('a2','alice',1));
 s.putHero(hero('d','bob',2));
 s.defineMilitaryWorld({worldId:'w',worldSize:100});
 s.registerMilitaryCity({cityId:'origin',worldId:'w',
  ownerPlayerId:'alice',x:1,y:1});
 if(twoAttacks)s.registerMilitaryCity({cityId:'origin2',worldId:'w',
  ownerPlayerId:'alice',x:2,y:1});
 s.registerMilitaryCity({cityId:'target',worldId:'w',
  ownerPlayerId:'bob',x:8,y:8});
 s.stationHeroInCity({heroId:'a',cityId:'origin'});
 if(twoAttacks)s.stationHeroInCity({heroId:'a2',cityId:'origin2'});
 s.stationHeroInCity({heroId:'d',cityId:'target'});
 dispatchServerHeroMission({...options(s),trustedSchedule:{nowMs:1000,arrivalAtMs:2000},
  command:{missionId:'m',attackerHeroId:'a',defenderHeroId:'d'}});
 if(twoAttacks)dispatchServerHeroMission({...options(s),
  trustedSchedule:{nowMs:1000,arrivalAtMs:2000},
  command:{missionId:'m2',attackerHeroId:'a2',defenderHeroId:'d'}});
 return s;
}
const arrive=(s,{workerId,attempt},serverNowMs=2000)=>
 arriveServerHeroMission({...options(s),command:{missionId:'m'},serverNowMs,
  lease:{workerId,attempt}});
const run=(s,clock,authorizeTarget=()=>true)=>runOneDueMissionEvent({
 heroStore:s,serverNowMs:clock,workerId:'worker1',leaseMs:100,
 authenticateScheduler:()=>true,authorizeTarget
});

test('stale lease cannot advance mission after a new worker claims at boundary',()=>{
 const s=setup();
 try{
  const old=s.claimNextDueMissionEvent({nowMs:2000,workerId:'one',leaseMs:100});
  const newer=s.claimNextDueMissionEvent({nowMs:2100,workerId:'two',leaseMs:100});
  assert.equal(old.attempt,1);assert.equal(newer.attempt,2);
  assert.throws(()=>arrive(s,{workerId:'one',attempt:1},2100),/Stale or expired/);
  assert.throws(()=>arrive(s,{workerId:'two',attempt:1},2100),/Stale or expired/);
  assert.equal(s.getMission('m').status,'traveling');
  assert.deepEqual(s.getMissionEvents('m').map(x=>x.event.phase),['dispatched']);
  assert.equal(arrive(s,{workerId:'two',attempt:2},2100).status,'arrived');
  assert.equal(s.getMissionDueEvent({missionId:'m',eventKind:'arrival'}).status,'done');
  assert.throws(()=>arrive(s,{workerId:'one',attempt:1},2100),/Stale or expired/);
 }finally{s.close();}
});
test('worker lease expiration is strict and does not modify army or mission',()=>{
 const s=setup();
 try{
  s.claimNextDueMissionEvent({nowMs:2000,workerId:'one',leaseMs:100});
  const before=s.getHero('a');
  assert.throws(()=>arrive(s,{workerId:'one',attempt:1},2100),/Stale or expired/);
  assert.deepEqual(s.getHero('a'),before);
  assert.equal(s.getBattleAuditCounts().commands,0);
  assert.equal(s.getMission('m').status,'traveling');
 }finally{s.close();}
});
test('blocked target is persisted with only a fixed incident category',()=>{
 const s=setup();
 try{
  const denied=run(s,2000,()=>false);
  assert.equal(denied.kind,'blocked');
  assert.equal(denied.reasonCode,'target_denied');
  assert.equal(denied.incidentRecorded,true);
  const incidents=s.getMissionDueIncidents('m');
  assert.equal(incidents.length,1);
  assert.deepEqual(Object.keys(incidents[0]),[
   'missionId','eventKind','attempt','workerId','observedAtMs','reasonCode']);
  assert.equal(incidents[0].reasonCode,'target_denied');
  assert.equal(s.getMission('m').status,'traveling');
  assert.equal(run(s,2099).kind,'idle');
  const recovered=run(s,2100);
  assert.equal(recovered.kind,'processed');
  assert.equal(s.getMission('m').status,'arrived');
  assert.equal(s.getMissionDueIncidents('m').length,1);
 }finally{s.close();}
});
test('incident insert rejects spoofing, invalid categories and duplicate attempt',()=>{
 const s=setup();
 try{
  s.claimNextDueMissionEvent({nowMs:2000,workerId:'one',leaseMs:100});
  const input={missionId:'m',eventKind:'arrival',workerId:'one',
   attempt:1,nowMs:2000,reasonCode:'target_denied'};
  assert.throws(()=>s.recordDueMissionIncident({...input,workerId:'other'}),
   /Stale or expired/);
  assert.throws(()=>s.recordDueMissionIncident({...input,
   reasonCode:'my full secret log message'}),/category/);
  assert.equal(s.recordDueMissionIncident(input).reasonCode,'target_denied');
  assert.throws(()=>s.recordDueMissionIncident(input),/Duplicate/);
  assert.throws(()=>s.recordDueMissionIncident({...input,nowMs:2100}),
   /Stale or expired/);
 }finally{s.close();}
});
test('fenced return completion requires current lease and authorized return date',()=>{
 const s=setup();
 try{
  arriveServerHeroMission({...options(s),command:{missionId:'m'},serverNowMs:2000});
  const battle=commitServerAuthorizedJactariBattle({...options(s),
   command:{commandId:'battle1',attackerHeroId:'a',defenderHeroId:'d',missionId:'m'},
   trustedRules:rules,serverNowMs:2000});
  assert.equal(battle.persistence.applied,true);
  scheduleServerHeroReturn({...options(s),command:{missionId:'m'},
   trustedSchedule:{nowMs:2001,returnAtMs:3000}});
  const old=s.claimNextDueMissionEvent({nowMs:3000,workerId:'one',leaseMs:100});
  assert.equal(old.eventKind,'return_completion');
  const newer=s.claimNextDueMissionEvent({nowMs:3100,workerId:'two',leaseMs:100});
  assert.throws(()=>completeServerHeroReturn({...options(s),
   command:{missionId:'m'},serverNowMs:3100,
   lease:{workerId:'one',attempt:old.attempt}}),/Stale or expired/);
  assert.equal(s.getMission('m').status,'returning');
  assert.equal(completeServerHeroReturn({...options(s),
   command:{missionId:'m'},serverNowMs:3100,
   lease:{workerId:'two',attempt:newer.attempt}}).status,'completed');
  assert.equal(s.getMissionDueEvent({missionId:'m',
   eventKind:'return_completion'}).status,'done');
 }finally{s.close();}
});
test('same city / same exact ETA is visible as collision, without resolving it',()=>{
 const s=setup(':memory:',true);
 try{
  const check=s.inspectSimultaneousArrivals('m');
  assert.equal(check.hasGeographicRoute,true);
  assert.equal(check.destinationCityId,'target');
  assert.deepEqual(check.candidateMissionIds,['m2']);
  assert.equal(check.requiresArbitration,true);
  assert.equal(check.automaticConflictResolution,false);
  assert.equal(s.inspectSimultaneousArrivals('m2').candidateMissionIds[0],'m');
  assert.equal(s.inspectSimultaneousArrivals('absent'),null);
  assert.equal(s.getMission('m').status,'traveling');
  assert.equal(s.getMission('m2').status,'traveling');
 }finally{s.close();}
});
test('SQLite restart retains incident audit and competitor cannot bypass lease',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-fencing-'));
 const filename=path.join(dir,'db.sqlite');
 let a,b;
 try{
  a=setup(filename);
  assert.equal(run(a,2000,()=>false).kind,'blocked');
  a.close();a=null;
  b=openTrustedHeroStore({filename});
  assert.equal(b.getMissionDueIncidents('m')[0].reasonCode,'target_denied');
  assert.equal(b.claimNextDueMissionEvent({nowMs:2099,workerId:'two'}),null);
  const next=b.claimNextDueMissionEvent({nowMs:2100,workerId:'two'});
  assert.equal(next.attempt,2);
  assert.throws(()=>arrive(b,{workerId:'worker1',attempt:1},2100),
   /Stale or expired/);
  assert.equal(arrive(b,{workerId:'two',attempt:2},2100).status,'arrived');
  assert.equal(b.getMissionDueIncidents('m').length,1);
 }finally{a?.close();b?.close();fs.rmSync(dir,{recursive:true,force:true});}
});
