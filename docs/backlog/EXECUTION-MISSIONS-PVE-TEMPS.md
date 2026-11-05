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



## V101 — ligne ordinaire complète figée au départ (5 novembre 2026)

La migration `101_pve_frozen_ordinary_lines.sql` ajoute
`ordinary_line_snapshot` aux missions PvE. Un trigger PostgreSQL
capture dans la même transaction que V100 les **1 à 7 positions ordinaires
réellement attribuées au héros** (effectifs, puissance individuelle,
type d'arme lorsqu'il a été qualifié et provenance) et la ligne du
défenseur neutre. Il rejette toute composition dont les effectifs ne
correspondent pas aux troupes assignées ou dont la puissance est inconnue.

Le worker utilise désormais `resolve_ordinary_lines` pour les nouvelles
missions V101. Le rapport conserve les deux lignes de départ, les
échanges séquentiels et leurs résultats théoriques. La fuite se calcule
sur **tous les pelotons ordinaires**, avant les autres modificateurs.
L'UI distingue ce résultat multi-pelotons des anciens duels mono-peloton.

Les missions V100 préexistantes restent mono-peloton avec leur adversaire
V100 figé, et les missions antérieures V100 restent explicitement
`legacy_live_at_arrival`. Une copie V101 invalide ne déclenche
aucune relecture des données courantes.

**Limites :** toutes les rencontres actuelles ont un seul peloton PNJ ;
les caractéristiques du héros et ses talents ne sont pas encore figés
pour une mission complète ; si une classification d'arme est inconnue,
son bonus n'est pas certifiable. Aucun règlement permanent n'est appliqué :
ni pertes, ni XP, ni butin, ni libération de mine. Le statut des US reste
non accepté et aucun taux d'avancement n'est déduit de ces tests.

La commande `audit-pve-snapshots` conserve ses compteurs V100 et ajoute
`ordinary_lines` pour identifier les missions V101 valides ou corrompues.
Le déploiement de V101 exige sauvegarde préalable et validation sur
base jetable ; la migration est à sens unique.

Tests : `test_pve_ordinary_line_snapshot.py`,
`test_pve_mission_flight.py`, `test_pve_missions_integration.py`,
`test_pve_snapshot_audit.py`. Dossier qualité V100 conservé.



## V102 — règlement permanent ciblé, activable uniquement en laboratoire

La migration `102_pve_lab_attacker_casualty_settlement.sql` prépare
un registre append-only `pve_lab_casualty_settlements` et un instantané
`attacker_settlement_snapshot` automatiquement capturé au départ. Ce
dernier conserve la politique administrateur et la preuve d'un héros
qualifié **à zéro modificateur**, sans talents ni tirs préalables.
Une autorisation activée, désactivée ou modifiée *après* le départ
n'altère pas la mission déjà engagée.

**Par défaut**, aucune politique n'existe et **aucune mort n'est appliquée**.
Pour activer ce comportement sur un monde d'essais, son profil de trajet
doit explicitement commencer par `LAB-` et ne pas être certifié historique.
L'administrateur doit exécuter (en dehors du site joueur) :

```bash
python -m mmhk_api.manage configure-lab-pve-casualties \
  --world-id MON-MONDE-TEST \
  --enabled yes \
  --source-ref LAB-DECISION-EXPLICITE \
  --acknowledge-experimental
```

Pour désactiver les **missions futures**, utiliser `--enabled no`.
Cela ne modifie jamais les politiques gelées des missions en cours.

Le règlement des morts ne s'applique qu'aux unités ordinaires
de l'attaquant : les dispersions de chaque peloton sont converties
par le coefficient Jactari qualifié `0,30`, avec minimum conditionnel
d'une unité. Les pertes par code unité sont regroupées, vérifiées contre
les effectifs exacts gelés au départ, puis débitées en une transaction
avec le rapport, la transition de mission et un registre immuable.
L'ancienne formation doit être revalidée au retour si des pertes
effectives ont eu lieu. Les héros et les PNJ ne subissent aucune autre
conséquence implicite.

**Refus d'appliquer des morts :** manque de classe d'arme, absence d'un
profil de héros explicitement qualifié à zéro, résultat de fuite,
égalité/faux nul, tirs spéciaux et autres profils non pris en charge.
La raison du non-règlement est enregistrée dans le rapport. Les anciennes
missions V100/V101 ne sont jamais régularisées rétroactivement.

Cette tranche **n'applique ni pertes aux PNJ, ni expérience, ni butin,
ni changement territorial, ni règles de talents/magie**. Elle n'est
pas une certification de fidélité à la saison historique et ne valide
aucune US. Les profils sans héros et les autres branches restent
à caractériser avec les sources.

Tests : `test_pve_lab_settlement.py`,
`test_pve_missions_integration.py`, PostgreSQL 17 sur base jetable,
puis CI Next.js et parcours complet Docker/Chromium post-fusion.
