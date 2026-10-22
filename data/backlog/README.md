# Données du backlog

[user-stories.json](user-stories.json) contient le schéma documentaire 1.0, les 23 catégories, 300 stories, 1 500 critères, 57 exigences dont 55 actives, 46 inconnues et la DoD commune.

Les identifiants US sont stables et les critères sont suffixés CA01 à CA05. Les champs `status`, `ready`, `estimate`, `conversation`, `invest`, `acceptanceCriteria` et `definitionOfDone` permettent de préparer un import dans un outil de suivi. Aucun outil tiers n’a été alimenté automatiquement.

Les champs `given`, `success`, `negative` et `boundary` conservent le résumé rédactionnel ; `acceptanceCriteria` donne les scénarios structurés. Les sources utilisent des chemins relatifs à la racine du dépôt. Les références Gxx, CODExx et SS-xxx renvoient au registre documentaire existant.

`planningScope` distingue socle à qualifier, hypothèse conditionnelle et proposition à arbitrer. Ce champ n’est pas une décision de livraison. `phases` est multivalué : E early, M mid, F end/Larmes, P après-campagne. Une story peut être utile dans plusieurs phases sans être dupliquée.

Les états initiaux sont à affiner, non prêts, non estimés et non exécutés. L’estimation null signifie inconnue, jamais zéro. Toutes les conversations et cases de DoD restent ouvertes.

Pour modifier une story, conserver son ID, actualiser simultanément sa fiche Markdown et le JSON, puis lancer `node tools/validate-backlog.mjs` depuis le dépôt. Ajouter une nouvelle fiche après le dernier numéro disponible ; ne pas réutiliser l’identifiant d’une fiche retirée. Lors d’un découpage, mettre à jour le total attendu et les compteurs de catégories : la version initiale validée ici contient 300 fiches.

Voir le [backlog](../../docs/backlog/README.md), la [méthode](../../docs/backlog/METHODE-ET-QUALITE.md) et la [validation](../../docs/backlog/VALIDATION.md).
