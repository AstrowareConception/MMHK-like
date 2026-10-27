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
