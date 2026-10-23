# Spécifications de recette Gherkin — Early game

**18 scénarios initiaux (et [15 exemples additionnels P0](../../data/decisions/p0-acceptance-examples.json)), 0 exécution moteur.** Les cas décrivent des comportements à implémenter et à tester. Les prix et caractéristiques de 2013 ne certifient pas la saison cible ; les valeurs fictives ne sont pas attribuées à Ubisoft. Une fixture marquée décision ouverte ne devient exécutable qu'après choix d'un profil explicite.

Source de données : [18 fixtures JSON](../../data/rules/early-game.fixtures.json). Voir [contrats](CONTRATS-EARLY-GAME.md), [règles RM](../../data/rules/early-game.rules.json) et [décisions ouvertes](DECISIONS-ET-INCERTITUDES.md).

~~~gherkin
# language: fr
Fonctionnalité: Développer un royaume persistant sans incohérence

  @FX-START-001 @proposed_contract
  Scénario: Création idempotente d'un royaume
    Étant donné un monde ouvert, une faction autorisée et deux régions libres
    Quand l'inscription est répétée avec la même clé puis le joueur se reconnecte
    Alors une seule cité, un WorldPlayer et un seul starter pack existent

  @FX-START-002 @proposed_contract
  Scénario: Validation du code ami
    Étant donné un code ami lié à un invitant du monde A
    Quand un invité demande near dans A, puis tente le même code sur le monde B
    Alors near choisit uniquement une région légale de A ; B refuse la clé ; fallback encore à décider

  @FX-PROTECT-001 @project_recollection_lab_only
  Scénario: Borne de protection en laboratoire
    Étant donné une protection FICTIVE de sept jours, du 23/10 10:00 UTC au 30/10 10:00 UTC, fin exclusive
    Quand une attaque arrive le 30/10 à 09:59:59 puis une autre à 10:00:00
    Alors la première est refusée ; la seconde n'est plus couverte selon ce profil de TEST

  @FX-REG-001 @proposed_fixture_with_documented_geometry
  Scénario: Quatre mines avec doublon de bois
    Étant donné une région 5×5, une cité en [2,2], quatre mines G, w, w, c sur des cases distinctes
    Quand je régénère le terrain avec une graine et une version identiques
    Alors j'obtiens 25 cases, quatre mines et le doublon de bois accepté

  @FX-ECON-001 @proposed_contract
  Scénario: Réservation et disponibilité
    Étant donné une cité avec 10 bois dont 3 réservés
    Quand le joueur consulte son solde disponible
    Alors le stock reste 10 et le disponible vaut 7

  @FX-ECON-002 @proposed_fixture_not_historical_cadence
  Scénario: Production et reconnexion
    Étant donné 10 bois en stock ; 24 bois/jour FICTIFS ; plafond 100
    Quand 12 h s'écoulent puis la même opération de crédit est rejouée
    Alors le solde vaut 22 et ne reçoit aucun deuxième crédit

  @FX-ECON-003 @proposed_fixture_not_historical_cadence
  Scénario: Changement de rendement en cours de période
    Étant donné 24 bois/jour FICTIFS pendant 6 h puis 48 bois/jour FICTIFS pendant 6 h
    Quand je règle la production sur douze heures
    Alors le crédit total vaut 6 + 12 = 18 bois

  @FX-ECON-004 @proposed_fixture_not_historical_overflow_rule
  Scénario: Plafond avec surplus non conservé
    Étant donné 19 bois en stock, plafond de TEST 20, crédit de 6, politique LAB discard_excess_production
    Quand le crédit de production est exécuté
    Alors le solde vaut 20 et 5 unités de surplus sont écartées dans ce seul profil fictif

  @FX-ECON-005 @catalogue_2013_reference_not_verified_server
  Scénario: Revenu administratif non cumulatif
    Étant donné le Conseil du village Académie est à 2 000 or/jour selon catalogue 2013
    Quand la Mairie Académie à 4 000 or/jour lui succède
    Alors le rendement nominal administratif est 4 000, et non 6 000

  @FX-BUILD-001 @catalogue_2013_reference_with_proposed_order_contract
  Scénario: Chantier Mairie Académie
    Étant donné cité Académie niveau 3, Conseil présent, 7 000 or, 10 bois, 12 minerai
    Quand je lance la Mairie de coût 6 000/8/10 à 09:00 UTC pour 576 minutes
    Alors le solde devient 1 000/2/2 ; l'échéance est 18:36 UTC

  @FX-BUILD-002 @proposed_contract
  Scénario: Refus atomique et clé nouvelle
    Étant donné 7 000 or, 7 bois, 12 minerai alors que le chantier exige 8 bois
    Quand j'essaye avec clé K1, restaure du bois puis soumets avec nouvelle clé K2 et rejoue K2
    Alors K1 ne débite rien ; K2 débite une seule fois et ne produit qu'un ordre

  @FX-BUILD-003 @proposed_contract
  Scénario: Achèvement d'un chantier
    Étant donné un chantier se termine à 18:36:00 UTC
    Quand je règle l'état à 18:35:59, 18:36:00 puis rejoue l'échéance
    Alors l'effet est absent avant, actif à l'échéance et appliqué une seule fois

  @FX-ARM-001 @proposed_contract_using_simulator_limit
  Scénario: Limite des pelotons ordinaires
    Étant donné le simulateur prévoit sept pelotons ordinaires
    Quand je propose successivement 7, 8 puis un peloton à effectif nul
    Alors sept sont admis, huit et le peloton vide sont refusés

  @FX-ARM-002 @catalogue_2013_reference_with_injected_pool
  Scénario: Trois Gremlins Académie
    Étant donné trois recrues injectées, 1 000 or ; Gremlin coût 189, puissance 71 (catalogue 2013)
    Quand j'en achète trois sans présumer de la cadence de génération des recrues
    Alors je paie 567 or, conserve 433 or et obtiens 213 de puissance brute

  @FX-HERO-001 @proposed_contract
  Scénario: Mission exclusive du héros
    Étant donné un héros disponible et un ordre d'attaque admissible
    Quand j'engage le héros puis tente une autre action exclusive
    Alors la première action mobilise le héros, la seconde est refusée

  @FX-PVE-001 @proposed_contract_without_numeric_oracle
  Scénario: Mine libérée seulement après victoire
    Étant donné une mine occupée par des créatures neutres
    Quand une fixture de combat se termine par une défaite puis une fixture indépendante par une victoire
    Alors la mine reste occupée en défaite, puis produit immédiatement dès sa libération par victoire, selon les crédits périodiques du monde (Q39)

  @FX-PVE-002 @community_simulator_oracle_not_ubisoft_server
  Scénario: Oracle communautaire I contre C
    Étant donné 100 unités I contre 100 C à puissance fictive unitaire 100
    Quand je résous le cas synthetic counter_I_C de data/combat-reference-cases.json
    Alors le résultat de l'oracle est attaque gagnante, dispersions 50/100, morts 15/30

  @FX-MINE-001 @proposed_contract
  Scénario: Mine occupée non productive
    Étant donné une mine de bois avec PNJ encore présents
    Quand je demande sa production avant libération puis après victoire
    Alors elle ne produit pas avant libération ; elle commence immédiatement sa production après la victoire admissible (Q39)
~~~

## Définition de validation

Ces scénarios ne valent pas homologation d'un moteur historique. Pour chacun, le rapport de recette devra conserver le `ruleset_id`, la révision du catalogue, la date serveur, l'état initial, les commandes, les événements, le résultat attendu et le résultat obtenu. Exécuter au minimum : cas nominal, refus, frontière temporelle, concurrence et reprise. Un résultat de calculateur tiers doit rester un **oracle communautaire**, et non une preuve du serveur Ubisoft.

Les points `U03/U04/U05/U06/U09/U14/U17/U20/U24/U30` doivent être arbitrés pour qu'une boucle PAR-01 soit déclarée jouable ; les fixtures explicitement synthétiques peuvent aider à qualifier un moteur, mais pas remplacer une décision de saison.
