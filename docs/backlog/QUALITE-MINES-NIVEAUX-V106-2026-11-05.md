# V106 — Améliorer une mine selon G11, sous qualification LAB

Date : 5 novembre 2026. **Portée : laboratoire opt-in, non certifié saison S2**.
US-REG-005 : parcours LAB candidat à une réception technique ; la DoD du
backlog historique et les autres profils miniers restent ouverts.

## Sources et frontière d'inférence

Le guide G11 de novembre 2013 documente les niveaux de mines jusqu'à 10.
Les neuf montées 1→2 à 9→10 ont les coûts d'or 1 000, 2 000, 3 000,
5 000, 8 000, 13 000, 21 000, 34 000, 55 000 et les durées normales
de 1, 2, 3, 5, 8, 13, 21, 34, 55 heures. Le rendement nominal par niveau
est 2 000 or, 2 ressources communes ou 1 ressource rare par jour.
La mine continue de produire durant une montée de niveau.
Référence : docs/game-design/02-MONDE-VILLES-ECONOMIE.md, G11.

Le guide ne qualifie **pas** ici les niveaux réels de mines
précédemment créées dans le prototype, ni tous les prérequis
du héros, ni les arrondis des modes rapide/économique, ni le cumul
d'extensions. Ces valeurs ne sont jamais inventées par le serveur.

## Activation administrative contrôlée

La mine doit exister, posséder un gisement exact et avoir été libérée
et activée via V103/V104 dans un monde dont le profil de trajet
commence par LAB- et n'est pas certifié historique.
L'opérateur vérifie la mine au **niveau 1 effectif**, avec un taux de
production de base exactement égal à la valeur G11 niveau 1. Une mine
non qualifiée n'acquiert aucun niveau par migration.

Après la réconciliation de tous les ticks économiques déjà dus,
l'opérateur enregistre un seuil de héros pour le prochain palier,
avec la référence de sa décision :

    python -m mmhk_api.manage qualify-lab-mine-level \
      --city-id UUID_CITE \
      --resource gold \
      --target-level 2 \
      --required-hero-level 1 \
      --source-ref LAB-G11-HERO-QUALIFICATION-2026 \
      --acknowledge-experimental

Le seuil fourni ici est une décision **LAB**, et non une règle de
niveau de héros attribuée à Ubisoft. Les qualifications de paliers
sont indépendantes et immuables ; un autre niveau ne se débloque
pas automatiquement après la première montée.

## Boucle de jeu

1. Une mine qualifiée affiche le niveau enregistré, le coût G11
   normal du palier suivant et son rendement théorique.
2. Le joueur désigne un héros réel de sa cité, disponible et dont
   le niveau atteint le seuil qualifié.
3. Le serveur contrôle les droits, l'activation de la mine,
   l'horloge économique, le taux G11 courant et les fonds.
   Le joueur ne fournit ni prix, ni durée, ni nouveau rendement.
4. Une seule transaction débite l'or et enregistre un chantier
   horodaté par PostgreSQL avec UUID d'idempotence. Répéter le même
   ordre rend le même reçu ; une nouvelle demande concurrente est refusée.
5. Pendant les travaux, la mine continue à produire avec l'ancien
   taux ; elle n'est ni supprimée ni suspendue.
6. Le worker économique clôt le chantier après avoir crédité tous
   les ticks dont le **début** précède l'échéance. La révision suivante
   utilise le nouveau taux, sans recalcul rétroactif.
7. Fin du chantier, niveau, taux, journal de crédits et statut du
   chantier sont validés ensemble dans la transaction du worker.
   Une interruption annule l'ensemble de cette itération.
8. Le joueur retrouve le niveau et les commandes disponibles.
   Le palier suivant reste fermé jusqu'à une nouvelle qualification.

## Vérifications à conserver

- Coût déduit une fois, reprise, refus de fonds insuffisants ;
- Héros d'un autre compte, niveau insuffisant ou héros occupé ;
- Maintien du taux ancien pendant les travaux, puis nouveau taux
  au premier tick admissible ;
- Interaction avec la frontière d'activation de la mine V104 :
  aucun crédit sur une période antérieure à cette activation ;
- Modification illégitime d'un ordre, d'un seuil de héros, d'un
  niveau ou d'une provenance refusée par PostgreSQL ;
- Suppression légitime d'une cité sans entraver ses cascades ;
- Répétition de worker, congestion, capacité et fractions inchangées ;
- Interface propriétaire et rendu des erreurs, aucun devis hors LAB.

Le contrat d'économie repose sur les cadences expérimentales déjà
configurées : le calcul G11 n'est pas déclaré certifié S2.
Les extensions, les modes rapide/économique et les aménagements
restent hors de cette tranche.

Tests : apps/api/tests/test_lab_mine_upgrades.py, tests économiques
et contrat OpenAPI. Validation via la CI PR, puis Docker/Chromium sur main.
