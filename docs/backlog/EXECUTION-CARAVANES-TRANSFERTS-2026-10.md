# Exécution — caravane unitaire entre deux cités du même joueur

**Tranche P0** du 28 octobre 2026. Concerne partiellement US-ECH-010,
US-ECH-011, US-ECH-012, US-ECH-013 et les exigences REQ-CONVOY-01 /
REQ-ORDER-01. Ce document ne déclare **aucune US intégralement acceptée**.

## Références et arbitrages
- Le backlog de [commerce](categories/04-ECH.md) établit la saisie de sept
  ressources, la destination, la charge mixte et la réservation immédiate.
- [Décisions P0](../decisions/DECISIONS-P0-2026-10-23.md) :
  stocks propres à chaque cité ; convois non interceptables ;
  la protection débutant n'interdit pas les convois alliés entrants.
- [Clarification C09](../decisions/P0-CLARIFICATIONS-C01-C09-2026-10-23.md) :
  les convois répétitifs **sont une exception décidée** à l'interdiction des
  programmations générales, avec revalidation des stocks et droits à chaque
  départ. **Non encore réalisés** dans cette tranche ; US-ECH-014 à 017
  restent à traiter séparément.
- L'illustration SS-053 montre des maxima individuels de 30 000 or, 15
  ressources communes ou 6 rares. Leur somme **n'est pas** une capacité
  autorisée simultanément. Les ratios mixtes ne sont pas certifiés.

## Contrat technique effectivement implémenté
- **À qui envoyer ?** L'origine et la destination doivent être des villes
  distinctes, actuellement possédées par **le même compte dans le même monde**.
  Ce choix restreint constitue le laboratoire initial : échanges alliés et
  entre joueurs ne sont pas simulés. La première ville d'un débutant ne
  devient pas automatiquement éligible à une deuxième cité.
- **Préparation :** l'API renvoie la liste de destinations autorisées sans
  exposer l'état privé d'autres joueurs. Une requête de devis purement
  consultative recalcule les sept quantités, le poids total, le parcours
  torique, la durée expérimentale et les manques de stocks.
- **Capacité :** profil opérateur versionné par monde avec **sept poids
  strictement positifs et une seule capacité mixte**. La démo locale
  configure 30 000 unités : or 1, bois/minerai 2 000, ressources rares
  5 000, plus 20 secondes par pas torique. Ces valeurs ont été choisies
  pour la démonstration, pas certifiées Ubisoft saison 2.
- **Départ :** une ville avec marché actif est exigée. Le serveur vérifie
  la politique versionnée, les stocks, les sept entiers non négatifs,
  la charge et la destination ; décompte les ressources en verrouillant les
  stocks PostgreSQL et crée l'ordre dans la **même transaction**.
  Les biens sont immédiatement **en transit** et non dépensables.
  L'identifiant de convoi UUID assure le rejeu sans double débit.
- **Trajet :** un worker supervisé PostgreSQL suit des échéances
  enregistrées (aucune fin décidée par l'horloge du navigateur).
  Le convoi n'est pas interceptable ni attaquable.
- **Arrivée :** le worker verrouille les villes et les sept stocks, puis
  vérifie le propriétaire et les capacités (bonus actifs inclus) avant
  crédit unique. Le crédit, le statut et l'événement sont atomiques.
  Un stockage saturé maintient **toute** la cargaison en dépôt protégé,
  avec nouvelle vérification après 30 secondes, sans perte ni création.
- **Destination invalide à l'arrivée :** le worker déclenche une étape
  explicite de **retour vers l'origine**, sans crédit à l'ancien propriétaire.
  Si le stockage d'origine est également indisponible, la cargaison
  reste protégée jusqu'à résolution. Le retour expérimental reprend la
  durée de la route figée au départ.
- **Suivi :** journal owner-scoped et signalement de l'échéance réelle dans
  la frise des 12 prochaines heures ; aucune position d'une cité devenue
  étrangère n'est divulguée.

## API ajoutée
- GET /api/v1/me/cities/{city_id}/caravans
- GET /api/v1/me/cities/{city_id}/caravans/quote
- POST /api/v1/me/cities/{city_id}/caravans

Les politiques sont opérateur uniquement, sans endpoint public de réglage
de poids ou de vitesse.

## Démonstration locale et vraie seconde cité
La démo normale garde sa première cité unique pour respecter la
protection débutant. Après avoir démarré la pile locale et construit le
Marché, le développeur peut **volontairement** créer une deuxième cité
de laboratoire avec la commande :

    python3 tools/local/stack.py convoy-demo --username joueurdemo --enable-second-city

Cette commande refuse tout environnement non local, conserve le compte,
les mots de passe et les stocks existants, et reste idempotente. La seconde
ville n'est pas une mécanique de colonisation accessible à un joueur
normal. La CI crée cette destination **après** le premier parcours
navigateur, pour ne pas modifier les scénarios initiaux de ville unique.

## Vérifications
- Tests PostgreSQL : stocks de sept ressources, refus de route étrangère,
  charge mixte, profil absent, idempotence, deux envois concurrents, livraison
  unique, capacité saturée, récupération différée, destination devenue
  étrangère, non double-crédit et verrou concurrent du worker.
- Test Chromium de la pile Docker : deuxième cité explicitement autorisée
  pour le laboratoire, devis, départ, livraison effective par worker,
  vérification des stocks de la ville destinataire.
- Frise : seuls les événements de convoi effectivement envoyés, et
  autorisés au compte, sont présentés.

**Hors périmètre :** caravane alliée, siège, capture, politique complète
d'entrepôt régional, formule historique de charge, bonus de marché
sur capacité, aller-retour permanent, convois répétés, politique d'attente,
règle de balance commerciale. Ces domaines ne sont pas implémentés
implicitement dans cette tranche.
