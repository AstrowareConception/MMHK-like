/**
 * On-demand V7.0 due-event runner; no daemon, polling or PvP arbitership.
 * The host provides an authenticated server-side clock, worker identity and
 * target policy. Only existing mission transitions can change game state.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {arriveServerHeroMission,completeServerHeroReturn} from './server-military-mission.mjs';
const id=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{1,64}$/.test(x);
const integer=(x,label)=>{if(!Number.isSafeInteger(x)||x<0)throw new RangeError('Invalid '+label);return x;};
const required=x=>{if(typeof x!=='function')throw new TypeError('Trusted server callback required');return x;};
/**
 * Attempts at most ONE event. A denial is reported, not silently cleared:
 * the event remains leased and can be retried after expiry or investigated.
 *
 * All trusted callbacks are injected by the SERVER. Never bind this API
 * directly to browser-origin commands.
 */
export function runOneDueMissionEvent({
 heroStore,workerId,serverNowMs,leaseMs=30000,
 authenticateScheduler,authorizeTarget
}){
 if(!heroStore||typeof heroStore.claimNextDueMissionEvent!=='function'||
   typeof heroStore.getMission!=='function')
  throw new Error('Trusted mission store required');
 if(!id(workerId))throw new RangeError('Invalid worker ID');
 integer(serverNowMs,'server clock');
 required(authenticateScheduler);
 if(authenticateScheduler({workerId})!==true)
  throw new Error('Scheduler authentication denied');
 const work=heroStore.claimNextDueMissionEvent({
  workerId,nowMs:serverNowMs,leaseMs
 });
 if(work===null)return {kind:'idle',processed:0};
 const event={missionId:work.missionId,eventKind:work.eventKind,
  attempt:work.attempt,dueAtMs:work.dueAtMs};
 try{
  const mission=heroStore.getMission(work.missionId);
  if(!mission)throw new Error('Claimed event references a missing mission');
  // The mission supplies actor identity: not worker input.
  const authContext={serverWorkerId:workerId,missionActorId:mission.actorPlayerId};
  const authenticate=context=>({
   authenticated:context.serverWorkerId===workerId,
   playerId:context.missionActorId
  });
  let result;
  if(work.eventKind==='arrival'){
   required(authorizeTarget);
   result=arriveServerHeroMission({
    command:{missionId:work.missionId},heroStore,authContext,authenticate,
    authorizeTarget:context=>authorizeTarget({
     ...context,missionId:work.missionId,workerId
    })===true,serverNowMs,lease:{workerId,attempt:work.attempt}
   });
  }else if(work.eventKind==='return_completion'){
   result=completeServerHeroReturn({
    command:{missionId:work.missionId},heroStore,authContext,authenticate,
    serverNowMs,lease:{workerId,attempt:work.attempt}
   });
  }else throw new Error('Unsupported due-event kind');
  return {kind:'processed',processed:1,event,
   status:result.status,replayed:result.replayed===true};
 }catch(error){
  const message=String(error?.message??error);
  const reasonCode=/Stale or expired scheduler lease/.test(message)
   ?'lease_conflict':/authorization denied|target authorization denied/i.test(message)
   ?'target_denied':/mission|location|not yet|not reached|not arrived/i.test(message)
   ?'mission_state':'internal_error';
  let incidentRecorded=false;
  try{
   heroStore.recordDueMissionIncident({
    missionId:work.missionId,eventKind:work.eventKind,
    workerId,attempt:work.attempt,nowMs:serverNowMs,reasonCode
   });
   incidentRecorded=true;
  }catch{
   // The caller must escalate an unrecorded failure. Never claim success.
  }
  return {kind:'blocked',processed:0,event,
   errorName:error?.name??'Error',reason:message,reasonCode,
   incidentRecorded,retryAfterMs:work.leaseUntilMs,
   requiresOperatorReview:true};
 }
}
/**
 * Deterministic finite batch. An invalid target remains blocked, so later
 * events may still process; bounded batches prevent unending loops.
 */
export function runDueMissionBatch({maxEvents=25,...args}){
 if(!Number.isSafeInteger(maxEvents)||maxEvents<1||maxEvents>500)
  throw new RangeError('maxEvents must be 1..500');
 const events=[];
 for(let i=0;i<maxEvents;i++){
  const result=runOneDueMissionEvent(args);
  if(result.kind==='idle')break;
  events.push(result);
 }
 return {attempted:events.length,processed:events.filter(e=>e.kind==='processed').length,
  blocked:events.filter(e=>e.kind==='blocked').length,events,
  automaticCombatResolution:false};
}
