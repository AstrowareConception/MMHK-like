# Recette US-COM-010 — Distinguer égalité et faux nul Jactari

**Date : 5 novembre 2026. Priorité P0. État : code candidat, non accepté.**

Source : [US-COM-010](categories/11-COM.md#us-com-010).
Référence : `data/Jactari/src/scripts/combat.min.js`,
fonction `simulation_combat` et branche finale `resultat.faux_nul`,
révision communautaire épinglée dans `docs/research/SOURCES.md`.

## Règle retrouvée

Trois situations distinctes ne doivent pas être confondues :

- **Vraie égalité** (`nul=true`) : les deux pelotons
  sont dispersés, avec zéro unité active à la fin de l'échange.
- **Faux nul +1** : l'attaquant reçoit le marqueur technique
  de victoire, mais peut finir à zéro unité active ; il n'est
  pas marqué `disperse` dans la branche élémentaire Jactari.
- **Faux nul -1** : cas symétrique concernant le défenseur.

Ces marqueurs sont des règles spécifiques du calculateur,
et **non une raison d'inventer un jet aléatoire** ou une
récompense. La branche d'origine utilise le marqueur pour
trancher la fin du combat lorsque les dernières lignes sont
épuisées. Elle comporte aussi des interactions avec des
résurrections que le laboratoire ne couvre pas encore.

## Éléments développés

- `jactari_duel_ending.py` : module déterministe qui valide
  `draw`, `falseDraw`, les indicateurs de dispersion et les
  effectifs restants.
- `pve_stack_sequence.py` : sépare la sortie de la ligne
  de combat du statut de dispersion. Un peloton à zéro effectif
  est retiré de la ligne, même s'il n'est pas techniquement
  marqué dispersé. Le marqueur de faux nul reste disponible
  pour trancher la fin si les deux camps sont épuisés.
- `pve_report_interpretation.py` : restitue le verdict
  technique des rapports mono-peloton sans le convertir
  en morts ou en butin.
- `apps/web/lib/server-api.ts` et les vues régionales :
  types et explications accessibles au joueur.

**Limite importante** : la gestion de la suite des pelotons
épuisés est une politique de sûreté du laboratoire. La fidélité
aux interactions de faux nuls, résurrections et magie dans toutes
les versions de Jactari reste à qualifier.

## Critères

| CA | Preuve candidate | État |
|---|---|---|
| CA01 — égalités et arrondis stables | Jactari vrai nul et faux nul +1 ; marquage sans hasard | Tests écrits, à exécuter |
| CA02 — règle non qualifiée => pas d'arbitrage inventé | Combinaison incohérente `draw/falseDraw` refusée | Test écrit ; recette S2 à qualifier |
| CA03 — écart d'une unité | 10 contre 11 et 11 contre 10 avec même puissance par unité | Tests écrits, à exécuter |
| CA04 — reprise/idempotence | Fonction pure, résultat identique au rejeu | Tests écrits, worker complet non recetté |
| CA05 — droits/visibilité | Exposition uniquement via les API de preview/rapport appartenant au joueur | Test réel à deux comptes non exécuté |

**DoD non validée**, aucun résultat de la bataille complète
S2 ou capture/libération de région n'est certifié.

Tests :
`apps/api/tests/test_jactari_duel_ending.py` et
`apps/api/tests/test_pve_report_interpretation.py`.
