import test from 'node:test';
import assert from 'node:assert/strict';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {listJactariLegendaryClasses} from './hero-legendary.mjs';
import {deriveJactariCombatHeroSnapshot} from './hero-combat-snapshot.mjs';
import {compareHistoricalEncounter} from './historical-encounter-differential.mjs';

const tables=getJactariHeroTables(),legends=listJactariLegendaryClasses(tables);
const troop=(count,weapon='I')=>({count,unitPower:10,weapon,goldCost:5});
const slots=(a,b)=>[a,b,null,null,null,null,null];
const roster=[
 {faction:1,weapon:'I',unitPower:10},
 {faction:1,weapon:'R',unitPower:10},
 {faction:1,weapon:'C',unitPower:10},
 {faction:2,weapon:'I',unitPower:10},
 {faction:2,weapon:'R',unitPower:10},
 {faction:2,weapon:'C',unitPower:10}
];
test('48 real full encounters with single legendary talent on attacker/defender',()=>{
 let count=0;
 for(const cl of legends)for(let index=0;index<3;index++)for(const side of ['attacker','defender']){
  const rank=(index+cl.careerId)%3+1;
  const selected={careerId:cl.careerId,talentIndex:index,rank};
  const attacker=deriveJactariCombatHeroSnapshot({
   profile:{faction:1,archetype:0,level:40},
   side:'attacker',legendarySelections:side==='attacker'?[selected]:[]
  }).hero;
  const defender=deriveJactariCombatHeroSnapshot({
   profile:{faction:2,archetype:0,level:40},
   side:'defender',legendarySelections:side==='defender'?[selected]:[]
  }).hero;
  const input={
   attackers:slots(troop(175,'I'),troop(135,'R')),
   defenders:slots(troop(160,'C'),troop(150,'I')),
   context:{attackerHero:attacker,defenderHero:defender,
    weaponAdvantageFactor:.5,fortification:{place:1,city:16,tears:0}},
   unitCatalog:roster,lossFactor:.3
  };
  const result=compareHistoricalEncounter(input);
  assert.deepEqual(result.differences,[],
   'legend '+selected.careerId+':'+selected.talentIndex+
   ' rank '+rank+' '+side+' '+JSON.stringify(result.differences.slice(0,6)));
  count++;
 }
 assert.equal(count,48);
});
