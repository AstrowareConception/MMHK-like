# GitHub Actions : politique anti-notifications et validation responsable

## Cause de l'incident du 28 octobre 2026
L'ancienne CI déclenchait toutes les campagnes sur chaque `push` de branche **et** sur chaque `pull_request synchronize`. Une modification poussée sur une PR produisait deux exécutions complètes, puis autant de notifications de réussite ou d'échec. Plusieurs petites corrections ont saturé le téléphone du propriétaire.

## Nouvelle politique (trois workflows)
- Aucun déclenchement CI sur un `push` de branche `feat/*`, `fix/*`, etc.
- Aucun déclenchement CI automatique sur chaque mise à jour d'une pull request.
- `workflow_dispatch` reste disponible pour une validation distante **volontaire** d'une version consolidée sur sa branche.
- `push` sur `main` continue à déclencher les vérifications nécessaires lors de l'intégration.
- Un groupe de concurrence par workflow/référence avec `cancel-in-progress: true` annule un nouveau doublon concurrent portant sur la même référence.
- Aucun usage de `rerun all` sur des échecs déjà compris ; privilégier relance ciblée d'un job défectueux lorsque nécessaire.

## Méthode pour chaque incrément
1. Lire les US et le code existants. Préparer les fichiers concernés sans créer de commit distant pour chaque modification.
2. Exécuter les contrôles rapides localement dans l'environnement de travail (tests Node, compilation/typecheck, tests Python) autant de fois que nécessaire, **sans notification GitHub**.
3. Réunir les changements en un commit (ou un petit ensemble de commits) sur la branche ; relire le diff et les migrations.
4. Quand le candidat est réellement prêt : GitHub → Actions → sélectionner la validation adaptée → Run workflow → choisir la branche → Run workflow. Une seule validation complète est recherchée.
5. En cas d'échec : corriger hors CI et consolider à nouveau, puis un seul contrôle distant pertinent, pas un cycle push/test par ligne.
6. Après réussite, fusionner la PR ; les validations de `main` restent automatiques.

**Important :** changer les événements YAML ne peut pas effacer les anciennes notifications ni annuler les runs déclenchés *avant* l'entrée en vigueur de cette politique. Il peut rester des tâches déjà démarrées.

Les réglages personnels GitHub Actions peuvent être adaptés par le propriétaire sur https://github.com/settings/notifications → System → Actions → Don't notify, indépendamment des règles CI. Ne pas changer ses préférences sans son consentement.
