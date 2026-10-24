/** Experimental public entrypoint for the supported Jactari-derived battle subset.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
export {simulateUnifiedBattle} from './unified-battle.mjs';
export {calculateEffectiveSpellPower} from './spell-power.mjs';
export {eligibleSpells,jactariSpellChoices,validateJactariPresetTurns} from './spell-eligibility.mjs';
export {resolveStackDuel,validateArmySlots} from './core.mjs';
