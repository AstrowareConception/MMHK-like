/**
 * Execute original Jactari bonus_magie_artefacts() with its checked-in,
 * REAL artifact/effect/category tables. Test oracle only, not runtime catalog.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../data/Jactari/src/scripts');
const data=fs.readFileSync(path.join(folder,'donnees.artefacts.min.js'),'utf8');
const combat=fs.readFileSync(path.join(folder,'combat.min.js'),'utf8');
function extract(name){
 const start=combat.indexOf('function '+name+'(');
 if(start<0)throw new Error('Missing upstream function '+name);
 let depth=0;const open=combat.indexOf('{',start);
 for(let i=open;i<combat.length;i++){
  if(combat[i]==='{')depth++;
  else if(combat[i]==='}'&&--depth===0)return combat.slice(start,i+1);
 }
 throw new Error('Unclosed original function');
}
const original=extract('bonus_magie_artefacts');
function sourceContext(){
 const ctx={
  _langue:'fr',inArray:(set,id)=>set.includes(id),image_html_arme:()=>''
 };
 vm.createContext(ctx,{name:'vendor-original-artifact-catalog'});
 vm.runInContext(data,ctx,{timeout:3000});
 vm.runInContext(original,ctx,{timeout:1000});
 return ctx;
}
let tables;
export function historicalArtifactTables(){
 if(!tables){
  const ctx=sourceContext();
  tables=JSON.parse(JSON.stringify({artifacts:ctx._artefacts,
   effects:ctx._effets,categories:ctx._types_effets_magie,slotCount:ctx._slots.length}));
 }
 return structuredClone(tables);
}
export function runOriginalArtifactSpellBonus({artifactIds,spell,castingWeapon,opposingWeapon}){
 const ctx=sourceContext();
 if(!Array.isArray(artifactIds)||artifactIds.length!==ctx._slots.length)
  throw new RangeError('Original artifact slot count mismatch');
 const hero=Object.fromEntries(artifactIds.map((id,i)=>['slot_'+i,id]));
 ctx.hero=hero;
 ctx.spell={ecole:spell.school,type:spell.type,cible:spell.target,
  cercle:spell.circle,unite:spell.unit};
 ctx.castingWeapon=castingWeapon;
 ctx.opposingWeapon=opposingWeapon;
 const originalResult=vm.runInContext(
  'bonus_magie_artefacts(hero,spell,castingWeapon,opposingWeapon)',ctx,{timeout:1000});
 return {bonus:originalResult.bonus,source:'native bonus_magie_artefacts + vendored catalog'};
}
