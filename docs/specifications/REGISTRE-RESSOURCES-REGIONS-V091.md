# Registre persistant des régions du monde — tranche V091

## Contrat fonctionnel

Chaque région du monde identifiée par `(world_id,x,y)` possède quatre **emplacements de ressource** ordonnés. Une ressource peut apparaître plusieurs fois. La composition régionale est **distincte** des mines construites ou activées dans la cité, de leurs emplacements locaux 5 × 5, des stocks et de la production.

Un joueur ne voit ces quatre ressources que pour sa propre cité ou après une découverte explicitement enregistrée. Une région non découverte n'est jamais présentée comme vide, et une simple appartenance au monde n'entraîne aucune révélation automatique.

## Hypothèse de laboratoire, non certifiée MMHK

Le profil `regional-composition-v1` utilise une empreinte SHA-256 stable du monde et des coordonnées. La plupart des régions contiennent or, bois, minerai et une ressource rare (cristal, gemmes, soufre ou mercure). Une minorité reçoit or, bois et deux occurrences d'une même ressource rare. L'ordre est varié indépendamment. Ces proportions sont des **choix expérimentaux**, pas des probabilités historiques revendiquées.

L'algorithme ne change jamais une composition déjà persistée. Les régions avec une cité existante sont d'abord rapprochées des quatre mines réellement associées à cette cité ; les profils incomplets ne sont pas inventés et demandent une décision explicite de l'opérateur.

## Migration et fonctionnement

La migration `091_world_region_registry.sql` crée :
- `world_region_resources` : quatre emplacements, version du profil et provenance ;
- `world_region_resource_discoveries` : autorisations de visibilité par compte, région et monde.

Les profils des cités existantes comptant exactement quatre mines sont repris sans modification des stocks. Les autres régions restent absentes du registre jusqu'à provisionnement. Aucun balayage automatique d'un monde gigantesque n'est effectué.

### Provisionner une zone limitée

Après sauvegarde de la base et migration :

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage provision-world-regions \
  --world-id local-sandbox --x-min 1 --y-min 1 --x-max 10 --y-max 10
```

Cette commande d'administration crée jusqu'à 400 régions par exécution.
Elle **ne révèle pas** automatiquement les régions au joueur.

Pour autoriser explicitement un compte déjà membre du monde à consulter ces ressources, ajouter `--reveal-to-account UUID_DU_COMPTE`. C'est une opération de laboratoire et de test, non une mécanique de reconnaissance finale. Ne pas l'utiliser pour attribuer au joueur des renseignements qu'il n'a pas gagnés.

Une nouvelle exécution ne change pas les valeurs existantes. La génération est réservée à la CLI opérateur, pas à la lecture HTTP d'une carte.

## Interfaces et prochaines étapes

L'inspection FastAPI `GET /api/v1/me/worlds/{world_id}/regions/{x}/{y}` expose `regional_resources`, `regional_resources_known` et `regional_resources_policy` selon les droits du joueur. Le panneau de la carte du monde affiche ces ressources indépendamment des mines exploitées.

La vue régionale 5 × 5 utilise toujours les **positions locales des mines** persistées par V090 ; il n'existe pas encore de placement officiel de quatre gisements ou de terrains sur les 25 cases. Un doublon dans les emplacements régionaux n'implique **pas** qu'une seconde mine économique soit déjà construite.

Les prochaines couches à concevoir sont le registre topographique, la reconnaissance et les actions militaires transactionnelles. Aucune attaque ou colonisation ne doit se fonder uniquement sur la présence d'une ressource dans le registre.

## Vérifications

```bash
pytest -q apps/api/tests/test_world_region_generation.py
pytest -q apps/api/tests/test_region_inspection_contract.py
```

Les validations SQL réelles et l'E2E Playwright de cette migration restent à exécuter sur la stack Docker de développement avant toute utilisation au-delà du laboratoire.

## Cohérence à la colonisation — raccordement métier

La fonction pure `profile_fits_region` impose que chaque type de mine
proposé par une expédition figure dans au moins un des quatre emplacements
de ressources du registre. **Il n'est pas nécessaire d'exploiter toutes
les ressources d'une région** : les profils de fondation à trois mines
restent autorisés si ces trois types sont effectivement présents.

Les ressources régionales peuvent être répétées. Les mines d'une cité,
elles, restent uniques par type dans le modèle économique actuel.
Par exemple, `or,bois,gemmes,gemmes` est compatible avec trois mines
`or,bois,gemmes`, mais pas avec une mine de minerai.

Le contrôle s'exécute :
- avant la présentation du devis de colonisation ;
- dans la transaction qui réserve les coûts et expédie le héros ;
- à l'arrivée de l'expédition, avant de créer la nouvelle cité.

À l'arrivée, une incompatibilité apparue pendant le trajet bloque
l'ordre selon le mécanisme existant d'expédition bloquée et de restitution.
Il n'y a donc pas de fondation silencieuse avec des mines contradictoires.

Si la région dispose déjà d'une composition persistée, celle-ci est
**préservée**, sans modifier ni les mines ni les ressources. Si aucune
composition n'existe, une cité nouvelle avec exactement quatre types de
mines permet d'initialiser ce registre sans conjecture. Si seules trois
mines sont définies, l'emplacement régional manquant n'est pas inventé :
le registre reste à qualifier par l'opérateur.

Une fondation correctement enregistrée révèle les ressources régionales
au propriétaire de la nouvelle ville, lorsque le registre existe.

### Vérifications complémentaires

```bash
pytest -q apps/api/tests/test_region_resource_consistency.py
```

Les contrôles unitaires ne remplacent pas les essais transactionnels
PostgreSQL du worker de colonisation ni les vérifications Playwright.

## Sites qualifiés préexistants — règle de priorité

Lorsqu'un opérateur provisionne une région sans cité, le générateur
recherche au préalable ses profils coloniaux actifs
(`world_colonizable_terrain` ou `colonization_site_profiles`).
Les types de mines déjà explicitement approuvés sont conservés.

Avec trois ressources qualifiées, la quatrième est ajoutée de manière
déterministe, comme **hypothèse de laboratoire identifiée par sa provenance**.
Cette quatrième ressource ne crée pas de mine productive.
Avec quatre types, la composition est reprise telle quelle. Deux
profils actifs et contradictoires entraînent un refus de provisionnement
jusqu'à résolution par l'opérateur.

Les régions déjà provisionnées restent immuables : une nouvelle
qualification discordante ne réécrit pas leur composition. Les devis,
départs et arrivées des fondations vérifient désormais cette cohérence.
Tests dédiés : `test_world_region_generation.py` et
`test_region_resource_consistency.py`.

## V092–V093 : localisation des quatre gisements sur la carte 5 × 5

La migration `092_world_region_deposits.sql` ajoute
`world_region_deposits`, avec quatre entrées (`slot = 0..3`)
par région provisionnée. Chaque entrée indique `resource,i,j`.
Les contraintes SQL imposent des positions distinctes dans la grille
5 × 5, en dehors de la case centrale réservée à la ville.

Un **gisement naturel** est une information territoriale, alors qu'une
**mine** est une exploitation économique déjà présente dans
`city_mines`. Ainsi, deux gisements de gemmes peuvent exister dans
une même région tout en conservant le modèle actuel à une seule mine
économique de gemmes par cité.

Le générateur `world_region_deposits.provision_deposits` :
- respecte les coordonnées des mines existantes lorsque leurs ressources
  correspondent à la composition enregistrée ;
- attribue les gisements restants à des cases libres par un calcul SHA-256
  déterministe et versionné ;
- refuse de réécrire un ensemble de positions incomplet ou contradictoire ;
- fonctionne uniquement depuis l'administration, en complément du
  provisionnement des quatre ressources.

La migration `093_mines_follow_natural_deposits.sql` actualise le
déclencheur de placement des **nouvelles** mines : lorsque les gisements
sont connus, une mine utilise prioritairement la case d'un gisement de
même ressource. Les anciennes mines ne sont jamais déplacées.

La projection FastAPI de la région propriétaire expose
`natural_deposits` séparément de `mine_positions`.
L'inspection d'une région depuis la carte du monde ne transmet les
positions que lorsque la composition des ressources est déjà visible
au joueur. La vue régionale illustre les gisements non exploités
et les mines bâties avec deux symboles différents.

### Procédure de mise à jour

Après sauvegarde, appliquer les migrations en ordre :

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage provision-world-regions \
  --world-id local-sandbox --x-min 1 --y-min 1 --x-max 10 --y-max 10
```

Le second appel complète aussi les positions des gisements des régions
déjà présentes, sans en modifier les compositions.

Tests ciblés : `pytest -q apps/api/tests/test_world_region_deposits.py`.

Les tests PostgreSQL et l'E2E navigateur doivent être exécutés dans
l'environnement Docker du projet : l'ajout des fichiers ne constitue
pas une validation d'exécution.

## Audit d'intégrité et fondations : outillage complémentaire (sans migration SQL)

Une commande d'administration **en lecture seule** est disponible pour
rechercher les incohérences entre compositions, gisements et mines :

```bash
python -m mmhk_api.manage audit-world-regions \
  --world-id local-sandbox --limit 400
```

Le rapport JSON donne `inspected`, `truncated`, `affected_regions` et
`findings` avec les coordonnées et catégories d'anomalies. La commande
n'exécute aucune génération ni réparation.

Les anomalies recherchées couvrent notamment :
- une cité sans composition régionale ;
- un registre de gisements incomplet (moins de quatre emplacements) ;
- une discordance entre les quatre ressources et les quatre gisements ;
- des positions invalides ou partagées ;
- une mine sans position ou dont la ressource ne figure pas dans la région ;
- une mine éloignée du gisement correspondant.

Les anciennes mines ne sont **jamais déplacées automatiquement** par
cet audit. La résolution des anomalies nécessite une décision explicite
de l'opérateur et une sauvegarde préalable.

Lors de la fondation, le worker appelle désormais le provisionnement
des gisements dans la transaction de création de la cité. Si les données
régionales existantes sont corrompues, l'ordre passe à l'état bloqué
`invalid_regional_deposit_layout`, sans cité partiellement créée.
L'expédition reste éligible au mécanisme de restitution existant.

### Tests à réaliser avant validation fonctionnelle

```bash
python -m mmhk_api.manage migrate
pytest -q apps/api/tests/test_region_integrity.py
pytest -q apps/api/tests/test_world_region_deposits.py
pytest -q apps/api/tests/test_region_resource_consistency.py
```

Vérifier aussi sur PostgreSQL réel : migrations successives, ville
ancienne à quatre mines, région avec doublon de ressource, colonie à
trois mines, redémarrage du worker et nouvel audit sans anomalie.

La présence des tests dans le dépôt ne prouve pas leur exécution :
l'intégration Docker et le parcours Playwright restent à vérifier.

## Reconnaissance de toutes les régions du monde

La carte du monde propose désormais **Ouvrir la région** sur toute
coordonnée sélectionnée. La nouvelle page
`/worlds/{worldId}/regions/{x}/{y}` consulte le serveur sous l'identité
du joueur et affiche une grille SVG 5 × 5 accessible par clic et clavier.

Elle indique les quatre ressources et les positions des gisements
**uniquement lorsqu'elles sont découvertes et autorisées**. Les
emplacements inconnus restent neutres : absence de donnée ne signifie
pas absence de terrain, d'armée ou de ville ennemie.

Une cité appartenant au joueur conserve un accès vers son écran
régional complet (missions, mines, armées). Les régions sans cité
peuvent maintenant être explorées visuellement sans faire croire
qu'un ordre militaire est déjà disponible.

### Parcours manuel recommandé

1. Sélectionner une case quelconque du monde, puis ouvrir sa région.
2. Vérifier l'absence de renseignement pour une case non découverte.
3. Révéler explicitement une région à un compte de test autorisé.
4. Vérifier les quatre gisements et leurs coordonnées régionales.
5. Vérifier qu'une cité étrangère non découverte et ses mines restent cachées.
6. Vérifier les retours à l'atlas et à la région complète de sa propre cité.

## Correctif V094 : conformité aux décisions P0 de génération

L'audit du 4 novembre 2026 a identifié que le profil
`regional-composition-v1` rendait l'or et le bois obligatoires
dans toutes les régions ordinaires, contrairement aux décisions
Q11–Q15. Le nouveau `regional-composition-v2` applique :
- cité initiale Havre : or + bois + minerai + cristal, inchangée ;
- autres régions : trois ou quatre types parmi sept, sans type obligatoire ;
- au plus une seule paire, sans triple ni seconde paire ;
- probabilités symétriques pour cristal, gemmes, soufre et mercure ;
- occurrence d'une paire à 12,5 % comme hypothèse expérimentale à ajuster.

La migration 094 autorise ce nouvel identifiant de politique.
**Aucune composition V1 déjà persistée n'est modifiée automatiquement**,
car cela déplacerait ou invaliderait des choix coloniaux et gisements.
Les mondes existants doivent faire l'objet d'une revue opérateur
avant toute régénération volontaire et contrôlée.

Voir `docs/backlog/ETAT-AVANCEMENT-2026-11-04.md` pour les exigences
et les US concernées. Les paragraphes antérieurs décrivant des régions
ordinaires avec or/bois fixes sont de l'historique du profil V1,
pas les règles désormais applicables à V2.
