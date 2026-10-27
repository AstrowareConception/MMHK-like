# V7.0 — Tranche 9 : fencing des workers, incidents persistants et conflits observés

**27 octobre 2026.** Portée : amélioration de fiabilité technique. Il ne s'agit pas d'une certification des mécaniques militaires d'Ubisoft MMHK saison 2.

## 1. Risque corrigé : un worker peut finir après expiration de son bail

La tranche 8 possédait déjà une réservation atomique des échéances, mais l'ancien
worker pouvait essayer d'effectuer sa transition sans présenter l'identité et la
tentative du bail. Le nouveau contrôle `checkDueLease` s'exécute **dans la
transaction SQLite qui modifie la mission**, sous `BEGIN IMMEDIATE`.

Pour une action menée via l'ordonnanceur, la transition d'arrivée ou de retour
doit correspondre :
- à la bonne mission et au type d'échéance ;
- à une ligne `status='leased'` ;
- au `workerId` d'origine et à son numéro de `attempt` courant ;
- à une échéance atteinte, mais à un bail **strictement non expiré**
  (`nowMs < leaseUntilMs`).

Le bail est passé par `arriveServerHeroMission` et
`completeServerHeroReturn` dans un argument interne séparé des
commandes client. L'ordonnanceur V7.0 transmet systématiquement la preuve
`{workerId,attempt}`. Lorsqu'un ancien worker reprend après récupération
de son travail par un autre, sa tentative est rejetée avant toute mutation.

**Frontière de confiance :** l'ancienne API administrative directe, sans bail,
reste compatible pour les tests et interventions serveur de laboratoire. Elle
est un chemin de confiance distinct, qui **ne doit jamais être accessible
aux workers non habilités ni aux navigateurs**. Ce travail n'a pas créé un
contrôle d'identité réseau ou une authentification de process réelle :
l'ensemble des API restent des modules serveur et des callbacks de confiance.

## 2. Incidents persistants

La table `military_due_event_incidents` référence l'échéance, le worker, le
numéro de tentative et la date d'observation. Chaque tentative ne peut
enregistrer qu'un incident, suivant une taxonomie fermée :

| Catégorie | Signification |
| --- | --- |
| `target_denied` | La cible n'est plus autorisée |
| `mission_state` | État, position ou transition de mission incompatibles |
| `lease_conflict` | Numéro de tentative ou bail périmé |
| `internal_error` | Incident technique non classé |

**Les textes arbitraires d'exception ne sont pas enregistrés en base.**
La fonction `getMissionDueIncidents` permet à un outil d'exploitation interne
de consulter l'historique des rejets. L'écriture est elle-même protégée par
la vérification du bail, afin d'empêcher qu'un worker périmé forge le journal
du successeur. Lorsque l'écriture d'incident échoue, le résultat de
l'ordonnanceur indique `incidentRecorded:false` et reste `blocked` :
un incident non enregistré n'est jamais signalé comme traité.

La file reste **à livraison au moins une fois**. Il n'existe pas encore
de dead-letter queue ni de retry avec temporisation adaptative.

## 3. Arrivées simultanées : observation, pas arbitrage

`inspectSimultaneousArrivals(missionId)` inspecte de façon cohérente
les missions géolocalisées encore `traveling` ou `arrived` qui visent
la **même ville avec une heure d'arrivée exactement identique**.
Elle renvoie la liste des identifiants de missions concurrentes et le
drapeau `requiresArbitration`.

Cette observation n'est **pas** un verrou de destination. La fonction
n'ordonne aucune bataille, ne choisit aucun vainqueur, ne transfère
aucune ville et n'interprète pas les règles de simultanéité de la saison 2.
Elle prépare une future politique transactionnelle de résolution de
conflits, dont les règles restent historiquement à vérifier.

Les missions de même destination à horaires voisins mais distincts, les
interceptions en terrain ouvert et les attaques multi-alliances ne sont
pas encore traitées par ce détecteur.

## 4. Régression

Le fichier `tools/jactari-port/server-due-fencing-incidents.test.mjs`
vérifie les scénarios suivants :
- bail repris par un autre worker au milliseconde d'expiration ;
- worker ancien et numéro de tentative falsifié ;
- refus sans changement d'armée ni d'état de mission ;
- échec de politique enregistré sans texte libre ;
- nouvelle tentative après expiration ;
- retour militaire dont le bail a été repris ;
- deux armées arrivant à la même ville et à la même échéance ;
- réouverture de SQLite et conservation des incidents entre connexions.

Commande :

```bash
node --test tools/jactari-port/*.test.mjs
```

## 5. Suites et limites

Une véritable exploitation multijoueur demandera encore : authentification des
processus workers, séparation stricte des pouvoirs administrateur/worker,
authentification HTTP réelle, supervision et alertes, reprogrammation contrôlée
des incidents irrécupérables, prise en charge d'une politique historique de
simultanéité et des rappels/interceptions, outils de migration de bases existantes,
et tests de charge et d'incidents sur infrastructure cible.

**V7.0 : `in_progress` ; C17 : `implemented_partial` ; C18 :
`blocked_source` ; `productionBattleArbiterAllowed=false`.**
