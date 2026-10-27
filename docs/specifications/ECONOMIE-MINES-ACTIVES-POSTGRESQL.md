# MMHK-like — Tranche économie : mines actives et worker PostgreSQL

**28 octobre 2026 · portée expérimentale · aucune cadence Ubisoft MMHK S2 certifiée.**

## 1. Règles retenues et limites des sources

Le [registre P0](../decisions/DECISIONS-P0-2026-10-23.md) précise :
- stocks **indépendants par cité** ;
- production affichée en **unités par jour**, et créditée périodiquement ;
- 15 minutes de périodicité est une **hypothèse**, pas une certitude ;
- les **fractions** sont conservées et ne deviennent disponibles qu'une
  fois une unité entière accumulée ;
- bonus **additionnés**, puis appliqués à la production de base ;
- lorsqu'une réserve atteint sa capacité, la production excédentaire est
  **perdue**, pas mise en attente ;
- la région initiale Havre comprend or, bois, minerai et cristal.

**Inconnus :** montant initial exact, rendement de chaque mine, cadence
officielle, bonus des bâtiments et capacité effective des silos en S2.
La tranche refuse donc d'inscrire de tels nombres en dur.

## 2. Données persistantes

`002_economy.sql` ajoute :
- `city_stocks.capacity` (nullable jusqu'à configuration explicite) ;
- `city_economy_clock` : fréquence choisie par l'opérateur,
  `last_tick_at`, activation et révision monotone ;
- `city_mine_rates` : rendement journalier de base, bonus additif,
  fraction de réserve séparée, précision décimale **18 chiffres** ;
- `city_economy_events` : un événement vérifiable par révision de ville,
  horodatages, nombre de périodes, montants crédités et surplus perdus.

Une ville n'a **aucune production active par défaut**. L'opérateur
provisionne exactement les quatre types de mines de la première région
Havre et doit fournir une cadence et une capacité pour chacune d'elles.
La commande est volontairement **insert-only** : pas de reconfiguration
rétroactive de rendements pendant une période d'accumulation non créditée.

## 3. Calcul déterministe

Pour une mine donnée :

```text
durée = nombre de périodes échues × durée d'une période
quantité = base/jour × (1 + somme des bonus) × durée/86400 + fraction conservée
entiers = floor(quantité)
fraction nouvelle = quantité − entiers
crédit = min(entiers, capacité − stock actuel)
perdu = entiers − crédit
```

Les opérations utilisent `Decimal`, les fractions stockées dans
`NUMERIC(30,18)`, et une précision intermédiaire élevée. Les valeurs
jusqu'à la 18e décimale sont conservées ; les chiffres au-delà de ce
seuil sont tronqués de façon déterministe. Une capacité atteinte ne
crée pas de réserve de fractions ou d'unités en attente.

Un worker retardé rattrape uniquement les périodes **entières** échues,
dans la limite paramétrable `max_ticks_per_city`; une période partielle
n'est jamais payée en avance.

## 4. Concurrence et reprise

`run_economy_batch` prend une connexion PostgreSQL `autocommit=True`
et effectue une transaction **distincte pour chaque ville** :
1. sélection d'une ville échue avec `FOR UPDATE SKIP LOCKED` ;
2. verrouillage des lignes de production et des stocks ;
3. calcul des entiers, fractions et plafonds ;
4. mise à jour des réserves et de la dernière période payée ;
5. écriture de l'événement unique `(city_id,revision)` ;
6. commit de la transaction.

Les périodes ne peuvent être créditées deux fois par deux workers.
Après crash, les écritures de la ville sont soit entièrement validées,
soit entièrement annulées ; l'exécution suivante repart de la dernière
période persistée.

Le programme `python -m mmhk_api.economy_worker --once` est un
**exécuteur borné**, sans boucle de daemon, planification d'OS, ni
connexion Redis. La source du temps effectif est `clock_timestamp()`
dans PostgreSQL ; les horloges de test sont injectées seulement par le
harnais Python de validation.

## 5. Consultation client

L'API `GET /api/v1/me/cities/{city_id}` reste **strictement en lecture**,
filtrée par identité et appartenance SQL. Elle renvoie en supplément :
- `production_active` ;
- `production_per_day` (profil expérimental, chaînes décimales exactes) ;
- `tick_seconds` et `next_credit_at` ;
- `historical_economy_certified:false`.

La fiche Next.js affiche la cadence journalière et l'échéance serveur,
ou un message indiquant que la production est inactive. Le nombre
de stocks affiché reste issu de PostgreSQL **et non de Redis**.
Aucune API d'achat, construction ou paiement n'a été créée.

## 6. Tests d'intégration

Les tests PostgreSQL réels couvrent : conservation des fractions,
rattrapage après une nouvelle connexion, double exécution sans nouveau
crédit, plafond et surplus, absence de production non configurée,
limite de rattrapage, verrouillage entre deux workers, rejet des paramètres
d'opérateur invalides, bonus additif, rollback complet en cas de défaut
et lecture par le propriétaire sans fuite vers un compte étranger.

```bash
MMHK_TEST_DATABASE_URL="$MMHK_DATABASE_URL" python -m pytest -q apps/api/tests
```

La CI du projet compile Next.js et exécute également le banc Jactari
Python/JavaScript. Les tests historiques Jactari sous Node.js demeurent
indépendants.

## 7. Mise en route et travaux restants

Voir [le guide FastAPI](../../apps/api/README.md) pour les commandes
d'administration, le premier compte, le monde et la ville, et
le paramétrage explicite des rendements. Aucun rendement présenté en
exemple n'est une donnée historique.

**Non livrés :** services workers en continu et leur supervision,
politique de reconfiguration de mine avec conservation d'un historique
des changements, augmentation des capacités par bâtiments,
construction urbaine, recrutement, entretien militaire, mises à
jour redistribuées, Redis comme cache versionné, protection débutant
dans la nouvelle API et commandes PvP.

La prochaine tranche pourra implémenter **la première construction
urbaine**, avec transaction de dépense, règle P0 d'une seule construction
active et achèvement par worker PostgreSQL. Les prix/durées devront
être tirés de preuves ou fournis comme **profils expérimentaux**
explicitement versionnés, jamais présentés comme valeurs Ubisoft S2.

**`productionBattleArbiterAllowed=false` reste inchangé.**
