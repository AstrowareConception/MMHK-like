# Laboratoires de game design — hérédité et monde

**23 octobre 2026 · Statut : PROPOSITION, non validée par simulation locale dans cette session.**

Ces outils exploitent les décisions utilisateur **C01–C09** et la référence de **saison 2**. Les paramètres inventés pour pouvoir expérimenter sont systématiquement distincts des mécanismes historiques attestés.

## 1. Hérédité : un build initial de 1 000 points

Les **1 000 points** représentent un capital fixe pour chaque joueur au début de **chaque monde**. Aucune récompense, expérience ou hérédité d'un monde précédent ne l'augmente. Un joueur peut répartir librement les points dans un catalogue commun, puis son choix s'applique à ce monde.

Le [catalogue de test](../../data/game-design/heritage-balance-lab.json) propose **12 compétences en quatre groupes** : économie, militaire, logistique et savoir. Chaque compétence comporte 0 à 5 rangs. Les coûts **proposés, non historiques**, sont de 30, 50, 80, 120 et 170 points supplémentaires. Ainsi, atteindre le rang 5 coûte 450 points cumulés ; deux rangs 5 coûtent 900 points, trois rangs 5 sont impossibles avec 1 000 points.

| Branche | Trois capacités expérimentales |
| --- | --- |
| Économie | Production locale, stockage, vitesse des chantiers urbains |
| Militaire | Attaque, défense en garnison, réduction des pertes définitives |
| Logistique | Mouvement, charge caravanière, réduction d'entretien |
| Savoir | Expérience des héros, production de recrues, qualité de reconnaissance |

**Les effets en pourcentage sont des hypothèses de conception, pas des compétences héréditaires S2 reconstituées.** Le catalogue ancien et les bonus historiques devront être comparés avant validation, notamment les talents magiques et leurs seuils de rang. Il faudra rechercher des builds dominants au départ, les possibilités de spécialisation, les options inutiles en Havre T1–T3 et le risque que la réduction d'entretien neutralise le choix économique d'une grosse garnison.

Le [calculateur de builds](../../tools/mmhk-heritage-lab.mjs) vérifie budget et rangs :

```bash
node tools/mmhk-heritage-lab.mjs --build '{"resource_yield":5,"attack":5}'
```

Ce build expérimental coûterait **900 points**, en laissant **100 points inutilisés**. Le calcul du coût n'implique pas que ce soit un build optimal ou une combinaison disponible dans le jeu original.

**Rectificatif de calibrage :** les tailles du tableau initial ne sont plus les presets actifs. Le jeu est désormais calibré pour **70 % des joueurs inscrits au maximum**, selon [le dimensionnement 70 %](13-CALIBRAGE-70-POURCENT.md). Les anciens chiffres restent conservés comme historique expérimental.

## 2. Générateur du monde : torus et presets

Le [générateur](../../tools/mmhk-world-lab.mjs) prend une graine et un preset de population. Le [fichier de paramètres](../../data/game-design/world-generator-lab.json) propose des dimensions de test :

| Capacité indicative | Carte carrée proposée |
| ---: | ---: |
| 20 joueurs | 16 × 16 |
| 50 joueurs | 24 × 24 |
| 100 joueurs | 32 × 32 |
| 199 joueurs | 44 × 44 |
| 499 joueurs | 72 × 72 |
| 1 000 joueurs | 104 × 104 |
| 2 000 joueurs | 152 × 152 |
| 3 000 joueurs | 192 × 192 |

Les dimensions sont **proposées** pour permettre des simulations avec 20 à 3 000 inscrits ; elles ne sont pas tirées d'une carte officielle MMHK. Les **zones d'influence, possibilités de colonisation, relief et densité réelle de joueurs** ne sont pas encore prises en compte dans ces tailles.

### Régions de cinq par cinq cases

Le générateur maintient quatre mines distinctes hors du centre :
- **Ville Havre initiale :** or, bois, minerai et cristal, exactement une mine de chaque type.
- **Régions ordinaires :** soit quatre types distincts, soit une seule paire parmi trois types distincts ; jamais de triple ou de double paire.
- **Hypothèse de laboratoire :** 18 % de régions à doublon et 82 % de régions à quatre types. Les ressources G/w/o ont un poids plus élevé ; **les quatre rares sont équiprobables entre elles**.
- **Placement spatial de laboratoire :** deux mines dans la première couronne autour de la cité et deux dans la couronne extérieure, avec mélange des types.

Cette répartition spatiale et ces pondérations restent une **proposition déléguée Q12/Q15**, soumise à des tests statistiques et d'équilibrage.

### Sites spéciaux en quadrillage quasi régulier

Selon **C02**, tous les types de reliques/sites partagent **un même maillage** de positions dans le monde torique. Les sites se placent près des centres de ce maillage avec un décalage indépendant de **−2 à +2 cases dans chacun des deux axes**. Il ne s'agit donc plus d'un placement indépendant par type, ni d'une simple interdiction que deux sites soient à moins de quinze cases.

Le pas du quadrillage est **15 cases comme paramètre expérimental**, non comme valeur définitivement choisie. Les types sphinx, dolmen et obélisque sont distribués en nombres aussi proches que possible. Les autres types pourront être intégrés une fois le contenu S2 qualifié.

Le nombre de sites dépend de la surface de la carte, du pas choisi et du fait que chaque ancre reçoit au plus un site. Sur un petit monde, certains types peuvent être très peu nombreux ; **une validation supplémentaire de diversité minimale sera nécessaire**. La forme torique empêche de concentrer artificiellement tous les sites à une frontière.

**Important :** le déplacement de ±2 cases peut raccourcir la distance réelle entre sites voisins. La régularité concerne la **trame d'ancrage** ; un seuil absolu de distance intersites devra être ajouté si nous souhaitons en garantir un.

### Usage du générateur

```bash
node tools/mmhk-world-lab.mjs --preset 100 --seed demo --samples 10000
node tools/mmhk-world-lab.mjs --preset 2000 --seed test --json
```

Les résultats comprennent : une région Havre de référence, des coordonnées de sites spéciaux, le nombre de régions synthétiques invalides, le nombre de doublons et les fréquences des sept types miniers. Les distributions changent avec les paramètres et la graine, mais un même jeu de paramètres conserve les mêmes résultats.

## Échantillon statistique initial — 10 000 régions

Un tirage JavaScript **indépendant**, reproduisant la logique de sélection des types à partir des pondérations proposées, a été effectué avec une graine stable. Il ne constitue **pas** une exécution du script Node.js livré :

- **10 000 régions** ; **0 composition invalide** ; **1 817 régions (18,17 %) avec une paire**, pour une cible de 18 %.
- Fréquences d'occurrence des rares parmi 40 000 mines : cristal **4 958**, gemmes **4 960**, soufre **4 990**, mercure **4 951**. Les poids symétriques se traduisent ici par des fréquences très proches.
- Les autres occurrences sont : or **6 938**, bois **6 563**, minerai **6 640**.

Le résultat brut est [archivé en JSON](../../data/analysis/world-lab-sample-10000-2026-10-23.json). Il **ne mesure ni la viabilité d'une implantation, ni le quadrillage des sites, ni les performances du serveur**, qui feront l'objet des prochaines expériences.

## 3. Tests et limites

Le [script de test](../../tools/test-mmhk-design-labs.mjs) vérifie les invariants de génération, le déterminisme, les bords raccordés de la carte, l'unicité des sites, la répartition équilibrée des types et l'impossibilité de dépenser 1 350 points sur un budget de 1 000.

```bash
node tools/test-mmhk-design-labs.mjs
```

**Non encore réalisés dans cette session :** l'exécution effective du script Node.js dans un clone, la comparaison de builds sur des campagnes de test, l'équilibrage de l'économie de départ, l'impact du respawn des PNJ sur le farm d'XP et d'artéfacts, le couplage sites ↔ terrains/influence/occupation et la qualification complète des pouvoirs d'hérédité historiques.

Le générateur produit des **régions et emplacements théoriques** : il ne crée pas encore de monde serveur avec cités, PNJ vivants, utilisateurs concurrents, champs d'influence ni Larmes réellement constructibles.

## 4. Suite du lot B

1. Exécuter les tests et des séries comparatives sur différents presets (20, 50, 100, 500, 2 000 joueurs).
2. Tester l'accessibilité des mines avec les premières armées Havre T1–T3.
3. Simuler les niveaux historiques 1–10 des mines avec rendements et coûts S2 vérifiés.
4. Contrôler les profils d'hérédité concurrents : départ économique, militaire, logistique et équilibré.
5. Connecter ensuite le générateur et les coûts au moteur économique persistant en conservant des horloges et catalogues versionnés.
