# Analyse des captures MMHK — corpus fourni

Révision 0.2, 22 octobre 2026. Source **IMG-01**, commit `71f8ec79cbea19246c539394bf33d75fc21f26b3`. Les **57 fichiers donnent 53 images distinctes**. Les quatre doublons exacts sont SS-015/014, SS-027/026, SS-035/029 et SS-038/037. Les variantes redimensionnées ou recadrées sont conservées séparément et ne sont pas considérées comme des preuves indépendantes.

L’[inventaire technique](../../data/analysis/screenshots-inventory.json) donne dimensions, format et empreintes. Les [observations structurées](../../data/analysis/screenshots-observations.json) portent les conclusions image par image. Les identifiants SS ci-dessous correspondent au corpus épinglé ; pour ajouter des images, conserver ces identifiants dans les annotations ou réconcilier le tri généré avant de publier.

## Ce que les captures changent dans la rétroconception

Le monde et la région utilisent des cases isométriques, mais **la ville est une composition illustrée propre à sa faction**, avec bâtiments et médaillons cliquables. Passer monde → région → ville change la représentation et les informations ; une simple mise à l’échelle de la même carte ne reproduirait pas ces écrans. Deux échelles du monde sont documentées : détaillée et politique éloignée.

Les preuves de disposition sont fortes ; celles de comportement sont partielles. Une flèche suggère une commande, un curseur prouve un contrôle présent, une image fixe ne prouve ni la vitesse de déplacement de caméra, ni le glisser-déposer, ni l’animation d’un trajet. Le rendu JavaScript est une exigence du projet, pas une conclusion tirée d’une capture.

Le corpus juxtapose une interface très ancienne, une famille bêta, une famille `v1.5…` et une famille `v4.1…`. Le numéro de client affiché n’est pas automatiquement celui de la saison. Le profil de victoire demeure le **PvP classique avec Guerre des Larmes**, conformément à la décision utilisateur. Boutique, vestiges, défi solo et commandes régionales tardives restent des preuves de variantes.

## Monde : deux densités et une interface persistante

![SS-033 — Monde détaillé, famille v1.5](../../data/Screenshots/Vue%20monde/sc13rc2.jpg)

SS-033 — Monde détaillé, famille v1.5.

![SS-034 — Monde éloigné et territoires colorés](../../data/Screenshots/Vue%20monde/sc13rc3.jpg)

SS-034 — Monde éloigné et territoires colorés.

Le terrain est dessiné en losanges ; les villes se distinguent par faction, les limites de territoire et trajets sont superposés. La sélection utilise des coins contrastés ; des triangles rouges/blancs bordent la scène. La barre inférieure va du globe à la ville avec un curseur et des repères segmentés. Les couleurs territoriales ne reçoivent aucune sémantique allié/ennemi définitive sans légende.

La chronologie supérieure comporte des heures, une ambiance jour/nuit et des marqueurs d’événement. Le panneau droit conserve cités, stocks, revenus, plafonds, garnisons, héros et missions. Plusieurs cités peuvent être repliées. Les stocks sont ceux de la cité sélectionnée ; rien ne justifie de les remplacer par un portefeuille mondial unique.

## Région et ville : deux compositions à reconstruire

![SS-045 — Région Sylvan : 25 cases et décor périphérique](../../data/Screenshots/Vue%20r%C3%A9gion/sc13rbv%20%281%29.jpg)

SS-045 — Région Sylvan : 25 cases et décor périphérique.

![SS-054 — Ville Sylvan développée : scène dédiée](../../data/Screenshots/Vue%20ville/sc13rby.jpg)

SS-054 — Ville Sylvan développée : scène dédiée.

La région montre une grille **5×5**, la cité centrale, quatre mines, des sites occupés ou aménagés et des balises verticales. Forêts, falaises et cours d’eau continuent au-delà de la grille : ce décor ne doit pas créer de cases jouables supplémentaires. Les objets dépassent leur case, ce qui nécessite une règle de profondeur et des zones de sélection cohérentes.

Les cinq factions disposent de références de ville : Académie SS-050 (îlots flottants), Havre SS-051 (château et rivière), Inferno SS-055 (roche et lave), Nécropole SS-056 (tours et lumière verte), Sylvan SS-052/054 (arbre et plateformes). Le niveau affiché à côté du nom de ville est un niveau de développement. Il ne mesure pas le zoom. Les médaillons et info-bulles de bâtiments constituent un second niveau d’information au-dessus de la scène.

SS-042 montre un entrepôt régional : **+50 % de stockage, 1 construit sur 5 maximum, effet cumulatif**, corroborant G16 pour cette version. SS-051 montre une construction augmentant de **5/jour** la production de paysans et conscrits, avec **20 000 or, 30 bois, 30 minerai** affichés. Le coût et le bonus de SS-051 correspondent exactement à l’entrée **67, Fermes (Havre)** du catalogue Jactari de 2013 : corroboration de cette ligne précise, pas de toute la table.

## Modales et parcours fonctionnels récupérés

| Parcours | Informations et commandes observées | Limite à respecter |
| --- | --- | --- |
| Préparation militaire, SS-016/018 | Héros et ennemi, sept pelotons, effectifs, pouvoirs, contributions aux bonus, rapports de reconnaissance, livre de sorts, tours, durée, haltes, annuler/engager | Les pouvoirs affichés peuvent inclure des bonus ; ne pas les remplacer par une somme brute |
| Rapport, SS-017 | Courrier, onglets de dossiers, tours, magie, contre-arme, effectifs/pertes et déroute, défilement interne | Rapport tronqué ; aucune validation complète de la formule de combat |
| Héros, SS-019–025 | Portrait, XP, attaque/défense/magie, résumé, talents, inventaire, sorts, trois carrières | Les conditions d’ouverture ne sont pas toutes visibles |
| Inventaire, SS-023 | Huit emplacements équipés, sac à dos, objets dans la cité, pagination, effets et emplacement dans l’info-bulle | Capacité totale et modalités de transfert inconnues |
| Reconnaissance, SS-031 | Choix troupes/ville/région, héros, curseur de durée, temps et score d’information | Aucune courbe de probabilité déductible d’un point |
| Colonisation, SS-040 | Droits liés au classement, prix, nom, limite gratuite, délai, abonnement | Capture x200 de test, donc exemple d’interface, pas tarif de référence |
| Pillage, SS-041 | Cible principale, cibles secondaires, durée de dégâts estimée et butins connus/inconnus | « ? » doit rester inconnu ; ne pas remplacer par zéro |
| Marché, SS-053 | Marchand/Caravane/Hôtel des ventes, sept ressources, charge, destination, stock/plafond/revenu d’arrivée, répétition et attente | Menus fermés : seule la valeur sélectionnée est prouvée |
| Taverne, SS-057 | Deux offres, archétypes et courbes, coût et délai, renouvellement des offres, limite commerciale | Paramètres contextuels, pas barème exhaustif |


![SS-018 — Préparation de combat et sélection des tours de magie](../../data/Screenshots/Vue%20combat/sc13rc1.jpg)

SS-018 — Préparation de combat et sélection des tours de magie.

![SS-023 — Équipement, sac et réserve de la cité](../../data/Screenshots/Vue%20h%C3%A9ros/might-magic-heroes-kingdoms_2123145.jpg)

SS-023 — Équipement, sac et réserve de la cité.

![SS-053 — Caravane et contrôles de répétition](../../data/Screenshots/Vue%20ville/might-magic-heroes-kingdoms_2123147.jpg)

SS-053 — Caravane et contrôles de répétition.

Dans SS-053, les maxima affichés sont **30 000 or / 15 bois / 15 minerai / 6 de chaque rare**. Ils pourraient représenter des équivalences d’une même charge : l’image ne prouve pas qu’on peut envoyer tous ces maxima simultanément. Le réglage « 4 fois » démontre une commande de répétition, mais pas si le décompte comprend le trajet courant. « La quantité exacte » et « Pas d’attente » démontrent des politiques sélectionnables sans fournir leurs autres valeurs.

Dans SS-057, les deux offres affichent **46 000 or et 10 h** ; renouveler affiche **3 200 or** et un compteur **23:59**. Le délai commercial de huit jours est distinct du délai de recrutement. Dans SS-031, **4 h 34 min 28 s** est associé à **130** de valeur d’information. Ces valeurs alimentent des cas d’interface, pas des constantes de gameplay.

## Inventaire commenté de chaque fichier

Toutes les conclusions de ce tableau sont `OBS-IMAGE`. Le champ « famille » indique le texte lisible ou une classification visuelle prudente ; « classique non daté » ne certifie pas une saison.

| Capture | Dimensions | Type / famille | Informations observées | Limite |
| --- | --- | --- | --- | --- |
| [SS-001](../../data/Screenshots/Autres/23415-480.png) | 480×307 | Chargement — illustration | Logo et barre de chargement. | Aucune géométrie interactive déductible. |
| [SS-002](../../data/Screenshots/Autres/5658dc21667427.563061b3de455.webp) | 628×524 | Vestige — tardif non daté | Étage 2 sur 20, héros, troupes, récompense Poutre magique, sortir, combattre, renfort. | Module ultérieur ; hors socle classique tant que non daté. |
| [SS-003](../../data/Screenshots/Autres/621344-might-magic-heroes-kingdoms-asia-browser-screenshot-loading-1024x576.png) | 1024×576 | Chargement Asia — illustration | Écran de chargement de la déclinaison Asia. | Ne prouve aucune règle du serveur européen. |
| [SS-004](../../data/Screenshots/Autres/74c18b21667427.563061c765406.webp) | 600×1094 | Planche d’artefacts — illustration | Icônes d’équipements regroupées par palettes et familles. | Planche de présentation ; correspondances logiques à tirer du code. |
| [SS-005](../../data/Screenshots/Autres/Might_and_Magic_Heroes_Kingdoms_cover.webp) | 471×212 | Logo — illustration | Identité et lettrage du jeu. | Pas un écran de gameplay. |
| [SS-006](../../data/Screenshots/Autres/ar61aw.webp) | 640×288 | Logo — illustration | Variante de résolution du logo. | Pas un écran de gameplay. |
| [SS-007](../../data/Screenshots/Autres/ar61o4.jpg) | 1260×586 | Ambiance Académie — illustration | Illustration de faction, ville et portrait. | Pas un fond de ville interactif isolé. |
| [SS-008](../../data/Screenshots/Autres/ar61o5.jpg) | 1260×586 | Chargement Inferno — illustration | Création du royaume, illustration et portrait. | Pas une liste de bâtiments disponibles. |
| [SS-009](../../data/Screenshots/Autres/ar61o6.jpg) | 1260×586 | Ambiance Nécropole — illustration | Illustration de faction et portrait. | Pas une carte ou une région. |
| [SS-010](../../data/Screenshots/Autres/ar61o7.jpg) | 1260×586 | Ambiance Havre — illustration | Illustration de faction et portrait. | Pas une carte ou une région. |
| [SS-011](../../data/Screenshots/Autres/bde67b21667427.563061d57b3f3.webp) | 600×299 | Planche d’icônes — illustration | Boucliers, anneaux, couronnes et objets en quatre palettes. | Signification mécanique non établie par l’image seule. |
| [SS-012](../../data/Screenshots/Autres/gallery_17_370_192607.jpg) | 920×382 | Bannière Inferno — illustration | Décor promotionnel de faction. | Ne pas le confondre avec l’aire de jeu. |
| [SS-013](../../data/Screenshots/Autres/might-and-magic-heroes-kingdoms_0190000000815357.jpg) | 400×212 | Illustration de cavalier — illustration | Personnage promotionnel. | Aucune statistique d’unité déductible. |
| [SS-014](../../data/Screenshots/Autres/might_and_magic_heroes_kingdoms%20%281%29.jpg) | 1281×846 | Chargement composite — illustration | Assemblage de factions, logo, progression. | Pas une vue monde. |
| [SS-015](../../data/Screenshots/Autres/might_and_magic_heroes_kingdoms.jpg) | 1281×846 | Chargement composite — doublon | Doublon exact de SS-014. | Ne constitue pas une seconde preuve indépendante. |
| [SS-016](../../data/Screenshots/Vue%20combat/4b11102da6a5cb6529c15ae1a1312ec1Might_Magic_Heroes_Kingdoms.jpg) | 640×436 | Préparation de combat — classique non daté | Deux camps, sept lignes de pelotons, livre de sorts, deux sélecteurs de tour, rapports d’espionnage, engagement/annulation. | La préparation n’est pas un combat tactique en direct. |
| [SS-017](../../data/Screenshots/Vue%20combat/heroes-kingdoms-03_2202491.jpg) | 1440×810 | Rapport de combat — v1.5.0.17-4-MTR | Rapport dans le courrier ; tours numérotés ; sort avant duel, flèche BONUS, effectifs et pertes ; colonne du royaume conservée. | Rapport partiel, équipements inconnus : pas un oracle complet des pertes. |
| [SS-018](../../data/Screenshots/Vue%20combat/sc13rc1.jpg) | 1010×680 | Préparation de combat — v4.1.19-MTR | Puissances 99 792 et 174 028 ; sept emplacements ; barres sans bonus/héros/troupes/fortifications ; deux sorts programmables ; durée affichée 5 min et 0 halte. | Les deux emplacements ne prouvent pas deux sorts gratuits pour tout héros ; cinq minutes n’est pas une durée par round. |
| [SS-019](../../data/Screenshots/Vue%20h%C3%A9ros/26101.jpg) | 1003×640 | Résumé du héros — classique non daté | Zoltan niveau 23, caractéristiques 26/26/26, trois carrières ; onglets Résumé, Talents, Inventaire, Sorts. | Ni déblocage des carrières ni calendrier de points lisibles. |
| [SS-020](../../data/Screenshots/Vue%20h%C3%A9ros/HMMKingdoms_4.jpg) | 932×768 | Résumé du héros — classique non daté | Mage de guerre niveau 18, 18/9/27 ; Bâtisseur, Destruction et Meneur ; effets listés dont accès T7. | Les bonus sont ceux de ce héros, non des bonus automatiques d’archétype. |
| [SS-021](../../data/Screenshots/Vue%20h%C3%A9ros/HMMKingdoms_4_m.jpg) | 500×412 | Résumé du héros réduit — classique non daté | Même présentation que SS-020 en résolution réduite. | Variante visuelle proche, fichier distinct ; pas de nouvelle règle. |
| [SS-022](../../data/Screenshots/Vue%20h%C3%A9ros/heroes-kingdoms-02_2202490.jpg) | 1440×810 | Inventaire du héros — v1.5.0.17-4-MTR | Équipement, sac et stock de ville ; portrait, caractéristiques, info-bulle ; Sir Siggi niveau 28. | Les capacités maximales de sac/stock ne sont pas visibles. |
| [SS-023](../../data/Screenshots/Vue%20h%C3%A9ros/might-magic-heroes-kingdoms_2123145.jpg) | 1440×810 | Inventaire du héros — classique non daté | Lancelot niveau 23, huit emplacements ; Sac à dos et Dans la cité paginés ; info-bulle d’objet avec effets et main gauche. | La capture ne prouve ni glisser-déposer ni échange à distance. |
| [SS-024](../../data/Screenshots/Vue%20h%C3%A9ros/mightandmagicheroes2.jpg) | 892×519 | Inventaire recadré — classique non daté | Variante cadrée de l’équipement et des inventaires ; objets équipés différents de SS-023. | Pas un doublon exact ; aucune règle de transfert supplémentaire. |
| [SS-025](../../data/Screenshots/Vue%20h%C3%A9ros/sc13rc4.jpg) | 1008×678 | Résumé du héros — v1.5.0.51-3-MTR | Niveau 17, 0/29/29 ; Bâtisseur, Destruction, Marchand ; bonus vente 27 % et capacité caravane 50 %. | Chiffres propres à ce héros ; version client distincte du numéro de saison. |
| [SS-026](../../data/Screenshots/Vue%20monde/865%20%281%29.jpg) | 1014×658 | Monde politique — v0.7.94 Tech Beta | Territoires colorés, repères, zoom inférieur, flèches de déplacement ; panneau DISTANT JAIL pour un héros capturé. | Bêta ; statut de prisonnier observé, procédure de libération non visible. |
| [SS-027](../../data/Screenshots/Vue%20monde/865.jpg) | 1014×658 | Monde politique — doublon | Doublon exact de SS-026. | Pas une deuxième observation de la capture de héros. |
| [SS-028](../../data/Screenshots/Vue%20monde/8982.jpg) | 695×460 | Monde ancien — v0.1.10, marque Heroes V | Carte, trajets bleus, brouillard périphérique, panneau sombre ancien. | Interface très précoce ; ne pas la fusionner avec le gabarit v1.5. |
| [SS-029](../../data/Screenshots/Vue%20monde/KingdomsGameplay%20%281%29.webp) | 700×447 | Monde détaillé — classique non daté | Terrain naturel en losanges, villes, sélection, trajet bleu pointillé. | Distance, vitesse et interpolation non mesurables sur image fixe. |
| [SS-030](../../data/Screenshots/Vue%20monde/heroes-kingdoms-01_2202489.jpg) | 1440×810 | Monde et info-bulle — v1.5.0.17-4-MTR | Terrain, villes, frontières, routes et informations de cible ; décor promotionnel hors cadre. | Les informations de la cible dépendent potentiellement du renseignement. |
| [SS-031](../../data/Screenshots/Vue%20monde/heroes-kingdoms-06_2202494.jpg) | 1440×810 | Reconnaissance — v1.5.0.17-4-MTR | Héros Willi niveau 10 ; choix troupes/ville/région ; curseur de durée ; 4 h 34 min 28 s et valeur d’information 130. | Relation entre durée, score et chances de capture non retrouvée. |
| [SS-032](../../data/Screenshots/Vue%20monde/might-magic-heroes-kingdoms_2123146.jpg) | 1440×810 | Monde politique encadré — classique non daté | Carte dense colorée et royaume dans un cadre de faction. | Distinguer bordure décorative et surface réellement interactive. |
| [SS-033](../../data/Screenshots/Vue%20monde/sc13rc2.jpg) | 1005×680 | Monde détaillé — v1.5.0.51-3-MTR | Terrain isométrique, villes par faction, frontières, trajet pointillé, sélection ; barre globe/ville, chronologie et royaume fixe. | La ville Inferno en flammes n’est pas une preuve d’incendie de siège. |
| [SS-034](../../data/Screenshots/Vue%20monde/sc13rc3.jpg) | 1008×678 | Monde politique éloigné — v1.5.0.51-3-MTR | Grille dense colorée, petits glyphes de villes et curseur de navigation à une autre position. | Changement d’échelle attesté ; automatisme du filtre politique non démontré. |
| [SS-035](../../data/Screenshots/Vue%20monde/scr8k4.webp) | 700×447 | Monde détaillé — doublon | Doublon exact de SS-029. | Pas une preuve de zoom supplémentaire. |
| [SS-036](../../data/Screenshots/Vue%20r%C3%A9gion/1886171_original.webp) | 572×429 | Quête sur région — classique non daté | Fenêtre Quête 1 — Cité assiégée, récompenses d’unités, Continuer, région Nécropole derrière. | Titre narratif : ne prouve pas un siège PvP actif. |
| [SS-037](../../data/Screenshots/Vue%20r%C3%A9gion/868%20%281%29.jpg) | 1015×659 | Région Nécropole — v0.7.94 Tech Beta | Grille locale, ville centrale, mines et balises verticales ; royaume et prisonnier distant. | Bêta : valeurs de production et droits à vérifier ailleurs. |
| [SS-038](../../data/Screenshots/Vue%20r%C3%A9gion/868.jpg) | 1015×659 | Région Nécropole — doublon | Doublon exact de SS-037. | Aucun état supplémentaire. |
| [SS-039](../../data/Screenshots/Vue%20r%C3%A9gion/8984.jpg) | 695×460 | Région Académie ancienne — v0.1.10, marque Heroes V | Grille locale et ville centrale, quatre sites de mine, retour à la carte. | Interface ancienne, distincte de la référence v1.5. |
| [SS-040](../../data/Screenshots/Vue%20r%C3%A9gion/9821f221667427.563061cc17556.webp) | 1010×680 | Colonisation — v0.7.34-x200, test | Droit Richesse à 4 villes ; coût affiché 30 000 or, 50 bois, 50 minerai ; nom ; limite gratuite 3 villes, 6 avec abonnement ; attente 50 jours. | Serveur de test x200 et menu Triche : ces coûts/plafonds ne deviennent pas des constantes du profil classique. |
| [SS-041](../../data/Screenshots/Vue%20r%C3%A9gion/heroes-kingdoms-05_2202493.jpg) | 1440×810 | Estimation de pillage — v1.5.0.17-4-MTR | Cible principale mine de soufre, dégâts estimés 19 h 33 min 30 s ; cibles secondaires 3 h 54 min 42 s ; butins inconnus « ? » et cible inconnue sans butin. | Rapport 5:1 dans cet exemple ; formule universelle et butin non démontrés. |
| [SS-042](../../data/Screenshots/Vue%20r%C3%A9gion/heroes-kingdoms-07_2202495.jpg) | 1440×810 | Région aménagée et entrepôt — v1.5.0.17-4-MTR | Entrepôt : +50 % de capacité ; 1 construit, 5 maximum, effet cumulatif ; grille et aménagements. | Corrobore G16 pour cette version ; pas les règles d’arrondi ni le plafond d’or. |
| [SS-043](../../data/Screenshots/Vue%20r%C3%A9gion/maxresdefault%20%288%29.jpg) | 1280×720 | Défi solo — vidéo promotionnelle tardive | Cadre SOLO-HERAUSFORDERUNG et région ; accès aux options régionales. | Variante solo hors campagne PvP classique ; texte fin à vérifier avant transcription. |
| [SS-044](../../data/Screenshots/Vue%20r%C3%A9gion/might-magic-heroes-kingdoms_2123144.jpg) | 1440×810 | Quête sur région, cadre complet — classique non daté | Présentation complète de la quête de SS-036 dans le décor extérieur. | Même situation recadrée, pas deux validations de règle. |
| [SS-045](../../data/Screenshots/Vue%20r%C3%A9gion/sc13rbv%20%281%29.jpg) | 1011×682 | Région Sylvan — v4.1.16-MTR | Grille 5×5, ville arbre centrale, quatre mines et balises, PNJ, décor périphérique ; barre d’icônes et Region options. | Famille d’interface tardive ; pas de déduction de règles S2 depuis S4. |
| [SS-046](../../data/Screenshots/Vue%20r%C3%A9gion/sc13rbv.jpg) | 1067×720 | Région Sylvan redimensionnée — v4.1.16-MTR | Même scène que SS-045 à une autre résolution. | Proche visuellement, non identique octet par octet. |
| [SS-047](../../data/Screenshots/Vue%20r%C3%A9gion/sc13rbw.jpg) | 1011×680 | Région Académie développée — v1.5.0.51-6-MTR | Ville centrale et sites régionaux développés ; anciennes commandes de navigation. | Les bâtiments régionaux ne sont pas les bâtiments de la vue ville. |
| [SS-048](../../data/Screenshots/Vue%20r%C3%A9gion/sc13rbx.jpg) | 1007×677 | Région Nécropole développée — v1.5.0.51-3-MTR | Terra et aménagements régionaux, mines, balises ; navigation ancienne. | Ne suffit pas à reconstituer tous les prix et prérequis régionaux. |
| [SS-049](../../data/Screenshots/Vue%20ville/8981.jpg) | 695×460 | Ville Havre ancienne — v0.1.10, marque Heroes V | Château, rivière et emplacements de bâtiments dans une scène dédiée. | Pas une grille régionale agrandie. |
| [SS-050](../../data/Screenshots/Vue%20ville/HMMKingdoms_2.jpeg) | 1024×576 | Ville Académie — capture marquée 2010 | Îlots flottants, bâtiments et médaillons ; cité Forkriver niveau 18 ; message de droit à une cité par Domination. | Le niveau de ville affiché n’est pas un degré de zoom. |
| [SS-051](../../data/Screenshots/Vue%20ville/heroes-kingdoms-04_2202492.jpg) | 1440×810 | Ville Havre et bâtiment — v1.5.0.17-4-MTR | Scène du château ; info-bulle Gehöfte : +5 paysans/conscrits par jour, 20 000 or, 30 bois, 30 minerai. | Coût et bonus correspondent à l’entrée 67, Fermes, du catalogue ; durée et déroulement du chantier non prouvés par cette image. |
| [SS-052](../../data/Screenshots/Vue%20ville/maxresdefault%20%287%29.jpg) | 1280×720 | Ville Sylvan débutante — vidéo promotionnelle tardive | Petite ville arbre, Village Hall, 2 000 or/jour, options de construction. | Ne prouve pas quels modules commerciaux sont actifs sur le serveur classique. |
| [SS-053](../../data/Screenshots/Vue%20ville/might-magic-heroes-kingdoms_2123147.jpg) | 1440×810 | Marché et caravane — classique non daté | Marchand/Caravane/Hôtel des ventes (23) ; sept ressources ; charge max ; destination ; « 4 fois », quantité exacte, pas d’attente. | Listes complètes de politiques non visibles ; ne pas additionner les capacités maximales par ressource. |
| [SS-054](../../data/Screenshots/Vue%20ville/sc13rby.jpg) | 1012×683 | Ville Sylvan développée — v4.1.16-MTR | Grand arbre, plateformes, passerelles et bâtiments ; Lorelai niveau 31 ; barre d’icônes, Building options. | Scène de ville spécifique ; son niveau 31 n’est pas un niveau de zoom. |
| [SS-055](../../data/Screenshots/Vue%20ville/sc13rbz.jpg) | 1010×678 | Ville Inferno — v1.5.0.51-3-MTR | Roche volcanique, lave et bâtiments avec médaillons ; Wastelands niveau 19. | Flammes de décor de faction, pas indicateur suffisant de siège. |
| [SS-056](../../data/Screenshots/Vue%20ville/sc13rc0.jpg) | 1010×682 | Ville Nécropole — v1.5.0.51-3-MTR | Tours sombres, lumière verte et médaillons de bâtiments ; Terra niveau 31. | Décor dédié ; coordonnées de hotspots non récupérées dans Jactari. |
| [SS-057](../../data/Screenshots/Vue%20ville/sc13rc5.jpg) | 1010×681 | Taverne — v1.5.0.51-3-MTR | Deux offres Arcane Mage/Warmaster ; courbes de stats ; 46 000 or et 10 h ; renouvellement 3 200 or, 23:59 ; limite gratuite et attente 8 jours. | Prix et attente contextuels ; ne pas les généraliser à tout recrutement. |

## Ce que ce corpus ne documente pas encore

Aucun écran complet de gestion d’alliance, diplomatie, obtention d’une Larme, construction de monument, décompte des treize monuments, maintien de victoire ou résultat final n’est identifié dans ces 57 fichiers. Les spécifications de ces fonctions restent fondées sur les guides précédents. Il manque également les états complets de siège, les files de construction/recrutement, les vues détaillées de sorts, l’apprentissage des talents et les erreurs de commande.

Pour compléter la fidélité, rechercher ensuite des séquences vidéo montrant **avant → clic → formulaire → validation → résultat**, avec monde, version et horaire visibles. Les priorités restantes sont consignées dans [INCERTITUDES](INCERTITUDES.md). Les conséquences de rendu et de navigation sont détaillées dans [INTERFACE-ET-RENDU-ISOMETRIQUE](../specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md).
