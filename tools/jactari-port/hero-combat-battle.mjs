/**
 * Experimental adapter from persisted hero choices to the unified Jactari
 * combat subset. NEVER pass arbitrary player JSON as a trusted hero profile.
 * Profiles and spell catalog must be loaded and authorized by the server.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 */
import {deriveJactariCombatHeroSnapshot} from './hero-combat-snapshot.mjs';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {calculateJactariCareerBudget} from './hero-career-progression.mjs';
import {simulateUnifiedBattle} from './unified-battle.mjs';
const record=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const has=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
/**
 * The API intentionally accepts hero *choices*, never direct attack/defense.
 * Further historic parity of progression restrictions and tactical context
 * is pending; this is not the final authoritative PvP entrypoint.
 */
export function simulateBattleWithDerivedHeroes({
 attackers,defenders,heroProfiles,heroTalents={},heroCareers=null,
 attackerSpells={},defenderSpells={},
 spellContext=null,unitCatalog=[],context={},lossPolicy,maxRounds=1000
}){
 if(!record(heroProfiles)||!record(heroProfiles.attacker)||!record(heroProfiles.defender)||
   !record(context)||!record(heroTalents))
  throw new TypeError('Two server-authorized hero profiles and context are required');
 for(const side of ['attacker','defender']){
  const p=heroProfiles[side];
  for(const k of ['attaque','defense','magie','attaque_modifiee',
    'defense_modifiee','magie_modifiee','bonus_a','bonus_d','bonus_mp'])
   if(has(p,k))throw new Error('Client-supplied computed hero attribute forbidden: '+k);
 }
 if(heroCareers!==null&&(!record(heroCareers)||
   !Array.isArray(heroCareers.attacker)||!Array.isArray(heroCareers.defender)))
  throw new TypeError('Both server-validated career lists are required');
 if(heroCareers!==null&&(Object.keys(heroTalents).length>0))
  throw new Error('Cannot mix raw talent bonuses with verified career selections');
 if(has(context,'attackerHero')||has(context,'defenderHero'))
  throw new Error('Precomputed hero modifiers cannot override derived hero profiles');
 const tables=getJactariHeroTables();
 const careerLedgers=heroCareers===null?null:Object.fromEntries(
  ['attacker','defender'].map(side=>[side,
   calculateJactariCareerBudget({profile:heroProfiles[side],
     careers:heroCareers[side]},tables)]));
 const combatSelections=(side)=>careerLedgers===null?(heroTalents[side]??[]):
  careerLedgers[side].talentSelections.filter(selection=>
   tables.talents[selection.careerId]?.[selection.talentIndex]?.nom_machine);
 const a=deriveJactariCombatHeroSnapshot({
  profile:heroProfiles.attacker,side:'attacker',
  talentSelections:combatSelections('attacker'),
  allianceAttackPercent:context.allianceAttackPercent??0,
  attackMalusPercent:context.attackMalusPercent??0
 },tables);
 const d=deriveJactariCombatHeroSnapshot({
  profile:heroProfiles.defender,side:'defender',
  talentSelections:combatSelections('defender'),
  allianceDefensePercent:context.allianceDefensePercent??0
 },tables);
 let resolvedSpellContext=null;
 if(spellContext!==null){
  if(!record(spellContext)||!Array.isArray(spellContext.catalog)||
    !record(spellContext.attacker)||!record(spellContext.defender)||
    has(spellContext,'artifactCatalog')||
    has(spellContext.attacker,'artifactIds')||has(spellContext.defender,'artifactIds'))
   throw new Error('Trusted spell catalog required; artifact inventory always comes from hero profiles');
  const artifactCatalog={
    artifacts:tables.artifacts,effects:tables.artifactEffects,
    categories:tables.magicArtifactCategories,
    slotCount:tables.equipmentSlots.length
  };
  resolvedSpellContext={
   catalog:spellContext.catalog,
   artifactCatalog,
   attacker:{...spellContext.attacker,artifactIds:a.equipment},
   defender:{...spellContext.defender,artifactIds:d.equipment}
  };
 }
 const result=simulateUnifiedBattle({
  attackers,defenders,attackerSpells,defenderSpells,
  unitCatalog,context:{...context,attackerHero:a.hero,defenderHero:d.hero},
  lossPolicy,maxRounds,spellContext:resolvedSpellContext
 });
 return {...result,heroSnapshots:{attacker:a,defender:d},careerLedgers,
  heroProvenance:'original-combat-maj_situation-bounded-profiles-not-server-authoritative'};
}
