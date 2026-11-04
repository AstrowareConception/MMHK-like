# US-COM-008 — Tranche technique de l'enchaînement des pelotons

Date : 4 novembre 2026. **État : code candidat, non accepté**.

Le besoin défini dans le backlog est de permettre au survivant d'un
échange d'affronter le peloton suivant avec ses effectifs restants,
sans réintégrer un peloton dispersé et sans malus de fatigue inventé.

## Implémentation candidate

- `apps/api/src/mmhk_api/pve_stack_sequence.py` : orchestration pure,
  déterministe, maximum sept pelotons ordinaires par camp et 98 échanges
  de sécurité. Elle appelle `jactari.duel.resolve_stack_duel` à chaque
  échange et conserve les effectifs restants du survivant.
- `apps/api/src/mmhk_api/region_pve.py` :
  `preview_ordinary_line_sequence` lit les rencontres autorisées,
  la formation du héros propriétaire et les puissances du catalogue.
- `POST /api/v1/me/cities/{city_id}/encounters/{encounter_id}/preview-lines`
  : API **en lecture seule**, authentifiée et filtrée par propriété.
- `apps/web/app/api/region-lines/route.ts` : relais Next.js sans
  divulgation du bearer au navigateur.
- `apps/web/components/region-encounter-panel.tsx` : bouton
  « Tester la formation » et liste des échanges conservée localement
  dans le navigateur, sans modification du monde.

Les tests candidats `test_pve_stack_sequence.py` et
`test_pve_stack_preview.py` couvrent une chaîne de pelotons, la
dispersion, la reproductibilité, les profils inadmissibles et
l'absence de requête d'écriture.

## Correspondance avec les cinq critères de l'US

| Critère | État de vérification |
| --- | --- |
| CA01 : le survivant poursuit à effectif restant | Algorithme implémenté ; test écrit, non exécuté |
| CA02 : un peloton dispersé ne rejoue pas intact | Algorithme implémenté ; test écrit, non exécuté |
| CA03 : plusieurs victoires sans fatigue ajoutée | Algorithme implémenté ; test écrit, non exécuté |
| CA04 : reprise/idempotence | Fonction pure, sans ordre ; tests de reprise du vrai worker absents |
| CA05 : droits et visibilité | Authentification et scoping SQL ; validation multi-joueur E2E absente |

**Definition of Done : non satisfaite.** L'US demande la fidélité au
résultat réel du combat ; cette première version n'intègre pas les
tirs préalables, les contre-armes, les bonus de héros, la magie,
l'admission/fuite PvE, les invocations, les résurrections et les pertes
persistantes. Le résultat ne doit donc pas être utilisé par un worker
pour libérer une case, tuer des unités, délivrer de l'expérience ou
attribuer un butin.

## Prochaines dépendances métier

**US-COM-004 (contre-armes)** et **US-COM-001 (préparer la bataille)**
restent les dépendances indispensables pour établir des résultats
complets, suivies des US-COM-011, 013, 014, 016 et 017.
**US-REG-003/004** dépendent de la résolution correctement
persistée des rencontres et de l'exploitation économique réelle.

Ne déclarer une US terminée qu'après vérification de ses cinq CA
sur fixture versionnée, tests PostgreSQL, recette navigateur et
acceptation explicitement consignée.

## Extension US-COM-004 — contre-armes qualifiées (4 novembre 2026)

Le laboratoire enchaînant les pelotons recalcule à présent à chaque échange
le bonus du triangle I/R/C, selon les classifications réellement
renseignées par l'opérateur. Les nouveaux événements portent
`counter_weapons` (classes, bonus directionnels, provenance) et
`total_power` (puissances du duel après bonus).

Un peloton gagnant peut rencontrer ensuite un type d'unité contre
lequel il est désavantagé : l'avantage n'est donc pas figé au début
de la bataille. Les unités sans classification restent explicitement
inconnues, et ne reçoivent pas de bonus inféré.

Cela ajoute une preuve technique candidate pour les CA01–CA03 de
US-COM-008 et pour US-COM-004. Les autres phases historiques de combat,
la persistance et la DoD sont toujours hors périmètre.
Voir [recette US-COM-004](RECETTE-US-COM-004-2026-11-04.md).

## Extension US-COM-005 — caractéristiques de base du héros

Le moteur expérimental peut également inclure des points d'attaque
explicitement qualifiés et un bonus fixe par unité pour le héros
attaquant. Ces termes sont ajoutés, séparément, aux autres
modificateurs de l'échange. Leur provenance est consultable dans le
rapport et aucun bonus n'est inféré de l'archétype du héros.

**Limite :** ce n'est pas encore le moteur complet des bonus du
héros : talents conditionnels, sorts, artefacts et spécificités S2
restent exclus. L'US-COM-008 ne devient donc pas acceptée.

Voir [recette US-COM-005](RECETTE-US-COM-005-2026-11-04.md).
