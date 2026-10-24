/**
 * Semantic diff of a Jactari original-duel multi-round reference against the
 * unified adapter. No claims about the original complete encounter pipeline.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const close = (a, b) => Number.isFinite(a) && Number.isFinite(b) &&
  Math.abs(a - b) <= 1e-9 * Math.max(1, Math.abs(a), Math.abs(b));

export function compareBattleSequence(legacy, modern) {
  if (!legacy || !modern || !Array.isArray(legacy.events) || !Array.isArray(modern.events))
    throw new TypeError('Both battle results and their event logs are required');
  const differences = [];
  const check = (path, expected, observed) => {
    if (typeof expected === 'number' && typeof observed === 'number' ? !close(expected, observed) : expected !== observed)
      differences.push({path, expected, observed});
  };
  check('status', legacy.status, modern.status);
  check('rounds', legacy.rounds, modern.rounds);
  const actualDuels = modern.events.filter(e => e.phase === 'duel');
  check('duels.length', legacy.events.length, actualDuels.length);
  for (let i = 0; i < Math.min(legacy.events.length, actualDuels.length); i++) {
    const x = legacy.events[i], y = actualDuels[i], prefix = 'duels[' + i + ']';
    for (const key of ['turn', 'attackerSlot', 'defenderSlot'])
      check(prefix + '.' + key, x[key], y[key]);
    for (const side of ['attacker', 'defender']) {
      check(prefix + '.losses.' + side, x.losses[side], y.duel.losses[side]);
      check(prefix + '.remaining.' + side, x.remaining[side], y.duel.remaining[side]);
      check(prefix + '.dispersed.' + side, x.dispersed[side], y.duel.dispersed[side] || y.duel.remaining[side] <= 0);
      check(prefix + '.totalPower.' + side, x.totalPower[side], y.duel.totalPower[side]);
    }
    check(prefix + '.draw', x.draw, y.duel.draw);
    check(prefix + '.falseDraw', x.falseDraw, y.duel.falseDraw);
  }
  for (const side of ['attacker', 'defender']) {
    const state = modern.battlefield?.[side] ?? [];
    const expected = legacy[side];
    if (!Array.isArray(expected) || state.length !== 9)
      differences.push({path: 'battlefield.' + side, expected: '7 legacy / 9 current slots', observed: state.length});
    else for (let i = 0; i < 7; i++) {
      const a = expected[i], b = state[i + 2], p = 'battlefield.' + side + '[' + i + ']';
      check(p + '.present', Boolean(a), Boolean(b));
      if (a && b) {
        check(p + '.remaining', a.remaining, b.remaining);
        check(p + '.roundLosses', a.roundLosses, b.roundLosses);
      }
    }
  }
  return {equal: differences.length === 0, differences,
    comparedDuels: Math.min(legacy.events.length, actualDuels.length),
    scope: 'original Jactari duel function + reconstructed no-magic sequence; not full encounter'};
}
