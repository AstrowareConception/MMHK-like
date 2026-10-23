# MMHK-like — dossier de rétroconception

**Objectif : reconstruire le fonctionnement de Might & Magic Heroes Kingdoms avant de développer son successeur jouable par navigateur.** Le présent dépôt contient un référentiel de gameplay, des spécifications fonctionnelles, des données historiques extraites et un plan de validation. Il ne contient pas encore de jeu exécutable.

Version documentaire **0.4 — 23 octobre 2026**. Recherche réalisée à partir des neuf liens fournis, de leurs archives accessibles, de guides communautaires, du code public de MMHK-Plus/Jactari et désormais de fichiers du client Ubisoft archivés. Les mécanismes retrouvés sont distingués des hypothèses et des propositions de reconstruction. **Ce dossier n’est pas une copie certifiée du serveur Ubisoft : plusieurs règles ont changé selon les saisons et certaines informations manquent.**

La révision 0.2 intègre **57 captures (53 distinctes)** et les **153 fichiers Jactari, dont 96 images**, fournis dans le dépôt. Elle confirme le périmètre **PvP classique avec Guerre des Larmes**, détaille les interfaces et relie les objets aux planches graphiques.

La révision 0.3 ajoute un **[backlog de 300 user stories](docs/backlog/README.md)**, réparties en 23 catégories et reliées aux phases de campagne. Chaque fiche comprend les 3 C, cinq critères d’acceptation, un examen INVEST, la DoD, les dépendances et les inconnues. Les 55 exigences classiques actives sont couvertes ; les scénarios restent à exécuter lors du développement.

La révision 0.4 ajoute **[29 images retrouvées sur Internet](data/assets-recovered/README.md)** : cinq scènes de ville assemblées, des fonds de monde/région, quatre planches de miniatures de bâtiments, une taverne individuelle et des éléments d'interface. Trois fichiers du client historique ont permis d'extraire **215 configurations de placement**. Les fonds de ville vides et la majorité des bâtiments individuels restent manquants. Le [rapport de recherche](docs/research/RECHERCHE-ASSETS-2026-10-23.md) distingue fichiers récupérés et pistes d'archives ; les [prochaines étapes](docs/specifications/PROCHAINES-ETAPES.md) préparent une première boucle jouable et ses stories.

## Lire le dossier

| Besoin | Document |
| --- | --- |
| Savoir quoi réaliser maintenant | [Prochaines étapes et premier lot de stories](docs/specifications/PROCHAINES-ETAPES.md) |
| Accéder aux nouveaux assets retrouvés | [Fichiers récupérés](data/assets-recovered/README.md), [recherche et limites](docs/research/RECHERCHE-ASSETS-2026-10-23.md) |
| Piloter le développement par les besoins joueur | [Backlog de 300 user stories](docs/backlog/README.md), [index complet](docs/backlog/INDEX-STORIES.md) |
| Organiser les versions et les phases de campagne | [Story map](docs/backlog/STORY-MAP.md) |
| Affiner, estimer et accepter une fonctionnalité | [3 C, INVEST et Definition of Done](docs/backlog/METHODE-ET-QUALITE.md) |
| Vérifier la couverture fonctionnelle | [Exigences vers stories](docs/backlog/COUVERTURE.md), [parcours intégrés](docs/backlog/RECETTE-PARCOURS.md) |
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
