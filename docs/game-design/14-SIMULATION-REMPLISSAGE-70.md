# Étude approfondie — 70 % de remplissage et tensions territoriales

**23 octobre 2026 · Étude expérimentale exécutée (108 scénarios) · Ce n'est pas un simulateur fidèle du serveur MMHK S2.**

Cette analyse approfondit [la règle de référence à 70 %](13-CALIBRAGE-70-POURCENT.md) : 70 % des places occupées correspondent à un monde idéalement calibré, 70–100 % à une zone de surbooking stratégique, et un monde largement sous-rempli doit rester jouable.

## Protocole

- Capacité : **100 joueurs**, population active nominale : 20, 40, 55, 70, 85 ou 100.
- Surface : hypothèses **140, 170 ou 200 régions mondiales par joueur à 70 %**, carte carrée **torique**, dimension arrondie au multiple de huit.
- Trois graines : **11, 23, 47**.
- Deux variantes de spawn : relativement équilibré et **modérément regroupé** par distance au plus proche voisin. **Attention : cette variante n'est pas un placement explicitement guidé par les alliances.**
- Huit phases de progression : arrivées échelonnées, une phase de protection initiale pendant laquelle une deuxième ville est impossible, puis achats de villes successives. Le joueur termine avec **environ 3,3 à 3,6 cités** dans les configurations testées.
- Rayon d'influence : approximation croissante avec l'âge et les troupes disponibles, niveaux principalement faibles, **aucune cité n'atteint le rayon maximal 6 durant ces huit phases**.
- Colonisation : dans l'influence ou au-delà à prix majoré, interdiction d'installation sous influence ennemie, or simulé limité et renouvelé en partie par le nombre de cités. Formule de majoration **fictive** `1 + 0,38d + 0,10d²` pour une distance `d` hors de l'influence alliée.
- Pour mesurer la friction, deux alliances sont en contact si leurs **zones d'influence respectives se touchent** ou se chevauchent. Cela ne signifie pas que leurs villes soient en guerre.

**Important :** le modèle n'intègre pas encore les barèmes véritables de puissance, les coûts d'entretien S2, l'attrition à 10 %, les caravanes, les combats, les sièges ni les coûts vérifiés de fondation des deuxième à dixième cités. Les résultats ne prouvent ni la jouabilité réelle ni la supériorité d'un preset.

## Résultats : nombre moyen de paires d'alliances en contact à la dernière phase

| Densité cible à 70 % | 20 % | 40 % | 55 % | 70 % | 85 % | 100 % |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| **140** régions / joueur — spawn modérément regroupé | 0 | 0 | 0,33 | **2,00** | 3,33 | 8,00 |
| **170** régions / joueur — spawn modérément regroupé | 0 | 0,33 | 0 | **1,00** | 1,00 | 4,00 |
| **200** régions / joueur — spawn modérément regroupé | 0 | 0 | 0 | **1,00** | 0 | 1,00 |
| **140** régions / joueur — spawn équilibré | 0 | 0 | 0,33 | **0,33** | 3,00 | 7,33 |
| **170** régions / joueur — spawn équilibré | 0 | 0,33 | 0,33 | **0,33** | 2,33 | 4,33 |
| **200** régions / joueur — spawn équilibré | 0 | 0,33 | 0,33 | **0,33** | 1,33 | 2,67 |

Les moyennes reposent chacune sur seulement **trois graines** ; la non-monotonicité occasionnelle est attendue avec cet échantillon. Le nombre d'alliances varie aussi avec le nombre de participants, ce qui empêche d'interpréter ces contacts comme une probabilité universelle de guerre.

### Lecture

**Constat robuste uniquement à l'intérieur de ce modèle :** davantage de joueurs sur une carte fixe tend à augmenter les contacts, et la densité cible de 140 produit généralement plus de frictions que 170 ou 200. Mais même à 70 %, la majorité des alliances peuvent rester sans frontière commune. Le modèle **ne valide donc pas encore** le choix de 170 régions par joueur pour garantir une expérience intéressante.

**Autre constat :** le regroupement spatial modéré ne suffit pas à rapprocher les alliances adverses de manière fiable. Cela suggère de simuler des **zones d'implantation organisées autour de communautés et frontières potentielles**, sans imposer des positions hostiles collées.

## Ce que le modèle ne mesure pas encore correctement

1. **Le coût réel d'une zone d'influence.** Une grande garnison doit immobiliser des troupes et peser sur l'entretien horaire du lieu ; le simulateur actuel n'exécute qu'une approximation grossière de puissance et de coût.
2. **La croissance du coût hors influence.** La courbe est provisoire et les budgets sont artificiels. Il faut mesurer le nombre de colonisations refusées *uniquement à cause de cette majoration*, et comparer les conséquences sur les fronts territoriaux.
3. **Les joueurs inactifs.** L'effectif des simulations correspond aux participants présents, sans départ permanent ni mise en sommeil de compte, alors que le remplissage administratif et la population militaire active peuvent diverger fortement.
4. **L'équilibre entre alliances.** La répartition des membres est synthétique et ne reproduit pas encore la constitution réelle des groupes, les invitations à usage unique et les transferts d'alliance.
5. **Les trois régimes de vie du serveur.** La même carte reste générée dès l'ouverture ; à 20 % on risque le désert, tandis qu'à 100 % on risque le blocage des nouveaux arrivants. L'expérience utilisateur doit être mesurée, pas seulement le nombre de contacts.

## Prochaine expérience de meilleure valeur

Développer un banc d'essai croisant :
- **70 % comme référence fixe**, taux réels 20/40/55/70/85/100 % ;
- **densités 100, 120, 140, 160, 180 et 200** comme hypothèses alternatives ;
- **garnisons réparties** entre développement et défense, coût horaire S1/S2 dès que retrouvé ; en attendant, au moins trois courbes économiques fictives déclarées ;
- **niveaux d'influence de 0 à 6** réellement déterminés par l'effectif des garnisons et pénalisés par l'entretien ;
- **prix de colonisation croissant** en fonction du rang (2e à 10e cité), de la distance hors influence et du solde d'or réellement disponible ;
- **inactivité et retours de joueurs**, plus trois stratégies de spawn (équilibré, communauté regroupée, implantation près d'alliances concurrentes sans obstruction initiale) ;
- évaluation **à plusieurs phases**, et non uniquement à la dernière.

### Critères à mesurer

- Une part substantielle des alliances rencontre une **frontière rivale** autour de 70 % d'occupation, sans empêcher les premières expansions.
- À 20–40 %, chaque communauté active dispose de voisins et d'objectifs à portée, **sans forcer un combat immédiat**.
- À 85–100 %, le nombre de colonisations refusées augmente avec la concurrence, mais les inscriptions restent valides tant qu'une région de départ équitable subsiste.
- L'influence maximale de 6 demeure **exceptionnelle** dans une campagne économique normale.
- Les formes de croissance compactes et de frontière restent deux stratégies crédibles, aucune n'étant systématiquement dominante.

## Artefacts

Le [JSON des résultats](../../data/analysis/occupancy-70-simulation-summary-2026-10-23.json) est versionné. Le script Python de cette passe ainsi que les sorties brutes et agrégées sont disponibles dans les fichiers de travail de la conversation, mais **pas encore importés dans le dépôt GitHub**. Les calculs ont été réellement exécutés dans l'environnement Python ; ils ne remplacent pas des tests d'intégration d'un moteur serveur.
