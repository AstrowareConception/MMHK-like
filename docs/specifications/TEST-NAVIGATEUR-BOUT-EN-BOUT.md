# MMHK-like — Test du parcours utilisateur complet dans Chromium

**28 octobre 2026 — tranche de validation de la stack locale.**

## Pourquoi ajouter un test navigateur ?

La suite historique vérifie le moteur Jactari et les tests PostgreSQL
vérifient les transitions métier. Les tests HTTP du Compose local
certifiaient déjà la présence des six services et la communication
FastAPI ↔ Next.js, mais **ne validaient pas** le clic d'un joueur :
connexion, cookie HttpOnly, Server Actions, liens entre les cartes,
paiement d'une construction et mise à jour de l'interface après un
traitement asynchrone.

La nouvelle suite `tools/e2e/local_browser.py` pilote un vrai
**Chromium headless par Playwright**, contre les services Docker
réels. Elle ne simule pas FastAPI, ne remplace pas le worker et ne
prétend pas reproduire une partie complète de MMHK.

## Parcours de test

1. Ouvrir la page locale, constater la présence du formulaire.
2. Se connecter avec les identifiants **aléatoires** du bac à sable.
3. Vérifier la liste des mondes authentifiée.
4. Ouvrir l'atlas du monde de démonstration.
5. Ouvrir la vue régionale et vérifier la vue schématique 25 cases.
6. Entrer dans `Premier Havre` et vérifier les sept stocks.
7. Vérifier que l'actualisation automatique est annoncée.
8. Démarrer en mode rapide `village_hall` niveau 1 ; le prix et
   le délai sont recalculés dans FastAPI et les stocks payés dans
   PostgreSQL.
9. Vérifier la présence du chantier, avec une seule construction
   active et aucune file.
10. Laisser le **vrai worker PostgreSQL** achever la construction
    (36 secondes pour ce profil **fictif de laboratoire**).
11. **Sans rafraîchir le navigateur manuellement**, constater
    l'apparition du bâtiment achevé et de son bonus de mine.
12. Revenir à la carte et se déconnecter ; l'accès au monde est
    désormais bloqué par l'absence de session.

Le composant `apps/web/components/live-refresh.tsx` appelle
`router.refresh()` toutes les 10 secondes seulement lorsque
l'onglet est visible et que la ville produit ou construit.
Il ne prédit jamais l'état de la ville côté navigateur ; toutes
les valeurs proviennent à nouveau des routes FastAPI authentifiées.

## Exécution dans GitHub Actions

Le workflow `fullstack-foundation.yml` :
- construit le stack Docker local à six services ;
- attend l'état healthy de PostgreSQL, FastAPI, Next.js et du worker ;
- crée un bac à sable avec un compte et un secret aléatoires ;
- réalise le précédent test d'authentification REST ;
- installe Playwright et Chromium ;
- exécute le parcours E2E en **vrai navigateur** ;
- vérifie la sauvegarde PostgreSQL et détruit la base de CI.

Le mot de passe de démonstration n'est ni ajouté au dépôt ni
écrit dans un rapport ; il est transmis comme variable temporaire
au seul processus Playwright du job.

### Exécution manuelle

Le stack doit déjà tourner avec `stack.py up` et `stack.py demo`.
Installer le navigateur dans l'environnement Python local :

```bash
python3 -m pip install playwright==1.56.0
python3 -m playwright install chromium
```

Puis fournir les identifiants du bac à sable par le gestionnaire
de secrets de votre terminal, sans les enregistrer dans le dépôt :

```bash
MMHK_E2E_USERNAME=joueurdemo \
MMHK_E2E_PASSWORD='votre-mot-de-passe-local' \
MMHK_E2E_URL=http://127.0.0.1:3000 \
python3 tools/e2e/local_browser.py
```

**Attention :** le test démarre une vraie construction et modifie
les ressources de la ville. Utiliser une **base jetable** ou un
bac à sable neuf, pas votre partie réelle.

## Limites

Ce scénario valide la chaîne UI/REST/worker, et non les règles
historiques MMHK. Les prix/durées, la taille du monde, les bâtiments
et les bonus du bac à sable sont **expérimentaux**.
Le moteur de combat Jactari, les sièges, le PvP et les cartes
historiques complètes restent hors périmètre.

L'actualisation périodique n'est pas un mécanisme temps réel
push/WebSocket et n'implique pas encore de cache Redis métier.
PostgreSQL reste l'unique source de vérité.
