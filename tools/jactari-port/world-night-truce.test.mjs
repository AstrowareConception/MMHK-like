import test from 'node:test';
import assert from 'node:assert/strict';
import {buildCandidateUtcNightTruces} from './world-night-truce.mjs';
const H=3600000,D=24*H;
test('22:00..08:00 UTC crosses midnight and clips the requested horizon',()=>{
 const actual=buildCandidateUtcNightTruces({fromMs:0,untilMs:2*D,
  startHourUTC:22,endHourUTC:8});
 assert.deepEqual(actual.windows,[
  {startMs:0,endMs:8*H},{startMs:22*H,endMs:32*H},
  {startMs:46*H,endMs:48*H}]);
 assert.equal(actual.authoritativeArrivalTime,false);
 assert.equal(actual.historicalCertification,false);
});
test('daytime closed windows use the same UTC day',()=>{
 assert.deepEqual(buildCandidateUtcNightTruces({
  fromMs:9*H,untilMs:13*H,startHourUTC:10,endHourUTC:12
 }).windows,[{startMs:10*H,endMs:12*H}]);
});
test('a later start excludes earlier nights instead of fabricating time',()=>{
 assert.deepEqual(buildCandidateUtcNightTruces({
  fromMs:33*H,untilMs:44*H,startHourUTC:22,endHourUTC:8
 }).windows,[]);
});
test('reject unknown coverage and ambiguous 24-hour night',()=>{
 for(const rule of [
  {fromMs:0,untilMs:0,startHourUTC:22,endHourUTC:8},
  {fromMs:0,untilMs:400*D,startHourUTC:22,endHourUTC:8},
  {fromMs:0,untilMs:D,startHourUTC:22,endHourUTC:22},
  {fromMs:0,untilMs:D,startHourUTC:-1,endHourUTC:8},
  {fromMs:0,untilMs:D,startHourUTC:22.5,endHourUTC:8}
 ])assert.throws(()=>buildCandidateUtcNightTruces(rule));
});
