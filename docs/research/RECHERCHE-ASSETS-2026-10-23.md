# Ressources graphiques retrouvées — 23 octobre 2026

La recherche a permis de récupérer **29 images et 3 fichiers du client historique**, conservés dans [data/assets-recovered](../../data/assets-recovered/README.md). Les fichiers téléchargés ont été décodés et leurs empreintes SHA-256 enregistrées. Les cinq scènes de ville, les principaux fonds et un échantillon des planches ont aussi été inspectés visuellement. Le [manifeste](../../data/analysis/recovered-assets-2026-10-23.json) distingue ces niveaux de vérification.

Le résultat débloque des références concrètes pour les trois vues. Il reste incomplet : **les cinq fonds de ville vides et la majorité des GIF de bâtiments à leur taille de scène ne sont pas récupérés**. Les petites images d'un arbre de construction ne remplacent pas ces calques.

## 1. Cinq scènes de ville sans interface

Le site communautaire polonais **Kwasowa Grota / AcidCave** conserve une scène par faction. Ce sont des images aplaties : terrain et bâtiments sont déjà assemblés. Elles conviennent à une référence visuelle ou à une première navigation cliquable, mais afficheraient des bâtiments encore non construits si on les utilisait telles quelles pendant une partie débutante.

| Faction | Page de provenance | Image directe | Taille native | Zones HTML du guide |
| --- | --- | --- | --- | --- |
| Havre | [Przystań](https://www.heroeskingdoms.acidcave.net/frakcje_przystan.html) | [haven_map.png](https://www.heroeskingdoms.acidcave.net/sphinx/haven_map.png) | 680 × 552 | 15 |
| Académie | [Akademia](https://www.heroeskingdoms.acidcave.net/frakcje_akademia.html) | [130903115903academy.png](https://www.heroeskingdoms.acidcave.net/sphinx/130903115903academy.png) | 680 × 552 | 15 |
| Inferno | [Inferno](https://www.heroeskingdoms.acidcave.net/frakcje_inferno.html) | [130913130810inferno.png](https://www.heroeskingdoms.acidcave.net/sphinx/130913130810inferno.png) | 679 × 550 | 15 |
| Nécropole | [Necropolis](https://www.heroeskingdoms.acidcave.net/frakcje_necropolis.html) | [necropolis_town.png](https://www.heroeskingdoms.acidcave.net/sphinx/necropolis_town.png) | 680 × 552 | 15 |
| Sylvains | [Sylvan](https://www.heroeskingdoms.acidcave.net/frakcje_sylvan.html) | [sylvan_town.png](https://www.heroeskingdoms.acidcave.net/sphinx/sylvan_town.png) | 680 × 552 | 14 |

Les cinq images sont opaques. Leur format PNG ne signifie pas qu'elles contiennent des bâtiments détourés. Le niveau exact de chaque construction et la version du client ayant produit ces compositions ne sont pas établis.

Les **74 zones cliquables du guide** ont été extraites dans [acidcave-town-hotspots.json](../../data/analysis/acidcave-town-hotspots.json). Ce sont des rectangles, cercles et polygones définis par le site communautaire, avec leurs coordonnées brutes. Ils ne sont pas les zones d'interaction certifiées du client Ubisoft. Le léger recadrage d'Inferno et les coordonnées en bord d'image demandent une vérification au rendu.

Les pages référencent aussi des images d'unités et des éléments de présentation. Leur [index HTML](../../data/analysis/acidcave-referenced-images.json) permet de poursuivre la collecte ; toutes ces références supplémentaires n'ont pas été téléchargées. Les statistiques de gameplay de ces pages ne sont pas importées dans les règles : certaines descriptions présentent des incohérences de faction.

## 2. Fichiers du CDN Ubisoft retrouvés dans Internet Archive

Une adresse conservée dans [MMHK-Plus, enhancedUI.js](https://github.com/Aendawyn/MMHK-Plus/blob/e8d862d82741986759b88012421aed8e8175e26e/MMHK-Plus/src/modules/common/enhancedUI.js) a fourni le préfixe historique :

```text
http://static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/
```

L'[index CDX récupéré](../../data/analysis/wayback-mmhk-cdx-2026-10-23.json) contient **3 906 URL archivées** (3 907 lignes JSON, en-tête compris), après filtrage des réponses historiques 200 et regroupement par URL. Parmi elles, **3 664 URL ont un type image**, correspondant à **1 006 empreintes CDX distinctes**. Plusieurs URL sont des versions successives d'un même contenu. Le portail, les annonces et l'interface sont également représentés.

**Ce décompte n'est pas un pack de 1 007 assets de gameplay téléchargés.** Il s'agit d'un inventaire de pistes archivées. La collecte réalisée ici porte sur 24 images du CDN et 3 fichiers JS/CSS, auxquels s'ajoutent les 5 scènes AcidCave.

Requête reproductible : `https://web.archive.org/cdx/search/cdx`, paramètres `url=static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/*`, `output=json`, `filter=statuscode:200`, `collapse=urlkey`, `fl=original,mimetype,timestamp,digest`, `limit=10000`. La réponse ne touche pas cette limite ; cela ne garantit pas l'exhaustivité des captures détenues par toutes les archives.

| Ressource effectivement récupérée | Quantité | Usage et limite |
| --- | --- | --- |
| Fonds de région propre et étrangère | 2 | Images seules avec grille isométrique, 680 × 562 ; objets à superposer |
| Fonds de monde zoom 1 et zoom 2 | 2 | Images seules avec grille et flèches, 680 × 562 ; ne constituent pas tout le jeu de tuiles |
| `city/HAVEN/TAVERN.gif` | 1 | Bâtiment individuel transparent, 80 × 75, version 4.1.27-MTR |
| Planches `cityBuildingList/*_building.gif` | 4 | Havre, Académie, Inferno et Nécropole ; petites images de bâtiments, planches transparentes de 656 × 378 |
| Habillages extérieurs `backgroundGame/bg_*.jpg` | 5 | Un par faction ; décors de la page autour du jeu, pas fonds vides des villes |
| Sélecteurs de cases, alertes, timer et fond de guilde | 10 | Éléments d'interface à recouper avec le client et les captures |
| `prod.js` 4.1.3-MTR et 1.5.0.39-4-MTR ; `prod.css` 4.1.3-MTR | 3 | Sources historiques lues comme texte, non exécutées |

Exemples d'accès direct aux archives :

- [Fond de région](https://web.archive.org/web/20130524000314id_/http://static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/4.1.13-MTR/img/region/background_region.jpg).
- [Taverne du Havre](https://web.archive.org/web/20230507082902id_/http://static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/4.1.27-MTR/img/city/HAVEN/TAVERN.gif).
- [Planche des bâtiments du Havre](https://web.archive.org/web/20130524010331id_/http://static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/4.1.13-MTR/img/cityBuildingList/haven_building.gif).
- [Client JavaScript 4.1.3-MTR](https://web.archive.org/web/20130315160854id_/http://static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/4.1.3-MTR/js/prod.js).

La capture de la taverne date de 2023 : cette date décrit son archivage, pas sa création. Les tentatives directes HTTP et HTTPS vers le CDN pour `HAVEN/base.jpg` et `HAVEN/TAVERN.gif` ont échoué avec une réponse 400 pendant cette session. Cela ne prouve pas que toute copie du CDN a disparu.

## 3. Le placement original des bâtiments est retrouvé

Dans le client **4.1.3-MTR**, `CityView.display` construit le fond avec `img/city/<FACTION>/base.jpg`. `displayBuiltCityBuildingImage` construit le chemin du GIF à partir du nom logique ou du champ `file`, puis applique `x`, `y` et éventuellement `zindex`.

Les objets `HOMMK.CITYVIEW_CONF.CITY_BUILDING_*` donnent **43 configurations par faction, soit 215 entrées**. L'extraction statique conserve les coordonnées, les substitutions de fichier, les positions des icônes de chantier et les liens vers les fenêtres de recrutement, marché, taverne et guilde. Le CSS confirme une scène native de **680 × 552**.

- [Configurations extraites](../../data/analysis/original-city-layouts-4.1.3.json).
- [Chemins d'images attendus et état de récupération](../../data/analysis/expected-city-files.json).
- [Extracteur reproductible](../../tools/extract-recovered-city-layouts.py).

Exemple : la taverne du Havre possède `x=328`, `y=333`, `zindex=4`, avec un accès à `TavernFrame`. Ces données proviennent du client archivé, contrairement aux polygones d'AcidCave.

Les 215 entrées correspondent à **170 chemins GIF et 5 fonds JPG**. Plusieurs niveaux utilisent le même fichier, notamment le silo ; il ne faut pas compter une image différente pour chaque configuration. Un seul de ces 170 chemins GIF est récupéré comme bâtiment de scène : la taverne du Havre, dans une version ultérieure. Sa compatibilité avec la configuration 4.1.3 reste à vérifier visuellement. Les quatre planches de miniatures constituent une autre famille graphique.

Ces découvertes documentent le rendu. Elles ne prouvent pas les calculs du serveur, les droits de toutes les actions, ni la version exacte des règles de notre campagne classique. Le client tardif contient aussi des fonctionnalités hors périmètre ; aucune n'est activée automatiquement dans le backlog.

## 4. Autres pistes qualifiées

| Piste | Résultat | Suite utile |
| --- | --- | --- |
| [Raphaël Quercy — portfolio MMHK](https://www.behance.net/gallery/21667427/Might-Magic-Heroes-Kingdoms) | Présentation d'un travail d'interface, UX et icônes sur le jeu ; publication datée du 28 novembre 2014 | Piste de contact pour demander s'il subsiste des archives graphiques ; aucun message envoyé |
| [Galerie JeuxOnline](https://mmhk.jeuxonline.info/images/Might_and_Magic_Heroes_Kingdoms) | Captures et images d'unités utiles à la comparaison | Compléter les références ; pas de pack complet de calques identifié |
| [Heroes Kingdom Evolution](http://amroth.free.fr/MMHK/extension/) et [son code](https://github.com/raubert/Heroes-Kingdom-Evolution/tree/2.5) | Extension communautaire, ressources d'interface et scripts | Référence d'ergonomie ; pas de kit complet de villes trouvé dans l'arbre examiné |
| [Laura Eve/Lopes — Heroes Kingdom](https://lauraevelopes.wixsite.com/portfolio/heroes-kingdom) | Titre prometteur, mais la description mentionne Heroes Online | Attribution ambiguë : aucune image intégrée comme asset MMHK certifié |

Les recherches générales renvoient souvent des ressources de Heroes V, Heroes Online ou d'autres jeux isométriques. Leur ressemblance ne suffit pas à les identifier comme fichiers MMHK.

## 5. Les manques à rechercher précisément

1. Les cinq `img/city/<FACTION>/base.jpg` vides.
2. Les 169 chemins GIF de bâtiments de scène non récupérés, avec leurs variantes ; la liste exacte est désormais disponible.
3. La planche de miniatures des Sylvains et les correspondances de découpe des quatre planches retrouvées.
4. Les objets de région, mines, reliefs, cités et déplacements à toutes les échelles, au-delà des fonds et des icônes Jactari.
5. Les états de chantier, dégâts et animations, puis les écrans de Guerre des Larmes absents du corpus actuel.

Le meilleur levier restant pour les villes est une ancienne sauvegarde du client ou du cache d'un joueur, ou une archive de production détenue par Ubisoft ou un ancien contributeur. Les noms de fichiers et placements extraits rendent désormais une demande d'archives beaucoup plus précise. Une image issue de découpage ou de reconstruction devra rester distinguée d'un fichier original récupéré.

## 6. Traçabilité et portée

Les fichiers sont conservés sans retouche, avec URL, version quand elle est connue, date de capture, date de récupération et empreinte. Aucune licence graphique ouverte n'a été identifiée ; les attributions historiques restent attachées aux références. Ce constat n'étend pas la licence du code Jactari aux images.

**U44 est partiellement levée**, pas clôturée. Le backlog de 300 fiches garde son état « à affiner » : la présence d'un asset ne vaut ni réalisation d'une fonctionnalité, ni validation de ses critères. Les inconnues visuelles des fiches UIX peuvent maintenant être affinées à partir de ce dossier.

## Contrôles effectués

Les 32 fichiers correspondent aux tailles et SHA-256 du manifeste ; les 29 images sont décodables aux dimensions déclarées. L'extracteur des 215 configurations reproduit le JSON à l'identique sans exécuter le client. Les 175 chemins attendus, les 74 zones communautaires et la fermeture des dépendances du premier lot (37 stories) ont été vérifiés. `python tools/validate.py` réussit 7 679 contrôles sans erreur ; le lanceur Node de `tools/validate-backlog.mjs` réussit 30 387 assertions et 4 395 liens contrôlés. Ces vérifications concernent les fichiers et la documentation, pas un moteur de jeu.

## 7. Reprise de la collecte Wayback après interruption

Le travail exploratoire mené ensuite dans un fil interrompu annonçait **2 759 fichiers historiques distincts, dont 1 129 images lisibles et huit versions de JavaScript**. Ces résultats décrivent **un lot d'une session de travail précédente**, qui n'a pas été commité et n'est pas actuellement accessible dans le dépôt ; ils ne doivent pas être confondus avec les **29 images et trois JS/CSS effectivement présents** dans `data/assets-recovered`.

Pour éviter une nouvelle perte de méthode, le script versionné [`tools/recover-wayback-cdn.py`](../../tools/recover-wayback-cdn.py) exploite le [catalogue CDX archivé](../../data/analysis/wayback-mmhk-cdx-2026-10-23.json), sélectionne ses captures `timestamp + original URL` et tente une récupération à partir de Wayback. La reprise s'appuie sur un journal JSONL, l'empreinte SHA-256 locale et un contrôle élémentaire des signatures PNG/JPEG/GIF/SWF/FLV et des pages HTML d'erreur. Les versions et chemins du client sont conservés. Les erreurs, indisponibilités et conflits de chemins restent tracés ; aucune image ne doit être inventée en remplacement.

Depuis la racine du dépôt :

```bash
python3 tools/recover-wayback-cdn.py --dry-run --limit 20
python3 tools/recover-wayback-cdn.py --kinds images,code,xml --limit 100
python3 tools/recover-wayback-cdn.py --limit 0
```

La récupération nécessite un accès Internet au service Wayback. **Elle n'a pas été réexécutée dans la présente session**, l'environnement d'analyse ne disposant pas de résolution réseau vers Internet Archive. Le nombre final de succès ne pourra être annoncé qu'en lisant le journal d'exécution, et non en le déduisant du CDX. Le dossier volumineux `data/assets-recovered/cdn-bulk` et le registre `data/analysis/wayback-recovery-ledger.jsonl` sont exclus des commits par `.gitignore` : les anciens binaires Ubisoft n'ont pas de licence graphique libre identifiée.

Les nouvelles preuves fonctionnelles tirées directement des scripts Ubisoft, notamment `friendKey`, `spawn=near/random` et `isNewbie`, sont analysées dans [le dossier de génération du monde et de protection](GENERATION-MONDE-RELIQUES-ARRIVEE-PROTECTION-2026-10-23.md).

### Contrôle statique de l'inventaire

La reprise du 23 octobre a reparsé les **3 906 URL** du CDX avec la politique de normalisation du téléchargeur : **3 906 chemins historiques utilisables, aucun chemin dangereux détecté et aucune collision après normalisation**. Ce contrôle porte sur les chemins du catalogue, **pas** sur le succès des téléchargements ni la validité des binaires distants. Suite de vérifications locales prévue : `python3 tools/test_recover_wayback_cdn.py`.
