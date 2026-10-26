/**
 * Historic legendary-combat TALENT selector (NOT legendary class unlock logic).
 * Data are taken from Jactari _talents[13..20] and
 * _talents_legendary_combat[attaquant/defenseur].
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {deriveJactariTalentBonuses} from './hero-talent-bonuses.mjs';
const integer=n=>Number.isSafeInteger(n)&&n>=0;
const schemes=new Set(['calculator-reference','server-entitlement']);
export function listJactariLegendaryClasses(tables=getJactariHeroTables()){
 const result=[];
 for(let careerId=13;careerId<=20;careerId++){
  const tree=tables.talents[careerId];
  if(!Array.isArray(tree)||tree.length!==3||tree.some(t=>!t?.nom_machine||
      !Array.isArray(t.v)||t.v.length!==4))
   throw new RangeError('Original Jactari legendary class catalog changed at '+careerId);
  result.push({careerId,
   title:tree[0].nom_title?.fr??tree[0].nom_title?.en??'',
   talents:tree.map((t,talentIndex)=>({talentIndex,name:t.nom_machine,
     title:t.nom?.fr??'',values:[...t.v]}))});
 }
 return result;
}
/**
 * `calculator-reference` reproduces free Jactari calculator sliders, only
 * suitable for test/analysis. `server-entitlement` requires explicitly
 * granted maximum ranks per legend talent from an authoritative game store.
 * No imaginary prerequisite, progression rule or total-budget assumption.
 */
export function deriveJactariLegendaryTalents({
 selections=[],policy='calculator-reference',entitlements=null
},tables=getJactariHeroTables()){
 if(!schemes.has(policy)||!Array.isArray(selections))
  throw new RangeError('Unknown legendary policy or malformed selections');
 if(policy==='server-entitlement'&&(entitlements===null||
    typeof entitlements!=='object'||Array.isArray(entitlements)))
  throw new Error('Authoritative legendary entitlement ledger required');
 const classes=listJactariLegendaryClasses(tables);
 const keys=new Set(),normalized=[];
 for(const entry of selections){
  if(!entry||typeof entry!=='object'||Array.isArray(entry)||
    Object.keys(entry).some(k=>!['careerId','talentIndex','rank'].includes(k))||
    !integer(entry.careerId)||!integer(entry.talentIndex)||!integer(entry.rank))
   throw new RangeError('Legendary selection must contain only original IDs and rank');
  const talent=classes.find(c=>c.careerId===entry.careerId)?.talents[entry.talentIndex];
  if(!talent||entry.rank>=talent.values.length)
   throw new RangeError('Unknown legendary class/talent/rank');
  if(keys.has(talent.name))throw new Error('Duplicate legendary talent');
  keys.add(talent.name);
  if(policy==='server-entitlement'){
   const allowed=entitlements[talent.name];
   if(!integer(allowed)||entry.rank>allowed)
    throw new RangeError('Legendary rank not granted by authoritative server');
  }
  normalized.push({careerId:entry.careerId,talentIndex:entry.talentIndex,rank:entry.rank});
 }
 const values=deriveJactariTalentBonuses(normalized,tables);
 const selected=Object.fromEntries(normalized.map(n=>[
  tables.talents[n.careerId][n.talentIndex].nom_machine,n.rank
 ]));
 return {selections:normalized,selected,bonuses:values.bonuses,levels:values.levels,
  policy,source:'Jactari combat legendary selectors; unlock rules absent in vendor calculator',
  limitations:['No Ubisoft MMHK Season 2 class unlock prerequisites proven',
    'No legendary career learning cost inferred from free calculator sliders',
    'Server-entitlement mode needs actual stored verified grants']};
}
