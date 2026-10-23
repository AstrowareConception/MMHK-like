import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateBattleWithLossReport} from './report.mjs';
const s=(count,weapon='I',unitPower=10)=>({count,weapon,unitPower,goldCost:5,rareCosts:{crystal:2}});
const army=(...items)=>Array.from({length:7},(_,i)=>items[i]??null);
const run=(att,def,rest={})=>simulateBattleWithLossReport({attackers:att,defenders:def,lossPolicy:{lossFactor:.25},...rest});
test('reports temporary and permanent deaths separately',()=>{
 const r=run(army(s(100)),army(s(50)));
 assert.equal(r.verdict,'attacker');
 assert.equal(r.permanent.attacker.reports[0].rawPermanent,12);
 assert.equal(r.permanent.defender.reports[0].rawPermanent,12);
 assert.equal(r.permanent.attacker.totals.goldLost,60);
});
test('prebattle deaths included even without melee',()=>{
 const r=run(army(s(20,'R',100)),army(s(15,'I',100)),{attackerSalvos:[{kind:'R',percent:100}]});
 assert.equal(r.melee,null);
 assert.equal(r.permanent.defender.reports[0].rawPermanent,3);
 assert.equal(r.permanent.attacker.reports[0].permanent,0);
});
test('raise dead and resurrection reduce permanent losses',()=>{
 const r=simulateBattleWithLossReport({attackers:army(s(100)),defenders:army(s(50)),
 lossPolicy:{lossFactor:.25,attacker:{raiseDeadRate:.25,resurrectionPower:40}}});
 const p=r.permanent.attacker.reports[0];
 assert.equal(p.rawPermanent,12);assert.equal(p.raised,3);assert.equal(p.resurrected,4);assert.equal(p.permanent,5);
});
test('two phases cannot count opening losses twice',()=>{
 const r=run(army(s(20,'R',100)),army(s(30,'I',100)),{attackerSalvos:[{kind:'R',percent:50}]});
 assert.equal(r.permanent.defender.reports[0].permanent,7);
});
test('inputs remain immutable',()=>{
 const a=army(s(100)),d=army(s(50));run(a,d);
 assert.equal(a[0].count,100);assert.equal(d[0].count,50);
});
test('missing loss factor fails closed',()=>{
 assert.throws(()=>simulateBattleWithLossReport({attackers:army(s(5)),defenders:army(s(5))}),/lossFactor/);
});
test('non-supported spell phase is rejected',()=>{
 assert.throws(()=>run(army(s(5)),army(s(5)),{context:{spells:true}}),/Unsupported/);
});
