# Recette US-COM-009 — Écrasement Jactari

**5 novembre 2026 — P1 — code candidat, non accepté.**

Référence : [US-COM-009](categories/11-COM.md#us-com-009), 
CODE-01-COMBAT, `apps/api/src/jactari/duel.py`.

## Règle établie

Pour des puissances totales strictement différentes, le moteur
compare `floor(total_gagnant)-floor(total_perdant)` à la
**puissance de base du gagnant**. L'écrasement n'est reconnu que
si l'écart est **strictement supérieur** ; une égalité ne suffit pas.

Le moteur Jactari encode alors les pertes théoriques du camp gagnant
par `-1`. Ce marqueur n'est **jamais** un nombre de morts, une
quantité à ajouter au stock ou un gain de ressources.

La règle a été vérifiée dans le port de la fonction
`simulation_combat` et dans les formules du document
`docs/game-design/04-COMBAT.md`.

## Implémentation candidate

- `jactari_overwhelming.py` valide les puissances,
  reconstitue les arrondis, vérifie la stricte frontière et
  signale toute sentinelle incohérente.
- `pve_stack_sequence.py` conserve cette explication pour
  chaque échange ordinaire.
- `pve_report_interpretation.py` enrichit les nouveaux
  rapports disposant des puissances de base. Les anciens
  rapports incomplets restent compatibles.
- L'interface des rencontres indique l'écrasement, le
  seuil réellement franchi et la signification de `-1`.

**Aucune perte permanente ni récompense n'est appliquée.**

## Cinq critères

| Critère | Preuve technique candidate | État |
|---|---|---|
| CA01 — condition stricte | Comparaison `delta > base`, test de puissance avec bonus | Écrit, non exécuté |
| CA02 — delta égal à base | Test 200 contre 100, base 100 : pas d'écrasement | Écrit, non exécuté |
| CA03 — sentinelle -1 | Test 201 contre 100, base 100 : sentinelle ; pas de mutation | Écrit, non exécuté |
| CA04 — reprise | Rejeu du même calcul pur, mêmes événements | Écrit ; worker réel non recetté |
| CA05 — droits | Route de prévisualisation propriétaire existante | Deux comptes / PostgreSQL non vérifiés |

La **DoD reste ouverte** : validation des cas historiques
S2, test d'intégration et acceptation produit non effectués.

Tests : `apps/api/tests/test_jactari_overwhelming.py`.
