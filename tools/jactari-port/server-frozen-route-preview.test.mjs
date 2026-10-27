import test from 'node:test';
import assert from 'node:assert/strict';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {dispatchServerHeroMission} from './server-military-mission.mjs';
import {replayFrozenCandidateMissionRoute} from './server-frozen-route-preview.mjs';

const hero=(id,owner,faction)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},
 army:[{count:200,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null],
 careers:[],legendarySelections:[],legendaryGrants:{},spellOrders:{}
});
function setup(withWorld=true){
 const s=openTrustedHeroStore();
 s.registerPlayer('alice');s.registerPlayer('bob');
 s.putHero(hero('attacker','alice',1));
 s.putHero(hero('defender','bob',2));
 if(withWorld){
  s.defineMilitaryWorld({worldId:'world',worldSize:20});
  s.registerMilitaryCity({cityId:'start',worldId:'world',
   ownerPlayerId:'alice',x:1,y:1,firstCity:false});
  s.registerMilitaryCity({cityId:'finish',worldId:'world',
   ownerPlayerId:'bob',x:5,y:1,firstCity:false});
  s.stationHeroInCity({heroId:'attacker',cityId:'start'});
  s.stationHeroInCity({heroId:'defender',cityId:'finish'});
  s.createMilitaryAlliance({worldId:'world',allianceId:'blue'});
  s.createMilitaryAlliance({worldId:'world',allianceId:'red'});
  s.setMilitaryAllianceMembership({worldId:'world',playerId:'alice',allianceId:'red'});
  s.setMilitaryAllianceMembership({worldId:'world',playerId:'bob',allianceId:'blue'});
  s.setMilitaryDiplomacy({worldId:'world',
   firstAllianceId:'red',secondAllianceId:'blue',relation:'hostile'});
  s.setMilitaryTerritoryClaim({worldId:'world',x:3,y:1,ownerAllianceId:'blue'});
 }
 dispatchServerHeroMission({heroStore:s,
  authContext:{token:'alice'},authenticate:c=>({
   authenticated:c?.token==='alice',playerId:c?.token}),
  authorizeTarget:()=>true,
  command:{missionId:'m',attackerHeroId:'attacker',defenderHeroId:'defender'},
  trustedSchedule:{nowMs:1000,arrivalAtMs:2000}});
 return s;
}
test('forward and inverse paths replay the original distance with separate direction metadata',()=>{
 const s=setup();
 try{
  const forward=replayFrozenCandidateMissionRoute({
   heroStore:s,missionId:'m'});
  const back=replayFrozenCandidateMissionRoute({
   heroStore:s,missionId:'m',direction:'inbound'});
  assert.equal(forward.territory.totalDistance,4);
  assert.equal(back.territory.totalDistance,4);
  assert.deepEqual(forward.waypoints,[{x:1,y:1},{x:5,y:1}]);
  assert.deepEqual(back.waypoints,[{x:5,y:1},{x:1,y:1}]);
  assert.equal(back.officialReturnSchedule,false);
  assert.equal(forward.authoritativeArrivalTime,false);
  assert.equal('trustedSchedule' in back,false);
  assert.ok(forward.territory.segments.some(x=>x.territory==='hostile'));
 }finally{s.close();}
});
test('historic forward and inverse relation is not overwritten after alliance flips',()=>{
 const s=setup();
 try{
  const before=replayFrozenCandidateMissionRoute({heroStore:s,missionId:'m'});
  s.setMilitaryDiplomacy({worldId:'world',firstAllianceId:'red',
   secondAllianceId:'blue',relation:'allied'});
  s.setMilitaryTerritoryClaim({worldId:'world',x:3,y:1,ownerAllianceId:'red'});
  const replay=replayFrozenCandidateMissionRoute({heroStore:s,missionId:'m'});
  assert.deepEqual(replay.territory,before.territory);
  assert.equal(s.compareFrozenMissionTerritory('m').territoryUnchanged,false);
  assert.deepEqual(
   replayFrozenCandidateMissionRoute({
    heroStore:s,missionId:'m',direction:'inbound'}).territory
   .segments.map(x=>x.territory).includes('hostile'),true);
 }finally{s.close();}
});
test('undefined directions and non-geographic legacy missions fail closed',()=>{
 const geo=setup();
 const legacy=setup(false);
 try{
  assert.throws(()=>replayFrozenCandidateMissionRoute({
   heroStore:geo,missionId:'m',direction:'teleport'}),/Direction/);
  assert.throws(()=>replayFrozenCandidateMissionRoute({
   heroStore:geo,missionId:'nope'}),/Unknown/);
  assert.throws(()=>replayFrozenCandidateMissionRoute({
   heroStore:legacy,missionId:'m'}),/no frozen geographic/);
 }finally{geo.close();legacy.close();}
});
