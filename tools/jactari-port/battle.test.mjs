import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateSupportedBattle} from './battle.mjs';
const s=(count,weapon='I',unitPower=10)=>({count,weapon,unitPower});
const army=(...x)=>Array.from({length:7},(_,i)=>x[i]??null);
test('salvo kills defenders before melee',()=>{
 const r=simulateSupportedBattle({attackers:army(s(20,'R',100)),defenders:army(s(15,'I',100)),
 attackerSalvos:[{kind:'R',percent:100}]});
 assert.equal(r.prebattle.defender.killed[0],15);assert.equal(r.melee,null);assert.equal(r.verdict,'attacker');
});
test('simultaneous ranged fire may eliminate both armies',()=>{
 const r=simulateSupportedBattle({attackers:army(s(10,'R',100)),defenders:army(s(10,'R',100)),
 attackerSalvos:[{kind:'R',percent:100}],defenderSalvos:[{kind:'R',percent:100}]});
 assert.equal(r.verdict,'mutual-dispersion');assert.equal(r.melee,null);
});
test('with no ranged attacks resolves ordered melee',()=>{
 const r=simulateSupportedBattle({attackers:army(s(100)),defenders:army(s(10),s(10))});
 assert.equal(r.verdict,'attacker');assert.equal(r.melee.rounds,2);
});
test('original army data remains unchanged',()=>{
 const attackers=army(s(20,'R',100)),defenders=army(s(5,'I',100));
 simulateSupportedBattle({attackers,defenders,attackerSalvos:[{kind:'R'}]});
 assert.equal(attackers[0].count,20);assert.equal(defenders[0].count,5);
});
test('unsupported spell phases fail closed',()=>assert.throws(()=>simulateSupportedBattle({
 attackers:army(s(1)),defenders:army(s(1)),context:{magic:true}}),/Unsupported/));
test('cannot silently use unknown attack category',()=>assert.throws(()=>simulateSupportedBattle({
 attackers:army(s(1)),defenders:army(s(1)),attackerSalvos:[{kind:'???'}]}),RangeError));
