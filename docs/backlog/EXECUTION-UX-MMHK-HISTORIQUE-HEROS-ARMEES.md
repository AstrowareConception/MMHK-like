# PR 42 — retour aux interfaces MMHK : héros, inventaire et garnison

## Preuve visuelle, non interprétation générique

Le client original présente une **fenêtre beige/parchemin**, un **grand portrait
illustré sur la gauche**, des onglets Résumé/Talents/Inventaire/Sorts au-dessus
du panneau droit, une **silhouette d'équipement** avec huit icônes en
emplacements, puis **deux bandes horizontales** de sac et de coffre.
Voir `data/Screenshots/Vue héros/might-magic-heroes-kingdoms_2123145.jpg`
et `data/Screenshots/Vue héros/sc13rc4.jpg`.

L'organisation des troupes
`data/Screenshots/Vue combat/sc13rc1.jpg` montre des **rangées compactes**,
une vraie illustration par peloton, la disposition claire des armées et
des commandes d'affectation. Les écrans sombres à cartes vides de la PR40
ne respectaient pas cette organisation.

## Import local des portraits et des unités

Source : `data/Jactari/src/images/Hero_{FACTION}_2.jpg` (Academy, Haven,
Inferno, Necropolis, Sylvan), croppages documentés dans
`data/analysis/sprite-manifest.json`. **95 visages 71 × 72 vérifiés**
(19 par faction), récupérés dans des planches d'origine, sans prétendre
posséder les portraits plein format du client Ubisoft.

Pour le Havre, le plateau utilise `Hero_HAVEN_2.jpg` et
`BattleUnitStack_HAVEN.jpg`. Le composant affiche les sprites **par
recadrage CSS**, sans altérer les sources. Les noms des héros du laboratoire
n'ont pas d'identité MMHK certifiée : l'attribution visuelle aux héros
de démonstration est stable, mais **illustrative**, pas historique.

Les planches du dépôt sont **copiées au démarrage historique dans
`data/assets-private-original`**, puis proposées exclusivement via
`/api/theme-assets/{id}` en localhost authentifié. Aucune nouvelle copie
de ces illustrations ne va dans `apps/web/public`, le thème redistribuable
ou les artefacts publics de capture. Le mode public utilise des substituts
sans personnages historiques.

## Règles UX

- Reprise des proportions, couleurs, tabulations et disposition de MMHK.
- Les commandes métier sont inchangées : serveur unique pour transferts,
  stocks, positions de formation et équipement.
- Les onglets non simulés ne doivent pas promettre de faux talents/sorts.
- Les neuf positions de combat Jactari ne sont pas inventées : seuls
  les sept emplacements ordinaires autorisés sont manipulables ici.
- Le joueur peut toujours accéder aux actions clavier/tactile alternatives.
- Aucun bonus historique inconnu n'est inventé ou appliqué à l'API.

## Validation avant fusion

- Tests locaux d'assets : cinq planches de 19 portraits, accès privé
  limité, aucun fichier original ajouté au dossier public.
- TypeScript/Next build strict ; tests API/PostgreSQL et Docker preview.
- Chromium complet : équipements, transferts, sept positions sauvegardées,
  et captures desktop, à confronter aux références citées.
- Pas de fusion sans revue des captures réelles.

### Portrait grand format : source et limites

Deux captures d'écran MMHK conservées dans `data/Screenshots/Vue héros`
servent d'**illustrations d'époque recadrées en CSS, dans le thème privé** :
`might-magic-heroes-kingdoms_2123145.jpg` (guerrier illustratif) et
`HMMKingdoms_4.jpg` (mage illustratif). Ce ne sont ni des fichiers officiels
individuels de personnages ni une attribution vérifiée aux héros du laboratoire.
Le vrai visage individuel (19 choix Havre) reste présent dans la liste des héros.
Les originaux sont copiés localement, **jamais dans le bundle public**.
