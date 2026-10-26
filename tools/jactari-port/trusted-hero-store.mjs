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
    authorizeTarget,calculate,beforeCommit
  }){
   for(const [name,value] of [['command ID',commandId],['actor ID',actorPlayerId],
    ['attacker hero ID',attackerHeroId],['defender hero ID',defenderHeroId]])
    id(value,name);
   if(attackerHeroId===defenderHeroId)throw new Error('A hero cannot fight itself');
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
     if(prior.actor_player_id!==actorPlayerId||
        prior.attacker_hero_id!==attackerHeroId||
        prior.defender_hero_id!==defenderHeroId||
        prior.rules_digest!==rulesDigest)
      throw new Error('Idempotency key collision: original battle parameters differ');
     return {...decode(prior.receipt_json),replayed:true};
    }
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
    for(let i=0;i<result.events.length;i++)
     putBattleEvent.run(commandId,i,json(result.events[i]));
    if(beforeCommit)beforeCommit(structuredClone(receipt));
    return {...receipt,replayed:false};
   });
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
