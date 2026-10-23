# Traçabilité du référentiel métier — RM, questions P0, US, inconnues

**Révision : 23 octobre 2026 (après les 84 réponses P0).** Source machine : [90 règles métier](../../data/rules/early-game.rules.json), [84 décisions originales](../../data/decisions/p0-2026-10-23.json), [mapping Q→RM→US](../../data/decisions/p0-traceability.json).

**90 règles**, **74 US distinctes référencées**, **84 questions P0 reliées à au moins une RM**. Cela représente des **contrats et choix du futur MMHK-like**, pas autant d'User Stories supplémentaires, ni autant de preuves du serveur historique Ubisoft. Les 300 US du backlog restent non implémentées et à affiner.

## 1. Règles et décisions par domaine

### monde (14 RM)

| Identifiant / comportement | État actuel | Choix P0 | US liées | Inconnues historiques |
| --- | --- | --- | --- | --- |
| `RM-WRD-001` Profil de campagne classique | `confirmed_scope` | `Q01`, `Q02`, `Q03`, `Q04`, `Q05`, `Q06` | [US-ACC-001](../backlog/categories/01-ACC.md#us-acc-001) | `U01`, `U02` |
| `RM-WRD-002` Un royaume par compte et monde | `proposed_contract` | `Q07`, `Q19` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U16`, `U47` |
| `RM-WRD-003` Sélection d'une faction jouable | `candidate_versioned` | `Q04`, `Q05` | [US-ACC-002](../backlog/categories/01-ACC.md#us-acc-002), [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U01`, `U02` |
| `RM-WRD-004` Implantation aléatoire | `historically_incomplete` | `Q09`, `Q19` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003), [US-MON-006](../backlog/categories/12-MON.md#us-mon-006) | `U47`, `U17` |
| `RM-WRD-005` Invitation et placement proche | `historically_incomplete` | `Q20`, `Q21`, `Q22` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U47` |
| `RM-WRD-006` Protection débutant horodatée | `unconfirmed_recollection` | `Q23`, `Q24`, `Q25`, `Q26` | [US-ACC-011](../backlog/categories/01-ACC.md#us-acc-011), [US-PVP-004](../backlog/categories/15-PVP.md#us-pvp-004) | `U20` |
| `RM-WRD-007` État initial du royaume | `blocked_by_evidence` | `Q11`, `Q27`, `Q28`, `Q29`, `Q30` | [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004) | `U01`, `U02`, `U17`, `U24` |
| `RM-WRD-008` Réactivation de session | `proposed_contract` | `Q82` | [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004), [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U03` |
| `RM-WRD-009` Capital initial d'hérédité équitable | `confirmed_direction_with_parameters_open` | `Q01`, `Q29` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003), [US-HER-001](../backlog/categories/07-HER.md#us-her-001) | `U35` |
| `RM-WRD-010` Carte torique et presets de population | `confirmed_direction_with_parameters_open` | `Q07`, `Q08`, `Q09` | [US-ACC-001](../backlog/categories/01-ACC.md#us-acc-001), [US-MON-001](../backlog/categories/12-MON.md#us-mon-001) | `U09`, `U17` |
| `RM-WRD-011` Population équilibrée et trois codes amis | `confirmed_direction_with_parameters_open` | `Q19`, `Q20`, `Q21`, `Q22` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U47` |
| `RM-WRD-012` Protection de sept jours et première expansion bloquée | `confirmed_direction_with_parameters_open` | `Q23`, `Q24`, `Q25`, `Q26` | [US-ACC-011](../backlog/categories/01-ACC.md#us-acc-011), [US-MON-007](../backlog/categories/12-MON.md#us-mon-007), [US-PVP-004](../backlog/categories/15-PVP.md#us-pvp-004) | `U20` |
| `RM-WRD-013` Dotation minimale et tutoriel obligatoire | `confirmed_direction_with_parameters_open` | `Q27`, `Q28`, `Q29`, `Q30`, `Q31` | [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004), [US-ACC-006](../backlog/categories/01-ACC.md#us-acc-006), [US-ACC-010](../backlog/categories/01-ACC.md#us-acc-010) | `U24`, `U38` |
| `RM-WRD-014` Colonisation soumise à l'influence et à une case libre | `confirmed_direction_with_parameters_open` | `Q10` | [US-MON-006](../backlog/categories/12-MON.md#us-mon-006), [US-MON-007](../backlog/categories/12-MON.md#us-mon-007) | `U15`, `U16` |

### region (11 RM)

| Identifiant / comportement | État actuel | Choix P0 | US liées | Inconnues historiques |
| --- | --- | --- | --- | --- |
| `RM-REG-001` Géométrie régionale | `candidate_versioned` | `Q11`, `Q15` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004) | `U17` |
| `RM-REG-002` Quatre mines ordinaires | `candidate_versioned` | `Q11`, `Q12`, `Q13` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-REG-002](../backlog/categories/05-REG.md#us-reg-002) | `U17` |
| `RM-REG-003` Sept types de ressources | `reference_observed` | `Q11`, `Q14` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-ECO-001](../backlog/categories/03-ECO.md#us-eco-001) | — |
| `RM-REG-004` Doublons de ressources possibles | `unconfirmed_recollection` | `Q12`, `Q13`, `Q14` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `U17` |
| `RM-REG-005` Monde déterministe pour les tests | `proposed_contract` | `Q12`, `Q15`, `Q18` | [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003), [US-REG-001](../backlog/categories/05-REG.md#us-reg-001) | `U17` |
| `RM-REG-006` Occupation et libération des cases | `historically_incomplete` | `Q16`, `Q17` | [US-REG-002](../backlog/categories/05-REG.md#us-reg-002), [US-REG-003](../backlog/categories/05-REG.md#us-reg-003) | `U13`, `U17` |
| `RM-REG-007` Mise en exploitation d'une mine | `historically_incomplete` | `Q39` | [US-REG-003](../backlog/categories/05-REG.md#us-reg-003), [US-REG-004](../backlog/categories/05-REG.md#us-reg-004) | `U17`, `U03` |
| `RM-REG-008` Sites spéciaux séparés | `historically_incomplete` | `Q18` | [US-REL-001](../backlog/categories/06-REL.md#us-rel-001), [US-MON-001](../backlog/categories/12-MON.md#us-mon-001) | `U17`, `U33` |
| `RM-REG-009` Quatre mines équilibrées de type au plus doublé | `confirmed_direction_with_parameters_open` | `Q11`, `Q12`, `Q13`, `Q14`, `Q15` | [US-REG-001](../backlog/categories/05-REG.md#us-reg-001), [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004) | `U17` |
| `RM-REG-010` Croissance des PNJ selon éloignement et retour sur case inutilisée | `confirmed_direction_with_parameters_open` | `Q16`, `Q17` | [US-REG-002](../backlog/categories/05-REG.md#us-reg-002), [US-REG-003](../backlog/categories/05-REG.md#us-reg-003) | `U17`, `U39` |
| `RM-REG-011` Espacement des sites spéciaux et équilibre des types | `confirmed_direction_with_parameters_open` | `Q18` | [US-REL-001](../backlog/categories/06-REL.md#us-rel-001), [US-MON-001](../backlog/categories/12-MON.md#us-mon-001) | `U17` |

### economie (16 RM)

| Identifiant / comportement | État actuel | Choix P0 | US liées | Inconnues historiques |
| --- | --- | --- | --- | --- |
| `RM-ECO-001` Ledger local par cité | `proposed_contract` | `Q35`, `Q36`, `Q37` | [US-ECO-001](../backlog/categories/03-ECO.md#us-eco-001), [US-ECO-006](../backlog/categories/03-ECO.md#us-eco-006) | `U30` |
| `RM-ECO-002` Production hors connexion | `historically_incomplete` | `Q32`, `Q33`, `Q37` | [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U03`, `U04` |
| `RM-ECO-003` Changement de rendement en cours de période | `proposed_contract` | `Q32`, `Q34`, `Q39` | [US-ECO-002](../backlog/categories/03-ECO.md#us-eco-002), [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U03`, `U04` |
| `RM-ECO-004` Plafond de stockage | `historically_incomplete` | `Q35`, `Q36`, `Q37`, `Q38` | [US-ECO-004](../backlog/categories/03-ECO.md#us-eco-004), [US-ECO-010](../backlog/categories/03-ECO.md#us-eco-010) | `U04`, `U30` |
| `RM-ECO-005` Dépense atomique | `proposed_contract` | `Q47` | [US-ECO-005](../backlog/categories/03-ECO.md#us-eco-005), [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004) | `U14` |
| `RM-ECO-006` Disponibilité et réservations | `proposed_contract` | `Q35`, `Q47` | [US-ECO-006](../backlog/categories/03-ECO.md#us-eco-006) | `U28`, `U30` |
| `RM-ECO-007` Rendement administratif non cumulatif | `candidate_versioned` | `Q51` | [US-CIT-008](../backlog/categories/02-CIT.md#us-cit-008), [US-ECO-002](../backlog/categories/03-ECO.md#us-eco-002) | `U02`, `U03` |
| `RM-ECO-008` Barème de mine comme référence candidate | `candidate_versioned` | `Q39`, `Q40` | [US-REG-005](../backlog/categories/05-REG.md#us-reg-005), [US-REG-006](../backlog/categories/05-REG.md#us-reg-006), [US-ECO-002](../backlog/categories/03-ECO.md#us-eco-002) | `U03`, `U04`, `U17` |
| `RM-ECO-009` Extension de mine et production | `candidate_versioned` | `Q39` | [US-REG-005](../backlog/categories/05-REG.md#us-reg-005), [US-REG-006](../backlog/categories/05-REG.md#us-reg-006) | `U03`, `U17` |
| `RM-ECO-010` Entretien militaire et insolvabilité | `blocked_by_evidence` | `Q41`, `Q42`, `Q43` | [US-ECO-007](../backlog/categories/03-ECO.md#us-eco-007), [US-ECO-008](../backlog/categories/03-ECO.md#us-eco-008), [US-ECO-009](../backlog/categories/03-ECO.md#us-eco-009) | `U07`, `U08` |
| `RM-ECO-011` Traçabilité du solde | `proposed_contract` | `Q32`, `Q38` | [US-ECO-012](../backlog/categories/03-ECO.md#us-eco-012), [US-ECO-001](../backlog/categories/03-ECO.md#us-eco-001) | `U30` |
| `RM-ECO-012` Production périodique avec fractions conservées | `confirmed_direction_with_parameters_open` | `Q32`, `Q33`, `Q34` | [US-ECO-002](../backlog/categories/03-ECO.md#us-eco-002), [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U03`, `U04` |
| `RM-ECO-013` Stocks locaux, surplus de production perdu et caravanes sûres | `confirmed_direction_with_parameters_open` | `Q35`, `Q36`, `Q37` | [US-ECO-004](../backlog/categories/03-ECO.md#us-eco-004), [US-ECH-012](../backlog/categories/04-ECH.md#us-ech-012) | `U28`, `U30` |
| `RM-ECO-014` Récompenses de quêtes différées | `confirmed_direction_with_parameters_open` | `Q38` | [US-ACC-010](../backlog/categories/01-ACC.md#us-acc-010), [US-ECO-010](../backlog/categories/03-ECO.md#us-eco-010) | `U30`, `U38` |
| `RM-ECO-015` Mines automatiquement productives après libération | `confirmed_direction_with_parameters_open` | `Q39`, `Q40` | [US-REG-004](../backlog/categories/05-REG.md#us-reg-004), [US-REG-005](../backlog/categories/05-REG.md#us-reg-005), [US-REG-009](../backlog/categories/05-REG.md#us-reg-009) | `U17` |
| `RM-ECO-016` Entretien horaire et attrition des impayés | `confirmed_direction_with_parameters_open` | `Q41`, `Q42`, `Q43` | [US-ECO-007](../backlog/categories/03-ECO.md#us-eco-007), [US-ECO-008](../backlog/categories/03-ECO.md#us-eco-008), [US-ECO-009](../backlog/categories/03-ECO.md#us-eco-009) | `U07`, `U08` |

### construction (12 RM)

| Identifiant / comportement | État actuel | Choix P0 | US liées | Inconnues historiques |
| --- | --- | --- | --- | --- |
| `RM-CIT-001` Catalogue par faction et saison | `candidate_versioned` | `Q01`, `Q02`, `Q40` | [US-CIT-002](../backlog/categories/02-CIT.md#us-cit-002), [US-CIT-003](../backlog/categories/02-CIT.md#us-cit-003) | `U02` |
| `RM-CIT-002` Préconditions de bâtiment | `candidate_versioned` | `Q44`, `Q50` | [US-CIT-003](../backlog/categories/02-CIT.md#us-cit-003), [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004) | `U02`, `U05` |
| `RM-CIT-003` Ouverture d'un chantier | `proposed_contract` | `Q44`, `Q45`, `Q47` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005) | `U05` |
| `RM-CIT-004` Files de construction | `blocked_by_evidence` | `Q44`, `Q45`, `Q46` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005) | `U05` |
| `RM-CIT-005` Fin et effet de chantier | `proposed_contract` | `Q51`, `Q52` | [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `U05`, `U19` |
| `RM-CIT-006` Chaîne administrative exclusive | `candidate_versioned` | `Q50`, `Q51` | [US-CIT-007](../backlog/categories/02-CIT.md#us-cit-007), [US-CIT-008](../backlog/categories/02-CIT.md#us-cit-008) | `U02` |
| `RM-CIT-007` Annulation et remboursement | `blocked_by_evidence` | `Q47`, `Q48` | [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005), [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004) | `U05`, `U19` |
| `RM-CIT-008` Construction sous siège | `historically_incomplete` | `Q52`, `Q53` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `U19`, `U14` |
| `RM-CIT-009` Chantier urbain unique et chantiers régionaux mobilisateurs | `confirmed_project_rule` | `Q44`, `Q45`, `Q46` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-REG-008](../backlog/categories/05-REG.md#us-reg-008), [US-HER-003](../backlog/categories/07-HER.md#us-her-003) | `U05` |
| `RM-CIT-010` Coût prélevé au départ, sans annulation et modes de vitesse urbains | `confirmed_direction_with_parameters_open` | `Q47`, `Q48`, `Q49` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005), [US-CIT-007](../backlog/categories/02-CIT.md#us-cit-007) | `U05` |
| `RM-CIT-011` Niveau de cité et remplacement des effets | `confirmed_direction_with_parameters_open` | `Q50`, `Q51` | [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006), [US-CIT-008](../backlog/categories/02-CIT.md#us-cit-008) | `U02` |
| `RM-CIT-012` Siège et effets des prérequis détruits | `confirmed_project_rule` | `Q52`, `Q53` | [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006), [US-SIE-007](../backlog/categories/16-SIE.md#us-sie-007) | `U19`, `U21` |

### heros (10 RM)

| Identifiant / comportement | État actuel | Choix P0 | US liées | Inconnues historiques |
| --- | --- | --- | --- | --- |
| `RM-HER-001` Identité et progression du héros | `candidate_versioned` | `Q57`, `Q58` | [US-HER-001](../backlog/categories/07-HER.md#us-her-001), [US-HER-002](../backlog/categories/07-HER.md#us-her-002) | `U25` |
| `RM-HER-002` Disponibilité exclusive | `proposed_contract` | `Q46`, `Q60` | [US-HER-003](../backlog/categories/07-HER.md#us-her-003), [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009) | `U05`, `U09` |
| `RM-HER-003` Recrutement de héros et offres | `historically_incomplete` | `Q29`, `Q54`, `Q55`, `Q56` | [US-HER-003](../backlog/categories/07-HER.md#us-her-003) | `U24` |
| `RM-HER-004` Héros initial non présumé | `blocked_by_evidence` | `Q29` | [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004), [US-HER-001](../backlog/categories/07-HER.md#us-her-001) | `U24`, `U25` |
| `RM-HER-005` Préparation des carrières et talents | `candidate_versioned` | `Q58`, `Q59` | [US-HER-009](../backlog/categories/07-HER.md#us-her-009), [US-HER-011](../backlog/categories/07-HER.md#us-her-011) | `U25` |
| `RM-HER-006` Inventaire de héros distinct | `reference_observed` | `Q61`, `Q62` | [US-HER-012](../backlog/categories/07-HER.md#us-her-012), [US-ART-003](../backlog/categories/10-ART.md#us-art-003) | `U27` |
| `RM-HER-007` Taverne et progression de héros S2 | `confirmed_direction_with_parameters_open` | `Q29`, `Q54`, `Q55`, `Q56`, `Q57` | [US-HER-003](../backlog/categories/07-HER.md#us-her-003), [US-HER-002](../backlog/categories/07-HER.md#us-her-002) | `U24`, `U25` |
| `RM-HER-008` Carrières progressives et bonus dépendant de la présence | `confirmed_direction_with_parameters_open` | `Q58`, `Q59`, `Q60` | [US-HER-009](../backlog/categories/07-HER.md#us-her-009), [US-HER-011](../backlog/categories/07-HER.md#us-her-011) | `U25` |
| `RM-HER-009` Inventaires, artéfacts et butin de siège | `confirmed_direction_with_parameters_open` | `Q61`, `Q62` | [US-ART-003](../backlog/categories/10-ART.md#us-art-003), [US-ART-005](../backlog/categories/10-ART.md#us-art-005) | `U27` |
| `RM-HER-010` Guildes de magie et sorts préparés | `confirmed_direction_with_parameters_open` | `Q63` | [US-MAG-004](../backlog/categories/08-MAG.md#us-mag-004), [US-MAG-005](../backlog/categories/08-MAG.md#us-mag-005) | `U26` |

### armees (10 RM)

| Identifiant / comportement | État actuel | Choix P0 | US liées | Inconnues historiques |
| --- | --- | --- | --- | --- |
| `RM-ARM-001` Composition des sept pelotons | `candidate_versioned` | `Q68` | [US-ARM-008](../backlog/categories/09-ARM.md#us-arm-008), [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009) | `U18` |
| `RM-ARM-002` Lignées et factions | `candidate_versioned` | `Q05`, `Q30`, `Q68` | [US-ARM-002](../backlog/categories/09-ARM.md#us-arm-002), [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005) | `U02`, `U06` |
| `RM-ARM-003` Production de recrues ≠ achat d'unités | `historically_incomplete` | `Q64`, `Q65` | [US-ARM-003](../backlog/categories/09-ARM.md#us-arm-003), [US-ARM-004](../backlog/categories/09-ARM.md#us-arm-004), [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005) | `U06`, `U03` |
| `RM-ARM-004` Prix de recrutement des unités | `candidate_versioned` | `Q66` | [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005) | `U06` |
| `RM-ARM-005` Puissance brute | `reference_observed` | `Q68` | [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009), [US-COM-001](../backlog/categories/11-COM.md#us-com-001) | `U11` |
| `RM-ARM-006` Affectation et engagement uniques | `proposed_contract` | `Q66` | [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005), [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009), [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | `U14` |
| `RM-ARM-007` Améliorations d'unités | `historically_incomplete` | `Q67` | [US-ARM-006](../backlog/categories/09-ARM.md#us-arm-006), [US-ARM-007](../backlog/categories/09-ARM.md#us-arm-007) | `U06` |
| `RM-ARM-008` Recrutement récurrent | `blocked_by_evidence` | `Q64`, `Q65` | [US-ARM-003](../backlog/categories/09-ARM.md#us-arm-003), [US-ARM-004](../backlog/categories/09-ARM.md#us-arm-004) | `U06` |
| `RM-ARM-009` Recrues horaires et stocks partagés par tier | `confirmed_project_rule` | `Q64`, `Q65` | [US-ARM-003](../backlog/categories/09-ARM.md#us-arm-003), [US-ARM-004](../backlog/categories/09-ARM.md#us-arm-004), [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005) | `U06` |
| `RM-ARM-010` Recrutement immédiat et amélioration d'une pile entière | `confirmed_project_rule` | `Q66`, `Q67`, `Q68` | [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005), [US-ARM-006](../backlog/categories/09-ARM.md#us-arm-006), [US-ARM-007](../backlog/categories/09-ARM.md#us-arm-007), [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009) | `U06` |

### combat (9 RM)

| Identifiant / comportement | État actuel | Choix P0 | US liées | Inconnues historiques |
| --- | --- | --- | --- | --- |
| `RM-COM-001` Départ PvE admissible | `historically_incomplete` | `Q69`, `Q70`, `Q80` | [US-COM-002](../backlog/categories/11-COM.md#us-com-002), [US-REG-003](../backlog/categories/05-REG.md#us-reg-003) | `U09`, `U13`, `U17` |
| `RM-COM-002` Contre-armes cycliques | `candidate_versioned` | `Q69`, `Q70`, `Q71` | [US-COM-004](../backlog/categories/11-COM.md#us-com-004) | `U11` |
| `RM-COM-003` Phases de résolution | `candidate_versioned` | `Q69`, `Q70`, `Q74` | [US-COM-001](../backlog/categories/11-COM.md#us-com-001), [US-COM-008](../backlog/categories/11-COM.md#us-com-008), [US-COM-014](../backlog/categories/11-COM.md#us-com-014), [US-COM-017](../backlog/categories/11-COM.md#us-com-017) | `U11`, `U13`, `U42` |
| `RM-COM-004` Résultat et libération conditionnelle | `proposed_contract` | `Q69`, `Q75` | [US-REG-003](../backlog/categories/05-REG.md#us-reg-003), [US-COM-017](../backlog/categories/11-COM.md#us-com-017) | `U11`, `U13` |
| `RM-COM-005` Pertes, morts définitives et XP | `historically_incomplete` | `Q69`, `Q73`, `Q74`, `Q78` | [US-COM-013](../backlog/categories/11-COM.md#us-com-013), [US-COM-014](../backlog/categories/11-COM.md#us-com-014), [US-COM-016](../backlog/categories/11-COM.md#us-com-016) | `U11`, `U13`, `U42` |
| `RM-COM-006` Rapport de bataille reproductible | `proposed_contract` | `Q79` | [US-COM-017](../backlog/categories/11-COM.md#us-com-017), [US-RAP-001](../backlog/categories/22-RAP.md#us-rap-001) | `U41` |
| `RM-COM-007` Aucun combat tactique au clic | `reference_observed` | `Q76`, `Q77` | [US-COM-001](../backlog/categories/11-COM.md#us-com-001), [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | — |
| `RM-COM-008` Combat déterministe et simulateur Jactari | `confirmed_direction_with_parameters_open` | `Q69`, `Q70`, `Q71`, `Q72`, `Q73`, `Q74`, `Q76`, `Q77` | [US-COM-001](../backlog/categories/11-COM.md#us-com-001), [US-COM-004](../backlog/categories/11-COM.md#us-com-004), [US-COM-010](../backlog/categories/11-COM.md#us-com-010), [US-COM-018](../backlog/categories/11-COM.md#us-com-018) | `U11`, `U12`, `U13`, `U42` |
| `RM-COM-009` Blessure et rapport détaillé | `confirmed_direction_with_parameters_open` | `Q75`, `Q78`, `Q79` | [US-COM-016](../backlog/categories/11-COM.md#us-com-016), [US-COM-017](../backlog/categories/11-COM.md#us-com-017), [US-RAP-001](../backlog/categories/22-RAP.md#us-rap-001) | `U13`, `U41` |

### temps (8 RM)

| Identifiant / comportement | État actuel | Choix P0 | US liées | Inconnues historiques |
| --- | --- | --- | --- | --- |
| `RM-TIM-001` Horloge serveur et fuseau | `proposed_contract` | `Q06`, `Q82` | [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003), [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005), [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | `U03`, `U10` |
| `RM-TIM-002` Idempotence des commandes | `proposed_contract` | `Q81`, `Q82` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005), [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `U14` |
| `RM-TIM-003` Simultanéité et ordre déterministe | `blocked_by_evidence` | `Q81` | [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006), [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | `U14` |
| `RM-TIM-004` Reprise après arrêt serveur | `proposed_contract` | `Q82` | [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003), [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `U14`, `U03` |
| `RM-TIM-005` Horloge de test et trêve nocturne | `confirmed_direction_with_parameters_open` | `Q06`, `Q82` | [US-MOV-004](../backlog/categories/13-MOV.md#us-mov-004), [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003), [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `U10`, `U14` |
| `RM-TIM-006` Rappel pendant l'aller et halte attaquable | `confirmed_direction_with_parameters_open` | `Q80`, `Q83` | [US-MOV-003](../backlog/categories/13-MOV.md#us-mov-003), [US-MOV-005](../backlog/categories/13-MOV.md#us-mov-005), [US-MOV-006](../backlog/categories/13-MOV.md#us-mov-006) | `U09`, `U10` |
| `RM-TIM-007` Concurrence sans ordre métier prédéfini | `confirmed_project_rule` | `Q81` | [US-COM-002](../backlog/categories/11-COM.md#us-com-002), [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `U14` |
| `RM-TIM-008` Absence de programmation automatique | `confirmed_direction_with_parameters_open` | `Q84` | [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004), [US-ECH-013](../backlog/categories/04-ECH.md#us-ech-013) | `U28` |

## 2. Couverture du premier parcours

Le [premier lot de développement](../../data/analysis/first-playable-story-selection.json) conserve **16 US pivots** et **37 US avec dépendances**. Parmi ces 37 fiches, **27** possèdent une association directe à une règle, et **10** ne sont pas directement référencées. Leur absence ne signifie pas qu'elles soient sorties du périmètre : plusieurs concernent le rendu, la navigation, les structures de cité ou l'administration de l'armée.

| US | Règles liées dans l'état courant |
| --- | --- |
| [US-ACC-001](../backlog/categories/01-ACC.md#us-acc-001) | `RM-WRD-001`, `RM-WRD-010` |
| [US-ACC-002](../backlog/categories/01-ACC.md#us-acc-002) | `RM-WRD-003` |
| [US-ACC-003](../backlog/categories/01-ACC.md#us-acc-003) | `RM-WRD-002`, `RM-WRD-003`, `RM-WRD-004`, `RM-WRD-005`, `RM-REG-004`, `RM-REG-005`, `RM-WRD-009`, `RM-WRD-011` |
| [US-ACC-004](../backlog/categories/01-ACC.md#us-acc-004) | `RM-WRD-007`, `RM-WRD-008`, `RM-REG-001`, `RM-HER-004`, `RM-WRD-013`, `RM-REG-009` |
| [US-ACC-005](../backlog/categories/01-ACC.md#us-acc-005) | À affiner séparément, hors rattachement direct RM |
| [US-ARM-001](../backlog/categories/09-ARM.md#us-arm-001) | À affiner séparément, hors rattachement direct RM |
| [US-ARM-003](../backlog/categories/09-ARM.md#us-arm-003) | `RM-ARM-003`, `RM-ARM-008`, `RM-ARM-009` |
| [US-ARM-004](../backlog/categories/09-ARM.md#us-arm-004) | `RM-ARM-003`, `RM-ARM-008`, `RM-ARM-009` |
| [US-ARM-005](../backlog/categories/09-ARM.md#us-arm-005) | `RM-ARM-002`, `RM-ARM-003`, `RM-ARM-004`, `RM-ARM-006`, `RM-TIM-002`, `RM-ARM-009`, `RM-ARM-010` |
| [US-ARM-008](../backlog/categories/09-ARM.md#us-arm-008) | `RM-ARM-001` |
| [US-ARM-009](../backlog/categories/09-ARM.md#us-arm-009) | `RM-HER-002`, `RM-ARM-001`, `RM-ARM-005`, `RM-ARM-006`, `RM-ARM-010` |
| [US-CIT-001](../backlog/categories/02-CIT.md#us-cit-001) | À affiner séparément, hors rattachement direct RM |
| [US-CIT-002](../backlog/categories/02-CIT.md#us-cit-002) | `RM-CIT-001` |
| [US-CIT-003](../backlog/categories/02-CIT.md#us-cit-003) | `RM-CIT-001`, `RM-CIT-002` |
| [US-CIT-004](../backlog/categories/02-CIT.md#us-cit-004) | `RM-ECO-005`, `RM-CIT-002`, `RM-CIT-003`, `RM-CIT-004`, `RM-CIT-007`, `RM-CIT-008`, `RM-TIM-002`, `RM-CIT-009`, `RM-CIT-010`, `RM-TIM-008` |
| [US-CIT-005](../backlog/categories/02-CIT.md#us-cit-005) | `RM-CIT-003`, `RM-CIT-004`, `RM-CIT-007`, `RM-TIM-001`, `RM-CIT-010` |
| [US-CIT-006](../backlog/categories/02-CIT.md#us-cit-006) | `RM-CIT-005`, `RM-CIT-008`, `RM-TIM-003`, `RM-TIM-004`, `RM-CIT-011`, `RM-CIT-012`, `RM-TIM-005`, `RM-TIM-007` |
| [US-CIT-009](../backlog/categories/02-CIT.md#us-cit-009) | À affiner séparément, hors rattachement direct RM |
| [US-CIT-013](../backlog/categories/02-CIT.md#us-cit-013) | À affiner séparément, hors rattachement direct RM |
| [US-COM-001](../backlog/categories/11-COM.md#us-com-001) | `RM-ARM-005`, `RM-COM-003`, `RM-COM-007`, `RM-COM-008` |
| [US-COM-002](../backlog/categories/11-COM.md#us-com-002) | `RM-ARM-006`, `RM-COM-001`, `RM-COM-007`, `RM-TIM-001`, `RM-TIM-003`, `RM-TIM-007` |
| [US-COM-017](../backlog/categories/11-COM.md#us-com-017) | `RM-COM-003`, `RM-COM-004`, `RM-COM-006`, `RM-COM-009` |
| [US-ECO-001](../backlog/categories/03-ECO.md#us-eco-001) | `RM-REG-003`, `RM-ECO-001`, `RM-ECO-011` |
| [US-ECO-003](../backlog/categories/03-ECO.md#us-eco-003) | `RM-WRD-008`, `RM-ECO-002`, `RM-ECO-003`, `RM-TIM-001`, `RM-TIM-002`, `RM-TIM-004`, `RM-ECO-012`, `RM-TIM-005` |
| [US-HER-001](../backlog/categories/07-HER.md#us-her-001) | `RM-HER-001`, `RM-HER-004`, `RM-WRD-009` |
| [US-HER-002](../backlog/categories/07-HER.md#us-her-002) | `RM-HER-001`, `RM-HER-007` |
| [US-HER-003](../backlog/categories/07-HER.md#us-her-003) | `RM-HER-002`, `RM-HER-003`, `RM-CIT-009`, `RM-HER-007` |
| [US-RAP-001](../backlog/categories/22-RAP.md#us-rap-001) | `RM-COM-006`, `RM-COM-009` |
| [US-RAP-009](../backlog/categories/22-RAP.md#us-rap-009) | À affiner séparément, hors rattachement direct RM |
| [US-REG-001](../backlog/categories/05-REG.md#us-reg-001) | `RM-REG-001`, `RM-REG-002`, `RM-REG-003`, `RM-REG-004`, `RM-REG-005`, `RM-REG-009` |
| [US-REG-002](../backlog/categories/05-REG.md#us-reg-002) | `RM-REG-002`, `RM-REG-006`, `RM-REG-010` |
| [US-REG-003](../backlog/categories/05-REG.md#us-reg-003) | `RM-REG-006`, `RM-REG-007`, `RM-COM-001`, `RM-COM-004`, `RM-REG-010` |
| [US-REG-004](../backlog/categories/05-REG.md#us-reg-004) | `RM-REG-007`, `RM-ECO-015` |
| [US-UIX-001](../backlog/categories/23-UIX.md#us-uix-001) | À affiner séparément, hors rattachement direct RM |
| [US-UIX-004](../backlog/categories/23-UIX.md#us-uix-004) | À affiner séparément, hors rattachement direct RM |
| [US-UIX-005](../backlog/categories/23-UIX.md#us-uix-005) | À affiner séparément, hors rattachement direct RM |
| [US-UIX-006](../backlog/categories/23-UIX.md#us-uix-006) | À affiner séparément, hors rattachement direct RM |
 
## 3. Retouches nécessaires du backlog avant de marquer une US prête

Le référentiel ne remplace pas les [fiches 3C/INVEST/DoD](../backlog/METHODE-ET-QUALITE.md). Il faut rapprocher leurs conversations et confirmations de la [décision P0 correspondante](../decisions/DECISIONS-P0-2026-10-23.md). En particulier :

- **ACC-003 / ACC-011 :** trois codes amis, distances ajustables, expansion géographique, sept jours irrévocables, seconde colonie interdite, protections permanentes de dernière cité, contrôle serveur des envois.
- **REG-001 / REG-002 / REG-003 :** région 5×5, mine de faction garantie au départ, trois/quatre types ailleurs, une paire de doublons au plus, PNJ plus forts en périphérie, retour possible sur case inutilisée.
- **ECO-003 / ECO-004 / ECO-008 / ECO-009 :** fractions conservées, cadence périodique, bonus additifs, perte du surplus, entretien horaire du lieu de stationnement et attrition de 10 % lors d'une échéance impayée.
- **CIT-004 / CIT-005 / CIT-006 :** chantier urbain unique sans héros, chantiers régionaux mobilisant les héros, impossibilité d'annuler, options rapides/économiques en ville uniquement, construction suspendue aux restrictions de siège.
- **HER-003 / HER-009 / MAG-004 :** héros initial, taverne deux offres/12 h/maximum 15 héros, trois carrières progressives, bonus passifs seulement en ville, apprentissage de magie par guildes.
- **ARM-005 / ARM-006 / ARM-009 :** pool de recrues partagé, gains horaires, achat instantané, amélioration immédiate des piles entières et sept pelotons de combat.
- **COM-002 / COM-017 / RAP-001 :** combat entièrement déterministe, Jactari comme oracle principal sous réserve d'anomalies documentées, blessures de héros dépendant du niveau et rapports complets.
- **MOV-003 / MOV-004 :** trêve nocturne 23–6, rappel aller, retour à durée égale, haltes attaquables et concurrence des événements sans priorité métier prédéfinie.

**Aucune fiche n'est automatiquement Ready** : les valeurs de coûts, probabilités, capacités, seuils, formule S2 d'entretien et réglages complémentaires demandent encore des preuves ou des arbitrages. Référence du [plan d'affinage](AFFINAGE-US-L1.md) et des [décisions encore ouvertes](../decisions/DECISIONS-P0-2026-10-23.md#précisions-réellement-utiles-à-demander).
