# Jactari V6.4 — Artefacts authentiques et puissance magique des héros

**26 octobre 2026 — code publié, tests différentiels verts.**

## Pourquoi cette tranche était indispensable

Jusqu'à la V6.3, le sous-calculateur de puissance des sorts savait combiner les caractéristiques d'un héros (magie, instinct, école, expert, traits légendaires, maîtrise, résistance et antimagie), mais recevait l'efficacité des artefacts comme un pourcentage déjà résolu. Ceci interdisait de prétendre que le moteur connaissait les **véritables effets d'un équipement**.

La V6.4 utilise le **catalogue original** `data/Jactari/src/scripts/donnees.artefacts.min.js` et contrôle directement les fonctions historiques `bonus_magie_artefacts()` et `puissance_effective_sort()`. L'entrée reste un catalogue de confiance fourni par le serveur ; un client ne doit jamais pouvoir transmettre arbitrairement des artefacts ou effets.

## Ce qui a été développé

- [`artifact-spell-bonus.mjs`](../../tools/jactari-port/artifact-spell-bonus.mjs) : moteur pur de filtrage des effets magiques d'un inventaire d'artefacts. Vérifie école de magie, type de sort, cible, cercle, arme concernée, type de dégâts et effets ciblant un héros. Les niveaux d'effet sont lus dans `effects[id].v[level-1]`, sans inventer de valeurs.
- [`historical-artifact-oracle.mjs`](../../tools/jactari-port/historical-artifact-oracle.mjs) : exécution isolée de la **vraie fonction originale** `bonus_magie_artefacts()` et des **vraies tables** `_artefacts`, `_effets`, `_types_effets_magie` et `_slots`.
- [`spell-power.mjs`](../../tools/jactari-port/spell-power.mjs) : `calculateEffectiveSpellPower()` accepte `artifactContext:{artifactIds,catalog}` et calcule lui-même l'efficacité de l'équipement. Il refuse le cumul de cette entrée réelle avec un pourcentage d'efficacité injecté par l'appelant, pour éviter un double comptage et les bonus forgés.
- [`historical-spell-power-oracle.mjs`](../../tools/jactari-port/historical-spell-power-oracle.mjs) : exécute la vraie fonction de puissance magique avec les vrais artefacts du héros, y compris l'identifiant de cible du sort.

## Différentiels exécutés

| Épreuve | Tests de référence | Résultat |
| --- | --- | --- |
| Éligibilité des artefacts, avec catalogue réel | 100 cas dirigés + 180 configurations déterministes | Concordance avec `bonus_magie_artefacts()` |
| Puissance effective d'un sort lancé par un héros équipé | 120 configurations | Concordance avec `puissance_effective_sort()`, y compris l'inventaire d'artefacts |
| Validation des effets et sécurité des entrées | Rejet des artefacts inexistants, du double pourcentage et des inventaires incohérents | Tests passants |
| Régressions V6.0–V6.3 | Rencontres multi-tours, héros, admissions, invocations, résurrections, reports | Pas de nouvelle régression |

Le test a d'abord révélé une erreur de **mise en place du banc historique** : `_sorts[0].cible` était absent lors de l'appel du calculateur original, ce qui annulait à tort les effets d'artefacts liés aux cibles de sorts. L'identifiant de cible est désormais transmis et les deux fonctions originales sont appelées ensemble. Cette correction concerne la **fixture de comparaison**, et non une modification arbitraire des règles du moteur.

**CI confirmée : [267/267 tests passants](https://github.com/AstrowareConception/MMHK-like/actions/runs/40295576832), 0 échec.** Les 280 configurations d'artefacts et les 120 puissances équipées sont comptées comme des scénarios dans quelques tests `node:test`, et non 400 tests unitaires distincts.

## Exemple de contrat de calcul

```js
import {calculateEffectiveSpellPower} from './tools/jactari-port/spell-power.mjs';

const result=calculateEffectiveSpellPower({
  spell:{school:2,type:4,target:5,unit:0,circle:2,power:10,
    factors:{I:1,R:1,C:1}},
  side:'attacker',
  attackerWeapon:'I',
  defenderWeapon:'R',
  hero:trustedHero,
  mastery:trustedMastery,
  resistance:trustedResistance,
  antiMagic:trustedAntiMagic,
  artifactContext:{
    artifactIds:trustedEquippedArtifactIds,
    catalog:verifiedJactariArtifactCatalog
  }
});
```

**Important :** il s'agit d'une API arithmétique avec **contexte de confiance fourni par le serveur**. La V6.4 ne résout pas encore automatiquement chaque sort dans le moteur de bataille unifié à partir d'une fiche complète de héros évolutive. Dans `simulateUnifiedBattle()`, les sorts reçoivent encore une `power` effective déjà calculée : le raccordement dynamique est donc une priorité suivante.

## Restant avant la déclaration « 100 % conforme »

Le référentiel reste **Jactari v4.1.3-MTR** (outil communautaire) et non une attestation du serveur **MMHK saison 2**. Les cases suivantes doivent encore être traitées avant le moindre verdict de conformité exhaustive :

1. Lier les fiches de héros aux **catalogues réels d'archétypes, niveaux, carrières, talents, héritage, classes légendaires, équipements et ensembles d'artefacts**, puis reconstituer toutes les statistiques finales.
2. Faire calculer automatiquement la magie et les modificateurs en fonction du **peloton actif à chaque tour**, sans accepter de statistiques/artefacts forgés par le client.
3. Exécuter en différentiel **tous les cas de siège, bombardement, tirs préalables, bonus de moral, raretés et résistances**, y compris contre des héros absents ou des PNJ.
4. Comparer les dépenses d'unités, pertes définitives et **expérience de héros** dans le compte rendu complet.
5. Obtenir des **sources indépendantes propres à la saison 2** ou des rapports historiques authentiques lorsque Jactari ne suffit pas.
6. Déployer ensuite un arbitrage serveur **transactionnel** pour blessures, captures, missions et retour d'armée, avec validation de licence GPL-3.0-or-later.

**Le succès des tests prouve la conformité aux cas vérifiés et aux fonctions communautaires testées. Il ne prouve pas que toutes les règles du jeu d'origine ont été retrouvées.**
