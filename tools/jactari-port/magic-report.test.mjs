import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateDualMagicBattleReport} from './magic-report.mjs';
const s=(count,weapon='I')=>({count,unitPower:10,weapon,goldCost:7,rareCosts:{crystal:2}});
const army=(...x)=>Array.from({length:7},(_,i)=>x[i]??null);
const report=(a,d,spells={},policy={})=>simulateDualMagicBattleReport({
 attackers:a,defenders:d,...spells,lossPolicy:{lossFactor:.25,...policy}
});
test('magic and melee are counted exactly once in final casualties',()=>{
 const r=report(army(s(100)),army(s(80)),{attackerSpells:{1:{type:0,target:4,unit:7,power:100}}});
 const d=r.encounter.defender[0],p=r.permanent.defender.reports[0];
 assert.equal(d.magicLosses,10);assert.equal(d.roundLosses,70);
 assert.equal(p.rawPermanent,20);assert.equal(p.goldLost,140);
});
test('raise dead and shared resurrection reduce permanent deaths',()=>{
 const r=report(army(s(100)),army(s(70),s(10)),{}, {defender:{raiseDeadRate:.25,resurrectionPower:20}});
 const sum=r.permanent.defender.reports.filter(Boolean);
 assert.ok(sum.reduce((n,x)=>n+x.permanent,0)<=sum.reduce((n,x)=>n+x.rawPermanent,0));
 assert.ok(sum.every(x=>x.permanent>=0));
});
test('defender magic appears in attacker loss report',()=>{
 const r=report(army(s(100)),army(s(90)),{defenderSpells:{1:{type:0,target:4,unit:7,power:300}}});
 assert.equal(r.encounter.attacker[0].magicLosses,30);
 assert.ok(r.permanent.attacker.reports[0].rawPermanent>=7);
});
test('missing loss coefficient rejected',()=>assert.throws(()=>simulateDualMagicBattleReport({
 attackers:army(s(5)),defenders:army(s(10))}),/lossFactor/));
test('deterministic report without modifying caller armies',()=>{
 const a=army(s(100)),d=army(s(30)),spells={attackerSpells:{1:{type:4,target:5,unit:3,power:20}}};
 assert.deepEqual(report(a,d,spells),report(a,d,spells));assert.equal(a[0].count,100);
});
