/** Final permanent-casualty phase adapted from Jactari simulation_rencontre.
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Produces slot-level irreversible losses separately from battlefield dispersal.
 * The historical client distinguishes player/PvE and whether a hero is present.
 */
const number=(o,k)=>Number(o?.[k]??0);
export function casualtyModifier({ownHero={},enemyHero={},side='attacker',tearsLossBonus=0}={}){
 if(!['attacker','defender'].includes(side))throw new RangeError('Unknown side');
 const offensive=['bonus_massacreur','bonus_legendary_sovereign_c','bonus_legendary_kingundead_c','bonus_legendary_dragonkinght_a'];
 const protective=['bonus_legendary_legpaladin_a','bonus_legendary_ethernalnight_a','bonus_legendary_legmagician_c'];
 const sum=(o,keys)=>keys.reduce((n,k)=>n+number(o,k),0);
 return (sum(enemyHero,offensive)-sum(ownHero,protective)-(side==='defender'?number(ownHero,'bonus_logisticien'):0)+(side==='defender'?tearsLossBonus:0))/100;
}
export function finalizePermanentLosses({slots,side='attacker',playerControlled=true,hasHero=true,battleOutcome='attacker',lossFactor,modifier=0,raiseDeadRate=0,resurrectionPower=0}){
 if(!Array.isArray(slots)||slots.length!==7)throw new RangeError('Seven ordered slots required');
 if(!['attacker','defender'].includes(side)||!['attacker','defender','draw'].includes(battleOutcome))throw new RangeError('Invalid battle outcome');
 for(const v of [lossFactor,modifier,raiseDeadRate,resurrectionPower])if(!Number.isFinite(v))throw new RangeError('Invalid numeric parameter');
 if(lossFactor<0||raiseDeadRate<0||resurrectionPower<0)throw new RangeError('Negative factors not supported');
 let remainingPower=resurrectionPower;
 const reports=slots.map((s,i)=>{
   if(!s)return null;
   for(const key of ['count','unitPower','roundLosses'])if(!Number.isFinite(s[key])||s[key]<0)throw new RangeError('Invalid stack '+key);
   const magic=s.magicLosses??0,bonusLost=s.bonusLost??0,raised=s.raisedDuringBattle??0;
   for(const n of [magic,bonusLost,raised])if(!Number.isFinite(n)||n<0)throw new RangeError('Invalid casualties');
   const isPlayer=playerControlled;
   let loss;
   if(!isPlayer&&!hasHero){
     const defeated=(side==='attacker'?battleOutcome!=='attacker':battleOutcome==='attacker');
     loss=defeated?s.count:0;
     if(side==='defender'&&s.npcAttrition)loss=null;
   }
   if(loss===undefined||loss===null){
     const provisional=isPlayer?(s.roundLosses+magic-bonusLost-raised):(s.roundLosses+magic);
     loss=provisional*(lossFactor+modifier);
     if(loss>0&&loss<1)loss=1;
     if(loss<0)loss=0;
     loss=Math.floor(loss);
   }
   const withoutRecovery=loss;
   const raisedAfter=Math.floor(loss*raiseDeadRate);
   loss-=raisedAfter;
   let resurrected=0;
   if(remainingPower>=s.unitPower){
     resurrected=Math.min(loss,Math.floor(remainingPower/s.unitPower));
     remainingPower-=resurrected*s.unitPower;
     loss-=resurrected;
   }
   return {slot:i+1,initial:s.count,rawPermanent:withoutRecovery,raised:raisedAfter,resurrected,permanent:loss,unitPower:s.unitPower,goldLost:loss*(s.goldCost??0),rareLost:Object.fromEntries(Object.entries(s.rareCosts??{}).map(([k,v])=>[k,v*loss]))};
 });
 return {side,reports,totals:{permanent:reports.reduce((n,r)=>n+(r?.permanent??0),0),goldLost:reports.reduce((n,r)=>n+(r?.goldLost??0),0)},unspentResurrectionPower:remainingPower,scope:'Jactari final-loss phase only'};
}
