# Jactari V6.6 — Tranche 2 : carrières, coût des talents et rangs partagés

**26 octobre 2026 · [Roadmap de conformité](32-ROADMAP-CONFORMITE-MOTEUR-COMBAT.md) · C03 = partiellement implémenté**

## 1. Résultat

Après la dérivation historique des caractéristiques du héros (V6.6 tranche 1), la tranche 2 valide **le droit de choisir une carrière et la comptabilité des rangs de talent**. Le calcul est dérivé des fonctions archivées `validite_carriere()`, `change_carriere()`, `change_talent()` et `maj_comp()` dans `data/Jactari/src/scripts/heros.min.js`, et de `_carrieres`, `_talents`, `_apprentissage` dans `donnees.heros.min.js`.

Les fonctions de référence **`validite_carriere()` et `change_talent()` sont exécutées directement**, sans réécriture, dans [`historical-career-oracle.mjs`](../../tools/jactari-port/historical-career-oracle.mjs). En revanche, la réservation initiale d'**un point par carrière** est reconstruite depuis la branche `change_carriere()` ; cette fonction dépend encore de sélecteurs DOM et n'est **pas exécutée intégralement** par cet oracle. Il est donc interdit de présenter ce test comme une parité de tous les changements de carrière possibles.

## 2. Règles effectivement codées

| Condition | Provenance | Implémentation |
| --- | --- | --- |
| Une carrière n'est sélectionnable que si elle ne réclame aucune école, ou si le héros n'est pas de type `guerrier` et si sa faction possède l'école exigée | `validite_carriere()` | `isJactariCareerAllowed()` |
| Jusqu'à trois emplacements de carrière, sans doublon de carrière ni de slot | Éditeur Jactari | `calculateJactariCareerBudget()` |
| Une carrière consomme un point ; les rangs coûtent de manière **cumulative** `[0,1,3,6]` | `change_carriere()`, `change_talent()`, `_apprentissage` | Calcul de budget |
| Les talents « Scribe » et « Maitre des arcanes » partagent leur rang entre les carrières qui les proposent | `change_talent()` | Coût unique et propagation dans le plan |
| L'achat ne peut excéder les points disponibles du héros, calculés depuis la source historique | `maj_comp()` | Rejet de plan surconsommateur |
| Les changements de rang appliquent le nouveau budget avant de retenir le nouvel état | Règle de garde serveur | `changeJactariCareerRank()` |

Le port utilise **une politique serveur volontairement plus stricte pour les états finaux** : tous les exemplaires sélectionnés d'un talent partagé doivent présenter le même rang. Ce garde-fou ne démontre pas que toutes les séquences intermédiaires de l'interface Jactari se comportent identiquement. De même, `changeJactariCareerRank()` rejoue les transitions d'un plan déjà cohérent ; il n'implémente ni le changement de carrière ni la suppression d'une carrière.

## 3. Intégration aux héros de combat

L'adaptateur [`hero-combat-battle.mjs`](../../tools/jactari-port/hero-combat-battle.mjs) reçoit maintenant, de manière **optionnelle et expérimentale**, deux listes `heroCareers.attacker` et `heroCareers.defender`. Elles sont validées séparément depuis les profils de héros, puis les rangs autorisés et les bonus militaires sont transmis à la construction de chaque héros.

Le moteur refuse un rang inconnu, un champ de bonus forgé, deux carrières identiques, un budget dépassé ou le mélange entre les **choix vérifiés de carrières** et les **bonus de talents bruts** de l'ancienne API. Les talents non combattants continuent de **consommer leurs points historiques**, mais ils ne sont pas transformés artificiellement en un modificateur de duel.

Exemple du contrat en mode expérimental :

```js
simulateBattleWithDerivedHeroes({
  attackers, defenders, heroProfiles, context, lossPolicy,
  heroCareers: {
    attacker: [{slot:1,careerId:validCareerId,talents:[{index:0,rank:2}]}],
    defender: []
  }
});
```

**Confiance :** ce contrat ne prouve ni l'identité du propriétaire, ni le niveau effectivement acquis, ni les artefacts réellement possédés. Toutes les entrées doivent provenir de l'état persisté, validé et détenu côté serveur. Ne jamais exposer directement cette fonction sur une API multijoueur.

## 4. Comparaisons exécutées

| Preuve | Corpus |
| --- | ---: |
| Carrières accessibles — toutes combinaisons faction × archétype × carrière des tables originales | Matrice exhaustive des tables disponibles |
| Achats initiaux de rangs, contre le vrai `change_talent()` | 170 scénarios |
| Promotions et diminutions sur plans cohérents, contre le vrai `change_talent()` | 120 scénarios |
| Synchronisation et coût de Scribe/Arcanes | Cas ciblés de rang 1, 2 et 3, montée et descente |
| Intégration réelle de plans de carrière aux combats | Deux tests supplémentaires, incluant refus de tricherie |

Les scénarios différentiels sont regroupés à l'intérieur de tests `node:test`. **Résultat complet : 306/306 tests Node réussis, zéro échec**, dans [GitHub Actions #40302654585](https://github.com/AstrowareConception/MMHK-like/actions/runs/40302654585), commit `83648c1497f6ef4cd15bcf06a1264aec655861db`. Les sorties attendues viennent du script communautaire versionné, non du calculateur porté.

## 5. Ce qui demeure non prouvé (ne pas clôturer C03)

- Séquencement authentique de `active_carriere()`, `change_carriere()`, `desactive_carriere()`, changements de carrière **avec talents déjà acquis** et restitutions associées.
- Toutes les transitions de **Scribe/Arcanes** lorsque plusieurs rangs divergents existent temporairement dans l'interface Jactari.
- Limites de progression, prérequis et disponibilité des **classes légendaires**, talents non combattants, avantages d'ensembles et règles de respecialisation au niveau serveur.
- Hérédités alternatives `revelation_de_caracteristiques_15/_30`, tous les profils adversariaux et la réconciliation des versions Ubisoft S2.
- Contrôles de propriété, obtention et autorisations des héros, talents et équipements en base de données.

**Statut requis :** V6.6 reste **en cours** ; C03 reste **`implemented_partial`**. Il n'y a toujours **aucune preuve suffisante pour déclarer la conformité exhaustive** de la construction des héros ni pour mettre en production le moteur comme arbitre PvP.

## 6. Prochaine tranche exacte

Isoler les transitions historiques complètes de `change_carriere()` et `desactive_carriere()` dans un adaptateur de DOM contrôlé. Confronter l'achat, le remplacement et l'abandon d'une carrière **avec talents déjà acquis**, y compris les remboursements et les compétences partagées. Ensuite, tester les prérequis de carrière légendaire, le plafond de respecialisation et la compatibilité avec le budget réel d'un héros persisté. Seules les branches sans divergences permettront de progresser vers une certification C03.
