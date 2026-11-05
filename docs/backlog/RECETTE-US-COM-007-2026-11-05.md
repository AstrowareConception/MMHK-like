# US-COM-007 — Résoudre les tirs préalables — tranche laboratoire (5 novembre 2026)

**Story :** [US-COM-007](categories/11-COM.md#us-com-007).
**Priorité : P1. Statut : implémentation candidate, non acceptée.**

## Ce qui est réellement établi par la source

La lecture de `data/Jactari/src/scripts/combat.min.js`, fonction
`tir_engins_siege` (CODE-01-COMBAT), établit :

1. Barrage des unités de type R avec un héros et une capacité qualifiée.
2. Balistes calculées sur la puissance des pelotons ordinaires
   lorsque leur capacité est configurée.
3. Bombardement **défensif**, sous conditions
   `saison > 1`, `lieu == 3`, héros défenseur présent et
   unité de siège admissible. Le bombardement utilise le coefficient
   100 %, avec puissance spéciale 1 100 pour une unité de puissance
   300, et 1 600 sinon.
4. Ordre de génération : barrage attaquant et défenseur, balistes
   attaquantes et défensives, puis bombardement défensif.
5. **Calcul sur les effectifs initiaux**, accumulation des pertes
   projetées, puis application après la génération de tous les tirs,
   avant les duels ordinaires.

Les pourcentages de barrage/balistes dépendent des compétences et des
paramètres de la version Jactari : **aucune valeur non vérifiée n'est
attribuée automatiquement aux personnages de MMHK-like**.

## Implémentation

- `apps/api/src/mmhk_api/pve_pre_shots.py` : phase de calcul
  déterministe, avec évènements configurés et sources, ordre fixé
  par la logique Jactari, lecture simultanée de l'état initial.
  Le résultat conserve les pertes projetées, les pertes simulées
  effectivement bornées et les effectifs après tirs.
- `pve_stack_sequence.py` : applique ces pertes **au laboratoire**
  avant le premier échange ordinaire ; un peloton entièrement
  neutralisé est sauté et ne revient pas comme intact.
- Migration `099_hero_pre_shot_lab_profiles.sql` :
  profil optionnel du héros, coefficients barrage/balistes sourcés,
  sans attribution automatique ni rétroactivité.
- `pre_shot_qualification.py` et la commande administrateur
  `qualify-pre-shots` : qualification opérateur, sans accès
  d'écriture côté joueur.
- `region_pve.py` : lecture du profil du héros de la cité
  autorisée ; **seuls les tirs de l'attaquant sont utilisés en
  PvE régional à ce stade**. Le bombardement défensif reste
  vérifiable dans le module pur, mais n'est pas activé sur les
  rencontres neutres sans héros.
- Next.js : schéma de réponse et panneau « phase préalable »
  séparés des échanges ordinaires et des morts définitives.

**Divergence volontaire de sécurité :** si plusieurs tirs appliqués
en différé attribuent des pertes cumulées supérieures à l'effectif
initial d'un peloton, le résultat final est borné à cet effectif.
Ce garde-fou n'est pas une certification de fidélité à tous les
arrondis du client Jactari historique.

## Exemple de configuration opérateur — exclusivement expérimental

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage qualify-pre-shots \
  --hero-id UUID_DU_HEROS \
  --barrage-percent 50 \
  --ballista-percent 0 \
  --source-ref LAB-BARRAGE-EXEMPLE
```

Ce 50 % n'est **pas** une valeur historique d'une compétence :
c'est une fixture destinée au calcul et à la comparaison.

## État des critères d'acceptation

| Critère | Éléments disponibles | Validation |
|---|---|---|
| CA01 — pertes préalables calculées et appliquées dans l'ordre | Module pur + intégration à la simulation multi-pelotons | Tests unitaires écrits ; calcul des capacités et recette S2 incomplets |
| CA02 — capacité absente => aucun tir | Sans profil, liste d'événements vide et effectifs inchangés | Tests écrits ; recette intégrée à exécuter |
| CA03 — deux camps, pas de priorité réseau | Ordre canonique, pertes des deux côtés à partir du même instantané | Tests écrits pour ordre inversé et 5/5 survivants |
| CA04 — cohérence, reprise et idempotence | Calcul déterministe sans modification PostgreSQL | Worker de combat définitif absent, recette non passée |
| CA05 — droits et visibilité | Appartenance à la cité vérifiée avant lecture des capacités | Test de confidentialité multi-comptes sur vraie base à réaliser |

**Definition of Done : non validée.** Aucun critère n'est déclaré
accepté par la simple présence d'un fichier ou d'un test.

## Contrôles à exécuter

```bash
python -m pytest -q apps/api/tests/test_pve_pre_shots.py \
  apps/api/tests/test_pre_shot_qualification.py \
  apps/api/tests/test_pve_stack_sequence.py \
  apps/api/tests/test_pve_stack_preview.py
node tools/validate-implementation-review.mjs
```

Puis exécuter les migrations PostgreSQL V099, les tests FastAPI,
le build TypeScript Next.js et Playwright sur une base jetable.
Les nouveaux calculs ne produisent **aucun** effet économique,
militaire ou territorial durable : pas de pertes définitives,
XP, butin ni libération de mine.

**Dépendances restantes :** règles complètes d'admission et fuite,
capacités particulières, tirs et sorts sur tous les camps, pertes
durables, progression et résolution idempotente de la case.
