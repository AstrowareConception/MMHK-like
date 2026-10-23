# Guerre des reliques — simulation économique et territoriale V3

**23 octobre 2026 — 162 scénarios de campagne + 4 scénarios de frontière ciblée exécutés.** Toutes les fonctions de coût, de croissance militaire et de décrochage territorial qui ne sont pas appuyées par une preuve S2 sont des **hypothèses de laboratoire**. Aucune simulation n'est un résultat serveur Ubisoft.

## Objet de l'expérience

Vérifier comment les reliques territoriales influencent les choix militaires et l'économie collective de l'alliance. Cette simulation s'appuie sur les [seuils historiques documentés en 2013](../../data/reference/world-influence-and-sites-2009-2013.json) : rayons 1–6 aux dominations 0 / 30 000 / 100 000 / 250 000 / 500 000 / 1 000 000, moyenne glissante de **quatre jours**, domination apportée par les bâtiments, influence en disque discret sur une carte torique.

Les valeurs nominales **Sphinx −7 % entretien ; Trésorerie des Nains +5 % or ; Dolmen +10 % XP** sont issues du tutoriel historique de 2009. Leur application exacte en saison 2, le plafonnement éventuel et les arrondis restent à valider.

## Méthode

**162 simulations :** densités de référence 120/170/220 régions par joueur à 70 %, taux réels 40/70/100 %, économie militaire normale/stressante, stratégies de renfort économie/mixte/militaire et graines 11/23/47 (3×3×2×3×3). 16 échéances quotidiennes, carte torique, trois alliances, une cité par participant et niveaux urbains différents.

Chaque jour :
1. Appliquer les bonus **de la veille** pour éviter qu'un nouveau Sphinx modifie rétroactivement les calculs.
2. Verser le revenu local fictif, débiter l'entretien horaire **agrégé en un pas quotidien simplifié** et traiter les pertes éventuelles.
3. Investir une fraction du stock de cité en renforts militaires, puis calculer la moyenne glissante sur quatre jours et le palier du rayon.
4. Départager chaque site mondial à partir du score spatial proposé `(domination+1)/(1+distance)^2` dans le rayon de chaque cité ; sommer les contributions alliées.
5. Recalculer la possession des sites et les bonus d'alliance du prochain jour.

**Limite majeure :** une cité par joueur seulement, donc pas encore de colonies 2–10, ni sièges ou captures. Le modèle simplifie aussi les revenus et l'entretien en unités abstraites, sans vraie économie MMHK S2. Une limite expérimentale de **80 % de réduction maximale d'entretien** empêche des coûts négatifs quand de nombreux Sphinx sont contrôlés ; ce n'est **pas** une règle historique trouvée.

## Résultats — possessions en fin des 16 jours

| Densité | Remplissage | Sites contrôlés | Changements directs d'alliance moyens | Économie d'entretien simulée | Surplus d'or simulé |
| ---: | ---: | ---: | ---: | ---: | ---: |
| 120 | 40 % | 12,2 % | 0,00 | 1 136 | 499 |
| 170 | 40 % | 9,0 % | 0,00 | 822 | 257 |
| 220 | 40 % | 4,0 % | 0,00 | 516 | 529 |
| 120 | **70 %** | **18,3 %** | **0,83** | 2 844 | 1 428 |
| 170 | **70 %** | **13,2 %** | **0,11** | 2 157 | 1 136 |
| 220 | **70 %** | **12,1 %** | **0,00** | 2 983 | 1 978 |
| 120 | 100 % | 28,2 % | 0,56 | 5 527 | 2 469 |
| 170 | 100 % | 18,6 % | 0,83 | 4 452 | 3 106 |
| 220 | 100 % | 14,6 % | 0,72 | 5 589 | 3 001 |

Les colonnes d'or comptabilisent des **unités fictives cumulées par simulation**, non des pièces d'or/jour officielles. Elles ne peuvent pas être utilisées pour calibrer directement les tarifs S2. Les parts contrôlées dépendent aussi du nombre de sites présent dans une carte donnée : **ne pas interpréter un total économique plus élevé comme une victoire d'une stratégie**.

**Résultat central :** avec des villes et sites répartis aléatoirement, les changements d'alliance sont beaucoup trop rares pour simuler une véritable « guerre des reliques ». Le laboratoire mesure plutôt une occupation territoriale opportuniste. L'hypothèse selon laquelle les reliques seraient spontanément contestées ne tient pas dans cette version simplifiée.

## Expérience contrôlée : deux alliances disputent le même Sphinx

Quatre scénarios supplémentaires sur une carte réduite placent deux villes opposées à distance égale d'un Sphinx, avec plusieurs jours de renforts et retraits militaires. Le contrôle est recalculé quotidiennement sur **quatre jours glissants**.

| Scénario | Transitions de contrôle observées | Jours avec un contrôleur | Économie nominale fictive totale (Sphinx) |
| --- | ---: | ---: | ---: |
| Garnisons de départ équilibrées, renforts successifs | 3 | 19 / 24 | 665 |
| Défenseur B initialement plus fort | 2 | 24 / 24 | 840 |
| Défenseur A initialement plus fort | 2 | 24 / 24 | 840 |
| Même combat d'influence sans bonus économique | 3 | 19 / 24 | 0 |

Le test utilise un **coût d'entretien collectif fictif de 500 unités/jour** ; un Sphinx économise donc 35 unités/jour lorsque son contrôle est stable. La succession d'occupations et de récupérations montre que le mécanisme de frontière est techniquement reproductible. Elle ne démontre pas une rentabilité stratégique positive pour le renfort : le **coût réel des troupes supplémentaires n'est pas inclus dans le bénéfice de 35**.

## Implications pour la suite

**A. Il faut organiser la compétition autour des sites.** La densité globale de population ne suffit pas. Des reliques stratégiques doivent se trouver à la portée de plusieurs alliances au fil de leur expansion, sans placement initial artificiellement hostile. Cela peut relever d'une génération géographique neutre suivie d'un **score d'accessibilité concurrente**, plutôt que d'une implantation des sites volontairement biaisée.

**B. Le coût de prise d'une relique doit être comparé à sa valeur d'alliance.** Les cinq Sphinx donnant nominalement 35 % de réduction d'entretien font naître un risque de boule de neige. Le modèle suivant doit comparer l'or dépensé pour maintenir la garnison quatre jours et la somme des économies effectivement gagnées sur les villes de tous les membres.

**C. La possession doit être recalculée après évolution militaire.** Une alliance peut perdre l'effet d'un site sans qu'aucune cité change de propriétaire : diminuer durablement une garnison suffit potentiellement à déplacer la frontière.

**D. Il faut séparer les sites de bonus des objectifs de la Guerre des Larmes.** Les premiers créent une géopolitique de midgame, tandis que Graals/monuments déterminent la victoire finale.

## Prochaine V4 : simulateur de conflit stratégique

Construire **plusieurs villes par joueur**, caravanes locales, **entretiens horaires par cité** et coût croissant des villes, puis introduire des choix actifs d'alliance : renforcer, retirer, avancer une colonie, attaquer une cité, défendre une relique, relocaliser des troupes. Introduire des sites choisis comme objectifs tactiques pour mesurer **le prix réellement marginal** du Sphinx, Trésorerie ou Dolmen et la durée des périodes de contrôle.

Ensuite seulement arbitrer les presets à 70 %, sur deux critères complémentaires :
- **pression territoriale** : chance de rencontrer une alliance rivale à la portée d'une expansion réaliste ;
- **valeur stratégique disputée** : fréquence de changements de contrôle et rentabilité nette des investissements militaires.

## Fichiers

- [Configuration de la V3](../../data/game-design/relic-wars-lab.json)
- [Synthèse des 162 simulations](../../data/analysis/relic-wars-162-summary-2026-10-23.json)
- [Table historique des paliers et bonus](../../data/reference/world-influence-and-sites-2009-2013.json)
- [Règles des reliques](17-RELIQUES-ET-GUERRES-D-INFLUENCE.md)

Les scripts Python exécutés et les données complètes sont également transmis comme fichiers téléchargeables dans la conversation. **Les scripts n'ont pas encore été publiés dans GitHub** ; le dépôt contient actuellement la configuration, les résultats synthétiques et le compte rendu d'expérience.
