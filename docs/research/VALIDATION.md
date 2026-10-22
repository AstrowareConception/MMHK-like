# Validation du dossier

État : **RÉUSSI**. Référentiel documentaire du 2026-10-22.

1076 assertions de cohérence, 10 fichiers JSON lus, 22 fichiers Markdown inspectés. 7 duels synthétiques et 9 cas d’admission contrôlés arithmétiquement.

**Portée :** cohérence documentaire et extraction, pas test d’un jeu, d’un serveur, d’une interface ou validation contre des rapports historiques. Les empreintes des sources brutes sont vérifiées par l’extracteur avant génération ; elles ne sont pas recalculées ici en l’absence du cache amont.

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
- 40 exigences fonctionnelles reliées à 52 scénarios spécifiés, non exécutés sur un jeu.

Ces particularités sont des limites du référentiel, pas des erreurs masquées. Les anomalies fonctionnelles du simulateur sont décrites dans [Combat](../game-design/04-COMBAT.md) et [Incertitudes](INCERTITUDES.md).
