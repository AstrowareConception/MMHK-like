# Configurations variables des mines régionales — laboratoire V1

La région d'une cité conserve sa grille **5 × 5**. La cité occupe la case
centrale **(2,2)**. Chaque mine issue du registre économique `city_mines`
occupe une case distincte ; les autres positions ne sont **pas** déclarées
vides ou explorées par défaut.

## Deux niveaux indépendants

1. **Composition économique** : `city_mines` définit les ressources
   exploitées par la cité. Le placement ne change ni les productions, ni
   les stocks, ni les coûts.
2. **Disposition visuelle persistante** : `city_mine_positions` contient
   `city_id,resource,i,j,layout_policy`. Les positions sont contraintes
   à 0–4, uniques par cité et ne peuvent pas utiliser (2,2).

La migration `090_region_mine_positions.sql` attribue aux mines existantes
des positions stables, calculées par cité avec un ordre déterministe, et
installe un déclencheur qui positionne automatiquement toute nouvelle mine.
Deux cités avec les mêmes quatre ressources peuvent donc avoir des
dispositions différentes. Une lecture ou un rafraîchissement ne
repositionne jamais les mines.

La disposition **n'est pas une restitution historique certifiée** des cartes
Ubisoft. Un relief, un biome et la position d'un PNJ non cartographiés restent
inconnus ; les mines ne les révèlent pas.

## Configurations définies par l'opérateur

Le service interne `mmhk_api.region_layout.configure_mine_layout` permet
de remplacer une configuration entière, de façon transactionnelle, avec
validation des ressources exactes et de l'absence de chevauchement.

Exemples conceptuels pour quatre mines identiques :

| Ressource | Configuration A (i,j) | Configuration B (i,j) |
| --- | --- | --- |
| Or | 0,0 | 1,0 |
| Bois | 4,0 | 3,1 |
| Minerai | 0,4 | 0,3 |
| Cristal | 4,4 | 3,4 |

Ce service est **réservé à l'administration** ; aucune route joueur
n'autorise à déplacer gratuitement une mine. Il ne constitue pas non plus
un système de déplacement payant des exploitations.

## Vérification

Après migration, ouvrir `/cities/<id>/region`, vérifier les marqueurs
et les raccourcis depuis l'onglet Renseignements, puis rafraîchir la page :
les coordonnées doivent rester identiques. Contrôler ensuite une seconde
cité créée par colonisation ; la nouvelle disposition doit être valide
et conserver les types de mines choisis par le profil colonial.

Tests unitaires de validation :
`pytest apps/api/tests/test_region_layout.py`.

Les tests d'intégration PostgreSQL et Playwright doivent encore confirmer
le déroulement complet de migration et de navigation dans l'environnement
local.

## Habillage cartographique original (tranche suivante)

Le composant `region-scene-interactive.tsx` propose désormais **Atlas illustré**
et **Décor historique**, lorsque les images privées sont disponibles.
La fonction pure `regionOrnaments(world_id,x,y)` génère une composition
vectorielle stable (ornements de végétation, pierres, maçonneries et motifs
de cheminement). Cette variation dépend seulement des coordonnées mondiales
et ne modifie aucun état PostgreSQL.

**Important :** il s'agit d'ornementation graphique, pas de données
topographiques, de routes traversables ou de sites remarquables révélés.
Les mines, rencontres et cités continuent à être dessinées exclusivement
à partir des registres serveur. Les ornements sont masqués sur les cases
occupées par une mine, une cité ou une rencontre pour éviter toute confusion.
Les mines portent également un signe minéral coloré selon leur ressource.
