import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateUnifiedBattle} from './unified-battle.mjs';
const troop=(count,weapon='I',unitPower=10,extra={})=>({count,weapon,unitPower,goldCost:5,rareCosts:{crystal:2},...extra});
const army=(...slots)=>Array.from({length:7},(_,i)=>slots[i]??null);
const catalog=[{faction:1,weapon:'I',unitPower:10},{faction:1,weapon:'R',unitPower:10},
 {faction:2,weapon:'I',unitPower:10},{faction:2,weapon:'R',unitPower:10}];
const ctx={attackerHero:{faction:1,attaque_modifiee:0},defenderHero:{faction:2,defense_modifiee:0}};
const summon=(power=200,target=0,unit=0)=>({type:1,target,unit,power});
const damage=(power=100,unit=7)=>({type:0,target:4,unit,power});
const revive=(mode='tmp',power=50)=>({type:2,target:mode==='tmp'?8:9,unit:2,power});
function run(opts={}){return simulateUnifiedBattle({attackers:army(troop(100)),defenders:army(troop(50)),
 unitCatalog:catalog,context:ctx,lossPolicy:{lossFactor:.25,source:'synthetic-test'},...opts});}
const phases=r=>r.events.map(x=>x.phase);

test('ordinary seven slots retain compatibility with basic combat',()=>{
 const r=run();assert.equal(r.status,'attacker');assert.equal(r.events[0].attackerSlot,2);
 assert.equal(r.persistentArmies.attacker[0].count,88);
});
test('a summoned troop participates in the very first duel at special slot 1',()=>{
 const r=run({attackerSpells:{1:summon()}});
 assert.deepEqual(phases(r).slice(0,2),['summon','duel']);
 assert.equal(r.events[1].attackerSlot,1);
 assert.equal(r.temporarySummons.attacker[1].discarded,true);
 assert.equal(r.persistentArmies.attacker[0].count,100-r.permanent.attacker.reports[0].permanent);
});
test('defender spell sees attacker new summon during SAME round',()=>{
 const r=run({attackerSpells:{1:summon(200)},defenderSpells:{1:damage(50)}});
 const shot=r.events.find(x=>x.kind==='target-damage');
 assert.deepEqual(shot.hits.map(x=>x.slot),[1]);
 assert.equal(shot.hits[0].casualties,5);
});
test('two attacker summons occupy slot 1 then 0',()=>{
 const r=run({attackers:army(troop(1000)),defenders:army(troop(1000)),
  attackerSpells:{1:summon(100),2:summon(500)}});
 assert.deepEqual(r.events.filter(x=>x.phase==='summon').map(x=>x.slot),[1,0]);
 assert.equal(r.events.find(x=>x.phase==='duel'&&x.turn===2).attackerSlot,0);
});
test('defender summons a different faction and never persists them',()=>{
 const r=run({defenderSpells:{1:summon(250)}});
 assert.equal(r.temporarySummons.defender[1].discarded,true);
 assert.equal(r.persistentArmies.defender.length,7);
});
test('area damage affects the summoned special stack AND ordinary stacks',()=>{
 const r=run({attackers:army(troop(300)),defenders:army(troop(100),troop(50,'R')),
  attackerSpells:{1:summon(100),2:{type:0,target:3,unit:3,powerByWeapon:{I:20,R:40,C:20}}}});
 const area=r.events.find(x=>x.kind==='area-damage');
 assert.ok(area);assert.ok(area.hits.some(x=>x.slot===2));
 assert.ok(area.hits.some(x=>x.slot===3));
});
test('attacker and defender prebattle salvos share same source snapshot',()=>{
 const r=run({attackers:army(troop(20,'R',100)),defenders:army(troop(20,'R',100)),
 attackerSalvos:[{kind:'R',percent:25}],defenderSalvos:[{kind:'R',percent:25}]});
 assert.equal(r.prebattle.attacker.killed[0],5);
 assert.equal(r.prebattle.defender.killed[0],5);
 assert.equal(r.events.filter(e=>e.phase==='salvo').length,2);
});
test('attacker offensive spell and defender buff are ordered before duel',()=>{
 const r=run({attackerSpells:{1:damage(30)},defenderSpells:{1:{type:4,target:6,unit:3,power:20}}});
 assert.deepEqual(r.events.slice(0,3).map(e=>e.phase),['spell','spell','duel']);
 assert.equal(r.events[1].kind,'buff');
});
test('defender hero debuff changes the subsequent duel and does not mutate caller',()=>{
 const hero={faction:1,attaque_modifiee:40};
 const r=run({context:{...ctx,attackerHero:hero},
 defenderSpells:{1:{type:3,target:5,unit:5,power:20}}});
 assert.equal(r.heroes.attacker.attaque_modifiee,20);
 assert.equal(hero.attaque_modifiee,40);
 assert.equal(r.events.find(e=>e.phase==='duel').modifiers.attackStackHero,.10);
});
test('temporary revival is converted once and persistent army excludes magic',()=>{
 const r=run({attackerSpells:{1:revive('tmp')}});
 assert.equal(r.battlefield.attacker[2].remaining,75);
 assert.equal(r.permanent.attacker.reports[0].permanent,6);
 assert.equal(r.persistentArmies.attacker[0].count,94);
 assert.equal(r.terminalDisplay.displayed.attacker[2],50);
 assert.equal(r.terminalDisplay.cleanup.removed,25);
});
test('definitive revival does not trigger temporary terminal removal',()=>{
 const r=run({attackerSpells:{1:revive('def')}});
 assert.equal(r.terminalDisplay.cleanup,null);
 assert.equal(r.permanent.attacker.reports[0].permanent,6);
});
test('attacker with summon and later buff creates only transient units',()=>{
 const r=run({attackers:army(troop(1000)),defenders:army(troop(1000)),
 attackerSpells:{1:summon(100),2:{type:4,target:5,unit:3,power:20}}});
 const buff=r.events.find(e=>e.kind==='buff');assert.ok(buff);
 assert.equal(r.persistentArmies.attacker[0].count,1000-r.permanent.attacker.reports[0].permanent);
});
test('permanent-loss cost is calculated only for real original slots',()=>{
 const r=run({attackers:army(troop(100)),defenders:army(troop(50)),attackerSpells:{1:summon(400)}});
 const originalDead=r.permanent.attacker.reports[0].permanent;
 assert.equal(r.permanent.attacker.totals.goldLost,originalDead*5);
 assert.equal(r.permanent.attacker.reports.length,7);
});
test('server must get summon faction from trusted hero rather than spell order',()=>{
 assert.throws(()=>run({attackerSpells:{1:{...summon(),casterFaction:2}}}),/Client cannot choose/);
 assert.throws(()=>run({context:{...ctx,attackerHero:null},attackerSpells:{1:summon()}}),/trusted attacker hero/);
});
test('unrecognized spell families fail closed',()=>assert.throws(()=>run({attackerSpells:{1:{type:8,target:2,unit:2,power:10}}}),/Unsupported/));
test('spell preparation above two per camp fails before committing actions',()=>assert.throws(()=>run({attackerSpells:{1:summon(),2:damage(),3:revive()}}),/At most two/));
test('scheduled spell after battle end is rejected',()=>assert.throws(()=>run({attackerSpells:{3:summon()}}),/Unreachable/));
test('simultaneous spells ending all combatants are handled without phantom duel',()=>{
 assert.throws(()=>run({attackers:army(troop(10)),defenders:army(troop(10)),
 attackerSpells:{1:damage(1000)},defenderSpells:{1:damage(1000)}}),/Spell cast after enemy elimination/);
});
test('consistent replay and caller data integrity',()=>{
 const a=army(troop(100)),d=army(troop(50)),sp={attackerSpells:{1:summon(200)},defenderSpells:{1:damage(20)}};
 const x=run({attackers:a,defenders:d,...sp}),y=run({attackers:a,defenders:d,...sp});
 assert.deepEqual(x,y);assert.equal(a[0].count,100);assert.equal(d[0].count,50);
});
test('180 deterministic multi-phase simulations preserve persistence invariants',()=>{
 let seed=20261024;const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 for(let i=0;i<180;i++){
  const ac=50+Math.floor(random()*500),dc=50+Math.floor(random()*500);
  const a=army(troop(ac,'I',10)),d=army(troop(dc,'I',10));
  const atk=i%3===0?{1:summon(20+Math.floor(random()*300))}:i%3===1?{1:damage(Math.floor(random()*100))}:{};
  const def=i%4===0?{1:summon(30+Math.floor(random()*150))}:i%4===1?{1:{type:4,target:6,unit:3,power:20}}:{};
  const opts={attackers:a,defenders:d,attackerSpells:atk,defenderSpells:def};
  const r=run(opts);
  assert.equal(r.persistentArmies.attacker.length,7);
  assert.equal(r.persistentArmies.defender.length,7);
  for(const [side,count] of [['attacker',ac],['defender',dc]]){
   const p=r.persistentArmies[side][0];
   assert.ok(p.count>=0&&p.count<=count,'case '+i+' '+side);
   assert.ok(Number.isInteger(p.count));
   assert.ok(r.temporarySummons[side].every(s=>s===null||s.discarded===true));
  }
  assert.equal(JSON.stringify(run(opts)),JSON.stringify(r));
 }
});
test('spells require an actual caster hero',()=>{
 assert.throws(()=>run({context:{attackerHero:null,defenderHero:ctx.defenderHero},attackerSpells:{1:damage(10)}}),/trusted attacker hero/);
});
