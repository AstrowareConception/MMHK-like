#!/usr/bin/env node
/**
 * Audit reproductible des spécifications métier Early Game.
 * Node.js 18+ sans dépendance. NE simule PAS le moteur : contrôle les preuves,
 * les identifiants, les références et quelques exemples arithmétiques.
 *
 * Usage : node tools/validate-early-game-rules.mjs
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const path = relative => resolve(ROOT, relative);
const read = relative => JSON.parse(readFileSync(path(relative), 'utf8'));

const RULES = read('data/rules/early-game.rules.json');
const FIXTURES = read('data/rules/early-game.fixtures.json');
const PROFILE = read('data/rules/early-game.profile-lab.json');
const BUILDINGS = read('data/reference/batiments.json');
const UNITS = read('data/reference/creatures.json');
const COMBAT = read('data/combat-reference-cases.json');
const GHERKIN = readFileSync(path('docs/rules/RECETTE-GHERKIN.md'), 'utf8');
const UNKNOWN_DOC = readFileSync(path('docs/research/INCERTITUDES.md'), 'utf8');

const errors = [];
let assertions = 0;
const check = (condition, message) => {
  assertions += 1;
  if (!condition) errors.push(message);
};

function unique(arr) { return new Set(arr).size === arr.length; }
function sameJSON(a,b) { return JSON.stringify(a) === JSON.stringify(b); }
const ids = arr => arr.map(x => x.id);
const ruleIds = new Set(ids(RULES.rules));
// Les 60 règles initiales et les nouvelles règles de projet partagent le
// même catalogue. L'état historique n'est jamais inféré d'une réponse P0.
const fixtureIds = new Set(ids(FIXTURES.fixtures));

const docs = readdirSync(path('docs/backlog/categories'))
  .filter(name => /^\d{2}-[A-Z]+\.md$/.test(name))
  .map(name => readFileSync(path('docs/backlog/categories/' + name), 'utf8'))
  .join('\n');
const userStories = new Set([...docs.matchAll(/^## (US-[A-Z]{3}-\d{3}) —/gm)].map(x=>x[1]));
const uncertainties = new Set([...UNKNOWN_DOC.matchAll(/^\| (U\d{2}) \|/gm)].map(x=>x[1]));

check(RULES.rules.length === RULES.counts.rules, 'Décompte de règles incorrect');
check(FIXTURES.fixtures.length === FIXTURES.count, 'Décompte de fixtures incorrect');
check(RULES.rules.length >= 1 && FIXTURES.fixtures.length >= 1, 'Registre vide');
check(unique(ids(RULES.rules)), 'Identifiants RM dupliqués');
check(unique(ids(FIXTURES.fixtures)), 'Identifiants FX dupliqués');
check(PROFILE.profile_state === 'NON_EXECUTABLE_DECISIONS_PENDING', 'Profil de laboratoire ne doit pas être annoncé prêt');
check(PROFILE.release_gates.can_execute_PAR_01 === false, 'Profil de laboratoire ne doit pas déclarer PAR-01 exécuté');
check(PROFILE.release_gates.can_expose_as_historical_ruleset === false, 'Profil de laboratoire ne doit pas être annoncé historique');

const domains = {};
const states = {};
const rulesWithFixtures = new Map();

for (const r of RULES.rules) {
  check(/^RM-(WRD|REG|ECO|CIT|HER|ARM|COM|TIM)-\d{3}$/.test(r.id), 'Mauvais identifiant : ' + r.id);
  check(r.statement?.length > 20 && r.contract?.length > 20, 'Déclaration/contrat insuffisant : ' + r.id);
  check(r.evidence && r.state, 'Preuve ou état absent : ' + r.id);
  check(Array.isArray(r.source_documents) && r.source_documents.length > 0, 'Sources absentes : ' + r.id);
  check(Array.isArray(r.us) && r.us.length > 0, 'US absentes : ' + r.id);
  check(Array.isArray(r.unknowns) && Array.isArray(r.fixture_ids), 'Mauvais format références : ' + r.id);
  domains[r.domain] = (domains[r.domain] || 0) + 1;
  states[r.state] = (states[r.state] || 0) + 1;
  for (const source of r.source_documents || []) {
    check(typeof source === 'string' && existsSync(path(source)), 'Source introuvable : ' + r.id + ' -> ' + source);
  }
  for (const us of r.us || []) check(userStories.has(us), 'US inexistante : ' + r.id + ' -> ' + us);
  for (const u of r.unknowns || []) check(uncertainties.has(u), 'Incertitude inexistante : ' + r.id + ' -> ' + u);
  for (const fx of r.fixture_ids || []) {
    check(fixtureIds.has(fx), 'Fixture inexistante : ' + r.id + ' -> ' + fx);
    const uses = rulesWithFixtures.get(fx) || new Set();
    uses.add(r.id);
    rulesWithFixtures.set(fx, uses);
  }
}
check(sameJSON(domains, RULES.counts.domains), 'Répartition par domaine incorrecte');
check(sameJSON(states, RULES.counts.states), 'Répartition par état incorrecte');

for (const f of FIXTURES.fixtures) {
  check(/^FX-[A-Z]+-\d{3}$/.test(f.id), 'Identifiant fixture incorrect : ' + f.id);
  check(f.kind && f.given && f.when?.length && f.then?.length, 'Fixture sans précondition/action/résultat : ' + f.id);
  check(Array.isArray(f.rules) && f.rules.length > 0, 'Fixture sans RM : ' + f.id);
  check(rulesWithFixtures.has(f.id), 'Fixture non référencée depuis le catalogue : ' + f.id);
  for (const r of f.rules || []) check(ruleIds.has(r), 'RM inexistante dans la fixture ' + f.id + ' -> ' + r);
  for (const us of f.us || []) check(userStories.has(us), 'US inexistante dans la fixture ' + f.id + ' -> ' + us);
  const mentions = [...GHERKIN.matchAll(new RegExp('@' + f.id + '(?!\\d)', 'g'))].length;
  check(mentions === 1, 'Fixture absente/dupliquée dans Gherkin : ' + f.id);
}

// Comparaison des valeurs 2013 réellement extraites, sans inventer de cadence.
const mairie = BUILDINGS._batiments[2];
const fxMairie = FIXTURES.fixtures.find(f => f.id === 'FX-BUILD-001');
check(mairie?.nom === 'Mairie' && mairie?.faction === 0, 'Entrée Mairie Académie déplacée');
check(sameJSON(mairie?.cout, fxMairie?.given?.cost), 'Coût de Mairie différent de la fixture');
check(mairie?.duree === fxMairie?.given?.duration_minutes, 'Durée de Mairie différente de la fixture');
check(mairie?.prerequis?.niveau_cite === fxMairie?.given?.city_level, 'Niveau de Mairie incorrect');
check(mairie?.prerequis?.batiment === 1, 'Prérequis Conseil manquant dans le catalogue');
if (fxMairie) {
  const b = fxMairie.given.resources_before;
  const c = fxMairie.given.cost;
  const actual = Object.fromEntries(Object.keys(c).map(k => [k, b[k] - c[k]]));
  check(sameJSON(actual, fxMairie.expected.resources_after), 'Solde après construction faux');
  check(new Date(fxMairie.given.start).getTime() + mairie.duree * 60000 ===
    new Date(fxMairie.expected.due_at).getTime(), 'Échéance 576 minutes erronée');
}

const armFx = FIXTURES.fixtures.find(f => f.id === 'FX-ARM-002');
const gremlin = UNITS._unites[0];
check(gremlin?.nom === 'Gremlin' && gremlin?.faction === 0, 'Unité Gremlin déplacée');
check(gremlin?.cout?.G === armFx?.given.unit_cost_G, 'Coût Gremlin incohérent');
check(gremlin?.puissance === armFx?.given.unit_power, 'Puissance Gremlin incohérente');
check(armFx?.given.quantity * gremlin?.cout?.G === armFx?.expected.total_cost_G, 'Total achat Gremlin erroné');
check(armFx?.given.quantity * gremlin?.puissance === armFx?.expected.raw_power, 'Puissance brute Gremlin erronée');
check(armFx?.given.gold_before - armFx?.expected.total_cost_G === armFx?.expected.gold_after,
  'Solde or après recrutement erroné');

const duel = FIXTURES.fixtures.find(f => f.id === 'FX-PVE-002');
const oracle = COMBAT.duels.find(c => c.id === duel?.given.oracle_case_id);
check(oracle && sameJSON(oracle.expected, duel.expected), 'Oracle synthétique Jactari divergent');

const region = FIXTURES.fixtures.find(f => f.id === 'FX-REG-001')?.given;
if (region) {
  check(region.width === 5 && region.height === 5 && region.mines.length === 4, 'Région de la fixture invalide');
  const keys = region.mines.map(m => m.cell.join(','));
  check(unique(keys), 'Deux mines sur la même case');
  check(!keys.includes(region.city.join(',')), 'Mine placée sur la cité');
  for (const m of region.mines) {
    check(m.cell.every(v => Number.isInteger(v) && v >= 0 && v < 5), 'Mine hors région');
    check(PROFILE.catalogues.resource_keys.includes(m.resource), 'Type de mine inconnu');
  }
}
const protection = FIXTURES.fixtures.find(f => f.id === 'FX-PROTECT-001')?.given;
check(new Date(protection?.end).getTime() - new Date(protection?.start).getTime() === 7 * 86400000,
  'Durée de protection de la fixture incorrecte');

if (errors.length) {
  console.error('ÉCHEC : ' + errors.length + ' erreur(s) sur ' + assertions + ' contrôles');
  errors.forEach(msg => console.error(' - ' + msg));
  process.exitCode = 1;
} else {
  console.log('OK : ' + assertions + ' contrôles structurels, sources, US, Uxx, ' + RULES.rules.length + ' RM, ' + FIXTURES.fixtures.length + ' FX et valeurs 2013.');
  console.log('IMPORTANT : aucun moteur de jeu ni scénario Gherkin n’a été exécuté.');
}
