# Livraison des User Stories — suivi vérifié au 5 novembre 2026

## Bilan et distinction des statuts

- **300 US** et **1 500 critères** au backlog.
- **4 US techniquement terminées et testées dans le laboratoire LAB**.
- **12 US livrées partiellement et testées dans ce même laboratoire**.
- **284 US non réévaluées individuellement pendant cette campagne** ; ne préjuge pas de l'absence de code (voir audit du 4 novembre).
- **0 US acceptée au regard du jeu classique PvP/Guerre des Larmes** : les oracles historiques, les inconnues et la réception des cinq critères/DoD ne sont pas tous clos.

Les états initiaux `a_affiner`, `ready=false` et `checksComplete=false` restent inchangés dans les 300 fiches. Le nouveau champ `implementationLab` décrit une livraison technique **sans faire passer un prototype pour le produit S2 final**. Les cinq CA et la DoD nécessiteront une vraie acceptation produit.

## Terminées techniquement — profil LAB

| US | Besoin | Tests, code et CI | Limite de la clôture historique |
|---|---|---|---|
| [US-ECO-003](categories/03-ECO.md#us-eco-003) | Produire hors connexion | apps/api/tests/test_economy_integration.py ; apps/api/src/mmhk_api/economy.py ; CI 42065652207 | cadences historiques et acceptation du profil classique |
| [US-REG-003](categories/05-REG.md#us-reg-003) | Libérer une case | PR #75 ; apps/api/tests/test_pve_missions_integration.py ; CI 42055391105 | PNJ spéciaux, fidélité S2 et acceptation métier des cinq CA |
| [US-REG-004](categories/05-REG.md#us-reg-004) | Exploiter une mine libérée | PR #76 ; apps/api/tests/test_lab_mine_activation.py ; CI 42065652207 | règles historiques G11, niveaux, extensions et réception produit des cinq CA |
| [US-REG-005](categories/05-REG.md#us-reg-005) | Améliorer une mine | PR #78 ; apps/api/tests/test_lab_mine_upgrades.py ; apps/api/src/mmhk_api/mine_upgrades.py ; docs/backlog/QUALITE-MINES-NIVEAUX-V106-2026-11-05.md | Niveaux réels historiques, prérequis du héros S2, modes rapide/économique, extensions et règles de cumul ; réception des cinq CA et DoD du backlog classique. |

## Partiellement livrées — profil LAB

| US | Besoin | Tests, code et CI | Écart restant |
|---|---|---|---|
| [US-ECO-002](categories/03-ECO.md#us-eco-002) | Expliquer ma production | apps/api/src/mmhk_api/worlds.py ; apps/api/tests/test_lab_mine_activation.py ; CI 42065652207 | production historique par niveau et effets des extensions |
| [US-COM-002](categories/11-COM.md#us-com-002) | Engager un combat PvE | PR #71–75 ; apps/api/tests/test_pve_missions_integration.py ; CI 42055391105 | combat complet Jactari/MMHK, progression, récompenses, magie et armées spéciales |
| [US-COM-004](categories/11-COM.md#us-com-004) | Appliquer les contre-armes | apps/api/tests/test_pve_stack_sequence.py ; CI 42065652207 | catalogue complet et bonus conditionnels de la saison cible |
| [US-COM-008](categories/11-COM.md#us-com-008) | Enchaîner les pelotons | PR #72 ; apps/api/tests/test_pve_stack_sequence.py ; CI 42025473547 | magie, héros, capacités et conformité historique de toute la séquence |
| [US-COM-010](categories/11-COM.md#us-com-010) | Départager un duel égal | docs/backlog/RECETTE-US-COM-010-2026-11-05.md ; apps/api/tests/test_jactari_duel_ending.py | oracles S2 sur magie, résurrections, faux nuls et scénarios complets |
| [US-COM-011](categories/11-COM.md#us-com-011) | Subir une fuite PvE | docs/backlog/RECETTE-US-COM-011-2026-11-05.md ; apps/api/tests/test_pve_mission_flight.py | conséquences historiques supplémentaires pour le héros |
| [US-COM-013](categories/11-COM.md#us-com-013) | Comprendre les dispersions | apps/api/tests/test_pve_casualties.py ; apps/api/tests/test_pve_stack_sequence.py | magie, invocation et exceptions documentées |
| [US-COM-014](categories/11-COM.md#us-com-014) | Calculer les morts définitives | PR #74 ; apps/api/tests/test_pve_lab_settlement.py ; CI 42035230881 | PNJ spéciaux, résurrections, bonus, oracles historiques |
| [US-COM-015](categories/11-COM.md#us-com-015) | Traiter les armées particulières | PR #75 ; apps/api/tests/test_pve_neutral_resolution.py ; CI 42055391105 | PNJ avec héros, attrition spéciale, invocations et exceptions |
| [US-COM-017](categories/11-COM.md#us-com-017) | Lire les étapes d’une bataille | apps/web/app/cities/[cityId]/missions/[missionId]/page.tsx ; CI 42065652207 | sorts, pré-tirs, blessures et rapport complet historique |
| [US-MOV-007](categories/13-MOV.md#us-mov-007) | Suivre une mission | apps/api/tests/test_pve_missions_integration.py ; CI 42065652207 | missions PvP, haltes, trêves et intégration historique |
| [US-RAP-001](categories/22-RAP.md#us-rap-001) | Retrouver mes rapports dans une boîte organisée | apps/api/src/mmhk_api/pve_missions.py ; CI 42065652207 | courrier de combat complet, historique et autres sources de gains |

## Contrôles vérifiables

- **PR #71 à #76 fusionnées**, migrations V100 à V104 et rapports de qualité correspondants.
- [CI V104, branche](https://github.com/AstrowareConception/MMHK-like/actions/runs/42065196819) : **65 tests ciblés**, **468 tests Python**, PostgreSQL, Next.js/TypeScript, 300/300.
- [CI V104, post-fusion](https://github.com/AstrowareConception/MMHK-like/actions/runs/42065652207) : **4 jobs réussis**, y compris la pile Docker/Chromium.
- [Registre exhaustif](../../data/backlog/implementation-progress-2026-11-05.csv) : 300 lignes, chacune avec code de livraison LAB distinct de son acceptation classique.
- Contrôle automatique : `node tools/validate-backlog-progress.mjs`, en plus des validateurs existants.

L'ancien [audit du 4 novembre](../../data/backlog/implementation-review-2026-11-04.csv) demeure une photographie historique non réécrite. Aucune US ne change de statut officiel par inférence automatique.
