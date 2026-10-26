import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {commitServerAuthorizedJactariBattle} from './server-transactional-battle.mjs';
import {dispatchServerHeroMission,arriveServerHeroMission,
 scheduleServerHeroReturn,completeServerHeroReturn,cancelServerUnresolvedMission}
 from './server-military-mission.mjs';

const army=n=>[{count:n,unitPower:10,weapon:'I',goldCost:5},
 null,null,null,null,null,null];
const hero=(id,owner,count,faction)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},
 army:army(count),careers:[],spellOrders:{},legendarySelections:[],
 legendaryGrants:{}
});
function fixture(file=':memory:'){
 const store=openTrustedHeroStore({filename:file});
 store.registerPlayer('alice');store.registerPlayer('bob');store.registerPlayer('eve');
 store.putHero(hero('a','alice',180,1));
 store.putHero(hero('d','bob',140,2));
 return store;
}
const rules={context:{weaponAdvantageFactor:.5},
 lossPolicy:{lossFactor:.3,source:'MISSION_TEST_JACTARI_NOT_MMHK_S2'},
 unitCatalog:[],maxRounds:100};
const auth=ctx=>({authenticated:ctx.token==='alice',playerId:ctx.token});
const missionCommand={missionId:'mission-001',attackerHeroId:'a',defenderHeroId:'d'};
const battleCommand={commandId:'battle-001',attackerHeroId:'a',defenderHeroId:'d',
 missionId:'mission-001'};
function args(store,extra={}){
 return {authContext:{token:'alice'},authenticate:auth,
  authorizeTarget:()=>true,heroStore:store,...extra};
}
const launch=(store,extra={})=>dispatchServerHeroMission(args(store,{
 command:missionCommand,trustedSchedule:{nowMs:1000,arrivalAtMs:2000},...extra
}));
const arrive=(store,extra={})=>arriveServerHeroMission(args(store,{
 command:{missionId:'mission-001'},serverNowMs:2000,...extra
}));
const fight=(store,extra={})=>commitServerAuthorizedJactariBattle(args(store,{
 command:battleCommand,trustedRules:rules,...extra
}));
const schedule=(store,extra={})=>scheduleServerHeroReturn(args(store,{
 command:{missionId:'mission-001'},
 trustedSchedule:{nowMs:2001,returnAtMs:3000},...extra
}));
const finish=(store,extra={})=>completeServerHeroReturn(args(store,{
 command:{missionId:'mission-001'},serverNowMs:3000,...extra
}));

test('full mission lifecycle applies combat only after authorized arrival and releases hero after return',()=>{
 const store=fixture();
 try{
  const initial=store.getHero('a');
  assert.equal(launch(store).status,'traveling');
  assert.equal(store.getMission('mission-001').attackerRevision,1);
  assert.deepEqual(store.getHero('a'),initial,'Dispatch must not remove troops');
  assert.throws(()=>fight(store),/has not reached an authorized arrival/);
  assert.throws(()=>arrive(store,{serverNowMs:1999}),/not arrived yet/);
  assert.equal(arrive(store).status,'arrived');
  assert.equal(arrive(store).replayed,true);
  const receipt=fight(store);
  assert.equal(receipt.persistence.applied,true);
  assert.equal(receipt.missionId,'mission-001');
  assert.equal(receipt.replayed,false);
  assert.equal(store.getMission('mission-001').status,'returning');
  assert.equal(store.getMission('mission-001').battleCommandId,'battle-001');
  assert.equal(fight(store).replayed,true);
  assert.throws(()=>finish(store),/was not scheduled/);
  assert.equal(schedule(store).returnAtMs,3000);
  assert.equal(schedule(store).replayed,true);
  assert.throws(()=>finish(store,{serverNowMs:2999}),/not yet due/);
  assert.equal(finish(store).status,'completed');
  assert.equal(finish(store).replayed,true);
  assert.equal(store.getHero('a').revision,2);
  assert.equal(store.getHero('d').revision,2);
  assert.equal(store.getBattleAuditCounts().commands,1);
  const timeline=store.getMissionEvents('mission-001');
  assert.deepEqual(timeline.map(x=>x.event.phase),[
   'dispatched','arrived','battle_committed','return_scheduled','return_completed'
  ]);
  assert.deepEqual(timeline.map(x=>x.sequence),[0,1,2,3,4]);
  const changed=store.getHero('a');
  const {revision,...withoutRev}=changed;
  assert.equal(store.replaceHero({...withoutRev,profile:{
    ...withoutRev.profile,level:31}},{expectedRevision:revision}).revision,3);
 }finally{store.close();}
});
test('attacker cannot start multiple active missions, or update its army or fight directly',()=>{
 const store=fixture();
 try{
  assert.equal(launch(store).replayed,false);
  assert.equal(launch(store).replayed,true);
  assert.throws(()=>dispatchServerHeroMission(args(store,{
    command:{...missionCommand,missionId:'mission-002'},
    trustedSchedule:{nowMs:1000,arrivalAtMs:2000}
  })),/already reserved/);
  assert.throws(()=>launch(store,{trustedSchedule:{nowMs:1000,arrivalAtMs:2100}}),
   /Mission ID collision/);
  const {revision,...record}=store.getHero('a');
  assert.throws(()=>store.replaceHero(record,{expectedRevision:revision}),
   /reserved by active military mission/);
  assert.throws(()=>commitServerAuthorizedJactariBattle(args(store,{
   command:{commandId:'direct',attackerHeroId:'a',defenderHeroId:'d'},
   trustedRules:rules
  })),/reserved by a military mission/);
  assert.equal(store.getBattleAuditCounts().commands,0);
 }finally{store.close();}
});
test('arrival authorization is rechecked; forged client times and premature return fail closed',()=>{
 const store=fixture();
 try{
  assert.throws(()=>launch(store,{command:{...missionCommand,
   arrivalAtMs:0}}),/forbidden fields/);
  assert.throws(()=>launch(store,{trustedSchedule:{nowMs:1000,arrivalAtMs:500}}),
   /must follow departure/);
  launch(store);
  assert.throws(()=>arrive(store,{authorizeTarget:()=>false}),
   /Arrival target authorization denied/);
  assert.equal(store.getMission('mission-001').status,'traveling');
  assert.throws(()=>schedule(store),/no committed combat return/);
  assert.throws(()=>finish(store),/was not scheduled/);
  assert.equal(arrive(store).status,'arrived');
  assert.throws(()=>schedule(store),/no committed combat return/);
 }finally{store.close();}
});
test('cancel unresolved mission requires distinct server policy and unlocks its hero',()=>{
 const store=fixture();
 try{
  launch(store);
  const data=args(store,{command:{missionId:'mission-001'}});
  assert.throws(()=>cancelServerUnresolvedMission(data),
   /Administrative mission cancellation policy required/);
  assert.throws(()=>cancelServerUnresolvedMission({...data,
   authorizeCancellation:()=>false}),/cancellation denied/);
  const cancel=cancelServerUnresolvedMission({...data,
   authorizeCancellation:()=>true});
  assert.equal(cancel.status,'cancelled');
  assert.equal(cancelServerUnresolvedMission({...data,
   authorizeCancellation:()=>true}).replayed,true);
  assert.deepEqual(store.getMissionEvents('mission-001').map(x=>x.event.phase),
   ['dispatched','administratively_cancelled']);
  assert.throws(()=>fight(store),/has not reached an authorized arrival/);
  assert.equal(dispatchServerHeroMission(args(store,{
   command:{...missionCommand,missionId:'mission-002'},
   trustedSchedule:{nowMs:3000,arrivalAtMs:4000}
  })).status,'traveling');
 }finally{store.close();}
});
test('battle transaction error rolls back mission state and both hero armies together',()=>{
 const store=fixture();
 try{
  launch(store);arrive(store);
  const a=store.getHero('a'),d=store.getHero('d');
  assert.throws(()=>fight(store,{beforeCommit:()=>{
   throw new Error('Fail after mission and army writes');
  }}),/Fail after mission and army writes/);
  assert.equal(store.getMission('mission-001').status,'arrived');
  assert.equal(store.getMission('mission-001').battleCommandId,null);
  assert.deepEqual(store.getHero('a'),a);
  assert.deepEqual(store.getHero('d'),d);
  assert.deepEqual(store.getBattleAuditCounts(),{commands:0,events:0});
  assert.deepEqual(store.getMissionEvents('mission-001').map(x=>x.event.phase),[
    'dispatched','arrived'
  ],'Rolled-back battle writes must not create an audit entry');
  assert.equal(fight(store).replayed,false);
  assert.equal(store.getMission('mission-001').status,'returning');
  assert.throws(()=>cancelServerUnresolvedMission(args(store,{
   command:{missionId:'mission-001'},authorizeCancellation:()=>true
  })),/Cannot cancel an already committed battle mission/);
 }finally{store.close();}
});
test('mission lifecycle persists across SQLite connections and process-style reopen',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-missions-'));
 const filename=path.join(temp,'game.sqlite');let a,b;
 try{
  a=fixture(filename);
  launch(a);
  b=openTrustedHeroStore({filename});
  assert.throws(()=>dispatchServerHeroMission(args(b,{
   command:{...missionCommand,missionId:'mission-other'},
   trustedSchedule:{nowMs:1000,arrivalAtMs:2000}
  })),/already reserved/);
  a.close();a=null;
  assert.equal(arrive(b).status,'arrived');
  const receipt=fight(b);
  assert.equal(receipt.replayed,false);
  b.close();b=openTrustedHeroStore({filename});
  assert.equal(fight(b).replayed,true);
  assert.equal(schedule(b).returnAtMs,3000);
  b.close();b=openTrustedHeroStore({filename});
  assert.equal(finish(b).status,'completed');
  assert.equal(b.getBattleAuditCounts().commands,1);
  assert.equal(b.getMission('mission-001').status,'completed');
  assert.deepEqual(b.getMissionEvents('mission-001').map(x=>x.event.phase),[
   'dispatched','arrived','battle_committed','return_scheduled','return_completed'
  ]);
 }finally{a?.close();b?.close();fs.rmSync(temp,{recursive:true,force:true});}
});
test('the same battle idempotency key cannot be bound to a different mission',()=>{
 const store=fixture();
 try{
  launch(store);arrive(store);fight(store);
  assert.throws(()=>commitServerAuthorizedJactariBattle(args(store,{
   command:{...battleCommand,missionId:'mission-fake'},trustedRules:rules
  })),/mission binding differs/);
  assert.equal(store.getBattleAuditCounts().commands,1);
  assert.equal(store.getMission('mission-001').status,'returning');
 }finally{store.close();}
});
test('another actor cannot arrive, schedule, finish or cancel an owned mission',()=>{
 const store=fixture();
 try{
  launch(store);
  const evil={authContext:{token:'eve'},
   authenticate:ctx=>({authenticated:true,playerId:ctx.token})};
  assert.throws(()=>arrive(store,evil),/Unauthorized mission arrival/);
  assert.throws(()=>cancelServerUnresolvedMission(args(store,{
   ...evil,command:{missionId:'mission-001'},authorizeCancellation:()=>true
  })),/Unauthorized or unknown military mission/);
  assert.throws(()=>schedule(store,evil),/Unauthorized or unknown military mission return/);
  assert.throws(()=>finish(store,evil),/Unauthorized or unknown military mission/);
  assert.equal(store.getMission('mission-001').status,'traveling');
 }finally{store.close();}
});

test('field interception of another traveling hero is refused until world-movement rules exist',()=>{
 const store=fixture();
 const bob={authContext:{token:'bob'},
  authenticate:ctx=>({authenticated:true,playerId:ctx.token})};
 try{
  launch(store);
  assert.throws(()=>dispatchServerHeroMission(args(store,{
   ...bob,command:{missionId:'bob-mission',attackerHeroId:'d',defenderHeroId:'a'},
   trustedSchedule:{nowMs:1100,arrivalAtMs:2200}
  })),/Target hero is on an active mission/);
  assert.throws(()=>commitServerAuthorizedJactariBattle(args(store,{
   ...bob,command:{commandId:'bob-attack',attackerHeroId:'d',defenderHeroId:'a'},
   trustedRules:rules
  })),/Defending hero is traveling or returning/);
  assert.deepEqual(store.getBattleAuditCounts(),{commands:0,events:0});
 }finally{store.close();}
});
test('a mission cannot resolve against a target that departed after initial dispatch',()=>{
 const store=fixture();
 const bob={authContext:{token:'bob'},
  authenticate:ctx=>({authenticated:true,playerId:ctx.token})};
 try{
  store.putHero(hero('e','eve',160,3));
  launch(store);
  const outbound=dispatchServerHeroMission(args(store,{
    ...bob,command:{missionId:'bob-travel',attackerHeroId:'d',defenderHeroId:'e'},
    trustedSchedule:{nowMs:1100,arrivalAtMs:2400}
  }));
  assert.equal(outbound.status,'traveling');
  assert.throws(()=>arrive(store),/Mission defender departed/);
  assert.equal(store.getMission('mission-001').status,'traveling');
  cancelServerUnresolvedMission(args(store,{
   ...bob,command:{missionId:'bob-travel'},authorizeCancellation:()=>true
  }));
  assert.equal(arrive(store).status,'arrived');
 }finally{store.close();}
});

test('historical prebattle capture cannot be invented: arrival remains unresolved until authorized cancellation',()=>{
 const store=openTrustedHeroStore();
 try{
  store.registerPlayer('alice');store.registerPlayer('bob');
  store.putHero(hero('a','alice',4,1));
  store.putHero(hero('d','bob',180,2));
  launch(store);arrive(store);
  const beforeA=store.getHero('a'),beforeD=store.getHero('d');
  assert.throws(()=>fight(store),
   /PvP admission requires unimplemented hero consequences/);
  assert.equal(store.getMission('mission-001').status,'arrived');
  assert.equal(store.getBattleReceipt('battle-001'),null);
  assert.deepEqual(store.getHero('a'),beforeA);
  assert.deepEqual(store.getHero('d'),beforeD);
  assert.deepEqual(store.getMissionEvents('mission-001')
   .map(row=>row.event.phase),['dispatched','arrived']);
  assert.equal(cancelServerUnresolvedMission(args(store,{
   command:{missionId:'mission-001'},authorizeCancellation:()=>true
  })).status,'cancelled');
  assert.equal(store.getMission('mission-001').battleCommandId,null);
 }finally{store.close();}
});
