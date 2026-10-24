import test from 'node:test';
import assert from 'node:assert/strict';
import {compareHistoricalEncounter} from './historical-encounter-differential.mjs';
const u=count=>({count,weapon:'I',unitPower:10,goldCost:5});
const s=(...x)=>Array.from({length:7},(_,i)=>x[i]??null);
const catalog=[{faction:1,weapon:'I',unitPower:10},{faction:2,weapon:'I',unitPower:10}];
const hero={attackerHero:{faction:1,attaque_modifiee:0},defenderHero:{faction:2,defense_modifiee:0}};
const strike=power=>({type:0,target:4,unit:7,power});
const summon=power=>({type:1,target:0,unit:0,power});
const buff=(target,power)=>({type:4,target,unit:3,power});
const revive=(target,power)=>({type:2,target,unit:2,power});
const area=power=>({type:0,target:3,unit:3,powerByWeapon:{I:power,R:power,C:power}});
const cases=[
 {id:'attacker-double-summon-slot-priority',attackers:s(u(1500)),defenders:s(u(1500)),
  attackerSpells:{1:summon(100),2:summon(200)}},
 {id:'attacker-target-damage-then-buff',attackers:s(u(2000)),defenders:s(u(500),u(500)),
  attackerSpells:{1:strike(50),2:buff(5,20)}},
 {id:'defender-buff-then-damage',attackers:s(u(1300),u(1300)),defenders:s(u(2000)),
  defenderSpells:{1:buff(6,10),2:strike(30)}},
 {id:'attacker-area-on-second-round',attackers:s(u(4000)),defenders:s(u(1000),u(1000)),
  attackerSpells:{2:area(20)}},
 {id:'attacker-revival-on-second-round',attackers:s(u(2000)),defenders:s(u(500),u(500)),
  attackerSpells:{2:revive(8,50)}},
 {id:'attacker-summon-then-area',attackers:s(u(2500)),defenders:s(u(1000),u(1000)),
  attackerSpells:{1:summon(100),2:area(20)}}
];
for (const c of cases) test('native original spells scheduled across turns: '+c.id,()=>{
 const input={unitCatalog:catalog,lossFactor:.25,context:hero,...c};
 const compared=compareHistoricalEncounter(input);
 assert.deepEqual(compared.differences,[],
   c.id+': '+JSON.stringify(compared.differences.slice(0,12)));
 assert.ok(compared.historic.rounds>=2,'this fixture MUST reach round 2');
});
