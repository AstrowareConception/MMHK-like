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
