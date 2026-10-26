import test from 'node:test';
import assert from 'node:assert/strict';
import {resolveHeroSpellAtRound,validateHeroSpellOrders} from './hero-spell-resolution.mjs';
import {simulateUnifiedBattle} from './unified-battle.mjs';
import {historicalArtifactTables} from './historical-artifact-oracle.mjs';
import {runOriginalSpellPower} from './historical-spell-power-oracle.mjs';

const troop=(count,weapon='I',unitPower=10)=>({count,unitPower,weapon,goldCost:5});
const slots=(...stacks)=>Array.from({length:7},(_,i)=>stacks[i]??null);
const heroes={
 attackerHero:{faction:1,attaque_modifiee:0,magie:20},
 defenderHero:{faction:2,defense_modifiee:0,magie:10}
};
const spell=(type,target,unit,power=1,factors={I:1,R:1,C:1})=>({
 school:3,circle:2,type,target,unit,power,factors
});
const catalog=[
 spell(0,4,7),             // targeted damage = caster magic
 spell(0,3,3,2,{I:1,R:1.5,C:.5}), // area with weapon dependent power
 spell(4,5,3,1),         // attacker buff
 spell(0,4,7,1,{I:1.2,R:2,C:1}),
 spell(1,0,0,10)         // summon
];
const spellContext={catalog,attacker:{},defender:{}};
const core={
 attackers:slots(troop(100,'I')),defenders:slots(troop(80,'I')),
 unitCatalog:[{faction:1,weapon:'I',unitPower:10},{faction:2,weapon:'I',unitPower:10}],
 context:heroes,lossPolicy:{lossFactor:.3,source:'synthetic-explicit-test'}
};
const compare=(dynamic,manual)=>{
 assert.deepEqual(dynamic.persistentArmies,manual.persistentArmies);
 assert.equal(dynamic.status,manual.status);
 assert.deepEqual(dynamic.events.filter(e=>e.phase==='duel').map(e=>e.duel),
   manual.events.filter(e=>e.phase==='duel').map(e=>e.duel));
};
test('ID-only attacker spell resolves at casting time and matches explicit-power history',()=>{
 const dynamic=simulateUnifiedBattle({...core,attackerSpells:{1:{id:0}},spellContext});
 const manual=simulateUnifiedBattle({...core,attackerSpells:{1:{type:0,target:4,unit:7,power:20}}});
 compare(dynamic,manual);
 assert.deepEqual(dynamic.events.slice(0,2).map(e=>e.phase),['spell-power','spell']);
 assert.equal(dynamic.events[0].power,20);
});
test('bilateral spells have independently calculated powers and unchanged turn order',()=>{
 const dynamic=simulateUnifiedBattle({...core,attackerSpells:{1:{id:0}},
  defenderSpells:{1:{id:3}},spellContext});
 const manual=simulateUnifiedBattle({...core,
  attackerSpells:{1:{type:0,target:4,unit:7,power:20}},
  defenderSpells:{1:{type:0,target:4,unit:7,power:12}}});
 compare(dynamic,manual);
 assert.deepEqual(dynamic.events.filter(e=>e.phase==='spell-power').map(e=>[e.side,e.power]),
  [['attacker',20],['defender',12]]);
});
test('area damage uses the attacked units weapon at each round, not a single shared power',()=>{
 const both={...core,defenders:slots(troop(80,'I'),troop(60,'R'))};
 const dynamic=simulateUnifiedBattle({...both,attackerSpells:{1:{id:1}},spellContext});
 const manual=simulateUnifiedBattle({...both,attackerSpells:{
  1:{type:0,target:3,unit:3,powerByWeapon:{I:40,R:60,C:20}}
 }});
 compare(dynamic,manual);
 assert.deepEqual(dynamic.events[0].powerByWeapon,{I:40,R:60,C:20});
});
test('attack spells are resolved after summoned units change the active position',()=>{
 const updated={
  ...core,attackers:slots(troop(300)),defenders:slots(troop(400,'I'))
 };
 const dynamic=simulateUnifiedBattle({...updated,attackerSpells:{1:{id:4},2:{id:0}},spellContext});
 const manual=simulateUnifiedBattle({...updated,attackerSpells:{
   1:{type:1,target:0,unit:0,power:200},
   2:{type:0,target:4,unit:7,power:20}
 }});
 compare(dynamic,manual);
 assert.equal(dynamic.events.some(e=>e.phase==='summon'),true);
 assert.equal(dynamic.events.filter(e=>e.phase==='spell-power').length,2);
});
test('caster magic comes from CURRENT trusted hero, not the order',()=>{
 const context={...heroes,attackerHero:{...heroes.attackerHero,magie:40}};
 const result=resolveHeroSpellAtRound({order:{id:0},side:'attacker',
  spellContext,heroes:{attacker:context.attackerHero,defender:context.defenderHero},
  attackerWeapon:'I',defenderWeapon:'I'});
 assert.equal(result.spell.power,40);
 assert.equal(Object.keys(result.spell).includes('id'),false);
});
test('equipped hero power matches the two original magic functions',()=>{
 const artifacts=historicalArtifactTables();
 // Original effect #41 increases magical effect on enemy infantry.
 const gear=Array(artifacts.slotCount).fill(0);
 gear[4]=2; // Real Robe: infantry spell-effect modifier
 const equippedContext={catalog:[{...catalog[0],school:2}],
  attacker:{artifactIds:gear},defender:{},artifactCatalog:artifacts};
 const h={...heroes.attackerHero,magie:25,bonus_mp:20,bonus_m:5,bonus_instinct_2:4,
  bonus_expert_2:15};
 const expected=runOriginalSpellPower({spell:equippedContext.catalog[0],
  side:'attacker',attackerWeapon:'I',defenderWeapon:'I',hero:h,artifactIds:gear});
 const resolved=resolveHeroSpellAtRound({order:{id:0},side:'attacker',
  spellContext:equippedContext,heroes:{attacker:h,defender:heroes.defenderHero},
  attackerWeapon:'I',defenderWeapon:'I'});
 assert.ok(Math.abs(resolved.spell.power-expected.power)<1e-8);
});
test('wrong, forged or duplicate prepared spell signatures are rejected',()=>{
 const check=(spells,config=spellContext)=>()=>validateHeroSpellOrders({
  attackerSpells:spells,spellContext:config
 });
 assert.throws(check({1:{id:0,power:999}}),/only a trusted catalog ID/);
 assert.throws(check({1:{id:999}}),/trusted catalog ID/);
 assert.throws(check({1:{id:0},2:{id:0}}),/Same spell/);
 assert.throws(check({15:{id:0}}),/round/);
 assert.throws(()=>simulateUnifiedBattle({...core,attackerSpells:{1:{id:0}}}),/Incomplete spell/);
});
test('caller-provided catalogs, orders and hero stats remain immutable',()=>{
 const input={...core,attackerSpells:{1:{id:0}},spellContext};
 const before=structuredClone(input);
 simulateUnifiedBattle(input);
 assert.deepEqual(input,before);
});
test('hero characteristic must exist for catalog-powered magic, never use an implicit base',()=>{
 const noMagicHero={...heroes,attackerHero:{faction:1,attaque_modifiee:0}};
 assert.throws(()=>simulateUnifiedBattle({...core,context:noMagicHero,
  attackerSpells:{1:{id:0}},spellContext}),/magic characteristic/);
});
