/**
 * Test-only: executes Jactari's UNMODIFIED original validite_carriere,
 * change_talent, maj_talent and maj_comp against actual versioned tables.
 * Initial career purchase (+1 point) is explicitly reconstructed because
 * change_carriere depends on browser selects. No client-supplied scripts.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../data/Jactari/src/scripts');
const source=fs.readFileSync(path.join(dir,'heros.min.js'),'utf8');
const originalFiles=['donnees.general.min.js','donnees.heros.min.js'];
function functionBody(name){
 const start=source.indexOf('function '+name+'(');
 if(start<0)throw new Error('Missing original career function '+name);
 const open=source.indexOf('{',start);let nesting=0;
 for(let i=open;i<source.length;i++){
  if(source[i]==='{')nesting++;
  else if(source[i]==='}'&&--nesting===0)return source.slice(start,i+1);
 }
 throw new Error('Unclosed original career function '+name);
}
const script=['validite_carriere','maj_comp','maj_talent','change_talent']
 .map(functionBody).join('\n');

function loadOriginal(profile,careers){
 const ctx={
  heros:{
   faction:profile.faction,archetype:profile.archetype,
   niveau:profile.level,bonus_tenancier:profile.stewardBonus??0,
   respecialisations:profile.respecializations??0,
   classement_voies:profile.heritageWay??0,
   competences_hereditaires:{
    heros_talentueux:0,revelation_de_talents:0,...profile.heritage
   },
   competence_utilisee:careers.length,carriere:[],talent:[],
   scribe:[0,null,null,null],arcane:[0,null,null,null]
  },
  $:()=>({text(){return this},addClass(){return this},
    removeClass(){return this},hasClass(){return false}}),
  _langue:'fr',_avertissements:{},
  avertissement:()=>{},vue_talent:()=>{},bouton_liens_permanents:()=>{},
  inArray:(items,value)=>items.some(x=>x==value)
 };
 vm.createContext(ctx,{name:'vendored-original-career-transitions'});
 for(const file of originalFiles)
  vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),ctx,{timeout:2500});
 vm.runInContext(script,ctx,{timeout:1200});
 vm.runInContext('maj_comp()',ctx,{timeout:1000});
 for(const c of careers){
  ctx.heros.carriere[c.slot]=c.careerId;
  ctx.heros.talent[c.slot]=Array(ctx._talents[c.careerId].length).fill(0);
  for(let t=0;t<ctx._talents[c.careerId].length;t++){
   const fr=ctx._talents[c.careerId][t]?.nom?.fr;
   if(fr==='Scribe')ctx.heros.scribe[c.slot]=0;
   if(fr==='Maitre des arcanes')ctx.heros.arcane[c.slot]=0;
  }
 }
 return ctx;
}
export function originalCareerAllowed({faction,archetype,careerId}){
 const ctx=loadOriginal({faction,archetype,level:40},[]);
 ctx.target=careerId;
 return vm.runInContext('validite_carriere(target)',ctx,{timeout:1000});
}
export function originalCareerTalentLedger({profile,careers}){
 const ctx=loadOriginal(profile,careers);
 // One point per selected career is paid before the talent purchases.
 for(const c of careers){
  const choices=c.talents??[];
  for(const choice of choices){
   ctx.slot=c.slot;ctx.index=choice.index;ctx.rank=choice.rank;
   const ok=vm.runInContext('change_talent(slot,index,rank)',ctx,{timeout:1000});
   if(ok!==true)throw new Error('Original change_talent denied rank '+JSON.stringify(choice));
  }
 }
 const ranks=careers.map(c=>({slot:c.slot,careerId:c.careerId,
  ranks:Array.from(ctx.heros.talent[c.slot])}));
 return {
  available:ctx.heros.competence,
  spent:ctx.heros.competence_utilisee,
  remaining:ctx.heros.competence-ctx.heros.competence_utilisee,
  careers:ranks,
  shared:{Scribe:ctx.heros.scribe[0],'Maitre des arcanes':ctx.heros.arcane[0]},
  provenance:'native validite_carriere/maj_comp/maj_talent/change_talent'
 };
}
