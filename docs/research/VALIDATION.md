# Validation du dossier

État : **RÉUSSI**. Référentiel documentaire du 2026-10-22.

3535 assertions de cohérence, 14 fichiers JSON lus, 26 fichiers Markdown inspectés. 7 duels synthétiques et 9 cas d’admission contrôlés arithmétiquement.

**Portée :** cohérence documentaire et extraction, pas test d’un jeu, d’un serveur, d’une interface ou validation contre des rapports historiques. Les empreintes des six tables déclaratives sont vérifiées par l’extracteur ; celles des 210 ressources importées sont recalculées ici. Les bornes de sprites et anomalies connues sont contrôlées ; aucune fidélité de rendu navigateur n’est revendiquée.

## Inventaire contrôlé

| Groupe | Entrées |
| --- | --- |
| creatures | 130 |
| buildings | 210 |
| regional_buildings | 10 |
| spells | 36 |
| hero_archetypes | 15 |
| careers | 13 |
| talent_groups | 21 |
| talents | 74 |
| artifacts | 563 |
| artifact_effects | 270 |
| artifact_sets | 12 |

## Particularités conservées

- 107 unités sans champ id : les indices sont les identifiants de référence.
- 46 unités sans production : aucune recrue par défaut ne doit être inventée.
- 8 groupes de talents supplémentaires sans nom de carrière dans _carrieres : extensions à qualifier.
- Références régionales symboliques conservées : région 7: XmairieX, région 8: XRelai1X, région 9: XGM5X
- Catalogue régional limité à dix entrées, non exhaustif.
- 35 positions vides dans la table de fortifications, indices conservés.
- Corpus visuel : 57 captures / 53 distinctes, 153 fichiers Jactari dont 96 images ; empreintes recalculées.
- 1 317 correspondances : 1 152 bornées, 163 placeholders d’artefact absents, 2 rectangles Forteresse débordant d’un pixel. Anomalies historiques explicitement conservées.
- 57 exigences fonctionnelles reliées à 71 scénarios spécifiés, non exécutés sur un jeu.

Ces particularités sont des limites du référentiel, pas des erreurs masquées. Les anomalies fonctionnelles du simulateur sont décrites dans [Combat](../game-design/04-COMBAT.md) et [Incertitudes](INCERTITUDES.md).
