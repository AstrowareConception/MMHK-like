# Backlog fonctionnel — 300 user stories

**Périmètre : PvP classique avec Guerre des Larmes.** Ce dossier fournit **300 fiches complètes dans 23 catégories**, avec une seconde lecture par early game, mid game, end game et après-campagne. Les phases sont des étiquettes : une même fiche n’est pas comptée plusieurs fois.

Chaque fiche contient la formulation « En tant que…, je souhaite… afin de… », les **3 C**, **cinq critères d’acceptation** (trois propres au parcours et deux transversaux), un examen **INVEST**, les dépendances, sources, incertitudes et la **Definition of Done** applicable.

**Statut : backlog préparé pour l’affinage.** Aucune fiche n’est déclarée développée, estimée ou acceptée. Les 1 500 critères sont spécifiés ; aucun test de gameplay n’a été exécuté à cette étape. Les preuves existantes documentent des mécanismes mais ne certifient pas toutes les valeurs de la saison cible.

## Parcours de lecture

| Besoin | Accès |
| --- | --- |
| Choisir un domaine et lire ses fiches | Tableau des 23 catégories ci-dessous |
| Retrouver une fiche, sa priorité et ses phases | [Index des 300 stories](INDEX-STORIES.md) |
| Comprendre les 3 C, INVEST et les conditions de fin | [Méthode et qualité](METHODE-ET-QUALITE.md) |
| Organiser early, mid et end game | [Story map et tranches de livraison](STORY-MAP.md) |
| Vérifier qu’aucune exigence classique n’est oubliée | [Couverture des exigences et inconnues](COUVERTURE.md) |
| Valider des parcours complets entre domaines | [Recette des parcours intégrés](RECETTE-PARCOURS.md) |
| Importer les fiches dans un outil de suivi | [Données JSON structurées](../../data/backlog/user-stories.json) |
| Reproduire les contrôles documentaires | [Validation](VALIDATION.md), [validateur](../../tools/validate-backlog.mjs) |

## Catégories de gameplay

| Catégorie | Nombre de US | Fiches |
| --- | --- | --- |
| Accueil, early game et quêtes | 12 | [ACC — ouvrir](categories/01-ACC.md) |
| Gestion de la ville et constructions | 16 | [CIT — ouvrir](categories/02-CIT.md) |
| Économie, ressources et stockage | 12 | [ECO — ouvrir](categories/03-ECO.md) |
| Commerce, marché et caravanes | 18 | [ECH — ouvrir](categories/04-ECH.md) |
| Actions sur la carte région | 12 | [REG — ouvrir](categories/05-REG.md) |
| Reliques, sphinx, obélisques et sites | 10 | [REL — ouvrir](categories/06-REL.md) |
| Gestion du héros et carrières | 18 | [HER — ouvrir](categories/07-HER.md) |
| Magie et programmation des sorts | 12 | [MAG — ouvrir](categories/08-MAG.md) |
| Recrutement, unités et armées | 16 | [ARM — ouvrir](categories/09-ARM.md) |
| Artefacts et inventaires | 14 | [ART — ouvrir](categories/10-ART.md) |
| Combat et résolution des batailles | 18 | [COM — ouvrir](categories/11-COM.md) |
| Actions sur la carte du monde | 10 | [MON — ouvrir](categories/12-MON.md) |
| Déplacements, haltes et renforts | 12 | [MOV — ouvrir](categories/13-MOV.md) |
| Reconnaissance, espionnage et prisonniers | 10 | [ESP — ouvrir](categories/14-ESP.md) |
| Pillage et affrontements territoriaux | 10 | [PVP — ouvrir](categories/15-PVP.md) |
| Sièges, bombardements et conquêtes | 14 | [SIE — ouvrir](categories/16-SIE.md) |
| Alliances, membres et compétences | 14 | [ALL — ouvrir](categories/17-ALL.md) |
| Diplomatie et coordination | 8 | [DIP — ouvrir](categories/18-DIP.md) |
| Classements et voies de progression | 12 | [CLA — ouvrir](categories/19-CLA.md) |
| Guerre des Larmes et monuments | 24 | [LAR — ouvrir](categories/20-LAR.md) |
| End game, clôture et hérédité | 12 | [FIN — ouvrir](categories/21-FIN.md) |
| Rapports, courrier et récompenses | 10 | [RAP — ouvrir](categories/22-RAP.md) |
| Navigation, lisibilité et continuité | 6 | [UIX — ouvrir](categories/23-UIX.md) |

**Total : 300 fiches uniques.** Le mot « reliques » regroupe ici les sites fixes demandés — sphinx, dolmen, obélisque, etc. — distincts des artefacts transportables et des Larmes/monuments.

## Utilisation pour le développement

1. Choisir une tranche jouable dans la story map.
2. Lire les fiches et leurs dépendances ; qualifier les inconnues qui changent les résultats attendus.
3. Réunir produit, développement et validation pour la Conversation ; compléter les exemples de test puis estimer.
4. Développer le parcours et vérifier ses critères ainsi que la DoD commune.
5. Consigner l’acceptation et le niveau de fidélité atteint ; mettre à jour JSON et fiches ensemble.

Les priorités sont **proposées**, sans calendrier : P0 : 172 ; P1 : 112 ; P2 : 16. Les services conditionnels et propositions d’interface ne doivent pas être activés automatiquement pour atteindre le nombre de 300.

## Couverture et limites

Les **55 exigences actives** du référentiel fonctionnel sont reliées à au moins une fiche. Les deux exigences archivées Arkath et tournoi S4 sont exclues du socle classique. Ce taux mesure la traçabilité des exigences connues, pas l’exhaustivité certifiée du jeu d’origine.

Répartition de la preuve principale : `PROP` : 44 ; `OBS-CODE` : 50 ; `DOC` : 158 ; `COR` : 12 ; `OBS-IMAGE` : 25 ; `HYP` : 11. Une fiche documentée peut également proposer des garanties de cohérence ou une présentation à arbitrer ; voir sa Conversation.

Les grandes inconnues restent la saison numérique exacte, les files de construction, recrutement et entretien, la géométrie des trajets, plusieurs seuils de combat, la simultanéité, les transitions des Larmes et l’hérédité. Elles sont reliées aux fiches dans la couverture. Les décors et bâtiments historiques attendus peuvent être remplacés temporairement pour la validation fonctionnelle ; la fidélité visuelle est suivie séparément.

## Référentiels associés

Le [game design](../game-design/01-VISION-ET-BOUCLES.md) décrit les mécanismes ; les [spécifications fonctionnelles](../specifications/FONCTIONNEL.md) définissent les contrats ; les fiches organisent la réalisation et l’acceptation. Les [sources](../research/SOURCES.md), [incertitudes](../research/INCERTITUDES.md) et [profil classique](../specifications/PROFIL-PVP-CLASSIQUE.md) restent les références pour départager une règle.

Révision documentaire **0.3**. Base analysée : commit `d55476839963142b3aacb26efa0440f09212947b`. Les données historiques et assets importés ne sont pas modifiés par ce backlog.
