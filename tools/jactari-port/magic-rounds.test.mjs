import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateDualMagicEncounter} from './magic-rounds.mjs';
const s=(count,weapon='I',unitPower=10)=>({count,weapon,unitPower});
const army=(...x)=>Array.from({length:7},(_,i)=>x[i]??null);
const play=(attackers,defenders,more={})=>simulateDualMagicEncounter({attackers,defenders,...more});
test('attacker damage precedes melee',()=>{
 const r=play(army(s(100)),army(s(80)),{attackerSpells:{1:{type:0,target:4,unit:7,power:100}}});
 assert.equal(r.events[0].casualties,10);assert.equal(r.events[1].duel.basePower.defender,700);assert.equal(r.defender[0].magicLosses,10);
});
test('defender targeted spell precedes melee',()=>{
 const r=play(army(s(100)),army(s(80)),{defenderSpells:{1:{type:0,target:4,unit:7,power:250}}});
 assert.equal(r.events[0].side,'defender');assert.equal(r.events[0].casualties,25);assert.equal(r.events[1].duel.basePower.attacker,750);
});
test('attacker then defender casts, both before duel',()=>{
 const spell={type:0,target:4,unit:7,power:1000};
 const r=play(army(s(10)),army(s(10)),{attackerSpells:{1:spell},defenderSpells:{1:spell}});
 assert.deepEqual(r.events.map(e=>e.side),['attacker','defender']);assert.equal(r.status,'mutual-dispersion');assert.equal(r.rounds,0);
});
test('defender buff target 6',()=>{
 const r=play(army(s(100)),army(s(80)),{defenderSpells:{1:{type:4,target:6,unit:3,power:50}}});
 assert.equal(r.defender[0].bonusTroops,40);assert.equal(r.events[1].duel.basePower.defender,1200);
});
test('attacker buff target 5',()=>{
 const r=play(army(s(100)),army(s(80)),{attackerSpells:{1:{type:4,target:5,unit:1,power:5}}});
 assert.equal(r.attacker[0].bonusTroops,50);assert.equal(r.events[1].duel.basePower.attacker,1500);
});
test('area spell has distinct power per target weapon',()=>{
 const r=play(army(s(100)),army(s(20,'I'),s(20,'R')),{attackerSpells:{1:{type:0,target:3,unit:3,powerByWeapon:{I:50,R:25}}}});
 assert.deepEqual(r.events[0].hits.map(h=>h.casualties),[10,5]);assert.equal(r.defender[1].magicLosses,5);
});
test('defender area spell damages both attacker slots',()=>{
 const r=play(army(s(30,'I'),s(20,'C')),army(s(100)),{defenderSpells:{1:{type:0,target:3,unit:1,powerByWeapon:{I:3,C:5}}}});
 assert.deepEqual(r.events[0].hits.map(h=>h.casualties),[9,10]);
});
test('attacker debuffs defender hero before duel, input unchanged',()=>{
 const defenderHero={defense_modifiee:40};
 const r=play(army(s(100)),army(s(100)),{context:{defenderHero},attackerSpells:{1:{type:3,target:6,unit:5,power:30}}});
 assert.equal(r.heroes.defender.defense_modifiee,10);assert.equal(r.events[1].modifiers.defendStackHero,.05);assert.equal(defenderHero.defense_modifiee,40);
});
test('defender debuffs attacker hero',()=>{
 const r=play(army(s(100)),army(s(100)),{context:{attackerHero:{attaque_modifiee:40}},defenderSpells:{1:{type:3,target:5,unit:6,power:25}}});
 assert.equal(r.heroes.attacker.attaque_modifiee,30);assert.equal(r.events[1].modifiers.attackStackHero,.15);
});
test('missing target hero is rejected',()=>assert.throws(()=>play(army(s(10)),army(s(10)),{attackerSpells:{1:{type:3,target:6,unit:5,power:5}}}),/Hero target missing/));
test('missing area power factor is rejected',()=>assert.throws(()=>play(army(s(100)),army(s(10,'R')),{attackerSpells:{1:{type:0,target:3,unit:1,powerByWeapon:{I:2}}}}),/Missing pre-resolved/));
test('unsupported spell signature is rejected',()=>assert.throws(()=>play(army(s(10)),army(s(10)),{defenderSpells:{1:{type:9,target:3,unit:1,power:1}}}),/Unsupported/));
test('wrong side buff target is rejected',()=>assert.throws(()=>play(army(s(10)),army(s(10)),{defenderSpells:{1:{type:4,target:5,unit:1,power:1}}}),/Buff target/));
test('unreachable scheduled round cannot be silently ignored',()=>assert.throws(()=>play(army(s(100)),army(s(10)),{defenderSpells:{3:{type:0,target:4,unit:7,power:10}}}),/Unreachable/));
test('replay deterministic and inputs untouched',()=>{
 const a=army(s(100)),d=army(s(50)),opts={attackerSpells:{1:{type:0,target:4,unit:7,power:15}},defenderSpells:{1:{type:4,target:6,unit:3,power:10}}};
 assert.deepEqual(play(a,d,opts),play(a,d,opts));assert.equal(a[0].count,100);assert.equal(d[0].count,50);
});
