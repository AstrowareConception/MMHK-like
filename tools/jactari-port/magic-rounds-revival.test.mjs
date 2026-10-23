import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateDualMagicEncounter} from './magic-rounds.mjs';
import {simulateDualMagicBattleReport} from './magic-report.mjs';
const stack=count=>({count,unitPower:10,weapon:'I',goldCost:5});
const army=(...s)=>Array.from({length:7},(_,i)=>s[i]??null);
const spell=(mode,power)=>({type:2,target:mode==='tmp'?8:9,unit:2,power});
const fight=(a,d,other={})=>simulateDualMagicEncounter({attackers:army(stack(a)),defenders:army(stack(d)),...other});
test('temporary revival is after duel and accounts for raised units',()=>{
 const r=fight(100,50,{attackerSpells:{1:spell('tmp',50)}});
 assert.deepEqual(r.events.map(e=>e.phase),['spell','duel','revival']);
 assert.equal(r.events[2].revived,25);
 assert.equal(r.attacker[0].roundLosses,50);
 assert.equal(r.attacker[0].raisedDuringBattle,25);
 assert.equal(r.attacker[0].remaining,75);
});
test('definitive revival subtracts recorded round losses',()=>{
 const r=fight(100,50,{attackerSpells:{1:spell('def',50)}});
 assert.equal(r.events[2].revived,25);
 assert.equal(r.attacker[0].roundLosses,25);
 assert.equal(r.attacker[0].raisedDuringBattle,0);
});
test('defender can revive after the same duel',()=>{
 const r=fight(50,100,{defenderSpells:{1:spell('def',50)}});
 assert.equal(r.events[2].side,'defender');
 assert.equal(r.defender[0].remaining,75);
 assert.equal(r.defender[0].roundLosses,25);
});
test('dispersed stack with no survivors cannot be revived',()=>{
 const r=fight(10,100,{attackerSpells:{1:spell('tmp',100)}});
 assert.equal(r.events[2].revived,0);
 assert.equal(r.attacker[0].remaining,0);
});
test('revival capped by original count at start of turn',()=>{
 const r=fight(100,80,{attackerSpells:{1:spell('def',10000)}});
 assert.ok(r.attacker[0].remaining<=100);
});
test('temporary resurrection changes final loss conversion exactly once',()=>{
 const attackers=army(stack(100));
 const r=simulateDualMagicBattleReport({attackers,defenders:army(stack(50)),
  attackerSpells:{1:spell('tmp',50)},lossPolicy:{lossFactor:.25,source:'fixture-not-S2'}});
 assert.equal(r.permanent.attacker.reports[0].rawPermanent,6);
 assert.equal(r.permanent.defender.reports[0].rawPermanent,12);
 assert.equal(attackers[0].count,100);
});
test('definitive resurrection reduces final deaths before the final ratio',()=>{
 const r=simulateDualMagicBattleReport({attackers:army(stack(100)),defenders:army(stack(50)),
  attackerSpells:{1:spell('def',50)},lossPolicy:{lossFactor:.25}});
 assert.equal(r.permanent.attacker.reports[0].rawPermanent,6);
});
test('invalid spell resurrection signature rejected',()=>{
 assert.throws(()=>fight(100,50,{attackerSpells:{1:{type:2,target:8,unit:1,power:10}}}),/Unsupported/);
 assert.throws(()=>fight(100,50,{attackerSpells:{1:{type:2,target:7,unit:2,power:10}}}),/Unsupported/);
});

test('persistent army excludes temporary resurrection and recovers dispersed troops',()=>{
 const r=simulateDualMagicBattleReport({attackers:army(stack(100)),defenders:army(stack(50)),
  attackerSpells:{1:spell('tmp',50)},lossPolicy:{lossFactor:.25}});
 assert.equal(r.encounter.attacker[0].remaining,75);
 assert.equal(r.persistentArmies.attacker[0].count,94);
 assert.equal(r.persistentArmies.defender[0].count,38);
});
test('persistent survivors come from initial garrison minus permanent dead',()=>{
 const r=simulateDualMagicBattleReport({attackers:army(stack(100)),defenders:army(stack(50)),
  lossPolicy:{lossFactor:.25}});
 assert.equal(r.persistentArmies.attacker[0].count,88);
 assert.equal(r.persistentArmies.attacker[0].weapon,'I');
});
