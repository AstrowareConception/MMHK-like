import test from 'node:test';
import assert from 'node:assert/strict';
import {calculateEffectiveSpellPower} from './spell-power.mjs';
import {runOriginalSpellPower} from './historical-spell-power-oracle.mjs';
const weapons=['I','R','C'];
const legendary=['bonus_legendary_kingundead_b','bonus_legendary_legmagician_a',
 'bonus_legendary_ethernalnight_c','bonus_legendary_kingundead_a',
 'bonus_legendary_legpaladin_c','bonus_legendary_legmagician_b',
 'bonus_legendary_dragonkinght_b'];
function compare(input,label){
 const a=runOriginalSpellPower(input);
 const b=calculateEffectiveSpellPower(input);
 assert.ok(Number.isFinite(a.power)&&Number.isFinite(b.power),
   label+' nonfinite '+a.power+' '+b.power);
 assert.ok(Math.abs(a.power-b.power)<=1e-9*Math.max(1,Math.abs(a.power),Math.abs(b.power)),
   label+' original='+a.power+' port='+b.power+' fixture='+JSON.stringify(input));
}
test('400 original Jactari spell powers with heroes, mastery, resistance and antimagic',()=>{
 let seed=20261026;const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 const pick=a=>a[Math.floor(rnd()*a.length)];
 for(let i=0;i<400;i++){
  const school=Math.floor(rnd()*4);
  const hero={magie:1+Math.floor(rnd()*100),bonus_mp:Math.floor(rnd()*101),
   bonus_m:Math.floor(rnd()*15)};
  for(let i=0;i<4;i++){
   hero['bonus_instinct_'+i]=Math.floor(rnd()*20);
   hero['bonus_expert_'+i]=Math.floor(rnd()*30);
  }
  for(const k of legendary)hero[k]=Math.floor(rnd()*20);
  const input={
   spell:{school,unit:pick([0,1,2,3,4,5,6,7]),
    circle:pick([1,2,3,4,5]),type:pick([0,1,2,3,4]),
    power:1+Math.floor(rnd()*30),
    factors:{I:pick([.5,1,1.5]),R:pick([.5,1,1.5]),C:pick([.5,1,1.5])}},
   side:pick(['attacker','defender']),
   attackerWeapon:pick(weapons),defenderWeapon:pick(weapons),hero,
   schoolBonusPercent:Math.floor(rnd()*35),
   mastery:{level:1,bonusPercent:Math.floor(rnd()*25),
      maximumCircle:Math.floor(rnd()*6),wayBonus:Math.floor(rnd()*3)},
   resistance:{level:1,bonusPercent:Math.floor(rnd()*20),
      wayBonus:Math.floor(rnd()*3)},
   antiMagic:{level:Math.floor(rnd()*3),bonusPercentPerLevel:pick([5,10,15])}
  };
  compare(input,'spell-seed '+i);
 }
});
test('school expertise and spell type resistances use original source',()=>{
 const spell={school:3,unit:1,circle:2,type:0,power:15,
   factors:{I:1,R:1.5,C:.5}};
 compare({spell,side:'defender',attackerWeapon:'C',defenderWeapon:'I',
  hero:{magie:20,bonus_mp:25,bonus_m:5,bonus_expert_3:20,
    bonus_legendary_dragonkinght_b:15,bonus_instinct_3:4},
  mastery:{level:1,bonusPercent:20,maximumCircle:3,wayBonus:1},
  resistance:{level:1,bonusPercent:10,wayBonus:1},
  antiMagic:{level:1,bonusPercentPerLevel:5}},'elite magician');
});
test('original spell oracle rejects invented artifact efficiency',()=>{
 assert.throws(()=>runOriginalSpellPower({spell:{},side:'attacker',
  artifactEfficiencyPercent:1}),/requires real artifacts/);
});
