# MMHK-like — V7.0, tranche 11 : rappel militaire approuvé et retour contrôlé

**27 octobre 2026 · prototype serveur expérimental.** Les règles de durée d'un rappel **ne sont pas certifiées MMHK saison 2** ; arbitrage PvP public interdit.

## 1. État des preuves

La tranche 10 enregistrait des demandes `recall_requested`, sans les exécuter.
Le [guide communautaire G05](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/peremeshhenie_geroev_po_karte_privaly/3-1-0-11)
décrit des compteurs de haltes distincts entre aller et retour. Le [témoignage
contemporain de décembre 2010](https://www.jeuxvideo.com/forums/1-14545-507-2-0-1-0-tres-decevant.htm)
signale notamment des durées de retour discutables après attaque de Graals.
L'[annonce de la saison 2](https://www.jeuxvideo.com/news/2010/00045825-might-magic-heroes-kingdom-la-saison-2-lancee.htm)
mentionne les déplacements directs vers les Graals et la réorganisation de
troupes pendant les trajets. **Aucune de ces sources ne prouve l'ETA exact
du rappel d'une mission militaire en cours, ni ses restrictions.**

Il est donc interdit d'en déduire une durée depuis les ratios
12/4/9,375 de MMHK-Plus. La tranche 11 implémente **l'exécution
transactionnelle d'une décision approuvée**, et non une formule historique.

## 2. Contrat de rappel avec séparation des autorités

1. Le propriétaire du héros demande un rappel avec
   `requestServerHeroRecall({command:{missionId},serverNowMs,...})`.
   La demande est persistée, datée et idempotente.
2. **Seule une autorité serveur distincte** peut appeler
   `approveServerHeroRecall`, en fournissant :
   - une authentification serveur `authenticateRecallAuthority` avec
     `authenticated:true`, `canApproveRecall:true` et `authorityId` ;
   - une fonction de politique indépendante `authorizeRecall` qui renvoie
     explicitement `true` ;
   - un `policyId` versionné pour identifier le profil expérimental ;
   - une `trustedSchedule` comprenant `nowMs` et `returnAtMs`.
3. Dans le même `BEGIN IMMEDIATE`, la base vérifie que la mission :
   - est toujours `traveling`, sans bataille engagée ;
   - possède la requête de rappel de son propriétaire actif ;
   - conserve une route géographique et sa photographie initiale ;
   - est approuvée après la demande, **avant l'arrivée prévue** ;
   - possède une heure de retour strictement postérieure à l'approbation.
4. Le serveur persiste dans `military_mission_recall_plans` l'approbateur,
   la politique et les deux instants ; il affecte le temps de retour
   à la mission, annule l'échéance `arrival`, crée l'échéance
   `return_completion` et ajoute `recall_approved` à l'historique.
5. Un worker doté d'un **bail valide** exécute ensuite
   `completeServerHeroReturn`. Le moteur vérifie l'heure,
   confirme qu'il n'y a eu aucun combat, termine la mission et ajoute
   `recall_return_completed` à l'historique.

**Aucune horloge, approbation, ID d'acteur ou politique de rappel ne provient
d'une commande du navigateur.** Aucun renvoi ne peut être approché par une
simple réutilisation de la durée du trajet aller.

## 3. Convention de stockage temporaire

Le schéma SQLite du laboratoire reconnaît
`traveling / arrived / returning / completed / cancelled`. Pour éviter
une migration destructrice des contraintes `CHECK` existantes, le rappel
approuvé conserve **`traveling` pendant le retour**, mais son échéance
d'attaque est explicitement annulée. La complétion de ce retour produit
**`cancelled` comme statut terminal technique**, accompagné d'un événement
distinct `recall_return_completed`. Ce n'est **pas** une équivalence entre
une annulation de mission et un retour de rappel dans le jeu original.

Le profil final devra adopter des états explicites
`recall_returning` et `recalled` dans une migration SQLite
versionnée, lorsque le schéma des vraies missions et la politique historique
seront stabilisés. L'absence de ces statuts constitue une dette technique
connue, **pas** une règle historique à reproduire.

Les unités et la fiche du héros ne sont ni mutées ni pénalisées pendant le
rappel. La réservation du héros reste active jusqu'à la complétion du retour
et se libère à sa fin. Aucun rapport de combat, butin, blessure ni XP n'est
fabriqué.

## 4. Arrivées simultanées et sécurité

Les missions disposant d'un rappel **approuvé** ne participent plus au
groupe des attaques arrivant simultanément : leur échéance `arrival`
est devenue `cancelled`. La fonction `conflictingArrivals` consulte
la table des échéances au sein de la même transaction.

Cette exclusion ne s'applique **pas** à une simple demande de rappel
restée `pending` : tant que l'autorité ne l'a pas approuvée, l'attaque
continue d'exister et de bloquer les collisions pertinentes.

La lecture directe d'une arrivée approuvée est interdite, même si une
horloge fournie à l'API de laboratoire atteint l'ancien ETA. Le retour
suit toujours le verrou de worker avec `workerId`, `attempt` et
date de fin du bail. Une tentative périmée est refusée sans mutation.

L'approbation est idempotente si l'approbateur, la politique et
les dates sont **strictement identiques**. Une seconde approbation
avec un autre horaire est rejetée, au lieu de déplacer silencieusement
une armée déjà en route.

## 5. Essais

`server-authorized-recall.test.mjs` couvre :
- approbation séparée de la demande du joueur ;
- suppression atomique de l'ancienne échéance d'attaque ;
- retour effectivement conclu à la date **fournie par le serveur** ;
- conservation des armées et absence totale de combat fictif ;
- idempotence et détection d'une approbation divergente ;
- ancien worker expiré rejeté après reprise de bail ;
- libération d'un conflit simultané après approbation et non après la demande ;
- persistance du plan entre deux connexions SQLite et après réouverture.

Les tests sont ajoutés à la suite globale :

```bash
node --test tools/jactari-port/*.test.mjs
```

## 6. Conformité et travaux ultérieurs

Les formules exactes de vitesse, haltes, trêves, délais de rappel et les
interceptions de MMHK saison 2 demandent des sources supplémentaires.
Reste également à écrire la migration des statuts du rappel et à
séparer les permissions administrateur/worker dans de vrais processus
authentifiés. Les conflits militaires non résolus sont toujours bloqués
en transaction : aucune priorité par ordre d'exécution n'est introduite.

**Statut : V7.0 `in_progress`, C17 `implemented_partial`,
C18 `blocked_source`, `productionBattleArbiterAllowed=false`.**
