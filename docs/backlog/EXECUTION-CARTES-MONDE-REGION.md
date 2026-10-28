# Exécution des US existantes — cartes Monde et Région

> 28 octobre 2026. Ceci n'est **pas** une nouvelle US ni un changement de règles. C'est une matrice de réalisation de fiches déjà enregistrées dans `data/backlog/user-stories.json` et `docs/backlog/categories/`. Les critères d'acceptation des fiches d'origine restent les critères opposables. Les sous-tranches ci-dessous sont seulement des lots techniques.

## Constat vérifié sur le POC

- `apps/web/components/world-atlas.tsx` : fond original 4.1.13-MTR activable en mode local privé, seules les villes possédées sont renvoyées ; carte sans caméra, zoom, survol ni sélection logique.
- `apps/web/components/region-scene.tsx` : grille isométrique de 25 cases, cité centrale en (2,2), autres cases `unmapped` ; quatre types de mines connus mais **positions inconnues**.
- `apps/api/src/mmhk_api/map_views.py` : monde torique (coordonnées 1…N), `known_scope=owned_cities_only`, `enemy_positions_exposed=false`, `world_terrain_loaded=false`. Aucun terrain, PNJ, monument, relique, mine ou ville adverse non autorisés à dessiner comme une entité réelle.
- `data/assets-recovered/cdn-bulk/` et catalogue : fonds Monde / Région historiques, petits sprites et éléments de HUD récupérés. La **présence d'une image ne démontre pas l'existence et la position d'un objet dans une partie**.

## Ordre de développement : uniquement des US existantes

| Lot technique | US existantes | Périmètre et preuve de recette | Dépendances / verrous |
| --- | --- | --- | --- |
| C1.a — Caméra et toriques | US-MON-001, US-MON-004, US-MON-008, US-UIX-002 | Carte déplaçable, recentrage sur coordonnées valides et sur cités connues, pas de nouvel ordre militaire ; raccordement 1↔N; caméra conservée si applicable | Mesure historique des pas de zoom encore incertaine (U09, U46) ; ergonomie glisser/molette = adaptation non certifiée |
| C1.b — Cible et information | US-UIX-003, US-UIX-005 | Survol = clic = coordonnée stable ; coordonnées de centre/survol/sélection ; clic sur décor hors grille sans effet ; informations non connues explicites | Sans découvrir d'adversaire ni affirmer un terrain |
| C1.c — Échelles et lisibilité | US-MON-002, US-UIX-001, US-UIX-002, US-UIX-006 | Deux échelles Monde distinguent mêmes villes autorisées, sélection préservée, sprites au bon rôle ou repli explicite | Le mode politique et les gestes historiques précis restent à affiner ; ne pas simuler des frontières d'alliance |
| C2.a — Inspection régionale | US-REG-001, US-UIX-003, US-UIX-005 | 25 coordonnées i,j 0…4 avec ville au centre ; sélection exacte, survol, infobulle connue/inconnue ; aucune case créée au clic hors terrain | Mines, ennemis, forêts et PNJ ne sont pas géolocalisés |
| C2.b — Occupations réelles | US-REG-002, US-REG-003, US-REG-004, US-REG-008, US-REG-010 | Propriétaire, statut, rencontres, mine et bâtiments affichés **uniquement** lorsque le backend enregistre les cellules, leur état et leur visibilité ; combat/bonus conformes aux US | Bloqué par modèle de terrain/occupation, recon. et PvE ; U17/U43, règles de contiguïté |
| C3.a — Sites spéciaux | US-REL-001, US-REL-008, US-REL-009, US-MON-003 | Sphinx, obélisque, portails, reliques et sites connus distingués, positions autorisées et fonctions vérifiées ; les objets non découverts restent cachés | Nécessite génération et découverte serveur réelles, typologie saison 2 ; U17/U33/U43 |
| C3.b — Monde partagé et guerre | US-MON-005, US-MON-006, US-MON-007, US-MON-010, US-MOV-001, US-MOV-007 | Influence, colonisation et routes affichées depuis état et règles de visibilité réels | L2 de la story map ; modèle multi-joueurs/visibilité et missions avant rendu |

## Critères non négociables

1. Réutiliser les fichiers originaux lorsqu'ils sont présents **seulement dans le mode historique local privé**, sans copie dans `apps/web/public`, les images Docker ou les captures CI.
2. Les coordonnées du monde sont 1-indexées, `torus_coordinate` côté Python ; les coordonnées de région `i,j` sont 0-indexées. Elles ne sont jamais interchangeables.
3. Le fond de carte peut être un visuel historique, mais **sa grille peinte n'est pas un modèle de terrain fiable** ; la géométrie et les hitboxes sont des surcouches client distinctes.
4. Ne pas attribuer un sprite de forêt, relique, gisement, mine ou PNJ à une case sans référence à une cellule métier et sans contrôle de visibilité.
5. N'afficher que des villes possédées tant que les mécanismes de découverte/adversaires ne sont pas implémentés. Aucune navigation ne permet de contourner la restriction serveur.
6. La navigation et la sélection sont en lecture seule ; elles ne changent ni stocks, ni missions, ni propriété.

## État de recette (à actualiser seulement après tests)

- Tranche B : `GameShell` et fonds historiques privés déjà livrés, frise liée aux chantiers PostgreSQL.
- C1, C2, C3 : initialement à réaliser. Ne jamais marquer les US **terminées** sans valider leurs cinq critères d'acceptation. Un composant de navigation peut constituer seulement une **sous-partie** d'une US.

Liens source : [MON](categories/12-MON.md), [UIX](categories/23-UIX.md), [REG](categories/05-REG.md), [REL](categories/06-REL.md), [MOV](categories/13-MOV.md), [Story map L1/L2](STORY-MAP.md), [spécification isométrique](../specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md), [limites d'observation](../specifications/NAVIGATION-MONDE-REGION-VILLE.md).
