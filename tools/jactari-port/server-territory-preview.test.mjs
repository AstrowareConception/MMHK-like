import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import {openTrustedHeroStore} from './trusted-hero-store.mjs';
import {previewCandidateTerritorialMission,assertCandidateTerritoryPreviewFresh}
 from './server-territory-preview.mjs';
const army=n=>[{count:n,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null];
const hero=(id,owner,faction)=>({
 id,ownerId:owner,profile:{faction,archetype:0,level:30},army:army(70),
 careers:[],legendarySelections:[],legendaryGrants:{},spellOrders:{}
});
const policy={departAtMs:100000,speedUnitsPerHour:4,
 haltRule:{thresholdPoints:100,durationMs:2*3600000,
  pointsPerDistanceUnit:1,exemptCounter:'preserve'},
 nightPolicy:'disabled',haltClockDuringTruce:'pause'};
function fixture(filename=':memory:'){
 const s=openTrustedHeroStore({filename});
 s.registerPlayer('alice');s.registerPlayer('bob');s.registerPlayer('carl');
 s.putHero(hero('hero-a','alice',1));
 s.putHero(hero('hero-b','bob',2));
 s.defineMilitaryWorld({worldId:'world',worldSize:20});
 s.registerMilitaryCity({cityId:'first',worldId:'world',
  ownerPlayerId:'alice',x:1,y:1,firstCity:false});
 s.registerMilitaryCity({cityId:'last',worldId:'world',
  ownerPlayerId:'bob',x:5,y:1,firstCity:false});
 s.stationHeroInCity({heroId:'hero-a',cityId:'first'});
 s.stationHeroInCity({heroId:'hero-b',cityId:'last'});
 s.createMilitaryAlliance({worldId:'world',allianceId:'red'});
 s.createMilitaryAlliance({worldId:'world',allianceId:'blue'});
 s.setMilitaryAllianceMembership({worldId:'world',playerId:'alice',allianceId:'red'});
 s.setMilitaryAllianceMembership({worldId:'world',playerId:'bob',allianceId:'blue'});
 s.setMilitaryDiplomacy({worldId:'world',firstAllianceId:'blue',
  secondAllianceId:'red',relation:'hostile'});
 s.setMilitaryTerritoryClaim({worldId:'world',x:3,y:1,ownerAllianceId:'blue'});
 return s;
}
const preview=s=>previewCandidateTerritorialMission({
 heroStore:s,attackerHeroId:'hero-a',defenderHeroId:'hero-b',travelPolicy:policy});
test('trusted SQLite claims + diplomacy derive a timestamped candidate travel preview',()=>{
 const s=fixture();
 try{
  const j=preview(s),snap=s.getWorldTerritorySnapshot('world');
  assert.equal(j.worldRevision,snap.revision);
  assert.equal(j.territory.totalDistance,4);
  assert.equal(j.simulation.totalDistance,4);
  assert.equal(j.simulation.estimatedArrivalAtMs,3700000);
  assert.ok(j.territory.segments.some(x=>x.territory==='hostile'));
  assert.equal(j.authoritativeArrivalTime,false);
  assert.equal(j.simulation.authoritativeArrivalTime,false);
  assert.equal(assertCandidateTerritoryPreviewFresh({heroStore:s,preview:j}),true);
  assert.equal('trustedSchedule' in j,false);
  assert.equal('trustedSchedule' in j.simulation,false);
 }finally{s.close();}
});
test('diplomacy or claim mutation increments world revision and invalidates preview',()=>{
 const s=fixture();
 try{
  const before=preview(s);
  s.setMilitaryDiplomacy({worldId:'world',firstAllianceId:'red',
   secondAllianceId:'blue',relation:'allied'});
  assert.throws(()=>assertCandidateTerritoryPreviewFresh({
   heroStore:s,preview:before}),/stale/);
  const now=preview(s);
  assert.ok(now.worldRevision>before.worldRevision);
  assert.equal(now.territory.segments.some(x=>x.territory==='hostile'),false);
  s.setMilitaryTerritoryClaim({worldId:'world',x:3,y:1,ownerAllianceId:null});
  assert.throws(()=>assertCandidateTerritoryPreviewFresh({
   heroStore:s,preview:now}),/stale/);
 }finally{s.close();}
});
test('city cells cannot be claimed, foreign alliances and cross-world diplomacy fail',()=>{
 const s=fixture();
 try{
  const before=s.getWorldTerritorySnapshot('world');
  assert.throws(()=>s.setMilitaryTerritoryClaim({
   worldId:'world',x:1,y:1,ownerAllianceId:'blue'}),/City tiles/);
  s.defineMilitaryWorld({worldId:'other',worldSize:20});
  s.createMilitaryAlliance({worldId:'other',allianceId:'external'});
  assert.throws(()=>s.setMilitaryAllianceMembership({
   worldId:'world',playerId:'alice',allianceId:'external'}),/belong to world/);
  assert.throws(()=>s.setMilitaryDiplomacy({
   worldId:'world',firstAllianceId:'red',secondAllianceId:'external',
   relation:'hostile'}),/same world/);
  assert.throws(()=>s.setMilitaryTerritoryClaim({
   worldId:'world',x:2,y:1,ownerAllianceId:'external'}),/same world/);
  assert.deepEqual(s.getWorldTerritorySnapshot('world'),before);
 }finally{s.close();}
});
test('missing diplomacy is unknown rather than silently neutral',()=>{
 const s=fixture();
 try{
  s.createMilitaryAlliance({worldId:'world',allianceId:'third'});
  s.setMilitaryTerritoryClaim({worldId:'world',x:2,y:1,ownerAllianceId:'third'});
  assert.throws(()=>preview(s),/Unknown diplomacy/);
  s.setMilitaryDiplomacy({worldId:'world',firstAllianceId:'third',
   secondAllianceId:'red',relation:'neutral'});
  const j=preview(s);
  assert.ok(j.territory.segments.some(x=>x.territory==='neutral'));
 }finally{s.close();}
});
test('Grail experiment needs persisted defender alliance as target and labels only it',()=>{
 const s=fixture();
 try{
  const base={heroStore:s,attackerHeroId:'hero-a',defenderHeroId:'hero-b',
   missionKind:'grailAttack',travelPolicy:policy};
  assert.throws(()=>previewCandidateTerritorialMission({
   ...base,targetAllianceId:'red'}),/target must match/);
  const j=previewCandidateTerritorialMission({...base,targetAllianceId:'blue'});
  assert.equal(j.territory.segments.some(x=>x.territory==='targetAlliance'),true);
 }finally{s.close();}
});
test('file-backed SQLite snapshot is consistent and persists through reopen',()=>{
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'mmhk-diplomacy-'));
 const filename=path.join(temp,'persist.sqlite');
 let a,b;
 try{
  a=fixture(filename);
  const before=preview(a);
  b=openTrustedHeroStore({filename});
  assert.deepEqual(b.getWorldTerritorySnapshot('world'),
   a.getWorldTerritorySnapshot('world'));
  assert.deepEqual(preview(b),before);
  b.setMilitaryTerritoryClaim({worldId:'world',x:4,y:1,ownerAllianceId:'red'});
  assert.throws(()=>assertCandidateTerritoryPreviewFresh({
   heroStore:a,preview:before}),/stale/);
  a.close();a=null;
  assert.ok(b.getWorldTerritorySnapshot('world').revision>before.worldRevision);
  assert.equal(preview(b).simulation.totalDistance,4);
 }finally{a?.close();b?.close();fs.rmSync(temp,{recursive:true,force:true});}
});
test('bad candidate policy cannot be promoted to military schedule',()=>{
 const s=fixture();
 try{
  assert.throws(()=>previewCandidateTerritorialMission({
   heroStore:s,attackerHeroId:'hero-a',defenderHeroId:'hero-b',
   travelPolicy:{...policy,trustedSchedule:{arrivalAtMs:0}}
  }),/policy/);
  assert.throws(()=>previewCandidateTerritorialMission({
   heroStore:s,attackerHeroId:'hero-a',defenderHeroId:'hero-b',
   travelPolicy:{...policy,speedUnitsPerHour:0}
  }),/speedUnitsPerHour/);
 }finally{s.close();}
});
