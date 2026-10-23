# Traçabilité des règles métier vers les User Stories

**Lot A, 23 octobre 2026 — version de travail.** La matrice ci-dessous est générée depuis [`early-game.rules.json`](../../data/rules/early-game.rules.json). Les 60 règles ne constituent pas 60 stories nouvelles. Une règle est un invariant transversal ou un comportement ; une US correspond à une valeur observable pour un joueur. Les liens existants ne doivent pas être écrasés.

**Références de planification** : [backlog (300 US)](../backlog/README.md), [story map](../backlog/STORY-MAP.md), [sélection de 37 fiches](../../data/analysis/first-playable-story-selection.json), [PAR-01](../backlog/RECETTE-PARCOURS.md#par-01--developpement-local-hors-connexion) et [méthode DoR/DoD](../backlog/METHODE-ET-QUALITE.md).

## 1. Vue par domaine

### monde — 8 règles

| Règle | État | US | Inconnues |
| --- | --- | --- | --- |
| `RM-WRD-001` — Profil de campagne classique | `confirmed_scope` | [US-ACC-001](../backlog/categories/01-ACC.md#us-acc-001) | `U01`, `U02` |
| `RM-WRD-002` — Un royaume par compte et monde | `proposed_contract` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U16`, `U47` |
| `RM-WRD-003` — Sélection d'une faction jouable | `candidate_versioned` | [US-ACC-002](../backlog/categories/01-ACC.md#us-acc-002), [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U01`, `U02` |
| `RM-WRD-004` — Implantation aléatoire | `historically_incomplete` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003), [US-MON-006](../backlog/categories/12-MON.md#us-mon-006) | `U47`, `U17` |
| `RM-WRD-005` — Invitation et placement proche | `historically_incomplete` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U47` |
| `RM-WRD-006` — Protection débutant horodatée | `unconfirmed_recollection` | [US-ACC-011](../backlog/categories/01-ACC.md#us-acc-011), [US-PVP-004](../backlog/categories/15-PVP.md#us-pvp-004) | `U20` |
| `RM-WRD-007` — État initial du royaume | `blocked_by_evidence` | [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004) | `U01`, `U02`, `U17`, `U24` |
| `RM-WRD-008` — Réactivation de session | `proposed_contract` | [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004), [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U03` |

### region — 8 règles

| Règle | État | US | Inconnues |
| --- | --- | --- | --- |
| `RM-REG-001` — Géométrie régionale | `candidate_versioned` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004) | `U17` |
| `RM-REG-002` — Quatre mines ordinaires | `candidate_versioned` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-REG-002](../backlog/categories/05-REG.md#us-reg-002) | `U17` |
| `RM-REG-003` — Sept types de ressources | `reference_observed` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-ECO-001](../backlog/categories/03-ECO.md#us-eco-001) | — |
| `RM-REG-004` — Doublons de ressources possibles | `unconfirmed_recollection` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U17` |
| `RM-REG-005` — Monde déterministe pour les tests | `proposed_contract` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003), [US-REG-001](../backlog/categories/05-REG.md#us-reg-001) | `U17` |
| `RM-REG-006` — Occupation et libération des cases | `historically_incomplete` | [US-REG-002](../backlog/categories/05-REG.md#us-reg-002), [US-REG-003](../backlog/categories/05-REG.md#us-reg-003) | `U13`, `U17` |
| `RM-REG-007` — Mise en exploitation d'une mine | `historically_incomplete` | [US-REG-003](../backlog/categories/05-REG.md#us-reg-003), [US-REG-004](../backlog/categories/05-REG.md#us-reg-004) | `U17`, `U03` |
| `RM-REG-008` — Sites spéciaux séparés | `historically_incomplete` | [US-REL-001](../backlog/categories/06-REL.md#us-rel-001), [US-MON-001](../backlog/categories/12-MON.md#us-mon-001) | `U17`, `U33` |

### economie — 11 règles

| Règle | État | US | Inconnues |
| --- | --- | --- | --- |
| `RM-ECO-001` — Ledger local par cité | `proposed_contract` | [US-ECO-001](../backlog/categories/03-ECO.md#us-eco-001), [US-ECO-006](../backlog/categories/03-ECO.md#us-eco-006) | `U30` |
| `RM-ECO-002` — Production hors connexion | `historically_incomplete` | [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U03`, `U04` |
| `RM-ECO-003` — Changement de rendement en cours de période | `proposed_contract` | [US-ECO-002](../backlog/categories/03-ECO.md#us-eco-002), [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U03`, `U04` |
| `RM-ECO-004` — Plafond de stockage | `historically_incomplete` | [US-ECO-004](../backlog/categories/03-ECO.md#us-eco-004), [US-ECO-010](../backlog/categories/03-ECO.md#us-eco-010) | `U04`, `U30` |
| `RM-ECO-005` — Dépense atomique | `proposed_contract` | [US-ECO-005](../backlog/categories/03-ECO.md#us-eco-005), [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004) | `U14` |
| `RM-ECO-006` — Disponibilité et réservations | `proposed_contract` | [US-ECO-006](../backlog/categories/03-ECO.md#us-eco-006) | `U28`, `U30` |
| `RM-ECO-007` — Rendement administratif non cumulatif | `candidate_versioned` | [US-CIT-008](../backlog/categories/02-CIT.md#us-cit-008), [US-ECO-002](../backlog/categories/03-ECO.md#us-eco-002) | `U02`, `U03` |
| `RM-ECO-008` — Barème de mine comme référence candidate | `candidate_versioned` | [US-REG-005](../backlog/categories/05-REG.md#us-reg-005), [US-REG-006](../backlog/categories/05-REG.md#us-reg-006), [US-ECO-002](../backlog/categories/03-ECO.md#us-eco-002) | `U03`, `U04`, `U17` |
| `RM-ECO-009` — Extension de mine et production | `candidate_versioned` | [US-REG-005](../backlog/categories/05-REG.md#us-reg-005), [US-REG-006](../backlog/categories/05-REG.md#us-reg-006) | `U03`, `U17` |
| `RM-ECO-010` — Entretien militaire et insolvabilité | `blocked_by_evidence` | [US-ECO-007](../backlog/categories/03-ECO.md#us-eco-007), [US-ECO-008](../backlog/categories/03-ECO.md#us-eco-008), [US-ECO-009](../backlog/categories/03-ECO.md#us-eco-009) | `U07`, `U08` |
| `RM-ECO-011` — Traçabilité du solde | `proposed_contract` | [US-ECO-012](../backlog/categories/03-ECO.md#us-eco-012), [US-ECO-001](../backlog/categories/03-ECO.md#us-eco-001) | `U30` |

### construction — 8 règles

| Règle | État | US | Inconnues |
| --- | --- | --- | --- |
| `RM-CIT-001` — Catalogue par faction et saison | `candidate_versioned` | [US-CIT-002](../backlog/categories/02-CIT.md#us-cit-002), [US-CIT-003](../backlog/categories/02-CIT.md#us-cit-003) | `U02` |
| `RM-CIT-002` — Préconditions de bâtiment | `candidate_versioned` | [US-CIT-003](../backlog/categories/02-CIT.md#us-cit-003), [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004) | `U02`, `U05` |
| `RM-CIT-003` — Ouverture d'un chantier | `proposed_contract` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005) | `U05` |
| `RM-CIT-004` — Files de construction | `blocked_by_evidence` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005) | `U05` |
| `RM-CIT-005` — Fin et effet de chantier | `proposed_contract` | [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `U05`, `U19` |
| `RM-CIT-006` — Chaîne administrative exclusive | `candidate_versioned` | [US-CIT-007](../backlog/categories/02-CIT.md#us-cit-007), [US-CIT-008](../backlog/categories/02-CIT.md#us-cit-008) | `U02` |
| `RM-CIT-007` — Annulation et remboursement | `blocked_by_evidence` | [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005), [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004) | `U05`, `U19` |
| `RM-CIT-008` — Construction sous siège | `historically_incomplete` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `U19`, `U14` |

### heros — 6 règles

| Règle | État | US | Inconnues |
| --- | --- | --- | --- |
| `RM-HER-001` — Identité et progression du héros | `candidate_versioned` | [US-HER-001](../backlog/categories/07-HER.md#us-her-001), [US-HER-002](../backlog/categories/07-HER.md#us-her-002) | `U25` |
| `RM-HER-002` — Disponibilité exclusive | `proposed_contract` | [US-HER-003](../backlog/categories/07-HER.md#us-her-003), [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009) | `U05`, `U09` |
| `RM-HER-003` — Recrutement de héros et offres | `historically_incomplete` | [US-HER-003](../backlog/categories/07-HER.md#us-her-003) | `U24` |
| `RM-HER-004` — Héros initial non présumé | `blocked_by_evidence` | [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004), [US-HER-001](../backlog/categories/07-HER.md#us-her-001) | `U24`, `U25` |
| `RM-HER-005` — Préparation des carrières et talents | `candidate_versioned` | [US-HER-009](../backlog/categories/07-HER.md#us-her-009), [US-HER-011](../backlog/categories/07-HER.md#us-her-011) | `U25` |
| `RM-HER-006` — Inventaire de héros distinct | `reference_observed` | [US-HER-012](../backlog/categories/07-HER.md#us-her-012), [US-ART-003](../backlog/categories/10-ART.md#us-art-003) | `U27` |

### armees — 8 règles

| Règle | État | US | Inconnues |
| --- | --- | --- | --- |
| `RM-ARM-001` — Composition des sept pelotons | `candidate_versioned` | [US-ARM-008](../backlog/categories/09-ARM.md#us-arm-008), [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009) | `U18` |
| `RM-ARM-002` — Lignées et factions | `candidate_versioned` | [US-ARM-002](../backlog/categories/09-ARM.md#us-arm-002), [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005) | `U02`, `U06` |
| `RM-ARM-003` — Production de recrues ≠ achat d'unités | `historically_incomplete` | [US-ARM-003](../backlog/categories/09-ARM.md#us-arm-003), [US-ARM-004](../backlog/categories/09-ARM.md#us-arm-004), [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005) | `U06`, `U03` |
| `RM-ARM-004` — Prix de recrutement des unités | `candidate_versioned` | [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005) | `U06` |
| `RM-ARM-005` — Puissance brute | `reference_observed` | [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009), [US-COM-001](../backlog/categories/11-COM.md#us-com-001) | `U11` |
| `RM-ARM-006` — Affectation et engagement uniques | `proposed_contract` | [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005), [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009), [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | `U14` |
| `RM-ARM-007` — Améliorations d'unités | `historically_incomplete` | [US-ARM-006](../backlog/categories/09-ARM.md#us-arm-006), [US-ARM-007](../backlog/categories/09-ARM.md#us-arm-007) | `U06` |
| `RM-ARM-008` — Recrutement récurrent | `blocked_by_evidence` | [US-ARM-003](../backlog/categories/09-ARM.md#us-arm-003), [US-ARM-004](../backlog/categories/09-ARM.md#us-arm-004) | `U06` |

### combat — 7 règles

| Règle | État | US | Inconnues |
| --- | --- | --- | --- |
| `RM-COM-001` — Départ PvE admissible | `historically_incomplete` | [US-COM-002](../backlog/categories/11-COM.md#us-com-002), [US-REG-003](../backlog/categories/05-REG.md#us-reg-003) | `U09`, `U13`, `U17` |
| `RM-COM-002` — Contre-armes cycliques | `candidate_versioned` | [US-COM-004](../backlog/categories/11-COM.md#us-com-004) | `U11` |
| `RM-COM-003` — Phases de résolution | `candidate_versioned` | [US-COM-001](../backlog/categories/11-COM.md#us-com-001), [US-COM-008](../backlog/categories/11-COM.md#us-com-008), [US-COM-014](../backlog/categories/11-COM.md#us-com-014), [US-COM-017](../backlog/categories/11-COM.md#us-com-017) | `U11`, `U13`, `U42` |
| `RM-COM-004` — Résultat et libération conditionnelle | `proposed_contract` | [US-REG-003](../backlog/categories/05-REG.md#us-reg-003), [US-COM-017](../backlog/categories/11-COM.md#us-com-017) | `U11`, `U13` |
| `RM-COM-005` — Pertes, morts définitives et XP | `historically_incomplete` | [US-COM-013](../backlog/categories/11-COM.md#us-com-013), [US-COM-014](../backlog/categories/11-COM.md#us-com-014), [US-COM-016](../backlog/categories/11-COM.md#us-com-016) | `U11`, `U13`, `U42` |
| `RM-COM-006` — Rapport de bataille reproductible | `proposed_contract` | [US-COM-017](../backlog/categories/11-COM.md#us-com-017), [US-RAP-001](../backlog/categories/22-RAP.md#us-rap-001) | `U41` |
| `RM-COM-007` — Aucun combat tactique au clic | `reference_observed` | [US-COM-001](../backlog/categories/11-COM.md#us-com-001), [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | — |

### temps — 4 règles

| Règle | État | US | Inconnues |
| --- | --- | --- | --- |
| `RM-TIM-001` — Horloge serveur et fuseau | `proposed_contract` | [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003), [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005), [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | `U03`, `U10` |
| `RM-TIM-002` — Idempotence des commandes | `proposed_contract` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005), [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U14` |
| `RM-TIM-003` — Simultanéité et ordre déterministe | `blocked_by_evidence` | [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006), [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | `U14` |
| `RM-TIM-004` — Reprise après arrêt serveur | `proposed_contract` | [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003), [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `U14`, `U03` |

## 2. Vérification du périmètre PAR-01

Le registre du premier lot comporte **16 pivots** et **37 US avec dépendances**. Le présent catalogue couvre directement **27 de ces 37 US** par au moins une règle. Les autres fiches peuvent traiter navigation, rapports ou gestes d'interface ; leur absence de cette matrice n'est **pas** une suppression du périmètre.

| US de PAR-01 | Règles associées |
| --- | --- |
| `US-ACC-001` | `RM-WRD-001` |
| `US-ACC-002` | `RM-WRD-003` |
| `US-ACC-003` | `RM-WRD-002`, `RM-WRD-003`, `RM-WRD-004`, `RM-WRD-005`, `RM-REG-004`, `RM-REG-005` |
| `US-ACC-004` | `RM-WRD-007`, `RM-WRD-008`, `RM-REG-001`, `RM-HER-004` |
| `US-ACC-005` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-ARM-001` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-ARM-003` | `RM-ARM-003`, `RM-ARM-008` |
| `US-ARM-004` | `RM-ARM-003`, `RM-ARM-008` |
| `US-ARM-005` | `RM-ARM-002`, `RM-ARM-003`, `RM-ARM-004`, `RM-ARM-006`, `RM-TIM-002` |
| `US-ARM-008` | `RM-ARM-001` |
| `US-ARM-009` | `RM-HER-002`, `RM-ARM-001`, `RM-ARM-005`, `RM-ARM-006` |
| `US-CIT-001` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-CIT-002` | `RM-CIT-001` |
| `US-CIT-003` | `RM-CIT-001`, `RM-CIT-002` |
| `US-CIT-004` | `RM-ECO-005`, `RM-CIT-002`, `RM-CIT-003`, `RM-CIT-004`, `RM-CIT-007`, `RM-CIT-008`, `RM-TIM-002` |
| `US-CIT-005` | `RM-CIT-003`, `RM-CIT-004`, `RM-CIT-007`, `RM-TIM-001` |
| `US-CIT-006` | `RM-CIT-005`, `RM-CIT-008`, `RM-TIM-003`, `RM-TIM-004` |
| `US-CIT-009` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-CIT-013` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-COM-001` | `RM-ARM-005`, `RM-COM-003`, `RM-COM-007` |
| `US-COM-002` | `RM-ARM-006`, `RM-COM-001`, `RM-COM-007`, `RM-TIM-001`, `RM-TIM-003` |
| `US-COM-017` | `RM-COM-003`, `RM-COM-004`, `RM-COM-006` |
| `US-ECO-001` | `RM-REG-003`, `RM-ECO-001`, `RM-ECO-011` |
| `US-ECO-003` | `RM-WRD-008`, `RM-ECO-002`, `RM-ECO-003`, `RM-TIM-001`, `RM-TIM-002`, `RM-TIM-004` |
| `US-HER-001` | `RM-HER-001`, `RM-HER-004` |
| `US-HER-002` | `RM-HER-001` |
| `US-HER-003` | `RM-HER-002`, `RM-HER-003` |
| `US-RAP-001` | `RM-COM-006` |
| `US-RAP-009` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-REG-001` | `RM-REG-001`, `RM-REG-002`, `RM-REG-003`, `RM-REG-004`, `RM-REG-005` |
| `US-REG-002` | `RM-REG-002`, `RM-REG-006` |
| `US-REG-003` | `RM-REG-006`, `RM-REG-007`, `RM-COM-001`, `RM-COM-004` |
| `US-REG-004` | `RM-REG-007` |
| `US-UIX-001` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-UIX-004` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-UIX-005` | Aucune règle de ce premier lot directement associée — à affiner |
| `US-UIX-006` | Aucune règle de ce premier lot directement associée — à affiner |

## 3. Analyse des ambiguïtés détectées dans le backlog existant

- **`US-ACC-003` — Créer mon royaume** : sa Card doit être décomposée ou enrichie pour le placement aléatoire, `friendKey`, `spawn=near`, les refus de monde fermé, le manque de place et la concurrence. Cela renvoie à **RM-WRD-002/004/005** et **U47**. Le mode d'implantation historique n'est pas simplement « aléatoire ».
- **`US-ACC-011` — Connaître ma protection initiale** : compléter le parcours de consultation par des **règles métier de refus d'attaque** et des frontières temporelles côté serveur. La durée de sept jours reste un souvenir à qualifier, même si le produit décide de la retenir.
- **`US-REG-001` et `US-ACC-004`** : préciser grille 5×5, cité au centre, quatre **occurrences** minières, doublons possibles, états des PNJ et générateur à graine ; distinguer cas spéciaux.
- **`US-ECO-003/004`** : passer d'un crédit « conforme » à des segments temporels, une politique de fractions, un plafond selon type de crédit, et une reconnexion sans gain répété.
- **`US-CIT-004/006`** : ajouter devis catalogue daté, toutes les causes de refus, immobilisation éventuelle du héros, échéance exacte, même clé d'idempotence, rejouabilité et effet de siège.
- **`US-ARM-005/009`** : vérifier la séparation pool/recrues/achat/armées, la capacité ordonnée de sept pelotons en combat et l'exclusivité des effectifs.
- **`US-COM-002/017`** : relier préparation, résultat, pertes et rapport immuable ; ne pas clôturer une US à partir de résultats d'un oracle communautaire non validé par serveur.

**Aucune modification de statut n'est effectuée ici** : les 300 US restent à affiner. La prochaine itération d'affinage pourra scinder les grosses fiches, réécrire leurs critères et créer de nouvelles sous-US seulement si elles sont indépendantes, estimables et livrables.

## 4. Fixtures et absence d'exécution

Les **18 fixtures** du [jeu d'exemples](../../data/rules/early-game.fixtures.json) démontrent les sorties **attendues** et distinguent `catalogue_2013_reference`, `proposed_contract`, `synthetic` et `community_simulator_oracle`. Leurs scénarios sont présentés dans la [recette Gherkin](RECETTE-GHERKIN.md). Aucun moteur de domaine n'a exécuté ces cas ; leur cohérence structurelle ne vaut pas satisfaction de la DoD.
