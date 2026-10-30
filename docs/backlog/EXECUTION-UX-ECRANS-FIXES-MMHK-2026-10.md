# Reconstitution MMHK — un écran par activité, aucune page intérieure interminable

**Cause du rejet visuel de la PR #43 :** nous avions enfermé une très longue
page HTML dans une fenêtre à hauteur fixe. C'était un mauvais modèle :
l'original MMHK maintenait son environnement de jeu, et présentait des
écrans spécifiques d'inventaire, de formation, de garnison ou de taverne.

## Règle UX exécutable

- Le cadre et la navigation du royaume demeurent fixes.
- Une activité = **une seule surface de jeu**, sans défilement vertical global.
- Les onglets sélectionnent une surface exclusive ; ils ne font pas défiler
  jusqu'à une ancre plus bas dans une page.
- Les seuls contenus scrollables sont des **collections** : héros, objets,
  troupes nombreuses, propositions de recrutement.
- Les formulaires avancés, confirmations et destinataires secondaires
  sont placés dans les fenêtres `GameDialog`.
- Le jeu n'invente aucune capacité absente du moteur métier.

## Écrans livrés

**Héros :** Inventaire / Formation / Armée. Une seule vue active. La liste
des héros reste accessible dans un panneau dédié, avec défilement local
si leur nombre dépasse l'espace disponible. La sauvegarde des sept
positions et les transferts d'artefacts restent des commandes serveur.

**Inventaire :** portrait + huit emplacements, sac et réserve dans le
même plateau, redimensionné pour tenir à hauteur d'écran. La liste des
objets peut défiler localement ; le transfert à un autre héros s'effectue
dans une fenêtre.

**Formation :** sept positions et commandes de sauvegarde visibles
ensemble. Les ajustements détaillés se font en fenêtre secondaire et
ne rallongent plus l'écran de formation.

**Forces :** Garnison / Recrutement / Taverne sont des écrans exclusifs.
Les multiples soldats et offres peuvent défiler **dans leur liste** ;
les commandes et le plateau ne défilent pas.

## Contrôle et recette

- Chromium refuse tout `scrollHeight > clientHeight` du panneau héros,
  de la formation ou de l'écran entier.
- Vérifier les onglets au clavier/souris, et le maintien du mode actif
  après validation des commandes serveur.
- Captures séparées des écrans Inventaire / Formation / Armée et Garnison.
- Aucun changement de migration PostgreSQL ni d'invariant économique.
- Ce lot ne couvre pas encore tous les écrans (Marché, Carte et Ville) :
  le même contrat UX devra y être appliqué dans les prochains lots.

La fidélité de MMHK est la référence ; le critère n'est pas seulement
un style parcheminé, mais un **parcours de joueur sans lecture verticale**.
