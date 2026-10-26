/**
 * Execute original Jactari simulation_rencontre(), lancement_sorts() and
 * simulation_combat() under a test-only headless adapter.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 *
 * The calculator's user interface is replaced by a recording DOM shim and
 * spell power / bonus preparation are EXPLICITLY injected. The three core
 * historic functions are run from the checked-in upstream source, not ports.
 * NOT a full unmodified Ubisoft/Jactari browser run or a production oracle.
 */
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateArmySlots} from './core.mjs';

const pathname = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../data/Jactari/src/scripts/combat.min.js');
const source = fs.readFileSync(pathname, 'utf8');
const sides = ['attacker','defender'];
const sideKey = {attacker:'attaquant',defender:'defenseur'};
function extractFunction(name) {
  const start = source.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('Upstream function not found: ' + name);
  const open = source.indexOf('{', start);
  let depth = 0;
  for (let i = open; i < source.length; i++) {
    if (source[i] === '{') depth++;
    else if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('Unbalanced upstream function ' + name);
}
const historicFunctions = ['bonus_attaque_defense','simulation_combat','lancement_sorts','simulation_rencontre']
  .map(extractFunction).join('\n');
const zeroSkills = () => ({
  moral_eleve:0, resistance_magique:0, tir_de_barrage:0, relever_les_morts:0,
  resurrection:0, butin_de_guerre:0
});
const zeroSpecial = () => ({antimagie:0, baliste:0, pieges:0});
const format = n => String(n);
function prepare({attackers,defenders,unitCatalog,context,attackerSpells,defenderSpells,lossFactor}) {
  const units = [];
  const armies = {attacker:{},defender:{}};
  // Original nine positions: reserve 0 and 1 for temporary summons.
  for (const [side,slots,offset] of [['attacker',attackers,20],['defender',defenders,30]]) {
    for (let i=0;i<7;i++) {
      const s=slots[i];
      if (!s) continue;
      const type=offset+i;
      units[type]={puissance:s.unitPower,arme:s.weapon,faction:side==='attacker'?1:2,
        rang:1,ratio_xp:1,cout:{G:s.goldCost??0},
        nom:['unit'],nom_abrege:['unit']};
      armies[side][i+2]={type,nombre:s.count,nombre_restant:s.count,
        nombre_pertes:0,nombre_pertes_magie:0,nombre_bonus:0,
        nombre_bonus_perdu:0,nombre_ranimes:0,disperse:false};
    }
  }
  // The native summoning code chooses the FIRST matching unit in _unites.
  for (const [i,c] of unitCatalog.entries()) {
    if (!Number.isSafeInteger(c.faction) || !['I','R','C'].includes(c.weapon) ||
        !Number.isFinite(c.unitPower) || c.unitPower <= 0)
      throw new RangeError('Invalid historical summon catalog entry');
    units[i]={puissance:c.unitPower,arme:c.weapon,faction:c.faction,rang:1,
      ratio_xp:1,cout:{G:c.goldCost??0},nom:['summon'],nom_abrege:['summon']};
  }
  const heroA={faction:1,attaque_modifiee:0,...context.attackerHero};
  const heroD={faction:2,defense_modifiee:0,...context.defenderHero};
  const spells={attaquant:{},defenseur:{}}, spellDefs={}, spellsById={};
  let spellId=1;
  for(const [side,schedule] of [['attacker',attackerSpells],['defender',defenderSpells]]) {
    for (const [turn,spell] of Object.entries(schedule)) {
      if(!Number.isSafeInteger(Number(turn)) || Number(turn)<1 || Number(turn)>14)
        throw new RangeError('Invalid historical spell turn');
      if (!Number.isInteger(spell.type) || !Number.isInteger(spell.target) || !Number.isInteger(spell.unit))
        throw new TypeError('Invalid historical spell signature');
      spells[sideKey[side]][turn]=spellId;
      spellDefs[spellId]={type:spell.type,cible:spell.target,unite:spell.unit,ecole:0};
      spellsById[spellId]={...spell,side,turn:Number(turn)};
      spellId++;
    }
  }
  return {units,armies,heroes:[heroA,heroD],spells,spellDefs,spellsById,lossFactor};
}
function parsedDead(html,hasA,hasD) {
  const matches=[...html.matchAll(/<td class="pertes">([\s\S]*?)<\/td>/g)];
  const numeric = m => !m ? null : /^\s*(\d+)/.test(m[1]) ? Number(/^\s*(\d+)/.exec(m[1])[1]) : 0;
  return {attacker:hasA?numeric(matches[0]):null,defender:hasD?numeric(matches[hasA?3:0]):null};
}
const snap = army => Array.from({length:9},(_,i) => {
  const u=army[i];
  return u ? {slot:i,remaining:u.nombre_restant,roundLosses:u.nombre_pertes,
    magicLosses:u.nombre_pertes_magie,bonusLost:u.nombre_bonus_perdu,
    raisedDuringBattle:u.nombre_ranimes,bonusTroops:u.nombre_bonus,
    initial:u.nombre,dispersed:Boolean(u.disperse)} : null;
});

/** Only fully parameterized synthetic cases; never connect this harness to a server. */
export function runHistoricalEncounter({
  attackers,defenders,attackerSpells={},defenderSpells={},
  unitCatalog=[],context={},lossFactor=0.25,maxRounds=100
}) {
  validateArmySlots(attackers);validateArmySlots(defenders);
  if (!Number.isFinite(lossFactor)||lossFactor<0 || !Number.isSafeInteger(maxRounds)||maxRounds<1)
    throw new RangeError('Invalid historical test parameters');
  if (['retreat','siege','magic','spells','resurrection','specialPhases'].some(k=>context[k]))
    throw new Error('Historical harness requires explicit supported context');
  if (context.attackerSalvos || context.defenderSalvos || context.pvp === false ||
      context.playerControlled === false || context.fortification?.place === 3)
    throw new Error('Unported phase/configuration in historical full encounter harness');
  for(const s of [...attackers,...defenders].filter(Boolean))
    if(!['I','R','C'].includes(s.weapon))throw new RangeError('Invalid weapon');

  const prepared=prepare({attackers,defenders,unitCatalog,context,attackerSpells,defenderSpells,lossFactor});
  const dom={};
  const $ = selector => ({
    html(value) { if(value!==undefined){dom[selector]=[String(value)];return this;} return (dom[selector]??[]).join(''); },
    append(value) { (dom[selector]??=[]).push(String(value));return this; },
    click(_fn){return this;},dblclick(_fn){return this;},
    removeClass(_class){return this;},addClass(_class){return this;},
    after(_value){return this;}
  });
  const tr=new Proxy({}, {get:(_obj,k) => [{
    attaquant_victorieux:'ATTACKER_VICTORIOUS',
    attaquant_repousse:'DEFENDER_VICTORIOUS',
    destruction_mutuelle:'MUTUAL_DISPERSION',
    fin:'END',alerte_egalite:'TIE X'
  }[k]??String(k)]});
  const ctx={
    $,_langue:0,window:{innerWidth:1400},_traduction:tr,
    _unites:prepared.units,_sorts:prepared.spellDefs,
    sorts:prepared.spells,
    _types_sorts:Array.from({length:5},(_,i)=>['spell'+i]),
    _unites_sorts:Array.from({length:10},()=>['unit']),
    _cibles_sorts:Array.from({length:10},(_,i)=>Object.assign(['target'+i],{arme:['I','R','C'][i]??'I'})),
    _ecoles_magie:[{nom_machine:'test'}],
    _victoires:Array.from({length:9},()=>['victory']),
    _ressources:{G:{}},
    pelotons_attaquant:prepared.armies.attacker,
    pelotons_defenseur:prepared.armies.defender,
    liste_heros:prepared.heroes,
    id_heros:{attaquant:0,defenseur:1},
    statut:{attaquant:1,defenseur:1},
    competences_hereditaires:{attaquant:zeroSkills(),defenseur:zeroSkills()},
    competences_speciales:{attaquant:zeroSpecial(),defenseur:zeroSpecial()},
    _competences_hereditaires:{},
    _competences_speciales:{pieges:{bonus:context.special?.trapBonus??0,nom:['traps']}},
    _multiplicateur_voie:0,_classement_voies:{},classement_voies:{attaquant:0,defenseur:0},
    pelotons_defense_reordonnes:false,
    rencontre_jcj:true,_seuil_fuite_jce:0,
    moral_eleve:{attaquant:context.morale?.attacker??0,defenseur:context.morale?.defender??0},
    saison:2,lieu:context.fortification?.place??0,
    bonus_defense_cite:context.fortification?.city??0,
    bonus_defense_region:context.fortification?.region??0,
    bonus_larmes_defense:context.fortification?.tears??0,
    _facteur_bonus:context.weaponAdvantageFactor??0,
    _facteur_pertes:lossFactor,
    bonus_larmes_pertes_attaquant:0,bonus_larmes_pertes_defenseur:0,
    honneur_royaume_attaquant:0,honneur_royaume_defenseur:0,_bonus_jcj:0,
    bonus_dolmens_attaquant:0,bonus_dolmens_defenseur:0,
    bonus_alliance_xp_attaquant:0,bonus_alliance_xp_defenseur:0,
    image_html_troupe:()=>'',image_html_sort:()=>'',image_html_arme:()=>'',image_html_ressource:()=>'',image_html_score:()=>'',
    formate_puissance:format,formate_nombre:format,formate_honneur:format,
    controle_caption:()=>{},toCapitalCase:x=>String(x),
    efface_simulation:()=>{},avertissement:()=>{},
    plus_puissant_peloton:()=>1,pelotons_faction_unique:()=>true,
    permalien_combat:()=>'',selectText:()=>{},rapport_de_forces:()=>'',
    _competences_alliance:{inspiration:{nom:['']}},
    events:[]
  };
  vm.createContext(ctx,{name:'Jactari-original-entire-encounter-test'});
  vm.runInContext(historicFunctions,ctx,{timeout:1000});
  // Hook only at function boundaries; keep native function bodies unchanged.
  const historicSpell=ctx.lancement_sorts;
  ctx.puissance_effective_sort=(id,_camp,_hero,attackWeapon,defendWeapon)=>{
    const spell=prepared.spellsById[id];
    if(!spell)throw new Error('Unknown spell ID in historical resolver');
    const power=spell.powerByWeapon?spell.powerByWeapon[spell.side==='attacker'?defendWeapon:attackWeapon]:spell.power;
    if(!Number.isFinite(power)||power<0)throw new RangeError('Unresolved effective spell power');
    return {puissance:power,details:''};
  };
  ctx.lancement_sorts=turn=>{
    if(turn>maxRounds)throw new Error('Historical encounter exceeded test round limit');
    const before={attacker:snap(ctx.pelotons_attaquant),defender:snap(ctx.pelotons_defenseur)};
    const r=historicSpell(turn);
    for(const side of sides) {
      const id=prepared.spells[sideKey[side]][turn];
      if (id!==undefined) {
        ctx.events.push({turn,phase:'spell',side,
          signature:prepared.spellsById[id],before:before[side],after:snap(ctx['pelotons_'+sideKey[side]])});
      }
    }
    return r;
  };
  const historicDuel=ctx.simulation_combat;
  const originalBonuses=ctx.bonus_attaque_defense;
  ctx.bonus_attaque_defense=(a,d,aw,dw)=>{
    const bonuses=originalBonuses(a,d,aw,dw);
    ctx.lastBonuses={...bonuses};
    return bonuses;
  };
  // Unlike V6.2, the bonus calculation is now the UNMODIFIED
  // historical bonus_attaque_defense, not the adapter under test.
  ctx.competences_speciales.attaquant.pieges=context.special?.attackerTraps??0;
  ctx.competences_speciales.defenseur.pieges=context.special?.defenderTraps??0;
  ctx.simulation_combat=turn=>{
    if(turn>maxRounds)throw new Error('Historical encounter exceeded test round limit');
    const ai=ctx.peloton_attaque,di=ctx.peloton_defense;
    const before={attacker:ctx.pelotons_attaquant[ai].nombre_restant,
      defender:ctx.pelotons_defenseur[di].nombre_restant};
    const duel=historicDuel(turn);
    ctx.events.push({turn,phase:'duel',attackerSlot:ai,defenderSlot:di,
      before,losses:{attacker:duel.pertes_attaquant,defender:duel.pertes_defenseur},
      remaining:{attacker:ctx.pelotons_attaquant[ai].nombre_restant,
        defender:ctx.pelotons_defenseur[di].nombre_restant},
      draw:duel.nul,falseDraw:duel.faux_nul,
      historicalBonuses:structuredClone(ctx.lastBonuses),
      totalPower:{attacker:duel.puissance_attaque_totale,defender:duel.puissance_defense_totale}});
    return duel;
  };
  // The user-supplied functions and inputs are local to one VM invocation.
  const completed=vm.runInContext('simulation_rencontre()',ctx,{timeout:4000});
  const battleRows=dom['#combat tbody']??[];
  const finalRow=battleRows.find(row=>row.includes('id="tour-fin"'))??battleRows.at(-1)??'';
  const status=finalRow.includes('ATTACKER_VICTORIOUS')?'attacker':
    finalRow.includes('DEFENDER_VICTORIOUS')?'defender':
    finalRow.includes('MUTUAL_DISPERSION')?'mutual-dispersion':null;
  // Early returns (PvP capture/wounds) are NOT a battle: expose and reject.
  if(!status)throw new Error('Historical result outside supported full-battle scope');
  const rawRows=(dom['#pertes tbody']??[]).filter(row=>row.includes('<tr>'));
  const permanent={attacker:[],defender:[]};
  // Original result table omits fully empty positions. Retain the positions
  // from the original 7-slot input, rather than relying on the row array index.
  let k=0;
  for(let i=0;i<7;i++){
    if(!attackers[i]&&!defenders[i]){for(const side of sides)permanent[side][i]=null;continue;}
    const row=rawRows[k++];
    if(!row)throw new Error('Missing historical casualty row for slot '+i);
    const dead=parsedDead(row,Boolean(attackers[i]),Boolean(defenders[i]));
    for(const side of sides) {
      const value=dead[side];
      if(value!=null&&!Number.isSafeInteger(value))throw new Error('Unparsable native casualty output');
      permanent[side][i]=value;
    }
  }
  return {status,completed,events:ctx.events,rounds:ctx.events.filter(x=>x.phase==='duel').length,
    battlefield:{attacker:snap(ctx.pelotons_attaquant),defender:snap(ctx.pelotons_defenseur)},
    permanent,htmlRows:{battle:battleRows.length,losses:rawRows.length},
    hero:{attacker:ctx.liste_heros[0],defender:ctx.liste_heros[1]},
    provenance:'original-simulation_rencontre+lancement_sorts+simulation_combat (headless shim)',
    limitations:['synthetic unit catalog and resolved spell powers','native historical hero bonuses with fixture-injected context',
      'no authentic browser/UI rendering','no siege/PvE/admission branch validation','no MMHK S2 coefficient certification']};
}
