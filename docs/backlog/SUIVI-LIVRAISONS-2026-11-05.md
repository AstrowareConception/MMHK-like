# Suivi vérifié des livraisons techniques — 5 novembre 2026

## Règles de comptage

- **300 US** au référentiel source, **1 500 critères d'acceptation** et une DoD classique séparée.
- **0 US techniquement terminées dans le profil LAB**, avec cas nominaux, refus, reprise et vérifications de propriétaire au niveau du prototype.
- **0 US partiellement livrées et testées en LAB**, insuffisantes pour clore leur périmètre historique.
- **300 US non réévaluées individuellement dans cette campagne** : leur état n'est pas présumé absent ou inachevé ; voir l'audit initial du 4 novembre.
- **0 US historiquement acceptée** : il manque notamment les arbitrages S2, les oracles, la conversation d'acceptation et la revue produit ; aucune case de DoD n'est cochée par la seule réussite des tests.

La mention « terminée » ci-dessous est toujours **limitée au profil expérimental LAB** et n'est jamais synonyme de « Done » pour le jeu classique avec Guerre des Larmes. Les fiches sources conservent donc `status=a_affiner`, `ready=false` et `checksComplete=false`. Un bloc `implementationLab` est désormais associé aux US revues dans `data/backlog/user-stories.json`, sans altérer les CA historiques.

## US techniquement terminées en laboratoire

| US | Besoin | Preuves de livraison | Points à qualifier pour la clôture classique |
|---|---|---|---|


## US partiellement livrées et testées

| US | Besoin | Preuves de livraison | Points bloquants |
|---|---|---|---|


## Contrôles exécutés

- V100–V104 : PR #71 à #76 fusionnées sur `main`.
- [CI V104, branche](https://github.com/AstrowareConception/MMHK-like/actions/runs/42065196819) : 65 tests ciblés, 468 tests Python, PostgreSQL, Next.js/TypeScript, 300/300.
- [CI V104, post-fusion](https://github.com/AstrowareConception/MMHK-like/actions/runs/42065652207) : 4/4 jobs réussis, pile Docker/Chromium comprise.
- Contrats d'accès : lecture et activation des mines limitées au propriétaire ; capture et règlement PvE encapsulés dans des transactions.
- Paramètres encore expérimentaux : politique de trajet, puissance du PNJ, mines de ville initiales, vitesses, bonus et tarifs non homologués S2.

Ce document complète le [registre du 4 novembre](../../data/backlog/implementation-review-2026-11-04.csv), qui reste une **photographie historique** et n'est pas réécrit. Le nouveau [registre vivant](../../data/backlog/implementation-progress-2026-11-05.csv) porte les 300 identifiants.
