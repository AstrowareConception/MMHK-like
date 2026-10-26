import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateBattleWithDerivedHeroes} from './hero-combat-battle.mjs';
import {simulateUnifiedBattle} from './unified-battle.mjs';
const slots=n=>[{count:n,weapon:'I',unitPower:10,goldCost:5},
 null,null,null,null,null,null];
const profiles={
 attacker:{faction:1,archetype:0,level:30,heritage:{heros_superieur:2}},
 defender:{faction:2,archetype:0,level:30,heritage:{revelation_de_caracteristiques:3}}
};
const ctx={weaponAdvantageFactor:0.5};
const losses={lossFactor:0.3,source:'JACTARI_REFERENCE_NON_S2'};
const base={attackers:slots(100),defenders:slots(80),heroProfiles:profiles,
 context:ctx,lossPolicy:losses};
const magic={catalog:[{school:3,circle:1,type:0,target:4,unit:7,
 power:1,factors:{I:1,R:1,C:1}}],attacker:{},defender:{}};
test('derived hero profiles participate in real ordered combat, identical to explicit snapshot',()=>{
 const r=simulateBattleWithDerivedHeroes(base);
 const manual=simulateUnifiedBattle({
  attackers:base.attackers,defenders:base.defenders,
  context:{...ctx,attackerHero:r.heroSnapshots.attacker.hero,
    defenderHero:r.heroSnapshots.defender.hero},
  lossPolicy:losses
 });
 assert.deepEqual(r.persistentArmies,manual.persistentArmies);
 assert.deepEqual(r.events.filter(x=>x.phase==='duel').map(x=>x.duel),
  manual.events.filter(x=>x.phase==='duel').map(x=>x.duel));
 assert.equal(r.heroSnapshots.attacker.hero.attaque_modifiee,
  manual.heroes.attacker.attaque_modifiee);
});
test('profile-generated magic power is applied on the correct round',()=>{
 const r=simulateBattleWithDerivedHeroes({...base,
  attackerSpells:{1:{id:0}},spellContext:magic});
 const power=r.events.find(x=>x.phase==='spell-power');
 assert.equal(power.side,'attacker');
 assert.equal(power.power,r.heroSnapshots.attacker.hero.magie);
 assert.ok(r.events.some(x=>x.phase==='duel'));
});
test('each side gets its own original combat hero preparation',()=>{
 const r=simulateBattleWithDerivedHeroes({...base,defenderSpells:{1:{id:0}},
  spellContext:magic});
 assert.equal(r.events.find(x=>x.phase==='spell-power').side,'defender');
 assert.equal(r.events.find(x=>x.phase==='spell-power').power,
  r.heroSnapshots.defender.hero.magie);
});
test('forged precomputed battle hero attributes and overridden inventory rejected',()=>{
 assert.throws(()=>simulateBattleWithDerivedHeroes({...base,
  heroProfiles:{...profiles,attacker:{...profiles.attacker,attaque_modifiee:999}}}),/computed hero attribute/);
 assert.throws(()=>simulateBattleWithDerivedHeroes({...base,
  context:{...ctx,attackerHero:{attaque_modifiee:999}}}),/cannot override/);
 assert.throws(()=>simulateBattleWithDerivedHeroes({...base,
  attackerSpells:{1:{id:0}},spellContext:{...magic,
   attacker:{artifactIds:Array(8).fill(0)}}}),/inventory always comes from hero profiles/);
});
test('hero snapshots and persisted incoming profiles remain immutable',()=>{
 const input={...base,attackerSpells:{1:{id:0}},spellContext:magic};
 const before=structuredClone(input);
 simulateBattleWithDerivedHeroes(input);
 assert.deepEqual(input,before);
});
test('missing hero profile is refused before a battle is resolved',()=>{
 assert.throws(()=>simulateBattleWithDerivedHeroes({...base,
  heroProfiles:{attacker:profiles.attacker}}),/Two server-authorized/);
});
