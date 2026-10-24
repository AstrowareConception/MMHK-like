import test from 'node:test';
import assert from 'node:assert/strict';
import {runLegacyDuelSequence} from './legacy-sequence-oracle.mjs';
import {compareBattleSequence} from './battle-differential.mjs';
import {simulateUnifiedBattle} from './unified-battle.mjs';

const unit = (count, weapon = 'I', unitPower = 10) => ({
  count, weapon, unitPower, goldCost: 5, rareCosts: {crystal: 1}
});
const slots = (...units) => Array.from({length: 7}, (_, i) => units[i] ?? null);
const standardLosses = {lossFactor: 0.25, source: 'synthetic-differential-not-S2'};
const fixture = (id, attackers, defenders, context = {}) => ({id, attackers, defenders, context});
const scenarios = [
  fixture('single-attacker-victory', slots(unit(100)), slots(unit(50))),
  fixture('single-defender-victory', slots(unit(20)), slots(unit(100))),
  fixture('mutual-dispersion', slots(unit(50)), slots(unit(50))),
  fixture('ordered-defender-pelotons', slots(unit(200)), slots(unit(20), unit(30), unit(40))),
  fixture('ordered-attacker-pelotons', slots(unit(20), unit(30), unit(60)), slots(unit(90))),
  fixture('weapons-infantry-beats-cavalry', slots(unit(70, 'I')), slots(unit(65, 'C')), {weaponAdvantageFactor: .25}),
  fixture('weapons-ranged-beats-infantry', slots(unit(60, 'R')), slots(unit(75, 'I')), {weaponAdvantageFactor: .25}),
  fixture('weapons-cavalry-beats-ranged', slots(unit(55, 'C')), slots(unit(60, 'R')), {weaponAdvantageFactor: .25}),
  fixture('hero-versus-fortifications', slots(unit(100, 'I')), slots(unit(100, 'I')),
    {attackerHero: {attaque_modifiee: 20}, defenderHero: {defense_modifiee: 30},
      fortification: {place: 1, city: 25}}),
  fixture('seven-on-seven', slots(...Array.from({length: 7}, (_, i) => unit(20 + 5 * i))),
    slots(...Array.from({length: 7}, (_, i) => unit(17 + 3 * i, ['I', 'R', 'C'][i % 3]))),
    {weaponAdvantageFactor: .25})
];

function compare(input) {
  const legacy = runLegacyDuelSequence(input);
  const unified = simulateUnifiedBattle({
    ...input, lossPolicy: standardLosses
  });
  return {legacy, unified, diff: compareBattleSequence(legacy, unified)};
}

for (const scenario of scenarios)
  test('historical multi-round duel differential: ' + scenario.id, () => {
    const {diff, legacy, unified} = compare(scenario);
    assert.equal(diff.equal, true, scenario.id + ': ' + JSON.stringify(diff.differences.slice(0, 5)));
    assert.equal(diff.comparedDuels, legacy.rounds);
    assert.equal(unified.rounds, legacy.rounds);
    assert.equal(unified.persistentArmies.attacker.length, 7);
    assert.equal(unified.persistentArmies.defender.length, 7);
  });

test('180 seeded multi-peloton combats against original Jactari duel function', () => {
  let seed = 20261024;
  const rnd = () => {
    seed ^= seed << 13; seed ^= seed >>> 17; seed ^= seed << 5;
    return (seed >>> 0) / 4294967296;
  };
  for (let caseNo = 0; caseNo < 180; caseNo++) {
    const army = () => slots(...Array.from({length: 7}, () =>
      rnd() < .5 ? null : unit(1 + Math.floor(rnd() * 100),
        ['I','R','C'][Math.floor(rnd() * 3)], [5, 10, 20][Math.floor(rnd() * 3)])));
    const attackers = army(), defenders = army();
    if (attackers.every(x => !x)) attackers[0] = unit(5);
    if (defenders.every(x => !x)) defenders[0] = unit(5);
    const input = {
      attackers, defenders,
      context: {
        weaponAdvantageFactor: [0, .25][Math.floor(rnd() * 2)],
        attackerHero: {attaque_modifiee: [0, 50][Math.floor(rnd() * 2)]},
        defenderHero: {defense_modifiee: [0, 50][Math.floor(rnd() * 2)]}
      }
    };
    const {diff} = compare(input);
    assert.equal(diff.equal, true, 'seed-case ' + caseNo + ': ' +
      JSON.stringify(diff.differences.slice(0, 5)));
  }
});

test('comparator shows exact divergence position rather than concealing a mismatch', () => {
  const {legacy, unified} = compare(scenarios[0]);
  unified.events.find(e => e.phase === 'duel').duel.losses.attacker++;
  const diff = compareBattleSequence(legacy, unified);
  assert.equal(diff.equal, false);
  assert.ok(diff.differences.some(d => d.path === 'duels[0].losses.attacker'));
});

test('historical oracle does not mutate input arrays or hero context', () => {
  const input = structuredClone(scenarios[8]);
  const snapshot = structuredClone(input);
  runLegacyDuelSequence(input);
  assert.deepEqual(input, snapshot);
});

test('historical oracle refuses phases that the adapter does not actually execute', () => {
  assert.throws(() => runLegacyDuelSequence({
    attackers: scenarios[0].attackers, defenders: scenarios[0].defenders,
    context: {magic: true}
  }), /excludes other battle phases/);
});

test('round-limit rejection is explicit for both engines', () => {
  const input = scenarios[3];
  assert.throws(() => runLegacyDuelSequence({...input, maxRounds: 1}), /round limit/i);
  assert.throws(() => simulateUnifiedBattle({...input, maxRounds: 1, lossPolicy: standardLosses}), /Round limit/i);
});
