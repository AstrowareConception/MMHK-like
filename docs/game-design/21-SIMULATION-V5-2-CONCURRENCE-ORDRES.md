# V5.2 — Banc d'essai des ordres concurrents et de l'entretien par peloton

**23 octobre 2026 — 12 assertions, 30 simulations de non-régression et 15 comparaisons d'ordre de réception validées.** Ce banc n'implémente **pas** encore les formules de combat Jactari. Il s'agit d'un socle de fiabilisation du domaine, et non d'une reconstitution du serveur Ubisoft S2.

## But

La V5 et la V5.1 reproduisaient des guerres de reliques mais présentaient un risque d'**initiative implicite** et traitaient les effectifs militaires comme une puissance globale. La V5.2 sépare maintenant :

1. **Validation simultanée des commandes** à partir d'un seul snapshot en début de phase, sans dépendre de l'ordre HTTP.
2. **Réservation des effectifs de départ** : aucun peloton ne peut engager deux fois les mêmes unités.
3. **Calcul indépendant des dégâts** puis application d'un résultat agrégé.
4. **Comptes d'or par ville**, avec paiement de **24 échéances horaires par journée simulée**.
5. **Attrition à l'entier supérieur, par peloton**, lorsqu'un paiement horaire est impossible.
6. **Lissage quotidien sur quatre jours** et **rayons d'influence en cercle discret** selon les paliers communautaires documentés (30 000 / 100 000 / 250 000 / 500 000 / 1 000 000).
7. **Attribution de reliques** selon l'influence de l'alliance sur la case, en conservant un statut contesté possible.

### Limitation militaire explicite

La formule provisoire de l'attaque automatique calcule les dégâts à partir de la puissance engagée et des troupes adverses. C'est une **formule synthétique**, utilisée uniquement pour éprouver la concurrence et la comptabilité : elle n'incorpore **ni les sept pelotons du calculateur complet, ni les contre-armes et sorts Jactari, ni les déplacements ou sièges**. Aucun test de cette V5.2 ne doit être qualifié de validation historique du combat.

## Résultats réellement obtenus

| Contrôle | Résultat |
| --- | ---: |
| Assertions de base du moteur | **12 / 12** |
| Simulations de régression exécutées | **30** |
| Comparaisons par paires avec ordres d'arrivée inversés | **15** |
| Divergences d'état comptable, d'effectifs ou de contrôle final | **0** |
| Écritures horaires dans une démonstration de dix jours / deux cités | **480** |
| Transferts directs de reliques dans cette démonstration | **0** |

Les 30 exécutions croisent cinq graines (11, 23, 47, 71, 89), trois coefficients d'entretien fictifs (0,15, 2 et 10) et les deux ordres de réception A→B / B→A. **Le résultat du moteur ne change pas** lorsque seuls les ordres de réception changent dans ces essais. Cela valide le traitement de ces scénarios ; cela ne prouve pas qu'aucune dépendance à l'ordre n'existe dans des cas plus complexes.

Les 12 assertions vérifient notamment : les limites exactes des paliers historiques, la distance torique à la frontière, l'indépendance des résultats militaires face à l'ordre de soumission, l'absence de stock négatif, le déclenchement de l'attrition en cas d'impayé, le rayon minimal et le nombre correct de prélèvements.

Le résultat **zéro transfert direct de relique** n'est pas caché : avec ce moteur volontairement réduit, le scénario de démonstration n'entraîne pas de reprise entre alliances. La V5.2 n'est donc **pas** une preuve supplémentaire de gameplay PvP intéressant ; elle prépare seulement une simulation offensive fiable.

## Anomalies et exigences pour la V5.3

- L'attrition doit être calculée sur **chaque véritable type d'unité** et non sur une puissance agrégée ; le modèle propose déjà des pelotons `infantry` et `archer` de test.
- Les héros, ordres avec temps de marche, réservations simultanées de ressources, ravitaillements par caravanes et horloge UTC restent à intégrer.
- Les renforts immédiats doivent être remplacés par des **ordres horodatés** avec phase d'aller, retour et trêve.
- Remplacer le moteur d'attaque synthétique par des cas de référence **Jactari** recoupés avec les rapports historiques.
- Le cas « attaque et renforcement dans la même seconde » doit être intégré aux tests en maintenant une cohérence atomique des effectifs.
- Ajouter des scénarios où plusieurs alliances prennent, perdent puis récupèrent un Sphinx en conservant les remises d'entretien et les gains d'or réellement imputés.
- L'interface et le backend devront utiliser les mêmes snapshots de règles, sans permettre deux dépenses d'une même ressource.

## Livrables et reproductibilité

- [Synthèse structurée dans GitHub](../../data/analysis/relic-v5-2-concurrent-order-regression-2026-10-23.json).
- Code Python exécuté et rapports détaillés dans **MMHK_V5_2_simultaneous_orders_2026-10-23.zip** joint à la conversation : `MMHK_V5_2_orders.py`, `MMHK_V5_2_regression.py`, résultats de la démonstration et des 30 régressions.
- Commandes de test après extraction :
  ```bash
  python MMHK_V5_2_orders.py --output MMHK_V5_2_results.json
  python MMHK_V5_2_regression.py
  ```

**Statut :** 30 simulations et 12 tests exécutés. **La source Python détaillée est dans le ZIP de la conversation, pas encore committée sur GitHub.** Les résultats ci-dessus sont expérimentaux et ne fixent ni la densité de référence à 70 %, ni l'équilibrage S2.
