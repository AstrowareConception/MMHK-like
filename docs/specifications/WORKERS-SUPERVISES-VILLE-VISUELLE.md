# MMHK-like — Workers supervisés et scène de ville (tranche technique)

**28 octobre 2026 · prototypes de développement ; aucun serveur public ni combat PvP.**

## Workers Python en service explicite

Le module `mmhk_api.supervised_worker` regroupe l'exécution de :
- la production des mines (`run_economy_batch`) ;
- l'achèvement des constructions (`run_construction_batch`).

Chaque moteur conserve ses **propres transactions PostgreSQL**,
ses verrous `FOR UPDATE SKIP LOCKED`, ses limites de lots et ses
journaux métier. Une exception dans l'un n'annule pas le traitement
de l'autre. Un incident est journalisé comme catégorie générale
(`economy`, `construction`, `database`), sans copier des secrets dans
la table des battements de cœur.

La migration `005_worker_heartbeat.sql` crée
`app_worker_heartbeats` avec identité de processus, dernière activité,
statut `healthy/degraded/stopped`, itérations, compteurs de travaux
et nombre de défaillances. Ces informations sont **opérationnelles**,
jamais l'état économique ou militaire autoritatif.

Le superviseur :
- attend explicitement `--loop` ou `--once`, sans démarrer implicitement ;
- traite un nombre borné de villes et de constructions par cycle ;
- recommence après un intervalle configurable ;
- arrête le processus après trois cycles consécutifs en erreur, afin que
  le superviseur Docker puisse le redémarrer ;
- répond à SIGTERM/SIGINT et stoppe la boucle proprement ;
- offre une sonde `--check-health` qui échoue si le battement est absent,
  périmé, ou indique une erreur ;
- reconnecte PostgreSQL à chaque itération : aucune transaction globale
  ne demeure ouverte entre deux réveils.

### Démarrage

**Prérequis :** PostgreSQL accessible, identifiants du serveur configurés,
migration 005 appliquée et sauvegarde vérifiée avant mise à niveau.

```bash
python -m mmhk_api.manage migrate
```

Le worker ne démarre **pas** avec `docker compose -f compose.dev.yaml up`.
Son activation nécessite explicitement :

```bash
export MMHK_POSTGRES_PASSWORD='secret-local-dans-votre-shell'
docker compose -f compose.dev.yaml -f compose.workers.yaml \
  --profile workers up -d --build
```

Consultation :

```bash
docker compose -f compose.dev.yaml -f compose.workers.yaml \
  --profile workers ps
docker compose -f compose.dev.yaml -f compose.workers.yaml \
  --profile workers logs -f supervised-worker
```

Arrêt explicite :

```bash
docker compose -f compose.dev.yaml -f compose.workers.yaml \
  --profile workers stop supervised-worker
```

Une seule instance peut suffire au prototype. Les instances suivantes
doivent avoir une **identité distincte**, le nom d'hôte Docker étant
utilisé par défaut ; la redondance de traitement est contrôlée par les
transactions PostgreSQL, pas par le statut des battements de cœur.

L'image Python utilise un utilisateur non privilégié, un système de
fichiers en lecture seule, une configuration `no-new-privileges`,
un redémarrage `unless-stopped`, une période d'arrêt gracieux de
40 secondes et une sonde de santé PostgreSQL. **Ce n'est pas encore
une infrastructure production** : manque notamment une alerte
externe si la sonde devient dégradée, la rotation des secrets,
les sauvegardes et la protection des accès au VPS.

### Test ponctuel sans Docker

```bash
python -m mmhk_api.supervised_worker --once
```

Le mode `--loop` est réservé à un environnement où un opérateur
surveille le traitement et peut le stopper proprement.

**Important :** Redis reste disponible pour des usages futurs mais
n'intervient ni dans les coûts, ni dans les délais, ni dans les mutations
des stocks. Il n'y a pas de worker de combat, de siège ou de mission PvP.

## Scène de ville : gabarit 680 × 552

Les archives du client 4.1.3-MTR renseignent un gabarit natif
**680 × 552** pour `.cityViewBase` et un objet `CITYVIEW_CONF`
donnant des positions de certains bâtiments Havre, enregistrées dans
[`original-city-layouts-4.1.3.json`](../../data/analysis/original-city-layouts-4.1.3.json).

Le composant
[`city-scene.tsx`](../../apps/web/components/city-scene.tsx)
affiche une **scène de substitution originale en CSS**, compatible
avec les écrans étroits, au même ratio. Il ne prétend pas représenter
fidèlement les sprites, les niveaux ni les décors Ubisoft.

Les constructions dont le code correspond exactement à l'un des
emplacements documentés (par exemple `village_hall`, `tavern`,
`marketplace`, `fort`, `resource_silo`, `recruit_t1`)
obtiennent un marqueur interactif placé à l'ancre issue du fichier
historique. Un code expérimental non identifié reste dans la liste
des bâtiments, sans inventer son emplacement visuel.

Tous les marqueurs sont accessibles au clavier et renvoient aux
constructions existantes. Les propriétés de comptes, ressources,
niveaux et état actif viennent **uniquement de FastAPI**, jamais d'une
capture ou d'un fichier statique.

**Droits des assets :** le corpus archivé porte l'indication
`historical_reference_no_open_graphics_license_identified`.
Les images Ubisoft ne sont donc **pas** copiées dans `apps/web/public`
et ne sont pas servies par la nouvelle interface sans examen des droits.
Cette tranche offre une base fidèle sur le *gabarit* et les *coordonnées
vérifiées*, pas une reproduction visuelle certifiée.

## Tests, sécurité et suite

La suite d'intégration PostgreSQL ajoute des scénarios pour :
- crédit économique et achèvement de construction dans un même cycle ;
- idempotence après nouvelle itération ;
- panne synthétique de production n'empêchant pas la construction ;
- diagnostic `degraded`, retour `healthy`, battement périmé ;
- refus d'identifiants de worker et délais de sonde dangereux ;
- migrations V001–V005, données métier, API et Jactari existants.

**Limites connues :** pas de métriques Prometheus, pas d'alerte opérateur
externe, pas de distribution automatique d'assets historiques, pas de
jeu MMO public, pas de déploiement de production, pas d'arbitrage PvP
ni de certification de fidélité MMHK saison 2.

`productionBattleArbiterAllowed=false` demeure inchangé.
