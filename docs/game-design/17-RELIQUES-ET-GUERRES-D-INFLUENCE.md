# Reliques territoriales, domination et stratégie d'alliance

**Mise à jour du 23 octobre 2026 :** quatre jours est désormais le choix du projet, corroboré par le tutoriel 2009 et la FAQ 2013. Le contrôle des bâtiments mondiaux est un **objectif stratégique central du midgame** ; la fin de campagne se déplace ensuite vers les Larmes et monuments de Graal.

## Valeurs retrouvées : influence par paliers

[FAQ 2013 — Might-and-Magic.ru](https://www.might-and-magic.ru/articles/_/heroes-kingdoms/hk-towns/hk_city_faq) : domination = moyenne de puissance militaire sur **quatre jours** + domination apportée par les constructions ; recalcul quotidien (concordant avec [transcription française du tutoriel 2009](https://forum.hardware.fr/hfr/JeuxVideo/PC/kingdom-tactic-gratuit-sujet_154147_1.htm)).

| Domination totale | Rayon |
| ---: | ---: |
| 0 à 29 999 | 1 |
| 30 000 à 99 999 | 2 |
| 100 000 à 249 999 | 3 |
| 250 000 à 499 999 | 4 |
| 500 000 à 999 999 | 5 |
| **≥ 1 000 000** | **6** |

**Attention :** le souvenir de 500 000 correspond au palier de **rayon 5**, dans la version documentée. La transférabilité exacte de cette table vers **la saison 2 ciblée** reste à vérifier. Le rayon représente un **disque discret sur la carte torique**, pas un carré 13×13. Les 113 cases d'un disque de rayon 6 sont un calcul géométrique sans adversaire ni obstacle.

La domination des bâtiments n'est pas nécessairement égale au *niveau* de la ville : le tutoriel 2009 indique un apport approximativement lié au coût en or (environ 20 %) ; la FAQ 2013 dit que les constructions plus coûteuses rapportent plus de domination. **Ne pas remplacer cela par une formule linéaire niveau × coefficient inventé.** La table exacte des bâtiments et les instants d'activation nécessitent une extraction.

## Les trois bâtiments mondiaux générant des bonus d'alliance

La [transcription du tutoriel d'époque](https://forum.hardware.fr/hfr/JeuxVideo/PC/kingdom-tactic-gratuit-sujet_154147_1.htm) décrit :

| Site | Effet nominal par exemplaire | Bénéficiaires |
| --- | --- | --- |
| **Sphinx** | **−7 %** de coût d'entretien des cités | Membres de l'alliance contrôlante |
| **Trésorerie des Nains** | **+5 %** de production d'or | Membres de l'alliance contrôlante |
| **Dolmen du savoir** | **+10 %** d'XP de combat | Héros des membres de l'alliance |

Les effets sont indiqués comme **cumulables** : cinq Sphinx apportent nominalement 35 % de réduction d'entretien, avant d'éventuels autres modificateurs et plafonds non retrouvés. Les joueurs sans alliance peuvent aussi profiter d'un bâtiment mondial présent dans leur contrôle territorial selon le tutoriel 2009. La distinction exacte entre somme des pourcentages, arrondis, minimum de coût et interdiction d'un bonus de 100 % reste à spécifier.

**Il faut distinguer ces trois types des obélisques et autres sites liés à la voie de Domination ou aux Larmes de la guerre de fin de monde.** Toutes les structures visibles sur la carte ne délivrent pas automatiquement un bonus économique collectif.

## Cycle quotidien de possession

1. À chaque échéance quotidienne du fuseau du monde, obtenir la puissance des troupes stationnées dans chaque ville, sous réserve de l'ordre du règlement horaire de l'entretien et des mouvements.
2. Calculer la moyenne glissante des quatre journées précédentes par ville (démarrage et snapshots manquants à déterminer).
3. Ajouter la domination effective des bâtiments et calculer les paliers de rayon.
4. Pour chaque case candidate, calculer la force locale des villes qui l'atteignent et comparer les alliances rivales. La loi exacte de décroissance avec la distance manque ; le prototype expérimente actuellement `P/(1+d)^2`, en distinguant contribution d'une ville et regroupement de ses alliées.
5. Affecter chaque case à l'alliance gagnante (ou à un statut contesté explicite lorsque nécessaire), sans **transférer la propriété des cités déjà implantées**.
6. Pour chaque **bâtiment mondial de bonus** situé dans une case contrôlée, réévaluer le contrôleur et recalculer les effets applicables à **tous ses membres**. Journaliser les changements pour les rapports, leur valeur stratégique et la reprise après panne.
7. **Ne pas rétroagir les nouveaux bonus sur les journées précédentes.** Leur application commence à l'instant décidé et versionné ; ordre exact des bonus et entretien au même instant encore à qualifier.

## Trois boucles stratégiques

**Early game :** construire sa première ville, libérer la région et constituer une armée défendable sans ruiner son économie. Les bâtiments donnent déjà une domination de base.

**Midgame : guerre des frontières et des reliques.** Une alliance peut :
- stationner davantage de troupes, financer leur entretien pendant plusieurs jours, pousser une frontière afin d'incorporer un bâtiment mondial ;
- conserver des points de contrôle adjacents, poser une nouvelle cité vers un site précieux et rendre l'expansion adverse plus coûteuse ;
- prendre un risque coordonné pour gagner un bonus qui améliore la production d'or, l'XP ou l'entretien de l'alliance **entière** ;
- perdre ce bonus lorsqu'une influence adverse progresse ou que sa propre puissance moyenne diminue. **Les reliques doivent être dynamiques et disputables**, pas bloquées définitivement au premier acquéreur.

**Endgame :** les priorités se déplacent vers les Larmes, monuments et conditions de victoire collective ; les bonus des bâtiments mondiaux demeurent économiquement utiles, mais ne sont pas en eux-mêmes des monuments de Graal.

## Risques d'équilibrage et tests prioritaires

1. **Effet boule de neige :** contrôler plusieurs Sphinx réduit le coût d'entretien, ce qui permet de financer plus de troupes, lesquelles augmentent la domination et aident à contrôler encore plus de sites. Tester 0–10 Sphinx et une limite explicite de réduction nette, plutôt que supposer un plafonnement Ubisoft.
2. **Effet richesse :** l'or de Trésoreries favorise l'expansion et les renforts ; simuler l'évolution des écarts entre grandes et petites alliances.
3. **Effet expérience :** Dolmens augmentent la progression des héros ; vérifier la vitesse d'accroissement de puissance militaire et l'avantage en PvP.
4. **Répartition mondiale :** le maillage quasi régulier des sites doit garantir des opportunités disputables par types, sans les concentrer uniquement près des zones de départ.
5. **Changements de propriétaire :** tester une relique qui passe de A à B, devient non contrôlée, revient à A ; absence de double attribution, conservation des historiques.
6. **Maintien quotidien :** tester gain de rayon avec quatre jours de puissance élevée, perte progressive lorsque la garnison diminue, et effet d'une attaque réduisant les troupes à l'approche du recalcul.
7. **Population 70 % :** les mondes sous-peuplés doivent conserver des *objectifs territoriaux accessibles et contestables*, tandis que le surbooking doit accroître l'enjeu des reliques sans empêcher toute expansion.

## Sources, décisions et statuts

- **Décidé par l'utilisateur :** fenêtre **4 jours** pour MMHK-like ; niveau/bâtiments de ville contributifs ; bonus collectifs des reliques et leur importance centrale ; guerre des Larmes au endgame.
- **Documenté historiquement :** tableau de paliers 2013, trois bonus nominaux et leur cumul dans le tutoriel 2009 ; recalcul quotidien et comparaison des influences par case.
- **À retrouver pour S2 :** table exacte de domination des bâtiments, décroissance spatiale, logique de cumuls alliés, règles sur les égalités, taux bonus effectifs en S2 et intervalles de transition.
- **Propositions à tester :** loi de décroissance quadratique, addition des scores des cités alliées, instant de changement des bonus, équilibre des gains d'alliance.

[Catalogue structuré](../../data/reference/world-influence-and-sites-2009-2013.json) · [Prototype d'influence](../../tools/influence_simulation_lab.py) · [Dossier précédent](16-INFLUENCE-LISSEE-ET-CONTESTEE.md) · [Profil S2](../../data/rules/mmhk-like-s2-policy-draft.json).
