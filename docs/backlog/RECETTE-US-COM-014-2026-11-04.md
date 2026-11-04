# Recette US-COM-014 — pertes définitives (incrément laboratoire)

**Story :** [US-COM-014](categories/11-COM.md#us-com-014)
— Calculer les morts définitives. **Priorité P0**. Aucune acceptance
produit prononcée à cette date.

## Périmètre techniquement présent

Le module `mmhk_api.pve_casualties` reproduit la conversion de base
pour des unités ordinaires **avec héros**, sans bonus :
`factor=0.30`, fraction positive inférieure à un → une mort, zéro
dispersé → zéro mort, sinon troncature vers zéro.

Fixtures de contrôle du backlog :

| Dispersés | Morts | Observation |
|---:|---:|---|
| 0 | 0 | Pas de perte minimale artificielle |
| 1 | 1 | Minimum conditionnel |
| 4 | 1 | Troncature positive |
| 50 | 15 | CA03, premier camp |
| 100 | 30 | CA03, second camp |

`ordinary_hero_permanent_losses` refuse les profils sans héros,
les unités non ordinaires et les facteurs modifiés non explicitement
qualifiés ; elle retourne un détail de calcul avec
`effects_applied=false`. Cette fonction ne touche jamais PostgreSQL.

Le rapport PvE expérimental présente à titre pédagogique une
**projection conditionnelle des pertes de l'attaquant ordinaire**.
Elle n'est ni débitée ni considérée comme une preuve du résultat
réel ; les défenseurs PNJ nécessitent un traitement particulier.

## Critères d'acceptation : état exact

| Critère | État | Preuve / blocage |
|---|---|---|
| CA01 — coefficients et modificateurs | Partiel | 0,30 de base ; exceptions talents, artefacts, PNJ, Larmes non implémentées |
| CA02 — 0 dispersé | Test écrit | Cas 0 → 0 dans `test_pve_casualties.py` |
| CA03 — 50/100 dispersés | Tests écrits | 15/30 avec coefficients non modifiés |
| CA04 — reprise/idempotence | Non validé | Aucune mutation des armées ; preuve métier inexistante |
| CA05 — droits/visibilité | Non validé | Pas de nouvel endpoint de mutation ; tests multi-comptes nécessaires |

**DoD non satisfaite** : aucune recette intégrée du moteur complet,
aucune preuve d'application en base, aucune validation utilisateur.

## Travail restant pour une vraie boucle de jeu

1. Compléter les sept pelotons, les échanges successifs et les bonus
   selon les sources Jactari et les décisions P0.
2. Implémenter séparément les pertes des PNJ, des unités sans héros,
   invocations, résurrections, talents et artefacts ; préparer les
   fixtures différentielles.
3. Résoudre le combat dans une transaction unique, avec le résultat
   de l'ordre et son identifiant unique, après vérification de
   l'occupation et des verrous.
4. Appliquer les effectifs durables, libérer ou maintenir la case,
   puis créditer XP/butin uniquement selon un droit validé.
5. Tester rollback, concurrence et redémarrage du worker, puis
   enchaîner les US-REG-003/004, US-COM-002/016 et US-RAP-001.

Commande de test ciblé :

```bash
python -m pytest -q apps/api/tests/test_pve_casualties.py \
  apps/api/tests/test_pve_report_interpretation.py
```

Cette suite a été **ajoutée**, mais son exécution et son résultat
ne sont pas encore confirmés par la stack de développement.
