/**
 * Jactari v4.1.3-MTR admission branches from simulation_rencontre().
 * Distinguishes pre-combat retreat, capture, wounds from fought battles.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 * NO server-side capture state transition is inferred here.
 */
export function decideJactariAdmission({attackPower,defensePower,mode}) {
 if(!Number.isFinite(attackPower)||attackPower<0||!Number.isFinite(defensePower)||defensePower<=0)
   throw new RangeError('Finite nonnegative attacker and strictly positive defender power required');
 if(!['pvp','pve'].includes(mode))throw new RangeError('Explicit PvP or PvE mode required');
 const ratio=attackPower/defensePower;
 if(mode==='pve')return {mode,ratio,admitted:ratio>1/7,
   outcome:ratio<=1/7?'attacker-retreat':'battle',
   woundHours:null,captured:false,provenance:'Jactari v4.1.3-MTR admission'};
 const band=Math.floor(ratio*30);
 const outcome=band<=2?'attacker-captured':
   band<=3?'attacker-wounded':
   band<=4?'attacker-wounded':
   band<=5?'attacker-wounded':
   band<=6?'attacker-wounded':
   band<=7?'attacker-retreat':'battle';
 const woundHours=band===3?24:band===4?18:band===5?12:band===6?6:null;
 return {mode,ratio,band,admitted:band>7,outcome,woundHours,
   captured:band<=2,provenance:'Jactari v4.1.3-MTR admission'};
}
/** Initial strength is from the initial real seven slots, not summons or spell effects. */
export function armyPower(slots){
 if(!Array.isArray(slots)||slots.length!==7)throw new RangeError('Seven slots expected');
 return slots.reduce((sum,stack)=>{
  if(!stack)return sum;
  if(!Number.isSafeInteger(stack.count)||stack.count<=0||
    !Number.isFinite(stack.unitPower)||stack.unitPower<=0)throw new RangeError('Invalid army power stack');
  return sum+stack.count*stack.unitPower;
 },0);
}
