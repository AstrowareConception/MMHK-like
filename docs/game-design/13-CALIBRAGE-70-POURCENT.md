# Calibrage des mondes à 70 % de leur capacité — 23 octobre 2026

**Décision utilisateur :** un monde n'est pas conçu pour être *idéalement* joué à 100 % de sa capacité affichée. **70 % de sa capacité maximale constitue sa population de référence** ; au-delà, la densité plus forte est une forme de **surbooking volontaire**, apportant davantage de tensions territoriales et éventuellement d'abandons. L'absence de remplissage complet ne doit pas rendre le monde vide ou sans intérêt.

Le dimensionnement s'applique au nombre de **participants effectivement présents**, à distinguer des comptes inscrits et des joueurs actifs au fil du temps. Un monde accueillant 1 000 joueurs au maximum est **calibré pour 700 participants**. Une carte ne change pas de taille pendant une campagne : on ajuste la génération et la répartition initiale, pas la géométrie a posteriori.

## Formule de référence

Soit `Pmax` la capacité maximale, `α = 0,70` le taux de référence et `D = 170` le nombre expérimental de régions par joueur à cette référence. **170 est une hypothèse issue des expériences territoriales précédentes**, pas un chiffre Ubisoft ni une règle d'équilibrage définitivement validée.

```text
population_de_reference = ceil(0,70 × Pmax)
surface_mondiale_cible = population_de_reference × 170
cote_du_monde ≈ sqrt(surface_mondiale_cible)
```

La carte carrée torique est arrondie à un multiple de 8 cases pour simplifier la génération. Les surfaces restent dans la plage expérimentale de **160 à 180 régions/joueur à 70 %**, sauf petits presets affectés par l'arrondi.

| Capacité maximale | Population de référence (70 %) | Carte expérimentale | Régions/joueur à 70 % | Régions/joueur à 100 % |
| ---: | ---: | ---: | ---: | ---: |
| 20 | 14 | 48 × 48 | 165 | 115 |
| 50 | 35 | 80 × 80 | 183 | 128 |
| 100 | 70 | 112 × 112 | 179 | 125 |
| 199 | 140 | 152 × 152 | 165 | 116 |
| 499 | 350 | 240 × 240 | 165 | 115 |
| 1 000 | 700 | 344 × 344 | 169 | 118 |
| 2 000 | 1 400 | 488 × 488 | 170 | 119 |
| 3 000 | 2 100 | 600 × 600 | 171 | 120 |

## Trois régimes de population

### Moins de 70 % : serveur sous-rempli

La carte reste identique ; moins de joueurs signifie mécaniquement plus de surface par participant. Pour ne pas rendre le jeu désert, **proposition de conception à tester** : concentrer les premières implantations dans une zone de démarrage composée de secteurs actifs, en préservant une distance minimale entre premières villes, les possibilités d'arrivée par code ami et les accès à l'expansion. Ouvrir progressivement d'autres secteurs lorsque la population augmente, **sans verrouiller artificiellement les régions déjà colonisées**, ni empêcher les joueurs d'explorer et de progresser.

**Attention :** le regroupement doit préserver une possibilité d'implantation amie et éviter que la concentration fasse apparaître un « faux monde complet » avec seulement vingt joueurs. Les alliances actives ne doivent pas toutes se retrouver superposées au départ.

### Autour de 70 % : densité de référence

Le monde doit offrir suffisamment de régions pour un développement initial libre, mais faire apparaître à moyen terme des **frontières d'influence contestées**, compte tenu de la faible fréquence des rayons d'influence 6, du coût de stationnement des troupes et du prix croissant des colonies au-delà des influences propres/alliées.

### Entre 70 % et 100 % : surbooking

La géométrie n'est pas élargie ; davantage de joueurs se partagent l'espace, les zones initiales disponibles deviennent plus difficiles à trouver et les alliances entrent en contact plus tôt. Ce **surbooking est voulu par le game design**, mais ne doit **pas** garantir l'élimination ou imposer une situation sans départ viable. L'objectif reste une tension stratégique, pas un monde techniquement impossible à rejoindre ou injouable dès l'inscription.

L'interface d'administration doit afficher séparément **capacité**, **inscrits**, **joueurs actifs** et **population de référence**. La densité théorique dépend des inscrits, mais la concurrence réelle dépend aussi des joueurs actifs, de leurs cités et de leurs garnisons.

## Tests obligatoires avant adoption d'un preset

- **Taux de remplissage :** simulations de 20 %, 40 %, 55 %, 70 %, 85 % et 100 %, avec arrivée étalée des joueurs.
- **Équilibre par phase :** observer entre quelles semaines apparaissent les contacts entre influences d'alliances adverses.
- **Sous-peuplement :** mesurer la proportion de joueurs ayant un voisin, une alliance adverse identifiable et une possibilité d'extension sans être encerclés.
- **Surbooking :** vérifier que chaque nouvel inscrit a une région de départ éligible, même tardivement ; signaler explicitement les mondes saturés.
- **Contraintes économiques :** calculer le nombre de cités réellement atteignables avec les coûts de colonisation S2, l'entretien de garnison et l'influence évolutive.
- **Abandon :** simuler une part variable de joueurs inactifs (par exemple 20–40 %) : un monde rempli en comptes peut rester vide en termes de gameplay.
- **Amis et alliances :** valider que les trois codes amis à usage unique favorisent la formation de groupes sans permettre une concentration qui bloque les autres joueurs.

## Conclusion

**70 % est désormais la référence de dimensionnement décidée.** La surface de **170 régions/joueur à 70 %** reste une **hypothèse de travail** à confirmer par simulations économiques, de croissance des zones d'influence et de population active. Le surbooking au-delà de 70 % est un effet de conception recherché, mais le moteur doit empêcher les états impossibles (placements illégaux, duplication de ville, dépassement de capacité ou colonisation en influence ennemie).
