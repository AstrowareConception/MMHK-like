import test from 'node:test';
import assert from 'node:assert/strict';
import {compareHistoricalEncounter} from './historical-encounter-differential.mjs';
const catalog=[{faction:1,weapon:'I',unitPower:10},
  {faction:1,weapon:'R',unitPower:10},{faction:1,weapon:'C',unitPower:10},
  {faction:2,weapon:'I',unitPower:10},{faction:2,weapon:'R',unitPower:10},
  {faction:2,weapon:'C',unitPower:10}];
const u=(count,weapon='I',unitPower=10)=>({count,weapon,unitPower,goldCost:5});
const slots=(...items)=>Array.from({length:7},(_,i)=>items[i]??null);
const allA=['bonus_harangueur','bonus_aui','bonus_aur','bonus_auc',
 'bonus_tacticien','bonus_commandant_infanterie','bonus_tireur_elite','bonus_ecuyer',
 'bonus_legendary_sovereign_a','bonus_sapeur','bonus_legendary_legwarrior_c',
 'bonus_legendary_ethernalnight_b'];
const allD=['bonus_bon_payeur','bonus_du','bonus_dui','bonus_tacticien_defenseur',
 'bonus_inebranlable','bonus_expert_tirs_barrage','bonus_ecuyer_defenseur',
 'bonus_batisseur_fortifications','bonus_legendary_legwarrior_b'];
function check(input,label){
 const result=compareHistoricalEncounter(input);
 assert.deepEqual(result.differences,[],
  label+': '+JSON.stringify(result.differences.slice(0,12))+
   ' scenario='+JSON.stringify(input));
}
test('original duel and permanent losses honor elite heroes in city and region',()=>{
 const attackerHero={faction:1,attaque_modifiee:88,bonus_harangueur:7,
  bonus_tacticien:12,bonus_commandant_infanterie:20,bonus_sapeur:15,
  bonus_massacreur:8,bonus_legendary_legwarrior_b:10};
 const defenderHero={faction:2,defense_modifiee:65,bonus_du:5,
  bonus_tacticien_defenseur:14,bonus_batisseur_fortifications:30,
  bonus_legendary_legwarrior_b:10};
 for(const place of [0,1,2]){
  check({attackers:slots(u(140,'I'),u(120,'C')),
    defenders:slots(u(145,'C'),u(125,'R')),
    unitCatalog:catalog,lossFactor:.3,context:{
      attackerHero,defenderHero,weaponAdvantageFactor:.5,
      fortification:{place,city:25,tears:15,region:20}
    }},'fortification '+place);
 }
});
test('80 deterministic native full battles with heterogeneous hero skills',()=>{
 let seed=20261026;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 const pick=a=>a[Math.floor(random()*a.length)];
 const stats=keys=>Object.fromEntries(keys.map(k=>[k,Math.floor(random()*31)]));
 for(let i=0;i<80;i++){
  const weaponA=pick(['I','R','C']),weaponD=pick(['I','R','C']);
  const context={
   attackerHero:{faction:1,attaque_modifiee:Math.floor(random()*140),
     ...stats(allA)},
   defenderHero:{faction:2,defense_modifiee:Math.floor(random()*140),
     ...stats(allD)},
   weaponAdvantageFactor:.5,
   fortification:{place:pick([0,1,2]),city:pick([0,16,35,56]),
     region:pick([0,5,15]),tears:pick([0,16,24])}
  };
  const input={attackers:slots(u(110+Math.floor(random()*120),weaponA),
      u(100+Math.floor(random()*100),pick(['I','R','C']))),
    defenders:slots(u(110+Math.floor(random()*120),weaponD),
      u(100+Math.floor(random()*100),pick(['I','R','C']))),
    context,unitCatalog:catalog,lossFactor:.3};
  check(input,'hero-seed '+i);
 }
});
