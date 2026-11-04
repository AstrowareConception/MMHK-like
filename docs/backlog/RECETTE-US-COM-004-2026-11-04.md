# US-COM-004 — Contre-armes, tranche de laboratoire (4 novembre 2026)

**Story source :** [US-COM-004](categories/11-COM.md#us-com-004).
**Priorité :** P0. **Statut produit : non acceptée.**

## Règle contractuelle issue du backlog et des sources Jactari

Le bonus du combat ordinaire est directionnel : **I > C, R > I,
C > R**. Le camp avantagé reçoit **+50 % de puissance de base**.
Le camp désavantagé ne reçoit pas un malus négatif. Les unités
de classe **E** restent hors du triangle, et la classe inconnue
n'est pas traitée comme E : elle reste non qualifiée.

La fixture US-COM-004-CA03 impose : 100 unités fictives de
puissance 100, infanterie contre cavalerie → **15 000 / 10 000**.

## Architecture et portée réellement développées

- `counter_weapons.py` : règle pure I/R/C/E, résultats et
  provenance de politique versionnée ; refus des codes non pris en charge.
- `sql/095_counter_weapon_classification.sql` : classification
  optionnelle `I/R/C/E` dans les profils de troupes et les rencontres ;
  les anciennes valeurs restent `NULL`, sans inférence par nom.
- `sql/096_weapon_classification_provenance.sql` : exige une référence
  pour chaque classification renseignée.
- `weapon_qualification.py` et `manage.py` : commandes opérateur
  exclusivement, hors API joueur, pour qualifier unités et rencontres.
- `pve_stack_sequence.py` : applique les bonus dans `attackWeapon`
  et `defendWeapon` lors de chaque échange Jactari, sans fatigue.
- `region_pve.py` : récupère les types qualifiés depuis PostgreSQL ;
  les types inconnus ne sont pas déduits des codes d'unités.
- Interface de rencontre : affiche pour chaque échange les types,
  les bonus directionnels et les puissances correspondantes.

La simulation reste un **laboratoire sans effets persistants**.
Les qualifications source doivent être documentées avant activation
pour toute unité. Les règles de talents spécialisés et la
correspondance exhaustive des unités de saison 2 restent ouvertes.

## Qualification administrateur

Après sauvegarde des données et application des migrations :

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage qualify-unit-weapon \
  --unit-code EXEMPLE_UNITE \
  --weapon-type I \
  --source-ref REFERENCE_EXPLICITE
python -m mmhk_api.manage qualify-encounter-weapon \
  --encounter-id UUID_RENCONTRE \
  --weapon-type C \
  --source-ref REFERENCE_EXPLICITE
```

Les identifiants et classifications ci-dessus sont des exemples
d'utilisation : **ne pas recopier une attribution fictive dans une
partie réelle**. Aucun catalogue d'unités n'est classé automatiquement.

## Matrice des cinq critères d'acceptation

| CA | Preuve candidate | État |
| --- | --- | --- |
| CA01 : triangle I/C/R à +50 % | `test_counter_weapons.py`, permutations directionnelles | Tests écrits, exécution non confirmée |
| CA02 : type E sans relation inventée | Tests E/I, E/R, E/C et types égaux | Tests écrits, exécution non confirmée |
| CA03 : 100 × p100 I contre C = 15 000 / 10 000 | Test sur `resolve_ordinary_lines` | Test écrit, exécution non confirmée |
| CA04 : reprise idempotente | Module de calcul pur, déterminisme testé ; aucun ordre définitif | Partiel, worker réel non validé |
| CA05 : droits et visibilité | Prévisualisation owner-scoped, qualification réservée à la CLI | À recetter en PostgreSQL/HTTP avec deux comptes |

**DoD : non validée.** Les 5 CA ne sont pas recettés sur des
fixtures d'intégration et la compatibilité S2/talents reste à qualifier.

## Commandes de vérification

```bash
python -m pytest -q apps/api/tests/test_counter_weapons.py \
  apps/api/tests/test_weapon_qualification.py \
  apps/api/tests/test_pve_stack_sequence.py \
  apps/api/tests/test_pve_stack_preview.py
```

La compilation Next.js et les tests PostgreSQL avec la migration 095–096
doivent aussi réussir avant de poursuivre. La CI peut les exécuter
avec ses jobs habituels, mais aucun succès n'est affirmé ici.
