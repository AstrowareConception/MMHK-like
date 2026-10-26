import test from 'node:test';
import assert from 'node:assert/strict';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {calculateJactariCareerBudget,isJactariCareerAllowed} from './hero-career-progression.mjs';
import {transitionJactariCareer} from './hero-career-lifecycle.mjs';
import {runOriginalCareerLifecycle} from './historical-career-lifecycle-oracle.mjs';

const tables=getJactariHeroTables();
const profile=(faction=0,archetype=0)=>({
 faction,archetype,level:40,heritage:{},heritageWay:0
});
const entry=(careerId,slot,talents=[])=>({careerId,slot,talents});
function check(input,label){
 const historical=runOriginalCareerLifecycle(input);
 assert.equal(historical.refused,false,label+' historical UI unexpectedly rejected operation');
 const result=transitionJactariCareer(input,tables);
 assert.equal(result.before.spent,historical.before.spent,label+' initial spent');
 assert.equal(result.after.spent,historical.after.spent,label+' final spent');
 assert.equal(result.deltaSpent,historical.deltaSpent,label+' refunded points');
 assert.equal(result.after.available,historical.after.available,label+' available points');
 assert.deepEqual(result.after.careers.map(c=>({slot:c.slot,careerId:c.careerId,ranks:c.ranks})),
   historical.after.careers,label+' career ranks');
 assert.deepEqual(result.after.shared,historical.after.shared,label+' shared skills');
 return {result,historical};
}
test('60 actual Jactari career select / replacement / abandonment calls',()=>{
 let count=0;
 for(let f=0;f<tables.factions.length&&count<60;f++){
  for(let a=0;a<tables.archetypes.length&&count<60;a++){
   const p=profile(f,a);
   const allowed=tables.careers.map((_,id)=>id)
     .filter(id=>isJactariCareerAllowed({faction:f,archetype:a,careerId:id},tables));
   if(allowed.length<3)continue;
   const [first,second,third]=allowed;
   for(const scenario of [
    {profile:p,careers:[],op:'select',slot:1,careerId:first},
    {profile:p,careers:[entry(first,1)],op:'select',slot:2,careerId:second},
    {profile:p,careers:[entry(first,1)],op:'replace',slot:1,careerId:third},
    {profile:p,careers:[entry(first,1)],op:'abandon',slot:1},
    {profile:p,careers:[entry(first,1),entry(second,2)],op:'replace',slot:2,careerId:third},
    {profile:p,careers:[entry(first,1),entry(second,2)],op:'abandon',slot:1}
   ]){check(scenario,'faction '+f+' archetype '+a+' case '+count);count++;if(count>=60)break;}
  }
 }
 assert.equal(count,60);
});
test('career replacement and deactivation fully refund ordinary purchased ranks',()=>{
 const p=profile(),options=tables.careers.map((_,id)=>id)
  .filter(id=>isJactariCareerAllowed({faction:0,archetype:0,careerId:id},tables));
 const [first,second,third]=options;
 const firstTalents=tables.talents[first];
 const ix=firstTalents.findIndex(t=>t?.v?.length>=4 &&
   !['Scribe','Maitre des arcanes'].includes(t?.nom?.fr));
 assert.ok(ix>=0,'Missing non-shared historical talent');
 const careers=[entry(first,1,[{index:ix,rank:3}]),entry(second,2)];
 const discarded=check({profile:p,careers,op:'abandon',slot:1},'abandon with rank3');
 assert.equal(discarded.result.deltaSpent,-7,'Refund one career point and rank3 six points');
 const replaced=check({profile:p,careers,op:'replace',slot:1,careerId:third},
  'replacement with rank3');
 assert.equal(replaced.result.deltaSpent,-6,'Replacement keeps its career point');
});
test('shared Scribe and Arcana rank are inherited by a newly selected career',()=>{
 for(const skill of ['Scribe','Maitre des arcanes']){
  const offering=tables.careers.map((_,id)=>({
   id,index:tables.talents[id].findIndex(t=>t?.nom?.fr===skill)
  })).filter(o=>o.index>=0);
  let matched;
  for(let f=0;f<tables.factions.length&&!matched;f++)
   for(let a=0;a<tables.archetypes.length&&!matched;a++){
    const available=offering.filter(o=>isJactariCareerAllowed({
      faction:f,archetype:a,careerId:o.id},tables));
    if(available.length>=2)matched={profile:profile(f,a),pair:available.slice(0,2)};
   }
  assert.ok(matched,skill+' requires two historically compatible careers');
  const [a,b]=matched.pair;
  const plan=[entry(a.id,1,[{index:a.index,rank:2}])];
  const r=check({profile:matched.profile,careers:plan,op:'select',slot:2,
    careerId:b.id},skill+' second career');
  assert.equal(r.result.deltaSpent,1,'Inherited shared rank costs no duplicate points');
  assert.equal(r.result.after.careers[1].ranks[b.index],2);
  const removed=check({profile:matched.profile,careers:[
    entry(a.id,1,[{index:a.index,rank:2}]),
    entry(b.id,2,[{index:b.index,rank:2}])
  ],op:'abandon',slot:1},skill+' remove while shared');
  assert.equal(removed.result.deltaSpent,-1,'Only the career point is refunded');
 }
});
test('invalid lifecycle operations fail closed, never alter input',()=>{
 const p=profile(),allowed=tables.careers.map((_,id)=>id)
   .filter(id=>isJactariCareerAllowed({faction:0,archetype:0,careerId:id},tables));
 const current=[entry(allowed[0],1)];
 const before=structuredClone(current);
 assert.throws(()=>transitionJactariCareer({profile:p,careers:current,op:'select',
   slot:1,careerId:allowed[1]}),/already selected/);
 assert.throws(()=>transitionJactariCareer({profile:p,careers:current,op:'abandon',
   slot:2}),/not selected/);
 assert.throws(()=>transitionJactariCareer({profile:p,careers:current,op:'replace',
   slot:1,careerId:allowed[0]}),/^(?!$)/);
 assert.throws(()=>transitionJactariCareer({profile:p,careers:current,op:'abandon',
   slot:1,careerId:allowed[1]}),/no new career ID/);
 assert.deepEqual(current,before);
});
