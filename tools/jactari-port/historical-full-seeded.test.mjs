import test from 'node:test';
import assert from 'node:assert/strict';
import {compareHistoricalEncounter} from './historical-encounter-differential.mjs';

const catalog=[
 {faction:1,weapon:'I',unitPower:10},
 {faction:1,weapon:'R',unitPower:10},
 {faction:1,weapon:'C',unitPower:10},
 {faction:2,weapon:'I',unitPower:10},
 {faction:2,weapon:'R',unitPower:10},
 {faction:2,weapon:'C',unitPower:10}
];
let state=20261024;
function rnd(){state^=state<<13;state^=state>>>17;state^=state<<5;return(state>>>0)/4294967296;}
const pick=v=>v[Math.floor(rnd()*v.length)];
const unit=()=>({count:40+Math.floor(rnd()*100),unitPower:10,
  weapon:pick(['I','R','C']),goldCost:5});
const slots=()=>{
  const a=Array.from({length:7},(_,i)=>i<3&&rnd()<.6?unit():null);
  if(a.every(x=>!x))a[0]=unit();
  return a;
};
function spell(side){
  const type=pick(['none','damage','buff','area','summon','revival']);
  switch(type){
    case 'none':return {};
    case 'damage':return {1:{type:0,target:4,unit:7,power:pick([10,20,30])}};
    case 'buff':return {1:{type:4,target:side==='attacker'?5:6,unit:3,power:pick([10,20,30])}};
    case 'area':return {1:{type:0,target:3,unit:3,
      powerByWeapon:{I:pick([10,15,20]),R:pick([10,20]),C:pick([10,15])}}};
    case 'summon':return {1:{type:1,target:pick([0,1,2]),unit:0,power:pick([100,200,400])}};
    case 'revival':return {1:{type:2,target:pick([8,9]),unit:2,power:pick([20,40,60])}};
  }
}
const total=a=>a.reduce((sum,x)=>sum+(x?x.count*x.unitPower:0),0);
test('100 seeded full original encounters with mixed bilateral spell schedules',()=>{
  let accepted=0,tries=0;
  while(accepted<100){
    if(++tries>1000)throw new Error('Invalid deterministic fixture generator');
    const attackers=slots(),defenders=slots();
    const ratio=total(attackers)/total(defenders);
    if(ratio<.31)continue; // historical PvP admission exits early
    const input={
      attackers,defenders,
      attackerSpells:spell('attacker'),defenderSpells:spell('defender'),
      unitCatalog:catalog,lossFactor:.25,
      context:{
        attackerHero:{faction:1,attaque_modifiee:pick([0,20,40])},
        defenderHero:{faction:2,defense_modifiee:pick([0,20,40])},
        weaponAdvantageFactor:pick([0,.25])
      }
    };
    let result;
    try{result=compareHistoricalEncounter(input);}
    catch(e){throw new Error('seed-case '+accepted+' crashed: '+e.message+
      ' fixture='+JSON.stringify(input),{cause:e});}
    assert.deepEqual(result.differences,[],
      'seed-case '+accepted+' mismatch: '+JSON.stringify(result.differences.slice(0,12))+
      ' fixture='+JSON.stringify(input));
    accepted++;
  }
  assert.equal(accepted,100);
});
