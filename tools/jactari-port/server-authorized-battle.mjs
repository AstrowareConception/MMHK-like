/**
 * Server-side, read-only battle preview from authentic persisted hero choices.
 *
 * This function is NOT an HTTP handler and NOT a production PvP adjudicator.
 * The integrator MUST inject trusted authentication, target authorization,
 * server-side army records, rules and catalogs. The client controls ONLY IDs.
 *
 * No casualty, movement, capture, honor or wounded-hero DB writes occur.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {simulateBattleWithDerivedHeroes} from './hero-combat-battle.mjs';

const record=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const exactly=(o,keys,label)=>{
 if(!record(o)||Object.keys(o).some(k=>!keys.includes(k)))
  throw new TypeError(label+' contains forbidden or unknown fields');
 return o;
};
export function previewServerAuthorizedHeroBattle({
 command,authContext,authenticate,authorizeTarget,heroStore,trustedRules
}){
 exactly(command,['attackerHeroId','defenderHeroId'],'Client battle command');
 if(typeof command.attackerHeroId!=='string'||typeof command.defenderHeroId!=='string'||
   command.attackerHeroId===command.defenderHeroId)
  throw new RangeError('Two different stored hero IDs required');
 if(typeof authenticate!=='function'||typeof authorizeTarget!=='function')
  throw new Error('Server authentication and target authorization hooks required');
 if(!heroStore||typeof heroStore.readConsistentPair!=='function'||
    typeof heroStore.isPlayerEnabled!=='function')
  throw new TypeError('Trusted hero repository required');
 const rules=exactly(trustedRules,
  ['context','lossPolicy','spellContext','unitCatalog','maxRounds'],
  'Trusted battle rules');
 if(!record(rules.context)||!record(rules.lossPolicy)||
    !Number.isFinite(rules.lossPolicy.lossFactor))
  throw new TypeError('Explicit server-side context and loss policy required');

 // Auth context is a server-owned opaque session, never part of command.
 const principal=authenticate(authContext);
 if(!record(principal)||principal.authenticated!==true||
   typeof principal.playerId!=='string'||!heroStore.isPlayerEnabled(principal.playerId))
  throw new Error('Unauthenticated or inactive principal');
 const [attacker,defender]=heroStore.readConsistentPair(
  command.attackerHeroId,command.defenderHeroId);
 if(!attacker||!defender)throw new Error('One or both heroes do not exist');
 if(attacker.ownerId!==principal.playerId)
  throw new Error('Unauthorized: the attacker hero is not owned by the principal');

 // Validate target visibility, diplomacy, world rules, etc. through a server
 // policy. No permissive default and no cross-player previews by accident.
 const approved=authorizeTarget({
  principal:structuredClone(principal),
  attacker:structuredClone(attacker),
  defender:structuredClone(defender)
 });
 if(approved!==true)
  throw new Error('Unauthorized or unsupported target; authorization denied');

 const before={attacker:attacker.revision,defender:defender.revision};
 const result=simulateBattleWithDerivedHeroes({
  attackers:attacker.army,defenders:defender.army,
  heroProfiles:{attacker:attacker.profile,defender:defender.profile},
  heroCareers:{attacker:attacker.careers,defender:defender.careers},
  heroLegendaries:{attacker:attacker.legendarySelections,
    defender:defender.legendarySelections},
  heroLegendaryGrants:{attacker:attacker.legendaryGrants,
    defender:defender.legendaryGrants},
  attackerSpells:attacker.spellOrders,
  defenderSpells:defender.spellOrders,
  spellContext:rules.spellContext??null,
  unitCatalog:rules.unitCatalog??[],
  context:rules.context,lossPolicy:rules.lossPolicy,
  maxRounds:rules.maxRounds??1000
 });
 const [afterA,afterD]=heroStore.readConsistentPair(
  command.attackerHeroId,command.defenderHeroId);
 if(afterA?.revision!==before.attacker||afterD?.revision!==before.defender)
  throw new Error('Stale preview: persisted hero revision changed during calculation');
 return {...result,
  authorization:{validated:true,actor:principal.playerId,
   attackerHeroId:attacker.id,defenderHeroId:defender.id,
   sourceRevisions:before,readOnly:true},
  persistence:{applied:false,reason:'Preview only; server transactional battle adjudication not implemented'},
  rulesProvenance:'Trusted server-supplied Jactari reference parameters; not independently certified MMHK S2'};
}
