/** Immutable per-turn Jactari spell scheduling, WITHOUT execution of unsupported spell effects.
 * SPDX-License-Identifier: GPL-3.0-or-later
 * Original launcher checks attacker then defender by combat turn number.
 */
export function spellsForRound({turn,attackerSpells={},defenderSpells={}}){
  if(!Number.isSafeInteger(turn)||turn<1)throw new RangeError('Invalid combat turn');
  const out=[];
  for(const [side,book] of [['attacker',attackerSpells],['defender',defenderSpells]]){
    if(book===null||typeof book!=='object'||Array.isArray(book))throw new TypeError('Invalid spell schedule');
    if(Object.prototype.hasOwnProperty.call(book,turn)){
      const id=book[turn];
      if(!Number.isSafeInteger(id)||id<0)throw new RangeError('Invalid spell id');
      out.push({turn,side,spellId:id});
    }
  }
  return out;
}
/** A strict dispatcher: missing spell data or effect handler is an error, never no-op. */
export function planSpellEffects({turn,attackerSpells={},defenderSpells={},spellCatalog={},supportedEffects={}}){
  return spellsForRound({turn,attackerSpells,defenderSpells}).map(order=>{
    const spell=spellCatalog[order.spellId];
    if(!spell)throw new Error('Unknown spell '+order.spellId);
    const effectKey=spell.type+':'+spell.target+':'+spell.unit;
    const handler=supportedEffects[effectKey];
    if(typeof handler!=='function')throw new Error('Unsupported spell effect '+effectKey);
    return {...order,effectKey,spell,handler};
  });
}
