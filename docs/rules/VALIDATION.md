# Contrôles du référentiel Early Game — 23 octobre 2026

**Résultat : audit croisé documentaire réussi, aucun test du moteur effectué.** Le dépôt n'héberge pas encore un serveur de jeu exécutable.

## Audit croisé réalisé pendant la livraison

Le catalogue et les fichiers publiés sur GitHub ont été relus et comparés par des contrôles structurés.

| Mesure | Résultat |
| --- | ---: |
| Règles métier numérotées RM-* | **60** |
| Domaines couverts | **8** |
| Fixtures numérotées FX-* | **18** |
| US distinctes reliées directement aux RM | **57** |
| US de la sélection initiale de 37 directement reliées | **27 / 37** (les dix autres restent au backlog ; plusieurs couvrent surtout l'UI) |
| Contrôles documentaires/structurels effectués dans l'audit croisé | **463** |
| Erreurs détectées dans cet audit | **0** |
| Scénarios Gherkin effectivement exécutés contre un moteur | **0** |

Les 463 contrôles réalisés pendant cette session portent notamment sur : unicité et structure des identifiants ; présence des sources ; résolution des US et Uxx ; présence d'une entrée Gherkin par fixture ; contraintes de budget de la Mairie Académie ; calcul de son échéance à 576 minutes ; tarif/pouvoir de Gremlin ; cas de duel synthétique du calculateur ; quatre mines en 5×5 sans collision ; présence explicite des blocages de profil. **Ils ne certifient ni les mécaniques Ubisoft ni les observations attendues en production.**

### Exécuter le vérificateur dans un clone du dépôt

```bash
node tools/validate-early-game-rules.mjs
```

Le script ajouté est un validateur autonome Node.js 18+. Il vérifie les références du référentiel et certains exemples numériques depuis les fichiers versionnés. **L'exécution de cette commande dans un clone local du dépôt n'a pas été réalisée dans l'environnement de cette session** ; la vérification ci-dessus est un audit croisé équivalent sur les contenus lus depuis GitHub et ne vaut pas résultat CI.

## Limites connues

1. Les données Jactari (2013) demeurent des **candidates** pour une saison classique ; le validateur ne tranche pas U02.
2. Les calculs de production des fixtures peuvent employer des nombres **fictifs**. Leur arithmétique correcte ne démontre pas U03/U04.
3. Les scénarios de protection « sept jours » représentent un **choix de laboratoire**, non une règle universelle.
4. Les duels venant de `data/combat-reference-cases.json` sont des **oracles communautaires synthétiques**, sans comparaison à un combat réellement tiré d'un serveur historique.
5. Ni latence serveur, ni concurrence de base de données, ni reprise de transactions, ni vrai résultat PvE n'ont été exécutés.
6. Les 300 US restent « à affiner » ; la présence de critères complémentaires ne les rend pas Ready et ne constitue pas une estimation.

## Gate de sortie du lot A

Un profil complet devra ensuite être arbitré sur les paramètres bloquants indiqués dans [les décisions ouvertes](DECISIONS-ET-INCERTITUDES.md), puis les [stories prioritaires](AFFINAGE-US-L1.md) seront affinées et estimées. Le premier jalon **jouable** ne sera atteint qu'après implémentation et démonstration du [parcours PAR-01](../backlog/RECETTE-PARCOURS.md#par-01--developpement-local-hors-connexion).
