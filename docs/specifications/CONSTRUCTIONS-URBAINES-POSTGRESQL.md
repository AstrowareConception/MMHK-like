# MMHK-like — Première construction urbaine persistante

**28 octobre 2026 · tranche applicative expérimentale FastAPI / PostgreSQL / Next.js.**

## Source des décisions

Le registre [P0 Q44–Q50](../decisions/DECISIONS-P0-2026-10-23.md)
demande pour les chantiers **en ville** :
- une seule construction active par cité ;
- **pas de file**, pas d'annulation et aucun héros mobilisé ;
- paiement intégral au **lancement** ;
- modes *normal*, *rapide* (**coût +40 %, durée −20 %**) et
  *économique* (**coût −20 %, durée +40 %**) ;
- les améliorations sont achevées à l'expiration de leur délai.
Ces modes **ne sont pas** transférés implicitement aux chantiers régionaux.

**Inconnus :** prix par bâtiment et niveau, délais historiques, convention
d'arrondi, prérequis de bâtiments, effets précis des améliorations. Nous
n'inventons pas ces paramètres et ne déverrouillons donc aucun effet
économique/militaire automatiquement.

## Composants développés

- `003_urban_construction.sql` : profils de prix/durée explicitement fournis
  par l'opérateur, bâtiments achevés, ordres persistés, journal append-only ;
  index SQL `one_active_urban_construction_per_city`.
- `construction.py` : validations, calcul du prix et de la durée,
  autorisation par propriétaire **dans SQL**, transaction de débit de
  sept ressources, gestion du niveau courant et idempotence sur UUID d'ordre.
- `POST /api/v1/me/cities/{city_id}/construction` : commande authentifiée
  limitée à `order_id`, `building_code` et `mode`. Aucun coût, niveau,
  propriétaire ou horodatage venant du client n'est accepté.
- `GET /api/v1/me/cities/{city_id}/construction` : état du chantier,
  bâtiments terminés, devis recalculés serveur pour les prochains niveaux.
- `construction_worker.py` : batch à la demande pour les échéances échues,
  `FOR UPDATE SKIP LOCKED`, transaction SQL par ordre, mutation du
  bâtiment et journal d'achèvement atomiques.
- Next.js : trois modes proposés, devis lisibles, affichage de la fin
  prévue et formulaire serveur avec session conservée côté Next.

### Convention expérimentale d'arrondi

Les multiplicateurs 1,4 et 0,8 sont bien des **décisions P0**.
Pour assurer des montants entiers et des heures reproductibles, le profil
technique `experimental-ceiling-v1` applique **l'arrondi supérieur**
aux coûts ajustés par ressource et aux durées ajustées en secondes.
Cette convention n'est **pas** une preuve historique Ubisoft MMHK S2.
Le reçu conserve le `policy_id` associé au profil expérimental.

## Invariants du moteur

1. Le compte doit appartenir au monde et posséder la ville.
2. Un seul chantier actif par cité (contrôle applicatif **et index unique**).
3. Une amélioration vise exactement le niveau courant + 1.
4. Aucun coût n'est négatif, aucune ressource ne peut être débitée au-delà
   du stock disponible, aucune devise négative n'est autorisée.
5. Le démarrage verrouille la ville et les stocks, puis débite toutes les
   ressources et enregistre le chantier **dans la même transaction**.
6. Le rejet n'applique **aucun paiement partiel**.
7. Un ordre répété avec le **même UUID et les mêmes paramètres** retourne
   son reçu sans second débit ; un UUID réutilisé autrement est rejeté.
8. Le worker ne choisit jamais les ordres gagnants d'un combat ; il ne fait
   qu'achever des chantiers et conserve une preuve SQL.
9. L'achèvement d'un chantier ne débite aucune ressource supplémentaire.
10. Sans profil configuré pour le prochain niveau, aucune option d'achat
    n'est proposée. L'API n'a **ni annulation ni file d'attente**.

## Configuration administrative

Exemple **fictif de laboratoire**, prix/durée non historiques :

```bash
python -m mmhk_api.manage migrate

python -m mmhk_api.manage create-building-profile \
  --code experimental_hall --level 1 --policy-id LAB-V1 \
  --duration-seconds 120 \
  --cost-gold 10 --cost-wood 5 --cost-ore 1 --cost-crystal 0 \
  --cost-gems 0 --cost-sulfur 0 --cost-mercury 0
```

Pour démarrer un chantier, la ville doit déjà posséder les ressources
nécessaires ; le premier Havre du prototype démarre volontairement avec
des stocks à zéro pour ne pas inventer le capital historique. Alimenter
une **base locale de test**, par un outillage d'administration maîtrisé,
est nécessaire pour tester la dépense. **Ne pas créditer arbitrairement
des ressources sur une campagne réelle**.

L'exécution ponctuelle des chantiers échus est :

```bash
python -m mmhk_api.construction_worker --once --max-orders 25
```

Ce worker ne se lance pas automatiquement à l'installation : l'opérateur
doit encore prévoir un ordonnanceur fiable, une supervision et les
sauvegardes. PostgreSQL est la **source de vérité**, Redis n'intervient
pas dans les paiements, le statut ni la résolution.

## Tests

La suite réelle PostgreSQL couvre la migration V003, l'accès par compte,
le calcul des trois modes, les arrondis, l'atomicité du paiement,
les stocks insuffisants, les commandes répétées, le refus d'un deuxième
chantier, la mise à niveau suivante, l'achèvement exactement à la date
serveur et les workers concurrents.

```bash
MMHK_TEST_DATABASE_URL="$MMHK_DATABASE_URL" python -m pytest -q apps/api/tests
```

Les anciens tests Jactari continuent de s'appliquer sans modification.

## Travaux suivants

Il restera à reconstituer les **prix et durées historiques** par bâtiment
et niveau, leurs prérequis et leurs effets concrets. Il faudra aussi
formaliser les règles de siège affectant les chantiers, instaurer un
ordonnanceur d'exploitation, améliorer la sécurité d'authentification
avant exposition Internet et intégrer les ressources visuelles autorisées.

**Pas de PvP public : `productionBattleArbiterAllowed=false`.**
