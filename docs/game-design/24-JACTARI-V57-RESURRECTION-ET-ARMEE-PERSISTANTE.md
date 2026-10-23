# Portage Jactari V5.7 : résurrection au cours des tours et armées persistantes

**24 octobre 2026 — code et tests réellement exécutés sur le banc Node local, publication GitHub sur `main`.**

## Ce qui est maintenant porté

Les branches Jactari `lancement_sorts` de **type=2, unité=2** :
- **cible 8** : `rez='tmp'`, relèvement **temporaire** d'une fraction des pertes du duel courant ;
- **cible 9** : `rez='def'`, relèvement **définitif** fondé sur le nombre de survivants, ajustant les pertes du peloton.

Le sort est déclaré **avant** le duel puis appliqué **après** celui-ci dans `simulateDualMagicEncounter()`, avec le plafond du nombre de combattants en début de tour. Attaquant et défenseur peuvent chacun prévoir ce type de sort pour le même tour. Les cas où le peloton ciblé disparaît sans duel sont hors de portée et ne donnent pas lieu à une résurrection inventée.

### Séparation de trois quantités

1. **`remaining` :** troupes restantes sur le champ de bataille, dont les unités magiquement et temporairement relevées ;
2. **`permanent` :** morts définitifs calculés avec le coefficient et les bonus/effets de récupération ;
3. **`persistentArmies[side][slot].count` :** troupes réellement destinées à être sauvegardées, calculées par **effectif initial − morts définitifs**.

Cette séparation évite de transformer des renforts magiques temporaires en vrais recrutements à l'issue du combat. Le projet refuse de restituer un effectif négatif si un paramétrage de pertes crée davantage de morts que d'unités initialement présentes.

**Important :** le code historique contient également une branche de retrait des unités `tmp` du dernier peloton survivant. La projection `persistentArmies` est un **garde-fou d'intégrité métier** ; nous n'avons pas encore vérifié exhaustivement son équivalence avec tous les cas historiques de clôture du combat.

## Exemple contrôlé

Deux armées de **100 contre 50 unités**, même puissance individuelle 10. Un sort `type=2, unité=2, cible=8` à **50 %** est lancé par l'attaquant au premier tour.

| Mesure | Résultat |
| --- | ---: |
| Pertes du duel de l'attaquant | 50 |
| Unités relevées après le duel | 25 |
| Effectif présent sur le champ de bataille après le relèvement | 75 |
| Morts définitifs de l'attaquant | 6 |
| Effectif à conserver après la bataille | **94** |
| Effectif persistant du défenseur | 38 |

Le cas `cible=9` aboutit ici au même total de morts définitifs, mais les écritures sont **différentes** : la résurrection définitive réduit `roundLosses`, tandis que la temporaire alimente `raisedDuringBattle` et `temporaryRevived`.

**Le coefficient de pertes de 25 % est un paramètre de démonstration**, pas un barème saison 2 historiquement confirmé.

## Tests de validation

- **72 tests réussis** sur la copie locale Node, dont **12 tests nouveaux** de cette itération (résurrections des deux camps, ordre des événements, destruction totale, plafonds, persistance et refus de paramètres impossibles).
- **350 configurations numériques** vérifiées contre la branche arithmétique transcrite du Jactari historique. Le test versionné `magic-revival-differential.test.mjs` extrait désormais **directement la séquence depuis le code original présent dans le dépôt** et utilise `node:vm`, pour éviter de maintenir une deuxième copie divergente de la formule.
- **Le résultat GitHub Actions n'est pas encore confirmé** ; les tests différentiels du duel et de la magie générale ne constituent pas une équivalence globale validée.

Commandes depuis le dépôt :

```bash
node --test tools/jactari-port/magic-rounds-revival.test.mjs
node --test tools/jactari-port/magic-revival-differential.test.mjs
node --test tools/jactari-port/*.test.mjs
```

## Fichiers

- [Moteur des tours avec résurrection](../../tools/jactari-port/magic-rounds.mjs)
- [Calcul arithmétique des résurrections](../../tools/jactari-port/magic-revival.mjs)
- [Rapport de pertes et armées persistantes](../../tools/jactari-port/magic-report.mjs)
- [Tests d'intégration](../../tools/jactari-port/magic-rounds-revival.test.mjs)
- [Test différentiel sur la source](../../tools/jactari-port/magic-revival-differential.test.mjs)
- [Résultats et fixture synthétique](../../data/analysis/jactari-v57-revival-differential-2026-10-24.json)

Archive exécutable fournie dans la conversation : `MMHK_Jactari_resurrection_v57_2026-10-24.zip`.

## Prochaine priorité

1. **Rejouer les rapports complets** sur le calculateur original pour vérifier la suppression des invocations et des résurrections temporaires selon l'issue de la bataille.
2. Porter les sorts de **résistance, guérison, invocation, mana et disponibilité des sorts** qui manquent encore.
3. Finaliser les **pertes permanentes / captures / fuite / blessure des héros** en confrontant les cas de référence historiques.
4. **Exécuter la CI GitHub** et corriger les éventuels écarts entre le code committé et la copie de laboratoire.
5. Seulement ensuite, permettre aux missions PvE/PvP du serveur d'appeler ce module comme arbitre officiel.

La source originale et les adaptations portent l'indication **GPL-3.0-or-later**. Le portage reste un **sous-ensemble autonome**, pas le moteur complet Jactari certifié.
