# MMHK — génération du monde, mines, sites spéciaux et arrivée des joueurs

**Rétroconception du 23 octobre 2026.** Profil visé : PvP classique avec Guerre des Larmes. Ce document poursuit le travail précédent sans prétendre avoir retrouvé le générateur Ubisoft. Il distingue **OBS-CLIENT-ARCHIVE** (preuve dans les fichiers historiques), **DOC** (témoignage ou description datée), **DECISION-USER** (souvenir/choix pour MMHK-like), **PROP** (mécanique de reconstruction), **INCONNU** (paramètre introuvable). Les versions du client et des mondes ne sont pas interchangeables.

## 1. Géométrie, sept ressources et quatre mines

**DOC (2010), recoupé par la description du jeu :** chaque région est une grille de **5 × 5 zones**, soit **25 cases** ; la ville occupe le centre ; **quatre autres zones** contiennent des mines défendues initialement par des troupes neutres. Les autres zones accueillent des troupes et éventuellement des aménagements. Cela ne signifie **pas quatre ressources par case** : quatre mines sont réparties dans **une région**. Sources : [Warhammer Online News, compte rendu du 31 décembre 2010](https://warhammeronlinenews.wordpress.com/2010/12/31/heroes-kingdoms-short-review/), [fiche historique Might-and-Magic.com](https://might-and-magic.com/heroes_kingdoms.html), [Wiki du jeu](https://mightandmagic.fandom.com/wiki/Might_%26_Magic%3A_Heroes_Kingdoms).

Les **sept ressources** sont l'or, le bois, le minerai (pierre), le cristal, les gemmes, le soufre et le mercure. Bois/minerai sont *communs* ; cristal/gemmes/soufre/mercure sont *rares* ; l'or forme sa propre catégorie. La description historique confirme l'existence d'ensembles de quatre mines, mais pas une distribution obligatoire `or + bois + minerai + rare`. [Présentation économique](https://en.wikipedia.org/wiki/Might_and_Magic%3A_Heroes_Kingdoms).

| Question | État | Conclusion |
| --- | --- | --- |
| Quatre mines par région | **DOC, corroboré** | Invariant de référence à modéliser pour une région ordinaire |
| Un or, un bois, un minerai, une rare | **DECISION-USER, souvenir dominant** | Composition *fréquente selon le souvenir*, **non systématique** |
| Deux mines du même type | **DECISION-USER, souvenir de cas rares** | Doublons possibles : ne jamais imposer l'unicité |
| Deux mines d'or ou aucune mine d'or | **DECISION-USER / souvenir de la recherche précédente** | Cas à permettre et à vérifier, pas une fréquence prouvée |
| Pondérations par type, corrélations, répartition spatiale | **INCONNU** | Ne pas fabriquer de pourcentages ni d'ordre de placement |
| Terrains interdits, garnisons PNJ et équilibrage autour d'un débutant | **INCONNU** | Demandent d'autres captures et des exemples multi-régions |

**Conséquence de conception (PROP) :** stocker les **quatre occurrences** sous forme d'un tableau d'emplacements typés, et non d'un ensemble de quatre types distincts. Exemple de modèle, **sans valeur historique de probabilité** :

```json
{
  "region": {"x": 42, "y": 19, "size": 5, "cityCell": [2, 2]},
  "mineCells": [
    {"cell": [0, 1], "resource": "gold"},
    {"cell": [1, 4], "resource": "wood"},
    {"cell": [3, 0], "resource": "ore"},
    {"cell": [4, 3], "resource": "crystal"}
  ],
  "provenance": "PROP_EXAMPLE_NOT_HISTORICAL_OUTPUT"
}
```

Le générateur de tests doit accepter des distributions contrôlables, interdire deux mines sur la **même case** et réserver le centre pour la cité. Il ne doit pas imposer l'unicité du **type** de ressource.

## 2. Sites mondiaux, « reliques », obélisques et Larmes

Ne pas fusionner plusieurs familles de mécanismes sous le mot « reliques » :

- **OBS-CLIENT-ARCHIVE — sites d'événements mondiaux** : le client `4.1.3-MTR/js/prod.js`, méthode `getRegionBuildingType`, classe explicitement `LEARNING_STONE`, `SPHINX`, `DWARVEN_TREASURY`, `GNOME_BUILDING`, `HALLOWEEN_GHOST` et `THRONG_OF_MANTICORES` dans `WORLDMAP_EVENT_REGION_BUILDING`. Le client plus ancien `1.5.0.39-4-MTR` possède aussi des sprites de plusieurs de ces sites. Leur présence dans le client ne prouve ni leur activation simultanée dans un monde classique, ni leur quantité.
- **DOC — obélisques et Voie de Domination** : le [guide historique](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/put_gospodstva/3-1-0-13) décrit la recherche, le déchiffrement et la fouille de Larmes. Il indique notamment qu'un obélisque se trouve dans un rayon de **dix cases** pour une étape concernée. Ce rayon de recherche de quête n'est **pas** un espacement minimal du générateur.
- **DOC/OBS-CLIENT-ARCHIVE — bâtiments d'alliance** : `PORTAL`, `REFINERY`, `BANK`, `RUNIC_FORTRESS` sont des catégories distinctes dans la même méthode. La Guerre des Larmes et les monuments ne sont pas des sites neutres tirés au hasard.
- **INCONNU — dolmens et « reliques » au sens exact de l'utilisateur** : les appellations, l'ensemble des familles visées, leur rareté, les préconditions et leur implantation initiale demandent une corroboration. Aucun `dolmen` littéral n'a été trouvé dans les deux clients JS archivés consultés au cours de cette reprise.

**Information manquante :** aucun relevé fiable de plusieurs cartes complètes du **même monde et de la même version** ne permet de mesurer une densité par type, une contrainte de distance, une distribution par biome ou une symétrie. Les assets et sprites indiquent les objets que le client **sait afficher**, pas ce que le serveur **génère**. Il faudra constituer un jeu de relevés `worldId, version, x, y, siteType, source, confidence` avant d'inférer une loi spatiale.

## 3. Première inscription, mode aléatoire et « code ami »

**OBS-CLIENT-ARCHIVE, version `4.1.3-MTR` (Git blob `aa67d098bf558bcb85bfe0ad86e11334e6665ed5`) :**

1. Dans le parcours d'inscription, `HOMMK.registerCheckFriendKey` envoie `REGISTER_ACTION_CHECK_FRIEND_KEY` avec les champs **`worldId`** et **`friendKey`**. Une clé vide réactive la validation classique du nom du joueur ; une clé non valide bloque l'étape suivante.
2. L'interface `HOMMK.ReferralFrame` définit `REFERRAL_FRAME_SPAWN_NEAR = "near"` et `REFERRAL_FRAME_SPAWN_RANDOM = "random"`. Deux boutons distincts sélectionnent le mode de placement de l'invité.
3. `displayDetails` transmet au serveur `action: ACTION_GET_DETAILS`, `spawn: selectedSpawn`, `referralType`. `launchAction` transmet `ACTION_SEND_INVITATIONS` avec `spawn` et la liste de courriels. Le serveur fabrique les liens `directLink`, `htmlLink`, `forumLink`.
4. Si `WORLD_SUBSCRIPTIONS_OPENED` est faux, le bouton `near` est masqué/désactivé et `random` sélectionné. **La disponibilité du choix dépend donc aussi de l'état du monde** ; éviter de rendre « près de mon ami » systématiquement possible.
5. **DOC, entretien ancien de l'équipe du jeu** : la zone de départ place des débutants près d'autres débutants, sauf lorsqu'ils choisissent de rejoindre un ami. [FAQ citée en 2007 sur H3WoG](https://www.h3wog.com/thread-13352-1-1.html) ; source pré-lancement qui décrit une intention, pas une certification de l'algorithme final.

**DECISION-USER** : arrivée normalement aléatoire ; un joueur présent peut générer/transmettre un **code ami** pour que le nouvel arrivant apparaisse **à proximité**. La combinaison du formulaire `friendKey` et des modes `near/random` est une corroboration particulièrement solide du parcours, mais ni le format complet de la clé ni le rayon de voisinage, les distances permises, la réutilisation et les exclusions de cases ne sont présents dans ces fragments du client. **Ces calculs sont côté serveur (INCONNU).**

**Contrat proposé (PROP, sans règle de distance inventée)** : `startKingdom(worldId, playerId, optionalFriendKey, spawnMode)`, validant la clé **pour ce monde**, l'espace libre, la disponibilité du mode, puis affectant atomiquement la première région. `spawnMode=near` exige une référence résolue et n'est jamais interprété comme une coordonnée client de confiance. Enregistrer un `placementReason` (`random`, `friend-near`, `fallback`) pour les tests et diagnostics, sans divulguer de données privées au voisinage.

## 4. Protection débutant : preuve de l'interface et conflit des durées

**OBS-CLIENT-ARCHIVE** : le client contient le sprite `NEWBIE_PROTECTION`, affiche l'état `HOMMK.player.content.isNewbie` dans la vue de cité/région et construit une infobulle à partir de `HOMMK.player.content.endDate`. Il expose éventuellement `removeProtectionItem` et `canRemoveProtection`; après protection, `addProtectionItem`/`canAddProtection` peuvent apparaître. Cette protection débutant **n'est pas équivalente** à la protection additionnelle achetée.

**Durée historique contestée selon les témoins :**

| Valeur | Provenance | Qualification |
| --- | --- | --- |
| **7 jours** | **DECISION-USER**, souvenir de la première cité | Baseline envisagée pour MMHK-like, non prouvée universelle dans l'original |
| **14 jours / deux semaines** | [DigitalChumps, essai du 26 juillet 2010](https://digitalchumps.com/2010/07/26/might-and-magic-heroes-kingdoms-preview/) | Témoignage d'une période précise |
| **15 jours** | [JeuxOnLine, critique du 5 février 2010](https://www.jeuxonline.info/critique/3727), [autres critiques historiques](https://www.jeuxonline.info/critiques/Might_and_Magic_Heroes_Kingdoms), [témoignage allemand](https://onlinespielen.wordpress.com/tag/might-magic-heroes-kingdoms/) | Plusieurs descriptions de début 2010, sans preuve d'universalité |

Ni `isNewbie`, ni `endDate` ne fournissent une durée **codée en dur** dans le client. Le serveur fixe cette échéance. **Le fait que l'indicateur apparaisse sur la cité ne prouve pas à lui seul le périmètre exact de l'immunité** : première cité uniquement, royaume entier, interdiction de certaines actions offensives, levée anticipée, règle de saisie de villes restent à qualifier.

**PROP :** définir dans un profil versionné `newbieProtectionDurationDays` et `newbieProtectionScope`, choisir initialement sept jours **par décision du projet**, enregistrer `startsAt` et `endsAt` côté serveur, refuser atomiquement les attaques interdites et vérifier les deux bornes temporelles. La protection ne se renouvelle pas à chaque reconnexion ; une prolongation consommable est une règle distincte.

## 5. Archivage : disponibilité réelle au redémarrage du thread

Le dépôt `main` arrêté au commit `bde8df6` conserve **3 907 lignes URL indexées** dans `data/analysis/wayback-mmhk-cdx-2026-10-23.json` (en-tête séparé) : analyse actuelle **3 906 notices**, **1 091 empreintes CDX distinctes tous formats**, dont **3 663 notices images** par comptage direct des MIME présents (1300 GIF, 955 PNG, 1408 JPEG). Les différences de comptage avec les rapports précédents tiennent à l'objet compté (URL, empreinte, image, variante), pas à une augmentation prouvée du nombre d'images uniques.

Le disque GitHub ne contient toujours que **29 images archivées + 3 fichiers clients** dans `data/assets-recovered`. La session interrompue rapportait **2 759 fichiers récupérés**, **1 129 images lisibles** et **huit versions JS** : ces chiffres sont un **bilan de session précédente non répliqué dans `main`**, et non une affirmation que ces milliers de binaires sont ici. Pour la récupération effective, suivre l'index CDX et enregistrer pour chaque fichier l'URL Wayback, l'empreinte SHA-256, le type détecté, l'état et la version ; ne jamais prendre une page d'erreur HTML pour une image valide.

**Point clé pour les villes :** l'extracteur déjà commité identifie **175 chemins attendus** (`base.jpg` et GIF de scène), dont très peu sont présents. Les 5 scènes communautaires aplaties ne peuvent pas remplacer les bâtiments séparés d'une ville en progression.

## 6. Tests, observations à rechercher et critères de décision

1. **Cartes régionales :** constituer un échantillon de régions d'un même serveur/version avec les 25 cases et les quatre mines visibles. Contrôler doublons et absences d'or, compter fréquences et corrélations sans extrapoler depuis une région isolée.
2. **Sites spéciaux :** relever types, coordonnées mondiales et période d'apparition ; séparer monuments construits, sites neutres et objectifs de quête. Comparer distances *toriques* (si la carte du monde est raccordée) et euclidiennes seulement avec un témoin serveur.
3. **Inscription :** tester un `friendKey` valide/invalide, un mauvais `worldId`, deux invités simultanés, un monde plein et `WORLD_SUBSCRIPTIONS_OPENED=false`. Vérifier « près » sans figer le rayon.
4. **Protection :** tester attaque avant fin, exactement à échéance, après échéance, sur première et deuxième cité, action offensive du débutant et usage d'une protection achetée. Les attentes dépendent du profil choisi.
5. **Traçabilité :** relier ces résultats à **U17** (génération), **U20** (immunités), **U16** (état initial/colonisation), **U31–U35** (Larmes et carte) et aux user stories ACC, MON, REG, REL, PVP/SIE concernées. Les durées historiques ne doivent jamais être maquillées en probabilités ou en règles certaines.

**Conclusion :** le client Ubisoft est un excellent oracle des **états affichables** et du **protocole d'invitation**. La composition probabiliste des régions, le placement des sites et le rayon « près d'un ami » restent des décisions serveur non retrouvées. Pour une reconstruction jouable, ces paramètres doivent être **configurables, seedés et explicitement marqués PROP** jusqu'à preuve contraire.
