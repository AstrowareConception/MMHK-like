# Méthode, qualité et usage des fiches

Le backlog exprime le **PvP classique avec Guerre des Larmes**. Il transforme le dossier de rétroconception en comportements observables, avec des décisions encore ouvertes. Il ne prétend ni certifier l’ancien serveur Ubisoft, ni constituer un engagement de charge.

## Lire les 3 C

| C | Contenu des fiches | Travail restant avec l’équipe |
| --- | --- | --- |
| Card | Rôle, intention et bénéfice : « En tant que…, je souhaite… afin de… » | Vérifier que le bénéfice justifie le parcours |
| Conversation | Préconditions, règles, preuves, dépendances et question précise | Réunir produit, développement et validation ; consigner les décisions et exemples |
| Confirmation | Critères Étant donné / Quand / Alors, identifiés par fiche | Fixer les données de test, exécuter et comparer le résultat |

Une fiche détaillée prépare la conversation ; elle ne prouve pas qu’elle a eu lieu. La Confirmation est constituée d’exemples vérifiables, pas d’un accord général du type « l’écran fonctionne ». Les trois premiers critères concernent directement le parcours. Les deux suivants rappellent les obligations de cohérence et de contrôle d’accès.

## Appliquer INVEST sans cocher artificiellement les cases

| Lettre | Question d’affinage | Application à ce dossier |
| --- | --- | --- |
| I — Independent | Peut-on livrer et valider une valeur identifiable ? | Les dépendances métier sont nommées. Des fixtures peuvent isoler un test ; elles ne suppriment pas les prérequis de livraison |
| N — Negotiable | Quels choix peut-on discuter sans perdre le bénéfice ? | Règles historiques à préserver, variantes à arbitrer et ergonomie sont distinguées |
| V — Valuable | Qui gagne quoi ? | Le bénéfice est formulé dans chaque Card, y compris pour les refus et les résultats automatiques |
| E — Estimable | L’équipe comprend-elle les règles et l’effort ? | Aucune estimation inventée. Une inconnue de calcul ou de périmètre appelle une recherche ou un prototype borné |
| S — Small | Peut-on terminer le parcours dans une itération ? | Taille à confirmer avec l’équipe ; plusieurs transitions complexes sont signalées comme candidates à découpage |
| T — Testable | Existe-t-il une observation permettant de conclure ? | Scénarios écrits ; l’oracle numérique reste à qualifier lorsque la règle manque |

Les dépendances sont des préconditions fonctionnelles, pas une prescription d’architecture. Une story ne doit pas devenir une couche technique sans valeur démontrable. Si elle est trop grande, la découper par résultat utilisateur ou variante de parcours ; conserver son ID comme parent retiré du décompte actif et attribuer de nouveaux IDs aux fiches filles.

## Contrat commun avant chaque scénario

Le jeu de test identifie compte, monde, phase, profil classique, révision du catalogue, horloge, entités possédées et permissions. Les noms d’unités, ressources, positions et coûts sont explicités dans la fixture. Une quantité de test choisie pour vérifier un mécanisme est signalée comme **fictive** ; elle ne devient pas un paramètre historique.

Un ordre utilisateur est validé sur l’état courant par le serveur. Une action refusée ne consomme pas partiellement ses moyens. Un ordre accepté peut évoluer pendant une déconnexion. Relire un rapport, actualiser une vue ou rejouer la même intention ne crée pas de nouvelles troupes, ressources, récompenses ou constructions.

Les comportements automatiques, tels que production et victoire, restent exprimés du point de vue du joueur bénéficiaire ou affecté. « Quand je réalise le parcours » désigne alors l’observation du processus après son événement déclencheur, pas un bouton artificiel pour exécuter le temps serveur.

## Qualifier les sources et les variantes

- **DOC / OBS-CODE / OBS-IMAGE / COR** : traces disponibles de la mécanique principale. Une capture ne prouve pas une probabilité ; un simulateur communautaire ne prouve pas à lui seul le serveur Ubisoft.
- **HYP** : mécanique ou variante conditionnelle à confirmer. Ne pas l’ajouter automatiquement au périmètre engagé.
- **PROP** : contrat proposé pour le successeur, notamment cohérence, droits, déterminisme, navigation ou archivage.
- **Uxx** : inconnue du registre. La fiche reste à affiner tant que les inconnues influant sur son résultat ne sont pas traitées.

Une story documentée peut contenir des critères techniques proposés : son étiquette principale n’attribue pas ces garanties à Ubisoft. Les chiffres observés dans une capture ou une saison gardent leur contexte. Le profil classique exclut automatiquement les règles Arkath et tournoi S4 ; les services tardifs, unions, transmissions et balance commerciale demandent une qualification séparée.

En l’absence d’oracle historique, deux issues sont possibles : rechercher une preuve, ou valider explicitement une variante du successeur. Le registre conserve la différence. La fidélité historique et l’achèvement fonctionnel sont deux informations distinctes.

## Définition de prêt proposée

Cette convention d’équipe n’est pas une obligation de Scrum. Une fiche peut passer de **à affiner** à **prête** lorsque :

1. Le rôle, le bénéfice et le périmètre sont acceptés.
2. Les règles applicables sont identifiées ; les inconnues qui changent les résultats sont résolues ou remplacées par une variante assumée et versionnée.
3. Les critères possèdent des exemples concrets, y compris refus et frontière.
4. Les dépendances sont disponibles ou un contrat de livraison réaliste existe.
5. L’équipe confirme une taille réalisable et fournit son estimation.
6. Les assets nécessaires sont disponibles, ou un substitut temporaire satisfait le contrat fonctionnel annoncé.

Aucune des 300 fiches n’est déclarée prête par simple génération documentaire. Un échange d’affinage peut conclure qu’une fiche est déjà assez claire ; il faut alors consigner cette décision.

<a id="definition-of-done"></a>
## Definition of Done

La **DoD commune DOD-COMMUNE-1** est le niveau de qualité attendu d’une fonctionnalité terminée. Les critères d’acceptation définissent son comportement particulier ; la DoD couvre aussi son intégration, sa vérification et sa traçabilité.

### DOD-01 — Périmètre qualifié

Rôle, monde, version des règles et résultat de la fiche sont convenus. Chaque inconnue affectant le résultat est résolue par une preuve ou une décision de variante tracée. Un profil de test provisoire ne vaut pas certification historique.

### DOD-02 — Critères démontrés

Chaque critère applicable possède données d’entrée, action, résultat attendu et résultat obtenu. Cas nominal, refus et frontière sont vérifiés. Toute inapplicabilité est motivée et relue ; aucun résultat de test n’est présumé.

### DOD-03 — Autorité et confidentialité

Le serveur contrôle monde, propriétaire, rôle et visibilité. Une URL modifiée ou un ancien écran ne permet pas d’accéder à une donnée ou une commande interdite.

### DOD-04 — Cohérence des mutations

Coûts, réservations, entités et récompenses restent cohérents. Répétition d’une intention, concurrence et reprise après incident n’ajoutent ni débit ni bénéfice indu. Pour une lecture seule, l’absence d’effet métier est vérifiée.

### DOD-05 — Temps persistant

Pour un processus temporisé, échéance, progression hors connexion, reconnexion et frontière temporelle sont vérifiées sur l’horloge du monde. Les animations du navigateur n’exécutent pas les résultats du serveur.

### DOD-06 — Calculs et provenance

Coûts, effets, limites, unités de mesure et arrondis proviennent du catalogue versionné. Les fixtures indiquent si les valeurs sont historiques, provisoires ou choisies pour tester. Une règle inconnue ne vaut jamais zéro.

### DOD-07 — Parcours utilisable

Le joueur peut accomplir le parcours et comprendre succès, refus, attente et indisponibilité. Les vues restent cohérentes après navigation et actualisation ; les données utiles sont lisibles. Les substituts graphiques sont identifiés et ne modifient pas le gameplay.

### DOD-08 — Validation adaptée

Les contrôles sont proportionnés : calculs déterministes et mutations concurrentes automatisés quand pertinents, parcours vérifiés dans le navigateur, revue visuelle des écrans concernés. Une simple modification éditoriale n’exige pas de tests artificiels.

### DOD-09 — Intégration et traçabilité

La fiche est intégrée avec ses dépendances ou des contrats testés, sans défaut bloquant connu sur le parcours. Rapports, documentation, références REQ/U et décisions affectées sont actualisés ; revue par une autre personne de l’équipe quand elle existe.

### DOD-10 — Acceptation consignée

La démonstration, les preuves de vérification, le profil et l’acceptation fonctionnelle sont consignés. La qualification historique est notée séparément. Une fiche non conforme à cette définition reste non terminée.

Chaque fiche complète cette définition avec sa démonstration et son cas frontière prioritaires. Les exceptions d’applicabilité sont motivées : une lecture sans minuterie n’exige pas un faux test de durée, mais exige de vérifier qu’elle ne déclenche pas de mutation.

La disponibilité des décors historiques de ville et bâtiments ne bloque pas les fonctions qui peuvent être acceptées avec des substituts identifiés. Les critères de fidélité graphique non satisfaits restent ouverts dans les fiches UIX et le plan d’assets ; une maquette provisoire ne devient pas « identique à MMHK ».

## Priorités et états

| Marque | Usage proposé |
| --- | --- |
| P0 | Nécessaire au noyau du parcours ou à l’intégrité de la campagne classique |
| P1 | Nécessaire pour compléter une expérience classique riche ou un module |
| P2 | Variante à confirmer, confort ou capacité à arbitrer |

La priorité d’une story n’est pas la priorité de recherche du registre Uxx. P0 ne veut pas dire « premier sprint ». Early, mid et end game décrivent la campagne vécue par les joueurs, pas l’ordre des versions du logiciel.

États de suivi proposés : **à affiner → prête → en développement → à vérifier → acceptée**. Une fiche bloquée indique son motif et les IDs concernés. Une fiche abandonnée reste traçable, sans rester dans le décompte actif. La qualification de fidélité indique séparément : non évaluée, prototype, variante acceptée, corroborée.

## Format des preuves de validation

Pour chaque CA : ID de la fiche et du critère ; révision du logiciel ; profil et catalogue ; état initial ; heure logique ; commande ou événement ; état attendu ; état obtenu ; rapport/capture/log utiles ; verdict ; personne et date de revue. Les données privées inutiles ne figurent pas dans les preuves partagées.

Le fichier JSON reprend les mêmes Cards, Conversations, critères, INVEST et DoD. Les états sont initialisés à « à affiner » et « spécifié non exécuté ». Les estimations sont nulles ; aucun vélocité, délai de livraison ou test réussi n’est déduit du nombre de fiches.

## Sources méthodologiques

- Ron Jeffries, [Card, Conversation, Confirmation](https://ronjeffries.com/xprog/articles/expcardconversationconfirmation/) et [3Cs revisited](https://ronjeffries.com/articles/019-01ff/3cs-revisited/) : rôle de la conversation et des exemples de confirmation.
- Bill Wake, [INVEST in Good Stories, and SMART Tasks](https://xp123.com/invest-in-good-stories-and-smart-tasks/) : qualités d’une story et besoin de recherche quand l’estimation reste incertaine.
- Ken Schwaber et Jeff Sutherland, [Scrum Guide](https://scrumguides.org/scrum-guide.html) : définition commune de qualité pour un incrément terminé. Le guide n’impose pas le format user story ni la définition de prêt proposée ici.

Les conventions P0/P1/P2, phases de campagne, étiquettes de preuve et DoD détaillée ci-dessus sont des choix de ce projet.
