# MMHK-like — dossier de rétroconception

**Objectif : reconstruire le fonctionnement de Might & Magic Heroes Kingdoms avant de développer son successeur jouable par navigateur.** Le présent dépôt contient un référentiel de gameplay, des spécifications fonctionnelles, des données historiques extraites et un plan de validation. Il ne contient pas encore de jeu exécutable.

Version documentaire **0.6 — 23 octobre 2026**. Recherche réalisée à partir des neuf liens fournis, de leurs archives accessibles, de guides communautaires, du code public de MMHK-Plus/Jactari et désormais de fichiers du client Ubisoft archivés. Les mécanismes retrouvés sont distingués des hypothèses et des propositions de reconstruction. **Ce dossier n’est pas une copie certifiée du serveur Ubisoft : plusieurs règles ont changé selon les saisons et certaines informations manquent.**

La révision 0.2 intègre **57 captures (53 distinctes)** et les **153 fichiers Jactari, dont 96 images**, fournis dans le dépôt. Elle confirme le périmètre **PvP classique avec Guerre des Larmes**, détaille les interfaces et relie les objets aux planches graphiques.

La révision 0.3 ajoute un **[backlog de 300 user stories](docs/backlog/README.md)**, réparties en 23 catégories et reliées aux phases de campagne. Chaque fiche comprend les 3 C, cinq critères d’acceptation, un examen INVEST, la DoD, les dépendances et les inconnues. Les 55 exigences classiques actives sont couvertes ; les scénarios restent à exécuter lors du développement.

La révision 0.4 ajoute **[29 images retrouvées sur Internet](data/assets-recovered/README.md)** : cinq scènes de ville assemblées, des fonds de monde/région, quatre planches de miniatures de bâtiments, une taverne individuelle et des éléments d'interface. Trois fichiers du client historique ont permis d'extraire **215 configurations de placement**. Les fonds de ville vides et la majorité des bâtiments individuels restent manquants. Le [rapport de recherche](docs/research/RECHERCHE-ASSETS-2026-10-23.md) distingue fichiers récupérés et pistes d'archives ; les [prochaines étapes](docs/specifications/PROCHAINES-ETAPES.md) préparent une première boucle jouable et ses stories.

La révision 0.5 analyse la [génération du monde, les sites spéciaux, le code ami et la protection débutant](docs/research/GENERATION-MONDE-RELIQUES-ARRIVEE-PROTECTION-2026-10-23.md). Elle ajoute un [outil reproductible de récupération du CDN](tools/recover-wayback-cdn.py) avec reprise et journal de provenance. **Le précédent lot de milliers de téléchargements n'est pas présent dans ce dépôt** ; l'index historique constitue une liste d'archives potentielles, et non un pack local vérifié.

La révision documentaire 0.6 consigne les **84 réponses P0** du porteur de projet : **référence S2, Havre T1–T3, 7 jours de protection, cartes toriques, économie locale et combats Jactari déterministes**. Le référentiel comporte désormais **90 règles métier** ; les décisions de projet sont séparées des preuves historiques encore incomplètes. Voir le [registre de décisions](docs/decisions/DECISIONS-P0-2026-10-23.md).

## Lire le dossier

| Besoin | Document |
| --- | --- |
| Comprendre les règles de génération et d'arrivée des joueurs | [Mines, sites, code ami et protection débutant](docs/research/GENERATION-MONDE-RELIQUES-ARRIVEE-PROTECTION-2026-10-23.md) |
| Relancer la récupération historique | [Outil Wayback](tools/recover-wayback-cdn.py) et [méthode](docs/research/RECHERCHE-ASSETS-2026-10-23.md#7-reprise-de-la-collecte-wayback-après-interruption) |
| **Algorithme de génération proposé (Q12/Q15)** | [Quatre mines, pondérations et positions expérimentales](docs/game-design/09-GENERATEUR-P0-PROPOSITIONS.md) |
| **Roadmap technique V5.4 → V7** | [Combat Jactari réel, missions horodatées, reliques, calibrage à 70 % et première version jouable](docs/game-design/23-ROADMAP-V5-4-V7.md) |
| **Suivi de conformité du moteur de combat — roadmap V6.5 → V7.0** | [Roadmap vivante (19 familles, critères de sortie, blocages)](docs/game-design/32-ROADMAP-CONFORMITE-MOTEUR-COMBAT.md), [registre JSON contrôlé par CI](data/analysis/jactari-combat-conformance-roadmap.json) ; **pas encore 100 % conforme à S2** |
| **Jactari V6.5 : première résolution dynamique des sorts** | [Pont héros → sorts au tour](tools/jactari-port/hero-spell-resolution.mjs), [tests de résolution dynamique](tools/jactari-port/hero-spell-resolution.test.mjs), [moteur de bataille unifié](tools/jactari-port/unified-battle.mjs) — **intégré, non encore certifié de bout en bout** |
| **Jactari V6.4 : vrais artefacts et magie des héros** | [Rapport V6.4](docs/game-design/31-JACTARI-V64-ARTEFACTS-ET-MAGIE-HEROS.md), [filtrage des artefacts](tools/jactari-port/artifact-spell-bonus.mjs), [comparaison originale](tools/jactari-port/historical-artifact-differential.test.mjs), [puissance magique de héros équipé](tools/jactari-port/historical-equipped-spell.test.mjs), [preuves 267/267](data/analysis/jactari-v64-equipped-artifact-spell-differential-2026-10-26.json) |
| **Jactari V6.3 : héros, talents et admission historique** | [Rapport des preuves et des lacunes](docs/game-design/30-JACTARI-V63-HEROS-ADMISSION-MODIFICATEURS.md), [600 bonus de héros contre Jactari](tools/jactari-port/historical-bonuses-differential.test.mjs), [4 000 admissions](tools/jactari-port/admission-differential.test.mjs), [83 combats avec héros](tools/jactari-port/historical-hero-encounters.test.mjs), [400 sorts](tools/jactari-port/historical-spell-power-differential.test.mjs), [CI 261/261](data/analysis/jactari-v63-hero-admission-differential-2026-10-26.json) |
| **Jactari V6.2 : affrontements historiques avec magie** | [Rapport V6.2](docs/game-design/29-JACTARI-V62-FULL-ENCOUNTER-ORACLE.md), [orchestrateur original isolé](tools/jactari-port/historical-encounter-harness.mjs), [comparateur](tools/jactari-port/historical-encounter-differential.mjs), [résultat CI 236/236](data/analysis/jactari-v62-full-encounter-differential-2026-10-24.json) — validation bornée, pas un arbitre PvP certifié |
| **Jactari V6.1 : différentiel historique multi-tours** | [Rapport et périmètre](docs/game-design/28-JACTARI-V61-HISTORICAL-SEQUENCE-DIFFERENTIAL.md), [oracle historique](tools/jactari-port/legacy-sequence-oracle.mjs), [tests](tools/jactari-port/full-round-differential.test.mjs), [résultats CI 206/206](data/analysis/jactari-v61-historical-sequence-differential-2026-10-24.json) |
| **Jactari V6.0 : orchestrateur de combat unifié** | [Neuf positions, sorts des deux camps, salves, résurrections, pertes persistantes — 128 tests locaux](docs/game-design/27-JACTARI-V60-UNIFIED-BATTLE.md), [API JavaScript](tools/jactari-port/unified-battle.mjs), [fixture](data/analysis/jactari-v60-unified-battle-demo-2026-10-24.json) |
| **Jactari V5.9 : invocations actives et préparation des sorts** | [Moteur à 9 positions, garde-fou de faction et 107 tests](docs/game-design/26-JACTARI-V59-INVOCATIONS-ET-SORTS.md), [code](tools/jactari-port/summoned-battle.mjs), [résultats](data/analysis/jactari-v59-summons-2026-10-24.json) |
| **Jactari V5.8 : clôture et invocations historiques** | [Rapport de portage](docs/game-design/25-JACTARI-V58-CLOTURE-INVOCATIONS.md), [1 700 comparaisons différentielles](data/analysis/jactari-v58-differential-2026-10-24.json), [modules et tests](tools/jactari-port/README.md) |
| **Jactari V5.7 : résurrection pendant les tours et troupes persistantes** | [Compte rendu et tests](docs/game-design/24-JACTARI-V57-RESURRECTION-ET-ARMEE-PERSISTANTE.md), [résultats structurés](data/analysis/jactari-v57-revival-differential-2026-10-24.json) |
| **Jactari : magie bilatérale et rapports de pertes** | [15 tests de sorts attaquant/défenseur, zones, buffs/debuffs](tools/jactari-port/magic-rounds.test.mjs), [5 tests de bilan des morts](tools/jactari-port/magic-report.test.mjs), [exemple reproductible](data/analysis/jactari-magic-dual-demo-2026-10-23.json) |
| **Jactari : puissance des sorts et tours** | [Modèles de puissance, séquencement et effets magiques](tools/jactari-port/README.md), [code source](tools/jactari-port/spell-power.mjs) |
| **Jactari : noyau JavaScript et 31 tests** | [Duel, bonus, salves, orchestration de 7 pelotons](tools/jactari-port/README.md), [CI Node](.github/workflows/jactari-port-test.yml) |
| **V5.3 : passerelle contrôlée aux oracles Jactari** | [Rapport et limites du premier adaptateur](docs/game-design/22-SIMULATION-V5-3-PASSERELLE-JACTARI.md), [20 assertions et données](data/analysis/v5-3-oracle-integration-2026-10-23.json) |
| **V5.2 : simulation d'ordres concurrents et entretien par peloton** | [Rapport des 30 simulations et 12 assertions](docs/game-design/21-SIMULATION-V5-2-CONCURRENCE-ORDRES.md), [résultats contrôlés](data/analysis/relic-v5-2-concurrent-order-regression-2026-10-23.json) |
| **V5/V5.1 : confrontation active autour des reliques** | [Rapport 35 scénarios + 35 contre-essais](docs/game-design/20-SIMULATION-V5-CONFLITS-ACTIFS.md), [synthèse structurée](data/analysis/relic-v5-focused-35-runs-2026-10-23.json) |
| **Simulation V4 multi-villes et économie locale** | [Rapport des 24 essais](docs/game-design/19-SIMULATION-V4-MULTIVILLES-RELIQUES.md), [résultats structurés](data/analysis/relic-v4-multicity-24-runs-2026-10-23.json) |
| **Simulation V3 des guerres de reliques** | [166 scénarios et enseignements](docs/game-design/18-SIMULATION-GUERRE-DES-RELIQUES-V3.md), [162 résultats agrégés](data/analysis/relic-wars-162-summary-2026-10-23.json), [4 conflits ciblés](data/analysis/relic-frontier-focused-2026-10-23.json) |
| **Reliques et guerres d'influence (S2)** | [Paliers documentés, fenêtre 4 jours, Sphinx/Trésoreries/Dolmens](docs/game-design/17-RELIQUES-ET-GUERRES-D-INFLUENCE.md), [catalogue des bonus](data/reference/world-influence-and-sites-2009-2013.json) |
| **Influence territoriale quotidienne et contestation** | [Modèle de moyenne glissante 4/6 jours, disques et contrôle par case](docs/game-design/16-INFLUENCE-LISSEE-ET-CONTESTEE.md), [micro-test structuré](data/analysis/influence-window-comparison-2026-10-23.json) |
| **Étudier l'économie de garnison et la colonisation** | [216 simulations V2 : influence, entretien, distance et solvabilité](docs/game-design/15-SIMULATION-ECONOMIE-INFLUENCE-V2.md), [résultats de synthèse](data/analysis/economic-territory-v2-216-scenarios-2026-10-23.json) |
| **Comparer six taux de remplissage par simulation** | [Étude de 108 scénarios à 20–100 %](docs/game-design/14-SIMULATION-REMPLISSAGE-70.md), [résultats JSON](data/analysis/occupancy-70-simulation-summary-2026-10-23.json) |
| **Dimensionner un monde à 70 % de sa capacité** | [Référence de population, surbooking et monde sous-rempli](docs/game-design/13-CALIBRAGE-70-POURCENT.md), [presets mis à jour](data/game-design/world-generator-lab.json) |
| **Simulation d'expansion territoriale et de frictions** | [Étude de densité, influence et prix hors zone](docs/game-design/12-SIMULATION-INFLUENCE-COLONISATION.md), [résultats structurés](data/analysis/territorial-friction-synthetic-2026-10-23.json) |
| **Laboratoires d'équilibrage S2** | [Hérédité 1 000 points et carte torique](docs/game-design/10-LABS-HEREDITE-MONDE.md), [générateur Node.js](tools/mmhk-world-lab.mjs), [modèle de builds](data/game-design/heritage-balance-lab.json), [tests](tools/test-mmhk-design-labs.mjs) |
| **Décisions confirmées Q01–Q84** | **[Synthèse des choix P0](docs/decisions/DECISIONS-P0-2026-10-23.md)**, [profil de référence S2](data/rules/mmhk-like-s2-policy-draft.json), [matrice questions/règles/US](data/decisions/p0-traceability.json) |
| **Règles métier early game et affinage des US** | **[Référentiel de 90 RM et 18 fixtures](docs/rules/README.md)**, [contrats métier](docs/rules/CONTRATS-EARLY-GAME.md), [affinage des US](docs/rules/AFFINAGE-US-L1.md) |
| Savoir quoi réaliser maintenant | [Prochaines étapes et premier lot de stories](docs/specifications/PROCHAINES-ETAPES.md) |
| **Suivre chaque image retrouvée/manquante** | **[Catalogue des 1 425 références](docs/research/CATALOGUE-RESSOURCES-GRAPHIQUES.md)**, [CSV](data/analysis/assets-catalog.csv), [JSON](data/analysis/assets-catalog.json) et [outil de collecte ciblée](tools/recover-wayback-assets.py) |
| Accéder aux nouveaux assets retrouvés | [Fichiers récupérés](data/assets-recovered/README.md), [recherche et limites](docs/research/RECHERCHE-ASSETS-2026-10-23.md) |
| Piloter le développement par les besoins joueur | [Backlog de 300 user stories](docs/backlog/README.md), [index complet](docs/backlog/INDEX-STORIES.md) |
| Organiser les versions et les phases de campagne | [Story map](docs/backlog/STORY-MAP.md) |
| Affiner, estimer et accepter une fonctionnalité | [3 C, INVEST et Definition of Done](docs/backlog/METHODE-ET-QUALITE.md) |
| Vérifier la couverture fonctionnelle | [Exigences vers stories](docs/backlog/COUVERTURE.md), [parcours intégrés](docs/backlog/RECETTE-PARCOURS.md) |
| Concevoir le premier royaume jouable | [Expérience early game](docs/game-design/08-EXPERIENCE-EARLY-GAME.md), [règles métier](docs/rules/README.md), [validation du lot A](docs/rules/VALIDATION.md) |
| Comprendre le jeu dans son ensemble | [Game design : vision, boucles et interfaces](docs/game-design/01-VISION-ET-BOUCLES.md) |
| Lire l’analyse image par image | [Analyse des 57 captures](docs/research/ANALYSE-CAPTURES.md) |
| Identifier les assets utilisables et manquants | [Audit Jactari et 1 317 correspondances de sprites](docs/research/AUDIT-JACTARI-ASSETS.md) |
| Reproduire le rendu et la navigation | [Interface et rendu isométrique](docs/specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md) |
| Retrouver le périmètre confirmé | [Profil PvP classique et décisions](docs/specifications/PROFIL-PVP-CLASSIQUE.md) |
| Choisir une version cohérente | [Saisons et profils de règles](docs/research/VERSIONS.md) |
| Développer villes, mines et économie | [Économie, villes, régions](docs/game-design/02-MONDE-VILLES-ECONOMIE.md) |
| Comprendre les héros, armées et sorts | [Héros et progression militaire](docs/game-design/03-HEROS-ARMEES-MAGIE.md) |
| Reproduire la résolution des batailles | [Combat et formules](docs/game-design/04-COMBAT.md) |
| Reconstituer déplacements, pillages et conquêtes | [Carte, PvP et sièges](docs/game-design/05-CARTE-PVP-SIEGES.md) |
| Reconstituer le collectif et la victoire | [Alliances, fin de monde et hérédité](docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md) |
| Retrouver les variantes et le contenu PvE | [PvE, quêtes, événements et services](docs/game-design/07-PVE-QUETES-SERVICES.md) |
| Passer aux écrans et commandes | [Spécifications fonctionnelles](docs/specifications/FONCTIONNEL.md) |
| Préparer un serveur persistant | [Domaine, événements et cohérence](docs/specifications/DOMAINE-ET-TEMPS.md) |
| Vérifier fidélité et fonctionnement | [Recette et traçabilité](docs/specifications/RECETTE.md), [validation du dossier](docs/research/VALIDATION.md) |
| Savoir ce qui manque et dans quel ordre avancer | [Incertitudes](docs/research/INCERTITUDES.md), [plan de reconstruction](docs/specifications/PLAN-DE-RECONSTRUCTION.md) |
| Retrouver chaque preuve | [Sources et méthode](docs/research/SOURCES.md) |

## Données récupérées

Une photographie reproductible de [MMHK-Plus/Jactari](https://github.com/Aendawyn/MMHK-Plus/tree/e8d862d82741986759b88012421aed8e8175e26e) fournit :

- 130 entrées d’unités, dont les T1–T7 et leurs améliorations des cinq factions du socle étudié, des engins et des PNJ ;
- 210 entrées de bâtiments de ville et 10 entrées régionales, ces dernières **incomplètes** ;
- 15 archétypes de héros, 13 carrières nommées, 74 talents en 21 groupes ;
- 36 sorts, 563 entrées d’artéfacts, 270 effets et 12 ensembles d’artéfacts.

Ces nombres sont des **entrées de catalogue**, hors sentinelles lorsqu’elles existent, et non une certification du nombre d’objets distincts disponibles sur un serveur donné. Les factions Forteresse et Donjon présentes dans les tables ne sont pas présumées jouables.

Consulter les [unités](docs/game-design/CATALOGUE-UNITES.md), [bâtiments](docs/game-design/CATALOGUE-BATIMENTS.md), [sorts et talents](docs/game-design/CATALOGUE-SORTS-TALENTS.md), ou les [JSON et leur dictionnaire](data/README.md). Les tables sont épinglées à un commit de décembre 2013 ; leur en-tête interne porte encore `v.4.1.3-MTR`, daté de mars 2013. Il faut donc les valider avant de les employer pour une reproduction d’une saison antérieure.

## Convention essentielle

`OBS-IMAGE` = visible dans une capture ; `DECISION-USER` = choix confirmé du projet ; `OBS-CODE` = observé dans un outil communautaire ; `OBS-CLIENT-ARCHIVE` = observé dans un fichier du client Ubisoft archivé ; `DOC` = décrit par une source ; `COR` = corroboré ; `HYP` = hypothèse ; `PROP` = proposition pour le nouveau jeu ; `INCONNU` = non retrouvé. Un chiffre sans version ni source ne devient pas une règle historique.

Le périmètre **confirmé par l’utilisateur** est le **PvP classique à alliances et Guerre des Larmes**, avec les vues monde/région/ville et une forte fidélité visuelle. La saison exacte des tables reste à qualifier ; tournoi S4, Arkath et défis solo sont archivés hors du socle. Aucun assemblage « saison 2 + entretien tardif + victoire saison 4 » n’est présenté comme authentique.

## Reproduire et contrôler

Node.js 18+ et Python 3, sans dépendances de projet :

```bash
node tools/extract-reference.mjs --download /tmp/mmhk-reference
python3 tools/validate.py
```

Pour une extraction hors ligne, remplacer `--download` par `--input` et fournir les fichiers originaux du [manifeste](data/source-manifest.json). Le script vérifie les empreintes avant lecture. Les contrôles portent sur les livrables et les références de données ; ils ne prétendent pas tester un moteur de jeu encore inexistant.

## Attribution et ressources graphiques

Les tables dérivées et leur extracteur conservent la licence **GPL-3.0-or-later** et les attributions Jactari, Aspirin et Aendawyn ; voir [NOTICE](data/reference/NOTICE.md). Aucune licence globale n’est imposée au reste du projet. Les ressources graphiques importées par l’utilisateur sont maintenant inventoriées dans `data/analysis` ; les fichiers historiques de `data/Jactari` et `data/Screenshots` sont conservés sans modification. Le [plan d’assets](docs/specifications/ASSETS-ET-RENOMMAGE.md) prépare les références historiques de développement et leur remplacement par un univers distinct.

## Contrôler la révision visuelle

```bash
python3 tools/audit-visual-resources.py
node tools/extract-sprite-manifest.mjs
python3 tools/validate.py
```

L’audit d’images nécessite Pillow. Ces commandes contrôlent les fichiers, empreintes, rectangles de sprites et liens documentaires ; elles ne testent pas un client de jeu. Voir le [rapport de validation](docs/research/VALIDATION.md).

## Contrôler le backlog fonctionnel

```bash
node tools/validate-backlog.mjs
```

Ce contrôle vérifie la structure des 300 fiches, leurs 1 500 critères, les dépendances, les références et les liens. Il ne lance pas le jeu. Le [rapport du backlog](docs/backlog/VALIDATION.md) distingue ces vérifications documentaires des futurs tests de gameplay. Le [JSON](data/backlog/user-stories.json) permet l’import dans un outil de suivi sans ressaisie.

## Reprendre la collecte CDN (archive personnelle)

Depuis la racine du dépôt, avec Python 3.9+ et une connexion Internet fonctionnelle :

```bash
python3 tools/recover-wayback-cdn.py --dry-run --limit 20
python3 tools/recover-wayback-cdn.py --limit 100
python3 tools/recover-wayback-cdn.py --limit 0
```

Le script est séquentiel et reprend les fichiers vérifiés grâce à un registre local. L'index de 3 906 URL a été analysé statiquement sans conflit de chemin ; cela ne préjuge pas de la disponibilité des fichiers Wayback. Pour les tests hors ligne : `python3 tools/test_recover_wayback_cdn.py`. Les résultats sont volontairement **ignorés par Git** et ne constituent pas des ressources sous licence libre. Voir [la méthode et les limites](docs/research/RECHERCHE-ASSETS-2026-10-23.md#7-reprise-de-la-collecte-wayback-après-interruption). Les URLs indexées ne garantissent pas une archive téléchargeable ; les fichiers déjà présents dans `data/assets-recovered` sont conservés séparément.
