/**
 * Bounded port of Jactari hero-page maj_adm() + maj_comp().
 * Computes historical BASE A/D/M and hero-page DISPLAY values from the
 * actual Jactari level/archetype/heredity/equipment tables.
 *
 * IMPORTANT: This is NOT the battle-screen maj_situation hero model.
 * Its battlefield modifiers (alliance, legendary, PvP side) are a separate
 * historical branch and must be proved before use as a battle snapshot.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {getJactariHeroTables} from './hero-source-tables.mjs';

const keys=['a','d','m','ap','dp','mp'];
const stats={a:'attaque',d:'defense',m:'magie'};
const safe=(n,label)=>{if(!Number.isSafeInteger(n)||n<0)throw new RangeError('Invalid '+label);return n;};
const clean=(o,label)=>{if(!o||typeof o!=='object'||Array.isArray(o))throw new TypeError('Invalid '+label);return o;};
const pct=(n)=>1+n/100;
const heroNames=['heros_superieur','revelation_de_caracteristiques','heros_talentueux','revelation_de_talents'];
function rankMultiplier(tables,way,name){
 const cfg=tables.hereditary[name],row=tables.wayRanking[way];
 if(!cfg||!row||!Number.isFinite(row[cfg.voie]))throw new RangeError('Unsupported heritage way');
 return 1+tables.wayMultiplier*row[cfg.voie];
}
function hereditaryLevel(tables,levels,key){
 const lvl=levels[key]??0;
 safe(lvl,'heritage level '+key);
 const config=tables.hereditary[key];
 if(!config)throw new RangeError('Unknown hereditary skill '+key);
 const value=config.bonus;
 const max=Array.isArray(value)?value.length:
   value&&typeof value==='object'?Math.max(...Object.values(value).filter(Array.isArray).map(a=>a.length)):0;
 if(lvl>=max)throw new RangeError('Heritage rank outside historical table: '+key);
 return lvl;
}
/** Server input is persistent ID/rank choices, never precomputed bonus fields. */
export function deriveJactariHeroPageSnapshot({
 faction,archetype,level,heritage={},heritageWay=0,equipment=null,
 stewardBonus=0,respecializations=0,skillPointsUsed=0
},tables=getJactariHeroTables()){
 safe(faction,'faction');safe(archetype,'archetype');safe(level,'level');
 safe(heritageWay,'heritage way');safe(stewardBonus,'steward bonus');
 safe(respecializations,'respecializations');safe(skillPointsUsed,'spent skill points');
 if(!tables.archetypes[archetype]||!tables.levels[level]||!tables.wayRanking[heritageWay])
  throw new RangeError('Hero archetype, level or heritage way not in original catalog');
 clean(heritage,'hero heritage');
 for(const key of Object.keys(heritage))hereditaryLevel(tables,heritage,key);
 const chosen=equipment===null?Array(tables.equipmentSlots.length).fill(0):equipment;
 if(!Array.isArray(chosen)||chosen.length!==tables.equipmentSlots.length)
  throw new RangeError('Historical equipment must have all slots');
 const bonuses=Object.fromEntries(keys.map(k=>[k,0]));
 let totalNonHeritagePoints=0;
 for(let i=0;i<chosen.length;i++){
  const id=chosen[i];
  safe(id,'artifact ID');
  const artifact=tables.artifacts[id];
  if(!artifact || artifact.id!==id)throw new RangeError('Artifact ID missing from original catalog');
  if(id===0)continue;
  if(Number(artifact.slot)!==i)throw new RangeError('Artifact in incompatible slot '+i);
  if(!Array.isArray(artifact.effets))throw new RangeError('Invalid historical artifact effects');
  if(artifact.voie===undefined)totalNonHeritagePoints+=artifact.effets.reduce((n,e)=>n+e.niv,0);
  for(const k of keys){
   const value=artifact.bonus?.[k];
   if(value===undefined)continue;
   if(!Number.isFinite(value))throw new RangeError('Non-numeric artifact bonus');
   const multiplier=artifact.voie===undefined?1:
     1+tables.wayMultiplier*tables.wayRanking[heritageWay][artifact.voie];
   bonuses[k]+=value*multiplier;
  }
 }
 if(totalNonHeritagePoints>level)throw new RangeError('Artifact level budget exceeded');
 const arch=tables.archetypes[archetype];
 const raw={},display={};
 for(const [suffix,key] of Object.entries(stats)){
  const track=arch[key];
  if(!Number.isSafeInteger(track)||!Number.isFinite(tables.levels[level][track]))
   throw new RangeError('Unknown historical level progression '+key);
  let current=track===0?0:tables.levels[level][track];
  const improved=hereditaryLevel(tables,heritage,'heros_superieur');
  if(improved>0){
   const amount=tables.hereditary.heros_superieur.bonus[suffix][improved];
   current+=amount*rankMultiplier(tables,heritageWay,'heros_superieur');
  }
  const revelation=hereditaryLevel(tables,heritage,'revelation_de_caracteristiques');
  if(revelation>0 && level>=15){
   const amount=tables.hereditary.revelation_de_caracteristiques.bonus[suffix][revelation];
   current+=Math.floor(level/15)*Math.round(amount*rankMultiplier(tables,heritageWay,'revelation_de_caracteristiques'));
  }
  raw[key]=current;
  // maj_adm(): percentage is applied to base THEN the flat bonus;
  // only positive bonuses are used in the original hero page.
  let shown=current;
  if(bonuses[suffix+'p']>0)shown+=current*bonuses[suffix+'p']/100;
  if(bonuses[suffix]>0)shown+=bonuses[suffix];
  display[key]=shown;
 }
 let skillPoints=level+stewardBonus-respecializations*2;
 const gifted=hereditaryLevel(tables,heritage,'heros_talentueux');
 if(gifted>0)skillPoints+=Math.round(tables.hereditary.heros_talentueux.bonus[gifted]*
    rankMultiplier(tables,heritageWay,'heros_talentueux'));
 const revealTalents=hereditaryLevel(tables,heritage,'revelation_de_talents');
 if(revealTalents>0 && level>=15)skillPoints+=Math.floor(level/15)*Math.round(
   tables.hereditary.revelation_de_talents.bonus[revealTalents]*
   rankMultiplier(tables,heritageWay,'revelation_de_talents'));
 return {
  identity:{faction,archetype,level,heritageWay},
  raw,display,
  equipmentBonuses:bonuses,equipment:[...chosen],
  skillPoints:{available:skillPoints,used:skillPointsUsed,overspent:skillPointsUsed>skillPoints},
  experience:tables.levels[level][0],
  provenance:'historical-Jactari-heros.min.js-maj_adm+maj_comp-bounded',
  limitations:['Hero page, NOT combat-page modified attack/defense',
    'Talents/careers and legendary bonuses not yet derived',
    'Equipment legality beyond matching slot and hero-level budget remains unproved']
 };
}
