# Recette ciblée US-COM-017 — incrément rapport de duel (non accepté)

**Date :** 4 novembre 2026

**Story source :** [US-COM-017](categories/11-COM.md#us-com-017).
**Périmètre livré :** interprétation d'un duel **mono-peloton de
laboratoire Jactari** et restitution de son instantané. Ce périmètre est
un sous-ensemble de l'US complète, qui demande également sorts, duels
et pertes **par tour**.

| Critère | Contrôle envisagé | État |
| --- | --- | --- |
| CA01 — séquence explique le bilan | Exécuter un duel complet multi-pelotons et lire les tours, sorts, pertes et bilan | Partiel : verdict de duel mono-peloton seulement |
| CA02 — données privées masquées | Deux comptes : rapport du participant / accès direct d'un compte étranger | À exécuter sur PostgreSQL/API |
| CA03 — ancien rapport non recalculé | Enregistrer un rapport, modifier le catalogue, relire l'instantané identique | Mécanisme d'instantané présent ; preuve intégrée à exécuter |
| CA04 — consultation sans mutation | Relire puis rafraîchir le rapport et comparer les tables d'ordres/stocks/XP | À exécuter |
| CA05 — refus d'accès étranger | Rejouer un lien direct de rapport sur une autre cité/monde | À exécuter |

**Tests ajoutés :**
`apps/api/tests/test_pve_report_interpretation.py`. Ils couvrent les
sentinelles de victoire écrasante, la dispersion, le nul et le refus
des résultats incomplets. Leur exécution n'a pas été confirmée.

**Code candidat :**
- `apps/api/src/mmhk_api/pve_report_interpretation.py`
- `apps/api/src/mmhk_api/pve_missions.py`
- `apps/web/app/cities/[cityId]/missions/[missionId]/page.tsx`
- `apps/web/components/region-missions.tsx`

**Dépendances bloquantes :** US-COM-001, moteur de bataille
multi-pelotons, simulation des sorts, calcul et application des
morts définitives US-COM-014, expérience US-COM-016, cohérence
du rapport et des événements de bataille. La restitution actuelle
indique explicitement qu'elle ne libère pas les mines et ne
crédite pas d'XP ou de récompense.

**DoD :** non validée. Aucun CA n'est déclaré passé par
simple inspection du code ou création d'un test. Le retour
produit et une campagne E2E sur base jetable restent nécessaires.

## Commandes pour la prochaine recette locale

```bash
python -m pytest -q apps/api/tests/test_pve_report_interpretation.py
python -m pytest -q apps/api/tests
cd apps/web && npm run typecheck && npm run build
```

La première commande est un test purement fonctionnel ; les autres
nécessitent une installation complète et, pour certaines suites, une
base PostgreSQL jetable configurée. Ne pas lancer les tests générant
des ordres sur une sauvegarde de partie réelle.
