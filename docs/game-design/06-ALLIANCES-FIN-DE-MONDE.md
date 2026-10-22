# Alliances, classements, fin de campagne et hérédité

## Alliance — DOC, G09

L’alliance organise appartenance, grades, territoire, information et objectif final. G09 indique une capacité évoluant d’environ vingt à trente membres. Le général consulte les combats, le maître espion les reconnaissances, le marchand les aménagements. Le droit de passage évite certaines haltes et interdit des actes hostiles, sans être équivalent à une fusion d’alliances. Les compétences actives durent 24 heures, avec sept jours de recharge et une seule active simultanément. La succession du chef inactif est décrite après quinze jours.

La source donne un score combinant captures ±7 500, XP PvP ×0,12, puissance ×0,01, pillage ×0,027 après valorisation et 200 par région. Elle distingue contributions historiques et puissance/influence courantes lors d’un départ. Les seuils des rangs 2–10 sont 125 000 ; 250 000 ; 400 000 ; 800 000 ; 900 000 ; 1 400 000 ; 2 000 000 ; 2 600 000 ; 3 200 000. L’étrange proximité des rangs 5/6 et l’index initial nécessitent vérification. [G09]

Le code conserve trois compétences : **Cri de guerre**, **Ralliement**, **Inspiration**, avec tableaux 0/5/10/15. Leur branche d’application doit être reliée à la caractéristique ciblée ; une liste de noms ne justifie pas trois bonus universels à toutes les statistiques. [OBS-CODE : `bonus.json`]

## Trois voies de progression personnelle

| Voie | Assiette documentée | Seuils de rang 1 à 10 | Source |
| --- | --- | --- | --- |
| Domination | Puissance d’armée et valorisation des bâtiments ; le guide cite 20 % des coûts d’or | 34 000, puis doublement à chaque rang jusqu’à 17 408 000 | G19 |
| Honneur | XP de combat et certaines récompenses de quêtes/rangs | 15 000 ; 30 000 ; 80 000 ; 160 000 ; 320 000 ; 640 000 ; 1 280 000 ; 2 560 000 ; 7 680 000 ; 23 040 000 | G20 |
| Richesse | Production et butin PvE admissible, certaines récompenses ; pas achat au marché ni pillage PvP selon le guide | 320 000, puis doublement jusqu’à 163 840 000 | G21 |

Pour Richesse, la valorisation donnée est or +1 000 par ressource commune +2 000 par rare. Ces voies ouvrent récompenses et capacités, mais elles ne sont pas trois monnaies dépensables. La Domination ne doit pas être recalculée naïvement à 20 % du dernier coût : le catalogue des bâtiments comporte des valeurs spécifiques et cumulatives. Les récompenses détaillées de tous les rangs et leur moment de délivrance restent à extraire/valider.

## Guerre des Larmes classique — DOC, G01

Le passage d’une première alliance au rang 7 déclenche la Guerre des Larmes et une première Larme ; les alliances à partir du rang 4 peuvent y participer selon le guide. Trois voies procurent des Larmes d’Asha, ensuite employées à construire des monuments, souvent appelés Graals.

La victoire demande de maintenir **treize monuments durant quatorze jours** ; descendre sous le seuil réinitialise la continuité. La construction de base dure dix jours, avec des restrictions de simultanéité distinguant Larme obtenue et volée. Une cité n’accueille qu’un monument ; quitter l’alliance peut le détruire. Le guide décrit également des évolutions S3 : portails/ruines après six Graals, restrictions de haltes modifiées et quêtes raccourcies. Ces ajouts ne sont pas projetés automatiquement sur S1/S2. La prise/vol d’une Larme classique doit être distinguée de sa destruction définitive en tournoi S4. [G01]

### Obtention par Domination — DOC, G02

Le parcours passe par un cartographe (100 000 or, 60 bois, 60 minerai ; sept jours), puis des expéditions de 20 000 or et 24 heures, avec chances progressives de 20 à 100 %. Un obélisque situé dans un rayon indiqué de dix cases mène au déchiffrement : guilde de magie 3, 10 000 or, 2 h 24. La région de fouille est révélée publiquement après 24 heures ; ses rencontres doivent être nettoyées, puis chaque fouille dure douze heures et plusieurs héros peuvent agir. Les tirages de localisation et leur distribution exacte restent à vérifier. [G02]

### Obtention par Richesse — DOC, G03

Le guide exige un creuset de niveau 5 et une infrastructure économique avancée. Quatre composants consomment chacun 228 unités d’une ressource rare et trois jours ; l’étape finale coûte 500 000 or et dure quatorze jours. La capture de la cité réinitialise les composants selon la source. Le conseil de stockage associé ne doit pas être confondu avec un prérequis codé ; la chaîne complète des niveaux du creuset demeure à confirmer. [G03]

### Obtention par Honneur — DOC, G04

Un héros de niveau 35 et une guilde de magie 5 ouvrent l’accès au portail : 100 000 or, 90 bois, 90 minerai et sept jours, valeurs également présentes dans le catalogue régional. L’armée est limitée à 100 000 de puissance et chaque peloton à 50 000. Le parcours comporte cinq défis ; les quatre premiers combinent attaque puis défense, le dernier mène au Chevalier de la mort. La source décrit cinq minutes d’attaque, défense quinze minutes après et une semaine de campement entre étapes, puis un jour pour la finale. Les configurations d’ennemis et variantes raccourcies doivent être validées par saison. [G04 ; CODE-01-DATA]

## Bonus des monuments — OBS-CODE

Les descriptions de bâtiments déclarent, par exemple pour la Nef céleste, +50 % de production de créatures, +5 000 or/jour, +125 000 de capacité de soutien et doublement de vitesse pour les héros quittant la cité avec armée. Ne pas généraliser tous les bonus d’un monument à tous les autres sans consulter sa ligne.

Les données générales contiennent aussi des tableaux de réduction des pertes et de défense liés au nombre de Larmes. Ces bonus peuvent être collectifs et distincts de l’effet local du bâtiment. L’échelle, le signe et le contexte d’application sont conservés dans le calculateur ; les plafonds et modifications saisonnières doivent être rattachés au bon profil.

## Variante tournoi de saison 4 — DOC, G25

Le guide S4 décrit une compétition déclenchée au rang 7, par manches de deux semaines. Le chef reçoit une Larme par manche à confier à un autre membre. Les points incluent 2 000 par jour de possession, 10 000 par destruction et 2 000 pour la présence en fin de manche. Atteindre le niveau 10 entraîne la victoire, avec seuils finaux indiqués 344 000 en classique et 254 000 en stratégique. Les attaques sont limitées aux niveaux voisins de compétition. Des portails après 24 heures et ruines liées aux cités structurent l’accès. Une Larme détruite disparaît ; les Graals sont réinitialisés à la fin de la manche. Ces règles constituent une **fin de campagne alternative**, pas une extension du maintien de treize monuments. Les barèmes intermédiaires et tie-breaks restent incomplets. [G25]

## Hérédité et continuité intermondes

L’hérédité transmet des avantages et choix vers une nouvelle campagne ; elle ne doit pas conserver automatiquement les cités, ressources ou armées de la campagne terminée. Les compétences et leurs niveaux sont dans `bonus.json`. Le coût d’achat des rangs et l’intégralité du processus de sélection ne sont pas encore reconstitués. [CODE-01-DATA ; synthèse]

| Version | Calcul décrit | Limite documentaire |
| --- | --- | --- |
| S1–S2 | Rang personnel moyen retenu pendant la guerre, union/titre, coefficient des Graals, bonus au gagnant | G26 : Graal acquis 1, volé 0,6, acquis puis perdu 0,4 ; formule par morceaux ambiguë à exactement cinq |
| S3 | Classement final de l’alliance et union de faction ; guide annonçant jusqu’à 210 points | G27 : changement du rôle des titres ; choix pour un nouveau monde sans effet sur les mondes existants |
| S4 | Composantes personnelles, alliance, union et victoire/tournoi ou forteresses PvE | G28 : maximum indiqué 360, puis multiplicateur 1,25 en stratégique, soit 450 |

Les unions dynastiques/factions et l’héritier sont des mécanismes distincts de l’appartenance à l’alliance. Les conditions d’éligibilité, de choix du partenaire et de transfert d’artéfact doivent être vérifiées avant une reproduction complète. Une implémentation initiale peut laisser ces modules désactivés dans un monde de test, mais devra annoncer cette limitation au lieu de qualifier ce monde de reproduction intégrale.

## Clôture — proposition de contrat

La fin doit produire un résultat unique : vainqueur, état final des classements, contributions, hérédité calculée et version du barème. Les ordres en cours reçoivent un traitement explicite ; aucun transfert économique ne doit continuer après le gel si le profil l’interdit. Le décompte des monuments doit utiliser des objets effectivement actifs, sans compter une Larme détenue, une construction inachevée et un monument détruit comme trois contributions équivalentes.

## Statut de périmètre après confirmation utilisateur

**DECISION-USER, 22/10/2026 :** le profil à reconstruire est le PvP classique avec Guerre des Larmes. Les sections tournoi S4 et hérédité tardive restent ici pour documenter les différences, sans entrer dans le socle. Les captures ajoutées ne contiennent pas d’écran complet de Guerre des Larmes ou d’alliance : elles n’augmentent pas le degré de preuve des seuils, du maintien, du vol ou de la clôture. Voir [profil confirmé](../specifications/PROFIL-PVP-CLASSIQUE.md), U31–U35 et les guides associés.
