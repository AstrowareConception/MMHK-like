import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {
 commitServerAuthorizedJactariBattle,computeJactariRulesDigest
} from './server-transactional-battle.mjs';

const army=(count,weapon='I')=>[{count,unitPower:10,weapon,goldCost:5},
 null,null,null,null,null,null];
const hero=(id,ownerId,count,faction)=>({
 id,ownerId,profile:{faction,archetype:0,level:35,
 heritage:{heros_superieur:2}},army:army(count),careers:[],
 legendaryGrants:{},legendarySelections:[],spellOrders:{}
});
function fixture(store=openTrustedHeroStore(),attack=180,defend=140){
 store.registerPlayer('alice');store.registerPlayer('bob');store.registerPlayer('eve');
 store.putHero(hero('hero-a','alice',attack,1));
 store.putHero(hero('hero-d','bob',defend,2));
 return store;
}
const rules={context:{weaponAdvantageFactor:.5},
 lossPolicy:{lossFactor:.3,source:'V7_REFERENCE_CALCULATOR_NOT_MMHK_S2'},
 unitCatalog:[],maxRounds:100};
const baseCommand={commandId:'battle-001',attackerHeroId:'hero-a',defenderHeroId:'hero-d'};
const authenticate=ctx=>({authenticated:ctx?.token==='alice',playerId:ctx?.token});
function request(store,overrides={}){
 return {command:baseCommand,authContext:{token:'alice'},authenticate,
  authorizeTarget:()=>true,heroStore:store,trustedRules:rules,...overrides};
}
test('atomic historical duel permanently applies both losses ONCE and records ordered audit events',()=>{
 const store=fixture();
 try{
  const initialA=store.getHero('hero-a'),initialD=store.getHero('hero-d');
  const first=commitServerAuthorizedJactariBattle(request(store));
  assert.equal(first.replayed,false);
  assert.equal(first.persistence.applied,true);
  assert.equal(first.persistence.atomic,true);
  assert.equal(first.completeHistoricalCertification,false);
  assert.equal(first.revisions.attacker.before,1);
  assert.equal(first.revisions.attacker.after,2);
  const finalA=store.getHero('hero-a'),finalD=store.getHero('hero-d');
  assert.equal(finalA.revision,2);
  assert.equal(finalD.revision,2);
  assert.ok(finalA.army[0]?.count<=initialA.army[0].count);
  assert.ok(finalD.army[0]?.count<=initialD.army[0].count);
  assert.equal((initialA.army[0].count-(finalA.army[0]?.count??0)),
   first.permanent.attacker.reports[0].permanent);
  assert.equal((initialD.army[0].count-(finalD.army[0]?.count??0)),
   first.permanent.defender.reports[0].permanent);
  const events=store.getBattleEvents(baseCommand.commandId);
  assert.equal(events.length,first.eventCount);
  assert.ok(events.length>0);
  for(let i=0;i<events.length;i++)assert.equal(events[i].sequence,i);
  assert.deepEqual(store.getBattleAuditCounts(),{commands:1,events:events.length});
  const repeat=commitServerAuthorizedJactariBattle(request(store));
  assert.equal(repeat.replayed,true);
  assert.deepEqual({...repeat,replayed:false},first);
  assert.deepEqual(store.getHero('hero-a'),finalA);
  assert.deepEqual(store.getHero('hero-d'),finalD);
  assert.deepEqual(store.getBattleAuditCounts(),{commands:1,events:events.length});
 }finally{store.close();}
});
test('an idempotency key cannot be reused to attack a new target or under different rules',()=>{
 const store=fixture();
 try{
  store.putHero(hero('hero-b','bob',120,2));
  commitServerAuthorizedJactariBattle(request(store));
  const before=store.getBattleAuditCounts();
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(store,{
    command:{...baseCommand,defenderHeroId:'hero-b'}
  })),/Idempotency key collision/);
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(store,{
    trustedRules:{...rules,lossPolicy:{...rules.lossPolicy,lossFactor:.4}}
  })),/Idempotency key collision/);
  assert.deepEqual(store.getBattleAuditCounts(),before);
  assert.equal(store.getHero('hero-b').revision,1);
 }finally{store.close();}
});
test('different clients and inactive accounts cannot replay a previously committed receipt',()=>{
 const store=fixture();
 try{
  commitServerAuthorizedJactariBattle(request(store));
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(store,{
   authContext:{token:'eve'},authenticate:ctx=>({
    authenticated:true,playerId:ctx.token
   })
  })),/not the owner/);
  store.setPlayerEnabled('alice',false);
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(store)),
   /inactive combat actor/);
  assert.equal(store.getBattleAuditCounts().commands,1);
 }finally{store.close();}
});
test('authorization target denial and forged client combat parameters commit nothing',()=>{
 const store=fixture();
 try{
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(store,{
   authorizeTarget:()=>({allowed:true})
  })),/authorization denied/);
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(store,{
   authorizeTarget:()=>false
  })),/authorization denied/);
  for(const forged of [{attackPower:1000000},{attackers:army(100000)},
   {attackerHero:{attaque_modifiee:9999}},
   {lossFactor:.00001},{heroLegendaryGrants:{attacker:{}}}]){
   assert.throws(()=>commitServerAuthorizedJactariBattle(request(store,{
    command:{...baseCommand,...forged}
   })),/only contain idempotency key/);
  }
  assert.equal(store.getBattleAuditCounts().commands,0);
  assert.equal(store.getHero('hero-a').revision,1);
  assert.equal(store.getHero('hero-d').revision,1);
 }finally{store.close();}
});
test('PvP capture, wound and retreat are explicitly rejected without inventing transitions',()=>{
 for(const attack of [4,12,25]){
  const store=fixture(openTrustedHeroStore(),attack,180);
  try{
   assert.throws(()=>commitServerAuthorizedJactariBattle(request(store)),
    /PvP admission requires unimplemented hero consequences/);
   assert.equal(store.getHero('hero-a').revision,1);
   assert.equal(store.getHero('hero-d').revision,1);
   assert.deepEqual(store.getBattleAuditCounts(),{commands:0,events:0});
  }finally{store.close();}
 }
});
test('simulation error and injected post-write failure roll back BOTH armies and audit',()=>{
 const store=fixture();
 try{
  const originalA=store.getHero('hero-a'),originalD=store.getHero('hero-d');
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(store,{
   trustedRules:{...rules,maxRounds:0}
  })),/Invalid round limit/);
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(store,{
   beforeCommit:()=>{throw new Error('Simulated crash before commit');}
  })),/Simulated crash before commit/);
  assert.deepEqual(store.getHero('hero-a'),originalA);
  assert.deepEqual(store.getHero('hero-d'),originalD);
  assert.equal(store.getBattleReceipt(baseCommand.commandId),null);
  assert.deepEqual(store.getBattleAuditCounts(),{commands:0,events:0});
  const recovered=commitServerAuthorizedJactariBattle(request(store));
  assert.equal(recovered.replayed,false);
  assert.equal(store.getBattleAuditCounts().commands,1);
 }finally{store.close();}
});
test('idempotent receipts and original armies survive closing and reopening file-backed SQLite',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-committed-battle-'));
 const file=path.join(dir,'game.sqlite');let store;
 try{
  store=fixture(openTrustedHeroStore({filename:file}));
  const initial=commitServerAuthorizedJactariBattle(request(store));
  const armyA=store.getHero('hero-a'),armyD=store.getHero('hero-d');
  const events=store.getBattleEvents(baseCommand.commandId);
  store.close();store=openTrustedHeroStore({filename:file});
  const replay=commitServerAuthorizedJactariBattle(request(store));
  assert.equal(replay.replayed,true);
  assert.equal(replay.rulesDigest,initial.rulesDigest);
  assert.equal(store.getBattleAuditCounts().commands,1);
  assert.deepEqual(store.getHero('hero-a'),armyA);
  assert.deepEqual(store.getHero('hero-d'),armyD);
  assert.deepEqual(store.getBattleEvents(baseCommand.commandId),events);
 }finally{store?.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('two SQLite clients share durable idempotency and refuse a different battle under same key',()=>{
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-two-clients-'));
 const file=path.join(dir,'game.sqlite');let a,b;
 try{
  a=fixture(openTrustedHeroStore({filename:file}));
  b=openTrustedHeroStore({filename:file});
  const first=commitServerAuthorizedJactariBattle(request(a));
  const replay=commitServerAuthorizedJactariBattle(request(b));
  assert.deepEqual({...replay,replayed:false},first);
  assert.equal(a.getHero('hero-a').revision,2);
  assert.equal(b.getHero('hero-d').revision,2);
  assert.throws(()=>commitServerAuthorizedJactariBattle(request(b,{
   trustedRules:{...rules,context:{...rules.context,weaponAdvantageFactor:.75}}
  })),/Idempotency key collision/);
  assert.equal(b.getBattleAuditCounts().commands,1);
 }finally{a?.close();b?.close();fs.rmSync(dir,{recursive:true,force:true});}
});
test('fingerprints are canonical, and forged/unsupported rules cannot share same historical identifier',()=>{
 const ordered={context:{weaponAdvantageFactor:.5,extra:1},
  lossPolicy:{source:'reference',lossFactor:.3}};
 const reordered={lossPolicy:{lossFactor:.3,source:'reference'},
  context:{extra:1,weaponAdvantageFactor:.5}};
 assert.equal(computeJactariRulesDigest(ordered),computeJactariRulesDigest(reordered));
 assert.notEqual(computeJactariRulesDigest(ordered),
  computeJactariRulesDigest({...ordered,lossPolicy:{...ordered.lossPolicy,lossFactor:.31}}));
 assert.throws(()=>computeJactariRulesDigest({broken:Infinity}),/Nonfinite/);
 assert.throws(()=>computeJactariRulesDigest({broken:()=>{}}),/serializable/);
 assert.throws(()=>computeJactariRulesDigest({broken:undefined}),/serializable/);
});
test('engagement results reject malformed historical engine outcomes before committing anything',()=>{
 const store=fixture();
 try{
  const trustedArgs={commandId:'fake-result',actorPlayerId:'alice',
   attackerHeroId:'hero-a',defenderHeroId:'hero-d',
   rulesDigest:computeJactariRulesDigest(rules),
   authorizeTarget:()=>true};
  assert.throws(()=>store.commitAuthorizedBattle({...trustedArgs,
   calculate:()=>({status:'captured',events:[],persistentArmies:{}})}
  }),/Unsupported battle result/);
  assert.throws(()=>store.commitAuthorizedBattle({...trustedArgs,
   calculate:()=>({status:'attacker',events:[],permanent:{},
    persistentArmies:{attacker:army(999),defender:army(120)}})}
  }),/malformed persistent army/);
  assert.deepEqual(store.getBattleAuditCounts(),{commands:0,events:0});
  assert.equal(store.getHero('hero-a').revision,1);
 }finally{store.close();}
});
