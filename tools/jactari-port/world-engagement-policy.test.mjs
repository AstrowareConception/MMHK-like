import test from 'node:test';
import assert from 'node:assert/strict';
import {candidateFirstCityProtectionExpiry,PROVISIONAL_FIRST_CITY_DAYS}
 from './world-engagement-policy.mjs';

test('first city protection candidate is exactly seven 24-hour days, not asserted as Ubisoft S2',()=>{
 assert.equal(PROVISIONAL_FIRST_CITY_DAYS,7);
 const begin=1720000000000;
 const e=candidateFirstCityProtectionExpiry(begin);
 assert.equal(e.protectedUntilMs-begin,604800000);
 assert.equal(e.historicalCertification,false);
 assert.match(e.provenance,/not independently verified/);
});
test('invalid foundation timestamps are rejected before computing novice protection',()=>{
 for(const bad of [-1,1.25,NaN,Infinity,'0'])
  assert.throws(()=>candidateFirstCityProtectionExpiry(bad),/foundation time/);
 assert.throws(()=>candidateFirstCityProtectionExpiry(Number.MAX_SAFE_INTEGER),
  /overflow/);
});
