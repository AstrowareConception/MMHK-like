# Jactari V6.6 — Tranche 4 : classes légendaires et effets de combat

**26 octobre 2026 — sous-fonctions testées contre Jactari 4.1.3-MTR.**  
**Périmètre de conformité : C03 / C04 / C06. Tous restent non certifiés au sens « 100 % MMHK saison 2 ».**

## 1. Ce que les sources originales permettent d'affirmer

Les catalogues `data/Jactari/src/scripts/donnees.heros.min.js` exposent huit familles de talents légendaires, aux indices de carrière **13 à 20**, comportant chacune **trois talents à quatre valeurs de rang (zéro puis rangs 1–3)** : 24 talents légendaires différents. Les noms internes de la version archivée sont :

| Indice | Famille d'attributs, nom conservé |
| --- | --- |
| 13 | `legendary_sovereign` |
| 14 | `legendary_legwarrior` |
| 15 | `legendary_magehunter` |
| 16 | `legendary_legpaladin` |
| 17 | `legendary_ethernalnight` |
| 18 | `legendary_kingundead` |
| 19 | `legendary_legmagician` |
| 20 | `legendary_dragonkinght` (orthographe historique conservée) |

Chaque famille contient un trio de noms `*_a`, `*_b`, `*_c`, dont les **valeurs exactes par rang** sont lues dans `_talents[careerId][talentIndex].v`. Les mécanismes touchés incluent bonus militaires, efficacité de différentes écoles de magie, modifications de fortification et mortalité définitive après le combat.

Dans le code original du calculateur, `_talents_legendary_combat.attaquant` et `.defenseur` proposent ces sélecteurs indépendamment. `controle_legendary_classes()` pilote notamment leur présentation lorsque des rangs non nuls sont enregistrés. **Ce code de simulation ne fournit pas de preuve suffisante des prérequis de déblocage, de la carrière légendaire légitimement acquise, du coût de ses rangs ou de la saison à laquelle ces règles s'appliquent réellement.** Ces éléments doivent venir de sources historiques distinctes et être ensuite appliqués côté serveur. Aucune limite de niveau, aucune condition de guilde et aucun coût fictif n'ont été ajoutés.

## 2. Implémentation livrée

| Fichier | Comportement |
| --- | --- |
| [`hero-legendary.mjs`](../../tools/jactari-port/hero-legendary.mjs) | Lit les huit familles et valide les 24 talents/rangs à partir des tables originales, sans recopier les valeurs |
| [`hero-combat-snapshot.mjs`](../../tools/jactari-port/hero-combat-snapshot.mjs) | Associe les bonus légendaires autorisés aux caractéristiques militaires, aux talents et au calcul de combat |
| [`hero-combat-battle.mjs`](../../tools/jactari-port/hero-combat-battle.mjs) | Accepte `heroLegendaries` pour les deux camps uniquement si un `heroLegendaryGrants` est fourni pour chaque camp |
| [`hero-legendary.test.mjs`](../../tools/jactari-port/hero-legendary.test.mjs) | Vérifie toutes les valeurs avec la préparation de héros originale, les bonus de magie et le refus d'une élévation de rang non accordée |
| [`historical-legendary-encounters.test.mjs`](../../tools/jactari-port/historical-legendary-encounters.test.mjs) | Rejoue des combats entiers contre `simulation_rencontre()`, `simulation_combat()` et `bonus_attaque_defense()` historiques |

### Deux politiques de confiance distinctes

- **`calculator-reference`** : reproduit le principe du calculateur Jactari, dont les sélecteurs permettent de renseigner un rang. Ce mode est utile pour **les tests et la rétroconception uniquement** ; il ne démontre jamais que le héros avait le droit de posséder ce rang dans MMHK.
- **`server-entitlement`** : vérifie le rang demandé contre un dictionnaire de rangs maximaux **autorisés depuis l'état serveur** (une entrée par nom de talent). Toute valeur absente, incorrecte ou supérieure est refusée. Le code ne vérifie pas lui-même la provenance de ce dictionnaire : elle devra être garantie par le serveur et ses transactions.

L'intégration de bataille `simulateBattleWithDerivedHeroes()` emprunte exclusivement la seconde voie lorsqu'on fournit `heroLegendaries`. Elle **rejette désormais aussi les rangs légendaires injectés par l'ancien argument brut `heroTalents`**, afin de fermer ce chemin de contournement. Les profils eux-mêmes doivent rester contrôlés côté serveur.

Exemple de contrat expérimental, **pas une règle de déblocage historique** :

```js
simulateBattleWithDerivedHeroes({
  attackers, defenders, heroProfiles, context, lossPolicy,
  heroLegendaries: {
    attacker: [{careerId:20, talentIndex:1, rank:2}],
    defender: []
  },
  heroLegendaryGrants: {
    attacker: {legendary_dragonkinght_b:2},
    defender: {}
  }
});
```

Le talent `legendary_dragonkinght_b` du catalogue modifie la puissance de certains sorts ; le moteur réutilise le **calcul magique par tour** déjà validé en V6.4–V6.5. Les talents qui portent sur les pertes définitives sont utilisés dans le bilan militaire, tandis que les talents d'attaque/défense passent par les modificateurs de duel.

## 3. Preuves différentielles

Les nouveaux tests exécutent les vraies fonctions originales du calculateur Jactari, au lieu de comparer seulement deux versions de notre propre code.

| Preuve | Corpus |
| --- | ---: |
| Préparation originale des profils de héros, chaque talent, chacun des rangs 1–3, deux camps | **144 scénarios** |
| Bataille complète avec un talent légendaire du camp attaquant ou défenseur | **48 rencontres** |
| Talents légendaires des écoles de magie | Cas ciblés comparés à la vraie `puissance_effective_sort()` |
| Protection de l'accès | Absence de registre de droits, rang excessif, valeur inconnue, double déclaration, tentative par `heroTalents` |

La suite complète atteint **319 tests Node réussis sur 319** lors de l'introduction des combats différentiels ([CI GitHub Actions #40315864931](https://github.com/AstrowareConception/MMHK-like/actions/runs/40315864931)). Les 144 préparations de héros et les 48 combats sont des scénarios exécutés **dans** quelques tests `node:test`, pas 192 tests unitaires distincts.

## 4. Inconnues bloquantes — ne pas clôturer C03

Les fonctions `controle_legendary_classes()` et les catalogues de talents **n'attestent pas** que tous les rangs sont accessibles à tout héros : elles servent à l'outil de calcul. Il manque des documents ou des rapports historiques MMHK saison 2 démontrant les **vrais droits de déblocage**. En particulier, nous n'attribuons aucune règle supposée de :

- niveau minimum, achèvement de carrière normale, faction ou prérequis de classe ;
- points dépensés, succession des rangs ou cumul de plusieurs classes légendaires ;
- restrictions d'artefacts, réinitialisation des talents ou coûts de respecialisation légendaire ;
- persistance et attribution sûre des droits lorsque le héros change de propriétaire ou de carrière.

Il reste également à analyser les **interactions entre plusieurs talents légendaires simultanés**, les cas PvE/siege et les anomalies propres au calculateur historique.

**Conclusion :** les effets et calculs couverts sont conformes à la référence Jactari sur le corpus différentiel, mais le **système d'obtention des classes légendaires n'est pas encore rétroconçu** et l'équivalence au serveur original d'Ubisoft n'est pas établie. La V6.6 reste ouverte et le moteur demeure interdit comme arbitre PvP de production. Licence source : **GPL-3.0-or-later**.
