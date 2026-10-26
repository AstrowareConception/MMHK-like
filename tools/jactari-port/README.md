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


## Exécution partielle des sorts dans les tours — `magic-encounter.mjs`

Le nouvel orchestrateur `simulateAttackerMagicEncounter()` permet enfin à un **sort offensif de l'attaquant** de modifier le peloton actif **avant le duel du même tour**. Deux sous-ensembles du Jactari historique sont pris en charge : `type=0/cible=4/unité=1,3,7` pour des dégâts magiques ciblés, et `type=4/cible=5/unité=0,1,2,3` pour un renfort de puissance/effectif du peloton attaquant. Les valeurs de puissance sont **déjà résolues** par l'appelant ; le calculateur des résistances et du héros `spell-power.mjs` est une autre brique à raccorder.

Le module enregistre un **journal ordonné** : événement de sort, puis événement de duel si des combattants subsistent ; il garde les pertes magiques dans `magicLosses` séparément de `roundLosses`, et les renforts `bonusTroops` de `bonusLost`. Il refuse à l'avance tout effet non pris en charge et échoue explicitement pour un sort programmé sur un tour qui ne peut pas être atteint.

**Tests :** huit cas locaux exécutés, huit réussis, pour dégâts avant duel, destruction sans duel, bonus d'unités, deuxième tour, effet inconnu, tour inatteignable, immutabilité et déterminisme. Tests versionnés dans `magic-encounter.test.mjs`.

**Limite impérative :** ce moteur **n'exécute pas les sorts du défenseur**, les zones, les résurrections durant le combat, les coûts de mana, les conditions d'accès aux sorts, ni l'application complète des sorts qui changent les caractéristiques d'un héros. Il ne remplace **pas** `battle.mjs` ni `report.mjs` et ne prétend pas produire un bilan définitif conforme à toutes les variantes S2. Les sorts restent pré-paramétrés et non résolus à partir de l'inventaire et des compétences.

Utilisation : `node --test tools/jactari-port/magic-encounter.test.mjs` (Node 22+). Code dérivé identifié GPL-3.0-or-later.


## Nouvelle tranche — magie des deux camps, zones et pertes définitives

La génération suivante met fin à la restriction « sorts de l'attaquant uniquement » **sur un sous-ensemble défini du lanceur historique**. Deux API nouvelles, toutes deux sans DOM :

- `magic-rounds.mjs` : `simulateDualMagicEncounter({ attackers, defenders, attackerSpells, defenderSpells, context })`. À chaque tour, le sort de **l'attaquant**, puis celui du **défenseur**, intervient avant le duel. Les pelotons restent ordonnés sur 7 slots.
- `magic-report.mjs` : `simulateDualMagicBattleReport({ ..., lossPolicy })`. Transforme les pertes magiques et de mêlée **une seule fois** en pertes définitives, en appelant `losses.mjs`, avec récupération, résurrection de fin de bataille et facture de remplacement.

### Sous-ensemble magique réellement interprété

| Phase | Sort Jactari | Parties admises |
| --- | --- | --- |
| Dégâts ciblés | `type=0, cible=4` | unités 1, 3 et 7, pour chaque camp |
| Dégâts de zone | `type=0, cible=3` | unités 1 et 3, **puissance pré-calculée par arme** via `powerByWeapon: { I, R, C }` |
| Renforcement du camp lanceur | `type=4` | cible 5 pour l'attaquant, 6 pour le défenseur, unités 0–3 |
| Affaiblissement de héros ennemi | `type=3` | cible 6 du défenseur par l'attaquant, cible 5 de l'attaquant par le défenseur, unités 5 et 6 |

Lors d'un sort de zone, le code historique recalcule la puissance effective **pour chaque arme cible**. C'est pourquoi la nouvelle API exige `powerByWeapon` : **une puissance uniforme implicite serait historiquement incorrecte**. La puissance effective est obtenue ailleurs, notamment grâce au calcul partiellement extrait dans `spell-power.mjs`. Toutes les valeurs injectées doivent être sourcées et versionnées.

Les pelotons conservent distinctement `magicLosses`, `roundLosses`, `bonusTroops`, `bonusLost` et `remaining`. Les caractéristiques modifiées des héros sont enregistrées dans une **copie de contexte** ; l'entrée de l'appelant n'est pas modifiée. Des ordres de sort non reconnus, des puissances manquantes ou des tours de sort inatteignables provoquent une erreur explicite.

### Exemple API

```js
import { simulateDualMagicBattleReport } from './magic-report.mjs';

const attackers = [{ count:100, weapon:'I', unitPower:10, goldCost:5 },
  null,null,null,null,null,null];
const defenders = [{ count:80, weapon:'I', unitPower:10, goldCost:5 },
  null,null,null,null,null,null];

const result = simulateDualMagicBattleReport({
  attackers, defenders,
  attackerSpells: { 1: { type:0, target:4, unit:7, power:100 } },
  defenderSpells: { 1: { type:4, target:6, unit:3, power:25 } },
  lossPolicy: { lossFactor:0.25, source:'demonstration-not-historical' },
});
console.log(result.encounter.events);
console.log(result.permanent.defender.totals);
```

### Tests exécutés et limites

**20 nouveaux tests locaux réussis** (15 pour les rounds, 5 pour le rapport) ; la suite locale avec les archives antérieures donne **59 tests réussis**, sans compter les autres suites du dépôt qui n'étaient pas présentes dans ces archives. Vérification effectuée avec Node.js 22.16.0. **Cela ne prouve pas que GitHub Actions ait réussi** : aucun statut CI n'a été obtenu.

Ce portage est un **sous-ensemble déclaré** : il ne simule toujours pas le mana, les contraintes de lancement et de niveau du héros, la table complète des sorts, la magie de résurrection pendant le duel, les effets de morale et de contrôle non couverts, les sièges, la fuite ni les blessures. Il ne se substitue donc **pas** à `battle.mjs` pour les combats sans magie et ne doit pas servir d'arbitre S2 de production.

De plus, **aucun test différentiel de ces nouveaux effets contre le Jactari original exécuté n'a encore été obtenu**. La conformité du calcul dans ces branches reste à confirmer grâce à un banc exécutant la référence communautaire.

Sources à rapprocher : `lancement_sorts`, `simulation_rencontre` et `puissance_effective_sort` dans `data/Jactari/src/scripts/combat.min.js`. Le code adapté conserve la provenance et la licence **GPL-3.0-or-later**.


## V5.7 — Résurrection pendant les tours, comparaison originale et armées persistantes (24/10/2026)

Le portage avance sur les branches **`sort.type = 2`, `sort.unite = 2`** de `lancement_sorts` :
- **`sort.cible = 8`** : relever temporairement des troupes (`rez = 'tmp'`) en fonction des pertes du duel et du pourcentage de puissance de sort.
- **`sort.cible = 9`** : relever définitivement des troupes (`rez = 'def'`) en fonction des survivants et décrémenter les pertes enregistrées du peloton.

La déclaration du sort intervient avant le duel ; **l'application du relèvement suit le duel**, avec plafond sur l'effectif au début du tour. Le support est symétrique attaquant/défenseur. La fonction `resolvePostDuelRevival()`, déjà présente dans `magic-revival.mjs`, est raccordée à `simulateDualMagicEncounter()`.

### Comptabilité des morts et restitution de l'armée

`magic-report.mjs` propage désormais `raisedDuringBattle` au calcul final `finalizePermanentLosses()`. Le rapport `persistentArmies` projette **effectifs originaux − pertes définitives** : il ne réintroduit pas dans le jeu des troupes temporaires générées au cours de la bataille. Un résultat impossible (plus de morts permanentes que de troupes initiales) provoque une erreur explicite au lieu d'un effectif négatif.

**Point ouvert** : le client Jactari contient un traitement particulier du retrait des résurrections temporaires du dernier peloton gagnant. Cette restitution par armée persistante est une **barrière d'intégrité du serveur**, pas une démonstration d'équivalence avec toutes les branches de clôture Jactari ; à vérifier par rapports complets. Les informations de `encounter.attacker/defender.remaining` sont des **effectifs pendant la bataille**, et non les effectifs à sauvegarder.

### Validation

Le banc local a exécuté **72 tests réussis**, dont **12 nouveaux scénarios** d'intégration (résurrection des deux camps, plafond, corps dispersé, intégrité des pertes et effectifs persistants) et un test comparant **350 combinaisons numériques** de modes et de taux à la transcription de la branche arithmétique originale. Le fichier `magic-revival-differential.test.mjs` présent dans le dépôt extrait directement cette même branche du **fichier historique original** sous `data/Jactari/src/scripts/combat.min.js`, puis l'exécute dans un contexte isolé `node:vm`. Sa propre exécution CI sur le dépôt distant reste **à vérifier**.

Les 72 tests sont issus d'un banc local reconstruit à partir de la dernière archive de code, des nouveaux modules et de l'extrait numérique ; la parité globale de l'ensemble du dépôt et les autres suites différentielles n'est **pas** établie.

```bash
node --test tools/jactari-port/*.test.mjs
```

### Limites inchangées

Mana, disponibilité des sorts, tous les types magiques, restauration des invocations, effets de fin de combat et blessures de héros restent hors périmètre. Le coefficient `lossPolicy.lossFactor` n'est toujours **pas une valeur S2 vérifiée**. Ce code adapté de Jactari est identifié **GPL-3.0-or-later** ; ne pas le fusionner sans revue de licences dans un moteur propriétaire.


## V5.8 — Fin du combat et invocations hors formation (24/10/2026)

Deux primitives issues du client Jactari d'origine complètent le portage :

- [terminal-cleanup.mjs](terminal-cleanup.mjs) : `projectTerminalTemporaryRevival()` distingue la résurrection temporaire du **dernier peloton gagnant** de l'effectif affiché en fin de combat. `magic-rounds.mjs` expose maintenant `terminalDisplay` et `terminalCleanup`, sans modifier ni les pelotons au cours du combat ni `persistentArmies`. Les résurrections programmées lorsqu'il n'y a plus de duel sont explicitement rejetées.
- [summoning.mjs](summoning.mjs) : `planSummoning()` reproduit la sélection du premier type d'unité correspondant à la **faction** et à l'**arme** (indices cible 0=I, 1=R, 2=C confirmés dans `donnees.sorts.min.js`), ainsi que les puissances d'invocation absolues (`unite=0`) ou relatives (`unite=4`). Il préserve les positions **spéciales 1 puis 0**, situées hors des **sept positions permanentes 2–8**. Le module prépare l'invocation mais ne l'insère pas encore dans le combat.

La validation réelle effectuée comprend **87/87 tests Node non différentiels** sur le banc local (issu de V5.7 et des nouveaux modules). La comparaison **directe aux fonctions historiques** a couvert **350 duels, 350 calculs de résurrection et 1 000 nettoyages de fin de bataille, avec zéro divergence** sur ces sous-fonctions. Le [test historique de clôture](terminal-cleanup-differential.test.mjs) est committé pour rejouer les 1 000 cas contre `data/Jactari/src/scripts/combat.min.js`.

**À ne pas confondre :** cette vérification des sous-routines n'est **pas** une parité globale des batailles Jactari. La branche de terminalisation demeure une projection du rapport, pas un changement du registre persistant des armées. Les invocations ne sont pas intégrées aux tours, les prérequis de mana et la majorité des sorts restent partiels. **Le succès de la CI GitHub n'est pas confirmé**. Les modules adaptés sont sous **GPL-3.0-or-later**, comme leur source.

Voir [rapport V5.8](../../docs/game-design/25-JACTARI-V58-CLOTURE-INVOCATIONS.md) et [résultats structurés](../../data/analysis/jactari-v58-differential-2026-10-24.json).


## V5.9 — Invocations actives, slots spéciaux et prérequis de l'interface (24 octobre 2026)

- `summoned-battle.mjs` expose `simulateSummonedMeleeEncounter()` et `simulateSummonedBattleReport()` : le moteur différencie **deux emplacements spéciaux historiques 0/1** et les **sept slots réguliers 2 à 8**. Une invocation apparaît sur le slot 1, puis sur le 0 si elle se répète, et les unités invoquées participent aux duels de ce tour selon l'ordre de parcours Jactari (0→8). Elles sont **toujours rejetées du registre persistant** à la fin, même lorsqu'elles survivent au combat.
- `summoned-battle.test.mjs` : **13 tests exécutés** sur les invocations des deux camps, les deux emplacements, la puissance relative à l'armée adverse, le rapport de pertes et la sécurité de la faction. **La faction est fournie par le héros dans `context`, pas par l'ordre de sort.**
- `spell-eligibility.mjs` : filtres de `controle_liste_sorts` et `controle_magie` selon les **écoles de la faction**, le cercle des **Arcanes** pour le deuxième sort, les possibilités magiques de l'archétype, deux sorts distincts et deux tours distincts entre **1 et 14**. Le premier menu n'est pas filtré par Arcanes dans le client Jactari ancien : ce comportement d'interface est documenté, **pas nécessairement à conserver comme règle métier S2**.
- `spell-eligibility.test.mjs` : **7 tests exécutés**.

**Résultat local : 106/107 tests non différentiels réussis**, sur la copie locale des composants ; le résultat GitHub Actions n'est pas confirmé. Aucune donnée de mana n'a été trouvée dans le fichier client examiné : **ne pas en inventer les coûts**, ni déduire pour autant l'absence de mana dans tout MMHK S2.

**Limitation principale** : ce chemin gère des **invocations seules** en mêlée, pas encore des invocations combinées à tous les autres types de sorts. Il refuse un troisième emplacement occupé plutôt que de reproduire un éventuel remplacement du slot 0 d'origine. La puissance magique reste pré-résolue. Les pertes permanentes reposent sur un `lossFactor` injecté et le moteur n'est **pas encore un arbitre S2 certifié**.

Rapport : [Jactari V5.9](../../docs/game-design/26-JACTARI-V59-INVOCATIONS-ET-SORTS.md) · [Résumé des tests](../../data/analysis/jactari-v59-summons-2026-10-24.json). Modules adaptés identifiés **GPL-3.0-or-later**.


## V6.0 — Orchestrateur unifié des mécanismes supportés (24 octobre 2026)

**Nouvelle entrée recommandée pour les laboratoires :**
[`unified-battle.mjs`](unified-battle.mjs), exportée dans [`index.mjs`](index.mjs).

Une unique fonction `simulateUnifiedBattle()` relie :
**salves initiales simultanées → neuf emplacements de combat (deux invocations + sept pelotons) → sorts préprogrammés de l'attaquant et du défenseur (dégâts ciblés/de zone, buffs, debuffs, invocations, résurrections post-duel) → duels → bilan final → armées persistantes.**

Les sorts du défenseur peuvent toucher une invocation apparue au **même tour**. La faction d'invocation vient du héros, l'ordre de lancement est conservé, et le journal sépare chaque phase. Les invocations sont toujours retirées des effectifs sauvegardés. Le rapport exige une politique explicite `lossPolicy` : aucune perte saison 2 non démontrée n'est présumée.

**Validation locale : 128 tests exécutés et réussis**, dont **21 tests** du nouvel orchestrateur (un test à **180 campagnes déterministes** et 20 vérifications fonctionnelles). La suite locale utilisée vient du ZIP V5.9 et n'inclut pas la grosse source Jactari originale : **les tests différentiels source complets, ni la CI GitHub distante, n'ont été vérifiés par ce chiffre**.

Commande recommandée sur une copie complète du dépôt :
```bash
node --test tools/jactari-port/unified-battle.test.mjs
node --test tools/jactari-port/*.test.mjs
```

**Ce module reste expérimental**, et ne remplace pas automatiquement les anciens adaptateurs séparés pour les cas qu'il refuse. Les cas de magie interrompant un duel, le troisième slot d'invocation, les héros vaincus, la fuite, les sièges, la disponibilité réelle des sorts et la **parité sur des batailles entières** restent à traiter. Les fichiers dérivés conservent la licence **GPL-3.0-or-later**.

Voir [le rapport V6.0](../../docs/game-design/27-JACTARI-V60-UNIFIED-BATTLE.md) et [la fixture de combat mixte](../../data/analysis/jactari-v60-unified-battle-demo-2026-10-24.json).


## V6.1 — Séquences multi-tours confrontées au véritable duel Jactari (24 octobre 2026)

Le nouveau [banc différentiel multi-tours](full-round-differential.test.mjs) invoque le **`simulation_combat(tour)` original** du fichier `data/Jactari/src/scripts/combat.min.js`, isolé dans `node:vm`, avec une boucle de pelotons reconstituée par [`legacy-sequence-oracle.mjs`](legacy-sequence-oracle.mjs). Le [comparateur](battle-differential.mjs) vérifie tour, positions, pertes, effectifs, dispersion, puissances, égalité, faux-nul et stocks des pelotons réguliers. Le corpus couvre **10 cas nommés + 180 scénarios déterministes**, sans magie ni salves.

**Validation GitHub Actions effective : [206 tests réussis, 0 échec](https://github.com/AstrowareConception/MMHK-like/actions/runs/40069106325).** Cette suite comprend 15 nouveaux tests Node, dont un test de 180 batailles. Elle a aussi confirmé la réparation de deux défauts antérieurs : le rapport historique `report.mjs` omettait par erreur les pertes des duels, et `terminal-cleanup-differential.test.mjs` évaluait un `return` illégal au niveau script.

Les bonus utilisés sont issus du **même adaptateur partagé**, et la boucle est **reconstruite** : ceci ne prouve **pas** la fidélité du calculateur intégral `simulation_rencontre()`. La prochaine étape est son exécution et celle de `lancement_sorts()` via un adaptateur headless, puis le rapprochement des journaux de batailles mixtes, des morts définitives et des branches spéciales. Ne pas utiliser le moteur comme arbitre S2 de production.

Voir le [rapport de V6.1](../../docs/game-design/28-JACTARI-V61-HISTORICAL-SEQUENCE-DIFFERENTIAL.md) et les [résultats structurés](../../data/analysis/jactari-v61-historical-sequence-differential-2026-10-24.json). Licence et attribution Jactari : **GPL-3.0-or-later**.


## V6.2 — Exécution headless du véritable orchestrateur historique (24 octobre 2026)

[`historical-encounter-harness.mjs`](historical-encounter-harness.mjs) exécute désormais **les fonctions originales** `simulation_rencontre()`, `lancement_sorts()` et `simulation_combat()` depuis la source communautaire versionnée, avec une façade jQuery de test et un catalogue/une politique de puissance de sorts **explicitement injectés**. Le [comparateur sémantique](historical-encounter-differential.mjs) contrôle la succession des tours, les salves de sorts, les duels, les neuf emplacements, les résurrections et les morts définitives lues dans le vrai compte rendu.

Scénarios : **7 rencontres sans magie, 12 avec magie, 100 générées et 6 avec sorts au second tour**, soit **30 nouveaux tests Node.js** (dont un générateur de 100 combats). [CI GitHub Actions 236/236 réussis](https://github.com/AstrowareConception/MMHK-like/actions/runs/40070465252) — zéro échec. Le port conserve `battlefield` avant nettoyage de la résurrection temporaire et expose le résultat final via `terminalDisplay` : cette projection est la bonne donnée à comparer à l'affichage final Jactari.

**Limite majeure :** les unités, la puissance effective magique, les bonus et le facteur de pertes sont injectés. PvE, fuite, blessure/capture, sièges et troisième invocation ne sont pas validés. Ce harness est **un oracle de test borné**, pas un service serveur ni une preuve de conformité exhaustive à MMHK S2. Code source original GPL-3.0-or-later ; ne pas exécuter de code historique externe non audité dans `node:vm`.

[Rapport technique V6.2](../../docs/game-design/29-JACTARI-V62-FULL-ENCOUNTER-ORACLE.md) · [Résultats archivés](../../data/analysis/jactari-v62-full-encounter-differential-2026-10-24.json).


## V6.3 — Parité des héros et admission contre le code original (26 octobre 2026)

**Conformité contrôlée sur le périmètre exécuté :** le [moteur original de calcul des bonus](historical-bonuses-oracle.mjs) est indépendant de [`calculateBonuses()`](bonuses.mjs). Le [banc de bataille historique](historical-encounter-harness.mjs) utilise désormais **le véritable `bonus_attaque_defense()`** durant les duels, au lieu de réutiliser les bonus de notre adaptateur. Le comparateur confronte les neuf coefficients de chaque duel, son résultat et les pertes définitives. Les tests couvrent **600 builds de héros** et **83 batailles avec héros, talents et fortifications**.

La [porte d'admission](admission-battle.mjs) gère les fuites PvE, captures, blessures PvP (6/12/18/24 heures) et refuse de facturer des morts lorsque le combat n'a pas eu lieu. **4 000 cas** sont vérifiés contre la branche originale de `simulation_rencontre()`. Les blessures et captures sont émises comme conséquences **à appliquer transactionnellement par le serveur**, jamais simulées comme un état déjà sauvegardé.

Le [calculateur de magie historique](historical-spell-power-oracle.mjs) contrôle **400 puissances effectives de sorts** avec les modificateurs du héros, du côté attaquant et défenseur, maîtrise, résistance et antimagie. Il n'a **pas encore validé les effets réels d'artefacts équipés** : ces entrées sont exclues explicitement. Le [profil Jactari 4.1.3-MTR](source-profile.mjs) lit directement les coefficients archivés (armes +50 %, pertes 30 %), utilisables seulement dans [`adjudicateJactariReferenceBattle()`](admission-battle.mjs) par opt-in. Ne pas les présenter comme paramètres S2 certifiés.

L'anomalie du bonus légendaire `bonus_legendary_legwarrior_b` est conservée en mode par défaut `heroPolicy:'jactari-original'` (double lecture anormale du héros attaquant, double addition de la valeur du défenseur). `heroPolicy:'normalized'` désigne une **correction volontaire non prouvée historiquement**. Les entrées non finies échouent sans produire de résultat militaire trompeur.

**Validation : 261 tests Node.js réussis, 0 échec**, [GitHub Actions #40294182227](https://github.com/AstrowareConception/MMHK-like/actions/runs/40294182227). [Rapport technique complet et limites](../../docs/game-design/30-JACTARI-V63-HEROS-ADMISSION-MODIFICATEURS.md) ; [preuves JSON](../../data/analysis/jactari-v63-hero-admission-differential-2026-10-26.json).

**Pas encore « 100 % MMHK saison 2 » :** équipement/artefacts, progression complète des héros, sièges, calculs de salves originaux, XP, groupes PvE et règles de saison restent à réconcilier et tester. Ne pas activer ce moteur comme arbitre serveur PvP avant résolution de ces écarts et revue de licence GPL.


## V6.4 — Artefacts réels, éligibilité des effets et puissance des sorts (26 octobre 2026)

Le [port des règles d'artefacts](artifact-spell-bonus.mjs) lit un inventaire **fiable et complet de slots** et le véritable catalogue Jactari pour filtrer chaque bonus magique selon école, cible, type, cercle, arme et niveau. [280 comparaisons](historical-artifact-differential.test.mjs) ont été effectuées en exécutant la **fonction originale** `bonus_magie_artefacts()` avec les tables `_artefacts`, `_effets`, `_types_effets_magie` et `_slots`.

[`calculateEffectiveSpellPower()`](spell-power.mjs) accepte maintenant un `artifactContext` et applique lui-même les bonus d'artefacts, sans autoriser leur addition à un pourcentage arbitraire. [120 sorts de héros équipés](historical-equipped-spell.test.mjs) ont été comparés à la vraie `puissance_effective_sort()` originale, qui invoque elle-même `bonus_magie_artefacts()`. Une première divergence provenait d'un oubli du champ historique `cible` dans le **banc de référence** ; il a été corrigé.

**[CI GitHub Actions #40295576832 : 267/267 tests réussis, zéro échec](https://github.com/AstrowareConception/MMHK-like/actions/runs/40295576832).**

**Limites :** le moteur unifié n'appelle pas encore automatiquement cette résolution magique à chaque tour. Certaines règles de progression, de sets d'artefacts, de siège et de héros restent non validées ; l'égalité complète avec **MMHK S2** n'est pas prouvée. Cette suite certifie uniquement les scénarios exécutés contre le calculateur communautaire d'origine. [Rapport V6.4](../../docs/game-design/31-JACTARI-V64-ARTEFACTS-ET-MAGIE-HEROS.md).


## V6.5 — Résolution dynamique des sorts et roadmap de conformité (26 octobre 2026)

La fonction `simulateUnifiedBattle()` accepte désormais en mode **expérimental opt-in** des ordres de sorts `{id: spellId}`, avec `spellContext` fourni exclusivement par une source **de confiance côté serveur**. Le module [`hero-spell-resolution.mjs`](hero-spell-resolution.mjs) vérifie les identifiants, les tours 1–14, l'unicité des sorts, leurs signatures autorisées et le catalogue versionné. Il calcule la puissance de chaque sort **au moment de son tour** en fonction du héros, de l'arme du peloton actif, de la résistance ennemie, de l'antimagie et des artefacts authentiques du lanceur. Les dégâts de zone ont une puissance distincte par arme. L'ancienne API à `power` explicite reste inchangée.

**Contrat illustratif — cet exemple utilise des fiches synthétiques et non une véritable construction de héros S2 :**

```js
import {simulateUnifiedBattle} from './index.mjs';
const heroA={faction:1,attaque_modifiee:0,magie:20};
const heroD={faction:2,defense_modifiee:0,magie:10};
const troop=count=>({count,weapon:'I',unitPower:10,goldCost:5});
const slots=count=>[troop(count),null,null,null,null,null,null];
const result=simulateUnifiedBattle({
 attackers:slots(100),defenders:slots(80),
 context:{attackerHero:heroA,defenderHero:heroD},
 attackerSpells:{1:{id:0}},
 spellContext:{
  catalog:[{school:3,circle:1,type:0,target:4,unit:7,power:1,
    factors:{I:1,R:1,C:1}}],
  attacker:{},defender:{}
 },
 lossPolicy:{lossFactor:.30,source:'DEMONSTRATION_NOT_S2'}
});
```

**Vérification :** [tests d'intégration V6.5](hero-spell-resolution.test.mjs), CI Node complète **276 tests réussis** au moment du raccordement. Pour garantir la **conformité à 100 %**, consulter systématiquement la [roadmap vivante](../../docs/game-design/32-ROADMAP-CONFORMITE-MOTEUR-COMBAT.md) et son [registre JSON avec barrières de certification](../../data/analysis/jactari-combat-conformance-roadmap.json).

**Limite :** `spellContext` contient pour le moment un snapshot héroïque déjà dérivé côté serveur. La construction automatique des caractéristiques à partir de l'archétype, des niveaux, talents, hérédité, objets, bonus de set et carrières relève de **V6.6**. La validation de cette chaîne entière contre le client Jactari et contre MMHK saison 2 reste ouverte. Ne pas accepter des statistiques de héros ou objets calculés par un client web comme vérité serveur.


## V6.6 (tranche 1) — Construire des héros depuis leurs données réelles (26 octobre 2026)

La [roadmap de conformité](../../docs/game-design/32-ROADMAP-CONFORMITE-MOTEUR-COMBAT.md) suit désormais C03 en **implémentation partielle** : l'éditeur original des héros (`maj_adm`, `maj_comp`, `equipe_artefact`) et la préparation originale des héros au combat (fragment de `maj_situation`) ont été exécutés dans les **oracles historiques distincts** pour vérifier les fonctions pures correspondantes.

Modules : [tables Jactari](hero-source-tables.mjs), [snapshot éditeur](hero-page-snapshot.mjs), [calcul des talents](hero-talent-bonuses.mjs), [snapshot combat](hero-combat-snapshot.mjs), [pont combats](hero-combat-battle.mjs). Les tests regroupent **310 fiches d'éditeur**, **150 sélections de talents**, **200 fiches de combat** et **6 contrôles d'intégration** au moteur unifié. Le résultat CI vérifié est **296/296 tests Node.js réussis** : [GitHub Actions](https://github.com/AstrowareConception/MMHK-like/actions/runs/40300003415).

Le pont de bataille **refuse les statistiques militaires calculées et l'inventaire magique forgés en arguments explicites** : les calculs viennent des profils et tables fournies par un composant serveur de confiance. Cette garantie est *locale à l'API* : elle **ne vérifie pas encore l'identité du joueur** ni le droit de posséder le héros ou les objets. Ne pas exposer ce point d'entrée directement au réseau.

**Très important :** `maj_adm` (éditeur de héros) et `maj_situation` (simulateur de combat) n'utilisent pas tous les mêmes arrondis, précédences héréditaires et bonus circonstanciels. Nos deux résultats restent donc volontairement distincts.

La V6.6 n'est pas close : la **légalité des carrières, le budget d'apprentissage, les liens Scribe/Arcanes, les classes légendaires, les hérédités alternatives, les sets et le contrôle côté serveur** ne sont pas démontrés exhaustivement. L'équivalence à **MMHK saison 2** ne peut pas être revendiquée. [Rapport V6.6](../../docs/game-design/33-JACTARI-V66-FICHES-HEROS-ET-COMBAT.md) et [preuves structurées](../../data/analysis/jactari-v66-derived-hero-differential-2026-10-26.json).


## V6.6 — Tranche 2 : carrières, talents et coût de progression

Le [calculateur de carrière](hero-career-progression.mjs) vérifie directement le droit d'accès selon faction et archétype, les trois emplacements sans doublon, le **point d'activation de chaque carrière**, les coûts de rangs cumulatifs `[0,1,3,6]` et la mutualisation des talents **Scribe / Maitre des arcanes**. La fonction `changeJactariCareerRank()` valide les promotions et remboursements de points sur un plan déjà cohérent.

La [référence indépendante](historical-career-oracle.mjs) réexécute `validite_carriere()` et `change_talent()` du `heros.min.js` historique. Les [tests différentiels](hero-career-progression.test.mjs) couvrent toutes les combinaisons de carrières des tables archivées, 170 acquisitions et 120 transitions de rang, ainsi que des scénarios ciblés de talents partagés.

[`hero-combat-battle.mjs`](hero-combat-battle.mjs) accepte maintenant facultativement `heroCareers:{attacker:[],defender:[]}` pour préparer les bonus du héros en vérifiant **en amont** les budgets historiques. Les carrières **non combattantes** continuent de coûter leurs points mais ne créent aucun bonus fictif. Le nouvel argument `heroCareers` ne peut pas coexister avec `heroTalents` (ancien format expérimental brut).

**CI : [306/306 tests passés](https://github.com/AstrowareConception/MMHK-like/actions/runs/40302654585).** Le périmètre reste une validation de l'état final des carrières et des transitions de rang couvertes ; **l'abandon, le remplacement de carrière, tous les états intermédiaires Scribe/Arcanes, les classes légendaires et la progression serveur authentifiée ne sont pas encore conformes à 100 %**.

[Rapport V6.6 — tranche 2](../../docs/game-design/34-JACTARI-V66-PROGRESSION-CARRIERES-TALENTS.md) · [Roadmap C03](../../docs/game-design/32-ROADMAP-CONFORMITE-MOTEUR-COMBAT.md).


## V6.6 — Tranche 3 : cycle de vie des carrières et remboursements

Le port [`hero-career-lifecycle.mjs`](hero-career-lifecycle.mjs) ajoute les opérations **`select`**, **`replace`** et **`abandon`** sur les emplacements de carrière, en calculant leur nouvel état final et les points rendus ou dépensés sans muter les entrées. Il traite explicitement le remplacement d'une carrière **par elle-même**, les rangs Scribe/Arcanes hérités d'autres carrières et le remboursement de leur dernier détenteur.

Le [banc historique](historical-career-lifecycle-oracle.mjs) exécute **`change_carriere()` et `desactive_carriere()` originaux non modifiés** depuis `heros.min.js` sous une façade de DOM contrôlée. [Tests](hero-career-lifecycle.test.mjs) : **60 scénarios de sélections/remplacements/abandons**, plus cas de restitution de talents de rang 3 et mutualisations. Le [contrôle des respecialisations](historical-respecialization.test.mjs) confronte également les limites de niveau et de tenancier aux fonctions historiques `change_respec()`/`change_tenancier()`.

**CI vérifiée : [313 tests réussis sur 313](https://github.com/AstrowareConception/MMHK-like/actions/runs/40306285724).** [Rapport V6.6 tranche 3](../../docs/game-design/35-JACTARI-V66-CYCLE-VIE-CARRIERES.md) · [preuves JSON](../../data/analysis/jactari-v66-career-lifecycle-differential-2026-10-26.json).

**Limite :** les contrôles portent sur des **états de carrière initialement cohérents**, pas sur toute l'interface d'édition ni sur chaque cas de divergence intermédiaire. Il reste à vérifier les classes légendaires, les prérequis et les contraintes d'état serveur. V6.6 = **en cours**, C03 = **implémentation partielle** ; aucun arbitrage multijoueur certifié.


## V6.6 — Tranche 4 : classes et talents légendaires

[`hero-legendary.mjs`](hero-legendary.mjs) lit **8 classes × 3 talents** dans `_talents[13..20]` (niveaux 0 à 3). Aucun bonus ni condition d'accès n'est inventé : les rangs sont les valeurs des tables Jactari. [`hero-combat-snapshot.mjs`](hero-combat-snapshot.mjs) calcule les attributs légendaires du héros et [`hero-combat-battle.mjs`](hero-combat-battle.mjs) les applique aux combats/magies.

La **sélection libre de l'outil Jactari** (`calculator-reference`) est distincte de la **vérification des droits serveur** (`server-entitlement`). Les appels `simulateBattleWithDerivedHeroes()` portant des `heroLegendaries` réclament un `heroLegendaryGrants` par camp, considéré comme issu de l'état serveur. Le vieux paramètre `heroTalents` rejette les talents légendaires : pas de contournement par liste brute.

Les tests exécutent **144 fiches légendaires** contre le fragment original de `maj_situation()`, **48 rencontres complètes** contre le moteur original et des comparaisons de puissance magique pour quatre écoles. La suite a été vérifiée à **[319/319 tests passants](https://github.com/AstrowareConception/MMHK-like/actions/runs/40316048810)**.

**Pas encore certifié :** l'outil de calcul ne prouve pas la légalité des accès aux classes légendaires pour un héros dans MMHK S2. Niveau minimum, prérequis, coût et cumul doivent être retrouvés auprès de sources indépendantes et appliqués par un serveur persistant. [Rapport et délimitations](../../docs/game-design/36-JACTARI-V66-CLASSES-LEGENDAIRES.md) · [corpus de preuves](../../data/analysis/jactari-v66-legendary-combat-differential-2026-10-26.json).
