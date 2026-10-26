# V7.0 — tranche 4 : moteur d'itinéraires expérimentaux

**Statut : modèle de laboratoire, aucune certification Ubisoft MMHK saison 2.**

## Objet

Après l'introduction des mondes, villes et routes persistées (tranche 3), le fichier
`tools/jactari-port/world-journey.mjs` fournit un **calcul de durée isolé** :
- distance euclidienne sur carte torique, héritée du module de géométrie comparé au code MMHK-Plus ;
- points de passage explicites, sans invention de chemins territoriaux ;
- vitesse **fournie** et facteurs **fournis** pour chaque segment ;
- haltes en millisecondes avant chaque segment ;
- fenêtres UTC explicites d'interdiction de mouvement, fusionnées si elles se chevauchent ;
- contrôles de coordonnées, d'horodatages, de durées, d'overflow et immutabilité des entrées.

La constante `HISTORICAL_COMMUNITY_UI_SPEEDS` conserve les trois estimations
affichées par MMHK-Plus en 2013 (12 héros seul, 4 armée, 9,375 caravane).
**Elle n'est jamais appliquée implicitement.** Aucun type d'unité, bonus de héros,
territoire, halte historique ou trêve nocturne MMHK saison 2 n'est prétendu connu.

## Frontière de confiance

`planProvisionalWorldJourney` renvoie `estimatedArrivalAtMs`,
`authoritativeArrivalTime:false` et `historicalCertification:false`.
**Aucune** `trustedSchedule` n'est construite et aucun branchement automatique
sur `dispatchServerHeroMission` n'a lieu. Les missions continuent d'exiger
un horaire déterminé par la couche serveur. En particulier, le client ne doit
jamais pouvoir transmettre sa vitesse, son itinéraire ou un horaire planifié
pour obtenir le droit de combattre.

Le contrôle serveur de première ville protégée et les restrictions d'engagement
de la tranche 3 restent intégralement en place. Cette tranche n'ouvre pas le PvP.

## Exemples de vérification

- Une marche de (1,50) à (100,50), carte 100, vitesse expérimentale 4 unités/h :
  1 unité de distance, soit 15 minutes de marche avant interruptions.
- Un segment de 15 minutes traversant une fermeture d'une durée de 100 secondes
  doit arriver 100 secondes plus tard.
- Deux tronçons calculent chacun leur distance et leur multiplicateur, avec
  possibilité de pause explicite entre les deux.

Tests : `node --test tools/jactari-port/world-journey.test.mjs`.

## Prochaine tranche

1. Retrouver les véritables vitesses selon composition d'armée et saison.
2. Identifier les règles des territoires, haltes et trêves à partir d'archives
   sources suffisamment indépendantes et datées.
3. Définir les droits de déplacement / diplomatie au niveau serveur.
4. Intégrer une politique d'ETA approuvée, versionnée et atomiquement contrôlée
   avant d'autoriser des départs réels et leur ordonnancement.

**Aucune estimation communautaire ne constitue, seule, une règle du serveur Ubisoft.**
