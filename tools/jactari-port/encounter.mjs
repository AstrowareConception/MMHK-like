/** DOM-free Jactari encounter subset, GPL-3.0-or-later derivative.
 * Applies historical first-undispersed-stack order and ported per-stack duel.
 * Deliberately rejects magic, ranged phases, retreats and unmodeled specials.
 * Casualties here are battle-round losses, NOT final irreversible casualties.
 */
import { resolveStackDuel, validateArmySlots } from './core.mjs';
import { calculateBonuses } from './bonuses.mjs';

const supported = new Set(['I', 'R', 'C']);
function validate(slots) {
  validateArmySlots(slots);
  slots.forEach((s, i) => {
    if (s && !supported.has(s.weapon)) throw new RangeError(`Unsupported weapon in slot ${i + 1}`);
  });
}
function project(slots) { return slots.map(s => s ? { ...s, remaining: s.count, dispersed: false, roundLosses: 0 } : null); }
function first(state) { return state.findIndex(s => s && s.remaining > 0 && !s.dispersed); }
export function simulateMeleeOnlyEncounter({ attackers, defenders, context = {}, maxRounds = 1000 }) {
  validate(attackers); validate(defenders);
  if (!Number.isSafeInteger(maxRounds) || maxRounds < 1) throw new RangeError('Invalid maxRounds');
  if (context.magic || context.siege || context.prebattle || context.retreat || context.specialPhases) {
    throw new Error('Unsupported phase: use only the explicit basic-melee subset');
  }
  const a = project(attackers), d = project(defenders), events = [];
  for (let turn = 1; turn <= maxRounds; turn++) {
    const ai = first(a), di = first(d);
    if (ai < 0 || di < 0) {
      return { status: ai < 0 && di < 0 ? 'mutual-dispersion' : ai < 0 ? 'defender' : 'attacker',
        rounds: events.length, events, attacker: a, defender: d,
        completeness: 'melee-only; no final permanent-loss calculation' };
    }
    const as = a[ai], ds = d[di];
    const modifiers = calculateBonuses({
      attackerWeapon: as.weapon, defenderWeapon: ds.weapon,
      attackerHero: context.attackerHero ?? null, defenderHero: context.defenderHero ?? null,
      morale: context.morale ?? {}, special: context.special ?? {},
      weaponAdvantageFactor: context.weaponAdvantageFactor ?? 0,
      fortification: context.fortification ?? {}
    });
    const duel = resolveStackDuel({
      attacker: { count: as.remaining, unitPower: as.unitPower },
      defender: { count: ds.remaining, unitPower: ds.unitPower }, modifiers
    });
    // Original -1 means a special no-loss sentinel, not a negative killed unit.
    const killedA = duel.losses.attacker === -1 ? 0 : Math.max(0, duel.losses.attacker);
    const killedD = duel.losses.defender === -1 ? 0 : Math.max(0, duel.losses.defender);
    as.roundLosses += killedA; ds.roundLosses += killedD;
    as.remaining = duel.remaining.attacker; ds.remaining = duel.remaining.defender;
    as.dispersed ||= duel.dispersed.attacker || as.remaining <= 0;
    ds.dispersed ||= duel.dispersed.defender || ds.remaining <= 0;
    events.push({ turn, attackerSlot: ai + 1, defenderSlot: di + 1, modifiers, duel });
  }
  throw new Error(`Round limit ${maxRounds} exceeded: cannot safely infer result`);
}
