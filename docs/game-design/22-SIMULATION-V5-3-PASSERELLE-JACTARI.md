# V5.3 — Première passerelle de combat Jactari, ordres horodatés et concurrence

**23 octobre 2026 · 20 assertions exécutées et réussies.** Ce jalon est une **intégration limitée de cas d'oracle communautaire**, et non le portage intégral du moteur de combat Jactari ou une certification du serveur Ubisoft S2.

## Périmètre réellement réalisé

Le point de départ est le moteur Python [V5.2](21-SIMULATION-V5-2-CONCURRENCE-ORDRES.md) provenant du ZIP de la conversation. Le laboratoire V5.3 ajoute :

1. **Ordre militaire horodaté** avec identifiant, propriétaire, origine, destination, peloton, effectif, départ et temps de trajet.
2. **Admission déterministe sur snapshot commun**, réservation des troupes sans double emploi et refus des doublons.
3. **Traitement d'arrivée à échéance** : deux attaques opposées ayant une arrivée commune sont calculées avec les mêmes forces initiales, puis les pertes sont appliquées ensemble. Les ordres reçus dans un ordre inverse aboutissent au même état pour les cas testés.
4. **Adaptateur à sept cas chiffrés** de [data/combat-reference-cases.json](../../data/combat-reference-cases.json), plutôt que réemploi de la formule fictive de combat V5.2 pour les cas documentés.
5. **Refus explicite des compositions non couvertes par l'oracle** : pas d'interpolation, pas de victoire « plausiblement estimée » en l'absence de référence.
6. **Entretien des cités à l'heure**, attrition `ceil(10 %)` par peloton non vide en cas d'impayé et recalcul quotidien de l'influence glissante sur quatre jours.

L'adaptateur n'inclut pas encore la composition complète des sept pelotons, les bonus de héros, les tirs préalables, la magie, les artéfacts ou les rapports historiques complets. Les sept cas sont **des exemples synthétiques dérivés du calculateur communautaire** : ils ne remplacent pas le moteur JS de plus de 250 Ko qui se trouve dans `data/Jactari/src/scripts/combat.min.js`.

## Cas de référence couverts

Les valeurs ci-dessous proviennent des sorties `expected` du catalogue d'oracles communautaires déjà versionné. Les unités ont toutes une puissance artificielle de test de 100.

| Cas d'oracle | Attaquant | Défenseur | Vainqueur | Morts permanentes A / D |
| --- | --- | --- | --- | --- |
| `counter_I_C` | 100 I | 100 C | Attaquant | 15 / 30 |
| `counter_R_I` | 100 R | 100 I | Attaquant | 15 / 30 |
| `counter_C_R` | 100 C | 100 R | Attaquant | 15 / 30 |
| `defender_counter` | 100 C | 100 I | Défenseur | 30 / 15 |
| `same_arm` | 100 I | 50 I | Attaquant | 15 / 15 |
| `overrun` | 100 I | 10 C | Attaquant | 0 / 3 |
| `zero_losses_without_overrun` | 100 I | 50 C | Attaquant | 0 / 15 |

Les **dispersions** sont également conservées dans chaque compte rendu de combat, distinctes des morts définitives. Cela garantit une structure de rapport compatible avec une intégration ultérieure plus complète.

## Résultats de la recette réellement exécutée

- **20 assertions / 20 réussies.**
- Deux missions opposées A→B et B→A, **100 unités chacune**, atteignent leur cible à l'heure 3.
- L'oracle de 100 I contre 100 C donne 15 morts à l'attaquant et 30 au défenseur, tandis que l'autre combat utilise son propre oracle de 100 C contre 100 I.
- Après application simultanée, les stocks de la démonstration sont **70 infanteries A et 40 cavaliers B**. Les tests confirment que renverser l'ordre de réception ne change pas ce résultat.
- Sur quatre journées, deux cités génèrent **192 écritures de facturation horaire**, et l'influence produit quatre états journaliers.
- Les missions dupliquées sont refusées ; une force de 101 unités ne peut pas être réservée sur un stock de 100.
- **Une arrivée multiple sur la même cité, sans oracle adéquat, est rejetée**, et un combat 12 I contre 13 C non documenté n'est pas extrapolé.

### Limite de modélisation importante

Les troupes engagées en attaque sont réservées et les pertes leur sont imputées, mais le retour réel des survivants n'est pas encore représenté par une mission distincte ; elles restent dans leur conteneur d'origine dans cette expérience. De même, les trajets sont des délais d'horloge simulés, **pas encore une navigation S2 avec haltes, trêve et interception**. Le comportement final devra corriger ce point avant que les calculs militaires soient acceptés comme métier.

L'expérience ne contient **aucun transfert de relique directement obtenu par les combats**. La V5.3 fiabilise l'interface entre ordres, oracles et temps ; elle ne remplace pas encore les scénarios V5 de prise/reprise de Sphinx.

## Limites historiques et prochaines étapes

- **Portage complet Jactari** : identifier les véritables fonctions de résolution, modèles d'unités, héros et phases de `combat.min.js` pour dériver un moteur exécutable qui couvre tous les cas et non seulement sept fixtures.
- **Rattachement spatial réel** : trêves nocturnes du monde, trajet torique, haltes attaquables, ordre d'arrivée et de retour, capture de cité et mise à jour d'influence au prochain recalcul.
- **Rapports de bataille** : dispersion, résurrection, fuite, mort définitive, XP et détails des tours, avec les droits de visibilité prévus.
- **Conflit de Sphinx avec attaques réelles** : après intégration multi-pelotons, mettre deux alliances dans un scénario où un renfort/une attaque modifie la puissance glissante puis le contrôle d'une relique et les remises d'entretien correspondantes.
- **Cas concurrents** : plusieurs ordres ciblant une même cité doivent avoir une sémantique versionnée ; les rejeter dans le simulateur de transition empêche d'inventer une priorité de combat.

## Artefacts

- [Synthèse structurée des 20 validations](../../data/analysis/v5-3-oracle-integration-2026-10-23.json).
- Archive **MMHK_V5_3_oracle_bridge_2026-10-23.zip** dans la conversation : `MMHK_V5_2_orders.py` (base), `MMHK_V5_3_jactari_bridge.py` (adaptateur), `MMHK_V5_3_tests.py` (20 assertions), `MMHK_V5_3_demo.json` et `MMHK_V5_3_validation.json`.

**État :** code exécuté et archive fournie ; scripts Python V5.3 **pas encore commités dans GitHub**, où seul le résumé et le présent rapport sont publiés. L'intégration Jactari est partielle, et la fidélité saison 2 reste à établir.
