# Références visuelles et futur changement d’univers

La révision 0.2 analyse les images importées par l’utilisateur : 57 captures et 96 images Jactari. Les fichiers historiques restent intacts ; inventaire et correspondances sont ajoutés séparément. Cette analyse prépare leur usage de référence et leur remplacement ultérieur, sans mêler les règles aux ressources graphiques. Les tables de données conservent les noms historiques afin de rendre les comparaisons possibles.

## Familles à inventorier

| Famille | Éléments attendus | Métadonnées à conserver |
| --- | --- | --- |
| Monde | Tuiles, reliefs, frontières, cités, sites, déplacements et alertes | Échelle, état, saison, capture de contexte |
| Région | Cases, mines, PNJ, aménagements, emplacement de cité | Ressource, niveau, état occupé/libéré/en chantier |
| Ville | Fond par faction, bâtiments, variantes de construction | Faction, bâtiment logique, niveau, position |
| Armée | Portraits T1–T7, améliorations, engins, neutres et événements | Identifiant logique, arme, variante |
| Héros | Portraits, carrières, talents et états | Archétype, profession, rôle visuel |
| Magie et objets | Sorts, écoles, artéfacts, emplacements et ensembles | Identifiant logique, qualité/état, dimensions |
| Interface | Ressources, rangs, rapports, compte à rebours, badges | Usage, contraste et taille native |
| Audio | Sons et musiques si retenus | Usage et conditions de lecture ; corpus non étudié |

## Séparation proposée

Chaque objet possède un identifiant stable indépendant de son nom, par exemple `unit.reference.000`. Les données de combat référencent cet identifiant ; une table d’affichage choisit nom et visuel. La future variation crée une nouvelle table d’affichage et un nouveau manifeste d’assets, sans renuméroter les unités ni changer silencieusement les formules.

Pour un asset de référence : origine, date de récupération, fichier source, empreinte, contexte de capture et statut d’utilisation. Pour son remplacement : auteur, fichier éditable, licence choisie par le projet, export, dimensions et élément logique couvert. La licence GPL de l’outil communautaire ne doit pas être considérée comme une autorisation portant sur les images Ubisoft.

## Registre de correspondance à constituer

| Identifiant | Référence MMHK | Remplacement du successeur | Statut actuel |
| --- | --- | --- | --- |
| `unit.reference.000` | Gremlin, Académie T1 | À concevoir | Donnée et sprites petite taille/bataille reliés au manifeste |
| `spell.reference.000` | Poing de la colère | À concevoir | Effet et rectangle de sprite documentés |
| `building.reference.001` | Conseil du village, Académie | À concevoir | Coût/prérequis récupérés |
| `faction.reference.0` | Académie | À concevoir | Écoles et lignée documentées |

Les textes de récit et descriptions d’ambiance n’ont pas été copiés dans les catalogues d’unités et de héros. Le futur univers devra fournir son propre vocabulaire cohérent pour faction, ressource, héros, alliance, relique de victoire et hérédité. Les références historiques peuvent rester accessibles dans un mode documentaire pour comparer les résultats.

## Vérification visuelle future

Produire des captures de chaque vue à plusieurs tailles, avec cités débutantes et développées, siège, héros indisponible, stocks plafonnés et victoire en cours. Contrôler lisibilité des ressources, distinction des armes, visibilité des délais et navigation entre les trois échelles. Cette recette visuelle s’ajoutera à la recette mécanique ; aucune capture d’un jeu reconstruit n’est revendiquée dans le présent dossier.

## Registres désormais disponibles

- [Inventaire Jactari](../../data/analysis/jactari-inventory.json) : 153 fichiers avec empreintes, dont 96 images avec dimensions/formats.
- [Inventaire captures](../../data/analysis/screenshots-inventory.json) et [observations](../../data/analysis/screenshots-observations.json) : 57 références, doublons et limites d’interprétation.
- [Manifeste des sprites](../../data/analysis/sprite-manifest.json) : 1 317 correspondances, état de présence et bornes.
- [Audit détaillé](../research/AUDIT-JACTARI-ASSETS.md) : formules de découpe, anciennes/nouvelles planches, placeholders absents et limite de couverture.

La [collecte du 23 octobre 2026](../research/RECHERCHE-ASSETS-2026-10-23.md) complète ces registres avec 29 images et 3 fichiers du client historique : scènes assemblées des cinq factions, fonds monde/région, miniatures de bâtiments, une taverne individuelle et interface. Le [manifeste](../../data/analysis/recovered-assets-2026-10-23.json) conserve leurs provenances et empreintes. Les [215 configurations de placement](../../data/analysis/original-city-layouts-4.1.3.json) viennent du client 4.1.3-MTR ; les 74 hotspots du guide AcidCave sont une source communautaire distincte.

Il manque encore les cinq fonds de ville vides, la majorité des couches de bâtiments à taille native, le kit complet d'objets de région/monde et plusieurs états visuels. Les scènes assemblées ne permettent pas de retirer les bâtiments non construits. Les références SS-050/051/054/055/056 servent à comparer leur apparence. La [spécification de rendu](INTERFACE-ET-RENDU-ISOMETRIQUE.md) définit leur contrat futur.
