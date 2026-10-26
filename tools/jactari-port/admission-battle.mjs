/**
 * Pre-battle admission gate for Jactari v4.1.3-MTR.
 * An early retreat/capture/wound is NOT a combat; it has no duel casualties.
 * The server must own and transactionally enforce wound/capture consequences.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {decideJactariAdmission,armyPower} from './admission.mjs';
import {simulateUnifiedBattle} from './unified-battle.mjs';
import {jactariReferenceProfile} from './source-profile.mjs';
export function adjudicateJactariBattle({mode,attackers,defenders,...rest}){
  const decision=decideJactariAdmission({
    attackPower:armyPower(attackers),
    defensePower:armyPower(defenders),
    mode
  });
  if(decision.admitted){
    const battle=simulateUnifiedBattle({attackers,defenders,...rest});
    return {...battle,admission:decision,
      battleOccurred:true,heroConsequence:null};
  }
  const original={attacker:attackers,defender:defenders};
  return {
    scope:'Jactari-prebattle-interception-only',
    status:decision.outcome,battleOccurred:false,
    admission:decision,
    rounds:0,events:[{turn:0,phase:'admission',outcome:decision.outcome,
      woundHours:decision.woundHours,captured:decision.captured}],
    persistentArmies:Object.fromEntries(Object.entries(original).map(([k,v])=>
      [k,structuredClone(v)])),
    permanent:null,
    heroConsequence:{
      affectedSide:'attacker',
      captured:decision.captured,
      woundHours:decision.woundHours,
      pendingServerResolution:true
    },
    limitations:['No server capture/wound state mutation',
      'No hero mission/return transaction','No MMHK S2 equivalence guaranteed']
  };
}

/**
 * EXPLICIT opt-in reference-calculator profile; cannot be silently interpreted
 * as an authentic MMHK Season 2 profile. Only for reproducible validation.
 */
export function adjudicateJactariReferenceBattle(request) {
 if(request.lossPolicy!==undefined)throw new Error('Reference profile fixes loss factor; omit lossPolicy');
 if(request.context?.weaponAdvantageFactor!==undefined)
   throw new Error('Reference profile fixes weapon advantage factor');
 const profile=jactariReferenceProfile();
 const result=adjudicateJactariBattle({
  ...request,context:{...request.context,weaponAdvantageFactor:profile.weaponAdvantageFactor},
  lossPolicy:{lossFactor:profile.lossFactor,source:profile.calculatorVersion}
 });
 return {...result,historicalRuleset:profile};
}
