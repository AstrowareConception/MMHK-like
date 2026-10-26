import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateBonuses} from './bonuses.mjs';
import {runOriginalHeroBonuses} from './historical-bonuses-oracle.mjs';
const weapons=['I','R','C'];
const xorshift=seed=>()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
const keysA=['bonus_harangueur','bonus_aui','bonus_aur','bonus_auc',
  'bonus_legendary_sovereign_a','bonus_tacticien','bonus_commandant_infanterie',
  'bonus_tireur_elite','bonus_ecuyer','bonus_sapeur','bonus_legendary_legwarrior_c',
  'bonus_legendary_ethernalnight_b'];
const keysD=['bonus_bon_payeur','bonus_du','bonus_dui','bonus_tacticien_defenseur',
  'bonus_inebranlable','bonus_expert_tirs_barrage','bonus_ecuyer_defenseur',
  'bonus_batisseur_fortifications'];
function assertMatch(input,marker) {
 const original=runOriginalHeroBonuses(input);
 const adapted=calculateBonuses(input);
 for(const [key,expected] of Object.entries(original.modifiers)) {
  assert.ok(Math.abs(expected-adapted[key])<1e-10,
    marker+' '+key+' historical='+expected+' port='+adapted[key]+
    ' input='+JSON.stringify(input));
 }
}
test('600 original hero/weapon/trap/fortification modifier comparisons',()=>{
 const rnd=xorshift(20261026);
 for(let i=0;i<600;i++){
  const hero=(attack,keys)=>Object.fromEntries([
   [attack?'attaque_modifiee':'defense_modifiee',Math.floor(rnd()*200)],
   ...keys.map(k=>[k,Math.floor(rnd()*31)])
  ]);
  const attackerHero=hero(true,keysA),defenderHero=hero(false,keysD);
  const input={attackerWeapon:weapons[Math.floor(rnd()*3)],
    defenderWeapon:weapons[Math.floor(rnd()*3)],
    attackerHero,defenderHero,
    weaponAdvantageFactor:.5,
    morale:{attacker:Math.floor(rnd()*35),defender:Math.floor(rnd()*35)},
    special:{attackerTraps:Math.floor(rnd()*3),defenderTraps:Math.floor(rnd()*3),trapBonus:5},
    fortification:{place:Math.floor(rnd()*4),city:Math.floor(rnd()*55),
      region:Math.floor(rnd()*55),tears:Math.floor(rnd()*33)}
  };
  assertMatch(input,'case '+i);
 }
});
test('weapon advantage and flat hero strengths verified with actual source',()=>{
 assertMatch({attackerWeapon:'R',defenderWeapon:'I',
  attackerHero:{attaque_modifiee:52,bonus_harangueur:7,bonus_aur:3},
  defenderHero:{defense_modifiee:48,bonus_bon_payeur:5},
  weaponAdvantageFactor:.5},'weapon matchup');
});
test('historic legendary defender predicate reads attacker stat twice (documented regression)',()=>{
 const original=runOriginalHeroBonuses({attackerWeapon:'I',defenderWeapon:'I',
  attackerHero:{attaque_modifiee:0,bonus_legendary_legwarrior_b:10},
  defenderHero:{defense_modifiee:0,bonus_legendary_legwarrior_b:20}});
 assert.equal(original.modifiers.defendStackHero,.4);
});
test('historic legendary property absent on defender leads to NaN (known upstream anomaly)',()=>{
 const original=runOriginalHeroBonuses({attackerWeapon:'I',defenderWeapon:'I',
  attackerHero:{attaque_modifiee:0,bonus_legendary_legwarrior_b:10},
  defenderHero:{defense_modifiee:0}});
 assert.equal(Number.isNaN(original.modifiers.defendStackHero),true);
});
