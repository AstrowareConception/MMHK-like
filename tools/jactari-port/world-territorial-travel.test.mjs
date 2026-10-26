import test from 'node:test';
import assert from 'node:assert/strict';
import {simulateCandidateTerritorialTravel,GUIDE_G05_HALT_OBSERVATION}
 from './world-territorial-travel.mjs';
const H=3600000;
const haltRule={thresholdPoints:8,durationMs:2*H,
 pointsPerDistanceUnit:2,exemptCounter:'preserve'};
const leg=(x1,x2,territory='hostile')=>({
 from:{x:x1,y:50},to:{x:x2,y:50},territory
});
const config={
 worldSize:100,segments:[leg(1,100)],departAtMs:21*H,
 speedUnitsPerHour:4,missionKind:'ordinary',
 haltRule,nightPolicy:'disabled',haltClockDuringTruce:'pause'
};
test('source-backed toroidal geometry, externally supplied speed and candidate classification',()=>{
 const j=simulateCandidateTerritorialTravel(config);
 assert.equal(j.totalDistance,1);
 assert.equal(j.haltCount,0);
 assert.equal(j.estimatedArrivalAtMs,21*H+15*60000);
 assert.equal(j.authoritativeArrivalTime,false);
 assert.equal(j.historicalCertification,false);
 assert.equal('trustedSchedule' in j,false);
 assert.equal(GUIDE_G05_HALT_OBSERVATION.thresholdPoints,8);
});
test('two-hour halt starts only when a further eligible move is needed',()=>{
 const rule={...haltRule,thresholdPoints:1,pointsPerDistanceUnit:1};
 const j=simulateCandidateTerritorialTravel({
  ...config,departAtMs:0,speedUnitsPerHour:1,haltRule:rule,
  segments:[leg(1,2)]});
 assert.equal(j.haltCount,0);
 const two=simulateCandidateTerritorialTravel({
  ...config,departAtMs:0,speedUnitsPerHour:1,haltRule:rule,
  segments:[leg(1,3)]});
 assert.equal(two.haltCount,1,JSON.stringify({distance:two.totalDistance,events:two.events,meter:two.movementPointsCarried}));
 assert.equal(two.estimatedArrivalAtMs,4*H);
 assert.deepEqual(two.events.map(e=>e.phase),['move','halt','move']);
});
test('the S2 Grail hypothesis applies stops only inside target-alliance territory',()=>{
 const rule={...haltRule,thresholdPoints:1,pointsPerDistanceUnit:1};
 const segments=[leg(1,2,'neutral'),leg(2,3,'hostile'),leg(3,5,'targetAlliance')];
 const normal=simulateCandidateTerritorialTravel({
  ...config,departAtMs:0,speedUnitsPerHour:4,haltRule:rule,segments});
 const grail=simulateCandidateTerritorialTravel({
  ...config,departAtMs:0,speedUnitsPerHour:4,haltRule:rule,segments,
  missionKind:'grailAttack'});
 assert.equal(normal.totalDistance,4);
 assert.equal(normal.haltCount,3);
 assert.equal(grail.haltCount,1);
 assert.equal(normal.elapsedMs,7*H);
 assert.equal(grail.elapsedMs,3*H);
 assert.equal(grail.segments[0].qualifiesForHalt,false);
 assert.equal(grail.segments[2].qualifiesForHalt,true);
});
test('meter reset at exempt territory remains a declared hypothesis',()=>{
 const rule={...haltRule,thresholdPoints:1,pointsPerDistanceUnit:1};
 const segments=[leg(1,2,'hostile'),leg(2,3,'allied'),leg(3,4,'hostile')];
 const preserve=simulateCandidateTerritorialTravel({
  ...config,departAtMs:0,speedUnitsPerHour:1,haltRule:rule,segments});
 const reset=simulateCandidateTerritorialTravel({
  ...config,departAtMs:0,speedUnitsPerHour:1,
  haltRule:{...rule,exemptCounter:'reset'},segments});
 assert.equal(preserve.haltCount,1);
 assert.equal(reset.haltCount,0);
});
test('repeating UTC night truce blocks movement only when configured',()=>{
 const j=simulateCandidateTerritorialTravel({
  ...config,nightPolicy:{startHourUTC:22,endHourUTC:8,validUntilMs:48*H},
  speedUnitsPerHour:1,segments:[leg(1,3)],haltRule:{
   ...haltRule,thresholdPoints:100,pointsPerDistanceUnit:1}});
 assert.equal(j.estimatedArrivalAtMs,33*H);
 assert.equal(j.nightTruceWindows.length,2);
});
test('halts can pause during the night rather than run during closed hours',()=>{
 const opts={...config,speedUnitsPerHour:1,segments:[leg(1,3)],
  haltRule:{...haltRule,thresholdPoints:1,pointsPerDistanceUnit:1},
  nightPolicy:{startHourUTC:22,endHourUTC:8,validUntilMs:48*H}};
 const paused=simulateCandidateTerritorialTravel(opts);
 const continuing=simulateCandidateTerritorialTravel({
  ...opts,haltClockDuringTruce:'continue'});
 assert.equal(paused.estimatedArrivalAtMs,35*H);
 assert.equal(continuing.estimatedArrivalAtMs,33*H);
});
test('closed truce coverage fails, never silently assumes the night has ended',()=>{
 assert.throws(()=>simulateCandidateTerritorialTravel({
  ...config,speedUnitsPerHour:1,segments:[leg(1,3)],
  nightPolicy:{startHourUTC:22,endHourUTC:8,validUntilMs:24*H}
 }),/exceeds trusted truce coverage/);
});
test('route input is immutable and malformed policy or segment fails closed',()=>{
 const frozen=structuredClone(config);
 simulateCandidateTerritorialTravel(config);
 assert.deepEqual(config,frozen);
 for(const patch of [
  {nightPolicy:undefined},{haltClockDuringTruce:'guess'},
  {missionKind:'siege'},
  {segments:[leg(1,2),leg(3,4)]},
  {segments:[leg(0,2)]},{speedUnitsPerHour:0},
  {haltRule:{...haltRule,exemptCounter:'assume'}},
  {haltRule:{...haltRule,pointsPerDistanceUnit:0}},
  {blackouts:[{startMs:50,endMs:50}]},
  {trustedSchedule:{nowMs:0,arrivalAtMs:1}}
 ])assert.throws(()=>simulateCandidateTerritorialTravel({...config,...patch}));
});
