# MMHK-like — V6.6 tranche 6 : provenance du client historique et limites saisonnières

**Audit des sources du 26 octobre 2026 · C03 / C18 · Jeu visé : MMHK saison 2.**

## Synthèse vérifiable

Cette tranche remonte au-delà du calculateur Jactari archivé : elle confronte l'historique **Git d'Aendawyn/MMHK-Plus**, un module tiers écrit en 2013 qui pouvait lire les **véritables structures retournées par le client du jeu**, et deux copies récupérées de `prod.js` Ubisoft.

### Trois niveaux de preuve différents

| Source | Ce qu'elle permet de vérifier | Ce qu'elle ne permet pas de conclure |
| --- | --- | --- |
| Six versions Git de `Jactari/src/scripts/donnees.general.min.js` | Absence des tables `revelation_de_caracteristiques_15` et `_30` dans les révisions disponibles | Que ces effets n'existaient pas dans le serveur Ubisoft |
| `MMHK-Plus/src/modules/common/jactari.js` (Git, 2013) | Identifiants de compétences renvoyés par le client, conversion vers les champs Jactari, **24 talents légendaires** et **9 hérédités mappées** | Prérequis de déblocage d'une classe légendaire ou intégrité d'une fiche envoyée par le navigateur |
| Copies `data/assets-recovered/ubisoft-archive/*/js/prod.js` | Présence de structures d'interface, noms et classes dans des compilations client | Règles de calcul serveur ni attribution authentique des bonus S2 |

La bibliothèque d'intégration originale est conservée **sans réécriture** dans [`data/Jactari/upstream-addon/mmhkplus-jactari-2013.js`](../../data/Jactari/upstream-addon/mmhkplus-jactari-2013.js), depuis [Aendawyn/MMHK-Plus, commit `e8d862d`](https://github.com/Aendawyn/MMHK-Plus/blob/e8d862d82741986759b88012421aed8e8175e26e/MMHK-Plus/src/modules/common/jactari.js). Son blob Git original est **`da8d683044d5803c557888218169b6c722ea0abf`** (41 473 octets) ; un test **recalcule son SHA-1 Git exact** pour détecter une copie modifiée.

## 1. Comparaison de l'historique du calculateur (2013)

La recherche Git sur `Jactari/src/scripts/donnees.general.min.js` fournit six révisions des **25 octobre au 1er novembre 2013** :

- `cf74dba3695faf654ac11549a2e14b3bd8e6a7d9` — 25 octobre 2013 ;
- `3ef6eb704b8101128fb5f4327070771f58a8e14a` — 27 octobre ;
- `d512785e389b3e053fee3cdeb2046385e1c27450` — 28 octobre ;
- `155a87b174ffe6e59fd389f921a4396af35d44fe` — 28 octobre ;
- `468e1d59cf5e7f8c9f75a09e6b785a8585b3d005` — 30 octobre ;
- `7fac4b9bda0425df154b39681d1e3c25e09a5350` — 1er novembre.

**Constat :** dans les six copies récupérées, `revelation_de_caracteristiques` figure dans le catalogue, mais ni `revelation_de_caracteristiques_15` ni `revelation_de_caracteristiques_30` ne disposent d'une entrée. Le code de combat appelle pourtant ces deux dernières variantes, ce qui justifie le **refus explicite** déjà mis en place dans [`historical-heritage-audit.mjs`](../../tools/jactari-port/historical-heritage-audit.mjs).

Il serait incorrect d'ajouter les coefficients de la compétence générique aux deux variantes en prétendant qu'ils sont historiques. **Il reste possible qu'une autre édition du jeu ou des archives non récupérées contiennent de nouvelles définitions** ; cela nécessiterait une preuve nouvelle.

## 2. Les champs réellement lus du jeu par MMHK-Plus

L'intégration Jactari de 2013 accepte notamment les structures suivantes :

```js
// Extraits de forme ; PAS des exemples de valeurs authentifiées
hero.heroSkillList: [
  {heroClassSkillEntityTagName: 'MASTER_FIGHTER', level: 2}
]

hero.equipedArtefacts: [
  {artefactEntity: {id: 123, bodyPart: '...'}}
]

profile.playerHeredityAbilityList: [
  {heredityAbilityEntity: {tagName: 'CHARACTERISTICS_ILLUMINATION',
                           rankingPath: 'H...'}, level: 3}
]
```

Les clés `heroSkillList`, `heroClassSkillEntityTagName`, `equipedArtefacts` (orthographe historique), `playerHeredityAbilityList`, `heredityAbilityEntity.tagName`, `rankingPath` et `level` proviennent directement du code du pont original, et non d'un contrat API fabriqué pour MMHK-like.

Ce code traduit, par exemple, `CHARACTERISTICS_ILLUMINATION` vers `revelation_de_caracteristiques` **sans jamais utiliser les noms `_15/_30`**. Il contient aussi les **24 correspondances** entre les codes Ubisoft comme `MASTER_FIGHTER` et les attributs Jactari comme `legendary_sovereign_b`.

### Nouvel adaptateur

[`original-client-hero-tags.mjs`](../../tools/jactari-port/original-client-hero-tags.mjs) lit **directement** le code du pont historique, extrait les correspondances et propose :

- `originalClientLegendaryTagMap()` : 24 correspondances de noms Ubisoft → (`careerId`, `talentIndex`, nom Jactari) ;
- `projectOriginalHeroLegendarySkills({heroSkillList})` : transforme des rangs historiquement structurés en sélections normalisées, sans considérer l'entrée comme une permission ;
- `originalClientHereditaryTagMap()` : 9 correspondances réelles du client pour l'hérédité ;
- `projectOriginalPlayerHeredity({playerHeredityAbilityList})` : transforme les rangs et **signale les étiquettes inconnues** au lieu d'inventer des bonus.

Le [banc d'essai](../../tools/jactari-port/original-client-hero-tags.test.mjs) exécute la **fonction originale `prepare_talent()`** du module MMHK-Plus à côté du port sur les 24 champs × quatre rangs, soit **96 comparaisons**. L'intégrité du fichier original est attestée par son blob Git ; la source n'est pas seulement une transcription de mapping manuscrite.

**Sécurité :** les deux fonctions de projection renvoient `authoritative:false` ; ce sont des **observations**. Le serveur futur devra aller chercher les compétences depuis l'enregistrement du héros réellement possédé et autorisé, puis garantir les rangs avant de les transmettre aux paramètres `heroLegendaryGrants`. Un tableau client forgé n'est pas une permission.

## 3. Limite saisonnière découverte dans le pont de 2013

À l'intérieur de `permalien()`, l'intégration MMHK-Plus prépare le champ saison avant transfert au calculateur :

```js
donnees.saison = MMHKPLUS.getElement("Player").get("season");
if (donnees.saison < 3)
  donnees.saison = 3;
```

Il s'agit du **comportement littéral du pont historique**. Autrement dit, **ce chemin particulier de préparation des combats remplaçait les saisons 1 et 2 par 3**, ce qui interdit de considérer ses scénarios comme une attestation exacte et indépendante des règles S2 d'Ubisoft.

Cette observation ne prouve ni l'existence ni l'absence d'une différence mathématique entre ces saisons dans le moteur serveur. Elle prouve seulement que **le transfert conservé n'était pas un oracle S2 non modifié**. La réconciliation Jactari ↔ MMHK S2 reste une étape indispensable de C18.

## 4. Inspection des compilations Ubisoft retrouvées

Le scanner [`original-ubisoft-source-audit.mjs`](../../tools/jactari-port/original-ubisoft-source-audit.mjs) examine **en lecture seule**, sans exécuter le code, les compilations client :

| Fichier récupéré | Taille | Indices textuels |
| --- | ---: | --- |
| `1.5.0.39-4-MTR/js/prod.js` | 1 731 927 octets | nombreuses références à l'interface des héros et à l'hérédité ; aucune occurrence textuelle `legendary` |
| `4.1.3-MTR/js/prod.js` | 1 997 286 octets | références explicites à `LEGENDARY_WARRIOR`, `LEGENDARY_WIZARD`, `SHEOGH_SOVEREIGN` et aux éléments de l'interface légendaire |

Les occurrences lexicales sont un **indice d'interface et de période**, pas des constantes ni des permissions du moteur de combat. Les versions des clients récupérées ne suffisent pas à déterminer les prérequis ni les valeurs de la saison 2.

## 5. Clôture limitée et prochaines tâches

**Tranche 6 — Acquis :** source 2013 originale archivée, 24 tags légendaires validés par exécution de `prepare_talent()`, neuf tags d'hérédité source-adossés, intégrité Git vérifiée, six éditions historiques du catalogue examinées, et fail-closed sur les branches orphelines.

**Non acquis :** obtention des classes légendaires dans un serveur MMHK S2, éventuelles règles spécifiques des variantes `_15/_30`, sémantique complète du `prod.js` client, authentification des fiches de héros et transaction de progression serveur.

Le registre C03 demeure `implemented_partial`, C18 `blocked_source`, V6.6 `in_progress`. **Aucune règle inconnue n'a été remplacée silencieusement par une valeur inventée.** Licence du code archivé : GPL-3.0-or-later.
