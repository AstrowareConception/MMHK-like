# Référentiel de règles métier — Early game MMHK-like

**Révision : 0.2 (23 octobre 2026) · Les 84 choix P0 ont été consignés ; les 90 règles sont encore non implémentées et certaines valeurs restent à qualifier.**

Ce dossier transforme les éléments de rétroconception en **contrats métier explicites**, pouvant guider l'affinage des US et l'implémentation future du moteur. Il ne transforme pas automatiquement les résultats du calculateur communautaire ou les témoignages historiques en règles authentifiées du serveur Ubisoft.

Le périmètre est le **PvP classique, avec Guerre des Larmes en cible**. Le premier lot couvre l'inscription dans un monde, les cinq factions du socle, la génération d'une région, les stocks et la production, les bâtiments, héros, recrues, armées, premier PvE et contraintes de temps. L'alliance, la colonisation avancée, le PvP, les sièges et la victoire figurent dans le GDD général, mais **ne sont pas spécifiés complètement par ce lot**.

## Livrables

| Fichier | Usage |
| --- | --- |
| [90 règles indexées](../../data/rules/early-game.rules.json) | Source structurée des identifiants RM-*, états de preuve, contrats, US, inconnues et paramètres |
| [Décisions P0 Q01–Q84](../decisions/DECISIONS-P0-2026-10-23.md) | Choix du projet S2, arbitrages restant ouverts et liens vers les formulations originales |
| [Profil S2 de conception](../../data/rules/mmhk-like-s2-policy-draft.json) | Profil de produit dérivé des réponses, non exécutable tant que les paramètres essentiels sont inconnus |
| [Traçabilité des réponses](../../data/decisions/p0-traceability.json) | Correspondances complètes Q → RM → US → Uxx |
| [Vérification des réponses P0](../../tools/validate-p0-decisions.mjs) | Contrôles automatiques de cohérence et d'attribution, pas tests de moteur |
| [15 cas d'acceptation supplémentaires des décisions P0](../../data/decisions/p0-acceptance-examples.json) | Testent les contraintes de mines, protection, entretien, chantiers, trêve, codes amis ; attentes seulement, aucun moteur exécuté |
| [Proposition de générateur délégué](../game-design/09-GENERATEUR-P0-PROPOSITIONS.md) | Pondérations et positions proposées pour Q12/Q15, à simuler avant validation |
| [18 fixtures](../../data/rules/early-game.fixtures.json) | Exemples concrets, avec distinction entre chiffres de 2013, nombres fictifs et propositions de test |
| [Expérience du premier royaume](../game-design/08-EXPERIENCE-EARLY-GAME.md) | Parcours joueur, arbitrages, progression et métriques d'équilibrage sans attribuer des chiffres fictifs à Ubisoft |
| [Contrats et invariants](CONTRATS-EARLY-GAME.md) | Description métier du déroulé, transitions, formules candidates, droits, refus et temps |
| [Décisions ouvertes](DECISIONS-ET-INCERTITUDES.md) | Ce qui bloque la fidélité, options de prototype possibles, choix réellement attendus |
| [Scénarios de recette](RECETTE-GHERKIN.md) | Parcours détaillés couvrant le nominal, les refus, les frontières, l'idempotence et la reconnexion |
| [Proposition d'affinage des US pivots](AFFINAGE-US-L1.md) | Scénarios d'acceptation, décisions et pistes de découpage ; ne modifie pas les 300 US source |
| [Traçabilité vers les US](TRACEABILITE-US.md) | Matrice règles ↔ backlog existant ; pistes de découpage et de révision |
| [Profil de laboratoire](../../data/rules/early-game.profile-lab.json) | Paramètres explicitement fictifs pour des tests ; aucun profil historique certifié |
| [État des validations](VALIDATION.md) | audit initial de 463 contrôles sur 60 RM ; nouvelle révision P0 contrôlée séparément |
| [Vérificateur](../../tools/validate-early-game-rules.mjs) | Contrôle de structure, liens US, inconnues, prix de référence, durée, exemples et doublons |

### Lire correctement une règle

Chaque enregistrement possède un **identifiant stable** (par exemple \`RM-CIT-002\`), un domaine, un intitulé, un \`statement\` (ce que soutiennent les sources), un \`contract\` (comportement exigé ou proposé pour MMHK-like), des \`source_documents\`, des \`unknowns\`, des \`us\`, des références de fixtures et des noms de paramètres à qualifier.

Deux classifications sont séparées :

- \`evidence\` : \`OBS-CODE\` (source communautaire ou calculateur), \`OBS-CLIENT-ARCHIVE\` (client Ubisoft archivé), \`OBS-IMAGE\`, \`DOC\`, \`DECISION-USER\`, \`PROP\`, \`INCONNU\`. **Une observation ne prouve pas la validité universelle d'une saison.**
- \`state\` : \`confirmed_scope\`, \`reference_observed\`, \`candidate_versioned\`, \`historically_incomplete\`, \`unconfirmed_recollection\`, \`proposed_contract\`, \`blocked_by_evidence\`. **Aucun de ces états ne signifie « codé » ou « testé sur le serveur original ».**

Le champ \`parameter_keys\` nomme ce que le profil de jeu devra fixer. Lorsque la valeur manque, elle reste explicitement inconnue : aucun défaut implicite (« zéro », « instantané », « illimité », etc.) n'est autorisé pour un comportement historique.

## Répartition initiale

| Domaine | Nombre | Exemples de règles |
| --- | ---: | --- |
| Monde et inscription | 14 | Faction autorisée, spawn random / near, protection et unicité |
| Région et génération | 11 | 5 × 5, centre, quatre mines, doublons, occupation PNJ |
| Économie | 16 | Stocks, fractions, plafonds, production, dépenses, entretien |
| Constructions | 12 | Catalogue, prérequis, débit, files, achèvement, annulation |
| Héros | 10 | Activité exclusive, archétypes, recrutement, talents et équipement |
| Armées et recrues | 10 | Sept pelotons, pools, recrutement, puissance et améliorations |
| Combat PvE | 9 | Préparation, contre-armes, résultat, pertes et rapport |
| Temps partagé | 8 | UTC, échéances, idempotence, ordre des événements et reprise |
| **Total** | **90** | **Statut : contrat de conception à affiner**, non moteur opérationnel |

## Trois règles cardinales

1. **Fidélité ≠ hypothèse.** Les valeurs de \`data/reference\` datent du corpus 2013. Elles sont de bonnes données candidates, pas la démonstration que toute campagne classique utilisait ces tarifs.
2. **La simulation est un outil, pas une preuve historique.** Les fixtures avec un taux de 24 bois/jour ou un plafond de 20 sont volontairement fictives ; leur calcul doit seulement rester déterministe. Les duels synthétiques de \`data/combat-reference-cases.json\` ne sont pas des rapports Ubisoft.
3. **Le serveur décide.** Les actions sont atomiques, le temps persiste et les effets ne se répètent pas à la reconnexion. Ce sont des exigences d'intégrité du futur système, proposées en tant que telles.

## Points de décision bloquants

La distinction entre **référence candidate** et **profil exécutable** est centrale. Pour préparer une première partie, il faudra statuer sur l'état initial, la cadence et les arrondis de production, les chantiers et héros mobilisés, l'entretien, la disponibilité des recrues, la temporalité du combat local et l'ordre d'événements simultanés. Le [registre priorisé](DECISIONS-ET-INCERTITUDES.md) propose un traitement de ces inconnues sans faire passer un choix de laboratoire pour une règle retrouvée. Les choix du produit sont désormais liés au [registre P0](../decisions/DECISIONS-P0-2026-10-23.md).

Les **300 US existantes** restent \`à affiner\`, non estimées et non implémentées : le référencement par des RM ne les clôture pas. Les 16 pivots et leur [fermeture de dépendances (37 US)](../../data/analysis/first-playable-story-selection.json) constituent la première tranche à affiner, et non un engagement de sprint.

## Séquence de validation avant tout développement

1. Valider les **sources et les chiffres** du catalogue, identifier le sous-ensemble de saison et conserver les divergences.
2. Arbitrer les **paramètres indispensables** à PAR-01 ; constituer un \`ruleset_id\` de laboratoire dont les valeurs fictives sont transparentes.
3. Examiner chaque scénario \`FX-*\` : préconditions, action, sortie, refus, frontière temporelle et caractère historique/proposé.
4. Affiner les US pivots, fixer leur DoR et leurs exemples de Confirmation ; ne les marquer \`prêtes\` qu'après les décisions.
5. Réaliser un moteur de domaine minimal, puis exécuter les scénarios et enregistrer le résultat obtenu, distinct du résultat attendu.

Références : [GDD](../game-design/01-VISION-ET-BOUCLES.md) · [profil PvP](../specifications/PROFIL-PVP-CLASSIQUE.md) · [incertitudes U01–U47](../research/INCERTITUDES.md) · [modèle de domaine et temps](../specifications/DOMAINE-ET-TEMPS.md) · [première partie](../specifications/PROCHAINES-ETAPES.md).
