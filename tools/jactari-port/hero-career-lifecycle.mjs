/**
 * Strict FINAL-STATE adapter for selecting, replacing or abandoning a Jactari
 * career. The accounting is computed from authoritative historical catalogs;
 * the native UI's transient states are tested separately, not silently ported.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {calculateJactariCareerBudget,isJactariCareerAllowed} from './hero-career-progression.mjs';

const sharedNames=new Set(['Scribe','Maitre des arcanes']);
const valid=n=>Number.isSafeInteger(n)&&n>=0;
const convert=c=>({slot:c.slot,careerId:c.careerId,
  talents:c.ranks.flatMap((rank,index)=>rank>0?[{index,rank}]:[])});

/**
 * Return an immutable replacement plan; applies NO database operation.
 * `op` is 'select'|'replace'|'abandon'. This implementation intentionally
 * declines to model any original UI state that is not a valid final snapshot.
 */
export function transitionJactariCareer({profile,careers,op,slot,careerId},
  tables=getJactariHeroTables()){
 if(!['select','replace','abandon'].includes(op)||!valid(slot)||slot<1||slot>3)
  throw new RangeError('Invalid career lifecycle operation/slot');
 const previous=calculateJactariCareerBudget({profile,careers},tables);
 const exists=previous.careers.find(c=>c.slot===slot);
 if(op==='select'&&exists)throw new RangeError('Career slot already selected');
 if(op!=='select'&&!exists)throw new RangeError('Career slot not selected');
 if(op!=='abandon'){
  if(!valid(careerId)||!tables.careers[careerId]||
     !isJactariCareerAllowed({faction:profile.faction,
       archetype:profile.archetype,careerId},tables))
   throw new RangeError('Career is not available to this hero');
  if(previous.careers.some(c=>c.slot!==slot&&c.careerId===careerId))
   throw new RangeError('Duplicate selected career');
 }else if(careerId!==undefined)throw new RangeError('Abandon requires no new career ID');

 let next=previous.careers.filter(c=>c.slot!==slot).map(convert);
 // Replacing a career must first drop its own Scribe/Arcana contribution.
 // Only the surviving OTHER careers may pass along a shared learned rank.
 const remaining=calculateJactariCareerBudget({profile,careers:next},tables);
 if(op!=='abandon'){
  const talents=tables.talents[careerId].flatMap((talent,index)=>{
   const name=talent?.nom?.fr;
   const rank=sharedNames.has(name)?remaining.shared[name]??0:0;
   return rank>0?[{index,rank}]:[];
  });
  next.push({slot,careerId,talents});
 }
 next.sort((a,b)=>a.slot-b.slot);
 const after=calculateJactariCareerBudget({profile,careers:next},tables);
 return {before:previous,after,deltaSpent:after.spent-previous.spent,
  currentCareerPlan:structuredClone(next),
  source:'Jactari change_carriere/desactive_carriere strict final-state accounting',
  limitations:[
   'Does not certify native UI transient states or their DOM option mutations',
   'Uses a strict valid-final-state policy, not a literal reproduction of legacy UI bugs',
   'No authentication of hero ownership or historical MMHK Season 2 parity'
  ]};
}
