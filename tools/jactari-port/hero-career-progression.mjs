/**
 * Historical Jactari career access and talent-point accounting.
 * Source: heros.min.js validite_carriere(), change_carriere(),
 * change_talent(), maj_comp() and _apprentissage.
 *
 * A FINAL SNAPSHOT validator, not a claim that every intermediate transition
 * of the legacy UI has been reproduced. Shared Scribe/Arcana ranks must match
 * across selected careers in this strict server policy.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {deriveJactariHeroPageSnapshot} from './hero-page-snapshot.mjs';
const validInt=n=>Number.isSafeInteger(n)&&n>=0;
const fail=(message)=>{throw new RangeError(message);};
const clone=o=>structuredClone(o);
const sharedNames=new Set(['Scribe','Maitre des arcanes']);
export function isJactariCareerAllowed({faction,archetype,careerId},tables=getJactariHeroTables()){
 if(!validInt(faction)||!validInt(archetype)||!validInt(careerId))fail('Invalid career choice');
 const f=tables.factions[faction],a=tables.archetypes[archetype],c=tables.careers[careerId];
 if(!f||!a||!c)fail('Unknown faction, archetype or career');
 // Exactly the predicate in validite_carriere(): no school restriction if
 // career has no ecole, otherwise faction must know the school and class
 // must not be a warrior.
 return c.ecole===undefined || (a.type!=='guerrier' && f.ecoles.includes(c.ecole));
}
function validateCareerEntry(entry,tables){
 if(!entry||typeof entry!=='object'||Array.isArray(entry))fail('Invalid career entry');
 if(Object.keys(entry).some(k=>!['slot','careerId','talents'].includes(k)))
   fail('Only career IDs and talent ranks are allowed, not computed bonuses');
 if(!validInt(entry.slot)||entry.slot<1||entry.slot>3||!validInt(entry.careerId))
   fail('Career slot must be 1, 2 or 3');
 if(!Array.isArray(entry.talents))fail('Talent ranks must be a list of choices');
 const tree=tables.talents[entry.careerId];
 if(!tables.careers[entry.careerId]||!Array.isArray(tree))fail('Unknown career tree');
 const ranks=Array(tree.length).fill(0);
 const used=new Set();
 for(const item of entry.talents){
  if(!item||typeof item!=='object'||Array.isArray(item)||
     Object.keys(item).some(k=>!['index','rank'].includes(k)))
    fail('Only original talent index and rank are allowed');
  if(!validInt(item.index)||!validInt(item.rank)||used.has(item.index))
    fail('Invalid or duplicate talent index/rank');
  const talent=tree[item.index];
  if(!talent||!Array.isArray(talent.v)||item.rank>=talent.v.length||
     item.rank>=tables.learningCosts.length)fail('Historical talent rank unavailable');
  used.add(item.index);
  ranks[item.index]=item.rank;
 }
 return ranks;
}

/** Does not accept client-provided bonus_tacticien, spent points or discounts. */
export function calculateJactariCareerBudget({profile,careers=[]},tables=getJactariHeroTables()){
 if(!profile||typeof profile!=='object'||Array.isArray(profile)||!Array.isArray(careers))
   fail('Trusted hero profile and career selections required');
 if(careers.length>3)fail('At most three career slots');
 const initial=deriveJactariHeroPageSnapshot({...profile,skillPointsUsed:0},tables);
 const chosen=new Set(),slots=new Set(),shared=new Map(),result=[];
 let spent=0;
 const talentSelections=[];
 for(const entry of careers){
  const ranks=validateCareerEntry(entry,tables);
  if(chosen.has(entry.careerId)||slots.has(entry.slot))fail('Duplicate career or slot');
  chosen.add(entry.careerId);slots.add(entry.slot);
  if(!isJactariCareerAllowed({faction:profile.faction,archetype:profile.archetype,
      careerId:entry.careerId},tables))fail('Career not available to faction/archetype');
  spent+=1; // change_carriere: first activation costs exactly 1 point
  const tree=tables.talents[entry.careerId];
  for(let index=0;index<tree.length;index++){
   const rank=ranks[index],talent=tree[index],name=talent.nom?.fr;
   if(sharedNames.has(name)){
    if(shared.has(name)&&shared.get(name)!==rank)
      fail('Shared Scribe/Arcana rank inconsistent across careers');
    shared.set(name,rank);
   }else spent+=tables.learningCosts[rank];
   if(rank>0)talentSelections.push({careerId:entry.careerId,talentIndex:index,rank});
  }
  result.push({slot:entry.slot,careerId:entry.careerId,ranks});
 }
 for(const [name,rank] of shared)spent+=tables.learningCosts[rank];
 const available=initial.skillPoints.available;
 if(spent>available)fail('Insufficient historical skill points for selected career/talents');
 return {available,spent,remaining:available-spent,careers:result,
  talentSelections,shared:Object.fromEntries(shared),source:'Jactari heros.min.js career/rank budget',
  limitations:['Final-state validation only: original UI edit transitions may differ',
   'Career prerequisites beyond faction-school/type and point budget unverified',
   'Shared-rank agreement imposed as an explicit strict server safety policy',
   'No proof of full MMHK S2 career equivalence']};
}

/**
 * A deterministic rank transition for an already-valid final career state.
 * In a synchronized Scribe/Arcana family the updated rank is propagated to
 * every selected career exposing that talent, as in the corresponding
 * legacy UI branch when peers share the highest rank.
 *
 * This does not execute a historical delete/change-career action.
 */
export function changeJactariCareerRank({profile,careers,slot,index,rank},tables=getJactariHeroTables()){
 if(!validInt(slot)||slot<1||slot>3||!validInt(index)||!validInt(rank))
   fail('Invalid career rank transition');
 const prior=calculateJactariCareerBudget({profile,careers},tables);
 const target=prior.careers.find(c=>c.slot===slot);
 if(!target)fail('Missing career slot in current hero plan');
 const talent=tables.talents[target.careerId]?.[index];
 if(!talent||!Array.isArray(talent.v)||rank>=talent.v.length||
   rank>=tables.learningCosts.length)fail('Target rank unavailable in original talent table');
 const shared=sharedNames.has(talent.nom?.fr)?talent.nom.fr:null;
 const next=prior.careers.map(c=>{
   const ranks=[...c.ranks],tree=tables.talents[c.careerId];
   if(c.slot===slot)ranks[index]=rank;
   if(shared)for(let i=0;i<tree.length;i++)
     if(tree[i]?.nom?.fr===shared)ranks[i]=rank;
   return {slot:c.slot,careerId:c.careerId,
    talents:ranks.flatMap((value,i)=>value>0?[{index:i,rank:value}]:[])};
 });
 const after=calculateJactariCareerBudget({profile,careers:next},tables);
 return {before:prior,after,deltaSpent:after.spent-prior.spent,
   currentCareerPlan:next,source:'Strict Jactari career-rank transition for already-synchronized states'};
}
