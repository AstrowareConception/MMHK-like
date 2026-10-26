# Jactari V6.6 — Tranche 3 : cycle de vie des carrières et remboursements

**26 octobre 2026 · Domaine de conformité C03 · Statut : `implemented_partial` / V6.6 `in_progress`.**

## Objectif

Après la validation des carrières admissibles, du budget des talents et des montées/descentes de rang (tranche 2), cette livraison traite **l'ajout, le remplacement et l'abandon d'une carrière**. Les pertes ou remboursements de points doivent rester exacts, notamment lorsqu'un héros possède plusieurs carrières partageant **Scribe** ou **Maître des arcanes**.

Deux modèles sont maintenus : le comportement du **calculateur Jactari 4.1.3-MTR** rejoué sous une façade de navigateur, et le modèle de **validation stricte d'un état final** exploitable plus tard par un serveur. Le second ne prétend pas reproduire tous les états temporaires de l'interface.

## Modules

- [`hero-career-lifecycle.mjs`](../../tools/jactari-port/hero-career-lifecycle.mjs) propose `transitionJactariCareer({profile,careers,op,slot,careerId})`. `op` vaut `select`, `replace` ou `abandon`. Il calcule un nouveau plan **sans muter** l'ancien et renvoie `before`, `after`, `deltaSpent` ainsi que `currentCareerPlan`.
- [`historical-career-lifecycle-oracle.mjs`](../../tools/jactari-port/historical-career-lifecycle-oracle.mjs) extrait et exécute **sans modifier le corps des fonctions** `change_carriere()`, `desactive_carriere()`, `change_talent()`, `validite_carriere()`, `maj_talent()` et `maj_comp()` depuis `heros.min.js`. Une façade jQuery enregistre les valeurs des sélecteurs et neutralise uniquement leur affichage. Les données `donnees.general.min.js` et `donnees.heros.min.js` sont celles du dépôt.
- [`hero-career-lifecycle.test.mjs`](../../tools/jactari-port/hero-career-lifecycle.test.mjs) confronte séquences et remboursements à l'oracle et vérifie les refus d'entrées invalides.
- [`historical-respecialization.test.mjs`](../../tools/jactari-port/historical-respecialization.test.mjs) compare les seuils de `change_respec()` et `change_tenancier()` aux contrôles sur les profils de héros de `hero-page-snapshot.mjs`.

## Comportements démontrés

| Situation | Modèle utilisé / vérification |
| --- | --- |
| Sélectionner une carrière | Coût initial **1 point**, talents à rang zéro |
| Ajouter une carrière supplémentaire | Nouveau point de carrière ; un rang Scribe/Arcanes déjà partagé est hérité **sans deuxième facturation** |
| Remplacer une carrière | Remboursement de ses rangs ordinaires ; conservation du point de carrière, réinitialisation des talents de la nouvelle carrière |
| Abandonner une carrière | Remboursement du point de carrière, des rangs ordinaires et des talents partagés uniquement lorsqu'aucun autre titulaire ne les conserve |
| Remplacer une carrière par elle-même | Opération historique valide qui réinitialise les rangs ; un dernier Scribe isolé doit être effacé et remboursé |
| Deux carrières partageant Scribe ou Arcanes | Le rang historique restant est conservé par le titulaire survivant, sans double remboursement |
| Respecialisation | `0 <= nombre <= floor(niveau/2)` |
| Bonus de tenancier | Valeurs admissibles **0 à 3** |

La correction sur le remplacement d'une carrière par elle-même est importante : la première projection de notre modèle réutilisait le rang partagé de la carrière en cours de suppression. La version corrigée recalcule les rangs héritables **uniquement depuis les autres carrières qui survivent** à cette opération.

## Corpus et preuves

Le banc de test a réellement exécuté :

- **60 scénarios** d'ajout, remplacement ou abandon de carrières contre les fonctions historiques ;
- des cas ciblés de **remboursement des talents de rang 3**, de conservation/abandon des talents partagés et de remplacement par la même carrière ;
- **40 niveaux × 22 valeurs** de respecialisation, et les valeurs limites de tenancier, comparés à `change_respec()` et `change_tenancier()` originaux ;
- les tests des tranches antérieures (fiches de héros, statistiques militaires, talents, magie, admis­sion et combats).

**GitHub Actions : [313 tests Node.js réussis sur 313](https://github.com/AstrowareConception/MMHK-like/actions/runs/40306285724), zéro échec.** Les centaines de cas historiques sont groupés dans quelques tests `node:test` et ne constituent pas chacun un test Node distinct.

## Contrat métier strict

```js
import {transitionJactariCareer} from './tools/jactari-port/index.mjs';

const result=transitionJactariCareer({
  profile:trustedServerHeroProfile,
  careers:trustedExistingCareerPlan,
  op:'replace',
  slot:2,
  careerId:trustedCatalogCareerId
});

// result.currentCareerPlan = projection, PAS une écriture de BDD.
// result.deltaSpent est signé (négatif = points remboursés).
```

L'API refuse les emplacements absents ou déjà occupés pour les opérations incompatibles, les doublons, les rangs inconnus, les carrières interdites et les budgets dépassés. Elle n'écrit **aucun** état de jeu dans une base de données et n'autorise **aucun** utilisateur en ligne. La progression doit toujours être vérifiée à partir du héros réellement possédé et sauvegardé côté serveur.

## Limites et prochaines vérifications

Il reste une divergence de **périmètre de validation**, non une défaillance masquée : les changements sont comparés en partant d'**états initiaux valides et synchronisés**, et la façade HTML ne reproduit pas toutes les mutations de menus/choix historiques. La fonction serveur est volontairement plus stricte sur les états finaux que les contrôles de formulaire originaux.

**À couvrir avant de clôturer V6.6 et C03 :** chaînes de remplacements et d'abandons répétées avec plusieurs talents déjà appris, états temporairement divergents Scribe/Arcanes, choix et prérequis des classes légendaires, synchronisation des carrières et de l'expérience en persistance, variantes héréditaires `_15/_30`, et validation indépendante des règles Ubisoft **MMHK saison 2**.

La conformité « 100 % MMHK S2 » **n'est pas atteinte**, et le moteur de combat reste interdit en tant qu'arbitre PvP de production. Code original et dérivés : **GPL-3.0-or-later**.
