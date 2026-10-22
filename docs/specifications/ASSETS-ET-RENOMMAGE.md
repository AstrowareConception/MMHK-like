# Références visuelles et futur changement d’univers

Cette étape ne collecte ni ne publie les images du jeu. Elle prépare leur identification pour le développement envisagé et leur remplacement ultérieur, sans mêler les règles aux ressources graphiques. Les tables de données conservent les noms historiques afin de rendre les comparaisons possibles.

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
| `unit.reference.000` | Gremlin, Académie T1 | À concevoir | Donnée chiffrée récupérée ; image non ajoutée |
| `spell.reference.000` | Poing de la colère | À concevoir | Effet mécanique documenté |
| `building.reference.001` | Conseil du village, Académie | À concevoir | Coût/prérequis récupérés |
| `faction.reference.0` | Académie | À concevoir | Écoles et lignée documentées |

Les textes de récit et descriptions d’ambiance n’ont pas été copiés dans les catalogues d’unités et de héros. Le futur univers devra fournir son propre vocabulaire cohérent pour faction, ressource, héros, alliance, relique de victoire et hérédité. Les références historiques peuvent rester accessibles dans un mode documentaire pour comparer les résultats.

## Vérification visuelle future

Produire des captures de chaque vue à plusieurs tailles, avec cités débutantes et développées, siège, héros indisponible, stocks plafonnés et victoire en cours. Contrôler lisibilité des ressources, distinction des armes, visibilité des délais et navigation entre les trois échelles. Cette recette visuelle s’ajoutera à la recette mécanique ; aucune capture d’un jeu reconstruit n’est revendiquée dans le présent dossier.
