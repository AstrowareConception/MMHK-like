# Effets des bâtiments urbains — PostgreSQL / FastAPI

**28 octobre 2026 — tranche expérimentale de MMHK-like.**

## Contrat P0 utilisé

Le registre de décisions P0 impose une seule construction urbaine active,
le paiement dès le départ, les trois modes de chantier, des niveaux de
bâtiments et l'inactivation d'un bâtiment lorsque l'un de ses prérequis
est détruit/inactif. Les bonus économiques sont **additifs**, appliqués à
la production de base. Un stockage saturé **perd** les crédits excédentaires.

Les coefficients précis des bâtiments, les prérequis officiels et les
capacités historiques MMHK saison 2 ne sont **pas connus**. La tranche
introduit donc des profils explicites, identifiés par `effect_policy_id`,
et non des chiffres Ubisoft inventés.

## 1. Modèle de persistance (migration 004)

`urban_effect_profiles` : politique pour un **bâtiment et un niveau** :
- `prerequisites` : objet `{"code_batiment": niveau_minimal}` ;
- `mine_additive_bonus` : dictionnaire de coefficients décimaux en
  chaînes, par ressource ;
- `capacity_bonus` : suppléments de capacité, entiers non négatifs ;
- `effect_policy_id` : identifiant explicite du profil.

`urban_city_buildings.operator_disabled` : suspension administrative de
l'activité d'un bâtiment, **sans le détruire**. Un dépendant dont le
prérequis devient inactif reste physiquement présent et conserve son
niveau, mais **ne procure plus aucun effet**. Une réactivation peut lui
rendre son effet si tous ses prérequis sont satisfaits.

`city_economy_effect_snapshots` : photographies persistées de la somme
des bonus actuellement applicables, avec `revision` et `effective_at`.
Une amélioration au niveau 2 **remplace** les effets du niveau 1, sans
les additionner. Chaque fin de chantier et changement d'état administratif
écrit une photographie dans la même transaction que la mutation.

## 2. Transactions, horloge et précision

L'achèvement de construction met à jour le niveau, journalise la fin de
chantier et écrit la photographie des effets dans un unique
`BEGIN/COMMIT` PostgreSQL. Aucune récompense n'est accordée par
l'interface Next.js.

L'activation des effets est datée à **l'instant où le worker valide
effectivement le chantier**, et non à la date d'achèvement théorique.
En cas de worker en retard, elle ne modifie pas les crédits déjà dus :
le moteur économique consulte la **dernière photographie applicable
au début de chaque période**.

Si une photographie est créée au milieu d'une période, le bonus
s'applique à partir de la **première période entière suivante**.
Le rattrapage découpé à la limite des changements permet de préserver
les montants antérieurs même en cas d'arrêt prolongé.

C'est une **convention conservatrice d'implémentation** tant que les
règles historiques d'activation en cours de période ne sont pas validées.

La capacité effective d'une ressource vaut la capacité de base
`city_stocks.capacity` **plus** les bonus actifs des bâtiments.
Le profil ne modifie pas la capacité de base ; si un bâtiment devient
inactif alors que le stock excède le nouveau plafond, **le stock
déjà acquis est conservé**, mais les crédits supplémentaires restent
bloqués tant que le niveau dépasse ce plafond. La politique de
destruction/perte de surplus à l'inactivation doit être étudiée
historiquement avant toute règle plus agressive.

La représentation de la production conserve les `Decimal` Python
et les fractions PostgreSQL à 18 décimales. Le moteur refuse
les bonus cumulés ou les capacités dépassant ses bornes de sécurité.

## 3. Prérequis et commandes

L'API `GET /api/v1/me/cities/{city_id}/construction` fournit
les bâtiments terminés et leur indicateur `active`, les bonus
actuels, ainsi que les options de construction avec `available` et
`missing_prerequisites`.

Les offres sont **informatives**. Une commande
`POST /api/v1/me/cities/{city_id}/construction` recalcule les niveaux et
tous les prérequis **sous verrou de ville**, avant tout prélèvement.
Un bâtiment inactif ne peut pas être amélioré ; la suppression d'un
prérequis bloque également les améliorations des bâtiments dépendants.

L'interface Next.js affiche les prérequis manquants et désactive les
boutons de construction correspondants. L'autorisation réelle reste
exclusivement celle de FastAPI, jamais du formulaire.

## 4. Commandes opérateur

Créer le prix/durée d'un bâtiment avec
`python -m mmhk_api.manage create-building-profile` avant d'en
déclarer les effets.

Exemple fictif de laboratoire : un bâtiment `experimental_store` de
niveau 1 augmente la capacité en or de 50 et la production de bois
de 10 %, sous la politique `LAB-EFFECTS-001`.

```bash
python -m mmhk_api.manage migrate
python -m mmhk_api.manage create-building-effects \
  --code experimental_store --level 1 --policy-id LAB-EFFECTS-001 \
  --prerequisites '{}' \
  --mine-bonuses '{"wood":"0.10"}' \
  --capacity-bonuses '{"gold":50}'
```

La commande est **à insertion unique** pour empêcher les réécritures
rétroactives des données. Une modification de profil déjà construit
sera refusée. La conception d'un futur outil de remplacement de politique
nécessitera des règles de bascule horodatées et des tests de concurrence.

Simulation d'un bâtiment devenu indisponible :

```bash
python -m mmhk_api.manage set-building-operational \
  --city-id UUID_DE_LA_VILLE --code experimental_store --enabled no
```

La réactivation utilise `--enabled yes`. Cette opération est réservée
à la CLI de confiance, sans endpoint HTTP public.

## 5. Tests et limites

Les tests PostgreSQL couvrent :
- prérequis absents et transaction de paiement refusée ;
- construction puis activation réelle des bonus ;
- remplacement du bonus au passage de niveau 1 à 2 ;
- suspension du prérequis et inactivation des dépendants ;
- réactivation sans destruction ;
- augmentation du plafond de stockage et crédits effectivement gagnés ;
- reprise économique sans appliquer rétroactivement un bonus récent ;
- refus de modification d'un profil une fois construit ;
- compatibilité des précédentes migrations, de Jactari et du build Next.js.

**Ne sont pas inclus :** destruction au combat, bâtiments régionaux,
compétences des héros, bonus issus d'équipements, sièges, recalcul des
coefficients historiques Ubisoft, supervision autonome des workers,
Redis comme cache et arbitrage PvP public.

`productionBattleArbiterAllowed=false` reste inchangé.
