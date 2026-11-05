# PvE : déplacements temporisés des héros

## US existantes
US-MOV-001/003/007, US-REG-002/003, US-COM-001/002/017. Pas de nouvelle US, ni de règles historiques supposées.

## Parcours
Le héros et un peloton réellement affecté partent de la cité (case locale 2,2), après contrôle des droits, du profil de trajet et des réservations concurrentes. Trois états PostgreSQL sont utilisés : outbound (aller), returning (retour), completed (rentré).
Les heures started_at, arrival_due_at et return_due_at sont calculées côté serveur lors de l'ordre. Les deux trajets sont distincts. Le héros reste indisponible tant que le worker n'a pas confirmé le retour.
Le worker inscrit les événements departed, arrived et returned, exécute uniquement à l'arrivée le duel Jactari expérimental mono-peloton et sauvegarde son rapport. Aucun PNJ n'est libéré, aucune récompense, XP, blessure ni perte définitive n'est appliquée.
La scène régionale montre une trajectoire entre cité et cible, un marqueur héroïque interpolé côté navigateur à partir du temps serveur, l'étape active et son compte à rebours. La frise du royaume distingue arrivée et retour.

## Convention de démonstration
Seul le monde local-sandbox reçoit la politique LAB-REGIONAL-TILE-STEPS-V1 : 25 secondes par pas orthogonal, dans une grille 5x5. De (2,2) à (1,3), deux pas impliquent 50 secondes à l'aller ET 50 secondes au retour. Cette convention moderne est expérimentale et ne certifie pas la durée historique MMHK.
Les pauses de nuit, haltes, routes inter-régionales et déplacements des armées complètes restent ouverts (U09/U10/U17). Une autre partie ne reçoit aucun profil de trajet automatique.

## Sécurité et validation
Une mission est identifiée par un UUID stable, ne peut utiliser un héros étranger ou occupé, et ne peut cibler en parallèle une rencontre réservée. Les invariants PostgreSQL interdisent deux missions actives pour le même héros. Le worker traite les échéances sous transaction avec SKIP LOCKED pour permettre plusieurs processeurs. La reconnexion ne change jamais les échéances. Les tests couvrent la confidentialité, la reprise, le non-débit des unités et le retour qui libère effectivement le héros.
Les critères complets de US-REG-003 et US-COM-002 ne sont pas encore acquis. La prochaine étape comporte sept pelotons, pertes, expérience, victoire/défaite et vraie libération des cases.
Le retour planifié est réajusté sur l'horodatage de l'arrivée effectivement validée : si le worker traite cette arrivée en retard, le héros dispose toujours de la totalité du temps de trajet retour. La région utilise `arrived_at` pour démarrer l'animation retour et la frise reçoit la nouvelle échéance serveur.

## Gel des entrées V100 et compatibilité des missions historiques

Pour une **nouvelle mission** créée après V100, la base
PostgreSQL copie les données de l'adversaire au moment du départ.
Ce snapshot accompagne les attributs du peloton attaquant
déjà enregistrés. Le worker utilise cette copie immuable
lors de son arrivée, y compris si le profil de la rencontre
a changé pendant le trajet.

Une mission ancienne, dont `defender_snapshot IS NULL`,
conserve la lecture traditionnelle à l'arrivée, mais son
rapport signale explicitement `legacy_live_at_arrival`.
L'absence d'instantané ne doit jamais être masquée ou
reconstituée en prétendant que la copie existait au départ.

Le rapport porte `engagement_inputs` : les effectifs et
puissances effectivement utilisés ainsi que le statut
de provenance. Une fois inscrit, le rapport ne peut plus être
réécrit, et les étapes ne peuvent reculer. La commande de
maintenance `audit-pve-snapshots` recense les missions
actives à examiner avant un déploiement.

Le calcul reste expérimental, avec branche de fuite
avant duel, sans pertes durables, XP, butin ou libération.
Voir le [dossier de contrôle](QUALITE-PVE-INSTANTANES-V100-2026-11-05.md).
