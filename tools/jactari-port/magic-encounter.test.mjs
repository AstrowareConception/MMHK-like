import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateAttackerMagicEncounter} from './magic-encounter.mjs';
const s=(count,weapon='I',unitPower=10)=>({count,weapon,unitPower});
const army=(...a)=>Array.from({length:7},(_,i)=>a[i]??null);
const run=(a,d,spellsByRound={})=>simulateAttackerMagicEncounter({attackers:a,defenders:d,spellsByRound});
test('damage lands before duel',()=>{
 const r=run(army(s(100)),army(s(80)),{1:{type:0,target:4,unit:7,power:100}});
 assert.equal(r.events[0].phase,'spell');assert.equal(r.events[0].casualties,10);
 assert.equal(r.events[1].duel.basePower.defender,700);assert.equal(r.defender[0].magicLosses,10);
});
test('spell may eliminate opposing stack before any duel',()=>{
 const r=run(army(s(100)),army(s(10)),{1:{type:0,target:4,unit:7,power:100}});
 assert.equal(r.status,'attacker');assert.equal(r.events.filter(e=>e.phase==='duel').length,0);
});
test('buff increases current stack power before duel',()=>{
 const r=run(army(s(100)),army(s(80)),{1:{type:4,target:5,unit:3,power:20}});
 assert.equal(r.attacker[0].bonusTroops,20);assert.equal(r.events[1].duel.basePower.attacker,1200);
});
test('spell after first duel targets next defender',()=>{
 const r=run(army(s(100)),army(s(10),s(20)),{2:{type:0,target:4,unit:7,power:50}});
 assert.equal(r.events.find(e=>e.phase==='spell').targetSlot,2);
});
test('unsupported effect is refused before battle',()=>assert.throws(()=>run(army(s(20)),army(s(20)),{1:{type:2,target:3,unit:7,power:20}}),/Unsupported spell/));
test('unreachable scheduled spell fails closed',()=>assert.throws(()=>run(army(s(100)),army(s(10)),{3:{type:0,target:4,unit:7,power:10}}),/Unreachable/));
test('inputs are not mutated',()=>{
 const a=army(s(100)),d=army(s(50));run(a,d,{1:{type:4,target:5,unit:3,power:10}});
 assert.equal(a[0].count,100);assert.equal(d[0].count,50);
});
test('deterministic replay',()=>{
 const a=army(s(100)),d=army(s(80)),spells={1:{type:0,target:4,unit:7,power:100}};
 assert.deepEqual(run(a,d,spells),run(a,d,spells));
});
