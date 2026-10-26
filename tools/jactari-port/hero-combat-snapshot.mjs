/**
 * Bounded Jactari 4.1.3-MTR combat-page hero projection from persisted IDs.
 * Mirrors the subset of combat.min.js maj_situation() responsible for
 * level/archetype values, talent tables, combat artefact effects,
 * ordinary heritage and side-specific attack/defense multipliers.
 *
 * This is NOT the hero editor's maj_adm(), which differs in rounding and
 * heritage precedence. Not a complete MMHK S2 hero model.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {deriveJactariHeroPageSnapshot} from './hero-page-snapshot.mjs';
import {deriveJactariTalentBonuses} from './hero-talent-bonuses.mjs';
import {deriveJactariLegendaryTalents} from './hero-legendary.mjs';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {assertDocumentedJactariCombatHeritage} from './historical-heritage-audit.mjs';

const numeric=(v,name)=>{if(!Number.isFinite(v))throw new RangeError('Invalid '+name);return v;};
const own=(o,k)=>Object.prototype.hasOwnProperty.call(o,k);
const combatName={a:'attaque',d:'defense',m:'magie'};
function heredityBonus({stat,level,heritage,heritageWay,tables}){
 const h=(k)=>heritage[k]??0;
 const rank=k=>1+tables.wayMultiplier*tables.wayRanking[heritageWay][tables.hereditary[k].voie];
 // Original combat source uses if/else rather than independent additions.
 if(h('heros_superieur')>0)
  return Math.round(tables.hereditary.heros_superieur.bonus[stat][h('heros_superieur')]*
    rank('heros_superieur'));
 if(h('revelation_de_caracteristiques')>0&&level>=15)
  return Math.round(tables.hereditary.revelation_de_caracteristiques.bonus[stat][h('revelation_de_caracteristiques')]*
    rank('revelation_de_caracteristiques'))*Math.floor(level/15);
 return 0;
}
/**
 * The context values are trusted operational bonuses, NOT browser inputs.
 * Supports only the known hereditary branches; the separate _15/_30 variants
 * require their own upstream fixtures before being accepted.
 */
export function deriveJactariCombatHeroSnapshot({
 profile,side,talentSelections=[],legendarySelections=[],
 legendaryPolicy='calculator-reference',legendaryEntitlements=null,
 allianceAttackPercent=0,
 allianceDefensePercent=0,attackMalusPercent=0
},tables=getJactariHeroTables()){
 if(!['attacker','defender'].includes(side))throw new RangeError('Unknown combat camp');
 const p=profile;
 // Audit missing vendor _15/_30 tables explicitly before generic profile checks.
 assertDocumentedJactariCombatHeritage(p.heritage??{});
 // Real catalog validation (level, artifacts, heritage skills, slot and level).
 const editor=deriveJactariHeroPageSnapshot(p,tables);
 const {archetype,level,heritageWay}=editor.identity;
 const heritage=p.heritage??{};
 const levels=tables.levels[level],arch=tables.archetypes[archetype];
 const legendary=deriveJactariLegendaryTalents({selections:legendarySelections,
  policy:legendaryPolicy,entitlements:legendaryEntitlements},tables);
 const tal=deriveJactariTalentBonuses([...talentSelections,...legendary.selections],tables);
 const hero={...tal.levels,...tal.bonuses};
 const originalEffects=tables.combatArtifactEffects;
 for(const effect of originalEffects){
  let value=0;
  for(const id of editor.equipment){
   const item=tables.artifacts[id];
   for(const e of item.effets){
    if(!effect.id.includes(e.id))continue;
    const rate=tables.artifactEffects[e.id]?.v?.[e.niv-1];
    if(!Number.isFinite(rate))throw new RangeError('Invalid equipped combat effect value');
    const factor=item.voie===undefined?1:
      1+tables.wayMultiplier*tables.wayRanking[heritageWay][item.voie];
    value+=rate*factor;
   }
  }
  // The source overwrites the bonus fields for a combat effect after
  // deriving the named talent ranks: do not add them twice.
  hero['bonus_'+effect.nom]=value;
 }
 for(const [stat,name] of Object.entries(combatName)){
  const track=arch[name],base=track===0?0:levels[track];
  hero[name]=base+heredityBonus({stat,level,heritage,heritageWay,tables});
 }
 numeric(allianceAttackPercent,'attacker alliance multiplier');
 numeric(allianceDefensePercent,'defender alliance multiplier');
 numeric(attackMalusPercent,'attack penalty');
 let attackFactor=1+(hero.bonus_ap??0)/100;
 if(side==='attacker'){
  for(const k of ['bonus_legendary_sovereign_b','bonus_legendary_legwarrior_a',
   'bonus_legendary_dragonkinght_c'])
   if(own(hero,k))attackFactor+=hero[k]/100;
  attackFactor+=allianceAttackPercent/100;
  attackFactor-=attackMalusPercent/100;
 }
 hero.attaque_modifiee=hero.attaque*attackFactor+(hero.bonus_a??0);
 let defenseFactor=1+(hero.bonus_dp??0)/100;
 for(const k of ['bonus_legendary_legwarrior_b','bonus_legendary_legpaladin_b'])
  if(own(hero,k))defenseFactor+=hero[k]/100;
 if(side==='defender')defenseFactor+=allianceDefensePercent/100;
 hero.defense_modifiee=hero.defense*defenseFactor+(hero.bonus_d??0);
 hero.magie_modifiee=hero.magie*(1+(hero.bonus_mp??0)/100)+(hero.bonus_m??0);
 for(const key of ['attaque','defense','magie','attaque_modifiee',
  'defense_modifiee','magie_modifiee'])
  numeric(hero[key],key);
 return {
  side,identity:editor.identity,
  hero:{faction:p.faction,archetype,level,...hero},
  equipment:[...editor.equipment],
  provenance:'Jactari combat.min.js maj_situation bounded combat stats / authentic talent+artifact tables',
  limitations:[
   'Legendary effects from authentic table; class unlock prerequisites not certified',
   'No validation of career learning path or legendary prerequisites',
   'Historic _15/_30 branches refer to absent catalog definitions and are explicitly rejected',
   'No full situational morale / siege / PvE / alliance skill derivation',
   'No statement of full Ubisoft MMHK season-2 equivalence'
  ]
 };
}
