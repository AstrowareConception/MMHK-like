# Jactari V5.8 — retrait des résurrections temporaires et calcul des invocations

**24 octobre 2026.** Cette tranche poursuit le portage de `simulation_rencontre` et `lancement_sorts` (sources communautaires Jactari, GPL-3.0-or-later), en isolant deux particularités de leur logique d'origine.

## 1. Clôture du dernier tour avec résurrection temporaire

Le Jactari historique distingue `rez='tmp'` et `rez='def'`. Dans la branche d'affichage final du **dernier peloton vainqueur**, il retire `rez_*_nombre` des `nombre_restant` lorsque la dernière résurrection du vainqueur est **temporaire** et concerne bien le peloton actif.

Nouveau module pur : [terminal-cleanup.mjs](../../tools/jactari-port/terminal-cleanup.mjs).

Il produit deux résultats sans muter la bataille :

- `displayed` : effectif final destiné au compte rendu, après retrait de la résurrection temporaire du dernier peloton gagnant seulement ;
- `cleanup` : événement explicatif (`side`, `slot`, `before`, `after`, `temporaryUnitsRemoved`), ou `null` lorsqu'aucune branche historique de clôture ne correspond.

L'orchestrateur [magic-rounds.mjs](../../tools/jactari-port/magic-rounds.mjs) conserve désormais le dernier sort de résurrection **par camp et par tour**. Lorsque la bataille se termine, il expose `terminalDisplay` et `terminalCleanup`. Le journal existant `events` reste compatible. Les états `attacker/defender.remaining` **ne sont pas modifiés** par cette projection. Les comptes de pertes définitives et `persistentArmies` sont toujours calculés séparément dans `magic-report.mjs`.

**Garde-fou** : si une résurrection est programmée mais qu'un sort précédent supprime toute possibilité de duel, ce sous-ensemble refuse explicitement la séquence, au lieu d'ignorer silencieusement la résurrection. Ces cas devront être confrontés plus tard au vrai calculateur complet.

### Exemple

Attaquant 100 unités contre défenseur 50, puissance unitaire 10. Une résurrection temporaire à 50 % après le duel relève 25 unités.

| Grandeur | Effectif |
| --- | ---: |
| Effectif du vainqueur dans l'état de combat juste après résurrection | 75 |
| Unités temporaires retirées pour l'affichage final historique | 25 |
| Effectif affiché en fin de combat | 50 |
| Effectif réellement conservé (avec `lossFactor=0,25` fictif) | 94 |

**50, 75 et 94 désignent trois valeurs différentes et utiles** : affichage final du combat historique, état du champ de bataille avant nettoyage, restitution économique durable de l'armée. Ne pas réécrire les stocks en fonction des deux premières.

Les tests couvrent également la victoire du défenseur, des résurrections des deux camps, un sort temporaire sur un tour antérieur, et l'absence de mutation des paramètres.

## 2. Les invocations ne sont pas des pelotons ordinaires

La fonction `lancement_sorts` originale traite les sorts de **type 1** sur les cibles 0, 1, 2 :

- Choisir la **première créature du catalogue** correspondant à la faction du héros et à l'arme ciblée ;
- `sort.unite=0` : puissance d'invocation exprimée en valeur absolue ;
- `sort.unite=4` : `floor(puissance/100 × puissance de l'armée adverse initiale)` ;
- Calculer `floor(puissance_invoquee/puissance_individuelle)` ;
- Placer l'invocation dans un emplacement **spécial 1**, ou **0** si le 1 est déjà occupé.

Ces emplacements **0 et 1** sont additionnels : le moteur Jactari utilise les indices **2 à 8** pour les sept emplacements ordinaires de combat. Cette différence architecturale est fondamentale.

Le module indépendant [summoning.mjs](../../tools/jactari-port/summoning.mjs) expose `planSummoning()` et renvoie `specialIndex`, `creatureIndex`, `unitCount`, `summonedPower` et `enemyInitialPower`.

**Limite volontaire :** aucune créature n'est encore réellement ajoutée dans le moteur des tours. Ce calcul pur ne gère ni le déclenchement du sort, ni les unités invoquées combattant en premier, ni leur disparition après la bataille. Les deux slots spéciaux doivent être ajoutés proprement au modèle d'armée avant l'intégration.

## Validation exécutée

La copie locale utilisée pour ces vérifications est fondée sur l'archive V5.7 et les nouveaux fichiers extraits :

- **87 tests non différentiels exécutés, 87 réussis**, sous Node.js 22.16.0 ;
- Dont **8 nouveaux tests de clôture temporaire**, **8 nouveaux tests d'invocation**, plus les tests existants ;
- **48 tests ciblés** (anciens et nouveaux) sur les modules de rapport/tours/clôture/invocation : tous réussis ;
- Les tests différentiels chargeant `data/Jactari/src/scripts/combat.min.js` **ne sont pas comptés** : cette source n'était pas présente dans l'archive locale. Elle existe dans le dépôt GitHub, mais **le résultat complet de GitHub Actions n'a pas été vérifié**.

Cette validation mesure le comportement du banc local et non l'équivalence de tous les effets avec une exécution navigateur du Jactari historique.

```bash
node --test tools/jactari-port/*.test.mjs
```

## Prochaine étape

1. Exécuter **la suite complète sur un checkout GitHub** contenant les sources historiques et corriger les vrais écarts différentiels.
2. Modéliser les **deux slots spéciaux** dans l'orchestrateur sans les confondre avec les sept slots d'armée persistants.
3. Porter les règles exactes de **puissance d'invocation, sorts disponibles, mana et prérequis** depuis le catalogue historique.
4. Comparer les événements de tours et les rapports finaux complets avec Jactari, y compris les particularités de résurrection à la fin de la bataille.
5. Ne pas activer ce moteur comme arbitre serveur MMHK S2 avant cette parité.

**Résultat :** deux mécanismes historiques supplémentaires sont isolés, testés, versionnés et accompagnés de limitations explicites.
