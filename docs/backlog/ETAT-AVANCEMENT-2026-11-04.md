# État d'avancement et contrôle de cohérence — MMHK-like — 4 novembre 2026

> Audit sur les sources du dépôt, non un certificat de recette. Périmètre S2
> classique / Guerre des Larmes. Source de vérité fonctionnelle :
> `docs/backlog/`, `docs/decisions/DECISIONS-P0-2026-10-23.md`
> et les 300 IDs de `docs/backlog/INDEX-STORIES.md`.

## Méthode et définitions

Le rapprochement couvre **300/300 fiches** : `data/backlog/implementation-review-2026-11-04.csv`.
Il distingue :
- **83 fiches avec un chemin de code candidat à examiner** : présence d'un
  composant ou d'un flux potentiellement pertinent ; il manque encore des
  vérifications de critères, et certaines fonctions ne couvrent qu'une
  partie de l'US.
- **217 fiches non vérifiées individuellement** : il ne s'agit PAS d'une
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

## Complément — US-COM-008 : enchaînement expérimental des pelotons

Le module `pve_stack_sequence.py` orchestre jusqu'à sept pelotons
ordinaires par camp autour du duel élémentaire Jactari. Une
prévisualisation propriétaire, en lecture seule, est désormais
accessible dans la région depuis le héros et ses unités réellement
affectées ; elle ne lance pas de mission et ne modifie pas de stock.

Les critères CA01–CA03 (survivant, dispersion, absence de fatigue
inventée) ont des tests écrits. Les critères CA04–CA05, les règles
complètes de combat et la DoD nécessitent encore une recette.
**US-COM-008 est un candidat partiel, pas une story achevée.**
Voir `docs/backlog/RECETTE-US-COM-008-2026-11-04.md`.

## Complément — US-COM-004 : contre-armes I/R/C (4 novembre 2026)

**US-COM-004 — Appliquer les contre-armes** devient un
`code_candidat_a_recetter`, **non acceptée**.

- Triangle retrouvé dans CODE-01-COMBAT : **I > C, R > I, C > R**,
  avec +50 % exclusivement pour le camp avantagé ; la classe **E**
  n'entre pas dans le triangle.
- Nouvelle règle pure `counter_weapons.py` ; calcul appliqué
  à chaque échange du laboratoire `pve_stack_sequence.py`.
  Les valeurs restent **NULL** pour les types d'armes non qualifiés,
  afin de ne pas inventer des contre-armes à partir de noms d'unités.
- Migrations `095_counter_weapon_classification.sql` et
  `096_weapon_classification_provenance.sql` : classification et
  référence obligatoire de provenance.
- Commandes administrateur `qualify-unit-weapon` et
  `qualify-encounter-weapon` ; aucune mutation joueur.
- Tests unitaires écrits pour CA01, CA02, CA03
  (100 infanterie p100 contre 100 cavalerie p100 → 15 000 / 10 000).
  CA04 et CA05 exigent encore recette serveur et navigateur.
- Fiche source mise à jour, ainsi que
  `RECETTE-US-COM-004-2026-11-04.md` et le registre CSV.

**Blocages :** types d'armes du catalogue à qualifier par source,
talents, fidélité S2, résolution PvE/PvP persistante et DoD.
Le volet US-COM-008 reste partiel mais réutilise désormais ces règles
de contre-armes à chaque échange.

## Complément — US-COM-005 : caractéristiques de héros (4 novembre 2026)

**US-COM-005 — Appliquer les bonus du héros** entre dans les candidats
techniques **non acceptés** : `hero_combat_modifiers.py` applique
le coefficient de 0,5 % par point d'attaque/défense et dissocie le
bonus fixe par unité.

- Migration V097 : profils de héros optionnels qualifiés par provenance.
  Aucune dérivation automatique à partir du niveau ou de l'archétype.
- Commande opérateur `qualify-hero-combat` ; lecture par
  `preview_ordinary_line_sequence` pour les propres héros.
- Attaque du héros appliquée aux échanges PvE de laboratoire ;
  pas de défense de héros fictive aux PNJ.
- Tests écrits : exemple 10 800 (100 unités × p100, 10 points
  d'attaque à +0,5 % chacun, +3 fixe/unité), refus des
  profils incomplets et qualification administrative.
- Les talents conditionnels, les bonus d'artefacts, la magie,
  la fidélité de saison 2 et les cinq CA/DoD restent ouverts.

Le suivi CSV et la fiche source COM-005 sont synchronisés.
Voir `RECETTE-US-COM-005-2026-11-04.md` pour les limitations et la recette.

## Complément — talent conditionnel source-qualifié US-COM-005 (4 novembre)

Nouvelle tranche sans nouvelle US acceptée ni changement du total des
candidats : **78/300 code candidat**, 222 encore non vérifiées,
**0/300 acceptée dans le registre**.

Le laboratoire Jactari reçoit désormais un talent expérimental
conditionné par un **avantage de contre-arme effectif**. Sa valeur
est une hypothèse de test saisie par opérateur, avec provenance ;
aucun nom ou coefficient historique n'est inféré.

- Module `conditional_hero_talents.py` : active le bonus lorsque
  I>C, R>I ou C>R et le neutralise autrement (E, inconnu,
  armes égales, désavantage).
- Migration V098 et `conditional_talent_qualification.py` :
  profil optionnel par héros, autorisé seulement si un profil
  de base V097 est disponible, avec source obligatoire.
- CLI `qualify-counter-talent` : qualification opérateur.
- `pve_stack_sequence.py` : réévaluation de la condition à
  **chaque échange**, bonus additif distinct du contre-armement
  et des caractéristiques de base du héros.
- `region_pve.py` et `region-encounter-panel.tsx` : lecture
  du profil et visibilité de son activation et de sa provenance.
- Tests nouveaux `test_conditional_hero_talents.py`,
  `test_conditional_talent_qualification.py`, compléments
  `test_pve_stack_preview.py`.

US-COM-005-CA02 dispose désormais de **preuves candidates écrites**
pour l'inactivation hors condition, mais ni CA01–05 ni la DoD
ne sont considérés acceptés. Les autres talents, tirs préalables,
magie, pertes durables, XP et libération régionale restent
des dépendances ouvertes de la tranche L1.

## Complément du 5 novembre — US-COM-007 : tirs préalables Jactari

L'examen direct de la fonction `tir_engins_siege` dans l'archive
`data/Jactari/src/scripts/combat.min.js` a permis de préparer un
modèle de pré-tirs respectant l'ordre source : barrage attaquant
et défenseur, balistes des deux camps, bombardement défensif.

- `pve_pre_shots.py` : phase pure déterministe, calcul des effets
  à partir des **effectifs préalables des deux camps**, puis application
  des pertes simulées avant les duels. Le cumul est borné à
  l'effectif initial pour ne pas produire des troupes négatives.
- V099 : profil de barrage/balistes **optionnel** du héros, avec
  provenance opérateur et sans capacité inventée.
- `pre_shot_qualification.py` et `manage qualify-pre-shots` :
  création réservée à l'administrateur.
- `region_pve.py` et `pve_stack_sequence.py` :
  uniquement les pré-tirs autorisés de l'attaquant en PvE
  régional ; le bombardement défensif est modélisé, mais
  non activé contre les PNJ sans héros.
- Next.js : représentation distincte de la phase préalable,
  des échanges ordinaires et des pertes persistantes.
- Tests écrits : `test_pve_pre_shots.py`,
  `test_pre_shot_qualification.py`, compléments
  `test_pve_stack_preview.py`.

**US-COM-007** rejoint les `code_candidat_a_recetter`, sans
validation des cinq CA ni de la DoD. La nouvelle tranche
porte le compteur à **79/300 candidats et 221 non vérifiés**.
Les 300 US restent non acceptées dans cet audit.

Voir `RECETTE-US-COM-007-2026-11-05.md`.
La prochaine priorité n'est pas d'activer la guerre : fermer
les phases d'admission/fuite, comparer le modèle à l'oracle
Jactari et achever une bataille PvE transactionnelle de L1.

## Complément du 5 novembre 2026 — US-COM-011 : fuite PvE

La règle d'admission de CODE-01-COMBAT est maintenant mise en œuvre
par `pve_admission.py` sous forme de **contrôle pur** utilisant
la somme des puissances brutes des pelotons ordinaires :

- `r <= 1/7` (égalité incluse) déclenche une fuite avant combat.
  La comparaison exacte `7 × A <= D` évite une divergence d'arrondi.
- Les bonus du héros, contre-armes et pré-tirs ne participent pas
  au contrôle d'admission.
- `pve_stack_sequence.py` arrête le laboratoire sans événements
  de tir ni duel si le seuil est atteint.
- `pve_missions.py` enregistre un rapport sans résultat de duel
  et conserve le retour différé du héros. Les anciens rapports
  Jactari restent lisibles.
- Types et UI Next.js distinguent la fuite des dispersions et
  des morts définitives.
- Tests écrits : `test_pve_admission.py`,
  `test_pve_mission_flight.py` et scénarios complémentaires dans
  `test_pve_stack_preview.py`. Les cas frontières, l'idempotence
  et le retour sont couverts dans les fixtures, mais **l'exécution
  PostgreSQL et navigateur reste à confirmer**.

US-COM-011 rejoint les code-candidats du suivi :
**80/300 candidats, 220 non vérifiés individuellement,
0/300 acceptée formellement**. Le suivi et les fiches sources
US-COM-002/008/011 ont été actualisés.

Voir `RECETTE-US-COM-011-2026-11-05.md`.
Les effets historiques détaillés d'une fuite, les autres règles
de fin de combat et surtout l'application définitive des pertes
et XP restent à qualifier avant de terminer L1.

## Complément — 5 novembre 2026 — US-COM-010 et US-COM-013

Les branches précises de Jactari ont été examinées dans le corpus archivé :
`data/Jactari/src/scripts/combat.min.js`,
`simulation_combat` et `resultat.faux_nul`.

- **US-COM-010 :** le module `jactari_duel_ending.py`
  distingue l'égalité vraie et les marqueurs techniques de faux nul
  `+1/-1`, sans jet aléatoire. Dans le laboratoire
  multi-pelotons, un peloton à zéro unité active est retiré
  de la ligne, même si Jactari ne le marque pas `disperse`.
  Le marqueur de faux nul reste disponible pour trancher
  un affrontement où les dernières lignes sont épuisées.
- **US-COM-013 :** le rapport garde séparément les unités
  temporairement dispersées, les effectifs encore actifs et
  les morts permanentes **non appliquées**. La fixture
  du backlog 100 I contre 100 C, puissance 100,
  donne 50 I et 100 C dispersés.
- **Dépendances :** US-COM-008 (séquence), US-COM-017 (rapport)
  enrichies, sans attribution de pertes économiques ou de XP.
- Tests écrits : `test_jactari_duel_ending.py` et
  `test_pve_report_interpretation.py`, y compris
  égalité, faux nul, frontière d'une unité et rejeu.

Le registre compte désormais **82/300 fiches avec code candidat**,
**218 non examinées individuellement**, **0 acceptation formelle**.

Les recettes [US-COM-010](RECETTE-US-COM-010-2026-11-05.md)
et [US-COM-013](RECETTE-US-COM-013-2026-11-05.md)
précisent les cinq CA et les limites historiques.
Les interactions complexes (magie, résurrections, faux nuls
avec plusieurs pelotons) nécessitent encore des fixtures
Jactari et une validation complète, avant toute
résolution persistante de L1.

## Complément du 5 novembre — US-COM-009, victoire écrasante

Le calcul Jactari de l'écrasement est intégré au laboratoire :
`delta=floor(total_gagnant)-floor(total_perdant)`, condition
`delta > base_gagnant` strictement. Le marqueur `-1` est
interprété comme une victoire écrasante sans perte théorique
pour le gagnant, jamais comme une quantité de soldats.

Module `jactari_overwhelming.py` et tests
`test_jactari_overwhelming.py` ajoutés ; le détail est présent
dans chaque événement de `pve_stack_sequence.py`, dans
les rapports possédant les puissances de base et dans la
simulation régionale.

La story source et
`RECETTE-US-COM-009-2026-11-05.md` sont mises à jour.
**US-COM-009 reste non acceptée** : les CA et la DoD
nécessitent encore l'exécution de la recette.

Le suivi contient maintenant **83/300 candidats**,
**217 US à examiner individuellement** et aucune
US acceptée formellement.
