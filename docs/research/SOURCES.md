# Sources et méthode

Consultation : **22 octobre 2026**. Les sources publiques sont des traces historiques ; elles ne sont pas des descriptions du service actuel, qui est fermé. Les liens fournis ont tous été examinés. Les pages inaccessibles sont conservées comme pistes et ne justifient aucune règle chiffrée à elles seules.

## Échelle de preuve

| Marque | Sens | Ce que cela ne garantit pas |
| --- | --- | --- |
| OBS-CODE | Expression ou donnée lue dans une révision déterminée d’un outil communautaire | Identité avec l’algorithme Ubisoft |
| OBS-IMAGE | Élément lisible ou visible dans une capture identifiée | Animation, formule, disponibilité universelle ou comportement après clic |
| DECISION-USER | Choix explicite confirmé par le porteur du projet | Authenticité historique des paramètres associés |
| DOC | Description explicite dans une source consultée | Exactitude, exhaustivité ou applicabilité à chaque saison |
| COR | Recoupement compatible entre sources indépendantes | Absence de changement ultérieur |
| HYP | Déduction signalée, à tester | Règle historique démontrée |
| PROP | Choix recommandé pour l’implémentation future | Fonctionnement original du serveur |
| INCONNU | Information manquante, contradictoire ou inaccessible | Permission de choisir un chiffre arbitraire |

Une source contemporaine est préférée à une fiche agrégée récente ; une source technique précise est préférée à une approximation rédactionnelle pour décrire le calculateur, pas automatiquement pour décrire le serveur. Les témoignages restent nécessaires pour départager certaines variantes. Les guides russophones sont résumés en français ; leur fuseau, leur traduction et leur contexte de serveur ne sont pas transposés sans contrôle.

## Les neuf liens fournis

| ID | Source | Accès / valeur documentaire |
| --- | --- | --- |
| SRC-01 | [Portail JeuxOnLine MMHK](https://mmhk.jeuxonline.info/) | Accessible ; point d’entrée vers archives et actualités |
| SRC-02 | [Archangel Castle, discussion 9300](https://www.archangelcastle.com/acforum/viewtopic.php?t=9300) | Non récupérable lors de la consultation ; ne pas inventer son contenu |
| SRC-03 | [TotG, pétition pour le retour](https://site.totg.fr/petition-pour-le-retour-de-mmhk/) | Accessible ; contexte associatif de relance et fermeture, pas un manuel de règles |
| SRC-04 | [Jeuxvideo.com, fiche 66921](https://www.jeuxvideo.com/jeux/jeu-66921/) | Accessible ; identification et pistes vidéos/images |
| SRC-05 | [Gamekult, fiche](https://www.gamekult.com/jeux/might-magic-heroes-kingdoms-103859.html) | Fiche portant sur iPad ; date à ne pas utiliser pour le lancement navigateur |
| SRC-06 | [SensCritique, détails](https://www.senscritique.com/jeuvideo/might_and_magic_heroes_kingdoms/264918/details) | Métadonnées discordantes sur studio/genre ; non retenues pour les règles |
| SRC-07 | [Fandom, lien fourni](https://mightandmagic.fandom.com/wiki/Might_and_Magic:_Heroes_Kingdoms) | Chemin fourni non exploitable ; [entrée corrigée](https://mightandmagic.fandom.com/wiki/Might_%26_Magic%3A_Heroes_Kingdoms) repérée, texte intégral non récupéré ; extraits de recherche seulement |
| SRC-08 | [JeuxOnLine, fiche du jeu](https://www.jeuxonline.info/jeu/Might_and_Magic_Heroes_Kingdoms) | Accessible ; historique et services, avec métadonnées commerciales à contextualiser |
| SRC-09 | [Gameblog, lancement](https://www.gameblog.fr/jeu-video/ed/news/heroes-of-might-magic-kingdoms-cest-parti-13087) | Article du 26/02/2010 ; présentation contemporaine du jeu |

## Compléments éditoriaux et pistes

| ID | Source | Usage |
| --- | --- | --- |
| SRC-10 | [Wikipédia, Heroes Kingdoms](https://en.wikipedia.org/wiki/Might_and_Magic%3A_Heroes_Kingdoms) | Géométrie régionale, vue d’ensemble ; source secondaire |
| SRC-11 | [Archangel Castle, actualité 411](https://www.archangelcastle.com/news_411/) | Annonce de saison 2 et Sylvains |
| SRC-12 | [JeuxOnLine, Éveil d’Arkath](https://www.jeuxonline.info/actualite/32578/lancement-saison-3-eveil-arkath-heroes-kingdoms) | Annonce contemporaine S3, PvE coopératif et boutique |
| SRC-13 | [Vie de Geek, aperçu](https://www.viedegeek.fr/article/preview-might-and-magic-heroes-kingdoms/) | Aperçu historique, rythme asynchrone et héros |
| PISTE-01 | [Ancien portail TotG](https://joomla.totg.fr/index.php/autres-jeux-menu/mmhk-menu) | Extraits indexés mentionnant calculateurs d’entretien et siège ; site suspendu lors de l’ouverture. Les formules non lues ne sont pas reprises |
| PISTE-02 | [Forum TotG](https://forum.totg.fr/) | Accès suspendu ; témoignages et sauvegardes associatives à rechercher |

## CODE-01

**[Aendawyn/MMHK-Plus](https://github.com/Aendawyn/MMHK-Plus/tree/e8d862d82741986759b88012421aed8e8175e26e)**, commit `e8d862d82741986759b88012421aed8e8175e26e`, 9 décembre 2013, message « Up to 4.5 ». Projet communautaire public archivé. En-têtes : Jactari, Aspirin, Aendawyn ; GPL-3.0-or-later. En-tête des données : `v.4.1.3-MTR`, 4 mars 2013. Il ne s’agit pas d’une fuite ni du code serveur Ubisoft.

| Sous-référence | Fichier / symbole étudié | Utilisation |
| --- | --- | --- |
| CODE-01-DATA | `Jactari/src/scripts/donnees.*.min.js` | Six tables déclaratives, extraites avec vérification d’empreinte |
| CODE-01-COMBAT | `Jactari/src/scripts/combat.min.js` : `simulation_rencontre`, `simulation_combat`, `bonus_attaque_defense`, `puissance_effective_sort` | Ordre de résolution, bonus, pertes, seuils et XP |
| CODE-01-UPKEEP | `MMHK-Plus/src/modules/tools/maintenance.js` | Barème d’entretien du calculateur tardif |
| CODE-01-DIST | `MMHK-Plus/src/modules/tools/distances.js` et `modules/mmhkplusUtilities.js` | Vitesses d’estimation et distance torique |
| CODE-01-SIEGE | `MMHK-Plus/src/modules/tools/attacksSieges.js` | Indices d’interface et de suivi des sièges ; pas une simulation serveur de conquête |

Les chemins et empreintes complets sont dans [le manifeste](../../data/source-manifest.json). Les références aux fonctions sont plus robustes que des numéros de ligne après changement de fins de ligne. La licence et les transformations sont décrites dans [NOTICE](../../data/reference/NOTICE.md).

## Guides communautaires détaillés

Corpus **heroesmmhk.ucoz.ru**, principalement 2012–2013, auteur/éditeur affiché Montik sur de nombreuses pages. Niveau **DOC**, source communautaire unique lorsqu’aucun autre recoupement n’est indiqué. Les tableaux corrompus, arrondis et valeurs ambiguës sont signalés dans les incertitudes.

| ID | Guide consulté | Périmètre / réserve |
| --- | --- | --- |
| G01 | [Guerre des Larmes](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/vojna_sljoz/3-1-0-7) | Guide classique, ajouts S3 ; victoire et monuments |
| G02 | [Voie de Domination](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/put_gospodstva/3-1-0-13) | Cartographe, obélisque, fouilles |
| G03 | [Voie de Richesse](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/put_bogatstva/3-1-0-14) | Creuset et composants |
| G04 | [Voie d’Honneur](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/put_chesti/3-1-0-15) | Portail, défis et restrictions d’armée |
| G05 | [Déplacements et haltes](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/peremeshhenie_geroev_po_karte_privaly/3-1-0-11) | Horaires russes, à contextualiser |
| G06 | [Combat](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/boi/3-1-0-4) | Guide communautaire ; version à qualifier |
| G07 | [Héros](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/geroi/3-1-0-3) | Profils, objets et apprentissage |
| G08 | [Villes](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/goroda/3-1-0-2) | Contient un ancien barème d’entretien |
| G09 | [Alliances](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/aljans/3-1-0-1) | Rangs, scores et rôles |
| G10 | [Siège](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/osada/3-1-0-5) | Conquête et bombardement |
| G11 | [Mines](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/shakhty_v_geroja_korolevstva/3-1-0-160) | Publication novembre 2013 |
| G12 | [Bâtiments de recherche](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/issledovatelskie_stroenija/3-1-0-161) | Bonus de production |
| G13 | [Professions](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/professii/3-1-0-88) | Arbres de talents |
| G14 | [Magie](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/magija/3-1-0-8) | Évolutions de coefficients en S3 |
| G15 | [Espionnage](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/razvedka/3-1-0-12) | Qualité des rapports et détection |
| G16 | [Capacité de stockage](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/vmestimost_skladov/3-1-0-38) | Stockage régional et spécialisé |
| G17 | [Balance économique](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/ehkonomicheskij_balans/3-1-0-55) | Guide de mars 2013, dispositif S3 |
| G18 | [Ressources](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/resursy/3-1-0-10) | Production, commerce et limites |
| G19 | [Domination : rangs](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/gospodstvo_urovni_i_voznagrazhdenija/3-1-0-16) | Seuils et récompenses |
| G20 | [Honneur : rangs](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/chest_urovni_voznagrazhdenija/3-1-0-18) | Seuils et récompenses |
| G21 | [Richesse : rangs](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/bogatstvo/3-1-0-17) | Seuils et périmètre de comptabilisation |
| G22 | [Quêtes de combat](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/cepochka_boevykh_kvestov/3-1-0-19) | Tutoriel et risques d’impasse |
| G23 | [Failles](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/razlomy/3-1-0-159) | Menaces PvE et événements |
| G24 | [Ruines](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/razvaliny/3-1-0-92) | Exploration à étages |
| G25 | [Fin de saison 4](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/zavershajushhaja_faza_igry_v_4_sezone/3-1-0-43) | Tournoi PvP |
| G26 | [Hérédité S1–S2 et union](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/nachislenie_ochkov_nasledija_sojuz/3-1-0-9) | Ancien calcul de transmission |
| G27 | [Hérédité S3](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/nachislenie_ochkov_nasledija_v_3_sezone/3-1-0-34) | Classement final et union |
| G28 | [Hérédité S4](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/nasledie_v_4_sezone/3-1-0-113) | PvP, PvE, stratégique |

## Méthode de collecte et limites

1. Relever le comportement, son contexte et la date disponible ; ne pas transformer un conseil d’optimisation en contrainte moteur.
2. Séparer constantes, formules, tables, séquences d’action et règles de victoire.
3. Épingler toute source de code à sa révision ; extraire les valeurs sans « réparer » les anomalies.
4. Relier chaque module à ses preuves et chaque incertitude à une tâche de validation.
5. Tester les futurs résultats contre des rapports historiques avant de qualifier un module de fidèle.

Les pages web ne sont pas archivées intégralement dans ce dépôt. Les liens, résumés limités et références sont conservés ; les données distribuées proviennent du corpus de code explicitement licencié. Les vidéos, écrans complets, probabilités serveur, générateurs de mondes et historiques de correctifs n’ont pas été reconstitués intégralement. Une page inaccessible et un extrait de moteur de recherche ne sont jamais traités comme un manuel lu.


## Corpus ajouté et analysé en révision 0.2

| ID | Source épinglée | Périmètre réellement examiné |
| --- | --- | --- |
| IMG-01 | [Captures du dépôt, commit 71f8ec7](https://github.com/AstrowareConception/MMHK-like/tree/71f8ec79cbea19246c539394bf33d75fc21f26b3/data/Screenshots) | 57 fichiers, 53 images distinctes ; classement et lecture visuelle de l’ensemble ; vues et modales représentatives examinées à pleine résolution |
| CODE-02 | [Import Jactari, même commit](https://github.com/AstrowareConception/MMHK-like/tree/71f8ec79cbea19246c539394bf33d75fc21f26b3/data/Jactari/src) | Inventaire des 153 fichiers ; inspection des 96 images ; lecture ciblée images, héros, données, CSS et fonctions d’outil |
| DECISION-USER | Instruction du porteur du projet, 22/10/2026 | PvP classique/Guerre des Larmes ; fidélité visuelle ; navigation JavaScript ; références historiques puis univers distinct |

Les références `SS-001` à `SS-057` pointent vers [l’analyse des captures](ANALYSE-CAPTURES.md) et son inventaire à empreintes. CODE-02-IMAGES désigne `images.min.js`, CODE-02-HEROS `heros.min.js` et leurs CSS, dans le corpus épinglé. Les six tables et `combat.min.js` sont identiques à CODE-01 : ce ne sont pas deux témoignages indépendants du moteur serveur.

Les conclusions de disposition sont issues d’images statiques. Les coûts contextuels, les langues et le numéro de client sont conservés lorsqu’ils sont lisibles ; une absence de date n’est pas comblée par une supposition. Aucune capture de la Guerre des Larmes elle-même n’est identifiée dans ce lot.


## Complément du 26 octobre 2026 — horaires, haltes et cas particulier Graal (V7.0)

| ID | Source historique | Constat et limite |
| --- | --- | --- |
| SRC-14 | [Entretien de l'équipe Heroes Kingdoms, copie Maps4Heroes](https://www.maps4heroes.com/heroes5/heroes_kingdoms_eng.php) | Réponse attribuée aux développeurs : vitesse héros seul / vitesse héros avec armée, non modifiables par sorts, compétences ou artefacts ; haltes à la tombée de la nuit ou après parcours en territoire ennemi. Entretien antérieur au lancement ; ne certifie pas les paramètres S2. |
| SRC-15 | [Forum jeuxvideo.com, témoignage du 7 décembre 2010](https://www.jeuxvideo.com/forums/1-14545-507-2-0-1-0-tres-decevant.htm) | Témoignage contemporain S2 : attaques de Graals exemptées de haltes hors territoire de l'alliance visée ; bugs des temps de haltes et du retour rapportés. Ni code serveur ni preuve de formules exactes. |
| SRC-16 | [Fandom, fiche MMHK](https://mightandmagic.fandom.com/wiki/Might_%26_Magic%3A_Heroes_Kingdoms) | Source secondaire rétrospective : trêve indiquée entre 22:00 et 08:00 GMT ; fuseau et applicabilité S2 français non certifiés. |

Ne pas compter SRC-14 à SRC-16 comme trois confirmations indépendantes d'une même
formule : elles documentent trois aspects distincts et des périodes incertaines.
La [tranche 5](../game-design/44-JACTARI-V70-HALTES-TERRITOIRES-TREVE.md)
explicite ces divergences et refuse de publier un ETA officiel sans validation.
