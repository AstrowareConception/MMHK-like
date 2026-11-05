# V104 — Exploitation d'une mine après une victoire PvE

Date : 5 novembre 2026. **Statut : laboratoire opt-in, non certifié MMHK S2.**
US-REG-004 : incrément technique candidat, story NON acceptée.

## Prérequis physiques

Un gisement naturel enregistré dans world_region_deposits, parmi
quatre slots réels d'une région persistée, doit être aligné
avec city_mine_positions (une mine appartenant déjà à la cité),
avec le type de ressource et la case de la rencontre neutre.
Les doublons de ressource sont autorisés dans la région, mais
chaque slot conserve sa propre position et son identité.

Le taux de production et le plafond sont ceux de city_mine_rates,
city_economy_clock et city_stocks. Ni ressource ni mine ni taux ne
sont inventés par V104.

L'opérateur exige un monde d'essai LAB, les deux politiques V102/V103
activées, un PNJ V103 qualifié et une mine déjà configurée à taux
positif. Il doit s'assurer qu'aucun tick entier n'est impayé et
qu'aucune fraction ancienne n'est conservée sur ce taux.

Commande administrateur (jamais exposée via HTTP) :

    python -m mmhk_api.manage qualify-lab-mine-gate \
      --encounter-id UUID_DU_GARDIEN \
      --source-ref LAB-MINE-PHYSIQUE-V104 \
      --acknowledge-experimental

Le gardien est alors lié à une mine existante. Seule cette mine
est bloquée : les autres mines de la cité produisent comme auparavant.
Les mondes non enrôlés ne sont pas affectés.

## Parcours du joueur

1. Vaincre le PNJ gardien avec une mission V103 qualifiée.
2. La mine passe de « gardée » à « prête », sans produire encore.
3. Le propriétaire confirmé depuis la région active la mine via
   un ordre HTTP authentifié et un UUID d'idempotence.
4. PostgreSQL confirme le ledger V103, les correspondances de
   ressource, coordonnées, slot, mine possédée et taux préexistant.
5. L'activation irréversible est datée par l'horloge serveur.
   La répétition du même ordre renvoie la même activation,
   un autre ordre ne peut pas créer un second effet.
6. Le worker économique ne crédite les ticks qu'à partir du
   premier tick dont le **début** est au moins égal à cette date.
   En rattrapage, il sépare les ticks antérieurs et postérieurs.
7. La ville affiche un taux nul pour une mine inscrite mais
   verrouillée, puis le taux déjà configuré après activation.

## Conditions de refus

Un PNJ inconnu, non qualifié ou non vaincu, une mine sans taux,
une case discordante, un gisement absent, une composition régionale
non persistée, une tentative d'un autre compte ou un nouvel UUID
sur une mine déjà active ne donnent aucun crédit supplémentaire.
Le verrou lui-même est protégé contre une mutation ou suppression
arbitraire ; les cascades légitimes de suppression d'une cité
doivent néanmoins rester possibles.

## Recette

- Migration transactionnelle PostgreSQL V104 ;
- test_lab_mine_activation.py : production gardée nulle,
  activation, doublons, propriétaire, replay, gisement physique ;
- test_economy_integration.py : production antérieure non inventée,
  troncature des ticks, plafonds et fractions inchangés ;
- build Next.js et TypeScript, traçabilité 300/300, Docker/Chromium.

## Hors périmètre

Les coûts et temps des bâtiments de mines, leurs niveaux,
extensions et aménagements, l'entretien des armées,
les règles historiques G11 et les revenus d'une nouvelle
possession territoriale ne sont pas établis ici.
Aucune US n'est formellement acceptée par cette tranche.
