# Incertitudes, contradictions et preuves manquantes

Ce registre sépare **information absente**, **sources contradictoires**, **anomalie d’outil** et **choix du successeur**. Une case inconnue ne prend pas une valeur de zéro par défaut. Les propositions techniques n’effacent pas les incertitudes historiques.

Priorités : **P0** bloque la fidélité du socle ; **P1** bloque un module ou une campagne complète ; **P2** complète le contenu ou l’exploitation. La priorité n’oblige pas à bloquer toute recherche : les autres modules peuvent avancer.

| ID | Priorité / nature | Question précise | Preuve disponible | Vérification suivante |
| --- | --- | --- | --- | --- |
| U01 | P0, partiellement résolu | Mode confirmé : PvP classique et Guerre des Larmes. Quelle saison/révision exacte, trêve et options ? | DEC-001 ; corpus visuel composite, versions client distinctes des saisons | Qualifier le profil numérique sans redemander le choix du mode |
| U02 | P0, version | Quelles tables du commit 2013 sont déjà valables en S2 ? | En-tête 4.1.3, commit 4.5 | Comparer une révision antérieure de Jactari et un rapport S2 |
| U03 | P0, temps | À quelle cadence ressources et recrues sont-elles créditées ? | Descriptions quotidiennes | Observer chiffres avant/après une frontière horaire sur archive ou capture |
| U04 | P0, arrondis | Fractions conservées, arrondis par mine ou par total ? | Tables nominales seulement | Cas de petite production avec bonus et plafond |
| U05 | P0, construction | Combien de chantiers par cité/héros ; exécutant immobilisé combien de temps ? | Héros nécessaires à certaines actions | Tutoriel filmé et interface de files |
| U06 | P0, recrutement | Recrues communes entre variantes ; cadence, coût et durée du recrutement ? | Coûts et `prod` récupérés | Comparer un bâtiment avant/après amélioration et une commande de recrutement |
| U07 | P0, entretien | Quel barème s’applique au monde cible ; quelles unités et quelle cité paient ? | G08 et calculateur divergent | Retrouver outil TotG du serveur ou bilan quotidien authentique |
| U08 | P0, insolvabilité | Déficit d’or : dette, blocage, désertion, délai ou autre ? | Non établi | Rapport et écran d’une cité insolvable |
| U09 | P0, mouvement | Chemin réellement traversé, diagonales, points et arrondis ? | Distance torique d’outil, guide des haltes | Tracé et heure réelle sur deux trajets tests dont franchissement de bord |
| U10 | P0, trêve | Fuseau, heures, heure d’été, influence sur marche/halte/siège ? | G05 russe, aperçu général | Paramètres d’un serveur français et exemples de frontière nocturne |
| U11 | P0, combat | Départage des égalités et faux nuls ; zéro défense ? | Branches spécifiques du simulateur | Rapport authentique aux seuils exacts |
| U12 | P0, combat | Admission PvP : branches de `floor(30r)` identiques au serveur ? | Code précis, guides approximatifs | Quatre captures autour de ratios limites |
| U13 | P0, pertes | Traitement complet des PNJ, invocations, résurrections et absence de héros ? | Plusieurs branches, correction marquée `bugged` | Rapports par catégorie et comparaison d’oracles |
| U14 | P0, simultanéité | Renfort et attaque à même seconde ; capture et victoire à même instant ? | Non retrouvé | Historique d’incident ou règle officielle ; sinon choix annoncé |
| U15 | P1, influence | Formule spatiale, fenêtre de moyenne, fréquence et conflits ? | G08, moyenne militaire et recalcul nocturne | Export de carte sur plusieurs jours avec puissances connues |
| U16 | P1, colonisation | Coût complet, limites, distance, état initial et réservation ? | G08 ; SS-040 sépare droit de classement et plafond commercial, mais contexte x200 de test | Formulaires sur monde classique normal avec différents nombres de cités |
| U17 | P1, génération | Quelles pondérations, doublons et corrélations entre les quatre mines d'une région ; quelles positions, types, densités et contraintes des sites mondiaux ? | Région 5×5 et quatre mines documentées ; types de sites exposés par le client 4.1.3 ; doublons et absence d'or rapportés par le porteur du projet, sans fréquence prouvée | Relevés multi-régions d'un même monde/version et cartes complètes ; voir GENERATION-MONDE-RELIQUES-ARRIVEE-PROTECTION-2026-10-23.md |
| U18 | P1, défense | Sélection/tri des sept pelotons et attribution des héros en garnison ? | Guide siège et simulateur multi-héros | Rapport avec plus de sept pelotons et plusieurs héros |
| U19 | P1, siège | Durée totale, encerclement, Graals, sortie/secours et retour des renforts ? | G10 incomplet | Calculateur TotG et rapports horodatés de siège |
| U20 | P1, protection | Quelle durée et portée de la protection débutant, et quelle relation avec les protections achetées, l'inactivité, les vacances et la dernière cité ? | Client 4.1.3 : isNewbie + endDate + options de protection additionnelle ; souvenir utilisateur sept jours ; témoignages historiques 14–15 jours selon périodes | Confirmer un profil/version et rechercher écrans de refus, levée anticipée et limites sur la première cité ; voir nouveau rapport du 23/10/2026 |
| U21 | P1, bombardement | Tirage de cibles et sort des prérequis après destruction ? | G10, poids catégoriels | Rapport détaillé avant/après destruction de plusieurs bâtiments |
| U22 | P1, pillage | Capacité de butin, transport, fraction adjacente et ciblage ? | G06 avec points de seuil | Rapport de pillage de faible et forte puissance |
| U23 | P1, espionnage | Probabilités de qualité/détection/capture et défense ? | G15 ; SS-031 : troupes/ville/région, durée et valeur d’information | Plusieurs couples durée/score et rapports de résultat avec héros connus |
| U24 | P1, partiellement résolu | Courbe des prix, renouvellement et limites de héros ? | SS-057 : deux offres, coûts/délais distincts, verrou commercial ; CODE-02 archétypes | Captures de recrutements successifs ; prix observés non universalisés |
| U25 | P1, partiellement résolu | Niveaux d’ouverture, calendrier serveur et disponibilité des bonus ? | CODE-02-HEROS : trois carrières, coût 1, budget niveau + bonus − 2/respec, talents 1/3/6, partage Scribe/Arcanes ; SS-019/020/025 | Comparer le configurateur tardif à un héros de la saison classique cible |
| U26 | P1, magie | Apprentissage, recharge, cumul des mêmes sorts, effet négatif ? | G14 et calculateur | Rapports et écrans de sorts de la saison cible |
| U27 | P1, partiellement résolu | Butin, liaison, capacité et conditions de transfert ? | SS-023 confirme équipement/sac/cité ; atlas et indices retrouvés | Parcours de transfert et tables de disponibilité par saison |
| U28 | P1, commerce | Tarifs, commissions, capacité mixte et sémantique des convois répétés ? | SS-053 : 4 fois, quantité exacte, pas d’attente, maxima par ressource ; menus fermés | Capturer les listes et un cycle complet de répétition ; ne pas additionner les maxima |
| U29 | P1, balance | Solde par paire ou agrégé, croissance, exclusions et contrôle exact ? | G17 | Message de refus et soldes avant/après plusieurs échanges |
| U30 | P1, partiellement résolu | Arrondis, or, débordements et marchandises en vente ? | G16 ; SS-042 corrobore +50 % par entrepôt, cinq maximum, cumul | Capacités par niveau et crédits au-delà du plafond |
| U31 | P1, alliance | Capacités/rangs exacts, score et droits détaillés ? | G09 avec seuils suspects | Écran d’alliance de rangs 1, 5, 6, 7 et 10 |
| U32 | P1, diplomatie | Pactes, délais, alliances parentes et effets sur ordres déjà partis ? | Droit de passage décrit | Messages diplomatiques et temps d’effet |
| U33 | P1, Larmes | Fréquence d’obtention, simultanéité, possession/vol et perte en conquête ? | G01–G04 | Journal de progression d’une alliance sur toute la guerre |
| U34 | P1, victoire | Décompte précis du maintien, égalité entre alliances, date de clôture ? | G01 | Annonce de victoire et derniers changements de monuments |
| U35 | P1, hérédité | Calcul exact, cas G=5, prix, unions, héritier et consommation ? | G26–G28, tables de bonus | Résultat final et écran de sélection du monde suivant |
| U36 | Hors socle, Arkath | Génération des assauts, forteresses et cérémonie ? | SRC-12 et G23 | Archivé ; ne bloque pas le PvP classique confirmé |
| U37 | Hors socle, tournoi | Seuils intermédiaires, appariement et égalités S4 ? | G25 | Archivé ; ne bloque pas la Guerre des Larmes classique |
| U38 | P2, contenu | Quêtes et récompenses exhaustives, blocages du tutoriel ? | G22, indices divers | Archives de quêtes et parcours filmé neuf |
| U39 | P2, aléatoire | Ruines : probabilités, fortification, effondrement et récompenses ? | G24 incohérent | Table d’origine lisible ou distribution documentée |
| U40 | P2, services | Fonctions gratuites/premium par date et serveur ? | Fiches contradictoires | Archive des offres et droits effectifs |
| U41 | P1, partiellement résolu | Gestes exacts, filtres, écrans alliance/Larmes, états et animations ? | 57 captures analysées ; gabarit et modales documentés, familles séparées | Vidéos avant/clic/résultat ; alliance et fin de campagne absentes du lot |
| U42 | P1, anomalie outil | Double ajout de bonus légendaire et pertes temporaires erronées ? | CODE-01-COMBAT | Versions antérieures/suivantes et rapports tardifs |
| U43 | P2, référentiel | Entrées vides, descriptions manquantes, placeholders régionaux ? | JSON extraits sans correction | Rapport du validateur puis recherche ciblée |
| U44 | P1, graphisme | Où sont les tuiles monde/région, scènes de ville, couches de bâtiments et hotspots ? | Partiellement levée le 23/10/2026 : 29 images récupérées, dont cinq scènes assemblées et quatre fonds monde/région ; 215 placements du client et 74 zones communautaires ; voir la recherche d'assets | Retrouver les fonds de ville vides et les GIF de bâtiments restants ; qualifier versions et interactions avant de clore U44 |
| U45 | P2, anomalies visuelles | Quels remplacements pour placeholders et contrôles absents ? | 163 références artefact vers placeholder absent ; deux rectangles Forteresse dépassent d’un pixel | Couche d’adaptation et contrôle visuel, sans modifier l’archive |
| U46 | P1, interface | Zoom politique automatique ou filtre ; nombre d’échelles et gestes d’origine ? | SS-033/034, deux représentations ; barre ancienne et barre tardive | Séquence de navigation filmée ; spécification proposée explicitement distincte |
| U47 | P1, arrivée des joueurs | Quel rayon, quelles contraintes de terrain/occupation et quelle loi de placement pour un nouvel arrivant aléatoire ou lié au code ami ? Quand la proximité devient-elle indisponible ? | Client 4.1.3 : REGISTER_ACTION_CHECK_FRIEND_KEY(worldId, friendKey), spawn=near/random ; WORLD_SUBSCRIPTIONS_OPENED contrôle la disponibilité du bouton ; algorithme serveur absent | Relever des apparitions avec et sans code sur le même monde, serveur plein, carte bouclée ; spécifier fallback explicite ; voir nouveau rapport du 23/10/2026 |

## Décisions du futur jeu, distinctes des inconnues

L’univers original, les noms, la direction artistique, le modèle économique, le rythme de campagne, les règles de sommeil, le niveau d’aide à l’optimisation et les éventuels ajustements d’entretien relèvent de décisions de projet. Même si une amélioration paraît évidente, elle sera consignée comme un écart volontaire après obtention d’une référence historique testable.

## Fiche de preuve à utiliser

Pour chaque nouvel élément : URL ou fichier d’origine ; auteur et date ; monde/saison/pays ; capture intégrale pertinente ; état avant ; action ; délai ; résultat ; variables connues ; variables inconnues ; conclusion limitée ; IDs d’exigence et d’incertitude concernés. Deux souvenirs compatibles aident à prioriser, mais un rapport chiffré permet de valider un arrondi.
