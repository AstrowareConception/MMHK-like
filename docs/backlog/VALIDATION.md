# Validation du backlog fonctionnel

## Portée du contrôle

Cette révision contient 300 fiches, 23 catégories et 1 500 critères d’acceptation. Le contrôle porte sur la cohérence documentaire : identifiants, champs requis, correspondance Markdown/JSON, sources, liens, couverture et dépendances. Il ne démontre pas la fidélité numérique ni le fonctionnement d’un jeu.

## Résultat

**Contrôle documentaire réussi : aucune erreur.**

| Vérification | Résultat |
| --- | --- |
| Fiches uniques | 300 |
| Catégories | 23, effectifs conformes |
| Critères structurés | 1 500 ; 900 propres aux parcours et 600 transversaux |
| Exigences actives couvertes | 55 sur 55 |
| Exigences archivées exclues | 2 |
| Références aux inconnues | 46 reconnues, 43 liées aux fiches, 3 exclusions expliquées |
| Dépendances | Toutes résolues ; aucun cycle |
| Markdown et JSON | Cards, Conversations, critères, INVEST et DoD concordants |
| Assertions documentaires | 30 379 réussies |
| Liens locaux contrôlés | 4 387 |
| Fichiers invalides injectés pour contrôle | 6 cas rejetés avec le diagnostic attendu |

**Points d’affinage :** 296 fiches ont au moins une inconnue locale ; les 4 autres gardent les préconditions de profil communes. Onze fiches sont conditionnelles HYP et 44 portent une proposition PROP. Aucune de ces marques n’est supprimée pour afficher un taux artificiel de stories prêtes.

## Exécution et reproductibilité

La fonction JavaScript du [validateur](../../tools/validate-backlog.mjs) a été exécutée sur les contenus préparés pour le commit et sur l’inventaire distant du dépôt. L’environnement d’exécution local n’étant pas disponible, le lanceur Node et sa lecture des fichiers sur disque n’ont pas été exécutés ici. La fonction de validation employée est exactement celle publiée dans le script.

Pour reproduire après récupération du dépôt :

```bash
node tools/validate-backlog.mjs
```

La commande produit un JSON et un code de sortie non nul si le contrôle échoue. Elle ne télécharge rien et n’exécute aucun code du jeu.

## Vérifications négatives du validateur

Des copies temporaires des données ont été altérées intentionnellement : identifiant dupliqué, dépendance circulaire, référence inconnue, critère manquant, lien cassé et divergence JSON. Le contrôle doit refuser chaque copie. Ces copies ne sont pas livrées dans le dépôt.

## Limites et état de livraison

Toutes les Cards et Conversations sont rédigées. Les conversations d’équipe n’ont pas eu lieu ; aucune estimation n’est attribuée, aucune story n’est prête ou acceptée, et aucun critère de gameplay n’est déclaré exécuté. Les étiquettes INVEST rendent visibles les dépendances et les décisions à traiter.

Les nombres de contrôles ne mesurent pas la qualité ou la fidélité du jeu : ils comptent des assertions de cohérence. Les 55 exigences actives ont des liens vers les fiches ; Arkath et le tournoi S4 restent hors périmètre. Les tests de campagne futurs sont décrits dans la [recette des parcours](RECETTE-PARCOURS.md).

Les données de référence, scripts historiques, captures et assets importés sont conservés. Le backlog est un ajout documentaire et un outil de validation ; il n’implémente aucun serveur ni client jouable.
