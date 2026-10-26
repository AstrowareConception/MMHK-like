import test from 'node:test';
import assert from 'node:assert/strict';
import {deriveJactariCombatHeroSnapshot} from './hero-combat-snapshot.mjs';
import {runOriginalCombatHeroSnapshot} from './historical-combat-hero-oracle.mjs';
import {getJactariHeroTables} from './hero-source-tables.mjs';
const tables=getJactariHeroTables();
const supported=[];
for(let careerId=0;careerId<tables.talents.length;careerId++)
 for(let talentIndex=0;talentIndex<tables.talents[careerId].length;talentIndex++){
  const t=tables.talents[careerId][talentIndex];
  if(t?.nom_machine&&t.v?.length>1&&t.v.every(Number.isFinite))
   supported.push({careerId,talentIndex,name:t.nom_machine});
 }
const approx=(a,b)=>Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b));
function match(req,label){
 const expected=runOriginalCombatHeroSnapshot(req);
 const actual=deriveJactariCombatHeroSnapshot(req);
 for(const [field,value] of Object.entries(expected.stats))
  assert.ok(approx(actual.hero[field],value),
   label+' '+field+' expected '+value+' got '+actual.hero[field]);
 for(const [name,value] of Object.entries(expected.talentBonuses))
  assert.ok(approx(actual.hero[name]??Number.NaN,value),
   label+' '+name+' expected '+value+' got '+actual.hero[name]);
 return actual;
}
test('original combat hero preparation: 120 varied archetype/level/heritage/side cases',()=>{
 let seed=20261026;
 const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 for(let i=0;i<120;i++){
  const level=1+Math.floor(rnd()*40),h={};
  const herb=rnd()<.5?'heros_superieur':'revelation_de_caracteristiques';
  h[herb]=Math.floor(rnd()*11);
  const profile={faction:1,archetype:Math.floor(rnd()*tables.archetypes.length),
   level,heritage:h,heritageWay:Math.floor(rnd()*tables.wayRanking.length)};
  match({profile,side:rnd()<.5?'attacker':'defender',
   allianceAttackPercent:Math.floor(rnd()*20),
   allianceDefensePercent:Math.floor(rnd()*20),
   attackMalusPercent:Math.floor(rnd()*10)},'hero combat '+i);
 }
});
test('80 equipped and talented combat heroes checked against original combat source',()=>{
 let seed=642020;
 const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 const items=tables.artifacts.map((a,id)=>a?.id===id && id>0 &&
  Number.isInteger(Number(a.slot)) && a.effets?.length>0?{id,slot:Number(a.slot)}:null)
  .filter(Boolean);
 for(let i=0;i<80;i++){
  const item=items[Math.floor(rnd()*items.length)];
  const gear=Array(tables.equipmentSlots.length).fill(0);
  gear[item.slot]=item.id;
  const t=supported[Math.floor(rnd()*supported.length)];
  const choice={careerId:t.careerId,talentIndex:t.talentIndex,
   rank:1+Math.floor(rnd()*3)};
  const profile={faction:1,archetype:Math.floor(rnd()*tables.archetypes.length),
   level:40,heritage:{},heritageWay:Math.floor(rnd()*tables.wayRanking.length),
   equipment:gear};
  match({profile,side:i%2?'defender':'attacker',talentSelections:[choice]},'gear/talent '+i);
 }
});
test('combat values are not silently substituted by hero-editor display stats',()=>{
 const profile={faction:1,archetype:0,level:40,heritage:{
  heros_superieur:1,revelation_de_caracteristiques:4
 }};
 const actual=deriveJactariCombatHeroSnapshot({profile,side:'attacker'});
 assert.ok(Number.isFinite(actual.hero.attaque_modifiee));
 assert.ok(actual.limitations.some(s=>s.includes('career')));
});
