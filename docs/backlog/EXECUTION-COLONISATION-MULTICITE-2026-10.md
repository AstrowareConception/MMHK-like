# Tranche majeure : colonisation et gestion multicité — préparation de recette

**Statut au 29 octobre 2026 : CODE EN PRÉPARATION, NON TESTÉ, NON FUSIONNÉ.**
Ce lot est écrit pour une campagne de validation ultérieure. Aucune réussite
PostgreSQL/Next.js/Chromium n'est revendiquée sans logs de tests.

## User stories et preuves

| Référence | Couverture envisagée | Limite de fidélité |
|---|---|---|
| US-MON-006 | Lire les droits, site, source, héros, coûts et devis | Influence *préenregistrée* ; formule historique absente |
| US-MON-007 | Fondations temporisées avec paiement et réservation atomiques | Temps/cout/capacité configurés, **pas** barèmes S2 |
| US-MON-008 | Liste et navigation de toutes les villes réellement possédées | Cités créées par worker, pas par mock frontend |
| US-ACC-011 | Protection débutant de sept jours consultable et non annulable | La durée 7j est la décision P0 du projet |
| US-CIT-001 à 004 | Ville fondée visible, stocks propres et premiers chantiers | Début de cité sans bâtiments gratuits |
| US-ECH-010 à 017 | Cité fondée utilisable comme destination de caravane | Transport et programmes restent LAB |
| US-MOV/US-PVP | Aucune nouvelle action militaire exposée | Non inclus |

**Sources disponibles :** décisions P0 Q10/Q23/Q24/Q35, G08 (droits et
influence), SS-040 (écran de colonisation), incertitudes U16/U17/U20.
SS-040 présente un coût **30 000 or, 50 bois, 50 minerai en contexte x200** ;
ce n'est pas un tarif classique universel et il n'est **pas** repris en
configuration de jeu.

## Règles décidées, garanties serveur

### Protection débutant
- Durée fixe **7 × 24 h à compter de world_memberships.joined_at**.
- Aucune commande publique pour lever, raccourcir ou suspendre cette durée.
- La protection est réévaluée au **départ** de toute nouvelle expédition,
  sous verrou PostgreSQL de l'adhésion au monde. Un entrant tardif ne
  bénéficie d'aucune exemption spéciale.
- Les expéditions **en cours** comptent pour le plafond de villes.
  Une expédition **bloquée** libère immédiatement la réservation du site et
  son droit à une cité supplémentaire ; son dépôt demeure réclamable une fois
  l'espace de stockage disponible.
- Le plafond de cités (2–10) relève d'une **politique expérimentale** ; le
  calcul historique sur trois classements et Graals reste U16.

### Éligibilité territoriale
- Utiliser uniquement des lignes réelles de \`map_influence_cells\` dont le
  \`controller_account_id\` est le joueur, **plus** une ligne explicite de
  \`colonization_site_profiles\`, activée par l'opérateur.
- Les emplacements alliés / extensions hors influence ne sont pas activés :
  les permissions et ratios de ces cas ne sont pas encore qualifiés.
- Carte torique, distance Manhattan sur le tore ; maximum issu du profil
  versionné, sans interprétation comme vitesse historique.
- Une case de cité occupée, un site remarquable enregistré, ou une
  réservation de colonisation en cours / bloquée **ne peut pas** être reprise.
  Le serveur renvoie un refus générique : l'identité ni le nom d'une
  cité adverse cachée ne sont divulgués.
- Seul l'opérateur qualifie les **3 ou 4 types de mines** du site,
  leurs taux de production et les sept capacités de stockage. Aucun
  générateur de mines, doublet rare ou relique n'est inventé dans le navigateur.

### Coûts, héros et nouvelle ville
- Devis en lecture seule. Politique et prix **versionnés par monde**.
- Le lancement confirme le nom (2–80 caractères), la case, le héros
  appartenant à la ville source et **disponible**, le tarif, les réserves
  et le droit de construire une nouvelle ville.
- Une transaction unique **débite les sept stocks concernés**, réserve le
  site, écrit l'ordre horodaté et affecte au héros l'état \`colonizing\`.
  Pas de double paiement en cas de replay de l'UUID.
- La fondation est une opération du **worker supervisé**. Jusqu'à
  l'échéance, la case n'est pas une cité et le héros est indisponible pour
  les autres missions.
- Au terme du trajet, le worker revérifie que le site est encore
  admissible ; il insère la cité, ses sept stocks à **zéro**, ses mines
  et ses cadences de production déclarées et son journal d'événements,
  puis rend le héros disponible dans sa ville d'origine.
- **Le héros, son armée et ses artefacts ne sont ni téléportés ni
  dupliqués.** Les nouvelles cités n'obtiennent pas de bâtiment gratuit,
  de soldats ou d'artéfacts. Elles doivent reconstruire leurs services
  et disposent immédiatement d'une économie locale indépendante.
- Un conflit de territoire, d'occupation ou de droits à l'arrivée
  empêche la création de cité : l'ordre devient \`blocked\`,
  les ressources restent sous séquestre, le héros est libéré.
- Le propriétaire peut **réclamer** les montants exacts d'une expédition
  bloquée. La capacité de stockage d'origine est vérifiée avant crédit ;
  le remboursement est atomique et idempotent. Si l'entrepôt est plein,
  le dépôt n'est jamais perdu.
- L'absence de bouton d'annulation pendant le trajet est volontaire.

## Architecture
- **Migration 018** : \`colonization_world_policies\`,
  \`colonization_site_profiles\`, \`colonization_orders\`,
  \`colonization_order_events\`, et état \`colonizing\` des héros.
- **Backend** : \`colonization.py\` (devis, droit, départ, worker,
  blocage et restitution) ; quatre routes privées HTTP GET/POST.
- **Worker** : nouvelle phase supervisée, isolée de l'économie, des
  chantiers, des missions et des caravanes. Traitement borné
  \`FOR UPDATE SKIP LOCKED\` et échéances PostgreSQL.
- **Frontend** : écran \`/worlds/[worldId]/colonize\`,
  lien depuis la carte, protection et devis affichés,
  coût par ressource, journal des fondations et restitution.
  Navigation « changer de cité » activée automatiquement avec
  plusieurs villes autorisées.
- **Frise** : annonce uniquement la **fondation prévue** par un ordre
  effectivement enregistré ; elle n'affiche une ville nouvelle
  qu'après la confirmation du worker.

## Test local explicite, SANS contourner les règles des joueurs

Après démarrage de la pile locale et connexion au compte de démonstration :

    python3 tools/local/stack.py colony-demo --username joueurdemo --enable-colony-laboratory

Cela déclare les emplacements et le tarif **strictement expérimentaux** du
monde local. La période de protection reste vraie : 7 jours.

**Pour une recette sur compte synthétique exclusivement**, on peut simuler
une adhésion âgée de 8 jours :

    python3 tools/local/stack.py colony-demo --username joueurdemo --enable-colony-laboratory --age-membership-for-test

Ce dernier paramètre **modifie la date de l'adhésion de test uniquement**,
jamais un compte réel ou un monde autre que \`mmhk_local\`.
Aucun endpoint public ne sait effectuer cet ajustement.

Profil local : **20 or + 5 bois + 5 minerai**, distance au plus
3 cases toriques, **15 secondes par case**, maximum 4 cités, profils
de mine explicitement configurés. Ces chiffres ne sont pas des valeurs S2.

## Tests à EXÉCUTER demain (pas aujourd'hui)
1. Migrations 001–018 sur PostgreSQL vierge, puis seconde exécution
   idempotente. Tester aussi une base migrée depuis la 017.
2. \`pytest\` API et tests de sécurité : 7 jours, confidentialité,
   économie non débitée au devis, refus au départ, source étrangère,
   héros occupé, site occupé, double clic et double réservation concurrente.
3. Worker : avant/après l'échéance, cité réelle, sept stocks séparés,
   mines et taux déclarés, retour d'état du héros, crash/reprise.
4. Site retiré ou droit perdu à l'arrivée : blocage sans créer de cité,
   puis remboursement exact une fois et capacité saturée.
5. Build Next.js et TypeScript strict, styles responsive, compilation
   des Server Actions et nouveau lien « Expansion ».
6. Parcours Chromium en deux étapes : ancien scénario puis seconde cité
   de laboratoire, nouvelle colonisation vers une **troisième** ville,
   entrée dans la ville et choix d'une destination commerciale réelle.
7. Vérifier que la CI du dépôt ne démarre pas à chaque commit de PR.
   Une seule validation manuelle consolidée avant fusion.

## Périmètre réservé à la suite
Classement Richesse et droit réel à dix cités, influence dynamique/alliances,
colonisation extérieure au territoire, héros transportant une armée vers la
nouvelle cité, compétition territoriale PvP, guerre, captures, choix
historique des mines, temps S2, retour ou défense de colonie, transfert de
héros entre villes et bonus fondateurs restent à spécifier et tester.
