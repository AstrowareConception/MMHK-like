# MMHK-like · première tranche PostgreSQL

L'application FastAPI est un **prototype de consultation de royaumes**, pas un
serveur MMO public. Jactari Python reste expérimental et les batailles ne
sont accessibles par aucun endpoint.

## Démarrage local

Depuis la racine du dépôt :

```bash
# Mot de passe choisi localement ; ne pas l'enregistrer dans Git.
export MMHK_POSTGRES_PASSWORD='mot-de-passe-local-a-remplacer'
docker compose -f compose.dev.yaml up -d postgres redis
export MMHK_DATABASE_URL="postgresql://mmhk:${MMHK_POSTGRES_PASSWORD}@127.0.0.1:5432/mmhk"
python -m venv .venv
source .venv/bin/activate
python -m pip install -e './apps/api[dev]'
python -m mmhk_api.manage migrate
python -m mmhk_api.manage create-account --username joueurtest
python -m mmhk_api.manage create-haven-world \
  --username joueurtest --world-id monde-demo --world-name 'Monde de développement' \
  --size 100 --city-name 'Premier Havre' --x 1 --y 1
uvicorn mmhk_api.main:app --host 127.0.0.1 --port 8000 --reload
```

Dans un second terminal :

```bash
cd apps/web
npm install
MMHK_API_INTERNAL_URL=http://127.0.0.1:8000 npm run dev
```

Ouvrez `http://localhost:3000`, connectez-vous avec les identifiants
créés par la CLI, cliquez sur le monde, puis sur la première ville pour
voir les sept stocks. La commande d'administration crée explicitement **4
mines** dans la première région Havre : or, bois, minerai et cristal,
conformément aux décisions P0. **Les quantités sont initialisées à zéro** :
aucun capital S2 historique n'a été inventé.

Sous PowerShell, utilisez `.venv\Scripts\Activate.ps1` et les commandes
d'environnement adaptées à Windows.

Si le mot de passe PostgreSQL comporte des caractères spéciaux d'URL,
encodez-les dans `MMHK_DATABASE_URL`.

**Sécurité :** la CLI est destinée à l'opérateur. Elle n'est jamais exposée
dans FastAPI. Le cookie Next.js est `HttpOnly`, `SameSite=Lax` et `Secure`
en production. Les sessions en base sont stockées sous forme de digests,
expirent après 8 h, et sont supprimées à la déconnexion. Les requêtes
`/api/v1/me/*` vérifient la session et filtrent par compte **dans SQL**.

### API exposée

| Méthode | Route | Contrôle |
| --- | --- | --- |
| GET | `/api/v1/health` | Public, diagnostic uniquement |
| GET | `/api/v1/jactari/status` | Public, état expérimental uniquement |
| POST | `/api/v1/sessions` | Mot de passe, retourne un jeton opaque |
| DELETE | `/api/v1/sessions/current` | Session authentifiée |
| GET | `/api/v1/me/worlds` | Mondes du compte |
| GET | `/api/v1/me/worlds/{world_id}/cities` | Ses villes dans un monde où il est membre |
| GET | `/api/v1/me/cities/{city_id}` | Stocks de la ville dont il est propriétaire |

Le navigateur ne connaît pas le bearer API. Next.js le conserve en cookie
et transmet les requêtes depuis son serveur. Pas de CORS pour des appels
directs navigateur → API.

### Tests

```bash
MMHK_TEST_DATABASE_URL="$MMHK_DATABASE_URL" python -m pytest -q apps/api/tests
```

GitHub Actions démarre un PostgreSQL jetable, exécute ces tests sur de
**vraies tables**, puis compile Next.js et effectue les contrôles TypeScript.
La suite Node du moteur Jactari historique reste indépendante.

## Production des mines : profil expérimental et worker à la demande

L'économie reste **inactive tant que l'opérateur ne définit pas explicitement
les quatre cadences, les capacités et la fréquence des crédits**. Aucun taux
de production Ubisoft saison 2 n'est intégré par défaut.

Après la création de la ville, relevez son UUID dans l'API ou en SQL, puis
configurez un profil, par exemple :

```bash
python -m mmhk_api.manage configure-haven-economy \
  --city-id UUID_DE_LA_VILLE \
  --tick-seconds 900 \
  --capacity 1000 \
  --rate-gold 24 --rate-wood 12 --rate-ore 12 --rate-crystal 3
```

**Toutes les valeurs numériques ci-dessus sont fictives et uniquement
destinées au laboratoire.** Les 900 secondes (15 minutes) correspondent à
une hypothèse P0 à confirmer, pas à un paramétrage historique certifié.

Un opérateur peut ensuite exécuter le traitement :

```bash
python -m mmhk_api.economy_worker --once --max-cities 25 --max-ticks-per-city 96
```

Le traitement s'arrête après un lot borné. Pour des crédits récurrents,
il faut installer **explicitement** une planification de confiance côté
serveur (systemd timer, tâche planifiée ou service worker futur), avec
journalisation et surveillance. Aucune tâche permanente n'est créée par
l'installation du projet.

### Sémantique de la production

- Débits saisis en **unités par jour**, avec décimales et bonus additifs
  appliqués à la base ; les fractions sont conservées en PostgreSQL sous
  `NUMERIC`, à 18 décimales.
- Les crédits n'ont lieu que pour des **périodes entières** configurées.
  Une exécution tardive rattrape les périodes dues, avec limite de sécurité.
- Chaque ville est verrouillée par `FOR UPDATE SKIP LOCKED` et créditée
  dans une transaction autonome. Les échéances, révisions et événements
  d'audit évitent qu'une période soit créditée deux fois.
- En cas de capacité atteinte, le surplus est perdu et non reporté. Les
  ressources ne sont jamais négatives et le stock ne dépasse pas son plafond.
- Les mines initiales sont or, bois, minerai et cristal. Les autres ressources
  peuvent figurer au stock sans cadence de mine initiale.
- L'API ne permet **aucune écriture des ressources** par les joueurs :
  elle lit simplement l'état et affiche le débit du profil expérimental.

Une modification future des cadences/bonus **pendant une production active**
nécessitera une opération métier spécifique (crédit des périodes passées,
nouveau profil horodaté, audit). Pour éviter toute réécriture silencieuse
du passé, la commande initiale actuelle est volontairement à usage unique.

Redis reste disponible localement mais **n'est pas encore un cache des
ressources**. PostgreSQL demeure la seule source de vérité.

### Validation

```bash
MMHK_TEST_DATABASE_URL="$MMHK_DATABASE_URL" python -m pytest -q apps/api/tests
```

Les tests PostgreSQL couvrent fractions persistées, redémarrage, périodes
rattrapées, saturation, accès par compte et deux workers concurrents.
Les tests Jactari indépendants doivent continuer à réussir.

## Première construction urbaine (profils opérateur)

Les constructions urbaines suivent les décisions P0 : **une seule en cours
par cité**, sans héros, sans file ni annulation, et **coût payé au démarrage**.
Les modes rapide/économique utilisent les pourcentages validés (+40/-20 et
-20/+40), avec **arrondi supérieur expérimental** des coûts et durées.

Aucun bâtiment, coût, niveau et délai n'est défini par défaut. L'opérateur
peut créer un profil de laboratoire explicite :

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage create-building-profile \
  --code experimental_hall --level 1 --policy-id LAB-V1 \
  --duration-seconds 120 \
  --cost-gold 10 --cost-wood 5 --cost-ore 1 --cost-crystal 0 \
  --cost-gems 0 --cost-sulfur 0 --cost-mercury 0
```

**Prix/durée fictifs : aucune preuve historique S2.** Avec les stocks à
zéro de la ville initiale, la première commande de construction sera
refusée jusqu'à ce que des ressources soient réellement gagnées ou
approvisionnées via un outillage de développement autorisé.

Dans Next.js, choisissez un devis puis lancez la construction depuis
la ville. Seul le serveur calcule et valide le paiement, la durée et
le niveau. La requête utilise une clé idempotente ; deux appels identiques
ne prélèvent jamais deux fois les ressources.

Un exécuteur ponctuel permet d'achever les ordres échus :

```bash
python -m mmhk_api.construction_worker --once --max-orders 25
```

Les transactions PostgreSQL protègent l'ordre, la fin des chantiers et
l'audit. Aucun service de fond n'est encore installé. La documentation
détaillée est dans
[CONSTRUCTIONS-URBAINES-POSTGRESQL.md](../../docs/specifications/CONSTRUCTIONS-URBAINES-POSTGRESQL.md).

## Prérequis et effets des bâtiments (migration 004)

Les profils de prix et de temps restent séparés des **profils d'effets**
déclarés par un opérateur. L'exemple suivant, entièrement fictif,
accorde +10 % de production de bois et +50 de capacité d'or :

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage create-building-effects \
  --code experimental_hall --level 1 --policy-id LAB-EFFECTS-001 \
  --prerequisites '{}' --mine-bonuses '{"wood":"0.10"}' \
  --capacity-bonuses '{"gold":50}'
```

Les effets sont appliqués à l'achèvement confirmé du chantier, puis
utilisés par l'économie à partir de la prochaine période entière
éligible. Les fractions restent en PostgreSQL, les plafonds de base
ne sont pas réécrits et les effets des niveaux antérieurs ne se
cumulent pas avec ceux de leurs améliorations.

Une suspension **administrative**, sans suppression du bâtiment,
permet de tester les prérequis :

```bash
python -m mmhk_api.manage set-building-operational \
  --city-id UUID_DE_LA_VILLE --code experimental_hall --enabled no
```

Un bâtiment dépendant devient alors inactif et cesse de produire des
bonus. Les détails, limites historiques et tests sont documentés dans
[EFFETS-BATIMENTS-POSTGRESQL.md](../../docs/specifications/EFFETS-BATIMENTS-POSTGRESQL.md).

## Worker supervisé et interface de ville visuelle

Après migration PostgreSQL V005, les workers peuvent être lancés dans un
conteneur Docker explicitement activé, au lieu de déclencher manuellement
les deux exécutables.

```bash
export MMHK_POSTGRES_PASSWORD='votre-secret-local'
python -m mmhk_api.manage migrate
docker compose -f compose.dev.yaml -f compose.workers.yaml \
  --profile workers up -d --build
```

La migration doit se faire sur la base de l'environnement ciblé.
Le superviseur se nomme `mmhk_api.supervised_worker`, inclut une
sonde de santé PostgreSQL et redémarre après erreurs répétées.
Le traitement reste idempotent grâce aux transactions PostgreSQL.
Vous pouvez lancer un seul cycle sans service résident :

```bash
python -m mmhk_api.supervised_worker --once
```

L'interface Next.js dispose maintenant d'une vue de ville DOM/CSS au ratio
historique **680×552**, avec certains marqueurs placés sur les coordonnées
du client Havre archivé. Les images historiques ne sont **pas embarquées**,
faute de droits de redistribution établis. Il s'agit d'un gabarit
schématique et non d'un rendu fidèle achevé.

Lire [la documentation technique](../../docs/specifications/WORKERS-SUPERVISES-VILLE-VISUELLE.md)
pour les garanties, tests, limites de supervision et commandes d'arrêt.

## Navigation privée monde → région → ville

Deux endpoints en lecture seule complètent l'API :

| Méthode | Endpoint | Règle |
| --- | --- | --- |
| GET | `/api/v1/me/worlds/{world_id}/overview` | Monde du compte et ses **propres** villes |
| GET | `/api/v1/me/cities/{city_id}/region` | 25 cases régionales schématiques, centre urbain, types de mines non positionnés et coordonnées toriques voisines |

Depuis `/worlds/{worldId}`, la carte permet d'ouvrir
`/cities/{cityId}/region`, puis `/cities/{cityId}`. La ville
renvoie également vers sa région et vers le monde.

Aucune ville étrangère, donnée de terrain non vérifiée, répartition de mines,
PNJ ou donnée de reconnaissance ne sont exposés. Les tests PostgreSQL
vérifient aussi le cas de **deux comptes membres du même monde**.
Les fonds et cartes sont des SVG/CSS originaux, sans images Ubisoft
servies depuis les archives.

Voir [NAVIGATION-MONDE-REGION-VILLE.md](../../docs/specifications/NAVIGATION-MONDE-REGION-VILLE.md).

## Connexion protégée et preview privé

La migration V006 ajoute des compteurs atomiques de tentatives
d'authentification : 8 par identifiant et 40 par source en 15 minutes,
avec refus `429 Retry-After` et audit HMAC non identifiable en clair.
Une clé secrète `MMHK_LOGIN_RATE_KEY` d'au moins 32 caractères est
désormais **obligatoire** pour l'API de connexion :

```bash
export MMHK_LOGIN_RATE_KEY="$(openssl rand -hex 32)"
python -m mmhk_api.manage migrate
```

Ne pas régénérer cette clé à chaque redémarrage. Les compteurs et le
journal restent stockés dans PostgreSQL, sans rendre Redis autoritatif.
Une purge administrateur est proposée :

```bash
python -m mmhk_api.manage prune-auth-history --retention-days 30
```

Une préproduction accessible exclusivement par tunnel SSH est définie
dans `compose.preview.yaml`, avec API, PostgreSQL et Redis en réseau
interne et **Next.js publié uniquement sur `127.0.0.1`**.
Les images conteneurisées et les ports sont vérifiés dans GitHub Actions.

Voir [le guide d'exploitation de la preview](../../docs/specifications/SECURITE-AUTH-PREPROD-PRIVEE.md).
**Ce code n'a pas été déployé ni rendu public.**

## Limites explicites avant tout déploiement public

- Aucun mécanisme d'inscription publique, réinitialisation de mot de passe,
  contrôle de cadence de connexion au niveau du proxy public ni audit de sécurité
  externe n'est encore en place. Le rate limiting applicatif est partiel.
  **Ne pas exposer cette API à Internet** telle quelle.
- La production expérimentale et la construction urbaine sont intégrées,
  mais aucun recrutement, combat ou effet automatique des bâtiments n'est livré.
- Redis est disponible dans Docker Compose **mais n'est pas utilisé** : ne
  jamais y conserver l'état autoritatif d'une ville.
- Le superviseur Docker est disponible par opt-in, mais aucune supervision
  externe, alerte fiable ou orchestration de combat n'est activée.
- PostgreSQL a été retenu **provisoirement comme base d'implémentation**,
  dans l'attente d'une confirmation explicite du choix définitif.
- Les règles de saison 2 non démontrées restent signalées ; le moteur
  `productionBattleArbiterAllowed=false` demeure verrouillé.
- Aucune ressource graphique originale sous licence Ubisoft n'est diffusée.

Sauvegardes PostgreSQL, migrations contrôlées, secret management, chiffrement
réseau, authentification renforcée, rate limiting, tests de charge et
contrôles d'accès restent indispensables avant publication.
