# Profil cible : PvP classique et Guerre des Larmes

**DEC-001 — décision utilisateur confirmée le 22 octobre 2026 :** reconstruire en priorité le PvP classique avec Guerre des Larmes. Ce choix remplace la proposition de périmètre de la version 0.1. L’objectif est une campagne multijoueur persistante, limitée dans le temps, structurée par les alliances, le développement territorial, les affrontements et la victoire collective.

## Décisions et degrés de liberté

| ID | Statut | Décision | Conséquence |
| --- | --- | --- | --- |
| DEC-001 | Confirmée par l’utilisateur | PvP classique, Guerre des Larmes | Mode principal du premier produit complet |
| DEC-002 | Confirmée par l’utilisateur | Forte fidélité visuelle, vues isométriques, interactions et déplacements visuels JavaScript | La fidélité de présentation est un critère de recette |
| DEC-003 | Confirmée par l’utilisateur | Utiliser les ressources historiques disponibles pendant le développement, puis créer un univers distinct | Séparer règles, identifiants et habillage ; conserver le corpus brut |
| DEC-004 | Proposition de travail | Gabarit visuel de la famille v1.5 pour le premier prototype | SS-033/034/047/048/055/056/057 comme références cohérentes ; le client affiché n’identifie pas seul une saison |
| DEC-005 | Non tranchée | Saison/révision exacte des valeurs, trêve et services | Garder les paramètres incertains explicitement non qualifiés |
| DEC-006 | Proposition de travail | Bibliothèque visuelle des cinq factions étudiées | Donjon/Forteresse restent hors sélection jouable ; leur présence dans Jactari ne change pas le périmètre |

La confirmation du mode **ne confirme pas automatiquement chaque chiffre** du dossier. Les treize monuments et quatorze jours restent des valeurs documentées par G01 à recouper avec la référence choisie. La fidélité des tables de 2013 à une saison antérieure reste U02. Aucun réglage commercial observé sur une bêta x200 n’est adopté par défaut.

## Modules du produit classique

| Module | Dans le périmètre | Condition de qualification |
| --- | --- | --- |
| Monde persistant | Ouverture, progression hors connexion, carte partagée, clôture | Temps et profil explicites |
| Développement | Ville, région 5×5, mines, ressources, constructions, droits de cité | Production, files et arrondis retrouvés ou écarts annoncés |
| Armée | Héros, sept pelotons de combat, T1–T7, améliorations, magie, équipements | Tables et calculateur comparés à des rapports |
| Expansion et logistique | Colonisation, transferts, caravanes, déplacements, reconnaissance | Droits, distance, charge et délais versionnés |
| PvP territorial | Pillage, sièges, conquête, défense et renforts | Exceptions de protection et simultanéités définies |
| Alliance | Membres, rôles, coordination, diplomatie, influence et progression collective | Permissions et rangs documentés |
| Guerre des Larmes | Trois voies d’acquisition, monuments, possession/conflit et décompte collectif | Chaînes, pertes, seuil et maintien validés |
| Fin et continuité | Résultat, classements gelés et hérédité du profil | Barème distinct de S4 et transfert contrôlé |
| Interface | Monde détaillé/éloigné, région, ville, royaume, modales et rapports | Comparaison avec les références visuelles contextualisées |

## Séquence de campagne à reconstruire

1. Ouvrir le monde et installer les royaumes : région initiale, premières constructions, héros, ressources et découverte des voisins.
2. Faire progresser économie, armées et voies ; agrandir le royaume ; former les alliances, leur territoire et leur logistique.
3. Développer les conflits PvP et la préparation de fin de monde. Les déplacements, informations et ressources limitent les possibilités militaires.
4. Ouvrir la Guerre des Larmes selon le déclencheur de la règle classique ; réaliser les voies de Domination, Richesse et Honneur ; construire et défendre les monuments.
5. Maintenir la condition de victoire collective, gérer les contestations, puis clôturer une fois et produire le résultat/hérédité.

Le [chapitre alliances et fin de monde](../game-design/06-ALLIANCES-FIN-DE-MONDE.md) contient les règles et chiffres retrouvés. Cette séquence ne crée ni nouveau déclencheur ni nouvelle durée. Les cas non établis — perte d’une cité à monument, interruption/reprise du maintien, concurrence entre alliances — restent U33/U34.

## Éléments archivés hors du socle

- Tournoi PvP S4, niveaux de compétition, manches et Larmes temporaires : ne pas les activer dans `classic_pvp`.
- Éveil d’Arkath et victoire coopérative PvE : documentation de variante, hors livraison principale.
- Défis solo et vestiges/ruines tardifs : ne pas les inclure parce qu’une capture les montre.
- Boutique, monnaies premium et avantages commerciaux : preuves historiques à dater ; le modèle économique du successeur reste ouvert.
- Talents légendaires, ensembles et objets tardifs : conservés dans les catalogues, filtrés selon la disponibilité prouvée.

Ces exclusions ne retirent pas le **PvE de développement** du mode classique : libérer une région et affronter des PNJ, notamment dans la voie d’Honneur, restent essentiels.

## Contrat de configuration proposé

Un profil doit porter au minimum `ruleset_id`, `mode`, `victory_model`, version de catalogue, disponibilité du contenu, paramètres de temps, trêve, protection, économie et hérédité. Employer `mode=classic_pvp` et une victoire par monuments/maintien. Les valeurs encore inconnues doivent rester marquées comme telles dans le dossier ; une configuration de test les fournit sous un identifiant de test et ne se présente pas comme le serveur historique.

Le choix d’un profil de règles est indépendant du choix d’une famille graphique. Une image de ville Sylvan v4 peut servir à étudier la composition d’un arbre sans activer le tournoi S4. Inversement, reproduire les boutons v1.5 ne prouve pas que l’entretien et les sorts chargés correspondent à cette version.
