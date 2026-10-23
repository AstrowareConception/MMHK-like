# Simulation V4 — villes multiples, influence, reliques et économie locale

**23 octobre 2026 · 24 exécutions réelles (18 scénarios principaux + 6 essais d'entretien).** Les équations non attestées de MMHK saison 2 restent **des hypothèses de laboratoire**. La V4 améliore la V3, sans être un moteur historique complet.

## Mécaniques intégrées au prototype Python

- Carte **torique**, trois densités comparées : 120, 170 et 220 régions/joueur à 70 % de la capacité.
- Taux de remplissage 40 %, 70 % et 100 %, capacité nominale de **40 joueurs**, avec un nombre d'alliances dépendant du remplissage.
- **Plusieurs cités par joueur**, plafond dix ; colonisation après une phase de protection de sept jours, prix de base croissant et majoration quadratique hors influence propre/alliée.
- **Or stocké ville par ville** ; paiement de l'entretien sur le stock de la ville hébergeant les troupes ; **caravanes entre ses propres cités**, avec livraison lors de la prochaine journée modélisée.
- Rayon militaire recalculé **quotidiennement** avec une **moyenne glissante de quatre relevés**, domination simplifiée des bâtiments et table de paliers documentée (0 / 30k / 100k / 250k / 500k / 1M).
- Contrôle des Sphinx, Trésoreries des Nains et Dolmens selon les scores de cités/alliance décroissant avec la distance ; bonus nominaux −7 % entretien et +5 % or.
- Deux politiques de comportement : **spread** (développement dispersé sans ciblage fort) et **objective** (renforcement des cités voisines d'une relique et valorisation de la fondation proche des Sphinx).
- Une économie militaire horaire **n'est PAS encore simulée fidèlement** : le modèle règle une échéance abstraite quotidienne. L'attrition déclenchée par un impayé correspond au ratio prévu, mais pas à la vraie succession de 24 prélèvements par jour.

Le code complet exécuté est disponible dans le **pack ZIP joint à la conversation**, avec les données brutes et agrégées. Le dépôt GitHub conserve le présent rapport et les [résultats structurés](../../data/analysis/relic-v4-multicity-24-runs-2026-10-23.json). La source Python de cette V4 n'est pas encore poussée dans GitHub ; ne pas considérer le fichier de configuration de V3 comme suffisant pour reproduire ces sorties.

## Campagne comparative — 18 exécutions

Moyennes de **deux comportements**, une seule graine par configuration. Les parts de reliques contrôlées diffèrent aussi selon leur nombre discret sur chaque carte.

| Densité | Remplissage | Part de reliques contrôlées | Cités par joueur |
| ---: | ---: | ---: | ---: |
| 120 | 40 % | 15,6 % | 3,09 |
| 120 | **70 %** | **37,5 %** | **2,95** |
| 120 | 100 % | 62,5 % | 3,14 |
| 170 | 40 % | 8,0 % | 2,91 |
| 170 | **70 %** | **12,0 %** | **3,00** |
| 170 | 100 % | 24,0 % | 2,91 |
| 220 | 40 % | 10,0 % | 3,00 |
| 220 | **70 %** | **14,0 %** | **3,18** |
| 220 | 100 % | 24,0 % | 3,21 |

**Attention à la faiblesse de l'échantillon :** une seule graine principale a été utilisée, et l'implantation des reliques du maillage crée des effets de seuil. Il serait erroné de classer les densités 170 et 220 à partir des écarts 12 % contre 14 %. La différence 120/170 constitue une piste mais **pas une preuve suffisante de meilleur gameplay**.

### Influence de la stratégie

Sur l'ensemble des densités et taux de remplissage :

- **Spread** : 20,9 % des reliques contrôlées, environ 3,05 villes par joueur.
- **Objective** : 25,2 % des reliques contrôlées, environ 3,04 villes par joueur.

L'objectif « relique » tend à améliorer légèrement la prise de sites sans augmenter le nombre de cités. Cependant les **transferts directs de reliques entre alliances rivales sont presque absents** dans cette V4, qui n'intègre ni attaque de cité ni choix explicite d'assaut sur une garnison.

Le bénéfice économique net d'un Sphinx n'est donc toujours **pas démontré**. L'expérience confirme surtout l'effet de placer la stratégie de frontière dans l'algorithme de recrutement/colonisation, pas une rentabilité historique.

## Stress-test de l'entretien — 6 exécutions supplémentaires

Densité 170, remplissage 70 %, graine 23. Trois multiplicateurs de coût de garnison (1, 4, 10), deux comportements.

| Coût d'entretien relatif | Villes / joueur spread | Villes / joueur objective | Défauts d'entretien spread | Défauts d'entretien objective |
| ---: | ---: | ---: | ---: | ---: |
| ×1 | 2,86 | 3,11 | 0 | 0 |
| ×4 | 2,61 | 2,39 | 0 | 0 |
| **×10** | **1,75** | **1,79** | **90** | **132** |

**C'est un résultat central de V4 :** si la puissance militaire coûte trop cher, les joueurs renoncent aux colonies et peuvent perdre leurs garnisons à cause de l'attrition. Le mécanisme d'entretien n'est pas un détail économique : il modifie directement la forme de la carte politique et la compétition pour les reliques.

À ×1, le prélèvement d'entretien est encore trop faible pour tester correctement l'attrition ; ×10 provoque au contraire des pertes très sévères. Les coefficients S1/S2 devront être recherchés ou les scénarios complétés par des fourchettes de coûts plausibles.

## Limites de validité et corrections de conception

1. **Une seule graine** par case de la matrice principale : les résultats sont descriptifs, non une estimation fiable d'une moyenne.
2. Les troupes sont représentées par **une puissance agrégée**, sans pelotons T1–T7, héros, défense réelle, recrutement historique ni simulation de combat Jactari.
3. **Pas de guerre effective** : les « guerres de reliques » demeurent des compétitions de scores territoriaux ; il manque les attaques contre les cités, le rappel des troupes et les pertes en PvP.
4. **Le Dolmen n'a pas de bénéfice mesurable** dans cette V4 faute de XP/combat.
5. L'entretien est calculé **au pas quotidien**, non à 24 échéances horaires, et la trêve n'est pas simulée.
6. Les bonus des Sphinx sont plafonnés par un **garde-fou synthétique** : aucun plafond historique officiel n'est établi dans nos sources.
7. Les coûts d'expansion conduisent à une très large proportion de fondations hors influence ; la politique d'expansion et les seuils de domination doivent être recalibrés.
8. L'implantation des nouveaux joueurs, les taux d'inactivité, les codes amis, les zones prohibées et les transferts marchands interalliances sont encore simplifiés.
9. Le nombre de sites est limité par le maillage de laboratoire ; aucune contrainte d'accessibilité multi-alliance garantie n'a été prouvée.

## Ce que devrait être la V5

La V5 devra tester **une relique située à la frontière de deux alliances en concurrence active**, en retenant plusieurs villes par joueur mais en ajoutant des **ordres offensifs, pertes de troupes, renforts, colonisation sous pression et défense du site**. Les décisions de chaque alliance devront comparer explicitement : revenu collectif anticipé, coût total des garnisons et du transport sur quatre jours, risque de perdre le site, et opportunité d'investir les mêmes ressources dans une autre colonie.

Avant une nouvelle grille massive, il est prioritaire de disposer d'un **petit modèle explicable avec tests de cohérence**, montrant au moins une capture par influence, une perte, une récupération et une dépense nette calculée **pour tous les membres** d'une alliance.

**Conclusion :** V4 démontre que l'économie locale, le poids des garnisons et le coût des nouvelles cités influencent fortement le contrôle territorial. Elle **ne démontre pas encore l'équilibre optimal des tailles de monde** ni une guerre de reliques historiquement fidèle. Le calibrage à 70 % reste une règle produit décidée, mais la densité est toujours expérimentale.
