# Arbitrages métier — premier cycle de partie

**État : propositions à examiner, non validées.** Ce registre ne remplace pas [les 47 incertitudes historiques](../research/INCERTITUDES.md) : il extrait celles qui gouvernent le premier parcours jouable et propose une méthode de clôture. Une décision sur **MMHK-like** ne supprime pas une inconnue sur **Ubisoft MMHK**.

## Principes de décision

**Trois choix légitimes pour chaque lacune :** (A) rechercher une source datée qui permette de qualifier une règle historique ; (B) retenir un **paramètre de laboratoire PROP**, explicitement non historique, pour exécuter des tests ; (C) différer la fonction lorsque son résultat serait trompeur ou irréversible. Un profil « classique » ne reçoit jamais des nombres fictifs sous prétexte de débloquer la recette.

**Statuts possibles :** \`à qualifier historiquement\`, \`proposé pour laboratoire\`, \`choisi pour MMHK-like\`, \`validé par preuve\`. **Tous les points du tableau restent ouverts**, sauf le périmètre PvP classique déjà confirmé.

## P0 : décisions nécessaires avant de déclarer PAR-01 jouable

| Priorité | Inconnue | Décision métier à trancher | Stratégie de laboratoire envisageable (PROP, non décidée) | US principalement concernées |
| --- | --- | --- | --- | --- |
| P0 | **U01/U02** | Quelle saison/corpus servira de référence numérique ? | Épingler le catalogue Jactari 2013 **comme candidat**, garder les écarts visibles | ACC-001/002, CIT-003, ARM-005 |
| P0 | **U17/U47** | Répartition des mines, contraintes d'implantation, rayon/fallback du code ami | Générateur à graine fixe ; taux injectés dans fixtures ; refuser \`near\` sans politique valide | ACC-003/004, REG-001 |
| P0 | **U20** | Protection : sept jours ou autre durée ; première cité ou royaume ; levée et fin exacte | Test de **sept jours** et fin exclusive seulement dans la fixture, avec \`scope\` simulé, sans déclaration de fidélité | ACC-011, PVP-004 |
| P0 | **U03/U04** | Production continue ou par échéance ; fractions et ordre d'arrondi | Débit rationnel par segments, valeurs entières dans les fixtures ; pas de livraison historique tant que non arbitré | ECO-002/003/004 |
| P0 | **U30** | Capacité, arrondis et sort du surplus selon type de crédit | Pour la production **uniquement**, scénario qui plafonne et écarte le surplus fictif, explicitement PROP | ECO-004/010 |
| P0 | **U05** | Nombre de chantiers, rôle et immobilisation du héros, annulation/remboursement | Pour fixture isolée, un chantier déjà admissible ; pas de bouton « annuler » tant que non décrit | CIT-004/005/006, HER-003 |
| P0 | **U06** | Recrutement, cadence des recrues, variante améliorée et délai éventuel | Injecter un \`RecruitPool\` existant pour tester le débit sans créditer de nouvelles recrues | ARM-003/004/005 |
| P0 | **U24/U25** | Y a-t-il un héros initial ? Coût et délai de la taverne, archétype et budget | Injecter un héros de test identifié ; ne pas afficher une offre fictive comme tarif Ubisoft | ACC-004, HER-001/003 |
| P0 | **U09** | Délai d'aller/retour et état de mobilisation sur un combat local | Simuler directement une rencontre à échéance injectée en fixture, sans ETA « historique » | COM-002, REG-003 |
| P0 | **U11/U13/U42** | Seuils de victoire, pertes, anomalies du simulateur et traitement PNJ | Vérifier d'abord les cas synthétiques Jactari, conserver les résultats comme « oracle communautaire » | COM-004/010/014/017 |
| P0 | **U14** | Deux événements contradictoires à la même seconde | Définir une matrice de priorités **de test**, indépendante de l'ordre d'arrivée HTTP, avant l'intégration multi-acteurs | CIT-006, COM-002, REG-003 |

Les décisions de **protection**, de **fallback d'implantation**, de **remboursement** et de **désertion** affectent directement les joueurs. Elles ne doivent pas être prises sans politique explicitée, même dans une première alpha.

## P1 : nécessaires à un monde multijoueur classique complet, pas forcément à une fixture locale

| Thème | Inconnue | Pourquoi préparer la décision dès maintenant |
| --- | --- | --- |
| Entretien et insolvabilité | U07, U08 | L'accumulation de troupes modifie l'économie et l'équité entre joueurs ; ne pas faire déserter sans preuve |
| Trêve et fuseaux | U10 | Le calcul des ETA et la sécurité des joueurs dépendent de la date serveur, pas de l'horloge navigateur |
| Influence et colonisation | U15, U16 | La géographie de départ doit laisser une expansion stratégique possible |
| Combat de garnison | U18 | Sept pelotons au combat n'impliquent pas sept seuls types dans une cité |
| Siège et bombardement | U19, U21 | Les états de chantier et de cité capturée sont affectés |
| Alliance, Larmes et victoire | U31–U35 | L'emplacement des sites et la disponibilité des cités peuvent affecter les stratégies de fin de campagne |

### Rappel important sur la Guerre des Larmes

Le guide étudié décrit une victoire par **13 monuments actifs tenus pendant 14 jours**. C'est notre **référence candidate** pour la campagne classique. L'exacte qualification de la saison, le statut d'un monument capturé, les pertes sous le seuil et les conflits au même instant restent ouverts. Le travail sur les régions et la possession doit préparer ces contraintes sans implémenter prématurément cette partie.

## Décisions structurantes relevant du game design, et non d'une enquête Ubisoft

Ces arbitrages seront éventuellement tranchés **pour MMHK-like** même lorsque la référence historique demeurera inconnue :

1. **Fidélité mécanique vs rééquilibrage** : protéger les valeurs originales dans un profil de comparaison et réserver les ajustements à une variante explicite.
2. **Rythme des campagnes** : durée/accélération, entrée tardive, économie des premiers jours, heures de trêve, fatigue et entretien.
3. **Équité d'implantation** : poids des mines, rareté des doublons, distances minimales entre premiers royaumes et proximité d'amis.
4. **Accessibilité sans automatisation abusive** : afficher des prévisions et rapports compréhensibles sans révéler des informations que l'espionnage doit obtenir.
5. **Monétisation** : décider séparément si un éventuel avantage commercial historique doit exister dans le successeur ; rien ne doit être importé implicitement.

## Questions à résoudre avec des preuves vérifiables

### Génération des régions

Relever pour un même monde et une même version **plusieurs régions complètes** : coordonnées, 25 cases, mines avec doublons, créatures défensives, terrains et sites mondiaux. Un échantillon faible ne permet pas de calculer des poids de génération, encore moins une obligation « 1 or + 1 bois + 1 minerai + 1 rare ».

### Production et construction

Chercher captures datées de stocks avant/après une frontière horaire, rapport d'entretien, début de chantier en présence/absence de héros, deux chantiers simultanés, amélioration pendant une récolte. Les données du catalogue (coûts/durées) sont nécessaires mais insuffisantes pour déduire la cadence ou les arrondis.

### Héros et combat

Comparer le simulateur avec des rapports réels portant les effectifs, l'ordre des sept pelotons, le niveau/carrière du héros, la composition adverse et les dispersions/morts définitives. Les anomalies connues du calculateur doivent être traitées comme contre-exemples plutôt que corrigées implicitement.

## Critère de passage à la conception exécutable

Une décision passe à \`choisi pour MMHK-like\` lorsqu'elle possède : **paramètre ou formule**, **champ de validité**, **date/version de profil**, **conséquences de refus**, **au moins un cas nominal et un cas frontière**, **US concernées** et **mention de provenance**. Une preuve historique validée conserve le lien vers sa capture ou son calcul original. L'absence de preuve historique n'empêche pas un choix de conception, mais celui-ci n'est pas renommé \`OBS-CODE\` ou \`DOC\`.

Le [profil de laboratoire](../../data/rules/early-game.profile-lab.json) contient délibérément des valeurs \`null\` pour les décisions non tranchées et déclare \`NON_EXECUTABLE_DECISIONS_PENDING\`. Il n'est pas destiné à créer un véritable monde tant que ces champs n'ont pas été examinés.
