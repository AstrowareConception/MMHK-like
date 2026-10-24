import test from 'node:test';
import assert from 'node:assert/strict';
import {compareHistoricalEncounter} from './historical-encounter-differential.mjs';

const unit=(count,weapon='I',unitPower=10)=>({count,weapon,unitPower,goldCost:5});
const slots=(...s)=>Array.from({length:7},(_,i)=>s[i]??null);
const catalog=[{faction:1,weapon:'I',unitPower:10},
  {faction:1,weapon:'R',unitPower:10},
  {faction:2,weapon:'I',unitPower:10},
  {faction:2,weapon:'R',unitPower:10}];
const hero={attackerHero:{faction:1,attaque_modifiee:0},defenderHero:{faction:2,defense_modifiee:0}};
const summon=(power=200)=>({type:1,target:0,unit:0,power});
const strike=(power=50)=>({type:0,target:4,unit:7,power});
const buff=(power=20,target=5)=>({type:4,target,unit:3,power});
const revival=(type='tmp',power=50)=>({type:2,target:type==='tmp'?8:9,unit:2,power});
const area=(powerI=20,powerR=40)=>({type:0,target:3,unit:3,
  powerByWeapon:{I:powerI,R:powerR,C:powerI}});
const base={unitCatalog:catalog,context:hero,lossFactor:.25};
const scenarios=[
 {id:'attacker-target-damage',attackers:slots(unit(100)),defenders:slots(unit(80)),
   attackerSpells:{1:strike(50)}},
 {id:'defender-target-damage',attackers:slots(unit(100)),defenders:slots(unit(80)),
   defenderSpells:{1:strike(50)}},
 {id:'attacker-buff',attackers:slots(unit(100)),defenders:slots(unit(80)),
   attackerSpells:{1:buff(20)}},
 {id:'defender-buff',attackers:slots(unit(100)),defenders:slots(unit(80)),
   defenderSpells:{1:buff(20,6)}},
 {id:'attacker-summon',attackers:slots(unit(100)),defenders:slots(unit(80)),
   attackerSpells:{1:summon(200)}},
 {id:'defender-summon',attackers:slots(unit(100)),defenders:slots(unit(110)),
   defenderSpells:{1:summon(200)}},
 {id:'summon-countered-by-spell',attackers:slots(unit(100)),defenders:slots(unit(80)),
   attackerSpells:{1:summon(200)},defenderSpells:{1:strike(50)}},
 {id:'target-and-defender-buff',attackers:slots(unit(100)),defenders:slots(unit(80)),
   attackerSpells:{1:strike(50)},defenderSpells:{1:buff(20,6)}},
 {id:'area-multiple-regular',attackers:slots(unit(100)),defenders:slots(unit(55),unit(35,'R')),
   attackerSpells:{1:area()}},
 {id:'attacker-temporary-revival',attackers:slots(unit(100)),defenders:slots(unit(50)),
   attackerSpells:{1:revival('tmp')}},
 {id:'attacker-definitive-revival',attackers:slots(unit(100)),defenders:slots(unit(50)),
   attackerSpells:{1:revival('def')}},
 {id:'defender-definitive-revival',attackers:slots(unit(50)),defenders:slots(unit(100)),
   defenderSpells:{1:revival('def')}}
];
for(const sc of scenarios){
  test('full original Jactari duel+magic: '+sc.id,()=>{
    const input={...base,...sc};
    const result=compareHistoricalEncounter(input);
    assert.deepEqual(result.differences,[],
      sc.id+': '+JSON.stringify(result.differences.slice(0,15)));
  });
}
test('spell source, inputs and results are reproducible',()=>{
 const input={...base,...scenarios[6]};
 const before=structuredClone(input);
 const first=compareHistoricalEncounter(input),second=compareHistoricalEncounter(input);
 assert.deepEqual(first.differences,second.differences);
 assert.deepEqual(first.historic.events,second.historic.events);
 assert.deepEqual(input,before);
});
