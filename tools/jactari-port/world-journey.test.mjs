import test from 'node:test';
import assert from 'node:assert/strict';
import {planProvisionalWorldJourney,advanceTravelClock,normalizeTravelBlackouts,
 HISTORICAL_COMMUNITY_UI_SPEEDS} from './world-journey.mjs';
const base={worldSize:100,points:[{x:1,y:50},{x:100,y:50}],
 departAtMs:100000,speedUnitsPerHour:4};
test('community speeds remain labelled, never authoritative',()=>{
 assert.deepEqual(HISTORICAL_COMMUNITY_UI_SPEEDS,{unaccompaniedHero:12,army:4,caravan:9.375});
 const j=planProvisionalWorldJourney(base);
 assert.equal(j.totalDistance,1);
 assert.equal(j.estimatedArrivalAtMs,100000+900000);
 assert.equal(j.historicalCertification,false);
 assert.equal(j.authoritativeArrivalTime,false);
 assert.equal('trustedSchedule' in j,false);
});
test('wrap both axes; identical position has zero travel time',()=>{
 const j=planProvisionalWorldJourney({...base,points:[{x:1,y:1},{x:100,y:100}]});
 assert.equal(j.totalDistance,Math.SQRT2);
 assert.equal(planProvisionalWorldJourney({...base,points:[{x:1,y:1},{x:1,y:1}]}).elapsedMs,0);
});
test('waypoints and factors operate per leg, not on the straight-line shortcut',()=>{
 const j=planProvisionalWorldJourney({...base,points:[{x:1,y:1},{x:2,y:1},{x:2,y:3}],
  legFactors:[1,2],haltsMs:[0,60000]});
 assert.equal(j.totalDistance,3);
 assert.equal(j.totalMovingMs,4500000);
 assert.equal(j.elapsedMs,4560000);
 assert.equal(j.legs[1].haltBeforeMs,60000);
});
test('blocked movement advances past externally specified closure',()=>{
 const j=planProvisionalWorldJourney({...base,blackouts:[{startMs:200000,endMs:300000}]});
 assert.equal(j.estimatedArrivalAtMs,1100000);
 assert.equal(j.legs[0].movingMs,900000);
});
test('overlaps and adjacency normalize before stepping',()=>{
 assert.deepEqual(normalizeTravelBlackouts([
  {startMs:50,endMs:100},{startMs:20,endMs:60},{startMs:100,endMs:110}
 ]),[{startMs:20,endMs:110}]);
 assert.equal(advanceTravelClock(0,100,[{startMs:20,endMs:110}]),190);
});
test('starting within a blackout waits; empty movement stays at start',()=>{
 assert.equal(advanceTravelClock(40,10,[{startMs:20,endMs:100}]),110);
 assert.equal(advanceTravelClock(40,0,[{startMs:20,endMs:100}]),40);
});
test('halts do not accidentally count as movement and can end inside blackout',()=>{
 const j=planProvisionalWorldJourney({...base,haltsMs:[200000],
  blackouts:[{startMs:250000,endMs:350000}]});
 assert.equal(j.estimatedArrivalAtMs,1200000);
});
test('reject invalid client-shaped and unsafe inputs instead of inventing timing',()=>{
 for(const x of [
  {...base,speedUnitsPerHour:0},{...base,speedUnitsPerHour:NaN},
  {...base,departAtMs:-1},{...base,points:[{x:1,y:1}]},
  {...base,points:[{x:0,y:1},{x:2,y:2}]},
  {...base,legFactors:[0]},{...base,haltsMs:[-1]},
  {...base,blackouts:[{startMs:1,endMs:1}]},
  {...base,blackouts:[{startMs:1,endMs:2,reason:'trusted'}]},
  {...base,arrivalAtMs:1}
 ])assert.throws(()=>planProvisionalWorldJourney(x));
});
test('one huge duration fails rather than overflowing an epoch',()=>{
 assert.throws(()=>planProvisionalWorldJourney({...base,speedUnitsPerHour:1e-20}),/Unsafe travel duration/);
});
