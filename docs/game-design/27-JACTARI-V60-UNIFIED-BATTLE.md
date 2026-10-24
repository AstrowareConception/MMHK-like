# Jactari V6.0 — Un seul orchestrateur pour les phases déjà portées

**24 octobre 2026 — code JavaScript exécuté localement puis publié sur `main`.**

## Résultat concret

Le nouveau module [`unified-battle.mjs`](../../tools/jactari-port/unified-battle.mjs) relie désormais les modules historiques précédemment séparés dans **une API unique `simulateUnifiedBattle()`**. Elle accepte **deux armées à sept pelotons permanents**, les sorts des deux camps, le catalogue des créatures, les héros, les tirs préalables et une politique obligatoire de pertes définitives.

Ordre d'exécution du sous-ensemble implémenté :

1. **Salves préalables** sur un snapshot commun des pelotons initiaux ; pertes enregistrées sans double facturation.
2. **Tours de combat** sur une formation interne de neuf positions : slots spéciaux d'invocation **0 et 1**, puis les sept emplacements ordinaires **2 à 8**.
3. **Sort de l'attaquant**, puis **sort du défenseur**, avec réévaluation du peloton actif après un sort pouvant créer une invocation en position prioritaire. Les effets disponibles sont l'invocation, les dégâts sur un peloton, les dégâts de zone par arme, les buffs d'unités, les debuffs de héros, et deux résurrections programmées pour l'après-duel.
4. **Duel** basé sur le noyau pur Jactari ; sauvegarde des pertes de mêlée, des pertes magiques, des unités bonus et des unités temporairement relevées.
5. **Résurrection après duel**, dans les cas couverts par l'extraction. Les cas de ciblage devenus ambigus sont explicitement refusés.
6. **Clôture et rapport** : statuts du combat, journal d'événements, nettoyage de présentation des unités temporairement relevées, élimination des invocations magiques, morts définitives, coûts de remplacement et **`persistentArmies`** ne contenant **que les sept pelotons réels**.

Il n'existe donc plus d'obligation, pour ce périmètre de règles, de choisir entre « combat avec invocations » et « combat avec magie » : les deux mécanismes peuvent effectivement intervenir pendant le même affrontement.

## API d'intégration expérimentale

```js
import { simulateUnifiedBattle } from './tools/jactari-port/index.mjs';

const unit = (count) => ({ count, weapon:'I', unitPower:10, goldCost:5 });
const regular = (first) => [first,null,null,null,null,null,null];

const battle = simulateUnifiedBattle({
  attackers: regular(unit(100)),
  defenders: regular(unit(80)),
  unitCatalog: [
    { faction:1, weapon:'I', unitPower:10 },
    { faction:2, weapon:'I', unitPower:10 }
  ],
  context: { attackerHero:{ faction:1 }, defenderHero:{ faction:2 } },
  attackerSpells: { 1:{type:1,target:0,unit:0,power:200} },
  defenderSpells: { 1:{type:0,target:4,unit:7,power:50} },
  lossPolicy: { lossFactor:0.25, source:'DEMO_NOT_HISTORICAL_S2' }
});
console.log(battle.events, battle.permanent, battle.persistentArmies);
```

**Attention :** `power` est la **puissance effective déjà calculée** du sort, pas son identifiant, et `lossFactor:0.25` est strictement une valeur de démonstration. Les véritables coefficients saison 2 et toutes les règles de disponibilité doivent être prouvés avant usage serveur.

### Retour structuré

| Champ | Contenu |
| --- | --- |
| `events` | Journal ordonné des salves, invocations, sorts, duels et résurrections |
| `battlefield` | Neuf positions par camp, avec états temporaires |
| `terminalDisplay` | Effectifs et nettoyage du dernier peloton gagnant dans le compte rendu |
| `temporarySummons` | Positions 0–1 temporaires, toujours écartées de l'armée durable |
| `permanent` | Morts définitifs et facture en or et ressources |
| `persistentArmies` | Les sept pelotons originaux diminués de leurs pertes permanentes |
| `limitations` | Limitations déclarées de ce noyau partiel |

Le moteur est **sans DOM, sans jQuery, sans accès réseau et sans mutation des données d'entrée**. L'origine de la faction d'invocation est exclusivement le **contexte de héros**, jamais un paramètre transmis par le sort. Toute phase inconnue fait échouer le calcul, sans fallback militaire fictif.

## Exemple exécuté

Armées initiales **100 contre 80** ; attaque : invocation de **20** unités ; défense : sort de dégâts fixes 50 visant l'unité invoquée. Les deux pelotons adverses sont ensuite résolus par **deux duels**.

- Issue du sous-ensemble de combat : victoire de l'attaquant ;
- Invocation : **20 → 0**, puis définitivement écartée du registre des unités ;
- Morts définitifs de la formation régulière : **16 attaquants / 20 défenseurs** ;
- Coût de remplacement fictif : **80 / 100 or** ;
- Effectifs persistants : **84 / 60**.

[Scénario structuré reproductible](../../data/analysis/jactari-v60-unified-battle-demo-2026-10-24.json).

## Validation exécutée

- **128 tests Node.js réussis sur 128** sur la copie locale enrichie du ZIP V5.9, sans le calculateur original ;
- **21 tests supplémentaires** de l'API unifiée, y compris **180 combats multi-phases déterministes** vérifiant la reproductibilité et la restitution de stocks non négatifs ;
- Tests de ciblage d'une invocation par un sort ennemi dans **le même tour**, priorité du slot 0, salves simultanées, buff, debuff, invocation + magie, résurrection, persistance, interdiction des factions forgées, erreur sur états historiques encore non gérés ;
- Archive locale `MMHK_Jactari_V60_unified_battle_2026-10-24.zip` : modules JavaScript de la copie locale, tests, logs et fixture.

Exécution depuis la racine du dépôt :

```bash
node --test tools/jactari-port/unified-battle.test.mjs
node --test tools/jactari-port/*.test.mjs
```

**Nuance de reproductibilité :** les 128 tests ont été exécutés dans un environnement local basé sur les fichiers de l'archive antérieure ; la CI GitHub distante n'a pas été confirmée. Les **1 700 cas différentiels historiques** précédemment exécutés concernent **les primitives isolées** (duel, résurrection et clôture temporaire), **pas encore les batailles complètes exécutées par ce nouvel orchestrateur**.

## Ce qui reste ouvert et interdit encore un arbitrage serveur

1. **Parité de batailles intégrales** avec le moteur communautaire Jactari original : journal de tous les tours, cas mixtes, morts permanentes, XP et héros. Le présent module assemble des sous-routines fidèles à leur périmètre, sans avoir encore démontré la fidélité de leur combinaison.
2. **Certaines branches historiques** : troisième invocation remplaçant un slot déjà occupé, tour interrompu par la magie, héros vaincus, fuite, déroulé des sièges et magie spéciale. Les combinaisons non couvertes sont refusées explicitement.
3. **Puissance et choix des sorts** : l'API requiert des paramètres pré-calculés. Il faut lier le catalogue original et les bonus d'artefacts/magie du héros. Aucun système de mana non retrouvé n'a été inventé.
4. **Licence** : les sources Jactari et ces adaptations portent **GPL-3.0-or-later**. Avant inclusion au serveur MMHK-like distribué, réaliser une revue de licence et de réutilisation.

## Prochaine tranche

Créer un **banc de tests différentiels de bataille entière** capable d'exécuter l'interface Jactari originale en environnement isolé (DOM/jsdom ou navigateur automatisé), de lire les sorties de combat, puis de les comparer tour par tour à `simulateUnifiedBattle()`. Commencer par 5–10 batailles de référence : sans magie, avec invocation, avec dégâts/zone, avec résurrection, puis cas mixtes. Porter les règles manquantes uniquement à partir des écarts démontrés et des sources. **Ne pas activer cette API comme arbitre PvP avant cette étape.**
