# Simulation économique et territoriale V2 — 216 scénarios

**Date : 23 octobre 2026 · Résultats exécutés dans le conteneur Python, pas simulations du serveur Ubisoft.**

Ce lot répond à la demande de coupler **rayon d'influence**, **garnisons stationnées**, **entretien**, **épargne économique**, **prix croissant des villes**, **surcoût hors influence**, **participation réelle** et **occupation du serveur**. L'objectif reste de déterminer un monde intéressant à **70 %** de sa capacité maximale, volontairement plus tendu au-delà.

## 1. Protocole effectivement exécuté

Trois profils économiques × **72 simulations** = **216 configurations**. Chaque profil explore :

- **Trois densités de carte** : 120, 170, 220 régions par joueur à 70 % de remplissage, sur carte torique.
- **Six occupations** : 20, 40, 55, 70, 85 et 100 % d'une capacité nominale de 100 inscriptions.
- **Deux niveaux de joueurs actifs** : 55 et 90 % des inscrits.
- **Deux comportements d'expansion** : `compact` et `frontier` (frontières).
- **Deux graines** : 11 et 23.
- **Huit phases** d'évolution, arrivées échelonnées, une phase initiale sans droit à la seconde cité.

Une cité a une puissance de garnison, achetée avec de l'or au détriment des futures colonies. Le rayon d'influence va de 0 à 6 selon des seuils de troupes **fictifs** `[0, 14, 40, 92, 175, 310, 530]`. **Aucun rayon 6 n'a été atteint pendant ces huit phases**. L'entretien est gratuit sous un petit seuil militaire, puis croît selon une fonction fortement non linéaire. Un impayé absorbe l'or disponible et déclenche une attrition de `ceil(10 %)` des effectifs concernés lors d'une échéance simulée.

Le prix d'une cité supplémentaire suit une croissance fictive `11 × 1,6^(nombre de cités existantes − 1)`, multipliée par `1 + 0,55d + 0,14d²` où `d` est la distance minimale hors de l'union des influences alliées. La colonisation sous influence adverse est refusée. **Cette formule n'est pas une valeur S2 vérifiée.**

Les revenus et coûts sont exprimés en **unités abstraites par phase**, et non en or/jour authentique. Les seuils de progression et la durée d'une phase n'ont pas été calibrés sur la saison 2.

## 2. Résultats au remplissage de référence de 70 %

Chaque cellule ci-dessous est une moyenne sur **quatre configurations seulement** (deux niveaux d'activité, deux stratégies, une graine ? Non : les jeux sont deux graines pour chaque combinaison, donc **huit exécutions par cellule et profil**).

| Densité cible | Profil économique | Villes / joueur | Paires d'alliances en contact | Refus pour manque d'or | Phases d'entretien impayé | Soldats perdus par attrition |
| ---: | --- | ---: | ---: | ---: | ---: | ---: |
| 120 | Favorable | 2,60 | **14,00** | 44,25 | 0 | 0 |
| 170 | Favorable | 2,68 | **3,75** | 51,75 | 0 | 0 |
| 220 | Favorable | 2,65 | **3,50** | 56,50 | 0 | 0 |
| 120 | Restrictif | 1,81 | **14,50** | 99,50 | 0 | 0 |
| 170 | Restrictif | 1,86 | **5,50** | 107,75 | 0 | 0 |
| 220 | Restrictif | 1,82 | **3,50** | 104,75 | 0 | 0 |
| 120 | Entretien stressant | 1,58 | **6,75** | 115,50 | 57,00 | 816 |
| 170 | Entretien stressant | 1,59 | **2,00** | 123,50 | 57,50 | 821 |
| 220 | Entretien stressant | 1,58 | **0,50** | 128,25 | 61,50 | 875 |

**Correction statistique de lecture :** chaque moyenne agrège **8 exécutions** : 2 activités × 2 stratégies × 2 graines. C'est une comparaison utile, mais trop peu de graines pour figer un dimensionnement de production.

Les catégories `unpaid upkeep phases` comptent des **joueurs-phases** en défaut de règlement. Les soldats perdus sont des effectifs de simulation cumulés sur un scénario, **pas une estimation de pertes MMHK S2**.

### À 100 % de remplissage

Pour une densité de 170, le nombre moyen de paires d'alliances en contact passe de **3,75 à 15,75** en économie favorable, **5,50 à 17,75** en économie restrictive et **2,00 à 8,00** en entretien stressant. La hausse de friction attendue lors du surbooking est visible dans ces configurations, mais **l'effet exact varie fortement avec les hypothèses économiques**.

## 3. Interprétations utiles

**A. La densité et la solvabilité sont couplées.** Dans le profil d'entretien stressant, les joueurs fondent en moyenne environ **1,6 ville** contre **2,6–2,7** sous le profil favorable. Une carte de même superficie devient mécaniquement bien plus dispersée en termes de cités militaires.

**B. Les refus économiques sont mesurables.** La hausse de prix des villes provoque beaucoup de tentatives refusées pour manque d'or, particulièrement en économie restrictive. Cela confirme qu'un coût croissant est un levier important, mais pas que les coefficients fictifs sont satisfaisants.

**C. L'attrition est une règle radicale.** Dans le profil stressant, les défauts de paiement déclenchent effectivement l'attrition de 10 % arrondie à l'entier supérieur et consomment l'or disponible. Le joueur perd des troupes, ce qui peut réduire immédiatement sa capacité d'influence : une grande garnison est donc un engagement risqué.

**D. La friction est essentiellement un indicateur de contact spatial.** Le modèle ne simule ni guerres, ni sièges, ni prises de cité. Une frontière commune est une opportunité de rivalité, pas une garantie qu'une guerre commence.

## 4. Limites et anomalies à traiter avant décision

1. **Deux graines par configuration**, sans intervalle de confiance exploitable.
2. **Les revenus sont agrégés au niveau du joueur** pour simplifier le modèle, contrairement à la règle confirmée de stocks d'or **propres à chaque cité**. La V3 devra absolument gérer les silos/comptes locaux et les caravanes.
3. Une **phase est abstraite** : l'attrition ne suit pas une vraie horloge horaire, et les sept jours de protection sont simplifiés à une phase après l'arrivée.
4. Les **refus pour influence ennemie sont tous nuls** dans les scénarios exécutés : les candidats se trouvent majoritairement près des cités propres, sans réellement éprouver une tentative de colonisation hostile. Le modèle échoue donc à tester un blocage territorial pourtant central.
5. Le **surcoût hors influence est sous-exercé** : la majoration moyenne des colonies acceptées reste proche de 1 à 1,1, car les stratégies privilégient des destinations dans l'influence. Il est impossible d'en déduire une élasticité réelle du coût de colonisation à la distance.
6. **Aucune influence de rayon 6** n'est atteinte, cohérent avec son coût prohibitif mais insuffisant pour valider les frontières de fin de partie.
7. Une activité de **55 % ou 90 % est figée** pour toute la simulation. L'inactivité, le retour d'un ancien joueur et l'élimination ne sont pas simulés comme événements évolutifs.
8. La force des héros, artéfacts, combats PvP, reliques, obstacles, heures de trêve, transactions de caravanes et influences historiques S2 sont absents.

Les résultats **ne prouvent pas** qu'une densité de 120 est « meilleure » : plus de contacts peut aussi signifier des blocages trop précoces. Le manque de vrai modèle d'influence contestée empêche toute recommandation définitive.

## 5. Priorités de la V3

- **Stocks d'or réellement locaux** : revenus, entretien et dépenses par cité ; transfert possible via caravane non attaquable, avec capacité et temps de trajet.
- **Coût d'influence militaire** : seuils de puissance à documenter S2, bonus des héros présents, investissement militaire alternatif au recrutement pour conquérir.
- **Tentatives d'expansion comparées** : compacte, frontière et saut coûteux au-delà de la zone, avec refus précis (`adverse_influence`, `unaffordable`, `occupied`, `not_eligible`).
- **Population et alliances dynamiques** : joueurs arrivant tard, inactivité, retour, guerre et captures ; vérifier des mondes à 20 %, 40 %, 70 % et 100 % d'inscription.
- **Équité et jouabilité**, mesurées à chaque phase : part de joueurs pouvant coloniser, taux de blocage pour la deuxième ville, temps de première frontière contestée, proportion d'alliances isolées.

## Artefacts

Le résumé GitHub se trouve dans [data/analysis/economic-territory-v2-216-scenarios-2026-10-23.json](../../data/analysis/economic-territory-v2-216-scenarios-2026-10-23.json). Les **trois scripts Python exécutés**, leurs résultats bruts et leurs synthèses complètes restent accessibles dans les fichiers joints à la conversation ; aucune archive des 216 sorties détaillées n'est présentée comme déjà poussée dans GitHub.

**Conclusion :** la vraie densité optimale dépend énormément du couplage garnison/entretien/colonisation. Le **70 %** reste notre référence de game design confirmée. Il faut encore construire la V3 locale et simuler les frontières avant de transformer 120, 170 ou 220 régions par joueur en règle définitive.
