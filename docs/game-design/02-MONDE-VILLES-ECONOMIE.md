# Monde, cités, régions et économie

## Ressources et dépendances — OBS-CODE

Sept ressources : or, bois, minerai, mercure, cristal, soufre, gemmes. La ville est un centre de production, de stockage, de recrutement et d’ordres. Les catalogues de faction déterminent les coûts et prérequis ; l’économie ne se résume donc pas à un stock global unique. Les règles de mutualisation exacte entre cités et de transport doivent rester explicites. [CODE-01-DATA]

| Famille | Fonction |
| --- | --- |
| Administration | Revenus d’or et accès aux étapes de développement |
| Recrutement | Production de recrues par tier, unités améliorées, engins |
| Magie | Accès progressif aux cercles de sorts |
| Défense | Bonus de fortification et, pour certains niveaux, production de créatures |
| Services | Taverne, marché, stockage et fonctions propres aux factions |
| Monument de Larme | Bonus spécifiques et contribution à la victoire selon la saison |

Les prérequis constituent un graphe : niveau de cité, bâtiment précédent, ressources et parfois carrière du héros. La possession d’or n’autorise pas à sauter une étape. L’emplacement d’une nouvelle colonie ne doit pas créer automatiquement tous les bâtiments d’une cité avancée.

## Exemples chiffrés du catalogue Académie

Valeurs brutes du corpus de 2013, avant modificateurs. Les autres factions ont leur propre chaîne dans le catalogue. [CODE-01-DATA, `_batiments`]

| Bâtiment | Or / jour déclaré | Coût | Durée | Niveau de cité requis |
| --- | --- | --- | --- | --- |
| Conseil du village | 2 000 | Gratuit dans la table | 0 | 0 |
| Mairie | 4 000 | 6 000 or, 8 bois, 10 minerai | 576 min | 3 |
| Hôtel de ville | 7 000 | 27 500 or, 25 bois, 48 minerai | 1 584 min | 9 |
| Capitole | 13 000 | 120 000 or, 83 bois, 85 minerai | 2 880 min | 15 |

Les revenus de la chaîne administrative sont des niveaux de revenu déclarés, pas quatre gains à additionner. Dans ce même catalogue, fortin/citadelle/château portent respectivement 16/35/56 % de défense ; citadelle et château annoncent +50/+100 % de production de base. L’ordre de cumul avec autres bonus doit être fixé par profil.

## Accès aux cités et influence — DOC

G08 décrit des droits de possession liés au **meilleur rang** parmi les trois voies, et non à leur somme : jusqu’à dix cités, puis des possibilités liées aux Graals. Le niveau urbain dépend des constructions, avec une exception pour les niveaux supplémentaires du silo. Les bâtiments de recrutement s’améliorent au lieu de se dupliquer. L’influence utilise notamment bâtiments et puissance militaire moyennée sur plusieurs jours, avec recalcul nocturne. La colonisation dépend du nombre de cités, de la distance et du territoire allié. Le guide décrit également des limites gratuites temporaires, variables selon les périodes. Les coûts de colonisation, la fonction exacte d’influence et les plafonds doivent être retrouvés avant implémentation fidèle. [G08]

## Mines — DOC, table de novembre 2013

G11 distingue **niveau de mine**, **extension** et **aménagement**. Le niveau maximal indiqué est dix. Production de base par niveau : 2 000 or, 2 ressources communes ou 1 ressource rare par jour. Chaque extension apporte 5 % supplémentaires ; sa combinaison précise avec les autres bonus reste à tester. Les améliorations de niveau 1→2 à 9→10 coûtent respectivement 1 000, 2 000, 3 000, 5 000, 8 000, 13 000, 21 000, 34 000 et 55 000 or, avec une durée de base en heures égale au coût divisé par 1 000. Une extension interrompt la production ; l’amélioration de niveau ne l’interrompt pas. Le héros doit satisfaire le niveau requis. Le guide propose une accélération à +40 % de coût/−20 % de durée et une économie à −20 % de coût/+60 % de durée. [G11]

## Aménagements régionaux — DOC et catalogue partiel

G12 décrit une recherche de production à cinq niveaux, +4 % par niveau, amplifiée de 20 % en contiguïté orthogonale avec une mine, soit 24 % au niveau maximal. Le niveau de mine borne celui du bâtiment ; le Bâtisseur intervient pour la construction. Un même type ne se duplique pas dans la région. Le guide exclut un atelier d’or. [G12]

Le catalogue régional récupéré ne couvre que dix entrées et utilise parfois des placeholders. Il contient notamment cinq niveaux d’atelier de cristal, un entrepôt, des champs, deux relais et un portail. Ce sous-ensemble ne suffit pas à reconstituer tous les coûts de forts, sphinx, dolmens, ruines ou spécialisations. Les paramètres absents restent `INCONNU`. [CODE-01-DATA]

## Stockage et commerce — DOC

G16 donne, au silo de niveau dix, des capacités de 143 ressources communes et 57 rares. Un entrepôt régional augmente la capacité de 50 % ; une spécialisation peut augmenter une ressource rare de 100 % sans les autres. Les exemples montrent des arrondis à vérifier, notamment cinq entrepôts donnant 500 communes et 199 rares. Les capacités d’or relèvent d’une règle distincte. [G16]

G18 distingue marchand immédiat, marché entre joueurs et caravanes. Il signale des contraintes entre extension de mine et aménagement, ainsi que l’application du meilleur bonus régional plutôt que l’addition de héros identiques. Le stockage des lots mis au marché peut affecter les plafonds ; il faut reproduire les états « en entrepôt », « en vente » et « en transit » séparément, sans présumer que tout reste disponible à dépenser. Les taux du marchand, commissions, limites de lots et capacités de caravanes ne sont pas entièrement retrouvés. [G18 ; dernière exigence de modélisation PROP]

### Balance économique S3

G17 décrit un dispositif anti-transfert disproportionné sur échanges et caravanes. La valorisation utilise 1 000 or par ressource commune, 2 000 par rare et 10 000 par niveau d’artéfact. Le plafond de solde commence à 1 000 et croît par semaine ; les deux parties sont contrôlées, notamment au règlement d’une enchère. Le guide indique une désactivation au début de la Guerre des Larmes. Ce mécanisme est spécifique à sa période : portée exacte du solde, progression complète et exceptions restent à confirmer. [G17]

## Entretien des armées — OBS-CODE, profil tardif uniquement

Ce calcul est transcrit de `maintenance.js`. Il fournit un **oracle du calculateur**, pas une preuve du prélèvement serveur ou de sa cadence. L’ancien guide G08 décrit d’autres paramètres ; les deux profils doivent rester séparés.

Notations : `P` puissance entretenue, `b` indice administratif 0–3, `f` nombre de champs, `s` sphinx, `t` niveau de réduction du Tenancier, `m` paramètre Muse du calculateur, `g` égal à 125 000 si monument présent, sinon zéro.

```text
L = [31 250, 75 000, 187 500, 250 000][b]
B = [250 000, 500 000, 750 000, 1 000 000][b]
F = 1 + 0,10 × f
X = (1 + (P − B × F) / ((B + g) × F)) × B
k = floor(X / L) − 1
réduction = min(0,05 × s + 0,03 × t + 0,05 × m ; 0,50)
entretien = floor(taux[k] × P × (1 − réduction))
si P ≤ L × F : entretien = 0
```

`taux` est une somme cumulative : seize incréments de 0,015, puis seize de 0,025, puis 250 de 0,04. Il s’applique à la puissance entière, pas seulement à la tranche excédentaire. Le code utilise un repli à 0,015 quand l’indice manque ; à très forte puissance cela peut produire un résultat incohérent. Cette anomalie doit être testée et non adoptée comme règle économique.

Exemple de contrôle, sans bonus ni monument : à l’indice administratif 3, `P = 250 000` donne zéro ; `P = 250 001` donne 3 750. Le traitement de l’insolvabilité, des renforts, des armées en marche et la ville à laquelle rattacher chaque coût restent inconnus. Une armée dont l’entretien n’est pas payable ne doit pas être détruite par une règle inventée.

## Règles de cohérence proposées

Une dépense réserve ou débite des ressources dans une transaction ; un ordre ne peut pas les dépenser deux fois. La production doit être calculée jusqu’à l’instant d’un changement de bonus. Une capacité plafonnée doit préciser le devenir de l’excédent, selon qu’il provient de production, récompense, marché ou retour de convoi. Les actions d’un héros mobilisé et celles d’un héros libre doivent être distinguées. La cadence de recrutement, les files simultanées, annulations, remboursements et bonus à l’arrivée font partie des incertitudes bloquantes du module économique.

## Précisions visuelles — révision 0.2, OBS-IMAGE

- **Entrepôt régional, SS-042 :** l’info-bulle indique +50 % de stockage, un entrepôt construit sur cinq maximum, effet cumulatif. Cela corrobore G16 pour le client v1.5.0.17-4-MTR, sans résoudre les arrondis ni le plafond d’or.
- **Construction Havre, SS-051 :** Gehöfte augmente de 5/jour la production de paysans et conscrits ; prix affiché 20 000 or, 30 bois et 30 minerai. Le coût et le bonus correspondent à l’entrée 67 « Fermes » du catalogue de 2013 : corroboration locale, sans certification de toutes les constructions.
- **Colonisation, SS-040 :** le formulaire sépare droit lié au classement Richesse, coût, nom de cité, plafond commercial et attente. Le prix 30 000 or/50 bois/50 minerai est affiché sur un contexte x200 de test, non adopté comme constante classique.
- **Caravane, SS-053 :** sept quantités, destination, capacité, données de stock/plafond/revenu de la destination et réglages « 4 fois », « La quantité exacte », « Pas d’attente ». Les maxima par ressource ne sont pas présumés simultanément cumulables. Il manque la formule de charge et les listes complètes de choix.

Un convoi répété nécessite, dans le modèle proposé, de distinguer le programme d’envois de chacun des trajets et de revalider stock, capacité et destination à chaque départ. L’image ne prouve pas une réservation immédiate de toutes les répétitions. Voir [interface](../specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md) et [analyse des captures](../research/ANALYSE-CAPTURES.md).
