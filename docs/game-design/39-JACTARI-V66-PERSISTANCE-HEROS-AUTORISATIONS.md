# MMHK-like — V6.6 tranche 7 : persistance SQLite et autorisation des héros en combat

**26 octobre 2026 · En préparation de V7.0 · C03 / C17 · AUCUN déploiement serveur de production.**

## 1. Pourquoi cette tranche

Jusqu'à V6.6 tranche 6, la simulation `simulateBattleWithDerivedHeroes()` acceptait des **profils présentés comme provenant d'un serveur fiable**, sans implémenter la recherche du héros réellement enregistré, la propriété du compte, ni les contrôles d'accès. Une API web branchée directement sur cet adaptateur permettrait à un utilisateur malveillant de déclarer un niveau, un équipement, une armée ou des rangs légendaires inventés.

Cette tranche construit une **preuve technique d'une frontière de confiance** : les données persistées doivent être chargées par un composant serveur, et les identifiants présentés par le client doivent être autorisés séparément avant une simulation. Aucun compte joueur, identifiant ni donnée de combat calculée ne doit être accepté depuis l'appelant non fiable.

## 2. Modules ajoutés

| Module | Rôle | Limite |
| --- | --- | --- |
| [`trusted-hero-store.mjs`](../../tools/jactari-port/trusted-hero-store.mjs) | SQLite local avec `players`, `heroes`, version de profil et validations de données | API d'administration **privée au serveur**, non exposable directement au navigateur |
| [`server-authorized-battle.mjs`](../../tools/jactari-port/server-authorized-battle.mjs) | Simulation en lecture seule depuis deux héros réellement chargés en base, avec authentification et autorisation injectées | Aucun déploiement HTTP ni application des résultats en base |
| [`server-authorized-battle.test.mjs`](../../tools/jactari-port/server-authorized-battle.test.mjs) | Sécurité et persistance intégrées : propriétaires, profils forgés, droits légendaires, versions et ordres de sorts | Tests isolés et SQLite expérimental, pas une qualification de production |

**Environnement : Node.js 22**, module intégré **`node:sqlite`** (encore expérimental dans cette version). Aucune dépendance npm additionnelle.

### Schéma conceptuel réellement implémenté

```text
players
  player_id  PRIMARY KEY
  enabled    BOOLEAN CHECK 0 ou 1

heroes
  hero_id         PRIMARY KEY
  owner_player_id FOREIGN KEY -> players.player_id
  revision        INTEGER > 0
  payload         JSON SQLite validé
```

Le `payload` versionné contient exclusivement les données choisies ou enregistrées : `profile` (faction, archétype, niveau, hérédité, équipement, etc.), `careers`, `legendarySelections`, `legendaryGrants`, `army` (sept pelotons) et `spellOrders`.

L'attaque, la défense, la magie et leurs bonus calculés sont **reconstruits par le moteur historique** lors de chaque simulation ; ils ne sont **pas** enregistrés comme vérité. Les champs inattendus, IDs invalides, artefacts mal placés, carrières interdites, budgets dépassés, rangs légendaires hors catalogue et sorts dupliqués sont refusés.

### Concurrence et durabilité

- Les écritures de progression emploient `BEGIN IMMEDIATE` et des requêtes SQL paramétrées.
- Les mises à jour demandent un `expectedRevision` et échouent en cas de révision périmée (**optimistic concurrency**).
- Le propriétaire d'un héros ne peut pas être changé via une simple mise à jour de progression.
- Le stockage sur fichier SQLite survit à une fermeture/réouverture, démontré par un test temporaire en CI ; `WAL`, clé étrangère et délai d'attente sont configurés.
- La lecture des deux héros s'effectue dans une même **transaction de lecture**, pour conserver une photographie cohérente des profils de départ.
- La simulation vérifie de nouveau leurs révisions à son terme : si un profil a changé, elle refuse le résultat comme périmé. **Ce mécanisme n'est pas un verrou transactionnel des conséquences militaires.**

## 3. Frontière de confiance avant un combat

[`previewServerAuthorizedHeroBattle()`](../../tools/jactari-port/server-authorized-battle.mjs) accepte une commande ne contenant **que deux identifiants de héros**, et reçoit séparément des composants strictement **côté serveur** :

```js
const projection = previewServerAuthorizedHeroBattle({
  // Requête client admise : uniquement deux IDs, PAS de bonus.
  command: {attackerHeroId:'hero-a',defenderHeroId:'hero-d'},

  // Toutes les autres données sont injectées par le serveur.
  authContext: verifiedServerSession,
  authenticate: trustedSessionResolver,
  authorizeTarget: trustedWorldAndDiplomacyPolicy,
  heroStore: privateSQLiteRepository,
  trustedRules: serverSelectedRulesAndCatalogs
});
```

Le processus est strict : (1) rejeter les champs client non autorisés, (2) vérifier la session et l'activation du compte, (3) charger les deux profils persistés, (4) prouver que l'attaquant appartient au joueur authentifié, (5) obtenir **`true` explicite** du contrôleur d'autorisation de la cible (absence de règle = refus), (6) construire les caractéristiques et talents depuis les données de confiance, (7) lancer la simulation, (8) vérifier l'absence de modification concurrente, (9) retourner une projection en lecture seule.

Les droits `heroLegendaryGrants` proviennent uniquement de la fiche enregistrée. Les nouveaux contrôles **interdisent également de faire passer une carrière légendaire (IDs 13–20) dans `heroCareers` ordinaires** afin de contourner les plafonds. L'ancien format `heroTalents` rejette déjà ces mêmes talents. Les rangs sauvegardés sont bornés de **0 à 3** sur les 24 noms originaux connus.

Les ordres de sorts sont eux aussi **récupérés dans les enregistrements SQLite**, puis résolus depuis un catalogue versionné injecté côté serveur ; les puissances ni l'équipement magique ne peuvent être écrits dans une commande client.

## 4. Résultats et tests

Le banc vérifie notamment la conformité de la simulation aux états de héros calculés, le refus d'une identité usurpée, d'un compte désactivé ou d'une cible interdite, le refus de données militaires et légendaires forgées, l'absence de fuite automatique des combats entre comptes, la relecture des profils après redémarrage et le refus d'une révision concurrente obsolète.

Tous ces tests sont reproductibles dans le workflow GitHub Actions `node --test tools/jactari-port/*.test.mjs`. La dernière CI probante doit être reportée dans le registre de conformité après sa validation.

## 5. Limites de production explicites

**Il ne s'agit PAS d'un serveur multijoueur complet.** À ce stade :

- Il n'existe pas de serveur HTTP, de connexion utilisateur réelle, de jeton vérifié ni de gestion d'identité fournie par le projet. `authenticate` est un **contrat à réaliser/injecter dans un futur serveur**, pas une preuve d'authentification d'un compte réel.
- `authorizeTarget` est également un **contrat non implémenté** : la diplomatie, la position sur la carte, la protection débutant et les permissions PvP du vrai jeu devront décider du droit d'attaquer une cible.
- Les opérations `registerPlayer()`, `putHero()` et `replaceHero()` sont des **outils d'administration internes** : les exposer comme endpoints clients permettrait d'attribuer des niveaux ou des rangs sans contrôle.
- **Aucun résultat militaire n'est committé :** les armées, les blessures, les captures, l'expérience, l'honneur, le retour de mission et les récompenses ne sont pas modifiés en base.
- L'idempotence des commandes de combat, les verrouillages d'armées, les contraintes de mission, l'historique d'événements et la récupération en cas de panne ne sont pas encore implémentés. Les aperçus ne doivent pas être étiquetés « bataille résolue ».
- Le système ne possède toujours pas une source Ubisoft indépendante prouvant les paramètres exacts de MMHK saison 2. Les calculs restent adossés au **Jactari 4.1.3-MTR communautaire**.
- Node.js `node:sqlite` employé ici est une API expérimentale ; une décision technique sur le serveur et la migration des données reste nécessaire.
- Le format de projection renvoyé contient des **informations détaillées sur les deux héros** ; une future API devra appliquer un filtre de visibilité avant d'envoyer une réponse à un joueur.

**Décision de conformité :** C03 toujours `implemented_partial`, C17 passe à **`implemented_partial` pour ses fondations seulement**, V6.6 reste `in_progress` et V7.0 reste `open`. Le gate de production `productionBattleArbiterAllowed` reste **`false`**.

## 6. Étapes suivantes

1. Définir un **contrat d'identité joueur** et un endpoint d'accès serveur réellement authentifié (avec token signé/session vérifiée), sans permettre à un client de fournir les callbacks de sécurité.
2. Construire la projection du monde, des mouvements d'armée, de la diplomatie, de la protection débutant et de l'éligibilité PvP à partir de la base de jeu.
3. Introduire une commande de combat **idempotente et atomique**, avec version des deux armées, réservation des forces, état d'exécution, écritures de pertes/captures, audit et tests de panne/réexécution.
4. Remplacer les règles synthétiques par des règles **MMHK S2 documentées indépendamment**, en conservant Jactari comme oracle de comparaison et non comme vérité serveur Ubisoft.
