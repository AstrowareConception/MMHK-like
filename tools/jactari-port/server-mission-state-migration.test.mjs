import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {DatabaseSync} from 'node:sqlite';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {requestServerHeroRecall,dispatchServerHeroMission,
 completeServerHeroReturn} from './server-military-mission.mjs';
import {approveServerHeroRecall} from './server-recall-approval.mjs';
import {runOneDueMissionEvent} from './server-due-event-runner.mjs';
import {MILITARY_MISSION_SCHEMA_VERSION} from './mission-state-migration.mjs';

const army=[{count:100,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null];
const hero=(id,owner,faction)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},army,
 careers:[],legendarySelections:[],legendaryGrants:{},spellOrders:{}
});
const auth=c=>({authenticated:c?.token==='alice',playerId:c?.token});
const owner=s=>({heroStore:s,authContext:{token:'alice'},authenticate:auth,
 authorizeTarget:()=>true});
const recallCommand=missionId=>({missionId});
const dispatch=(s,missionId,attackerHeroId,arrivalAtMs)=>dispatchServerHeroMission({
 ...owner(s),command:{missionId,attackerHeroId,defenderHeroId:'defender'},
 trustedSchedule:{nowMs:1000,arrivalAtMs}
});
const request=(s,missionId)=>requestServerHeroRecall({
 ...owner(s),command:recallCommand(missionId),serverNowMs:1200
});
const approve=(s,missionId,nowMs,returnAtMs)=>approveServerHeroRecall({
 heroStore:s,command:recallCommand(missionId),policyId:'V11_UPGRADE_TEST',
 authContext:{admin:'ops'},
 authenticateRecallAuthority:c=>({
  authenticated:c.admin==='ops',canApproveRecall:true,authorityId:'ops'
 }),
 authorizeRecall:()=>true,trustedSchedule:{nowMs,returnAtMs}
});
function fixture(filename){
 const s=openTrustedHeroStore({filename});
 s.registerPlayer('alice');s.registerPlayer('bob');
 for(const name of ['attack-a','attack-b','attack-c'])
  s.putHero(hero(name,'alice',1));
 s.putHero(hero('defender','bob',2));
 s.defineMilitaryWorld({worldId:'world',worldSize:40});
 for(const [cityId,ownerPlayerId,x,y] of [
  ['town-a','alice',1,1],['town-b','alice',2,2],
  ['town-c','alice',3,3],['town-d','bob',20,20]
 ])s.registerMilitaryCity({cityId,worldId:'world',ownerPlayerId,x,y});
 for(const [heroId,cityId] of [
  ['attack-a','town-a'],['attack-b','town-b'],
  ['attack-c','town-c'],['defender','town-d']
 ])s.stationHeroInCity({heroId,cityId});
 dispatch(s,'recall-live','attack-a',5000);
 dispatch(s,'recall-done','attack-b',6000);
 dispatch(s,'normal-attack','attack-c',7000);
 request(s,'recall-live');approve(s,'recall-live',1500,4000);
 request(s,'recall-done');approve(s,'recall-done',1600,3000);
 assert.equal(runOneDueMissionEvent({heroStore:s,workerId:'testworker',
  serverNowMs:3000,authenticateScheduler:()=>true,
  authorizeTarget:()=>true}).kind,'processed');
 assert.equal(s.getMission('recall-done').status,'recalled');
 return s;
}
/**
 * Turn an actual V12 SQLite fixture into the precise V11 mission table and
 * V11's overloaded statuses while retaining all other persisted V11 tables.
 * This tests the same legacy schema and foreign-key graph seen in production.
 */
function downgradeToLegacyV11(filename){
 const db=new DatabaseSync(filename);
 try{
  db.exec('PRAGMA foreign_keys = OFF; BEGIN IMMEDIATE');
  db.exec(`
   CREATE TABLE military_missions_legacy(
    mission_id TEXT PRIMARY KEY,
    actor_player_id TEXT NOT NULL REFERENCES players(player_id),
    attacker_hero_id TEXT NOT NULL REFERENCES heroes(hero_id),
    defender_hero_id TEXT NOT NULL REFERENCES heroes(hero_id),
    status TEXT NOT NULL CHECK(status IN
     ('traveling','arrived','returning','completed','cancelled')),
    arrival_at_ms INTEGER NOT NULL,
    attacker_revision INTEGER NOT NULL,
    return_at_ms INTEGER,
    battle_command_id TEXT UNIQUE REFERENCES battle_commands(command_id),
    CHECK(attacker_hero_id <> defender_hero_id)
   );
   INSERT INTO military_missions_legacy
    (mission_id,actor_player_id,attacker_hero_id,defender_hero_id,
     status,arrival_at_ms,attacker_revision,return_at_ms,battle_command_id)
   SELECT mission_id,actor_player_id,attacker_hero_id,defender_hero_id,
    CASE status WHEN 'recall_returning' THEN 'traveling'
       WHEN 'recalled' THEN 'cancelled' ELSE status END,
    arrival_at_ms,attacker_revision,return_at_ms,battle_command_id
   FROM military_missions;
   DROP TABLE military_missions;
   ALTER TABLE military_missions_legacy RENAME TO military_missions;
   CREATE UNIQUE INDEX one_active_mission_per_attacker
    ON military_missions(attacker_hero_id)
    WHERE status IN ('traveling','arrived','returning');
   PRAGMA user_version=11;
   COMMIT;
   PRAGMA foreign_keys = ON;
  `);
  assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
 }finally{db.close();}
}
function temporary(){
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-schema-v12-'));
 return {filename:path.join(dir,'military.sqlite'),
  cleanup:()=>fs.rmSync(dir,{recursive:true,force:true})};
}

test('new SQLite stores use V12 with explicit recalled and recall_returning states',()=>{
 const t=temporary();
 try{
  const s=fixture(t.filename);
  try{
   assert.equal(s.militaryMissionSchemaVersion,MILITARY_MISSION_SCHEMA_VERSION);
   assert.equal(s.getMission('recall-live').status,'recall_returning');
   assert.equal(s.getMission('recall-done').status,'recalled');
   assert.equal(s.getMission('normal-attack').status,'traveling');
   assert.equal(s.getBattleAuditCounts().commands,0);
  }finally{s.close();}
  const db=new DatabaseSync(t.filename);
  try{
   assert.equal(db.prepare('PRAGMA user_version').get().user_version,12);
   assert.deepEqual(db.prepare('PRAGMA foreign_key_check').all(),[]);
  }finally{db.close();}
 }finally{t.cleanup();}
});

test('legacy V11 migration preserves all missions, history, routes, due events and recall approvals',()=>{
 const t=temporary();
 try{
  const before=fixture(t.filename);
  const frozen=before.getFrozenMissionTerritory('recall-live');
  const history=before.getMissionEvents('recall-done');
  const plan=before.getMissionRecallPlan('recall-live');
  const due=before.getMissionDueEvent({
   missionId:'recall-live',eventKind:'return_completion'});
  before.close();
  downgradeToLegacyV11(t.filename);
  const legacy=new DatabaseSync(t.filename);
  try{
   assert.equal(legacy.prepare("SELECT status FROM military_missions WHERE mission_id='recall-live'").get().status,'traveling');
   assert.equal(legacy.prepare("SELECT status FROM military_missions WHERE mission_id='recall-done'").get().status,'cancelled');
  }finally{legacy.close();}
  const migrated=openTrustedHeroStore({filename:t.filename});
  try{
   assert.equal(migrated.militaryMissionSchemaVersion,12);
   assert.equal(migrated.getMission('recall-live').status,'recall_returning');
   assert.equal(migrated.getMission('recall-done').status,'recalled');
   assert.equal(migrated.getMission('normal-attack').status,'traveling');
   assert.deepEqual(migrated.getFrozenMissionTerritory('recall-live'),frozen);
   assert.deepEqual(migrated.getMissionEvents('recall-done'),history);
   assert.deepEqual(migrated.getMissionRecallPlan('recall-live'),plan);
   assert.deepEqual(migrated.getMissionDueEvent({
    missionId:'recall-live',eventKind:'return_completion'}),due);
   assert.equal(migrated.getMissionDueEvent({
    missionId:'recall-live',eventKind:'arrival'}).status,'cancelled');
   assert.equal(migrated.getBattleAuditCounts().commands,0);
   // A hero actively returning from recall cannot be dispatched twice.
   assert.throws(()=>dispatch(migrated,'duplicate-hero','attack-a',8000),
    /already reserved/);
   assert.equal(runOneDueMissionEvent({
    heroStore:migrated,workerId:'newworker',serverNowMs:4000,
    authenticateScheduler:()=>true,authorizeTarget:()=>true
   }).kind,'processed');
   assert.equal(migrated.getMission('recall-live').status,'recalled');
   assert.equal(dispatch(migrated,'after-recall','attack-a',8000).status,'traveling');
  }finally{migrated.close();}
  const again=openTrustedHeroStore({filename:t.filename});
  try{
   assert.equal(again.militaryMissionSchemaVersion,12);
   assert.equal(again.getMission('recall-live').status,'recalled');
   assert.equal(again.getMission('after-recall').status,'traveling');
  }finally{again.close();}
  const raw=new DatabaseSync(t.filename);
  try{
   assert.deepEqual(raw.prepare('PRAGMA foreign_key_check').all(),[]);
   assert.equal(raw.prepare('PRAGMA user_version').get().user_version,12);
   assert.equal(raw.prepare('PRAGMA integrity_check').get().integrity_check,'ok');
  }finally{raw.close();}
 }finally{t.cleanup();}
});

test('inconsistent legacy recall status fails closed and leaves V11 schema intact',()=>{
 const t=temporary();
 try{
  const s=fixture(t.filename);
  s.close();
  downgradeToLegacyV11(t.filename);
  const raw=new DatabaseSync(t.filename);
  try{
   raw.prepare("UPDATE military_missions SET status='arrived' WHERE mission_id='recall-live'").run();
  }finally{raw.close();}
  assert.throws(()=>openTrustedHeroStore({filename:t.filename}),
   /Unrecognized legacy recall mission lifecycle/);
  const verify=new DatabaseSync(t.filename);
  try{
   const sql=verify.prepare("SELECT sql FROM sqlite_master WHERE name='military_missions'").get().sql;
   assert.equal(sql.includes("'recall_returning'"),false);
   assert.equal(verify.prepare('PRAGMA user_version').get().user_version,11);
   assert.equal(verify.prepare("SELECT status FROM military_missions WHERE mission_id='recall-live'").get().status,'arrived');
   assert.deepEqual(verify.prepare('PRAGMA foreign_key_check').all(),[]);
  }finally{verify.close();}
 }finally{t.cleanup();}
});

test('a recalled terminal mission never intercepts or produces duplicate casualty ledgers',()=>{
 const t=temporary();
 try{
  const s=fixture(t.filename);
  try{
   assert.equal(s.getMission('recall-done').status,'recalled');
   assert.equal(s.getBattleAuditCounts().commands,0);
   assert.equal(completeServerHeroReturn({...owner(s),
    command:{missionId:'recall-done'},serverNowMs:5000}).replayed,true);
   assert.equal(s.getMissionEvents('recall-done').filter(x=>x.event.phase==='recall_return_completed').length,1);
  }finally{s.close();}
 }finally{t.cleanup();}
});
