# Saisons, variantes et cible de fidélité

## Pourquoi un profil de règles est indispensable

MMHK n’a pas eu une seule règle immuable. Une mécanique peut être bien attestée et néanmoins fausse pour le monde que l’on veut reproduire. L’année de rédaction d’un guide n’est pas nécessairement la saison de toutes ses sections. Un outil mis à jour peut également garder des données anciennes.

| Période/profil documentaire | Éléments attestés | Conséquence pour la reconstruction | Sources |
| --- | --- | --- | --- |
| Lancement et premières saisons | Quatre factions initiales ; campagnes persistantes et combats automatiques ; offre gratuite et options payantes | Ne pas prendre la fiche iPad de 2010 pour la date de lancement navigateur | SRC-04, SRC-05, SRC-08, SRC-09 |
| Saison 2 | Arrivée des Sylvains ; continuité de l’expérience PvP classique | Candidat naturel pour le souvenir du jeu à cinq factions | SRC-11 |
| PvP classique, guides enrichis jusqu’en S3 | Trois voies d’accès aux Larmes ; monuments d’alliance ; seuil collectif maintenu dans la durée | Profil documentaire `classic_pvp`, détails de version à verrouiller | G01–G04 |
| Saison 3, coopération PvE | Éveil d’Arkath, forteresses runiques, attaques PNJ et cérémonie finale | Condition de victoire et adversaires distincts du PvP | SRC-12, G23 |
| Saison 3, évolutions transversales | Balance économique, changements d’hérédité et de magie | Options versionnées, pas règles universelles du lancement | G14, G17, G27 |
| Saison 4, fin PvP | Tournoi par manches, niveaux de compétition, Larmes temporaires | Remplace la fin classique ; ne pas ajouter un tournoi au seuil des 13 Graals | G25 |
| Saison 4, hérédité | Barèmes distincts PvP/PvE et mondes stratégiques | Résolution de fin et transmission intermondes propres au profil | G28 |
| Outils communautaires au commit du 09/12/2013 | Tables, calculateur, maintenance, estimations de distance | Source technique précise mais composite ; ne prouve ni une saison complète ni l’algorithme serveur | CODE-01 |

## Profil principal confirmé et variantes archivées

| Identifiant proposé | Contenu | Statut |
| --- | --- | --- |
| `classic_pvp` | Villes, régions, cinq factions de base étudiées, alliances, conquête, trois voies et Guerre des Larmes | **Choix utilisateur confirmé** ; Guerre des Larmes ; saison exacte et réglages à qualifier |
| `arkath_pve` | Même socle de développement, coopération et menaces PNJ spécifiques | Hors périmètre principal, documentation conservée |
| `tournament_pvp_s4` | Tournoi, manches, appariements par niveau et victoire spécifique | Documenté comme variante ; pas activé dans le socle |
| `successor_original` | Univers indépendant et changements de gameplay volontairement décidés | Étape ultérieure ; tout écart devra avoir une justification de design |

Un `ruleset_id` doit accompagner chaque monde, chaque catalogue chargé et chaque rapport de combat. Une correction documentaire ne modifie pas rétroactivement un monde déjà ouvert. Les essais comparant deux saisons doivent porter des identifiants différents.

## Contradictions à conserver explicitement

| Sujet | Variante A | Variante B | Position actuelle |
| --- | --- | --- | --- |
| Entretien : champs | Guide villes : +5 % | Calculateur tardif : +10 % | Deux règles datées, aucun compromis à 7,5 % |
| Entretien : sphinx | Guide : réduction de 7 % | Calculateur : 5 % | Ne pas importer un barème sans son contexte |
| Admission au combat PvP | Guides décrivent des ratios approximatifs | Code : seuils sur `floor(30 × ratio)` | Référence calculateur exacte ; comportement serveur non prouvé |
| Fin PvP | Maintien de 13 monuments durant 14 jours | Tournoi S4 par manches | Conditions mutuellement exclusives |
| Factions | Cinq factions jouables étudiées | Sept noms dans les tables, plus catégories négatives | Deux factions de contenu PNJ ne deviennent pas jouables par déduction |
| Source de données | En-tête `v.4.1.3-MTR`, 04/03/2013 | Commit intitulé « Up to 4.5 », 09/12/2013 | Conserver les deux métadonnées |
| Capacités gratuites | Durées et limites variables selon les fiches | Services et boutique modifiés au fil du jeu | Monétisation historique séparée des règles cœur |

La date exacte du monde de référence, le fuseau de sa trêve, son éventuel abonnement et ses options stratégiques doivent être établis à partir d’une capture ou d’un témoignage contextualisé. Cette décision peut attendre : le modèle et les contrats fonctionnels sont préparés pour plusieurs profils.

## Apport du corpus visuel et décision de périmètre

Le [profil classique](../specifications/PROFIL-PVP-CLASSIQUE.md) formalise DEC-001 à DEC-006. `v0.1.10`, `v0.7…`, `v1.5…` et `v4.1…` sont des inscriptions ou familles de client observées dans les captures ; elles ne doivent pas être converties mécaniquement en numéros de saison. SS-040 est explicitement un contexte x200 de test. Les données Jactari importées sont identiques aux six tables et au calculateur déjà épinglés en 2013 ; elles ne résolvent pas U02.

La famille v1.5 est proposée comme référence graphique initiale. Les images plus tardives complètent l’étude des factions et des modales, sans activer leur mode de victoire ou leur boutique dans le profil classique.
