# Simulation territoriale — influence coûteuse, expansion hors zone et frictions

**23 octobre 2026 — simulations synthétiques exécutées.** Cette étude répond aux deux contraintes ajoutées par l'utilisateur : un rayon d'influence de six cases exige une garnison importante (donc reste exceptionnel), et le coût d'une cité croît avec la distance au-delà de l'influence propre/alliée. Le jeu original S2 n'a pas livré les formules complètes ; les chiffres ci-dessous sont **issus d'un modèle de laboratoire**, pas de serveurs Ubisoft.

**Nouvelle décision à appliquer aux futurs tests :** la densité cible se mesure à **70 % des places maximales du monde** ; au-delà, c'est un surbooking voulu. Le [calibrage détaillé](13-CALIBRAGE-70-POURCENT.md) met cette règle à jour. Les essais de cette page comparent des densités effectives, sans hypothèse d'occupation administrative de 70 %.

## Hypothèses explicites

- **100 joueurs**, répartis en dix alliances de dix membres, positions initiales réparties de façon relativement équilibrée sur une **carte torique carrée**.
- **Six phases de développement** (sans calendrier réel fixé). À la phase finale, les joueurs ont en moyenne **environ trois villes**, au lieu de supposer systématiquement dix.
- Les rayons d'influence des cités dépendent de l'âge et d'un niveau de garnison simplifié ; **1 à 3 est courant, 4 à 5 plus rare ; le maximum théorique 6 n'est pas atteint pendant cet horizon limité à six phases**. C'est un proxy du coût de stationnement des troupes, **pas** une simulation de leur coût d'entretien en or.
- Le candidat de colonisation est évalué par rapport aux rayons des villes de la même alliance et des autres alliances. Une case dans l'influence adverse est rejetée ; les sites occupés ne sont pas accessibles.
- **Barème d'expansion fictif** pour isoler le mécanisme : prix de base croissant avec le rang de ville, puis multiplicateur dépendant de la distance `d` hors influence : `1 + 0,37d + 0,08d²`. Il est volontairement marqué **PROP**, sans correspondance historique S2.
- Trois comportements de joueur : **compact** (privilégie la proximité et le coût), **mixte**, **frontière** (cherche davantage de portée territoriale).
- Trois graines testées par combinaison ; **36 exécutions pour les densités 200–500**, complétées par **21 configurations plus denses (100–240)** répétées sur trois graines (soit **99 exécutions au total**, avec recouvrement des scénarios à 200 régions/joueur). Ces tailles restent trop faibles pour fournir des intervalles de confiance robustes, mais illustrent fortement la sensibilité au dimensionnement.

**Indicateur principal :** nombre de *paires d'alliances distinctes* dont les influences de villes touchent ou se superposent en fin de simulation (rayons plus une marge d'une case). Ce n'est **pas** le nombre de joueurs en guerre ou de villes assiégées.

## Comparaison des densités — 100 joueurs, environ trois villes chacun

| Régions par joueur | Compact : contacts | Mixte : contacts | Frontière : contacts |
| ---: | ---: | ---: | ---: |
| 100 | 33,3 | 34,3 | 34,3 |
| 120 | 24,0 | 26,0 | 25,7 |
| 140 | 18,3 | 20,3 | 20,0 |
| 160 | 12,3 | 13,3 | 15,7 |
| 180 | 7,0 | 8,3 | 9,3 |
| 200 | 4,0 | 5,3 | 5,3 |
| 240 | 0,7 | 1,7 | 2,3 |
| 300 | 0,0 | 0,0 | 1,0 |
| 400 | 0,0 | 0,0 | 0,0 |
| 500 | 0,0 | 0,0 | 0,0 |

Les chiffres sont des moyennes sur **trois graines seulement** : la précision décimale exprime la moyenne arithmétique, pas une prédiction à un dixième près.

### Premier enseignement

**300 régions/joueur est trop peu conflictuel dans cette simulation.** L'ancien calcul à dix villes et rayons six surestimait fortement l'occupation spatiale et les contacts. Quand les joueurs ont plutôt trois villes et des rayons limités par la défense et la logistique, des alliances peuvent rester isolées longtemps.

Le régime **140–180 régions/joueur** produit une fréquence de contact nettement supérieure, tout en laissant beaucoup plus de territoire qu'une carte dimensionnée pour dix villes entièrement couvertes. **Cela ne signifie pas que 140 est automatiquement meilleur que 180 :** le rythme réel de la colonisation, l'âge d'une campagne et la taille effective des alliances déterminent le compromis.

## Vérification de la pénalité hors influence : attention au modèle

Une comparaison complémentaire a testé un barème de distance actif contre un barème désactivé, sur des échantillons de 140, 180, 200 et 300 régions/joueur. Dans ces cas, le nombre de contacts et le nombre de cités sont restés identiques : **le budget fictif attribué aux joueurs était trop généreux pour que la pénalité devienne réellement contraignante**.

Il serait **incorrect** d'en conclure que le coût hors influence n'a aucun effet. Au contraire, la mécanique doit désormais être testée avec :
1. des prix S2 retrouvés ou plusieurs courbes hypothétiques graduées ;
2. des budgets en or réellement issus de l'économie, du rendement des mines, des chantiers et de l'entretien ;
3. une véritable réservation de troupes en garnison si un joueur veut augmenter son rayon ;
4. des stratégies d'alliance cohérentes et non un simple tirage semi-aléatoire de colonies.

Sans ce couplage, les moyennes ci-dessus caractérisent surtout **l'effet de taille de carte sur des expansions déjà réalisables**.

## Préconisation pour le prochain lot

Ne pas figer immédiatement la carte à 300 régions/joueur. Préparer une nouvelle grille comparative autour de **120, 140, 160, 180 et 200**, avec au moins 10 graines, profils « faible/moyenne/forte garnison », stratégies compactes/frontières et coûts de colonisation réellement contraignants. **160–180 régions/joueur** devient une **plage de référence pour exploration**, pas une décision utilisateur ni un paramètre production validé.

Pour rendre la simulation crédible, il faut incorporer les règles suivantes au simulateur :
- garnison en troupes avec **coût d'entretien horaire**, seuils de rayon de 1 à 6 et coût d'opportunité militaire ;
- **courbe croissante de prix** entre villes 2 et 10 ;
- coût de distance calculé à partir de la frontière de l'union des influences propres et alliées (avec passage torique) ;
- protection initiale sept jours, impossibilité de deuxième colonie pendant cette phase et apparition des joueurs échelonnée dans le temps ;
- positionnements par code ami (quatre à dix cases) et répartition initiale équilibrée pour les autres ;
- revenu réel par ville, transferts par caravanes et bonus d'hérédité de départ ;
- progression des alliances et **interdiction de coloniser dans l'influence ennemie**, en considérant les frontières disputées ;
- zones spéciales non colonisables et répartition quasi régulière des reliques.

## Conclusion et limites

**Résultat établi uniquement dans notre modèle :** l'espacement initial et les garnisons modestes freinent nettement la rencontre des influences rivales ; la distribution compacte des villes aggrave le phénomène. L'ordre de grandeur 300–500 régions/joueur ne convient pas à une friction assez précoce **dans ces scénarios**. Il faut choisir la taille finale en fonction d'une **courbe de progression simulée**, pas d'une capacité maximale théorique.

La pénalité de colonisation hors influence a été modélisée, mais son effet quantitatif reste **non démontré** dans le premier tirage. Le profil final conserve donc les dimensions à titre expérimental, en attendant un simulateur davantage couplé à l'économie.

Le script Python effectivement exécuté (avec dépendances NumPy et SciPy) et les résultats bruts sont également fournis comme fichiers de travail dans cette conversation. Leur archivage ultérieur dans GitHub est distinct du rapport synthétique déjà commité.

Données : [résultats structurés](../../data/analysis/territorial-friction-synthetic-2026-10-23.json). Aucune règle historique Ubisoft n'a été inventée.
