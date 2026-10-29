# Colonisation sur terrain qualifié sous influence dynamique — tranche U15/U17

**Cette tranche ne reconstitue PAS l'algorithme historique de génération de
terrain.** Elle relie le moteur de territoire de la PR #38 à des profils
de cases qualifiés par l'opérateur **avant** l'arrivée d'un joueur.

## Problème résolu
Le modèle originel de colonisation (migration 018) imposait un profil
\`colonization_site_profiles\` dont la clé étrangère pointait vers
\`map_influence_cells\`. Le contrôleur de la carte manuelle et le terrain
étaient donc couplés. Après la projection dynamique (migration 019),
une nouvelle case contrôlée mais sans ligne manuelle ne pouvait **jamais**
devenir un site de colonisation, même si ses mines avaient été
indépendamment identifiées.

## Séparation des trois responsabilités
1. **Terrain** : un enregistrement \`world_colonizable_terrain\` (migration
   **020**) qualifie **indépendamment** la position, son identifiant de
   provenance, les 3/4 mines connues, les taux de mine, les capacités de
   stockage et la cadence. Le profil peut préexister à tous les joueurs.
2. **Territoire** : le worker de la PR #38 publie des cases de contrôle
   \`world_influence_cells\`, avec leurs révisions atomiques. Ce calcul
   n'écrit pas et ne réattribue jamais la qualification du terrain.
3. **Colonisation** : le serveur accepte un profil de terrain indépendant
   **uniquement** si la politique dynamique est activée, qu'elle
   possède une révision publiée et que la case est sans ambiguïté
   contrôlée par le joueur. Une case neutre, contestée, ennemie,
   non calculée ou sans profil reste inéligible.

Les autres validations demeurent cumulatives : sept jours de protection,
héros libre dans la cité d'origine, ressources suffisantes, quota,
distance torique, emplacement libre, absence de site remarquable et
réservation atomique.

Les anciens profils \`colonization_site_profiles\` et leurs anciennes
cases manuelles restent valides **dans un monde manuel**. Dans un monde
dynamique ils sont également soumis à la dernière frontière calculée.
Le mode de qualification choisi est **figé dans l'ordre** :
\`legacy_operator\` ou \`terrain_registry\`. Au terme du trajet, le
worker revérifie la même source et le contrôle actuel avant de créer
la cité. Il n'existe donc aucun déplacement fictif de la propriété
d'un terrain et aucune création automatique de mine par l'influence.

## Ce qui reste du ressort de l'opérateur
\`terrain_catalog.py\` fournit une écriture interne insert-only et un
import transactionnel borné (250 emplacements). Aucune route HTTP
d'édition n'est ajoutée. Une importation invalide, en doublon, hors
monde ou sans provenance annule **l'ensemble** de la transaction.

Une commande de test accepte un manifeste JSON local. Elle exige
\`MMHK_LOCAL_DEMO_ENABLED=true\`, \`PGDATABASE=mmhk_local\` et un
opt-in explicite :

    python3 tools/local/stack.py terrain-import --enable-terrain-laboratory --username joueurdemo --file data/fixtures/terrain-lab-profiles.json

Le manifeste de démonstration déclare deux cases **relatives à la première
cité d'un compte synthétique** avec quatre mines par emplacement.
Les poids, positions, rates et capacités sont des **données
d'expérimentation** à source explicite ; elles ne représentent pas
une carte historique Ubisoft, une vraie distribution mondiale ni des
probabilités d'obtention des ressources.

En production, les profils devront provenir d'un export/import
qualifié de terrain ou d'un générateur documenté en propre avant
activation. La répartition des quatre mines, les doublons rares,
la densité des reliques et les corrélations géographiques restent
incertains : U17.

## Vérifications de sécurité et cohérence
- Profil qualifié dans un monde **manuel** sans droit d'influence :
  aucun nouveau site joueur.
- Monde dynamique **activé sans première révision** :
  droits de colonisation bloqués.
- Première révision après quatre journées de puissance déclarée :
  case sous influence propre et profil de terrain actif devient
  un site visible et utilisable pour une vraie fondation différée.
- Perte de contrôle/contestation **avant le départ** :
  devis et ordre refusés, aucun débit.
- Perte de contrôle/contestation **pendant le trajet** :
  aucun fondement de cité, héros libéré et dépôt remboursable.
- Suppression ou suspension du profil de site entre départ et
  arrivée : blocage du worker avec restitution possible.
- Replays, contrôles concurrents, carte privée, mines configurées,
  absence de transfert de propriété d'une cité existante.
- Comparaison des migrations 018–020, nouveaux tests PostgreSQL,
  build TypeScript, Docker, scénario Chromium de fondation.

## Interdits et exclusions
- Aucune attribution de propriété d'une cité préexistante par
  simple changement de frontière.
- Aucune création automatique de terrains, de ressources ou de
  reliques en réponse au gain d'une case.
- Aucun privilège d'exploration ou visualisation de la carte
  adverse par simple présence de terrain qualifié en base.
- Aucun coût ou vitesse MMHK S2 certifié en l'absence de preuve.
- Aucune « génération de monde historique » revendiquée.

Cette phase est un **socle de données sécurisé** pour une génération
de monde future, non cette génération elle-même.
