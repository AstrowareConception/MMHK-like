# Programmes de caravanes — tranche US-ECH-014 à 017 (laboratoire)

Ce document trace une implémentation **partielle et expérimentale**, sans
affirmer que les menus ou contraintes MMHK saison 2 sont reproduits à l'identique.

## Ce que les sources établissent
- **SS-053** montre un champ « 4 fois », une option « La quantité exacte » et
  « Pas d'attente ». Le sens de *4 fois*, les autres modes, et les délais
  exacts **ne sont pas complètement documentés** (U28).
- La **clarification C09** du projet décide que les convois répétés sont
  une exception explicite à l'interdiction des actions ordinaires
  programmées. Les stocks et les droits doivent être revérifiés **à chaque
  départ**, jamais uniquement lors de la création du programme.
- US-ECH-014 : distinguer programme et trajets ; -015 : comportement en
  cas de manque ; -016 : attente et protection contre les boucles ;
  -017 : annuler les futurs départs sans effacer les précédents.

## Choix explicitement adoptés pour le laboratoire
- « **4 fois** » signifie **quatre départs au total**, pas quatre
  répétitions *après* un premier départ. Plage autorisée 2–12.
- Les deux modes disponibles sont « **quantité exacte** » et « **jusqu'à
  concurrence du stock disponible** ». Le deuxième est une option
  expérimentale qui plafonne séparément chaque ressource à son stock.
  Un chargement entièrement vide est reporté, jamais envoyé.
- « **Pas d'attente supplémentaire** » correspond à un **intervalle
  minimal technique de 60 secondes entre deux départs**, non à une
  boucle instantanée. L'interface propose 60 s, 2 min, 5 min, 15 min et
  1 h ; le backend contrôle 60–86 400 s.
- Si la quantité exacte manque, le programme attend et réessaie
  **au plus tôt 60 secondes plus tard**. Le stock futur n'est pas réservé.
- Si les droits, le Marché ou le profil opérateur ne sont plus valides,
  le programme est **suspendu** ; il n'expédie rien de nouveau.
  Cette première tranche ne permet pas de reprendre une version
  devenue obsolète sans créer un nouveau programme.
- Maximum de cinq programmes inachevés par cité dans le laboratoire,
  pour éviter une consommation disproportionnée du worker.
- Les seuls destinataires demeurent deux cités du **même compte et du
  même monde** : les caravanes alliées restent hors périmètre.
- La livraison reste gérée par le **worker de caravanes** déjà déployé,
  avec dépôts protégés lorsque la capacité du destinataire est saturée.

## Contrat technique et garanties
Migration 017 : \`caravan_dispatch_programs\`, \`caravan_program_stop_orders\`
et référence nullable \`(program_id,program_sequence)\` dans
\`caravan_shipments\`. Une contrainte d'unicité interdit deux trajets
portant le même numéro dans un programme.

Chaque création utilise un UUID stable et conserve les paramètres validés :
origine, destination, quantité des sept ressources, mode, fréquence,
nombre total, politique de charge et son **instantané** (capacité,
poids et vitesse). Aucune ressource n'est débitée à ce moment-là.

Le worker traite chaque programme dû sous verrou
\`FOR UPDATE SKIP LOCKED\`, verrouille les deux cités et les lignes de
stock dans un ordre déterministe et réévalue :
- identité propriétaire et destination ;
- marché opérationnel à l'origine ;
- version, capacité, poids et vitesse de la politique ;
- charge admissible et quantité disponible.

L'expédition utilise ensuite **la transaction atomique préexistante**
de \`send_caravan\` avec un UUID dérivé de l'identifiant du programme et
du numéro du départ. L'insertion de la caravane et l'avancement du
compteur du programme appartiennent à **la même transaction
PostgreSQL**. Une panne ne peut confirmer l'un sans l'autre.

L'arrêt demandé par le propriétaire possède son propre UUID idempotent
et verrouille le programme **comme le worker**. Si le worker acquiert
le verrou en premier, son départ est réel et demeure inchangé ; si
l'arrêt l'acquiert en premier, aucun nouveau départ n'est possible.
Un rejeu de l'ordre d'arrêt restitue son résultat.

Le journal utilisateur affiche le total prévu et effectué, le prochain
essai, le motif d'une attente/suspension et chaque caravane numérotée.
La frise affiche les **tentatives programmées** sans promettre que les
stocks permettront réellement de partir.

## Contrôles de recette
- Création idempotente, permission des villes, paramètres invalides,
  absence de réservation anticipée, quota.
- Deux départs réellement distincts, puis livraison par le worker
  existant et consommation du programme.
- Mode exact avec suspension temporaire faute de ressources ;
  mode disponible avec chargement partiel, puis reprise après réappro.
- Deux workers simultanés, un seul ordre pour un numéro de départ.
- Course arrêt/départ, arrêt idempotent, protection des caravanes
  déjà parties.
- Suspension après perte de propriété ou changement de tarif.
- Parcours Chromium local : création d'une seconde ville de laboratoire,
  programme, deux départs différés, vraie livraison des ressources.

**Dépendance** : branche \`main\` contenant déjà la migration 016.
**Exclusions** : caravanes interalliées, enchères historiques, bonus de
capacité historiques, annulation d'un trajet déjà parti, séquences
complexes « sans attente » non documentées et système de reprise
administrative des programmes suspendus.
