# V7.0 — Tranche 6 : carte territoriale persistante et diplomatie versionnée

**26 octobre 2026 · Modèle expérimental, PAS une reconstruction certifiée du serveur MMHK saison 2.**

## Objet

La tranche 5 recevait des segments déjà qualifiés comme `friendly`, `allied`,
`neutral`, `hostile` ou `targetAlliance`. La tranche 6 reconstruit ces
qualifications **depuis un instantané cohérent de la base SQLite**, en suivant une
ligne géométrique sur une carte carrée torique. L'objectif est de produire des
aperçus de trajet auditables, non un nouvel arbitre de départs militaires.

## Structures serveur ajoutées

À la base SQLite existante `trusted-hero-store.mjs` :

| Table | Fonction |
| --- | --- |
| `military_alliances` | Alliance rattachée à un seul monde |
| `military_alliance_memberships` | Une alliance au maximum par joueur et par monde |
| `military_diplomatic_relations` | Relation explicite `allied`, `neutral`, `hostile` entre deux alliances du même monde |
| `military_territory_claims` | Attribution explicitement administrée d'une **case** à un joueur ou une alliance |
| `military_world_revisions` | Révision croissante de la topologie territoriale, des villes et des relations |

Des clés étrangères SQLite relient ces données aux mondes, joueurs et alliances.
Les commandes d'administration s'exécutent sous transaction `BEGIN IMMEDIATE`
et mettent à jour la révision. Les cas de ville/attribution superposées sont
rejetés ; **la case d'une ville reste propriété de son joueur enregistré**.

Les lectures `getWorldTerritorySnapshot` sont effectuées sous transaction de
lecture et renvoient les revendications, positions de villes, appartenances
et relations d'un **même instantané SQLite**. La révision part de 1 pour un
nouveau monde ; un ancien monde peut commencer à 0 faute d'édition territoriale.
Cette API donne accès à des données militaires sensibles et doit rester
strictement interne au serveur (jamais en endpoint public).

## Géométrie

`world-territory-trace.mjs` utilise la géométrie euclidienne torique déjà
comparée à MMHK-Plus (2013), puis découpe une ligne de centre de case à centre
de case aux frontières de cellules. Chaque portion reçoit une distance réelle
partielle et une qualification de contrôle territorial.

**Cette segmentation géométrique n'est pas une preuve que le serveur Ubisoft
faisait traverser l'armée sur cette ligne**, ni qu'une ville contrôlait
automatiquement un carré ou une couronne de cases. Le modèle est volontairement
clairsemé : une ville possède sa propre case, une case explicitement attribuée
appartient à son propriétaire, le reste est non revendiqué. Les rayons
d'influence, frontières historiques, forteresses et propriétaires de reliques
restent à identifier.

Les chemins passent correctement du bord droit au bord gauche, conservent leur
distance totale sur les diagonales et évitent d'ajouter une case « touchée
seulement par un coin » à distance nulle. Les grandes traversées sont bornées.

## Diplomatie et règles d'inconnu

La qualification de la case est définie à partir du propriétaire de la case,
de son alliance au moment de l'instantané, de l'alliance du héros attaquant
et des relations **explicitement enregistrées** :
- joueur possédant la case : `friendly` ;
- son alliance ou une alliance ayant un traité `allied` : `allied` ;
- propriétaire sans relation mais *case non revendiquée* : `neutral` ;
- alliance adverse explicitement en guerre : `hostile` ;
- cible de Graal explicitement désignée côté serveur : `targetAlliance` ;
- relation `neutral` explicitement définie entre deux alliances :
  `neutral` (catégorie expérimentale seulement).

Si une case est possédée par une autre alliance sans relation connue, ou par
un joueur indépendant dont la relation ne peut être qualifiée, le planificateur
**échoue explicitement**. La simple absence d'enregistrement n'est donc
pas traitée comme une permission militaire.

Pour l'essai des Graals, `server-territory-preview.mjs` contrôle en outre
que l'alliance de cible passée au laboratoire correspond à l'appartenance
stockée du héros défenseur. Les véritables Graals devront ultérieurement
être des entités géographiques autonomes : ce banc d'essai n'en simule
aucune capture.

## Frontière entre prévisualisation et commande militaire

`previewCandidateTerritorialMission` :
1. lit les héros et les villes depuis le serveur ;
2. relit un instantané territorial complet ;
3. découpe les cases traversées et qualifie leurs relations ;
4. transmet les **distances partielles** au simulateur de haltes et trêves
   de la tranche 5 ;
5. retourne l'heure expérimentale, les étapes, la révision du monde et
   des empreintes SHA-256 permettant de comparer les instantanés.

La fonction `assertCandidateTerritoryPreviewFresh` refuse une prévisualisation
si la révision du monde, son empreinte ou les positions des héros ont changé.
**Même lorsque cette fonction retourne `true`, elle ne délivre aucune
autorisation de bataille.** Aucun résultat ne contient `trustedSchedule`,
aucun horaire n'est persisté comme vérité serveur, aucune mission existante
n'est modifiée. Le verrou `productionBattleArbiterAllowed=false` subsiste.

Les modifications diplomatiques pendant une marche ne changent pas
silencieusement les règles du trajet existant : le choix futur entre
**route figée à l'expédition** et **revalidation à chaque étape** nécessitera
une politique historique et serveur explicite.

## Limites et tests

Tests :
```bash
node --test tools/jactari-port/world-territory-trace.test.mjs \
 tools/jactari-port/server-territory-preview.test.mjs
node --test tools/jactari-port/*.test.mjs
```

Les scénarios incluent : franchissement des frontières du monde, diagonales,
demi-carte, retournement, persistance/relecture multi-connexions SQLite,
révisions et invalidation, Graal cible, absence de relation diplomatique,
doublons de revendications, rejets de coordonnées et refus d'horaires clients.

**Ne pas interpréter ces tests comme une conformité MMHK saison 2.**
Le prochain travail portera sur les changements diplomatiques en cours
de trajet, la conservation du plan aller/retour et l'ordonnancement
transactionnel des événements temporels, après vérification des sources
historiques pertinentes.
