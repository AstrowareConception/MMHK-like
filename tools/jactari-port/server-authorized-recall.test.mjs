import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {dispatchServerHeroMission,arriveServerHeroMission,
 requestServerHeroRecall,completeServerHeroReturn} from './server-military-mission.mjs';
import {approveServerHeroRecall} from './server-recall-approval.mjs';
import {runOneDueMissionEvent} from './server-due-event-runner.mjs';

const army=n=>[{count:n,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null];
const hero=(id,owner,faction)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},
 army:army(180),careers:[],legendarySelections:[],
 legendaryGrants:{},spellOrders:{}
});
const playerAuth=c=>({authenticated:c?.token==='alice',playerId:c?.token});
const player=s=>({heroStore:s,authContext:{token:'alice'},
 authenticate:playerAuth,authorizeTarget:()=>true});
const approval=s=>({heroStore:s,command:{missionId:'m1'},
 authContext:{ops:'ops1'},
 authenticateRecallAuthority:c=>({
  authenticated:c?.ops==='ops1',canApproveRecall:true,authorityId:'ops1'
 }),authorizeRecall:()=>true,
 policyId:'EXPERIMENTAL_RECALL_V11',
 trustedSchedule:{nowMs:1500,returnAtMs:4000}});
const worker=(s,at,workerId='worker1')=>runOneDueMissionEvent({
 heroStore:s,workerId,serverNowMs:at,leaseMs:300,
 authenticateScheduler:()=>true,authorizeTarget:()=>true
});
function fixture(file=':memory:',second=false){
 const s=openTrustedHeroStore({filename:file});
 s.registerPlayer('alice');s.registerPlayer('bob');
 s.putHero(hero('a1','alice',1));
 if(second)s.putHero(hero('a2','alice',1));
 s.putHero(hero('d','bob',2));
 s.defineMilitaryWorld({worldId:'w',worldSize:100});
 for(const [cityId,owner,x,y] of [['ca1','alice',1,1],
   ['target','bob',10,10],...(second?[['ca2','alice',2,2]]:[])])
  s.registerMilitaryCity({cityId,worldId:'w',ownerPlayerId:owner,x,y});
 s.stationHeroInCity({heroId:'a1',cityId:'ca1'});
 s.stationHeroInCity({heroId:'d',cityId:'target'});
 if(second)s.stationHeroInCity({heroId:'a2',cityId:'ca2'});
 for(const [missionId,attackerHeroId] of [
  ['m1','a1'],...(second?[['m2','a2']]:[])])
  dispatchServerHeroMission({...player(s),
   command:{missionId,attackerHeroId,defenderHeroId:'d'},
   trustedSchedule:{nowMs:1000,arrivalAtMs:5000}});
 return s;
}
const request=s=>requestServerHeroRecall({...player(s),
 command:{missionId:'m1'},serverNowMs:1300});
const approve=s=>approveServerHeroRecall(approval(s));

test('approved server-only recall cancels attack ETA and schedules separate return',()=>{
 const s=fixture();
 try{
  const troops=s.getHero('a1');
  const initial=s.getMission('m1');
  assert.equal(request(s).disposition,'pending');
  const plan=approve(s);
  assert.equal(plan.returnAtMs,4000);
  assert.equal(plan.historicalCertification,false);
  assert.equal(plan.officialUbisoftS2Recall,false);
  assert.equal(plan.replayed,false);
  assert.equal(s.getMission('m1').status,'recall_returning');
  assert.equal(s.getMission('m1').arrivalAtMs,initial.arrivalAtMs);
  assert.equal(s.getMission('m1').returnAtMs,4000);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'cancelled');
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'return_completion'}).dueAtMs,4000);
  assert.deepEqual(s.getHero('a1'),troops);
  assert.throws(()=>arriveServerHeroMission({...player(s),
   command:{missionId:'m1'},serverNowMs:5000}),/recall is returning/);
  assert.equal(s.getBattleAuditCounts().commands,0);
 }finally{s.close();}
});
test('recalled army completes on explicit server ETA without battle or lost soldiers',()=>{
 const s=fixture();
 try{
  request(s);approve(s);
  const before=s.getHero('a1');
  assert.equal(worker(s,3999).kind,'idle');
  const event=worker(s,4000);
  assert.equal(event.kind,'processed');
  assert.equal(event.event.eventKind,'return_completion');
  assert.equal(event.status,'recalled'); // V12 explicit recall terminal state
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'return_completion'}).status,'done');
  assert.equal(s.getMission('m1').status,'recalled');
  assert.equal(s.getBattleAuditCounts().commands,0);
  assert.deepEqual(s.getHero('a1'),before);
  assert.deepEqual(s.getMissionEvents('m1').map(x=>x.event.phase),
   ['dispatched','recall_requested','recall_approved','recall_return_completed']);
  const replay=completeServerHeroReturn({...player(s),
   command:{missionId:'m1'},serverNowMs:4000});
  assert.equal(replay.replayed,true);
  assert.equal(worker(s,6000).kind,'idle');
 }finally{s.close();}
});
test('authorization is independent from player request, denies spoofed timing and policy',()=>{
 const s=fixture();
 try{
  assert.throws(()=>approve(s),/existing request/);
  request(s);
  assert.throws(()=>approveServerHeroRecall({
   ...approval(s),authenticateRecallAuthority:()=>({
    authenticated:true,canApproveRecall:false,authorityId:'player'
   })}),/authority required/);
  assert.throws(()=>approveServerHeroRecall({
   ...approval(s),authorizeRecall:()=>false}),/approval denied/);
  assert.throws(()=>approveServerHeroRecall({
   ...approval(s),command:{missionId:'m1',returnAtMs:1500}
  }),/forbidden fields/);
  assert.throws(()=>approveServerHeroRecall({
   ...approval(s),trustedSchedule:{nowMs:1500,returnAtMs:1500}
  }),/follow server approval/);
  assert.throws(()=>approveServerHeroRecall({
   ...approval(s),trustedSchedule:{nowMs:1200,returnAtMs:4000}
  }),/between request and arrival/);
  assert.throws(()=>approveServerHeroRecall({
   ...approval(s),trustedSchedule:{nowMs:5000,returnAtMs:6000}
  }),/between request and arrival/);
  assert.equal(s.getMissionRecallPlan('m1'),null);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'pending');
  assert.equal(s.getMission('m1').returnAtMs,null);
 }finally{s.close();}
});
test('approval is replayable for the same policy and refuses conflicting schedule',()=>{
 const s=fixture();
 try{
  request(s);const first=approve(s);
  const replay=approve(s);
  assert.equal(replay.replayed,true);
  assert.equal(first.returnAtMs,replay.returnAtMs);
  assert.equal(s.getMissionEvents('m1').filter(x=>x.event.phase==='recall_approved').length,1);
  assert.throws(()=>approveServerHeroRecall({
   ...approval(s),trustedSchedule:{nowMs:1500,returnAtMs:4300}
  }),/collision/);
  assert.equal(s.getMissionRecallPlan('m1').returnAtMs,4000);
  assert.equal(s.getMissionDueEvent({missionId:'m1',eventKind:'return_completion'}).dueAtMs,4000);
 }finally{s.close();}
});
test('recall frees simultaneous-arrival collision only by verified removal from arrival queue',()=>{
 const s=fixture(':memory:',true);
 try{
  assert.deepEqual(s.inspectSimultaneousArrivals('m2').candidateMissionIds,['m1']);
  request(s);approve(s);
  assert.equal(s.inspectSimultaneousArrivals('m1').requiresArbitration,false);
  assert.equal(s.inspectSimultaneousArrivals('m2').requiresArbitration,false);
  assert.equal(arriveServerHeroMission({...player(s),command:{missionId:'m2'},
   serverNowMs:5000}).status,'arrived');
  assert.equal(s.getBattleAuditCounts().commands,0);
  assert.equal(worker(s,4000).kind,'processed');
 }finally{s.close();}
});
test('old worker cannot settle recalled return after its lease is stolen',()=>{
 const s=fixture();
 try{
  request(s);approve(s);
  const a=s.claimNextDueMissionEvent({nowMs:4000,workerId:'workerA',leaseMs:100});
  const b=s.claimNextDueMissionEvent({nowMs:4100,workerId:'workerB',leaseMs:100});
  assert.equal(a.attempt,1);assert.equal(b.attempt,2);
  assert.throws(()=>completeServerHeroReturn({...player(s),
   command:{missionId:'m1'},serverNowMs:4100,
   lease:{workerId:'workerA',attempt:1}}),/Stale or expired/);
  assert.equal(s.getMission('m1').status,'recall_returning');
  assert.equal(completeServerHeroReturn({...player(s),
   command:{missionId:'m1'},serverNowMs:4100,
   lease:{workerId:'workerB',attempt:2}}).status,'recalled');
  assert.equal(s.getBattleAuditCounts().commands,0);
 }finally{s.close();}
});
test('SQLite restart preserves planned recall, policy and due events',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-authorized-recall-'));
 const file=path.join(dir,'data.sqlite');
 let a,b;
 try{
  a=fixture(file);
  request(a);const plan=approve(a);
  b=openTrustedHeroStore({filename:file});
  assert.deepEqual(b.getMissionRecallPlan('m1'),{
   missionId:'m1',approvedBy:plan.approvedBy,policyId:plan.policyId,
   approvedAtMs:1500,returnAtMs:4000,
   historicalCertification:false,officialUbisoftS2Recall:false
  });
  assert.equal(b.getMissionDueEvent({missionId:'m1',eventKind:'arrival'}).status,'cancelled');
  a.close();a=null;
  assert.equal(worker(b,4000,'recoverer').kind,'processed');
  assert.equal(b.getMission('m1').status,'recalled');
  assert.equal(b.getMissionEvents('m1').at(-1).event.phase,'recall_return_completed');
 }finally{a?.close();b?.close();fs.rmSync(dir,{recursive:true,force:true});}
});
