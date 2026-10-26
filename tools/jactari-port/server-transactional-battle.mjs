/**
 * Experimental server-side atomic PvP engagement, NOT an HTTP handler and
 * NOT a complete Jactari/MMHK S2 adjudicator. Enforces idempotency and
 * all-or-nothing casualty writes for supported admitted battles only.
 * The server MUST inject authenticated identity and target policy.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {createHash} from 'node:crypto';
import {simulateBattleWithDerivedHeroes} from './hero-combat-battle.mjs';
import {decideJactariAdmission,armyPower} from './admission.mjs';
const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);

function stable(value){
 if(value===null||typeof value==='string'||typeof value==='boolean')
  return JSON.stringify(value);
 if(typeof value==='number'){
  if(!Number.isFinite(value))throw new TypeError('Nonfinite server rules');
  return JSON.stringify(value);
 }
 if(Array.isArray(value))return '['+value.map(stable).join(',')+']';
 if(record(value)){
  if(Object.getPrototypeOf(value)!==Object.prototype &&
     Object.getPrototypeOf(value)!==null)
   throw new TypeError('Only plain server rules permitted');
  return '{'+Object.keys(value).sort().map(key=>{
   if(key==='__proto__'||key==='constructor'||key==='prototype')
    throw new TypeError('Untrusted server rules key');
   return JSON.stringify(key)+':'+stable(value[key]);
  }).join(',')+'}';
 }
 throw new TypeError('Rules must be finite, serializable plain JSON');
}
export function computeJactariRulesDigest(trustedRules){
 const payload=stable(trustedRules);
 return createHash('sha256').update('mmhk-jactari-transactional-demo-v1\0')
  .update(payload).digest('hex');
}
function verifyRules(trustedRules){
 if(!record(trustedRules)||
    Object.keys(trustedRules).some(k=>!['context','lossPolicy','spellContext',
      'unitCatalog','maxRounds'].includes(k))||
    !record(trustedRules.context)||!record(trustedRules.lossPolicy)||
    !Number.isFinite(trustedRules.lossPolicy.lossFactor)||
    trustedRules.lossPolicy.lossFactor<0)
  throw new Error('Explicit trusted historical rules, context and loss policy required');
 // Never interpret season 2 as an alias for community Jactari.
 if(trustedRules.context?.heroConsequence||trustedRules.context?.seasonTwoCertified)
  throw new Error('Unsupported authentic S2 hero consequence/rules assertion');
 return computeJactariRulesDigest(trustedRules);
}

/**
 * Strict command: only commandId, attackerHeroId, defenderHeroId.
 * Authorize and calculate WITHIN the SQLite IMMEDIATE write transaction.
 * Replays return the original receipt without applying a second mutation.
 *
 * Unsupported prebattle capture, wounds and retreat are rejected BEFORE
 * any permanent state write. No synthetic hero consequences are invented.
 */
export function commitServerAuthorizedJactariBattle({
 command,authContext,authenticate,authorizeTarget,heroStore,trustedRules,
 beforeCommit
}){
 if(!record(command)||Object.keys(command).some(k=>![
   'commandId','attackerHeroId','defenderHeroId','missionId'].includes(k)))
  throw new TypeError('Combat command may only contain idempotency key and two hero IDs');
 if(typeof authenticate!=='function'||typeof authorizeTarget!=='function'||
   typeof heroStore?.commitAuthorizedBattle!=='function'||
   typeof heroStore?.isPlayerEnabled!=='function')
  throw new Error('Authenticated, target-authorized server hero store required');
 const digest=verifyRules(trustedRules);
 const principal=authenticate(authContext);
 if(!record(principal)||principal.authenticated!==true||
   typeof principal.playerId!=='string'||
   !heroStore.isPlayerEnabled(principal.playerId))
  throw new Error('Unauthenticated or inactive combat actor');
 // Only a trusted application may supply the hooks and persistence adapter.
 const decision=heroStore.commitAuthorizedBattle({
  ...command,
  actorPlayerId:principal.playerId,
  rulesDigest:digest,
  authorizeTarget:({attacker,defender})=>authorizeTarget({
   principal:structuredClone(principal),
   attacker:structuredClone(attacker),defender:structuredClone(defender)
  }),
  calculate:({attacker,defender})=>{
   // The historical admission formula is proven against calculator, but
   // capture/wounds have no certified server mutations: fail CLOSED.
   const admitted=decideJactariAdmission({
    mode:'pvp',attackPower:armyPower(attacker.army),
    defensePower:armyPower(defender.army)
   });
   if(!admitted.admitted)
    throw new Error('PvP admission requires unimplemented hero consequences: '+
     admitted.outcome+'; no battle or troop changes committed');
   return simulateBattleWithDerivedHeroes({
    attackers:attacker.army,defenders:defender.army,
    heroProfiles:{attacker:attacker.profile,defender:defender.profile},
    heroCareers:{attacker:attacker.careers,defender:defender.careers},
    heroLegendaries:{attacker:attacker.legendarySelections,
      defender:defender.legendarySelections},
    heroLegendaryGrants:{attacker:attacker.legendaryGrants,
      defender:defender.legendaryGrants},
    attackerSpells:attacker.spellOrders,defenderSpells:defender.spellOrders,
    spellContext:trustedRules.spellContext??null,
    context:trustedRules.context,
    lossPolicy:trustedRules.lossPolicy,
    unitCatalog:trustedRules.unitCatalog??[],
    maxRounds:trustedRules.maxRounds??1000
   });
  },
  beforeCommit
 });
 return {...decision,
  persistence:{applied:true,atomic:true,
   idempotent:true,replayed:decision.replayed,
   caveat:'Only admitted historical Jactari subset casualty ledgers; no hero capture/wounds/mission/XP'},
  historicalRuleset:'Jactari 4.1.3-MTR bounded reproduction, NOT independently certified MMHK season 2'};
}
