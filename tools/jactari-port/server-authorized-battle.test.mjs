import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {previewServerAuthorizedHeroBattle} from './server-authorized-battle.mjs';
import {simulateBattleWithDerivedHeroes} from './hero-combat-battle.mjs';

const troop=(count,weapon='I')=>({count,weapon,unitPower:10,goldCost:5});
const army=(count,weapon='I')=>[troop(count,weapon),null,null,null,null,null,null];
const profile=(faction)=>({faction,archetype:0,level:30,heritage:{heros_superieur:2}});
const grant={careerId:20,talentIndex:2,rank:2};
const makeHero=(id,ownerId,faction,hasLegendary=false)=>({
 id,ownerId,profile:profile(faction),careers:[],
 legendarySelections:hasLegendary?[grant]:[],
 legendaryGrants:hasLegendary?{legendary_dragonkinght_c:2}:{},
 army:army(faction===1?175:140)
});
function fixture(){
 const store=openTrustedHeroStore();
 for(const owner of ['alice','bob','eve'])store.registerPlayer(owner);
 store.putHero(makeHero('hero-a','alice',1,true));
 store.putHero(makeHero('hero-d','bob',2));
 return store;
}
const rules={context:{weaponAdvantageFactor:.5},
 lossPolicy:{lossFactor:.3,source:'JACTARI_TEST_NOT_MMHK_S2'},
 unitCatalog:[],maxRounds:100};
const command={attackerHeroId:'hero-a',defenderHeroId:'hero-d'};
function request(store,token='alice',overrides={}){
 return {
  command,authContext:{token},
  authenticate:ctx=>({authenticated:ctx.token==='alice',playerId:ctx.token}),
  authorizeTarget:()=>true,
  heroStore:store,trustedRules:rules,...overrides
 };
}
test('authenticated SQLite hero preview agrees with derived historical combat and never mutates database',()=>{
 const store=fixture();
 try{
  const beforeA=store.getHero('hero-a'),beforeD=store.getHero('hero-d');
  const result=previewServerAuthorizedHeroBattle(request(store));
  const expected=simulateBattleWithDerivedHeroes({
   attackers:beforeA.army,defenders:beforeD.army,
   heroProfiles:{attacker:beforeA.profile,defender:beforeD.profile},
   heroCareers:{attacker:beforeA.careers,defender:beforeD.careers},
   heroLegendaries:{attacker:beforeA.legendarySelections,
    defender:beforeD.legendarySelections},
   heroLegendaryGrants:{attacker:beforeA.legendaryGrants,
    defender:beforeD.legendaryGrants},context:rules.context,lossPolicy:rules.lossPolicy,
   maxRounds:rules.maxRounds
  });
  assert.deepEqual(result.persistentArmies,expected.persistentArmies);
  assert.deepEqual(result.events,expected.events);
  assert.equal(result.heroSnapshots.attacker.hero.bonus_legendary_dragonkinght_c,8);
  assert.equal(result.authorization.actor,'alice');
  assert.equal(result.authorization.readOnly,true);
  assert.equal(result.persistence.applied,false);
  assert.deepEqual(store.getHero('hero-a'),beforeA);
  assert.deepEqual(store.getHero('hero-d'),beforeD);
 }finally{store.close();}
});
test('unauthenticated, disabled and owner-spoofing callers are blocked before simulation',()=>{
 const store=fixture();
 try{
  assert.throws(()=>previewServerAuthorizedHeroBattle(request(store,'eve')),
   /Unauthenticated/);
  const forging=request(store,'alice',{command:{
   ...command,ownerId:'alice',attackerHeroStats:{magie:9999}}});
  assert.throws(()=>previewServerAuthorizedHeroBattle(forging),/forbidden or unknown fields/);
  assert.throws(()=>previewServerAuthorizedHeroBattle(request(store,'bob',{
   authenticate:()=>({authenticated:true,playerId:'bob'})
  })),/not owned/);
  store.setPlayerEnabled('alice',false);
  assert.throws(()=>previewServerAuthorizedHeroBattle(request(store)),
   /inactive principal/);
 }finally{store.close();}
});
test('target authorization is mandatory, without implicit enemy visibility',()=>{
 const store=fixture();
 try{
  assert.throws(()=>previewServerAuthorizedHeroBattle(request(store,'alice',{
   authorizeTarget:undefined
  })),/authorization hooks required/);
  assert.throws(()=>previewServerAuthorizedHeroBattle(request(store,'alice',{
   authorizeTarget:()=>false
  })),/authorization denied/);
  assert.throws(()=>previewServerAuthorizedHeroBattle(request(store,'alice',{
   authorizeTarget:()=>({allowed:true})
  })),/authorization denied/);
  const same=previewServerAuthorizedHeroBattle(request(store));
  assert.ok(same.authorization.validated);
 }finally{store.close();}
});
test('store rejects forged calculated stats, unauthorized legendary ranks and unknown rows',()=>{
 const store=fixture();
 try{
  const original=makeHero('hero-c','alice',1);
  assert.throws(()=>store.putHero({...original,profile:{
   ...original.profile,attaque_modifiee:9999
  }}),/unsupported or untrusted fields/);
  assert.throws(()=>store.putHero({...original,legendarySelections:[grant],
   legendaryGrants:{legendary_dragonkinght_c:1}}),/not granted/);
  assert.throws(()=>store.putHero({...original,army:[
   {...troop(5),remaining:1000},null,null,null,null,null,null
  ]}),/Unrecognized stored army stack field/);
  assert.throws(()=>store.putHero({...original,ownerId:'unknown'}),
   /registered active player/);
  assert.equal(store.getHero('hero-c'),null);
 }finally{store.close();}
});
test('SQLite persists hero profiles across reopening and protects revision/owner changes',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-hero-authority-'));
 const filename=path.join(temp,'heroes.sqlite');
 let store;
 try{
  store=openTrustedHeroStore({filename});
  store.registerPlayer('alice');store.registerPlayer('bob');
  const initial=makeHero('persisted','alice',1);
  const created=store.putHero(initial);
  assert.equal(created.revision,1);
  const revision=store.replaceHero({...initial,profile:{...initial.profile,level:31}},
   {expectedRevision:1});
  assert.equal(revision.revision,2);
  assert.throws(()=>store.replaceHero(initial,{expectedRevision:1}),
   /Stale hero revision/);
  assert.throws(()=>store.replaceHero({...initial,ownerId:'bob'},
   {expectedRevision:2}),/ownership cannot change/);
  store.close();store=null;
  store=openTrustedHeroStore({filename});
  const current=store.getHero('persisted');
  assert.equal(current.revision,2);
  assert.equal(current.profile.level,31);
  assert.equal(current.ownerId,'alice');
  assert.equal(store.isPlayerEnabled('bob'),true);
  assert.throws(()=>store.putHero(initial),/UNIQUE|constraint failed/i);
 }finally{
  store?.close();
  fs.rmSync(temp,{recursive:true,force:true});
 }
});
test('client cannot override stored military context, spell powers or target army',()=>{
 const store=fixture();
 try{
  for(const extras of [
   {context:{attackerHero:{attaque_modifiee:999}}},
   {attackers:army(5000)},
   {attackerSpells:{1:{id:0,power:99999}}},
   {legendaryGrants:{attacker:{legendary_dragonkinght_c:3}}}
  ])assert.throws(()=>previewServerAuthorizedHeroBattle(request(store,'alice',{
   command:{...command,...extras}
  })),/forbidden or unknown fields/);
  assert.throws(()=>previewServerAuthorizedHeroBattle(request(store,'alice',{
   trustedRules:{...rules,context:{...rules.context,attackerHero:{attaque_modifiee:999}}}
  })),/cannot override derived hero profiles/);
 }finally{store.close();}
});
test('spell orders are read from persisted hero data and resolved from server catalog only',()=>{
 const store=fixture();
 try{
  const {revision,...current}=store.getHero('hero-a');
  store.replaceHero({...current,spellOrders:{1:{id:0}}},{expectedRevision:revision});
  const spellContext={
   catalog:[{school:3,circle:1,type:0,target:4,unit:7,power:1,
    factors:{I:1,R:1,C:1}}],
   attacker:{},defender:{}
  };
  assert.throws(()=>previewServerAuthorizedHeroBattle(request(store)),
   /Trusted spell context required|catalog|Incomplete spell/);
  const result=previewServerAuthorizedHeroBattle(request(store,'alice',{
   trustedRules:{...rules,spellContext}
  }));
  assert.equal(result.events.find(e=>e.phase==='spell-power').spellId,0);
  assert.equal(store.getHero('hero-a').spellOrders[1].id,0);
  assert.equal(store.getHero('hero-a').revision,2);
 }finally{store.close();}
});
