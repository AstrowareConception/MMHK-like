# Contrats métier détaillés — early game

**Mise à jour :** cette version initiale des contrats est complétée et, en cas de divergence sur la politique du futur jeu, **supplantée par les [84 décisions P0](../decisions/DECISIONS-P0-2026-10-23.md) et le [profil S2](../../data/rules/mmhk-like-s2-policy-draft.json)**. Une inconnue historique mentionnée ici peut désormais avoir une règle **décidée pour MMHK-like** sans preuve que le serveur d'Ubisoft utilisait la même. Le [référentiel des 90 RM](../../data/rules/early-game.rules.json) contient les correspondances et éventuels `project_contract_override`.

**Portée : règles RM-WRD, RM-REG, RM-ECO, RM-CIT, RM-HER, RM-ARM, RM-COM, RM-TIM.** Ces contrats traduisent des preuves et des propositions ; lorsqu'une règle historique ne peut pas être vérifiée, le comportement du futur jeu est annoté *PROP*, jamais attribué implicitement à Ubisoft.

## 1. Entrer dans un monde et obtenir un royaume

**Acteurs :** Account, World, WorldPlayer, City, WorldRegion et, facultativement, un parrain/invitant.

**Préconditions minimales :** un monde accepte les inscriptions ; la faction demandée figure dans les factions permises de ce \`ruleset_id\` ; le compte n'a pas déjà de WorldPlayer dans le monde ; un emplacement admissible existe. Les mondes ont leur calendrier, leur profil et leur contenu propres : ils ne partagent ni stocks ni cités.

**Commande conceptuelle \`JoinWorld\` :** (\`account_id\`, \`world_id\`, \`faction_id\`, \`spawn_mode\`, \`friend_key?\`, \`idempotency_key\`). Son résultat est soit un royaume complet, soit un motif de refus, jamais une cité partiellement initialisée.

**Contrat d'intégrité (PROP)** : unique \`(account_id, world_id)\` ; réservation atomique de la région ; création de la cité et dotation de départ dans la même transaction ; réponse idempotente à une double requête. Une reconnexion ne rejoue pas le starter pack.

**Contrat du placement :** les modes \`random\` et \`near\` sont étayés par le client archivé ; le rayon et les exclusions géographiques de \`near\` sont **U47**. Une \`friend_key\` ne doit autoriser ni lecture arbitraire de coordonnées ni implantation en dehors de son propre monde. Quand les inscriptions sont fermées, l'interface originale désactive \`near\` dans certains contextes. Le fallback (« essayer aléatoire », « refuser », « autre voisin ») reste une décision de profil : aucun comportement n'est adopté comme vérité serveur.

**Dotation initiale :** \`starter_pack\` est un objet versionné qui indique les ressources, bâtiments, éventuels héros et troupes de départ. Ses valeurs historiques ne sont **pas encore qualifiées**. Une fixture peut injecter des valeurs choisies par le test, mais celles-ci ne constituent pas le paramétrage d'un nouveau monde de production.

**Protection initiale :** le client gère un état et une date de fin ; sept jours correspondent au souvenir du projet, alors que d'autres sources documentent 14–15 jours à des périodes différentes. La durée, l'immunité sur la première cité, l'éventuelle levée anticipée et les actions offensives autorisées forment **U20**. Si le profil de laboratoire utilise \`duration_days=7\` et une fin exclusive, il doit déclarer ces choix comme **PROP/RECOLLECTION**, puis tester juste avant et exactement à l'échéance.

| Condition | Sortie attendue dans le contrat proposé |
| --- | --- |
| Identifiant monde/faction invalide | Refus explicite sans création ni débit |
| Compte déjà inscrit | Renvoi du royaume existant, pas de deuxième implantation |
| Deux joueurs veulent la même région | Un seul obtient l'emplacement ; l'autre réessaie selon une politique versionnée |
| Clé ami d'un autre monde | Refus sans divulgation de la région de l'invitant |
| Zone proche saturée | Résultat contrôlé par une politique encore à arbitrer |
| Perte de réponse après succès | Nouvelle requête de même clé → résultat déjà acquis |
| Protection expirée exactement maintenant | Décision fondée sur l'horloge serveur et la convention d'intervalle du profil |

Règles : \`RM-WRD-001…008\`. US : \`US-ACC-001…005\`, \`US-ACC-011\`. Preuves : [arrivée et protection](../research/GENERATION-MONDE-RELIQUES-ARRIVEE-PROTECTION-2026-10-23.md).

## 2. Géométrie et génération d'une région

Pour une **région ordinaire**, le modèle documenté est une **grille de 5 × 5** (25 positions) comportant une cité centrale et **quatre mines**. Les coordonnées locales \`x=0..4\`, \`y=0..4\`, ville \`[2,2]\` sont une **convention de représentation proposée** ; elles ne désignent pas un protocole connu du serveur Ubisoft.

### Invariants de génération (proposés)

- La case centrale est réservée à la cité ; aucune mine ne la remplace.
- Quatre **occurrences** de mines ont quatre positions distinctes. Leurs **types** peuvent se répéter : la collection ne doit pas être un ensemble de quatre ressources uniques.
- Types admis : **G** or, **w** bois, **o** minerai, **c** cristal, **g** gemme, **s** soufre, **m** mercure, tels que codés par le catalogue 2013.
- Les poids de tirage et l'éventuelle garantie de ressources communes sont **U17**. La composition « or, bois, minerai, rare » est un souvenir de fréquence, non une distribution chiffrée démontrée.
- Région ordinaire, site mondial spécial, monument construit et objectif de quête sont des **classes distinctes** ; ne pas fabriquer une Larme comme cinquième mine ou un site d'événement ordinaire.
- Le générateur de laboratoire prend \`(world_seed, generator_version, world_region_coordinates)\` et produit les mêmes positions/types à entrées identiques. C'est une garantie technique **PROP** ; la graine du serveur original est inconnue.
- La génération de l'occupation initiale (PNJ, difficulté, autres cases libérées) est une étape distincte, dont les barèmes restent ouverts.

### Exemple de fixture contrôlée (fictif)

\`\`\`json
{
  "city": [2, 2],
  "mines": [
    {"cell": [0, 1], "resource": "w"},
    {"cell": [1, 4], "resource": "G"},
    {"cell": [3, 0], "resource": "w"},
    {"cell": [4, 3], "resource": "c"}
  ]
}
\`\`\`

Deux mines de bois ici servent **à tester les doublons**, pas à prétendre qu'une telle région aurait une probabilité donnée de sortie dans MMHK.

**Libération :** une \`RegionPlot\` garde son contenu, son état \`occupied / cleared\` et, le cas échéant, une \`Mine\` avec \`inactive / producing / extending / upgrading\`. Seule une résolution de combat admissible fait évoluer l'occupation. La mine bloquée ne crédite rien ; les modalités d'activation après libération restent à décider.

Règles : \`RM-REG-001…008\`, \`RM-COM-004\`. US : \`US-REG-001…005\`, \`US-ACC-003…004\`. Inconnue : U17.

## 3. Ressources, temps et conservation des stocks

**Les ressources historiques** forment sept types, pas une ressource générique du monde entier. Le domaine proposé sépare \`ResourceAccount\` (stock propre à un conteneur), \`ResourceReservation\` (engagement), \`Transfer\` (trajet ou marché) et \`ResourceLedgerEntry\` (origine vérifiable).

### Équations de conservation proposées

\`\`\`text
disponible(cité, ressource, t)
  = stock_physique(cité, ressource, t)
    − réservations_valides(cité, ressource, t)

stock_cible = stock_initial
            + production_effective_sur_chaque_segment
            + gains_admissibles
            − dépenses_validées
            − transferts_sortants
            − entretien
\`\`\`

Ces expressions définissent une **discipline comptable**, pas la formule historique de chaque terme. Une opération atomique ne débite une ressource que si toutes les ressources requises sont disponibles. Un échec ne consomme ni ressource ni troupe et ne crée pas de chantier fantôme. Une réservation n'est pas un débit supplémentaire du stock physique.

### Calcul dans le temps

- Toutes les décisions portent une date UTC. Le fuseau de trêve et les heures locales affichées sont indépendants.
- La production doit se régler **à la coupure des événements** : libération d'une mine, changement de niveau, bonus, début/fin d'extension, capacité atteinte, siège, nouveau bâtiment.
- **Cadence U03** : le montant annoncé « par jour » ne permet pas de conclure s'il est crédité en continu, à intervalles ou lors d'une échéance commune.
- **Arrondis U04** : fraction conservée, arrondi par source, par total ou par crédit ? Ne pas fixer silencieusement le comportement réel.
- **Débordements U30** : distinguer production excédentaire, récompense, marché, retour de convoi ; l'or peut suivre un plafond différent.
- **Entretien U07/U08** : plusieurs barèmes coexistent ; aucune désertion automatique ne doit être inventée en cas de dette.
- En cas d'arrêt/reprise serveur, chaque événement déjà traité garde son identifiant, sa date et son effet. La relance d'un même règlement n'ajoute rien.

**Exemple strictement fictif :** une mine configurée pour produire 24 bois/jour crédite 12 unités en douze heures *dans une fixture de production continue sans fractions*. Si elle passe à 48/jour au bout de six heures, le crédit est 6 + 12 = 18 unités. **Ce ne sont pas des taux historiques** (les guides donnent des valeurs nominales beaucoup plus faibles pour une mine de bois ordinaire).

**Exemple candidat catalogue :** le Conseil du village de l'Académie déclare 2 000 or/jour et sa Mairie 4 000 or/jour. Après remplacement, le rendement administratif déclaré est **4 000**, pas **6 000** : les étapes d'une chaîne sont exclusives. Cela ne fixe pas la date exacte du crédit.

Règles : \`RM-ECO-001…011\`, \`RM-TIM-001…004\`. US : \`US-ECO-001…012\`, \`US-REG-004…006\`.

## 4. Bâtiments, prérequis, chantiers et effets

Les \`BuildingDefinition\` sont **définis par faction et version** ; les \`BuildingInstance\` représentent l'état effectif d'une cité. Un identifiant de définition ne doit jamais être réutilisé silencieusement pour un autre catalogue/saison.

### Parcours \`StartConstruction\` proposé

1. Identifier la cité, le joueur, la faction, le profil et la définition de bâtiment.
2. Vérifier prérequis du catalogue : niveau de cité, bâtiment précédent, variante éventuelle et droits.
3. Vérifier chantier possible selon **U05** (nombre de files, affectation de héros, durée de mobilisation) et restrictions du siège (**U19**).
4. Calculer le devis exact et ses modificateurs depuis le profil ; vérifier **ensemble** des ressources nécessaires.
5. Dans une transaction : valider version d'état, réserver ou débiter les ressources, bloquer les moyens requis, créer un \`Order\` et un chantier avec \`started_at/due_at\`.
6. À \`due_at\` : activer une seule fois bâtiment et effets, libérer les engagements nécessaires, recalculer rendements/productions et émettre \`ConstructionCompleted\`.
7. Rendre les commandes et achèvements **idempotents**, même après erreur de réseau ou redémarrage du serveur.

### Fixture chiffrée fidèle au catalogue 2013 (mais profil saisonnier non vérifié)

**Mairie de l'Académie**, entrée \`_batiments[2]\` : prérequis niveau de cité 3 et \`_batiments[1]\` (Conseil du village), **6 000 or, 8 bois, 10 minerai, 576 minutes**. Pour un stock de fixture \`{G:7000,w:10,o:12}\` :

| Situation | Résultat du contrat proposé |
| --- | --- |
| Départ 09:00 UTC avec prérequis satisfaits | Réserve/débite une fois ; stock de fixture final \`{G:1000,w:2,o:2}\` |
| Fin contractuelle | 18:36 UTC le même jour (**9 h 36 min**) |
| Bois disponible = 7 | Refus : état inchangé \`{G:7000,w:7,o:12}\` |
| Même requête rejouée après succès | Même \`order_id\`, aucun second prélèvement |
| 18:35:59 UTC | Bâtiment en construction, bonus encore inactif |
| 18:36:00 UTC | Bâtiment activé, un seul événement d'achèvement |

L'état initial de fixture suppose **une cité déjà au niveau 3** pour isoler le test : il ne décrit pas la dotation initiale du jeu original.

**Points non arbitrés :** file unique ou multiple, rôle exact d'un héros, annulation et remboursement, fin d'un chantier sous siège, priorité si capture et fin se produisent à la même seconde. Une UI affichant un bouton « Annuler » sans politique de remboursement validée serait prématurée.

Règles : \`RM-CIT-001…008\`. US : \`US-CIT-002…008\`.

## 5. Héros, recrutement et composition d'armée

### Héros

Une instance de héros possède identité, état d'activité, faction, archétype, localisation, niveau, XP, carrières, talents, équipement et sorts. **Les indices \`attaque\`, \`defense\`, \`magie\` d'un archétype sont des courbes de progression**, pas des valeurs d'attribut à recopier telles quelles.

Un héros en mission ou mobilisé par une activité exclusive **ne peut pas être réutilisé en parallèle**. Cette exclusivité est une proposition de contrat d'intégrité fondée sur les possibilités du jeu, et sa granularité précise dépendra du profil.

La taverne historique présente des offres et des délais variables. Leur distribution, renouvellement et prix restent **U24**. La dotation initiale en héros est également indéterminée.

### Recrues et unités

Les **recrues** disponibles à l'achat, les **unités** déjà achetées, les **pelotons** affectés à une armée et les **effets invoqués** sont quatre choses différentes. Le catalogue communautaire associe nominalement les T1–T7 à \`15, 10, 7, 5, 3, 2, 1\` productions de base avant bonus, mais la cadence exacte et le partage des pools entre unités améliorées restent **U06**.

Un ordre de recrutement vérifie stock de recrues, prix unitaire, ressources et bâtiment autorisé ; la durée éventuelle et les files d'attente doivent être spécifiées avant implémentation fidèle. Dans une fixture, nous pouvons **injecter** directement trois recrues disponibles, plutôt que prétendre savoir comment elles sont arrivées là.

**Gremlin Académie** (entrée \`_unites[0]\`) : coût candidat **189 or**, puissance individuelle **71**. Trois unités achètent pour **567 or**, puissance brute **213**. Un stock de test de 1 000 or deviendrait **433 or** si trois recrues sont déjà disponibles et si l'achat peut être achevé à cet instant. La fixture ne valide aucune cadence de recrutement.

### Armée et engagement

- Sept emplacements **ordinaires** de pelotons dans le calculateur, ordonnés ; une garnison urbaine ne suit pas automatiquement cette limite de présentation.
- Une unité appartient à **un seul conteneur** à la fois ; pas de duplication lors des transferts, combats et retours.
- Puissance brute : somme de \`effectif × puissance_individuelle\`, avant héros, magie, fortifications et contre-armes.
- Les variantes améliorées ne sont pas un pourcentage uniforme ; elles peuvent changer d'arme, de puissance et de coût.
- Séparer garnison, troupes embarquées, armées en marche, réserves de recrues et unités invoquées.

Règles : \`RM-HER-001…006\`, \`RM-ARM-001…008\`. US : \`US-HER-001…003\`, \`US-ARM-002…009\`.

## 6. Première rencontre PvE : ordre, résolution, récompense

**La bataille n'est pas un combat tactique interactif** dans le modèle historique étudié. Le joueur prépare sa composition, ses héros et, le cas échéant, ses sorts ; le moteur calcule ensuite admission, tirs préalables, sorts, duels, dispersions, pertes définitives, expérience et rapport.

### Préconditions proposées d'une attaque régionale

- Site encore occupé et accessible à ce joueur.
- Héros présent, admissible et sans mission exclusive concurrente.
- Armée ordonnée de pelotons validés, effectifs disponibles, pas d'équipement ou d'unité doublement affectés.
- Délai/heure d'arrivée et règles de fuite propres au profil.
- Snapshot des forces et version des règles au moment retenu par le contrat (instant du départ et conditions recalculées à l'arrivée restent à qualifier).

Le résultat d'une **défaite** ne libère pas la case. La **victoire** peut la libérer et rendre sa mine exploitable ; le mécanisme d'activation automatique ou volontaire demande encore un choix. Chaque résolution produit un **rapport persistant**, avec pertes et explications par phase ; le rapport n'est pas recalculé selon de nouvelles règles après une mise à jour du jeu.

### Exemple de contre-armes

Relation de référence : **I bat C**, **R bat I**, **C bat R**, avec **+50 %** d'avantage de base dans le calculateur. Le bonus est appliqué au bénéficiaire ; il ne crée pas simultanément un malus universel de −50 % chez l'adversaire.

Le fichier [combat-reference-cases.json](../../data/combat-reference-cases.json) propose un duel **synthétique** de 100 unités I contre 100 C à puissance artificielle égale. Il produit dans son oracle communautaire 50 dispersées / 15 mortes pour l'attaquant et 100 dispersées / 30 mortes pour le défenseur. **Ce cas ne certifie pas le résultat du serveur Ubisoft** ; il sert à valider une première transcription du calculateur. Les égalités, tirages spéciaux, invocations et pertes de PNJ restent des incertitudes.

Règles : \`RM-COM-001…007\`. US : \`US-COM-001…017\` selon sous-parcours, \`US-REG-003…004\`, \`US-RAP-001\`.

## 7. Invariants transverses et frontières

| ID | Invariant | Contrôle minimal |
| --- | --- | --- |
| INV-01 | Un monde et un profil connus pour toute mutation | Rejet d'un \`world_id\` étranger, absent ou clos |
| INV-02 | Une région initiale appartient à un seul WorldPlayer | Deux inscriptions concurrentes, un seul propriétaire |
| INV-03 | Pas de ressources négatives ou double dépense | Rejeu, commandes simultanées, changement de stock entre devis et validation |
| INV-04 | Une armée ne possède pas deux fois les mêmes unités | Déplacement, affectation, combat, retour |
| INV-05 | Un héros ne réalise pas deux actions exclusives | Ordres concurrents, reconnexion, interruption |
| INV-06 | Un effet temporel n'est appliqué qu'une fois | Achèvement de chantier et combat rejoués |
| INV-07 | Les prérequis sont calculés sur l'état serveur | Client manipulé, données affichées obsolètes |
| INV-08 | La victoire conditionne la libération d'un site | Combat perdu ou interrompu |
| INV-09 | Chaque résultat utilise catalogue + ruleset figés | Mise à jour du catalogue puis consultation d'un ancien rapport |
| INV-10 | Le calendrier ne dépend pas des rafraîchissements navigateur | Fermeture, pause, reconnexion et reprise du serveur |

L'ordre exact des événements à même seconde (\`U14\`) reste à décider dans une matrice versionnée. Utiliser simplement l'ordre de réception HTTP serait inacceptable pour un jeu multijoueur persistant.

## 8. Limite du lot A

Ce document **n'est ni un moteur de jeu fonctionnel ni une certification du serveur historique**. En particulier, il ne fixe pas arbitrairement la progression réelle du joueur depuis sa première connexion, le barème d'entretien, les queues de recrutement, la vitesse locale du combat ou les règles de trêve. Ces paramètres doivent être résolus par recherche ou par décision de profil de laboratoire, puis associés aux scénarios de [recette](RECETTE-GHERKIN.md) et aux [US](TRACEABILITE-US.md).
