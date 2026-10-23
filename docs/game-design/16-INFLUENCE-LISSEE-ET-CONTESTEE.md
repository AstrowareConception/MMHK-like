# Influence territoriale : moyenne glissante, paliers et contestation

**MISE À JOUR POSTÉRIEURE (23/10/2026) :** la [FAQ 2013](https://www.might-and-magic.ru/articles/_/heroes-kingdoms/hk-towns/hk_city_faq) fournit le tableau réel documenté de seuils (rayons 1 à 6 : 0 / 30 000 / 100 000 / 250 000 / 500 000 / **1 000 000**). Le porteur de projet privilégie désormais **quatre jours**. Les seuils à 10 000/30 000/75 000/150 000/500 000 et la fenêtre de six jours dans le texte ci-dessous sont **des hypothèses expérimentales antérieures, remplacées**. Le nouveau contrat est [Reliques et guerres d'influence](17-RELIQUES-ET-GUERRES-D-INFLUENCE.md).


**23 octobre 2026 — nouvelle précision de game design.** Une cité projette initialement un contrôle local de **rayon 1**. L'influence est recalculée **une fois par jour**, selon la puissance militaire **stationnée** en ville lissée sur une fenêtre glissante. La valeur de travail du projet est **six jours**, avec seuil de rayon 6 vers **500 000 de puissance** selon souvenir utilisateur. L'entretien horaire rend cette puissance coûteuse à maintenir.

## Divergence historique à conserver

Un **tutoriel de 2009 recopié sur Hardware.fr** documente :
- domination provenant des bâtiments et de la puissance militaire de la ville ;
- arbitrage sur chaque case en fonction de la distance entre cité et case ;
- recalcul global quotidien ;
- moyenne des **quatre jours précédents**, **pas six**.

Source historique : https://forum.hardware.fr/hfr/JeuxVideo/PC/kingdom-tactic-gratuit-sujet_154147_1.htm . Le résumé externe de 2010 https://myosg.wordpress.com/2010/06/03/zones-of-control/ corrobore la notion d'emprise collective d'alliance et l'effet des frontières sur les sièges.

**Les quatre jours proviennent d'une source de 2009** ; les **six jours viennent d'un souvenir S2**. Il ne faut ni effacer le désaccord ni présenter la valeur 500 000 comme prouvée. Le moteur de laboratoire accepte les profils `window_days: 4` et `window_days: 6` pour mesurer les conséquences.

## Contrat temporel proposé

Pour la cité `c`, à l'instant du recalcul quotidien `D` :

```text
military_average(c,D) = SUM(stationed_troop_power(c, day_snapshot)) / window_days
city_influence_power(c,D) = military_average(c,D) + domination_from_completed_buildings(c,D)
influence_radius(c,D) = step(city_influence_power(c,D), thresholds[1..6])
```

La fenêtre de démarrage doit définir la présence de jours avant l'inscription : **nous proposons des snapshots zéro pour les jours manquants** afin qu'un joueur fraîchement arrivé ne bénéficie pas instantanément de six jours de garnison. Le laboratoire compte les jours manquants comme zéro dans le dénominateur ; le passage ultérieur à un snapshot quotidien horodaté de garnison reste nécessaire. Les bonus de domination et leur temporalité exacte restent à qualifier.

### Barème d'essai — ABSOLUMENT PAS des seuils Ubisoft certifiés

| Rayon | Seuil de puissance hypothétique |
| ---: | ---: |
| 1 | 0 |
| 2 | 10 000 |
| 3 | 30 000 |
| 4 | 75 000 |
| 5 | 150 000 |
| 6 | 500 000 |

Ce barème a pour objectif de reproduire le fait qu'un niveau 6 soit **extrêmement coûteux** ; sa progression n'est pas une extraction S2. Un seuil intermédiaire à 300 000 dans l'implémentation préliminaire est actuellement inutile ; le programme doit être refactoré vers une table explicite `{rayon:seuil}` et validée avant intégration au serveur.

## Géométrie territoriale

À distance torique euclidienne `d` du centre de la cité, une case est candidate lorsque `d <= rayon`. Il en résulte un contour **en disque discret**, avec les coins éloignés supprimés, contrairement à un carré Chebyshev de côté 13.

Exemple d'une cité isolée au rayon maximal de 6 : la trame discrète contient **113 cases** en comptant la case de la ville. Les cases au-delà de la frontière ne reçoivent aucune influence de cette ville.

## Confrontation entre cités et alliances

**Proposition mathématique à tester, pas formule historique** :

```text
score(c,case) = power(c) / (1 + distance_torique(c,case))^2
               si distance <= rayon(c), sinon 0
score(alliance,case) = somme des scores des cités de cette alliance
owner(case) = alliance avec score maximal strictement positif
égalité exacte = contested
```

Le score diminue avec la distance, et plusieurs cités voisines se soutiennent mutuellement. C'est compatible avec la description qualitative du tutoriel ancien, mais **la loi quadratique et la somme des contributions ne sont pas confirmées historiquement**. Il faudra comparer avec l'alternative **maximum par alliance** : le code du laboratoire accepte les deux agrégations.

**Propriété critique :** l'influence de la ville A ne doit pas disparaître mécaniquement lors de la création d'une ville B de la même alliance. Les scores alliés peuvent se renforcer, contrairement aux influences adverses. Lorsque deux alliances sont à égalité de score, le résultat est enregistré comme `contested` jusqu'à arbitrage du choix produit, plutôt que de départager par identifiant arbitraire.

La case contenant une **cité déjà implantée** demeure possédée par son joueur tant qu'elle n'est pas conquise militairement : **l'attribution d'influence ne transfère pas la propriété de la ville**. Une région vide contrôlée par une alliance peut empêcher l'installation adverse, mais ce contrôle n'est pas un titre de propriété immobilière.

## Test exécuté : deux villes et fenêtre six jours

Un premier micro-test Python a été exécuté sur une carte torique **40 × 30**, avec deux cités adverses séparées de dix cases et **500 000 de puissance stationnée constante pendant six jours**, sans domination de bâtiment.

Résultat du **prototype expérimental** :

| Catégorie | Cases |
| --- | ---: |
| Sous influence A | 105 |
| Sous influence B | 105 |
| À égalité d'influence (`contested`) | 7 |
| Sans influence | 983 |
| **Total** | **1 200** |

Pour une unique journée avec 500 000 unités précédée de cinq jours sans troupes, la **moyenne vaut 83 333**, donc le rayon d'influence n'atteint pas 6. Cela illustre l'effet de lissage : déplacer une armée pendant une seule journée ne suffit pas à projeter instantanément l'influence maximale.

Ce résultat vérifie le prototype, mais **ne qualifie pas le bon barème historique**.

## Simulation de sensibilité : moyenne sur quatre ou six jours

Un second essai compare deux fenêtres avec les **mêmes seuils synthétiques**, pour une garnison de 500 000 installée du jour 6 au jour 11 puis retirée :

| Événement | Moyenne 4 jours | Moyenne 6 jours |
| --- | --- | --- |
| Jour 6, arrivée de 500 000 | Rayon 4 | Rayon 4 |
| Jour 9 | **Rayon 6** | Rayon 5 |
| Jour 11 | Rayon 6 | **Rayon 6** |
| Jour 15, garnison retirée depuis quatre jours | Rayon 1 | Rayon 5 |
| Jour 17 | Rayon 1 | Rayon 1 |

Cette expérience illustre la **stabilité et l'inertie accrues** d'une fenêtre de six jours : deux jours supplémentaires sont nécessaires pour atteindre le maximum, et la décroissance du territoire est retardée lorsque l'armée quitte la ville. Les chiffres ne certifient pas le fonctionnement du serveur S2.

## Conséquence pour la V3 économique

Le cœur de la simulation change. À chaque heure, la cité paie l'entretien de ses troupes ou subit les pertes impayées prévues par les décisions C06. Chaque jour, une photo de la puissance réellement stationnée est ajoutée à l'historique de la cité, puis la moyenne glissante actualise sa puissance d'influence et les cases contrôlées. Les autres mécanismes réagissent uniquement au recalcul quotidien, évitant un effet de yo-yo à chaque déplacement de troupes.

Il faut ensuite mesurer : **coût en or cumulé sur six jours pour atteindre chaque rayon**, temps de perte d'un palier après retrait des troupes, chevauchement allié, frontières adverses, blocage de colonisation, intérêt des colonies avancées et capacité d'un monde sous-rempli à produire des zones stratégiques de confrontation.

### Limites et prochaines preuves recherchées

1. Retrouver **l'image originale du tableau de paliers** `control_zone.jpg` cité dans le tutoriel et vérifier ses valeurs sur une version S2.
2. Comparer les profils **quatre/six jours** via des captures datées, et rechercher le **calcul de la domination des bâtiments**.
3. Tester différents exposants de distance et somme contre max des villes alliées.
4. Définir la photo quotidienne exacte (heure, avant/après entretien, trêve, mouvement, prise de cité).
5. Coupler réellement les stocks par ville et l'entretien horaire à la puissance moyenne des troupes, puis reprendre les simulations de **70 % / 100 % de remplissage**.

**Code de laboratoire :** [tools/influence_simulation_lab.py](../../tools/influence_simulation_lab.py). Il n'est pas encore le moteur de monde final.
