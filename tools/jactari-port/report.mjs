/** Structured battle report for SUPPORTED Jactari phases only.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 * Requires explicit final loss factors; never assumes historic S2 coefficients.
 */
import {simulateSupportedBattle} from './battle.mjs';
import {finalizePermanentLosses,casualtyModifier} from './losses.mjs';

export function simulateBattleWithLossReport({attackers,defenders,attackerSalvos=[],defenderSalvos=[],context={},lossPolicy}){
  if(!lossPolicy || !Number.isFinite(lossPolicy.lossFactor) || lossPolicy.lossFactor<0)
    throw new RangeError('Explicit nonnegative lossPolicy.lossFactor required');
  const base=simulateSupportedBattle({attackers,defenders,attackerSalvos,defenderSalvos,context});
  const outcome=base.verdict==='mutual-dispersion'?'draw':base.verdict;
  const options={attacker:lossPolicy.attacker??{},defender:lossPolicy.defender??{}};
  const from=(original,pre,melee,side)=>{
    const config=options[side];
    if(['playerControlled','hasHero','modifier','raiseDeadRate','resurrectionPower'].some(k=>config[k]!==undefined && (typeof config[k]!=='number'&&typeof config[k]!=='boolean')))
      throw new TypeError('Invalid final-loss policy');
    const slots=original.map((s,i)=>{
      if(!s)return null;
      return {...s,roundLosses:pre.killed[i]+(melee?.[side]?.[i]?.roundLosses??0),
        magicLosses:0,bonusLost:s.bonusLost??0,raisedDuringBattle:0,
        goldCost:s.goldCost??0,rareCosts:s.rareCosts??{}};
    });
    const calculatedModifier=casualtyModifier({
      side,ownHero:side==='attacker'?context.attackerHero:context.defenderHero,
      enemyHero:side==='attacker'?context.defenderHero:context.attackerHero,
      tearsLossBonus:config.tearsLossBonus??0});
    return finalizePermanentLosses({slots,side,battleOutcome:outcome,
      lossFactor:lossPolicy.lossFactor,
      playerControlled:config.playerControlled??true,
      hasHero:config.hasHero??true,
      modifier:calculatedModifier+(config.modifier??0),
      raiseDeadRate:config.raiseDeadRate??0,
      resurrectionPower:config.resurrectionPower??0});
  };
  const permanent={attacker:from(attackers,base.prebattle.attacker,base.melee?.attacker,'attacker'),
    defender:from(defenders,base.prebattle.defender,base.melee?.defender,'defender')};
  return {...base,permanent,lossPolicy:{source:lossPolicy.source??'explicit-experimental',lossFactor:lossPolicy.lossFactor},
    completeness:'supported prebattle and basic melee, plus parametrized Jactari-derived postbattle conversion',
    warning:'Not a fully equivalent MMHK S2 battle: spells, hero wounds, retreats and full statuses remain unsupported'};
}
