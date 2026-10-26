import test from 'node:test';
import assert from 'node:assert/strict';
import {jactariReferenceProfile} from './source-profile.mjs';
import {adjudicateJactariReferenceBattle} from './admission-battle.mjs';
const slots=n=>[{count:n,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null];
test('source-derived original Jactari 4.1.3-MTR constants',()=>{
 const p=jactariReferenceProfile();
 assert.equal(p.calculatorVersion,'v.4.1.3-MTR');
 assert.equal(p.date,'2013-03-04');
 assert.equal(p.weaponAdvantageFactor,.5);
 assert.equal(p.lossFactor,.3);
 assert.equal(p.pveRetreatThreshold,1/7);
 assert.equal(p.declaredPvpThreshold,.23);
 assert.equal(p.pvpHonorBonus,.5);
 assert.match(p.appliesTo,/not certified MMHK S2/);
});
test('reference admission battle automatically uses only calculator-verified coefficients',()=>{
 const r=adjudicateJactariReferenceBattle({
  mode:'pvp',attackers:slots(100),defenders:slots(80),
  context:{attackerHero:{attaque_modifiee:0},defenderHero:{defense_modifiee:0}}
 });
 assert.equal(r.battleOccurred,true);
 assert.equal(r.historicalRuleset.lossFactor,.3);
 assert.equal(r.lossPolicy.lossFactor,.3);
 assert.equal(r.historicalRuleset.weaponAdvantageFactor,.5);
});
test('reference profile rejects a client-picked loss factor or weapon factor',()=>{
 const base={mode:'pvp',attackers:slots(100),defenders:slots(80)};
 assert.throws(()=>adjudicateJactariReferenceBattle({...base,lossPolicy:{lossFactor:.25}}),/fixes loss factor/);
 assert.throws(()=>adjudicateJactariReferenceBattle({...base,context:{weaponAdvantageFactor:0}}),/fixes weapon/);
});
