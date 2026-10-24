/** Jactari interface-derived spell selection constraints, no mana claim.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 * Mirrors controle_liste_sorts / controle_magie / controle_liste_tours_magie.
 * Historic selection UI leaves first spell unrestricted by circle; second uses Arcana circle.
 */
export function eligibleSpells({spellCatalog, factionSchools, circle=5, excludedId=-1}) {
 if(!Array.isArray(spellCatalog)||!Array.isArray(factionSchools))throw new TypeError('Spell catalog and allowed schools required');
 if(!Number.isInteger(circle)||circle<0||!Number.isInteger(excludedId))throw new RangeError('Invalid spell circle/exclusion');
 if(circle===0)return [];
 return spellCatalog.flatMap((spell,id)=>
   spell && factionSchools.includes(spell.school) && spell.circle<=circle && id!==excludedId ? [id] : []);
}
export function jactariSpellChoices({spellCatalog,factionSchools,arcanaCircle,heroPresent,archetypeMagic,firstSpell=-1}){
 if(!Number.isFinite(archetypeMagic))throw new RangeError('Invalid archetype magic');
 if(!heroPresent || archetypeMagic<=0)return {first:[],second:[]};
 return {first:eligibleSpells({spellCatalog,factionSchools,circle:5}),
   second:eligibleSpells({spellCatalog,factionSchools,circle:arcanaCircle,excludedId:firstSpell})};
}
export function validateJactariPresetTurns(orders){
 if(!Array.isArray(orders)||orders.length>2)throw new RangeError('At most two prepared spells');
 const ids=new Set(),turns=new Set();
 for(const order of orders){
  if(!order||!Number.isSafeInteger(order.id)||order.id<0||!Number.isInteger(order.turn)||order.turn<1||order.turn>14)
   throw new RangeError('Invalid prepared spell or turn');
  if(ids.has(order.id)||turns.has(order.turn))throw new Error('Duplicate spell or turn');
  ids.add(order.id);turns.add(order.turn);
 }
 return true;
}
