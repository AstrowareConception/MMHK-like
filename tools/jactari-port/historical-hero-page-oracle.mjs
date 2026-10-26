/**
 * Test oracle: original hero-page maj_adm(), maj_comp(), equipe_artefact().
 * Each full original function body executes unchanged against original data.
 * Isolated node:vm is NOT a security sandbox for arbitrary incoming scripts.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const folder=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../data/Jactari/src/scripts');
const src=fs.readFileSync(path.join(folder,'heros.min.js'),'utf8');
const catalogFiles=['donnees.general.min.js','donnees.heros.min.js','donnees.artefacts.min.js'];
function extract(name){
 const start=src.indexOf('function '+name+'(');
 if(start<0)throw Error('Upstream Jactari hero function not found: '+name);
 let depth=0,begin=src.indexOf('{',start);
 for(let i=begin;i<src.length;i++){
  if(src[i]==='{')depth++;
  else if(src[i]==='}'&&--depth===0)return src.slice(start,i+1);
 }
 throw Error('Unbalanced upstream function '+name);
}
const original=['maj_adm','maj_comp','equipe_artefact'].map(extract).join('\n');
export function runOriginalHeroPage({
 faction,archetype,level,heritage={},heritageWay=0,equipment=null,
 stewardBonus=0,respecializations=0,skillPointsUsed=0
}){
 const nodes={};
 const $=selector=>{
  if(!nodes[selector])nodes[selector]={};
  const state=nodes[selector];
  return {
   addClass:()=>{},removeClass:()=>{},attr:()=>{},html:v=>{
    if(v!==undefined)state.html=v;
    return state.html;
   },text:v=>{
    if(v!==undefined)state.text=v;
    return state.text;
   },hasClass:()=>false
  };
 };
 const ctx={
  $,image_css_artefact:()=>{},change_description_artefact:()=>{},
  choix_artefacts_equipes:()=>{},bouton_liens_permanents:()=>{},
  avertissement:()=>{},_langue:'fr',
  bonus_arte:['a','d','m','ap','dp','mp'],
  heros:{
   faction,archetype,niveau:level,
   competences_hereditaires:{heros_superieur:0,revelation_de_caracteristiques:0,
    heros_talentueux:0,revelation_de_talents:0,...structuredClone(heritage)},
   classement_voies:heritageWay,
   bonus:{a:0,d:0,m:0,ap:0,dp:0,mp:0},
   inventaire:[],
   bonus_tenancier:stewardBonus,respecialisations:respecializations,
   competence_utilisee:skillPointsUsed
  },
  formate_nombre:n=>String(n)
 };
 vm.createContext(ctx,{name:'authentic-Jactari-hero-page-functions'});
 for(const f of catalogFiles)vm.runInContext(fs.readFileSync(path.join(folder,f),'utf8'),ctx,{timeout:2000,filename:f});
 vm.runInContext(original,ctx,{timeout:1000});
 const items=equipment??Array(ctx._slots.length).fill(0);
 if(items.length!==ctx._slots.length)throw new RangeError('Equipment length mismatch');
 for(let i=0;i<items.length;i++){
  if(items[i]===0)continue;
  ctx.item=items[i];ctx.slot=i;
  const accepted=vm.runInContext('equipe_artefact(item,slot)',ctx,{timeout:1000});
  if(accepted===false)throw new Error('Original Jactari rejected equipment '+items[i]+' at '+i);
 }
 vm.runInContext('maj_adm();maj_comp()',ctx,{timeout:1000});
 return {
  raw:{attaque:ctx.heros.attaque,defense:ctx.heros.defense,magie:ctx.heros.magie},
  display:{
   attaque:Number(nodes['#attaque-valeur']?.html),
   defense:Number(nodes['#defense-valeur']?.html),
   magie:Number(nodes['#magie-valeur']?.html)
  },
  equipmentBonuses:JSON.parse(JSON.stringify(ctx.heros.bonus)),
  skillPoints:{available:ctx.heros.competence,used:skillPointsUsed,
   overspent:ctx.heros.competence<skillPointsUsed},
  experience:ctx._niveaux[level][0],
  provenance:'UNMODIFIED-maj_adm+maj_comp+equipe_artefact-original-data'
 };
}
