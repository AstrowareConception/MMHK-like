# Contrôles du référentiel Early Game — 23 octobre 2026

**Résultat : audits documentaires initiaux et post-P0 réussis, aucun test de moteur effectué.** Le dépôt n'héberge pas encore un serveur de jeu exécutable.

## Validation des réponses P0 et du référentiel révisé

**23 octobre 2026 — audit croisé post-réponses, réalisé sur les fichiers GitHub par l'outil de consultation :**

| Indicateur | Valeur |
| --- | ---: |
| Réponses P0 conservées et catégorisées | **84 / 84** |
| Réponses associées à au moins une règle métier | **84 / 84** |
| Règles métier versionnées après ajout des décisions | **90** (dont 30 nouvelles depuis le lot A initial) |
| US distinctes liées aux règles RM | **74** |
| Fixtures héritées du premier lot A | **18** |
| Nouveaux exemples d'acceptation centrés sur les décisions P0 | **15** |
| Générateur expérimental Q12/Q15 | **1 proposition, non simulée** |
| Vérifications de cohérence réalisées | **1 810** |
| Échecs détectés dans ces vérifications | **0** |
| Tests du moteur de jeu réellement exécutés | **0** |

Les contrôles ont couvert les IDs Q/RM, la couverture de toutes les questions, le rattachement aux US existantes et aux incertitudes Uxx, la présence des sources, les liens de traçabilité bilatéraux, le suivi des exemples d'acceptation et plusieurs contraintes structurantes du profil S2 (sept jours, torus, trois codes amis, quatre mines, attrition, chantiers, recrutements, trêve). Ces contrôles ne valident **ni le serveur Ubisoft, ni la fidélité des coûts S2, ni un jeu opérationnel**.

Outils ajoutés :
```bash
node tools/validate-p0-decisions.mjs
node tools/validate-early-game-rules.mjs
```

Les scripts sont versionnés, mais n'ont **pas été exécutés depuis un clone local dans cette session** : l'accès GitHub du conteneur n'était pas disponible. L'audit annoncé ci-dessus a été effectué sur les données récupérées via le connecteur GitHub. Les cas de [p0-acceptance-examples.json](../../data/decisions/p0-acceptance-examples.json) restent des spécifications et non une suite de tests intégrés au moteur.

## Audit croisé réalisé pendant la livraison initial (60 RM)


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
