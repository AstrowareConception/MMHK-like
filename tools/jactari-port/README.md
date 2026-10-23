# Portage du noyau de combat Jactari

## État du 23 octobre 2026

**Une première fonction réelle du calculateur historique est isolée :** `simulation_combat(tour)` a été convertie en `resolveStackDuel(request)`, fonction JavaScript **pure**, sans DOM, jQuery ni variables globales. L'entrée contient deux pelotons (effectif, puissance individuelle) et un ensemble de **modificateurs déjà calculés**. Le résultat donne puissance de base, bonus, puissance totale, pertes, survivants, dispersion et égalité.

La conversion suit les **branches et étapes de `Math.floor` du Jactari original**, en conservant le sentinelle `losses=-1` pour une victoire écrasante : ce n'est **pas** une perte négative. Les sept emplacements d'armée ont un validateur de structure séparé. **La fonction ne résout PAS une bataille impliquant sept pelotons** ; elle ne calcule pas non plus les bonus à partir des compétences du héros, de la magie ou des armes : ceux-ci doivent être fournis à l'interface.

### Utilisation

```js
import {resolveStackDuel,validateArmySlots} from './core.mjs';
validateArmySlots([null,null,null,null,null,null,{count:100,unitPower:10}]);
const report=resolveStackDuel({
  attacker:{count:100,unitPower:10},
  defender:{count:50,unitPower:10},
  modifiers:{attackWeapon:0}
});
console.log(report.remaining); // {attacker:50, defender:0}
```

**Tester sans dépendance** (Node.js 20+) :

```bash
node --test tools/jactari-port/core.test.mjs
```

Les **8 tests ont été exécutés en local et réussis** : attaque victorieuse, défense victorieuse, égalité, victoires écrasantes dans les deux sens, modificateur d'arme avec arrondi, données incorrectes, sept slots ordonnés. Attention : ce premier jeu de tests est une **transcription de branches inspectées**, pas un test différentiel automatisé sur le navigateur Jactari ; l'équivalence globale n'est pas encore démontrée.

### Licence et provenance

Source : [calculateur original](../../data/Jactari/src/scripts/combat.min.js), auteurs Jactari, Aspirin et Aendawyn. Son en-tête mentionne **GNU GPL v3 ou ultérieure**. Ce module extrait et adapté est identifié `SPDX-License-Identifier: GPL-3.0-or-later`. **Vérifier les obligations de redistribution et la stratégie de licence de MMHK-like** avant d'incorporer le code dérivé à un serveur distribué.

### Frontière d'intégration

- `core.mjs` — duel pur réutilisable, sans effet métier global.
- `core.test.mjs` — tests de branches déterministes.
- Étape suivante : extraire `bonus_attaque_defense` avec toutes ses données puis l'orchestration `simulation_rencontre`, les formations, les tours et la séparation pertes/dispersion/morts permanentes.
- Construire un **harness différentiel** pour comparer les calculs portés à l'exécution du vrai Jactari plutôt qu'à des valeurs attendues manuellement.
- Les attaques non prises en charge doivent être **refusées explicitement**, jamais confiées à une approximation silencieuse.


## Extraction complémentaire : modificateurs sans jQuery

`bonuses.mjs` porte une partie importante de `bonus_attaque_defense` et expose `calculateBonuses({attackerWeapon, defenderWeapon, attackerHero, defenderHero, morale, special, weaponAdvantageFactor, fortification})`. La fonction renvoie les neuf coefficients directement acceptés par `resolveStackDuel` : bonus par unité, bonus par peloton, avantage I>C / R>I / C>R, moral, pièges et fortification.

```js
import { calculateBonuses } from './bonuses.mjs';
import { resolveStackDuel } from './core.mjs';
const modifiers = calculateBonuses({
  attackerWeapon: 'I', defenderWeapon: 'C',
  weaponAdvantageFactor: 0.5,
  attackerHero: { attaque_modifiee: 20, bonus_tacticien: 5 },
});
const result = resolveStackDuel({
  attacker: { count: 100, unitPower: 10 },
  defender: { count: 100, unitPower: 10 },
  modifiers,
});
```

Exécuter **tous les tests du sous-système** : `node --test tools/jactari-port/*.test.mjs`.

**État des validations :** 15 tests sur les deux modules ont été exécutés dans l'environnement local et réussis. Ces tests couvrent les branches du code isolé, pas encore des comparaisons automatiques différentielles avec le moteur navigateur original.

**Écart source à documenter avant un portage strict :** la fonction originale vérifie deux fois `heros_a.bonus_legendary_legwarrior_b` tout en ajoutant `heros_d.bonus_legendary_legwarrior_b`, ce qui ressemble à une anomalie de variable et à un doublon. L'adaptateur ne comptabilise actuellement la compétence du défenseur **qu'une fois**. C'est une décision d'adaptation explicite, non une preuve d'équivalence sur ce cas. Les paramètres `moral` et `special` sont fournis déjà agrégés ; les routines historiques qui les génèrent ne sont pas encore portées.

**Restent non portés :** déroulement multi-pelotons `simulation_rencontre`, conditions de retraite, magie, engins de siège, rapports complets, coûts des pertes, expérience, données de créatures et instanciation des bonus historiques `_facteur_bonus` à partir de la saison. Ne pas utiliser ce sous-ensemble seul pour annoncer le vainqueur d'une bataille MMHK complète.
