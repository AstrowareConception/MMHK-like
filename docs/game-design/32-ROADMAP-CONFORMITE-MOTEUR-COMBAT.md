# MMHK-like — Roadmap de conformité historique du moteur de combat

**Document vivant · version 1.0 · 26 octobre 2026**  
**Référence de suivi structurée :** [`data/analysis/jactari-combat-conformance-roadmap.json`](../../data/analysis/jactari-combat-conformance-roadmap.json)  
**Périmètre :** combat, héros, attributs, armes, magie, talents, équipement, pertes, conséquences, économie et arbitrage serveur.

## 1. Définition vérifiable de « 100 % conforme »

La conformité doit être prouvée sur **deux axes indépendants** :

- **Jactari historique 4.1.3-MTR (4 mars 2013)** : comparer chaque sous-fonction et chaque séquence de la version communautaire archivée, y compris les branchements, les arrondis, les erreurs, les cas nuls et les bugs. Sources `data/Jactari/src/scripts/combat.min.js` et `donnees.*.min.js`.
- **MMHK saison 2** : établir au moyen d'archives/règles/captures/rapports **indépendants** que le comportement de Jactari est fidèle aux règles serveur Ubisoft de la saison visée. Sans ces preuves, même un clone parfait de Jactari ne peut être déclaré « 100 % MMHK S2 ».

Troisième axe indispensable à la mise en production : **arbitrage serveur** idempotent et transactionnel, sécurité et compatibilité de redistribution GPL-3.0-or-later. Les trois axes constituent des **portes de sortie cumulatives**. Un pourcentage d'avancement purement fondé sur le nombre de tests donnerait une fausse précision.

La règle de décision est stricte : une exigence n'est `certified` que si **toutes ses branches pertinentes**, ses cas frontières et ses interactions sont comparés à une référence indépendante, **sans écart inexpliqué**, avec des fixtures reproductibles et une revue S2. La réussite d'un test unitaire ou de 10 000 cas aléatoires ne remplace pas la couverture exhaustive des branches et des sources.

## 2. État actuel — photographié au 26 octobre 2026

| Indicateur | État |
| --- | --- |
| Noyau de combat | V6.0 unifiée ; V6.1–V6.2 confrontées à des exécutions historiques |
| Héros, talents, bonus et fortifications | V6.3 ; 600 profils de bonus et 83 combats complets avec héros |
| Admission PvE/PvP | V6.3 ; 4 000 calculs contre les branches originales |
| Puissance magique, artefacts | V6.3–V6.4 ; 400 calculs de magie, 280 affinités d'artefacts, 120 sorts avec équipement |
| Résolution dynamique au tour | **V6.5 en cours** : ordres de sorts par ID, puissance calculée avec héros/arme/inventaire courants, tests d'intégration |
| Dernière CI de base vérifiée | **381/381 tests Node passés**, [run GitHub Actions #40400427668](https://github.com/AstrowareConception/MMHK-like/actions/runs/40400427668), tests de carrières et contrôles du registre compris |
| Certification historique Jactari complète | **Non acquise** |
| Équivalence MMHK saison 2 | **Non acquise ; sources spécifiques incomplètes** |
| Arbitre PvP autorisé en production | **Non** |

### Lecture des statuts

- **Différentiel borné** : source Jactari originale exécutée contre notre port sur des cas définis, sans assertion de couverture universelle.
- **Intégré et testé** : code branché à l'orchestrateur et tests verts, mais validation historique de la chaîne complète inachevée.
- **Implémentation partielle** : branche ou calcul accessible, sans preuve indépendante suffisante ou sans raccordement complet.
- **Non livré** : branche métier pas encore implémentée/testée.
- **Bloqué par les sources** : aucune équivalence S2 ne pourra être annoncée tant que les archives nécessaires manquent.

**Répartition des 19 familles de règles** : 8 en différentiel borné, 1 intégrée et testée, 6 partiellement implémentées, 3 non livrées, 1 bloquée par les sources S2. **0 famille entièrement certifiée.** Ce bilan n'est pas un score de fidélité ; il permet d'identifier la nature des preuves manquantes.

## 3. Registre exhaustif et traçable des 19 chantiers

| ID | Domaine | État | Étape prioritaire |
| --- | --- | --- | --- |
| C01 | Arithmétique des duels | Différentiel borné | Branches extrêmes, arrondis et paramètres de saison |
| C02 | Tours, positions et invocations | Différentiel borné | Interruptions, 3e invocation, interactions inhabituelles |
| C03 | **Construction des caractéristiques d'un héros** | **Partiel — V6.6 en cours** | Arbres de carrières, prérequis légendaires, restrictions, variantes héréditaires et attestations S2 |
| C04 | Modificateurs militaires des héros | Différentiel borné | Héros absents, anomalies d'origine, interactions des objets |
| C05 | Artefacts, équipement et ensembles | Partiel | Effets non magiques, bonus de set, contraintes d'équipement |
| C06 | Calcul de puissance magique | Différentiel borné | Toutes variantes de maîtrise, résistance et synergies |
| C07 | **Puissance magique recalculée au tour** | **Intégré/testé — V6.5** | End-to-end historique depuis fiche réelle de héros |
| C08 | Choix/autorisation des sorts | Partiel | École, cercle, niveau, coûts et règles serveur |
| C09 | Invocations, buffs, résurrections | Différentiel borné | Combinaisons limites, morts en plein tour |
| C10 | Armes, moral, pièges, fortifications | Différentiel borné | Calcul d'origine du moral, sites, siège et bâtiments |
| C11 | Admission PvE/PvP | Différentiel borné | Persistance des conséquences et données S2 |
| C12 | Barrage, salves, engins | Partiel | Exécution historique de chaque tir préliminaire |
| C13 | **Sièges, haltes, bombardement** | **Non livré** | Oracles isolés puis assemblage |
| C14 | **PNJ, héros absents et cas exceptionnels** | **Non livré** | Fixtures adversariales, états limites |
| C15 | Pertes définitives, relève et persistance | Différentiel borné | Politiques PNJ, pénalités, coefficients S2 |
| C16 | Butin, XP, honneur, économie | Partiel | Bilan complet et évolution du héros |
| C17 | **Serveur transactionnel de combat** | **Partiel — missions géolocalisées et protection configurable** | Planificateur de trajets S2, sous-armées, interceptions, diplomatie/auth réelle, fuite, captures et blessures |
| C18 | **Preuve indépendante MMHK saison 2** | **Bloqué sources** | Reconstituer vrais paramètres/règles saisonnières |
| C19 | **Sécurité, charge et conformité GPL** | **Non livré** | Validation architecture et redistribution |

Les **états et liens de preuve par exigence** sont conservés dans le [registre JSON](../../data/analysis/jactari-combat-conformance-roadmap.json), contrôlé par la CI. Les familles C01–C19 sont des **lots de qualification**, pas une unité mathématique de « pourcentage de conformité ».

## 4. Roadmap séquentielle — V6.5 à V7.0

| Livraison | Objectif métier et technique | Critères de sortie vérifiables | État |
| --- | --- | --- | --- |
| **V6.5** | Sorts ID-only résolus au tour en fonction des héros, unités et artefacts | API compatible V6.0 ; refus de puissance et équipement forgés ; parité historique de bout en bout sur cas mixtes | **En cours** |
| **V6.6** | Dérivation des caractéristiques réelles des héros | Fiches de héros + talents + états de combat depuis tables historiques (tranche 1 livrée) ; finir légalité des carrières, restrictions, variantes et diff complet | **En cours** |
| **V6.7** | Équipement et interactions de talents complets | Tous slots/ensembles/statistiques non magiques ; restrictions ; ordre des modificateurs ; diff complet | À faire |
| **V6.8** | Tirs préalables, engins et sièges | Fuite/haltes, barrage, balistes, fortifications, bombardements ; ordre historique des phases et des morts | À faire |
| **V6.9** | Scénarios exceptionnels et PvE | Héros absents/PNJ, sorts interrompant un tour, troisième invocation, zéro unité, égalités ; aucune sortie fictive | À faire |
| **V6.10** | Bilan de bataille et progression | Effectifs persistants, perte économique, récupérations, butin, classement, honneur et XP conformes aux oracles | À faire |
| **V6.11** | Réconciliation Jactari / MMHK saison 2 | Sources authentiques S2, tableau des différences, politiques explicites, reproductibilité des rapports | Bloqué par sources |
| **V7.0** | Arbitre de combat intégré au serveur | Trois tranches : combats admis atomiques, missions persistantes puis carte SQLite, distances historiques et protection de première ville configurable ; restent ETA serveur, interventions et règles S2 | **En cours — tranches 1–3 validées** |

### V6.5 : raccordement réalisé, preuves encore à obtenir

Le module [`hero-spell-resolution.mjs`](../../tools/jactari-port/hero-spell-resolution.mjs) accepte des ordres `{id: spellId}` issus d'un **catalogue fiable**, puis résout au moment du tour la puissance par `calculateEffectiveSpellPower()`. La fonction `simulateUnifiedBattle()` conserve les appels historiques acceptant `power` et `powerByWeapon`, et n'utilise le nouveau chemin que lorsque `spellContext` est fourni. Les sorts de zone calculent une puissance distincte **pour chaque arme de cible**. L'état du héros utilisé est celui du moment du lancement.

Tests [`hero-spell-resolution.test.mjs`](../../tools/jactari-port/hero-spell-resolution.test.mjs) : magie attaquant et défenseur, magie de zone, invocation avant une nouvelle salve, puissance d'un héros équipé vérifiée par le code original, refus de faux IDs/puissances injectées, immuabilité des entrées et absence de caractéristique magique obligatoire. La **suite Node complète est verte**.

**Dette critique :** le serveur de jeu final ne construit pas encore ces fiches de héros et ces catalogues à partir d'objets persistés. Le `spellContext` doit donc provenir d'un composant de confiance ; ce n'est **pas** un nouveau champ que le joueur peut fixer librement depuis le navigateur.

### V7.0 : tranche 3 — carte, distances historiques et protection de première ville

Le [rapport V7.0 — tranche 3](42-JACTARI-V70-MONDE-DEPLACEMENTS-PROTECTION.md) relie les missions SQLite à des **mondes, villes et positions de héros persistés**. La distance calculée sur carte carrée raccordée est confrontée **500 fois au vrai `MMHKPLUS.distance()` de 2013** ; les deux scripts communautaires ont été archivés avec leurs empreintes Git d'origine. Les estimations de l'interface (distance / 12, / 4, / 9,375) restent marquées non autoritatives et **ne calculent pas les heures réelles d'arrivée**.

Le serveur stocke une **route immuable de mission** (ville de départ, destination, coordonnées, monde, distance), puis refuse la cible déplacée, les attaques entre mondes, le combat avant l'arrivée et le combat direct hors mission pour les héros géolocalisés. La première ville du joueur dispose d'une **expiration de protection fournie explicitement par le serveur**, contrôlée à l'intérieur de la transaction. Le calcul « sept jours » est une **politique candidate issue des souvenirs de jeu**, non une règle officielle Ubisoft S2 certifiée. Aucune hypothèse de durée ou de bonus de trajet n'est injectée silencieusement.

**Tests : 381/381 réussis**, avec persistance géographique entre deux connexions et après redémarrage SQLite. **C17 reste `implemented_partial`, V7.0 `in_progress`, porte de production `false`.** La suite nécessite un planificateur de route, les haltes/trêves et un véritable contrôle territorial.

### V7.0 : tranche 2 — missions persistantes et retour des survivants

La [tranche 2 V7.0](41-JACTARI-V70-MISSIONS-MILITAIRES-PERSISTANTES.md) livre des missions SQLite `traveling → arrived → returning → completed` avec annulation administrative `cancelled`. Le héros attaquant est **réservé exclusivement** pendant tout le trajet et le retour. Les opérations d'arrivée et de retour nécessitent des **horaires fournis par le serveur**, les droits de cible sont réévalués à l'arrivée et le combat ne peut être appliqué que sur une mission `arrived`.

Le **reçu du combat, les pertes définitives des deux armées, la transition vers `returning` et l'événement de mission `battle_committed`** appartiennent à la même transaction SQLite. Les étapes successives sont consignées dans `military_mission_events`, avec séquence stable et sans doubles événements après retry. Les tests vérifient la reprise après redémarrage et via deux connexions, les arrivées trop tôt, les permissions révoquées, les doubles départs, le rollback et les interceptions non couvertes. **367/367 tests Node réussis** à la dernière CI code vérifiée.

**Distinction essentielle :** réservation intégrale du héros, horaires et contrôles de mission sont **des choix techniques de fiabilisation**, pas une transcription attestée des déplacements MMHK saison 2. Sous-détachements, vraies durées, interceptions, blessures/captures et retour d'unités sur la carte restent ouverts. C17 reste `implemented_partial`, V7.0 en cours, et l'arbitre PvP public reste désactivé.

### V7.0 : tranche 1 — première exécution transactionnelle d'un combat admis

Le [rapport V7.0 tranche 1](40-JACTARI-V70-TRANSACTIONS-COMBAT-IDEMPOTENCE.md) décrit la commande `commitServerAuthorizedJactariBattle()` : **trois champs clients uniquement** (`commandId`, attaquant, défenseur) ; principal vérifié et autorisation de la cible depuis le serveur ; calcul et écritures synchrones dans une même transaction SQLite `BEGIN IMMEDIATE` ; pertes définitives validées peloton par peloton et **débit unique des deux armées**. L'ordre, les paramètres des règles versionnées, le reçu et chaque événement sont persistés avec une clé d'idempotence. Le même ordre est **rejouable sans nouveau débit** après redémarrage ou depuis un deuxième accès SQLite.

La transaction **annule toute écriture** si le combat échoue, si une perte ne concorde pas avec le rapport ou si le moteur refuse le scénario ; une panne injectée après les écritures mais avant `COMMIT` laisse les deux armées et le journal inchangés. Les **captures, blessures et fuites avant combat restent refusées sans écriture** : leurs transitions historiques serveur ne sont pas démontrées. La réservation d'armées en déplacement, la diplomatie, les sessions réseau, la progression et le butin restent hors périmètre.

**Suite Node : 356/356 tests réussis.** **C17 reste partiellement implémenté ; V7.0 passe en cours ; `productionBattleArbiterAllowed` reste `false`.**

### V6.6 : tranche 7 — persistance SQLite des héros et simulation autorisée

Le [rapport V6.6 tranche 7](39-JACTARI-V66-PERSISTANCE-HEROS-AUTORISATIONS.md) inaugure la frontière de confiance serveur. [`trusted-hero-store.mjs`](../../tools/jactari-port/trusted-hero-store.mjs) conserve dans SQLite les profils originaux, armées, carrières, ordres de sorts et droits légendaires, avec propriété, révision optimiste et transactions de lecture cohérentes. [`server-authorized-battle.mjs`](../../tools/jactari-port/server-authorized-battle.mjs) n'accepte d'une demande utilisateur que **les identifiants de deux héros** ; il exige un acteur authentifié, propriétaire de l'attaquant, une autorisation explicite de la cible et des règles injectées côté serveur. **Aucune donnée militaire calculée n'est fournie par le client.**

Le chemin historique autorise seulement une **prévisualisation en lecture seule**. Le moteur ne sait toujours pas engager des armées, appliquer des pertes, capturer un héros ou rendre une commande idempotente dans une transaction. Les hooks de sécurité sont injectés par les tests : **il n'existe pas encore de vraie couche HTTP ou d'identité serveur**. Les accès par carrière légendaire ordinaire sont refusés pour éviter un contournement des droits.

**CI : 343/343 tests réussis** sur la dernière tranche code vérifiée. **C17 passe à `implemented_partial` pour ses fondations, mais V7.0 reste `open`, C03 reste partiel et `productionBattleArbiterAllowed=false`**.

### V6.6 : tranche 6 — pont authentique du client MMHK vers les héros Jactari

Le [rapport de provenance](38-JACTARI-V66-PROVENANCE-CLIENT-ET-SAISONS.md) complète les oracles communautaires par le module d'intégration **MMHK-Plus de 2013**, conservé avec son empreinte Git d'origine. Ses **24 correspondances de compétences légendaires** et **9 correspondances d'hérédité** permettent désormais d'interpréter les champs réels `heroSkillList` et `playerHeredityAbilityList`, avec **96 exécutions du `prepare_talent()` original**. Les projections renvoient `authoritative:false` : aucune donnée reçue d'un client ne devient une autorisation serveur sans authentification.

Une **restriction de portée S2 majeure** a été découverte : ce pont modifie explicitement `donnees.saison` pour fixer la valeur `3` lorsque le jeu renvoie une saison inférieure à 3. Les six versions Git retrouvées de `donnees.general.min.js` restent aussi dépourvues de tables `_15/_30`. **L'équivalence à MMHK saison 2 n'est donc pas déduite de cet outil.**

**Tranche 6 : 335/335 tests Node réussis sur la dernière CI code vérifiée ; C03 toujours partiel, C18 toujours bloqué sources, V6.6 en cours.** La recherche suivante doit isoler de véritables paramètres/règles S2 et créer un dépôt serveur de héros avec droits authentifiés.

### V6.6 : tranche 5 — hérédités avancées et combinaisons légendaires

Le [rapport V6.6 tranche 5](37-JACTARI-V66-HEREDITE-AVANCEE-ET-LEGENDAIRES-CUMULES.md) documente une **lacune de provenance démontrée** : `combat.min.js` fait référence à `revelation_de_caracteristiques_15` et `_30`, mais les tables de compétences archivées ne définissent pas ces entrées. Le port refuse désormais leur utilisation au lieu de renvoyer un résultat inventé. Les **hérédités documentées** sont contrôlées sur **120 profils de seuil**, plus **90 cas d'activation simultanée** pour respecter le `if/else if` de Jactari.

**120 fiches cumulant plusieurs légendaires** et **48 nouvelles batailles avec plusieurs bonus légendaires bilatéraux** sont comparées à l'original. Leur calcul est fidèle sur les cas essayés, mais la possibilité réelle d'accumuler ces rangs dans MMHK S2 n'est toujours pas attestée. **CI : 326/326 tests Node réussis** sur le périmètre livré.

**Statuts inchangés : C03 partiel, C04/C06 en différentiel borné, V6.6 en cours, production PvP interdite.**

### V6.6 : tranche 4 — classes légendaires et modificateurs de combat

Le [rapport V6.6 tranche 4](36-JACTARI-V66-CLASSES-LEGENDAIRES.md) isole **8 classes légendaires et 24 talents**, aux rangs 1–3, directement depuis les données Jactari. **144 préparations de héros** et **48 rencontres complètes** ont été comparées avec le code original, ainsi que quatre familles de bonus magiques. L'intégration impose un **registre de droits légendaires** issu de l'état serveur et refuse désormais le contournement par `heroTalents`.

**C03 reste partiellement implémenté**, car l'interface du calculateur ne prouve pas les conditions véritables d'obtention des classes/rangs dans le jeu Ubisoft MMHK saison 2 ; les contraintes historiques de débloquage et de cumul, les héroïsmes hérités alternatifs et la persistance doivent encore être démontrés. **V6.6 reste en cours.** Une différence est maintenue entre sélection libre dans Jactari et attribution réelle autorisée par un serveur.

### V6.6 : tranche 3 — remplacement et abandon de carrières

La [tranche 3](35-JACTARI-V66-CYCLE-VIE-CARRIERES.md) introduit `transitionJactariCareer()` et compare ses résultats aux **fonctions originales non modifiées** `change_carriere()` et `desactive_carriere()`, exécutées avec des sélecteurs jQuery simulés. Elle couvre **60 scénarios d'ajout, remplacement et abandon**, les remboursements des rangs de talents, les rangs partagés Scribe/Arcanes et le remplacement d'une carrière par elle-même. Les bornes `change_respec()` et `change_tenancier()` sont également vérifiées directement contre la source. L'ensemble atteint **313 tests CI verts** sur la branche principale.

**C03 demeure `implemented_partial`, V6.6 demeure `in_progress`** : séquences transitoires ambiguës, carrières légendaires, hérédités avancées, persistance sécurisée et preuve MMHK S2 ne sont pas certifiées. Les projections produites sont des propositions d'état, pas des mutations automatiques en base.

### V6.6 : tranche 2 — carrières et apprentissage vérifiés sur périmètre borné

La [tranche 2 documentée](34-JACTARI-V66-PROGRESSION-CARRIERES-TALENTS.md) porte l'accès aux carrières selon faction/archétype, le point dépensé par carrière, les coûts cumulatifs de talent `[0,1,3,6]`, la mutualisation de Scribe/Arcanes et les changements de rang avec remboursement. Elle dispose d'un **oracle historique indépendant** : matrice complète des droits de carrière, **170 achats et 120 promotions/réductions de rang** confrontés à `validite_carriere()` et `change_talent()`. Le pont des héros valide désormais les budgets avant d'utiliser les bonus militaires en combat.

**Statut : C03 = `implemented_partial`, V6.6 = `in_progress`.** La suppression/remplacement des carrières, les règles d'arbre et de prérequis légendaires, l'hérédité alternative et le contrôle de propriété serveur restent ouverts. Le mode « 100 % conforme » demeure désactivé.

### V6.6 : tranche 1 validée, qualifications restantes

La [tranche 1 V6.6](33-JACTARI-V66-FICHES-HEROS-ET-COMBAT.md) livre désormais les fonctions de construction de la fiche d'éditeur, des bonus de talents et de la fiche de combat, toutes comparées à des **fragments originaux indépendants**. Les essais couvrent **310 fiches**, **150 sélections de talents**, **200 préparations de héros pour le combat** et **6 contrôles de raccordement** à l'orchestrateur. La CI de référence comprend **296 tests Node réussis**. Le statut reste *implémentation partielle* car les prérequis de carrière et les règles de progression et d'équipement ne sont pas encore entièrement vérifiés.

Les données originales `donnees.heros.min.js`, `donnees.artefacts.min.js`, `donnees.sorts.min.js` et `donnees.general.min.js` existent déjà dans le dépôt.

Compléter un **agrégat `HeroCombatSnapshot`** reconstruit depuis un héros côté serveur : identité, faction, niveau, archétype, statistiques brutes/modifiées, carrières, talents, légendaires, hérédité, huit slots d'artefacts, sorts autorisés et droits de lancer. Distinguer explicitement les **données persistées validées** des **modificateurs calculés**. Ne jamais recevoir `attaque_modifiee`, `defense_modifiee`, `magie` ou des bonus de combat comme une vérité envoyée par le client.

Pour chacune des familles de statistiques, extraire le code original qui la construit, écrire un exécuteur différentiel autonome, confronter quelques héros complets puis un corpus déterministe, et enfin intégrer le snapshot au moteur unifié. La V6.6 n'est « terminée » que lorsque le même héros produit la **même fiche de combat**, le **même ordre des bonus** et la **même puissance magique** que Jactari sur toutes les branches couvertes.

## 5. Séparation des trois modes de fidélité

| Politique | Usage | Garantie |
| --- | --- | --- |
| `jactari-original` | Rejouer **littéralement** le calculateur communautaire, y compris anomalies | Référence de tests, non certification S2 |
| `normalized` | Corriger explicitement une anomalie attestée (ex. `bonus_legendary_legwarrior_b`) | Variante de projet, **non historique** sans autre preuve |
| `mmhk-s2-verified` (future) | Exécuter des règles saison 2 validées indépendamment | **Non activée**, aucun fallback automatique |

Un échec sur un cas non couvert **bloque** la validation. Ni une correction en silence, ni un coefficient fictif, ni une estimation au jugé ne doit alimenter un compte rendu présenté comme historique.

## 6. Gouvernance des tests et de la couverture

Chaque ticket de règle doit comporter : **ID Cxx**, sources exactes (fichier, fonction, version, saison), exemple d'entrée/sortie, résultat de l'exécution historique, résultat du port, cas limites, statut de divergence, URL de CI, décision (original/normalisé/S2) et impact sur les armées persistantes.

La CI doit vérifier le registre d'exigences et les chemins de preuve, exécuter tous les tests Jactari et **refuser l'étiquette certifiée** lorsqu'une preuve manque. Les essais génératifs doivent être déterministes (graine archivée et fixture disponible en cas d'écart). Il faut ajouter progressivement de la **couverture de branches** et pas seulement augmenter le nombre d'itérations.

Un **tableau de bord de conformité** devra afficher séparément :

| Axe | Indicateur honnête |
| --- | --- |
| Implémentation | Statut livré / partiel / absent |
| Fidélité Jactari | Fonctions et branches couvertes + scénarios différentiels, écarts ouverts |
| Fidélité S2 | Exigences ayant une preuve indépendante propres à la saison |
| Exploitabilité serveur | Transactions, sécurité, charge, licence, règles de déploiement |

### Barrière finale de production

Le passage à « **100 % conforme** » nécessite simultanément : 0 exigence sans preuve, 0 divergence inexpliquée, toutes les branches métier pertinentes couvertes, une référence **MMHK S2 indépendante**, aucune perte ou blessure appliquée deux fois, et une revue de licence et de sécurité satisfaisante.

**Décision actuelle : moteur expérimental, usage comme arbitre PvP de production toujours interdit.**

## V7.0 — Tranches 3 à 6 : géographie, haltes et territoires (26 octobre 2026)

Le [rapport des positions et engagements](42-JACTARI-V70-MONDE-DEPLACEMENTS-PROTECTION.md)
décrit les mondes et villes persistés, la géométrie torique vérifiée contre le
calculateur MMHK-Plus, les routes immuables des missions et une protection
débutant provisoire. Les [itinéraires expérimentaux](43-JACTARI-V70-ITINERAIRES-PROVISOIRES.md)
puis les [haltes et trêves](44-JACTARI-V70-HALTES-TERRITOIRES-TREVE.md)
font évoluer les ETA **non autoritatifs**, sans prétendre reconstituer le
serveur Ubisoft saison 2.

La [tranche 6](45-JACTARI-V70-TERRITOIRES-DIPLOMATIE.md) ajoute dans SQLite
des revendications de cases, alliances/membres/relations, une révision de monde
et la lecture cohérente d'un instantané. Un tracé centre-à-centre sur carte
raccordée qualifie les segments `friendly/allied/neutral/hostile/targetAlliance`,
refuse une diplomatie inconnue, puis les transmet au moteur de haltes.
Les aperçus sont identifiés par un instantané et deviennent obsolètes après
modification des revendications ou relations. Aucun résultat ne constitue
un `trustedSchedule` et aucun plan n'est appliqué à une mission active.

**Etat : V7.0 = `in_progress`, C17 = `implemented_partial`,
C18 = `blocked_source`, `productionBattleArbiterAllowed=false`.**
Les rayons de contrôle territoriaux réels, changements d'alliance en marche,
interceptions, ordonnancement retour et heure nocturne historique S2
restent à déterminer par sources indépendantes.

### V7.0 — Tranche 7 : photographie de départ et traitement des échéances (27 octobre 2026)

La [tranche 7](46-JACTARI-V70-ROUTES-FIGEES-ECHEANCES.md) enregistre
atomiquement une photographie territoriale du départ d'une mission géolocalisée.
Le rapprochement entre cette photographie et les versions courantes du monde
permet de **détecter**, sans décider automatiquement, les retournements
d'alliance et changements de propriété pendant le trajet. Un lecteur rejoue
les portions aller et leur inverse sans calculer d'ETA historique de retour.

Les événements `arrival` et `return_completion` sont maintenant planifiés
dans SQLite ; des workers peuvent les réclamer avec des baux expirables,
une attribution unique au moment de la réclamation et un ordre déterministe
pour les échéances identiques. Le mécanisme est **au moins une fois** et
les transitions existantes conservent l'idempotence. Aucun worker automatique,
aucun `trustedSchedule` construit par la géométrie, aucun arbitrage PvP
public n'est autorisé.

**Conformité inchangée :** V7.0 `in_progress`, C17
`implemented_partial`, C18 `blocked_source`,
`productionBattleArbiterAllowed=false`.

### V7.0 — Tranche 9 : fencing et incidents des workers (27 octobre 2026)

La [tranche 9](48-JACTARI-V70-FENCING-INCIDENTS-ARRIVEES.md)
sécurise les transitions exécutées par l'ordonnanceur : chaque
arrivée/retour doit présenter dans sa transaction SQLite l'identifiant
du worker, le numéro de tentative actuellement réservé et un bail non expiré.
Les incidents sont enregistrés dans une nouvelle table avec des catégories
fermées (sans persistance du texte libre d'exception). Un observateur en
lecture seule repère les arrivées exactement simultanées vers une même ville.

Ces composants n'établissent **ni un arbitrage historique de simultanéité,
ni une autorisation d'attaque**. Les API administratives directes restent des
chemins de confiance à isoler des workers et du navigateur. Un service réseau,
le contrôle d'accès des processus, les contrôles de charge et une politique
de retour/interception saison 2 devront être développés avant production.

**V7.0 `in_progress`, C17 `implemented_partial`,
C18 `blocked_source`, `productionBattleArbiterAllowed=false`.**

### V7.0 — Tranche 10 : arrivée concurrente et demandes de rappel (27 octobre 2026)

La [tranche 10](49-JACTARI-V70-ARRIVEES-CONCURRENTES-RAPPELS.md)
impose dans la transaction d'arrivée la détection des autres missions
géolocalisées vers la **même ville du même monde et au même instant prévu** :
dans ce cas, le serveur refuse les transitions tant qu'aucune politique
d'arbitrage historiquement validée ne les départage. L'ordonnanceur rapporte
`requiresArbitration:true` et journalise l'incident sous `mission_state`.

Les joueurs peuvent formuler une **demande** de rappel authentifiée et
idempotente, conservée en SQLite avec `recall_requested`. Celle-ci ne
modifie **ni l'itinéraire ni le statut militaire** : aucune durée de retour
ou priorité de résolution Ubisoft saison 2 n'est inventée.

**Conformité inchangée :** V7.0 `in_progress`, C17
`implemented_partial`, C18 `blocked_source`,
`productionBattleArbiterAllowed=false`.

## 7. Utilisation pratique

Pour reprendre dans un autre fil, conserver cette consigne : *« Reprends la roadmap `docs/game-design/32-ROADMAP-CONFORMITE-MOTEUR-COMBAT.md` et le registre JSON, vérifie les derniers commits/CI, puis attaque le premier critère de sortie non satisfait sans changer arbitrairement le statut des exigences. Documente les preuves et mets à jour le registre avant de terminer. »*

Cela permettra de progresser par tranches testables, sans perdre la trace des découvertes ni confondre une implémentation fonctionnelle avec une fidélité historiquement démontrée.
