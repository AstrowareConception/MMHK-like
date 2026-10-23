# Proposition d'affinage des US du premier parcours jouable (PAR-01)

**Version : 0.1, 23 octobre 2026 · NE MODIFIE PAS le backlog source.** L'objectif n'est pas de remplacer les 300 stories existantes, mais de préparer une séance d'affinage avec décisions, exemples et critères précis. Les fiches concernées demeurent **à affiner**, **non estimées**, **non implémentées** jusqu'à validation explicite.

Les identifiants ci-dessous existent déjà dans le [backlog](../backlog/README.md). Les liens RM pointent vers les enregistrements de [règles](../../data/rules/early-game.rules.json), et les identifiants FX vers les [fixtures](../../data/rules/early-game.fixtures.json). Les valeurs de 2013 sont des références candidates de saison ; les nombres fictifs des tests ne sont pas les prix ou taux universels MMHK.

## US-ACC-003 — Créer mon royaume

**Card conservée :** nouveau joueur → rejoindre un monde avec sa faction pour commencer une campagne persistante.

**Conversation à conclure :** inscription unique par monde, faction autorisée, fermeture des inscriptions, attribution atomique, clé ami avec \`worldId\`, spawn \`random\` ou \`near\`, saturation, serveur concurrent ; portée du starter pack et disponibilité de \`near\`. Les contraintes de géographie et le rayon de proximité sont **U17/U47**, le starter pack **U01/U16/U24**.

**Confirmation proposée :**
- CA-01 : un nouveau joueur rejoint un monde ouvert, obtient une région légale et une seule cité, avec un starter pack explicitement versionné.
- CA-02 : réessayer la même inscription après perte de réponse renvoie la même cité sans nouveau crédit.
- CA-03 : deux joueurs concurrentiels ne peuvent pas recevoir la même région.
- CA-04 : une clé ami étrangère au monde échoue sans exposer les coordonnées de l'invitant.
- CA-05 : \`near\` indisponible ou zone saturée applique une règle de refus/fallback explicitement choisie ; le rayon reste ouvert.

**Découpage INVEST proposé :** (A) inscription aléatoire et unicité, (B) code ami et implantation proche, (C) politique de saturation et fermetures. Ne créer des IDs filles que si les bénéfices et livraisons sont indépendants. **RM-WRD-002/004/005/007 · FX-START-001/002.**

## US-ACC-011 — Connaître ma protection initiale

**Card conservée :** joueur → consulter les limites de sa protection pour planifier son entrée en guerre.

**Conversation :** visualisation ≠ application métier. Décider durée, périmètre (première cité / royaume), sortie anticipée et effets sur espionnage/pillage/siège. Les sources historiques évoquent **7 jours dans le souvenir du projet** mais **14–15 jours dans d'autres témoignages** ; conserver la divergence **U20**.

**Confirmation proposée :**
- CA-01 : l'UI indique une date d'expiration provenant du serveur et les actions explicitement protégées.
- CA-02 : un ordre hostile interdit est refusé par le moteur, pas seulement par l'interface.
- CA-03 : vérification aux instants \`end_at − 1 seconde\` et \`end_at\`, selon la convention d'intervalle du profil.
- CA-04 : reconnexion et changement d'heure locale ne réinitialisent pas les sept/quatorze/quinze jours éventuels.

**Attention :** FX-PROTECT-001 illustre une **politique de laboratoire de 7 jours et fin exclusive**, sans démonstration de fidélité. **RM-WRD-006 · U20.**

## US-REG-001 — Inspecter une région / US-ACC-004 — Retrouver ma cité initiale

**Conversation :** la région ordinaire est un **5×5**, ville au centre, **quatre mines dans la région**, et non quatre ressources sur chaque case. Types répétés admis dans le modèle ; pondérations et fréquences inconnues. Les cases portent un occupant/état et les sites spéciaux suivent une autre génération.

**Confirmation proposée :**
- CA-01 : afficher 25 positions et une seule ville au centre d'une région ordinaire.
- CA-02 : quatre cases minières distinctes, y compris une fixture avec **deux mines de bois**.
- CA-03 : générer deux fois la même région avec la même graine/version donne la même configuration non occupée.
- CA-04 : aucune inspection ne révèle des informations secrètes non obtenues par le joueur ; aucune action de consultation ne modifie la carte.

**Non décidé :** types de PNJ, poids des ressources, starter, équilibrage spatial, sites spéciaux. **RM-REG-001…006 · FX-REG-001 · U17.**

## US-ECO-003 — Produire hors connexion / US-ECO-004 — Atteindre le plafond

**Card conservée :** retrouver les ressources réellement produites pendant une absence ; comprendre quand le stockage bloque la progression.

**Conversation :** intervalle et cadence du crédit, conservation des fractions, coupure aux bonus, ordres de calcul et différences de nature des crédits. **U03/U04/U30**.

**Confirmation proposée :**
- CA-01 : fixture **fictive** de 24 bois/jour sur 12 h → 12 bois crédités ; seconde reconnexion → aucun crédit de plus.
- CA-02 : changement fictif à 6 h de 24 à 48 bois/jour → 6 + 12 = 18, sans rétroactivité.
- CA-03 : 19 bois + 6 produits avec plafond fictif 20 → politique de débordement choisie et justifiée par profil (FX-ECON-004 suppose perte du surplus à titre de test).
- CA-04 : soldes physique, réservé, en transit et disponible restent non négatifs et distingués.

**Découpage INVEST :** production/temps, arrondis, stockage/débordement et reprise sont des comportements distincts mais doivent partager un oracle de conservation. **RM-ECO-001…006 · RM-TIM-001/002/004 · FX-ECON-001…004.**

## US-CIT-004 — Lancer un chantier

**Card conservée :** propriétaire de cité → construire un bâtiment autorisé pour débloquer une capacité.

**Conversation :** coût/prérequis exact du catalogue, quota de chantiers, héros requis ou mobilisé, ordre de validation, annulation et siège. **U02/U05/U19**.

**Confirmation proposée :**
- CA-01 : sur une cité Académie **déjà niveau 3** avec Conseil, construire une Mairie (catalogue 2013) pour **6 000 G, 8 w, 10 o et 576 minutes**. À 09:00 UTC, une échéance est prévue à **18:36 UTC**.
- CA-02 : stock de fixture \`{G:7000,w:10,o:12}\` devient \`{G:1000,w:2,o:2}\` après acceptation et reste inchangé sur nouvelle lecture.
- CA-03 : avec 7 bois, rejet atomique sans coût partiel.
- CA-04 : une requête acceptée répétée avec la même clé d'idempotence renvoie **le même ordre**. Après un refus suivi d'un changement de stock, la nouvelle intention prend **une autre clé**.
- CA-05 : acteur/cité non autorisé ou prérequis devenu faux → refus sans altération.

**Statut :** ne peut être \`Ready\` tant que quota, héros et annulation ne sont pas arbitrés, sauf sous-tranche isolée assumée. **RM-CIT-001…004 · FX-BUILD-001/002.**

## US-CIT-006 — Achever un bâtiment

**Conversation :** activation à la seconde correcte, effet sur production et bâtiment précédent, capture/siege et retour de panne. **U05/U14/U19**.

**Confirmation proposée :**
- CA-01 : à \`due_at − 1 seconde\`, aucun bonus activé.
- CA-02 : à \`due_at\`, bâtiment actif avec ses effets du bon catalogue, ancien niveau administratif non cumulé.
- CA-03 : le même événement rejoué une ou cent fois donne **un seul** achèvement et un seul recalcul de rendement.
- CA-04 : la capture pendant un chantier suit une politique de priorité explicitement versionnée.

**RM-CIT-005/006/008 · RM-TIM-002…004 · FX-BUILD-003 / FX-ECON-005.**

## US-ARM-005 — Recruter des unités / US-ARM-009 — Former mon armée

**Conversation :** ne pas fusionner revenu de recrues, achat, recrutement effectif et composition militaire. Les coûts du catalogue sont connus pour certaines unités, mais les files, cadence et partage des pools ne le sont pas. **U06/U18**.

**Confirmation proposée :**
- CA-01 : depuis un pool de **trois recrues Gremlin déjà disponibles**, achat de trois unités à **189 or/unité** → **567 or** débités et **trois unités** obtenues (référence 2013).
- CA-02 : l'effectif est consommé une seule fois ; solde fictif initial de 1 000 or → 433 or.
- CA-03 : trois Gremlins de puissance unitaire 71 ont **213 de puissance brute**, sans bonus d'arme, de héros ou de magie.
- CA-04 : sept pelotons ordinaires ordonnés sont admissibles ; huit pelotons ou effectif nul doivent être refusés dans le contrat de préparation.
- CA-05 : une affectation ne peut pas faire exister la même troupe à la fois en garnison et dans deux armées.

**RM-ARM-001…008 · FX-ARM-001/002.**

## US-COM-002 — Engager un combat PvE / US-REG-003 — Libérer une case

**Conversation :** préconditions, délai du héros, admission, résolution des pelotons, morts définitives, PNJ et retour, rapport ; la référence Jactari ne couvre pas tous les cas serveur. **U09/U11/U13/U17/U42**.

**Confirmation proposée :**
- CA-01 : un PNJ actif, un héros libre et une armée valide permettent un ordre horodaté ; le héros et les effectifs sont réservés.
- CA-02 : une rencontre déjà résolue ou un héros engagé provoque un refus sans deuxième ordre.
- CA-03 : une **défaite** laisse la case occupée ; une victoire admissible la libère une seule fois.
- CA-04 : la mine libérée devient activable ou exploitée selon la politique explicite ; elle ne produisait rien avant.
- CA-05 : le rapport conserve les phases, la version des règles, les pertes, les gains et les droits d'accès.

Pour les chiffres du duel, **FX-PVE-002 est un oracle communautaire synthétique**, non la preuve du serveur original. **RM-COM-001…007 · RM-REG-006/007 · FX-PVE-001/002 / FX-MINE-001.**

## US-RAP-001 — Consulter un rapport

**Conversation :** qui peut voir quelles données, à quelle date, avec quelles informations acquises. Un rapport de combat doit persister tel qu'il a été établi même si les règles changent après sa génération.

**Confirmation proposée :**
- CA-01 : le destinataire autorisé retrouve le même rapport après reconnexion.
- CA-02 : la consultation ne rejoue ni combats, ni crédits, ni XP.
- CA-03 : une requête d'un adversaire non autorisé ne révèle ni pelotons secrets, ni sorts, ni réserve.
- CA-04 : version de catalogue, instant et événements nécessaires à une reproduction déterministe sont conservés.

**RM-COM-006 · RM-TIM-002/004 · U41.**

## Pour la séance de refinement

**Ordre conseillé** : ACC/REG pour figer l'initialisation, ECO/TIM pour les calculs, CIT pour la progression, HER/ARM pour l'armée, COM/REG pour le premier PvE, puis RAP pour la compréhension des résultats.

**Definition of Ready** : une US ne passe pas à \`Prête\` par le simple ajout des critères ci-dessus. Il faut confirmer les règles de profil, les données de test, les dépendances, le niveau de fidélité annoncé, les éléments UI nécessaires (ou un substitut accepté), la taille livrable et l'estimation par l'équipe. Le [groupe initial des 37 US](../../data/analysis/first-playable-story-selection.json) reste une **sélection de travail**, et les 300 fiches du backlog n'ont pas été changées par cette proposition.
