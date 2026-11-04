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
