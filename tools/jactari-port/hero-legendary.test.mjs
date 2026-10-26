import test from 'node:test';
import assert from 'node:assert/strict';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {listJactariLegendaryClasses,deriveJactariLegendaryTalents} from './hero-legendary.mjs';
import {deriveJactariCombatHeroSnapshot} from './hero-combat-snapshot.mjs';
import {runOriginalCombatHeroSnapshot} from './historical-combat-hero-oracle.mjs';
import {calculateEffectiveSpellPower} from './spell-power.mjs';
import {runOriginalSpellPower} from './historical-spell-power-oracle.mjs';
import {simulateBattleWithDerivedHeroes} from './hero-combat-battle.mjs';

const tables=getJactariHeroTables();
const classes=listJactariLegendaryClasses(tables);
const profile=(faction=1)=>({faction,archetype:0,level:40});
const zeros=()=>[null,null,null,null,null,null,null];
const stack=count=>[{count,unitPower:10,weapon:'I',goldCost:1},...zeros().slice(1)];
const policy=(talent,rank)=>({[talent]:rank});
const similar=(x,y)=>Math.abs(x-y)<=1e-10*Math.max(1,Math.abs(x),Math.abs(y));

test('exact historic legendary combat selector catalog has eight classes, 24 three-level talents',()=>{
 assert.equal(classes.length,8);
 assert.deepEqual(classes.map(x=>x.careerId),[13,14,15,16,17,18,19,20]);
 for(const cl of classes){
  assert.equal(cl.talents.length,3);
  assert.ok(cl.title.length>0);
  for(const t of cl.talents){
   assert.match(t.name,/^legendary_/);
   assert.equal(t.values.length,4);
   assert.equal(t.values[0],0);
  }
 }
 const names=classes.flatMap(x=>x.talents.map(t=>t.name));
 assert.equal(new Set(names).size,24);
});
test('144 original versus port combat hero preparations: 24 legends × 3 ranks × two sides',()=>{
 let checks=0;
 for(const cl of classes)for(const talent of cl.talents)for(const rank of [1,2,3])
  for(const side of ['attacker','defender']){
   const choice={careerId:cl.careerId,talentIndex:talent.talentIndex,rank};
   const original=runOriginalCombatHeroSnapshot({
    profile:profile(),side,talentSelections:[choice]
   });
   const result=deriveJactariCombatHeroSnapshot({
    profile:profile(),side,legendarySelections:[choice]
   });
   assert.equal(result.hero['niveau_'+talent.name],rank);
   assert.equal(result.hero['bonus_'+talent.name],talent.values[rank]);
   for(const [name,value] of Object.entries(original.talentBonuses))
    assert.ok(similar(result.hero[name],value),
     cl.careerId+':'+talent.talentIndex+' rank='+rank+' '+side+' '+name+
     ' historical='+value+' port='+result.hero[name]);
   for(const [key,value] of Object.entries(original.stats))
    assert.ok(similar(result.hero[key],value),
     'combat modified stat '+key+' for '+talent.name+' '+side+' rank '+rank);
   checks++;
  }
 assert.equal(checks,144);
});
test('legendary spell expertise reaches real original puissance_effective_sort',()=>{
 const cases=[{name:'legendary_dragonkinght_b',school:3},
  {name:'legendary_kingundead_b',school:0},
  {name:'legendary_legmagician_b',school:2},
  {name:'legendary_ethernalnight_c',school:1}];
 for(const {name,school} of cases){
  const cl=classes.find(c=>c.talents.some(t=>t.name===name));
  const t=cl.talents.find(x=>x.name===name);
  const selection={careerId:cl.careerId,talentIndex:t.talentIndex,rank:3};
  const hero=deriveJactariCombatHeroSnapshot({
   profile:profile(),side:'attacker',legendarySelections:[selection]
  }).hero;
  const spell={school,unit:1,circle:1,type:0,target:4,power:10,
   factors:{I:1,R:1,C:1}};
  const request={spell,side:'attacker',attackerWeapon:'I',defenderWeapon:'I',hero};
  const historic=runOriginalSpellPower(request);
  const adapted=calculateEffectiveSpellPower(request);
  assert.ok(similar(historic.power,adapted.power),name);
  const blankHero=deriveJactariCombatHeroSnapshot({profile:profile(),side:'attacker'}).hero;
  assert.ok(adapted.power>calculateEffectiveSpellPower({...request,hero:blankHero}).power,
    name+' should contribute positively');
 }
});
test('explicit authoritative grants reject forged legendary rank and unknown ID',()=>{
 const selection={careerId:20,talentIndex:1,rank:3};
 const name=classes.at(-1).talents[1].name;
 assert.throws(()=>deriveJactariLegendaryTalents({selections:[selection],
  policy:'server-entitlement'}),/ledger required/);
 assert.throws(()=>deriveJactariLegendaryTalents({selections:[selection],
  policy:'server-entitlement',entitlements:policy(name,2)}),/not granted/);
 assert.equal(deriveJactariLegendaryTalents({selections:[selection],
  policy:'server-entitlement',entitlements:policy(name,3)}).selected[name],3);
 assert.throws(()=>deriveJactariLegendaryTalents({selections:[
  {careerId:12,talentIndex:0,rank:1}]}),/Unknown legendary/);
 assert.throws(()=>deriveJactariLegendaryTalents({selections:[{
  ...selection,bonus:999}]}),/only original IDs/);
 assert.throws(()=>deriveJactariLegendaryTalents({selections:[selection,selection]}),/Duplicate/);
});
test('hero battle adapter uses entitlement ranks and forbids unsanctioned legendary values',()=>{
 const cl=classes.find(x=>x.talents.some(t=>t.name==='legendary_dragonkinght_c'));
 const skill=cl.talents.find(t=>t.name==='legendary_dragonkinght_c');
 const grant={careerId:cl.careerId,talentIndex:skill.talentIndex,rank:3};
 const input={attackers:stack(110),defenders:stack(95),
  heroProfiles:{attacker:profile(),defender:profile(2)},
  heroLegendaries:{attacker:[grant],defender:[]},
  heroLegendaryGrants:{attacker:policy(skill.name,3),defender:{}},
  lossPolicy:{lossFactor:.3,source:'reference-bounded'}};
 const battle=simulateBattleWithDerivedHeroes(input);
 const neutral=simulateBattleWithDerivedHeroes({
  ...input,heroLegendaries:{attacker:[],defender:[]}
 });
 assert.equal(battle.heroSnapshots.attacker.hero['bonus_'+skill.name],skill.values[3]);
 assert.ok(battle.heroSnapshots.attacker.hero.attaque_modifiee >
  neutral.heroSnapshots.attacker.hero.attaque_modifiee);
 assert.ok(battle.events.some(e=>e.phase==='duel'));
 assert.throws(()=>simulateBattleWithDerivedHeroes({
  ...input,heroLegendaryGrants:{attacker:policy(skill.name,2),defender:{}}
 }),/not granted/);
 assert.throws(()=>simulateBattleWithDerivedHeroes({
  ...input,heroLegendaryGrants:null
 }),/grant ledger required/);
 assert.throws(()=>simulateBattleWithDerivedHeroes({
  ...input,heroLegendaries:null,heroLegendaryGrants:null,
  heroTalents:{attacker:[grant]}
 }),/Legendary ranks require explicit server grants/);
});
