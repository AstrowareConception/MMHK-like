# US-COM-005 — Bonus de héros : tranche de laboratoire (4 novembre 2026)

**Story :** [US-COM-005](categories/11-COM.md#us-com-005). Priorité P0.
**État : code candidat partiel ; US non acceptée**.

## Contrat vérifié dans les sources

La documentation Jactari du projet prévoit **0,5 % de puissance de base
par point d'attaque ou de défense modifiée**. Une bonification fixe
par unité intervient séparément : pour `N` unités de puissance `p`,

`puissance = N × p × (1 + bonus_proportionnels) + N × bonus_fixe_par_unité`.

Le rôle offensif utilise l'attaque et le rôle défensif la défense.
Les talents conditionnels, la magie, la morale, les artefacts et les
éventuels ajustements S2 restent des traitements distincts.

## Portée implémentée

- `hero_combat_modifiers.py` : module pur pour convertir les attributs
  qualifiés en modificateurs Jactari `attackStackHero`,
  `defendStackHero`, `attackUnitsHero`, `defendUnitsHero`.
- Migration `097_hero_basic_combat_profiles.sql` : table optionnelle
  pour les caractéristiques vérifiées et leur provenance. Aucune
  attribution n'est déduite du niveau, de l'archétype ou de la faction.
- `hero_combat_qualification.py` et la commande
  `qualify-hero-combat` : saisie opérateur explicite ; aucune route
  joueur n'écrit ces caractéristiques.
- `pve_stack_sequence.py` : applique uniquement la composante attaque
  du héros joueur dans le laboratoire de combat régional, par échange.
  Le PNJ n'a pas de héros supposé.
- `region_pve.py` : récupère l'éventuel profil qualifié.
- `region-encounter-panel.tsx` : présente l'attaque, le bonus
  proportionnel, le bonus fixe et la référence de provenance.

Les profils inconnus restent inconnus et ne sont pas automatiquement
reclassés en valeurs historiques égales à zéro. L'absence de profil
signifie que le laboratoire n'applique **aucun bonus de héros présumé**.

## Commande opérateur (sur base de laboratoire sauvegardée)

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage qualify-hero-combat \
  --hero-id UUID_DU_HEROS \
  --attack 10 --defense 6 \
  --attack-per-unit 3 \
  --source-ref LAB-COM-005-EXEMPLE
```

Il s'agit d'une **fixture fictive**, non des statistiques historiques
d'un héros Havre. Son effet pour 100 unités de puissance 100, sans
autre bonus : base 10 000, attaque +5 % soit 500, bonus fixe 100 × 3
soit 300, total **10 800**.

## Critères de l'US

| Critère | État |
|---|---|
| CA01 — caractéristique du rôle et talents applicables | Partiel : attaque du héros source-qualifiée, défense calculée dans le module pur ; talents conditionnels absents |
| CA02 — talent conditionnel inactif | Non recetté ; les talents conditionnels sont exclus, aucune activation implicite |
| CA03 — fixe par unité distinct du pourcentage | Test écrit pour 10 800 (10 000 + 500 + 300) |
| CA04 — reprise et idempotence | Calcul pur reproductible ; worker et commandes persistantes non recettés |
| CA05 — droits et visibilité | Lecture du héros de la cité autorisée ; validation réelle de non-divulgation sur deux comptes à exécuter |

**Definition of Done : non validée.** Aucun effet durable ni gain XP,
perte ou libération de mine n'est appliqué. La lecture des attributs
s'inscrit dans le **laboratoire Jactari**, sans prétendre satisfaire
l'ensemble des règles de héros de saison 2.

Tests écrits :
`test_hero_combat_modifiers.py`,
`test_hero_combat_qualification.py` et
`test_pve_stack_preview.py`. Exécution CI et PostgreSQL à confirmer.

## Extension : talent conditionnel de contre-arme — laboratoire

Les sources Jactari indiquent que **certains** talents spécialisés ne
s'appliquent que lorsqu'une relation de contre-arme existe. Elles ne
justifient pas de leur attribuer automatiquement un nom, une magnitude
ou un palier à tous les héros de saison 2.

Le nouveau module `conditional_hero_talents.py` met en œuvre une
**variante de laboratoire explicitement qualifiée**, avec une condition
unique : le peloton du héros attaquant possède l'avantage I>C, R>I ou C>R.

- Le bonus est exprimé en fraction additive de puissance de base.
- Il s'ajoute aux contre-armes et à l'attaque du héros seulement si
  la condition est effectivement satisfaite, à chaque échange.
- Un type d'arme `E`, inconnu (`NULL`), égal ou défavorable
  n'active pas le bonus.
- Le bonus n'est pas transféré au peloton suivant sans nouveau
  contrôle ; un changement d'adversaire recalcule son activation.
- Aucun niveau, talent, nom ou coefficient n'est déduit du nom du
  héros, de sa faction, de son rang ou du catalogue historique.

### Stockage et activation explicite

Migration `098_hero_conditional_counter_talents.sql` : une
configuration optionnelle par héros, avec coefficient et provenance.
Un profil de combat de base déjà qualifié est requis avant
l'enregistrement d'un talent. Seule la CLI administrative expose
l'écriture de ce profil.

Exemple **fictif de test** :

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage qualify-counter-talent \
  --hero-id UUID_DU_HEROS \
  --bonus 0.15 \
  --source-ref LAB-TALENT-CONTRE-ARME-015
```

L'exemple ne définit pas les véritables statistiques d'un talent S2.

Pour 100 unités de puissance 100 ayant I contre C, avec un héros
qualifié à zéro point d'attaque et un bonus conditionnel fictif
de +15 %, le laboratoire calcule 10 000 + 5 000 (contre-arme) +
1 500 (talent) = **16 500**. Lorsque le même peloton affronte
ensuite une unité R, le bonus conditionnel tombe à zéro.

### Avancement des CA

- **CA01 :** cas conditionnel de laboratoire ajouté ; les vrais talents
  historiques et leurs effets ne sont pas encore certifiés.
- **CA02 :** tests écrits pour les conditions inactives, les classes
  inconnues, les mauvais adversaires et la réévaluation à chaque échange.
- **CA03 :** le bonus fixe reste distinct du pourcentage ; fixture
  précédente conservée.
- **CA04 :** calcul purement déterministe ; aucun ordre métier ni test
  de reprise worker effectué pour cette variante.
- **CA05 :** la route existante vérifie la propriété de la cité et
  du héros ; test multi-comptes sur PostgreSQL encore nécessaire.

Tests ajoutés :
`test_conditional_hero_talents.py`,
`test_conditional_talent_qualification.py` et compléments de
`test_pve_stack_preview.py`.

**US-COM-005 demeure partielle et non acceptée.** Aucun peloton n'est
débité, aucun XP attribué et aucune case libérée par cette tranche.
