# Tester MMHK en local — jeu, interface et sécurité

Ce guide distingue volontairement **votre partie persistante** et **un laboratoire QA jetable**. Les tests de sécurité provoquent des déconnexions, arrêtent FastAPI et utilisent plusieurs comptes : **ne les exécutez pas sur votre partie habituelle**.

## 1. Jouer et explorer sur Windows

Prérequis : Git, Python 3.10+, Node.js 22+ (pour préparer les illustrations historiques locales), Docker Desktop démarré et environ 4 Go de RAM disponibles.

Dans PowerShell, depuis le dossier du dépôt :

```powershell
git clone https://github.com/AstrowareConception/MMHK-like.git
cd MMHK-like
.\demarrer.bat
```

Le navigateur ouvre **http://localhost:3000**. Utilisez `joueurdemo` et le mot de passe affiché au premier démarrage. Notez ce mot de passe : il n'est pas réaffiché ensuite. La base `mmhk-local` conserve vos cités, unités, constructions et inventaires.

Pour arrêter le jeu sans perte :

```powershell
py -3 tools/local/stack.py stop
```

Pour vérifier les conteneurs : `py -3 tools/local/stack.py ps`. Pour une sauvegarde : `py -3 tools/local/stack.py backup`. **Ne lancez pas `reset --yes-delete-local-data` pour un simple redémarrage.**

## 2. Faire passer les tests automatiquement, sans toucher à votre partie

Lancez `tester.bat` dans le dépôt, ou en PowerShell :

```powershell
.\tester.bat
```

Sur macOS/Linux : `sh tester.sh`.

Le lanceur construit un **nouveau projet Docker `mmhk-qa-XXXXXXXX`** avec un port localhost distinct et une base PostgreSQL séparée, crée un compte de test à mot de passe aléatoire, installe Playwright 1.56 dans `.qa-local/venv`, vérifie ses navigateurs et exécute :

- affichage monde, cité, région et héros ; adaptation mobile, tableaux et fenêtres, clavier, focus et protections d'accès ;
- déconnexion quand FastAPI est arrêté : le cookie disparaît, mais l'écran avertit que la révocation serveur n'a pas été confirmée ;
- deux sessions simultanées, expiration d'un seul jeton, maintien de l'autre, révocation à la déconnexion, refus des actions avec l'ancien jeton ;
- deux scénarios de panne API réellement provoquée et réparée ;
- interactions d'artefacts et isolation de deux joueurs dans un même monde, avec 42 essais d'écriture, contrôles des UUID, des deux cités et des 18 journaux PostgreSQL.

Les **rapports** sont enregistrés sous `.qa-local/reports/`. Les captures des navigateurs sont dans `test-output/visuals/`. Le projet QA et son volume PostgreSQL sont supprimés à la fin, **que la recette réussisse ou échoue**. Votre `.env.local`, votre projet `mmhk-local` et votre partie ne sont jamais utilisés par ce lanceur.

### Recette longue du jeu

Pour ajouter Firefox/WebKit, la construction, les missions, les caravanes, la colonisation, la domination et la qualification terrain :

```powershell
.\tester.bat full
```

Le mode long reste expérimental et utilise des fixtures fictives. La recherche historique sous ressources graphiques privées n'est **pas** reproduite par ce lanceur public-safe.

### Garder le monde QA pour explorer

```powershell
.\tester.bat quick --keep
```

Après les tests, le lanceur affiche l'adresse et les identifiants éphémères. `--keep` empêche **volontairement** le nettoyage du projet QA ; utilisez la commande `docker compose ... down -v` affichée pour supprimer **ce projet uniquement**. Sans `--keep`, tout est nettoyé automatiquement.

## 3. Reconnaître les comportements de session

Avec FastAPI disponible, la déconnexion confirme la révocation. Lors d'une panne serveur, le navigateur peut supprimer son cookie, mais **la session distante peut rester valide** jusqu'à expiration (8 heures maximum selon sa création). L'application le dit maintenant explicitement. Cette distinction est une transparence UX, **pas** une garantie de révocation hors ligne.

Pour tester ce cas sans risque, utilisez le lanceur QA, qui arrête et restaure FastAPI sur son projet isolé et révoque à la fin le jeton de test encore valide.

## 4. Résoudre les problèmes courants

Si Docker n'est pas joignable, ouvrez Docker Desktop et vérifiez `docker info`. Si Playwright échoue sous Linux, installez ses dépendances système avant de réessayer (voir la documentation officielle Playwright). Si le port 3000 est occupé, modifiez `MMHK_LOCAL_PORT` dans `.env.local` lorsque la stack persistante est arrêtée. Le bac QA prend automatiquement un autre port libre.

Les recettes locales ne constituent pas une preuve de sécurité de production ni un test sur Safari iOS réel. Aucune connexion à Vercel ni au VPS n'est nécessaire.
