# Héros, armées, magie et équipement

## Factions et lignées — OBS-CODE

Le corpus contient cinq factions du socle jouable étudié, chacune avec sept tiers et une amélioration par tier. Les catégories Forteresse, Donjon et neutres sont conservées comme contenu distinct, sans en déduire une sélection jouable. [CODE-01-DATA ; SRC-11, SRC-12]

| Faction | Écoles déclarées | Repères de lignée T1 → T7 |
| --- | --- | --- |
| Académie | Invocation, Lumière | Gremlin → Géant/Titan |
| Havre | Ténèbres, Lumière | Paysan → Ange/Archange |
| Inferno | Ténèbres, Destruction | Diablotin → Diable/Archidiable |
| Nécropole | Invocation, Ténèbres | Squelette → Dragon squelette/spectral |
| Sylvan | Invocation, Destruction | Nymphe → Dragon vert/d’émeraude |

L’[inventaire exhaustif du corpus](CATALOGUE-UNITES.md) fournit noms, armes, puissance, production, coûts et XP. La production nominale par tier ordinaire est 15, 10, 7, 5, 3, 2 et 1 avant bonus. Ce n’est pas une garantie de recrutement gratuit : la production de recrues, leur achat et leur affectation à une armée sont des étapes distinctes.

Les améliorations ne sont pas un multiplicateur uniforme. Exemple : le squelette est une infanterie de puissance 87, l’archer squelette un tireur de puissance 70. Le changement d’arme et les contre-unités peuvent rendre l’amélioration intéressante malgré cette baisse. À l’inverse, les tiers supérieurs augmentent souvent fortement leur puissance. Aucun algorithme générique « unité améliorée = +20 % » ne doit remplacer les tables.

## Héros : agents du royaume

Le héros est à la fois un commandant et un exécutant d’actions de développement. Le modèle doit distinguer son propriétaire, sa faction, sa position, son activité, son expérience, son archétype, ses talents, son équipement et ses sorts. Son indisponibilité est une ressource stratégique : un héros en mission ne peut pas être compté simultanément comme exécutant d’une autre action. Les effets passifs à distance doivent être prouvés, pas supposés. [Synthèse fonctionnelle ; CODE-01-DATA, SRC-13]

### Caractéristiques et niveaux — OBS-CODE

Les quinze archétypes définissent trois courbes : attaque, défense et magie. Il existe neuf profils de progression, dont absence de progression, progressions classiques, académiques et fanatiques. La table va du niveau 1 au niveau 40 ; le seuil d’XP du niveau 40 est 3 003 584. Le niveau ne permet pas de distribuer librement des points de caractéristiques dans ce modèle de données.

**Piège d’import :** `attaque: 6` dans un archétype signifie courbe numéro 6, pas six points d’attaque. La valeur réelle s’obtient dans la table de niveau. Les talents et artéfacts modifient ensuite ces valeurs selon leurs règles.

### Carrières — OBS-CODE

| Carrière | Rôle mécanique déclaré |
| --- | --- |
| Architecte | Construction, fortification, siège et catapultes |
| Barbare | Pillage, détection/capture des éclaireurs, pertes ennemies |
| Bâtisseur | Revenus et ateliers de production |
| Chevalier | Défense des unités et forts |
| Clerc | Magie de Lumière |
| Combattant | Attaque et armes magiques |
| Invocateur | Magie d’Invocation |
| Magicien de la destruction | Magie de Destruction |
| Magicien des ténèbres | Magie des Ténèbres |
| Marchand | Commerce et caravanes |
| Meneur | Recrutement, production, accès au rang 7 |
| Rôdeur | Espionnage et reconnaissance |
| Tenancier | Actions de taverne et entretien |

Les 74 talents et leurs valeurs figurent dans le catalogue. Huit groupes tardifs de talents légendaires apparaissent après les treize carrières, sans nomenclature de carrière complète : ne pas les activer dans un profil ancien. La révision 0.2 précise le nombre de carrières et le budget de points grâce au configurateur de héros ; les niveaux d’ouverture et le calendrier serveur restent à qualifier, voir ci-dessous.

### Règles complémentaires — DOC

G07 décrit une somme des niveaux d’artéfacts portée par un héros limitée à son niveau, un apprentissage de talent de trois heures, et une réorientation de deux jours avec perte permanente de deux points. Il indique que certains bonus régionaux ne se cumulent pas entre héros, seul le meilleur s’appliquant. Ces valeurs peuvent avoir été modifiées par les services ultérieurs. Les courbes de progression automatiques sont compatibles avec les tables récupérées. [G07]

## Armées et pelotons — OBS-CODE

Une armée engagée est une suite ordonnée de pelotons, chacun d’un type unique et d’un effectif entier. Le calculateur réserve sept emplacements ordinaires et des positions supplémentaires pour les effets invoqués. Cela ne signifie pas qu’une ville ne peut stocker que sept types au total. Les règles de sélection d’une défense multi-héros et de tri doivent être validées avec des rapports historiques.

La force de base d’un peloton vaut `effectif × puissance individuelle`. La puissance brute d’une armée est la somme des pelotons ordinaires. Les bonus de héros, de contre-arme, de fortification ou de magie ne doivent pas être inclus arbitrairement dans un seuil utilisant la puissance brute.

Séparer les actions : recruter, améliorer, affecter, diviser, fusionner, ordonner, envoyer et rapatrier. Les coûts de chaque type figurent dans les données. La durée de transformation d’une unité, les stocks de recrues partageables entre bâtiment de base et amélioré, et les règles de recrutement avec un héros absent sont des questions encore ouvertes.

## Magie — OBS-CODE et DOC

Le catalogue comporte quatre écoles, neuf sorts par école et cinq cercles. Les cinq classes d’effet sont dégâts, invocation, résurrection, altération et amélioration. Chaque sort précise cible, mode de calcul, coefficient et facteurs selon l’arme ; le détail est dans [le catalogue](CATALOGUE-SORTS-TALENTS.md).

Dans le simulateur, les sorts sont programmés sur des tours de rencontre, pas déclenchés en direct par le joueur. Le héros apporte une puissance magique, des bonus d’école et d’équipement ; la résistance et l’antimagie du camp adverse interviennent selon le type d’effet. L’invocation crée de la puissance temporaire, qui ne doit pas devenir un stock durable d’unités recrutées.

G14 décrit un sort de base par combat et un second accessible via talent, avec cercles autorisés 1/3/5 selon son rang, ainsi qu’un délai de réutilisation de douze heures pour un même sort. La même page distingue des coefficients modifiés en saison 3. Il faut donc versionner le délai, les conditions d’apprentissage et les tables ; l’absence d’un attribut « connaissance » dans le catalogue ne permet pas d’inventer une réserve de mana traditionnelle. [G14]

## Artéfacts, ensembles et hérédité — OBS-CODE

Huit emplacements : tête, collier, anneau, main gauche, buste, main droite, pieds et cape. Les 563 entrées d’artéfacts renvoient à 270 effets ; douze ensembles sont tabulés. Les catégories distinguent butin, récompense, hérédité, Larme et événement. Le niveau d’objet, son emplacement, sa faction éventuelle et ses effets sont des contraintes distinctes.

Les effets touchent des statistiques de héros, l’armée, la magie, l’économie ou les durées ; ils ne doivent pas être tous réduits à un unique bonus de puissance. La disponibilité par saison, les probabilités de butin, les règles de liaison/déliaison, les transferts entre cités et les conditions exactes d’activation des ensembles restent à compléter.

Quinze compétences héréditaires sont récupérées, notamment moral élevé, résistance magique, résurrection, tir de barrage, recrutement quotidien, richesse personnelle et mysticisme. Les valeurs sont dans `bonus.json`. Leur achat à la création d’un nouveau monde et leurs interactions avec le classement des voies appartiennent au module d’hérédité ; elles ne sont pas des talents ordinaires gagnés au fil d’un combat.

## Compléments de l’import Jactari et des captures — révision 0.2

### Carrières et points — OBS-CODE, corroboration visuelle partielle

`heros.min.js`, fonctions `controle_validite_carrieres`, `active_carriere`, `change_carriere`, `maj_comp` et `change_talent`, expose **trois emplacements de carrière**. Ouvrir une carrière consomme **un point**, deux emplacements ne peuvent pas choisir la même carrière. Une carrière magique exige un archétype différent de `guerrier` et une école autorisée par la faction. Les captures SS-019/020/025 montrent effectivement trois carrières sur un héros. [CODE-02-HEROS ; IMG-01]

Le budget du configurateur vaut :

```text
points = niveau + bonus_tenancier − 2 × réorientations
       + bonus éventuel Héros talentueux
       + bonus éventuel Révélation de talents
```

Pour chaque compétence héréditaire, le bonus est arrondi par `Math.round(valeurDuRang × (1 + 0,10 × rangDeVoieAssocié))`. Révélation de talents ne contribue qu’à partir du niveau 15 et multiplie ce résultat par `floor(niveau/15)`. Ce sont des branches du configurateur tardif : les compétences disponibles doivent être filtrées par profil.

La table `_apprentissage = [0,1,3,6]` donne le coût **cumulé** des rangs 0–3, donc des coûts supplémentaires de **1, 2 puis 3 points**. Exemple sans bonus ni réorientation : niveau 18, trois carrières ouvertes → budget total 18, dont 3 déjà dépensés, donc 15 pour les talents. Ne pas confondre rang 3 et coût total de trois points.

**Scribe et Maître des arcanes sont partagés entre carrières magiques** dans le configurateur : leur progression est synchronisée et le coût n’est pas payé une seconde fois pour un rang déjà acquis. Les branches de désactivation ajustent aussi le remboursement selon l’autre carrière. Un futur moteur doit traiter ce partage explicitement. La possibilité de modifier librement un formulaire Jactari ne prouve pas qu’une réorientation réelle soit immédiate ou gratuite.

### Taverne, équipement et préparation — OBS-IMAGE

SS-057 présente deux offres de héros, leurs courbes d’attaque/défense/magie, coût et délai de recrutement, puis coût et temporisation du renouvellement. Elle sépare blocage de compte gratuit et délai de recrutement. Prix 46 000 or/10 h et renouvellement 3 200 or sont des **observations contextuelles**, non une courbe de prix.

SS-023 distingue huit emplacements d’équipement, **sac à dos** du héros et objets **dans la cité**, avec pagination et info-bulles d’effets. Le nombre d’icônes visibles n’est pas la capacité maximale d’inventaire. SS-016/018 montrent sept positions militaires et deux emplacements de programmation de sorts ; cela ne supprime pas les conditions de talent donnant accès au second sort.

Les images d’unités, héros, carrières, talents et objets sont reliées aux données dans le [manifeste des sprites](../../data/analysis/sprite-manifest.json). Les ressources des grandes fiches de héros ne sont pas toutes présentes : les bandes de petits portraits ne remplacent pas les illustrations en pied.
