# Portage du noyau de combat Jactari

## État du 23 octobre 2026

**Une première fonction réelle du calculateur historique est isolée :** `simulation_combat(tour)` a été convertie en `resolveStackDuel(request)`, fonction JavaScript **pure**, sans DOM, jQuery ni variables globales. L'entrée contient deux pelotons (effectif, puissance individuelle) et un ensemble de **modificateurs déjà calculés**. Le résultat donne puissance de base, bonus, puissance totale, pertes, survivants, dispersion et égalité.

La conversion suit les **branches et étapes de `Math.floor` du Jactari original**, en conservant le sentinelle `losses=-1` pour une victoire écrasante : ce n'est **pas** une perte négative. Les sept emplacements d'armée ont un validateur de structure séparé. **La fonction ne résout PAS une bataille impliquant sept pelotons** ; elle ne calcule pas non plus les bonus à partir des compétences du héros, de la magie ou des armes : ceux-ci doivent être fournis à l'interface.

### Utilisation

```js
import {resolveStackDuel,validateArmySlots} from './core.mjs';
validateArmySlots([null,null,null,null,null,null,{count:100,unitPower:10}]);
const report=resolveStackDuel({
  attacker:{count:100,unitPower:10},
  defender:{count:50,unitPower:10},
  modifiers:{attackWeapon:0}
});
console.log(report.remaining); // {attacker:50, defender:0}
```

**Tester sans dépendance** (Node.js 20+) :

```bash
node --test tools/jactari-port/core.test.mjs
```

Les **8 tests ont été exécutés en local et réussis** : attaque victorieuse, défense victorieuse, égalité, victoires écrasantes dans les deux sens, modificateur d'arme avec arrondi, données incorrectes, sept slots ordonnés. Attention : ce premier jeu de tests est une **transcription de branches inspectées**, pas un test différentiel automatisé sur le navigateur Jactari ; l'équivalence globale n'est pas encore démontrée.

### Licence et provenance

Source : [calculateur original](../../data/Jactari/src/scripts/combat.min.js), auteurs Jactari, Aspirin et Aendawyn. Son en-tête mentionne **GNU GPL v3 ou ultérieure**. Ce module extrait et adapté est identifié `SPDX-License-Identifier: GPL-3.0-or-later`. **Vérifier les obligations de redistribution et la stratégie de licence de MMHK-like** avant d'incorporer le code dérivé à un serveur distribué.

### Frontière d'intégration

- `core.mjs` — duel pur réutilisable, sans effet métier global.
- `core.test.mjs` — tests de branches déterministes.
- Étape suivante : extraire `bonus_attaque_defense` avec toutes ses données puis l'orchestration `simulation_rencontre`, les formations, les tours et la séparation pertes/dispersion/morts permanentes.
- Construire un **harness différentiel** pour comparer les calculs portés à l'exécution du vrai Jactari plutôt qu'à des valeurs attendues manuellement.
- Les attaques non prises en charge doivent être **refusées explicitement**, jamais confiées à une approximation silencieuse.


## Extraction complémentaire : modificateurs sans jQuery

`bonuses.mjs` porte une partie importante de `bonus_attaque_defense` et expose `calculateBonuses({attackerWeapon, defenderWeapon, attackerHero, defenderHero, morale, special, weaponAdvantageFactor, fortification})`. La fonction renvoie les neuf coefficients directement acceptés par `resolveStackDuel` : bonus par unité, bonus par peloton, avantage I>C / R>I / C>R, moral, pièges et fortification.

```js
import { calculateBonuses } from './bonuses.mjs';
import { resolveStackDuel } from './core.mjs';
const modifiers = calculateBonuses({
  attackerWeapon: 'I', defenderWeapon: 'C',
  weaponAdvantageFactor: 0.5,
  attackerHero: { attaque_modifiee: 20, bonus_tacticien: 5 },
});
const result = resolveStackDuel({
  attacker: { count: 100, unitPower: 10 },
  defender: { count: 100, unitPower: 10 },
  modifiers,
});
```

Exécuter **tous les tests du sous-système** : `node --test tools/jactari-port/*.test.mjs`.

**État des validations :** 15 tests sur les deux modules ont été exécutés dans l'environnement local et réussis. Ces tests couvrent les branches du code isolé, pas encore des comparaisons automatiques différentielles avec le moteur navigateur original.

**Écart source à documenter avant un portage strict :** la fonction originale vérifie deux fois `heros_a.bonus_legendary_legwarrior_b` tout en ajoutant `heros_d.bonus_legendary_legwarrior_b`, ce qui ressemble à une anomalie de variable et à un doublon. L'adaptateur ne comptabilise actuellement la compétence du défenseur **qu'une fois**. C'est une décision d'adaptation explicite, non une preuve d'équivalence sur ce cas. Les paramètres `moral` et `special` sont fournis déjà agrégés ; les routines historiques qui les génèrent ne sont pas encore portées.

**Restent non portés :** déroulement multi-pelotons `simulation_rencontre`, conditions de retraite, magie, engins de siège, rapports complets, coûts des pertes, expérience, données de créatures et instanciation des bonus historiques `_facteur_bonus` à partir de la saison. Ne pas utiliser ce sous-ensemble seul pour annoncer le vainqueur d'une bataille MMHK complète.


## Ajout : pré-combat et rencontre sans magie

L'extraction apporte désormais :
- `ranged.mjs` : salves pré-combat (`R` tireurs, `T` tous les pelotons selon compétence, `E` engins de siège). Le calcul conserve la progression dans les sept slots et le `Math.floor` du code `tir_engins_siege`. `resolveSimultaneousSalvos` utilise un même état initial pour les deux camps, puis applique ensemble les pertes, sans mutation des entrées.
- `encounter.mjs` : `simulateMeleeOnlyEncounter`, résolution des premiers pelotons encore actifs dans l'ordre original, avec journal de chaque duel et prise en compte des bonus du module précédent. Le résultat distingue **victoire de l'attaquant, du défenseur ou dispersion mutuelle** et conserve les pertes de tours.

**Important :** ces deux briques ne sont pas encore raccordées dans un orchestrateur de combat intégral. L'orchestrateur `encounter.mjs` refuse explicitement magie, siège, pré-combat, fuite et phases spéciales ; il n'implémente pas la détermination des **pertes permanentes**, les résurrections ni les héros blessés. Les salves sont des calculs autonomes à intégrer ensuite selon le bon ordre historique. Le calcul des bonus est encore un adaptateur partiel.

### Vérification

```bash
node --test tools/jactari-port/*.test.mjs
```

**31 tests validés localement** sur quatre suites : 8 duels, 7 bonus, 8 rencontres multi-pelotons et 8 tests de salves. Les résultats doivent encore être comparés **différentiellement** contre une exécution du Jactari original ; la correspondance des seules branches arithmétiques ne prouve pas une fidélité historique totale.

Le sous-ensemble est réutilisable dans les futures opérations PvE, PvP et simulateur, **mais ne doit pas encore être utilisé comme arbitre de combat officiel d'un serveur multijoueur**. Son code est une adaptation de la source GPLv3+ de Jactari ; conserver les mentions de licence.


## Orchestrateur intégré et test différentiel (23 octobre 2026)

`battle.mjs` expose `simulateSupportedBattle` : snapshots immuables, **salves préalables simultanées** (`ranged.mjs`) puis **mêlée ordonnée** de sept pelotons (`encounter.mjs`). Six scénarios supplémentaires couvrent les tirs décisifs, la destruction mutuelle, les deux phases consécutives, l'immutabilité des entrées et les rejets de fonctionnalités inconnues.

**37 tests locaux passants** (31 précédents + 6 tests de l'orchestrateur). L'outil `differential.test.mjs` ajoute **350 duels déterministes** exécutés en parallèle logique contre `simulation_combat(tour)` originale, chargée dans un contexte isolé `node:vm`. Il compare les deux camps, leurs pertes, leurs survivants, égalités et faux-nuls. **Ce nouveau test différentiel est enregistré dans GitHub, mais son résultat CI n'est pas encore vérifié.** Les 350 comparaisons ne sont donc pas à inclure dans le total de tests effectivement passants tant qu'il n'a pas été exécuté.

Commande de validation complète :

```bash
node --test tools/jactari-port/*.test.mjs
```

**Périmètre et honnêteté d'intégration :** les salves et la mêlée sont désormais composées, mais ni la magie, ni les résurrections, ni la fuite S2, ni le calcul final des morts permanentes ne sont portés. Le moteur **refuse** ces phases au lieu de fabriquer un combat complet. Dans Jactari, les règles d'ordre des tirs et les modificateurs dépendent de davantage de conditions que cet orchestrateur volontairement limité. Il faut donc le qualifier de **sous-ensemble expérimental du moteur Jactari**, non d'une implémentation historiquement équivalente.

**Suite prioritaire :** exécuter et corriger si nécessaire les 350 vérifications différentielles, constituer des fixtures complètes issues du client d'origine, puis isoler les sorts, les pertes permanentes et la gestion exacte des combats au-delà des simples duels.


## V5.4 — Extraction des pertes permanentes et d'un effet magique (23/10/2026)

**Deux modules supplémentaires ont été commités :**

- `losses.mjs` — `casualtyModifier()` et `finalizePermanentLosses()` : adaptation de la partie finale de `simulation_rencontre` dédiée au ratio de morts permanentes, aux effets des héros, aux morts relevés, à la résurrection limitée par un **budget de puissance partagé entre sept pelotons**, et au coût en or/ressources des pertes. Le calcul distingue les statuts PvP/PvE et les armées sans héros. Les paramètres `lossFactor`, taux de résurrection et données de chaque unité doivent être explicitement fournis. **Il ne s'agit pas de taux historiques certifiés pour S2.**
- `magic-revival.mjs` — `resolvePostDuelRevival()` : portage de la petite branche **après duel** de `simulation_rencontre` pour les modes de résurrection `tmp` et `def`, conservant les plafonds du tour et le sentinelle historique de pertes `-1`. **Le choix du sort, la puissance, le mana et les autres effets magiques ne sont pas portés.**

**18 cas de test supplémentaires ont été écrits** (12 pour les pertes, 6 pour l'effet magique). Ils sont versionnés dans `losses.test.mjs` et `magic-revival.test.mjs`. Leur exécution dans GitHub Actions **n'a pas pu être vérifiée dans cette intervention** ; ne pas annoncer 55 tests passants avant l'obtention du résultat CI. L'ensemble précédent annonçait 37 tests locaux validés, plus un test différentiel de 350 configurations dont l'exécution CI reste également à contrôler.

```bash
node --test tools/jactari-port/*.test.mjs
```

### Prochain raccordement nécessaire

Un combat a deux niveaux de pertes : **pertes/dispersion pendant les tours**, puis **morts définitives après les bonus, récupérations et résurrections**. Le rapport final doit les afficher séparément. L'orchestrateur `battle.mjs` **n'appelle pas encore automatiquement** les nouveaux modules, afin de ne pas calculer un résultat final historique lorsque la magie complète, les héros et les règles de fin de combat manquent. Les modules sont donc réutilisables mais constituent toujours **une implémentation partielle** de Jactari.


## Intégration du rapport de pertes — V5.5 (23 octobre 2026)

`report.mjs` expose `simulateBattleWithLossReport()`. Il appelle l'orchestrateur des **phases actuellement supportées** (salves puis mêlée ordonnée) et transmet les pertes de chaque peloton à `finalizePermanentLosses()`. Il construit un rapport structuré avec :
- événements de tir et de duel, puissance et dispersion ;
- pertes provisoires par slot, **sans compter deux fois les pertes des salves** ;
- pertes définitives après coefficient, compétence de héros, relèvement des morts et résurrection ;
- coût en or et ressources rares des morts définitives.

Le consommateur doit **fournir explicitement** le `lossPolicy.lossFactor` ; aucune valeur S2 n'est introduite par défaut. Les coefficients de bonus, les compétences et les coûts des unités restent des **données injectées** dont la provenance doit être validée.

```js
import { simulateBattleWithLossReport } from './report.mjs';
const result = simulateBattleWithLossReport({
  attackers: [{count:100,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null],
  defenders: [{count:50,weapon:'I',unitPower:10,goldCost:5},null,null,null,null,null,null],
  lossPolicy: { lossFactor: 0.25, source:'demonstration-only' }
});
console.log(result.permanent.attacker.totals);
```

Sept tests `report.test.mjs` sont ajoutés, couvrant la conversion, l'addition des salves, la résurrection, l'immuabilité et les rejets. **Le workflow CI doit encore confirmer leur passage.**

Limite critique : les **sorts généraux, résurrections pendant le combat, fuite, blessures et sièges** ne sont pas intégrés au rapport. Les fonctions `losses.mjs` et `magic-revival.mjs` sont disponibles séparément ; appliquer arbitrairement des effets en cours de combat fausserait la simulation complète. Les scénarios non supportés sont refusés. Cette API **n'est pas un arbitre de combat S2 certifié**.


## Extraction partielle de lancement_sorts — effets magiques (23/10/2026)

Nouveau module pur **`magic-effects.mjs`**, extrait de branches identifiées de `lancement_sorts(tour)` dans `data/Jactari/src/scripts/combat.min.js` :

- `resolveSingleTargetDamageSpell` : **type=0, cible=4, unité=1/3/7** ; dégâts par combattant, pourcentage de la puissance totale ou dégâts fixes ; plafonnement de puissance et `Math.floor` des unités éliminées.
- `resolveHeroDefenseDebuff` : **type=3, cible=6, unité=5/6** ; réduction brute ou proportionnelle de la défense modifiée du héros cible.
- `resolveAttackStackBuff` : **type=4, cible=5, unité=0/1/2/3** ; renfort de peloton à partir de la puissance effective du sort, avec arrondi inférieur.

**11 tests supplémentaires** : `magic-effects.test.mjs`, couvrant calcul des dégâts, plafonnement, arrondis, bonus et cas invalides.

Les entrées sont des **puissances de sort déjà calculées** : `puissance_effective_sort` (résistances, affinés, héros, artéfacts), la sélection de cible, l'ordre des sorts attaquant/défenseur, les effets de masse, la magie curative et le calendrier des tours ne sont pas encore portés. **Ces fonctions ne sont pas automatiquement appelées par `battle.mjs`**, qui refuse encore la magie ; cette séparation évite de simuler une bataille incomplète comme si elle était fidèle.

Exécuter `node --test tools/jactari-port/*.test.mjs` dans une copie locale du dépôt. Le succès CI des nouveaux tests et des tests différentiels historiques n'a **pas été établi** durant cette intervention.


## Calcul de puissance et ordonnancement des sorts (itération suivante)

Deux nouveaux modules **sans DOM ni jQuery** complètent l'extraction de `puissance_effective_sort` et `lancement_sorts` :

- `spell-power.mjs` : `calculateEffectiveSpellPower()` applique le facteur d'arme, la magie du héros, ses bonus d'expertise, les bonus d'école et d'artéfacts, la maîtrise selon le cercle, la résistance magique et l'antimagie. Les valeurs historiques dépendant des tables héritage, équipements et écoles sont **injectées explicitement**, pas inventées. Le découpage des barres HTML de statistiques du client d'origine est volontairement exclu.
- `spell-schedule.mjs` : `spellsForRound()` récupère les sorts programmés pour un tour donné, dans l'ordre attaquant puis défenseur du client Jactari ; `planSpellEffects()` vérifie les identifiants et refuse chaque type/cible/unité sans exécuteur enregistré.

**17 nouveaux tests versionnés** : 10 pour la puissance effective, 7 pour l'ordonnancement et les rejets. Ils doivent être exécutés par le workflow Node ; leur résultat CI n'est **pas vérifié** dans cette conversation.

Un lanceur de bataille complet nécessite encore de calculer les modificateurs via les données originales, de vérifier les contraintes de mana et de compétence, de résoudre tous les types de sorts, puis de brancher le déclenchement des sorts aux rounds de `encounter.mjs` et les résurrections aux rapports. À ce stade, les nouveaux modules fournissent des **primitives** ; `simulateSupportedBattle` continue de refuser `context.spells`.

Source : `data/Jactari/src/scripts/combat.min.js` (GPLv3+). Les paramètres `spell.power/factors/school/unit/circle/type` sont une normalisation explicite de `puissance/facteur/ecole/unite/cercle/type` dans les données historiques.
