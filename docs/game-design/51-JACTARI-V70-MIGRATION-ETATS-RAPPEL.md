# MMHK-like — V7.0, tranche 12 : migration SQLite des statuts de rappels

**27 octobre 2026.** Migration technique du moteur militaire expérimental. **Aucune règle supplémentaire MMHK saison 2 n'est présumée certifiée.**

## 1. Problème V11

Jusqu'à la tranche 11, le retour d'une armée rappelée disposait d'une preuve
persistée dans `military_mission_recall_plans`, mais utilisait deux états
provisoires dans `military_missions` :
- `traveling` pendant le retour, bien que l'attaque ait été abandonnée ;
- `cancelled` après retour, malgré la présence de `recall_return_completed`
  dans le journal militaire.

Les états de la mission ne permettaient donc pas à eux seuls de distinguer
une attaque en route d'un rappel en route et une annulation d'un retour terminé.

## 2. Modèle V12 explicite

| Statut | Signification technique | Bloque une nouvelle mission du héros ? |
| --- | --- | --- |
| `traveling` | Armée en route vers sa cible | Oui |
| `arrived` | Arrivée militaire validée, combat non encore conclu | Oui |
| `returning` | Retour après résolution d'une bataille | Oui |
| `recall_returning` | Rappel approuvé, trajet de retour planifié | **Oui** |
| `completed` | Mission militaire achevée après un combat | Non |
| `recalled` | Armée rentrée après un rappel approuvé | Non |
| `cancelled` | Mission annulée administrativement | Non |

Le rappel suit désormais `traveling → recall_returning → recalled`.

Le tableau concerne les **statuts de persistance de MMHK-like**, pas des noms
d'états authentifiés dans le serveur Ubisoft de la saison 2.

## 3. Migration versionnée et atomique

Nouveau module :
[`mission-state-migration.mjs`](../../tools/jactari-port/mission-state-migration.mjs).

Le module `openTrustedHeroStore` appelle
`ensureExplicitRecallMissionStates(db)` lors de l'ouverture, **avant la
préparation des requêtes métier**. Le mécanisme :
1. refuse une base de version `user_version` supérieure à 12 ;
2. détecte le schéma V12 et évite une nouvelle reconstruction inutile ;
3. contrôle les clés étrangères avant conversion ;
4. prend un `BEGIN IMMEDIATE` exclusif aux écritures et crée une nouvelle
   table `military_missions_v12` ;
5. copie toutes les colonnes et leurs clés primaires **sans changer les
   identifiants de mission** ;
6. convertit les statuts V11 :
   - un `traveling` ayant un plan de rappel approuvé devient
     `recall_returning` ;
   - un `cancelled` ayant un plan et un événement historique
     `recall_return_completed` devient `recalled` ;
   - les autres statuts sont conservés ;
7. refuse un statut de rappel ancien incompatible avec l'historique, plutôt
   que d'inventer une interprétation ;
8. remplace la table sous transaction, recrée l'index d'unicité des missions
   actives en y incluant `recall_returning`, vérifie
   `PRAGMA integrity_check` et `PRAGMA foreign_key_check`, puis inscrit
   `PRAGMA user_version=12` ;
9. effectue `ROLLBACK` en cas d'erreur, et réactive les clés étrangères
   après la tentative.

Les tables de routes, événements, plans de rappel, batailles et échéances
continuent de référencer **le même nom de table et les mêmes identifiants**.
La migration ne réattribue pas les villes, les héros ou leurs armées.

## 4. Procédure d'exploitation indispensable

Il s'agit d'un projet expérimental dont les écritures SQLite ne sont pas
encore exploitées en tant que service PvP public.

Pour une future base contenant des données réelles :

1. Arrêter **tous** les serveurs et workers écrivant dans cette base.
2. Réaliser une sauvegarde SQLite cohérente (API de sauvegarde SQLite ou
   `VACUUM INTO` avec les précautions d'usage) et vérifier sa restauration.
   Ne pas copier uniquement le fichier principal d'une base WAL active.
3. Exécuter une première ouverture V12 en maintenance. La migration est
   déclenchée automatiquement et nécessite cette fenêtre exclusive.
4. Vérifier la version, `integrity_check`, `foreign_key_check` et
   les missions en cours, notamment les rappels avec une date de retour.
5. Restaurer depuis la sauvegarde en cas d'échec. **Ne pas tenter de modifier
   manuellement le statut d'une mission en cours.**
6. Redémarrer les travailleurs uniquement après contrôle du schéma.

L'ouverture automatique ne constitue pas une permission de migrer une base
en activité. Les runners réseau, le contrôle d'accès et l'outillage
opérationnel de sauvegarde/déploiement restent à industrialiser.

## 5. Régression et compatibilité

La suite
[`server-mission-state-migration.test.mjs`](../../tools/jactari-port/server-mission-state-migration.test.mjs)
exerce :
- les sept statuts d'un schéma neuf V12 ;
- un corpus SQLite V12 ramené au **schéma réel V11** avec les états
  historiques surchargés ;
- la migration de deux rappels (l'un toujours en retour, l'autre déjà
  achevé), plus une attaque normale ;
- la conservation des plans, dates, snapshots de départ, échéances
  et événements militaires ;
- la réservation du héros rappelé et sa libération une fois revenu ;
- la réouverture V12 sans nouvelle migration ni duplication ;
- la vérification de l'intégrité et de toutes les clés étrangères ;
- le refus d'un enregistrement V11 incohérent, avec conservation de
  la table et de la version d'origine.

Les tests de rappel existants ont été adaptés pour vérifier
`recall_returning` et `recalled`. Toutes les autres régressions restent
exécutées avec :

```bash
node --test tools/jactari-port/*.test.mjs
```

## 6. Limites et suite V7.0

La migration résout une dette de persistance, **pas** les règles historiques
des interceptions, des rappels à des heures calculées, des haltes ou
de l'arbitrage de batailles simultanées.

La tranche suivante devra introduire un mécanisme de **conflit militaire
en attente d'arbitrage**, avec identité du groupe, audit et résolution
administrative contrôlée, sans laisser une priorité d'ID ou de worker
déterminer artificiellement les résultats.

**Statuts du projet inchangés : V7.0 `in_progress`, C17
`implemented_partial`, C18 `blocked_source`,
`productionBattleArbiterAllowed=false`.**
