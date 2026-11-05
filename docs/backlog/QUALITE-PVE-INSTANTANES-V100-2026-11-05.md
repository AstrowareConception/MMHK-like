# Gel des entrées de combat PvE — durcissement V100 (5 novembre 2026)

**Périmètre : L1 / US-COM-002, US-COM-011, US-COM-017, US-COM-008,
US-RAP-001 et US-MOV-007.**
Ce lot apporte une garantie de cohérence, pas une nouvelle mécanique
de dommages ou de récompenses. Les US restent non acceptées.

## Anomalie éliminée

Auparavant, `pve_missions.stack_count/stack_power` figeaient les
effectifs et la puissance de l'attaquant au départ, tandis que
`advance_pve_missions` relisait `region_encounters.unit_count/unit_power`
à l'arrivée. Une modification de la rencontre pendant le trajet
pouvait changer l'issue d'un ordre déjà validé — y compris provoquer
une fuite qui n'aurait pas eu lieu au départ.

Cela contredisait le principe d'un ordre engagé avec des entrées
stables et rendait difficiles la répétabilité et l'explication des
rapports de mission.

## Contrat durable

**Migration V100**
`apps/api/src/mmhk_api/sql/100_pve_immutable_defender_snapshots.sql`

- Nouvelle colonne nullable `pve_missions.defender_snapshot` (JSONB).
- Pour chaque **nouvelle mission**, un trigger PostgreSQL
  `BEFORE INSERT` capture les données de la rencontre **dans la
  même transaction que l'ordre**, en imposant `encounter_id`,
  `city_id` et `NOT resolved`.
- Un snapshot arbitrairement fourni à l'insertion est rejeté.
- Le même trigger protège les anciens déploiements de l'API :
  aucune lecture applicative supplémentaire n'est requise au départ.
- Les champs d'identité, de destination, de trajet, la formation et
  la puissance de l'attaquant sont immuables après départ.
- Une fois le rapport enregistré, il est immuable.
- Une mission ne revient pas de `returning` à `outbound`,
  ni de `completed` à un état actif.
- L'échéance de retour peut être ajustée **une fois** à l'arrivée
  pour préserver la durée complète du trajet retour ; elle ne
  peut plus être modifiée ensuite.

**Worker de mission**

- Si le snapshot V100 existe, son format, son identifiant de politique,
  ses effectifs et sa puissance sont vérifiés, puis **ces données
  sont les seules utilisées** pour l'admission et le duel.
- Si le snapshot V100 est présent mais invalide, le worker échoue
  explicitement **sans relire la rencontre actuelle**.
- Les anciennes missions, créées avant V100, conservent une valeur
  `NULL`. L'ancienne lecture à l'arrivée reste possible pour
  terminer ces ordres, mais elle est étiquetée
  `legacy_live_at_arrival` ; personne ne prétend qu'elles
  avaient un instantané au départ.
- Le rapport JSONB contient `engagement_inputs`, avec les
  entrées effectivement utilisées, leur politique et leur provenance.
  Une reconnexion ou une nouvelle consultation ne les recalcule pas.
- Le moteur reste explicitement `LAB-SINGLE-STACK-V1` :
  **pas de pertes définitives, XP, butin ou libération de mine**.

## Matrice de contrôle

| Invariant | Preuve prévue | État |
|---|---|---|
| Adversaire figé au départ | Modifier une rencontre pendant le trajet, comparer rapport/snapshot | Test PostgreSQL écrit |
| Exactitude de la fuite | Cas où l'adversaire modifié aurait provoqué une fuite | Tests fonctionnels et PostgreSQL écrits |
| Aucune modification des champs de départ | Tenter `UPDATE stack_count`, `UPDATE defender_snapshot` | Tests PostgreSQL écrits |
| Rapport immuable et ordre sans retour arrière | Tenter `UPDATE duel_report` et `stage='outbound'` | Tests PostgreSQL écrits |
| Rejeu sans deuxième règlement | Réexécuter worker au même instant, unique événement `arrived` | Tests écrits |
| Anciennes missions sans valeur fabriquée | `source_status=legacy_live_at_arrival` | Tests écrits |
| Snapshot corrompu | Refus, sans fallback vers des données mutables | Tests écrits |
| Droit d'accès aux rapports | Appartenance à la cité et à son monde | Test de confidentialité existant ; nouvelle revue CI nécessaire |

Les tests et migrations sont à exécuter sur **une base de CI jetable**.
La présence du code et des tests ne suffit pas à valider la DoD.

## Déploiement et récupération

1. Faire une sauvegarde de la base PostgreSQL avant V100.
2. Appliquer la migration par `python -m mmhk_api.manage migrate`.
   Le script est **one-way** ; ne pas éditer une migration déjà appliquée.
3. Exécuter `test_pve_encounter_snapshot.py`,
   `test_pve_mission_flight.py`,
   `test_pve_missions_integration.py` sur PostgreSQL.
4. Exécuter la suite API complète, la vérification documentaire
   des 300 US et le build TypeScript/Next.js.
5. Vérifier une mission déjà en cours avant V100, puis une
   nouvelle mission dont les caractéristiques de la rencontre
   changent après départ.
6. Ne pas fusionner sur `main` tant que les checks PR ne sont
   pas tous verts. Après fusion, refaire la validation complète
   Docker/Chromium du workflow principal.

La migration ne modifie ni ne reconstitue les données historiques
des anciennes missions : leur état est explicitement connu comme
`legacy_live_at_arrival`. Les snapshots V100 ne se réparent pas
par recalcul automatique. Une anomalie doit être traitée après
diagnostic et sauvegarde, pas en changeant arbitrairement la force
du défenseur.

## Diagnostic opérateur en lecture seule

La commande suivante examine les missions actives sans lancer,
recalculer ni modifier leurs combats :

```bash
python -m mmhk_api.manage audit-pve-snapshots --limit 200
```

Le résultat JSON distingue `frozen`,
`legacy_unsnapshotted` et `corrupt`. L'indicateur
`truncated` prévient lorsque plus de missions existent que
la limite demandée. Les identifiants de missions problématiques
permettent de préparer une intervention contrôlée ; la commande
ne répare rien automatiquement.

Tests associés :
`apps/api/tests/test_pve_snapshot_audit.py`.

## Critères de recette des US concernées

- **US-COM-002-CA03/04** : double confirmation et rejeu sans
  bataille ou réserve supplémentaire.
- **US-COM-011-CA01/02/03** : fuite basée sur les puissances
  brutes engagées, et non une force adverse modifiée au retour.
- **US-COM-017-CA03** : un ancien rapport reste inchangé après
  évolution du catalogue ou de la rencontre.
- **US-RAP-001 / US-MOV-007** : rapport lisible et trajet de
  retour confirmé côté worker, sans confusion entre les étapes.

**État des US : toujours candidates ou à recetter selon le registre ;
aucune US n'est déclarée acceptée par la seule implémentation V100.**
