/**
 * Candidate territory-sensitive military travel, not an Ubisoft S2 arbiter.
 * Guide G05 and contemporary S2 Grail reports motivate separate policies;
 * exact movement-point conversion, border accounting and timing still lack
 * server validation. Nothing here authorizes real missions.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {jactariToroidalDistance,validateWorldCoordinate} from './world-distance.mjs';
import {advanceTravelClock,normalizeTravelBlackouts} from './world-journey.mjs';
import {buildCandidateUtcNightTruces} from './world-night-truce.mjs';

const HOUR=3600000,EPS=1e-9,MAX_EVENTS=10000;
const finite=(v,name,min=0)=>{
 if(typeof v!=='number'||!Number.isFinite(v)||v<min)
  throw new RangeError(name+' must be finite and >= '+min);
 return v;
};
const timestamp=(v,name)=>{
 if(!Number.isSafeInteger(v)||v<0)throw new RangeError(name+' must be safe nonnegative epoch ms');
 return v;
};
const exact=(v,fields,name)=>{
 if(!v||typeof v!=='object'||Array.isArray(v)||Object.keys(v).some(k=>!fields.includes(k)))
  throw new TypeError(name+' contains invalid fields');
};
const enumValue=(v,allowed,name)=>{
 if(!allowed.includes(v))throw new RangeError(name+' must be '+allowed.join(' / '));
 return v;
};
const safeTime=v=>timestamp(v,'resulting time');
const duration=(distance,speed,factor)=>{
 const value=Math.ceil(distance/speed*HOUR*factor-1e-8);
 if(!Number.isSafeInteger(value)||value<0)throw new RangeError('Unsafe movement duration');
 return value;
};
const pushEvent=(events,event)=>{
 if(events.length>=MAX_EVENTS)throw new RangeError('Travel event limit exceeded');
 events.push(event);
};
/**
 * Required parameters are explicit, even when the chosen hypothesis means
 * no night truce. A future authorized server policy must separately resolve:
 *   - relation to territory at a particular time;
 *   - movement points per world-distance unit;
 *   - effect of friendly territory on the active halt counter;
 *   - whether a halt freezes during the night.
 *
 * Territory labels are supplied server-side, never inferred from the map.
 */
export function simulateCandidateTerritorialTravel(config){
 exact(config,['worldSize','segments','departAtMs','speedUnitsPerHour',
  'missionKind','haltRule','blackouts','nightPolicy','haltClockDuringTruce'],'Journey');
 const {worldSize,segments,departAtMs,speedUnitsPerHour,missionKind,haltRule}=config;
 timestamp(departAtMs,'departAtMs');
 finite(speedUnitsPerHour,'speedUnitsPerHour',Number.MIN_VALUE);
 enumValue(missionKind,['ordinary','grailAttack'],'missionKind');
 enumValue(config.haltClockDuringTruce,['pause','continue'],'haltClockDuringTruce');
 exact(haltRule,['thresholdPoints','durationMs','pointsPerDistanceUnit','exemptCounter'],
  'Halt rule');
 const threshold=finite(haltRule.thresholdPoints,'thresholdPoints',Number.MIN_VALUE);
 const haltMs=timestamp(haltRule.durationMs,'durationMs');
 const pointRate=finite(haltRule.pointsPerDistanceUnit,'pointsPerDistanceUnit',Number.MIN_VALUE);
 enumValue(haltRule.exemptCounter,['preserve','reset'],'exemptCounter');
 if(!Array.isArray(segments)||segments.length<1||segments.length>1000)
  throw new RangeError('At least one and at most 1000 route segments are required');
 const normalized=segments.map((seg,i)=>{
  exact(seg,['from','to','territory','durationFactor','distanceUnits'],'segment');
  const from=validateWorldCoordinate(seg.from,worldSize);
  const to=validateWorldCoordinate(seg.to,worldSize);
  enumValue(seg.territory,['friendly','allied','neutral','hostile','targetAlliance'],
   'territory');
  const factor=finite(seg.durationFactor??1,'durationFactor',Number.MIN_VALUE);
  if(i>0){
   const prev=segments[i-1].to;
   if(from.x!==prev.x||from.y!==prev.y)
    throw new RangeError('Route segments must be contiguous');
  }
  return {from:{...from},to:{...to},territory:seg.territory,
   durationFactor:factor,distance:seg.distanceUnits===undefined
   ?jactariToroidalDistance(from,to,worldSize)
   :finite(seg.distanceUnits,'distanceUnits',Number.MIN_VALUE)};
 });
 if(config.nightPolicy==='disabled'){
  // Explicitly switch off truce only in a non-authoritative simulation.
 }else{
  exact(config.nightPolicy,['startHourUTC','endHourUTC','validUntilMs'],'nightPolicy');
  timestamp(config.nightPolicy.validUntilMs,'validUntilMs');
  if(config.nightPolicy.validUntilMs<=departAtMs)
   throw new RangeError('Truce horizon must extend beyond departure');
 }
 const truce=config.nightPolicy==='disabled'?null:buildCandidateUtcNightTruces({
  fromMs:departAtMs,untilMs:config.nightPolicy.validUntilMs,
  startHourUTC:config.nightPolicy.startHourUTC,
  endHourUTC:config.nightPolicy.endHourUTC
 });
 const blackoutList=normalizeTravelBlackouts([
  ...(config.blackouts??[]),...(truce?.windows??[])
 ]);
 let now=departAtMs, meter=0,totalDistance=0,totalMovementMs=0,haltCount=0;
 const events=[],summary=[];
 const advance=(time)=>advanceTravelClock(now,time,blackoutList);
 for(const [i,seg] of normalized.entries()){
  const qualifying=missionKind==='grailAttack'
   ?seg.territory==='targetAlliance'
   :['neutral','hostile','targetAlliance'].includes(seg.territory);
  if(!qualifying&&haltRule.exemptCounter==='reset')meter=0;
  const starting=now;
  let remaining=seg.distance,haltInSegment=0,segmentMovingMs=0;
  while(remaining>EPS){
   if(qualifying&&meter>=threshold-EPS){
    const before=now;
    now=safeTime(config.haltClockDuringTruce==='pause'
     ?advance(haltMs):now+haltMs);
    haltCount++;haltInSegment++;
    pushEvent(events,{phase:'halt',segmentIndex:i,startMs:before,endMs:now,
     durationMs:haltMs,territory:seg.territory});
    meter=0;
   }
   const chunk=qualifying
    ?Math.min(remaining,(threshold-meter)/pointRate)
    :remaining;
   if(chunk<=EPS)throw new RangeError('Sub-resolution journey segment');
   const movingMs=duration(chunk,speedUnitsPerHour,seg.durationFactor);
   const before=now;
   now=safeTime(advance(movingMs));
   totalMovementMs+=movingMs;segmentMovingMs+=movingMs;
   pushEvent(events,{phase:'move',segmentIndex:i,
    startMs:before,endMs:now,distance:chunk,movingMs,territory:seg.territory});
   if(qualifying)meter=Math.min(threshold,meter+chunk*pointRate);
   remaining=Math.max(0,remaining-chunk);
  }
  totalDistance+=seg.distance;
  summary.push({segmentIndex:i,from:seg.from,to:seg.to,
   territory:seg.territory,qualifiesForHalt:qualifying,
   distance:seg.distance,durationFactor:seg.durationFactor,
   departAtMs:starting,arrivalAtMs:now,movingMs:segmentMovingMs,haltCount:haltInSegment});
 }
 if(truce&&now>truce.untilMs)
  throw new RangeError('Journey exceeds trusted truce coverage; extend calendar horizon');
 return {departAtMs,estimatedArrivalAtMs:now,elapsedMs:now-departAtMs,
  totalDistance,totalMovementMs,haltCount,segments:summary,events,
  movementPointsCarried:meter,nightTruceWindows:truce?.windows??[],
  missionKind,haltClockDuringTruce:config.haltClockDuringTruce,
  provenance:'Candidate G05 territorial-halt interpretation + 2010 S2 Grail observations',
  historicalCertification:false,authoritativeArrivalTime:false,
  limitations:['No approved Ubisoft S2 movement profile',
   'Territorial relation, point conversion and exceptions must be authorized server-side',
   'Cannot generate trustedSchedule or unlock PvP']};
}
/** G05 descriptive guide values; NOT a production default. */
export const GUIDE_G05_HALT_OBSERVATION=Object.freeze({
 thresholdPoints:8,durationMs:2*HOUR,
 sourceId:'G05',historicalCertification:false,
 warning:'Point conversion, territory accounting and exact season applicability are unknown'
});
