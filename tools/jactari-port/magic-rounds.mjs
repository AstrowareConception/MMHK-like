/** Jactari subset: both casters, per-stack and area magic, hero debuffs, pre-duel buffs.
 * SPDX-License-Identifier: GPL-3.0-or-later. Spell powers MUST be pre-resolved.
 * Not the complete launcher: no mana, resurrection, resistance calculation or siege.
 */
import {resolveStackDuel,validateArmySlots} from './core.mjs';
import {calculateBonuses} from './bonuses.mjs';
import {resolveSingleTargetDamageSpell,resolveAttackStackBuff,resolveHeroDefenseDebuff} from './magic-effects.mjs';
import {resolvePostDuelRevival} from './magic-revival.mjs';
import {projectTerminalTemporaryRevival} from './terminal-cleanup.mjs';
const weapons=new Set(['I','R','C']);
const clone=x=>x?{...x}:null;
const active=a=>a.findIndex(s=>s&&s.remaining>0&&!s.dispersed);
const prepare=a=>a.map(s=>s?{...s,remaining:s.count,roundLosses:0,magicLosses:0,bonusTroops:0,bonusLost:0,raisedDuringBattle:0,temporaryRevived:0,dispersed:false}:null);
function checkArmy(a){validateArmySlots(a);a.forEach(s=>{if(s&&!weapons.has(s.weapon))throw new RangeError('Unsupported stack weapon')});}
function verify(book){
 if(book===null||Array.isArray(book)||typeof book!=='object')throw new TypeError('Invalid spell schedule');
 for(const [turn,s] of Object.entries(book)){
  if(!Number.isSafeInteger(Number(turn))||Number(turn)<1)throw new RangeError('Invalid turn');
  if(!s||!Number.isInteger(s.type)||!Number.isInteger(s.target)||!Number.isInteger(s.unit))throw new RangeError('Invalid spell signature');
  const allowed=(s.type===0&&((s.target===4&&[1,3,7].includes(s.unit))||(s.target===3&&[1,3].includes(s.unit))))
   ||(s.type===4&&[5,6].includes(s.target)&&[0,1,2,3].includes(s.unit))
   ||(s.type===3&&[5,6].includes(s.target)&&[5,6].includes(s.unit))
   ||(s.type===2&&[8,9].includes(s.target)&&s.unit===2);
  if(!allowed)throw new Error('Unsupported Jactari spell effect '+s.type+':'+s.target+':'+s.unit);
  if(s.type===0&&s.target===3){
   if(!s.powerByWeapon||typeof s.powerByWeapon!=='object')throw new RangeError('Area spell requires powerByWeapon');
   for(const p of Object.values(s.powerByWeapon))if(!Number.isFinite(p)||p<0)throw new RangeError('Invalid area spell power');
  }else if(!Number.isFinite(s.power)||s.power<0)throw new RangeError('Precomputed spell power required');
 }
}
function cast(side,s,turn,index,a,d,heroes,events){
 const own=side==='attacker'?a:d,enemy=side==='attacker'?d:a,opposite=side==='attacker'?'defender':'attacker';
 const ownIndex=index[side],enemyIndex=index[opposite];
 if(s.type===2){
  events.push({turn,phase:'spell',side,spellType:2,spellTarget:s.target,spellUnit:2,power:s.power,phaseTiming:'after-duel'});
  return {mode:s.target===8?'tmp':'def',percent:s.power,slot:ownIndex};
 }
 if(s.type===0){
  if(s.target===4){
   const target=enemy[enemyIndex];
   const r=resolveSingleTargetDamageSpell({target:{count:target.remaining,unitPower:target.unitPower},unit:s.unit,power:s.power});
   target.remaining=r.remaining;target.magicLosses+=r.casualties;
   if(target.remaining===0)target.dispersed=true;
   events.push({turn,phase:'spell',side,targetSlot:enemyIndex+1,spellType:0,spellTarget:4,spellUnit:s.unit,power:s.power,casualties:r.casualties});
  }else{
   const hits=[];
   for(let i=0;i<7;i++){
    const target=enemy[i];if(!target)continue;
    const power=s.powerByWeapon[target.weapon];
    if(!Number.isFinite(power)||power<0)throw new RangeError('Missing pre-resolved power for '+target.weapon);
    const r=resolveSingleTargetDamageSpell({target:{count:target.remaining,unitPower:target.unitPower},unit:s.unit,power});
    target.remaining=r.remaining;target.magicLosses+=r.casualties;
    if(target.remaining===0)target.dispersed=true;
    hits.push({slot:i+1,casualties:r.casualties,power});
   }
   events.push({turn,phase:'spell',side,spellType:0,spellTarget:3,spellUnit:s.unit,hits});
  }
  return;
 }
 if(s.type===4){
  if(s.target!==(side==='attacker'?5:6))throw new Error('Buff target not available to '+side);
  const stack=own[ownIndex];
  const r=resolveAttackStackBuff({target:{count:stack.remaining,unitPower:stack.unitPower},unit:s.unit,power:s.power});
  stack.remaining=r.remaining;stack.bonusTroops+=r.bonusCount;
  events.push({turn,phase:'spell',side,targetSlot:ownIndex+1,spellType:4,spellTarget:s.target,spellUnit:s.unit,power:s.power,bonusTroops:r.bonusCount});
  return;
 }
 if(s.type===3){
  if(s.target!==(side==='attacker'?6:5))throw new Error('Debuff target not available to '+side);
  if(!heroes[opposite])throw new Error('Hero target missing');
  const key=side==='attacker'?'defense_modifiee':'attaque_modifiee',value=heroes[opposite][key];
  if(!Number.isFinite(value)||value<0)throw new RangeError('Hero stat unavailable');
  const r=resolveHeroDefenseDebuff({defense:value,power:s.power,unit:s.unit});
  heroes[opposite][key]=r.remainingDefense;
  events.push({turn,phase:'spell',side,spellType:3,spellTarget:s.target,spellUnit:s.unit,stat:key,...r});
 }
}
export function simulateDualMagicEncounter({attackers,defenders,attackerSpells={},defenderSpells={},context={},maxRounds=1000}){
 checkArmy(attackers);checkArmy(defenders);verify(attackerSpells);verify(defenderSpells);
 if(!Number.isSafeInteger(maxRounds)||maxRounds<1)throw new RangeError('Invalid maxRounds');
 if(['magic','spells','prebattle','siege','retreat','resurrection','specialPhases'].some(k=>context[k]))throw new Error('Unsupported additional phase');
 const a=prepare(attackers),d=prepare(defenders),heroes={attacker:clone(context.attackerHero),defender:clone(context.defenderHero)};
 const events=[];
 let lastRoundRevival={};
 for(let turn=1;turn<=maxRounds;turn++){
  const index={attacker:active(a),defender:active(d)};
  if(index.attacker<0||index.defender<0){
   if([attackerSpells,defenderSpells].some(book=>Object.keys(book).some(k=>Number(k)>=turn)))throw new Error('Unreachable scheduled spell round '+turn);
   const status=index.attacker<0&&index.defender<0?'mutual-dispersion':index.attacker<0?'defender':'attacker';
   const terminal=projectTerminalTemporaryRevival({status,attacker:a,defender:d,lastRevival:lastRoundRevival[status]??null});
   return {status,rounds:events.filter(e=>e.phase==='duel').length,events,attacker:a,defender:d,heroes,
    terminalDisplay:terminal.displayed,terminalCleanup:terminal.cleanup,
    completeness:'supported dual-caster subset, terminal cleanup projection, not complete Jactari'};
  }
  // Jactari declares resurrection before the duel and resolves it after the duel.
  lastRoundRevival={};
  const startOfRound={attacker:a[index.attacker].remaining,defender:d[index.defender].remaining};
  const pendingRevival={};
  if(Object.hasOwn(attackerSpells,turn))pendingRevival.attacker=cast('attacker',attackerSpells[turn],turn,index,a,d,heroes,events);
  if(Object.hasOwn(defenderSpells,turn))pendingRevival.defender=cast('defender',defenderSpells[turn],turn,index,a,d,heroes,events);
  const ai=active(a),di=active(d);
  if(ai<0||di<0){
   if(pendingRevival.attacker||pendingRevival.defender)
    throw new Error('Unsupported resurrection without a duel after spell damage');
   continue;
  }
  const x=a[ai],y=d[di];
  const modifiers=calculateBonuses({attackerWeapon:x.weapon,defenderWeapon:y.weapon,
   attackerHero:heroes.attacker,defenderHero:heroes.defender,morale:context.morale??{},special:context.special??{},
   weaponAdvantageFactor:context.weaponAdvantageFactor??0,fortification:context.fortification??{}});
  const duel=resolveStackDuel({attacker:{count:x.remaining,unitPower:x.unitPower},defender:{count:y.remaining,unitPower:y.unitPower},modifiers});
  const kA=duel.losses.attacker===-1?0:Math.max(0,duel.losses.attacker),kD=duel.losses.defender===-1?0:Math.max(0,duel.losses.defender);
  x.roundLosses+=kA;y.roundLosses+=kD;
  x.bonusLost+=Math.min(Math.max(0,x.bonusTroops-x.bonusLost),kA);
  y.bonusLost+=Math.min(Math.max(0,y.bonusTroops-y.bonusLost),kD);
  x.remaining=duel.remaining.attacker;y.remaining=duel.remaining.defender;
  x.dispersed ||=duel.dispersed.attacker||x.remaining<=0;
  y.dispersed ||=duel.dispersed.defender||y.remaining<=0;
  events.push({turn,phase:'duel',attackerSlot:ai+1,defenderSlot:di+1,modifiers,duel});
  for(const side of ['attacker','defender']){
   const plan=pendingRevival[side];
   if(!plan)continue;
   const slot=side==='attacker'?ai:di;
   if(plan.slot!==slot)throw new Error('Revival target changed during turn: historical interaction unsupported');
   const state=side==='attacker'?a[ai]:d[di];
   const effect=resolvePostDuelRevival({remaining:state.remaining,losses:duel.losses[side],
    roundStart:startOfRound[side],mode:plan.mode,percent:plan.percent});
   state.remaining=effect.remaining;
   if(plan.mode==='def')state.roundLosses+=effect.recordedLossAdjustment;
   else{state.raisedDuringBattle+=effect.revived;state.temporaryRevived+=effect.revived;}
   const entry={turn,phase:'revival',side,slot:slot+1,mode:plan.mode,revived:effect.revived,
    remaining:effect.remaining,recordedLossAdjustment:effect.recordedLossAdjustment};
   events.push(entry);
   lastRoundRevival[side]=entry;
  }
 }
 throw new Error('Round limit exceeded');
}
