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

## Postmortem de la revue visuelle Chromium

Les captures utilisateur 1220 × 900 révélaient deux défauts que la CI
fonctionnelle ne détectait pas :

- Une ancienne classe `mmhk-heritage-heroes` imposait encore une grille
  restrictive ; le jeu n'utilisait que la moitié de son panneau, malgré
  le respect apparent des dimensions du viewport.
- Une règle historique `.formation-slot` conservait **quatre colonnes
  administratives** dont la première avait 55 px. Les sept cartes tactiques
  étaient donc compressées dans des cases minuscules et leurs boutons
  pouvaient empiéter sur les cases voisines.

La PR rétablit la largeur du plateau, isole les cartes de formation
dans des cellules flexibles et retire les mentions techniques de chaque
position. L'import de captures de l'ancienne interface MMHK comme
« grand portrait » a également été désactivé : seul un vrai sprite
de personnage est désormais utilisé, ou son substitut public-safe.

### Nouveau contrat qualité non négociable

1. **Chromium en lecture seule d'abord**, avant de recruter ou de déplacer
   un objet : captures des six écrans aux résolutions 1220 × 900 et
   1440 × 950. Les images doivent être publiées en artefact immédiatement.
2. Analyse géométrique : utilisation horizontale >= 97 % du cadre,
   panneau principal >= 70 %, aucun chevauchement ni artefact hors case.
3. Les sept cartes de formation doivent occuper réellement la largeur
   disponible (largeur minimale 85 px à 1220 × 900), et non simplement
   ne pas déborder.
4. Revue **humaine** des captures avant fusion : pas de grande région vide
   sans action guidée, contrastes suffisants, libellés lisibles, portraits
   authentiques en mode privé.
5. Ensuite seulement : **vrai parcours Chromium avec soldats recrutés**.
   Les commandes de division/fusion doivent rester dans leur propre cellule,
   aucun chevauchement entre positions, puis enregistrement PostgreSQL.
6. Tout écran momentanément vide doit proposer une **action de progression
   réelle** : recrutement de garnison, affectation d'armée ou construction
   de taverne, sans inventer de règles métier.

Captures réellement inspectées :
- [Premier audit six écrans (run #41062806003)](https://github.com/AstrowareConception/MMHK-like/actions/runs/41062806003)
- [Audit après actions contextuelles (run #41063756541)](https://github.com/AstrowareConception/MMHK-like/actions/runs/41063756541)
- [Audit des cartes tactiques corrigées (run #41065493026)](https://github.com/AstrowareConception/MMHK-like/actions/runs/41065493026)

La PR ne sera pas fusionnée sur le seul statut « 4 jobs verts » si la
revue visuelle effective n'est pas satisfaisante.

### Recette complémentaire et limite identifiée — 30 octobre

- Les 12 écrans Chromium en lecture seule sont couverts à **1220×900** et
  **1440×950** ; les six activités sont vérifiées aux deux résolutions.
- Le glisser-déposer natif de **sac vers équipement** réussit et persiste via
  une commande serveur réelle.
- Une seconde opération native **équipement vers sac** reste **non certifiée** :
  Chromium/Playwright 1.56 se bloque aussi bien avec `locator.drag_to` qu'avec
  `page.mouse.move`. Les délais internes ne terminent pas la commande ;
  seul `timeout` externe termine le processus.
- Pour ne pas masquer les autres régressions, la recette bloque sur le
  glisser-déposer aller et vérifie le retour par sélection clavier et
  activation clavier du sac (une autre interaction réelle proposée au joueur).
  Cette validation ne vaut PAS recette du glisser-déposer inverse.
- Les images historiques privées doivent rester visibles quand elles sont
  disponibles : aucune règle de couleur de fond globale ne doit neutraliser
  leur `backgroundImage` fourni dans la vue.
- Cette limite doit être levée avant d'affirmer que la souris fonctionne
  impeccablement dans les deux sens ; `main` demeure intacte.



### Revue d'un plateau réellement occupé — dernière CI complète verte

La [recette #41078640941](https://github.com/AstrowareConception/MMHK-like/actions/runs/41078640941)
a terminé ses quatre jobs avec succès ; elle contient un écran de formation avec
deux miliciens réellement transférés et enregistrés (pas « 18 soldats »
effectivement possédés).

L'inspection de `PLAYER-populated-formation-1220x900.png` a toutefois révélé
deux défauts qu'un simple test de largeur ne voyait pas : intitulés de flanc
partiellement masqués et outils Diviser/Fusionner trop proches de la barre
d'enregistrement. Un nouveau test mesure donc les limites verticales du
terrain, le dégagement des libellés et une séparation minimale de 5 pixels
avant la zone de sauvegarde. La capture est désormais réellement effectuée
à 1220×900, et non à 1366×900 sous un nom trompeur.
