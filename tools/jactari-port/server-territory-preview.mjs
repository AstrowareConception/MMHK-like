/**
 * Server-internal experiment: geolocated hero route -> persisted territory
 * snapshot -> physical segments -> candidate truce / halt ETA.
 * NEVER creates trustedSchedule, commits missions, or grants PvP permissions.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {createHash} from 'node:crypto';
import {deriveCandidateTerritorialSegments} from './world-territory-trace.mjs';
import {simulateCandidateTerritorialTravel} from './world-territorial-travel.mjs';

const id=v=>typeof v==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(v);
const point=p=>({x:p.x,y:p.y});
const digest=x=>createHash('sha256').update(JSON.stringify(x)).digest('hex');
/**
 * All inputs are server-internal. The acting player is derived from the
 * persisted attacker, not supplied by callers or taken from route metadata.
 * Optional via coordinates are NOT client-origin waypoints.
 */
export function previewCandidateTerritorialMission({
 heroStore,attackerHeroId,defenderHeroId,via=[],missionKind='ordinary',
 targetAllianceId=null,travelPolicy
}){
 if(!heroStore||typeof heroStore.getWorldTerritorySnapshot!=='function'||
  typeof heroStore.getHeroWorldPosition!=='function')
  throw new Error('Trusted hero/world store required');
 if(!id(attackerHeroId)||!id(defenderHeroId)||attackerHeroId===defenderHeroId)
  throw new RangeError('Two distinct registered hero IDs required');
 if(!Array.isArray(via)||via.length>254)
  throw new RangeError('Up to 254 trusted via waypoints supported');
 if(!travelPolicy||typeof travelPolicy!=='object'||Array.isArray(travelPolicy)||
  Object.keys(travelPolicy).some(k=>!['departAtMs','speedUnitsPerHour','haltRule',
  'blackouts','nightPolicy','haltClockDuringTruce'].includes(k)))
  throw new TypeError('Explicit server laboratory travel policy required');
 const attacker=heroStore.getHero(attackerHeroId);
 const defender=heroStore.getHero(defenderHeroId);
 if(!attacker||!defender||!heroStore.isPlayerEnabled(attacker.ownerId)||
  !heroStore.isPlayerEnabled(defender.ownerId))
  throw new Error('Registered and active hero owners required');
 const a=heroStore.getHeroWorldPosition(attackerHeroId);
 const d=heroStore.getHeroWorldPosition(defenderHeroId);
 if(!a||!d||a.worldId!==d.worldId||a.cityId===d.cityId)
  throw new Error('Two distinct cities in the same registered world required');
 const snapshot=heroStore.getWorldTerritorySnapshot(a.worldId);
 const waypoints=[point(a),...via,point(d)];
 if(missionKind==='grailAttack'){
  const membership=snapshot.memberships.find(x=>x.playerId===defender.ownerId);
  if(!membership||membership.allianceId!==targetAllianceId)
   throw new Error('Grail preview target must match defender alliance in snapshot');
 }
 const territory=deriveCandidateTerritorialSegments({
  snapshot,actingPlayerId:attacker.ownerId,targetAllianceId,waypoints
 });
 const timedSegments=territory.segments.map((s,i)=>({
  from:i===0?point(a):point(territory.segments[i-1].exitTile),
  to:point(s.exitTile),territory:s.territory,
  distanceUnits:s.distanceUnits,durationFactor:s.durationFactor
 }));
 const simulated=simulateCandidateTerritorialTravel({
  worldSize:snapshot.worldSize,segments:timedSegments,
  missionKind,...structuredClone(travelPolicy)
 });
 const data={worldId:a.worldId,worldRevision:snapshot.revision,
  attackerHeroId,defenderHeroId,attackerCityId:a.cityId,
  defenderCityId:d.cityId,origin:point(a),destination:point(d),
  actingPlayerId:attacker.ownerId,territory,simulation:simulated};
 return {...data,snapshotFingerprint:digest(snapshot),
  previewFingerprint:digest(data),historicalCertification:false,
  authoritativeArrivalTime:false,
  limitations:['This preview does NOT create a trusted server mission schedule',
   'Historical territorial control radii and diplomacies are not certified for MMHK S2']};
}
/** Checks staleness only. Returning true NEVER authorizes a mission. */
export function assertCandidateTerritoryPreviewFresh({heroStore,preview}){
 if(!heroStore||!preview||!id(preview.worldId))
  throw new TypeError('Trusted snapshot preview and store required');
 const snapshot=heroStore.getWorldTerritorySnapshot(preview.worldId);
 const a=heroStore.getHeroWorldPosition(preview.attackerHeroId);
 const d=heroStore.getHeroWorldPosition(preview.defenderHeroId);
 if(snapshot.revision!==preview.worldRevision||
  digest(snapshot)!==preview.snapshotFingerprint||
  !a||!d||a.cityId!==preview.attackerCityId||
  d.cityId!==preview.defenderCityId||
  a.x!==preview.origin.x||a.y!==preview.origin.y||
  d.x!==preview.destination.x||d.y!==preview.destination.y)
  throw new Error('Territorial preview is stale; must be recalculated');
 return true;
}
