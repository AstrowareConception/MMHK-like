import test from 'node:test';
import assert from 'node:assert/strict';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {dispatchServerHeroMission,arriveServerHeroMission,
 scheduleServerHeroReturn,completeServerHeroReturn}
 from './server-military-mission.mjs';
import {commitServerAuthorizedJactariBattle}
 from './server-transactional-battle.mjs';

const army=n=>[{count:n,weapon:'I',unitPower:10,goldCost:5},
 null,null,null,null,null,null];
const hero=(id,owner,faction,count)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},
 army:army(count),careers:[],legendarySelections:[],
 legendaryGrants:{},spellOrders:{}
});
const auth=ctx=>({authenticated:ctx?.token==='alice',playerId:ctx?.token});
const base={authContext:{token:'alice'},authenticate:auth,authorizeTarget:()=>true};
const schedule={nowMs:1000,arrivalAtMs:2000};
const move={missionId:'geo-mission',attackerHeroId:'hero-a',defenderHeroId:'hero-d'};
const rules={context:{weaponAdvantageFactor:.5},
 lossPolicy:{lossFactor:.3,source:'GEO_REFERENCE_NOT_CERTIFIED_S2'},
 unitCatalog:[],maxRounds:100};
function fixture({protectedUntilMs=900,secondCity=false}={}){
 const store=openTrustedHeroStore();
 store.registerPlayer('alice');store.registerPlayer('bob');
 store.putHero(hero('hero-a','alice',1,180));
 store.putHero(hero('hero-d','bob',2,140));
 store.defineMilitaryWorld({worldId:'world-01',worldSize:100});
 store.registerMilitaryCity({cityId:'city-a',worldId:'world-01',
  ownerPlayerId:'alice',x:1,y:1,firstCity:false});
 store.registerMilitaryCity({cityId:'city-d',worldId:'world-01',
  ownerPlayerId:'bob',x:100,y:100,firstCity:true,protectedUntilMs});
 if(secondCity)store.registerMilitaryCity({cityId:'city-d-other',worldId:'world-01',
  ownerPlayerId:'bob',x:99,y:98,firstCity:false});
 store.stationHeroInCity({heroId:'hero-a',cityId:'city-a'});
 store.stationHeroInCity({heroId:'hero-d',cityId:'city-d'});
 return store;
}
const dispatch=(store,extra={})=>dispatchServerHeroMission({
 ...base,command:move,heroStore:store,trustedSchedule:schedule,...extra
});
const arrive=(store,extra={})=>arriveServerHeroMission({
 ...base,command:{missionId:move.missionId},heroStore:store,
 serverNowMs:2000,...extra
});
const fight=(store,extra={})=>commitServerAuthorizedJactariBattle({
 ...base,command:{...move,commandId:'geo-battle'},
 heroStore:store,trustedRules:rules,serverNowMs:2000,...extra
});
test('persisted toroidal city route is binding during dispatch, arrival, atomic battle and return',()=>{
 const store=fixture();
 try{
  const a=store.getHeroWorldPosition('hero-a');
  const d=store.getHeroWorldPosition('hero-d');
  assert.equal(a.worldId,'world-01');
  assert.equal(d.firstCity,true);
  assert.equal(d.protectedUntilMs,900);
  const mission=dispatch(store);
  assert.equal(mission.status,'traveling');
  const route=store.getMissionRoute(move.missionId);
  assert.equal(route.worldId,'world-01');
  assert.deepEqual(route.origin,{cityId:'city-a',x:1,y:1});
  assert.deepEqual(route.destination,{cityId:'city-d',x:100,y:100});
  assert.equal(route.distance,Math.sqrt(2));
  assert.equal(route.provenance.includes('NOT verified S2 travel time'),true);
  assert.equal(dispatch(store).replayed,true);
  assert.deepEqual(store.getMissionRoute(move.missionId),route);
  assert.equal(arrive(store).status,'arrived');
  assert.throws(()=>fight(store,{serverNowMs:null}),/server-verified epoch milliseconds/);
  assert.throws(()=>fight(store,{serverNowMs:1999}),/server-verified|.*arrival|not reached/);
  const battle=fight(store);
  assert.equal(battle.persistence.applied,true);
  assert.equal(battle.missionId,move.missionId);
  assert.equal(store.getMission(move.missionId).status,'returning');
  assert.equal(fight(store).replayed,true);
  scheduleServerHeroReturn({...base,heroStore:store,
   command:{missionId:move.missionId},
   trustedSchedule:{nowMs:2001,returnAtMs:3000}});
  completeServerHeroReturn({...base,heroStore:store,
   command:{missionId:move.missionId},serverNowMs:3000});
  assert.equal(store.getMission(move.missionId).status,'completed');
  assert.equal(store.getBattleAuditCounts().commands,1);
 }finally{store.close();}
});
test('first city novice protection from trusted expiration blocks dispatch, even with permissive callback',()=>{
 const store=fixture({protectedUntilMs:604800000});
 try{
  assert.throws(()=>dispatch(store),/beginner protection/);
  assert.equal(store.getMission(move.missionId),null);
  assert.equal(store.getBattleAuditCounts().commands,0);
  assert.equal(store.getHero('hero-a').revision,1);
  const permitted=dispatch(store,{trustedSchedule:{
   nowMs:604800000,arrivalAtMs:604801000}});
  assert.equal(permitted.status,'traveling');
 }finally{store.close();}
});
test('the original target cannot move away before arrival without invalidating the stored route',()=>{
 const store=fixture({secondCity:true});
 try{
  dispatch(store);
  store.stationHeroInCity({heroId:'hero-d',cityId:'city-d-other'});
  assert.throws(()=>arrive(store),/location changed since dispatch/);
  assert.equal(store.getMission(move.missionId).status,'traveling');
  assert.deepEqual(store.getMissionEvents(move.missionId)
   .map(x=>x.event.phase),['dispatched']);
  store.stationHeroInCity({heroId:'hero-d',cityId:'city-d'});
  assert.equal(arrive(store).status,'arrived');
  store.stationHeroInCity({heroId:'hero-d',cityId:'city-d-other'});
  assert.throws(()=>fight(store),/location changed since dispatch/);
  assert.equal(store.getBattleAuditCounts().commands,0);
 }finally{store.close();}
});
test('world records prevent mismatched ownership, invalid coordinates, duplicate cities and relocations',()=>{
 const store=fixture();
 try{
  assert.throws(()=>store.registerMilitaryCity({cityId:'duplicate',worldId:'world-01',
   ownerPlayerId:'bob',x:1,y:1,firstCity:false}),/UNIQUE|constraint/i);
  assert.throws(()=>store.registerMilitaryCity({cityId:'out-of-world',worldId:'world-01',
   ownerPlayerId:'bob',x:101,y:1,firstCity:false}),/coordinate/);
  assert.throws(()=>store.stationHeroInCity({heroId:'hero-a',cityId:'city-d'}),
   /owned by its player/);
  assert.throws(()=>store.registerMilitaryCity({cityId:'unapproved',worldId:'world-01',
   ownerPlayerId:'bob',x:5,y:5,firstCity:true}),/trusted beginner protection expiry/);
  dispatch(store);
  assert.throws(()=>store.stationHeroInCity({heroId:'hero-a',cityId:'city-a'}),
   /Cannot relocate hero while a military mission is active/);
 }finally{store.close();}
});
test('cross-world engagements fail and do not reserve or write attacker armies',()=>{
 const store=fixture();
 try{
  store.defineMilitaryWorld({worldId:'world-02',worldSize:40});
  store.registerMilitaryCity({cityId:'bob-w2',worldId:'world-02',
   ownerPlayerId:'bob',x:2,y:3,firstCity:false});
  store.stationHeroInCity({heroId:'hero-d',cityId:'bob-w2'});
  assert.throws(()=>dispatch(store),/Cross-world military attack forbidden/);
  assert.equal(store.getMission(move.missionId),null);
 }finally{store.close();}
});
test('world mapped battles require a mission and a server clock, even from a trusted actor',()=>{
 const store=fixture();
 try{
  assert.throws(()=>commitServerAuthorizedJactariBattle({
   ...base,heroStore:store,
   command:{commandId:'direct-world',attackerHeroId:'hero-a',
    defenderHeroId:'hero-d'},trustedRules:rules,serverNowMs:2000
  }),/registered arrived military mission/);
  assert.deepEqual(store.getBattleAuditCounts(),{commands:0,events:0});
 }finally{store.close();}
});
