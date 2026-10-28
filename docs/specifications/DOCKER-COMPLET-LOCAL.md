# MMHK-like — Déploiement Docker Compose complet en local

**28 octobre 2026 — environnement de développement autonome, non public**

Cet environnement fait fonctionner **la nouvelle application**, sans dépendre
du laboratoire historique Jactari pour les requêtes ordinaires :

| Service | Rôle | Écoute sur la machine hôte |
| --- | --- | --- |
| `postgres` | PostgreSQL 17, état métier autoritatif | Non |
| `redis` | Redis 7 disponible pour le futur cache | Non |
| `migrate` | Migration SQL 001…006, job à exécution unique | Non |
| `api` | Python 3.12 / FastAPI, sessions, monde, économie, bâtiments | Non |
| `web` | Next.js 16 / React 19, interface utilisateur | **127.0.0.1:3000 seulement** |
| `worker` | Worker Python supervisé, mines + constructions | Non |

Les services se parlent dans le réseau Docker `backend` marqué
`internal: true`. Aucune API, base de données ou instance Redis
n'est publiée sur le réseau. Le frontend n'expose que le **loopback** ;
l'environnement ne peut pas être rendu accessible à d'autres
ordinateurs sans changer volontairement cette politique.

## 1. Prérequis

- Docker Desktop ou Docker Engine avec le plugin **Docker Compose v2** ;
- Python 3 installé sur la machine hôte (pour le lanceur) ;
- environ 4 Go de RAM disponible pour les builds Next.js et les conteneurs ;
- port TCP **3000** libre sur la machine hôte (modifiable dans `.env.local`).

Aucun Node.js, PostgreSQL, Redis ou environnement virtuel Python
n'a besoin d'être installé **sur la machine hôte** pour utiliser le jeu.

## 2. Démarrage (deux commandes)

Depuis la racine du dépôt :

```bash
python3 tools/local/stack.py up
python3 tools/local/stack.py demo
```

Sous Windows, remplacer `python3` par `py -3` si nécessaire.

La première commande :
1. génère **une seule fois** `.env.local` avec un mot de passe PostgreSQL
   et une clé HMAC aléatoires ; ne les affiche pas ;
2. construit les images API, interface et worker ;
3. démarre PostgreSQL et Redis ;
4. applique automatiquement les migrations 001–006 **avant** FastAPI ;
5. démarre FastAPI puis Next.js ;
6. démarre le worker supervisé et attend que les services soient prêts.

La deuxième commande crée un **unique bac à sable** :
- un utilisateur `joueurdemo` avec **mot de passe aléatoire affiché une
  seule fois** dans le terminal ;
- le monde `local-sandbox` de 100 × 100 régions et une ville
  `Premier Havre` située en (17,23) ;
- les sept réserves et les quatre mines initiales Havre ;
- des cadences de production fictives créditées chaque minute ;
- des profils de construction fictifs : `village_hall` (niveaux 1 et 2),
  `marketplace` et `resource_silo` avec prérequis et effets.

**IMPORTANT : toutes les ressources initiales, rendements, prix, durées,
positions du bac à sable et bonus de ces exemples sont synthétiques.**
Ils servent à tester la boucle complète et ne représentent pas des règles
historiques certifiées MMHK saison 2.

Conserver le mot de passe dans son gestionnaire de mots de passe local.
Aucun mot de passe connu, constant ou public n'est enregistré dans Git.

Ouvrir ensuite **http://localhost:3000**, se connecter et parcourir :

```text
Connexion → Monde local → Carte du monde → Région → Ville
  → Réserves / Mines → Construire → Attendre la fin → Bâtiments / Bonus
```

Le worker traite les échéances sans commande supplémentaire.
Les montants affichés peuvent changer pendant la navigation.

## 3. Commandes d'exploitation

```bash
python3 tools/local/stack.py ps             # État et santé des services
python3 tools/local/stack.py logs           # Derniers logs
python3 tools/local/stack.py logs --follow  # Logs en continu
python3 tools/local/stack.py stop           # Arrête les conteneurs
python3 tools/local/stack.py up             # Reprend avec les mêmes données
python3 tools/local/stack.py down           # Supprime conteneurs, garde la base
python3 tools/local/stack.py backup         # Backup PostgreSQL dans ./backups/
```

L'application est **persistante** : les volumes restent intacts après
`stop`, `down` ou le redémarrage de Docker.

Pour supprimer **toutes** les données de ce seul environnement local :

```bash
python3 tools/local/stack.py reset --yes-delete-local-data
```

Cette dernière commande est irréversible **sans sauvegarde préalable**.
Elle ne supprime pas `.env.local` et ne concerne pas le VPS.

Pour changer le port, arrêter la stack, modifier
`MMHK_LOCAL_PORT=3000` dans `.env.local`, puis relancer `up`.
Le script n'écrase jamais volontairement un fichier de secrets existant.

## 4. Sauvegarde et restauration de validation

`backup` crée un dump PostgreSQL au format personnalisé `pg_dump -Fc`
sous `./backups/`, ignoré par Git et protégé par les droits du système
local. La sauvegarde ne remplace pas un test de restauration.

Exemple pour restaurer **dans une base de test distincte** du jeu :

```bash
# À utiliser uniquement sur la stack locale, après avoir créé un backup.
docker compose --env-file .env.local -f compose.local.yaml exec -T postgres \
  createdb -U mmhk_local mmhk_restore_test

docker compose --env-file .env.local -f compose.local.yaml exec -T postgres \
  pg_restore -U mmhk_local -d mmhk_restore_test \
  --no-owner --no-privileges < backups/NOM-DU-DUMP.dump
```

Ne pas restaurer directement un dump sur la base active `mmhk_local`
sans arrêter API et worker et disposer d'une procédure vérifiée.

## 5. Sécurité et périmètre

Le client conserve le bearer d'API dans un cookie `HttpOnly` /
`SameSite=Lax`. En raison de la **seule** origine locale HTTP,
la configuration autorise le cookie sans `Secure` uniquement quand
`MMHK_PREVIEW_LOOPBACK_ONLY=true`. Cette configuration ne doit
**jamais** être copiée dans une application accessible sur Internet.

La connexion est limitée par compte et par source, le mot de passe
est haché, les tokens sont stockés sous digest et les pages privées
sont renvoyées sans cache. Les secrets du local sont enregistrés dans
`.env.local`, exclu de Git et des images Docker ; sur un poste partagé,
les variables d'environnement des conteneurs restent visibles aux
administrateurs Docker.

Le moteur historique Jactari et les données récupérées du CDN Ubisoft
ne sont pas nécessaires pour servir les écrans du jeu local. Les images
archivées sans licence graphique identifiée ne sont pas recopiées dans
le frontend ; les cartes et la scène de ville restent des rendus
originaux ou schématiques.

**Non disponible dans le bac à sable :** combat PvP public, vrai système
de reconnaissance, placement des mines sur les 25 cases, recrutement,
licence de redistribution des sprites officiels, règles Ubisoft S2
certifiées, inscription publique, authentification multifacteur,
supervision de production et cache Redis métier.

Redis fonctionne comme service, mais n'est **pas** encore branché à
l'économie : seul PostgreSQL fait autorité. Les workers ne résolvent
aucun combat militaire. Ce Compose n'est pas conçu pour une exploitation
publique.

## 6. Validation automatisée

GitHub Actions construit les images, lance les six services dans un
environnement vierge, vérifie l'application et le worker, crée un
bac à sable avec mot de passe aléatoire, ouvre une session FastAPI,
interroge réellement le monde, la ville, les stocks et les constructions,
vérifie la communication de Next.js à FastAPI sur le seul port local,
puis détruit la base jetable du job CI.

Le lanceur et le test d'isolation de réseau sont respectivement :
`tools/local/stack.py` et `tools/ci/check_local_stack.py`.

Cela prouve l'exécution **en local sous Docker**, et ne signifie pas
qu'un conteneur ait été lancé sur le VPS utilisateur.
