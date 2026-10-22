# 4. Commerce, marché et caravanes

18 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-ECH-001 — Ouvrir le marché](#us-ech-001)
- [US-ECH-002 — Obtenir un prix marchand](#us-ech-002)
- [US-ECH-003 — Échanger avec le marchand](#us-ech-003)
- [US-ECH-004 — Parcourir les offres](#us-ech-004)
- [US-ECH-005 — Publier une offre](#us-ech-005)
- [US-ECH-006 — Acheter une offre](#us-ech-006)
- [US-ECH-007 — Participer à une enchère autorisée](#us-ech-007)
- [US-ECH-008 — Retirer une offre](#us-ech-008)
- [US-ECH-009 — Clore une vente expirée](#us-ech-009)
- [US-ECH-010 — Préparer une caravane](#us-ech-010)
- [US-ECH-011 — Respecter la charge d’une caravane](#us-ech-011)
- [US-ECH-012 — Envoyer une caravane](#us-ech-012)
- [US-ECH-013 — Livrer une caravane](#us-ech-013)
- [US-ECH-014 — Répéter mes convois](#us-ech-014)
- [US-ECH-015 — Définir une politique de quantité](#us-ech-015)
- [US-ECH-016 — Définir l’attente des convois](#us-ech-016)
- [US-ECH-017 — Arrêter un programme de convois](#us-ech-017)
- [US-ECH-018 — Comprendre la balance commerciale](#us-ech-018)

<a id="us-ech-001"></a>
## US-ECH-001 — Ouvrir le marché

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter marchand, caravanes et ventes afin de choisir le bon type d’échange.

### 2. Conversation — règles et décisions

- **Préconditions :** marché disponible dans ma cité.
- **Règles / traces :** SS-053.
- **Question à traiter :** Qualifier droits et services par profil.
- **Incertitudes liées :** `U28`, `U40` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-013](02-CIT.md#us-cit-013).
- **Exigences :** `REQ-TRADE-01`, `REQ-UI-10`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-001-CA01 — Parcours nominal**

- **Étant donné** marché disponible dans ma cité ;
- **Quand** je réalise le parcours « Ouvrir le marché » ;
- **Alors** trois fonctions et leurs droits sont distincts.

**US-ECH-001-CA02 — Refus ou exception**

- **Étant donné** marché absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** opération refusée.

**US-ECH-001-CA03 — Cas frontière**

- **Étant donné** onglet changé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** stocks de la même cité.

**US-ECH-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECH-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-013. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier droits et services par profil. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir le bon type d’échange. |
| E | Qualifier U28, U40 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **trois fonctions et leurs droits sont distincts**.
- [ ] Le cas frontière est vérifié : **onglet changé → stocks de la même cité**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-002"></a>
## US-ECH-002 — Obtenir un prix marchand

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite prévisualiser un échange immédiat afin de évaluer son coût réel.

### 2. Conversation — règles et décisions

- **Préconditions :** ressource et quantité sélectionnées.
- **Règles / traces :** G18, SS-053.
- **Question à traiter :** Retrouver taux, arrondis et fluctuations.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-001](04-ECH.md#us-ech-001).
- **Exigences :** `REQ-TRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-002-CA01 — Parcours nominal**

- **Étant donné** ressource et quantité sélectionnées ;
- **Quand** je réalise le parcours « Obtenir un prix marchand » ;
- **Alors** prix, taux et solde final estimé affichés.

**US-ECH-002-CA02 — Refus ou exception**

- **Étant donné** quantité négative ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** devis refusé.

**US-ECH-002-CA03 — Cas frontière**

- **Étant donné** taux modifié ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** nouveau prix soumis à validation.

**US-ECH-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECH-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver taux, arrondis et fluctuations. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : évaluer son coût réel. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **prix, taux et solde final estimé affichés**.
- [ ] Le cas frontière est vérifié : **taux modifié → nouveau prix soumis à validation**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-003"></a>
## US-ECH-003 — Échanger avec le marchand

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite valider une conversion immédiate afin de obtenir la ressource nécessaire.

### 2. Conversation — règles et décisions

- **Préconditions :** devis marchand valide.
- **Règles / traces :** G18 ; atomicité PROP.
- **Question à traiter :** Qualifier limites et stockage du crédit.
- **Incertitudes liées :** `U28`, `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-002](04-ECH.md#us-ech-002).
- **Exigences :** `REQ-TRADE-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-003-CA01 — Parcours nominal**

- **Étant donné** devis marchand valide ;
- **Quand** je réalise le parcours « Échanger avec le marchand » ;
- **Alors** débit et crédit cohérents sont réalisés ensemble.

**US-ECH-003-CA02 — Refus ou exception**

- **Étant donné** stock insuffisant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun échange partiel.

**US-ECH-003-CA03 — Cas frontière**

- **Étant donné** double validation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un règlement.

**US-ECH-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier limites et stockage du crédit. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : obtenir la ressource nécessaire. |
| E | Qualifier U28, U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **débit et crédit cohérents sont réalisés ensemble**.
- [ ] Le cas frontière est vérifié : **double validation → un règlement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-004"></a>
## US-ECH-004 — Parcourir les offres

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite rechercher une offre de ressource ou d’objet afin de trouver une contrepartie adaptée.

### 2. Conversation — règles et décisions

- **Préconditions :** l’hôtel des ventes est accessible.
- **Règles / traces :** SS-053 et G18.
- **Question à traiter :** Qualifier portée et filtres historiques.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-001](04-ECH.md#us-ech-001).
- **Exigences :** `REQ-TRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-004-CA01 — Parcours nominal**

- **Étant donné** l’hôtel des ventes est accessible ;
- **Quand** je réalise le parcours « Parcourir les offres » ;
- **Alors** offres visibles avec quantité, prix et échéance.

**US-ECH-004-CA02 — Refus ou exception**

- **Étant donné** offre périmée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** achat indisponible.

**US-ECH-004-CA03 — Cas frontière**

- **Étant donné** page actualisée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** disponibilité réelle retrouvée.

**US-ECH-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECH-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier portée et filtres historiques. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : trouver une contrepartie adaptée. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **offres visibles avec quantité, prix et échéance**.
- [ ] Le cas frontière est vérifié : **page actualisée → disponibilité réelle retrouvée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-005"></a>
## US-ECH-005 — Publier une offre

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite mettre un lot en vente afin de échanger mes excédents.

### 2. Conversation — règles et décisions

- **Préconditions :** lot détenu et vente autorisée.
- **Règles / traces :** G18 ; lot distinct du stock disponible.
- **Question à traiter :** Qualifier prix fixe ou enchère et commissions.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-004](04-ECH.md#us-ech-004).
- **Exigences :** `REQ-TRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-005-CA01 — Parcours nominal**

- **Étant donné** lot détenu et vente autorisée ;
- **Quand** je réalise le parcours « Publier une offre » ;
- **Alors** lot réservé et conditions publiées.

**US-ECH-005-CA02 — Refus ou exception**

- **Étant donné** lot déjà engagé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** publication refusée.

**US-ECH-005-CA03 — Cas frontière**

- **Étant donné** solde local ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** lot non dépensable une seconde fois.

**US-ECH-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier prix fixe ou enchère et commissions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : échanger mes excédents. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **lot réservé et conditions publiées**.
- [ ] Le cas frontière est vérifié : **solde local → lot non dépensable une seconde fois**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-006"></a>
## US-ECH-006 — Acheter une offre

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite acquérir un lot encore disponible afin de compléter mon approvisionnement.

### 2. Conversation — règles et décisions

- **Préconditions :** offre valide et moyens suffisants.
- **Règles / traces :** Contrat de règlement du marché.
- **Question à traiter :** Qualifier livraison immédiate ou transport.
- **Incertitudes liées :** `U28`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-004](04-ECH.md#us-ech-004).
- **Exigences :** `REQ-TRADE-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-006-CA01 — Parcours nominal**

- **Étant donné** offre valide et moyens suffisants ;
- **Quand** je réalise le parcours « Acheter une offre » ;
- **Alors** lot et paiement ont une contrepartie unique.

**US-ECH-006-CA02 — Refus ou exception**

- **Étant donné** deux acheteurs simultanés ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** un seul obtient le lot.

**US-ECH-006-CA03 — Cas frontière**

- **Étant donné** offre modifiée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ancien devis non exécuté.

**US-ECH-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier livraison immédiate ou transport. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : compléter mon approvisionnement. |
| E | Qualifier U28, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **lot et paiement ont une contrepartie unique**.
- [ ] Le cas frontière est vérifié : **offre modifiée → ancien devis non exécuté**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-007"></a>
## US-ECH-007 — Participer à une enchère autorisée

**Priorité proposée :** P2 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite déposer une proposition selon le mode de vente afin de obtenir un lot convoité.

### 2. Conversation — règles et décisions

- **Préconditions :** profil comportant des enchères qualifiées.
- **Règles / traces :** Hôtel des ventes observé, mécanisme précis inconnu.
- **Question à traiter :** Confirmer l’existence et le fonctionnement des enchères.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-004](04-ECH.md#us-ech-004).
- **Exigences :** `REQ-TRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-ECH-007-CA01 — Parcours nominal**

- **Étant donné** profil comportant des enchères qualifiées ;
- **Quand** je réalise le parcours « Participer à une enchère autorisée » ;
- **Alors** proposition admise selon minimum et échéance.

**US-ECH-007-CA02 — Refus ou exception**

- **Étant donné** mode non retenu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune enchère exposée.

**US-ECH-007-CA03 — Cas frontière**

- **Étant donné** offres simultanées ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** départage du profil.

**US-ECH-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Confirmer l’existence et le fonctionnement des enchères. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : obtenir un lot convoité. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **proposition admise selon minimum et échéance**.
- [ ] Le cas frontière est vérifié : **offres simultanées → départage du profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-008"></a>
## US-ECH-008 — Retirer une offre

**Priorité proposée :** P2 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite annuler une vente encore retirable afin de récupérer mon lot.

### 2. Conversation — règles et décisions

- **Préconditions :** offre possédée et retrait autorisé.
- **Règles / traces :** Fonction conditionnelle à qualifier.
- **Question à traiter :** Retrouver retrait, pénalités et restitution.
- **Incertitudes liées :** `U28`, `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-005](04-ECH.md#us-ech-005).
- **Exigences :** `REQ-TRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-ECH-008-CA01 — Parcours nominal**

- **Étant donné** offre possédée et retrait autorisé ;
- **Quand** je réalise le parcours « Retirer une offre » ;
- **Alors** lot restitué selon la règle de stockage.

**US-ECH-008-CA02 — Refus ou exception**

- **Étant donné** vente déjà conclue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** retrait refusé.

**US-ECH-008-CA03 — Cas frontière**

- **Étant donné** retrait et achat concurrents ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un seul résultat.

**US-ECH-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver retrait, pénalités et restitution. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : récupérer mon lot. |
| E | Qualifier U28, U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **lot restitué selon la règle de stockage**.
- [ ] Le cas frontière est vérifié : **retrait et achat concurrents → un seul résultat**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-009"></a>
## US-ECH-009 — Clore une vente expirée

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver le règlement final d’une offre afin de connaître le devenir du lot.

### 2. Conversation — règles et décisions

- **Préconditions :** échéance de vente atteinte.
- **Règles / traces :** Contrat de clôture selon mode qualifié.
- **Question à traiter :** Qualifier invendus, commissions et égalités.
- **Incertitudes liées :** `U28`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-005](04-ECH.md#us-ech-005).
- **Exigences :** `REQ-TRADE-01`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECH-009-CA01 — Parcours nominal**

- **Étant donné** échéance de vente atteinte ;
- **Quand** je réalise le parcours « Clore une vente expirée » ;
- **Alors** paiement ou restitution expliqué dans un rapport.

**US-ECH-009-CA02 — Refus ou exception**

- **Étant donné** échéance rejouée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun crédit supplémentaire.

**US-ECH-009-CA03 — Cas frontière**

- **Étant donné** dernière proposition à échéance ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ordre déterministe.

**US-ECH-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier invendus, commissions et égalités. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : connaître le devenir du lot. |
| E | Qualifier U28, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **paiement ou restitution expliqué dans un rapport**.
- [ ] Le cas frontière est vérifié : **dernière proposition à échéance → ordre déterministe**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-010"></a>
## US-ECH-010 — Préparer une caravane

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite choisir destination et chargement afin de approvisionner une autre cité.

### 2. Conversation — règles et décisions

- **Préconditions :** caravane autorisée depuis ma cité.
- **Règles / traces :** SS-053.
- **Question à traiter :** Qualifier destinations autorisées et portée.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-001](04-ECH.md#us-ech-001).
- **Exigences :** `REQ-CONVOY-01`, `REQ-UI-10`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-010-CA01 — Parcours nominal**

- **Étant donné** caravane autorisée depuis ma cité ;
- **Quand** je réalise le parcours « Préparer une caravane » ;
- **Alors** sept quantités et destination sont récapitulées.

**US-ECH-010-CA02 — Refus ou exception**

- **Étant donné** destination invalide ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** envoi refusé.

**US-ECH-010-CA03 — Cas frontière**

- **Étant donné** stocks d’arrivée privés ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune fuite d’information.

**US-ECH-010-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECH-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier destinations autorisées et portée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : approvisionner une autre cité. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **sept quantités et destination sont récapitulées**.
- [ ] Le cas frontière est vérifié : **stocks d’arrivée privés → aucune fuite d’information**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-011"></a>
## US-ECH-011 — Respecter la charge d’une caravane

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître la capacité de mon chargement afin de éviter un envoi impossible.

### 2. Conversation — règles et décisions

- **Préconditions :** plusieurs ressources sont sélectionnées.
- **Règles / traces :** SS-053, 30000 or/15 communes/6 rares observés.
- **Question à traiter :** Retrouver équivalences de charge et bonus.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-010](04-ECH.md#us-ech-010).
- **Exigences :** `REQ-CONVOY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-011-CA01 — Parcours nominal**

- **Étant donné** plusieurs ressources sont sélectionnées ;
- **Quand** je réalise le parcours « Respecter la charge d’une caravane » ;
- **Alors** charge mixte calculée selon une seule règle.

**US-ECH-011-CA02 — Refus ou exception**

- **Étant donné** charge excessive ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** confirmation refusée.

**US-ECH-011-CA03 — Cas frontière**

- **Étant donné** maxima individuels ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** non additionnés sans justification.

**US-ECH-011-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECH-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-010. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver équivalences de charge et bonus. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter un envoi impossible. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **charge mixte calculée selon une seule règle**.
- [ ] Le cas frontière est vérifié : **maxima individuels → non additionnés sans justification**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-012"></a>
## US-ECH-012 — Envoyer une caravane

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite engager mon chargement vers une destination afin de transférer mes ressources.

### 2. Conversation — règles et décisions

- **Préconditions :** charge, route et moyens valides.
- **Règles / traces :** G18 ; mission persistante.
- **Question à traiter :** Qualifier durée et rattachement de la caravane.
- **Incertitudes liées :** `U09`, `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-011](04-ECH.md#us-ech-011).
- **Exigences :** `REQ-CONVOY-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-012-CA01 — Parcours nominal**

- **Étant donné** charge, route et moyens valides ;
- **Quand** je réalise le parcours « Envoyer une caravane » ;
- **Alors** ressources quittent le disponible et un trajet commence.

**US-ECH-012-CA02 — Refus ou exception**

- **Étant donné** stock changé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** envoi refusé sans perte.

**US-ECH-012-CA03 — Cas frontière**

- **Étant donné** double confirmation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un chargement.

**US-ECH-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-011. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier durée et rattachement de la caravane. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : transférer mes ressources. |
| E | Qualifier U09, U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **ressources quittent le disponible et un trajet commence**.
- [ ] Le cas frontière est vérifié : **double confirmation → un chargement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-013"></a>
## US-ECH-013 — Livrer une caravane

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite recevoir le chargement arrivé afin de disposer des ressources transférées.

### 2. Conversation — règles et décisions

- **Préconditions :** caravane à destination.
- **Règles / traces :** Contrat de livraison proposé.
- **Question à traiter :** Qualifier siège, capture et dépassement.
- **Incertitudes liées :** `U19`, `U28`, `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-012](04-ECH.md#us-ech-012).
- **Exigences :** `REQ-CONVOY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECH-013-CA01 — Parcours nominal**

- **Étant donné** caravane à destination ;
- **Quand** je réalise le parcours « Livrer une caravane » ;
- **Alors** crédit unique à la cité autorisée.

**US-ECH-013-CA02 — Refus ou exception**

- **Étant donné** cité devenue interdite ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** politique de retour appliquée.

**US-ECH-013-CA03 — Cas frontière**

- **Étant donné** stock plein ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** excédent traité explicitement.

**US-ECH-013-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier siège, capture et dépassement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : disposer des ressources transférées. |
| E | Qualifier U19, U28, U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **crédit unique à la cité autorisée**.
- [ ] Le cas frontière est vérifié : **stock plein → excédent traité explicitement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-014"></a>
## US-ECH-014 — Répéter mes convois

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite programmer plusieurs envois afin de réduire les manipulations logistiques.

### 2. Conversation — règles et décisions

- **Préconditions :** paramètre de répétition disponible.
- **Règles / traces :** SS-053.
- **Question à traiter :** Qualifier le décompte exact des répétitions.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-012](04-ECH.md#us-ech-012).
- **Exigences :** `REQ-CONVOY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-014-CA01 — Parcours nominal**

- **Étant donné** paramètre de répétition disponible ;
- **Quand** je réalise le parcours « Répéter mes convois » ;
- **Alors** programme et trajets individuels sont distingués.

**US-ECH-014-CA02 — Refus ou exception**

- **Étant donné** nombre invalide ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** programme refusé.

**US-ECH-014-CA03 — Cas frontière**

- **Étant donné** valeur 4 fois ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** sens total ou répétitions fixé.

**US-ECH-014-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier le décompte exact des répétitions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réduire les manipulations logistiques. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **programme et trajets individuels sont distingués**.
- [ ] Le cas frontière est vérifié : **valeur 4 fois → sens total ou répétitions fixé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-015"></a>
## US-ECH-015 — Définir une politique de quantité

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite choisir le comportement si les ressources manquent afin de maîtriser mes convois répétés.

### 2. Conversation — règles et décisions

- **Préconditions :** un programme de convoi existe.
- **Règles / traces :** SS-053, quantité exacte observée.
- **Question à traiter :** Retrouver les autres valeurs de la liste.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-014](04-ECH.md#us-ech-014).
- **Exigences :** `REQ-CONVOY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-015-CA01 — Parcours nominal**

- **Étant donné** un programme de convoi existe ;
- **Quand** je réalise le parcours « Définir une politique de quantité » ;
- **Alors** la politique nommée s’applique à chaque départ.

**US-ECH-015-CA02 — Refus ou exception**

- **Étant donné** quantité exacte indisponible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de débit négatif.

**US-ECH-015-CA03 — Cas frontière**

- **Étant donné** stock reconstitué ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** reprise uniquement si prévue.

**US-ECH-015-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-015-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-014. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver les autres valeurs de la liste. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : maîtriser mes convois répétés. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **la politique nommée s’applique à chaque départ**.
- [ ] Le cas frontière est vérifié : **stock reconstitué → reprise uniquement si prévue**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-016"></a>
## US-ECH-016 — Définir l’attente des convois

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite configurer l’attente entre envois afin de adapter ma logistique à ma production.

### 2. Conversation — règles et décisions

- **Préconditions :** la commande d’attente est disponible.
- **Règles / traces :** SS-053, Pas d’attente observé.
- **Question à traiter :** Qualifier options et réaction au manque de stock.
- **Incertitudes liées :** `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-014](04-ECH.md#us-ech-014).
- **Exigences :** `REQ-CONVOY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-016-CA01 — Parcours nominal**

- **Étant donné** la commande d’attente est disponible ;
- **Quand** je réalise le parcours « Définir l’attente des convois » ;
- **Alors** prochain départ suit la politique explicite.

**US-ECH-016-CA02 — Refus ou exception**

- **Étant donné** délai invalide ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** programme non modifié.

**US-ECH-016-CA03 — Cas frontière**

- **Étant donné** pas d’attente ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune boucle créant des ressources.

**US-ECH-016-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-016-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-014. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier options et réaction au manque de stock. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter ma logistique à ma production. |
| E | Qualifier U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **prochain départ suit la politique explicite**.
- [ ] Le cas frontière est vérifié : **pas d’attente → aucune boucle créant des ressources**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-017"></a>
## US-ECH-017 — Arrêter un programme de convois

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite interrompre les futurs envois afin de réagir à une menace.

### 2. Conversation — règles et décisions

- **Préconditions :** programme répétitif actif.
- **Règles / traces :** Gestion proposée du programme.
- **Question à traiter :** Confirmer le droit d’arrêt et son instant d’effet.
- **Incertitudes liées :** `U28`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-014](04-ECH.md#us-ech-014).
- **Exigences :** `REQ-CONVOY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ECH-017-CA01 — Parcours nominal**

- **Étant donné** programme répétitif actif ;
- **Quand** je réalise le parcours « Arrêter un programme de convois » ;
- **Alors** aucun nouveau départ après arrêt accepté.

**US-ECH-017-CA02 — Refus ou exception**

- **Étant donné** trajet déjà parti ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non effacé rétroactivement.

**US-ECH-017-CA03 — Cas frontière**

- **Étant donné** arrêt à l’heure du départ ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ordre défini.

**US-ECH-017-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ECH-017-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-014. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Confirmer le droit d’arrêt et son instant d’effet. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réagir à une menace. |
| E | Qualifier U28, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **aucun nouveau départ après arrêt accepté**.
- [ ] Le cas frontière est vérifié : **arrêt à l’heure du départ → ordre défini**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-ech-018"></a>
## US-ECH-018 — Comprendre la balance commerciale

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir une restriction d’échange disproportionné afin de préparer des transactions autorisées.

### 2. Conversation — règles et décisions

- **Préconditions :** profil comportant cette règle.
- **Règles / traces :** G17, règle saisonnière.
- **Question à traiter :** Qualifier assiette, progression et exclusions.
- **Incertitudes liées :** `U29` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ECH-003](04-ECH.md#us-ech-003), [US-ECH-012](04-ECH.md#us-ech-012).
- **Exigences :** `REQ-TRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ECH-018-CA01 — Parcours nominal**

- **Étant donné** profil comportant cette règle ;
- **Quand** je réalise le parcours « Comprendre la balance commerciale » ;
- **Alors** solde, valorisation et raison du refus sont expliqués.

**US-ECH-018-CA02 — Refus ou exception**

- **Étant donné** profil sans balance ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun blocage importé de S3.

**US-ECH-018-CA03 — Cas frontière**

- **Étant donné** Guerre des Larmes ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** désactivation seulement si prévue.

**US-ECH-018-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ECH-018-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ECH-003, US-ECH-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier assiette, progression et exclusions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer des transactions autorisées. |
| E | Qualifier U29 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **solde, valorisation et raison du refus sont expliqués**.
- [ ] Le cas frontière est vérifié : **Guerre des Larmes → désactivation seulement si prévue**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

