# Jactari V6.1 — Comparer plusieurs tours au véritable code de duel historique

**24 octobre 2026 — implémentation publiée et vérifiée par GitHub Actions.**

## Ce qui a réellement changé

Le portage V6.0 savait assembler les phases de combat prises en charge, mais aucune suite ne comparait le **journal complet de plusieurs duels consécutifs** avec les fonctions originales de Jactari.

La V6.1 crée trois fichiers :

- [`legacy-sequence-oracle.mjs`](../../tools/jactari-port/legacy-sequence-oracle.mjs) : charge le script Jactari versionné `data/Jactari/src/scripts/combat.min.js`, extrait son authentique `simulation_combat(tour)` et l'exécute en `node:vm` **tour après tour**. Les pelotons sont sélectionnés dans l'ordre historique 0–8 ; seuls les sept emplacements réguliers 2–8 sont utilisés ici.
- [`battle-differential.mjs`](../../tools/jactari-port/battle-differential.mjs) : compare les résultats de l'oracle et de `simulateUnifiedBattle()` par chemin précis (`duels[2].remaining.defender`, par exemple), ainsi que l'état de bataille des pelotons réguliers.
- [`full-round-differential.test.mjs`](../../tools/jactari-port/full-round-differential.test.mjs) : dix scénarios nommés, 180 cas pseudo-aléatoires déterministes, test de divergence volontaire, refus des phases non couvertes, intégrité des entrées et limitation du nombre de tours.

**Ce n'est pas une exécution intégrale de `simulation_rencontre()`.** La boucle de sélection et la politique de modificateurs de bonus sont reconstituées et partagées avec l'adaptateur ; seuls les duels exécutent directement la fonction arithmétique historique. Le terme `legacy-sequence-oracle` désigne donc un **oracle de séquence de duels**, pas une certification des affrontements historiques.

## Matrice de comparaison exécutée

| Aspect | Comparaison actuelle |
| --- | --- |
| Ordre des pelotons et des tours | Positions actives 2–8 et numéros des tours |
| Duels | Vraie fonction `simulation_combat(tour)` exécutée dans une VM |
| Résultats intermédiaires | Pertes attaquant/défenseur, sentinelle -1, effectifs, dispersion, égalité, faux-nul |
| Puissance | Totaux des deux camps (tolérance de flottants uniquement) |
| État après la dernière attaque | Sept pelotons originaux, effectifs et pertes provisoires |
| Permanence | Intégrité des 7 emplacements dans le moteur unifié, mais **pas** comparaison indépendante des morts définitives au calculateur historique |
| Magie, invocations, salves | **Exclues de cet oracle multi-tours**, couvertes uniquement par les tests séparés du port |
| Règles d'entrée PvP/PvE, blessures, fuite, sièges, XP | **Non prouvées**, hors périmètre |

Dix scénarios nommés : victoire isolée des deux camps, double dispersion, défenseurs et attaquants répartis sur plusieurs pelotons, trois avantages cycliques d'armes, héros contre fortification, sept pelotons contre sept. Un générateur xorshift figé (`20261024`) ajoute 180 rencontres multistacks indépendantes. Les comparaisons sont rejouées **à chaque CI**, et toute différence fait échouer le test en donnant le chemin, la valeur attendue et la valeur calculée.

## Correction des régressions observées en CI

Au moment de la reprise, la CI exécutait déjà **191 tests, dont 5 en échec**, malgré la validation locale distincte de 128 tests annoncée en V6.0.

1. Dans `report.mjs`, le paramètre local `melee` désignait déjà l'**array des pelotons d'un camp**, mais l'agrégateur tentait de lire `melee[side][i]`. Toutes les pertes de mêlée étaient silencieusement perdues dans l'ancien rapport `simulateBattleWithLossReport()`. Correction : `melee[i]?.roundLosses`. Les trois tests de rapport concernés sont de nouveau valides.
2. Le test `terminal-cleanup-differential.test.mjs` évaluait un fragment historique dans un contexte `vm` avec un `return` au niveau du script, syntaxe non autorisée. La projection historique est maintenant exécutée dans une fonction immédiatement appelée. Les deux tests de 500 cas chacun fonctionnent de nouveau.

Ces corrections ne doivent pas être confondues avec la preuve de fidélité du moteur V6.0 : la première répare un véritable rapport de pertes, la seconde répare un test historique.

## Résultat CI constaté

Workflow [Jactari port regression, exécution #40069106325](https://github.com/AstrowareConception/MMHK-like/actions/runs/40069106325), commit `08a6efb23bc007b594026ac0937937fbfba1bb33`, Node.js 22 :

- **206 tests passés sur 206**, **0 échec**.
- **15 nouveaux tests `node:test`** de séquence différentielle ; le test génératif comprend **180 rencontres**.
- Les deux tests de nettoyage comparent **1 000 projections** à l'extrait Jactari original ; ils ne constituent pas 1 000 tests `node:test` distincts.
- Test exécuté via `node --test tools/jactari-port/*.test.mjs`.

Cette preuve atteste la réussite des scénarios exécutés. Elle ne prouve pas la fidélité de toutes les combinaisons possibles à MMHK saison 2.

## Prochaine tranche : V6.2

Construire une façade **sans navigateur** autour de `simulation_rencontre()` et `lancement_sorts()` dans un environnement isolé, en commençant par quelques fixtures représentatives dont les entrées et sorties exactes proviennent du code historique. Comparer l'ordre de **tous les événements**, avant et après duel, et le bilan final. Commencer par les cas sans magie, puis invocation, dégâts, zone et résurrection ; ne corriger les branches manquantes qu'à partir de différences démontrées.

**Interdiction maintenue :** ne pas employer `simulateUnifiedBattle()` comme arbitre PvP/S2 de production. Coefficients historiques, admission PvP/PvE, pertes, capacités de héros et règlement complet restent à valider. Sources originales et dérivées : **GPL-3.0-or-later**, conserver attributions et vérifier obligations avant intégration dans un serveur commercial.

> **Actualisation V6.2 :** cette tranche est désormais réalisée et validée par la CI. Voir le [rapport V6.2](29-JACTARI-V62-FULL-ENCOUNTER-ORACLE.md). Le présent document conserve les résultats historiques propres à V6.1.
