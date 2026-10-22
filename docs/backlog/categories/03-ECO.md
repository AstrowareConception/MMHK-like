# 3. Économie, ressources et stockage

12 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-ECO-001 — Lire mes stocks](#us-eco-001)
- [US-ECO-002 — Expliquer ma production](#us-eco-002)
- [US-ECO-003 — Produire hors connexion](#us-eco-003)
- [US-ECO-004 — Atteindre le plafond](#us-eco-004)
- [US-ECO-005 — Comprendre un refus de dépense](#us-eco-005)
- [US-ECO-006 — Voir mes engagements](#us-eco-006)
- [US-ECO-007 — Consulter l’entretien](#us-eco-007)
- [US-ECO-008 — Régler l’entretien](#us-eco-008)
- [US-ECO-009 — Anticiper l’insolvabilité](#us-eco-009)
- [US-ECO-010 — Traiter un crédit excédentaire](#us-eco-010)
- [US-ECO-011 — Comparer mes cités](#us-eco-011)
- [US-ECO-012 — Expliquer une variation](#us-eco-012)

<a id="us-eco-001"></a>
## US-ECO-001 — Lire mes stocks

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les sept ressources locales afin de savoir ce que je peux dépenser.

### 2. Conversation — règles et décisions

- **Préconditions :** ma cité est ouverte.
- **Règles / traces :** SS-033/053.
- **Question à traiter :** Définir disponible, réservé et transit.
- **Incertitudes liées :** `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-001](02-CIT.md#us-cit-001).
- **Exigences :** `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECO-001-CA01 — Parcours nominal**

- **Étant donné** ma cité est ouverte ;
- **Quand** je réalise le parcours « Lire mes stocks » ;
- **Alors** stocks et disponibilité sont distingués.

**US-ECO-001-CA02 — Refus ou exception**

- **Étant donné** autre cité ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun portefeuille global implicite.

**US-ECO-001-CA03 — Cas frontière**

- **Étant donné** transit ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ressources non dépensables localement.

**US-ECO-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECO-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir disponible, réservé et transit. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : savoir ce que je peux dépenser. |
| E | Qualifier U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **stocks et disponibilité sont distingués**.
- [ ] Le cas frontière est vérifié : **transit → ressources non dépensables localement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-002"></a>
## US-ECO-002 — Expliquer ma production

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter le détail des revenus afin de choisir les améliorations rentables.

### 2. Conversation — règles et décisions

- **Préconditions :** des producteurs sont actifs.
- **Règles / traces :** G08/G11/G18.
- **Question à traiter :** Qualifier portée et cumul des bonus.
- **Incertitudes liées :** `U03`, `U04` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECO-001](03-ECO.md#us-eco-001).
- **Exigences :** `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECO-002-CA01 — Parcours nominal**

- **Étant donné** des producteurs sont actifs ;
- **Quand** je réalise le parcours « Expliquer ma production » ;
- **Alors** base, bonus et total sont ventilés.

**US-ECO-002-CA02 — Refus ou exception**

- **Étant donné** source inactive ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** revenu nul.

**US-ECO-002-CA03 — Cas frontière**

- **Étant donné** héros similaires ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** cumul du profil.

**US-ECO-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECO-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier portée et cumul des bonus. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir les améliorations rentables. |
| E | Qualifier U03, U04 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **base, bonus et total sont ventilés**.
- [ ] Le cas frontière est vérifié : **héros similaires → cumul du profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-003"></a>
## US-ECO-003 — Produire hors connexion

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver les ressources produites afin de progresser pendant mon absence.

### 2. Conversation — règles et décisions

- **Préconditions :** ma cité produit.
- **Règles / traces :** Persistance du monde.
- **Question à traiter :** Fixer cadence et fractions.
- **Incertitudes liées :** `U03`, `U04` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECO-001](03-ECO.md#us-eco-001).
- **Exigences :** `REQ-STOCK-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECO-003-CA01 — Parcours nominal**

- **Étant donné** ma cité produit ;
- **Quand** je réalise le parcours « Produire hors connexion » ;
- **Alors** crédit conforme au temps serveur.

**US-ECO-003-CA02 — Refus ou exception**

- **Étant donné** rafraîchissements ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun crédit indu.

**US-ECO-003-CA03 — Cas frontière**

- **Étant donné** bonus modifié au milieu ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** intervalles séparés.

**US-ECO-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECO-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer cadence et fractions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : progresser pendant mon absence. |
| E | Qualifier U03, U04 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **crédit conforme au temps serveur**.
- [ ] Le cas frontière est vérifié : **bonus modifié au milieu → intervalles séparés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-004"></a>
## US-ECO-004 — Atteindre le plafond

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir la saturation du stockage afin de éviter de gaspiller ma production.

### 2. Conversation — règles et décisions

- **Préconditions :** une ressource atteint sa capacité.
- **Règles / traces :** G16, or distinct.
- **Question à traiter :** Qualifier fractions et reprise.
- **Incertitudes liées :** `U04`, `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECO-003](03-ECO.md#us-eco-003).
- **Exigences :** `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECO-004-CA01 — Parcours nominal**

- **Étant donné** une ressource atteint sa capacité ;
- **Quand** je réalise le parcours « Atteindre le plafond » ;
- **Alors** stock et arrêt du crédit sont cohérents.

**US-ECO-004-CA02 — Refus ou exception**

- **Étant donné** stock plein ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de réserve cachée.

**US-ECO-004-CA03 — Cas frontière**

- **Étant donné** capacité accrue ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** production future reprend.

**US-ECO-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECO-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier fractions et reprise. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter de gaspiller ma production. |
| E | Qualifier U04, U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **stock et arrêt du crédit sont cohérents**.
- [ ] Le cas frontière est vérifié : **capacité accrue → production future reprend**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-005"></a>
## US-ECO-005 — Comprendre un refus de dépense

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite identifier les ressources manquantes afin de préparer une action possible.

### 2. Conversation — règles et décisions

- **Préconditions :** mon devis dépasse mes moyens.
- **Règles / traces :** Contrat proposé.
- **Question à traiter :** Présenter le devis devenu périmé.
- **Incertitudes liées :** aucune incertitude locale déclarée ; profil et préconditions communs restent à qualifier.
- **Dépendances fonctionnelles :** [US-ECO-001](03-ECO.md#us-eco-001).
- **Exigences :** `REQ-STOCK-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECO-005-CA01 — Parcours nominal**

- **Étant donné** mon devis dépasse mes moyens ;
- **Quand** je réalise le parcours « Comprendre un refus de dépense » ;
- **Alors** manques détaillés par ressource.

**US-ECO-005-CA02 — Refus ou exception**

- **Étant donné** un manque ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun débit partiel.

**US-ECO-005-CA03 — Cas frontière**

- **Étant donné** commande concurrente ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** solde actualisé.

**US-ECO-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECO-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Présenter le devis devenu périmé. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer une action possible. |
| E | L’équipe doit estimer cette fiche après revue des données et du parcours ; aucun chiffrage en points n’est inventé. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Exécution et résultats restent à produire. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **manques détaillés par ressource**.
- [ ] Le cas frontière est vérifié : **commande concurrente → solde actualisé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-006"></a>
## US-ECO-006 — Voir mes engagements

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite distinguer fonds libres et engagés afin de éviter de compter deux fois mes moyens.

### 2. Conversation — règles et décisions

- **Préconditions :** des ordres économiques existent.
- **Règles / traces :** Cohérence proposée.
- **Question à traiter :** Fixer débit ou réservation par commande.
- **Incertitudes liées :** `U05`, `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECO-001](03-ECO.md#us-eco-001).
- **Exigences :** `REQ-STOCK-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECO-006-CA01 — Parcours nominal**

- **Étant donné** des ordres économiques existent ;
- **Quand** je réalise le parcours « Voir mes engagements » ;
- **Alors** engagements rattachés aux ordres.

**US-ECO-006-CA02 — Refus ou exception**

- **Étant donné** dépenses incompatibles ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** une seule admise.

**US-ECO-006-CA03 — Cas frontière**

- **Étant donné** ordre échoué ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** restitution selon politique.

**US-ECO-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECO-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer débit ou réservation par commande. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter de compter deux fois mes moyens. |
| E | Qualifier U05, U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **engagements rattachés aux ordres**.
- [ ] Le cas frontière est vérifié : **ordre échoué → restitution selon politique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-007"></a>
## US-ECO-007 — Consulter l’entretien

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir le coût militaire local afin de dimensionner mon armée.

### 2. Conversation — règles et décisions

- **Préconditions :** des troupes sont entretenues.
- **Règles / traces :** G08 et calculateur divergent.
- **Question à traiter :** Qualifier barème et rattachement.
- **Incertitudes liées :** `U07` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-001](09-ARM.md#us-arm-001).
- **Exigences :** `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECO-007-CA01 — Parcours nominal**

- **Étant donné** des troupes sont entretenues ;
- **Quand** je réalise le parcours « Consulter l’entretien » ;
- **Alors** seuils, puissance et réductions détaillés.

**US-ECO-007-CA02 — Refus ou exception**

- **Étant donné** barème non qualifié ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune certification historique.

**US-ECO-007-CA03 — Cas frontière**

- **Étant donné** seuil franchi ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** variation expliquée.

**US-ECO-007-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECO-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier barème et rattachement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : dimensionner mon armée. |
| E | Qualifier U07 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **seuils, puissance et réductions détaillés**.
- [ ] Le cas frontière est vérifié : **seuil franchi → variation expliquée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-008"></a>
## US-ECO-008 — Régler l’entretien

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver le prélèvement militaire afin de maintenir une économie prévisible.

### 2. Conversation — règles et décisions

- **Préconditions :** une échéance arrive.
- **Règles / traces :** Prélèvement selon profil.
- **Question à traiter :** Fixer cadence et puissance retenue.
- **Incertitudes liées :** `U03`, `U07` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECO-007](03-ECO.md#us-eco-007).
- **Exigences :** `REQ-STOCK-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECO-008-CA01 — Parcours nominal**

- **Étant donné** une échéance arrive ;
- **Quand** je réalise le parcours « Régler l’entretien » ;
- **Alors** prélèvement unique et traçable.

**US-ECO-008-CA02 — Refus ou exception**

- **Étant donné** échéance rejouée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de second débit.

**US-ECO-008-CA03 — Cas frontière**

- **Étant donné** transfert de troupes ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de double facture.

**US-ECO-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECO-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer cadence et puissance retenue. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : maintenir une économie prévisible. |
| E | Qualifier U03, U07 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **prélèvement unique et traçable**.
- [ ] Le cas frontière est vérifié : **transfert de troupes → pas de double facture**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-009"></a>
## US-ECO-009 — Anticiper l’insolvabilité

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître les effets d’un déficit afin de corriger mon économie.

### 2. Conversation — règles et décisions

- **Préconditions :** entretien supérieur au solde.
- **Règles / traces :** U08 non résolue.
- **Question à traiter :** Qualifier dette, blocage ou autre effet.
- **Incertitudes liées :** `U08` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECO-007](03-ECO.md#us-eco-007).
- **Exigences :** `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECO-009-CA01 — Parcours nominal**

- **Étant donné** entretien supérieur au solde ;
- **Quand** je réalise le parcours « Anticiper l’insolvabilité » ;
- **Alors** conséquence configurée expliquée.

**US-ECO-009-CA02 — Refus ou exception**

- **Étant donné** règle inconnue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune désertion inventée.

**US-ECO-009-CA03 — Cas frontière**

- **Étant donné** solde rétabli ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** état actualisé.

**US-ECO-009-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECO-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier dette, blocage ou autre effet. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : corriger mon économie. |
| E | Qualifier U08 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **conséquence configurée expliquée**.
- [ ] Le cas frontière est vérifié : **solde rétabli → état actualisé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-010"></a>
## US-ECO-010 — Traiter un crédit excédentaire

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître le devenir d’un gain hors plafond afin de éviter une perte silencieuse.

### 2. Conversation — règles et décisions

- **Préconditions :** un crédit exceptionnel dépasse la capacité.
- **Règles / traces :** G16 ; provenance déterminante.
- **Question à traiter :** Qualifier achat, récompense et retour.
- **Incertitudes liées :** `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECO-004](03-ECO.md#us-eco-004).
- **Exigences :** `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECO-010-CA01 — Parcours nominal**

- **Étant donné** un crédit exceptionnel dépasse la capacité ;
- **Quand** je réalise le parcours « Traiter un crédit excédentaire » ;
- **Alors** excédent traité selon provenance.

**US-ECO-010-CA02 — Refus ou exception**

- **Étant donné** politique absente ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de règle improvisée.

**US-ECO-010-CA03 — Cas frontière**

- **Étant donné** production ordinaire ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** règle distincte.

**US-ECO-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECO-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier achat, récompense et retour. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter une perte silencieuse. |
| E | Qualifier U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **excédent traité selon provenance**.
- [ ] Le cas frontière est vérifié : **production ordinaire → règle distincte**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-011"></a>
## US-ECO-011 — Comparer mes cités

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter leurs besoins économiques afin de organiser ma spécialisation.

### 2. Conversation — règles et décisions

- **Préconditions :** plusieurs cités possédées.
- **Règles / traces :** Synthèse proposée.
- **Question à traiter :** Choisir les indicateurs sans mutualisation.
- **Incertitudes liées :** aucune incertitude locale déclarée ; profil et préconditions communs restent à qualifier.
- **Dépendances fonctionnelles :** [US-ECO-002](03-ECO.md#us-eco-002).
- **Exigences :** `REQ-STOCK-01`, `REQ-AUTH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECO-011-CA01 — Parcours nominal**

- **Étant donné** plusieurs cités possédées ;
- **Quand** je réalise le parcours « Comparer mes cités » ;
- **Alors** stocks et revenus séparés et datés.

**US-ECO-011-CA02 — Refus ou exception**

- **Étant donné** cité adverse ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun détail privé.

**US-ECO-011-CA03 — Cas frontière**

- **Étant donné** cité conquise ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** droits actualisés.

**US-ECO-011-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECO-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Choisir les indicateurs sans mutualisation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : organiser ma spécialisation. |
| E | L’équipe doit estimer cette fiche après revue des données et du parcours ; aucun chiffrage en points n’est inventé. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Exécution et résultats restent à produire. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **stocks et revenus séparés et datés**.
- [ ] Le cas frontière est vérifié : **cité conquise → droits actualisés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-eco-012"></a>
## US-ECO-012 — Expliquer une variation

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver l’origine d’un changement de stock afin de contrôler mon économie.

### 2. Conversation — règles et décisions

- **Préconditions :** des événements économiques existent.
- **Règles / traces :** Journal proposé.
- **Question à traiter :** Fixer conservation et granularité.
- **Incertitudes liées :** aucune incertitude locale déclarée ; profil et préconditions communs restent à qualifier.
- **Dépendances fonctionnelles :** [US-ECO-001](03-ECO.md#us-eco-001).
- **Exigences :** `REQ-REPORT-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECO-012-CA01 — Parcours nominal**

- **Étant donné** des événements économiques existent ;
- **Quand** je réalise le parcours « Expliquer une variation » ;
- **Alors** montant, origine, lieu et date visibles.

**US-ECO-012-CA02 — Refus ou exception**

- **Étant donné** événement adverse privé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** masqué.

**US-ECO-012-CA03 — Cas frontière**

- **Étant donné** ordre réessayé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** variation unique.

**US-ECO-012-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECO-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECO-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer conservation et granularité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : contrôler mon économie. |
| E | L’équipe doit estimer cette fiche après revue des données et du parcours ; aucun chiffrage en points n’est inventé. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Exécution et résultats restent à produire. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **montant, origine, lieu et date visibles**.
- [ ] Le cas frontière est vérifié : **ordre réessayé → variation unique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

