# PvE V103 — PNJ sans héros et résolution des rencontres

Date : 5 novembre 2026. Statut : laboratoire opt-in, non certifié S2.
US-COM-015 et US-REG-003 : incréments partiels, non acceptés.
US-REG-004 : aucune mine libérée ou exploitée par ce lot.

## Périmètre historique qualifié

Source : data/Jactari/src/scripts/combat.min.js, branche du rapport
défenseur avec statut PNJ, sans héros et sans attribut attrition_pnj.
Lorsque issue == 1 (victoire de l'attaquant), le rapport y indique la
perte de tous les effectifs PNJ initiaux ; pour issue < 1, pertes nulles.
La présence de attrition_pnj == 1 déclenche une autre formule fondée
sur les dispersions et les modificateurs. Les PNJ avec héros passent
aussi par une autre branche. Le coefficient des troupes avec héros
(0,30) ne s'applique donc PAS indistinctement aux PNJ.

Aucune propriété de héros absent ni d'attrition absente n'est inférée
du catalogue actuel. L'opérateur doit qualifier une rencontre
univoquement, dans un monde expérimental.

## Activation par l'opérateur

Préconditions : V102 opt-in autorisée dans un monde de test avec
politique de trajet LAB-*, caractéristiques de héros à zéro qualifiées,
formation et classes d'armes connues. La qualification du PNJ atteste
manuellement l'absence de héros ET d'attrition particulière.

Commande de qualification :
  python -m mmhk_api.manage qualify-lab-neutral-defender
    --encounter-id UUID --source-ref LAB-QUALIFICATION-EXPLICITE
    --no-hero-confirmed --no-attrition-confirmed

Commande d'activation mondiale :
  python -m mmhk_api.manage configure-lab-neutral-resolution
    --world-id MON-MONDE-TEST --enabled yes
    --source-ref LAB-POLITIQUE-EXPLICITE
    --acknowledge-experimental

Pour ne plus autoriser de nouvelles missions, --enabled no. Les
missions lancées avant le changement gardent leur politique figée.

## Transaction atomique et garanties

1. Capturer au départ une copie de la qualification du PNJ et de
   l'autorisation mondiale V103 (migration 103).
2. Résoudre la ligne V101 à partir des effectifs figés, puis vérifier
   l'admission, les contre-armes et l'issue de chaque échange.
3. Exiger le règlement de l'attaquant V102 qualifié, les classes
   d'armes complètes, la victoire et des échanges ordinaires.
   Les faux nuls, la magie, les salves et les profils inconnus
   ne libèrent aucune rencontre.
4. Vérifier que l'adversaire est toujours actif et que ses
   effectifs, sa puissance, son code et sa provenance n'ont
   pas changé pendant le trajet. En cas de divergence : rollback
   du rapport, des pertes V102 et de la résolution PNJ.
5. Lors de la victoire qualifiée, marquer la rencontre comme résolue
   et enregistrer son effectif PNJ perdu une seule fois dans le
   registre append-only, au sein de la même transaction.
6. Les rapports des missions terminées restent privés et lisibles.
   Une rencontre résolue ne peut être ressuscitée par UPDATE.

## Matrice de validation

- PNJ sans héros ni attrition, victoire attaquante : perte de
  l'effectif entier et une seule rencontre résolue.
- PNJ vainqueur : zéro perte durable et aucune résolution.
- PNJ inconnu, à héros ou à attrition : aucun règlement V103.
- Sans double opt-in V102 et V103 : aucune résolution.
- Modification du PNJ pendant le trajet : refus et rollback.
- Rejeu, double ordre, écritures hostiles : ni deuxième résolution
  ni modification du registre et des rapports.
- Suppression légitime de cité : cascades propres, pas d'orphelin.
- Aucun effet automatique sur les revenus des mines, l'XP,
  le butin, l'Honneur ou les possessions territoriales.

Cette tranche NE SATISFAIT PAS la Definition of Done historique.
Migration à sens unique : sauvegarde avant déploiement persistant,
CI PostgreSQL jetable et grande recette Docker/Chromium obligatoires.
