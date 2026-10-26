import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveJactariHeroPageSnapshot} from './hero-page-snapshot.mjs';
import {runOriginalHeroPage} from './historical-hero-page-oracle.mjs';
import {getJactariHeroTables} from './hero-source-tables.mjs';

const tables=getJactariHeroTables();
const equal=(actual,expected,label)=>{
 assert.deepEqual(actual.raw,expected.raw,label+' base values');
 for(const key of ['attaque','defense','magie'])
  assert.ok(Math.abs(actual.display[key]-expected.display[key])<=1e-9,label+' display '+key+
   ' '+actual.display[key]+' != '+expected.display[key]);
 assert.deepEqual(actual.equipmentBonuses,expected.equipmentBonuses,label+' equipment bonus');
 assert.deepEqual(actual.skillPoints,expected.skillPoints,label+' competence');
 assert.equal(actual.experience,expected.experience,label+' experience');
};
const run=(input,label)=>{
 const initial=structuredClone(input);
 const expected=runOriginalHeroPage(input);
 const result=deriveJactariHeroPageSnapshot(input);
 equal(result,expected,label);
 assert.deepEqual(input,initial,label+' data immutable');
 return result;
};
test('real historical hero level curves, archetypes and heritage: 250 source comparisons',()=>{
 let seed=20261026;
 const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 for(let i=0;i<250;i++){
  const level=1+Math.floor(rnd()*(tables.levels.length-1));
  const heritageWay=Math.floor(rnd()*tables.wayRanking.length);
  const h={};
  for(const skill of ['heros_superieur','revelation_de_caracteristiques',
   'heros_talentueux','revelation_de_talents'])
   h[skill]=Math.floor(rnd()*11);
  run({faction:1,archetype:Math.floor(rnd()*tables.archetypes.length),
   level,heritage:h,heritageWay,
   stewardBonus:Math.floor(rnd()*4),
   respecializations:0,skillPointsUsed:Math.floor(rnd()*10)},
   'seed '+i);
 }
});
test('real artifacts change attack defense and magic: 60 historically equipped builds',()=>{
 let seed=1262026;
 const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return (seed>>>0)/4294967296;};
 const valid=tables.artifacts.map((a,id)=>a&&a.id===id&&Number.isInteger(Number(a.slot))&&
  Number(a.slot)<tables.equipmentSlots.length&&a.bonus&&
  Object.keys(a.bonus).some(k=>['a','d','m','ap','dp','mp'].includes(k))?
  {id,slot:Number(a.slot),artifact:a}:null).filter(Boolean);
 assert.ok(valid.length>5);
 for(let i=0;i<60;i++){
  // Only one artifact in a level-40 build: fully valid in native UI.
  const item=valid[Math.floor(rnd()*valid.length)];
  const equipment=Array(tables.equipmentSlots.length).fill(0);
  equipment[item.slot]=item.id;
  const result=run({faction:1,archetype:Math.floor(rnd()*tables.archetypes.length),
    level:40,heritageWay:Math.floor(rnd()*tables.wayRanking.length),
    equipment,heritage:{}},'artifact '+i);
  assert.equal(result.equipment[item.slot],item.id);
 }
});
test('source tables are detached from mutable caller state',()=>{
 const snap=getJactariHeroTables(),first=snap.archetypes[0].attaque;
 snap.archetypes[0].attaque=999;
 assert.equal(getJactariHeroTables().archetypes[0].attaque,first);
});
test('forged hero bonuses and incompatible artifact slot cannot be accepted',()=>{
 const basic={faction:1,archetype:0,level:20};
 const keys={...basic,equipment:Array(tables.equipmentSlots.length).fill(0)};
 const artifact=tables.artifacts.find(a=>a&&a.id>0&&Number.isInteger(Number(a.slot)));
 const wrong=(Number(artifact.slot)+1)%tables.equipmentSlots.length;
 keys.equipment[wrong]=artifact.id;
 assert.throws(()=>deriveJactariHeroPageSnapshot(keys),/incompatible slot/);
 assert.throws(()=>deriveJactariHeroPageSnapshot({...basic,heritage:{heros_superieur:100}}),/Heritage/);
 assert.throws(()=>deriveJactariHeroPageSnapshot({...basic,level:99}),/not in original catalog/);
});
