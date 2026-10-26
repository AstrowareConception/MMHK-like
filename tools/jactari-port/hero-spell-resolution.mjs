/**
 * Experimental, server-supplied spell preparation for the unified Jactari port.
 * Spell power is resolved at the CURRENT round against the CURRENT active stacks
 * and CURRENT modified hero, not frozen at battle initialization.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {calculateEffectiveSpellPower} from './spell-power.mjs';

const own=(obj,key)=>Object.prototype.hasOwnProperty.call(obj,key);
const weapons=['I','R','C'];
const validWeapon=w=>weapons.includes(w);
const isRecord=o=>o!==null&&typeof o==='object'&&!Array.isArray(o);
const opposite=side=>side==='attacker'?'defender':'attacker';
const record=(o,name)=>{if(!isRecord(o))throw new TypeError(name+' must be an object');return o;};

export function validateHeroSpellOrders({attackerSpells={},defenderSpells={},spellContext}){
 const books={attacker:attackerSpells,defender:defenderSpells};
 const config=record(spellContext,'Trusted spell context');
 if(!Array.isArray(config.catalog))throw new TypeError('Trusted spell catalog required');
 record(config.attacker,'Attacker casting context');
 record(config.defender,'Defender casting context');
 for(const [side,book] of Object.entries(books)){
  record(book,side+' spell orders');
  if(Object.keys(book).length>2)throw new RangeError('Jactari limit: two spells per side');
  const selectedIds=new Set();
  for(const [round,order] of Object.entries(book)){
   if(!/^(?:[1-9]|1[0-4])$/.test(round))
    throw new RangeError('Spell round outside historical 1..14');
   if(!isRecord(order)||Object.keys(order).length!==1||!Number.isSafeInteger(order.id)||
     order.id<0||!own(config.catalog,order.id))
    throw new RangeError('Prepared order must contain only a trusted catalog ID');
   if(selectedIds.has(order.id))throw new Error('Same spell ID selected twice');
   selectedIds.add(order.id);
   const spell=config.catalog[order.id];
   if(!isRecord(spell)||!Number.isInteger(spell.type)||!Number.isInteger(spell.target)||
     !Number.isInteger(spell.unit)||!Number.isInteger(spell.school)||
     !Number.isInteger(spell.circle)||!Number.isFinite(spell.power)||
     spell.power<0||!isRecord(spell.factors)||weapons.some(w=>!Number.isFinite(spell.factors[w])||spell.factors[w]<0))
    throw new RangeError('Incomplete versioned spell catalog entry '+order.id);
   const supported=(spell.type===0&&((spell.target===4&&[1,3,7].includes(spell.unit))||
       (spell.target===3&&[1,3].includes(spell.unit))))||
     (spell.type===1&&[0,1,2].includes(spell.target)&&[0,4].includes(spell.unit))||
     (spell.type===2&&[8,9].includes(spell.target)&&spell.unit===2)||
     (spell.type===3&&spell.target===(side==='attacker'?6:5)&&[5,6].includes(spell.unit))||
     (spell.type===4&&spell.target===(side==='attacker'?5:6)&&[0,1,2,3].includes(spell.unit));
   if(!supported)throw new Error('Unsupported historical spell signature '+side+' #'+order.id);
   const caster=config[side];
   if(caster.artifactIds!==undefined){
    if(!config.artifactCatalog||!Array.isArray(caster.artifactIds))
      throw new Error('Equipped spell requires trusted artifact catalog and inventory');
   }
  }
 }
 return true;
}

/**
 * Build the exact shape expected by applySpell() from an ID-only order.
 * All values are derived from the server-held catalog + current hero snapshots.
 * This API is still a supported subset, not a complete S2 spell scheduler.
 */
export function resolveHeroSpellAtRound({
 order,side,spellContext,heroes,attackerWeapon,defenderWeapon
}){
 if(!['attacker','defender'].includes(side))throw new RangeError('Invalid spell caster side');
 if(!isRecord(order)||Object.keys(order).length!==1||!Number.isSafeInteger(order.id)||
   !Array.isArray(spellContext?.catalog))
  throw new TypeError('Trusted ID-only spell order required');
 const spell=spellContext.catalog[order.id];
 if(!isRecord(spell))throw new RangeError('Unknown spell catalog ID');
 const caster=record(spellContext[side],'Caster spell context');
 const enemy=record(spellContext[opposite(side)],'Opponent spell context');
 const hero=record(heroes?.[side],'Current hero');
 if(!Number.isFinite(hero.magie)||hero.magie<0)
  throw new RangeError('Current hero magic characteristic is required');
 if(!validWeapon(attackerWeapon)||!validWeapon(defenderWeapon))
  throw new RangeError('Two active battle weapons required');
 const base={
   spell,side,hero,
   schoolBonusPercent:caster.schoolBonusPercent??0,
   mastery:caster.mastery??{level:0,bonusPercent:0,maximumCircle:0,wayBonus:0},
   resistance:enemy.resistance??{level:0,bonusPercent:0,wayBonus:0},
   antiMagic:enemy.antiMagic??{level:0,bonusPercentPerLevel:0}
 };
 if(caster.artifactIds!==undefined)
   base.artifactContext={artifactIds:caster.artifactIds,catalog:spellContext.artifactCatalog};
 const calc=(a,d)=>calculateEffectiveSpellPower({
   ...base,attackerWeapon:a,defenderWeapon:d
 }).power;
 const result={type:spell.type,target:spell.target,unit:spell.unit};
 if(spell.type===0&&spell.target===3){
   result.powerByWeapon=Object.fromEntries(weapons.map(w=>[w,calc(
     side==='attacker'?attackerWeapon:w,
     side==='defender'?defenderWeapon:w
   )]));
 }else result.power=calc(attackerWeapon,defenderWeapon);
 return {spell:result,spellId:order.id,
   provenance:'trusted-catalog/current-round-hero/equipped-items'};
}
