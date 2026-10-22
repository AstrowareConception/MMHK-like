# Spécifications fonctionnelles de reconstruction

**Statut : contrats proposés à partir des mécanismes documentés.** Ce document décrit le comportement à construire ; les paramètres historiques sont ceux des chapitres de game design, pas des valeurs implicites ajoutées ici. Une fonction dont une règle bloquante manque peut être prototypée avec un réglage de test explicitement nommé, mais ne sera pas qualifiée de fidèle.

## Acteurs et portée

| Acteur | Droits fonctionnels proposés |
| --- | --- |
| Joueur inscrit à un monde | Consulte son royaume, exécute ses ordres et reçoit ses rapports |
| Membre d’alliance | Consulte les données partagées autorisées et contribue aux objectifs |
| Officier | Dispose des permissions attribuées à son rôle ; pas de contrôle implicite des comptes membres |
| Chef d’alliance | Administre membres/rôles et commandes collectives prévues par le profil |
| Observateur de test | Consulte un monde de validation selon un périmètre explicite |
| Opérateur du monde | Configure, ouvre, suspend et clôture ; toute modification est auditée |

Un compte peut participer à plusieurs mondes ; les cités, héros, alliances et ressources ne se transfèrent pas entre eux par simple changement d’écran. L’hérédité possède son propre contrat de transmission.

## Exigences globales

| ID | Exigence | Preuve / origine |
| --- | --- | --- |
| REQ-WORLD-01 | Un monde possède un profil de règles, une ouverture, une phase courante et une clôture | G01/G25 ; structure PROP |
| REQ-TIME-01 | Les ordres progressent hors connexion et sont résolus à l’heure serveur | Nature persistante ; implémentation PROP |
| REQ-DATA-01 | Toute valeur de gameplay dépend d’un catalogue et d’une version explicites | Variations observées ; PROP |
| REQ-AUTH-01 | Une commande vérifie propriétaire, monde et permissions | PROP |
| REQ-ORDER-01 | Une même intention rejouée ne produit qu’un débit et un ordre | PROP |
| REQ-REPORT-01 | Le résultat d’une action est consultable avec son contexte et sa version | Rapports CODE-01 ; contrat PROP |
| REQ-VIS-01 | Une vue n’expose que les informations autorisées ou obtenues par reconnaissance | G09/G15 ; contrat PROP |
| REQ-END-01 | La victoire et l’hérédité d’un monde sont attribuées une seule fois | G01/G25–G28 ; atomicité PROP |

## Inventaire des écrans

| Écran | Données principales | Actions et états nécessaires |
| --- | --- | --- |
| Sélection de monde | Mode, saison/profil, phase, vitesse, trêve, statut d’accès | Rejoindre, reprendre, consulter un résultat ; monde fermé ou complet |
| Tableau de bord | Cités, héros, ordres, rapports récents, alertes et échéances | Accéder à une entité, trier les urgences ; données rafraîchies à l’heure serveur |
| Carte du monde | Coordonnées, propriétaires, alliances, influence, sites et ordres visibles | Naviguer, sélectionner, planifier ; bord raccordé si profil applicable |
| Région | Grille locale, cité, mines, PNJ, aménagements et chantiers | Inspecter, libérer, améliorer, construire ; cases bloquées ou occupées |
| Ville | Ressources, capacités, productions, bâtiments, garnison, recrues et héros | Construire, recruter, améliorer, commercer ; siège, occupation ou blocage |
| Fiche héros | XP, niveau, courbes, carrières, talents, objets, sorts, activité | Former, équiper, préparer une mission ; occupé, blessé ou prisonnier |
| Préparation militaire | Pelotons, ordre, puissance brute, héros et sorts programmés | Diviser/fusionner, simuler si autorisé, engager ; limite de pelotons et cible invalide |
| Marché et caravanes | Stocks, lots, offres, capacité de transport, balance éventuelle | Vendre, acheter, envoyer ; offre expirée, stock insuffisant, capacité dépassée |
| Alliance | Membres, grades, diplomatie, rang, territoire, compétences et objectifs | Inviter, attribuer un rôle, activer un bonus ; permissions insuffisantes |
| Objectif de campagne | Voies de Larme ou tournoi/PvE selon profil | Lancer étape, suivre compte à rebours, voir conditions ; phase non ouverte |
| Rapports et courrier | Événement, participants visibles, détail, récompense et expiration | Lire, partager si autorisé, réclamer ; déjà traité ou expiré |
| Résultat et hérédité | Classements gelés, victoire, points, avantages transmis | Choisir les options autorisées du prochain monde ; calcul finalisé |

Les interfaces doivent distinguer **non disponible**, **non autorisé**, **précondition manquante**, **en cours** et **terminé**. Un bouton grisé doit expliquer la condition bloquante sans révéler une information militaire cachée.

## Commandes économiques et de développement

Toutes les durées et coûts cités par référence sont calculés par le serveur selon le profil. « À confirmer » signifie que la fonctionnalité est spécifiée mais que sa fidélité chiffrée n’est pas acquise.

| ID | Commande | Préconditions essentielles | Début / immobilisation | Résultat / cas d’échec |
| --- | --- | --- | --- | --- |
| REQ-CITY-01 | Coloniser | Emplacement admissible, droit de cité, héros et ressources | Réserver cible selon politique et engager trajet ; coût exact à confirmer | Créer une seule cité et région initiale ; cible prise entre-temps = résolution explicite |
| REQ-BUILD-01 | Construire/améliorer | Cité possédée, prérequis, ressources, exécutant si requis, pas de blocage | Débiter/réserver, créer chantier, immobiliser ce qui est nécessaire | Activer une fois le nouveau niveau ; pas de double bonus pendant remplacement |
| REQ-MINE-01 | Améliorer une mine | Mine accessible, niveau autorisé, héros admissible et coût | Appliquer option normale/accélérée/économique seulement si profil | Nouveau niveau et production ; interruption distincte entre amélioration et extension |
| REQ-REGION-01 | Construire un aménagement | Case libérée, type admissible, carrière/prérequis éventuels | Consommer coût et réserver case | Aménagement actif, bonus local recalculé ; unicité par type si exigée |
| REQ-STOCK-01 | Produire/stocker | Source active et capacité applicable | Calculer production sur intervalle valide | Crédit plafonné selon provenance ; fractions et débordements à déterminer |
| REQ-RECRUIT-01 | Recruter des unités | Bâtiment, recrues, ressources et héros/carrière si requis | Débit et file de recrutement selon règle à confirmer | Effectifs permanents attribués une fois ; aucune création de recrues par rafraîchissement |
| REQ-UPGRADE-01 | Améliorer des unités | Lignée valide, bâtiment amélioré, effectifs disponibles et coût | Retirer/réserver unités de base | Même nombre d’unités du type cible ; durée et disponibilité à confirmer |
| REQ-HERO-01 | Recruter un héros | Taverne, capacité, offre et ressources | Réserver l’offre et débiter | Héros, profil et petite armée associés ; catalogue d’offres à retrouver |
| REQ-HERO-02 | Apprendre/réorienter | Héros disponible, points, niveau et carrière admissibles | Durée/coût du profil ; rendre indisponible si exigé | Talent validé une seule fois ; respec et perte de points versionnés |
| REQ-EQUIP-01 | Équiper un artéfact | Objet détenu, emplacement, budget de niveaux et restrictions | Échange atomique d’emplacements | Bonus recalculés ; objet unique, sans duplication pendant transfert |
| REQ-MAGIC-01 | Apprendre/préparer un sort | École, cercle, profession et disponibilité | Apprentissage selon règle ; préparation liée à la prochaine armée | Séquence légale de sorts ; disponibilité au lancement vérifiée |
| REQ-TRADE-01 | Acheter/vendre | Offre valide, propriété, stock, prix et droits | Réserver les deux contreparties ; balance si applicable | Règlement atomique ; litige de concurrence résolu sans double vente |
| REQ-CONVOY-01 | Envoyer une caravane | Cible, stock, capacité de transport, route et règles d’échange | Charger des ressources indisponibles ailleurs | Livraison ou retour documenté ; traitement du siège et de l’excédent à confirmer |

## Commandes militaires

| ID | Commande | Préconditions essentielles | Déroulement | Résultat / exception |
| --- | --- | --- | --- | --- |
| REQ-ARMY-01 | Composer une armée | Héros/stock disponibles, unités possédées | Former pelotons et ordre ; distinguer prévisualisation et engagement | Réservation cohérente des unités ; règles multi-héros à préciser |
| REQ-PVE-01 | Attaquer une rencontre | Rencontre active et accessible, armée légale | Départ éventuel puis résolution du contexte PvE | Rapport, pertes, XP, libération et récompense unique |
| REQ-MOVE-01 | Déplacer | Destination et armée admissibles | Plan de trajet, segments, haltes, trêve, retour si nécessaire | Position et disponibilité mises à jour ; recalcul selon profil |
| REQ-SPY-01 | Reconnaître | Cible autorisée, héros et compétence selon profondeur | Mission temporisée et résolution de qualité/détection | Rapport partiel, XP, blessure ou capture selon règle |
| REQ-RAID-01 | Piller | Cible hostile, seuil de force, absence de protection | Trajet, combat éventuel, pillage et retour | Butin, dégâts économiques et durée de récupération |
| REQ-SIEGE-01 | Installer un siège | Droit de cité, cible prenable, force et diplomatie | Trajet puis occupation de la place d’assiégeant | Blocus ou retour ; premier siège accepté de manière atomique |
| REQ-SIEGE-02 | Bombarder/assaillir | Siège actif, engins/armée, délai satisfait | Opération verrouillée pendant sa durée | Destruction ciblée ou conquête ; ne pas appliquer une seconde fois au retry |
| REQ-SIEGE-03 | Lever/secourir/sortir | Camp et opération autorisés | Conflit avec action en cours résolu selon profil | Siège poursuivi, levé ou vaincu ; retour des forces légales |
| REQ-COMBAT-01 | Résoudre une bataille | Instantané complet et versionné | Admission, préludes, échanges, pertes, XP | Résultat déterministe et rapport détaillé pour les mêmes entrées |

## Commandes collectives et fin de monde

| ID | Commande | Préconditions / contrainte | Résultat attendu |
| --- | --- | --- | --- |
| REQ-ALLY-01 | Créer/rejoindre/quitter | Invitation/acceptation, capacité et restrictions du profil | Appartenance et contributions recalculées ; devenir des monuments explicite |
| REQ-ALLY-02 | Rôle/diplomatie | Permission et relation admissible | Droits et passages mis à jour avec date d’effet |
| REQ-ALLY-03 | Activer une compétence | Rang, permission, recharge et exclusion d’une autre active | Fenêtre de bonus bornée, expiration et prochaine disponibilité |
| REQ-PATH-01 | Attribuer un rang/récompense | Seuil et assiette de voie | Rang et récompense uniques ; pas de boucle de récompenses non bornée |
| REQ-TEAR-01 | Lancer une étape de Larme | Phase de monde, voie, héros/bâtiments/coûts | Chaîne d’étapes tracée ; échec, interruption et capture définis |
| REQ-GRAIL-01 | Construire/perdre un monument | Larme détenue, cité éligible, quota et délai | Consommation unique de Larme, monument actif, bonus et compteur collectif |
| REQ-WIN-01 | Vérifier la victoire classique | Profil classique et monuments actifs | Continuité au seuil, remise à zéro après rupture, victoire unique |
| REQ-TOURNAMENT-01 | Résoudre une manche S4 | Profil tournoi et calendrier | Points, niveaux, Larmes et remise à zéro selon règle de manche |
| REQ-COOP-01 | Résoudre une étape Arkath | Profil coopératif et état des forteresses | Progression/recul, récompense et attaques selon calendrier |
| REQ-LEGACY-01 | Transmettre l’hérédité | Monde clos, résultat et barème gelés | Droits acquis traçables et consommation autorisée dans un nouveau monde |

## Détail de trois parcours critiques

### Construction

Le joueur sélectionne le bâtiment et reçoit un devis calculé : coûts par ressource, prérequis, héros, durée, fin prévue et bonus retenus. À la confirmation, le serveur recalcule le devis sur l’état courant. Si les ressources ou prérequis ont changé, il renvoie la nouvelle cause et ne lance pas d’ordre partiel. À l’échéance, il termine le chantier, met à jour les effets et libère les ressources réservées ou l’exécutant selon le contrat. Annulation et remboursement exigent une règle de profil avant d’exposer le bouton.

### Attaque et rapport

Le joueur choisit cible, héros, pelotons et sorts. Le serveur vérifie disponibilité, relation et restrictions, puis réserve les forces. À l’arrivée, l’état de la cible est réévalué suivant les règles de mission. Les entrées effectives de bataille sont figées ; le moteur résout ; les pertes et récompenses sont enregistrées dans la même opération logique. Le rapport conserve à la fois les dispersions intermédiaires et les morts définitifs. Une modification ultérieure d’un catalogue ne réécrit pas ce rapport.

### Objectif de fin

La construction d’un monument consomme une Larme identifiée et n’augmente le compteur qu’une fois active. Chaque gain/perte met à jour le compteur d’alliance et le début éventuel de la période de maintien. La validation finale vérifie que l’alliance satisfait encore les conditions au moment exact de clôture. Les règles de simultanéité entre capture et fin de compte à rebours doivent être décidées et testées, plutôt que dépendre de l’ordre aléatoire des requêtes HTTP.

## Réponses d’échec à prévoir

`WORLD_CLOSED`, `WRONG_WORLD`, `NOT_OWNER`, `ROLE_REQUIRED`, `HERO_BUSY`, `HERO_UNAVAILABLE`, `INSUFFICIENT_RESOURCES`, `PREREQUISITE_MISSING`, `CAPACITY_REACHED`, `TARGET_CHANGED`, `TARGET_PROTECTED`, `DIPLOMACY_BLOCKS_ACTION`, `ORDER_ALREADY_PROCESSED`, `RULE_NOT_CONFIGURED`. Ces noms sont proposés pour l’API ; les messages affichés doivent être français et contextualisés. Une règle non configurée doit empêcher l’action de test concernée, sans prendre silencieusement zéro comme coût ou durée.
