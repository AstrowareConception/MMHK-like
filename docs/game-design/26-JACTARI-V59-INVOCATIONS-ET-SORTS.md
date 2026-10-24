# Jactari V5.9 — les invocations participent aux combats

**24 octobre 2026 · État : module JavaScript expérimental testé, publié sur `main`.**

## Objectif et provenance

Après avoir extrait `planSummoning()`, il fallait replacer les créatures invoquées dans le véritable ordre des pelotons de `simulation_rencontre` plutôt que de les représenter comme de simples renforts permanents. Source : `data/Jactari/src/scripts/combat.min.js`, fonctions `lancement_sorts`, `simulation_rencontre` et `controle_magie`.

Le calculateur Jactari est GPL-3.0-or-later : le module adapté conserve cette provenance. **Ce n'est pas une implémentation complète ni un moteur Ubisoft saison 2 validé.**

## 1. Neuf emplacements pendant le combat, sept après

Le moteur expérimental `tools/jactari-port/summoned-battle.mjs` contient :
- **0 et 1** : deux positions temporaires d'invocation, en dehors des sept pelotons classiques. Une première invocation occupe la position **1**, la suivante **0**, puis la sélection du peloton actif parcourt **0 à 8**. Une invocation en position 0 prend donc la priorité sur la position 1 et les pelotons ordinaires.
- **2 à 8** : les sept pelotons persistants du joueur, conservant leur ordre.
- Au tour prévu, l'attaquant peut invoquer, puis le défenseur ; les nouvelles unités participent à la mêlée du **même tour**. Les duels s'appuient sur les fonctions extraites `resolveStackDuel()` et `calculateBonuses()`.

L'invocation est définie comme `{type:1,target:0|1|2,unit:0|4,power}`. L'unité invoquée est la **première du catalogue** correspondant à l'arme ciblée et à la faction du héros. L'arme est `I`, `R` ou `C`, associée à la cible 0, 1 ou 2. L'indice de faction vient **exclusivement du contexte du héros**, jamais d'un champ transmis par un ordre client : ce garde-fou empêche une fausse invocation d'une autre faction.

La puissance de l'invocation peut être **absolue** (unité 0) ou représenter un **pourcentage de la puissance initiale des sept pelotons adverses** (unité 4). Le calcul et son arrondi restent gérés par `summoning.mjs`. La puissance effective du sort doit être préalablement validée par un calculateur de magie fiable.

### Limite explicitement refusée

Lorsque les deux emplacements d'invocation sont déjà occupés, une tentative supplémentaire est rejetée. Le Jactari ancien semble alors pouvoir **réécrire la position 0** ; cet écrasement historique n'a pas encore été reproduit ni comparé et ne doit pas être silencieusement activé.

L'orchestrateur **n'accepte que les sorts d'invocation**, sans dégâts de zone, buffs, résurrection, siège, mana ou retraite dans la même bataille. Les sous-systèmes existants restent indépendants jusqu'à leur fusion validée.

## 2. Des créatures temporaires, jamais ajoutées à la ville

`simulateSummonedMeleeEncounter()` enregistre une série `events` avec :
- apparition de la créature (`phase: 'summon'`, index spécial, effectif) ;
- affrontement de la créature (`phase: 'duel'`, pelotons d'attaque et de défense, pertes) ;
- composition `specialAtEnd` pour le rapport de bataille ;
- `discardedSummons` pour signaler que ces unités magiques **ne sont jamais sauvegardées dans les garnisons**.

`simulateSummonedBattleReport()` réutilise les calculs de pertes définitives Jactari déjà extraits, avec un `lossFactor` obligatoirement fourni. `persistentArmies` contient **uniquement les sept pelotons réels**, avec les effectifs initiaux diminués de leurs propres morts permanentes. Les invocations en positions 0 et 1 n'y figurent jamais. Le coût de remplacement des pertes de vrais soldats est isolé.

## 3. Préparation des sorts : règles réellement visibles dans le client

`tools/jactari-port/spell-eligibility.mjs` porte les règles de sélection visibles dans `controle_liste_sorts`, `controle_magie` et `controle_liste_tours_magie` :

- le héros doit être présent et appartenir à un **archétype disposant de magie** ;
- les écoles proposées doivent appartenir à celles de la **faction** ;
- le premier menu propose les sorts disponibles jusqu'au **cercle 5**, alors que le second limite son catalogue selon le niveau des **Arcanes** et exclut le premier sort ;
- les deux sorts préparés doivent être distincts et affectés à des **tours différents entre 1 et 14**.

Cette asymétrie entre le premier et le deuxième menu est conservée parce qu'elle apparaît dans le code d'interface Jactari. **Ce n'est pas encore une règle métier serveur historiquement certifiée.** Le client communautaire inspecté ne contient pas de mécanisme de **réserve de mana** identifiable : aucun coût de mana n'a donc été inventé. La validation des sorts côté backend devra distinguer ce qu'autorise le client Jactari de ce qui était réellement exigé par MMHK S2.

## 4. Validation exécutée

**107 tests Node.js non différentiels réussis** sur la copie locale de l'archive V5.8 enrichie avec les nouveaux modules, dont **20 nouveaux tests** (13 pour les invocations et la protection de faction, 7 pour les choix de sorts).

Tests représentatifs : placement d'une invocation en slot 1 puis 0 ; priorité de l'invocation au prochain duel ; invocation par le défenseur ; calcul relatif à l'armée ennemie ; refus d'un troisième slot occupé ; faction fournie uniquement par le héros ; immutabilité de l'entrée ; absence de créature magique dans les stocks sauvegardés, y compris **lorsqu'elle est encore vivante à la fin du combat** ; cercle, école et tours de magie.

Le résultat du modèle sur une fixture de démonstration synthétique :

| Mesure | Résultat |
| --- | ---: |
| Attaquant initial | 100 unités |
| Défenseur initial | 50 unités |
| Unités invoquées par l'attaquant en position 1 | 20 |
| Tours de duel | 2 |
| Invocation à la fin | 0 unité, **écartée du registre persistant** |
| Morts définitifs attaquant | 7 |
| Morts définitifs défenseur | 12 |
| **Armées persistantes** | **93 / 38 unités** |

Le coefficient de pertes **25 %** est une valeur fictive injectée uniquement pour la démonstration, non un barème Ubisoft. Voir [résultats structurés](../../data/analysis/jactari-v59-summons-2026-10-24.json).

**Limites de validation :** le ZIP local ne contient pas le gros fichier source du calculateur original ; les tests différentiels à la source Jactari sont donc exclus des 107 tests. Les **1 700 comparaisons directes** précédemment réussies portaient sur d'autres primitives, pas sur cette nouvelle orchestration des invocations. Le statut réel de GitHub Actions reste à vérifier.

## Commandes et livrables

Depuis le dépôt `MMHK-like` :

```bash
node --test tools/jactari-port/summoned-battle.test.mjs tools/jactari-port/spell-eligibility.test.mjs
node --test tools/jactari-port/*.test.mjs
```

Code : [summoned-battle.mjs](../../tools/jactari-port/summoned-battle.mjs), [summoned-battle.test.mjs](../../tools/jactari-port/summoned-battle.test.mjs), [spell-eligibility.mjs](../../tools/jactari-port/spell-eligibility.mjs), [spell-eligibility.test.mjs](../../tools/jactari-port/spell-eligibility.test.mjs).

Archive locale complète de cette intervention : `MMHK_Jactari_V59_invocations_2026-10-24.zip`, avec les modules, les tests, le journal de validation et la fixture.

## Suite logique

1. Construire **un orchestrateur unique** des neuf positions qui enchaîne invocations, dégâts, buffs, malus, résurrections et mêlée selon la séquence exacte Jactari.
2. Réaliser **des tests différentiels de batailles entières**, avec sorties de Jactari en référence et comparaison du journal, du résultat et de chaque catégorie de pertes.
3. Extraire puis valider les **conditions d'apprentissage et d'accès aux sorts** du jeu S2 (par opposition à l'interface communautaire), les effets manquants, les invocations répétées, la fuite et le siège.
4. Respecter la **licence GPL** avant toute redistribution du composant dérivé ; intégrer au serveur seulement lorsque sa portée de règles sera suffisamment validée.

**Décision :** ne pas créer de règle de mana sans preuve, ne pas faire persister d'unités magiques dans la ville et ne pas annoncer une conformité Jactari globale à partir de tests de composants.
