# Jactari V6.6 — Tranche 5 : audit des hérédités avancées et cumuls de talents légendaires

**26 octobre 2026 · Travail publié dans MMHK-like · C03 toujours non certifié.**

## Objectif et principe de preuve

Poursuivre la reconstruction de la fiche de héros de combat **sans inventer de données absentes** : identifier les branches d'hérédité utilisées par la préparation historique de `combat.min.js`, confronter les valeurs calculables aux originaux, puis éprouver les bonus de **plusieurs** classes légendaires présents simultanément.

La référence reste Jactari `v.4.1.3-MTR` (4 mars 2013), calculateur communautaire sous GPL-3.0-or-later. Ses sorties ne suffisent **pas** à certifier les véritables conditions de progression Ubisoft MMHK saison 2.

## 1. Anomalie de provenance démontrée : hérédités `_15` et `_30`

La fonction de préparation des héros du véritable `data/Jactari/src/scripts/combat.min.js` contient quatre branches exclusives successives :

1. `heros_superieur` ;
2. `revelation_de_caracteristiques` lorsque le héros atteint le niveau 15 ;
3. `revelation_de_caracteristiques_15` lorsque le héros atteint le niveau 15 ;
4. `revelation_de_caracteristiques_30` lorsque le héros atteint le niveau 30.

Or, dans **les tables archivées et effectivement utilisées dans ce dépôt**, `data/Jactari/src/scripts/donnees.general.min.js` définit les deux premières compétences mais **ni** `revelation_de_caracteristiques_15` **ni** `revelation_de_caracteristiques_30`. Certaines branches du code historique font en outre référence à la table générique `revelation_de_caracteristiques` à la place d'une table `_15`. Ce sont des constats de source, pas des valeurs de jeu que nous pouvons compléter arbitrairement.

Le nouveau [`historical-heritage-audit.mjs`](../../tools/jactari-port/historical-heritage-audit.mjs) signale chaque champ avec sa provenance, son statut `source-backed` ou `unresolved-vendor-source-mismatch`, et le nombre de références dans le code historique.

La [fiche de combat](../../tools/jactari-port/hero-combat-snapshot.mjs) **rejette explicitement toute activation positive** des deux variantes sans table source, avec une erreur qui nomme la variante manquante, plutôt que de l'ignorer en renvoyant des caractéristiques inexactes. Cette règle de refus conserve le déterminisme et empêche une prétendue conformité non démontrable.

### Hérédité réellement calculable

Les talents `heros_superieur` et `revelation_de_caracteristiques` ont des tables de points numériques connues ; la version de combat Jactari utilise un **`if / else if`** : si le premier est actif, la révélation n'est pas cumulée dans la même caractéristique. Les arrondis interviennent également à des étapes différentes du calcul de la fiche d'éditeur `maj_adm()`.

Les nouveaux tests vérifient :
- l'absence des tables `_15/_30` et le **refus explicite** de leurs valeurs non nulles ;
- **120 profils** de niveaux/archétypes/hérédités documentés à différents seuils ;
- **90 profils complémentaires** avec deux compétences présentes simultanément, notamment autour des niveaux 15 et 30, pour vérifier la priorité des branches originale.

## 2. Cumuls légendaires vérifiés contre Jactari

Les **8 classes légendaires / 24 talents** étudiés dans la [tranche 4](36-JACTARI-V66-CLASSES-LEGENDAIRES.md) sont maintenant éprouvés en combinaison plutôt qu'uniquement un à la fois.

Le fichier [`historical-multilegend-differential.test.mjs`](../../tools/jactari-port/historical-multilegend-differential.test.mjs) confronte les calculs portés aux fonctions historiques :

| Corpus | Référence d'exécution | Couverture |
| --- | --- | --- |
| 120 profils de héros avec **2 à 8 talents légendaires différents** | Fragment original de `maj_situation()` | Attaque/défense/magie, caractéristiques modifiées et valeurs de talents |
| 48 rencontres complètes avec **plusieurs légendaires des deux côtés** | `simulation_rencontre()`, `bonus_attaque_defense()`, `simulation_combat()` historiques | Ordre des pelotons, neuf bonus, mortalité finale, gagnant |
| Familles de magie cumulables | `puissance_effective_sort()` original | Cumul de plusieurs bonus légendaires pour une même école, lorsque présent dans les tables |

Les données de référence sont **les mêmes fichiers historiques versionnés** que lors des tranches précédentes. Les différents profils de tests sont déterministes, mais les sorties attendues sont produites par la version originale exécutée, pas par une duplication des équations du port.

### Interprétation stricte

Cette preuve dit : **si ces rangs légendaires sont présents**, leur combinaison produit les mêmes résultats que le Jactari original dans les scénarios testés. Elle ne dit **pas** que ce cumul est légal pour un héros MMHK S2 ni que toutes les combinaisons de 24 talents et 3 rangs sont exhaustivement couvertes. Le mode `server-entitlement` demeure nécessaire pour chaque sélection légendaire côté adaptateur de combat, avec contrôles d'identité et de propriété encore à concevoir au niveau du serveur.

## 3. Statut de la roadmap

- **C03 — Construction des héros : `implemented_partial`**. Les fonctions sans données ne sont pas réputées implémentées ; les prérequis de carrière légendaire et la provenance du serveur demeurent ouverts.
- **C04 — Modificateurs militaires : `differential_bounded`**. Des scénarios supplémentaires de talents cumulés sont confrontés à des rencontres complètes Jactari.
- **C06 — Puissance des sorts : `differential_bounded`**. Le cumul de modificateurs magiques légendaires est testé pour plusieurs écoles, mais reste limité aux situations démontrées.
- **V6.6 — `in_progress`**. La création des héros, les carrières et les effets légendaires progressent ; aucune certification globale ni arbitrage PvP de production n'est autorisé.

**Prochaine tâche vérifiable :** rechercher une version alternative de la table des compétences ou des sources saison 2 qui définit explicitement les hérédités `_15/_30`; en leur absence, ne pas les implémenter. Continuer par les combinaisons de talents/artefacts et l'établissement des véritables règles de progression légendaire, sous une politique serveur autoritative.

## 4. Licence, essais et reproductibilité

Toutes les adaptations du code communautaire Jactari restent documentées **GPL-3.0-or-later**. Les fonctions originales sont lancées par des bancs locaux/CI ; `node:vm` ne constitue pas une isolation de sécurité de scripts hostiles.

Exécuter l'ensemble des tests : `node --test tools/jactari-port/*.test.mjs`.

Le [registre de conformité JSON](../../data/analysis/jactari-combat-conformance-roadmap.json) conserve les preuves exactes et le résultat CI le plus récent vérifié. **Un nombre de tests passés n'est jamais interprété comme un pourcentage de conformité MMHK S2.**
