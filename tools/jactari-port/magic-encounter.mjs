/** Deterministic attacker-spell subset of Jactari lancement_sorts and simulation_rencontre.
 * SPDX-License-Identifier: GPL-3.0-or-later. Spell power is pre-resolved.
 * No defensive spells, area spells, resurrection, magic resistance resolution or mana.
 */
import {resolveStackDuel,validateArmySlots} from './core.mjs';
import {calculateBonuses} from './bonuses.mjs';
import {resolveSingleTargetDamageSpell,resolveAttackStackBuff} from './magic-effects.mjs';
const supported=new Set(['0:4:1','0:4:3','0:4:7','4:5:0','4:5:1','4:5:2','4:5:3']);
const active=army=>army.findIndex(s=>s&&s.remaining>0&&!s.dispersed);
const project=army=>army.map(s=>s?{...s,remaining:s.count,roundLosses:0,magicLosses:0,bonusTroops:0,bonusLost:0,dispersed:false}:null);
function checkSpell(s){
 if(!s||!Number.isFinite(s.power)||s.power<0)throw new RangeError('Invalid spell power');
 const key=s.type+':'+s.target+':'+s.unit;
 if(!supported.has(key))throw new Error('Unsupported spell effect '+key);
 return key;
}
export function simulateAttackerMagicEncounter({attackers,defenders,spellsByRound={},context={},maxRounds=1000}){
 validateArmySlots(attackers);validateArmySlots(defenders);
 for(const s of [...attackers,...defenders])if(s&&!['I','R','C'].includes(s.weapon))throw new RangeError('Unsupported weapon');
 if(!Number.isSafeInteger(maxRounds)||maxRounds<1)throw new RangeError('Invalid maxRounds');
 if(context.magic||context.spells||context.retreat||context.siege||context.prebattle||context.specialPhases)throw new Error('Unsupported context');
 if(!spellsByRound||typeof spellsByRound!=='object'||Array.isArray(spellsByRound))throw new TypeError('Invalid schedule');
 for(const [turn,spell] of Object.entries(spellsByRound)){
  if(!Number.isSafeInteger(Number(turn))||Number(turn)<1)throw new RangeError('Invalid turn');
  checkSpell(spell);
 }
 const a=project(attackers),d=project(defenders),events=[];
 for(let turn=1;turn<=maxRounds;turn++){
  let ai=active(a),di=active(d);
  if(ai<0||di<0){
   if(Object.keys(spellsByRound).some(k=>Number(k)>=turn))throw new Error('Unreachable scheduled spell round');
   return {status:ai<0&&di<0?'mutual-dispersion':ai<0?'defender':'attacker',rounds:events.length,events,attacker:a,defender:d,
    completeness:'attacker-only single-target spells; not full Jactari battle'};
  }
  const spell=spellsByRound[turn];
  if(spell){
   const key=checkSpell(spell);
   if(spell.type===0){
    const victim=d[di];
    const result=resolveSingleTargetDamageSpell({target:{count:victim.remaining,unitPower:victim.unitPower},unit:spell.unit,power:spell.power});
    victim.remaining=result.remaining;victim.magicLosses+=result.casualties;
    if(victim.remaining===0)victim.dispersed=true;
    events.push({turn,phase:'spell',side:'attacker',targetSlot:di+1,key,casualties:result.casualties,power:spell.power});
   }else{
    const friend=a[ai];
    const result=resolveAttackStackBuff({target:{count:friend.remaining,unitPower:friend.unitPower},unit:spell.unit,power:spell.power});
    friend.remaining=result.remaining;friend.bonusTroops+=result.bonusCount;
    events.push({turn,phase:'spell',side:'attacker',targetSlot:ai+1,key,bonusTroops:result.bonusCount,power:spell.power});
   }
  }
  ai=active(a);di=active(d);
  if(ai<0||di<0)continue;
  const x=a[ai],y=d[di];
  const modifiers=calculateBonuses({attackerWeapon:x.weapon,defenderWeapon:y.weapon,attackerHero:context.attackerHero??null,
   defenderHero:context.defenderHero??null,morale:context.morale??{},special:context.special??{},
   weaponAdvantageFactor:context.weaponAdvantageFactor??0,fortification:context.fortification??{}});
  const duel=resolveStackDuel({attacker:{count:x.remaining,unitPower:x.unitPower},
   defender:{count:y.remaining,unitPower:y.unitPower},modifiers});
  const lossA=duel.losses.attacker===-1?0:Math.max(0,duel.losses.attacker);
  const lossD=duel.losses.defender===-1?0:Math.max(0,duel.losses.defender);
  x.roundLosses+=lossA;y.roundLosses+=lossD;
  x.bonusLost+=Math.min(Math.max(0,x.bonusTroops-x.bonusLost),lossA);
  y.bonusLost+=Math.min(Math.max(0,y.bonusTroops-y.bonusLost),lossD);
  x.remaining=duel.remaining.attacker;y.remaining=duel.remaining.defender;
  x.dispersed ||=duel.dispersed.attacker||x.remaining<=0;
  y.dispersed ||=duel.dispersed.defender||y.remaining<=0;
  events.push({turn,phase:'duel',attackerSlot:ai+1,defenderSlot:di+1,duel});
 }
 throw new Error('Round limit exceeded');
}
