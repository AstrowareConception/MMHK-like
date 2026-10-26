# Jactari V6.3 — Héros, modificateurs indépendants et admission des batailles

**26 octobre 2026 — nouvelle tranche publiée et vérifiée par GitHub Actions.**

## Objectif de qualité

La finalité de MMHK-like est un moteur **pleinement conforme à la référence historique établie**, y compris héros, compétences, équipement, magie, déroulement et pertes définitives. Ce document distingue impérativement :

1. **Fidélité de sous-fonctions prouvée contre le véritable Jactari 4.1.3-MTR** (source communautaire datée du 4 mars 2013).
2. **Fidélité de rencontres intégrées dans les fixtures exécutées**, sans prétendre couvrir tous les cas.
3. **Règles encore non prouvées ou non intégrées**, et surtout non démontrées identiques à **MMHK saison 2**.

Les valeurs de Jactari ne deviennent **jamais automatiquement** des paramètres Ubisoft S2 vérifiés.

## 1. Calcul des héros contre un oracle ORIGINAL indépendant

[`historical-bonuses-oracle.mjs`](../../tools/jactari-port/historical-bonuses-oracle.mjs) charge et exécute **sans retouche** la fonction historique `bonus_attaque_defense()` dans `node:vm`. Il n'utilise pas `calculateBonuses()` pour calculer les valeurs attendues : l'oracle n'est plus circulaire.

[`historical-bonuses-differential.test.mjs`](../../tools/jactari-port/historical-bonuses-differential.test.mjs) confronte **600 compositions de héros** (attaque/défense modifiées, flat bonus, talents, armes I/R/C, pièges, cité, région, larmes et sapeur) et teste deux branches anormales du code original.

Plus important : [`historical-encounter-harness.mjs`](../../tools/jactari-port/historical-encounter-harness.mjs) exécute dorénavant **également la vraie fonction historique `bonus_attaque_defense()` pendant les duels** et enregistre les neuf paramètres de chaque duel. Le [comparateur complet](../../tools/jactari-port/historical-encounter-differential.mjs) compare indépendamment **chaque modificateur** entre le code original et le moteur unifié, en plus du résultat militaire et des pertes définitives.

[`historical-hero-encounters.test.mjs`](../../tools/jactari-port/historical-hero-encounters.test.mjs) ajoute trois variantes nommées de bataille avec héros d'élite et **80 batailles générées avec héros**, modificateurs, armes et fortifications différentes. Elles passent contre l'orchestrateur Jactari natif. Les modifications de `bonuses.mjs` ne portent que sur les comportements étayés par le source.

### Anomalie originelle identifiée, non dissimulée

Dans `bonus_attaque_defense()` original, le bonus `bonus_legendary_legwarrior_b` est traité par **deux conditions dupliquées qui lisent le héros attaquant mais ajoutent, deux fois, la valeur du héros défenseur**. Si le champ attaquant est présent alors que la valeur défenseur est absente, le résultat original peut devenir `NaN`.

Le portage supporte deux intentions **explicites** :

- `heroPolicy: 'jactari-original'` **(par défaut)** conserve les deux tests erronés, leur double addition et bloque le calcul si le résultat devient non fini. C'est une fidélité intentionnelle au calculateur historique, avec refus d'un état intrinsèquement incohérent.
- `heroPolicy: 'normalized'` est une **proposition de correction**, qui ajoute une seule fois le bonus du héros défenseur. Ne pas présenter cette branche comme un résultat historique S2.

**Aucune correction silencieuse d'un bug historique** : la politique devra être arrêtée après recherche d'autres preuves MMHK saison 2.

## 2. Admission PvE/PvP : source exécutée, puis porte d'entrée

[`admission.mjs`](../../tools/jactari-port/admission.mjs) reproduit les branches de `simulation_rencontre()` :

- PvE : si `puissance_attaque / puissance_defense <= 1/7`, l'attaquant fuit **avant le moindre duel**.
- PvP : calcul `floor((puissance_attaque / puissance_defense) * 30)`. Valeurs 0–2 : capture ; 3 : blessure 24 h ; 4 : 18 h ; 5 : 12 h ; 6 : 6 h ; 7 : fuite ; 8 ou plus : bataille.
- La puissance d'admission provient des **sept pelotons initiaux** (effectif × puissance unitaire), avant magie et invocations.

Le fichier [`admission-differential.test.mjs`](../../tools/jactari-port/admission-differential.test.mjs) **réexécute directement le fragment original de `simulation_rencontre()`** sous `node:vm` et vérifie **2 000 répartitions PvP et 2 000 répartitions PvE**, plus seuils frontières, durées et entrées invalides.

[`admission-battle.mjs`](../../tools/jactari-port/admission-battle.mjs) expose `adjudicateJactariBattle()`, qui empêche qu'une fuite, capture ou blessure produise un duel imaginaire, une perte de garnison ou un bilan de morts inventé. Les armées restent inchangées sur les branches d'interception.

**Attention :** les conséquences persistantes d'une blessure/capture sont **des intentions d'événements** (`pendingServerResolution`). Aucune durée de mission ou modification de base de données n'est improvisée. Il manque le traitement transactionnel des héros et des missions.

## 3. Puissance des sorts : les modificateurs magiques du héros

[`historical-spell-power-oracle.mjs`](../../tools/jactari-port/historical-spell-power-oracle.mjs) exécute la fonction originale `puissance_effective_sort()`, avec les données magiques et compétences préparées dans le contexte de test et **sans artefact équipé**.

[`historical-spell-power-differential.test.mjs`](../../tools/jactari-port/historical-spell-power-differential.test.mjs) compare **400 configurations déterministes** (et un cas d'élite) au port `calculateEffectiveSpellPower()` : puissance du sort, arme affectée, magie, instinct, compétence d'expert, classe légendaire, école, maîtrise, résistance et antimagie. Tout effet d'artefact non réellement configuré est refusé, plutôt qu'inventé.

**L'intégralité de `bonus_magie_artefacts()` avec de véritables artefacts et leurs interactions n'est PAS encore validée.** L'accès aux sorts, prérequis, caractéristiques des héros et équipement restent également à rattacher aux données originales. La parité numérique ici concerne les compositions testées et les slots d'artefacts vides.

## 4. Valeurs de référence versionnées

[`source-profile.mjs`](../../tools/jactari-port/source-profile.mjs) lit et vérifie les déclarations directement dans `data/Jactari/src/scripts/donnees.general.min.js` :

| Constante extraite | Valeur vérifiée |
| --- | --- |
| Version du calculateur | `v.4.1.3-MTR`, 2013-03-04 |
| `_facteur_bonus` | 0,50 |
| `_facteur_pertes` | 0,30 |
| `_seuil_fuite_jce` | 1/7 |
| `_seuil_fuite_jcj` déclaré | 0,23 |
| `_bonus_jcj` | 0,50 |

La constante déclarée `_seuil_fuite_jcj=0.23` n'est **pas** le test directement employé dans la branche d'admission PvP qui, elle, utilise `Math.floor(ratio*30)`. Ne jamais les substituer aveuglément : les tests différentiels portent sur la branche **effectivement exécutée**.

[`adjudicateJactariReferenceBattle()`](../../tools/jactari-port/admission-battle.mjs) est un **point d'entrée opt-in** qui injecte explicitement ces deux facteurs Jactari dans le moteur, et refuse les changements de coefficients par l'appelant. Ce point d'entrée reproduit un **profil de calculateur** ; il ne prétend pas certifier l'équilibrage d'un serveur MMHK S2.

## 5. Tests et preuve CI

La V6.2 disposait de **236 tests Node.js réussis**. La nouvelle suite ajoute les vérifications ciblées et différentielles suivantes :

- **600 jeux de bonus de héros** confrontés au code original ;
- **4 000 évaluations d'admission** exécutées contre le véritable fragment historique ;
- **80 batailles générées** combinant héros, armes et fortifications, ainsi que les trois cas de référence région/cité/nature ;
- **400 évaluations de puissance effective des sorts** avec modificateurs magiques ;
- tests de protection des événements d'admission, original/normalisé et profils de coefficients.

La suite complète a été vérifiée avec **261 tests `node:test` passants sur 261** (des milliers de cas arithmétiques sont regroupés dans certains tests) : voir [GitHub Actions](https://github.com/AstrowareConception/MMHK-like/actions/runs/40294118424). Dernier code testé plus récent : consulter les exécutions GitHub Actions associées aux commits de la V6.3.

Exécution : `node --test tools/jactari-port/*.test.mjs`.

## 6. Restant impératif avant « 100 % conforme »

| Priorité | Bloc non encore certifié |
| --- | --- |
| P0 | Source exacte des héros : compétences, carrières, niveaux, artefacts, objets, bonus de sets, tous talents légendaires ; génération des stats modifiées avant bataille |
| P0 | `bonus_magie_artefacts()` complet avec artefacts réels, `puissance_effective_sort()` avec le vrai contexte d'équipement et compétences ; apprendre/disponibilité des sorts |
| P0 | Sièges, salves, engins, défense de halte et autres phases avec le calculateur original (et non de simples substitutions) |
| P0 | PvE non joueur, héros absents, troisième invocation, dispersion/égalité, événements adverses dans le même tour |
| P0 | Conversion complète : mort définitive, relève, résurrection, coût économique et **expérience de héros** sur des fiches réalistes |
| P0 | Comparaisons S2 indépendantes de Jactari 4.1.3-MTR : archives d'une version S2, rapports authentiques, écarts saisonniers documentés |
| P1 | Persistance transactionnelle des blessures/captures/fuites, missions, retour et historique d'événements, sans double application |
| P1 | Contrats serveur sécurisés, contrôles d'intégrité, rollback, concurrence d'ordres, CI de non-régression et licence GPL |

**État de qualité :** la V6.3 élève très nettement la couverture de **mécaniques de héros réellement confrontées au code original**, mais n'autorise **pas** encore à écrire « moteur de combat 100 % conforme à MMHK S2 ». Tant que chaque ligne du tableau P0 n'aura pas ses fixtures, le moteur demeure expérimental et non utilisable comme arbitre PvP de production.

**Licence :** conservation des attributions Jactari/Aspirin/Aendawyn et des obligations GPL-3.0-or-later pour les travaux dérivés.
