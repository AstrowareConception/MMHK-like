/** Two-caster Jactari subset -> permanent loss report. GPL-3.0-or-later.
 * Explicit loss factor required. NO original-server parity is implied.
 */
import {simulateDualMagicEncounter} from './magic-rounds.mjs';
import {casualtyModifier,finalizePermanentLosses} from './losses.mjs';
export function simulateDualMagicBattleReport({attackers,defenders,attackerSpells={},defenderSpells={},context={},lossPolicy}){
 if(!lossPolicy||!Number.isFinite(lossPolicy.lossFactor)||lossPolicy.lossFactor<0)
  throw new RangeError('Explicit lossPolicy.lossFactor required');
 const encounter=simulateDualMagicEncounter({attackers,defenders,attackerSpells,defenderSpells,context});
 const winner=encounter.status==='mutual-dispersion'?'draw':encounter.status;
 const options={attacker:lossPolicy.attacker??{},defender:lossPolicy.defender??{}};
 const permanent={};
 for(const side of ['attacker','defender']){
  const original=side==='attacker'?attackers:defenders,state=encounter[side],opt=options[side];
  const own=side==='attacker'?context.attackerHero:context.defenderHero;
  const enemy=side==='attacker'?context.defenderHero:context.attackerHero;
  const modifier=casualtyModifier({ownHero:own,enemyHero:enemy,side,tearsLossBonus:opt.tearsLossBonus??0});
  const slots=original.map((s,i)=>s?{...s,roundLosses:state[i].roundLosses,
   magicLosses:state[i].magicLosses,bonusLost:state[i].bonusLost,raisedDuringBattle:state[i].raisedDuringBattle??0}:null);
  permanent[side]=finalizePermanentLosses({slots,side,battleOutcome:winner,
   lossFactor:lossPolicy.lossFactor,modifier:modifier+(opt.modifier??0),
   playerControlled:opt.playerControlled??true,hasHero:opt.hasHero??true,
   raiseDeadRate:opt.raiseDeadRate??0,resurrectionPower:opt.resurrectionPower??0});
 }
 return {encounter,permanent,lossPolicy:{source:lossPolicy.source??'explicit-experimental',lossFactor:lossPolicy.lossFactor},
  completeness:'subset two-caster targeted/area magic, buff/debuff, melee and parametrized postbattle losses',
  limitations:['No mana or spell eligibility','No general Jactari spell catalog','No midcombat resurrection','No PvE retreat, siege or hero injuries']};
}
