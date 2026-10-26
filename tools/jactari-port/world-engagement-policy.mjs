/**
 * Project policy *candidate* for first-city newcomer protection.
 *
 * The seven-day duration comes from MMHK gameplay recollection, NOT a verified
 * Ubisoft Season-2 config. The backend stores protectedUntilMs explicitly on
 * each first city and enforces it independently from client permissions.
 * The game server must explicitly adopt or replace this candidate rule.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
export const PROVISIONAL_FIRST_CITY_DAYS=7;
export function candidateFirstCityProtectionExpiry(foundedAtMs){
 if(!Number.isSafeInteger(foundedAtMs)||foundedAtMs<0)
  throw new RangeError('Trusted first city foundation time required');
 const expiry=foundedAtMs+PROVISIONAL_FIRST_CITY_DAYS*24*60*60*1000;
 if(!Number.isSafeInteger(expiry))throw new RangeError('Protected-until timestamp overflow');
 return {protectedUntilMs:expiry,
  durationDays:PROVISIONAL_FIRST_CITY_DAYS,
  provenance:'User-recalled first-city seven-day beginner protection; season-2 source not independently verified',
  historicalCertification:false};
}
