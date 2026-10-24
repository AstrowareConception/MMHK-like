/**
 * Multi-round reference executed against Jactari's VENDORED original simulation_combat().
 * This is a testing-only oracle: original duel function, but a reconstructed loop,
 * shared bonus adapter, and NO original simulation_rencontre(), spells, salvos or XP.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import {calculateBonuses} from './bonuses.mjs';
import {validateArmySlots} from './core.mjs';

const root = path.dirname(fileURLToPath(import.meta.url));
const upstream = path.resolve(root, '../../data/Jactari/src/scripts/combat.min.js');

function extractHistoricFunction(source, name) {
  const start = source.indexOf('function ' + name + '(');
  if (start < 0) throw new Error('Historical Jactari function missing: ' + name);
  const begin = source.indexOf('{', start);
  let depth = 0;
  for (let i = begin; i < source.length; i++) {
    if (source[i] === '{') depth++;
    if (source[i] === '}' && --depth === 0) return source.slice(start, i + 1);
  }
  throw new Error('Unclosed historical Jactari function: ' + name);
}

const original = extractHistoricFunction(fs.readFileSync(upstream, 'utf8'), 'simulation_combat');
function normalize(slots, offset, catalog) {
  return Object.fromEntries(slots.flatMap((s, i) => {
    if (s == null) return [];
    const type = offset + i;
    catalog[type] = {puissance: s.unitPower, arme: s.weapon};
    return [[i + 2, {
      type, nombre_debut_combat: s.count, nombre_restant: s.count,
      nombre_bonus: 0, nombre_bonus_perdu: 0, nombre_pertes: 0, disperse: false
    }]];
  }));
}
const select = slots => {
  for (let slot = 0; slot < 9; slot++)
    if (slots[slot] && slots[slot].nombre_restant > 0 && !slots[slot].disperse) return slot;
  return -1;
};
const project = state => Array.from({length: 7}, (_, i) => {
  const p = state[i + 2];
  return p ? {remaining: p.nombre_restant, roundLosses: p.nombre_pertes,
    dispersed: Boolean(p.disperse) || p.nombre_restant <= 0} : null;
});

/** Restricted reference: no magic, no salvos, no admission, no permanent losses. */
export function runLegacyDuelSequence({attackers, defenders, context = {}, maxRounds = 1000}) {
  validateArmySlots(attackers);
  validateArmySlots(defenders);
  if (!Number.isSafeInteger(maxRounds) || maxRounds < 1) throw new RangeError('Invalid round limit');
  for (const s of [...attackers, ...defenders].filter(Boolean))
    if (!['I','R','C'].includes(s.weapon)) throw new RangeError('Unknown weapon');
  if (['magic','spells','retreat','siege','resurrection','specialPhases','prebattle'].some(k => context[k]))
    throw new Error('Legacy sequence oracle excludes other battle phases');
  const catalog = [];
  const a = normalize(attackers, 2, catalog);
  const d = normalize(defenders, 9, catalog);
  const sandbox = {
    pelotons_attaquant: a, pelotons_defenseur: d, _unites: catalog,
    id_heros: {attaquant: null, defenseur: null},
    peloton_attaque: -1, peloton_defense: -1,
    bonus_attaque_defense: () => {
      const m = sandbox.currentModifiers;
      return {
        attaque_peloton_heros: m.attackStackHero,
        attaque_unites_heros: m.attackUnitsHero,
        attaque_peloton_arme: m.attackWeapon,
        attaque_peloton_special: m.attackSpecial,
        defense_peloton_heros: m.defendStackHero,
        defense_unites_heros: m.defendUnitsHero,
        defense_peloton_arme: m.defendWeapon,
        defense_peloton_special: m.defendSpecial,
        defense_peloton_fortifications: m.defendFortification
      };
    },
    avertissement: () => {}, _traduction: {alerte_egalite: ['tie X']},
    _langue: 0, dernier_peloton: null
  };
  vm.createContext(sandbox, {name: 'vendored-jactari-duel-only'});
  vm.runInContext(original, sandbox, {timeout: 1000});
  const events = [];
  for (let turn = 1; turn <= maxRounds; turn++) {
    const ai = select(a), di = select(d);
    if (ai < 0 || di < 0) return {
      status: ai < 0 && di < 0 ? 'mutual-dispersion' : ai < 0 ? 'defender' : 'attacker',
      rounds: events.length, events, attacker: project(a), defender: project(d),
      provenance: 'original-simulation_combat-reconstructed-round-loop'
    };
    const as = a[ai], ds = d[di];
    as.nombre_debut_combat = as.nombre_restant;
    ds.nombre_debut_combat = ds.nombre_restant;
    sandbox.peloton_attaque = ai;
    sandbox.peloton_defense = di;
    sandbox.currentModifiers = calculateBonuses({
      attackerWeapon: catalog[as.type].arme,
      defenderWeapon: catalog[ds.type].arme,
      attackerHero: context.attackerHero, defenderHero: context.defenderHero,
      weaponAdvantageFactor: context.weaponAdvantageFactor ?? 0,
      morale: context.morale ?? {}, special: context.special ?? {},
      fortification: context.fortification ?? {}
    });
    // Execution of the original JS function, not a ported copy of the formula.
    const res = vm.runInContext('simulation_combat(' + turn + ')', sandbox, {timeout: 1000});
    if (res.pertes_attaquant > 0) as.nombre_pertes += res.pertes_attaquant;
    if (res.pertes_defenseur > 0) ds.nombre_pertes += res.pertes_defenseur;
    events.push({
      turn, attackerSlot: ai, defenderSlot: di,
      losses: {attacker: res.pertes_attaquant, defender: res.pertes_defenseur},
      remaining: {attacker: as.nombre_restant, defender: ds.nombre_restant},
      dispersed: {attacker: Boolean(as.disperse) || as.nombre_restant <= 0,
        defender: Boolean(ds.disperse) || ds.nombre_restant <= 0},
      draw: res.nul, falseDraw: res.faux_nul,
      totalPower: {attacker: res.puissance_attaque_totale, defender: res.puissance_defense_totale}
    });
  }
  throw new Error('Historic round limit exceeded');
}
