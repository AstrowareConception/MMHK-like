/** Pure subset of Jactari lancement_sorts: offensive spell targeting one enemy stack.
 * SPDX-License-Identifier: GPL-3.0-or-later. Caller provides already computed effective spell power.
 * Original spell.type=0, spell.cible=4; accepted spell.unite: 1,3,7.
 */
export function resolveSingleTargetDamageSpell({target,unit,power}) {
 if(!target||!Number.isSafeInteger(target.count)||target.count<0||
    !Number.isFinite(target.unitPower)||target.unitPower<=0)throw new RangeError('Invalid target');
 if(![1,3,7].includes(unit))throw new RangeError('Unsupported Jactari spell damage unit');
 if(!Number.isFinite(power)||power<0)throw new RangeError('Invalid spell power');
 let damage;
 if(unit===1)damage=power*target.count;
 else if(unit===3)damage=(power/100)*target.unitPower*target.count;
 else damage=power;
 damage=Math.min(damage,target.unitPower*target.count);
 const casualties=Math.floor(damage/target.unitPower);
 return {spellType:0,targetCode:4,unit,power,damage,casualties,remaining:target.count-casualties,
  magicLosses:casualties,scope:'single-target-offensive-spell'};
}
/** Jactari attacker-only offensive spell subtype 3, cible 6, hero defence debuff. */
export function resolveHeroDefenseDebuff({defense,power,unit}) {
 if(!Number.isFinite(defense)||defense<0||!Number.isFinite(power)||power<0)throw new RangeError('Invalid defense');
 if(![5,6].includes(unit))throw new RangeError('Unsupported debuff unit');
 const delta=unit===5?Math.min(power,defense):defense*(power/100);
 return {unit,previousDefense:defense,removedDefense:delta,remainingDefense:defense-delta};
}
/** Jactari attacker buff type=4/cible=5; only unit indices 0..3. */
export function resolveAttackStackBuff({target,unit,power}) {
 if(!target||!Number.isSafeInteger(target.count)||target.count<0||!Number.isFinite(target.unitPower)||target.unitPower<=0)throw new RangeError('Invalid target');
 if(![0,1,2,3].includes(unit)||!Number.isFinite(power)||power<0)throw new RangeError('Unsupported buff');
 const bonusPower=(unit<2?power*target.count:(power/100)*target.unitPower*target.count);
 const bonusCount=Math.floor(bonusPower/target.unitPower);
 return {unit,bonusCount,bonusPower,remaining:target.count+bonusCount,bonusTroops:bonusCount};
}
