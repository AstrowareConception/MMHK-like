# Revue d'intégration — interfaces de jeu fixes MMHK

**Date :** 1er novembre 2026 · **Mise à jour :** 2 novembre 2026  
**Périmètre :** PR #45, #48 à #56 et #58, intégrées dans `main` avec commits conservés.

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
| [#58](https://github.com/AstrowareConception/MMHK-like/pull/58) | Artefacts souris et tactile | Glisser de l'emplacement vers la besace par vrai geste pointeur ; persistance serveur |

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
- [Campagne de la PR #56](https://github.com/AstrowareConception/MMHK-like/actions/runs/41344856927) : quatre jobs verts.
- [PR #58 : validation souris et tactile](https://github.com/AstrowareConception/MMHK-like/actions/runs/41360345678) : quatre jobs verts, geste réel et persistance.
- [Validation finale du code intégré à `main`](https://github.com/AstrowareConception/MMHK-like/actions/runs/41423623449) : quatre jobs verts, commit `9e15e5d0fe18f0dc0e15eb254accb18c0b0903ad`.

## Limites explicitement conservées

- [Issue #46](https://github.com/AstrowareConception/MMHK-like/issues/46) : **résolue fonctionnellement et clôturée**. Le glissement inverse (équipement vers besace) est validé avec un **vrai geste pointeur souris et tactile**, persistant en base après rechargement. Pour éviter le blocage confirmé de Chromium/Playwright, ce sens n'emploie **pas** la primitive HTML Drag and Drop native ; le sens besace → équipement conserve cette primitive. La commande « Déséquiper » et le clavier restent utilisables.
- Les règles historiques MMHK saison 2 non reconstituées ne doivent pas être
  présentées comme certaines ; les profils de laboratoire restent séparés.
- Les tests synthétiques de colonisation contournent la limite des sept jours
  **dans un environnement de laboratoire isolé uniquement**. Le joueur réel ne
  peut pas désactiver sa protection.
- Une campagne CI verte n'est pas une certification de tous les navigateurs
  ou de toutes les variantes de périphériques ; les captures servent à la revue.

## Contrôles complémentaires (2 novembre)

- Un relâchement **hors d'une destination autorisée** ne doit déplacer aucun objet : assertion tactile avec rechargement, ajoutée dans la PR #59 de consolidation.
- Le test de la PR #58 demeure dans la CI de `main` ; il couvre le vrai geste souris et le toucher, sans synthèse d'événements HTML Drag and Drop.
- [Issue #47](https://github.com/AstrowareConception/MMHK-like/issues/47) conserve les audits restant à compléter : états d'erreur, permissions, fenêtres de dialogue et navigateurs complémentaires. La livraison des écrans fixes ne prouve pas à elle seule une interface parfaite dans toutes les situations.

## Exploitation

Le workflow `.github/workflows/fullstack-foundation.yml` est déclenché
automatiquement lors des changements pertinents sur `main`, et manuellement
via `workflow_dispatch`. Les déclencheurs de push temporaires des anciennes
branches de revue ont été supprimés.

Aucun déploiement applicatif n'est effectué par cette revue : l'intégration
GitHub et la publication d'une application restent deux opérations distinctes.
