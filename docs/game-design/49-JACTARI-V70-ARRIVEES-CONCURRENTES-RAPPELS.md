# V7.0 — Tranche 10 : conflits d'arrivée transactionnels et demandes de rappel

**27 octobre 2026 · implémentation défensive, non-certification Ubisoft MMHK saison 2.**
**Aucun arbitrage PvP public ou combat automatique n'est activé.**

## 1. La faille de sécurité fonctionnelle

La tranche 9 détectait dans une fonction **en lecture seule** deux missions
arrivant à la même destination à la même heure. Toutefois, l'ordonnanceur
pouvait continuer à enregistrer chaque arrivée successivement, dans l'ordre
d'attribution des baux SQLite. Cet ordre technique ne correspond pas à une
règle de simultanéité historique.

La tranche 10 déplace le **contrôle d'exclusion directement dans la transaction
`markMissionArrived`**, exécutée sous `BEGIN IMMEDIATE`.

Le moteur relit les autres missions géolocalisées dont :
- le monde est identique ;
- la **ville de destination** est identique ;
- l'horodatage **prévu** d'arrivée est exactement égal ;
- le statut est encore `traveling` ou `arrived`.

Dès qu'une autre mission correspond à ces critères, l'arrivée est **refusée
avant la mutation** avec la raison « Simultaneous target arrival requires
server arbitration ». Aucun événement `arrived` n'est produit, aucune
armée n'est engagée et aucune mission n'est choisie gagnante par ordre
alphabétique de son ID ou par ordre des workers.

La lecture et la transition utilisent la même transaction SQLite : les
deux workers ne peuvent pas franchir simultanément le contrôle sur deux
connexions concurrentes. Le détecteur consultatif de la tranche 9 réutilise
le même prédicat, afin d'éviter un diagnostic contradictoire.

**Limites intentionnelles :** cela ne constitue **pas** un arbitrage
historique MMHK. Les ETA voisins sans égalité exacte, les conflits en
terrain ouvert, les collisions entre héroïnes/armées mobiles, les changements
de propriétaire et les sièges multiples demandent encore un modèle distinct.
La suppression ou annulation administrative d'une mission peut lever le
conflit pour une autre, sous une politique serveur **indépendante**.

## 2. Incidents d'ordonnanceur

L'ordonnanceur ne consomme pas une arrivée refusée :
- la mission reste `traveling` ;
- son échéance reste `leased` jusqu'à expiration ;
- le résultat indique `requiresArbitration:true` ;
- l'incident est journalisé sous le code existant `mission_state`, plutôt
  que d'imposer une migration risquée de l'ancienne contrainte `CHECK`.

Cela permet d'exploiter les bases SQLite existantes et de détecter un groupe
d'armées nécessitant un examen, sans prétendre résoudre un combat simultané.

## 3. Demande de rappel : intention persistante, pas retour automatique

Une nouvelle table `military_mission_recall_requests` et l'API
`requestServerHeroRecall` permettent à un acteur authentifié et propriétaire
de la mission d'enregistrer une demande de rappel. **Seul `missionId` est
accepté dans la commande**, l'horloge provient du serveur.

Le moteur refuse :
- un acteur sans autorisation ;
- un rappel antérieur à l'expédition ;
- une première demande après l'ETA ou lorsque la mission a déjà quitté
  l'état `traveling` ;
- tout champ client cachant un ID d'acteur ou une date de rappel.

Une première demande enregistre `recall_requested` dans l'historique de
mission et garde le statut `pending`. Une répétition du même ordre retourne
un replay sans ajouter un second événement.

**Ce n'est pas un rappel opérationnel** : l'armée continue selon sa mission
enregistrée, la réservation d'arrivée reste inchangée, les unités ne sont
pas téléportées, aucun temps de retour n'est inventé et le héros reste
réservé. Le passage futur de la demande à un véritable rappel exigera
une politique saison 2 documentée (point de retournement, haltes, trêves,
rapports et statut du héros).

La demande peut encore être visible après une arrivée : elle constitue
une trace historique de l'intention du joueur et non une promesse d'exécution.

## 4. Tests

La suite
`tools/jactari-port/server-simultaneous-arrivals-recall.test.mjs`
vérifie :
- refus de deux attaques simultanées vers la même ville sans perte militaire ;
- deux workers en échec propre, audités, sans double bataille ;
- suppression du conflit par annulation **autorisée** d'une mission ;
- acceptation de deux horaires d'arrivée différents ;
- demande de rappel persistée mais sans mutation de l'ETA ;
- refus des fausses identités et horloges ;
- relecture SQLite après redémarrage et sur deux connexions.

La validation complète reste :

```bash
node --test tools/jactari-port/*.test.mjs
```

## 5. À reconstruire

La **vraie règle de simultanéité** MMHK saison 2, les sièges concurrents,
les interceptions en déplacement et les effets précis du rappel ne sont
pas encore attestés par une source serveur indépendante. Il est interdit
d'appliquer ici une priorité arbitraire ou de transformer une demande
de rappel en annulation automatique.

**État : V7.0 `in_progress`, C17 `implemented_partial`, C18
`blocked_source`, `productionBattleArbiterAllowed=false`.**
