# Préparation militaire depuis les régions — contrat de lecture V1

Cette tranche relie la reconnaissance régionale aux **forces déjà affectées
aux héros** du joueur, sans créer de combat PvP fictif.

## Parcours disponible

Depuis la carte du monde, le joueur sélectionne une région, ouvre la carte
régionale puis consulte le panneau **Préparation militaire**. Celui-ci affiche
pour chaque héros possédé dans le monde sa cité d'origine, son statut, son
effectif cumulé actuellement affecté et sa distance torique à la cible.

Une cible adverse est nommée seulement lorsqu'elle figure dans
`map_city_discoveries` pour ce compte ; aucune recherche directe des villes
ennemies à des coordonnées arbitraires n'est exposée. Une région sans
cible identifiée ne doit pas être qualifiée de vide. L'API ne divulgue
ni garnison, ni stocks, ni mouvements des joueurs adverses.

`GET /api/v1/me/worlds/{world_id}/regions/{x}/{y}/military-readiness`

La route est strictement authentifiée, valide l'appartenance au monde et
ne réalise **aucune mutation**. Les champs `attack_enabled` et
`raid_enabled` restent `false` tant que les règles transactionnelles
PvP ne sont pas développées. Aucune durée de déplacement n'est inférée :
seule une distance torique est présentée.

## Prochaine tranche métier nécessaire avant activation des boutons

- Validations serveur de l'éligibilité de la cible, de la visibilité et des
  protections, en particulier l'immunité de sept jours de la première cité.
- Règles du monde pour la portée, le temps de trajet, le héros et
  l'armée engagée, avec instantané des formations.
- Modèle d'ordres idempotents et transactionnels, audit, mouvements et
  résolution Jactari avec pertes et pillage définis par des politiques
  versionnées.
- Tests de concurrence, de confidentialité, de reprise des workers,
  d'annulation et de retour de mission.
- Tests d'intégration réels et contrôle navigateur avant activation PvP.

## Tests ciblés

```bash
pytest -q apps/api/tests/test_military_readiness.py
```

Cette suite garantit dans son périmètre la non-divulgation d'un monde
non autorisé, le maintien du brouillard de guerre pour une cité inconnue
et l'absence d'activation artificielle des attaques. La réussite de la
suite et l'absence de régression globale sont à confirmer sur la stack
Docker de développement.
