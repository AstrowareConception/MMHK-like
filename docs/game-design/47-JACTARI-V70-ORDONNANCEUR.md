# V7.0 — Tranche 8 : ordonnanceur d'échéances à la demande

**27 octobre 2026 — validation technique, aucune certification Ubisoft saison 2.**

La tranche 7 a introduit une file SQLite d'échéances, les baux expirables et le journal des transitions. La tranche 8 ajoute un exécuteur **explicitement invoqué par le serveur** : `server-due-event-runner.mjs`.

## Contrat d'exécution

`runOneDueMissionEvent` réclame **une** échéance arrivée à terme dans la transaction SQLite et tente seulement :
- `arrival` → `arriveServerHeroMission`, avec nouvelle autorisation de cible ;
- `return_completion` → `completeServerHeroReturn`, avec vérification de l'heure côté serveur.

`runDueMissionBatch` répète cette opération avec une limite stricte de 1 à 500 événements par appel. Il fournit un rapport `attempted / processed / blocked`. L'identité du joueur est lue dans la mission persistée. L'identité du worker et son autorisation sont exclusivement **fournies par la couche serveur**, qui fournit aussi l'horloge et la politique des cibles. Aucune commande d'un navigateur ne doit invoquer directement ces fonctions.

Une opération refusée reste réservée jusqu'à expiration du bail, puis peut être récupérée par un autre worker ; son état militaire n'est pas modifié. L'opérateur doit examiner les refus durables, au lieu de les traiter comme des succès.

## Fiabilité et limites

- Le traitement utilise les transitions SQLite transactionnelles de V7.0, et non un accès direct au registre des combats.
- Les réservations concurrentes ne délivrent pas le même événement tant que le bail est valide.
- Une interruption entre la réservation et la transition permet une nouvelle tentative après expiration.
- La transition elle-même conserve l'idempotence et la revalidation de la destination.
- **Aucun combat, siège, pillage, capture ou interception n'est exécuté par l'ordonnanceur.**
- Aucune planification permanente, boucle d'attente ni daemon n'est installé : c'est une fonction synchrone invoquée à la demande.
- Les priorités tactiques entre plusieurs armées arrivant simultanément ne sont **pas reconstituées** ; seul l'ordre déterministe des événements SQLite existants est respecté.
- Aucun mécanisme d'observation des erreurs, dead-letter queue ou saga réseau n'est encore intégré.
- Les baux gèrent l'attribution de travaux, mais les transitions existantes ne vérifient pas un *fencing token* : il reste à protéger intégralement la concurrence entre un ancien worker ralenti et son successeur, avant toute ouverture de production.

## Tests

```bash
node --test tools/jactari-port/server-due-event-runner.test.mjs
node --test tools/jactari-port/*.test.mjs
```

Les tests portent sur le refus d'un worker non autorisé, les horodatages invalides, les échéances futures, l'arrivée autorisée sans combat, un refus de cible suivi d'une nouvelle tentative et la limite de traitement par lot.

**Statut inchangé : V7.0 en cours, C17 partiel, C18 bloqué par les sources, `productionBattleArbiterAllowed=false`.**

Prochaine tranche : journalisation des erreurs et politique de récupération, conflits simultanés et fencing transactionnel, puis étude historique des interceptions avant implémentation.
