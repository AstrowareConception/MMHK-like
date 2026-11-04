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
