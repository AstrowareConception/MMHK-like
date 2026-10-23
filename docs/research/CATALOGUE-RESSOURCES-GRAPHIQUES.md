# Catalogue des images MMHK — couverture, provenance et récupération

**Mise à jour : 23 octobre 2026.** Le catalogue est un inventaire des **références identifiées**, pas la liste certifiée de l'intégralité des images Ubisoft.

## Accéder aux fichiers

- [Catalogue JSON](../../data/analysis/assets-catalog.json) — données structurées avec source, chemins, statuts, versions, empreintes et URL d'archives.
- [Catalogue CSV](../../data/analysis/assets-catalog.csv) — format tabulaire UTF-8 séparé par des points-virgules, filtrable dans un tableur.
- [Générateur](../../tools/build-assets-catalog.mjs) — reconstruit les deux catalogues à partir des manifestes de référence.
- [Collecteur Wayback](../../tools/recover-wayback-assets.py) — tente des récupérations ciblées, avec décodage et contrôle cryptographique. Son exécution réseau **n'a pas été réalisée** pendant cette révision.

### Les quatre états de disponibilité

| Valeur availability | Nombre | Interprétation |
| --- | ---: | --- |
| **in_repo** | 182 | Présence confirmée dans les manifestes GitHub : 24 images Ubisoft CDN, cinq villes assemblées AcidCave, 96 fichiers image Jactari et 57 captures d'écran. |
| **wayback_index_only** | 980 | URL historiquement indexée dans CDX ; image **non récupérée** dans le dépôt. L'accessibilité actuelle n'est pas démontrée. |
| **expected_not_indexed** | 174 | Fichier attendu d'après le code Ubisoft, absent de l'index CDX exploité et du dépôt. |
| **external_reference_only** | 89 | URL d'image présente dans le HTML du guide AcidCave mais contenu non téléchargé ou vérifié. |
| **Total** | **1 425** | Entrées d'inventaire ; certaines sont des planches ou des captures et non des sprites isolés. |

L'index CDX hérité de la recherche précédente fournit **3 665 URL image**, **1 007 empreintes CDX** et **1 004 chemins logiques** dédupliqués (les versions historiques multiples ne sont pas autant d'images uniques). Le CSV contient une ligne par référence connue, et non une ligne par URL de version.

Les champs structurants sont : identifiant stable, nom et chemin logique, catégorie, priorité, présence locale, provenance, chemin de dépôt, empreinte SHA-256 si présente, URL originale, URL Wayback, horodatage CDX, digests CDX, versions, appartenance aux 175 fichiers de ville attendus. Priorité 1 : ville vierge et calques. Priorité 2 : miniatures, portraits et éléments du monde/région.

## Cinq villes : état des couches originales

[Les configurations de placement du client 4.1.3](../../data/analysis/original-city-layouts-4.1.3.json) donnent **43 configurations par faction**, soit 215, pour **34 GIF uniques et un fond vierge JPG par faction**. Plusieurs niveaux réutilisent un même fichier GIF. Seuls les 175 fichiers originaux *attendus* sont comptés ci-dessous.

| Faction | Fond vierge base.jpg | Bâtiments GIF récupérés | Ville composite AcidCave |
| --- | ---: | ---: | --- |
| Havre / HAVEN | 0 / 1 | 1 / 34 | Oui |
| Académie / ACADEMY | 0 / 1 | 0 / 34 | Oui |
| Inferno / INFERNO | 0 / 1 | 0 / 34 | Oui |
| Nécropole / NECROPOLIS | 0 / 1 | 0 / 34 | Oui |
| Sylvains / SYLVAN | 0 / 1 | 0 / 34 | Oui |
| **Total** | **0 / 5** | **1 / 170** | **5 / 5** |

Le seul GIF à taille de scène récupéré est **HAVEN/TAVERN.gif**, dans la version 4.1.27, tandis que les positions sont issues de 4.1.3. Cette compatibilité graphique n'est pas vérifiée. Les cinq scènes AcidCave possèdent **déjà tous leurs bâtiments** : elles sont des références visuelles aplaties, et non des arrière-plans sans bâtiments. Les cinq fonds disponibles **backgroundGame/bg_*.jpg** décorent l'habillage extérieur et ne sont *pas* les cinq fonds de ville recherchés.

### Nouvelle cible explicite : la planche des bâtiments Sylvains

Le CDN historique fournit un chemin absent du dépôt : **img/cityBuildingList/sylvan_building.gif**. Trois captures sont présentes dans le CDX pour les versions 4.1.13, 4.1.26 et 4.1.27. L'empreinte de contenu y est identique : **K5ZE3HPMIBURSYHBDZO2356DPAQA6ZOM**. Capture la plus ancienne retenue : **20130524004851**.

[URL Wayback de la planche Sylvain](https://web.archive.org/web/20130524004851id_/http://static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/4.1.13-MTR/img/cityBuildingList/sylvan_building.gif).

Statut exact : **indexée, mais non récupérée**. Les petites planches Havre, Académie, Inferno et Nécropole sont présentes. Des références aux fonds et en-têtes d'arbre de construction pour les cinq factions ont aussi été ajoutées au catalogue avec priorité 2.

## Portraits de héros : exploiter le corpus existant

Le corpus [Jactari images](../../data/Jactari/src/images) comporte six planches horizontales **Hero_ACADEMY_2.jpg**, **Hero_HAVEN_2.jpg**, **Hero_INFERNO_2.jpg**, **Hero_NECROPOLIS_2.jpg**, **Hero_SYLVAN_2.jpg** et **Hero_DUNGEON_2.jpg** (1491 × 72 pixels).

Le [manifeste des découpes](../../data/analysis/sprite-manifest.json) identifie 19 portraits sélectionnables pour chacune des cinq factions du jeu étudiées, soit **95 portraits sélectionnables**, chacun de **71 × 72 pixels**. La bande Donjon existe, mais sa présence ne suffit pas à confirmer l'accès à cette faction. Physiquement, les bandes comportent 21 emplacements : ne pas présumer que les deux derniers correspondent à des options de personnalisation.

### HeroWorld : nouvelle piste fournie par le projet

[Galerie HeroWorld, album 13, page 1](https://heroworld.gamerhome.com/album.php?id=13&p=1).

Le domaine du site est répertorié, mais **cette page renvoie une erreur de chargement dans l'environnement de recherche actuel**. Ni les chemins individuels des images, ni leur date, ni leurs dimensions, ni leur lien exact avec MMHK n'ont pu être établis. **Aucun fichier de cette galerie n'a été téléchargé**. Cette source reste explicitement à examiner et à paginer ; ne pas inventer de noms de fichiers à partir du numéro d'album.

Autres sources d'illustrations et captures, à comparer sans les confondre avec les calques originaux :

- [JeuxOnline — galerie MMHK](https://mmhk.jeuxonline.info/images/Might_and_Magic_Heroes_Kingdoms), notamment portraits d'unités et images historiques ;
- [AcidCave](https://www.heroeskingdoms.acidcave.net/frakcje_przystan.html), images d'unités, décors et scènes de ville : 89 chemins HTML encore sans fichier local sont répertoriés ;
- [Jeux-Alternatifs](https://www.jeux-alternatifs.com/Heroes-Kingdoms-jeu193_image_1_1.html), [ModDB](https://www.moddb.com/games/might-and-magic-heroes-kingdoms/images), [Sina Games](https://games.sina.com.cn/o/i/2010-04-23/199999.shtml) et [17173](https://newgame.17173.com/album-list-50294.html) : principalement des captures et des références éditoriales.

Ne pas mélanger le MMHK historique avec les autres opus de Heroes ou le titre chinois ultérieur *Heroes: Dynasty*.

## Collecte reproductible et respectueuse d'Internet Archive

Pour explorer avant de télécharger :

~~~bash
python3 tools/recover-wayback-assets.py --dry-run --priority-max 2 --limit 30
~~~

Pour tenter **la planche Sylvain**, avec limite de débit et vérification de l'image obtenue :

~~~bash
python3 tools/recover-wayback-assets.py --id 'cdn:img/cityBuildingList/sylvan_building.gif'
~~~

Le script vérifie la validité de l'image avec Pillow et confronte son SHA-1/base32 à l'une des empreintes CDX. Une réponse HTML, un fichier trop volumineux, une erreur HTTP, un contenu inattendu ou un digest différent est refusé. Aucun contournement de restrictions d'accès n'est prévu. Le répertoire cible est **data/assets-recovered/ubisoft-archive** et le fichier est enregistré dans le sous-dossier correspondant à sa version historique.

Après ajout de fichiers :

~~~bash
node tools/build-assets-catalog.mjs
~~~

Le générateur redétecte les fichiers du CDN désormais présents localement et met à jour les statuts et SHA-256. Les manifestes historiques sont conservés pour la traçabilité.

**Axes de recherche restant prioritaires :** les cinq fonds vierges ; les 169 GIF de bâtiments manquants ; l'ensemble des décors d'arbre de construction ; les calques région/mines/monde, variantes de chantier et animations ; les portraits à d'autres dimensions ; enfin les éléments de la Guerre des Larmes. Élargir ensuite le CDX par noms exacts sur d'autres domaines ou caches de navigateur anciens. Un échec sur un CDN ne prouve pas la disparition mondiale du binaire.

## Droits et fiabilité

Une URL CDX avec statut historique 200 ne garantit **ni disponibilité présente ni licence de diffusion**. Les images historiques appartiennent à leurs ayants droit ; la licence du code Jactari ne s'étend pas aux illustrations du jeu. Le corpus a une finalité de référence de rétroconception et la réutilisation dans un futur produit public doit être traitée séparément.
