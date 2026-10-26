import test from 'node:test';
import assert from 'node:assert/strict';
import {auditJactariCombatHeritage,assertDocumentedJactariCombatHeritage}
 from './historical-heritage-audit.mjs';
import {deriveJactariCombatHeroSnapshot} from './hero-combat-snapshot.mjs';
import {runOriginalCombatHeroSnapshot} from './historical-combat-hero-oracle.mjs';
import {getJactariHeroTables} from './hero-source-tables.mjs';

const tables=getJactariHeroTables();
const fields=['attaque','defense','magie','attaque_modifiee','defense_modifiee','magie_modifiee'];
test('original source references level-15/30 variants but the archived skill catalog lacks them',()=>{
 const rows=auditJactariCombatHeritage();
 assert.equal(rows.length,4);
 for(const name of ['heros_superieur','revelation_de_caracteristiques']){
  const row=rows.find(r=>r.name===name);
  assert.equal(row.definedInArchivedTable,true);
  assert.equal(row.combatUsable,true);
  assert.equal(row.status,'source-backed');
 }
 for(const name of ['revelation_de_caracteristiques_15','revelation_de_caracteristiques_30']){
  const row=rows.find(r=>r.name===name);
  assert.equal(row.definedInArchivedTable,false,name);
  assert.equal(row.referencedInArchivedCombat,true,name);
  assert.ok(row.referenceCount>=3,name);
  assert.equal(row.status,'unresolved-vendor-source-mismatch');
  assert.throws(()=>assertDocumentedJactariCombatHeritage({[name]:1}),
    new RegExp(name));
  assert.throws(()=>deriveJactariCombatHeroSnapshot({
   profile:{faction:1,archetype:0,level:40,heritage:{[name]:1}},
   side:'attacker'
  }),new RegExp(name));
 }
});
test('documented heritage level thresholds and rounding: 120 original combat comparisons',()=>{
 let count=0;
 const levels=[1,14,15,16,29,30,31,40];
 outer: for(const level of levels)for(const side of ['attacker','defender'])
  for(const archetype of [0,1,3])
   for(const kind of ['heros_superieur','revelation_de_caracteristiques','none']){
    const heritage=kind==='none'?{}:{[kind]:1+(count%10)};
    const profile={faction:1,archetype,level,heritage,
     heritageWay:count%tables.wayRanking.length};
    const native=runOriginalCombatHeroSnapshot({profile,side});
    const port=deriveJactariCombatHeroSnapshot({profile,side}).hero;
    for(const field of fields){
     const a=native.stats[field],b=port[field];
     assert.ok(Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a),Math.abs(b)),
      'case='+count+' level='+level+' '+kind+' '+side+' '+field+
      ' original='+a+' port='+b);
    }
    count++;
    if(count>=120)break outer;
   }
 assert.equal(count,120);
});
test('undocumented heritage ranks cannot silently modify combat even if a numeric coefficient is suggested',()=>{
 const payload={faction:1,archetype:0,level:30,
  heritage:{revelation_de_caracteristiques_15:10}};
 assert.throws(()=>deriveJactariCombatHeroSnapshot({
  profile:payload,side:'defender'
 }),/Unresolved original Jactari heritage variant/);
 assert.equal(assertDocumentedJactariCombatHeritage({
  revelation_de_caracteristiques:10,heros_superieur:3
 }),true);
});

test('90 coupled superior+revelation profiles preserve original combat precedence at levels 15/30',()=>{
 let count=0;
 for(const level of [14,15,29,30,40])
  for(const side of ['attacker','defender'])
   for(const heredityWay of [0,1,2])
    for(const rank of [1,3,7]){
     const profile={faction:1,archetype:2,level,heritageWay,
      heritage:{heros_superieur:rank,revelation_de_caracteristiques:10-rank}};
     const original=runOriginalCombatHeroSnapshot({profile,side});
     const port=deriveJactariCombatHeroSnapshot({profile,side}).hero;
     for(const field of fields)
      assert.ok(Math.abs(original.stats[field]-port[field])<1e-9,
       'coupled heritage case '+count+' '+field);
     count++;
    }
 assert.equal(count,90);
});
