# Jactari V6.6 — Fiches de héros et construction des états de combat (tranche 1)

**26 octobre 2026 — code publié sur `main`, CI vérifiée : 296 tests Node.js sur 296 réussis.**

## Périmètre réellement livré

Jusqu'à V6.5, le moteur savait calculer les puissances des sorts à partir d'un héros *dont les caractéristiques étaient déjà préparées*. La V6.6 commence à dériver ces caractéristiques **depuis des identifiants et des rangs de progression**, au moyen des catalogues historiques directement archivés.

### Trois références distinctes, trois résultats distincts

1. **Fiche de héros de l'éditeur** : la véritable fonction historique `maj_adm()` produit les caractéristiques de base et leur présentation après bonus d'équipement, tandis que `maj_comp()` calcule les points de compétence. Les artefacts sont équipés et appliqués par la vraie fonction `equipe_artefact()`. Ces trois fonctions sont rejouées **inchangées** par [l'oracle historique de fiche](../../tools/jactari-port/historical-hero-page-oracle.mjs).
2. **Bonus de talents utilisables dans le combat** : Jactari parcourt `_talents[c][t]`, lit `nom_machine` et `v[rang]`, puis expose les couples `niveau_<nom>` / `bonus_<nom>`. Le nouveau [port du référentiel de talents](../../tools/jactari-port/hero-talent-bonuses.mjs) est confronté au **fragment original** de `combat.min.js`.
3. **Fiche de combat de chaque protagoniste** : le vrai `maj_situation()` du calculateur de combat ne reprend pas simplement la fiche affichée par `maj_adm()` : ses conditions d'hérédité, arrondis, modificateurs de rôle et effets d'artefacts sont spécifiques. Le [port des états de combat](../../tools/jactari-port/hero-combat-snapshot.mjs) est comparé au [fragment Jactari original](../../tools/jactari-port/historical-combat-hero-oracle.mjs), **sans employer le port comme oracle**.

Le même jeu de **vraies données versionnées** `donnees.general.min.js`, `donnees.heros.min.js` et `donnees.artefacts.min.js` alimente le port et les oracles. L'original calcule la référence indépendamment dans `node:vm` ; le port doit obtenir les mêmes sorties.

## Modules publiés

| Module | Rôle |
| --- | --- |
| [`hero-source-tables.mjs`](../../tools/jactari-port/hero-source-tables.mjs) | Charger les tables originales d'archétypes, niveaux, carrières, talents, hérédité, artefacts et effets |
| [`hero-page-snapshot.mjs`](../../tools/jactari-port/hero-page-snapshot.mjs) | Calculer valeurs de base/présentées, expérience et points de compétence de l'éditeur |
| [`historical-hero-page-oracle.mjs`](../../tools/jactari-port/historical-hero-page-oracle.mjs) | Réexécuter les trois fonctions originales de la fiche de héros |
| [`hero-talent-bonuses.mjs`](../../tools/jactari-port/hero-talent-bonuses.mjs) | Transformer des indices/rangs de talents en bonus issus des vraies tables |
| [`hero-combat-snapshot.mjs`](../../tools/jactari-port/hero-combat-snapshot.mjs) | Calculer `attaque`, `defense`, `magie` et leurs valeurs modifiées par camp |
| [`historical-combat-hero-oracle.mjs`](../../tools/jactari-port/historical-combat-hero-oracle.mjs) | Exécuter le fragment original des statistiques de `maj_situation()` |
| [`hero-combat-battle.mjs`](../../tools/jactari-port/hero-combat-battle.mjs) | Construire les héros puis les injecter dans l'orchestrateur unifié, y compris avec la magie dynamique |

### Invariants importants

- Les **profils de héros** portent les choix historiques (faction, archétype, niveau, hérédité, équipement, talent/rang) — et non une valeur arbitraire d'attaque, de défense ou de puissance magique.
- Les **statistiques de l'éditeur** et les **statistiques de combat** restent séparées : ne pas confondre `display.attaque` avec `hero.attaque_modifiee`.
- Les bonus d'artefacts de combat sont reconstruits à partir des **effets authentiques** et de leurs niveaux ; leurs calculs dépendent de la voie héréditaire.
- Les bonus militaires d'alliance et malus d'attaque sont des **paramètres de situation fiables fournis côté serveur**, distincts des caractéristiques que le joueur peut librement écrire.
- Les artefacts doivent occuper le bon emplacement et respecter le plafond de niveau déjà explicité dans `equipe_artefact()`. Les restrictions supplémentaires de collection, de sets et de progression restent à valider avant arbitrage serveur.
- Le passage d'une fiche à un duel n'autorise pas la transmission de champs `attaque_modifiee`, `defense_modifiee` ou `magie` préfabriqués depuis un appelant non fiable.
- Le code source original reste **GPL-3.0-or-later** et les tests `node:vm` ne constituent pas un confinement sûr pour des scripts externes non audités.

## Corpus d'essais historiques exécuté

| Comparaison indépendante | Nombre de scénarios |
| --- | ---: |
| Fiches : niveaux, archétypes, hérédité, classements | 250 |
| Fiches : équipements authentiques sur héros de niveau 40 | 60 |
| Champs de talents de combat contre le fragment d'origine | 150 |
| Protagonistes : attributs, hérédité et attaque/défense modifiées | 120 |
| Protagonistes : équipement, talent et modifications du rôle | 80 |
| Raccordement effectif aux duels et à la magie | 6 tests d'intégration |

Les **510 profils de héros** correspondent aux 310 fiches d'éditeur et aux 200 préparations de héros de combat. Les 150 choix de talents sont comptés séparément. Ces scénarios sont regroupés dans des tests `node:test` et ne doivent pas être additionnés au décompte des tests unitaires.

[**GitHub Actions — 296/296 tests réussis**](https://github.com/AstrowareConception/MMHK-like/actions/runs/40300003415), sur le commit `59f89349725a97e8842fb866f173ff28da5d5f64`. Le contrôle de conformité de la roadmap est également inclus dans cette suite.

## Exemple expérimental

```js
import {simulateBattleWithDerivedHeroes} from './tools/jactari-port/hero-combat-battle.mjs';
const troop=count=>({count,weapon:'I',unitPower:10,goldCost:5});
const regular=count=>[troop(count),null,null,null,null,null,null];

const result=simulateBattleWithDerivedHeroes({
  attackers:regular(100),defenders:regular(80),
  heroProfiles:{
    attacker:{faction:1,archetype:0,level:30,heritage:{heros_superieur:2}},
    defender:{faction:2,archetype:0,level:30}
  },
  context:{weaponAdvantageFactor:.5},
  lossPolicy:{lossFactor:.3,source:'JACTARI_REFERENCE_NOT_PROVEN_MMHK_S2'}
});
console.log(result.heroSnapshots,result.persistentArmies);
```

**Ce code suppose des profils validés côté serveur**. La fonction accepte pour l'instant des données structurées JavaScript de confiance ; elle ne doit pas être exposée telle quelle à des requêtes multijoueurs où un client pourrait déclarer son niveau ou ses talents.

## Ce qui reste à prouver pour clôturer V6.6

La **V6.6 reste EN COURS** : cette tranche ne démontre pas encore la légalité d'un chemin complet d'apprentissage (activation de carrière, points dépensés, Scribe/Arcanes, respecialisations), les restrictions d'équipement et classes légendaires, les variantes d'hérédité `revelation_de_caracteristiques_15/_30`, ni l'ensemble des modificateurs de situation du serveur.

Le calcul de `maj_situation()` a été validé **sur le fragment couvrant les statistiques du héros**, pas sur toutes les opérations de cette fonction, ni sur chaque combinaison extrême de règles. Les fixtures et profils Jactari 4.1.3-MTR ne prouvent pas l'équivalence avec Ubisoft MMHK saison 2.

**Étape suivante conseillée :** porter la validation de l'arbre complet de carrières et du coût des talents depuis `heros.min.js`, avec échantillons exécutés par le code historique, puis verrouiller les `HeroCombatSnapshot` à une vraie identité serveur (niveau et équipements authentifiés).

## Mise à jour — tranche 2, carrières et budgets de talents (26 octobre 2026)

La construction des héros prend désormais en compte la **validité de l'accès aux carrières** et les **dépenses d'apprentissage** depuis les vraies données `_carrieres`, `_talents` et `_apprentissage`. Les règles de coût, les talents partagés Scribe/Arcanes et les promotions/réductions de rang ont été confrontés au code source original. L'adaptateur de bataille accepte en option des listes `heroCareers` et rejette tout calcul de talent brut supplémentaire concurrent. Voir le [rapport technique V6.6 — tranche 2](34-JACTARI-V66-PROGRESSION-CARRIERES-TALENTS.md).

**Validation courante : 306 tests Node.js réussis sur 306** ([CI](https://github.com/AstrowareConception/MMHK-like/actions/runs/40302654585)). La validation du budget d'un **état final cohérent** ne remplace pas l'exécution de l'intégralité des transitions `change_carriere` et `desactive_carriere`. C03 et V6.6 restent en cours.
