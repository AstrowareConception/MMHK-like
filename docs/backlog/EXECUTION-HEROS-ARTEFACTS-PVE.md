# Tranche de jeu : fiches de héros, artefacts et rencontres PvE

Cette livraison fait progresser uniquement les **US du backlog existant**. Aucun objet historique, monstre ou coefficient de combat de saison 2 n'est supposé fiable en dehors d'une preuve.

## US mobilisées

| US | Partie implémentée | Limite restante |
| --- | --- | --- |
| US-HER-001 | Fiche autonome par héros, niveau, expérience, statut, armée portée | Courbes, talents et toutes caractéristiques non validés |
| US-ART-001 | Réserve de cité, sacs de héros, équipement séparés | Capacité non présumée |
| US-ART-002 | Nom, niveau, emplacement et description d'effet | Effets non appliqués au combat ; catalogage historique incomplet |
| US-ART-003/004 | Huit slots distincts, équipement dans le bon slot et budget expérimental de niveaux | Budget LAB-LEVEL-SUM-V1 à remplacer quand la règle S2 sera certifiée |
| US-ART-005/006 | Conflit de slot refusé sans perdre l'objet ; déséquipement vers le sac | Remplacement atomique en une action restant à faire |
| US-ART-007/008 | Déposer à la réserve et confier à un héros de la même cité | Aucune téléportation inter-cités |
| US-HER-016 / US-ART-001 | Transfert direct entre deux héros présents et libres de la même cité | Héros en mission bloqués |
| US-REG-001/002 | Deux rencontres de laboratoire dans des cases explicitement initialisées autour du Havre | Pas de génération globale des PNJ, ni reconnaissance externe |
| US-COM-001/002/017 | Sélection du héros et peloton, comparaison Jactari d'un duel, rapport sans effet | Ni mission créée, ni bataille complète, ni libération, XP, butin ou pertes définitives |

## Sécurité et persistance

- Migration 010 : pièces d'artefact **uniques**, verrouillage transactionnel de la cité et de la pièce, vérification des droits de propriété et de disponibilité, interdiction de deux objets dans le même slot.
- Chaque ordre de transfert possède un UUID d'idempotence, journalisé dans PostgreSQL ; rejouer un ordre avec les mêmes paramètres ne produit pas de duplication.
- Équiper un objet depuis le sac respecte son slot et le budget de niveaux du **laboratoire**, qui n'est pas une règle historique certifiée. Le transfert d'un artefact équipé vers le sac d'un autre héros le déséquipe. L'interface le rend explicite.
- Migration 011 : PNJ de rencontre par cellule 5 × 5, emplacement unique, effectifs, puissance nominale et provenance obligatoires. Aucune population n'est créée automatiquement hors du seul `local-sandbox`.
- La lecture et la simulation Jactari sont strictement réservées au propriétaire de la cité. Le bearer de session reste côté Next.js ; aucun jeton n'est exposé à JavaScript.
- La simulation utilise uniquement le **duel Jactari mono-peloton** validé par différentiel : aucun stock, héros, PNJ, butin ni XP modifié.
- Les deux rencontres de laboratoire « Loups des bois » (1,3) et « Brigands de la lisière » (3,1) sont un jeu d'essai explicite, **pas** une répartition originale Ubisoft.
- Les trois artefacts « Heaume de bronze », « Sceau des anciens » et « Lame du veilleur » sont également des pièces de laboratoire. Leur injection est idempotente pour les parties locales existantes, sans écraser le héros ni la garnison.

## Ergonomie

L'écran principal de la ville ne contient plus la longue gestion militaire : il donne accès à deux sections séparées. « Héros et artefacts » présente une navigation maître-détail, huit slots, le sac du héros, la réserve commune et des commandes explicites. « Armées et garnison » conserve recrutement et affectation des pelotons. Les deux écrans sont accessibles directement depuis la navigation de la cité.

Les deux sprites de rencontre (loup et brigand) sont des **dessins SVG originaux**. Ils n'exposent aucune image historique protégée.

## Prochain incrément attendu

La vraie boucle PvE devra connecter sept pelotons ordonnés, l'admission, les effets d'artefacts et les capacités de héros, les pertes définitives, les récompenses, le worker de mission et des rapports immuables, avant de permettre la « libération » effective des 25 cases. Elle reste explicitement non acquise tant que les US-COM-001/002/017 et les profils historiques n'ont pas leur recette.

L'implantation des mines, des reliques et des forêts reste server-authoritative ; ne pas la déduire de l'illustration du fond.
