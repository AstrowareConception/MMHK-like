# Qualité L1 — V108 : journalisation de la recette de séparation des comptes

Date : 6 novembre 2026. Périmètre : **qualité de la recette de sécurité**, aucune nouvelle mécanique ni US déclarée acceptée.

## Constat post-fusion V107

Le workflow complet sur `main` (run 42116200182, première tentative) a validé trois jobs sur quatre. La suite de navigateur a passé la campagne authentifiée puis les 22 lectures interdites entre deux comptes ; l'échec se situe en fin de contrôle d'écritures croisées, au moment de comparer les journaux PostgreSQL avant/après. La première version de ce test n'indiquait pas quelle table avait changé. Ce seul symptôme **ne prouve pas** un défaut d'autorisation ; il exige une analyse des tables modifiées.

## Renforcement sans relâcher le gate

- Extension de l'instantané des deux cités aux qualifications et états de mines V104–V107 : 18 ensembles propriétaires, armées incluses.
- Extension de la surveillance à **22 journaux**, dont les écritures irréversibles des pertes PvE V102, résolution PNJ V103 et chantiers miniers V106/V107.
- Diagnostic d'échec : seulement **le nom de la table et son nombre de lignes avant/après** (ou l'alias du compte de test et les tables propriétaires). Aucun jeton, identifiant, compte ou contenu des lignes n'est imprimé.
- Une différence de valeur est toujours un échec, même sans changement de cardinalité ; aucune tolérance temporelle ni suppression d'assertion.
- Le workflow six services est désormais également exécuté **avant fusion** pour les PR modifiant le contrat de sécurité à deux joueurs, au lieu d'attendre `main`.

## Correctif de stabilité du test V107

La suite Python de la PR a trouvé un échec reproductible uniquement selon
certaines positions régionales aléatoires : une mine d'or pouvait ne disposer
d'aucune case adjacente libre. La fixture V107 présupposait le contraire.

La recette des extensions utilise désormais une **géométrie LAB déterministe**
avec quatre mines positionnées avant toute attestation V104 des gisements et
du PNJ. Cela rend l'hypothèse de site libre explicite dans l'environnement
de test **sans modifier le générateur du jeu** ni assouplir les contrôles
PostgreSQL d'occupation et d'immuabilité. Les tests continuent à vérifier
l'impossibilité de réserver une case occupée.

## Validation

- [ ] Compilation des scripts Python E2E
- [ ] Matrice 42 écritures étrangères refusées + 8 références croisées + 2 rejeux propriétaires sûrs
- [ ] Comparaison stricte de 18 états propriétaires et 22 journaux
- [ ] Six services Docker, Chromium et export PostgreSQL sur la branche
- [ ] Conclusion du rerun de la CI `main` V107 vérifiée

Aucune des 300 US ne change d'état. Si les journaux divergent à nouveau, le nom des tables devra être étudié avant toute fusion ; il serait inacceptable de masquer la régression en abaissant la recette.
