import test from 'node:test';
import assert from 'node:assert/strict';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {isJactariCareerAllowed,calculateJactariCareerBudget} from './hero-career-progression.mjs';
import {originalCareerAllowed,originalCareerTalentLedger} from './historical-career-oracle.mjs';

const t=getJactariHeroTables();
const profile=(faction=0,archetype=0)=>({
 faction,archetype,level:40,stewardBonus:0,
 heritage:{},heritageWay:0
});
const career=(careerId,slot=1,talents=[])=>({careerId,slot,talents});
const chosen=(n)=>Array.from({length:n},(_,i)=>i+1);
test('career school/faction/type access: full historical cross product',()=>{
 let examined=0;
 for(let faction=0;faction<t.factions.length;faction++)
  for(let archetype=0;archetype<t.archetypes.length;archetype++)
   for(let careerId=0;careerId<t.careers.length;careerId++){
    const input={faction,archetype,careerId};
    assert.equal(isJactariCareerAllowed(input,t),originalCareerAllowed(input),
      JSON.stringify(input));
    examined++;
   }
 assert.ok(examined>100,'Reference matrix must not be trivial');
});
test('original learning cost table and three career slots',()=>{
 assert.deepEqual(t.learningCosts,[0,1,3,6]);
 const p=profile(),allowed=t.careers.map((_,i)=>i).filter(id=>isJactariCareerAllowed({
  faction:p.faction,archetype:p.archetype,careerId:id},t));
 assert.ok(allowed.length>=3);
 const plan={profile:p,careers:allowed.slice(0,3).map((id,i)=>career(id,i+1))};
 const actual=calculateJactariCareerBudget(plan,t);
 const reference=originalCareerTalentLedger(plan);
 assert.equal(actual.spent,3);
 assert.equal(actual.available,reference.available);
 assert.equal(actual.spent,reference.spent);
});
test('170 talent purchase sequences confront native change_talent, including upgrades',()=>{
 let checked=0;
 for(let faction=0;faction<t.factions.length;faction++){
  for(let archetype=0;archetype<t.archetypes.length;archetype++){
   const p=profile(faction,archetype);
   const allowed=t.careers.map((_,id)=>id).filter(id=>
    isJactariCareerAllowed({faction,archetype,careerId:id},t));
   for(const id of allowed){
    const talents=t.talents[id];
    for(let index=0;index<talents.length;index++){
     if(!talents[index]?.v?.length||!talents[index]?.nom?.fr)continue;
     const rank=Math.min(3,talents[index].v.length-1);
     if(rank<1)continue;
     const scenario={profile:p,careers:[career(id,1,[{index,rank}])]};
     const result=calculateJactariCareerBudget(scenario,t);
     const ref=originalCareerTalentLedger(scenario);
     assert.equal(result.spent,ref.spent,
       JSON.stringify({faction,archetype,id,index,rank}));
     assert.equal(result.available,ref.available);
     assert.deepEqual(result.careers[0].ranks,ref.careers[0].ranks);
     checked++;
     if(checked>=170)break;
    }
    if(checked>=170)break;
   }
   if(checked>=170)break;
  }
  if(checked>=170)break;
 }
 assert.equal(checked,170);
});
test('Scribe and Maître des arcanes are charged ONCE at a synchronized rank',()=>{
 const cases=[];
 for(const title of ['Scribe','Maitre des arcanes']){
  const found=t.careers.map((_,id)=>({id,index:t.talents[id]?.findIndex(x=>x?.nom?.fr===title)}))
   .filter(x=>x.index>=0);
  if(found.length>=2)cases.push({title,found});
 }
 assert.equal(cases.length,2,'Both special shared skills must be covered');
 for(const {title,found} of cases){
  let testPair=null,p=null;
  for(let f=0;f<t.factions.length&&!testPair;f++)
   for(let a=0;a<t.archetypes.length&&!testPair;a++){
    const permitted=found.filter(x=>isJactariCareerAllowed({faction:f,archetype:a,careerId:x.id},t));
    if(permitted.length>=2){testPair=permitted.slice(0,2);p=profile(f,a);}
   }
  assert.ok(testPair,'No eligible two-career fixture for '+title);
  const scenario={profile:p,careers:testPair.map((v,i)=>career(v.id,i+1,[{index:v.index,rank:2}]))};
  const actual=calculateJactariCareerBudget(scenario,t),original=originalCareerTalentLedger(scenario);
  assert.equal(actual.spent,5, title+' two careers + shared rank 2 costs 2+3');
  assert.equal(actual.spent,original.spent,title);
  for(let i=0;i<2;i++)assert.equal(actual.careers[i].ranks[testPair[i].index],
    original.careers[i].ranks[testPair[i].index],title);
 }
});
test('rejects invalid schools, duplicate careers/slots and rank forgery',()=>{
 const p=profile();
 const sample=t.careers.map((_,id)=>id).filter(id=>isJactariCareerAllowed({
  faction:p.faction,archetype:p.archetype,careerId:id},t))[0];
 assert.throws(()=>calculateJactariCareerBudget({profile:p,careers:[
  career(sample,1),career(sample,2)]},t),/Duplicate career/);
 assert.throws(()=>calculateJactariCareerBudget({profile:p,careers:[
  career(sample,1),career((sample+1)%t.careers.length,1)]},t),/Duplicate career or slot|Career not available/);
 assert.throws(()=>calculateJactariCareerBudget({profile:p,careers:[
  career(sample,1,[{index:0,rank:99}])]},t),/rank unavailable/);
 assert.throws(()=>calculateJactariCareerBudget({profile:p,careers:[
  career(sample,1,[{index:0,rank:1,bonus:1000}])]},t),/Only original talent/);
 assert.throws(()=>calculateJactariCareerBudget({profile:{...p,level:1},careers:[
  career(sample,1,[{index:0,rank:3}])]},t),/Insufficient historical skill points/);
});
test('no mutation of persisted profile or career choice list',()=>{
 const p=profile(),id=t.careers.findIndex((_,i)=>
  isJactariCareerAllowed({faction:p.faction,archetype:p.archetype,careerId:i},t));
 const input={profile:p,careers:[career(id,1,[{index:0,rank:1}])]};
 const copy=structuredClone(input);
 calculateJactariCareerBudget(input,t);
 assert.deepEqual(input,copy);
});
