# Roadmap MMHK-like — du prototype V5.3 au jeu jouable

23 octobre 2026. **Objectif :** une campagne S2 inspirée de MMHK, peuplée à 70 % de la capacité nominale, avec villes, alliances, guerres d'influence pour les reliques et endgame Guerre des Larmes.

## État actuel

V5.3 ne calcule que **sept cas de référence** et possède vingt assertions : ce n'est PAS un moteur Jactari complet. V5.2 gère un prototype d'ordres concurrents et d'entretien par peloton, mais le serveur de jeu final n'existe pas encore. Les paliers documentés de domination et les bonus de Sphinx/Trésorerie/Dolmen sont intégrés au laboratoire, pas à un moteur S2 prouvé.

## Audit Jactari réalisé aujourd'hui

Le client `data/Jactari/src/scripts/combat.min.js` comprend :
- `simulation_combat` : duel de pelotons, pertes, dispersion, arrondis ;
- `bonus_attaque_defense` : armes, héros, fortifications ;
- `simulation_rencontre` : orchestrateur d'un affrontement ;
- `lancement_sorts` et `tir_engins_siege` : capacités et siège.

Le code est mélangé à jQuery et à des variables globales ; un serveur doit extraire un cœur sans DOM. **Licence source GPLv3+** : vérifier la compatibilité et les obligations avant d'incorporer du code dérivé. [Cartographie des fonctions](../../data/analysis/jactari-extraction-map-2026-10-23.json).

## V5.4 — Noyau de combat fidèle (priorité immédiate)

1. Versionner les scripts V5.2 et V5.3 actuellement uniquement dans les archives de conversation.
2. Formaliser les objets `BattleRequest`, `BattleEvent`, `BattleReport`, les sept slots, les bonus et les erreurs de cas non pris en charge.
3. Porter `simulation_combat` en conservant **exactement** les arrondis. Générer des références en exécutant le JS historique sur des armées choisies.
4. Ajouter progressivement les phases de `simulation_rencontre` : arme, défense, magie, tir, siège, fuite, dispersion, pertes définitives et expérience.
5. Tester le port par **différentiel** contre Jactari sur un corpus versionné ; **ne jamais inventer les résultats** de compositions non supportées.

**Livrable :** un moteur de combat indépendant de l'interface et une suite de tests vérifiables, avant tout calcul PvP d'équilibrage.

## V5.5 — Temps, armées et conflits simultanés

Missions aller/retour, délais, rappel, trêve nocturne configurable, haltes, protection de sept jours, ordres atomiques, conservation des pelotons, stockage par cité, entretien horaire, replay sans double exécution. Les événements modifient les garnisons, mais l'influence ne change qu'au relevé quotidien sur **quatre jours**.

**Livrable :** un ordre militaire complet de la ville jusqu'au rapport puis au retour.

## V6 — Campagne de reliques (premier vrai test de stratégie)

Deux alliances, plusieurs villes et joueurs, Sphinx/Trésoreries/Dolmens, prise et reprise de sites par expansion et combats. Calculer la valeur **nette** des opérations pour toute l'alliance : bonus collectifs moins entretien, recrutement, pertes et colonies.

**Critère :** capturer, perdre puis reprendre un Sphinx, avec bilan économique auditable et un seul propriétaire par site à chaque recalcul.

## V7 — Dimensionner les mondes à 70 %

Après validation de V6, simuler 20/40/55/70/85/100 % de remplissage, joueurs inactifs, spawns amis/ordinaires, alliances et un à dix cités. Comparer les densités 100–220 régions/joueur selon contacts rivaux, possibilités d'expansion, reliques disputables et équité des nouveaux joueurs. **Ne pas figer 120 ou 170 aujourd'hui.**

## En parallèle — premier jeu réellement jouable

Tranche Havre : région 5×5, ville, mines, production locale, construction, recrutement T1–T3, premier héros et PvE, puis colonisation, alliances et PvP. Ajouter ensuite influence et reliques ; la Guerre des Larmes/Graal conclura la saison.

## Prochaine livraison concrète

**Intégrer le code Python existant au dépôt**, puis écrire un adaptateur de combat JavaScript testable avec un premier duel de Jactari et ses fixtures. Ne pas continuer à accumuler seulement des PDF/ZIP et des statistiques de laboratoire.
