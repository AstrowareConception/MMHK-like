# Recette US-COM-013 — Lire les dispersions de Jactari

**Date : 5 novembre 2026. Priorité P0. État : code candidat, non accepté.**

Story : [US-COM-013](categories/11-COM.md#us-com-013).
Référence : `docs/game-design/04-COMBAT.md` et port
Jactari `apps/api/src/jactari/duel.py`.

## Contrat de combat

La **dispersion** est le retrait d'un effectif du duel courant.
Elle ne doit jamais être confondue avec une **mort permanente** :
cette conversion intervient en fin de bataille, après les phases
de magie et les exceptions liées aux héros et aux PNJ.

Dans un duel fictif de laboratoire, 100 infanteries de puissance
100 contre 100 cavaleries de puissance 100, l'infanterie reçoit
l'avantage de contre-arme de 50 %. La puissance calculée est
15 000 contre 10 000. Le duel produit alors **50 infanteries
dispersées et 100 cavaleries dispersées**. Ces chiffres ne signifient
pas 50 et 100 morts définitives.

## Implémentation candidate

- `apps/api/src/mmhk_api/jactari_duel_ending.py` conserve les
  indicateurs `dispersed`, les pertes temporaires calculées
  `theoretical_dispersions`, les effectifs `remaining`,
  le marqueur `-1` de victoire écrasante et les indicateurs
  d'exhaustion sans dispersion.
- `pve_stack_sequence.py` expose ces données pour chaque
  duel, sans consommation d'effectifs PostgreSQL.
- `pve_report_interpretation.py` rend visibles ces données
  dans les rapports de mission mono-peloton.
- L'interface régionale distingue l'effectif actif après
  l'échange du nombre d'unités dispersées.

Les pré-tirs et sorts, les unités invoquées et les
résurrections nécessiteront des registres distincts pour
éviter les doubles décomptes. Cette tranche ne prétend
pas agréger toutes les phases d'une bataille historique.

## Critères d'acceptation

| Critère | Preuve candidate | État |
|---|---|---|
| CA01 — distinguer dispersion et morts définitives | Types/rapport avec `permanent_deaths_applied=false` et projections séparées | Tests écrits, validation UI à exécuter |
| CA02 — dispersion totale n'est pas destruction permanente | Duel égal et faux nul à effectif nul, aucun débit d'unités | Tests écrits, combat persistant encore absent |
| CA03 — 50 I / 100 C fictifs | Fixture 100 × p100 I contre 100 × p100 C | Test écrit, à exécuter |
| CA04 — rafraîchissement sans effet | Lecture seule des rapports / fonction pure | API et navigateur à recetter |
| CA05 — droits et visibilité | Routes existantes filtrées par propriétaire et cité | Recette à deux comptes nécessaire |

**DoD non validée.** La règle des pertes définitives
US-COM-014 et les conséquences du combat sur la mine restent
indépendamment non terminées.

Tests :
`apps/api/tests/test_jactari_duel_ending.py`,
`apps/api/tests/test_pve_report_interpretation.py`,
`apps/api/tests/test_counter_weapons.py`.
