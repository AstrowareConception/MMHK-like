# Dictionnaire et utilisation des données

Ces fichiers sont une **extraction documentaire**, pas des données prêtes à injecter sans validation dans un serveur. Ils proviennent de CODE-01. Le [manifeste](source-manifest.json) contient chemins, commit, empreintes Git et SHA-256 des sources originales. L’extraction élimine les descriptions narratives et les chemins d’images, projette les textes utiles en français et conserve les descriptions mécaniques des sorts, talents, bâtiments et effets.

## Fichiers

| JSON | Contenu | Clé de référence |
| --- | --- | --- |
| `reference/general.json` | Factions, armes, ressources, fortifications, constantes et bonus des Larmes | Indice ou clé originale |
| `reference/creatures.json` | `_unites` : unités, engins et PNJ | **Indice dans le tableau** |
| `reference/batiments.json` | Ville et sous-ensemble des aménagements régionaux | Indice ; entrée ville 0 vide |
| `reference/heros.json` | Archétypes, niveaux, carrières, talents et références du calculateur | Indices multiples, voir ci-dessous |
| `reference/sorts.json` | Écoles, types, cibles, unités et 36 sorts | Indice du sort |
| `reference/artefacts.json` | Artéfacts, effets, emplacements, ensembles | Indices + `id` source lorsqu’il existe |
| `reference/bonus.json` | Compétences d’alliance, héréditaires et spéciales | Clé textuelle source |
| `reference/counts.json` | Comptages de contrôle | Métriques du corpus, pas du jeu complet |

## Unités et coûts

`G` : or ; `w` : bois ; `o` : minerai ; `m` : mercure ; `c` : cristal ; `s` : soufre ; `g` : gemmes. La casse est signifiante. `I` : infanterie, `R` : tireur, `C` : cavalerie ; les engins utilisent un code propre conservé dans la source.

`puissance` est la force individuelle ; `rang` est le tier, pas le niveau du héros ; `plus` signale la variante améliorée dans les lignées ordinaires ; `prod` est la production nominale ; `cout` le recrutement ; `cout_amel` le coût déclaré d’amélioration ; `ratio_xp` le diviseur de puissance utilisée dans l’XP du simulateur. Une valeur absente n’est **pas** zéro. Une entrée PNJ sans `prod` ne doit pas être rendue recrutable.

**Ne pas joindre sur `id` des créatures :** ce champ est absent sur de nombreuses lignes. L’indice de tableau est la référence effectivement utilisée par le calculateur. L’extracteur ne remplit pas artificiellement les trous. L’amélioration peut changer d’arme et même diminuer la puissance nominale : l’archer squelette n’est pas une erreur à « corriger » automatiquement.

## Bâtiments

`duree` est conservé en minutes brutes ; le portail à 10 080 correspond à sept jours. `niveau` ne signifie pas toujours niveau d’amélioration : sa contribution au niveau de cité doit être contextualisée. `prerequis.batiment` référence un indice ou une liste selon l’entrée. Le tableau contient également des placeholders textuels, notamment `XmairieX`, `XRelai1X`, `XGM5X`, qui nécessitent une résolution par faction.

Les coûts sont hétérogènes : objet de ressources dans la majorité des cas, scalaire `cout` avec ressources à plat dans certaines entrées régionales. Ne pas perdre ces champs lors de la normalisation. Les valeurs `domination` sont conservées telles quelles : certaines incluent l’historique d’une chaîne d’amélioration. Le premier conseil vaut 2 000 malgré un coût de zéro. Le catalogue régional ne contient que le cristal, entrepôt, champs, relais et portail : **l’absence d’un aménagement n’est pas la preuve de son absence du jeu**.

## Héros et magie

Dans `_archetypes`, les nombres `attaque`, `defense`, `magie` sont des **indices de courbe de progression**, pas des statistiques initiales. Pour un niveau `L`, `_niveaux[L][0]` est le seuil d’XP et `_niveaux[L][courbe]` donne la caractéristique si `courbe > 0` ; la courbe 0 signifie aucune progression, elle ne doit pas lire la colonne XP. Les niveaux 1–40 sont tabulés.

Un talent se référence par `(groupe, position)`. Les groupes 0–12 correspondent aux carrières ; 13–20 sont les extensions légendaires non nommées dans `_carrieres`. `v` contient les valeurs par rang, `pourcent` indique une grandeur en pourcentage et `plus` le sens de l’effet déclaré. Une description ne suffit pas à établir l’ordre de cumul.

Pour un sort : `ecole`, `type`, `cible`, `unite` indexent les tables du même fichier ; `cercle` limite l’accès ; `puissance` et `facteur` décrivent des coefficients de calcul. Le champ `unite` est une catégorie de calcul, pas un identifiant de créature. Toute variante additionnelle présente dans le JSON reste à traiter explicitement.

## Artéfacts et ensembles

Les effets ont leur propre table. La liste `effets` d’un artéfact contient des références d’effet et de niveau ; la signification de ce niveau se vérifie contre la table `v`, sans supposer qu’il s’agit du niveau du héros. Les huit emplacements sont conservés. Les chaînes vides des sentinelles, les artéfacts d’événement et les ensembles restent dans l’extraction ; le filtre de disponibilité par saison manque.

Les JSON sont la forme modifiable des données dérivées, sous GPL-3.0-or-later. Les auteurs du projet pourront construire une seconde couche normalisée (`UnitDefinition`, `BuildingDefinition`, etc.) sans modifier silencieusement ce référentiel historique. Les valeurs corrigées devront être accompagnées de leur preuve et d’un journal de migration.

## Ressources visuelles ajoutées en révision 0.2

`Jactari/src` et `Screenshots` sont les imports historiques fournis par l’utilisateur, conservés sans modification. Les résultats de l’analyse sont dans `analysis` :

| Fichier | Contenu |
| --- | --- |
| [screenshots-inventory.json](analysis/screenshots-inventory.json) | 57 fichiers, dimensions, empreintes, doublons |
| [screenshots-observations.json](analysis/screenshots-observations.json) | Lecture manuelle, famille, faits observés, limites pour chaque capture |
| [jactari-inventory.json](analysis/jactari-inventory.json) | 153 fichiers, 96 images, mentions absentes et comparaison avec CODE-01 |
| [sprite-manifest.json](analysis/sprite-manifest.json) | 1 317 liens objet/état/rectangle, avec diagnostic de présence et de bornes |

Un rectangle valide géométriquement ne certifie pas à lui seul la disponibilité de l’objet dans la saison retenue. Les correspondances sont une couche de présentation ; les JSON `reference` ne changent pas. Les scripts `audit-visual-resources.py` (Pillow) et `extract-sprite-manifest.mjs` reproduisent les inventaires ; les observations humaines ne sont pas générées par une OCR.
