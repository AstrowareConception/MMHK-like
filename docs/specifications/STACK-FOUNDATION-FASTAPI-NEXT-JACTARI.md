# Fondation de stack — FastAPI + Next.js + Jactari

**27 octobre 2026 — première tranche technique, aucun gameplay livré ni backend de production.**

## 1. Ce qui existe réellement dans le dépôt

Cette tranche ouvre un **premier chemin HTTP et navigateur** conformément
à [ADR-001](../decisions/ADR-001-STACK-CIBLE-PROPOSITION.md) :
- `apps/api` : FastAPI Python 3.12, schémas de réponse Pydantic et deux routes
  **publiques strictement informatives** ;
- `apps/web` : Next.js 16 / React 19 / TypeScript, rendu par App Router,
  page de diagnostic qui interroge l'API **depuis le serveur Next.js** ;
- `apps/api/src/jactari/duel.py` : début de portage **Python** d'un duel
  d'une seule pile ; aucune bataille militaire complète ;
- `tools/jactari-port/python-duel-oracle.mjs` : pont **uniquement de tests**
  vers le module JavaScript original `core.mjs` ;
- `apps/api/tests` : test REST, absence d'endpoint de combat, comparateur
  403 cas déterministes contre le port JavaScript existant ;
- `.github/workflows/fullstack-foundation.yml` : deux jobs CI, API/oracle
  Python+Node et build TypeScript/Next.js.

**Le laboratoire `tools/jactari-port` n'a pas été remplacé.**
Les tests historiques Node continuent dans leur propre workflow.

## 2. Exécution locale

À la racine du dépôt, avec Python 3.12+, Node.js 22+ et npm :

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install -e './apps/api[dev]'
uvicorn mmhk_api.main:app --host 127.0.0.1 --port 8000 --reload
```

Sur Windows PowerShell : `\.venv\Scripts\Activate.ps1` au lieu de
`source .venv/bin/activate`.

Dans un deuxième terminal :

```bash
cd apps/web
npm install
npm run dev
```

Aller sur `http://localhost:3000`. La page tente un appel interne à
`http://127.0.0.1:8000/api/v1/health`, avec délai borné et gestion de
l'indisponibilité de l'API.

Le serveur Next.js peut cibler une autre URL **interne** :

```bash
MMHK_API_INTERNAL_URL=http://127.0.0.1:8000 npm run dev
```

L'API n'active pas CORS côté navigateur car le client récupère son état
via un composant serveur. Le site et les endpoints ne comportent **aucun
compte, cookie de session ou commande militaire** à ce stade.

Tests :

```bash
python -m pytest -q apps/api/tests
node --test tools/jactari-port/*.test.mjs
cd apps/web && npm run build && npm run typecheck
```

Pour le premier clone, `npm install` génère `package-lock.json`.
**Il devra être versionné** avant toute chaîne de build/déploiement
reproductible ; la CI initiale installe des versions de dépendances directes
fixées mais n'est pas encore un pipeline de publication.

## 3. Contrat REST initial

| Méthode | Chemin | Réponse |
| --- | --- | --- |
| GET | `/api/v1/health` | `{ "status":"ok", "service":"mmhk-api" }` |
| GET | `/api/v1/jactari/status` | Nom Jactari, scope Python expérimental, oracle JS conservé, certification S2 négative |

Aucune route `/battles` ni `/jactari/duel` ne peut exécuter
un calcul de combat sous HTTP. Les actions militaires nécessiteront
d'abord un modèle d'authentification et d'autorisation réel.

## 4. Ce que garantit le portage Python actuel

Le noyau Python reproduit les opérations et **les `floor` imbriqués**
de `resolveStackDuel` (un peloton par camp) :
- puissance de base, bonus, puissance totale ;
- détermination du vainqueur et des pertes de peloton ;
- valeurs sentinelles `-1` du calculateur Jactari ;
- dispersion, égalité et faux égalité selon le sous-ensemble.

Le banc Python génère 403 scénarios avec une graine fixe et lance le module
JavaScript **source de comparaison** via `node`. Il confronte la forme
complète du résultat, les booléens, les pertes exactes et les valeurs
numériques avec tolérance de représentation flottante bornée.

Cela ne prouve **pas** la conformité de tous les affrontements Jactari,
ni des sorts, résurrections, pertes persistantes, siége, captures,
attaques concurrentes ou règles Ubisoft saison 2. Le moteur complet reste
historique JavaScript et son propre banc différentiel continue d'exister.

## 5. Décisions restant ouvertes

- PostgreSQL comme stockage métier (recommandé, non encore explicitement
  confirmé), schéma d'authentification et migrations ;
- workers Python, choix d'outil (SQL transactionnel ou broker Redis) ;
- Redis comme cache (choix validé), stratégie d'invalidation ;
- identité visuelle et rendu fidèle des scènes (DOM/CSS ou Canvas) ;
- raccordement de Jactari à FastAPI **après** modèle de permissions et
  contrôle des conséquences serveur.

Le nom du moteur est **Jactari**, graphie respectée.

## 6. Sécurité et provenance

La version Python reprend une fonction dérivée GPL-3.0-or-later ; le fichier
contient sa licence et sa provenance. Avant distribution du serveur,
revoir les obligations applicables aux adaptations de Jactari et les
droits sur les ressources graphiques du jeu original.

**`productionBattleArbiterAllowed=false` : inchangé.**
