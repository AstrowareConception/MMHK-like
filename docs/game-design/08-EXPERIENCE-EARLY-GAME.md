# Game design — l'expérience du premier royaume

**Mise à jour P0 :** les [84 réponses confirmées](../decisions/DECISIONS-P0-2026-10-23.md) précisent désormais les arbitrages. Le premier parcours utilise **Havre, T1–T3 et aucun sort** ; la saison 2 est la référence. La [proposition de générateur](09-GENERATEUR-P0-PROPOSITIONS.md) traite les choix délégués Q12/Q15. Toute ancienne orientation contraire de ce document est remplacée par ces décisions.

**Statut : hypothèses de conception pour MMHK-like (PROP), non description certifiée du parcours original.** Ce chapitre complète les [boucles générales](01-VISION-ET-BOUCLES.md) par un parcours joueur cohérent avec le [référentiel métier](../rules/README.md). Aucun temps de session, taux de conversion, probabilité de mine ou « récompense tutorielle » ci-dessous n'est une valeur Ubisoft attestée.

## Promesse du premier cycle de jeu

Le joueur arrive dans un **monde qui existait avant lui et continuera sans lui**. Son premier objectif n'est pas de gagner la Guerre des Larmes en quelques clics : il doit comprendre que chaque investissement possède un coût d'opportunité temporel. Un héros employé au développement ne conduit pas simultanément une expédition ; de nouvelles troupes exigent des recrues puis des ressources ; une mine n'est pas un revenu tant que la défense neutre n'a pas été vaincue.

Le plaisir recherché vient de la **préparation éclairée**, de la confrontation à des contraintes lisibles et du sentiment que les ordres lancés ont des conséquences concrètes au retour. L'exploration des trois vues ne doit pas être enfermée dans un tutoriel qui impose un parcours arbitraire.

## Quatre décisions réellement intéressantes

| Arbitrage | Information que le joueur doit avoir | Résultat intelligible |
| --- | --- | --- |
| Construire vite ou épargner | Coût, prérequis, date de fin, prochain objectif accessible | Un chantier lancé modifie les capacités futures, pas seulement un pourcentage |
| Prendre une mine ou préserver son armée | Force connue/estimée, composition, risque de pertes, ressource visée | La mine libérée alimente une boucle de croissance, une défaite demeure un coût réel |
| Mobiliser le héros à l'économie ou au combat | Activité exclusive, durée estimée et effets attendus | Une opportunité renoncée est visible, sans permettre deux utilisations du même héros |
| Explorer seul ou rejoindre un ami/alliance | Position géographique, disponibilité du code ami, influence et voisins | Les avantages de proximité sont sociaux et stratégiques, sans implantation illégale |

Ces arbitrages sont des **objectifs de design** : leur intensité ne peut être jugée sans un simulateur de production, recrutement et combats.

## Parcours d'entrée proposé, sans chronologie forcée

### A. Comprendre son implantation

Le joueur choisit un monde et une des cinq factions admises par son profil. Il reçoit une première ville et observe son territoire régional 5×5. Il peut passer librement entre **ville, région et monde**. Le client explique explicitement que **quatre mines se trouvent dans la région**, pas « quatre types de ressources sur chaque case ». Le mode \`near\` et le code ami sont proposés uniquement quand la règle d'accès et la disponibilité du monde le permettent.

**Condition de réussite UX :** le joueur distingue sa cité, ses stocks, ses mines occupées et le monde autour de lui sans lancer d'action irréversible. **Source métier :** RM-WRD-001…008, RM-REG-001…005. **US :** ACC-001…005, REG-001, UIX-004/006.

### B. Choisir un premier investissement

En ville, le joueur consulte un arbre de bâtiments avec **devis et prérequis**, en distinguant construit, accessible, inaccessible et en chantier. La nouvelle construction ne produit pas d'effet avant sa date réelle d'achèvement. Les valeurs viennent du catalogue de sa faction et de la révision choisie. Les images de villes entièrement bâties retrouvées par AcidCave **ne doivent pas faire croire** que toutes les constructions sont déjà possédées.

**Condition de réussite UX :** le joueur sait pourquoi une construction est impossible (ressource, niveau, bâtiment, héros ou file) et peut anticiper ce qu'elle débloquera. **Source métier :** RM-CIT-001…008, RM-ECO-005/006. **US :** CIT-002…007.

### C. Préparer la première expédition

La taverne, les héros et les créatures de la cité ouvrent progressivement la préparation militaire. Le joueur doit comprendre trois différences : une **recrue disponible** n'est pas une troupe achetée, une troupe achetée n'est pas automatiquement affectée à l'armée d'un héros, et un peloton en combat a une **position dans un ordre**. La règle des contre-armes I→C→R→I peut être enseignée sans devoir détailler immédiatement tous les cas de sort et d'artéfact.

**Condition de réussite UX :** le joueur voit ses unités disponibles et comprend les conséquences d'une formation d'armée. **Source métier :** RM-HER-001/002, RM-ARM-001…008, RM-COM-002. **US :** HER-003, ARM-005/009, ACC-007/008.

### D. Libérer puis exploiter

Une première rencontre neutre apprend que le combat est **résolu automatiquement sur préparation**, pas un tactical RPG au tour par tour. La perte de troupes a un coût durable ; la récompense a un statut défini ; une case occupée ne devient pas libre si l'attaquant perd. Après victoire, la mine devient éligible à la production, suivant la politique d'activation choisie.

**Condition de réussite UX :** le joueur peut relier un rapport de bataille au changement de l'état de la case, puis à la ressource produite. **Source métier :** RM-COM-001…007, RM-REG-006/007, RM-ECO-002/003. **US :** COM-002/017, REG-003/004, RAP-001.

### E. Revenir et comprendre ce qui s'est passé

Au retour, le joueur voit la **chronologie de ses ordres** : ce qui s'est terminé, les revenus accumulés, les stocks saturés, les héros disponibles et les rencontres résolues. Les calculs ne dépendent jamais du maintien de l'onglet ouvert. Un tableau « activité depuis la dernière visite » serait un choix d'interface PROP, pas une reconstruction littérale de l'ancien écran Ubisoft.

**Condition de réussite UX :** le joueur reconnaît la cause de chaque changement de stock et ne reçoit pas deux fois une récompense en actualisant l'interface. **Source métier :** RM-ECO-001…011, RM-TIM-001…004. **US :** ECO-001/002/003/004/012, CIT-005/006, RAP-001.

## Exploration et autonomie

Le jeu ne doit pas obliger à cliquer dans un ordre unique pour pouvoir jouer. Des conseils contextuels peuvent accompagner la première exploration, mais **les actions autorisées restent gouvernées par des règles réelles** (préconditions, niveaux, temps et ressources). Les aides doivent expliquer « pourquoi » et non fournir des récompenses artificielles non documentées.

Un joueur prudent peut privilégier son économie et libérer ses mines lentement ; un joueur militaire peut investir davantage dans les créatures ; un joueur social peut chercher une implantation proche d'un ami. Les simulations doivent vérifier que ces choix sont tous **compréhensibles**, sans garantir artificiellement qu'ils sont égaux en puissance.

## Équilibrage : métriques de conception à mesurer

Aucune cible chiffrée n'est encore validée. Le simulateur devra enregistrer pour plusieurs factions, graines et profils :

- **Démarrage :** délai jusqu'à première décision non triviale, première construction effective, premier héros disponible, première mine libérée.
- **Économie :** stock perdu par saturation, coût d'opportunité des bâtiments, fraction de temps sans production, accès à chaque palier et sensibilité aux doublons de ressources.
- **Combat :** survie des premières expéditions pour différentes compositions, dispersion/morts, coût de remplacement et influence de l'ordre des pelotons.
- **Équité géographique :** distribution des ressources des quatre mines, densité des sites, possibilités d'extension, distance aux voisins, saturation du placement ami.
- **Persistance :** différences de résultat entre un joueur connecté et le même joueur absent avec les mêmes ordres ; aucun bonus caché simplement dû aux visites fréquentes.
- **Protection :** refus réellement appliqués, affichage de l'échéance, impossibilité de contourner l'immunité par un autre écran ou une API.

L'équilibrage ne doit pas masquer les paramètres historiques incertains. Il convient de conserver **un profil de comparaison fidèle aux preuves** et, si nécessaire, **un profil de design MMHK-like** avec modifications explicitement justifiées.

## Ce qui ne doit PAS être ajouté silencieusement

Pas de PvE tactique interactif, de « mana » inventé, de ressources partageables entre toutes les cités sans transfert, de file de recrutement instantanée supposée historique, de double usage d'un héros, de grilles où chaque case produit quatre ressources, ni de sauvegarde dépendante du navigateur. Ne pas non plus intégrer les variantes Arkath/tournoi S4 parce que le client tardif sait les afficher.

## Conditions pour juger l'early game jouable

Le parcours [PAR-01](../backlog/RECETTE-PARCOURS.md#par-01--developpement-local-hors-connexion) doit être **réellement exécutable**, du premier royaume à une mine productive après reconnexion, sous un \`ruleset_id\` explicite. Les US annoncées terminées doivent avoir leurs critères validés, y compris les refus, la concurrence, les frontières et la reprise. Les écrans de référence peuvent employer des assets provisoires tant qu'ils représentent **l'état réel** des bâtiments, héros et sites.

**État actuel :** conception et fixtures établies, **aucun moteur exécuté**. La suite est l'arbitrage de [U03/U04/U05/U06/U09/U14/U17/U20/U24/U30](../rules/DECISIONS-ET-INCERTITUDES.md) puis l'affinage des [US prioritaires](../rules/AFFINAGE-US-L1.md).
