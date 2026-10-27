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

## Limites explicites avant tout déploiement public

- Aucun mécanisme d'inscription publique, réinitialisation de mot de passe,
  limitation de fréquence des logins ni audit d'authentification n'est encore
  en place. **Ne pas exposer cette API à Internet** telle quelle.
- L'interface montre des réserves persistées, mais aucun véritable système
  de production, construction, recrutement ni combat.
- Redis est disponible dans Docker Compose **mais n'est pas utilisé** : ne
  jamais y conserver l'état autoritatif d'une ville.
- Aucun worker opérationnel n'est démarré. L'orchestration des échéances
  doit être portée du laboratoire JS vers Python/PostgreSQL en conservant
  ses contrôles de concurrence et les tests différentiels.
- PostgreSQL a été retenu **provisoirement comme base d'implémentation**,
  dans l'attente d'une confirmation explicite du choix définitif.
- Les règles de saison 2 non démontrées restent signalées ; le moteur
  `productionBattleArbiterAllowed=false` demeure verrouillé.
- Aucune ressource graphique originale sous licence Ubisoft n'est diffusée.

Sauvegardes PostgreSQL, migrations contrôlées, secret management, chiffrement
réseau, authentification renforcée, rate limiting, tests de charge et
contrôles d'accès restent indispensables avant publication.
