/**
 * Experimental V7.0 journey planner. NOT an Ubisoft S2 authoritative ETA.
 * Inputs (speeds, stops, territory factors and truce windows) are explicit
 * server-side scenario assumptions; no historical multipliers are inferred.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {jactariToroidalDistance,validateWorldCoordinate} from './world-distance.mjs';

const finite=(n,name,min=0)=>{
 if(typeof n!=='number'||!Number.isFinite(n)||n<min)
  throw new RangeError(name+' must be a finite number >= '+min);
 return n;
};
const epoch=(n,name)=>{
 if(!Number.isSafeInteger(n)||n<0)throw new RangeError(name+' must be a nonnegative epoch millisecond integer');
 return n;
};
const safeTime=(n)=>{
 if(!Number.isSafeInteger(n)||n<0)throw new RangeError('Journey time exceeds safe epoch range');
 return n;
};
const copyPoint=p=>({x:p.x,y:p.y});
const EPS=1e-8;
export const HISTORICAL_COMMUNITY_UI_SPEEDS=Object.freeze({
 unaccompaniedHero:12,army:4,caravan:9.375
});

/** Merge explicit UTC no-movement intervals; no nightly timing is assumed. */
export function normalizeTravelBlackouts(windows=[]){
 if(!Array.isArray(windows))throw new TypeError('Travel blackouts must be an array');
 const sorted=windows.map(w=>{
  if(!w||typeof w!=='object'||Array.isArray(w)||
     Object.keys(w).some(k=>!['startMs','endMs'].includes(k)))
   throw new TypeError('Invalid blackout interval');
  const startMs=epoch(w.startMs,'blackout startMs');
  const endMs=epoch(w.endMs,'blackout endMs');
  if(endMs<=startMs)throw new RangeError('Blackout must have positive duration');
  return {startMs,endMs};
 }).sort((a,b)=>a.startMs-b.startMs);
 const merged=[];
 for(const w of sorted){
  const last=merged.at(-1);
  if(last&&w.startMs<=last.endMs)last.endMs=Math.max(last.endMs,w.endMs);
  else merged.push({...w});
 }
 return merged;
}
/** Advance movement time while honouring externally specified closed intervals. */
export function advanceTravelClock(startMs,movingMs,blackouts=[]){
 let clock=epoch(startMs,'startMs');
 finite(movingMs,'movingMs');
 const windows=normalizeTravelBlackouts(blackouts);
 let remaining=Math.ceil(movingMs);
 for(const w of windows){
  if(!remaining)break;
  if(w.endMs<=clock)continue;
  if(w.startMs<=clock){clock=w.endMs;continue;}
  const available=w.startMs-clock;
  if(remaining<=available)return safeTime(clock+remaining);
  remaining-=available;
  clock=w.endMs;
 }
 return safeTime(clock+remaining);
}
/**
 * route: {worldSize,points:[{x,y},...],departAtMs,
 *         speedUnitsPerHour,legFactors?:[],haltsMs?:[],blackouts?:[]}
 * legFactors multiply MOVEMENT DURATION, not speed.
 * haltsMs[i] is the pause BEFORE leg i; a blackout can also cover a halt.
 * This function never produces a trustedSchedule or authorization token.
 */
export function planProvisionalWorldJourney(route){
 if(!route||typeof route!=='object'||Array.isArray(route))
  throw new TypeError('Journey definition required');
 const allowed=['worldSize','points','departAtMs','speedUnitsPerHour','legFactors','haltsMs','blackouts'];
 if(Object.keys(route).some(k=>!allowed.includes(k)))
  throw new TypeError('Unknown journey parameters');
 const {worldSize,points,departAtMs,speedUnitsPerHour}=route;
 epoch(departAtMs,'departAtMs');
 finite(speedUnitsPerHour,'speedUnitsPerHour',Number.MIN_VALUE);
 if(!Array.isArray(points)||points.length<2||points.length>1000)
  throw new RangeError('Journey requires 2..1000 waypoints');
 const vertices=points.map(p=>copyPoint(validateWorldCoordinate(p,worldSize)));
 const n=vertices.length-1;
 const factors=route.legFactors??Array(n).fill(1);
 const halts=route.haltsMs??Array(n).fill(0);
 if(!Array.isArray(factors)||factors.length!==n||!Array.isArray(halts)||halts.length!==n)
  throw new RangeError('One factor and halt required per leg');
 factors.forEach((f,i)=>finite(f,'legFactors['+i+']',Number.MIN_VALUE));
 halts.forEach((h,i)=>epoch(h,'haltsMs['+i+']'));
 const blackouts=normalizeTravelBlackouts(route.blackouts??[]);
 let clock=departAtMs,totalDistance=0,totalMovingMs=0;
 const legs=[];
 for(let i=0;i<n;i++){
  // Halts are fixed clock delays. Movement blackouts apply only to movement.
  clock=safeTime(clock+halts[i]);
  const distance=jactariToroidalDistance(vertices[i],vertices[i+1],worldSize);
  const movingMs=Math.ceil(distance/speedUnitsPerHour*3600000*factors[i]-EPS);
  if(!Number.isSafeInteger(movingMs)||movingMs<0)throw new RangeError('Unsafe travel duration');
  const startMs=clock;
  clock=advanceTravelClock(clock,movingMs,blackouts);
  totalDistance+=distance;
  totalMovingMs+=movingMs;
  legs.push({from:vertices[i],to:vertices[i+1],distance,
   factor:factors[i],haltBeforeMs:halts[i],startMs,arrivalAtMs:clock,movingMs});
 }
 return {departAtMs,estimatedArrivalAtMs:clock,elapsedMs:clock-departAtMs,
  totalDistance,totalMovingMs,legs,blackouts,
  historicalCertification:false,authoritativeArrivalTime:false,
  provenance:'V7.0 experimental route model; geometry source-backed, scheduling assumptions supplied externally',
  limitations:['Not approved for MMHK S2 dispatch','No automatic diplomacy, night truce, army composition or territory detection']};
}
