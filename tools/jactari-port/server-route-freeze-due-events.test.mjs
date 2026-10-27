import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {dispatchServerHeroMission,arriveServerHeroMission,
 scheduleServerHeroReturn,completeServerHeroReturn,cancelServerUnresolvedMission}
 from './server-military-mission.mjs';
import {commitServerAuthorizedJactariBattle} from './server-transactional-battle.mjs';

const army=n=>[{count:n,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null];
const hero=(id,owner,faction)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},
 army:army(180),careers:[],legendarySelections:[],
 legendaryGrants:{},spellOrders:{}
});
const authenticate=c=>({authenticated:!!c&&c.token==='alice',playerId:c?.token});
const opts=s=>({heroStore:s,authContext:{token:'alice'},
 authenticate,authorizeTarget:()=>true});
const rules={context:{weaponAdvantageFactor:.5},
 lossPolicy:{lossFactor:.3,source:'TEST_JACTARI_NOT_UBISOFT_S2'},
 unitCatalog:[],maxRounds:100};
function fixture(filename=':memory:'){
 const s=openTrustedHeroStore({filename});
 for(const p of ['alice','bob','carol'])s.registerPlayer(p);
 for(const h of [['a1','alice',1],['a2','alice',1],
  ['d1','bob',2],['d2','carol',2]])s.putHero(hero(...h));
 s.defineMilitaryWorld({worldId:'w',worldSize:20});
 for(const [cityId,ownerPlayerId,x,y] of [
  ['ca1','alice',1,1],['ca2','alice',1,8],
  ['cd1','bob',8,1],['cd2','carol',8,8]
 ])s.registerMilitaryCity({cityId,worldId:'w',ownerPlayerId,x,y,firstCity:false});
 for(const [heroId,cityId] of [['a1','ca1'],['a2','ca2'],
  ['d1','cd1'],['d2','cd2']])s.stationHeroInCity({heroId,cityId});
 s.createMilitaryAlliance({worldId:'w',allianceId:'red'});
 s.createMilitaryAlliance({worldId:'w',allianceId:'blue'});
 s.setMilitaryAllianceMembership({worldId:'w',playerId:'alice',allianceId:'red'});
 s.setMilitaryAllianceMembership({worldId:'w',playerId:'bob',allianceId:'blue'});
 s.setMilitaryAllianceMembership({worldId:'w',playerId:'carol',allianceId:'blue'});
 s.setMilitaryDiplomacy({worldId:'w',firstAllianceId:'red',secondAllianceId:'blue',relation:'hostile'});
 s.setMilitaryTerritoryClaim({worldId:'w',x:5,y:1,ownerAllianceId:'blue'});
 return s;
}
const launch=(s,missionId='m1',attackerHeroId='a1',defenderHeroId='d1',
 trustedSchedule={nowMs:1000,arrivalAtMs:2000})=>
 dispatchServerHeroMission({...opts(s),
  command:{missionId,attackerHeroId,defenderHeroId},trustedSchedule});
const arrive=(s,missionId='m1',time=2000,authorizeTarget=()=>true)=>
 arriveServerHeroMission({...opts(s),
  command:{missionId},serverNowMs:time,authorizeTarget});

test('atomic dispatch freezes a detached territorial snapshot and due event',()=>{
 const s=fixture();
 try{
  const start=s.getWorldTerritorySnapshot('w');
  assert.equal(launch(s).status,'traveling');
  const frozen=s.getFrozenMissionTerritory('m1');
  assert.deepEqual(frozen.snapshot,start);
  assert.equal(frozen.worldRevision,start.revision);
  assert.equal(frozen.snapshotFingerprint.length,64);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).dueAtMs,2000);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'pending');
  frozen.snapshot.relations[0].relation='allied';
  assert.deepEqual(s.getFrozenMissionTerritory('m1').snapshot,start);
  assert.equal(s.compareFrozenMissionTerritory('m1').territoryUnchanged,true);
  assert.equal(launch(s).replayed,true);
  assert.deepEqual(s.getMissionEvents('m1').map(x=>x.event.phase),['dispatched']);
 }finally{s.close();}
});
test('diplomatic coup and territory change preserve departed snapshot, not current state',()=>{
 const s=fixture();
 try{
  launch(s);
  const departed=s.getFrozenMissionTerritory('m1');
  s.setMilitaryDiplomacy({worldId:'w',firstAllianceId:'red',
   secondAllianceId:'blue',relation:'allied'});
  s.setMilitaryTerritoryClaim({worldId:'w',x:5,y:1,ownerAllianceId:'red'});
  const comparison=s.compareFrozenMissionTerritory('m1');
  assert.equal(comparison.territoryUnchanged,false);
  assert.ok(comparison.currentRevision>comparison.departedRevision);
  assert.equal(comparison.automaticMissionCancellation,false);
  assert.deepEqual(s.getFrozenMissionTerritory('m1'),departed);
  assert.equal(s.getMission('m1').status,'traveling');
  assert.equal(arrive(s).status,'arrived');
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'done');
 }finally{s.close();}
});
test('two workers claim equal due timestamps in stable order and cannot double-lease',()=>{
 const s=fixture();
 try{
  launch(s,'m2','a2','d2');
  launch(s,'m1','a1','d1');
  assert.equal(s.claimNextDueMissionEvent({nowMs:1999,workerId:'first'}),null);
  const first=s.claimNextDueMissionEvent({nowMs:2000,workerId:'first',leaseMs:100});
  assert.deepEqual([first.missionId,first.eventKind,first.attempt],['m1','arrival',1]);
  const second=s.claimNextDueMissionEvent({nowMs:2000,workerId:'second',leaseMs:100});
  assert.equal(second.missionId,'m2');
  assert.equal(s.claimNextDueMissionEvent({nowMs:2099,workerId:'third'}),null);
  assert.throws(()=>s.confirmDueMissionEvent({
   missionId:'m1',eventKind:'arrival',workerId:'first',attempt:1}),/requires completed/);
  const retry=s.claimNextDueMissionEvent({nowMs:2100,workerId:'third'});
  assert.equal(retry.missionId,'m1');
  assert.equal(retry.attempt,2);
  assert.equal(arrive(s).status,'arrived');
  assert.equal(s.confirmDueMissionEvent({
   missionId:'m1',eventKind:'arrival',workerId:'third',attempt:2}).confirmed,true);
  assert.throws(()=>s.confirmDueMissionEvent({
   missionId:'m1',eventKind:'arrival',workerId:'first',attempt:1}),/stale/);
  assert.equal(arrive(s,'m2').status,'arrived');
  assert.equal(s.confirmDueMissionEvent({
   missionId:'m2',eventKind:'arrival',workerId:'second',attempt:1}).confirmed,true);
  assert.equal(s.claimNextDueMissionEvent({nowMs:9999,workerId:'third'}),null);
 }finally{s.close();}
});
test('failed authorization never acknowledges an event or rewrites troop state',()=>{
 const s=fixture();
 try{
  launch(s);
  const before=s.getHero('a1');
  const claim=s.claimNextDueMissionEvent({nowMs:2000,workerId:'worker',leaseMs:100});
  assert.equal(claim.missionId,'m1');
  assert.throws(()=>arrive(s,'m1',2000,()=>false),/denied/);
  assert.equal(s.getMission('m1').status,'traveling');
  assert.deepEqual(s.getHero('a1'),before);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'leased');
  assert.throws(()=>s.confirmDueMissionEvent({
   missionId:'m1',eventKind:'arrival',workerId:'worker',attempt:1}),/requires completed/);
  assert.equal(s.claimNextDueMissionEvent({nowMs:2100,workerId:'recovery'}).attempt,2);
  assert.equal(arrive(s).status,'arrived');
 }finally{s.close();}
});
test('cancellation cannot accidentally resume a leased arrival event',()=>{
 const s=fixture();
 try{
  launch(s);
  s.claimNextDueMissionEvent({nowMs:2000,workerId:'worker'});
  const cancel=cancelServerUnresolvedMission({...opts(s),
   command:{missionId:'m1'},authorizeCancellation:()=>true});
  assert.equal(cancel.status,'cancelled');
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'cancelled');
  assert.equal(s.claimNextDueMissionEvent({nowMs:200000,workerId:'other'}),null);
  assert.throws(()=>arrive(s),/cannot arrive/i);
 }finally{s.close();}
});
test('server-trusted return scheduling creates exactly one return due-event',()=>{
 const s=fixture();
 try{
  launch(s);
  arrive(s);
  const receipt=commitServerAuthorizedJactariBattle({...opts(s),
   command:{commandId:'b1',attackerHeroId:'a1',defenderHeroId:'d1',missionId:'m1'},
   trustedRules:rules,serverNowMs:2000});
  assert.equal(receipt.persistence.applied,true);
  const cmd={command:{missionId:'m1'},trustedSchedule:{nowMs:2001,returnAtMs:3000}};
  assert.equal(scheduleServerHeroReturn({...opts(s),...cmd}).status,'returning');
  assert.equal(scheduleServerHeroReturn({...opts(s),...cmd}).replayed,true);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'return_completion'}).dueAtMs,3000);
  assert.equal(s.claimNextDueMissionEvent({nowMs:2999,workerId:'returner'}),null);
  const work=s.claimNextDueMissionEvent({nowMs:3000,workerId:'returner'});
  assert.equal(work.eventKind,'return_completion');
  assert.throws(()=>completeServerHeroReturn({...opts(s),
   command:{missionId:'m1'},serverNowMs:2999}),/not yet due/);
  assert.equal(completeServerHeroReturn({...opts(s),
   command:{missionId:'m1'},serverNowMs:3000}).status,'completed');
  assert.equal(s.confirmDueMissionEvent({missionId:'m1',eventKind:'return_completion',
   workerId:'returner',attempt:1}).confirmed,true);
  assert.equal(s.claimNextDueMissionEvent({nowMs:999999,workerId:'returner'}),null);
 }finally{s.close();}
});
test('SQLite reopen and independent connections serialize leases and snapshots',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-route-freeze-'));
 const filename=path.join(temp,'world.sqlite');
 let a,b;
 try{
  a=fixture(filename);
  launch(a);
  const frozen=a.getFrozenMissionTerritory('m1');
  b=openTrustedHeroStore({filename});
  assert.deepEqual(b.getFrozenMissionTerritory('m1'),frozen);
  assert.equal(a.claimNextDueMissionEvent({nowMs:2000,workerId:'one'}).attempt,1);
  assert.equal(b.claimNextDueMissionEvent({nowMs:2001,workerId:'two'}),null);
  a.close();a=null;
  b.setMilitaryAllianceMembership({worldId:'w',playerId:'bob',allianceId:'red'});
  assert.equal(b.compareFrozenMissionTerritory('m1').territoryUnchanged,false);
  assert.deepEqual(b.getFrozenMissionTerritory('m1'),frozen);
  assert.equal(b.claimNextDueMissionEvent({nowMs:32001,workerId:'two'}).attempt,2);
  assert.equal(arrive(b).status,'arrived');
  assert.equal(b.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'done');
 }finally{a?.close();b?.close();fs.rmSync(temp,{recursive:true,force:true});}
});
test('unsafe lease sizes, times and spoofed worker IDs are rejected',()=>{
 const s=fixture();
 try{
  launch(s);
  for(const val of [0,-1,3600001,1.2,Number.MAX_SAFE_INTEGER]){
   assert.throws(()=>s.claimNextDueMissionEvent({
    nowMs:2000,workerId:'worker',leaseMs:val}));
  }
  assert.throws(()=>s.claimNextDueMissionEvent({
   nowMs:-1,workerId:'worker'}),/epoch milliseconds/);
  assert.throws(()=>s.claimNextDueMissionEvent({
   nowMs:2000,workerId:'malicious ID with spaces'}),/Invalid/);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'return_completion'}),null);
 }finally{s.close();}
});
