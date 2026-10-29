# MMHK-like — convergence UX/UI vers une véritable interface de jeu

**Décision du 29/10/2026 :** priorité explicite à la fidélité **d'expérience**
(illustrations, plateaux de jeu, manipulation directe) après les lots de fondation
fonctionnelle. Les pages d'administration techniques doivent disparaître de
l'expérience joueur ; les formes de saisie résiduelles appartiennent aux
panneaux secondaires (nombre précis de troupes, paramètres avancés).

## Source visuelle

Références : captures originales de \`data/Screenshots/Vue héros/\`,
\`data/Screenshots/Vue ville/\`, \`data/Jactari/src/images/\` et images
récupérées dans \`data/assets-recovered/cdn-bulk/4.1.13-MTR/img/hero/\`
et \`img/recruit/\`.

**Important — distribution des assets :** les fichiers protégés récupérés
ne sont JAMAIS copiés dans \`apps/web/public\` ni le Docker public.
Les identifiants stables du registre \`lib/assets/registry.ts\` mappent les
fonds, portraits, pièces d'équipement et textures au pack local privé,
préparé via \`node tools/prepare-private-historical.mjs\`.
Le service \`/api/theme-assets/{id}\` ne sert les historiques que sur
l'aperçu **localhost authentifié** avec le mode historique opt-in.
Des portraits SVG originaux servent de **fallback public-safe**.

## Lot réalisé dans la PR

### Salle des héros (US-ART et US-ARM)
- Portrait grand format et fiche de personnage.
- Silhouette visuelle de **huit emplacements** : tête, cou, torse,
  arme, bouclier, mains, pieds et anneau. Le serveur reste l'autorité
  sur le budget de niveau et les types autorisés.
- **Drag & drop** : besace → emplacement, pièce portée → besace,
  pièce → coffre commun, coffre → besace, pièce → autre héros présent.
  Un emplacement occupé doit être libéré au préalable ; aucun échange
  fictif qui échappe à l'API.
- **Alternative tactile / clavier** : sélectionner un artefact,
  puis toucher/activer sa destination. État sélectionné, validation
  visible, refus ou indisponibilité explicites.
- L'API existante \`/artifacts/move\` enregistre les changements en
  transaction avec isolation du propriétaire et unicité des objets.
- Formation Jactari des **sept emplacements ordinaires** en cartes
  illustrées : permutation par glisser-déposer ou au clic,
  division/fusion, quantités avancées repliées dans un panneau,
  sauvegarde réelle sur \`/heroes/{id}/formation\` sans changer
  les troupes physiquement présentes.

### Salle de garnison (US-ARM)
- Plateau illustré : garnison du château d'un côté, héros de l'autre,
  effectifs visibles sur de **vraies cartes de peloton**.
- Glisser un peloton de la garnison à un héros présent et disponible,
  ou le rapatrier par glisser-déposer inverse.
- **Confirmation du nombre** avant chaque transfert, valeur
  maximale bornée au stock réel et à la limite d'ordre serveur ;
  aucune unité ajoutée artificiellement.
- API existante \`/forces/transfer\`, qui conserve les effectifs
  garnison+héros et invalide la formation précédente après changement.
- Recrutement et taverne conservés dans des cartes commerciales
  illustrées : les contrôles quantitatifs restent nécessaires pour
  les achats, mais ne dominent plus la page.

### Validation visuelle
- Tests Chromium mettent désormais en jeu le vrai glisser-déposer
  d'un **heaume dans l'emplacement tête**, d'un **peloton de
  miliciens vers un héros**, puis sa permutation de position
  dans l'armée de sept pelotons.
- Captures desktop conservées sept jours sous un artefact GitHub Actions
  du **dépôt public** (donc non confidentiel), pour pouvoir corriger l'esthétique
  sur des images réelles plutôt que sur une intuition CSS.
- Tous les transferts contrôlent toujours les droits PostgreSQL et
  les invariants des tests de domaine existants.

## Plan de convergence pour les prochains lots

1. **Ville / bâtiments** : boutons d'action sur les bâtiments
   visibles dans la scène d'origine, panneau latéral de détails,
   coût et durée dans une barre ornementale, non une liste de formulaires.
2. **Région / carte du monde** : reproduction du cadre de caméra,
   mini-carte, pastilles d'influence, actions contextuelles depuis
   les points d'intérêt, troupes illustrées en mouvement.
3. **Marché / caravanes** : comptoir, caisses de ressources illustrées,
   cargaison glissée dans les chariots, animation de trajet
   et historique intégré sans valeurs de simulation fictive.
4. **Rapports / classements / Guerre des Larmes** : panneaux narratifs,
   chronologie des escarmouches, trophées, emblèmes et états militaires.
5. Vérification systématique des formats desktop/tablette/mobile,
   de la sélection clavier/tactile, des contrastes et de la réactivité.

Les screenshots MMHK servent de référence esthétique ; une
fonctionnalité visuelle ne doit pas créer une règle de jeu
inconnue. **Aucun écran ne doit être considéré terminé uniquement
parce que son endpoint renvoie 200.**


## Reprise de revue — protection des interactions (29/10/2026)

- Une dépose étrangère (fichier ou texte sans MIME MMHK) ne peut plus
  équiper un objet seulement parce qu'il était sélectionné au clavier.
- Sur la formation à sept positions, un MIME absent ne peut plus être
  interprété comme le numéro zéro (\`Number(\"\"\`) = 0) : seuls les indices
  0 à 6 issus d'un véritable glissement de peloton sont acceptés.
- Le bouton de sauvegarde ne valide plus une formation contenant un type
  d'unité inconnu ou une quantité résiduelle sur une case vide.
- Les deux parcours Chromium existants ont été enrichis d'une dépose
  étrangère avant le vrai déplacement afin de détecter les régressions.

**Validation encore requise :** relancer manuellement le workflow complet
\`fullstack-foundation.yml\` sur la branche de la PR. Le dernier run vert
\`40877270285\` ne couvrait que le parcours local six services ; les trois
jobs API/PostgreSQL, TypeScript/Next et image preview étaient ignorés.
Il précède également les corrections de la présente revue. La PR reste ouverte.
