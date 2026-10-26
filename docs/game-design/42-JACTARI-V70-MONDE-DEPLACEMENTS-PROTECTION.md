# MMHK-like — V7.0, tranche 3 : positions du monde, distances historiques et autorisations d'engagement

**26 octobre 2026 · C17 en implémentation partielle ; V7.0 en cours · La conformité au serveur Ubisoft MMHK saison 2 n'est pas certifiée.**

## 1. Problème traité

La tranche 2 permettait d'enregistrer une mission `traveling → arrived → returning → completed`, de réserver un héros et d'appliquer les pertes après une arrivée. Il manquait une vérité serveur pour répondre à des questions essentielles : **de quel monde et de quelle ville vient l'attaquant ? Où se trouve le défenseur ? Une cible a-t-elle changé de place ? S'agit-il de la première ville encore protégée d'un nouveau joueur ?**

La tranche 3 ajoute une couche géographique persistée et des contrôles de cohérence **dans les transactions SQLite existantes**. Elle ne simule pas un trajet segmenté, les haltes territoriales, la trêve nocturne ou la circulation réelle des armées : les heures d'arrivée et de retour restent fournies par un planificateur autorisé que la V7.0 doit encore développer à partir de sources S2.

## 2. Référence historique : deux fichiers de 2013, conservés et attestés

L'historique d'[Aendawyn/MMHK-Plus](https://github.com/Aendawyn/MMHK-Plus/tree/e8d862d82741986759b88012421aed8e8175e26e) fournit deux fichiers source distincts :

| Source archivée dans ce dépôt | Blob Git original | Observation |
| --- | --- | --- |
| [`mmhkplus-utilities-2013.js`](../../data/Jactari/upstream-addon/mmhkplus-utilities-2013.js) | `90d808618ba819df155197752d14508a2a76cc88` | `MMHKPLUS.distance(x1,y1,x2,y2)` : distance euclidienne sur carte carrée raccordée |
| [`mmhkplus-distances-2013.js`](../../data/Jactari/upstream-addon/mmhkplus-distances-2013.js) | `fd0ec7c7acfdf0999edb29552be4eeab606d7d21` | UI d'estimation : distance / 12 pour héros seul ; / 4 pour armée ; / 9,375 pour caravane, exprimées en heures |

Les tests recalculent l'empreinte **SHA-1 Git des fichiers tels que conservés**, puis exécutent la vraie fonction originale `MMHKPLUS.distance` dans un environnement isolé pour la confronter à notre calcul.

### Géométrie source-adossée

Pour une carte carrée de largeur `S`, et des coordonnées `x,y` comprises entre **1 et S** :

```text
dx = |x₂-x₁| ; si dx > S/2 : dx = S-dx
dy = |y₂-y₁| ; si dy > S/2 : dy = S-dy

distance = √(dx²+dy²)
```

Une ville en `(1, 50)` et une autre en `(100, 50)`, pour `S=100`, sont donc séparées d'une unité de distance, **pas 99**. Le module [`world-distance.mjs`](../../tools/jactari-port/world-distance.mjs) valide les coordonnées, calcule cette distance et retourne une estimation de l'UI communautaire avec la mention explicite `authoritativeArrivalTime:false`.

**Attention :** les divisions par 12, 4 et 9,375 sont des **estimations affichées par l'outil communautaire**, pas une garantie d'heure d'arrivée Ubisoft. Le [guide géographique déjà documenté](05-CARTE-PVP-SIEGES.md) mentionne notamment haltes et trêves nocturnes ; ni leurs coefficients ni leurs règles selon monde/saison ne sont entièrement établis pour une exécution automatique.

## 3. Nouvelles données persistées côté serveur

Le fichier [`trusted-hero-store.mjs`](../../tools/jactari-port/trusted-hero-store.mjs) intègre quatre structures SQLite supplémentaires :

```text
military_worlds
  world_id      PRIMARY KEY
  world_size    carré entier supérieur à 1

military_cities
  city_id             PRIMARY KEY
  world_id            FOREIGN KEY
  owner_player_id     FOREIGN KEY
  x, y                coordonnées entières vérifiées
  is_first_city       booléen
  protected_until_ms  entier fiable, requis pour la première ville

hero_city_postings
  hero_id      PRIMARY KEY
  city_id      FOREIGN KEY

military_mission_routes
  mission_id   PRIMARY KEY, FOREIGN KEY
  route_json   origine, destination, monde, taille, distance
```

Deux villes ne peuvent pas occuper la même case d'un monde ; un joueur ne peut pas enregistrer deux « premières villes » dans le même monde. **Un héros ne peut être stationné que dans une ville appartenant à son propriétaire**, et les changements de garnison d'un héros déjà réservé dans une mission active sont refusés.

Les opérations d'administration `defineMilitaryWorld`, `registerMilitaryCity` et `stationHeroInCity` sont **strictement côté serveur**, pas des endpoints accessibles au navigateur. Les lecteurs `getHeroWorldPosition` et `getMissionRoute` sont réservés à cette même couche : exposer directement la position d'un héros adverse contournerait les règles d'espionnage et de visibilité.

### Lien avec la mission

Quand les deux héros possèdent un emplacement géographique enregistré, `dispatchMission` vérifie dans **une même transaction** que les villes sont distinctes, dans le même monde, que le défenseur n'est pas en mission et que sa première ville n'est pas protégée. Le serveur persiste ensuite une **photographie immuable de la route**, comprenant les deux positions, les villes, le monde et la distance source-adossée.

À l'arrivée **et avant la résolution**, les positions sont relues : une cible qui a quitté sa ville ou changé de monde invalide la mission, sans produire de combat imaginaire. Le `serverNowMs` transmis par l'interface serveur est obligatoire lorsque les héros sont géolocalisés, et doit respecter l'heure d'arrivée enregistrée.

Les anciennes simulations de laboratoire sans monde persistent pour ne pas casser les corpus Jactari historiques ; en revanche, **un combat direct hors mission devient interdit lorsque les héros appartiennent au monde géographique persisté**.

## 4. Protection débutant — règle de projet explicitement provisoire

Une règle évoquée pour MMHK saison 2 est la protection de la **première ville** pendant **sept jours**. Nous ne disposons pas encore d'une configuration indépendante de serveur Ubisoft précisant son horodatage de départ, ses exceptions et sa portée exacte. Il est donc interdit de la déclarer certifiée.

La fonction [`candidateFirstCityProtectionExpiry()`](../../tools/jactari-port/world-engagement-policy.mjs) calcule, **dans une politique expérimentale du projet**, l'expiration après sept jours calendaires de 24 heures à partir d'une fondation de ville fournie par le serveur. Elle marque le résultat `historicalCertification:false`.

Le stockage n'utilise pas cette valeur comme une constante Ubisoft : il exige que **`protectedUntilMs` soit renseigné explicitement par le serveur** pour toute première ville. Tant que `serverNowMs < protectedUntilMs`, une attaque contre cette ville est refusée, **même si le contrôleur applicatif de cible retourne `true`**. À l'instant d'expiration, la restriction locale est levée, sous réserve des autres contrôles d'engagement.

Le système ne déduit **aucun** droit d'attaque des identifiants envoyés par le navigateur. Diplomatie, alliés, trêves, répartition des villes, protections concurrentes, inactivité et visibilité doivent également être validés par la future politique serveur.

## 5. Essais et preuves

Le banc [`world-distance.test.mjs`](../../tools/jactari-port/world-distance.test.mjs) exerce notamment **500 cas déterministes comparés au code original** `MMHKPLUS.distance`, les traversées de frontières de carte, les diagonales, les coordonnées hors limites, les ratios d'UI et l'intégrité des deux sources originales.

Le banc [`server-world-engagement.test.mjs`](../../tools/jactari-port/server-world-engagement.test.mjs) couvre :

- route d'une ville `(1,1)` vers `(100,100)` enregistrée avec `√2` comme distance ;
- refus d'une attaque contre la première ville tant que sa date d'expiration fournie par le serveur n'est pas atteinte, même avec une autorisation de cible permissive ;
- autorisation à la limite exacte d'expiration et refus sans modification d'armée avant celle-ci ;
- cible se déplaçant après le départ ou après l'arrivée, avec refus de l'engagement et absence d'écritures militaires ;
- villes hors carte, cases dupliquées, ville appartenant à un autre joueur, mondes différents, et changement d'emplacement d'un héros en mission ;
- interdiction d'un combat direct contre un héros du monde géographique sans mission enregistrée ;
- conservation des villes, positions, routes et reçus de combat **après réouverture de SQLite et depuis une deuxième connexion** ;
- contrôle de la date d'arrivée pour éviter de résoudre un combat avant la fin du trajet planifié.

Les [tests dédiés à la politique provisoire](../../tools/jactari-port/world-engagement-policy.test.mjs) imposent le marquage non certifié et vérifient les bornes de calcul des sept jours.

Ces scénarios complètent les tests de missions, les pertes transactionnelles et les différentiels Jactari antérieurs. Le nombre total et la CI probante figurent dans le [registre de conformité](../../data/analysis/jactari-combat-conformance-roadmap.json) après exécution du dernier commit.

## 6. Périmètre non livré et prochaine tranche

Les coordonnées et la distance permettent d'identifier **d'où vient une armée et où elle doit arriver**, mais il reste à reconstruire un véritable **moteur de trajet** :

- segments de mouvement selon terrain, contrôle territorial, factions, haltes et trêves ;
- calcul de l'ETA par le serveur à partir des unités, héros et conditions réelles, sans utiliser l'estimation communautaire comme vérité ;
- sous-détachements et garnisons séparées, missions de reconnaissance, pillage, siège et interceptions en terrain ouvert ;
- profils historiques de protection débutant certifiés indépendamment, diplomatie, trêves et autorisation de cible ;
- retours de mission, expériences, pertes, captures, blessures et retour d'unités à leur garnison effective ;
- serveur HTTP, sessions réellement authentifiées, ordonnancement distribué et tests de charge.

**V7.0 reste `in_progress`, C17 `implemented_partial`, C18 `blocked_source`. Le verrou `productionBattleArbiterAllowed=false` ne change pas.** Les garanties de persistance et de refus des commandes invalides ne valent pas certification MMHK saison 2.
