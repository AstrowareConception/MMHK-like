# V107 — Étendre une mine, premier chantier LAB G11

Date : 5 novembre 2026. Profil : LAB-G11-SINGLE-EXTENSION-005-V1.
US-REG-006 : parcours candidat, non accepté dans le jeu classique S2.
Migration : 106_lab_mine_extension_sites.sql.

## Provenance, et ce que la source NE permet pas d'affirmer

docs/game-design/02-MONDE-VILLES-ECONOMIE.md, source G11 :
une extension de mine apporte un **bonus nominal de +5 %** ;
**la construction d'une extension interrompt la production de la mine**,
contrairement à la hausse du niveau qui conserve cette production.

G11 ne qualifie pas suffisamment dans notre corpus :
- les prix et durées de construction des extensions ;
- les cellules exactes et les règles d'occupation applicables ;
- le nombre d'extensions, leur empilement (additif/multiplicatif)
  et leur interaction avec les aménagements ou bonus des héros ;
- les prérequis de niveau et de classe des constructeurs.

Aucune valeur absente ne peut donc être présentée comme un barème
de la saison historique. Le modèle V107 est explicitement limité
à **une seule extension par mine**, sur un site LAB libre adjacent
à la mine et attesté par un opérateur. Le bonus unique de 5 %
est une **variante additive documentée comme expérimentale**,
et non une affirmation sur le cumul MMHK historique.

## Qualification du site et de ses paramètres

Préconditions : mine déjà libérée et activée par V103/V104,
profil de monde LAB- non certifié historique, horloge économique
à jour, mine au taux existant sans bonus additif concurrent,
aucun chantier de niveau encore actif, emplacement non occupé
par une mine, une rencontre ou un gisement naturel.

L'opérateur fournit lui-même son coût, sa durée, son seuil de héros
et l'emplacement vérifié ; aucun de ces nombres ne provient de G11.
Par exemple, avec des valeurs de **fixture LAB non historiques** :

    python -m mmhk_api.manage qualify-lab-mine-extension \
      --city-id UUID_CITE \
      --resource gold \
      --site-i 1 --site-j 1 \
      --cost-gold 1000 \
      --duration-seconds 7200 \
      --required-hero-level 1 \
      --source-ref LAB-QUALIFICATION-EXTENSION-LOCALE \
      --acknowledge-experimental

L'emplacement de l'exemple doit réellement être libre et adjacent :
le serveur refusera une coordonnée incompatible. Ces valeurs
illustratives ne sont pas configurées automatiquement.

La base refuse le déplacement du site après qualification,
la création ultérieure d'une mine, d'une rencontre ou d'un gisement
sur ce site, et la modification arbitraire du reçu de chantier.
La suppression légitime de la cité conserve les cascades de nettoyage.

## Parcours joueur et économie

1. Depuis le registre des niveaux, ouvrir « Extensions minières LAB ».
2. Une mine qualifiée présente un devis vérifiable, son emplacement,
   la durée explicite, le +5 % unique et les héros admissibles.
3. Choisir un héros du compte, disponible et d'un niveau suffisant.
4. Le serveur verrouille la cité et l'horloge, refuse l'absence de mine
   qualifiée et les chantiers de niveau concurrents, débite l'or une
   seule fois et enregistre l'ordre avec UUID d'idempotence.
5. Durant le chantier, seul **le rendement de cette mine** est suspendu.
   Les autres mines continuent de produire ; aucune fraction antérieure
   du taux suspendu n'est effacée.
6. Les ticks dont le **début** est antérieur au démarrage des travaux
   ne sont pas effacés ; les ticks compris entre le début des travaux
   et l'échéance ne produisent pas sur la mine concernée.
7. Lorsque l'horloge a réglé tous les ticks commencés avant
   l'échéance, la même transaction clôture l'ordre et active le bonus
   additif de 0.0500. Les nouveaux ticks l'appliquent avec le
   calcul de fractions et de plafonds du moteur existant.
8. Rejeu, second ordre sur cette mine et tentative étrangère
   ne procurent ni dépense répétée ni second bonus.

**Interdiction de confusion :** un chantier d'extension suspend
la production ; une amélioration de niveau V106 la maintient.
Les deux chantiers sont mutuellement exclus sur la même mine.

## Contrôles de recette

- [ ] Emplacement libre adjacent, collision mine/PNJ/gisement refusée
- [ ] Coût et durée attestés, non reconstruits par approximation
- [ ] Héros admissible, mauvais propriétaire et ordre inconnu refusés
- [ ] Débit unique, rejeu UUID, second chantier et doublon interdits
- [ ] V106/V107 incompatibles simultanément
- [ ] Arrêt de la mine seulement pendant les cycles applicables
- [ ] Autres mines inchangées pendant la construction
- [ ] 5 % après échéance, respect des fractions et des plafonds
- [ ] Pas de production rétroactive, pas de double bonus après rejeu
- [ ] Contrat API, build TypeScript, PostgreSQL, recette Chromium
- [ ] 300/300 US, distinction entre livraison LAB et DoD classique

## Restes pour acceptation historique

US-REG-006 exige toujours de qualifier les coûts/temps historiques,
la géométrie des extensions, les interactions avec les aménagements,
les modes de construction, le nombre d'extensions et les modalités
d'addition des bonus. La réussite des tests V107 n'accepte pas la
story classique.
