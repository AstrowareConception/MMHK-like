# Règlement PvE V102 — premier débit durable contrôlé (5 novembre 2026)

**Nature :** laboratoire explicitement opt-in, non historique.
**Stories :** US-COM-014 (fraction ordinaire seulement), US-COM-002,
US-COM-015, US-REG-003, US-COM-017, US-RAP-001 (non acceptées).

## Invariants et provenance

- Le coefficient Jactari 0,30 n'est qualifié que pour des unités
  ordinaires avec héros ; il doit être calculé **peloton par peloton**.
- Aucune ressource n'est débitée sans politique mondiale activée par
  l'administrateur, qualifiée par `source_ref`, sur monde `LAB-`.
- Le héros doit avoir une fiche d'attributs **explicitement égale
  à zéro**, sans talent ni tir préalable : l'absence de fiche n'est
  jamais transformée en un prétendu zéro historique.
- Les deux instantanés V100 et V101 restent indépendants de tout
  changement de politique ou de caractéristique après le départ.
- Fuite, égalité, faux nul, classes inconnues ou profils particuliers :
  **aucune perte durable** ; statut explicite dans le rapport.
- Le règlement autorisé réalise d'un seul tenant le verrouillage des
  troupes, la vérification du stock, les débits, la création de la
  ligne append-only, le rapport et la transition vers le retour.
  Un rollback annule tout, un rejeu ne retire rien.
- Les doubles positions d'une même unité sont regroupées seulement
  après la conversion des dispersions de chaque peloton.

## Contrôles de recette

| Contrôle | Justification |
| --- | --- |
| 50 dispersés à 30 % | 15 morts définitives |
| 0 dispersé | aucune mort minimale |
| Politique inactive | stock initial strictement identique |
| Politique activée après départ | ancien instantané non modifié |
| Désactivation pendant le trajet | aucune annulation rétroactive |
| Profil de héros absent ou non nul | refus de règlement |
| Classe d'arme inconnue | refus de règlement |
| Worker rejoué | aucune deuxième écriture ni second débit |
| Rapport privé | accès limité au propriétaire de la cité |
| Registre append-only | refus UPDATE et DELETE PostgreSQL |
| État de la rencontre PNJ | inchangé ; aucune mine libérée |

## Écarts de portée

Aucune perte définitive du PNJ, aucun calcul d'XP, aucun gain de
ressources, aucune libération de mine ni blessure de héros.
La tranche n'est **pas** une résolution complète de combat MMHK ;
les cinq critères de chaque story restent à recetter et à accepter.

Référence : `docs/game-design/04-COMBAT.md`,
`docs/backlog/RECETTE-US-COM-014-2026-11-04.md`,
`docs/backlog/EXECUTION-MISSIONS-PVE-TEMPS.md`.
