# Plan de reconstruction et critères de passage

## État livré

Le dépôt contient une première rétroconception large, un corpus de données de 2013 épinglé, des contrats fonctionnels et une recette. Les règles documentées couvrent l’ensemble des grandes boucles demandées. Les valeurs du serveur d’origine, toutes les variantes saisonnières et tous les écrans ne sont pas certifiés. Aucun serveur de jeu ni client jouable n’a encore été implémenté dans cette étape.

## Séquence de travail proposée

| Étape | Livrable concret | Condition de passage |
| --- | --- | --- |
| 1. Verrouiller la référence | Fiche de monde : saison, pays, mode, trêve, services et catalogues | U01/U02 résolues ou réglages de test explicitement acceptés |
| 2. Constituer les preuves de combat | Rapports historiques structurés, comparaison avec Jactari | Cas simples puis magie/pertes/égalités expliqués sans écart silencieux |
| 3. Construire le noyau de calcul | Référentiels normalisés, simulateur déterministe sans interface riche | Cas de recette et rapports réels reproduits ; anomalies isolées par version |
| 4. Construire la boucle locale | Ville, région, mines, bâtiments, héros, recrutement, PvE et trois vues minimales | Partie locale complète avec progression hors connexion et ressources cohérentes |
| 5. Ajouter le monde partagé | Colonisation, influence, déplacements, trêve, commerce et reconnaissance | Deux royaumes interagissent, reprises serveur et conflits d’ordres validés |
| 6. Ajouter la guerre d’alliance | Rôles, diplomatie, pillage, siège, captures et rapports partagés | Scénarios multi-joueurs sans duplication ni fuite d’information |
| 7. Fermer une campagne complète | Trois voies, monuments, victoire classique et résultat | Un monde de test accéléré atteint sa fin et attribue une seule hérédité |
| 8. Restaurer les variantes choisies | Arkath, tournoi S4, événements et hérédité avancée | Chaque profil possède sa propre recette et ne contamine pas le classique |
| 9. Créer le successeur | Univers, assets et écarts de design décidés | Matrice des changements et validation d’équilibrage séparées de la fidélité |

L’accélération du temps de test doit être un réglage du monde, pas une modification ponctuelle de constantes disséminées. Elle sert à parcourir une campagne entière, avec conservation des rapports, sans attendre plusieurs mois.

## Périmètre de la première version jouable proposée

Une cité par joueur au départ, région libérable, économie fonctionnelle, héros, armées T1–T7 et leurs améliorations, combat automatique explicable, carte partagée, alliance, déplacement et interaction militaire minimale. L’objectif de ce premier jalon est de valider la boucle, pas de prétendre déjà reproduire toute une saison. Les plafonds de population et le nombre de factions activées pour un premier test sont des paramètres de développement à décider, sans supprimer les référentiels des autres factions.

La version qualifiée de « campagne classique reconstruite » devra ensuite inclure colonisation, sièges, commerce, diplomatie, Guerre des Larmes et clôture. Une démonstration locale de combat ou une maquette des trois vues ne satisferait pas seule l’objectif de jeu multijoueur persistant.

## Recherche complémentaire la plus rentable

1. Rapports de combat personnels ou d’alliance avec héros, ordre des pelotons, sorts et pertes avant/après.
2. Calculateurs TotG d’entretien et de siège, annoncés dans les archives mais non récupérés lors de cette recherche.
3. Captures des files de construction/recrutement et formulaires de colonisation.
4. Journal de fin de monde classique montrant obtention, perte et maintien des monuments.
5. Vidéos ou captures datées des trois vues pour documenter commandes et informations réellement visibles.

Ces travaux peuvent compléter ce dépôt progressivement. Ils ne nécessitent pas de refaire l’extraction du corpus déjà épinglé.

## Journal de décisions à tenir

Chaque décision reçoit identifiant, date, problème, options, preuve, choix, version affectée, impact sur fidélité et recette. Exemples de décisions encore ouvertes : saison cible ; politique d’entretien du successeur ; trêve ; règles commerciales ; correction ou compatibilité des anomalies Jactari ; ordre des événements simultanés ; modèle économique ; univers de remplacement.

## Critères de qualité

Une règle est « documentée » si source et version sont identifiées ; « implémentée » si le comportement existe ; « vérifiée » si un cas concret en confirme l’issue ; « fidèle » si une preuve historique adaptée confirme aussi ce comportement. Ces quatre états ne sont pas synonymes.

Le suivi doit mesurer les mécanismes couverts, les incertitudes P0 restantes, les rapports historiques reproduits et les scénarios de campagne terminés. Le nombre de lignes de code ou le nombre d’images réutilisées ne constitue pas une mesure de fidélité.
