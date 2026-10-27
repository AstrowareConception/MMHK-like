/**
 * Experimental authoritative lifecycle for a military mission: dispatch,
 * arrival, return scheduling and completion.
 *
 * The server (NOT clients) supplies the epoch timestamps and territory/
 * diplomacy policy. No historical MMHK movement speed or return duration
 * is inferred, and no automatic capture/wound rule is made up.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const exact=(o,keys,description)=>{
 if(!record(o)||Object.keys(o).some(k=>!keys.includes(k)))
  throw new TypeError(description+' contains forbidden fields');
};
const authority=({authContext,authenticate,authorizeTarget,heroStore},needsTarget)=>{
 if(typeof authenticate!=='function'||(needsTarget&&typeof authorizeTarget!=='function')||
    !heroStore||typeof heroStore.isPlayerEnabled!=='function')
  throw new Error('Trusted authentication, mission policy and hero store required');
 const actor=authenticate(authContext);
 if(!record(actor)||actor.authenticated!==true||typeof actor.playerId!=='string'||
    !heroStore.isPlayerEnabled(actor.playerId))
  throw new Error('Unauthenticated or inactive mission actor');
 return actor;
};
const targetGate=(principal,authorizeTarget)=>({attacker,defender})=>
 authorizeTarget({principal:structuredClone(principal),attacker,defender});
/** Command is limited to missionId + attackerId + defenderId. */
export function dispatchServerHeroMission({
 command,authContext,authenticate,authorizeTarget,heroStore,trustedSchedule
}){
 exact(command,['missionId','attackerHeroId','defenderHeroId'],'Dispatch command');
 exact(trustedSchedule,['nowMs','arrivalAtMs'],'Server travel schedule');
 const principal=authority({authContext,authenticate,authorizeTarget,heroStore},true);
 return heroStore.dispatchMission({
  ...command,actorPlayerId:principal.playerId,
  nowMs:trustedSchedule.nowMs,arrivalAtMs:trustedSchedule.arrivalAtMs,
  authorizeTarget:({attacker,defender})=>targetGate(principal,authorizeTarget)({
   attacker,defender
  })
 });
}
/** Arrival is an authenticated server scheduler action, not a client clock. */
export function arriveServerHeroMission({
 command,authContext,authenticate,authorizeTarget,heroStore,serverNowMs,lease=null
}){
 exact(command,['missionId'],'Arrival command');
 const principal=authority({authContext,authenticate,authorizeTarget,heroStore},true);
 return heroStore.markMissionArrived({
  missionId:command.missionId,actorPlayerId:principal.playerId,nowMs:serverNowMs,lease,
  authorizeTarget:({attacker,defender})=>targetGate(principal,authorizeTarget)({
   attacker,defender
  })
 });
}
/** Only after a committed battle; travel duration MUST be a server input. */
export function scheduleServerHeroReturn({
 command,authContext,authenticate,heroStore,trustedSchedule
}){
 exact(command,['missionId'],'Return scheduling command');
 exact(trustedSchedule,['nowMs','returnAtMs'],'Server return schedule');
 const principal=authority({authContext,authenticate,heroStore},false);
 return heroStore.scheduleMissionReturn({
  missionId:command.missionId,actorPlayerId:principal.playerId,
  nowMs:trustedSchedule.nowMs,returnAtMs:trustedSchedule.returnAtMs
 });
}
export function completeServerHeroReturn({
 command,authContext,authenticate,heroStore,serverNowMs,lease=null
}){
 exact(command,['missionId'],'Return completion command');
 const principal=authority({authContext,authenticate,heroStore},false);
 return heroStore.completeMissionReturn({
  missionId:command.missionId,actorPlayerId:principal.playerId,nowMs:serverNowMs,lease
 });
}
/** Administrative cancellation is explicit and requires a real server policy. */
export function cancelServerUnresolvedMission({
 command,authContext,authenticate,authorizeCancellation,heroStore
}){
 exact(command,['missionId'],'Mission cancellation command');
 if(typeof authorizeCancellation!=='function')
  throw new Error('Administrative mission cancellation policy required');
 const principal=authority({authContext,authenticate,heroStore},false);
 return heroStore.cancelUnresolvedMission({
  missionId:command.missionId,actorPlayerId:principal.playerId,
  authorizeCancellation:mission=>authorizeCancellation({
   principal:structuredClone(principal),mission
  })
 });
}

/**
 * Owner-authenticated recall INTENT only, never an immediate recall or return.
 * The client may send only missionId; the timestamp is an authenticated
 * server input. Historic recall distance/timing remains unsupported.
 */
export function requestServerHeroRecall({
 command,authContext,authenticate,heroStore,serverNowMs
}){
 exact(command,['missionId'],'Recall request command');
 const principal=authority({authContext,authenticate,heroStore},false);
 return heroStore.requestMissionRecall({
  missionId:command.missionId,actorPlayerId:principal.playerId,
  nowMs:serverNowMs
 });
}
