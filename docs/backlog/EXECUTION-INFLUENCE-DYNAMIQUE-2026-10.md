# Influence territoriale dynamique — première tranche de reconstruction

**Statut : laboratoire expérimental, sans certification des paramètres MMHK saison 2.**

## Sources et décisions du projet

- Le [dossier des Larmes et de l'influence](../game-design/17-RELIQUES-ET-GUERRES-D-INFLUENCE.md)
  rassemble le tutoriel 2009 et la FAQ 2013 : **moyenne de puissance
  militaire sur quatre jours**, domination des bâtiments, recalcul
  quotidien et rayons respectifs 1, 2, 3, 4, 5, 6 aux seuils de
  domination 0, 30 000, 100 000, 250 000, 500 000 et 1 000 000.
- Cette table est **documentée historiquement mais sa conformité
  exacte à la saison 2 n'est pas démontrée** (U15).
- La loi géographique, les contributions respectives des bâtiments
  et des armées, l'agrégation des alliances, les égalités et le
  calendrier régional sont incomplets. Il est interdit de présenter
  la fonction expérimentale comme une règle serveur Ubisoft.

## Fonctionnalités développées

### Moteur de projection
- Politique **désactivée par défaut**, attachée à un monde, identifiable
  par un identifiant de version non ambigu.
- **Une mesure quotidienne par cité**, en données signées d'une
  provenance métier par l'opérateur (jamais soumise par un joueur) :
  puissance militaire et domination des constructions. La ligne
  doit appartenir à la cité et à son propriétaire de l'instant.
  Une mesure en double est refusée : pas de recalcul rétroactif silencieux.
- À la révision, moyenne militaire des **quatre journées UTC complètes
  précédentes**, en comptant zéro pour les jours manquants, puis ajout
  de la domination des bâtiments de la **dernière mesure**.
- Rayon issu des seuils précités ; chaque ville atteint un
  **disque discret sur carte torique**, pas un carré.
- À titre de *proposition expérimentale exclusivement*, force locale
  = \`max(1,domination)/(1 + distance euclidienne)^2\`.
  Des villes appartenant au **même compte** additionnent leurs scores.
  Les alliances ne sont **pas** simulées. L'égalité exacte entre
  propriétaires produit une case **contestée**, sans propriétaire
  artificiellement choisi. Le même centre ne peut jamais contribuer
  plusieurs fois à une case, même sur un petit monde torique.
- Conception bornée pour laboratoire : maximum 250 villes échantillonnées
  et 25 000 cases projetées ; pas de calcul de 100 000 × 100 000 cases.
  Un dépassement fait échouer **la transaction** et laisse la projection
  publiée antérieurement intacte.

### Persistance, isolation et suivi
- Migration **019** : \`world_influence_policies\`,
  \`city_domination_samples\`, \`world_influence_cells\`,
  \`world_influence_visibility\` et \`world_influence_runs\`.
- Le worker supervisé exécute le recalcul à l'échéance du monde,
  sous \`FOR UPDATE SKIP LOCKED\`, avec une seule transaction atomique
  pour remplacer toutes les cases et enregistrer une nouvelle révision.
  Un deuxième worker ne peut créer la même révision.
- La carte du monde reçoit les coordonnées **déjà calculées**,
  visibles lorsque le propriétaire est le joueur ou qu'un droit
  explicite de reconnaissance a été enregistré. Une case rivale
  non découverte reste secrète.
- Les cases manuelles \`map_influence_cells\` ne sont **jamais effacées
  ni écrasées** par les nouvelles projections. Un monde sans politique
  active conserve la projection historique/manuelle inchangée.
- L'API privée \`GET /api/v1/me/worlds/{world_id}/influence\`
  renvoie les moyennes, rayons et nombres de cases **du compte seulement**,
  ainsi que la révision, la méthode et les limitations historiques.
  Aucune API publique de manipulation de domination n'est ajoutée.

### Colonisation — garde-fou d'intégration
- Lorsque la politique dynamique d'un monde est activée, la
  qualification **manuelle ou opérateur** des terrains reste obligatoire.
  En plus de cette qualification, la ville fondatrice doit posséder
  une case effectivement contrôlée selon la **dernière révision calculée**.
- Sans première révision, le droit de coloniser une deuxième cité
  **échoue fermé**. Si la domination change pendant un trajet, le
  worker revérifie la propriété à l'arrivée avant de créer la cité.
- Les protections de sept jours, paiements atomiques, plafonds, héros
  et remboursements de la migration 018 restent inchangés.
- Le générateur **automatique de profils de terrain, mine, reliques
  et d'emplacements de colonie** est un travail ultérieur lié à U17 :
  une case gagnée par influence ne produit **pas** de terrain ou
  de ressources sans profil qualifié.

## Démonstration locale strictement volontaire

Avec le monde \`local-sandbox\` démarré, saisir :

    python3 tools/local/stack.py influence-demo --username joueurdemo --enable-influence-laboratory

Cette commande ajoute quatre observations **synthétiques à 30 000**
points militaires/jour à chacune des villes **déjà possédées**.
Elle ne remplace pas des chiffres MMHK historiques.
L'option \`--military-power 100000\` permet une autre fixture **synthétique**
lors de la première préparation, sans réécrire une ancienne preuve.
Le worker réel publie le calcul à son prochain passage.

Les lignes ne sont créées qu'avec
\`MMHK_LOCAL_DEMO_ENABLED=true\` **et** \`PGDATABASE=mmhk_local\` ;
l'interface joueur ne peut pas soumettre ni modifier ces valeurs.

## Vérifications à effectuer avant fusion

- Migration neuve 019 et idempotence ; régression des migrations 001–018.
- Transfert de propriété d'une cité : les échantillons de son ancien
  propriétaire ne doivent pas être hérités par le nouveau.
- Seuils de rayon, bord torique et absence de surcomptage des cases.
- Deux villes rivales d'égale domination : statut contesté.
- Quatre jours glissants : valeurs manquantes comptées zéro.
- Worker simultané sur deux connexions : un seul commit de révision.
- Aucun effacement des cases manuelles ni divulgation des cases adverses.
- Une colonisation autorisée manuellement doit aussi passer le contrôle
  dynamique lorsque celui-ci est activé, au départ et à l'arrivée.
- Build Next.js, types, tests Postgres, preview Docker et navigateur.

**Hors périmètre** : calcul automatique des points de puissance des
bâtiments historiques, calcul réel des armées stationnées et de leur entretien,
alliances, bonus des Sphinx / Trésoreries / Dolmens, site/terrains autogénérés,
captures de villes, sièges, Guerre des Larmes et politique des rangs.
