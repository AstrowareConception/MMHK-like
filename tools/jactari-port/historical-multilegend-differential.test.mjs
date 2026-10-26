import test from 'node:test';
import assert from 'node:assert/strict';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {listJactariLegendaryClasses} from './hero-legendary.mjs';
import {deriveJactariCombatHeroSnapshot} from './hero-combat-snapshot.mjs';
import {runOriginalCombatHeroSnapshot} from './historical-combat-hero-oracle.mjs';
import {compareHistoricalEncounter} from './historical-encounter-differential.mjs';
import {runOriginalSpellPower} from './historical-spell-power-oracle.mjs';
import {calculateEffectiveSpellPower} from './spell-power.mjs';

const tables=getJactariHeroTables(),all=listJactariLegendaryClasses(tables)
 .flatMap(c=>c.talents.map(t=>({careerId:c.careerId,talentIndex:t.talentIndex,
  name:t.name})));
const profile=(faction=1)=>({faction,archetype:0,level:40,
 heritage:{heros_superieur:3},heritageWay:1});
const weapon=['I','R','C'];
const slots=(a,b)=>[a,b,null,null,null,null,null];
const troop=(count,type)=>({count,weapon:type,unitPower:10,goldCost:5});
const catalog=weapon.flatMap((w)=>[{faction:1,weapon:w,unitPower:10},
 {faction:2,weapon:w,unitPower:10}]);
function rnd(seed){return()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};}
const originalCompare=(native,port,label)=>{
 for(const [field,value] of Object.entries(native.stats))
  assert.ok(Math.abs(port[field]-value)<1e-9*Math.max(1,Math.abs(value),Math.abs(port[field])),
   label+' '+field+' '+value+' '+port[field]);
 for(const [field,value] of Object.entries(native.talentBonuses))
  assert.equal(port[field],value,label+' '+field);
};
test('120 mixed rank combinations across 2-8 different legendary families: native combat hero parity',()=>{
 const next=rnd(661026);let cases=0;
 for(let i=0;i<120;i++){
  const n=2+(i%7),chosen=new Set();
  while(chosen.size<n)chosen.add(Math.floor(next()*all.length));
  const selections=[...chosen].map(index=>({...all[index],
   rank:1+Math.floor(next()*3)}))
   .map(({careerId,talentIndex,rank})=>({careerId,talentIndex,rank}));
  const side=i%2?'attacker':'defender',p=profile(i%2?1:2);
  const native=runOriginalCombatHeroSnapshot({
   profile:p,side,talentSelections:selections,
   allianceAttackPercent:i%4,allianceDefensePercent:i%3
  });
  const port=deriveJactariCombatHeroSnapshot({
   profile:p,side,legendarySelections:selections,
   allianceAttackPercent:i%4,allianceDefensePercent:i%3
  });
  originalCompare(native,port.hero,'case '+i);
  cases++;
 }
 assert.equal(cases,120);
});
test('48 full battles with multiple legendary talents on both heroes match original engine',()=>{
 const next=rnd(262026);let executed=0;
 for(let i=0;i<48;i++){
  const choose=()=>{
   const selected=new Set();
   while(selected.size<3+(i%4))selected.add(Math.floor(next()*all.length));
   return [...selected].map(index=>{
    const t=all[index];return{careerId:t.careerId,talentIndex:t.talentIndex,
     rank:1+Math.floor(next()*3)};
   });
  };
  const heroA=deriveJactariCombatHeroSnapshot({
   profile:profile(1),side:'attacker',legendarySelections:choose()
  }).hero;
  const heroD=deriveJactariCombatHeroSnapshot({
   profile:profile(2),side:'defender',legendarySelections:choose()
  }).hero;
  const request={
   attackers:slots(troop(155+i%41,weapon[i%3]),troop(115+i%23,'R')),
   defenders:slots(troop(160+i%35,weapon[(i+1)%3]),troop(126+i%19,'I')),
   context:{attackerHero:heroA,defenderHero:heroD,
    weaponAdvantageFactor:.5,
    fortification:{place:i%3,city:16,region:10,tears:0}},
   unitCatalog:catalog,lossFactor:.3
  };
  const compared=compareHistoricalEncounter(request);
  assert.deepEqual(compared.differences,[],
   'legendary multi-battle '+i+' '+JSON.stringify(compared.differences.slice(0,8)));
  executed++;
 }
 assert.equal(executed,48);
});
test('legendary effects on all four magic schools can combine in the real original spell calculator',()=>{
 const families=[
  ['legendary_kingundead_b','legendary_legmagician_a',0],
  ['legendary_ethernalnight_c','legendary_kingundead_a',1],
  ['legendary_legpaladin_c','legendary_legmagician_b',2]
 ];
 for(const [left,right,school] of families){
  const pick=name=>{
   const entry=all.find(t=>t.name===name);
   assert.ok(entry,name);
   return {careerId:entry.careerId,talentIndex:entry.talentIndex,rank:3};
  };
  const hero=deriveJactariCombatHeroSnapshot({
   profile:profile(),side:'attacker',legendarySelections:[pick(left),pick(right)]
  }).hero;
  const req={spell:{school,circle:1,type:0,target:4,unit:1,
   power:5,factors:{I:1,R:1.5,C:.5}},
   hero,side:'attacker',attackerWeapon:'I',defenderWeapon:'R'};
  const native=runOriginalSpellPower(req),ported=calculateEffectiveSpellPower(req);
  assert.ok(Math.abs(native.power-ported.power)<1e-9,
   school+' double magical legendary effects diverge');
 }
});
