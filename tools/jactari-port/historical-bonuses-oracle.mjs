/**
 * ORIGINAL Jactari bonus_attaque_defense() run in a VM, for CI comparisons.
 * The actual historical function body is not edited or copied into the adapter.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 * This VM is for reviewed checked-in source, never arbitrary client code.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const source=fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../../data/Jactari/src/scripts/combat.min.js'),'utf8');
function extract(name){
  const start=source.indexOf('function '+name+'(');
  if(start<0)throw new Error('Missing Jactari function: '+name);
  const open=source.indexOf('{',start);
  let depth=0;
  for(let i=open;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw new Error('Malformed upstream Jactari function');
}
const original=extract('bonus_attaque_defense');
const keyMap={
  attaque_unites_heros:'attackUnitsHero',
  attaque_peloton_heros:'attackStackHero',
  attaque_peloton_arme:'attackWeapon',
  attaque_peloton_special:'attackSpecial',
  defense_unites_heros:'defendUnitsHero',
  defense_peloton_heros:'defendStackHero',
  defense_peloton_arme:'defendWeapon',
  defense_peloton_special:'defendSpecial',
  defense_peloton_fortifications:'defendFortification'
};
/** Independent historic test oracle. Preserves original anomalies, including NaN. */
export function runOriginalHeroBonuses({attackerWeapon,defenderWeapon,
  attackerHero=null,defenderHero=null,morale={},special={},
  weaponAdvantageFactor=0.5,fortification={}}){
  const env={
    liste_heros:{...attackerHero&&{0:structuredClone(attackerHero)},
      ...defenderHero&&{1:structuredClone(defenderHero)}},
    moral_eleve:{
      ...morale.attacker!==undefined&&{attaquant:morale.attacker},
      ...morale.defender!==undefined&&{defenseur:morale.defender}
    },
    competences_speciales:{attaquant:{pieges:special.attackerTraps??0},
      defenseur:{pieges:special.defenderTraps??0}},
    _competences_speciales:{pieges:{bonus:special.trapBonus??0}},
    _facteur_bonus:weaponAdvantageFactor,
    lieu:fortification.place??0,
    bonus_defense_cite:fortification.city??0,
    bonus_defense_region:fortification.region??0,
    bonus_larmes_defense:fortification.tears??0,
    avertissement:()=>{},
    _traduction:new Proxy({}, {get:()=>['notice X']}),
    _langue:0,
    bonus_arme:0
  };
  vm.createContext(env,{name:'jactari-vendor-hero-bonus'});
  vm.runInContext(original,env,{timeout:1000});
  const a=attackerHero?0:null,d=defenderHero?1:null;
  env.inputA=attackerWeapon;env.inputD=defenderWeapon;
  env.originalA=a;env.originalD=d;
  vm.runInContext('result=bonus_attaque_defense(originalA,originalD,inputA,inputD);',
    env,{timeout:1000});
  return {modifiers:Object.fromEntries(Object.entries(keyMap).map(([old,key])=>
    [key,env.result[old]])),weaponAdvantage:env.bonus_arme,
    provenance:'unmodified vendor bonus_attaque_defense; exact raw JavaScript semantics'};
}
