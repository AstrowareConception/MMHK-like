# Décisions du porteur de projet — questionnaire P0 (Q01–Q84)

**Date : 23 octobre 2026 · Source : [réponses originales](P0-REPONSES-ORIGINALES-2026-10-23.txt) · [registre JSON](../../data/decisions/p0-2026-10-23.json).**

Ce document est la **traduction des réponses de l'utilisateur en règles de projet**. Les formulations originales restent conservées intégralement ; la synthèse n'est pas une citation historique. Les écarts entre ces décisions et les sources Ubisoft/Jactari restent traçables. **Saison cible : S2**, sans présumer que les tables du calculateur de 2013 représentent exactement S2.

## Bilan et sémantique

- **48 choix directement exploitables** dans le futur MMHK-like.
- **31 orientations approuvées avec paramètres encore à qualifier** (formules, quantités, arrondis, distances, valeurs de production, etc.).
- **5 décisions déléguées à la recherche ou à la conception** ; elles ne doivent pas être remplacées silencieusement par des constantes inventées.
- **84 réponses conservées**, sans redemander la confirmation du mode PvP classique et de la Guerre des Larmes.

Les états indiquent uniquement le degré de définition de la **règle du successeur**, non une vérification du comportement du serveur d'Ubisoft. Les fiches du backlog ne deviennent pas automatiquement « Ready ».

## Choix particulièrement structurants

**Fidélité et prototype.** Le monde classique **S2** est la référence recherchée. Lorsqu'une règle manque, utiliser la restitution la plus plausible, corrigible et identifiée. Un capital initial **identique de points d'hérédité** sera librement distribué par chaque joueur. Premier prototype : **Havre, T1–T3, sans magie**. Les temps normaux restent la référence ; les tests peuvent accélérer une **horloge commune** par multiplicateur.

**Génération et démarrage.** Carte torique, presets adaptant densité et population (y compris 20, 50, 100 joueurs), distribution géographique équilibrée à l'inscription. La **région initiale** reçoit exactement or + bois + minerai + rare de faction (cristal pour Havre). Les autres régions n'ont **aucune ressource obligatoire**, présentent **trois ou quatre types** parmi les quatre mines, avec **au plus une paire** et **aucun triple ni deux paires** ; les quatre rares sont équiprobables. Les combats neutres se durcissent avec la distance à la cité. Sites spéciaux distribués aléatoirement avec espacement et équilibre des types ; distance exacte encore à clarifier.

**Protection et premiers échanges.** La protection du royaume débutant dure **sept jours**, ne peut pas être annulée, et interdit d'obtenir une deuxième cité pendant ce délai. Elle s'applique aussi à un entrant tardif. **La dernière cité d'un joueur ne peut jamais être capturée par siège**, mais devient pillable après la fin de la protection. Les ordres militaires visant une source/destination protégée sont vérifiés **au départ**. Les convois alliés entrants sont admis. Trois codes amis sont délivrés au joueur, avec apparition proche vers 4–10 cases et élargissement progressif si nécessaire.

**Économie.** Production affichée en unités/jour et créditée périodiquement (15 minutes indiquées comme hypothèse à ajuster) ; fractions conservées intérieurement et disponibles seulement lorsqu'une unité entière est acquise ; **bonus additifs** puis application à la base. Stocks indépendants par cité, silos/entrepôts, capacité d'or administrative, production saturée **perdue**. Les récompenses de quêtes restent dans des messages jusqu'à encaissement. Une mine libérée produit immédiatement. Les caravanes entre cités sont **non interceptables**. Entretien horaire **dans la cité où stationne l'armée**, forte croissance de coût selon S1/S2 ; heure impayée = **10 % de morts dans chaque peloton**, calcul de pertes à préciser.

**Constructions.** **Une seule construction urbaine active**, sans héros, sans file, sans annulation ; paiement au lancement. Plusieurs constructions régionales en parallèle, mais **chaque chantier mobilise un héros**, y compris durant le trajet et empêche la défense. En ville uniquement, choix vitesse/coût : rapide (**+40 % coût / −20 % durée**) ou économique (**−20 % coût / +40 % durée**). Une amélioration remplace immédiatement l'effet précédent à son achèvement. Si un prérequis est détruit, ses dépendants deviennent **inactifs**, pas automatiquement détruits. Siège : construction en cours continue, nouveau chantier interdit.

**Héros et armées.** Un héros initial, deux offres de taverne, rafraîchissement gratuit **toutes les 12 h**, maximum **15 héros** dans une campagne, recrutement à prix/délais croissants. Niveau max **40**, carrières progressivement accessibles. Bonus passifs du héros applicables **seulement lorsqu'il est présent en ville**. Recrues créditées **chaque heure**, fractions conservées, **pool commun** aux variantes de même tier. Achat instantané vers garnison ; conversion instantanée de **tout un peloton**, jamais partielle. Limite **sept pelotons** ordinaires. Artéfacts gagnés en région, quêtes, hérédité ; stockage de ville capturable ; magie par guildes de cinq cercles pour une phase ultérieure.

**Combats, événements et déplacements.** Référence principale **Jactari** : composition, contre-armes, seuils, pertes, bonus, XP, rapports détaillés, simulateur accessible aux joueurs. Combats **100 % déterministes** selon les entrées (le niveau de preuve demeure celui du calculateur communautaire). Un héros vaincu revient en cité et subit une blessure de durée croissante avec son niveau. Monde recalcule le temps réellement écoulé après panne. Trêve nocturne **23 h–6 h** bloquant les déplacements sur la carte du monde ; haltes de **2 h** hors influence propre/alliée, attaquables ; rappel d'une armée pendant l'aller, retour de durée identique au trajet accompli. **Pas de programmation ordinaire d'actions**. Les actions exactement simultanées peuvent être départagées sans priorité métier, mais leur ordre effectivement appliqué doit être mémorisé afin que le résultat ne change pas lors d'une reprise technique.

## 84 décisions détaillées par question

### A. Identité, historique et première version

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q01 | Saison 2 comme référence principale ; capital de points d'hérédité initial égal pour tous, dépensé librement | Orientation validée |
| Q02 | Si la règle originale manque, adopter la reconstitution historiquement la plus plausible, explicitement provisoire | Décidé |
| Q03 | Autoriser des corrections d'équilibrage ciblées à condition de les documenter | Décidé |
| Q04 | Prototyper une seule faction : Havre | Décidé |
| Q05 | Première boucle T1–T3, sans magie | Décidé |
| Q06 | Prévoir un multiplicateur de temps accéléré réservé aux tests | Orientation validée |

### B. Carte, ressources et création du monde

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q07 | Configurer des tailles de monde et capacités par presets, des parties à 20–100 joueurs aux grandes campagnes jusqu'à environ 2 000 joueurs et davantage | Orientation validée |
| Q08 | Capacité dépendante des presets de taille de monde (référence Q07) | Décidé |
| Q09 | Géométrie torique avec raccordement horizontal et vertical | Décidé |
| Q10 | Colonisation sur case libre éligible dans la zone d'influence propre/alliée ; exclure influence étrangère ; extensions hors zone limitées à étudier ; terrains spéciaux ultérieurs | Orientation validée |
| Q11 | Région initiale toujours dotée d'or, bois, minerai et ressource rare de faction (cristal pour Havre) ; placement géographique sans garantie supplémentaire | Décidé |
| Q12 | Répartir les quatre mines des régions non initiales selon un algorithme à concevoir | Délégué |
| Q13 | Au plus une paire de mines identiques, pas de double paire ou triple : chaque région comporte trois ou quatre types de ressources | Décidé |
| Q14 | Même probabilité pour cristal, gemmes, soufre et mercure | Décidé |
| Q15 | Délégation de la règle spatiale de placement des quatre mines | Délégué |
| Q16 | Force des occupants neutres croissante avec l'éloignement du centre régional | Décidé |
| Q17 | Réapparition optionnelle des PNJ après X jours d'inutilisation de la case libérée ; pas de réapparition sur case exploitée ; gains possibles XP/artéfacts | Orientation validée |
| Q18 | Sites spéciaux aléatoires, sous contraintes de distances géographiques et densité liée à la taille du monde ; types globalement répartis équitablement | Orientation validée |

### C. Arrivée, invitation et immunités

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q19 | Placement sans code ami répartissant progressivement la population sur la carte | Décidé |
| Q20 | Placement proche d'un ami visé entre environ quatre et dix cases, réglable | Orientation validée |
| Q21 | Si la proximité est saturée, étendre progressivement le rayon à une case éligible | Décidé |
| Q22 | Délivrer trois codes amis à chaque joueur lors de son inscription | Orientation validée |
| Q23 | Protection débutant sept jours, pas de seconde colonie pendant ce délai ; dernière ville jamais capturable par siège, mais pillable après protection | Décidé |
| Q24 | Aucune suppression anticipée de la protection débutant | Décidé |
| Q25 | Marquage graphique des villes protégées ; refus au départ de troupes si source ou destination protégée | Décidé |
| Q26 | Protection complète même pour les arrivants tardifs, y compris pendant la Guerre des Larmes ; convois alliés entrants autorisés | Décidé |

### D. Dotation initiale et tutoriel

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q27 | Préférence pour la dotation historique initiale ; si introuvable, définir une dotation adaptée | Orientation validée |
| Q28 | Seul le Conseil du village est construit initialement ; tous les autres bâtiments sont à réaliser | Décidé |
| Q29 | Héros initial pouvant recevoir des compétences d'hérédité ; taverne deux offres, renouvellement gratuit 12 h, coûts croissants, délais croissants avec arrivée après recrutement | Orientation validée |
| Q30 | Troupes de départ de tiers T1–T3, faible puissance totale X à définir | Orientation validée |
| Q31 | Tutoriel en quêtes obligatoires, procurant XP et ressources et permettant une optimisation du départ | Décidé |

### E. Économie, stockage et entretien

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q32 | Rendements annoncés par jour mais crédités à échéances régulières, intervalle indicatif 15 minutes | Orientation validée |
| Q33 | Fractions de production accumulées en interne ; seule une unité entière est disponible et dépensable | Décidé |
| Q34 | Bonus de production additionnés puis appliqués en une fois à la production de base | Décidé |
| Q35 | Stocks et plafonds séparés par cité, capacité d'or liée à l'administration ; caravanes sûres, capacité améliorée au marché, transfert inter-cités | Décidé |
| Q36 | Conserver la logique de stockage local, silos et entrepôts explicitée Q35 | Décidé |
| Q37 | Production excédant un stock plein définitivement perdue ; la production de cette ressource cesse tant que le stockage est saturé | Décidé |
| Q38 | Récompenses de quête envoyées en messages, encaissables au moment choisi, conservées en attente tant que non réclamées | Orientation validée |
| Q39 | Mine libérée produisant immédiatement ; bonus d'aménagements adjacents ; idée d'amélioration supplémentaire « creuser la mine » sur cinq niveaux, héros immobilisé et production suspendue | Orientation validée |
| Q40 | Partir des prix et rendements de saison 2 si retrouvés et les ajuster quand nécessaire | Orientation validée |
| Q41 | Barème d'entretien inspiré de S1/S2 : gratuit sous un seuil, puis croissance fortement non linéaire, pénalisant les armées massées | Orientation validée |
| Q42 | Entretien horaire imputé à la cité accueillant les troupes | Décidé |
| Q43 | À chaque heure impayée, 10 % de chaque peloton meurt ; entretien réévalué après pertes | Orientation validée |

### F. Construction, amélioration et sièges

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q44 | Une construction urbaine à la fois, sans héros ni file d'attente ; plusieurs chantiers régionaux simultanés, chacun avec héros et trajets | Décidé |
| Q45 | Aucun héros nécessaire pour construire en ville, mais héros nécessaire pour chaque construction régionale (Q44) | Décidé |
| Q46 | Héros bâtisseur régional entièrement indisponible, y compris pour défendre la cité | Décidé |
| Q47 | Coûts débités au lancement, sans possibilité d'annuler | Décidé |
| Q48 | Annulation de chantier interdite, sans remboursement | Décidé |
| Q49 | Mode urbain rapide : coût +40 %, durée −20 % ; économique : coût −20 %, durée +40 % ; pas d'option de ce type pour les bâtiments régionaux | Décidé |
| Q50 | Chaque construction et amélioration augmente d'un niveau la cité, selon souvenir ; exceptions à préciser | Orientation validée |
| Q51 | Remplacement immédiat des effets antérieurs par les effets améliorés dès l'achèvement | Décidé |
| Q52 | Pendant le siège, chantiers en cours maintenus sans annulation ni accélération ; nouveaux chantiers interdits | Décidé |
| Q53 | Les bâtiments privés d'un prérequis détruit deviennent inactifs, sans être détruits automatiquement | Décidé |

### G. Héros, inventaire, magie et recrutement

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q54 | Deux héros à la taverne ; renouvellement gratuit une fois toutes les 12 heures | Décidé |
| Q55 | Prix historiques et délais de recrutement croissants en fonction du rang de recrutement | Orientation validée |
| Q56 | Maximum 15 héros possédés sur l'ensemble d'une campagne, sans condition supplémentaire | Décidé |
| Q57 | Progression historique des héros jusqu'au niveau 40 | Décidé |
| Q58 | Trois carrières et talents historiques, ouverture progressive à affiner | Orientation validée |
| Q59 | Réorientation de carrière : retrouver les règles historiques puis proposer une implémentation cohérente | Délégué |
| Q60 | Bonus passifs uniquement si le héros est physiquement présent dans sa cité, sans déplacement mondial ou régional | Décidé |
| Q61 | Inventaire du héros de capacité historique à retrouver, équipement par emplacements, et stockage en ville | Orientation validée |
| Q62 | Artéfacts issus de combats régionaux (X cases récompensées), quêtes et hérédité ; échanges héros ↔ dépôt de ville ; dépôt capturable lors d'un siège | Orientation validée |
| Q63 | Guilde des mages donnant un sort par cercle/niveau 1–5, variété entre cités ; héros mémorisant un petit nombre de sorts, programmés par tour ; changement en ville | Orientation validée |
| Q64 | Recrues créditées une fois par heure, conservation des fractions jusqu'à unité complète | Décidé |
| Q65 | Réserve commune à un tier et sa variante améliorée | Décidé |
| Q66 | Achat instantané depuis la réserve, unités déposées en garnison ; transfert aux héros physiquement en ville | Décidé |
| Q67 | Amélioration instantanée de tout un peloton, paiement unitaire sur l'effectif entier, sans amélioration partielle | Décidé |
| Q68 | Sept pelotons ordinaires par armée combattante ; autres limites historiques à retrouver | Décidé |

### H. Combat et simulation

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q69 | Jactari comme référence principale de calcul ; comparer au client/CDN quand possible | Décidé |
| Q70 | Conserver l'ordre des phases de combat du calculateur Jactari | Décidé |
| Q71 | Conserver les seuils de fuite/admission de Jactari | Décidé |
| Q72 | S'appuyer sur Jactari pour les égalités et destructions mutuelles ; nul possible selon souvenir à vérifier | Délégué |
| Q73 | Pertes définitives selon Jactari (souvenir 20–30 %) ; prévoir effets de talents/artéfacts | Orientation validée |
| Q74 | Gestion PNJ, invocations et résurrections alignée sur Jactari | Délégué |
| Q75 | Héros vaincu retourne en cité puis devient blessé ; durée d'indisponibilité croissante avec son niveau | Orientation validée |
| Q76 | Combats entièrement déterministes à composition et paramètres identiques | Décidé |
| Q77 | Fournir au joueur un simulateur de combat complet de type Jactari | Décidé |
| Q78 | XP proportionnelle aux forces vaincues et à l'optimisation du rapport de force ; bonus roue, héros et compétences à vérifier | Orientation validée |
| Q79 | Rapports complets des combats, selon la granularité Jactari | Décidé |

### I. Horloge, mouvement et concurrence

| Question | Décision pour MMHK-like | État |
| --- | --- | --- |
| Q80 | Trajet aller-retour local dépendant de la distance | Orientation validée |
| Q81 | Pour des événements exactement simultanés, accepter qu'un traitement passe avant l'autre sans priorité métier prédéfinie | Orientation validée |
| Q82 | Reprise après indisponibilité en comptabilisant le temps écoulé ; trêve mondiale de 23 h à 6 h bloquant les déplacements de carte | Orientation validée |
| Q83 | Rappel autorisé pendant l'aller, retour égal au temps d'aller déjà parcouru ; pas de halte en influence alliée ; haltes attaquables de deux heures au-delà d'une distance seuil | Orientation validée |
| Q84 | Ne pas permettre de programmer des actions futures ou des files automatiques, sous réserve des exceptions historiques identifiées | Orientation validée |

## Précisions réellement utiles à demander

Les décisions ci-dessous sont les **seules questions de clarification proposées à l'utilisateur à ce stade**. Les tarifs S2, probabilités, barèmes de carrière, créatures, pertes et vitesse historique du monde sont d'abord des **sujets de recherche**, pas des informations à inventer de mémoire.

| ID | Réponse concernée | Clarification | Proposition par défaut (non validée) |
| --- | --- | --- | --- |
| C01 | Q01, Q29 | Combien de points d'hérédité identiques distribue-t-on au départ, et les bonus acquis lors d'une campagne s'ajoutent-ils ou remplacent-ils ce capital ? | Montant et cumul à arbitrer ; aucune valeur fictive adoptée. |
| C02 | Q18 | La séparation de 15 cases entre sites est-elle exigée pour tous les sites spéciaux ou seulement entre sites du même type ? | Le texte contient « voisins » mais aussi « minimum 15 » : éviter de figer un algorithme contradictoire. |
| C03 | Q22 | Les trois codes amis sont-ils consommés individuellement après une inscription réussie, et sont-ils limités au monde courant ? | Proposition : trois invitations à usage unique, liées au monde, sans renouvellement dans la campagne. |
| C04 | Q17 | Après combien de jours sans exploitation une case neutre se repeuple-t-elle, et veut-on autoriser des gains d'XP et d'artéfacts indéfiniment renouvelables ? | Proposer une durée configurable par monde et plafonner/restrictivement équilibrer les gains répétés, sans supposer les règles Ubisoft. |
| C05 | Q39 | Les cinq niveaux proposés de « creusement » remplacent-ils l'amélioration minière déjà documentée jusqu'au niveau dix, ou constituent-ils une spécialisation supplémentaire ? | Ne pas doubler deux progressions minières sans décision. |
| C06 | Q43 | Quand une cité ne peut pas régler l'entretien complet, doit-elle verser son or disponible avant attrition ? Comment arrondir les 10 % de pertes sur les petits pelotons ? | Proposition à valider : débit uniquement si entretien entièrement payable, sinon attrition simultanée et arrondi au supérieur par peloton. |
| C07 | Q25, Q26 | L'interdiction d'envoi depuis/vers une cité protégée vise-t-elle uniquement les actions militaires contre d'autres joueurs, en autorisant le PvE régional, les voyages non hostiles et les convois alliés ? | Assurer un début de partie effectivement jouable pendant les sept jours. |
| C08 | Q82 | La trêve 23 h–6 h se calcule-t-elle toujours dans le fuseau du monde (Europe/Paris pour un monde français), y compris lors des changements d'heure ? | Proposition : fuseau IANA fixé par monde, pas selon l'horloge locale de chaque participant. |
| C09 | Q84 | Les caravanes répétées du client historique doivent-elles demeurer une exception au refus de programmation d'actions ? | Décider avant la phase commerce ; le premier prototype n'a pas besoin de convoyeurs programmés. |

## Questions techniques déléguées à l'étude

Le porteur de projet délègue expressément : **répartition non initiale des mines (Q12)**, **positionnement des mines (Q15)**, **réorientation des carrières (Q59)**, et la consultation de **Jactari pour les cas d'égalité et les particularités PNJ/invocations (Q72/Q74)**. Les expressions « valeurs historiques » utilisées ailleurs désignent aussi des investigations, pas un feu vert pour choisir des chiffres non étayés.

**Pistes de simulation recommandées (PROP, pas des décisions ajoutées)** : générateur stable par graine, échantillonnage des quatre mines avec contraintes « trois ou quatre types » et quatre rares équiprobables, analyse de distribution et de biais de spawn ; simulateur d'attrition et de croissance économique dans différents presets de monde ; comparaison des opérations de combat à la version Jactari épinglée ; tests de passage à l'heure d'hiver pour les haltes et la trêve.

## Traduction dans le dépôt

- [Profil de conception S2](../../data/rules/mmhk-like-s2-policy-draft.json) : choix paramétrables, références aux questions et `null` sur les inconnues.
- [Profil de laboratoire](../../data/rules/early-game.profile-lab.json) : premier sous-ensemble exploitable pour fixtures, **encore non exécutable**.
- [Référentiel de règles métier](../../data/rules/early-game.rules.json) : contrats et degré de preuve d'origine conservés, décisions projet à tracer.
- [Registre d'incertitudes historiques](../research/INCERTITUDES.md) : une inconnue Ubisoft peut subsister même après une décision MMHK-like.

**Aucune réponse de ce document ne doit automatiquement être présentée comme une preuve que le serveur Ubisoft S2 se comportait ainsi.**
