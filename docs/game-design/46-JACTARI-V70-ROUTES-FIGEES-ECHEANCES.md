# V7.0 — Tranche 7 : départ territorial immuable et ordonnancement des échéances

**27 octobre 2026 · expérimental, pas de certification Ubisoft MMHK saison 2, PvP public désactivé.**

## 1. Contexte et décision de conception

La [tranche 6](45-JACTARI-V70-TERRITOIRES-DIPLOMATIE.md) sait déduire
les portions de déplacement d'un état territorial **courant**. Une opération
militaire dure cependant assez longtemps pour que les alliances, revendications
et détenteurs de villes puissent évoluer en cours de route.

Cette tranche fixe **l'information disponible au départ**, séparément de
l'état diplomatique actuel. Il s'agit d'un choix d'architecture en vue des
replays et de l'audit, **non d'une démonstration historique que le serveur
Ubisoft imposait à toutes les missions le trajet initial quelles que soient
les mutations de territoire**.

Le serveur connaît déjà une date d'arrivée et un cycle de vie militaire ;
ces dates continuent à provenir d'une politique externe vérifiée. La
prévisualisation territoriale n'a pas le droit d'en fournir une à sa place.

## 2. Nouvelle persistance de preuve de départ

À la création d'une mission géolocalisée,
`trusted-hero-store.mjs` écrit maintenant dans **le même `BEGIN IMMEDIATE`
que l'ordre militaire** :
- la route de ville à ville déjà persistée ;
- une photographie complète du monde : taille, positions des villes,
  alliances, appartenances, relations et revendications ;
- sa révision et son SHA-256 (calculé sur le JSON canonique stable produit
  par les requêtes SQL ordonnées) ;
- une échéance `arrival` à l'heure de mission **fournie par le serveur**.

Nouvelle table : `military_mission_world_snapshots`.
Elle référence la mission et le monde, sans autoriser d'autre écriture
au travers de l'API de lecture.

`getFrozenMissionTerritory` vérifie l'empreinte au chargement et renvoie
une copie détachée. `compareFrozenMissionTerritory` compare version et
empreinte au monde actuel sous une transaction de lecture cohérente.
Un changement d'alliance ou de revendication n'efface **jamais** la
photographie du départ.

Le stockage historique des missions de laboratoire antérieures à cette
migration reste lisible : les anciennes missions sans photographie renvoient
`null`, sans inventer de contexte diplomatique.

## 3. Rejouer la géométrie aller et retour

`server-frozen-route-preview.mjs` relit la mission, la route et la
photographie de son monde lors du départ. Il peut recomposer une version
candidate de la trajectoire `outbound` ou `inbound`, en réutilisant
la géométrie torique source-adossée et les qualifications territoriales
telles qu'elles existaient à l'expédition.

**La relecture inversée n'est pas la vraie trajectoire de retour d'Ubisoft.**
Elle n'a ni politique historique de haltes de retour, ni horaire d'arrivée,
ni effet sur les villes ou garnisons. Elle prépare seulement une comparaison
et une documentation rigoureuse de l'état initial. Le moteur ne génère
aucun `trustedSchedule`, ne recalcule pas d'ordre actif et ne débloque
pas une attaque ou une interception.

Une ville cible changeant de position conserve également son emplacement
historique dans le snapshot ; le contrôle d'engagement actuel continue
de refuser un combat contre une cible ayant changé de lieu.

## 4. Échéances fiables — file SQLite à livraison au moins une fois

Nouvelle table `military_mission_due_events` :
- une entrée `arrival` lors d'un départ ;
- une entrée `return_completion` uniquement après un combat engagé et
  une programmation explicite du retour ;
- un état `pending`, `leased`, `done` ou `cancelled` ;
- heure d'échéance, worker propriétaire de la réservation, expiration,
  numéro de tentative et date de finalisation.

`claimNextDueMissionEvent` :
- prend une **transaction `BEGIN IMMEDIATE`** pour réserver une échéance
  arrivée à terme ;
- trie par `due_at_ms, mission_id, event_kind`, afin d'établir un ordre
  déterministe pour les événements de même date ;
- attribue une réservation de 1 ms à 1 heure, sans autoriser deux workers
  à revendiquer simultanément le même événement ;
- laisse retenter un événement lorsque sa réservation expire ;
- **ne modifie pas l'état de la mission et ne lance jamais un combat**.

La transition serveur habituelle `markMissionArrived` marque l'événement
`arrival` comme traité dans sa transaction. De la même manière,
`completeMissionReturn` clôt l'événement du retour ; l'annulation
administrative clôt l'échéance de départ sans combat. Les protections
débutant, contrôles de position et autorisations de cible restent
appliqués **au moment de la transition**, même après réservation.

`confirmDueMissionEvent` vérifie que l'événement effectivement revendiqué
par ce worker et cette tentative a **déjà** donné lieu à la transition
permanente. Il ne permet pas d'enregistrer artificiellement un événement
traité si la mission n'a pas changé d'état.

### Garantie réaliste

Cette file vise une **livraison au moins une fois** :
un worker peut être interrompu, un bail peut expirer, et une tentative
peut être rejouée. Les transitions de mission restent idempotentes en base.
La file ne garantit ni « exactement une fois » dans tous les systèmes
externes, ni un processus de fond autonome, ni une synchronisation
distribuée entre plusieurs applications hors SQLite. **Aucun worker réseau
n'est démarré par cette tranche.**

**Les méthodes sont strictement internes au serveur** et ne constituent
pas des endpoints web pour les joueurs. Ne pas exposer les photographies
diplomatiques complètes ni les commandes de réservation dans une API
publique.

## 5. Essais et critères

Les deux nouvelles suites sont :
- `server-route-freeze-due-events.test.mjs` : photographie atomique,
  mutations diplomatiques, réclamation concurrente, égalité des dates,
  expiration des réservations, annulation, refus d'autorisation, retour
  planifié, persistance après réouverture et multi-connexions SQLite ;
- `server-frozen-route-preview.test.mjs` : lecture aller/retour à partir
  de l'ancien état, absence de recalcul rétroactif après retournement
  d'alliance, rejet des missions non géolocalisées.

Commandes de contrôle :

```bash
node --test tools/jactari-port/server-route-freeze-due-events.test.mjs \
 tools/jactari-port/server-frozen-route-preview.test.mjs
node --test tools/jactari-port/*.test.mjs
```

L'intégration CI vérifie aussi les tests Jactari antérieurs.

## 6. Ce qui reste ouvert

Il faudra reconstituer indépendamment les **règles de reprise du trajet
après changement de propriétaire**, la diplomatie au moment exact d'une
interception, le rappel de mission, les priorités de départ/arrivée lors
de conflits simultanés, les retours de butin/unités vers les garnisons,
les blessures et captures, et le comportement de trêve saison 2.

**Statut de conformité inchangé : V7.0 `in_progress`, C17
`implemented_partial`, C18 `blocked_source`,
`productionBattleArbiterAllowed=false`.**
