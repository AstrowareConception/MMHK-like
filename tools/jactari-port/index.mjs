/** Experimental public entrypoint for the supported Jactari-derived battle subset.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
export {simulateUnifiedBattle} from './unified-battle.mjs';
export {calculateEffectiveSpellPower} from './spell-power.mjs';
export {eligibleSpells,jactariSpellChoices,validateJactariPresetTurns} from './spell-eligibility.mjs';
export {resolveStackDuel,validateArmySlots} from './core.mjs';
export {adjudicateJactariBattle,adjudicateJactariReferenceBattle} from './admission-battle.mjs';
export {decideJactariAdmission,armyPower} from './admission.mjs';
export {jactariReferenceProfile} from './source-profile.mjs';
export {calculateBonuses} from './bonuses.mjs';
export {validateHeroSpellOrders,resolveHeroSpellAtRound} from './hero-spell-resolution.mjs';
export {getJactariHeroTables} from './hero-source-tables.mjs';
export {deriveJactariHeroPageSnapshot} from './hero-page-snapshot.mjs';
export {deriveJactariTalentBonuses} from './hero-talent-bonuses.mjs';
export {deriveJactariCombatHeroSnapshot} from './hero-combat-snapshot.mjs';
export {simulateBattleWithDerivedHeroes} from './hero-combat-battle.mjs';
export {isJactariCareerAllowed,calculateJactariCareerBudget,changeJactariCareerRank} from './hero-career-progression.mjs';
export {transitionJactariCareer} from './hero-career-lifecycle.mjs';
export {listJactariLegendaryClasses,deriveJactariLegendaryTalents} from './hero-legendary.mjs';
