/**
 * Parse real in-game skill tag mappings from the original 2013 MMHK-Plus
 * compatibility bridge (Aendawyn, e8d862d, GPL-3.0-or-later).
 *
 * It reflects how a third-party tool translated a heroSkillList returned
 * by the client into Jactari fields, NOT proof of eligibility or ownership.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getJactariHeroTables} from './hero-source-tables.mjs';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const upstreamAddonPath='data/Jactari/upstream-addon/mmhkplus-jactari-2013.js';
const code=fs.readFileSync(path.join(dir,upstreamAddonPath),'utf8');
let cached=null;
export function originalClientLegendaryTagMap(tables=getJactariHeroTables()){
 if(cached===null){
  const pairs=[...code.matchAll(/case\s+'([A-Z0-9_]+)'\s*:\s*a\.(legendary_[a-z0-9_]+)\s*=\s*talent\.level\s*;/g)];
  const mapping={};
  for(const [,tag,name] of pairs){
   if(Object.hasOwn(mapping,tag))throw new Error('Duplicate source game skill tag '+tag);
   const found=[];
   for(let careerId=13;careerId<=20;careerId++)
    for(let talentIndex=0;talentIndex<3;talentIndex++)
     if(tables.talents[careerId]?.[talentIndex]?.nom_machine===name)
      found.push({careerId,talentIndex});
   if(found.length!==1)throw new Error('Original game legendary tag lacks unique Jactari talent: '+tag);
   mapping[tag]={name,...found[0]};
  }
  if(Object.keys(mapping).length!==24 ||
    new Set(Object.values(mapping).map(v=>v.name)).size!==24)
   throw new Error('Incomplete authentic 2013 legendary-client-tag mapping');
  cached=mapping;
 }
 return structuredClone(cached);
}
/**
 * Server-only input: pass a heroSkillList loaded from an authenticated hero
 * record owned by the user, NEVER a browser-submitted entitlement JSON.
 * Do not call the result "verified" until those server preconditions hold.
 */
export function projectOriginalHeroLegendarySkills({heroSkillList},
 tables=getJactariHeroTables()){
 if(!Array.isArray(heroSkillList))throw new TypeError('Archived heroSkillList array required');
 const mapping=originalClientLegendaryTagMap(tables);
 const ranks=new Map(),otherSkills=[];
 for(const item of heroSkillList){
  if(!item||typeof item!=='object'||Array.isArray(item)||
   typeof item.heroClassSkillEntityTagName!=='string'||
   !Number.isSafeInteger(item.level)||item.level<0)
   throw new RangeError('Invalid original heroSkillList item');
  const mappingRow=mapping[item.heroClassSkillEntityTagName];
  if(!mappingRow){otherSkills.push(item.heroClassSkillEntityTagName);continue;}
  const limit=tables.talents[mappingRow.careerId][mappingRow.talentIndex].v.length-1;
  if(item.level>limit)throw new RangeError('Legendary rank outside original catalog: '+mappingRow.name);
  if(ranks.has(mappingRow.name))throw new Error('Duplicate game legendary skill: '+mappingRow.name);
  ranks.set(mappingRow.name,item.level);
 }
 const selected=[],entitlements={};
 for(const [name,rank] of ranks){
  const row=Object.values(mapping).find(m=>m.name===name);
  if(rank>0)selected.push({careerId:row.careerId,talentIndex:row.talentIndex,rank});
  entitlements[name]=rank;
 }
 return {selections:selected,observedRanks:entitlements,ignoredNonLegendaryTags:otherSkills,
  evidenceSource:upstreamAddonPath,
  provenance:'2013 community MMHK-Plus in-game heroSkillList to Jactari mapping',
  authoritative:false,
  limitations:[
   'Input must be authenticated and loaded server-side before ranks can become entitlements',
   'Mapping proves original game field names but not legendary unlock criteria or S2 parity'
  ]};
}
