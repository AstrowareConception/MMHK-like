# Audit de Jactari : code, images et correspondances

Source **CODE-02**, import utilisateur au commit `71f8ec79cbea19246c539394bf33d75fc21f26b3`. **153 fichiers : 23 JavaScript, 25 HTML, 9 CSS et 96 images** (68 PNG, 24 JPEG, 4 GIF). Les fichiers historiques sont conservés sans modification. [Inventaire avec empreintes](../../data/analysis/jactari-inventory.json).

## Ce que l’import apporte

Les six fichiers `donnees.*.min.js` et `combat.min.js` ont exactement les mêmes empreintes Git que les sources déjà épinglées sous CODE-01. Les 130 unités, 210 bâtiments de ville, 36 sorts et autres décomptes ne changent donc pas. L’import n’apporte pas une nouvelle révision numérique antérieure à 2013.

Il permet en revanche de consulter les fonctions de présentation, le configurateur de héros, les CSS, les traductions et les images qui n’étaient pas intégrés dans le dossier initial. Les pages HTML sont les calculateurs/catalogues Jactari en plusieurs langues. Elles ne constituent pas le client complet du monde persistant. Le fichier `slider2.js` fournit un contrôle d’interface d’outil ; il n’est pas une preuve de récupération du moteur de navigation de la carte MMHK.

| Code examiné | Apport | Portée |
| --- | --- | --- |
| `images.min.js` | Choix des planches, indices, pas de découpe, états grisés/vaincus, images d’armes | Code de présentation Jactari |
| `heros.min.js` | Trois carrières, budget de compétence, coût d’ouverture, progression des talents, restrictions, Scribe/Arcanes partagés | Configurateur, pas serveur |
| `donnees.*.min.js` | Attributs `icone`, noms de faction/école, indices de références | Liens rétablis avec les catalogues numériques |
| `heros.style.css`, `combat.style.css`, `artefacts.style.css` | Dimensions de fenêtres de sprite, disposition des outils | Certains styles ressemblent au jeu ; pas tout son habillage |
| `combat.min.js` | Calculateur déjà analysé en v0.1 | Pas de nouveau résultat de fidélité serveur |
| `fonctions.min.js`, langues et permaliens | Formatage, texte et sérialisation des outils | Ne remplace ni missions persistantes ni API de jeu |

## Correspondances récupérées

Le [manifeste des sprites](../../data/analysis/sprite-manifest.json) contient **1 317 correspondances** avec identifiant, fichier, rectangle `[x, y, largeur, hauteur]`, contexte et état de contrôle. Ce nombre inclut plusieurs tailles/états pour une unité : il ne représente pas 1 317 images originales distinctes.

| Famille | Références générées | Règle de découpe observée |
| --- | --- | --- |
| 130 unités, petit format | 260 | `UnitStack_FACTION.png`, 23×22 ; x = (icone−1)×23 ; y = 0 ou 22 |
| 130 unités, bataille | 260 | `BattleUnitStack_FACTION.jpg`, 51×52 ; x = (icone−1)×51 ; y = 0 ou 52 |
| Sorts | 36 | `SpellStack_` + `nom_machine`, 40×40 ; x = (icone−1)×40 ; absence d’indice : case y=120 |
| Carrières | 13 | `HeroClass.png`, 44×44, première rangée, pas de 44 |
| Talents | 74 | `HeroClassSkill.png`, 25×25, dix colonnes logiques ; exception icône 51 à x=250, y=100 |
| Portraits sélectionnables, cinq factions | 95 | 71×72, pas horizontal 71, portraits 1–19 dans le configurateur |
| Ressources | 7 | `Ressources.png`, 18×18, y=1 ; x=(icone−1)×20 + 1 sauf première icône |
| Armes et avantages | 9 | `UnitStack_types.png`, 22×22 ; colonnes I/R/C, lignes neutre/bonus/malus |
| Artefacts, contexte équipement | 563 | Planche COMMON/SET/HEREDITY/REWARD, ou placeholder ; viewport 37×36 |

Les bandes de portraits font **1 491×72**, soit 21 pas de 71, alors que les commandes `controle_portrait` exposent 1–19. On conserve la distinction entre capacité physique de la planche et choix réellement permis par l’outil. La présence d’un portrait Donjon ne prouve pas que Donjon était sélectionnable dans le profil PvP retenu.

### Artefacts : ne pas utiliser un indice linéaire unique

`image_css_artefact` sélectionne HEREDITY pour faction −1/type 2, REWARD pour faction −1/type 1, SET si un champ `set` existe, COMMON sinon. COMMON utilise un pas de 40 ; SET une grille de onze colonnes et un pas de 36 ; HEREDITY/REWARD un pas de 37. Dans COMMON, les objets génériques, les objets de faction à icône explicite et ceux indexés par emplacement/niveau suivent des branches distinctes. Les formules exactes sont transcrites dans [l’extracteur](../../tools/extract-sprite-manifest.mjs).

La fonction suffixée `_old` utilise les anciennes bandes par faction ; sa présence ne justifie pas de l’employer pour les nouvelles données. Le contexte équipement affiche 37×36 tandis que le catalogue CSS affiche 36×37. Le manifeste annonce son contexte ; le pas de la grille n’est pas nécessairement égal à la largeur visible. Les sept tables JSON initiales restent inchangées : les `icone` et correspondances sont dans une couche d’affichage séparée.

## Résultat de contrôle et anomalies conservées

**1 152 rectangles sont dans les limites, 2 dépassent d’un pixel, 163 renvoient au placeholder absent.** Aucun de ces problèmes n’est corrigé en modifiant l’archive. Lors de cette révision, les 1 317 chemins et positions ont aussi été comparés aux sorties des fonctions originales de `images.min.js` exécutées isolément : aucun écart. Les dimensions déclarées dans les retours HTML ont été comparées ; les fenêtres CSS sont explicitement choisies par contexte.

| Constat | Preuve | Conséquence proposée |
| --- | --- | --- |
| 163 entrées d’artefacts n’ont pas d’icône/faction exploitable | Branche `artefact-inconnu.png` ; fichier absent | Afficher un placeholder explicite fourni par le futur client ; ne pas attribuer un autre objet au hasard |
| Petite icône de l’unité d’indice 106, icône 16 | `UnitStack_FORTRESS.png` largeur 367 ; x=345 + largeur 23 = 368, dans les deux rangées | Documenter le pixel manquant ; découpe bornée avec remplissage transparent dans une couche d’adaptation |
| Préchargement de portraits en PNG, fichiers présents en JPEG | Liste `images` et fonction `image_css_heros` | Utiliser les chemins réellement résolus par le manifeste |
| Préchargement `hero-*.png`, styles utilisant `hero-*.jpg` | Liste et CSS | Distinguer liste périmée et dépendance effective |
| Flèches, croix, bandeaux et quelques survols absents | Mentions littérales dans JS/CSS | Refaire les contrôles requis ; vérifier chaque branche utilisée |

Le scanner détecte **30 chaînes de noms non présentes**, comprenant des fragments de noms dynamiques et paramètres de générateur de thème. Ce n’est **pas un décompte de 30 dépendances nécessairement chargées**. L’inventaire fournit les fichiers mentionnant chaque chaîne ; l’analyse du chemin exécuté prévaut sur la recherche textuelle. Les deux dépassements et les placeholders sont eux des constats sur les correspondances générées.

Les 70 unités ordinaires des cinq factions sont toutes mappées dans leurs deux formats et deux états. Les 36 sorts ont une correspondance bornée. `DARK` vient de `nom_machine` ; reconstruire le nom de fichier depuis la traduction anglaise « Darkness » donnerait à tort `SpellStack_DARKNESS.png`.

## Éléments disponibles et éléments à retrouver

| Besoin | État réel dans ce lot | Travail pour une interface fidèle |
| --- | --- | --- |
| Petites unités et portraits de bataille | Planches disponibles | Brancher les identifiants, vérifier état et lisibilité à taille native |
| Portraits de héros | Petits portraits en bandes | Les grands portraits illustrés des fiches héros ne sont pas récupérés ici |
| Sorts, carrières, talents, artefacts | Couverture importante, limites ci-dessus | Adapter atlas, placeholders et disponibilité par profil |
| Ressources et petits contrôles | `common.png`, `Ressources.png`, icônes, scores, boutons | Recomposer l’habillage, ne pas confondre boutons Jactari et commandes du jeu |
| Fonds de rapports et carrières | Plusieurs bandes/fonds présents | Comparer SS-017 et fiches héros ; ne pas étirer une bande en décor de carte |
| Terrain monde et masque politique | Aucun jeu de tuiles ni moteur identifié | Retrouver ou produire tuiles, reliefs, frontières et états de carte |
| Région et bâtiments isométriques | Pas de kit complet identifié | Ville centrale, mines, PNJ, aménagements, états et ancres manquent |
| Scènes de ville par faction | Absentes des 96 fichiers | Fonds, couches de bâtiments et hotspots manquent ; les captures servent de référence |
| Habillage complet et boutons de navigation | Partiel | Header, chronologie, panneau de royaume, modales, filtres et menus à reconstruire |
| Animation, audio, données de placement | Aucun corpus identifié ici | Ne pas annoncer des animations ou coordonnées récupérées |

L’apparence très proche souhaitée est donc un objectif défini et documenté ; **ces ressources ne suffisent pas encore à restituer toutes les scènes à l’identique**. Une capture complète ne remplace pas des couches graphiques séparées : elle inclut texte, état du royaume et interface figés.

## Inventaire des 96 images

La transparence indiquée est la présence d’un canal alpha ou d’une entrée de transparence, pas une mesure du nombre de pixels transparents. Les petites textures `ui-*` appartiennent au thème d’outil ; elles ne sont pas des tuiles de terrain.

| Fichier | Dimensions | Format / alpha | Usage d’après nom, code et inspection |
| --- | --- | --- | --- |
| [Artefact_ACADEMY.png](../../data/Jactari/src/images/Artefact_ACADEMY.png) | 555×36 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_COMMON.png](../../data/Jactari/src/images/Artefact_COMMON.png) | 560×1476 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_HAVEN.png](../../data/Jactari/src/images/Artefact_HAVEN.png) | 555×36 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_HEREDITY.gif](../../data/Jactari/src/images/Artefact_HEREDITY.gif) | 37×108 | GIF / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_HEREDITY.png](../../data/Jactari/src/images/Artefact_HEREDITY.png) | 111×36 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_INFERNO.png](../../data/Jactari/src/images/Artefact_INFERNO.png) | 555×36 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_NECROPOLIS.png](../../data/Jactari/src/images/Artefact_NECROPOLIS.png) | 555×36 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_REWARD.gif](../../data/Jactari/src/images/Artefact_REWARD.gif) | 259×36 | GIF / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_REWARD.png](../../data/Jactari/src/images/Artefact_REWARD.png) | 259×36 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_SET.png](../../data/Jactari/src/images/Artefact_SET.png) | 397×288 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [Artefact_SYLVAN.png](../../data/Jactari/src/images/Artefact_SYLVAN.png) | 555×36 | PNG / oui | Planche d’artefacts (actuelle ou ancienne) |
| [BattleUnitStack_ACADEMY.jpg](../../data/Jactari/src/images/BattleUnitStack_ACADEMY.jpg) | 816×104 | JPEG / non | Portraits de bataille |
| [BattleUnitStack_DUNGEON.jpg](../../data/Jactari/src/images/BattleUnitStack_DUNGEON.jpg) | 816×156 | JPEG / non | Portraits de bataille |
| [BattleUnitStack_FORTRESS.jpg](../../data/Jactari/src/images/BattleUnitStack_FORTRESS.jpg) | 816×156 | JPEG / non | Portraits de bataille |
| [BattleUnitStack_HAVEN.jpg](../../data/Jactari/src/images/BattleUnitStack_HAVEN.jpg) | 816×104 | JPEG / non | Portraits de bataille |
| [BattleUnitStack_INFERNO.jpg](../../data/Jactari/src/images/BattleUnitStack_INFERNO.jpg) | 816×104 | JPEG / non | Portraits de bataille |
| [BattleUnitStack_NECROPOLIS.jpg](../../data/Jactari/src/images/BattleUnitStack_NECROPOLIS.jpg) | 816×104 | JPEG / non | Portraits de bataille |
| [BattleUnitStack_NEUTRAL.jpg](../../data/Jactari/src/images/BattleUnitStack_NEUTRAL.jpg) | 561×156 | JPEG / non | Portraits de bataille |
| [BattleUnitStack_NEW.jpg](../../data/Jactari/src/images/BattleUnitStack_NEW.jpg) | 357×156 | JPEG / non | Portraits de bataille |
| [BattleUnitStack_SYLVAN.jpg](../../data/Jactari/src/images/BattleUnitStack_SYLVAN.jpg) | 816×156 | JPEG / non | Portraits de bataille |
| [BonusIcon_HEREDITY.png](../../data/Jactari/src/images/BonusIcon_HEREDITY.png) | 225×375 | PNG / oui | Compétences héréditaires |
| [BonusIcon_HEREDITY_d5x3.png](../../data/Jactari/src/images/BonusIcon_HEREDITY_d5x3.png) | 135×225 | PNG / oui | Compétences héréditaires |
| [HeroClass.png](../../data/Jactari/src/images/HeroClass.png) | 625×617 | PNG / oui | Carrières / talents |
| [HeroClassSkill.png](../../data/Jactari/src/images/HeroClassSkill.png) | 275×200 | PNG / oui | Carrières / talents |
| [Hero_ACADEMY_2.jpg](../../data/Jactari/src/images/Hero_ACADEMY_2.jpg) | 1491×72 | JPEG / non | Portraits de héros |
| [Hero_DUNGEON_2.jpg](../../data/Jactari/src/images/Hero_DUNGEON_2.jpg) | 1491×72 | JPEG / non | Portraits de héros |
| [Hero_HAVEN_2.jpg](../../data/Jactari/src/images/Hero_HAVEN_2.jpg) | 1491×72 | JPEG / non | Portraits de héros |
| [Hero_INFERNO_2.jpg](../../data/Jactari/src/images/Hero_INFERNO_2.jpg) | 1491×72 | JPEG / non | Portraits de héros |
| [Hero_NECROPOLIS_2.jpg](../../data/Jactari/src/images/Hero_NECROPOLIS_2.jpg) | 1491×72 | JPEG / non | Portraits de héros |
| [Hero_SYLVAN_2.jpg](../../data/Jactari/src/images/Hero_SYLVAN_2.jpg) | 1491×72 | JPEG / non | Portraits de héros |
| [Ressources.png](../../data/Jactari/src/images/Ressources.png) | 250×140 | PNG / oui | Atlas de petites icônes |
| [Rrom.png](../../data/Jactari/src/images/Rrom.png) | 96×64 | PNG / non | Drapeau ; hors décors de gameplay |
| [SpellStack_DARK.png](../../data/Jactari/src/images/SpellStack_DARK.png) | 421×183 | PNG / oui | Sorts |
| [SpellStack_DESTRUCTION.png](../../data/Jactari/src/images/SpellStack_DESTRUCTION.png) | 421×184 | PNG / oui | Sorts |
| [SpellStack_LIGHT.png](../../data/Jactari/src/images/SpellStack_LIGHT.png) | 421×183 | PNG / oui | Sorts |
| [SpellStack_SUMMON.png](../../data/Jactari/src/images/SpellStack_SUMMON.png) | 421×183 | PNG / oui | Sorts |
| [UnitStack_ACADEMY.png](../../data/Jactari/src/images/UnitStack_ACADEMY.png) | 368×44 | PNG / non | Unités réduites / armes |
| [UnitStack_DUNGEON.png](../../data/Jactari/src/images/UnitStack_DUNGEON.png) | 368×44 | PNG / non | Unités réduites / armes |
| [UnitStack_FORTRESS.png](../../data/Jactari/src/images/UnitStack_FORTRESS.png) | 367×44 | PNG / non | Unités réduites / armes |
| [UnitStack_HAVEN.png](../../data/Jactari/src/images/UnitStack_HAVEN.png) | 368×44 | PNG / non | Unités réduites / armes |
| [UnitStack_INFERNO.png](../../data/Jactari/src/images/UnitStack_INFERNO.png) | 368×44 | PNG / non | Unités réduites / armes |
| [UnitStack_NECROPOLIS.png](../../data/Jactari/src/images/UnitStack_NECROPOLIS.png) | 368×44 | PNG / non | Unités réduites / armes |
| [UnitStack_NEUTRAL.png](../../data/Jactari/src/images/UnitStack_NEUTRAL.png) | 253×44 | PNG / non | Unités réduites / armes |
| [UnitStack_NEW.png](../../data/Jactari/src/images/UnitStack_NEW.png) | 161×44 | PNG / oui | Unités réduites / armes |
| [UnitStack_SYLVAN.png](../../data/Jactari/src/images/UnitStack_SYLVAN.png) | 368×44 | PNG / non | Unités réduites / armes |
| [UnitStack_types.png](../../data/Jactari/src/images/UnitStack_types.png) | 66×66 | PNG / oui | Unités réduites / armes |
| [cadre-heros.png](../../data/Jactari/src/images/cadre-heros.png) | 82×85 | PNG / oui | Contrôle ou décor de l’outil |
| [classesBg.gif](../../data/Jactari/src/images/classesBg.gif) | 304×244 | GIF / oui | Contrôle ou décor de l’outil |
| [common.png](../../data/Jactari/src/images/common.png) | 260×220 | PNG / oui | Atlas de petites icônes |
| [emplacements-artefacts.png](../../data/Jactari/src/images/emplacements-artefacts.png) | 188×95 | PNG / oui | Contrôle ou décor de l’outil |
| [equipementBg.jpg](../../data/Jactari/src/images/equipementBg.jpg) | 350×47 | PNG / oui | Contrôle ou décor de l’outil |
| [fleche-offre.png](../../data/Jactari/src/images/fleche-offre.png) | 24×24 | PNG / oui | Contrôle ou décor de l’outil |
| [fond-competences-speciales.jpg](../../data/Jactari/src/images/fond-competences-speciales.jpg) | 602×372 | JPEG / non | Contrôle ou décor de l’outil |
| [fond-heredite.jpg](../../data/Jactari/src/images/fond-heredite.jpg) | 602×744 | JPEG / non | Contrôle ou décor de l’outil |
| [fond-noir-translucide.png](../../data/Jactari/src/images/fond-noir-translucide.png) | 20×50 | PNG / oui | Contrôle ou décor de l’outil |
| [fond-offre.jpg](../../data/Jactari/src/images/fond-offre.jpg) | 1280×58 | JPEG / non | Contrôle ou décor de l’outil |
| [fond-xp.png](../../data/Jactari/src/images/fond-xp.png) | 12×12 | PNG / non | Contrôle ou décor de l’outil |
| [fonds-sorts.jpg](../../data/Jactari/src/images/fonds-sorts.jpg) | 332×416 | JPEG / non | Contrôle ou décor de l’outil |
| [hero-green.jpg](../../data/Jactari/src/images/hero-green.jpg) | 308×51 | JPEG / non | Contrôle ou décor de l’outil |
| [hero-other.jpg](../../data/Jactari/src/images/hero-other.jpg) | 308×51 | JPEG / non | Contrôle ou décor de l’outil |
| [hero-purple.jpg](../../data/Jactari/src/images/hero-purple.jpg) | 308×51 | JPEG / non | Contrôle ou décor de l’outil |
| [hero-red.jpg](../../data/Jactari/src/images/hero-red.jpg) | 308×51 | JPEG / non | Contrôle ou décor de l’outil |
| [icone-accueil.png](../../data/Jactari/src/images/icone-accueil.png) | 16×17 | PNG / non | Contrôle ou décor de l’outil |
| [icone-artefact.png](../../data/Jactari/src/images/icone-artefact.png) | 16×17 | PNG / non | Contrôle ou décor de l’outil |
| [icone-batiment.png](../../data/Jactari/src/images/icone-batiment.png) | 16×17 | PNG / non | Contrôle ou décor de l’outil |
| [icone-combat.png](../../data/Jactari/src/images/icone-combat.png) | 16×17 | PNG / non | Contrôle ou décor de l’outil |
| [icone-fleches-circulaires.png](../../data/Jactari/src/images/icone-fleches-circulaires.png) | 16×17 | PNG / non | Contrôle ou décor de l’outil |
| [icone-heros.png](../../data/Jactari/src/images/icone-heros.png) | 16×16 | PNG / non | Contrôle ou décor de l’outil |
| [icone-sorts.png](../../data/Jactari/src/images/icone-sorts.png) | 16×17 | PNG / non | Contrôle ou décor de l’outil |
| [icone-troupes.png](../../data/Jactari/src/images/icone-troupes.png) | 16×17 | PNG / non | Contrôle ou décor de l’outil |
| [info.png](../../data/Jactari/src/images/info.png) | 24×24 | PNG / oui | Contrôle ou décor de l’outil |
| [inversion.png](../../data/Jactari/src/images/inversion.png) | 11×11 | PNG / non | Contrôle ou décor de l’outil |
| [moins-cent.png](../../data/Jactari/src/images/moins-cent.png) | 11×22 | PNG / oui | Contrôle ou décor de l’outil |
| [moins-dix.png](../../data/Jactari/src/images/moins-dix.png) | 11×22 | PNG / oui | Contrôle ou décor de l’outil |
| [moins-survol.png](../../data/Jactari/src/images/moins-survol.png) | 11×22 | PNG / oui | Contrôle ou décor de l’outil |
| [moins-un.png](../../data/Jactari/src/images/moins-un.png) | 11×22 | PNG / oui | Contrôle ou décor de l’outil |
| [moins.png](../../data/Jactari/src/images/moins.png) | 9×9 | PNG / non | Contrôle ou décor de l’outil |
| [plus-cent.png](../../data/Jactari/src/images/plus-cent.png) | 11×22 | PNG / oui | Contrôle ou décor de l’outil |
| [plus-dix.png](../../data/Jactari/src/images/plus-dix.png) | 11×22 | PNG / oui | Contrôle ou décor de l’outil |
| [plus-survol.png](../../data/Jactari/src/images/plus-survol.png) | 11×22 | PNG / oui | Contrôle ou décor de l’outil |
| [plus-un.png](../../data/Jactari/src/images/plus-un.png) | 11×22 | PNG / oui | Contrôle ou décor de l’outil |
| [plus.png](../../data/Jactari/src/images/plus.png) | 9×9 | PNG / non | Contrôle ou décor de l’outil |
| [score-rempli.png](../../data/Jactari/src/images/score-rempli.png) | 80×8 | PNG / oui | Contrôle ou décor de l’outil |
| [score-vide.png](../../data/Jactari/src/images/score-vide.png) | 80×8 | PNG / oui | Contrôle ou décor de l’outil |
| [ui-anim_basic_16x16.gif](../../data/Jactari/src/images/ui-anim_basic_16x16.gif) | 16×16 | GIF / oui | Thème jQuery UI / attente |
| [ui-bg_diagonals-thick_18_b81900_40x40.png](../../data/Jactari/src/images/ui-bg_diagonals-thick_18_b81900_40x40.png) | 40×40 | PNG / oui | Thème jQuery UI / attente |
| [ui-bg_diagonals-thick_20_666666_40x40.png](../../data/Jactari/src/images/ui-bg_diagonals-thick_20_666666_40x40.png) | 40×40 | PNG / oui | Thème jQuery UI / attente |
| [ui-bg_flat_10_000000_40x100.png](../../data/Jactari/src/images/ui-bg_flat_10_000000_40x100.png) | 40×100 | PNG / oui | Thème jQuery UI / attente |
| [ui-bg_glass_100_f6f6f6_1x400.png](../../data/Jactari/src/images/ui-bg_glass_100_f6f6f6_1x400.png) | 1×400 | PNG / oui | Thème jQuery UI / attente |
| [ui-bg_glass_100_fdf5ce_1x400.png](../../data/Jactari/src/images/ui-bg_glass_100_fdf5ce_1x400.png) | 1×400 | PNG / oui | Thème jQuery UI / attente |
| [ui-bg_glass_65_ffffff_1x400.png](../../data/Jactari/src/images/ui-bg_glass_65_ffffff_1x400.png) | 1×400 | PNG / oui | Thème jQuery UI / attente |
| [ui-bg_highlight-soft_100_eeeeee_1x100.png](../../data/Jactari/src/images/ui-bg_highlight-soft_100_eeeeee_1x100.png) | 1×100 | PNG / oui | Thème jQuery UI / attente |
| [ui-bg_highlight-soft_75_ffe45c_1x100.png](../../data/Jactari/src/images/ui-bg_highlight-soft_75_ffe45c_1x100.png) | 1×100 | PNG / oui | Thème jQuery UI / attente |
| [unite-absente.png](../../data/Jactari/src/images/unite-absente.png) | 23×22 | PNG / oui | Contrôle ou décor de l’outil |
| [unite-suppression.png](../../data/Jactari/src/images/unite-suppression.png) | 23×22 | PNG / oui | Contrôle ou décor de l’outil |
| [unite.png](../../data/Jactari/src/images/unite.png) | 51×52 | PNG / oui | Contrôle ou décor de l’outil |

## Reproduction de l’audit

```bash
python3 tools/audit-visual-resources.py
node tools/extract-sprite-manifest.mjs
python3 tools/validate.py
```

Python requiert Pillow pour lire les en-têtes d’images ; Node n’a pas de dépendance npm. Les sources déclaratives sont vérifiées contre les SHA-256 de CODE-01 avant lecture. Le contrôle des fichiers importés est rattaché au commit du corpus. La recette visuelle d’un futur client reste distincte de cet audit de données.

Le code et les correspondances dérivées conservent les attributions Jactari, Aspirin et Aendawyn, sous GPL-3.0-or-later. La licence des scripts ne requalifie pas automatiquement les images ; leur provenance est conservée dans l’inventaire sans nouvelle attribution de licence.
