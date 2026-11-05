# Contrôle d'intégration GitHub Actions — 5 novembre 2026

## Référence de la campagne

Workflow `FastAPI + Next.js foundation`, exécution
[41996018352](https://github.com/AstrowareConception/MMHK-like/actions/runs/41996018352),
sur le commit `17ab9a9a3999621332190aa31db8506cc4954ef4`.

**Résultat de cette exécution : ÉCHEC.**

| Job | État | Diagnostic |
| --- | --- | --- |
| API + PostgreSQL + oracle Jactari | Échec | 342 tests réussis, 4 échoués (52,15 s) |
| Build Next.js + TypeScript strict | Réussi | Compilation et contrôle des types terminés |
| Build conteneurs + migrations | Réussi | Prévisualisation et schéma applicatif validés |
| Parcours navigateur six services | Échec | Audit visuel : `missions` avec débordement vertical de 6 px |

Le warning de dépréciation Node.js n'explique pas ces échecs.

## Régressions identifiées et correctifs poussés

- `test_api.py` : la liste des routes explicitement approuvées
  ignorait trois nouveaux endpoints **authentifiés** : reconnaissance
  régionale, disponibilité militaire en lecture seule et simulation
  multi-pelotons en lecture seule. Corrigé par `aff585788`.
- `test_construction_integration.py` et `test_world_integration.py` :
  ancienne comparaison littérale avec les migrations jusqu'à V020,
  alors que V090–V099 sont désormais présentes. Les tests comparent
  maintenant toutes les migrations versionnées du catalogue SQL avec
  celles réellement enregistrées : `25daa75a` et `c2ef9094`.
- `test_map_navigation_integration.py` : la cellule centrale comporte
  maintenant `resource: None`, donnée explicite du contrat régional.
  L'assertion a été harmonisée : `b218d0e9`.
- `apps/web/app/globals.css` : le panneau des missions régionales
  débordait verticalement de 6 px à 1220×900. Le défilement est
  désormais contenu dans la carte des missions, et l'état vide a
  été légèrement compacté sans supprimer de contenu :
  `76570c79`.

Ces changements ne remplacent pas les résultats de la campagne.
Ils n'autorisent **aucune acceptation formelle de user story**
sans exécution de leurs critères et de la DoD commune.

## Revalidation à examiner

Nouvelle campagne principale attendue pour le commit
`76570c79f714563b372da1082b229f4fce5884ab` :
[voir ses exécutions](https://github.com/AstrowareConception/MMHK-like/actions).

Les critères de passage sont : API PostgreSQL entièrement verte,
build Next.js strict vert, conteneurs démarrés et parcours Chromium
sans débordement ni fuite de données. Le verdict final de cette
nouvelle campagne doit être consulté avant de déclarer le problème clos.

## Traceabilité fonctionnelle

L'incrément traite les dépendances **US-COM-010** et **US-COM-013**,
en enrichissant US-COM-008 et US-COM-017. Les fiches sources
et les recettes détaillées sont tenues à jour. Le registre contient
**82/300** candidates techniques, **218** restantes à examiner,
**aucune** US acceptée par cet audit.

## Nouvelle campagne : gel transactionnel PvE V100 — PR #71

L'incrément V100 a été développé dans la branche
`quality/pve-immutable-snapshots-20261105` puis validé sur
[la PR #71](https://github.com/AstrowareConception/MMHK-like/pull/71).

**Résultat final de la campagne PR** :
[GitHub Actions 42005221019](https://github.com/AstrowareConception/MMHK-like/actions/runs/42005221019)

| Vérification | Résultat |
|---|---|
| Migration PostgreSQL V001–V020 + V090–V100 | **Succès** |
| Tests ciblés : snapshot, worker, cycles réels | **25 réussis** |
| Suite Python API/PostgreSQL complète | **379 réussis** |
| Vérification de suivi des US | **300/300 identifiants** |
| Build Next.js et TypeScript strict | **Succès** |
| Browser six services Docker sur commit fusionné | Non confirmé dans cette campagne PR |

Les contrôles PostgreSQL confirment que le moteur refuse
la modification d'un snapshot adverse, des forces d'attaque,
du rapport déjà inscrit et le retour en arrière de la mission.
L'issue reste stable si l'adversaire change ses caractéristiques
pendant le trajet.

Une première exécution PR (`42004683631`) avait échoué sur
une assertion de **format numérique** (`400.0` comparé à `400`).
Cette comparaison a été remplacée par une comparaison numérique
`Decimal` ; les campagnes suivantes ont réussi. Il ne
s'agissait pas d'une erreur de persistance du moteur.

**Fusion effectuée** avec `main` via squash commit
`865ca626f967de1e7886fde87954e5951551e5b8`.

Ces résultats valident la **tranche technique V100**, mais
**n'acceptent aucune US de gameplay historique** : les pertes
permanentes, XP, récompenses et libération de mine restent
hors du laboratoire. La validation navigateur complète après
fusion devra encore être établie indépendamment.
