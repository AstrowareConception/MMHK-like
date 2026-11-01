# Revue d'intégration — interfaces de jeu fixes MMHK

**Date :** 1er novembre 2026  
**Périmètre :** PR #45, #48 à #56, intégrées dans `main` avec commits conservés.

## Règle générale

Les activités de jeu (héros, armées, ville, commerce, territoire, rencontres,
chronique, colonisation) occupent une surface cadrée, au lieu de juxtaposer des
panneaux d'administration dans une longue page. Les listes, journaux et devis
défilent dans leurs propres zones. La logique du serveur demeure souveraine :
l'interface ne crée ni ressources, ni soldats, ni droits de colonisation.

## Livraison par activité

| PR | Activité | Contrat principal |
| --- | --- | --- |
| [#45](https://github.com/AstrowareConception/MMHK-like/pull/45) | Héros, inventaire, formation, garnison, taverne | Sept positions tactiques, commandes persistées |
| [#48](https://github.com/AstrowareConception/MMHK-like/pull/48) | Cité | Panorama, réserves, chantiers, historique |
| [#49](https://github.com/AstrowareConception/MMHK-like/pull/49) | Commerce | Marchand, hôtel des ventes, caravanes, journal |
| [#50](https://github.com/AstrowareConception/MMHK-like/pull/50) | Monde | Atlas, villes, influence, expansion |
| [#51](https://github.com/AstrowareConception/MMHK-like/pull/51) | Région | Carte 5 × 5, missions, renseignements |
| [#52](https://github.com/AstrowareConception/MMHK-like/pull/52) | Rapport de mission | Trajet, événements, formation, duel |
| [#53](https://github.com/AstrowareConception/MMHK-like/pull/53) | Colonisation | Droits, préparation, expéditions |
| [#54](https://github.com/AstrowareConception/MMHK-like/pull/54) | Inventaire | Commande souris explicite pour déséquiper |
| [#55](https://github.com/AstrowareConception/MMHK-like/pull/55) | Duel | Affichage numérique français et contraste |
| [#56](https://github.com/AstrowareConception/MMHK-like/pull/56) | Responsive | Bandeau mobile compact et navigation conservée |

## Validation réalisée

- Compilation de production Next.js et typage TypeScript.
- Vérifications du moteur Jactari, API FastAPI, migrations et prévisualisation privée.
- Parcours Chromium authentifié et persistant : construction, ressources, équipement,
  recrutement, formation peuplée, marché, offres, caravanes, missions,
  influence, colonisation et fondation confirmée par le worker.
- **50 captures d'activités** à 1220 × 900 et 1440 × 950,
  **27 captures responsive** à 1024 × 768, 900 × 800 et 390 × 844.
- Absence de débordement horizontal dans la matrice responsive ; contrôle de la
  visibilité du panneau de jeu dès la première hauteur mobile.
- [Campagne finale de la PR #56](https://github.com/AstrowareConception/MMHK-like/actions/runs/41344856927) :
  quatre jobs verts.

## Limites explicitement conservées

- [Issue #46](https://github.com/AstrowareConception/MMHK-like/issues/46) :
  le glisser-déposer **natif inverse** (équipement vers besace) n'est pas
  certifié par Chromium. La commande souris « Déséquiper » et le chemin
  clavier sont testés et persistés.
- Les règles historiques MMHK saison 2 non reconstituées ne doivent pas être
  présentées comme certaines ; les profils de laboratoire restent séparés.
- Les tests synthétiques de colonisation contournent la limite des sept jours
  **dans un environnement de laboratoire isolé uniquement**. Le joueur réel ne
  peut pas désactiver sa protection.
- Une campagne CI verte n'est pas une certification de tous les navigateurs
  ou de toutes les variantes de périphériques ; les captures servent à la revue.

## Exploitation

Le workflow `.github/workflows/fullstack-foundation.yml` est déclenché
automatiquement lors des changements pertinents sur `main`, et manuellement
via `workflow_dispatch`. Les déclencheurs de push temporaires des anciennes
branches de revue ont été supprimés.

Aucun déploiement applicatif n'est effectué par cette revue : l'intégration
GitHub et la publication d'une application restent deux opérations distinctes.
