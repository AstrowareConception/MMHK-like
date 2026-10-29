# Refonte immersive — panorama et constructions du Havre

**Tranche US-CIT-001/002/003/004/005/007, US-UIX-004/006.**
Suite indépendante de la PR #40 (héros, artefacts et garnison).
Le panorama est une illustration originale publiable ; les ancrages des
bâtiments restent limités aux coordonnées vérifiées de CITYVIEW_CONF 4.1.3-MTR.

## Problème corrigé

La page présentait un panorama, puis une fiche accessible seulement après
une navigation avec fragment, puis sept réserves et de nombreux formulaires
de construction. Le joueur perdait le contexte de la ville à chaque inspection.
La version précédente faisait d'un catalogue administratif le point d'entrée
normal pour lancer un chantier.

## Interaction livrée

- **Plateau ville + fiche latérale** : même surface sur desktop, ordre vertical
  sur tablette/mobile. Le joueur voit le bâtiment et le devis simultanément.
- **Sélection sans rechargement** : les ancres SVG cliquables et accessibles
  au clavier pilotent la même fiche React. Une URL `?inspect=...` reste
  partageable et les liens entrants du marché continuent de fonctionner.
- **Répertoire de plans compact** sous la scène : toutes les offres
  réellement envoyées par FastAPI, dont les édifices sans ancre historique
  certifiée (écuries, tour de guet s'ils sont proposés).
- **Modes de construction** Standard / Rapide / Économique via
  un sélecteur unique ; une seule offre est détaillée à la fois.
  Les coûts, les déficits, les prérequis et la durée restent issus du
  catalogue serveur. Le bouton ne devient disponible que si le devis
  local est admissible ; le serveur revérifie tout à la commande.
- **Registre détaillé** accessible dans une section repliable :
  les formulaires historiques restent conservés comme issue de secours,
  sans occuper en permanence l'espace du jeu.
- **État de chantier et reçus** toujours affichés ; la création et les
  dépenses restent atomiques, sous la même action `startUrbanConstruction`.
  L'actualisation des échéances réelles par le worker est inchangée.
- **Deux captures supplémentaires** du plateau et du chantier actif
  sont collectées dans les artefacts Chromium public-safe.

## Contraintes préservées

Aucune image originale Ubisoft/Jactari n'est placée dans `public`.
Pas de nouveaux prix, de nouvelles capacités ou de positions de bâtiments
inventées. Aucun changement de migration, de modèle économique ou d'API.
L'accès à un bâtiment sans ancre vérifiée passe par le répertoire, pas
par une position fictive sur la ville. Une seule construction par ville
et aucune annulation restent la vérité PostgreSQL.

## Recette exigée avant fusion

1. `npm run build` + `npm run typecheck` dans `apps/web`.
2. Pytest PostgreSQL, isolation propriétaire et moteur Jactari.
3. Construction de la préproduction Docker et contrôle des ports loopback.
4. Chromium : ouverture de ville, sélection SVG, visite du répertoire
   et fermeture de la fiche, changement de mode, coût et commande
   depuis la fiche contextuelle ; paiement unique, worker, progression,
   marché et recrutement par les nouveaux parcours.
5. Vérifier les deux screenshots de ville et la séparation private-historical.
6. Après fusion : même CI sur `main`, sans déploiement des originaux.

## Prochaine tranche

La caméra régionale et la carte du monde conserveront leurs règles d'accès
et leurs données certifiées, avec les mêmes principes : panneau contextuel,
actions effectuées *sur* la scène et suppression des écrans-formulaires
comme interface principale.
