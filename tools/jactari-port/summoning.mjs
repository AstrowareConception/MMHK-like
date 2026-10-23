/** Pure Jactari spell type 1 summon planning; special positions 0/1 are not the seven army slots.
 * SPDX-License-Identifier: GPL-3.0-or-later. This is NOT yet integrated into melee.
 */
const TARGET_WEAPONS=['I','R','C'];
export function planSummoning({target,unit,power,casterFaction,unitCatalog,opposingSevenSlots,specialSlots=[null,null]}){
 if(!Number.isInteger(target)||target<0||target>2||![0,4].includes(unit))
  throw new RangeError('Unsupported summon target or power unit');
 if(!Number.isFinite(power)||power<0||!Array.isArray(unitCatalog))throw new RangeError('Invalid summon power/catalog');
 if(!Array.isArray(opposingSevenSlots)||opposingSevenSlots.length!==7)throw new RangeError('Seven opposing slots required');
 if(!Array.isArray(specialSlots)||specialSlots.length!==2)throw new RangeError('Two special summon slots required');
 const weapon=TARGET_WEAPONS[target];
 const creatureIndex=unitCatalog.findIndex(x=>x.faction===casterFaction&&x.weapon===weapon);
 if(creatureIndex<0)return {available:false,reason:'no-matching-creature'};
 const creature=unitCatalog[creatureIndex];
 if(!Number.isFinite(creature.unitPower)||creature.unitPower<=0)throw new RangeError('Bad creature power');
 const enemyInitialPower=opposingSevenSlots.reduce((sum,s)=>{
  if(!s)return sum;
  if(!Number.isSafeInteger(s.count)||s.count<0||!Number.isFinite(s.unitPower)||s.unitPower<=0)
   throw new RangeError('Invalid opposing stack');
  return sum+s.count*s.unitPower;
 },0);
 const summonedPower=unit===0?power:Math.floor(power/100*enemyInitialPower);
 const unitCount=Math.floor(summonedPower/creature.unitPower);
 return {available:true,creatureIndex,creature:{...creature},specialIndex:specialSlots[1]!=null?0:1,
  unitCount,summonedPower,enemyInitialPower,unit,targetWeapon:weapon,temporary:true};
}
