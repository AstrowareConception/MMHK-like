# PvE V109 — Expérience des héros, qualification LAB et seuils Jactari

Date : 6 novembre 2026. **Périmètre LAB expérimental, pas une acceptation historique S2.**
Migration SQL : `107_lab_hero_experience.sql` (fonctionnalité V109).

## Sources distinctes : seuils documentés, récompenses encore incertaines

- **Paliers de niveaux :** `data/reference/heros.json`, CODE-01, `_niveaux[1..40][0]`. Les 40 seuils sont enregistrés exactement et rendus immuables en base. Exemples : niveau 1 = 0 XP ; niveau 2 = 800 XP ; niveau 3 = 2 000 XP ; niveau 40 = 3 003 584 XP.
- **Gains après combat :** `docs/game-design/04-COMBAT.md` et `combat.min.js` mentionnent puissance dispersée admissible, `ratio_xp`, invocations, honneur et modificateurs de vainqueur. Le moteur V101–V103 n'implémente pas encore tous ces oracles. **Il serait faux d'en déduire ici un nombre d'XP historique.**
- **Recommandation de laboratoire :** l'opérateur atteste un montant positif pour **une rencontre neutre réelle** et une provenance explicite ; ceci est un montant d'essai, non un barème Ubisoft. Pas d'auto-population de récompenses.

## Activation contrôlée, jamais par l'API publique

Conditions cumulatives :

1. Monde possédant une politique de déplacement `LAB-` non certifiée S2.
2. V102 (règlement des pertes attaquantes) et V103 (neutralisation des PNJ sans héros) activées.
3. Rencontre non résolue dont le statut sans héros / sans attrition est qualifié V103.
4. Récompense d'expérience **qualifiée pour cette rencontre**, avec référence de provenance.
5. Politique V109 **activée avant le départ de la mission**. Chaque mission conserve un snapshot serveur de la politique et du montant dans sa propre transaction d'insertion.

Commandes de qualification, à exécuter par un opérateur seulement :

```sh
python -m mmhk_api.manage qualify-lab-pve-xp \
  --encounter-id UUID_RENCONTRE \
  --experience-amount 800 \
  --source-ref LAB-XP-ESSAI-EXPLICITE \
  --acknowledge-experimental

python -m mmhk_api.manage configure-lab-pve-xp \
  --world-id IDENTIFIANT_MONDE \
  --enabled yes \
  --source-ref LAB-OPT-IN-XP-V109 \
  --acknowledge-experimental
```

**800 XP n'est qu'une fixture d'essai** permettant de vérifier le passage du niveau 1 au niveau 2 ; ce n'est pas le gain historique d'un PNJ.

## Règlement à l'arrivée

Le worker conserve les garanties de V100–V103 : armées et récompense gelées au départ, séquence déterministe, règlement des pertes, neutralisation éventuelle du PNJ. **Dans la même transaction** et sous verrou de mission puis de héros, il :

- refuse explicitement un snapshot XP corrompu et annule toute la transaction ;
- n'attribue rien aux missions sans V109, à une politique désactivée, à une rencontre sans récompense attestée, à une fuite, à une défaite ou à un PNJ non résolu ;
- vérifie la cohérence entre l'XP et le niveau stockés ; un état incohérent fait échouer la transaction au lieu de réécrire le héros ;
- ajoute le montant attesté une fois, calcule le nouveau niveau via les seuils CODE-01 et enregistre un reçu append-only `pve_lab_xp_awards` lié à l'identité de la mission et de la rencontre ;
- refuse de présumer le traitement des gains dépassant le dernier seuil documenté : aucun XP n'est crédité dans ce cas, et le rapport mentionne `max_level_reward_not_qualified`.

Le niveau peut gagner plusieurs paliers d'un coup, si un montant attesté franchit plusieurs seuils, sans attribution supplémentaire de points ou de talents (non qualifiés ici). Le niveau initial préexistant n'est pas reconstitué automatiquement. L'ancienne progression de héros reste accessible, avec alerte lorsque le couple niveau/XP stocké ne suit pas la courbe.

Le rapport privé du joueur montre le gain réellement crédité et ses bornes avant/après, ou la raison de l'absence de récompense. La fiche du héros indique le prochain niveau, son seuil et l'XP manquante. L'écran ne prétend pas que le chiffre de récompense est une formule MMHK S2.

## Recette d'acceptation technique

- [ ] 40/40 seuils vérifiés contre le fichier `data/reference/heros.json`, bornes 799/800 XP et 3 003 584 XP.
- [ ] Configuration refusée hors LAB/V102/V103, qualification individuelle du PNJ et montant explicite obligatoires.
- [ ] Gel au départ non modifiable ; révocation ultérieure n'annule pas un ordre déjà engagé.
- [ ] Victoire V103 : un crédit, niveau 1 → 2 à 800 XP, reçu unique et persisté.
- [ ] Double mission/rejeu/worker : pas de double XP, pas de rapport écrasé.
- [ ] PNJ non qualifié, politique inactive ou retour sans victoire : aucun crédit.
- [ ] Reçu non modifiable par UPDATE ou DELETE ; suppression légitime du monde autorisée.
- [ ] 499 tests Python antérieurs et tests V109, PostgreSQL 17, contrat API, Next.js et TypeScript.
- [ ] Tests de sécurité deux comptes sur **25 journaux/qualifications**, sans fuite d'informations privées.
- [ ] Recette navigateur Docker six services et contrôle post-fusion main.

## Suivi des User Stories

- `US-HER-007` : niveau et seuil suivant exposés ; livraison partielle expérimentale, **non acceptée historiquement** (max, carrière et fidélité S2 à qualifier).
- `US-COM-002` : conséquence supplémentaire sous profil LAB ; combat complet toujours non accepté.
- `US-RAP-001` : reçu privé de gain dans le rapport ; boîte complète non acceptée.

Ce dossier **ne clôt aucune des 300 US classiques**. La validation technique ne constitue pas un oracle de conformité Ubisoft.
