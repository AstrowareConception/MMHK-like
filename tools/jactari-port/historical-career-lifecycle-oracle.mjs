/**
 * Executes the ORIGINAL, unchanged Jactari change_carriere() and
 * desactive_carriere() on a recording jQuery facade.
 * This adapter is a test oracle for prevalidated final states only.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../../data/Jactari/src/scripts');
const vendor=fs.readFileSync(path.join(dir,'heros.min.js'),'utf8');
function extract(name){
 const start=vendor.indexOf('function '+name+'(');
 if(start<0)throw new Error('Upstream function missing: '+name);
 const open=vendor.indexOf('{',start);let depth=0;
 for(let i=open;i<vendor.length;i++){
  if(vendor[i]==='{')depth++;
  else if(vendor[i]==='}'&&--depth===0)return vendor.slice(start,i+1);
 }
 throw new Error('Unclosed original function: '+name);
}
const bodies=['validite_carriere','maj_comp','maj_talent','change_talent',
  'change_carriere','desactive_carriere'].map(extract).join('\n');
const filenames=['donnees.general.min.js','donnees.heros.min.js'];
const noOp=()=>{};
function startReference(profile,careers){
 const values=Object.fromEntries([1,2,3].map(i=>['#carriere-'+i,'']));
 const nodes={};
 for(const entry of careers)values['#carriere-'+entry.slot]=String(entry.careerId);
 const $=selector=>{
  const id=String(selector);
  if(!nodes[id])nodes[id]={};
  return {
   val(v){if(arguments.length){values[id]=v;return this;}return values[id]??'';},
   attr(name){if(name==='value'&&id.endsWith(' option:first'))return 'not-empty';return undefined;},
   remove(){return this;},removeAttr(){return this;},html(){return this;},
   addClass(){return this;},removeClass(){return this;},hasClass(){return false;},
   text(){return this;}
  };
 };
 const ctx={
  $, _langue:'fr',_avertissements:{},_traduction:{},
  heros:{
   faction:profile.faction,archetype:profile.archetype,
   niveau:profile.level,bonus_tenancier:profile.stewardBonus??0,
   respecialisations:profile.respecializations??0,
   classement_voies:profile.heritageWay??0,
   competences_hereditaires:{
    heros_talentueux:0,revelation_de_talents:0,...profile.heritage
   },
   competence_utilisee:careers.length,
   carriere:[],talent:[],scribe:[0,null,null,null],arcane:[0,null,null,null]
  },
  inArray:(arr,value)=>arr.some(x=>x==value),
  avertissement:noOp,vue_talent:noOp,vue_talents:noOp,
  vue_carriere_icone:noOp,vue_carriere_description:noOp,
  bouton_liens_permanents:noOp
 };
 vm.createContext(ctx,{name:'vendored Jactari original career lifecycle'});
 for(const file of filenames)vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),
   ctx,{timeout:2000,filename:file});
 vm.runInContext(bodies,ctx,{timeout:1200});
 vm.runInContext('maj_comp()',ctx,{timeout:1000});
 // Only the initial committed careers and their talent ranks are normalized.
 // The actual lifecycle operation below always invokes the unchanged vendor
 // function and exposes its raw result.
 for(const entry of careers){
  ctx.heros.carriere[entry.slot]=String(entry.careerId);
  ctx.heros.talent[entry.slot]=Array(ctx._talents[entry.careerId].length).fill(0);
  for(let i=0;i<ctx._talents[entry.careerId].length;i++){
   const name=ctx._talents[entry.careerId][i]?.nom?.fr;
   if(name==='Scribe')ctx.heros.scribe[entry.slot]=0;
   if(name==='Maitre des arcanes')ctx.heros.arcane[entry.slot]=0;
  }
 }
 for(const entry of careers){
  for(const rank of entry.talents??[]){
   ctx.slot=entry.slot;ctx.index=rank.index;ctx.rank=rank.rank;
   const ok=vm.runInContext('change_talent(slot,index,rank)',ctx,{timeout:1000});
   if(ok!==true)throw new Error('Original setup rejected rank');
  }
 }
 return {ctx,values};
}
function state(ctx){
 return {
  available:ctx.heros.competence,
  spent:ctx.heros.competence_utilisee,
  remaining:ctx.heros.competence-ctx.heros.competence_utilisee,
  careers:[1,2,3].flatMap(slot=>{
   const careerId=ctx.heros.carriere[slot];
   return careerId===undefined?[]:[{
    slot,careerId:Number(careerId),
    ranks:Array.from(ctx.heros.talent[slot]??[]).map(x=>x??0)
   }];
  }),
  shared:{Scribe:ctx.heros.scribe[0],
    'Maitre des arcanes':ctx.heros.arcane[0]}
 };
}
export function runOriginalCareerLifecycle({profile,careers,op,slot,careerId}){
 if(!['select','replace','abandon'].includes(op))throw new RangeError('Invalid operation');
 const {ctx,values}=startReference(profile,careers);
 const before=state(ctx);
 ctx.slot=slot;
 let result;
 if(op==='abandon'){
  result=vm.runInContext('desactive_carriere(slot)',ctx,{timeout:1500});
  values['#carriere-'+slot]='';
 }else{
  ctx.id=String(careerId);
  values['#carriere-'+slot]=ctx.id;
  result=vm.runInContext('change_carriere(slot,id)',ctx,{timeout:1500});
 }
 const after=state(ctx);
 return {before,after,deltaSpent:after.spent-before.spent,
  refused:result===false,
  source:'original unchanged change_carriere/desactive_carriere'};
}
