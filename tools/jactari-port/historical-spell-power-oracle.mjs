/**
 * Differential TEST ORACLE for original puissance_effective_sort(), executed
 * unchanged from the vendored Jactari script. Synthetic hero/catalog inputs
 * deliberately exclude artifact-slot effects (tested separately in future).
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const scriptFolder=path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data/Jactari/src/scripts');
const source=fs.readFileSync(path.join(scriptFolder,'combat.min.js'),'utf8');
const realArtifacts=fs.readFileSync(path.join(scriptFolder,'donnees.artefacts.min.js'),'utf8');
function extract(name){
 const start=source.indexOf('function '+name+'(');
 if(start<0)throw Error('Historical function not found: '+name);
 const open=source.indexOf('{',start);let n=0;
 for(let i=open;i<source.length;i++){
  if(source[i]==='{')n++;
  else if(source[i]==='}'&&--n===0)return source.slice(start,i+1);
 }
 throw Error('Unclosed historic function '+name);
}
const original=['bonus_magie_artefacts','puissance_effective_sort'].map(extract).join('\n');
const legendary=['bonus_legendary_kingundead_b','bonus_legendary_legmagician_a',
 'bonus_legendary_ethernalnight_c','bonus_legendary_kingundead_a',
 'bonus_legendary_legpaladin_c','bonus_legendary_legmagician_b',
 'bonus_legendary_dragonkinght_b'];
const normalizedHero=hero=>({
 magie:0,bonus_mp:0,bonus_m:0,
 ...Object.fromEntries(Array.from({length:4},(_,i)=>[
  ['bonus_instinct_'+i,0],['bonus_expert_'+i,0]
 ]).flat()),
 ...Object.fromEntries(legendary.map(k=>[k,0])),
 ...hero
});
const values=(rate,level)=>Array.from({length:Math.max(2,level+1)},(_,i)=>i===level?rate:0);
/** Return authentic upstream numeric spell power. No browser or combat globals. */
export function runOriginalSpellPower({spell,side,attackerWeapon,defenderWeapon,hero,
 schoolBonusPercent=0,artifactEfficiencyPercent=0,
 mastery={level:0,bonusPercent:0,maximumCircle:0,wayBonus:0},
 resistance={level:0,bonusPercent:0,wayBonus:0},
 antiMagic={level:0,bonusPercentPerLevel:0},artifactIds=null}){
 if(artifactEfficiencyPercent!==0)throw new Error('Historical spell oracle requires real artifacts: use artifactIds rather than an injected efficiency percentage');
 if(!['attacker','defender'].includes(side))throw new RangeError('Invalid side');
 const a=side==='attacker',key=a?'attaquant':'defenseur',enemy=a?'defenseur':'attaquant';
 const hydrated=normalizedHero(hero);
 if(artifactIds!==null){
   if(!Array.isArray(artifactIds)||!artifactIds.every(Number.isSafeInteger))
     throw new RangeError('Untrusted or invalid original artifact inventory');
   for(let i=0;i<artifactIds.length;i++)hydrated['slot_'+i]=artifactIds[i];
 }
 const array=Array.from({length:4},(_,i)=>i===spell.school?schoolBonusPercent:0);
 const ctx={
  _sorts:[{ecole:spell.school,unite:spell.unit,cercle:spell.circle,
    type:spell.type,puissance:spell.power,facteur:spell.factors,nom:['sort']}],
  liste_heros:{0:hydrated},
  _slots:{},_artefacts:{},_effets:{},_types_effets_magie:{},
  inArray:(arr,item)=>arr.includes(item),
  maxInArrayIndex:o=>Object.keys(o).reduce((k,next)=>
    k===undefined||o[next]>o[k]?next:k,undefined),
  _langue:'fr',detail_sorts:false,
  _traduction:new Proxy({}, {get:()=>['label']}),
  _talents:Array.from({length:10},()=>Array.from({length:4},()=>({nom:['talent']}))),
  _ecoles_magie:Array.from({length:4},()=>({carriere:0,nom:['school']})),
  _competences_hereditaires:{
   maitrise_des_sorts:{voie:'m',nom:['mastery'],
     bonus:{valeur:values(mastery.bonusPercent,mastery.level),
       cercle:values(mastery.maximumCircle,mastery.level)}},
   resistance_magique:{voie:'r',nom:['resistance'],
     bonus:values(resistance.bonusPercent,resistance.level)}
  },
  _competences_speciales:{antimagie:{bonus:antiMagic.bonusPercentPerLevel,nom:['antimagic']}},
  competences_hereditaires:{
   attaquant:{maitrise_des_sorts:a?mastery.level:0,resistance_magique:a?0:resistance.level},
   defenseur:{maitrise_des_sorts:a?0:mastery.level,resistance_magique:a?resistance.level:0}
  },
  competences_speciales:{
   attaquant:{antimagie:a?0:antiMagic.level},
   defenseur:{antimagie:a?antiMagic.level:0}
  },
  bonus_ecole_attaquant:a?array:[0,0,0,0],
  bonus_ecole_defenseur:a?[0,0,0,0]:array,
  classement_voies:{attaquant:0,defenseur:0},
  _classement_voies:[{m:Math.max(0,mastery.wayBonus),r:Math.max(0,resistance.wayBonus)}],
  _multiplicateur_voie:1,
  image_html_arme:()=>'',formate_nombre_tooltip:String,
  formate_nombre:String,
  inputA:attackerWeapon,inputD:defenderWeapon,
  inputSide:a?'a':'d'
 };
 vm.createContext(ctx,{name:'jactari-spell-power-vendor'});
 if(artifactIds!==null){
   vm.runInContext(realArtifacts,ctx,{timeout:3000});
   if(artifactIds.length!==ctx._slots.length)throw new RangeError('Wrong original artifact slot count');
 }
 vm.runInContext(original,ctx,{timeout:1000});
 const result=vm.runInContext('puissance_effective_sort(0,inputSide,0,inputA,inputD)',ctx,{timeout:1000});
 const actualArtifactBonus=artifactIds===null?0:
  vm.runInContext('bonus_magie_artefacts(liste_heros[0],_sorts[0],inputSide===\'a\'?inputA:inputD,inputSide===\'a\'?inputD:inputA).bonus',ctx,{timeout:1000});
 return {power:result?.puissance,actualArtifactBonus,provenance:artifactIds===null?'unmodified Jactari spell power with empty artifact slots':'unmodified Jactari spell power and authentic artifact catalog'};
}
