/** Supported Jactari battle phases: simultaneous prebattle salvos -> ordered melee.
 * GPL-3.0-or-later derivative. Explicitly refuses phases not ported.
 */
import {resolveSimultaneousSalvos} from './ranged.mjs';
import {simulateMeleeOnlyEncounter} from './encounter.mjs';
import {validateArmySlots} from './core.mjs';
export function simulateSupportedBattle({attackers,defenders,attackerSalvos=[],defenderSalvos=[],context={}}){
  validateArmySlots(attackers);validateArmySlots(defenders);
  if(context.magic||context.retreat||context.spells||context.resurrection||context.specialPhases||context.siege||context.prebattle)
    throw new Error('Unsupported historic battle phase');
  for(const s of [...attackerSalvos,...defenderSalvos])
    if(!['R','T','E'].includes(s.kind))throw new RangeError('Unrecognized salvo');
  const prebattle=resolveSimultaneousSalvos({attackers,defenders,attackerSalvos,defenderSalvos});
  const a=prebattle.attacker.survivors.map(s=>s?.count>0?s:null);
  const d=prebattle.defender.survivors.map(s=>s?.count>0?s:null);
  const hasA=a.some(Boolean),hasD=d.some(Boolean);
  const melee=hasA&&hasD?simulateMeleeOnlyEncounter({attackers:a,defenders:d,context}):null;
  const verdict=melee?.status??(hasA?'attacker':hasD?'defender':'mutual-dispersion');
  return {scope:'supported-salvos-plus-melee-only',verdict,prebattle,melee,
    initial:{attackers:attackers.map(s=>s?{...s}:null),defenders:defenders.map(s=>s?{...s}:null)},
    limitations:['No spells or resurrection','No retreat or hero wound','No permanent-casualty conversion','No historical full encounter equivalence']};
}
