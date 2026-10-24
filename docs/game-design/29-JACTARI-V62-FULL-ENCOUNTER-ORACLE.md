# Jactari V6.2 — Exécution headless des fonctions historiques complètes

**24 octobre 2026 — pipeline historique et tests différentiels publiés sur `main`.**

## Résultat

V6.1 comparait des **séquences reconstruites** de duels avec la seule fonction historique `simulation_combat(tour)`. V6.2 exécute enfin **ensemble les trois fonctions du fichier Jactari original** :

- `simulation_rencontre()` : boucle d'entrée, tours, sélection des pelotons, rapport de pertes définitives et expérience ;
- `lancement_sorts(tour)` : sorts des deux camps, invocations, dégâts, buff/debuff, préparation des résurrections ;
- `simulation_combat(tour)` : résolution originelle du duel et dispersion.

Le fichier original `data/Jactari/src/scripts/combat.min.js` est lu et ses fonctions sont extraites puis exécutées sans réécriture dans un contexte `node:vm`. Le simulateur de DOM ne reproduit que les méthodes jQuery effectivement utilisées, pour capturer le compte rendu sans navigateur. Des wrappers autour **des frontières de fonctions**, et non autour de leur arithmétique interne, enregistrent événements et états avant/après tour. Le tableau `#pertes tbody` historique est interprété pour établir le nombre de morts définitives **par position régulière**, sans inférer les décès à partir des seuls combattants dispersés.

### Nouveaux modules

| Fichier | Rôle |
| --- | --- |
| [`historical-encounter-harness.mjs`](../../tools/jactari-port/historical-encounter-harness.mjs) | Exécuteur headless du véritable orchestrateur, lanceur de sorts et fonction de duel Jactari |
| [`historical-encounter-differential.mjs`](../../tools/jactari-port/historical-encounter-differential.mjs) | Comparateur des événements, tours, puissances, états, héros, invocations et morts définitives |
| [`historical-encounter.test.mjs`](../../tools/jactari-port/historical-encounter.test.mjs) | Sept batailles sans magie et trois tests d'intégrité/refus |
| [`historical-magic-differential.test.mjs`](../../tools/jactari-port/historical-magic-differential.test.mjs) | Douze batailles magiques ciblées et test d'immuabilité/rejeu |
| [`historical-full-seeded.test.mjs`](../../tools/jactari-port/historical-full-seeded.test.mjs) | 100 batailles multi-pelotons à sorts bilatéraux, graine xorshift 20261024 |
| [`historical-multiturn-magic.test.mjs`](../../tools/jactari-port/historical-multiturn-magic.test.mjs) | Six rencontres avec sorts au deuxième tour, doubles invocations et résurrections différées |

Exécution : `node --test tools/jactari-port/*.test.mjs`.

## Matrice de validation

| Dimension | Comparaison | Résultat |
| --- | --- | --- |
| Séquence de combat | Nombre de duels, numéro de tour, emplacement attaquant/défenseur | Conforme dans les scénarios exécutés |
| Calcul de duel | Puissance initiale, pertes, survivants, égalité et faux-nul | Conforme dans les scénarios exécutés |
| Magie | Lancements des deux camps, tours, modification du duel et état final des unités | Conforme dans les scénarios exécutés |
| Invocations | Deux slots spéciaux 1 puis 0, effectifs et comportement de combat | Conforme dans les scénarios exécutés |
| Ressuscitations | Temporaire et définitive, sort programmé tour 1 ou tour 2, effets sur pertes | Conforme dans les scénarios exécutés |
| Comptabilité | Morts définitives par peloton régulier, séparées des pertes de mêlée et de magie | Conforme dans les scénarios exécutés |
| Héros | Statistiques du contexte et effets utiles aux scénarios | Conforme dans les scénarios exécutés |
| Admission PvP et PvE / fuite / blessures | Non compris dans les scénarios `full-encounter` | **Non validé** |
| Fortifications historiques, engins de siège et bonus originaux complets | Les bonus sont injectés par l'adaptateur commun | **Non validé** |
| Tables originales d'unités, puissance effective originale des sorts, mana, accès à la magie, XP détaillée | Tables/propriétés simplifiées dans le shim | **Non validé** |
| Troisième invocation, réactions spécifiques ou états non couverts par V6.0 | Hors corpus validé | **Non validé** |

Les résultats « conforme » ne valent **que pour les fixtures exécutées et leurs configurations**, pas pour l'ensemble des mondes et règles MMHK saison 2.

## Écart de représentation expliqué

Un test de résurrection temporaire a identifié une différence entre les **représentations** finales. L'original retire les unités ressuscitées temporairement directement de son `nombre_restant` avant l'affichage final. Le moteur unifié conserve le `battlefield.*.remaining` post-duel et projette le véritable résultat de fin de combat dans `terminalDisplay.displayed`.

Le comparateur V6.2 utilise cette projection pour vérifier la fin de bataille historique, tout en comparant à part les pertes et statistiques brutes. **Pas de changement du modèle de persistance ni de perte définitive requis** : les calculs concordent.

Un test génératif a également découvert un défaut **du premier shim de référence**, qui recherchait la puissance d'un sort de zone du défenseur selon l'arme du défenseur au lieu de l'arme de la cible attaquante. Correction de l'adaptateur, sans modification du moteur métier.

## Vérification CI

Après ajout de ces tests, **236 tests Node.js réussis sur 236, zéro échec**, dans la [CI GitHub Actions #40070465252](https://github.com/AstrowareConception/MMHK-like/actions/runs/40070465252) (commit `3eab22e64bb515469c4b8bfae6ca684cfcd5d6a9`). La modification ultérieure de nettoyage de code ne change pas les résultats métiers ; consulter la CI la plus récente pour la validation du dernier commit.

Par rapport aux **206 tests V6.1**, la V6.2 ajoute **30 tests `node:test`**, dont l'un rejoue 100 batailles générées. Ces 100 batailles, les 12 fixtures magiques et les 6 cas de second tour représentent des exécutions historiques différentielles, **pas** des captures d'un serveur Ubisoft en fonctionnement.

Les scénarios utilisent `lossFactor: 0.25` comme **coefficient fictif commun** ; ce chiffre n'a pas été identifié comme une règle MMHK saison 2. Le comparateur ne valide pas l'origine des coûts, des unités ou des talents : le catalogue et la puissance des sorts sont injectés pour exercer la mécanique de combat.

## Périmètre d'usage — barrière impérative

Le shim d'exécution historique sert **uniquement aux tests locaux/CI**, jamais aux requêtes serveur. `node:vm` isole les variables et facilite la reproductibilité, mais ne constitue pas une garantie de confinement de code hostile. N'y charger que le fichier historique versionné et révisé. Les sources et adaptations du calculateur historique demeurent sous **GPL-3.0-or-later**.

Le moteur unifié est toujours **expérimental**, sans validation de l'admission PvP/PvE, de toutes les règles d'armes/talents, du siège et des périodes de saison. Il ne doit **pas** être déployé comme arbitre PvP.

## Suite proposée : V6.3

1. Isoler les branches **d'admission** de `simulation_rencontre()` : détection du PvE trop faible (fuite), captures/blessures PvP, et leurs effets transactionnels, en construisant d'abord les références historiques pour chaque frontière.
2. Alimenter progressivement le shim avec les **vrais catalogues** Jactari présents dans `data/Jactari/src/scripts/donnees.*.min.js`, et réconcilier sans tricher les différences saison 2.
3. Exécuter `puissance_effective_sort()` et `bonus_attaque_defense()` originaux avec de vrais héros et avantages contextuels, pour supprimer les deux stubs arithmétiques majeurs.
4. Compléter les phases de siège et les cas magiques non couverts, tester les cohérences économiques/XP, puis seulement ouvrir le raccordement à un moteur serveur transactionnel.

**Ne pas confondre « les fixtures passent » avec « Jactari est intégralement porté ».** La V6.2 établit une voie d'essai fiable et reproductible vers la conformité ; elle n'est pas encore une certification exhaustive.
