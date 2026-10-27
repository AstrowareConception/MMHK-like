/**
 * Experimental SQLite persistence for server-owned historical hero choices.
 *
 * This is a trusted SERVER-SIDE administration API. registerPlayer()/putHero()
 * must never be bound directly to an HTTP client or user-supplied actor ID.
 * Uses node:sqlite (Node 22 experimental built-in); no external packages.
 *
 * The database records input choices, NEVER calculated combat bonuses.
 * This module does not own PvP consequences or issue auth credentials.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {DatabaseSync} from 'node:sqlite';
import {createHash} from 'node:crypto';
import {deriveJactariHeroPageSnapshot} from './hero-page-snapshot.mjs';
import {calculateJactariCareerBudget} from './hero-career-progression.mjs';
import {deriveJactariLegendaryTalents,listJactariLegendaryClasses} from './hero-legendary.mjs';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {validateArmySlots} from './core.mjs';
import {jactariToroidalDistance,validateWorldCoordinate} from './world-distance.mjs';

const isRecord=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const idPattern=/^[a-zA-Z0-9_-]{1,64}$/;
const id=(x,name)=>{if(typeof x!=='string'||!idPattern.test(x))throw new RangeError('Invalid '+name);return x;};
const exact=(x,fields,name)=>{
 if(!isRecord(x)||Object.keys(x).some(k=>!fields.includes(k)))
  throw new TypeError(name+' contains unsupported or untrusted fields');
 return x;
};
const json=JSON.stringify;
const decode=(value)=>JSON.parse(value);
function verifyHeroRecord(record){
 exact(record,['id','ownerId','profile','careers','legendarySelections',
  'legendaryGrants','army','spellOrders'],'Stored hero');
 id(record.id,'hero ID');id(record.ownerId,'hero owner ID');
 const profile=exact(record.profile,['faction','archetype','level','heritage','heritageWay',
  'equipment','stewardBonus','respecializations'],'Hero profile');
 // Reject values that exist only after computation, and reject unknown data.
 const tables=getJactariHeroTables();
 if(!Number.isSafeInteger(profile.faction)||!tables.factions[profile.faction])
  throw new RangeError('Invalid historical hero faction');
 deriveJactariHeroPageSnapshot(profile,tables);
 const careers=record.careers??[];
 const grant=record.legendaryGrants??{};
 const chosen=record.legendarySelections??[];
 const orders=record.spellOrders??{};
 if(!Array.isArray(careers)||!Array.isArray(chosen)||!isRecord(grant)||
    !isRecord(orders))throw new TypeError('Malformed stored career/legendary/spell choices');
 if(careers.some(row=>Number.isSafeInteger(row?.careerId)&&row.careerId>=13))
  throw new Error('Legendary career IDs require a separate server grant and cannot be stored as ordinary careers');
 calculateJactariCareerBudget({profile,careers});
 const known=new Set(listJactariLegendaryClasses(tables)
   .flatMap(x=>x.talents.map(t=>t.name)));
 for(const [name,rank] of Object.entries(grant))
  if(!known.has(name)||!Number.isSafeInteger(rank)||rank<0||rank>3)
   throw new RangeError('Stored legendary grant must be an original 0..3 talent rank');
 deriveJactariLegendaryTalents({selections:chosen,
  policy:'server-entitlement',entitlements:grant},tables);
 if(Object.keys(orders).length>2)throw new RangeError('At most two stored spell orders');
 const scheduled=new Set();
 for(const [turn,order] of Object.entries(orders)){
  if(!/^(?:[1-9]|1[0-4])$/.test(turn)||!isRecord(order)||
    Object.keys(order).length!==1||!Number.isSafeInteger(order.id)||order.id<0)
   throw new RangeError('Stored spell order must contain a valid original ID and round');
  if(scheduled.has(order.id))throw new RangeError('Duplicate stored spell ID');
  scheduled.add(order.id);
 }
 validateArmySlots(record.army);
 for(const stack of record.army.filter(Boolean)){
  if(!['I','R','C'].includes(stack.weapon))throw new RangeError('Invalid stored troop weapon');
  if(Object.keys(stack).some(k=>!['count','weapon','unitPower','goldCost',
      'rareCosts','faction','creatureIndex'].includes(k)))
   throw new RangeError('Unrecognized stored army stack field');
 }
 // Stable, detached and sanitized persisted schema. No runtime hero modifiers.
 return {id:record.id,ownerId:record.ownerId,profile:structuredClone(profile),
  careers:structuredClone(careers),
  legendarySelections:structuredClone(chosen),
  legendaryGrants:structuredClone(grant),army:structuredClone(record.army),
  spellOrders:structuredClone(orders)};
}

export function openTrustedHeroStore({filename=':memory:'}={}){
 if(typeof filename!=='string'||filename.length===0)
  throw new TypeError('Trusted SQLite filename required');
 const db=new DatabaseSync(filename);
 db.exec('PRAGMA foreign_keys = ON');
 db.exec('PRAGMA busy_timeout = 5000');
 if(filename!==':memory:')db.exec('PRAGMA journal_mode = WAL');
 db.exec(`
  CREATE TABLE IF NOT EXISTS players(
   player_id TEXT PRIMARY KEY CHECK(length(player_id)>0),
   enabled INTEGER NOT NULL DEFAULT 1 CHECK(enabled IN (0,1))
  );
  CREATE TABLE IF NOT EXISTS heroes(
   hero_id TEXT PRIMARY KEY,
   owner_player_id TEXT NOT NULL REFERENCES players(player_id),
   revision INTEGER NOT NULL DEFAULT 1 CHECK(revision>0),
   payload TEXT NOT NULL CHECK(json_valid(payload)),
   CHECK(length(hero_id)>0)
  );
  CREATE INDEX IF NOT EXISTS heroes_owner ON heroes(owner_player_id);
  CREATE TABLE IF NOT EXISTS military_worlds(
   world_id TEXT PRIMARY KEY,
   world_size INTEGER NOT NULL CHECK(world_size BETWEEN 2 AND 100000)
  );
  CREATE TABLE IF NOT EXISTS military_cities(
   city_id TEXT PRIMARY KEY,
   world_id TEXT NOT NULL REFERENCES military_worlds(world_id),
   owner_player_id TEXT NOT NULL REFERENCES players(player_id),
   x INTEGER NOT NULL CHECK(x >= 1),
   y INTEGER NOT NULL CHECK(y >= 1),
   is_first_city INTEGER NOT NULL CHECK(is_first_city IN (0,1)),
   protected_until_ms INTEGER,
   UNIQUE(world_id,x,y),
   CHECK((is_first_city=1 AND protected_until_ms IS NOT NULL AND protected_until_ms>=0)
     OR (is_first_city=0 AND protected_until_ms IS NULL))
  );
  CREATE UNIQUE INDEX IF NOT EXISTS first_city_per_world_player
   ON military_cities(world_id,owner_player_id) WHERE is_first_city=1;
  CREATE TABLE IF NOT EXISTS military_world_revisions(
   world_id TEXT PRIMARY KEY REFERENCES military_worlds(world_id),
   revision INTEGER NOT NULL CHECK(revision>=1)
  );
  CREATE TABLE IF NOT EXISTS military_alliances(
   alliance_id TEXT PRIMARY KEY,
   world_id TEXT NOT NULL REFERENCES military_worlds(world_id),
   UNIQUE(world_id,alliance_id)
  );
  CREATE TABLE IF NOT EXISTS military_alliance_memberships(
   world_id TEXT NOT NULL REFERENCES military_worlds(world_id),
   player_id TEXT NOT NULL REFERENCES players(player_id),
   alliance_id TEXT NOT NULL,
   PRIMARY KEY(world_id,player_id),
   FOREIGN KEY(world_id,alliance_id) REFERENCES military_alliances(world_id,alliance_id)
  );
  CREATE TABLE IF NOT EXISTS military_diplomatic_relations(
   world_id TEXT NOT NULL REFERENCES military_worlds(world_id),
   alliance_a TEXT NOT NULL,
   alliance_b TEXT NOT NULL,
   relation TEXT NOT NULL CHECK(relation IN ('allied','neutral','hostile')),
   PRIMARY KEY(world_id,alliance_a,alliance_b),
   CHECK(alliance_a < alliance_b),
   FOREIGN KEY(world_id,alliance_a) REFERENCES military_alliances(world_id,alliance_id),
   FOREIGN KEY(world_id,alliance_b) REFERENCES military_alliances(world_id,alliance_id)
  );
  CREATE TABLE IF NOT EXISTS military_territory_claims(
   world_id TEXT NOT NULL REFERENCES military_worlds(world_id),
   x INTEGER NOT NULL CHECK(x>=1),
   y INTEGER NOT NULL CHECK(y>=1),
   owner_player_id TEXT REFERENCES players(player_id),
   owner_alliance_id TEXT,
   PRIMARY KEY(world_id,x,y),
   CHECK((owner_player_id IS NOT NULL) <> (owner_alliance_id IS NOT NULL)),
   FOREIGN KEY(world_id,owner_alliance_id) REFERENCES military_alliances(world_id,alliance_id)
  );
  CREATE TABLE IF NOT EXISTS hero_city_postings(
   hero_id TEXT PRIMARY KEY REFERENCES heroes(hero_id),
   city_id TEXT NOT NULL REFERENCES military_cities(city_id)
  );
  CREATE TABLE IF NOT EXISTS battle_commands(
   command_id TEXT PRIMARY KEY,
   actor_player_id TEXT NOT NULL REFERENCES players(player_id),
   attacker_hero_id TEXT NOT NULL REFERENCES heroes(hero_id),
   defender_hero_id TEXT NOT NULL REFERENCES heroes(hero_id),
   rules_digest TEXT NOT NULL,
   receipt_json TEXT NOT NULL CHECK(json_valid(receipt_json)),
   committed_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
   CHECK(attacker_hero_id <> defender_hero_id)
  );
  CREATE TABLE IF NOT EXISTS military_mission_routes(
   mission_id TEXT PRIMARY KEY REFERENCES military_missions(mission_id),
   route_json TEXT NOT NULL CHECK(json_valid(route_json))
  );
  CREATE TABLE IF NOT EXISTS military_mission_world_snapshots(
   mission_id TEXT PRIMARY KEY REFERENCES military_missions(mission_id),
   world_id TEXT NOT NULL REFERENCES military_worlds(world_id),
   world_revision INTEGER NOT NULL CHECK(world_revision>=0),
   digest TEXT NOT NULL CHECK(length(digest)=64),
   snapshot_json TEXT NOT NULL CHECK(json_valid(snapshot_json))
  );
  CREATE TABLE IF NOT EXISTS military_mission_due_events(
   mission_id TEXT NOT NULL REFERENCES military_missions(mission_id),
   event_kind TEXT NOT NULL CHECK(event_kind IN ('arrival','return_completion')),
   due_at_ms INTEGER NOT NULL CHECK(due_at_ms>=0),
   status TEXT NOT NULL DEFAULT 'pending' CHECK(status IN ('pending','leased','done','cancelled')),
   worker_id TEXT,
   lease_until_ms INTEGER,
   attempt INTEGER NOT NULL DEFAULT 0 CHECK(attempt>=0),
   settled_at_ms INTEGER,
   PRIMARY KEY(mission_id,event_kind),
   CHECK((status='leased' AND worker_id IS NOT NULL AND lease_until_ms IS NOT NULL)
      OR (status<>'leased' AND lease_until_ms IS NULL))
  );
  CREATE TABLE IF NOT EXISTS military_due_event_incidents(
   mission_id TEXT NOT NULL,
   event_kind TEXT NOT NULL,
   attempt INTEGER NOT NULL CHECK(attempt>=1),
   worker_id TEXT NOT NULL,
   observed_at_ms INTEGER NOT NULL CHECK(observed_at_ms>=0),
   reason_code TEXT NOT NULL CHECK(reason_code IN
    ('target_denied','mission_state','lease_conflict','internal_error')),
   PRIMARY KEY(mission_id,event_kind,attempt),
   FOREIGN KEY(mission_id,event_kind)
    REFERENCES military_mission_due_events(mission_id,event_kind)
  );
  CREATE INDEX IF NOT EXISTS due_incidents_by_time
   ON military_due_event_incidents(observed_at_ms,mission_id);
  CREATE INDEX IF NOT EXISTS due_event_time_idx
   ON military_mission_due_events(status,due_at_ms,mission_id,event_kind);
  CREATE TABLE IF NOT EXISTS military_mission_recall_requests(
   mission_id TEXT PRIMARY KEY REFERENCES military_missions(mission_id),
   actor_player_id TEXT NOT NULL REFERENCES players(player_id),
   requested_at_ms INTEGER NOT NULL CHECK(requested_at_ms>=0),
   disposition TEXT NOT NULL DEFAULT 'pending'
      CHECK(disposition IN ('pending')),
   note TEXT NOT NULL DEFAULT 'NO_AUTOMATIC_HISTORICAL_RECALL_RULE'
  );
  CREATE TABLE IF NOT EXISTS military_mission_recall_plans(
   mission_id TEXT PRIMARY KEY REFERENCES military_missions(mission_id),
   approved_by TEXT NOT NULL CHECK(length(approved_by)>0),
   policy_id TEXT NOT NULL CHECK(length(policy_id)>0),
   approved_at_ms INTEGER NOT NULL CHECK(approved_at_ms>=0),
   return_at_ms INTEGER NOT NULL CHECK(return_at_ms>approved_at_ms)
  );
  CREATE TABLE IF NOT EXISTS military_mission_events(
   mission_id TEXT NOT NULL REFERENCES military_missions(mission_id),
   sequence INTEGER NOT NULL CHECK(sequence >= 0),
   event_json TEXT NOT NULL CHECK(json_valid(event_json)),
   PRIMARY KEY(mission_id,sequence)
  );
  CREATE TABLE IF NOT EXISTS military_missions(
   mission_id TEXT PRIMARY KEY,
   actor_player_id TEXT NOT NULL REFERENCES players(player_id),
   attacker_hero_id TEXT NOT NULL REFERENCES heroes(hero_id),
   defender_hero_id TEXT NOT NULL REFERENCES heroes(hero_id),
   status TEXT NOT NULL CHECK(status IN ('traveling','arrived','returning','completed','cancelled')),
   arrival_at_ms INTEGER NOT NULL,
   attacker_revision INTEGER NOT NULL,
   return_at_ms INTEGER,
   battle_command_id TEXT UNIQUE REFERENCES battle_commands(command_id),
   CHECK(attacker_hero_id <> defender_hero_id)
  );
  CREATE UNIQUE INDEX IF NOT EXISTS one_active_mission_per_attacker
   ON military_missions(attacker_hero_id)
   WHERE status IN ('traveling','arrived','returning');
  CREATE TABLE IF NOT EXISTS battle_audit_events(
   command_id TEXT NOT NULL REFERENCES battle_commands(command_id),
   sequence INTEGER NOT NULL CHECK(sequence >= 0),
   event_json TEXT NOT NULL CHECK(json_valid(event_json)),
   PRIMARY KEY(command_id,sequence)
  );
 `);
 const addPlayer=db.prepare('INSERT INTO players(player_id,enabled) VALUES(?,1)');
 const setPlayerEnabled=db.prepare('UPDATE players SET enabled=? WHERE player_id=?');
 const currentPlayer=db.prepare('SELECT enabled FROM players WHERE player_id=?');
 const insertHero=db.prepare('INSERT INTO heroes(hero_id,owner_player_id,revision,payload) VALUES(?,?,1,?)');
 const readHero=db.prepare('SELECT hero_id,owner_player_id,revision,payload FROM heroes WHERE hero_id=?');
 const swap=db.prepare('UPDATE heroes SET payload=?,revision=revision+1 WHERE hero_id=? AND revision=?');
 const nextMissionSequence=db.prepare('SELECT COALESCE(MAX(sequence),-1)+1 AS sequence FROM military_mission_events WHERE mission_id=?');
 const writeMissionEvent=db.prepare('INSERT INTO military_mission_events(mission_id,sequence,event_json) VALUES(?,?,?)');
 const missionEvents=db.prepare('SELECT sequence,event_json FROM military_mission_events WHERE mission_id=? ORDER BY sequence');
 const addMissionEvent=(missionId,event)=>{
  const sequence=nextMissionSequence.get(missionId).sequence;
  writeMissionEvent.run(missionId,sequence,json(event));
 };
 const readMission=db.prepare('SELECT * FROM military_missions WHERE mission_id=?');
 const activeMission=db.prepare("SELECT mission_id FROM military_missions WHERE attacker_hero_id=? AND status IN ('traveling','arrived','returning')");
 const insertMission=db.prepare("INSERT INTO military_missions(mission_id,actor_player_id,attacker_hero_id,defender_hero_id,status,arrival_at_ms,attacker_revision) VALUES(?,?,?,?,'traveling',?,?)");
 const arriveMission=db.prepare("UPDATE military_missions SET status='arrived' WHERE mission_id=? AND status='traveling'");
 const returnMission=db.prepare("UPDATE military_missions SET status='returning',battle_command_id=? WHERE mission_id=? AND status='arrived'");
 const setReturnTime=db.prepare("UPDATE military_missions SET return_at_ms=? WHERE mission_id=? AND status='returning' AND return_at_ms IS NULL");
 const completeMission=db.prepare("UPDATE military_missions SET status='completed' WHERE mission_id=? AND status='returning' AND return_at_ms IS NOT NULL");
 const cancelMission=db.prepare("UPDATE military_missions SET status='cancelled' WHERE mission_id=? AND status IN ('traveling','arrived') AND battle_command_id IS NULL");
 const missionView=row=>row===undefined?null:{
  missionId:row.mission_id,actorPlayerId:row.actor_player_id,
  attackerHeroId:row.attacker_hero_id,defenderHeroId:row.defender_hero_id,
  status:row.status,arrivalAtMs:row.arrival_at_ms,
  attackerRevision:row.attacker_revision,
  returnAtMs:row.return_at_ms,battleCommandId:row.battle_command_id
 };
 const requiredTime=(value,label)=>{
  if(!Number.isSafeInteger(value)||value<0)
   throw new RangeError('Trusted '+label+' must be epoch milliseconds');
  return value;
 };
 const insertWorld=db.prepare('INSERT INTO military_worlds(world_id,world_size) VALUES(?,?)');
 const readWorld=db.prepare('SELECT world_size FROM military_worlds WHERE world_id=?');
 const insertCity=db.prepare('INSERT INTO military_cities(city_id,world_id,owner_player_id,x,y,is_first_city,protected_until_ms) VALUES(?,?,?,?,?,?,?)');
 const readCity=db.prepare('SELECT * FROM military_cities WHERE city_id=?');
 const bumpWorldRevision=db.prepare('INSERT INTO military_world_revisions(world_id,revision) VALUES(?,1) ON CONFLICT(world_id) DO UPDATE SET revision=revision+1');
 const readWorldRevision=db.prepare('SELECT revision FROM military_world_revisions WHERE world_id=?');
 const createAlliance=db.prepare('INSERT INTO military_alliances(alliance_id,world_id) VALUES(?,?)');
 const readAlliance=db.prepare('SELECT world_id FROM military_alliances WHERE alliance_id=?');
 const selectAlliances=db.prepare('SELECT alliance_id FROM military_alliances WHERE world_id=? ORDER BY alliance_id');
 const upsertMembership=db.prepare('INSERT INTO military_alliance_memberships(world_id,player_id,alliance_id) VALUES(?,?,?) ON CONFLICT(world_id,player_id) DO UPDATE SET alliance_id=excluded.alliance_id');
 const removeMembership=db.prepare('DELETE FROM military_alliance_memberships WHERE world_id=? AND player_id=?');
 const selectMemberships=db.prepare('SELECT player_id,alliance_id FROM military_alliance_memberships WHERE world_id=? ORDER BY player_id');
 const upsertRelation=db.prepare('INSERT INTO military_diplomatic_relations(world_id,alliance_a,alliance_b,relation) VALUES(?,?,?,?) ON CONFLICT(world_id,alliance_a,alliance_b) DO UPDATE SET relation=excluded.relation');
 const selectRelations=db.prepare('SELECT alliance_a,alliance_b,relation FROM military_diplomatic_relations WHERE world_id=? ORDER BY alliance_a,alliance_b');
 const upsertClaim=db.prepare('INSERT INTO military_territory_claims(world_id,x,y,owner_player_id,owner_alliance_id) VALUES(?,?,?,?,?) ON CONFLICT(world_id,x,y) DO UPDATE SET owner_player_id=excluded.owner_player_id,owner_alliance_id=excluded.owner_alliance_id');
 const removeClaim=db.prepare('DELETE FROM military_territory_claims WHERE world_id=? AND x=? AND y=?');
 const readClaim=db.prepare('SELECT 1 FROM military_territory_claims WHERE world_id=? AND x=? AND y=?');
 const readCityAtTile=db.prepare('SELECT city_id FROM military_cities WHERE world_id=? AND x=? AND y=?');
 const selectClaims=db.prepare('SELECT x,y,owner_player_id,owner_alliance_id FROM military_territory_claims WHERE world_id=? ORDER BY x,y');
 const selectWorldCities=db.prepare('SELECT x,y,owner_player_id FROM military_cities WHERE world_id=? ORDER BY x,y');
 const storedSnapshot=db.prepare('INSERT INTO military_mission_world_snapshots(mission_id,world_id,world_revision,digest,snapshot_json) VALUES(?,?,?,?,?)');
 const readStoredSnapshot=db.prepare('SELECT world_id,world_revision,digest,snapshot_json FROM military_mission_world_snapshots WHERE mission_id=?');
 const insertDueEvent=db.prepare('INSERT INTO military_mission_due_events(mission_id,event_kind,due_at_ms) VALUES(?,?,?)');
 const markDueDone=db.prepare("UPDATE military_mission_due_events SET status='done',lease_until_ms=NULL,settled_at_ms=? WHERE mission_id=? AND event_kind=? AND status IN ('pending','leased')");
 const markDueCancelled=db.prepare("UPDATE military_mission_due_events SET status='cancelled',lease_until_ms=NULL,settled_at_ms=NULL WHERE mission_id=? AND event_kind=? AND status IN ('pending','leased')");
 const readDue=db.prepare('SELECT * FROM military_mission_due_events WHERE mission_id=? AND event_kind=?');
 const writeIncident=db.prepare('INSERT INTO military_due_event_incidents(mission_id,event_kind,attempt,worker_id,observed_at_ms,reason_code) VALUES(?,?,?,?,?,?)');
 const readIncidents=db.prepare('SELECT mission_id,event_kind,attempt,worker_id,observed_at_ms,reason_code FROM military_due_event_incidents WHERE mission_id=? ORDER BY observed_at_ms,event_kind,attempt');
 const sameArrival=db.prepare("SELECT m.mission_id,m.arrival_at_ms,m.status,r.route_json FROM military_missions m JOIN military_mission_routes r ON m.mission_id=r.mission_id JOIN military_mission_due_events e ON e.mission_id=m.mission_id AND e.event_kind='arrival' WHERE m.arrival_at_ms=? AND m.status IN ('traveling','arrived') AND e.status!='cancelled' ORDER BY m.mission_id");
 const insertRecall=db.prepare("INSERT INTO military_mission_recall_requests(mission_id,actor_player_id,requested_at_ms) VALUES(?,?,?)");
 const readRecall=db.prepare("SELECT * FROM military_mission_recall_requests WHERE mission_id=?");
 const insertRecallPlan=db.prepare("INSERT INTO military_mission_recall_plans(mission_id,approved_by,policy_id,approved_at_ms,return_at_ms) VALUES(?,?,?,?,?)");
 const readRecallPlan=db.prepare("SELECT * FROM military_mission_recall_plans WHERE mission_id=?");
 const setRecallReturnTime=db.prepare("UPDATE military_missions SET return_at_ms=? WHERE mission_id=? AND status='traveling' AND return_at_ms IS NULL");
 const recallPlanView=row=>row?{
  missionId:row.mission_id,approvedBy:row.approved_by,policyId:row.policy_id,
  approvedAtMs:row.approved_at_ms,returnAtMs:row.return_at_ms,
  historicalCertification:false,officialUbisoftS2Recall:false
 }:null;
 const recallView=row=>row?{
  missionId:row.mission_id,actorPlayerId:row.actor_player_id,
  requestedAtMs:row.requested_at_ms,disposition:row.disposition,
  automaticRecall:false,replayed:false
 }:null;
 const nextDue=db.prepare("SELECT * FROM military_mission_due_events WHERE due_at_ms<=? AND (status='pending' OR (status='leased' AND lease_until_ms<=?)) ORDER BY due_at_ms,mission_id,event_kind LIMIT 1");
 const leaseDue=db.prepare("UPDATE military_mission_due_events SET status='leased',worker_id=?,lease_until_ms=?,attempt=attempt+1 WHERE mission_id=? AND event_kind=? AND (status='pending' OR (status='leased' AND lease_until_ms<=?))");
 const insertPosting=db.prepare('INSERT INTO hero_city_postings(hero_id,city_id) VALUES(?,?) ON CONFLICT(hero_id) DO UPDATE SET city_id=excluded.city_id');
 const cityOfHero=db.prepare('SELECT c.*,w.world_size FROM hero_city_postings p JOIN military_cities c ON c.city_id=p.city_id JOIN military_worlds w ON w.world_id=c.world_id WHERE p.hero_id=?');
 const saveRoute=db.prepare('INSERT INTO military_mission_routes(mission_id,route_json) VALUES(?,?)');
 const readRoute=db.prepare('SELECT route_json FROM military_mission_routes WHERE mission_id=?');
 const placeView=row=>row?{
  cityId:row.city_id,worldId:row.world_id,ownerPlayerId:row.owner_player_id,
  x:row.x,y:row.y,worldSize:row.world_size,
  firstCity:row.is_first_city===1,protectedUntilMs:row.protected_until_ms
 }:null;
 const readTerritorySnapshot=(worldId)=>{
  id(worldId,'world ID');
  const world=readWorld.get(worldId);
  if(!world)throw new Error('Unknown military world');
  return {worldId,worldSize:world.world_size,
   revision:readWorldRevision.get(worldId)?.revision??0,
   alliances:selectAlliances.all(worldId).map(r=>r.alliance_id),
   memberships:selectMemberships.all(worldId).map(r=>({
    playerId:r.player_id,allianceId:r.alliance_id})),
   relations:selectRelations.all(worldId).map(r=>({
    allianceA:r.alliance_a,allianceB:r.alliance_b,relation:r.relation})),
   claims:selectClaims.all(worldId).map(r=>({x:r.x,y:r.y,
    ownerPlayerId:r.owner_player_id,ownerAllianceId:r.owner_alliance_id})),
   cities:selectWorldCities.all(worldId).map(r=>({x:r.x,y:r.y,
    ownerPlayerId:r.owner_player_id}))};
 };
 const worldDigest=snapshot=>createHash('sha256')
  .update(json(snapshot)).digest('hex');
 /**
  * Read solely within an existing transaction. Collision qualification is
  * exact world + destination city + scheduled arrival, not arrival order.
  */
 const conflictingArrivals=(missionId,arrivalAtMs)=>{
  if(readDue.get(missionId,'arrival')?.status==='cancelled')return [];
  const raw=readRoute.get(missionId);
  if(!raw)return [];
  const route=decode(raw.route_json);
  return sameArrival.all(arrivalAtMs).filter(row=>{
   if(row.mission_id===missionId)return false;
   const candidate=decode(row.route_json);
   return candidate.worldId===route.worldId&&
    candidate.destination.cityId===route.destination.cityId;
  }).map(row=>row.mission_id);
 };
 const checkDueLease=(missionId,kind,clock,lease)=>{
  if(lease===null)return;
  exact(lease,['workerId','attempt'],'Trusted scheduler lease');
  id(lease.workerId,'lease worker');
  if(!Number.isSafeInteger(lease.attempt)||lease.attempt<1)
   throw new RangeError('Positive lease attempt required');
  const current=readDue.get(missionId,kind);
  if(!current||current.status!=='leased'||current.worker_id!==lease.workerId||
     current.attempt!==lease.attempt||current.lease_until_ms<=clock||
     current.due_at_ms>clock)
   throw new Error('Stale or expired scheduler lease');
 };
 const dueView=row=>row?{
  missionId:row.mission_id,eventKind:row.event_kind,dueAtMs:row.due_at_ms,
  status:row.status,workerId:row.worker_id,leaseUntilMs:row.lease_until_ms,
  attempt:row.attempt,settledAtMs:row.settled_at_ms
 }:null;
 const trustedGeo=(attackerId,defenderId,nowMs)=>{
  const a=placeView(cityOfHero.get(attackerId));
  const d=placeView(cityOfHero.get(defenderId));
  if(a===null&&d===null)return null; // legacy non-map test environment
  if(!a||!d)throw new Error('World engagement requires both stationed heroes');
  if(a.worldId!==d.worldId)throw new Error('Cross-world military attack forbidden');
  if(a.cityId===d.cityId)throw new Error('Cannot attack a hero stationed in the same city');
  if(!Number.isSafeInteger(nowMs)||nowMs<0)
   throw new Error('World engagement requires server-verified epoch milliseconds');
  if(d.firstCity&&nowMs<d.protectedUntilMs)
   throw new Error('Target first city is under beginner protection');
  return {worldId:a.worldId,worldSize:a.worldSize,
   origin:{cityId:a.cityId,x:a.x,y:a.y},
   destination:{cityId:d.cityId,x:d.x,y:d.y},
   distance:jactariToroidalDistance(a,d,a.worldSize),
   provenance:'2013 MMHK-Plus wrapped Euclidean city distance; NOT verified S2 travel time',
   protectedUntilMs:d.protectedUntilMs};
 };
 const verifiedRoute=(missionId,attackerId,defenderId,nowMs)=>{
  const original=readRoute.get(missionId);
  if(!original)return null;
  const route=decode(original.route_json);
  const current=trustedGeo(attackerId,defenderId,nowMs);
  if(!current||current.worldId!==route.worldId||
   current.origin.cityId!==route.origin.cityId||
   current.destination.cityId!==route.destination.cityId||
   current.origin.x!==route.origin.x||current.origin.y!==route.origin.y||
   current.destination.x!==route.destination.x||current.destination.y!==route.destination.y)
   throw new Error('Mission source or destination location changed since dispatch');
  return route;
 };
 const readBattle=db.prepare('SELECT * FROM battle_commands WHERE command_id=?');
 const putBattle=db.prepare('INSERT INTO battle_commands(command_id,actor_player_id,attacker_hero_id,defender_hero_id,rules_digest,receipt_json) VALUES(?,?,?,?,?,?)');
 const putBattleEvent=db.prepare('INSERT INTO battle_audit_events(command_id,sequence,event_json) VALUES(?,?,?)');
 const eventsForBattle=db.prepare('SELECT sequence,event_json FROM battle_audit_events WHERE command_id=? ORDER BY sequence');
 const countBattles=db.prepare('SELECT COUNT(*) AS count FROM battle_commands');
 const countAudit=db.prepare('SELECT COUNT(*) AS count FROM battle_audit_events');
 const strictArmy=(before,after,reports,side)=>{
  if(!Array.isArray(after)||after.length!==7||
     !Array.isArray(reports)||reports.length!==7)
   throw new Error('Battle engine returned malformed persistent army/ledger: '+side);
  return before.map((old,i)=>{
   const next=after[i],proof=reports[i];
   if(old===null){
    if(next!==null||proof!==null)throw new Error('Battle created a permanent unit stack');
    return null;
   }
   if(!next||!proof||!Number.isSafeInteger(next.count)||
     next.count<0||next.count>old.count||!Number.isSafeInteger(proof.permanent)||
     proof.permanent!==old.count-next.count)
    throw new Error('Battle casualty ledger mismatch: '+side+' slot '+(i+1));
   for(const [key,value] of Object.entries(old))
    if(key!=='count'&&JSON.stringify(next[key])!==JSON.stringify(value))
     throw new Error('Battle changed persisted unit identity: '+side+' '+key);
   if(Object.keys(next).some(k=>!Object.hasOwn(old,k)))
    throw new Error('Battle added an untrusted persistent unit field');
   return next.count===0?null:{...old,count:next.count};
  });
 };
 const toView=row=>row===undefined?null:{
  ...decode(row.payload),revision:row.revision
 };
 let closed=false;
 const alive=()=>{if(closed)throw new Error('Hero store closed');};
 const transaction=(fn)=>{
  alive();db.exec('BEGIN IMMEDIATE');
  try{
   const result=fn();db.exec('COMMIT');return result;
  }catch(error){db.exec('ROLLBACK');throw error;}
 };
 return {
  registerPlayer(playerId){
   alive();addPlayer.run(id(playerId,'player ID'));
  },
  setPlayerEnabled(playerId,enabled){
   alive();if(typeof enabled!=='boolean')throw new TypeError('Player enabled is boolean');
   const result=setPlayerEnabled.run(Number(enabled),id(playerId,'player ID'));
   if(result.changes!==1)throw new Error('Unknown player');
  },
  isPlayerEnabled(playerId){
   alive();return currentPlayer.get(id(playerId,'player ID'))?.enabled===1;
  },
  putHero(record){
   const clean=verifyHeroRecord(record);
   return transaction(()=>{
    if(currentPlayer.get(clean.ownerId)?.enabled!==1)
      throw new Error('Hero owner must be a registered active player');
    insertHero.run(clean.id,clean.ownerId,json(clean));
    return {...structuredClone(clean),revision:1};
   });
  },
  replaceHero(record,{expectedRevision}={}){
   const clean=verifyHeroRecord(record);
   if(!Number.isSafeInteger(expectedRevision)||expectedRevision<=0)
    throw new RangeError('Positive expected revision required');
   return transaction(()=>{
    const existing=readHero.get(clean.id);
    if(!existing)throw new Error('Unknown hero');
    if(existing.owner_player_id!==clean.ownerId)
      throw new Error('Hero ownership cannot change through progression update');
    if(activeMission.get(clean.id))
      throw new Error('Hero is reserved by active military mission');
    if(currentPlayer.get(clean.ownerId)?.enabled!==1)
      throw new Error('Hero owner account inactive');
    const updated=swap.run(json(clean),clean.id,expectedRevision);
    if(updated.changes!==1)throw new Error('Stale hero revision: optimistic concurrency conflict');
    return {...structuredClone(clean),revision:expectedRevision+1};
   });
  },
  getHero(heroId){
   alive();return toView(readHero.get(id(heroId,'hero ID')));
  },
  // INTERNAL world administration. Never expose these write methods to players.
  defineMilitaryWorld({worldId,worldSize}){
   id(worldId,'world ID');validateWorldCoordinate({x:1,y:1},worldSize);
   return transaction(()=>{insertWorld.run(worldId,worldSize);
    bumpWorldRevision.run(worldId);
    return {worldId,worldSize};});
  },
  registerMilitaryCity({cityId,worldId,ownerPlayerId,x,y,
    firstCity=false,protectedUntilMs=null}){
   id(cityId,'city ID');id(worldId,'world ID');id(ownerPlayerId,'city owner');
   if(typeof firstCity!=='boolean')throw new TypeError('First city flag must be boolean');
   return transaction(()=>{
    const w=readWorld.get(worldId);
    if(!w)throw new Error('Unknown world');
    if(!currentPlayer.get(ownerPlayerId))
     throw new Error('Unknown city owner');
    validateWorldCoordinate({x,y},w.world_size);
    if(firstCity&&(!Number.isSafeInteger(protectedUntilMs)||protectedUntilMs<0))
     throw new Error('First city must have trusted beginner protection expiry');
    if(!firstCity&&protectedUntilMs!==null)
     throw new Error('Only the first city can have beginner protection');
    if(readClaim.get(worldId,x,y))
     throw new Error('City tile overlaps an explicit territory claim');
    insertCity.run(cityId,worldId,ownerPlayerId,x,y,
     Number(firstCity),protectedUntilMs);
    bumpWorldRevision.run(worldId);
    return {cityId,worldId,ownerPlayerId,x,y,firstCity,protectedUntilMs};
   });
  },
  // Trusted administration only. Nothing in these methods grants attack rights.
  createMilitaryAlliance({worldId,allianceId}){
   id(worldId,'world ID');id(allianceId,'alliance ID');
   return transaction(()=>{
    if(!readWorld.get(worldId))throw new Error('Unknown military world');
    createAlliance.run(allianceId,worldId);
    bumpWorldRevision.run(worldId);
    return {worldId,allianceId};
   });
  },
  setMilitaryAllianceMembership({worldId,playerId,allianceId}){
   id(worldId,'world ID');id(playerId,'membership player');
   if(allianceId!==null)id(allianceId,'alliance ID');
   return transaction(()=>{
    if(!readWorld.get(worldId))throw new Error('Unknown military world');
    if(!currentPlayer.get(playerId))throw new Error('Unknown membership player');
    if(allianceId!==null){
     if(readAlliance.get(allianceId)?.world_id!==worldId)
      throw new Error('Alliance does not belong to world');
     upsertMembership.run(worldId,playerId,allianceId);
    }else removeMembership.run(worldId,playerId);
    bumpWorldRevision.run(worldId);
    return {worldId,playerId,allianceId};
   });
  },
  setMilitaryDiplomacy({worldId,firstAllianceId,secondAllianceId,relation}){
   id(worldId,'world ID');id(firstAllianceId,'first alliance');
   id(secondAllianceId,'second alliance');
   if(firstAllianceId===secondAllianceId)throw new Error('Cannot define self diplomacy');
   if(!['allied','neutral','hostile'].includes(relation))
    throw new RangeError('Explicit relation allied, neutral or hostile required');
   return transaction(()=>{
    if(readAlliance.get(firstAllianceId)?.world_id!==worldId||
       readAlliance.get(secondAllianceId)?.world_id!==worldId)
     throw new Error('Diplomatic alliances must belong to same world');
    const [a,b]=[firstAllianceId,secondAllianceId].sort();
    upsertRelation.run(worldId,a,b,relation);
    bumpWorldRevision.run(worldId);
    return {worldId,allianceA:a,allianceB:b,relation};
   });
  },
  setMilitaryTerritoryClaim({worldId,x,y,ownerPlayerId=null,ownerAllianceId=null}){
   id(worldId,'world ID');
   if(ownerPlayerId!==null)id(ownerPlayerId,'claim player');
   if(ownerAllianceId!==null)id(ownerAllianceId,'claim alliance');
   if(ownerPlayerId!==null&&ownerAllianceId!==null)
    throw new Error('A tile cannot have two different owner types');
   return transaction(()=>{
    const world=readWorld.get(worldId);
    if(!world)throw new Error('Unknown military world');
    validateWorldCoordinate({x,y},world.world_size);
    if(readCityAtTile.get(worldId,x,y))
     throw new Error('City tiles use their own owner; conflicting claims forbidden');
    if(ownerPlayerId!==null&&!currentPlayer.get(ownerPlayerId))
     throw new Error('Unknown territory owner');
    if(ownerAllianceId!==null&&readAlliance.get(ownerAllianceId)?.world_id!==worldId)
     throw new Error('Territory alliance must belong to same world');
    if(ownerPlayerId===null&&ownerAllianceId===null)
     removeClaim.run(worldId,x,y);
    else upsertClaim.run(worldId,x,y,ownerPlayerId,ownerAllianceId);
    bumpWorldRevision.run(worldId);
    return {worldId,x,y,ownerPlayerId,ownerAllianceId};
   });
  },
  getWorldTerritorySnapshot(worldId){
   alive();id(worldId,'world ID');
   db.exec('BEGIN');
   try{
    const result=readTerritorySnapshot(worldId);
    db.exec('COMMIT');return result;
   }catch(error){db.exec('ROLLBACK');throw error;}
  },
  stationHeroInCity({heroId,cityId}){
   id(heroId,'hero ID');id(cityId,'city ID');
   return transaction(()=>{
    const h=readHero.get(heroId),city=readCity.get(cityId);
    if(!h||!city)throw new Error('Missing city or hero');
    if(h.owner_player_id!==city.owner_player_id)
     throw new Error('Hero can be stationed only in a city owned by its player');
    if(activeMission.get(heroId))
     throw new Error('Cannot relocate hero while a military mission is active');
    insertPosting.run(heroId,cityId);
    return placeView(cityOfHero.get(heroId));
   });
  },
  getHeroWorldPosition(heroId){
   alive();return placeView(cityOfHero.get(id(heroId,'hero ID')));
  },
  /**
   * INTERNAL ONLY: departure state is frozen atomically with dispatch.
   * Useful for archaeology/replay, never an approval of diplomacy or ETA.
   */
  getFrozenMissionTerritory(missionId){
   alive();id(missionId,'mission ID');
   const row=readStoredSnapshot.get(missionId);
   if(!row)return null;
   const snapshot=decode(row.snapshot_json);
   if(worldDigest(snapshot)!==row.digest||
      snapshot.revision!==row.world_revision||
      snapshot.worldId!==row.world_id)
    throw new Error('Persisted departure world snapshot integrity mismatch');
   return {worldId:row.world_id,worldRevision:row.world_revision,
    snapshotFingerprint:row.digest,snapshot};
  },
  compareFrozenMissionTerritory(missionId){
   alive();id(missionId,'mission ID');
   db.exec('BEGIN');
   try{
    const original=readStoredSnapshot.get(missionId);
    if(!original){db.exec('COMMIT');return null;}
    const current=readTerritorySnapshot(original.world_id);
    const currentFingerprint=worldDigest(current);
    const result={missionId,worldId:original.world_id,
     departedRevision:original.world_revision,currentRevision:current.revision,
     departedFingerprint:original.digest,currentFingerprint,
     territoryUnchanged:original.world_revision===current.revision&&
      original.digest===currentFingerprint,
     automaticMissionCancellation:false,authoritativeArrivalTime:false};
    db.exec('COMMIT');return result;
   }catch(error){db.exec('ROLLBACK');throw error;}
  },
  /** Observational only. Does not deliver or resolve a due event. */
  getMissionDueEvent({missionId,eventKind}){
   alive();id(missionId,'mission ID');
   if(!['arrival','return_completion'].includes(eventKind))
    throw new RangeError('Unsupported due event kind');
   return dueView(readDue.get(missionId,eventKind));
  },
  /**
   * Multiple workers safely compete using BEGIN IMMEDIATE + a time-bound lease.
   * Claiming an event NEVER advances mission state or grants battle permission.
   * Lease expiry yields at-least-once delivery, not exactly-once execution.
   */
  claimNextDueMissionEvent({nowMs,workerId,leaseMs=30000}){
   id(workerId,'due-event worker');
   requiredTime(nowMs,'claim time');requiredTime(leaseMs,'lease duration');
   if(leaseMs<1||leaseMs>3600000||!Number.isSafeInteger(nowMs+leaseMs))
    throw new RangeError('Lease must be 1 ms..1 hour within safe epoch range');
   return transaction(()=>{
    const next=nextDue.get(nowMs,nowMs);
    if(!next)return null;
    if(leaseDue.run(workerId,nowMs+leaseMs,next.mission_id,
       next.event_kind,nowMs).changes!==1)
     throw new Error('Due-event lease contention');
    return dueView(readDue.get(next.mission_id,next.event_kind));
   });
  },
  /**
   * Incident records contain a fixed taxonomy only, NEVER untrusted error text.
   * A stale worker cannot append a fabricated incident to another attempt.
   */
  recordDueMissionIncident({missionId,eventKind,workerId,attempt,nowMs,reasonCode}){
   id(missionId,'mission ID');id(workerId,'due-event worker');
   requiredTime(nowMs,'incident time');
   if(!['arrival','return_completion'].includes(eventKind))
    throw new RangeError('Unsupported due event kind');
   if(!['target_denied','mission_state','lease_conflict','internal_error'].includes(reasonCode))
    throw new RangeError('Unknown incident category');
   return transaction(()=>{
    checkDueLease(missionId,eventKind,nowMs,{workerId,attempt});
    const exists=readIncidents.all(missionId).find(x=>x.event_kind===eventKind&&x.attempt===attempt);
    if(exists)throw new Error('Duplicate due-event incident attempt');
    writeIncident.run(missionId,eventKind,attempt,workerId,nowMs,reasonCode);
    return {missionId,eventKind,attempt,workerId,observedAtMs:nowMs,reasonCode};
   });
  },
  getMissionDueIncidents(missionId){
   alive();id(missionId,'mission ID');
   return readIncidents.all(missionId).map(x=>({
    missionId:x.mission_id,eventKind:x.event_kind,attempt:x.attempt,
    workerId:x.worker_id,observedAtMs:x.observed_at_ms,reasonCode:x.reason_code
   }));
  },
  /**
   * Read-only collision observation: equal ETA and destination CITY,
   * not a historical tie-breaker, lock or permission to engage.
   */
  inspectSimultaneousArrivals(missionId){
   alive();id(missionId,'mission ID');
   db.exec('BEGIN');
   try{
    const mission=readMission.get(missionId);
    if(!mission){db.exec('COMMIT');return null;}
    const route=readRoute.get(missionId);
    if(!route){db.exec('COMMIT');return {
     missionId,hasGeographicRoute:false,candidateMissionIds:[],requiresArbitration:false
    };}
    const anchor=decode(route.route_json);
    const other=conflictingArrivals(missionId,mission.arrival_at_ms);
    db.exec('COMMIT');
    return {missionId,hasGeographicRoute:true,
     worldId:anchor.worldId,destinationCityId:anchor.destination.cityId,
     arrivalAtMs:mission.arrival_at_ms,candidateMissionIds:other,
     requiresArbitration:other.length>0,automaticConflictResolution:false};
   }catch(error){db.exec('ROLLBACK');throw error;}
  },
  /** Acknowledgement only verifies the mission transition already committed. */
  confirmDueMissionEvent({missionId,eventKind,workerId,attempt}){
   alive();id(missionId,'mission ID');id(workerId,'due-event worker');
   if(!['arrival','return_completion'].includes(eventKind))
    throw new RangeError('Unsupported due event kind');
   if(!Number.isSafeInteger(attempt)||attempt<1)
    throw new RangeError('Positive lease attempt required');
   const due=dueView(readDue.get(missionId,eventKind));
   if(!due||due.workerId!==workerId||due.attempt!==attempt)
    throw new Error('Due-event acknowledgement has stale or unknown lease');
   if(due.status!=='done')
    throw new Error('Due-event acknowledgement requires completed mission transition');
   return {...due,confirmed:true};
  },
  getMissionRoute(missionId){
   alive();const row=readRoute.get(id(missionId,'mission ID'));
   return row?structuredClone(decode(row.route_json)):null;
  },
  readConsistentPair(firstId,secondId){
   alive();id(firstId,'attacker hero ID');id(secondId,'defender hero ID');
   if(firstId===secondId)throw new Error('Cannot fight the same hero');
   db.exec('BEGIN'); // coherent snapshot across both records, not a write
   try{
    const pair=[toView(readHero.get(firstId)),toView(readHero.get(secondId))];
    db.exec('COMMIT');
    return pair;
   }catch(error){db.exec('ROLLBACK');throw error;}
  },
  /**
   * ONLY for a trusted server service. Serializes the entire combat calculation
   * under BEGIN IMMEDIATE and applies two casualty ledgers atomically.
   * Replay is keyed on a stable command ID and immutable rule digest.
   */
  commitAuthorizedBattle({
    commandId,actorPlayerId,attackerHeroId,defenderHeroId,rulesDigest,
    missionId=null,serverNowMs=null,authorizeTarget,calculate,beforeCommit
  }){
   for(const [name,value] of [['command ID',commandId],['actor ID',actorPlayerId],
    ['attacker hero ID',attackerHeroId],['defender hero ID',defenderHeroId]])
    id(value,name);
   if(attackerHeroId===defenderHeroId)throw new Error('A hero cannot fight itself');
   if(missionId!==null)id(missionId,'military mission ID');
   if(typeof rulesDigest!=='string'||!/^[a-f0-9]{64}$/.test(rulesDigest))
    throw new TypeError('Versioned server rules digest required');
   if(typeof authorizeTarget!=='function'||typeof calculate!=='function')
    throw new Error('Server target authorization and battle engine callbacks required');
   if(beforeCommit!==undefined&&typeof beforeCommit!=='function')
    throw new TypeError('beforeCommit must be internal server hook');
   return transaction(()=>{
    if(currentPlayer.get(actorPlayerId)?.enabled!==1)
     throw new Error('Actor is not an enabled registered player');
    const first=readHero.get(attackerHeroId),second=readHero.get(defenderHeroId);
    if(!first||!second)throw new Error('Unknown combat hero');
    if(first.owner_player_id!==actorPlayerId)
     throw new Error('Actor is not the owner of the attacking hero');
    if(currentPlayer.get(second.owner_player_id)?.enabled!==1)
     throw new Error('Defender owner is inactive');
    const attacker=toView(first),defender=toView(second);
    if(authorizeTarget({actorPlayerId,attacker:structuredClone(attacker),
      defender:structuredClone(defender)})!==true)
     throw new Error('Target authorization denied');
    const prior=readBattle.get(commandId);
    if(prior){
     if((decode(prior.receipt_json).missionId??null)!==missionId)
      throw new Error('Idempotency key collision: mission binding differs');
     if(prior.actor_player_id!==actorPlayerId||
        prior.attacker_hero_id!==attackerHeroId||
        prior.defender_hero_id!==defenderHeroId||
        prior.rules_digest!==rulesDigest)
      throw new Error('Idempotency key collision: original battle parameters differ');
     return {...decode(prior.receipt_json),replayed:true};
    }
    const worldContext=trustedGeo(attackerHeroId,defenderHeroId,serverNowMs);
    const journey=missionId===null?null:readMission.get(missionId);
    if(journey){
     if(journey.actor_player_id!==actorPlayerId||
        journey.attacker_hero_id!==attackerHeroId||
        journey.defender_hero_id!==defenderHeroId)
      throw new Error('Military mission actor or hero binding mismatch');
     if(journey.status!=='arrived')
      throw new Error('Military mission has not reached an authorized arrival');
     if(worldContext&&serverNowMs<journey.arrival_at_ms)
      throw new Error('World battle cannot resolve before server scheduled arrival');
     if(journey.attacker_revision!==attacker.revision)
      throw new Error('Military mission attacker revision changed since dispatch');
    }else if(missionId!==null)throw new Error('Unknown military mission');
    if(missionId===null&&activeMission.get(attackerHeroId))
     throw new Error('Attacking hero is reserved by a military mission');
    if(worldContext&&missionId===null)
     throw new Error('World-mapped battles require a registered arrived military mission');
    if(worldContext)verifiedRoute(missionId,attackerHeroId,defenderHeroId,serverNowMs);
    if(activeMission.get(defenderHeroId))
     throw new Error('Defending hero is traveling or returning; field interception unsupported');
    const result=calculate({attacker:structuredClone(attacker),
      defender:structuredClone(defender)});
    if(!isRecord(result)||!['attacker','defender','mutual-dispersion'].includes(result.status)||
      !isRecord(result.persistentArmies)||!isRecord(result.permanent)||
      !Array.isArray(result.events))
     throw new Error('Unsupported battle result; server cannot safely commit');
    const armyA=strictArmy(attacker.army,result.persistentArmies.attacker,
      result.permanent.attacker?.reports,'attacker');
    const armyD=strictArmy(defender.army,result.persistentArmies.defender,
      result.permanent.defender?.reports,'defender');
    const receipt={
     commandId,actorPlayerId,attackerHeroId,defenderHeroId,
     ...(missionId===null?{}:{missionId}),
     rulesDigest,status:result.status,rounds:result.rounds,
     revisions:{attacker:{before:attacker.revision,after:attacker.revision+1},
      defender:{before:defender.revision,after:defender.revision+1}},
     permanent:structuredClone(result.permanent),
     persistentArmies:{attacker:armyA,defender:armyD},
     eventCount:result.events.length,
     source:'historical-Jactari-subset-transactional-server-demo-NOT-MMHK-S2',
     completeHistoricalCertification:false
    };
    const savedA={...attacker,army:armyA};
    const savedD={...defender,army:armyD};
    delete savedA.revision;delete savedD.revision;
    if(swap.run(json(savedA),attackerHeroId,attacker.revision).changes!==1||
       swap.run(json(savedD),defenderHeroId,defender.revision).changes!==1)
     throw new Error('Concurrent hero revision conflict, rolled back');
    putBattle.run(commandId,actorPlayerId,attackerHeroId,defenderHeroId,
      rulesDigest,json(receipt));
    if(journey&&returnMission.run(commandId,missionId).changes!==1)
     throw new Error('Military mission return transition was not committed');
    if(journey)addMissionEvent(missionId,{phase:'battle_committed',commandId});
    for(let i=0;i<result.events.length;i++)
     putBattleEvent.run(commandId,i,json(result.events[i]));
    if(beforeCommit)beforeCommit(structuredClone(receipt));
    return {...receipt,replayed:false};
   });
  },
  /** Reserved hero remains in its persisted slot; no troop count is removed at dispatch. */
  dispatchMission({missionId,actorPlayerId,attackerHeroId,defenderHeroId,
    nowMs,arrivalAtMs,authorizeTarget}){
   [missionId,actorPlayerId,attackerHeroId,defenderHeroId].forEach((v,i)=>
    id(v,['mission ID','actor ID','attacker ID','defender ID'][i]));
   requiredTime(nowMs,'departure time');
   requiredTime(arrivalAtMs,'scheduled arrival');
   if(arrivalAtMs<=nowMs)throw new RangeError('Travel arrival must follow departure');
   if(attackerHeroId===defenderHeroId)throw new Error('Mission cannot attack its own hero');
   if(typeof authorizeTarget!=='function')throw new Error('Server target authorization required');
   return transaction(()=>{
    if(currentPlayer.get(actorPlayerId)?.enabled!==1)
     throw new Error('Mission actor inactive');
    const attacker=toView(readHero.get(attackerHeroId));
    const defender=toView(readHero.get(defenderHeroId));
    if(!attacker||!defender)throw new Error('Mission requires two stored heroes');
    if(attacker.ownerId!==actorPlayerId)
     throw new Error('Mission attacker not owned by actor');
    if(currentPlayer.get(defender.ownerId)?.enabled!==1)
     throw new Error('Mission target owner inactive');
    if(authorizeTarget({actorPlayerId,attacker:structuredClone(attacker),
      defender:structuredClone(defender)})!==true)
     throw new Error('Mission target authorization denied');
    const prior=readMission.get(missionId);
    if(prior){
     if(prior.actor_player_id!==actorPlayerId||
       prior.attacker_hero_id!==attackerHeroId||
       prior.defender_hero_id!==defenderHeroId||
       prior.arrival_at_ms!==arrivalAtMs)
      throw new Error('Mission ID collision with different original dispatch');
     return {...missionView(prior),replayed:true};
    }
    if(activeMission.get(attackerHeroId))
     throw new Error('Attacking hero already reserved by active military mission');
    if(activeMission.get(defenderHeroId))
     throw new Error('Target hero is on an active mission; field interception unsupported');
    const route=trustedGeo(attackerHeroId,defenderHeroId,nowMs);
    insertMission.run(missionId,actorPlayerId,attackerHeroId,
     defenderHeroId,arrivalAtMs,attacker.revision);
    if(route){
     saveRoute.run(missionId,json(route));
     const snap=readTerritorySnapshot(route.worldId);
     storedSnapshot.run(missionId,route.worldId,snap.revision,worldDigest(snap),json(snap));
    }
    insertDueEvent.run(missionId,'arrival',arrivalAtMs);
    addMissionEvent(missionId,{phase:'dispatched',timeMs:nowMs,
     arrivalAtMs,attackerRevision:attacker.revision});
    return {...missionView(readMission.get(missionId)),replayed:false};
   });
  },
  markMissionArrived({missionId,actorPlayerId,nowMs,authorizeTarget,lease=null}){
   id(missionId,'mission ID');id(actorPlayerId,'actor ID');
   requiredTime(nowMs,'arrival time');
   if(typeof authorizeTarget!=='function')throw new Error('Arrival target policy required');
   return transaction(()=>{
    checkDueLease(missionId,'arrival',nowMs,lease);
    const m=readMission.get(missionId);
    if(!m)throw new Error('Unknown military mission');
    if(readRecallPlan.get(missionId))
     throw new Error('Arrival forbidden: server-approved recall is returning');
    if(m.actor_player_id!==actorPlayerId||
      currentPlayer.get(actorPlayerId)?.enabled!==1)
     throw new Error('Unauthorized mission arrival');
    const attacker=toView(readHero.get(m.attacker_hero_id));
    const defender=toView(readHero.get(m.defender_hero_id));
    if(!attacker||!defender||attacker.ownerId!==actorPlayerId||
       currentPlayer.get(defender.ownerId)?.enabled!==1)
     throw new Error('Mission hero ownership no longer valid');
    if(authorizeTarget({actorPlayerId,attacker:structuredClone(attacker),
      defender:structuredClone(defender)})!==true)
     throw new Error('Arrival target authorization denied');
    if(m.status==='arrived')return {...missionView(m),replayed:true};
    if(m.status!=='traveling')throw new Error('Mission cannot arrive in state '+m.status);
    if(nowMs<m.arrival_at_ms)throw new Error('Military mission has not arrived yet');
    if(m.attacker_revision!==attacker.revision)
     throw new Error('Mission attacker changed since dispatch');
    if(activeMission.get(m.defender_hero_id))
     throw new Error('Mission defender departed; field interception is unsupported');
    verifiedRoute(missionId,m.attacker_hero_id,m.defender_hero_id,nowMs);
    // Fail CLOSED within the same SQLite write transaction. Alphabetical
    // ordering of leases must never determine victory or arrival priority.
    if(conflictingArrivals(missionId,m.arrival_at_ms).length>0)
     throw new Error('Simultaneous target arrival requires server arbitration');
    if(arriveMission.run(missionId).changes!==1)
     throw new Error('Arrival state transition failed');
    markDueDone.run(nowMs,missionId,'arrival');
    addMissionEvent(missionId,{phase:'arrived',timeMs:nowMs,
     defenderRevision:defender.revision});
    return {...missionView(readMission.get(missionId)),replayed:false};
   });
  },
  scheduleMissionReturn({missionId,actorPlayerId,nowMs,returnAtMs}){
   id(missionId,'mission ID');id(actorPlayerId,'actor ID');
   requiredTime(nowMs,'scheduling time');requiredTime(returnAtMs,'return time');
   if(returnAtMs<=nowMs)throw new RangeError('Return must follow server scheduling time');
   return transaction(()=>{
    const m=readMission.get(missionId);
    if(!m||m.actor_player_id!==actorPlayerId||
       currentPlayer.get(actorPlayerId)?.enabled!==1)
     throw new Error('Unauthorized or unknown military mission return');
    if(m.status!=='returning')throw new Error('Mission has no committed combat return');
    if(nowMs<m.arrival_at_ms)
     throw new Error('Return schedule server time precedes mission arrival');
    if(m.return_at_ms!==null){
     if(m.return_at_ms!==returnAtMs)throw new Error('Mission return schedule conflict');
     return {...missionView(m),replayed:true};
    }
    if(setReturnTime.run(returnAtMs,missionId).changes!==1)
     throw new Error('Mission return schedule failed');
    insertDueEvent.run(missionId,'return_completion',returnAtMs);
    addMissionEvent(missionId,{phase:'return_scheduled',timeMs:nowMs,returnAtMs});
    return {...missionView(readMission.get(missionId)),replayed:false};
   });
  },
  completeMissionReturn({missionId,actorPlayerId,nowMs,lease=null}){
   id(missionId,'mission ID');id(actorPlayerId,'actor ID');
   requiredTime(nowMs,'completion time');
   return transaction(()=>{
    checkDueLease(missionId,'return_completion',nowMs,lease);
    const m=readMission.get(missionId);
    if(!m||m.actor_player_id!==actorPlayerId||
       currentPlayer.get(actorPlayerId)?.enabled!==1)
     throw new Error('Unauthorized or unknown military mission');
    const recallPlan=readRecallPlan.get(missionId);
    if(recallPlan){
     if(m.status==='cancelled')return {...missionView(m),replayed:true};
     if(m.status!=='traveling'||m.battle_command_id!==null||
        m.return_at_ms!==recallPlan.return_at_ms)
      throw new Error('Recall return mission state is inconsistent');
     if(nowMs<recallPlan.return_at_ms)
      throw new Error('Recall return not yet due');
     if(cancelMission.run(missionId).changes!==1)
      throw new Error('Recall return completion failed');
     if(markDueDone.run(nowMs,missionId,'return_completion').changes!==1)
      throw new Error('Recall return event not available for completion');
     addMissionEvent(missionId,{phase:'recall_return_completed',timeMs:nowMs,
      returnAtMs:recallPlan.return_at_ms,policyId:recallPlan.policy_id});
     return {...missionView(readMission.get(missionId)),replayed:false};
    }
    if(m.status==='completed')return {...missionView(m),replayed:true};
    if(m.status!=='returning'||m.return_at_ms===null)
     throw new Error('Military mission return was not scheduled');
    if(nowMs<m.return_at_ms)throw new Error('Military mission return not yet due');
    if(completeMission.run(missionId).changes!==1)
     throw new Error('Military mission return completion failed');
    markDueDone.run(nowMs,missionId,'return_completion');
    addMissionEvent(missionId,{phase:'return_completed',timeMs:nowMs});
    return {...missionView(readMission.get(missionId)),replayed:false};
   });
  },
  cancelUnresolvedMission({missionId,actorPlayerId,authorizeCancellation}){
   id(missionId,'mission ID');id(actorPlayerId,'actor ID');
   if(typeof authorizeCancellation!=='function')
    throw new Error('Server administrative cancellation policy required');
   return transaction(()=>{
    const m=readMission.get(missionId);
    if(!m||m.actor_player_id!==actorPlayerId)
     throw new Error('Unauthorized or unknown military mission');
    if(authorizeCancellation(structuredClone(missionView(m)))!==true)
     throw new Error('Military mission cancellation denied');
    if(m.status==='cancelled')return {...missionView(m),replayed:true};
    if(readRecallPlan.get(missionId))
     throw new Error('Cannot administratively cancel an active approved recall');
    if(!['traveling','arrived'].includes(m.status)||m.battle_command_id!==null)
     throw new Error('Cannot cancel an already committed battle mission');
    if(cancelMission.run(missionId).changes!==1)
     throw new Error('Military mission cancellation failed');
    markDueCancelled.run(missionId,'arrival');
    addMissionEvent(missionId,{phase:'administratively_cancelled'});
    return {...missionView(readMission.get(missionId)),replayed:false};
   });
  },
  /**
   * Owner request only: records intent, NOT a cancellation, repath, teleport,
   * release of troops or automatic schedule change.
   */
  requestMissionRecall({missionId,actorPlayerId,nowMs}){
   id(missionId,'mission ID');id(actorPlayerId,'actor ID');
   requiredTime(nowMs,'recall request time');
   return transaction(()=>{
    const m=readMission.get(missionId);
    if(!m||m.actor_player_id!==actorPlayerId||
       currentPlayer.get(actorPlayerId)?.enabled!==1)
     throw new Error('Unknown or unauthorized mission recall');
    const previous=readRecall.get(missionId);
    if(previous)return {...recallView(previous),replayed:true};
    if(m.status!=='traveling'||nowMs>=m.arrival_at_ms)
     throw new Error('Recall requires a mission still traveling before scheduled arrival');
    const first=missionEvents.all(missionId)[0];
    if(!first||decode(first.event_json).phase!=='dispatched'||
       nowMs<decode(first.event_json).timeMs)
     throw new Error('Recall request cannot precede recorded dispatch');
    insertRecall.run(missionId,actorPlayerId,nowMs);
    addMissionEvent(missionId,{phase:'recall_requested',timeMs:nowMs,
     automaticRecall:false});
    return {...recallView(readRecall.get(missionId)),replayed:false};
   });
  },
  /**
   * SERVER-SIDE authorization only: owner already requested recall.
   * The server, NEVER the client, decides an explicit return timestamp
   * through a named experiment policy. No historical duration is inferred.
   */
  approveMissionRecall({missionId,approvedBy,policyId,nowMs,returnAtMs,
   authorizeRecall}){
   id(missionId,'mission ID');
   id(approvedBy,'recall approving authority');
   id(policyId,'server recall timing policy');
   requiredTime(nowMs,'recall approval time');
   requiredTime(returnAtMs,'recall completion time');
   if(returnAtMs<=nowMs)
    throw new RangeError('Recall return must follow server approval');
   if(typeof authorizeRecall!=='function')
    throw new Error('Separate server recall approval policy required');
   return transaction(()=>{
    const m=readMission.get(missionId);
    const request=readRecall.get(missionId);
    if(!m||!request)throw new Error('Recall approval requires an existing request');
    if(m.actor_player_id!==request.actor_player_id||
       currentPlayer.get(m.actor_player_id)?.enabled!==1)
     throw new Error('Recall mission owner invalid');
    if(authorizeRecall({mission:structuredClone(missionView(m)),
       request:structuredClone(recallView(request)),approvedBy,policyId,
       nowMs,returnAtMs})!==true)
     throw new Error('Server recall approval denied');
    const prior=readRecallPlan.get(missionId);
    if(prior){
     if(prior.approved_by!==approvedBy||prior.policy_id!==policyId||
        prior.approved_at_ms!==nowMs||prior.return_at_ms!==returnAtMs)
      throw new Error('Recall approval ID collision with different schedule');
     return {...recallPlanView(prior),replayed:true};
    }
    if(m.status!=='traveling'||m.battle_command_id!==null||
       m.return_at_ms!==null)
     throw new Error('Recall approval requires unresolved traveling mission');
    if(nowMs<request.requested_at_ms||nowMs>=m.arrival_at_ms)
     throw new Error('Recall approval must occur between request and arrival');
    if(!readRoute.get(missionId)||!readStoredSnapshot.get(missionId))
     throw new Error('Recall return requires frozen geographic mission route');
    if(setRecallReturnTime.run(returnAtMs,missionId).changes!==1)
     throw new Error('Recall return schedule update failed');
    insertRecallPlan.run(missionId,approvedBy,policyId,nowMs,returnAtMs);
    if(markDueCancelled.run(missionId,'arrival').changes!==1)
     throw new Error('Recall cannot cancel the active arrival event');
    insertDueEvent.run(missionId,'return_completion',returnAtMs);
    addMissionEvent(missionId,{phase:'recall_approved',timeMs:nowMs,
     returnAtMs,policyId,historicalCertification:false});
    return {...recallPlanView(readRecallPlan.get(missionId)),replayed:false};
   });
  },
  getMissionRecallPlan(missionId){
   alive();return recallPlanView(readRecallPlan.get(id(missionId,'mission ID')));
  },
  getMissionRecallRequest(missionId){
   alive();return recallView(readRecall.get(id(missionId,'mission ID')));
  },
  getMission(missionId){
   alive();return missionView(readMission.get(id(missionId,'mission ID')));
  },
  getMissionEvents(missionId){
   alive();return missionEvents.all(id(missionId,'mission ID'))
    .map(row=>({sequence:row.sequence,event:decode(row.event_json)}));
  },
  getBattleReceipt(commandId){
   alive();const row=readBattle.get(id(commandId,'command ID'));
   return row?structuredClone(decode(row.receipt_json)):null;
  },
  getBattleEvents(commandId){
   alive();return eventsForBattle.all(id(commandId,'command ID'))
    .map(r=>({sequence:r.sequence,event:decode(r.event_json)}));
  },
  getBattleAuditCounts(){
   alive();return {commands:countBattles.get().count,events:countAudit.get().count};
  },
  close(){if(!closed){db.close();closed=true;}},
  storageKind:'sqlite-node22-experimental',
  productionBattleWritesSupported:false
 };
}
