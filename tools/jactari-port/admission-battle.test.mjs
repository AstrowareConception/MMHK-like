import test from 'node:test';
import assert from 'node:assert/strict';
import {adjudicateJactariBattle} from './admission-battle.mjs';
const s=(count,unitPower=10)=>({count,unitPower,weapon:'I',goldCost:5});
const a=n=>[s(n),null,null,null,null,null,null];
const ctx={attackerHero:{faction:1,attaque_modifiee:0},
  defenderHero:{faction:2,defense_modifiee:0}};
const fixture=(att,def,mode='pvp')=>({
  mode,attackers:a(att),defenders:a(def),context:ctx,
  lossPolicy:{lossFactor:.3,source:'original-4.1.3-MTR-not-MMHK-S2'}
});
test('capture during PvP prevents any duel or troop loss',()=>{
 const x=fixture(2,100);
 const r=adjudicateJactariBattle(x);
 assert.equal(r.status,'attacker-captured');
 assert.equal(r.battleOccurred,false);
 assert.equal(r.rounds,0);
 assert.deepEqual(r.persistentArmies.attacker,x.attackers);
 assert.equal(r.heroConsequence.captured,true);
 assert.equal(r.heroConsequence.pendingServerResolution,true);
});
test('PvP wounds reproduce original duration bands',()=>{
 for(const [attack,hours] of [[3,24],[4,18],[5,12],[6,6]]){
  const r=adjudicateJactariBattle(fixture(attack,30));
  assert.equal(r.status,'attacker-wounded');
  assert.equal(r.heroConsequence.woundHours,hours);
  assert.equal(r.permanent,null);
 }
});
test('PvP noncombat retreat leaves both garrisons unchanged',()=>{
 const r=adjudicateJactariBattle(fixture(7,30));
 assert.equal(r.status,'attacker-retreat');
 assert.equal(r.events[0].phase,'admission');
 assert.equal(r.persistentArmies.defender[0].count,30);
});
test('exact PvE boundary: one seventh retreats, above admitted',()=>{
 const defeat=adjudicateJactariBattle(fixture(1,7,'pve'));
 assert.equal(defeat.battleOccurred,false);
 assert.equal(defeat.status,'attacker-retreat');
 const fight=adjudicateJactariBattle(fixture(2,7,'pve'));
 assert.equal(fight.battleOccurred,true);
 assert.ok(fight.events.some(x=>x.phase==='duel'));
});
test('admitted PvP combat delegates to unified battle and retains verdict',()=>{
 const r=adjudicateJactariBattle(fixture(100,80));
 assert.equal(r.battleOccurred,true);
 assert.equal(r.admission.outcome,'battle');
 assert.equal(r.status,'attacker');
 assert.ok(r.permanent.attacker.reports[0]);
});
test('early admission does not require or pretend permanent-loss factor',()=>{
 const {lossPolicy,...input}=fixture(2,100);
 const r=adjudicateJactariBattle(input);
 assert.equal(r.battleOccurred,false);
 assert.equal(r.permanent,null);
});
test('admitted battle still refuses unspecified historic loss coefficient',()=>{
 const {lossPolicy,...input}=fixture(100,80);
 assert.throws(()=>adjudicateJactariBattle(input),/loss factor/);
});
