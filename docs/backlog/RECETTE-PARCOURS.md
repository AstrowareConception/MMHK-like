# Recette des parcours intégrés

[Retour au backlog](README.md). Ces douze parcours relient les fiches en expériences jouables. Ils complètent la [recette existante](../specifications/RECETTE.md) ; ils ne remplacent pas les critères de chaque US.

**Statut de tous les parcours : spécifiés, non exécutés.** Le moteur n’existe pas encore dans ce dépôt. Chaque exécution future doit enregistrer profil, données initiales, événements, état attendu, état obtenu et verdict. Les dépendances des fiches pivots sont à inclure.

## PAR-01 — Développement local hors connexion

**Fiches pivots :** [US-ACC-003](categories/01-ACC.md#us-acc-003), [US-CIT-004](categories/02-CIT.md#us-cit-004), [US-CIT-006](categories/02-CIT.md#us-cit-006), [US-ECO-003](categories/03-ECO.md#us-eco-003), [US-REG-003](categories/05-REG.md#us-reg-003), [US-REG-004](categories/05-REG.md#us-reg-004), [US-ARM-005](categories/09-ARM.md#us-arm-005), [US-COM-002](categories/11-COM.md#us-com-002), [US-RAP-001](categories/22-RAP.md#us-rap-001).

**Déroulé :** Partir d’un nouveau royaume, terminer un chantier, libérer une mine, recruter puis résoudre un PvE après déconnexion.

**Résultat à vérifier :** Productions, débit, troupes, XP et rapport correspondent à la fixture ; la reconnexion ne rejoue aucun gain.

**À qualifier avant recette fidèle :** Files, cadence, arrondis et recrutement U03–U06.

## PAR-02 — Progression T1–T7 et amélioration

**Fiches pivots :** [US-CIT-009](categories/02-CIT.md#us-cit-009), [US-CIT-010](categories/02-CIT.md#us-cit-010), [US-ARM-002](categories/09-ARM.md#us-arm-002), [US-ARM-005](categories/09-ARM.md#us-arm-005), [US-ARM-006](categories/09-ARM.md#us-arm-006), [US-ARM-007](categories/09-ARM.md#us-arm-007).

**Déroulé :** Débloquer des paliers puis améliorer une quantité connue d’unités dans une faction qualifiée.

**Résultat à vérifier :** Les prérequis T7 sont appliqués, les effectifs sont conservés pendant amélioration et les coûts viennent du catalogue de la faction.

**À qualifier avant recette fidèle :** Lignée, réserves de recrues et durées U02/U06.

## PAR-03 — Héros, inventaire et magie

**Fiches pivots :** [US-HER-009](categories/07-HER.md#us-her-009), [US-HER-011](categories/07-HER.md#us-her-011), [US-HER-012](categories/07-HER.md#us-her-012), [US-ART-003](categories/10-ART.md#us-art-003), [US-ART-005](categories/10-ART.md#us-art-005), [US-MAG-004](categories/08-MAG.md#us-mag-004), [US-MAG-005](categories/08-MAG.md#us-mag-005), [US-COM-017](categories/11-COM.md#us-com-017).

**Déroulé :** Former un héros, l’équiper, préparer ses sorts puis combattre avec bonus et rangs identifiés.

**Résultat à vérifier :** Budget de talents et niveau d’objets respectés ; un objet unique ; effets et sorts visibles aux bons tours.

**À qualifier avant recette fidèle :** Carrières, acquisition d’objets et recharges U25–U27.

## PAR-04 — Convoi répété et stock concurrent

**Fiches pivots :** [US-ECH-012](categories/04-ECH.md#us-ech-012), [US-ECH-013](categories/04-ECH.md#us-ech-013), [US-ECH-014](categories/04-ECH.md#us-ech-014), [US-ECH-015](categories/04-ECH.md#us-ech-015), [US-ECH-016](categories/04-ECH.md#us-ech-016), [US-ECH-017](categories/04-ECH.md#us-ech-017), [US-ECO-006](categories/03-ECO.md#us-eco-006).

**Déroulé :** Programmer des trajets, dépenser entre deux départs puis faire évoluer la destination.

**Résultat à vérifier :** Chaque départ revalide sa quantité et sa cible ; attente/arrêt selon la politique, aucun stock négatif ni trajet gratuit.

**À qualifier avant recette fidèle :** Sémantique des options et charge mixte U28/U30.

## PAR-05 — Trajet, trêve et diplomatie

**Fiches pivots :** [US-MOV-003](categories/13-MOV.md#us-mov-003), [US-MOV-004](categories/13-MOV.md#us-mov-004), [US-MOV-005](categories/13-MOV.md#us-mov-005), [US-MOV-006](categories/13-MOV.md#us-mov-006), [US-DIP-004](categories/18-DIP.md#us-dip-004), [US-DIP-005](categories/18-DIP.md#us-dip-005).

**Déroulé :** Traverser une frontière d’influence et une trêve puis modifier un accord alors que l’ordre est parti.

**Résultat à vérifier :** Route, haltes, ETA et droit d’hostilité suivent le profil et sa date d’effet ; rapport explique toute interruption.

**À qualifier avant recette fidèle :** Trajet et trêve U09/U10, effets des accords U32.

## PAR-06 — Renseignement puis pillage

**Fiches pivots :** [US-ESP-003](categories/14-ESP.md#us-esp-003), [US-ESP-004](categories/14-ESP.md#us-esp-004), [US-ESP-005](categories/14-ESP.md#us-esp-005), [US-PVP-004](categories/15-PVP.md#us-pvp-004), [US-PVP-005](categories/15-PVP.md#us-pvp-005), [US-PVP-006](categories/15-PVP.md#us-pvp-006), [US-PVP-008](categories/15-PVP.md#us-pvp-008), [US-PVP-009](categories/15-PVP.md#us-pvp-009).

**Déroulé :** Reconnaître une cible, lancer un pillage, combattre une défense et rentrer avec le butin.

**Résultat à vérifier :** Renseignement limité à ce qui a été obtenu ; butin plafonné, dommages et récupération cohérents, retour unique.

**À qualifier avant recette fidèle :** Reconnaissance, butin, protection U20/U22/U23.

## PAR-07 — Siège avec secours et capture

**Fiches pivots :** [US-SIE-003](categories/16-SIE.md#us-sie-003), [US-SIE-005](categories/16-SIE.md#us-sie-005), [US-SIE-007](categories/16-SIE.md#us-sie-007), [US-SIE-008](categories/16-SIE.md#us-sie-008), [US-SIE-009](categories/16-SIE.md#us-sie-009), [US-SIE-010](categories/16-SIE.md#us-sie-010), [US-SIE-012](categories/16-SIE.md#us-sie-012), [US-SIE-013](categories/16-SIE.md#us-sie-013).

**Déroulé :** Installer un siège et tester deux branches : secours victorieux, puis autre fixture avec assaut menant à conquête.

**Résultat à vérifier :** Un seul assiégeant accepté ; bombardement distinct de conquête ; forces, bâtiments et propriété cohérents dans chaque branche.

**À qualifier avant recette fidèle :** Défense, ordre d’événements, siège et bombardement U14/U18/U19/U21.

## PAR-08 — Larme par Domination

**Fiches pivots :** [US-LAR-004](categories/20-LAR.md#us-lar-004), [US-LAR-005](categories/20-LAR.md#us-lar-005), [US-LAR-006](categories/20-LAR.md#us-lar-006), [US-LAR-007](categories/20-LAR.md#us-lar-007), [US-LAR-008](categories/20-LAR.md#us-lar-008), [US-LAR-009](categories/20-LAR.md#us-lar-009), [US-LAR-010](categories/20-LAR.md#us-lar-010).

**Déroulé :** Parcourir cartographie, expéditions, indice, révélation publique, libération et fouilles concurrentes.

**Résultat à vérifier :** Larme attribuée une fois ; visibilité et délais respectés ; fouilles achevées après découverte ne recréent rien.

**À qualifier avant recette fidèle :** U33 ; tirage contrôlé en test, règle historique distincte.

## PAR-09 — Larme par Richesse et capture

**Fiches pivots :** [US-LAR-011](categories/20-LAR.md#us-lar-011), [US-LAR-012](categories/20-LAR.md#us-lar-012), [US-LAR-013](categories/20-LAR.md#us-lar-013), [US-LAR-014](categories/20-LAR.md#us-lar-014).

**Déroulé :** Fabriquer les quatre composants puis tester synthèse normale et capture à une frontière temporelle.

**Résultat à vérifier :** Coûts et composants consommés selon contrat ; branche de capture explicite, aucune Larme dupliquée.

**À qualifier avant recette fidèle :** Chaîne du creuset U43, capture et synthèse U33/U14.

## PAR-10 — Larme par Honneur

**Fiches pivots :** [US-LAR-015](categories/20-LAR.md#us-lar-015), [US-LAR-016](categories/20-LAR.md#us-lar-016), [US-LAR-017](categories/20-LAR.md#us-lar-017), [US-LAR-018](categories/20-LAR.md#us-lar-018), [US-LAR-019](categories/20-LAR.md#us-lar-019).

**Déroulé :** Entrer avec armée aux plafonds, réussir les quatre cycles et le défi final ; vérifier aussi un dépassement d’un plafond.

**Résultat à vérifier :** Admission aux bornes correcte ; pertes, campements et progression persistants ; cinquième victoire récompensée une seule fois.

**À qualifier avant recette fidèle :** Armées d’épreuve, ancrage des durées et récupération U33.

## PAR-11 — Monuments, rupture et victoire

**Fiches pivots :** [US-LAR-020](categories/20-LAR.md#us-lar-020), [US-LAR-021](categories/20-LAR.md#us-lar-021), [US-LAR-022](categories/20-LAR.md#us-lar-022), [US-LAR-023](categories/20-LAR.md#us-lar-023), [US-LAR-024](categories/20-LAR.md#us-lar-024), [US-FIN-001](categories/21-FIN.md#us-fin-001), [US-FIN-002](categories/21-FIN.md#us-fin-002).

**Déroulé :** Dans un profil de test déclaré : atteindre 13 monuments, perdre le seuil avant l’échéance, le regagner et tenir 14 jours ; variante de capture au même instant que la fin.

**Résultat à vérifier :** Une période interrompue ne compte plus ; rester à 13 après une perte conserve la continuité ; simultanéité arbitrée ; une seule victoire.

**À qualifier avant recette fidèle :** Définition actif, perte et frontière de clôture U33/U34/U14.

## PAR-12 — Clôture, gel et nouvelle campagne

**Fiches pivots :** [US-FIN-003](categories/21-FIN.md#us-fin-003), [US-FIN-004](categories/21-FIN.md#us-fin-004), [US-FIN-005](categories/21-FIN.md#us-fin-005), [US-FIN-007](categories/21-FIN.md#us-fin-007), [US-FIN-008](categories/21-FIN.md#us-fin-008), [US-FIN-009](categories/21-FIN.md#us-fin-009), [US-FIN-012](categories/21-FIN.md#us-fin-012).

**Déroulé :** Clore avec des ordres en cours, calculer le résultat, choisir des droits puis créer un nouveau royaume compatible.

**Résultat à vérifier :** Pas de gain tardif dans les scores gelés ; historique d’hérédité explicable ; création relancée sans doubler les avantages.

**À qualifier avant recette fidèle :** Politique de clôture U34 et barème d’hérédité U35.

## Variantes transversales de recette

Sur les parcours où elles ont un effet réel, rejouer : réponse perdue après confirmation ; double intention ; deux joueurs concurrents ; monde ou propriétaire devenu invalide ; déconnexion avant échéance ; commande à l’instant exact de clôture. Chaque essai possède un résultat défini par la fiche ou par une décision de profil, sans dépendre du hasard d’arrivée réseau.

L’accélération d’une campagne de test change l’horloge du monde de façon déclarée. Elle ne remplace pas silencieusement les durées historiques dans les catalogues et ne prouve pas à elle seule la stabilité d’un serveur en charge.
