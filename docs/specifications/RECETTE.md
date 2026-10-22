# Recette, fidélité et traçabilité

## Ce qui est vérifié dans ce dépôt

Le validateur contrôle les fichiers JSON, les comptages, les références structurelles, les liens Markdown locaux et les cas arithmétiques simples transcrits du calculateur. L’extracteur vérifie les empreintes des sources avant génération. **Aucun test de moteur de jeu, de navigateur ou de serveur Ubisoft n’est exécuté : ce dépôt est documentaire.**

Les cas de `combat-reference-cases.json` utilisent des unités fictives de puissance 100 pour isoler les formules. Ils ne constituent pas des rapports historiques. Nombre de rapports authentiques convertis en fixtures à ce stade : **zéro**. Ce compteur doit rester visible jusqu’à constitution d’un corpus.

## Matrice de recette à exécuter pendant la reconstruction

État de tous les scénarios ci-dessous : **spécifié, non exécuté sur un jeu reconstruit**. Les sources justifient les mécanismes ; les exigences de concurrence, confidentialité et reprise sont proposées pour le nouveau serveur.

| Cas | Exigences | Situation et résultat à vérifier | Référence |
| --- | --- | --- | --- |
| T01 | REQ-DATA-01 | Un import conserve l’indice de chaque unité malgré les `id` absents | CODE-01-DATA |
| T02 | REQ-DATA-01 | Un archétype lit sa courbe de statistique ; la courbe zéro ne lit jamais la colonne XP | CODE-01-DATA |
| T03 | REQ-DATA-01 | Aucun PNJ sans production n’est rendu recrutable par défaut | Catalogue ; PROP |
| T04 | REQ-BUILD-01 | Un prérequis manquant empêche la construction et ne consomme rien | Catalogue ; contrat |
| T05 | REQ-BUILD-01, REQ-ORDER-01 | Deux confirmations identiques créent un chantier et un débit | PROP |
| T06 | REQ-STOCK-01 | Un bonus de production ajouté au milieu d’un intervalle ne s’applique pas rétroactivement | PROP |
| T07 | REQ-MINE-01 | Distinguer production pendant amélioration et interruption pendant extension | G11 |
| T08 | REQ-REGION-01 | Contiguïté orthogonale et diagonale n’accordent pas le même bonus de recherche | G12 |
| T09 | REQ-STOCK-01 | Crédit au plafond, crédit de récompense et convoi excédentaire suivent leurs politiques distinctes | U30 |
| T10 | REQ-RECRUIT-01 | Ressources et recrues ne peuvent pas être réservées simultanément par deux ordres | PROP |
| T11 | REQ-UPGRADE-01 | Améliorer une lignée change type/arme selon la table et conserve l’effectif hors coût | CODE-01-DATA |
| T12 | REQ-HERO-02 | Un héros occupé ne peut pas démarrer une seconde activité exclusive | Contrat ; U05 |
| T13 | REQ-EQUIP-01 | Remplacer un objet invalide le budget ou l’emplacement sans dupliquer l’ancien | G07 ; PROP |
| T14 | REQ-MAGIC-01 | Un sort d’école/cercle interdit est refusé ; recharge et tour de lancement sont distincts | CODE-01/G14 |
| T15 | REQ-COMBAT-01 | Contre-armes dans les trois directions, puis arme identique sans bonus | CODE-01-COMBAT |
| T16 | REQ-COMBAT-01 | Seuil PvE égal puis juste supérieur ; toutes frontières PvP avec `floor(30r)` | CODE-01-COMBAT |
| T17 | REQ-COMBAT-01 | Bonus proportionnel et bonus fixe sont appliqués à leurs bases respectives | CODE-01-COMBAT |
| T18 | REQ-COMBAT-01 | Un peloton vainqueur affronte le suivant avec son effectif restant | CODE-01-COMBAT |
| T19 | REQ-COMBAT-01 | Dispersion, minimum d’un mort et pertes définitives ne sont pas confondus | CODE-01-COMBAT |
| T20 | REQ-COMBAT-01 | Écrasement exact, frontière sans marqueur, égalité et faux nul | Code ; U11 |
| T21 | REQ-COMBAT-01 | Sorts, tirs préalables et résurrection reproduisent des rapports authentiques | Code ; U13/U26 |
| T22 | REQ-COMBAT-01 | Une invocation ne devient pas un effectif permanent ni une XP artificielle | Code ; U13 |
| T23 | REQ-REPORT-01 | Même instantané et même version donnent même résultat après redémarrage | PROP |
| T24 | REQ-MOVE-01 | Trajet court traversant le bord de carte ; distance diagonale | CODE-01-DIST |
| T25 | REQ-MOVE-01 | Halte croisant la trêve, reste de halte au réveil et trajet retour | G05 ; U10 |
| T26 | REQ-MOVE-01 | Frontière ou diplomatie change pendant la marche : politique explicite et ETA expliquée | U09/U32 |
| T27 | REQ-SPY-01, REQ-VIS-01 | Un rapport partiel n’expose pas les champs inconnus via l’API | G15 ; PROP |
| T28 | REQ-RAID-01 | Pillage, disponibilité des mines et transport du butin sont cohérents | G06 ; U22 |
| T29 | REQ-SIEGE-01 | Deux armées arrivent pour installer le même siège : un seul siège accepté | G10 ; atomicité PROP |
| T30 | REQ-SIEGE-02 | Bombardement et prise de ville modifient chaque bâtiment/stock une seule fois | G10 ; PROP |
| T31 | REQ-SIEGE-03 | Sortie, secours et levée respectent le verrou d’une opération en cours | G10 ; U19 |
| T32 | REQ-CITY-01 | Colonisation et prise simultanées ne dépassent pas les droits de possession | G08 ; PROP |
| T33 | REQ-TRADE-01 | Deux acheteurs d’un lot : un règlement, un refus, conservation des ressources | PROP |
| T34 | REQ-CONVOY-01 | Convoi bloqué par un siège ou cible changée : aucun chargement perdu/dupliqué arbitrairement | U19/U28 |
| T35 | REQ-TRADE-01 | Balance économique évaluée au bon instant et désactivée seulement selon le profil | G17 ; U29 |
| T36 | REQ-ALLY-01 | Départ d’un membre recalcule contributions et sort des monuments | G09/G01 |
| T37 | REQ-ALLY-02 | Un officier sans permission ne consulte pas les rapports réservés | G09 ; PROP |
| T38 | REQ-ALLY-03 | Expiration/recharge et exclusion des compétences collectives | G09 ; CODE-01-DATA |
| T39 | REQ-PATH-01 | Franchissement d’un rang récompensé une seule fois, même après rejeu | G19–G21 ; PROP |
| T40 | REQ-TEAR-01 | Chaque grande voie respecte étapes, coût et limitations ; annulation/capture explicitée | G02–G04 |
| T41 | REQ-GRAIL-01 | Une Larme ne finance pas deux monuments ; chantier non terminé non compté | G01 ; PROP |
| T42 | REQ-WIN-01 | Seuil atteint, rompu puis rétabli : continuité réinitialisée, pas temps cumulé | G01 |
| T43 | REQ-TOURNAMENT-01 | Fin de manche S4 applique ses propres points et retire les monuments concernés | G25 |
| T44 | REQ-COOP-01 | Chute d’une forteresse change la récompense et la progression selon la règle PvE | SRC-12 ; U36 |
| T45 | REQ-LEGACY-01, REQ-END-01 | Résultat gelé et hérédité attribuée une seule fois ; aucun transfert implicite d’armée | G26–G28 ; PROP |
| T46 | REQ-AUTH-01 | Une commande d’un autre monde ou propriétaire est refusée sans effet | PROP |
| T47 | REQ-TIME-01 | Déconnexion puis reprise après échéance ne perdent ni ordre ni résultat | PROP |
| T48 | REQ-END-01 | Action militaire et fin de campagne simultanées suivent une priorité documentée | U14 |
| T49 | REQ-HERO-01 | Deux recrutements concurrents d’une même offre de taverne ne créent qu’un héros | U24 ; PROP |
| T50 | REQ-PVE-01 | Une rencontre déjà résolue ne redonne ni récompense ni libération de case | PROP |
| T51 | REQ-WORLD-01 | Un monde conserve son profil et interdit les commandes incompatibles avec sa phase | Variantes ; PROP |
| T52 | REQ-ARMY-01 | Diviser, fusionner et réordonner conserve les effectifs et respecte la limite engagée | Code ; contrat |

## Format de fixture historique proposé

Chaque fixture doit contenir : identifiant ; origine et autorisation de conserver le rapport ; date et monde ; saison/profil ; entrée avant bataille ; pelotons et ordre ; héros et tous leurs bonus ; magie et tours ; lieu/fortifications ; résultat observé ; champs inconnus ; règle ou formule concernée. Les informations personnelles non nécessaires peuvent être remplacées par des pseudonymes, tout en conservant la cohérence des rôles.

Un résultat avec équipement inconnu n’est pas un oracle exact. Il reste utile comme preuve partielle si l’incertitude est indiquée. Comparer d’abord puissance brute et admission, puis préludes, chaque échange, pertes finales et XP ; ne pas masquer plusieurs erreurs qui s’annulent dans le total.

## Qualification par module

| Niveau | Condition |
| --- | --- |
| Documenté | Sources, versions, paramètres et inconnues explicites |
| Implémenté | Parcours fonctionnel complet dans le code du successeur |
| Vérifié | Scénarios techniques et fonctionnels exécutés avec preuves |
| Fidèle au profil | Résultats comparés à des preuves historiques contextualisées |

La présente livraison atteint le niveau documentaire avec vérification de ses fichiers et de certaines arithmétiques de référence. Elle n’atteint pas les trois niveaux d’exécution du jeu.
