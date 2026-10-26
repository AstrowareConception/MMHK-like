# MMHK-like — V7.0, tranche 1 : combats atomiques, idempotence et journal SQLite

**26 octobre 2026 · Étape C17 : `implemented_partial` — progression de la fiabilité serveur, sans qualification de production.**

## 1. Résultat de cette tranche

La V6.6 a livré la **lecture autorisée** des héros enregistrés. Cette première tranche V7.0 introduit un mécanisme permettant, **pour les seuls combats PvP admis et entièrement supportés par le port Jactari**, d'appliquer leurs pertes irréversibles en base de manière **atomique et idempotente**. L'état initial des deux armées, les caractéristiques de leurs propriétaires, leurs talents et leur équipement sont lus depuis SQLite ; aucune puissance, perte, blessure ni caractéristique calculée ne vient de la commande du joueur.

Les conditions de jeu réelles (sessions, diplomatie, territoires, protection débutant, captures et blessures) ne sont **pas** inventées ou émulées. Le module n'est pas encore un serveur HTTP, et son autorisation demeure un **contrat de fonctions injectées par le futur serveur**. Il est **interdit de connecter directement ces interfaces à des paramètres ou callbacks clients**.

## 2. Modules livrés

| Fichier | Fonction |
| --- | --- |
| [`trusted-hero-store.mjs`](../../tools/jactari-port/trusted-hero-store.mjs) | Tables `battle_commands` et `battle_audit_events`, verrou SQLite `BEGIN IMMEDIATE`, calcul et écritures de pertes dans la même transaction |
| [`server-transactional-battle.mjs`](../../tools/jactari-port/server-transactional-battle.mjs) | `commitServerAuthorizedJactariBattle()` vérifie la commande, l'acteur et les règles versionnées, puis appelle le stockage autoritatif |
| [`server-transactional-battle.test.mjs`](../../tools/jactari-port/server-transactional-battle.test.mjs) | Débit unique des pertes, réexécution après redémarrage, contrôle de cible, rollback, cohérence de chaque peloton, résistance aux entrées falsifiées |

### Format de commande minimal

```js
const result=commitServerAuthorizedJactariBattle({
  // Ces TROIS champs seulement peuvent appartenir à l'ordre du navigateur.
  command:{
    commandId:'battle-unique-001',
    attackerHeroId:'hero-a',
    defenderHeroId:'hero-d'
  },

  // Le reste est exclusivement construit par le serveur.
  authContext: verifiedServerSession,
  authenticate: trustedServerSessionResolver,
  authorizeTarget: trustedDiplomacyAndWorldPolicy,
  heroStore: privateSQLiteHeroRepository,
  trustedRules: selectedAndVersionedServerBattleRules
});
```

**Ne pas confondre clé d'idempotence et clé d'authentification.** Le premier identifiant est réutilisé lors des retries réseau ; le deuxième est contrôlé via la session et le propriétaire du héros, jamais supposé valide parce qu'un ID de bataille existe.

## 3. Transaction SQLite, propriété et débits

La commande verrouille **une transaction d'écriture SQLite `BEGIN IMMEDIATE` couvrant l'intégralité du calcul**. À l'intérieur de ce verrouillage :

1. vérifier que le joueur est enregistré et actif, qu'il possède le héros attaquant et que le propriétaire défenseur est actif ;
2. lire les deux héros et les armées stockés en base ;
3. exécuter la **vraie politique serveur injectée** sur la cible ; tout résultat différent du booléen `true` est un refus ;
4. rechercher une clé `commandId` déjà committée : mêmes identifiants, joueur et **empreinte SHA-256 des règles triées canoniquement** ⇒ renvoyer le reçu original, sans nouveau combat ; paramètres différents ⇒ rejeter la collision ;
5. contrôler la **décision d'admission PvP Jactari** : si le héros doit être capturé, blessé ou fuir, arrêter **sans écriture** car le moteur ne connaît pas encore la transition serveur exacte ;
6. construire les deux héros à partir des données persistées, puis exécuter `simulateBattleWithDerivedHeroes()` sous les règles fournies par le serveur ;
7. comparer chacun des sept pelotons du résultat à son ancienne identité, à son effectif et au nombre exact de pertes permanentes du rapport : effectifs négatifs, création d'une nouvelle unité, identité modifiée ou pertes incohérentes provoquent un refus ;
8. transformer tout peloton complètement anéanti en **emplacement `null`**, et mettre à jour **les deux enregistrements** avec incrément de révision dans une seule transaction ;
9. insérer **un seul reçu durable** dans `battle_commands` et les événements ordonnés dans `battle_audit_events` ;
10. finaliser par `COMMIT` ; toute exception revient en `ROLLBACK`, y compris lorsque l'erreur survient **après** les écritures d'armées et de journal mais avant le commit.

Le reçu contient le gagnant, les tours, les révisions des deux héros avant/après, les pertes permanentes, les armées sauvegardées, la version des règles par empreinte et le nombre d'événements. Le journal est accessible via `getBattleReceipt(commandId)`, `getBattleEvents(commandId)`, et `getBattleAuditCounts()` **uniquement dans le composant de stockage privé**.

Une clé déjà committée peut être rejouée depuis **une autre connexion SQLite** ou après fermeture/réouverture du fichier ; il n'est alors réalisé **aucun nouveau débit** de troupe. Le droit de consulter un reçu est malgré tout réévalué : **une cible devenue interdite provoque toujours un refus**, même sur une commande historique.

## 4. Corpus de régression et erreurs détectables

Les nouveaux tests couvrent :

- Combat effectivement appliqué une seule fois aux deux camps, avec pertes vérifiées peloton par peloton et journal d'événements ordonné ;
- Collisions sur `commandId` entre héros différents ou versions différentes des règles de combat ;
- Réexécution par un autre joueur, compte désactivé ou cible devenue non autorisée ;
- Rejet des commandes contenant effectifs, caractéristiques militaires, blessures ou coefficients falsifiés ;
- Admission PvP annonçant fuite, blessure ou capture : **aucun prélèvement, ni journal de combat committé** ;
- Erreur de simulation et **panne artificielle juste avant `COMMIT`** : restauration des deux armées et suppression de toute écriture de journal ;
- Rechargement d'une base SQLite sur disque et rejeu idempotent du reçu, y compris via deux instances de dépôt distinctes ;
- Armée entièrement anéantie représentée par un slot vide, jamais par un peloton de nombre zéro ;
- Bilan d'effectifs ou de pertes falsifié par un calculateur défaillant : transaction rejetée en totalité ;
- Hash des règles indépendant de l'ordre des clés JSON, et rejet des nombres non finis / objets non sérialisables.

Les nouveaux cas sont regroupés en **13 tests supplémentaires `node:test`**. Les cas de création/persistance antérieurs restent dans la suite, ce qui porte le dernier corpus code validé à **[356 tests réussis sur 356](https://github.com/AstrowareConception/MMHK-like/actions/runs/40339759720)**. Le nombre de tests est un indicateur de régression **et non une mesure de fidélité historique**.

## 5. Ce que l'on refuse encore volontairement

Cette tranche **n'implémente pas** :

- les captures et blessures des héros, leur durée réelle, leur récupération ni les évènements de mission ; la décision d'admission est reconnue puis **refusée sans mutation** tant que ces transitions serveur ne sont pas conçues ;
- les guerres de siège, haltes, engagements PvE, les phases de combat Jactari encore non couvertes ni les paramètres authentiques S2 ;
- la réservation d'armées **sur une mission persistante préalable** avec déplacement, départ/retour, visibilité, calendrier, recharge après panne en plein trajet ;
- un vrai serveur HTTP, les sessions signées, l'identité réseau, la politique de diplomatie, les protections débutant, la visibilité d'une armée ennemie ou la désactivation des comptes ;
- le butin, l'expérience, l'honneur, les statistiques de héros post-combat et toute autre transition métier non démontrée ;
- l'audit de performances sous forte concurrence multiprocessus, les migrations de base de données et la pérennisation de l'API `node:sqlite` **expérimentale sous Node 22**.

**Le journal technique de combats ne devient pas une preuve du déroulement officiel d'Ubisoft.** Notre référence de calcul reste Jactari `4.1.3-MTR`, et le pont de 2013 modifie les saisons 1 et 2 en 3. Les éventuelles différences MMHK saison 2 doivent être démontrées indépendamment.

La transaction `BEGIN IMMEDIATE` garantit la sérialisation des écrits dans ce **fichier SQLite**, pas une réservation distribuée des troupes sur un cluster ou un monde de jeu. Il faut donc interdire toute utilisation de ce composant comme serveur PvP public.

## 6. Décision de conformité

- **C17** : `implemented_partial` (le stockage atomique des pertes sur combats admis, l'idempotence et l'audit durable progressent réellement).
- **V7.0** : `in_progress` (première tranche technique, pas une version aboutie).
- **C03** : `implemented_partial` (dérivation depuis données persistées, pas de règles complètes d'obtention des héros).
- **C18** : `blocked_source` (pas de certification indépendante Ubisoft saison 2).
- **Gate final** : `productionBattleArbiterAllowed=false`.

**Prochaine tranche prioritaire :** machine d'état des missions/armées (départ, arrivée, verrouillage, retour) et effets PvP de fuite, blessure et capture, avec **preuves historiques indépendantes** avant application des conséquences. Ensuite seulement, authentification réseau et contrôle d'engagement monde/diplomatie/protection débutant.
