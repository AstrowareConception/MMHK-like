import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateSummonedMeleeEncounter,simulateSummonedBattleReport} from './summoned-battle.mjs';
const s=(count,weapon='I',unitPower=10)=>({count,weapon,unitPower,goldCost:4});
const army=(...slots)=>Array.from({length:7},(_,i)=>slots[i]??null);
const catalog=[{faction:1,weapon:'I',unitPower:10},{faction:1,weapon:'R',unitPower:5},{faction:2,weapon:'I',unitPower:10}];
const summon=(power=200,target=0,unit=0,casterFaction=1)=>({type:1,target,unit,power,casterFaction});
const run=(attackers=army(s(100)),defenders=army(s(50)),extra={})=>simulateSummonedMeleeEncounter({attackers,defenders,unitCatalog:catalog,...extra});
test('summon enters special slot 1 and fights on same turn, before ordinary slot 2',()=>{
 const r=run(undefined,undefined,{attackerSummons:{1:summon()}});
 assert.equal(r.events[0].phase,'summon');assert.equal(r.events[0].slot,1);
 assert.equal(r.events[1].phase,'duel');assert.equal(r.events[1].attackerSlot,1);
 assert.equal(r.specialAtEnd.attacker[1].temporary,true);
});
test('two summons use slot 1 then slot 0, index 0 has priority',()=>{
 const r=run(army(s(1000)),army(s(1000)),{attackerSummons:{1:summon(),2:summon(250)}});
 assert.deepEqual(r.events.filter(e=>e.phase==='summon').map(e=>e.slot),[1,0]);
 assert.equal(r.events.find(e=>e.turn===2&&e.phase==='duel').attackerSlot,0);
});
test('defender can summon and participate immediately',()=>{
 const r=run(undefined,undefined,{defenderSummons:{1:summon(150,0,0,2)}});
 assert.equal(r.events[0].side,'defender');assert.equal(r.events[1].defenderSlot,1);
});
test('percentage summon uses initial 7 regular enemy stacks and no existing summons',()=>{
 const r=run(army(s(100)),army(s(1000)),{attackerSummons:{1:summon(10,0,4)}});
 assert.equal(r.events[0].count,100);
});
test('summons are absent from persisted armies after fighting',()=>{
 const a=army(s(100)),d=army(s(50));
 const r=simulateSummonedBattleReport({attackers:a,defenders:d,unitCatalog:catalog,
  attackerSummons:{1:summon(200)},lossPolicy:{lossFactor:.25}});
 assert.equal(r.persistentArmies.attacker.length,7);
 assert.equal(r.persistentArmies.attacker[0].count,100-r.permanent.attacker.reports[0].permanent);
 assert.ok(r.discardedSummons.attacker[1].discarded);
 assert.equal(a[0].count,100);assert.equal(d[0].count,50);
});
test('cannot summon a third time when both special slots remain occupied',()=>{
 assert.throws(()=>run(army(s(1000)),army(s(1000)),{attackerSummons:{1:summon(),2:summon(),3:summon()}}),/Both special/);
});
test('unavailable faction/weapon gives explicit no-effect result',()=>{
 const r=run(undefined,undefined,{attackerSummons:{1:summon(500,2,0,1)}});
 assert.equal(r.events[0].phase,'summon-no-effect');
});
test('wrong spell types rejected rather than applied approximately',()=>{
 assert.throws(()=>run(undefined,undefined,{attackerSummons:{1:{type:2,target:8,unit:2,power:50,casterFaction:1}}}),/Unsupported/);
});
test('deterministic replay preserves inputs',()=>{
 const a=army(s(100)),d=army(s(50)),o={attackerSummons:{1:summon()}};
 assert.deepEqual(run(a,d,o),run(a,d,o));assert.equal(a[0].count,100);
});
test('no requested summon still runs ordinary seven-slot melee',()=>{
 const r=run();assert.equal(r.events[0].phase,'duel');assert.equal(r.events[0].attackerSlot,2);assert.equal(r.status,'attacker');
});
test('unreachable summon turn cannot be silently skipped',()=>{
 assert.throws(()=>run(undefined,undefined,{attackerSummons:{3:summon()}}),/Unreachable/);
});
