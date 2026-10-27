/**
 * Reconstruct the outgoing/inbound candidate territory partitions using the
 * immutable dispatch snapshot. Reverse direction is NOT an official MMHK
 * return itinerary, and this module never grants combat/arrival permissions.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {deriveCandidateTerritorialSegments} from './world-territory-trace.mjs';

const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(x);
const pos=x=>({x:x.x,y:x.y});
export function replayFrozenCandidateMissionRoute({
 heroStore,missionId,direction='outbound'
}){
 if(!heroStore||typeof heroStore.getFrozenMissionTerritory!=='function'||
   typeof heroStore.getMissionRoute!=='function'||
   typeof heroStore.getMission!=='function')
  throw new Error('Trusted military persistence required');
 if(!id(missionId))throw new RangeError('Valid mission ID required');
 if(!['outbound','inbound'].includes(direction))
  throw new RangeError('Direction must be outbound or inbound');
 const mission=heroStore.getMission(missionId);
 if(!mission)throw new Error('Unknown military mission');
 const route=heroStore.getMissionRoute(missionId);
 const frozen=heroStore.getFrozenMissionTerritory(missionId);
 if(!route||!frozen)throw new Error('Mission has no frozen geographic departure evidence');
 if(frozen.worldId!==route.worldId||frozen.snapshot.worldSize!==route.worldSize)
  throw new Error('Frozen route and world snapshot mismatch');
 const attacker=heroStore.getHero(mission.attackerHeroId);
 if(!attacker||attacker.ownerId!==mission.actorPlayerId)
  throw new Error('Mission origin ownership mismatch');
 const start=pos(route.origin),end=pos(route.destination);
 const waypoints=direction==='outbound'?[start,end]:[end,start];
 const territory=deriveCandidateTerritorialSegments({
  snapshot:frozen.snapshot,
  actingPlayerId:mission.actorPlayerId,
  waypoints
 });
 return {missionId,direction,missionStatus:mission.status,
  worldId:route.worldId,worldRevisionAtDeparture:frozen.worldRevision,
  snapshotFingerprint:frozen.snapshotFingerprint,waypoints,territory,
  historicalCertification:false,authoritativeArrivalTime:false,
  officialReturnSchedule:false,
  provenance:'Departure-time frozen snapshot; toroidal centre-to-centre candidate route',
  limitations:['No Ubisoft S2 return-path or return-clock proof',
   'No retroactive diplomacy resolution or live route override',
   'Does not supply a trusted military ETA']};
}
