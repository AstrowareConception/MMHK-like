# V7.0 — tranche 5 : haltes territoriales et trêve nocturne (laboratoire)

**26 octobre 2026 — NON CERTIFIÉ MMHK saison 2 — aucune ouverture PvP**

## 1. Problème et périmètre

La tranche 4 sait calculer une durée selon des points de passage, une vitesse et des
interruptions fournies. Pour les missions, le problème n'est pas seulement la
distance : les haltes dépendent de la nature du territoire, du type d'attaque,
de la trêve du serveur et possiblement du sens du trajet.

Cette tranche ajoute :
- `world-night-truce.mjs` : génération déterministe de fenêtres quotidiennes **UTC**
  à partir d'heures *explicitement configurées* et d'un horizon fini ;
- `world-territorial-travel.mjs` : simulateur à segments territoriaux continus,
  compteur expérimental de points de mouvement, haltes conditionnelles et
  suspension facultative du compteur de halte pendant la nuit ;
- des tests de régression sur passages de frontière, contre-exemples et ambiguïtés.

Les résultats conservent **`historicalCertification:false` et
`authoritativeArrivalTime:false`**, n'exposent pas `trustedSchedule` et ne sont
raccordés ni au système de missions ni à l'arbitre de combats.

## 2. Sources historiques et force des conclusions

| Preuve | Époque | Observation | Qualification |
| --- | --- | --- | --- |
| [MMHK-Plus `distances.js`, commit 2013 épinglé](../../data/Jactari/upstream-addon/mmhkplus-distances-2013.js) | 2013, outil tiers | Estimations `d/12` héros, `d/4` armée, `d/9,375` caravane | OBS-CODE, **non serveur** |
| [Entretien avec l'équipe MMHK, reproduit sur Maps4Heroes](https://www.maps4heroes.com/heroes5/heroes_kingdoms_eng.php) | Archive éditoriale, date exacte à retrouver | Deux vitesses héros seul/armée ; ne varient pas selon artefacts, capacités ou sorts ; haltes à la nuit ou au-delà d'une distance en zone ennemie | DOC, **date et contexte de saison incertains** |
| [Guide G05 — déplacement et haltes](https://heroesmmhk.ucoz.ru/publ/mech_i_magija_geroi_korolevstva/osnovy_igry/peremeshhenie_geroev_po_karte_privaly/3-1-0-11) | Corpus communautaire 2012–2013 | Huit points, halte de deux heures en neutre/hostile ; territoires alliés exemptés ; nuit décrite dans un contexte russe | DOC, **pas une preuve S2 FR** |
| [Jeuxvideo.com, message du 7 décembre 2010](https://www.jeuxvideo.com/forums/1-14545-507-2-0-1-0-tres-decevant.htm) | Saison 2 | Règle d'attaque des Graals décrite sans haltes sauf sur le territoire de l'alliance visée ; retours de raid signalés problématiques | Témoignage contemporain, **formule inconnue** |
| [Fandom, fiche du jeu](https://mightandmagic.fandom.com/wiki/Might_%26_Magic%3A_Heroes_Kingdoms) | Source secondaire rétrospective | Trêve décrite de 22:00 à 08:00 GMT | DOC secondaire ; **heure non authentifiée par le serveur Ubisoft FR S2** |
| [Guide local de rétroconception](05-CARTE-PVP-SIEGES.md) | Octobre 2026 | Synthèse préexistante du G05, et distinction des paramètres saison/région | Synthèse, **non indépendante de G05** |

**Attention :** le guide G05 est postérieur à la saison 2, l'entretien de
développeurs peut décrire une règle plus ancienne et la fenêtre GMT de Fandom
est une source secondaire. **Aucune de ces traces ne suffit à déclarer la
formule d'arrivée « historique certifiée S2 ».**

Les règles de vitesse du jeu *Heroes of Might and Magic V* au tour par tour
(vitesse de l'unité la plus lente, routes, terrains) sont **hors périmètre** :
elles ne doivent pas être transposées à MMHK.

## 3. Modèle de laboratoire implémenté

Un trajet d'essai fournit obligatoirement :
- des segments de coordonnées valides, contigus sur la carte torique ;
- une qualification territoriale **fournie par la couche serveur** :
  `friendly`, `allied`, `neutral`, `hostile`, `targetAlliance` ;
- le type de mission (`ordinary`, `grailAttack`) ;
- une vitesse de base en unités de distance par heure ;
- une règle de halte complète : points par unité de distance, seuil,
  durée, et reset/conservation du compteur lors du passage en territoire exempté ;
- une politique nocturne explicite : `disabled` dans un laboratoire ou
  `{startHourUTC,endHourUTC,validUntilMs}` ;
- le comportement de l'horloge de halte pendant la nuit :
  `pause` ou `continue`.

La variante `ordinary` compte les segments neutres, hostiles et de l'alliance
ciblée. La variante `grailAttack` ne compte que ceux de l'alliance ciblée,
conformément à **l'interprétation testable du témoignage S2**, pas à une
validation du détail des frontières. Les territoires alliés/amicals sont
considérés exempts dans ce modèle de laboratoire.

Le mécanisme commence une halte **avant de reprendre un déplacement admissible**
si le seuil a été atteint. Arriver précisément au seuil à destination ne lance
donc pas une halte « fantôme ». Cette convention, comme le reset du compteur,
reste un choix d'expérience.

La constante `GUIDE_G05_HALT_OBSERVATION` référence 8 points / 2 heures et
son niveau de preuve. Elle ne renseigne **pas** le taux points/distance ;
ce coefficient reste obligatoire. Le calculateur n'interprète jamais
automatiquement les 12/4/9,375 en profil serveur.

## 4. Trêve nocturne, UTC et bornes

Le générateur reçoit des heures UTC entières, un début et une fin de couverture.
Pour une expérience 22:00–08:00 UTC, une mission démarrant à 21:00 avec deux heures
de déplacement disponible prend une heure avant la fermeture et termine la
dernière heure à 09:00 le lendemain.

Il n'y a **aucune valeur nocturne par défaut**. L'horizon configuré ne peut
dépasser 366 jours ; si l'ETA expérimentale franchit l'horizon déclaré, le
planificateur échoue au lieu d'inventer les nuits manquantes.

Des tests distincts montrent que le reliquat d'une halte de deux heures peut
être soit suspendu pendant la nuit, soit écoulé pendant la fermeture. Le choix
doit être définitivement arbitré par des preuves historiques saison 2.

UTC est un **référentiel de calcul** et n'établit pas le fuseau horaire historique
du serveur. Le modèle n'infère aucune règle de changement d'heure.

## 5. Fiabilité technique et limites

Le simulateur rejette les vitesses nulles, durées non finies, coordonnées hors
carte, segments discontinus, profils inconnus, événements démesurés et
trêves insuffisamment couvertes. Il conserve les entrées non modifiées.

Les événements `move` et `halt` sont traçables, avec les dates de début/fin,
les distances et le segment territorial. Les événements servent à la
reconstitution et non à l'ordonnancement réseau.

**Reste à vérifier** avant un vrai départ serveur : identité et droits du
commanditaire, instant d'appartenance territoriale, frontières réellement
franchies par le chemin torique, calcul des points de mouvement, doublons de
halte, cas siège, politiques de retour, heure locale historique, effets des
changements de propriétaire, conflits et interception, transactions et
réconciliation au redémarrage.

Le verrou `productionBattleArbiterAllowed=false` est inchangé.

## 6. Tests

```bash
node --test tools/jactari-port/world-night-truce.test.mjs \
  tools/jactari-port/world-territorial-travel.test.mjs
node --test tools/jactari-port/*.test.mjs
```

## 7. Prochaine tranche

Faire dériver les **segments et qualifications de territoire** de données
persistées et versionnées, en conservant un instant d'observation et une
politique de changement d'alliance explicites. Ensuite seulement, explorer
l'ordonnancement fiable des missions aller/retour et les interceptions.
