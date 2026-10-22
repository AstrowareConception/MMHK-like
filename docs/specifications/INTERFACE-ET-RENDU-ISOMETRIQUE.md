# Interface et rendu isométrique — spécification de reconstruction

**Objectif confirmé :** une présentation très proche de MMHK, jouable par navigateur, avec navigation et animations JavaScript. Cette spécification transforme les captures en contrats d’interface. `OBS-IMAGE` décrit ce qui est visible ; `OBS-CODE` les fonctions Jactari ; `PROP` l’architecture du futur client. Aucun moteur graphique du jeu d’origine n’a été récupéré.

Références : [analyse des captures](../research/ANALYSE-CAPTURES.md), [audit des assets](../research/AUDIT-JACTARI-ASSETS.md), [profil classique](PROFIL-PVP-CLASSIQUE.md).

## 1. Composition générale

**OBS-IMAGE.** Interface dense de bureau : aire de jeu à gauche, panneau du royaume à droite, navigation et chronologie en haut, commandes contextuelles en bas. Tons crème/brun, filets sombres, sélection orange, petits portraits et nombres serrés. Les cadres et médaillons sont ornementés ; textes, chiffres et délais restent lisibles au-dessus de l’illustration. Les grands personnages parfois placés hors du cadre sont décoratifs, pas des éléments militaires de la carte.

### Gabarit mesuré sur SS-033, 1 005×680 pixels

Mesures approximatives sur le raster, précision de quelques pixels ; elles ne proviennent pas de coordonnées DOM originales.

| Zone | Bornes approximatives `[gauche, haut, droite, bas]` | Fonction |
| --- | --- | --- |
| En-tête gauche | `[0, 0, 680, 60]` | Logo, monde/version, liens généraux |
| Chronologie | `[0, 60, 680, 94]` | Heures, cycle visuel, marqueurs d’événements |
| Scène | `[0, 94, 680, 646]` | Monde, région ou ville, sans redimensionner le panneau droit |
| Panneau royaume | `[682, 60, 1005, 646]` | Cités, ressources, garnisons, héros, missions et défilement |
| Navigation générale droite | `[682, 0, 1005, 60]` | Courrier, profil, alliance, classements |
| Pied | `[0, 646, 1005, 680]` | Quêtes/actions à gauche, conversation à droite |
| Commande d’échelle | Environ `[270, 608, 402, 647]` | Barre globe/ville de la famille ancienne |

La famille SS-045/054 utilise un autre jeu d’icônes et des volets d’options. **PROP :** retenir d’abord le gabarit v1.5 (DEC-004) et traiter la famille v4 comme variante séparée. Ne pas assembler arbitrairement les deux barres.

### Panneau du royaume

**OBS-IMAGE.** Une carte de cité comporte nom, représentation de faction, stocks et revenus de sept ressources, maxima communs/rares, sept cases de garnison, puis héros. Chaque héros possède portrait, nom, niveau, marqueurs d’état, cases de troupes et accès à ses commandes. Cités repliées, groupe « missions », sélection orange et défilement sont visibles. Certaines captures montrent un héros prisonnier distant.

**PROP :** séparer `selectedCity`, `selectedHero`, `cameraTarget` et `activeModal`. Ouvrir un héros en mission ne doit pas déplacer silencieusement la caméra ou changer la cité utilisée pour payer une commande. Conserver le contexte lors de la fermeture d’une modale. Une actualisation serveur peut modifier stocks et disponibilité sans réinitialiser la navigation.

## 2. Vues et navigation

| Vue | Informations visibles | Interactions à reconstruire | Limites de preuve |
| --- | --- | --- | --- |
| Monde détaillé | Cases en losanges, terrain, villes par faction, frontières, sélection, routes et marqueurs | Déplacer la caméra, changer d’échelle, inspecter une cible, ouvrir sa région, préparer une mission | Clic simple/double, touche et sens exact de la molette non retrouvés |
| Monde politique éloigné | Grille dense colorée, emplacements, glyphes de villes | Repérer territoire/cible et revenir au détail | Filtre automatique ou commande séparée non démontrés |
| Région | 25 cases, cité centrale, mines, PNJ et aménagements | Inspecter case, libérer/attaquer, améliorer/construire selon état ; entrer en ville | Commandes exactes selon propriété et reconnaissance à qualifier |
| Ville | Décor de faction, bâtiments, emplacements/médaillons, nom et niveau | Inspecter bâtiment, construire/améliorer, ouvrir recrutement, marché, taverne, magie | Position des hotspots et états de chantier non fournis |

La barre d’échelle est une **navigation entre représentations**, avec éventuellement plusieurs échelles internes au monde. Aucun nombre exact de niveaux de zoom n’est certifié. **PROP :** des états explicites `world_detail`, `world_political`, `region`, `city`, et un facteur de caméra séparé. L’animation de transition ne modifie pas la position du héros.

Les flèches de bord sont observées ; glisser la carte et utiliser la molette sont des commandes ergonomiques **proposées**. Prévoir également des contrôles cliquables et une navigation clavier, sans présenter ces extensions comme des gestes historiques démontrés. Revenir à la carte restaure sa caméra et sa sélection.

## 3. Projection et sélection des cases — PROP

Pour monde/région, utiliser des coordonnées logiques `(i,j)` indépendantes du rendu. Une projection isométrique 2:1 constitue une approximation de départ à calibrer sur les captures, pas un paramètre récupéré du client :

```text
sx = originX + (i - j) × tileWidth / 2
sy = originY + (i + j) × tileHeight / 2
```

Appliquer ensuite translation et échelle de caméra. Pour sélectionner une case, inverser d’abord la transformation de caméra puis la projection :

```text
u = (sx - originX) / (tileWidth / 2)
v = (sy - originY) / (tileHeight / 2)
i = (u + v) / 2
j = (v - u) / 2
```

Ces équations donnent une position continue. Définir clairement si `(i,j)` désigne le centre ou le sommet d’une case, puis sélectionner le polygone losange correspondant, avec convention stable pour les arêtes. Ne pas appliquer un `floor` arbitraire sans tester coins et frontières. Pour une région, seuls `i,j ∈ {0,1,2,3,4}` sont jouables ; la cité est en `(2,2)` dans le modèle proposé correspondant à la vue centrale.

Chaque objet porte une ancre au sol, un rectangle graphique et une zone interactive distincte. Trier les objets selon leur pied projeté, avec départage stable. Les grands arbres/tours peuvent recouvrir plusieurs cases sans agrandir leur occupation logique. La surbrillance du sol et l’info-bulle permettent d’identifier une case masquée. Les frontières territoriales sont tracées sur les arêtes des cases et les routes sur des positions logiques, pas collées à des pixels de capture.

La géométrie torique du monde, si retenue par le profil, appartient au modèle de carte : répliquer les représentations au bord ne crée pas de nouvelles cases ni deux cibles différentes. Les dimensions du monde et règles de trajet restent celles du profil documenté, pas celles du viewport.

## 4. Couches graphiques et scènes de ville — PROP

Séparer : décor lointain, sol, surbrillances/frontières, objets ancrés au sol, routes/marqueurs, étiquettes, commandes contextuelles, puis interface fixe et modales. L’ordre de dessin d’un trajet derrière ou devant un bâtiment doit préserver sa lecture. Les info-bulles restent dans les limites du viewport et ne doivent pas prendre les événements de pointeur destinés à une commande visible.

Le rendu peut utiliser une surface Canvas 2D pour la scène et du DOM/CSS pour textes, formulaires, tableaux et panneau du royaume. Le choix final d’un moteur reste ouvert ; l’architecture exige surtout une séparation des transformations et du modèle. La densité de pixels de l’écran ne change pas les coordonnées métier. `requestAnimationFrame` synchronise l’affichage ; les polices et champs ne sont pas aplatis dans une capture.

Une ville est une scène dédiée : fond par faction, objets de bâtiment/niveau, ancres et hotspots. Un emplacement « non construit » possède sa commande et sa représentation ; un bâtiment amélioré remplace ou complète la couche appropriée selon la preuve retrouvée. Les niveaux 18/19/31 visibles sont du développement urbain. Ils ne déclenchent pas une échelle de zoom par eux-mêmes.

**Contrat proposé d’asset :** `logicalId`, fichier/atlas et rectangle, dimensions natives, ancre, zone de clic, faction, état, niveau, famille visuelle et provenance. Les données de règles ne contiennent pas de chemin d’image. Les 96 images Jactari couvrent une partie de cette table ; terrain et scènes de ville doivent encore être retrouvés ou reconstruits.

## 5. Déplacements et temps : rôle du JavaScript

**OBS-IMAGE :** des routes pointillées, marqueurs, durées de mission et haltes sont visibles. Aucune vidéo du corpus ne permet de restituer une vitesse d’animation historique exacte.

**PROP :** le serveur accepte une mission et fournit `orderId`, origine, destination, trajet public, départ, arrivée prévue, haltes, état et version. Le client dessine la route et actualise le compte à rebours à partir du décalage de temps serveur. Une éventuelle icône mobile interpole une progression visuelle ; elle ne décide jamais du résultat ou de l’arrivée.

Suspendre l’onglet, ralentir le rendu ou fermer le navigateur ne suspend pas une mission. Au retour, relire l’état courant ; ne pas rejouer localement chaque frame manquée. Une halte ou une trêve figurant dans le calendrier interrompt la progression affichée selon le contrat, sans modifier le temps réel du serveur. Si le trajet est inconnu, le client ne doit pas afficher une interpolation précise comme un renseignement acquis.

Préparer un mouvement affiche cible, héros/armée, durée, haltes et coût applicables. Modifier la sélection recalcule l’estimation ; confirmer valide l’état courant côté serveur. Une cible devenue inaccessible produit un refus explicite. Un bouton répété ne crée pas deux missions.

## 6. Modales et commandes contextualisées

| Écran | Contrat d’affichage/interaction proposé à partir des captures |
| --- | --- |
| Préparation combat | Deux colonnes, sept positions, ordre des pelotons, effectifs, armes, puissances avec détail des bonus, héros, sorts et tours, rapport de reconnaissance sélectionné, durée/haltes, annuler/engager. Distinguer données confirmées et estimées. |
| Rapport | Lecture dans le courrier ; séquence tours/sorts/duels ; avantage d’arme ; pertes, déroute et résultat ; défilement sans perdre les informations de royaume. Les données cachées ne sont pas révélées par le rapport si le profil les masque. |
| Fiche héros | Portrait/XP/statistiques et quatre onglets ; trois carrières ; coûts de points et effets ; indisponibilité clairement affichée. |
| Inventaire | Huit emplacements, sac et réserve de cité distincts ; pagination ; info-bulle de niveau/effets/emplacement ; transfert soumis au serveur. Les capacités des listes ne sont pas inférées du nombre d’icônes visibles. |
| Reconnaissance | Cible troupes/ville/région ; héros ; durée sélectionnée ; score estimé et temps ; annuler/confirmer. L’échelle du curseur doit provenir des règles. |
| Colonisation | Emplacement et nom ; coûts ; droit par classement ; limite de possession et éventuel verrou de service distingués ; raison du refus. |
| Pillage | Cible principale et secondaires ; effets estimés, durée de dégâts et butin ; marquer explicitement l’information inconnue. |
| Marché/caravane | Trois onglets ; sept quantités ; charge commune à calculer ; destination ; stocks et plafonds visibles selon droits ; paramètres de répétition/quantité/attente. Les options non observées restent à définir dans le profil. |
| Taverne | Offres séparées ; portrait, archétype et courbes ; coût et durée ; droits de recrutement ; renouvellement avec son coût et son délai. |
| Alliance/Guerre des Larmes | À spécifier depuis les guides : aucun écran complet correspondant dans le corpus. Ne pas prétendre disposer d’une maquette historique de ces écrans. |

La présence de la barre latérale derrière une modale ne prouve pas qu’elle restait cliquable. **PROP :** conserver la lecture du royaume, mais bloquer les commandes concurrentes incompatibles pendant une confirmation. Escape/fermeture annulent uniquement la préparation locale, jamais une mission déjà acceptée sans commande d’annulation autorisée.

## 7. États, adaptation et recette visuelle

Chaque commande distingue disponible, survolée, sélectionnée, indisponible avec raison, en envoi, acceptée et refusée. Les délais dépendent du serveur ; l’estimation reste identifiée jusqu’à confirmation. Un actif manquant doit montrer un remplacement explicite sans supprimer l’objet logique.

**PROP :** vérifier d’abord le gabarit desktop à 1 005×680 puis un espace de jeu plus large. À largeur réduite, conserver les nombres et déplacer/replier le panneau par une commande explicite ; ne pas réduire tout l’écran en miniature illisible. Ce comportement adaptatif est un ajout du successeur, non une interface mobile historique attestée. Les couleurs d’alliance doivent être accompagnées de symboles ou textes quand la lecture le nécessite.

La comparaison de fidélité porte sur les mêmes états : vue, faction, développement, panneau replié/déplié, héros sélectionné et modale. Masquer les valeurs dynamiques lors d’une comparaison d’images pour ne pas confondre différence de ressources et défaut de mise en page. Contrôler positions relatives, densité, typographie, profondeur, taille native des sprites et lisibilité. Le présent document ne fournit pas encore les captures du client reconstruit.

Les exigences `REQ-UI-01` à `REQ-UI-12` et leurs scénarios figurent dans [FONCTIONNEL](FONCTIONNEL.md) et [RECETTE](RECETTE.md). L’acceptation graphique ne peut pas déclarer « identique » une scène dont le fond, les bâtiments et les hotspots manquent encore.
