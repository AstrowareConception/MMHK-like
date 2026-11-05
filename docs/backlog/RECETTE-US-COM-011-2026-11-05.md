# US-COM-011 — Fuite avant combat PvE — tranche laboratoire

**Date : 5 novembre 2026. Priorité P1. État : code candidat, non accepté.**

Source fonctionnelle : [US-COM-011](categories/11-COM.md#us-com-011).
Dépendance : US-COM-002. Source historique technique : Jactari
`data/Jactari/src/scripts/combat.min.js`, branche `!rencontre_jcj`
dans `simulation_rencontre`, et
`docs/game-design/04-COMBAT.md`.

## Règle vérifiée et périmètre

Jactari calcule d'abord la **somme des puissances brutes** des
pelotons ordinaires (positions Jactari 2–8), sans bonus du héros,
contre-arme, magie ni tirs préalables. Un attaquant fuit si

`puissance_attaque / puissance_défense <= 1/7`.

L'égalité est **incluse** dans la branche de fuite. Pour éviter les
erreurs d'arrondi à la frontière, le module compare exactement
`7 × puissance_attaque <= puissance_défense`.

Le cas d'une défense nulle ou d'une unité de puissance inconnue
est refusé : aucun succès de combat n'est inféré. L'effet historique
complet de la fuite sur la blessure du héros, les rencontres, l'XP
et les retours reste à qualifier au-delà de ce laboratoire.

## Éléments développés

- `apps/api/src/mmhk_api/pve_admission.py` : calcul pur, déterministe,
  borné à sept pelotons par camp, puissance brute sans modificateurs,
  résultat explicite `fled_before_combat` ou
  `admitted_to_laboratory`.
- `pve_stack_sequence.py` : contrôle d'admission **avant**
  les pré-tirs et les échanges ; en cas de fuite, aucun tir ni duel
  n'est exécuté et le rapport conserve les effectifs intacts.
- `pve_missions.py` : worker des déplacements existants. À l'arrivée,
  une fuite enregistre un rapport distinct sans duel et planifie
  le trajet retour. La mission n'est pas rejouée après son passage
  en `returning`, puis `completed`.
- Types Next.js et UI : rapports de mission et simulation régionale
  différencient clairement une fuite d'une défaite au combat, sans
  prétendre afficher des pertes ou gains inexistants.

**Aucune modification du schéma SQL n'est requise par cette tranche** :
les rapports utilisent le JSONB des missions existantes, sans
nouveau type de phase de mission.

## Correspondance des cinq critères

| Critère | Preuve candidate | État |
|---|---|---|
| CA01 — fuite et conséquences du profil | Worker : branche fuite, rapport et retour ; aucun duel artificiel | Implémenté en laboratoire ; conséquences historiques non complètes |
| CA02 — bonus du héros exclu du ratio | Test avec bonus d'attaque massif, ratio brut inchangé | Test écrit, non exécuté |
| CA03 — rapport exactement 1/7 | Fixture 100 de puissance brute contre 700 | Test écrit, non exécuté |
| CA04 — reprise et idempotence | Test worker : même horloge, un événement d'arrivée et un de retour | Test écrit, intégration PostgreSQL non exécutée |
| CA05 — droits et visibilité | Route de prévisualisation et rapport existants filtrés par cité et propriétaire | Recette API à deux comptes et navigateur nécessaire |

## Cas d'essai complémentaires

- Sous le seuil, fuite avant barrage, baliste et tout duel.
- Au-dessus du seuil, conservation du parcours Jactari précédent.
- Sept pelotons : **somme** des puissances brutes, pas seulement
  celle du premier peloton.
- Rencontre à puissance nulle : erreur explicite, sans victoire gratuite.
- Relecture d'un ancien rapport sans champ `admission` :
  compatibilité conservée.
- Répétition du worker : pas de deuxième rapport ni de récompense.
- Déconnexion et retour du héros : confirmation côté serveur seulement.

## Commandes et limites

```bash
python -m pytest -q apps/api/tests/test_pve_admission.py \
  apps/api/tests/test_pve_mission_flight.py \
  apps/api/tests/test_pve_stack_sequence.py \
  apps/api/tests/test_pve_pre_shots.py
node tools/validate-implementation-review.mjs
```

Avant réception, exécuter la suite API/PostgreSQL, le build Next.js
et le parcours navigateur sur une base jetable.

**DoD : non validée.** Aucun combat PvE complet et persistant n'est
encore fourni : les pertes durables, l'expérience, les récompenses
et la libération des mines restent bloquées par les règles
et la résolution définitive manquantes.
