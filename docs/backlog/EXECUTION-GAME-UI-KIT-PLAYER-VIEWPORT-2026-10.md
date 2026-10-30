# MMHK — Game UI Kit, contrôle du joueur et écran persistant

## Principe de conception

**Un jeu dans le navigateur, pas un jeu à travers des pages Web.**
Le joueur conserve la carte, l'état de sa cité et ses ressources dans un écran
persistant. Les décisions se prennent dans des fenêtres de jeu et des plateaux
contextuels, avec retour visuel immédiat ; les formulaires techniques sont
cantonnés aux détails avancés. Les références principales sont :

- `data/Screenshots/Vue héros/sc13rc4.jpg` : fenêtre de gestion, portrait,
  onglets, scroll dans la zone de travail, informations de ville persistantes.
- `data/Screenshots/Vue héros/might-magic-heroes-kingdoms_2123145.jpg` :
  portrait, huit emplacements, deux bandes de réserve.
- `data/Screenshots/Vue combat/sc13rc1.jpg` : rangées d'unités,
  nombres ajustables, commandes de bataille très proches du contexte.

## Première couche du framework

Emplacement : `apps/web/components/game-ui/`.

| Composant | Responsabilité |
| --- | --- |
| GameDialog | Fenêtre de jeu en portal, focus initial et restitué, piège Tab, Échap, fermeture, blocage pendant ordre serveur, contenu scrollable |
| GameQuantity | Édition exacte, − / + / Max, limites locales, utilisation contrôlée ou dans un formulaire |
| GameTabs | Onglets cohérents, sections existantes, fonctions futures désactivées plutôt que simulées |
| GamePanel | Panneau de jeu ornemental standard, avec en-tête, contenu, pied et ancre |
| GameViewportControls | Plein écran du royaume, mode normal/compact persistant localement |
| GameHint | Aide de jeu au survol, au focus et au toucher, avec fermeture Échap |
| GameNotice | Retour d'action confirmé par le serveur : succès, information, refus, avertissement |

### Expérience écran

Sur desktop (> 900 px), `GameShell` possède un cadre de jeu
limité à la hauteur disponible (`100dvh`), plafonné en largeur à 1180 px.
La chronologie, la navigation et les ressources restent visibles ;
`.kingdom-screen-content` défile **à l'intérieur** du cadre. Le mode
compact réduit les espacements et la hauteur du HUD sans changer les
résultats métier. Sur petits écrans, le document retrouve un flux vertical
pour que les contrôles restent accessibles au tactile. Le plein écran
est explicite et révocable.

### Interactions déjà branchées

- Quantités : saisie exacte et pas ±1, ±10, valeurs rapides 25 % / 50 %,
  maximum ; retour instantané sur les bornes et valeurs sélectionnées.
- Transfert d'unités : un dialogue de confirmation en véritable fenêtre,
  avec source, destination, précision des quantités et état d'attente.
  Échap ferme sans ordre, les boutons désactivent une action impossible,
  confirmation = API transactionnelle existante.
- Recrutement : contrôle `GameQuantity` réutilisable.
- Salle des héros : `GameTabs` et `GamePanel`.
- Formation : division d'un peloton en quantité librement choisie,
  conservation des effectifs, aperçu du calcul et réinitialisation des
  modifications locales avant sauvegarde.
- Garnison : division en deux groupes de préparation, fusion des groupes
  de même unité, déplacement possible de chaque groupe par clic ou
  glisser-déposer, plafond de 1 000 soldats par ordre.

## Limite actuelle et dette structurelle explicite

`city_garrison_units` est une table **agrégée**
(`PRIMARY KEY(city_id,unit_code)`). Il n'existe pas encore de
`garrison_stack_id` persistant ni de rang de pile dans cette table.
La division de la garnison dans ce premier lot ne modifie donc pas le
stock officiel : elle est locale et réversible, puis la confirmation
d'un transfert persiste une quantité réelle. Ne jamais présenter deux
piles comme deux stocks nouveaux. Une migration dédiée devra introduire
les piles persistantes si l'on veut conserver la disposition de la
garnison entre deux connexions et la répercuter dans le combat.

**En revanche**, `hero_formation_slots` enregistre déjà sept positions
de manière réelle et transactionnelle. La division libre de la formation
utilise ce modèle existant et peut être sauvegardée.

## Règles non négociables

1. Un clic de sélection, une division d'affichage ou une ouverture de
   fenêtre ne débite rien et ne crée aucun soldat.
2. Les valeurs sont bornées ; le serveur recalcule coûts, propriété,
   disponibilité et conservation des effectifs.
3. Le clavier et les actions tactiles donnent accès à toutes les
   commandes critiques ; fermeture Échap, restitution du focus, aucun
   ordre implicite.
4. Les images originales restent dans le thème historique privé.
5. Pas de test "vert" seulement parce que le HTML a été rendu : vérifier
   l'interaction réelle dans Chromium et un état PostgreSQL cohérent.

## Suite du framework

Poursuivre sur les menus contextuels de bâtiment, les info-bulles riches,
la barre d'événements, les palettes de ressources, le fractionnement
persistant des garnisons (migration sécurisée) et les dialogues de
marché/caravanes. Unifier les raccourcis clavier et les retours
d'erreur avant de supprimer les derniers formulaires administratifs.

## Ticket de persistance des piles

Suivi de la migration et des invariants sur [l'issue #44](https://github.com/AstrowareConception/MMHK-like/issues/44).
Les tests E2E de ce lot vérifient déjà 3 → 1 + 2 → 3 soldats, sans débit,
ainsi que la fermeture Échap du transfert et la restitution du focus.
