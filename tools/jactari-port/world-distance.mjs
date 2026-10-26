/**
 * Toroidal square map geometry observed in original MMHK-Plus 2013 client
 * utilities; not an authenticated Ubisoft S2 movement scheduler.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const int=(n,label)=>{if(!Number.isSafeInteger(n))throw new RangeError('Integer '+label+' required');return n;};
export function validateWorldCoordinate({x,y},worldSize){
 const size=int(worldSize,'world size');
 if(size<2||size>100000)throw new RangeError('Unsupported world size');
 for(const [label,v] of [['x',x],['y',y]])
  if(int(v,label)<1||v>size)throw new RangeError('World coordinate outside 1..worldSize: '+label);
 return {x,y};
}
export function jactariToroidalDistance(from,to,worldSize){
 validateWorldCoordinate(from,worldSize);
 validateWorldCoordinate(to,worldSize);
 let dx=Math.abs(to.x-from.x),dy=Math.abs(to.y-from.y);
 if(dx>worldSize/2)dx=worldSize-dx;
 if(dy>worldSize/2)dy=worldSize-dy;
 return Math.sqrt(dx*dx+dy*dy);
}
/**
 * Informational UI estimation ONLY, as in 2013 MMHK-Plus/distances.js.
 * These ratios omit region halts, treaties, truce windows and siege phases.
 * Never use as mission arrivalAtMs without an independently approved policy.
 */
export function communityDistanceEstimates(from,to,worldSize){
 const d=jactariToroidalDistance(from,to,worldSize);
 return {distance:d,hours:{
  unaccompaniedHero:d/12,army:d/4,caravan:d/9.375
 },provenance:'MMHK-Plus 2013 community UI distance estimator',
  authoritativeArrivalTime:false,
  limitations:['Not a historical Ubisoft S2 journey or route',
   'No terrain, pauses, diplomatic halts or nightly truce modeled']};
}
