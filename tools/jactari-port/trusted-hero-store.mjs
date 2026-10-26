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
 const insertPosting=db.prepare('INSERT INTO hero_city_postings(hero_id,city_id) VALUES(?,?) ON CONFLICT(hero_id) DO UPDATE SET city_id=excluded.city_id');
 const cityOfHero=db.prepare('SELECT c.*,w.world_size FROM hero_city_postings p JOIN military_cities c ON c.city_id=p.city_id JOIN military_worlds w ON w.world_id=c.world_id WHERE p.hero_id=?');
 const saveRoute=db.prepare('INSERT INTO military_mission_routes(mission_id,route_json) VALUES(?,?)');
 const readRoute=db.prepare('SELECT route_json FROM military_mission_routes WHERE mission_id=?');
 const placeView=row=>row?{
  cityId:row.city_id,worldId:row.world_id,ownerPlayerId:row.owner_player_id,
  x:row.x,y:row.y,worldSize:row.world_size,
  firstCity:row.is_first_city===1,protectedUntilMs:row.protected_until_ms
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
    insertCity.run(cityId,worldId,ownerPlayerId,x,y,
     Number(firstCity),protectedUntilMs);
    return {cityId,worldId,ownerPlayerId,x,y,firstCity,protectedUntilMs};
   });
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
    if(route)saveRoute.run(missionId,json(route));
    addMissionEvent(missionId,{phase:'dispatched',timeMs:nowMs,
     arrivalAtMs,attackerRevision:attacker.revision});
    return {...missionView(readMission.get(missionId)),replayed:false};
   });
  },
  markMissionArrived({missionId,actorPlayerId,nowMs,authorizeTarget}){
   id(missionId,'mission ID');id(actorPlayerId,'actor ID');
   requiredTime(nowMs,'arrival time');
   if(typeof authorizeTarget!=='function')throw new Error('Arrival target policy required');
   return transaction(()=>{
    const m=readMission.get(missionId);
    if(!m)throw new Error('Unknown military mission');
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
    if(arriveMission.run(missionId).changes!==1)
     throw new Error('Arrival state transition failed');
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
    if(m.return_at_ms!==null){
     if(m.return_at_ms!==returnAtMs)throw new Error('Mission return schedule conflict');
     return {...missionView(m),replayed:true};
    }
    if(setReturnTime.run(returnAtMs,missionId).changes!==1)
     throw new Error('Mission return schedule failed');
    addMissionEvent(missionId,{phase:'return_scheduled',timeMs:nowMs,returnAtMs});
    return {...missionView(readMission.get(missionId)),replayed:false};
   });
  },
  completeMissionReturn({missionId,actorPlayerId,nowMs}){
   id(missionId,'mission ID');id(actorPlayerId,'actor ID');
   requiredTime(nowMs,'completion time');
   return transaction(()=>{
    const m=readMission.get(missionId);
    if(!m||m.actor_player_id!==actorPlayerId||
       currentPlayer.get(actorPlayerId)?.enabled!==1)
     throw new Error('Unauthorized or unknown military mission');
    if(m.status==='completed')return {...missionView(m),replayed:true};
    if(m.status!=='returning'||m.return_at_ms===null)
     throw new Error('Military mission return was not scheduled');
    if(nowMs<m.return_at_ms)throw new Error('Military mission return not yet due');
    if(completeMission.run(missionId).changes!==1)
     throw new Error('Military mission return completion failed');
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
    if(!['traveling','arrived'].includes(m.status)||m.battle_command_id!==null)
     throw new Error('Cannot cancel an already committed battle mission');
    if(cancelMission.run(missionId).changes!==1)
     throw new Error('Military mission cancellation failed');
    addMissionEvent(missionId,{phase:'administratively_cancelled'});
    return {...missionView(readMission.get(missionId)),replayed:false};
   });
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
