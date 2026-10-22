# PvE, quêtes, événements et services historiques

## Rencontres régionales

La région locale combine développement et rencontres préparées. Une zone occupée par des PNJ doit être résolue avant d’en retirer l’accès ou la récompense prévue. Les troupes neutres, certaines créatures spéciales et le Chevalier de la mort existent dans le catalogue. Les compositions de départ, la génération des emplacements, la distribution des trésors et le renouvellement éventuel des rencontres ne sont pas entièrement retrouvés. [Demande initiale ; CODE-01-DATA]

Le futur générateur devra distinguer : modèle de rencontre, armée générée, état « non résolue/résolue », récompense associée et preuve de consommation. Réexécuter un rapport ou rafraîchir la page ne doit pas recréer le butin. Cette exigence est une proposition de cohérence, pas une description du stockage Ubisoft.

## Quêtes d’apprentissage — DOC, G22

La chaîne de combat retrouvée comporte onze objectifs introduisant contre-armes, plusieurs pelotons, victoire serrée, écrasement, attaque du héros, peloton perdu, honneur, magie et artéfact. Le guide signale un risque : vider trop tôt les rencontres régionales peut rendre certains objectifs difficiles à accomplir. Les prédicats précis ne sont pas tous fiables ou complets, notamment « victoire serrée » et « grande victoire ». Il faut donc stocker l’objectif et sa condition distinctement du texte affiché, puis retrouver ses seuils et récompenses avant de certifier la quête. [G22]

Le tutoriel du successeur peut prévenir l’impasse ou fournir une rencontre d’exercice, mais ce serait une variation volontaire. Le mode de référence doit d’abord enregistrer le comportement historique confirmé.

## Campagne coopérative d’Arkath — DOC, SRC-12

La saison 3 introduit une campagne PvE coopérative : les alliances défendent des forteresses runiques contre des assauts croissants d’Elfes Noirs, jusqu’à l’achèvement de la cérémonie d’Éveil d’Arkath. Une récompense quotidienne est annoncée lorsque les ennemis n’ont pris aucune forteresse. Cette condition de progression collective diffère de la Guerre des Larmes PvP. L’annonce contemporaine ne donne pas le générateur d’attaques, le calendrier détaillé ni les quantités de récompenses. [SRC-12]

## Failles — DOC, G23

Le guide décrit des failles en PvE et parfois lors d’événements PvP : apparition liée aux cités de l’alliance, maximum voisin du nombre de cités divisé par huit, niveaux 1/5/10/20, armées ajustées à l’environnement. Elles possèdent des défenses spéciales, dont antimagie, balistes et pièges ; les pertes s’accumulent sans régénération. Une menace matérialisée par des crânes peut déclencher une attaque à dix. Le dernier combat ferme la faille. Les formules de menace et certaines données de génération sont ambiguës ou mal restituées dans la page : elles ne sont pas exploitables comme algorithme exact. [G23]

## Ruines — DOC, G24

Les ruines proposent jusqu’à vingt étages, avec plafond d’armée 100 000 et de peloton 50 000. Le joueur attaque, peut récupérer son gain ou continuer, et s’expose à un effondrement ; fortifier réduit ce risque. Le guide indique que héros et armée survivent à l’effondrement, avec réduction de récompense, et que l’ennemi est réinitialisé après un échec. Des ressources, objets ou occasions de mine supplémentaire peuvent être obtenus ; des courriers de récompense expirent après sept jours. Le tableau des probabilités comporte des incohérences : aucune distribution chiffrée n’est certifiée ici. [G24]

## Récompenses et catégories d’événement — OBS-CODE

Le catalogue distingue objets de butin régional, rang, hérédité, Larme et événement. Certaines unités sont rattachées à une faction négative et à des variantes tardives. Ces marqueurs sont des indices de contenu ; ils ne suffisent pas à reconstruire leur calendrier ou leur distribution. Les montants, raretés, tables de tirage, conditions d’échange et limites temporelles sont à documenter séparément.

L’architecture proposée doit accepter des événements sans modifier le code du combat : définition d’éligibilité, dates d’ouverture/fermeture, rencontres, règles de récompense, limitations d’armée et version du contenu. Un événement expiré ne doit plus attribuer sa récompense sans règle explicite de rattrapage.

## Abonnement et services — DOC, à isoler du gameplay de base

Les fiches historiques décrivent une offre gratuite et des fonctions supplémentaires payantes : capacité accrue en cités/héros, fonctions de messagerie ou de simulation, entraînement et services sur les objets selon les périodes. La saison 3 mentionne une nouvelle boutique. Les limites exactes, prix, devises et durées ont varié ; les métadonnées sommaires de certaines fiches sont contradictoires avec leur texte. [SRC-08, SRC-09, SRC-12]

La reproduction documentaire doit donc distinguer **existence de la mécanique** et **droit d’accès commercial**. Le successeur n’a pas encore de modèle économique décidé. Ne pas reconstruire automatiquement un paiement réel, une boutique ou une dépendance à un abonnement avant choix explicite du projet. Un monde privé de validation peut ouvrir les fonctionnalités nécessaires au test ; il doit consigner qu’il s’agit d’un réglage de test.

## Systèmes transversaux encore partiels

| Système | Ce qui est établi | Ce qui reste à retrouver |
| --- | --- | --- |
| Rapports et courrier | Rapports de combat, reconnaissance et récompenses | Capacité, archivage, partage, expirations exactes hors exemples |
| Protection et inactivité | Des exceptions existent dans les guides de conquête et d’alliance | Protection débutant, absence prolongée, vacances, dernière cité inactive |
| Classements | Trois voies personnelles, rang d’alliance, variantes de fin | Fréquence de calcul, égalités, fenêtres et récompenses exhaustives |
| Événements | Créatures et artéfacts dédiés | Calendrier, conditions, butin, disponibilité par serveur |
| Quêtes | Chaîne de combat et grandes quêtes de Larme | Catalogue complet des quêtes, prérequis, textes et récompenses |
| Services sociaux | Alliances, rôles, échanges, union d’hérédité | Permissions exhaustives, invitations, diplomatie détaillée |

Ces lacunes sont intégrées au registre d’incertitudes. Elles ne doivent pas être remplies par les règles d’un autre jeu Heroes ni par celles de Might & Magic: Heroes Online, produit distinct.
