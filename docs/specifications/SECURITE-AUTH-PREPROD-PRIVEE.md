# MMHK-like — Connexion renforcée et préproduction privée

**28 octobre 2026 — première préparation d'une préproduction, sans déploiement sur le VPS.**

## 1. Ce qui a changé dans la connexion

Les comptes sont encore **créés exclusivement par l'opérateur**. Il n'existe
toujours aucune inscription publique, récupération de mot de passe ou
authentification multifacteur.

La migration `006_login_limits.sql` crée un compteur de tentatives
**transactionnel PostgreSQL**, partagé entre toutes les instances FastAPI :
- **8 tentatives pour un identifiant sur 15 minutes** ;
- **40 tentatives par adresse source observée par l'API sur 15 minutes** ;
- au-delà de ces seuils, refus HTTP `429` accompagné d'un `Retry-After` ;
- les tentatives échouées sont enregistrées et **committées avant la
  réponse HTTP 401/429**, afin de ne pas être annulées par une exception ;
- une connexion réussie remet à zéro le compteur de cet identifiant,
  mais **pas** le quota partagé de sa source réseau ;
- les compteurs utilisent un digest **HMAC-SHA-256** avec une clé secrète
  `MMHK_LOGIN_RATE_KEY`, au lieu d'archiver les noms de comptes et adresses
  IP en clair ; les événements `accepted/rejected/limited` ne contiennent
  pas le mot de passe ni le token.

**Limites importantes :** un attaquant peut provoquer le blocage temporaire
d'un identifiant (risque de déni de service), et un ensemble d'utilisateurs
derrière un même proxy peut partager le quota source. La couche API
utilise uniquement l'adresse ASGI de son pair, **jamais un header
X-Forwarded-For non vérifié**. Une véritable publication demandera
un mécanisme anti-abus à l'entrée du réseau, un proxy de confiance
configuré explicitement et une supervision des erreurs de connexion.

Une clé secrète d'au moins 32 caractères est obligatoire pour la connexion :
en l'absence de la clé, FastAPI retourne `503 Authentication unavailable`
et **ne crée pas de session**. Les mots de passe restent traités via
`scrypt` avec sels indépendants et les jetons de session opaques sont
stockés sous digest en base ; expiration habituelle après huit heures.

Les endpoints authentifiés et de session portent
`Cache-Control: no-store`. Les réponses ajoutent les en-têtes de
protection basiques `nosniff`, `no-referrer` et `DENY` pour les frames.

Le formulaire Next.js affiche un message générique lors d'une réponse
`429` sans exposer l'état d'un compte.

## 2. Préproduction privée sans port public

La configuration
[`compose.preview.yaml`](../../compose.preview.yaml) est volontairement
**distincte** de `compose.dev.yaml`. Elle déploie :
- PostgreSQL 17 avec volume dédié `preview_pgdata` ;
- Redis 7 sur le réseau interne, **sans cache métier branché** ;
- une API FastAPI accessible seulement aux conteneurs du réseau privé ;
- un frontend Next.js, accessible **uniquement sur
  `127.0.0.1:3001` de la machine hôte** ;
- le worker PostgreSQL via le profil Docker `workers`, non démarré
  implicitement.

Aucun service PostgreSQL, Redis ou FastAPI ne publie de port vers
l'extérieur. Un script CI examine le `docker compose config`
normalisé pour garantir cet invariant et construit les images FastAPI
et Next.js. Une erreur de configuration empêchant l'installation
doit faire échouer la CI.

### Préparation sur un serveur disposant de Docker Compose

L'opérateur **doit choisir l'hébergement**, protéger le compte SSH
et effectuer une sauvegarde/restauration vérifiée avant toute montée de
version. Ne pas toucher à la base des projets déjà en production.

Depuis le dépôt récupéré sur la machine cible :

```bash
# Variables de la session locale de l'administrateur. Jamais dans Git.
export MMHK_PREVIEW_POSTGRES_PASSWORD="$(openssl rand -hex 32)"
export MMHK_LOGIN_RATE_KEY="$(openssl rand -hex 32)"
export MMHK_PREVIEW_PORT=3001

docker compose -f compose.preview.yaml build api web
docker compose -f compose.preview.yaml up -d postgres redis

# Les migrations s'exécutent EXPLICITEMENT avant l'API.
docker compose -f compose.preview.yaml run --rm api \
  python -m mmhk_api.manage migrate

docker compose -f compose.preview.yaml up -d api web
```

**Important :** les deux secrets doivent être conservés dans un
gestionnaire adapté ; ne pas les régénérer à chaque démarrage.
Le mot de passe PostgreSQL correspond à celui utilisé lors de la
création initiale du volume. Modifier la variable sans effectuer
une rotation contrôlée dans PostgreSQL interrompt les connexions.
Changer `MMHK_LOGIN_RATE_KEY` invalide la continuité de l'historique
des tentatives HMAC. Aucune de ces commandes n'a été exécutée sur le VPS.

Créer un compte de démonstration (mot de passe saisi interactivement) :

```bash
docker compose -f compose.preview.yaml run --rm api \
  python -m mmhk_api.manage create-account --username demonstrateur
```

Puis une première cité avec la CLI déjà documentée ; ses ressources
demeurent initialisées à zéro tant qu'aucune règle économique de
laboratoire n'a été configurée. Les coûts/rendements fictifs ne sont
pas des tarifs historiques MMHK S2.

Pour utiliser les workers, **après** migration et configuration
de l'économie :

```bash
docker compose -f compose.preview.yaml --profile workers \
  up -d worker
```

### Accès depuis votre ordinateur via SSH

```bash
ssh -N -L 3001:127.0.0.1:3001 utilisateur@serveur-ssh
```

Ouvrir `http://localhost:3001` dans le navigateur **de cet ordinateur**.
Le navigateur communique avec son propre loopback, puis SSH chiffre
l'accès au serveur distant. Le cookie de ce **seul profil preview**
n'impose pas l'attribut `Secure`, pour fonctionner sous HTTP sur
`localhost` ; il reste `HttpOnly` et `SameSite=Lax`. L'attribut
`Secure` doit redevenir obligatoire avant tout déploiement HTTPS
accessible publiquement.

Ne pas exposer `3001` au pare-feu ni configurer un reverse proxy
public dessus. Le fichier `compose.preview.yaml` ne constitue pas une
certification d'absence de chemins réseau alternatifs : la configuration
de Docker, du VPS et du pare-feu doit être auditée sur le serveur.

### Maintenance et observations

```bash
docker compose -f compose.preview.yaml ps
docker compose -f compose.preview.yaml logs --tail=100 api web
docker compose -f compose.preview.yaml stop web api
```

Nettoyage périodique de l'audit, avec rétention par défaut 30 jours :

```bash
docker compose -f compose.preview.yaml run --rm api \
  python -m mmhk_api.manage prune-auth-history --retention-days 30
```

Le nettoyage est explicitement administratif, **jamais exécuté
implicitement pendant une requête de joueur**.

## 3. Sécurité et exploitation — travaux encore nécessaires

Même accessible uniquement par tunnel SSH, ce système reste **un
prototype**, pas une plateforme certifiée de production.

Avant toute ouverture Internet, prévoir au minimum : déploiement HTTPS
de bout en bout, cookies `Secure`, filtrage réseau et anti-bruteforce
en bordure, politique de proxy de confiance, renouvellement de sessions,
récupération des comptes, sauvegardes/restaurations vérifiées,
gestion des secrets, audit d'accès, surveillance externe des workers,
rotation des dépendances et tests de vulnérabilités.

Le frontend Next.js n'a pas encore de lockfile npm committé :
la compilation de l'image actuelle installe les dépendances à partir du
`package.json` et n'offre donc **pas** une reproductibilité stricte.
Avant un déploiement de production, créer un lockfile vérifié et utiliser
`npm ci` dans la CI et le Dockerfile.

**Aucun port public n'est ouvert par cette tranche, aucun compte n'est
créé sur le VPS et aucune donnée réelle n'est déployée.**

Le moteur Jactari conserve ses preuves différentielles JavaScript.
`productionBattleArbiterAllowed=false` demeure inchangé.
