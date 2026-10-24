/**
 * Unified, DOM-free Jactari subset: salvos -> 9-position rounds -> post-battle ledger.
 * SPDX-License-Identifier: GPL-3.0-or-later
 * This adapter is NOT a full Jactari battle engine or certified Ubisoft S2 oracle.
 * Powers of spells and historical loss factor are explicit inputs.
 */
import {validateArmySlots,resolveStackDuel} from './core.mjs';
import {calculateBonuses} from './bonuses.mjs';
import {resolveSimultaneousSalvos} from './ranged.mjs';
import {planSummoning} from './summoning.mjs';
import {resolveSingleTargetDamageSpell,resolveAttackStackBuff,resolveHeroDefenseDebuff} from './magic-effects.mjs';
import {resolvePostDuelRevival} from './magic-revival.mjs';
import {finalizePermanentLosses,casualtyModifier} from './losses.mjs';

const sides=['attacker','defender'];
const opposite=s=>s==='attacker'?'defender':'attacker';
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const active=a=>a.findIndex(x=>x&&x.remaining>0&&!x.dispersed);
const prepared=a=>[null,null,...a.map(s=>s?{...s,remaining:s.count,roundLosses:0,magicLosses:0,
  bonusTroops:0,bonusLost:0,raisedDuringBattle:0,temporaryRevived:0,dispersed:false,temporary:false}:null)];
function validateMagic(book,side){
 if(!book||typeof book!=='object'||Array.isArray(book))throw new TypeError('Invalid spell schedule');
 if(Object.keys(book).length>2)throw new RangeError('At most two spells per camp in this Jactari preset');
 for(const [round,spell] of Object.entries(book)){
  if(!Number.isSafeInteger(Number(round))||Number(round)<1||Number(round)>14)throw new RangeError('Spell round outside 1..14');
  if(!spell||!Number.isInteger(spell.type)||!Number.isInteger(spell.target)||!Number.isInteger(spell.unit))throw new RangeError('Incomplete spell');
  const {type,target,unit}=spell;
  const allowed=(type===0&&((target===4&&[1,3,7].includes(unit))||(target===3&&[1,3].includes(unit))))||
     (type===1&&[0,1,2].includes(target)&&[0,4].includes(unit))||
     (type===2&&[8,9].includes(target)&&unit===2)||
     (type===3&&target===(side==='attacker'?6:5)&&[5,6].includes(unit))||
     (type===4&&target===(side==='attacker'?5:6)&&[0,1,2,3].includes(unit));
  if(!allowed)throw new Error('Unsupported spell signature '+[type,target,unit].join(':')+' for '+side);
  if(own(spell,'casterFaction'))throw new Error('Client cannot choose the summoning faction');
  if(type===0&&target===3){
   if(!spell.powerByWeapon||typeof spell.powerByWeapon!=='object')throw new RangeError('Area spell needs per-weapon powers');
   for(const w of ['I','R','C'])if(!Number.isFinite(spell.powerByWeapon[w])||spell.powerByWeapon[w]<0)
     throw new RangeError('Area power absent for '+w);
  }else if(!Number.isFinite(spell.power)||spell.power<0)throw new RangeError('Unresolved magic power');
 }
}
function describeTemporary(army){return army.slice(0,2).map((x,i)=>x?{slot:i,initial:x.count,
  remaining:x.remaining,creatureIndex:x.creatureIndex,discarded:true}:null);}
function terminalDisplay(armies,status,last){
 const displayed=Object.fromEntries(sides.map(side=>[side,armies[side].map(s=>s?s.remaining:null)]));
 const r=last[status];let cleanup=null;
 if(status!=='mutual-dispersion'&&r&&r.mode==='tmp'){
  const a=armies[status],idx=active(a);
  if(idx===r.slot){
   const before=a[idx].remaining,after=Math.max(0,before-r.revived);
   displayed[status][idx]=after;
   cleanup={side:status,slot:idx,removed:before-after,before,after};
  }
 }
 return {displayed,cleanup};
}
function applySpell({spell,side,turn,activeBefore,armies,heroes,catalog,initial,events}){
 const enemy=opposite(side),ownArmy=armies[side],enemyArmy=armies[enemy];
 const targetOwn=activeBefore[side],targetEnemy=activeBefore[enemy];
 const {type,target,unit}=spell;
 if(type===1){
  const faction=heroes[side]?.faction;
  if(!Number.isSafeInteger(faction))throw new Error('Trusted hero faction required for summoning');
  if(!catalog)throw new Error('Unit catalog required for summoning');
  const plan=planSummoning({target,unit,power:spell.power,casterFaction:faction,unitCatalog:catalog,
   opposingSevenSlots:initial[enemy],specialSlots:ownArmy.slice(0,2)});
  if(!plan.available||plan.unitCount===0){events.push({turn,phase:'summon-no-effect',side,reason:plan.reason??'zero-unit-summon'});return null;}
  if(ownArmy[plan.specialIndex])throw new Error('Third summon would replace occupied special slot: unsupported');
  ownArmy[plan.specialIndex]={...plan.creature,count:plan.unitCount,remaining:plan.unitCount,
   roundLosses:0,magicLosses:0,bonusTroops:0,bonusLost:0,raisedDuringBattle:0,temporaryRevived:0,
   dispersed:false,temporary:true,creatureIndex:plan.creatureIndex};
  events.push({turn,phase:'summon',side,slot:plan.specialIndex,count:plan.unitCount,creatureIndex:plan.creatureIndex});
  return null;
 }
 if(type===2){
  events.push({turn,phase:'spell-declared',side,kind:'revival',mode:target===8?'tmp':'def',targetSlot:targetOwn});
  return {mode:target===8?'tmp':'def',percent:spell.power,slot:targetOwn};
 }
 if(type===0){
  const targets=target===4?[targetEnemy]:[0,1,2,3,4,5,6,7,8];
  const hits=[];
  for(const i of targets){
   const stack=enemyArmy[i];if(!stack)continue;
   const power=target===4?spell.power:spell.powerByWeapon[stack.weapon];
   const effect=resolveSingleTargetDamageSpell({target:{count:stack.remaining,unitPower:stack.unitPower},unit,power});
   stack.remaining=effect.remaining;stack.magicLosses+=effect.casualties;
   if(stack.remaining===0)stack.dispersed=true;
   hits.push({slot:i,casualties:effect.casualties,power});
  }
  events.push({turn,phase:'spell',side,kind:target===4?'target-damage':'area-damage',hits});
  return null;
 }
 if(type===4){
  const stack=ownArmy[targetOwn];
  const effect=resolveAttackStackBuff({target:{count:stack.remaining,unitPower:stack.unitPower},unit,power:spell.power});
  stack.remaining=effect.remaining;stack.bonusTroops+=effect.bonusCount;
  events.push({turn,phase:'spell',side,kind:'buff',slot:targetOwn,bonusTroops:effect.bonusCount});
  return null;
 }
 if(type===3){
  if(!heroes[enemy])throw new Error('Enemy hero required for debuff');
  const key=side==='attacker'?'defense_modifiee':'attaque_modifiee';
  const value=heroes[enemy][key];
  if(!Number.isFinite(value)||value<0)throw new Error('Missing enemy hero statistic');
  const effect=resolveHeroDefenseDebuff({defense:value,power:spell.power,unit});
  heroes[enemy][key]=effect.remainingDefense;
  events.push({turn,phase:'spell',side,kind:'hero-debuff',stat:key,...effect});
  return null;
 }
 throw new Error('Unknown effect');
}
/** Unified supported mechanics, one deterministic snapshot, not an authentic complete Jactari oracle. */
export function simulateUnifiedBattle({attackers,defenders,attackerSpells={},defenderSpells={},
 attackerSalvos=[],defenderSalvos=[],unitCatalog=[],context={},lossPolicy,maxRounds=1000}){
 validateArmySlots(attackers);validateArmySlots(defenders);
 for(const stack of [...attackers,...defenders].filter(Boolean))
  if(!['I','R','C'].includes(stack.weapon))throw new RangeError('Unrecognized unit weapon');
 validateMagic(attackerSpells,'attacker');validateMagic(defenderSpells,'defender');
 for(const [side,book] of [['attacker',attackerSpells],['defender',defenderSpells]]){
  if(Object.keys(book).length>0&&(!context[side+'Hero']||typeof context[side+'Hero']!=='object'))
   throw new Error('Spell casting requires a trusted '+side+' hero');
 }
 if(!Number.isSafeInteger(maxRounds)||maxRounds<1)throw new RangeError('Invalid round limit');
 if(!lossPolicy||!Number.isFinite(lossPolicy.lossFactor)||lossPolicy.lossFactor<0)throw new RangeError('Explicit loss factor required');
 if(['magic','spells','retreat','siege','resurrection','specialPhases'].some(k=>context[k]))
  throw new Error('Additional Jactari phase not supported');
 const prebattle=resolveSimultaneousSalvos({attackers,defenders,attackerSalvos,defenderSalvos});
 const original={attacker:attackers,defender:defenders};
 const armies={attacker:prepared(prebattle.attacker.survivors),defender:prepared(prebattle.defender.survivors)};
 const heroes={attacker:context.attackerHero?{...context.attackerHero}:null,
  defender:context.defenderHero?{...context.defenderHero}:null};
 const preCasualties={attacker:prebattle.attacker.killed,defender:prebattle.defender.killed};
 for(const side of sides)for(let i=0;i<7;i++)if(armies[side][i+2]){
  armies[side][i+2].count=original[side][i].count;
  armies[side][i+2].roundLosses=preCasualties[side][i];
 }
 const events=[];
 for(const side of sides)for(let i=0;i<7;i++)if(preCasualties[side][i]>0)
  events.push({turn:0,phase:'salvo',side,targetSlot:i+2,casualties:preCasualties[side][i]});
 const books={attacker:attackerSpells,defender:defenderSpells};
 let lastRevival={};let status=null;
 for(let turn=1;turn<=maxRounds;turn++){
  const index={attacker:active(armies.attacker),defender:active(armies.defender)};
  if(index.attacker<0||index.defender<0){
   if(sides.some(side=>Object.keys(books[side]).some(k=>Number(k)>=turn)))throw new Error('Unreachable spell turn');
   status=index.attacker<0&&index.defender<0?'mutual-dispersion':index.attacker<0?'defender':'attacker';
   break;
  }
  const pending={};lastRevival={};
  const start={attacker:armies.attacker[index.attacker].remaining,defender:armies.defender[index.defender].remaining};
  for(const side of sides)if(own(books[side],turn)){
   const current={attacker:active(armies.attacker),defender:active(armies.defender)};
   if(current.attacker<0||current.defender<0)
    throw new Error('Spell cast after enemy elimination in same round is unsupported');
   if(side==='attacker')start.attacker=armies.attacker[current.attacker].remaining;
   if(side==='defender')start.defender=armies.defender[current.defender].remaining;
   pending[side]=applySpell({spell:books[side][turn],side,turn,activeBefore:current,armies,heroes,catalog:unitCatalog,initial:original,events});
  }
  const ai=active(armies.attacker),di=active(armies.defender);
  if(ai<0||di<0){
   if(pending.attacker||pending.defender)throw new Error('Revival without a duel is unsupported');
   continue;
  }
  const a=armies.attacker[ai],d=armies.defender[di];
  const modifiers=calculateBonuses({attackerWeapon:a.weapon,defenderWeapon:d.weapon,
   attackerHero:heroes.attacker,defenderHero:heroes.defender,
   weaponAdvantageFactor:context.weaponAdvantageFactor??0,morale:context.morale??{},
   special:context.special??{},fortification:context.fortification??{}});
  const duel=resolveStackDuel({attacker:{count:a.remaining,unitPower:a.unitPower},
   defender:{count:d.remaining,unitPower:d.unitPower},modifiers});
  for(const [side,stack] of [['attacker',a],['defender',d]]){
   const killed=duel.losses[side]===-1?0:Math.max(0,duel.losses[side]);
   stack.roundLosses+=killed;
   stack.bonusLost+=Math.min(Math.max(0,stack.bonusTroops-stack.bonusLost),killed);
   stack.remaining=duel.remaining[side];
   stack.dispersed ||=duel.dispersed[side]||stack.remaining<=0;
  }
  events.push({turn,phase:'duel',attackerSlot:ai,defenderSlot:di,duel,modifiers});
  for(const side of sides){
   const plan=pending[side];if(!plan)continue;
   const slot=side==='attacker'?ai:di;
   if(slot!==plan.slot)throw new Error('Revival target changed because of summon or magic: unsupported historic case');
   const stack=armies[side][slot];
   const effect=resolvePostDuelRevival({remaining:stack.remaining,losses:duel.losses[side],
    roundStart:start[side],mode:plan.mode,percent:plan.percent});
   stack.remaining=effect.remaining;
   if(plan.mode==='def')stack.roundLosses+=effect.recordedLossAdjustment;
   else {stack.raisedDuringBattle+=effect.revived;stack.temporaryRevived+=effect.revived;}
   const e={turn,phase:'revival',side,slot,mode:plan.mode,revived:effect.revived};
   lastRevival[side]=e;events.push(e);
  }
 }
 if(!status)throw new Error('Round limit exceeded');
 const permanent={},persistentArmies={};
 const outcome=status==='mutual-dispersion'?'draw':status;
 for(const side of sides){
  const originalSlots=original[side],policy=lossPolicy[side]??{};
  const ownHero=side==='attacker'?context.attackerHero:context.defenderHero;
  const enemyHero=side==='attacker'?context.defenderHero:context.attackerHero;
  const stacks=originalSlots.map((x,i)=>x?{...x,
   roundLosses:armies[side][i+2].roundLosses,magicLosses:armies[side][i+2].magicLosses,
   bonusLost:armies[side][i+2].bonusLost,raisedDuringBattle:armies[side][i+2].raisedDuringBattle}:null);
  permanent[side]=finalizePermanentLosses({slots:stacks,side,battleOutcome:outcome,lossFactor:lossPolicy.lossFactor,
   modifier:casualtyModifier({side,ownHero,enemyHero,tearsLossBonus:policy.tearsLossBonus??0})+(policy.modifier??0),
   playerControlled:policy.playerControlled??true,hasHero:policy.hasHero??true,
   raiseDeadRate:policy.raiseDeadRate??0,resurrectionPower:policy.resurrectionPower??0});
  persistentArmies[side]=originalSlots.map((s,i)=>{
   if(!s)return null;
   const dead=permanent[side].reports[i].permanent;
   if(!Number.isSafeInteger(dead)||dead<0||dead>s.count)throw new RangeError('Impossible final troop losses');
   return {...s,count:s.count-dead};
  });
 }
 return {status,events,rounds:events.filter(e=>e.phase==='duel').length,prebattle,heroes,
  battlefield:{attacker:armies.attacker,defender:armies.defender},
  terminalDisplay:terminalDisplay(armies,status,lastRevival),
  temporarySummons:{attacker:describeTemporary(armies.attacker),defender:describeTemporary(armies.defender)},
  permanent,persistentArmies,
  lossPolicy:{source:lossPolicy.source??'explicit-experimental',lossFactor:lossPolicy.lossFactor},
  scope:'unified-supported-Jactari-subset',
  limitations:['No full original Jactari encounter parity','No real mana or spell-learning server rules',
   'No retreat/siege/hero wounds','Uncovered historical summon overwrite is refused']};
}
