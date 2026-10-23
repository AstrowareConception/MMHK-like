/**
 * Pure arithmetic adapter of Jactari puissance_effective_sort.
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Spell efficiency artefact bonus, mastery, resistance and school effects are supplied
 * as resolved parameters. No DOM or game globals.
 */
const finite=(n,label)=>{if(!Number.isFinite(n))throw new RangeError(label+' must be finite');return n;};
const n=(v)=>v??0;
const ownWeaponUnits=new Set([0,2,4]);
const enemyWeaponUnits=new Set([1,3,5,6,7]);
const legendaryBySchool={
  0:['bonus_legendary_kingundead_b','bonus_legendary_legmagician_a'],
  1:['bonus_legendary_ethernalnight_c','bonus_legendary_kingundead_a'],
  2:['bonus_legendary_legpaladin_c','bonus_legendary_legmagician_b'],
  3:['bonus_legendary_dragonkinght_b']
};
export function calculateEffectiveSpellPower({
  spell, side, attackerWeapon, defenderWeapon, hero,
  schoolBonusPercent=0, artifactEfficiencyPercent=0,
  mastery={level:0,bonusPercent:0,maximumCircle:0,wayBonus:0},
  resistance={level:0,bonusPercent:0,wayBonus:0},
  antiMagic={level:0,bonusPercentPerLevel:0}
}){
  if(!spell||!hero||!['attacker','defender'].includes(side))
    throw new RangeError('Spell, hero and casting side required');
  if(!Number.isInteger(spell.school)||!Number.isInteger(spell.unit)||!Number.isInteger(spell.circle)||!Number.isInteger(spell.type))
    throw new RangeError('Invalid spell data');
  const castingWeapon=side==='attacker'?attackerWeapon:defenderWeapon;
  const opposingWeapon=side==='attacker'?defenderWeapon:attackerWeapon;
  const affectedWeapon=ownWeaponUnits.has(spell.unit)?castingWeapon:enemyWeaponUnits.has(spell.unit)?opposingWeapon:null;
  if(!['I','R','C'].includes(affectedWeapon))throw new RangeError('Unsupported spell target weapon/unit');
  const factor=finite(spell.factors?.[affectedWeapon],'weapon factor');
  const base=finite(spell.power,'base spell power')*factor;
  const magic=(finite(n(hero.magie),'base magic')*(1+finite(n(hero.bonus_mp),'magic %')/100))
    +finite(n(hero['bonus_instinct_'+spell.school]),'school instinct')
    +finite(n(hero.bonus_m),'flat magic');
  const experts=finite(n(hero['bonus_expert_'+spell.school]),'expert')+
    (legendaryBySchool[spell.school]??[]).reduce((sum,key)=>sum+finite(n(hero[key]),key),0);
  const masteryPercent=mastery.maximumCircle>=spell.circle?mastery.bonusPercent*(1+mastery.wayBonus):0;
  const resistancePercent=[0,3].includes(spell.type)
    ?resistance.bonusPercent*(1+resistance.wayBonus):0;
  const antiMagicPercent=antiMagic.level*antiMagic.bonusPercentPerLevel;
  const multiplier=1+(experts+schoolBonusPercent+artifactEfficiencyPercent+masteryPercent-resistancePercent-antiMagicPercent)/100;
  const result=base*magic*multiplier;
  for(const [label,value] of Object.entries({base,magic,multiplier,result}))finite(value,label);
  return {power:result,base,magic,weaponFactor:factor,multiplier,
    bonuses:{expertPercent:experts,schoolBonusPercent,artifactEfficiencyPercent,masteryPercent,resistancePercent,antiMagicPercent},
    affectedWeapon,side,scope:'Jactari mathematical spell-power core; external inputs already resolved'};
}
