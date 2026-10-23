# Prochaines étapes — de 300 stories à une première partie

Proposition du 23 octobre 2026. Le périmètre confirmé reste le **PvP classique avec Guerre des Larmes**. Le dépôt contient une base documentaire et un backlog ; aucun jalon jouable n'est encore accepté.

La priorité proposée est de livrer une **boucle locale persistante avec le Havre**, puis de la faire fonctionner entre plusieurs joueurs. Le choix du Havre et le découpage ci-dessous sont des propositions de réalisation, pas des décisions déjà prises par l'utilisateur. Les autres factions et la Guerre des Larmes restent dans l'objectif final.

## 1. Transformer le premier lot en travail prêt à réaliser

Les 300 fiches constituent le périmètre fonctionnel, pas un ordre de développement. Commencer par les pivots suivants, puis leurs dépendances ; une fiche partiellement réalisée ne devient pas « terminée » si certains de ses critères restent hors du prototype.

| Parcours à rendre possible | Fiches pivots |
| --- | --- |
| Entrer dans le monde et retrouver sa cité | US-ACC-003, US-ACC-004, US-ACC-005 |
| Produire et développer la ville | US-ECO-003, US-CIT-004, US-CIT-006 |
| Recruter le héros et préparer son armée | US-HER-003, US-ARM-005, US-ARM-009 |
| Combattre dans la région et exploiter une mine | US-REG-003, US-REG-004, US-COM-002 |
| Comprendre le résultat | US-COM-017, US-RAP-001 |
| Agir depuis la scène de ville et identifier les visuels provisoires | US-UIX-004, US-UIX-006 |

La [sélection calculée](../../data/analysis/first-playable-story-selection.json) comprend **16 pivots et 37 fiches avec leurs dépendances transitives** dans le backlog v0.3. Ce nombre ne constitue ni une estimation, ni un sprint de 37 stories, ni une liste exhaustive des tâches techniques. L'[index](../backlog/INDEX-STORIES.md) donne accès aux fiches complètes.

Pour chaque fiche retenue : résoudre les questions bloquantes, écrire au moins un exemple chiffré accepté, préciser les états avant/après et les refus, vérifier les dépendances, puis estimer avec la personne qui réalisera le travail. Conserver les 3 C : la fiche prépare la conversation, la décision documente son résultat, les critères deviennent la confirmation. Appliquer INVEST en découpant les fiches trop larges par résultat joueur démontrable. La [DoD commune](../backlog/METHODE-ET-QUALITE.md) reste applicable.

## 2. Fixer les règles nécessaires au premier jalon

Il n'est pas nécessaire de résoudre les 46 inconnues avant tout développement. Il faut traiter celles qui déterminent les résultats de la boucle choisie.

| Décision ou preuve | Résultat concret attendu | Effet sur la réalisation |
| --- | --- | --- |
| Profil de référence : saison et catalogues | Profil versionné, sources et écarts nommés ; séparation des règles classiques et variantes tardives | Empêcher un mélange silencieux de saisons |
| État initial | Ressources, héros, armée, bâtiments et région de départ explicités | Reproduire un départ de partie |
| Production, stockage et entretien | Exemple avant/après une absence ; plafonds, arrondis, ordre des changements | Valider la progression hors connexion |
| Construction et recrutement | Coût, prérequis, délai, disponibilité des unités, files, annulation et remboursement | Exécuter une action sans ambiguïté de débit ou de fin |
| Disponibilité du héros et composition militaire | États autorisés, effectifs transférables, limite des pelotons | Interdire deux usages incompatibles du même héros ou des mêmes unités |
| Combat PvE | Cas de référence explicables, puis rapports historiques comparables | Éviter de valider le moteur uniquement avec ses propres résultats |
| Actions simultanées et reprise | Politique déterministe, rejouabilité d'une commande, état après redémarrage | Préparer le monde persistant et le futur multijoueur |

S'appuyer sur U01–U06, U09, U13, U17–U19 et U24 selon les fiches, sans ignorer les autres inconnues de leur dépendance. Les vérifications de combat de L0, notamment US-COM-004, US-COM-010 et US-COM-014, complètent la préparation. Un choix de prototype peut débloquer une inconnue historique à condition d'être marqué **PROP**, assorti d'un exemple, et de rester remplaçable. Il ne devient pas une preuve de fidélité.

Recommandation de travail : employer les tables Jactari épinglées comme référence candidate pour la première boucle, avec un profil explicitement « à qualifier ». Ne pas annoncer une reproduction exacte d'une saison tant que les différences n'ont pas été arbitrées.

## 3. Construire une démonstration fonctionnelle et persistante

La démonstration attendue est une séquence continue :

1. Créer un royaume de test et retrouver une ville, une région et un héros cohérents avec le profil.
2. Naviguer entre ville, région et monde sans perdre la sélection ni modifier les ressources.
3. Lancer une construction ; voir le coût, le délai et les motifs de refus éventuels.
4. Recruter des unités et former une armée disponible.
5. Engager le héros contre un groupe neutre et consulter le rapport avec les pertes et gains expliqués.
6. Libérer puis exploiter une mine ; constater le changement de production.
7. Fermer le navigateur, avancer le temps de test et revenir : stocks, actions achevées, armée et rapports restent cohérents.

Première sous-tranche possible : un héros, des unités T1–T3 et un combat sans magie pour valider le parcours. L'extension T1–T7, les améliorations et les sorts suit avant de revendiquer la couverture militaire complète. Cette réduction provisoire ne clôture pas les stories couvrant davantage de cas.

Le serveur conserve l'état de référence et tranche les actions ; le navigateur présente l'état et anime les vues. Séparer règles, catalogues, sauvegarde et présentation permet de remplacer un décor sans changer les calculs. Le code historique récupéré sert à analyser les comportements observables ; il n'est pas branché comme client de production.

Pour la ville, utiliser les scènes retrouvées comme références de présentation. Pour afficher une ville débutante, les bâtiments absents doivent être distingués des bâtiments présents : une scène entièrement construite ne peut pas faire croire que tous ses bâtiments sont disponibles. Tant que les calques manquent, une représentation provisoire explicitement identifiée et une liste de bâtiments fidèle à l'état réel suffisent à accepter la mécanique.

### Conditions de passage

- La séquence ci-dessus est réalisable dans le navigateur, avec sauvegarde et reconnexion.
- Les résultats économiques et de combat sont comparés à des exemples documentés ; les divergences historiques sont visibles.
- Une commande répétée ne débite ni ne récompense deux fois ; un stock insuffisant laisse l'état inchangé.
- Un arrêt puis redémarrage du serveur ne perd pas une construction ou un combat arrivé à échéance.
- Les critères des stories réellement annoncées « terminées » et leur DoD sont satisfaits ; les sous-tranches restent clairement identifiées.

Une maquette des trois vues, même fidèle visuellement, ne suffit pas à passer ce jalon.

## 4. Élargir par preuves de jeu

| Jalon suivant | Contenu à ajouter | Démonstration de sortie |
| --- | --- | --- |
| Deux royaumes dans un monde | Déplacements, visibilité, colonisation, échanges et reconnaissance | Deux joueurs voient et modifient le même monde avec les bonnes informations et des arrivées cohérentes |
| Guerre d'alliance | Rôles, diplomatie, pillage, renforts, sièges et captures | Une opération coordonnée va de sa préparation à ses pertes et changements de propriétaire |
| Campagne Guerre des Larmes | Trois voies d'obtention, transport et contestation, monuments, condition de victoire | Un monde de test accéléré atteint une victoire ; perte d'un objectif et changement de phase sont correctement traités |
| Clôture et progression intersaisons | Classements finaux, fermeture, récompenses et hérédité selon le profil qualifié | Le résultat est figé et attribué une seule fois ; une nouvelle campagne respecte les règles retenues |
| Qualification complète | Autres factions, cas limites, équilibrage, charge et ergonomie | Les parcours de référence passent et les écarts à MMHK sont connus |

Ces jalons suivent les tranches L2–L5 de la [story map](../backlog/STORY-MAP.md). Utiliser les [12 parcours intégrés](../backlog/RECETTE-PARCOURS.md) pour les démonstrations. Le monde accéléré change une horloge de test commune ; il ne court-circuite pas les règles à valider.

## 5. Poursuivre les assets sans bloquer le moteur

La [recherche du 23 octobre](../research/RECHERCHE-ASSETS-2026-10-23.md) apporte 29 images, le client archivé et les placements de bâtiments. Les actions graphiques prioritaires deviennent précises :

1. Comparer le Havre retrouvé aux captures existantes et vérifier l'échelle 680 × 552.
2. Vérifier la taverne récupérée avec le placement original et le décor de référence.
3. Retrouver le fond vide et les GIF manquants à partir de la liste de chemins, puis compléter les autres factions.
4. Qualifier les petites planches de bâtiments et relier chaque rectangle au bon identifiant fonctionnel.
5. Tenir séparées les références historiques, les visuels provisoires et les futurs assets du nouvel univers.

Le premier ticket concret proposé est donc : **préparer et réaliser le parcours « créer ma cité → produire → construire → recruter → libérer une mine → revenir après déconnexion », sur une seule faction**. L'affinage des 16 pivots donne le contenu exact et l'estimation ; aucun calendrier fiable ne peut être déduit du seul nombre de stories.
