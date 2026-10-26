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
import {deriveJactariLegendaryTalents} from './hero-legendary.mjs';
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
 deriveJactariHeroPageSnapshot(profile);
 const careers=record.careers??[];
 const grant=record.legendaryGrants??{};
 const chosen=record.legendarySelections??[];
 const orders=record.spellOrders??{};
 if(!Array.isArray(careers)||!Array.isArray(chosen)||!isRecord(grant)||
    !isRecord(orders))throw new TypeError('Malformed stored career/legendary/spell choices');
 calculateJactariCareerBudget({profile,careers});
 deriveJactariLegendaryTalents({selections:chosen,
  policy:'server-entitlement',entitlements:grant});
 if(Object.keys(orders).length>2)throw new RangeError('At most two stored spell orders');
 for(const [turn,order] of Object.entries(orders)){
  if(!/^(?:[1-9]|1[0-4])$/.test(turn)||!isRecord(order)||
    Object.keys(order).length!==1||!Number.isSafeInteger(order.id)||order.id<0)
   throw new RangeError('Stored spell order must contain a valid original ID and round');
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
 `);
 const addPlayer=db.prepare('INSERT INTO players(player_id,enabled) VALUES(?,1)');
 const setPlayerEnabled=db.prepare('UPDATE players SET enabled=? WHERE player_id=?');
 const currentPlayer=db.prepare('SELECT enabled FROM players WHERE player_id=?');
 const insertHero=db.prepare('INSERT INTO heroes(hero_id,owner_player_id,revision,payload) VALUES(?,?,1,?)');
 const readHero=db.prepare('SELECT hero_id,owner_player_id,revision,payload FROM heroes WHERE hero_id=?');
 const swap=db.prepare('UPDATE heroes SET payload=?,revision=revision+1 WHERE hero_id=? AND revision=?');
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
  close(){if(!closed){db.close();closed=true;}},
  storageKind:'sqlite-node22-experimental',
  productionBattleWritesSupported:false
 };
}
