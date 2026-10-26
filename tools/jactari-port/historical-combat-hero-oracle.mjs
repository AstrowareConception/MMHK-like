/**
 * Independent Jactari COMBAT hero reference.
 * Runs the ORIGINAL, unchanged maj_situation() hero-stat calculation fragment
 * rather than reusing the port's formulas or the hero-editor maj_adm().
 * Deliberately bounded to a single present hero and its direct modifiers.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const dir=path.resolve(path.dirname(fileURLToPath(import.meta.url)),
 '../../data/Jactari/src/scripts');
const source=fs.readFileSync(path.join(dir,'combat.min.js'),'utf8');
const start=source.indexOf("var niveau=$('#niveau-'+camp).val();");
const end=source.indexOf("var bonus_attaque=liste_heros[heros].attaque_modifiee",start);
if(start<0||end<=start)throw Error('Original hero-stat computation changed upstream');
const snippet=source.slice(start,end);
const files=['donnees.general.min.js','donnees.heros.min.js','donnees.artefacts.min.js'];
export function runOriginalCombatHeroSnapshot({
 profile,side,talentSelections=[],allianceAttackPercent=0,
 allianceDefensePercent=0,attackMalusPercent=0
}){
 if(!['attacker','defender'].includes(side))throw new RangeError('Unsupported combat side');
 const camp=side==='attacker'?'attaquant':'defenseur',p=profile;
 const talentData={};
 // Read the actual catalog to map IDs to names, but NEVER calculate a bonus
 // from the port under test.
 const reference={};
 vm.createContext(reference,{name:'original-Jactari-hero-reference-tables'});
 for(const file of files)vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),
  reference,{timeout:2000,filename:file});
 for(const choice of talentSelections){
  const t=reference._talents[choice.careerId]?.[choice.talentIndex];
  if(!t?.nom_machine)throw new Error('Original talent reference absent');
  talentData[t.nom_machine]=choice.rank;
 }
 const gear=p.equipment??Array(reference._slots.length).fill(0);
 const read=selector=>{
  if(selector==='#niveau-'+camp)return String(p.level);
  if(selector==='#faction-'+camp)return String(p.faction);
  if(selector==='#archetype-'+camp)return String(p.archetype);
  let found=new RegExp('^#arte-(\\d+)-'+camp+'$').exec(selector);
  if(found)return String(gear[Number(found[1])]??0);
  found=new RegExp('^#([A-Za-z_0-9]+)-'+camp+'$').exec(selector);
  if(found)return String(talentData[found[1]]??0);
  throw new Error('Unexpected original combat hero control '+selector);
 };
 const ctx={
  $:selector=>({val:()=>read(selector)}),
  liste_heros:{0:{}},heros:0,camp,magie:0,
  competences_hereditaires:{[camp]:{
   heros_superieur:0,revelation_de_caracteristiques:0,
   revelation_de_caracteristiques_15:0,revelation_de_caracteristiques_30:0,
   ...structuredClone(p.heritage??{})
  }},
  classement_voies:{[camp]:p.heritageWay??0},
  bonus_alliance_attaque:allianceAttackPercent,
  bonus_alliance_defense:allianceDefensePercent,
  malus_attaque:attackMalusPercent,
  inArray:(xs,value)=>{
   for(let i=0;i<xs.length;i++)if(xs[i]==value)return true;
   return false;
  }
 };
 vm.createContext(ctx,{name:'original-Jactari-combat-hero-calculation'});
 for(const file of files)vm.runInContext(fs.readFileSync(path.join(dir,file),'utf8'),
  ctx,{timeout:2000,filename:file});
 vm.runInContext(snippet,ctx,{timeout:3000,filename:'original-maj_situation-hero-fragment.js'});
 const raw=ctx.liste_heros[0];
 return {
  stats:Object.fromEntries(['attaque','defense','magie','attaque_modifiee',
    'defense_modifiee','magie_modifiee'].map(k=>[k,raw[k]])),
  talentBonuses:Object.fromEntries(Object.entries(raw).filter(([k])=>k.startsWith('bonus_'))),
  provenance:'unmodified combat.min.js maj_situation original source fragment'
 };
}
