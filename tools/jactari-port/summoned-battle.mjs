/** Jactari-derived, DOM-free, summon-only melee subset.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 * Original Jactari indexes summons as 0/1, regular troops as 2..8.
 * This subset does not claim equivalence for magic/retreat/siege or overridden summon slots.
 */
import {resolveStackDuel, validateArmySlots} from './core.mjs';
import {calculateBonuses} from './bonuses.mjs';
import {planSummoning} from './summoning.mjs';
import {finalizePermanentLosses, casualtyModifier} from './losses.mjs';

const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const active=slots=>slots.findIndex(s=>s && s.remaining>0 && !s.dispersed);
function prepare(slots){
  validateArmySlots(slots);
  for(const s of slots.filter(Boolean))if(!['I','R','C'].includes(s.weapon))throw new RangeError('Unsupported weapon');
  return [null,null,...slots.map(s=>s?{...s,remaining:s.count,roundLosses:0,magicLosses:0,dispersed:false,temporary:false}:null)];
}
function validateSchedule(book){
 if(book===null || typeof book!=='object' || Array.isArray(book))throw new TypeError('Invalid summon schedule');
 for(const [t,spell] of Object.entries(book)){
  if(!Number.isSafeInteger(Number(t))||Number(t)<1)throw new RangeError('Invalid turn');
  if(!spell||spell.type!==1||![0,1,2].includes(spell.target)||![0,4].includes(spell.unit)||
     !Number.isFinite(spell.power)||spell.power<0||Object.hasOwn(spell,'casterFaction'))
      throw new Error('Unsupported or invalid summon spell');
 }
}
/** Returns battle state; spawned units are never included in regularArmy[7]. */
export function simulateSummonedMeleeEncounter({attackers,defenders,attackerSummons={},defenderSummons={},unitCatalog,
 context={},maxRounds=1000}){
 const a=prepare(attackers),d=prepare(defenders);
 validateSchedule(attackerSummons);validateSchedule(defenderSummons);
 if(!Array.isArray(unitCatalog))throw new TypeError('Unit catalog required');
 if(!Number.isSafeInteger(maxRounds)||maxRounds<1)throw new RangeError('Invalid maxRounds');
 if(['magic','spells','prebattle','siege','retreat','resurrection','specialPhases'].some(k=>context[k]))throw new Error('Unsupported non-summon phase');
 const events=[];
 const army={attacker:a,defender:d},books={attacker:attackerSummons,defender:defenderSummons};
 const initial={attacker:attackers,defender:defenders};
 for(let turn=1;turn<=maxRounds;turn++){
  if(active(a)<0||active(d)<0){
   if(Object.values(books).some(book=>Object.keys(book).some(k=>Number(k)>=turn)))throw new Error('Unreachable scheduled summon turn');
   const status=active(a)<0 && active(d)<0?'mutual-dispersion':active(a)<0?'defender':'attacker';
   const special={attacker:a.slice(0,2).map(x=>x?{...x}:null),defender:d.slice(0,2).map(x=>x?{...x}:null)};
   return {status,events,rounds:events.filter(e=>e.phase==='duel').length,
    regular:{attacker:a.slice(2),defender:d.slice(2)},specialAtEnd:special,
    discardedSummons:Object.fromEntries(Object.entries(special).map(([side,stacks])=>[side,stacks.map((s,i)=>s?{slot:i,remaining:s.remaining,initial:s.count,kind:'summon',discarded:true}:null)])),
    completeness:'summon-only combat with historical 0/1 special priority; no other spells or travel'};
  }
  for(const side of ['attacker','defender']){
   const book=books[side];if(!own(book,turn))continue;
   const spell=book[turn],their=side==='attacker'?'defender':'attacker',slots=army[side];
   const casterFaction=context[side==='attacker'?'attackerHero':'defenderHero']?.faction;
   if(!Number.isSafeInteger(casterFaction))throw new Error('Missing authoritative hero faction');
   const plan=planSummoning({target:spell.target,unit:spell.unit,power:spell.power,
    casterFaction,unitCatalog,
    opposingSevenSlots:initial[their],specialSlots:slots.slice(0,2)});
   if(!plan.available||plan.unitCount<=0){events.push({turn,phase:'summon-no-effect',side,plan});continue;}
   if(slots[plan.specialIndex])throw new Error('Both special summon slots occupied: original overwrite not yet supported');
   slots[plan.specialIndex]={...plan.creature,count:plan.unitCount,remaining:plan.unitCount,
    roundLosses:0,magicLosses:0,dispersed:false,temporary:true,creatureIndex:plan.creatureIndex};
   events.push({turn,phase:'summon',side,slot:plan.specialIndex,creatureIndex:plan.creatureIndex,
    count:plan.unitCount,summonedPower:plan.summonedPower});
  }
  const ai=active(a),di=active(d);
  if(ai<0||di<0)continue;
  const x=a[ai],y=d[di];
  const modifiers=calculateBonuses({attackerWeapon:x.weapon,defenderWeapon:y.weapon,
   attackerHero:context.attackerHero??null,defenderHero:context.defenderHero??null,
   weaponAdvantageFactor:context.weaponAdvantageFactor??0,morale:context.morale??{},
   special:context.special??{},fortification:context.fortification??{}});
  const duel=resolveStackDuel({attacker:{count:x.remaining,unitPower:x.unitPower},
   defender:{count:y.remaining,unitPower:y.unitPower},modifiers});
  x.roundLosses+=Math.max(0,duel.losses.attacker);
  y.roundLosses+=Math.max(0,duel.losses.defender);
  x.remaining=duel.remaining.attacker;y.remaining=duel.remaining.defender;
  x.dispersed ||=duel.dispersed.attacker||x.remaining<=0;
  y.dispersed ||=duel.dispersed.defender||y.remaining<=0;
  events.push({turn,phase:'duel',attackerSlot:ai,defenderSlot:di,duel});
 }
 throw new Error('Round limit exceeded');
}
/** Post-combat ledger for original, regular seven slots only. Summons never enter persistence. */
export function simulateSummonedBattleReport({attackers,defenders,lossPolicy,context={},...rest}){
 if(!lossPolicy || !Number.isFinite(lossPolicy.lossFactor)||lossPolicy.lossFactor<0)throw new RangeError('Explicit lossFactor required');
 const battle=simulateSummonedMeleeEncounter({attackers,defenders,context,...rest});
 const verdict=battle.status==='mutual-dispersion'?'draw':battle.status;
 const permanent={},persistentArmies={};
 for(const side of ['attacker','defender']){
  const original=side==='attacker'?attackers:defenders;
  const spec=lossPolicy[side]??{};
  const ownHero=side==='attacker'?context.attackerHero:context.defenderHero;
  const enemyHero=side==='attacker'?context.defenderHero:context.attackerHero;
  const slots=original.map((stack,i)=>stack?{...stack,
   roundLosses:battle.regular[side][i].roundLosses,magicLosses:0,bonusLost:0,raisedDuringBattle:0}:null);
  permanent[side]=finalizePermanentLosses({slots,side,battleOutcome:verdict,lossFactor:lossPolicy.lossFactor,
   playerControlled:spec.playerControlled??true,hasHero:spec.hasHero??true,
   modifier:casualtyModifier({side,ownHero,enemyHero,tearsLossBonus:spec.tearsLossBonus??0})+(spec.modifier??0),
   raiseDeadRate:spec.raiseDeadRate??0,resurrectionPower:spec.resurrectionPower??0});
  persistentArmies[side]=original.map((stack,i)=>{
   if(!stack)return null;
   const dead=permanent[side].reports[i].permanent;
   if(!Number.isSafeInteger(dead)||dead<0||dead>stack.count)throw new RangeError('Impossible permanent losses');
   return {...stack,count:stack.count-dead};
  });
 }
 return {...battle,permanent,persistentArmies,lossPolicy:{lossFactor:lossPolicy.lossFactor,
  source:lossPolicy.source??'explicit-experimental'}};
}
