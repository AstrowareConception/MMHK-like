/**
 * Dedicated, SERVER-ONLY experimental recall approval boundary.
 * Not available to players and not an Ubisoft S2 timing algorithm.
 * No implicit admin role, ETA defaults, or client-derived return hour.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const exact=(o,keys,label)=>{
 if(!record(o)||Object.keys(o).some(k=>!keys.includes(k)))
  throw new TypeError(label+' contains forbidden fields');
};
export function approveServerHeroRecall({
 command,authContext,authenticateRecallAuthority,authorizeRecall,
 heroStore,trustedSchedule,policyId
}){
 exact(command,['missionId'],'Recall approval command');
 exact(trustedSchedule,['nowMs','returnAtMs'],'Server recall schedule');
 if(typeof authenticateRecallAuthority!=='function'||typeof authorizeRecall!=='function'||
    !heroStore||typeof heroStore.approveMissionRecall!=='function')
  throw new Error('Dedicated trusted recall authority, policy and store required');
 const authority=authenticateRecallAuthority(authContext);
 if(!record(authority)||authority.authenticated!==true||
    authority.canApproveRecall!==true||typeof authority.authorityId!=='string')
  throw new Error('Recall administrator or scheduler authority required');
 return heroStore.approveMissionRecall({
  missionId:command.missionId,approvedBy:authority.authorityId,
  policyId,nowMs:trustedSchedule.nowMs,returnAtMs:trustedSchedule.returnAtMs,
  authorizeRecall:data=>authorizeRecall({
   ...data,authority:structuredClone(authority)
  })===true
 });
}
