# État d'avancement et contrôle de cohérence — MMHK-like — 4 novembre 2026

> Audit sur les sources du dépôt, non un certificat de recette. Périmètre S2
> classique / Guerre des Larmes. Source de vérité fonctionnelle :
> `docs/backlog/`, `docs/decisions/DECISIONS-P0-2026-10-23.md`
> et les 300 IDs de `docs/backlog/INDEX-STORIES.md`.

## Méthode et définitions

Le rapprochement couvre **300/300 fiches** : `data/backlog/implementation-review-2026-11-04.csv`.
Il distingue :
- **75 fiches avec un chemin de code candidat à examiner** : présence d'un
  composant ou d'un flux potentiellement pertinent ; il manque encore des
  vérifications de critères, et certaines fonctions ne couvrent qu'une
  partie de l'US.
- **225 fiches non vérifiées individuellement** : il ne s'agit PAS d'une
  affirmation que leur code n'existe pas.
- **0 fiche déclarée acceptée dans cet audit** : l'équipe produit n'a pas
  consigné cinq résultats CA et DoD pour chaque fiche ; le taux d'acceptation
  est donc **non mesurable**, et non un pourcentage réel d'achèvement logiciel.

Aucun état officiel des fiches n'est modifié automatiquement. Les priorités
du backlog restent P0=172, P1=112, P2=16. Le CSV est un inventaire
de vérification, pas un second backlog qui remplacerait les fiches sources.

## Contrôle global des 23 domaines

| Domaine | US | Code ou boucle repérée | Écart de portée ou recette |
|---|---:|---|---|
| ACC — Accueil/early | 12 | Portail, authentification et cités | Inscription, faction, quêtes et dotation initiale non certifiées |
| CIT — Ville | 16 | Construction, effets et scène de ville | Recette complète des prérequis, niveaux, sièges et délais |
| ECO — Économie | 12 | Stocks locaux, worker, bonus et capacités | Entretien militaire, revenus et sanctions encore à vérifier |
| ECH — Échanges | 18 | Marchand, offres, caravanes et programmes | Charges, enchères, concurrences et cas limites non tous recettés |
| REG — Carte région | 12 | Grille 5×5, gisements, rencontres PvE | Libération réelle de mines et chantiers régionaux non prouvés |
| REL — Sites | 10 | Visibilité de sites et marqueurs | Enigmes, artefacts, reliques, exploration complète manquants |
| HER — Héros | 18 | Roster, taverne, équipement et formation | Carrières, progression et maximum campagne à qualifier |
| MAG — Magie | 12 | Hors premier périmètre Havre T1–T3 | Aucun système complet déclaré |
| ARM — Armées | 16 | Recrutement, affectation et formations | Maintenance, tiers, amélioration et blessures à recetter |
| ART — Artefacts | 14 | Inventaire et équipement | Acquisition, effets combat et transfert/capture non complets |
| COM — Combat | 18 | Jactari référence, duel PvE de laboratoire | Pertes permanentes, XP, combat PvP et fidélité non acceptés |
| MON — Monde | 10 | Atlas, zoom, coordonnées, colonisation, découvertes | Repères, missions et règles d'influence à recetter |
| MOV — Déplacements | 12 | Missions PvE et distances | Trêve 23h–6h, haltes, renforts et trajet PvP manquants |
| ESP — Renseignement | 10 | Contrôle de visibilité et inspection | Espionnage, capture et rapports absents du parcours complet |
| PVP — Pillage | 10 | Préparation militaire informative uniquement | Aucune attaque/pillage transactionnel actif |
| SIE — Sièges | 14 | Aucun siège exploitable identifié | Blocus, bombardement, conquête et exemptions manquants |
| ALL — Alliances | 14 | À rechercher dans le code et les tests | Rôles, recrutement et compétences non recettés |
| DIP — Diplomatie | 8 | À rechercher dans le code et les tests | Traités, passages et hostilité manquants |
| CLA — Classements | 12 | À rechercher dans le code et les tests | Progression et résultats non acceptés |
| LAR — Guerre des Larmes | 24 | Recherche et backlog détaillés | Trois voies et 13 monuments / 14 jours non jouables |
| FIN — Clôture | 12 | Spécification existante | Résultat unique, gel et hérédité non opérationnels |
| RAP — Rapports | 10 | Timeline et rapport PvE expérimental | Gain, combat complet, courrier et récompenses à recetter |
| UIX — Navigation | 6 | Shell, mondes, régions, cités, UI personnalisée | Tests responsive/accessibilité et parcours réel à exécuter |

La colonne « code repéré » n'établit PAS la conformité aux cinq critères.

## État des livraisons selon la story map

- **L0 — Profil** : décisions P0 documentées mais plusieurs calculs
  historiques et fixtures restent non certifiés ; ne pas déclarer GO.
- **L1 — Boucle locale jouable** : portail, économie, construction, recrutement
  et PvE expérimental sont présents ; l'acceptation demande encore pertes,
  XP, récompenses, rapports complets, idempotence et navigateur.
- **L2 — Monde partagé** : explorations, économie multi-cités, colonisation
  et caravanes partiellement présentes ; voyages militaires, trêves,
  visibilité et interactions entre deux comptes à fermer.
- **L3 — Guerre territoriale** : non livrable. La préparation militaire ne
  crée aucun ordre ; alliances, pillage et sièges incomplets.
- **L4 — Larmes** et **L5 — Clôture** : non livrables.

## Écarts bloquants à traiter, par priorité

### P0 — Violation constatée des décisions de génération

- **Q11–Q15 / US-MON-006/007 / US-REG-001** :
  `regional-composition-v1` imposait or et bois à toute région, ce qui
  contredit « aucune ressource obligatoire hors ville initiale ».
- Correctif versionné : `regional-composition-v2` sélectionne 3 ou
  4 ressources distinctes parmi les 7 sans ressource obligatoire ;
  éventuellement une seule paire, jamais triple/deux paires.
  Les rares sont symétriques par construction ; fréquence d'une paire
  **12,5 % expérimentale**.
- Migration V094 ajoute la nouvelle version autorisée, sans changer les
  lignes V1 déjà persistées. Les anciennes régions doivent être auditées
  puis arbitrées séparément, jamais réécrites silencieusement.
- La **première cité Havre** conserve or, bois, minerai, cristal.

### P0 — Parcours PvE L1 non terminé

- **US-REG-003/004, US-COM-002/014/016/017, US-RAP-001** :
  la mission PvE de laboratoire retourne un rapport de duel, mais la
  documentation du module indique que les pertes définitives, la
  libération des mines et les récompenses/XP ne sont pas appliquées.
  Ne pas convertir ce laboratoire en story « terminée ».

### P0 — Protection et PvP

- **Q23–Q26 / US-PVP-001/004/010, US-SIE-001/012** :
  protection du débutant et dernier château non capturable sont des
  invariants à vérifier lors d'une vraie commande serveur ; aujourd'hui
  l'API militaire est en lecture seule et renvoie les commandes désactivées.
- Le joueur ne doit pas pouvoir déclencher l'attaque en activant le
  bouton uniquement côté navigateur.

### P0 — Temps et mouvement

- **US-MOV-001/003/004/005** : distance torique disponible, mais absence
  de vrai devis d'armée intégrant trêve 23h–6h, haltes de 2h,
  vitesse et changements d'influence ; aucune ETA historique inventée.

### P1 — Système territorial

- **US-MON-001/003/004/005/006/007, US-UIX-002/003** :
  une nouvelle géométrie monde/région et un registre de gisements existent.
  Faire exécuter le parcours navigateur, les droits concurrents et la
  cohérence des quatre ressources / mines / visibilité.

### P1 — Héros et limites

- **Q56 / US-HER-*** : décision de 15 héros maximum par campagne ;
  `hero_capacity=3` est actuellement renvoyé par `city_forces` pour
  le laboratoire. Vérifier son sens exact et l'existence d'un plafond
  global avant de déclarer les stories de recrutement complètes.

## Séquence d'exécution recommandée

1. **GO/NO-GO des migrations V090–V094**, sur une base de test sauvegardée.
   Audit `python -m mmhk_api.manage audit-world-regions --world-id local-sandbox`.
2. Corriger les anomalies de sauvegarde et compléter les tests de confidentialité.
3. **Terminer L1 par un scénario de jeu PvE complet** et enregistrer la
   preuve de chaque critère, en commençant par PAR-01.
4. Fermer L2 : déplacements/timing, reconnaissance et interaction de deux
   royaumes ; ne commencer le pillage qu'après ces gardes-fous.
5. Implémenter L3 puis L4/L5 selon les dépendances de la story map.

## Règles de mise à jour du suivi

Avant de déclarer une US acceptée, fournir : référence du commit, données
de test, profil de règles, 5 résultats CA, tests exécutés, capture ou rapport
du parcours, DoD 01–10 et accord de recette. Une US ne doit jamais passer
à « terminée » simplement parce qu'un composant ou une route existe.

## Tests prioritaires

```bash
python -m mmhk_api.manage migrate
pytest -q apps/api/tests/test_world_region_generation.py
pytest -q apps/api/tests/test_world_region_deposits.py
pytest -q apps/api/tests/test_region_resource_consistency.py
pytest -q apps/api/tests/test_military_readiness.py
pytest -q apps/api/tests/test_region_integrity.py
```

L'audit a été réalisé par inspection de fichiers accessibles via GitHub.
Il n'est pas une exécution de la suite Docker, des migrations PostgreSQL,
de Playwright ou des 1 500 critères d'acceptation.

## Complément de suivi — tranche PvE COM-017 (4 novembre 2026)

**US-COM-017 — Lire les étapes d'une bataille** : un nouveau candidat
technique affine la restitution des rapports mono-peloton :
`pve_report_interpretation.py` interprète le verdict du duel Jactari,
la dispersion, les pertes **théoriques** et la sentinelle `-1`
(« victoire écrasante », jamais une perte négative). Le worker joint
l'interprétation au rapport de mission enregistré à l'arrivée.
L'interface de rapport affiche l'interprétation lorsqu'elle existe ;
les anciens rapports sans ce champ restent consultables.

Le rapport distingue formellement le résultat simulé des **effets métier
non appliqués** : pas de mort définitive, de gain XP, de butin, ni de
libération de mine. Les tests ciblés
`apps/api/tests/test_pve_report_interpretation.py` ont été ajoutés,
mais **ni recette CA01–CA05, ni DoD, ni validation PostgreSQL/E2E
n'ont encore été enregistrées**.

**US-COM-014, US-COM-016, US-REG-003, US-REG-004** restent bloquées
par la définition complète des pertes et des récompenses, et par
la résolution réelle des rencontres. Ne pas marquer ces US comme
terminées au seul motif que le rapport est plus lisible.

## Complément du 4 novembre — tranche US-COM-014 (calcul vérifiable)

Un calculateur **pur, limité aux unités ordinaires avec héros** est maintenant
ajouté : `apps/api/src/mmhk_api/pve_casualties.py`.

- Base Jactari `0,30`, minimum d'un mort uniquement pour un résultat
  strictement positif inférieur à un et aucune perte minimale si dispersion 0.
- Cas contrôlés US-COM-014-CA03 : 50 dispersés → 15 morts, 100 → 30.
- Toute branche PNJ, sans héros ou unité non ordinaire est refusée par
  `UnsupportedCasualtyProfile` ; les facteurs modifiés nécessitent une
  qualification explicite.
- Le calcul est **non mutatif**. Il n'applique aucune perte, ne libère
  aucun gisement et n'attribue aucun XP ni butin.
- Les nouveaux rapports de laboratoire incluent une projection **attacker
  only**, explicitement étiquetée, distincte des pertes persistantes.

Le statut de **US-COM-014** passe seulement à
`code_candidat_a_recetter` dans l'inventaire du backlog. Il reste
**non accepté** jusqu'à la couverture des branches spéciales,
l'intégration transactionnelle et la preuve des cinq critères d'acceptation.

Tests ajoutés : `apps/api/tests/test_pve_casualties.py` et
compléments de `test_pve_report_interpretation.py`.
