# MMHK-like — Navigation monde → région → ville

**28 octobre 2026 · première navigation multiscale du prototype FastAPI/Next.js**

## Origine des contraintes et périmètre réel

Le [document de conception des vues](INTERFACE-ET-RENDU-ISOMETRIQUE.md)
mentionne trois échelles : la carte du **monde**, la **région** (25 cases)
et la **ville**, ainsi qu'une projection isométrique 2:1 à affiner. La
ville est au centre de la région dans le modèle proposé, en (2,2).
Les décisions P0 retiennent un **monde torique** et une première région
du Havre dotée des types de mines or, bois, minerai et cristal.

Ces sources ne fournissent **pas** la répartition des mines sur les
25 emplacements, la cartographie des terrains, la position des PNJ,
les zones explorées, les zones d'influence ou la visibilité des
adversaires. Aucun de ces éléments n'est inventé ici.

### Distinction essentielle entre deux coordonnées

- Coordonnées de **monde** : `x,y ∈ [1,world_size]`, identifiant
  des régions. La fonction `torus_coordinate` fait un modulo
  **un-indexé** aux bords du monde.
- Coordonnées **locales de région** : `i,j ∈ {0,1,2,3,4}`,
  avec une cité centrale au `(2,2)`. Ce n'est **pas**
  la même échelle ; aucun décalage local ne déclenche
  automatiquement un déplacement militaire ou une reconnaissance.

## API REST : accès par compte exclusivement

`GET /api/v1/me/worlds/{world_id}/overview`

Renvoie le nom et la taille d'un monde auquel le compte appartient,
la topologie `torus`, et **uniquement les villes possédées par
ce compte**. La politique de visibilité courante est signalée par
`known_scope=owned_cities_only`,
`enemy_positions_exposed=false` et
`world_terrain_loaded=false`.

`GET /api/v1/me/cities/{city_id}/region`

Renvoie le propriétaire de la cité vérifié dans la jointure SQL,
une grille de **25 cases** dont seule la case centrale est identifiée
comme la cité, les autres cases marquées `unmapped`,
les **types** de mines enregistrés mais explicitement **non localisés**,
et une grille 3×3 de régions voisines du monde avec les coordonnées
toriques réellement calculées. Les neuf régions voisines sont
des **coordonnées**, pas une découverte du contenu d'autrui.

Les identifiants de cités étrangères, leurs coordonnées ou leurs
stocks ne sont jamais accessibles par ces endpoints avant l'intégration
d'un moteur de reconnaissance et de visibilité réellement autoritatif.
Les villes ne sont pas rendues publiques sous prétexte d'appartenir
au même monde.

## Interface Next.js

- Vue du monde : atlas SVG original fondé sur les coordonnées des
  villes possédées, marqueurs cliquables, liste de villes et accès
  aux vues région ou ville.
- Vue région : 25 losanges projetés en isométrie, cité centrale
  cliquable, types de mines séparés et voisins toriques du monde.
  Les cases `?` signalent **l'absence de géométrie validée**,
  non un statut historique de brouillard de guerre.
- Vue ville : gabarit CSS original et localisation des bâtiments
  documentés ; liens vers la région et la carte du monde.
- Accès direct aux URLs protégées : redirection à la connexion,
  `404` sur les comptes/cités non autorisés, jamais une découverte
  de l'existence d'un propriétaire adverse.
- SVG interactifs accompagnés de liens HTML, navigation clavier,
  textes alternatifs, interface responsive.

**Aucun sprite Ubisoft n'est intégré** à ces deux nouvelles cartes.
La récupération des archives est une preuve de recherche,
pas une licence d'exploitation des graphismes.

## Tests et limites

Le banc PostgreSQL vérifie :
1. modulo de bord torique en coordonnées 1…N ;
2. exactement 25 cellules locales dont l'unique centrale possède
   une référence à la cité ;
3. absence d'emplacement inventé pour les quatre types de mines ;
4. dimensions et voisinage torique au coin `(1,100)` ;
5. **deux joueurs membres du même monde**, chacun avec sa cité :
   la liste du premier ne divulgue pas le nom ni la position du second ;
6. refus de lecture d'une cité étrangère ou inexistante ;
7. accès refusé sans session et absence d'endpoints militaires.

Les scènes n'implémentent **pas** le zoom historique réel, le
déplacement de caméra, les routes, les frontières, la sélection
de cibles adverses, les mines géolocalisées, la reconnaissance
ni les échanges de cartes. Aucun combat Jactari n'est déclenché.

### Prochaines tranches proposées

- Historiser ou reconstituer le modèle des 25 cases et leurs assets
  avec une provenance tracée avant de placer les mines et PNJ.
- Définir une **politique de visibilité serveur** et des tests
  d'autorisation adaptés à la reconnaissance/alliance.
- Développer l'interface de sélection de bâtiments et la navigation
  ville/région/monde avec état de caméra et raccourcis.
- Renforcer l'authentification (anti-bruteforce, observabilité,
  sessions) et installer un environnement de démonstration privé.

**`productionBattleArbiterAllowed=false` reste inchangé.**
