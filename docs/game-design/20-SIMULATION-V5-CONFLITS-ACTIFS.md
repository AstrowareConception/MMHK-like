# V5 — Conflit actif entre alliances autour des reliques (35 simulations)

**23 octobre 2026 · Statut : modèle expérimental exécuté, non certifié Ubisoft S2.**

**Contrôle supplémentaire V5.1 :** une seconde exécution des **35 mêmes scénarios**, avec alternance de l'ordre des alliances selon les jours et graines, a conservé **10 transferts directs de relique** et **23 scénarios où au moins un site est contrôlé**. Ce résultat est un test de sensibilité à l'ordre d'itération, **pas** une démonstration d'équité : l'attribution de ressources ou la réservation des actions reste séquentielle. Le pack remis dans cette conversation inclut **les deux codes Python et leurs sorties JSON complètes**.

## Objectif et protocole

La V4 ne produisait presque jamais de transferts directs de reliques. La V5 modélise un **duel territorial intentionnel** entre deux alliances de deux joueurs, disposant initialement chacune de deux villes, à proximité d'un Sphinx, d'une Trésorerie et d'un Dolmen. Les 35 scénarios exécutés combinent :

- **Cinq graines** (11, 23, 47, 71, 89) ;
- **Trois confrontations** : stratégie de prise de reliques contre défense, contre un autre chercheur de reliques, contre stratégie purement économique ;
- **Deux coûts d'entretien** : standard synthétique (×1) et sévère (×4) ;
- **Cinq contrôles contrefactuels** supplémentaires dans lesquels les bonus de reliques sont désactivés.

Chaque scénario couvre **40 jours simulés**, et les villes affichent une domination journalière égale à la moyenne des **quatre derniers jours de puissance militaire** plus une contribution de leur niveau. Les seuils de rayon suivent la table communautaire documentée : 0 / 30 000 / 100 000 / 250 000 / 500 000 / 1 000 000. La carte est **torique**, les zones sont des disques discrets et les reliques sont attribuées à l'alliance qui domine leur case selon une fonction spatiale fictive.

### Décisions disponibles

- Renforcer une garnison pour maintenir son emprise pendant plusieurs jours.
- Tenter une **colonie avancée** vers les sites (coût croissant en fonction de sa position).
- Investir dans l'économie plutôt que la puissance militaire.
- Défendre les villes et maintenir les garnisons.
- Mener une **attaque de garnison simplifiée** produisant des pertes chez l'adversaire.

Les ressources sont conservées **par ville**. Vingt-quatre échéances d'entretien sont traitées par jour ; si l'or ne suffit pas, le solde est consommé et une attrition de 10 % est appliquée à l'effectif agrégé. **Ce n'est pas une simulation du combat Jactari ni une gestion de véritables pelotons T1–T7**, et les caravanes ne sont représentées que par une réaffectation interne simplifiée sans durée de trajet.

## Résultats

| Profil d'entretien | Scénarios | Scénarios avec au moins un site contrôlé | Transferts directs de relique entre alliances | Économie brute cumulée sur l'entretien due aux Sphinx* |
| --- | ---: | ---: | ---: | ---: |
| ×1 | 15 | 15 | **10** | 53 192 unités fictives |
| ×4 | 15 | 3 | **0** | 8 449 unités fictives |

*Somme sur l'ensemble des alliances, villes et jours des quinze scénarios de chaque groupe ; ce n'est ni un gain moyen par joueur ni un rendement financier net. Les économies n'incluent pas le prix d'achat des troupes et les pertes de combat.

Avec un entretien ×1, les **cinq confrontations « objectifs contre objectifs »** présentent chacune deux transferts directs de Sphinx au cours des quarante jours. Avec un entretien ×4, la puissance économique s'effondre avant que le contrôle puisse être durablement disputé. L'effet est **illustratif** : les coefficients sont synthétiques, et surtout les décisions militaires accordent systématiquement un avantage à l'alliance traitée en premier.

L'expérience confirme qu'une **confrontation active sur un lieu choisi comme objectif** est réalisable dans le modèle, contrairement aux prises opportunistes de V4. Elle **ne démontre pas** que la rentabilité nette d'un Sphinx est positive : il faudrait comptabiliser le coût additionnel des garnisons, les pertes et les opportunités économiques sacrifiées, puis comparer avec le même monde sans relique.

## Problèmes encore à corriger avant utilisation pour dimensionner les mondes

1. **Biais majeur d'initiative** : la boucle de décisions traite l'alliance 0 avant l'alliance 1. Un résultat qui favorise la première peut venir de l'algorithme et non de la stratégie. La V5 doit être refactorée pour choisir les ordres simultanément, les réserver puis les résoudre à une échéance commune, ou alterner l'initiative.
2. **Les pertes de troupes sont très élevées** avec les coefficients de stress. Cela constitue un test de rupture, pas une économie S2 plausible.
3. **Pas de vrai combat**, de mouvement, de siège ni de pillage. Les raids retirent des effectifs selon une règle fictive ; ils ne valident pas le moteur militaire.
4. **Pas de dix villes par joueur** : seules des colonies avancées limitées sont simulées.
5. **Pas de véritable caravane** : le transfert d'or intra-alliance est immédiat dans le laboratoire.
6. **Le Dolmen n'est pas évalué économiquement**, faute de combat/XP ; les gains de Trésorerie ne sont pas isolés dans une expérience parallèle.
7. **Aucune mesure fiable de rentabilité nette de site** : il faut un monde témoin reproductible sans bonus, avec mêmes dépenses ou avec stratégie optimisée au témoin.
8. **Aucun calcul de densité à 70 %** : le terrain de 48×48 représente un duel artificiellement rapproché. Il valide un mécanisme, pas une capacité de serveur.
9. **Approximations comptables** : l'attrition frappe une puissance militaire agrégée ; dans MMHK-like elle devra s'appliquer avec `ceil(10%)` par peloton.

## Suite recommandée : V5.1 puis V6

**V5.1 doit d'abord supprimer le biais d'initiative et enrichir les tests d'invariants :** propriétaires stables tant qu'aucun ordre n'agit, rapports de troupes conservatifs, pas de double dépense, mêmes entrées/mêmes résultats, retrait de l'influence sur quatre jours, attribution unique des bonus. Comparer au moins deux ordres d'initiative et dix graines.

**V6 pourra alors élargir le duel contrôlé à plusieurs objectifs**, avec une fonction d'investissement qui maximise la valeur attendue d'une relique moins les coûts de garnison, l'entretien, les pertes, les délais et le risque de recapture. Il faudra intégrer le moteur Jactari, des stocks par cité et caravanes à durée réaliste, ainsi que l'évolution 1–10 cités et les conflits pour l'influence adverse.

Il serait prématuré de réduire à nouveau les cartes ou de déclarer « meilleur » un profil de remplissage sur la base des 35 cas de V5.

## Reproductibilité et provenance

- [Synthèse de résultats structurée](../../data/analysis/relic-v5-focused-35-runs-2026-10-23.json)
- **Code Python effectivement exécuté, avec sorties brutes des 35 scénarios** : `MMHK_V5_frontier_2026-10-23.zip`, remis dans la conversation. La source V5 n'est **pas encore intégrée** au dépôt : le ZIP fait foi pour les scripts exécutés.
- [Décisions historiques et limites d'influence](17-RELIQUES-ET-GUERRES-D-INFLUENCE.md)
- [V4 multi-villes](19-SIMULATION-V4-MULTIVILLES-RELIQUES.md)

**Conclusion :** mécanisme de lutte pour les reliques démontré dans un banc d'essai expérimental ; rentabilité et équité des choix non encore validées.
