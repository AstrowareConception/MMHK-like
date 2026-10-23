import test from 'node:test';
import assert from 'node:assert/strict';
import {casualtyModifier,finalizePermanentLosses} from './losses.mjs';
const a=(...slots)=>Array.from({length:7},(_,i)=>slots[i]??null);
const s=(n,p,round,other={})=>({count:n,unitPower:p,roundLosses:round,...other});
const final=(slots,options={})=>finalizePermanentLosses({slots,lossFactor:.25,...options});
test('round casualties convert at historic floor',()=>{
 const r=final(a(s(100,10,31)));assert.equal(r.reports[0].permanent,7);
});
test('small positive loss rounds to one',()=>{
 const r=final(a(s(10,10,1)));assert.equal(r.reports[0].permanent,1);
});
test('negative modified losses clamp to zero',()=>{
 const r=final(a(s(10,10,3)),{modifier:-2});assert.equal(r.reports[0].permanent,0);
});
test('player bonus casualties and battlefield raises are excluded',()=>{
 const r=final(a(s(100,10,40,{magicLosses:8,bonusLost:5,raisedDuringBattle:3})));
 assert.equal(r.reports[0].permanent,10);
});
test('raise dead then shared resurrection budget',()=>{
 const r=final(a(s(100,10,80),s(100,20,80)),{raiseDeadRate:.2,resurrectionPower:160});
 assert.deepEqual(r.reports.slice(0,2).map(v=>[v.raised,v.resurrected,v.permanent]),[[4,16,0],[4,0,16]]);
});
test('resurrection cannot exceed actual losses',()=>{
 const r=final(a(s(10,10,10)),{resurrectionPower:1000});
 assert.equal(r.reports[0].permanent,0);assert.equal(r.unspentResurrectionPower,980);
});
test('gold and rare costs use final permanent count',()=>{
 const r=final(a(s(100,10,40,{goldCost:50,rareCosts:{crystal:2}})));
 assert.equal(r.totals.goldLost,500);assert.equal(r.reports[0].rareLost.crystal,20);
});
test('hero-free NPC winner loses nothing, loser everything',()=>{
 const r=final(a(s(20,10,0)),{playerControlled:false,hasHero:false,side:'attacker',battleOutcome:'defender'});
 assert.equal(r.reports[0].permanent,20);
});
test('NPC defender with attrition uses battlefield losses',()=>{
 const r=final(a(s(20,10,8,{npcAttrition:true})),{playerControlled:false,hasHero:false,side:'defender',battleOutcome:'attacker'});
 assert.equal(r.reports[0].permanent,2);
});
test('source skill modifier sums correctly',()=>{
 assert.ok(Math.abs(casualtyModifier({ownHero:{bonus_logisticien:10},enemyHero:{bonus_massacreur:15},side:'defender',tearsLossBonus:5})-.10)<1e-12);
});
test('reject non-seven slot input',()=>assert.throws(()=>final([s(10,10,2)]),RangeError));
test('do not modify source slots',()=>{
 const src=a(s(100,10,40));final(src,{resurrectionPower:100});assert.equal(src[0].roundLosses,40);
});
