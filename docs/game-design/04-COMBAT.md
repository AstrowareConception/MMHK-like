# Combat automatique et formules retrouvées

**Référence technique : CODE-01-COMBAT, commit épinglé.** Tout ce chapitre décrit le calculateur Jactari/MMHK-Plus, sauf mention contraire. C’est la meilleure base technique retrouvée, mais pas une preuve de parfaite identité avec le serveur original. Les talents légendaires et certains cas de résurrection présentent des anomalies explicites.

## Entrées nécessaires

Pour chaque camp : liste ordonnée des pelotons, types et effectifs ; héros et caractéristiques effectives ; talents ; artéfacts ; compétences héréditaires ; sorts et tours prévus ; bonus d’alliance et de Larmes. Ajouter contexte PvE/PvP, lieu de rencontre, fortification, statut des participants et saison. Une simple comparaison de puissance totale ne suffit pas.

Les sept emplacements ordinaires du calculateur occupent les indices 2–8. Les indices précédents servent notamment aux invocations. Lors d’un échange, le premier peloton non dispersé de chaque camp est sélectionné ; le survivant peut donc rencontrer plusieurs pelotons successifs. Les pertes accumulées réduisent sa puissance de base au prochain échange. Aucun coefficient de « fatigue par tour » distinct n’a été établi dans cette lecture.

## Admission, fuite et capture

La puissance d’admission est la somme brute des pelotons ordinaires, avant les bonus de héros et les sorts. Pour `r = P_attaque / P_défense` :

| Mode | Condition du calculateur | Résultat |
| --- | --- | --- |
| PvE | `r ≤ 1/7` | Fuite de l’attaquant ; la rencontre s’arrête |
| PvP | `q = floor(30 × r)`, `q ≤ 2` | Capture de l’attaquant |
| PvP | `q = 3` | Blessure 24 h |
| PvP | `q = 4` | Blessure 18 h |
| PvP | `q = 5` | Blessure 12 h |
| PvP | `q = 6` | Blessure 6 h |
| PvP | `q = 7` | Fuite |
| PvP | `q ≥ 8` | Résolution du combat |

Ainsi, le passage au combat PvP s’effectue ici à `8/30`, pas à 0,23. Une constante `_seuil_fuite_jcj = 0.23` existe dans les données mais **n’est pas utilisée dans cette branche**. Ne pas l’implémenter par simple recherche de son nom. Les cas de puissance défensive nulle et les protections particulières requièrent un traitement explicite non établi par cette fonction.

## Séquence de résolution

1. Construire les puissances initiales et appliquer les règles d’admission.
2. Préparer les bonus d’hérédité et capacités spéciales.
3. Calculer les tirs préalables : barrage des tireurs, balistes spéciales et bombardement conditionnel. Le code accumule les pertes avant de les appliquer aux deux camps.
4. Sélectionner les pelotons actifs. Appliquer les sorts prévus au tour, puis calculer les effectifs de début d’échange.
5. Calculer les puissances de base, les bonus et l’issue de l’échange.
6. Traiter les résurrections et effets temporaires au moment prévu par leur type, puis avancer au tour suivant si nécessaire.
7. Déterminer vainqueur, égalité ou destruction mutuelle.
8. Convertir dispersions et dégâts en pertes définitives selon le statut et les modificateurs ; retirer les invocations temporaires.
9. Calculer l’XP, les effets héréditaires de fin et le rapport.

Il faut conserver cette séparation des phases. Appliquer immédiatement toutes les pertes définitives au milieu d’un échange ou attribuer des unités invoquées au stock durable changerait le résultat.

## Contre-armes

| Arme | Avantage contre | Bonus de base |
| --- | --- | --- |
| Infanterie `I` | Cavalerie `C` | +50 % |
| Tireur `R` | Infanterie `I` | +50 % |
| Cavalerie `C` | Tireur `R` | +50 % |

Le camp en avantage reçoit le bonus. L’autre camp ne reçoit pas automatiquement −50 %. Certains talents de spécialisation n’agissent que lorsque la relation de contre-arme est effectivement présente.

## Puissance d’un peloton

Pour `N` unités de puissance individuelle `p` :

```text
base = N × p
bonus = base × (somme des bonus proportionnels) + N × (somme des bonus fixes par unité)
total = base + bonus
```

À l’attaque, chaque point de caractéristique d’attaque modifiée ajoute 0,5 % ; en défense, même facteur pour la défense modifiée. Les termes incluent ensuite talents, moral, contre-arme et capacités spéciales. Les fortifications s’appliquent au défenseur dans les lieux concernés.

Le bonus de fortification combine celui du lieu, les Larmes de défense et les talents applicables ; les réductions de sapeur ou d’extensions légendaires sont soustraites, puis le résultat est borné à zéro. Dans ce code, le Bâtisseur de fortifications ajoute des points de pourcentage, ce qui n’est pas équivalent à multiplier la fortification existante par un pourcentage supplémentaire.

Les bonus fixes par unité favorisent proportionnellement les petits tiers ; les bonus proportionnels croissent avec la puissance de base. Il s’agit d’une conséquence arithmétique des formules, et non d’une règle d’équilibrage ajoutée.

## Échange élémentaire sans magie

Pour le camp vainqueur `V` et le camp perdant `D`, lorsque leurs totaux sont strictement différents :

```text
dispersion_D = N_D
delta = floor(total_V) − floor(total_D)
si delta > base_V :
    dispersion_V = 0 ; marqueur d’écrasement dans le simulateur
sinon :
    dispersion_V = floor((floor(total_D) − floor(bonus_V)) / p_V)
```

Le bonus du vainqueur absorbe donc une partie de la puissance adverse avant que des unités soient dispersées. Le simulateur utilise `−1` comme marqueur interne d’écrasement : ce n’est pas une perte négative à ajouter au stock. Les comparaisons de totaux et les `floor` ne sont pas interchangeables. Les cas d’égalité et de « faux nul » doivent être reproduits séparément ; la formule simplifiée ci-dessus ne les couvre pas.

### Exemple pédagogique contrôlable

Cent fantassins **fictifs de test**, de puissance 100 chacun, affrontent cent cavaliers de même puissance. Aucun héros ni autre bonus. L’infanterie dispose de 10 000 de base et 5 000 de bonus de contre-arme, soit 15 000. La cavalerie vaut 10 000. Les cent cavaliers sont dispersés ; l’infanterie perd temporairement `floor((10 000 − 5 000)/100) = 50` unités. Ce n’est pas un exemple de statistiques d’une unité historique.

## Dispersion et pertes définitives

Le facteur de pertes de base du calculateur est **0,30**. Dans le cas ordinaire avec héros, les unités perdues en combat et par magie sont multipliées par ce facteur modifié ; une quantité strictement comprise entre zéro et un devient un, les résultats négatifs sont bornés à zéro, puis la partie entière est prise.

Dans l’exemple précédent, sans modificateur et pour deux armées ordinaires avec héros, cela donne 15 morts chez l’infanterie et 30 chez la cavalerie ; les stocks survivants après bataille sont donc 85 et 70, bien que seulement 50 fantassins soient encore actifs au dernier échange. La défaite de la cavalerie ne signifie pas sa destruction intégrale.

**Exceptions obligatoires :** statut PNJ, absence de héros, unités invoquées, résurrections temporaires ou définitives, réduction héréditaire, Massacreur adverse et bonus de Larmes. Les branches du simulateur sont différentes selon les cas. Il ne faut jamais appliquer « 30 % de chaque armée » indépendamment de ce qui a été dispersé, ni promettre que tout PNJ conserve 70 % de ses troupes.

## Puissance magique

La fonction `puissance_effective_sort` compose notamment :

```text
magie_effective = magie_base × (1 + bonus_magie_proportionnel/100)
                 + bonus_instinct + bonus_magie_fixe
efficacité = 1 + expertise + bonus_école + bonus_artéfacts + maîtrise
             − résistance_applicable − antimagie
puissance_sort = coefficient_sort × facteur_arme × magie_effective × efficacité
```

Les valeurs d’expertise, maîtrise et résistance sont converties en fractions dans cette expression. Le code applique la résistance héréditaire aux types dégâts/altération, pas indistinctement à toutes les invocations et améliorations. Le champ `unite` détermine quel camp fournit l’arme pertinente. Les cibles, effets par unité, pourcentages d’armée et dégâts fixes requièrent ensuite leur branche de résolution. Le traitement exact d’une efficacité négative reste à vérifier avant toute généralisation.

## Expérience et Honneur

L’XP de base est calculée sur la puissance adverse dispersée admissible, divisée par le `ratio_xp` de chaque unité. Les branches corrigent les invocations et certains dégâts magiques ; cette base n’est pas simplement le nombre de morts définitifs.

Le modificateur d’honneur brut d’un camp est `(puissance_adverse − puissance_propre) / puissance_propre`. Le calculateur ajoute, selon le contexte, honneur de royaume, bonus PvP de 0,50, dolmens, alliance et artéfacts. Le modificateur total est borné entre −1 et +4 ; il est remis à zéro pour le perdant avant application à sa base d’XP. « Aucun bonus en défaite » ne signifie donc pas nécessairement « aucune XP ». Les intitulés qualitatifs du rapport utilisent aussi dispersion et difficulté ; ils doivent être distingués du classement global d’Honneur.

## Anomalies et fidélité à valider

| Observation dans le code | Risque | Traitement proposé |
| --- | --- | --- |
| Même bonus de défense légendaire ajouté deux fois, avec condition sur l’attaquant | Résultat dépendant d’une erreur de code | Geler l’oracle ancien et confronter à un rapport réel |
| Commentaire `bugged` dans les pertes d’unités bonus ; correction alternative désactivée | Mauvaise séparation unités naturelles/invoquées | Cas de régression dédié avant choix de comportement |
| Constante PvP 0,23 différente de la branche active | Mauvais seuil si lecture superficielle | Utiliser la branche observée dans l’oracle |
| Égalités avec arrondis et marqueurs de faux nul | Vainqueur différent à une unité près | Fixtures de frontière, pas arrondi global |
| Catalogue et calculateur de périodes différentes | Combinaisons non historiques | Versionner toutes les entrées du rapport |

La future qualification « combat fidèle » exigera un corpus de rapports authentiques couvrant ces branches. Les [cas de référence](../../data/combat-reference-cases.json) ne sont que des résultats calculés d’après les formules, explicitement identifiés comme tels.

## Preuves visuelles ajoutées

SS-016 et SS-018 montrent la **préparation** : sept lignes, organisation des pelotons, contributions de puissance, rapports d’espionnage et tours de magie programmés. SS-017 montre la **lecture d’un rapport dans le courrier**, avec sorts, duels, bonus de contre-arme, effectifs et pertes. Ce corpus confirme la distinction entre préparer et lire un résultat automatique ; il ne démontre aucun contrôle tactique en direct.

Le rapport est tronqué et les bonus complets des héros manquent. Il ne rejoint donc pas les oracles chiffrés complets recherchés. La mention « 5 min (0 halte) » dans SS-018 décrit la durée affichée de l’action, pas cinq minutes par tour de résolution. [IMG-01 ; analyse dans `docs/research/ANALYSE-CAPTURES.md`]
