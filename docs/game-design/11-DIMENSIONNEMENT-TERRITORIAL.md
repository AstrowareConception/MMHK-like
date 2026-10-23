# Dimensionnement territorial des mondes — révision 23 octobre 2026

**Décision produit confirmée :** un joueur peut posséder jusqu'à **10 cités**, pour un prix croissant ; la **zone d'influence maximale d'une cité peut atteindre 6 cases** sur la carte mondiale. Une alliance cherche à agrandir son territoire pour empêcher les implantations adverses. Par conséquent, les tailles de carte du laboratoire 0.1 étaient très insuffisantes.

**Nouvelle vérification (simulations du 23 octobre 2026) :** le [rapport de simulations territoriales](12-SIMULATION-INFLUENCE-COLONISATION.md) montre que le preset d'environ **300 régions par joueur** laisse très peu de contacts d'influence entre alliances dans une campagne test de six phases (trois villes par joueur en moyenne, rayons modestes). La plage **160–180 régions/joueur** doit être testée avec une économie militaire et coloniale réellement couplée avant de la substituer aux presets actifs. **Le tableau à 300 reste une proposition non validée**, et non un engagement de taille.

## Ajustement validé de l'orientation — densité et frictions d'alliance

**23 octobre 2026, second arbitrage utilisateur :** le modèle à 500 régions/joueur était trop généreux. Le plafond **10 villes** est une limite, pas l'état normal de tous les joueurs. Il faut créer une **pression territoriale progressive** afin que les alliances cherchent réellement à fermer les accès aux régions colonisables. Les dimensions du tableau « hypothèse 500 » ci-dessous sont conservées comme étape de réflexion, mais **ne constituent plus les presets actifs du laboratoire**.

**Nouvelle hypothèse de travail : environ 300 régions mondiales par joueur à capacité pleine**, avec tests comparatifs à 200, 300, 400 et 500. Les nouveaux côtés sont calculés pour rester proches d'un budget 300 et non pour garantir dix villes à chacun.

| Joueurs à capacité maximale | Côté retenu pour la simulation | Superficie | Régions / joueur |
| ---: | ---: | ---: | ---: |
| 20 | 80 | 6 400 | 320 |
| 50 | 128 | 16 384 | 328 |
| 100 | 176 | 30 976 | 309,8 |
| 199 | 248 | 61 504 | 309,1 |
| 499 | 392 | 153 664 | 307,9 |
| 1 000 | 552 | 304 704 | 304,7 |
| 2 000 | 784 | 614 656 | 307,3 |
| 3 000 | 952 | 906 304 | 302,1 |

**Critères de réussite supplémentaires :** (1) un nouveau joueur n'est pas systématiquement bloqué dès sa première expansion ; (2) l'emprise des alliances rivales commence à se toucher à un stade intermédiaire raisonnable ; (3) des choix stratégiques de placement de villes et de négociation influencent l'accès aux frontières ; (4) le maximum de dix cités demeure théoriquement possible pour certains joueurs sans en faire une garantie pour tous ; (5) les codes amis ne doivent pas rendre les clusters systématiquement dominants.

La **distribution 1–10 villes**, le nombre de joueurs actifs, les distances entre premières villes, la courbe d'accroissement de l'influence et les conditions d'expansion hors zone devront être simulés ensemble. Le rayon 6 représente une **valeur maximale de ville avancée** : l'appliquer d'emblée à toutes les premières villes produirait des collisions prématurées et fausserait l'analyse.

---

## Unités et géométrie

Une **case de carte du monde représente une région** ; chaque région possède ensuite sa propre vue locale en grille 5×5. Les dimensions du monde sont des dimensions en **régions**, non en emplacements locaux de construction.

Pour quantifier l'échelle, l'hypothèse de calcul la plus simple est un disque euclidien de rayon entier 6 : une cité rayonne alors sur **113 cases mondiales**, si aucune restriction géographique n'intervient. La forme réelle de l'influence (disque, carré de Chebyshev, propagation, pondération territoriale) reste à retrouver dans MMHK S2. Un carré de rayon 6 couvre 169 cases : l'hypothèse influe sur les besoins de surface. Dix disques de 113 cases représenteraient **1 130 cases théoriques sans aucun chevauchement**, ce qui ne constitue pas une consommation réelle fixe : les zones se recouvrent fréquemment et l'influence d'alliance est une union d'emprises, pas une somme de surfaces.

## Ancienne hypothèse expérimentale (remplacée) : environ 500 régions par joueur

Le budget de 500 cases n'est **ni un droit territorial garanti, ni une preuve de bonne taille**. Il représente une cible initiale de densité spatiale : laisser des territoires disponibles dans l'early game et permettre aux frontières d'alliance de devenir conflictuelles progressivement.

| Capacité maximale | Ancien côté | Nouveau côté | Régions par joueur à capacité nominale |
| ---: | ---: | ---: | ---: |
| 20 | 16 | **104** | 540,8 |
| 50 | 24 | **160** | 512,0 |
| 100 | 32 | **224** | 501,8 |
| 199 | 44 | **320** | 514,6 |
| 499 | 72 | **512** | 525,3 |
| 1 000 | 104 | **720** | 518,4 |
| 2 000 | 152 | **1 024** | 524,3 |
| 3 000 | 192 | **1 248** | 519,2 |

Ces valeurs sont déclarées dans [world-generator-lab.json](../../data/game-design/world-generator-lab.json) et reprises dans le [profil S2 du projet](../../data/rules/mmhk-like-s2-policy-draft.json). Ce sont des **presets de laboratoire à comparer**, sans engagement définitif de surface. L'administrateur doit pouvoir définir des dimensions particulières à terme.

## Pourquoi même 500 cases/joueur ne suffisent pas à garantir dix villes

- Un joueur avec dix cités peut concentrer ou disperser ses villes ; deux cités voisines recouvrent presque toutes leurs zones d'influence.
- L'influence d'une alliance peut bloquer des cases libres dont elle n'est pas propriétaire. Le nombre de régions libres n'indique donc pas le nombre de régions **colonisables** par un acteur donné.
- L'implantation initiale équilibrée et les codes amis introduisent des densités locales ; deux alliances proches peuvent être en conflit beaucoup plus tôt que la moyenne du monde.
- Le prix croissant de chaque cité signifie que tous les joueurs n'atteignent pas dix villes au même instant. Les simulations doivent utiliser une courbe d'expansion dans le temps, pas dix villes distribuées instantanément.
- Les sites spéciaux (maillage quasi régulier) et autres régions interdites ne sont pas des colonies accessibles.
- Le raccordement torique signifie qu'une alliance près du bord gauche peut entrer en contact avec une autre au bord droit.

## Contrat de génération territoriale proposé

1. Générer la **surface mondiale et les sites spéciaux** à partir d'une graine stable.
2. Garder une carte d'occupation indiquant `empty | city | special_site | prohibited` ; une case occupée n'est pas colonisable.
3. Enregistrer une influence par cité, calculée pour chaque niveau/rayon de 0 à 6 ; réunir les influences des cités et alliances et appliquer les priorités en cas de chevauchement selon une règle S2 ou une variante explicite.
4. Au spawn sans invitation : répartir les arrivées par **densité régionale/voisinage de joueurs**, puis vérifier que leur accès au développement n'est pas bloqué trop tôt. Pour les trois invitations à usage unique, appliquer la recherche proche 4–10 cases, étendue si nécessaire.
5. Pour chaque tentative de colonisation, vérifier ensemble **emplacement libre**, **droit de coloniser**, **zone d'influence propre ou alliée** et **absence de contrôle adverse**. Éventuelles exceptions hors zone encore à qualifier.
6. Paramétrer le **coût croissant** des villes 2 à 10, mais **ne pas fabriquer la formule** avant l'étude S2.
7. Simuler la progression des alliances, les frontières contestées et les situations d'enclavement avant de déclarer un preset satisfaisant.

## Tests de simulation à créer avant validation

- **Capacités 20, 50, 100, 200, 500, 1 000 et 2 000 joueurs** : répartir les inscrits et les alliances et simuler l'augmentation progressive de leur nombre de cités (1 → 10).
- **Taux de saturation territoriale** : proportion de cases libres, sous influence propre, alliée, adverse, contestées ou hors influence.
- **Accessibilité effective** : nombre de possibilités d'implanter une cité supplémentaire à chaque niveau de progression, par joueur et alliance ; fréquence des joueurs bloqués précocement.
- **Délai de premier conflit territorial** : mesurer à quel moment des fronts d'influence rivaux commencent à se toucher.
- **Distribution des sites** : vérifier que la trame quasi régulière et les autres obstacles n'empêchent pas disproportionnellement certaines alliances de s'étendre.
- **Bords toriques** : tester chaque algorithme aux frontières, y compris les positions des villes et les emprises de rayon 6 qui franchissent les bords.
- **Sensibilité géométrique** : comparer disque de rayon 6 et carré de rayon 6, et plusieurs budgets de surface (par exemple 300, 500 et 700 régions par joueur), avant d'accepter le seuil de 500.

**Statut :** nouvelle contrainte fonctionnelle intégrée aux paramètres des mondes. **Les dimensions sont proposées**, le moteur d'influence/colonisation multi-alliance et les tests de densité restent à implémenter. Le script actuel génère des régions et des sites, pas encore les dix villes par joueur ni leurs territoires.
