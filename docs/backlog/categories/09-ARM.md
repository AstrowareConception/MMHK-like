# 9. Recrutement, unités et armées

16 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-ARM-001 — Consulter mes forces](#us-arm-001)
- [US-ARM-002 — Consulter une lignée](#us-arm-002)
- [US-ARM-003 — Accumuler des recrues](#us-arm-003)
- [US-ARM-004 — Obtenir un devis de recrutement](#us-arm-004)
- [US-ARM-005 — Recruter des unités](#us-arm-005)
- [US-ARM-006 — Accéder au tier sept](#us-arm-006)
- [US-ARM-007 — Améliorer des troupes](#us-arm-007)
- [US-ARM-008 — Affecter des troupes à un héros](#us-arm-008)
- [US-ARM-009 — Composer mes pelotons](#us-arm-009)
- [US-ARM-010 — Diviser un peloton](#us-arm-010)
- [US-ARM-011 — Fusionner des pelotons](#us-arm-011)
- [US-ARM-012 — Réordonner mon armée](#us-arm-012)
- [US-ARM-013 — Déposer des troupes en garnison](#us-arm-013)
- [US-ARM-014 — Évaluer la puissance brute](#us-arm-014)
- [US-ARM-015 — Recruter un engin de siège](#us-arm-015)
- [US-ARM-016 — Recevoir les survivants](#us-arm-016)

<a id="us-arm-001"></a>
## US-ARM-001 — Consulter mes forces

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir unités de garnison et armées de héros afin de évaluer mes moyens militaires.

### 2. Conversation — règles et décisions

- **Préconditions :** mon royaume possède des troupes.
- **Règles / traces :** CODE-01 et captures.
- **Question à traiter :** Qualifier défense multi-héros et stockage.
- **Incertitudes liées :** `U18` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-ARMY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-001-CA01 — Parcours nominal**

- **Étant donné** mon royaume possède des troupes ;
- **Quand** je réalise le parcours « Consulter mes forces » ;
- **Alors** quantités, types et affectations sont distingués.

**US-ARM-001-CA02 — Refus ou exception**

- **Étant donné** armée adverse ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun effectif privé.

**US-ARM-001-CA03 — Cas frontière**

- **Étant donné** sept cases de combat ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de plafond de stockage déduit.

**US-ARM-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ARM-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier défense multi-héros et stockage. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : évaluer mes moyens militaires. |
| E | Qualifier U18 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **quantités, types et affectations sont distingués**.
- [ ] Le cas frontière est vérifié : **sept cases de combat → pas de plafond de stockage déduit**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-002"></a>
## US-ARM-002 — Consulter une lignée

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite comparer T1–T7 et améliorations afin de choisir mes recrutements.

### 2. Conversation — règles et décisions

- **Préconditions :** catalogue autorisé chargé.
- **Règles / traces :** 70 unités ordinaires des cinq factions.
- **Question à traiter :** Qualifier disponibilité par profil.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-001](09-ARM.md#us-arm-001).
- **Exigences :** `REQ-DATA-01`, `REQ-RECRUIT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-002-CA01 — Parcours nominal**

- **Étant donné** catalogue autorisé chargé ;
- **Quand** je réalise le parcours « Consulter une lignée » ;
- **Alors** arme, puissance, coût et production par unité visibles.

**US-ARM-002-CA02 — Refus ou exception**

- **Étant donné** PNJ sans production ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non recrutable.

**US-ARM-002-CA03 — Cas frontière**

- **Étant donné** squelette amélioré ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** changement d’arme et puissance exacts.

**US-ARM-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ARM-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier disponibilité par profil. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir mes recrutements. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **arme, puissance, coût et production par unité visibles**.
- [ ] Le cas frontière est vérifié : **squelette amélioré → changement d’arme et puissance exacts**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-003"></a>
## US-ARM-003 — Accumuler des recrues

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver la production des demeures afin de constituer mon potentiel de recrutement.

### 2. Conversation — règles et décisions

- **Préconditions :** demeure active.
- **Règles / traces :** Production nominale 15/10/7/5/3/2/1.
- **Question à traiter :** Qualifier cadence, plafond et partage des variantes.
- **Incertitudes liées :** `U03`, `U06` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-009](02-CIT.md#us-cit-009).
- **Exigences :** `REQ-RECRUIT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-003-CA01 — Parcours nominal**

- **Étant donné** demeure active ;
- **Quand** je réalise le parcours « Accumuler des recrues » ;
- **Alors** recrues produites selon cadence et bonus.

**US-ARM-003-CA02 — Refus ou exception**

- **Étant donné** demeure absente ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune recrue.

**US-ARM-003-CA03 — Cas frontière**

- **Étant donné** reconnexion ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de production doublée.

**US-ARM-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier cadence, plafond et partage des variantes. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : constituer mon potentiel de recrutement. |
| E | Qualifier U03, U06 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **recrues produites selon cadence et bonus**.
- [ ] Le cas frontière est vérifié : **reconnexion → pas de production doublée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-004"></a>
## US-ARM-004 — Obtenir un devis de recrutement

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite choisir quantité et type à recruter afin de prévoir ressources et disponibilité.

### 2. Conversation — règles et décisions

- **Préconditions :** un stock de recrues existe.
- **Règles / traces :** Coûts par unité CODE-01-DATA.
- **Question à traiter :** Qualifier durée, file et héros requis.
- **Incertitudes liées :** `U06` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-003](09-ARM.md#us-arm-003).
- **Exigences :** `REQ-RECRUIT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-004-CA01 — Parcours nominal**

- **Étant donné** un stock de recrues existe ;
- **Quand** je réalise le parcours « Obtenir un devis de recrutement » ;
- **Alors** coût et quantité admissible calculés.

**US-ARM-004-CA02 — Refus ou exception**

- **Étant donné** quantité supérieure au stock ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** devis signalé invalide.

**US-ARM-004-CA03 — Cas frontière**

- **Étant donné** quantité nulle ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun ordre.

**US-ARM-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ARM-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier durée, file et héros requis. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : prévoir ressources et disponibilité. |
| E | Qualifier U06 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **coût et quantité admissible calculés**.
- [ ] Le cas frontière est vérifié : **quantité nulle → aucun ordre**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-005"></a>
## US-ARM-005 — Recruter des unités

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite convertir des recrues en troupes afin de agrandir mon armée.

### 2. Conversation — règles et décisions

- **Préconditions :** recrues, ressources et prérequis disponibles.
- **Règles / traces :** Recrues distinctes des unités possédées.
- **Question à traiter :** Qualifier disponibilité immédiate ou différée.
- **Incertitudes liées :** `U06` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-004](09-ARM.md#us-arm-004).
- **Exigences :** `REQ-RECRUIT-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-005-CA01 — Parcours nominal**

- **Étant donné** recrues, ressources et prérequis disponibles ;
- **Quand** je réalise le parcours « Recruter des unités » ;
- **Alors** débit et effectifs acquis cohérents.

**US-ARM-005-CA02 — Refus ou exception**

- **Étant donné** ressources insuffisantes ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune recrue perdue.

**US-ARM-005-CA03 — Cas frontière**

- **Étant donné** commandes concurrentes ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** stock non dépensé deux fois.

**US-ARM-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier disponibilité immédiate ou différée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : agrandir mon armée. |
| E | Qualifier U06 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **débit et effectifs acquis cohérents**.
- [ ] Le cas frontière est vérifié : **commandes concurrentes → stock non dépensé deux fois**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-006"></a>
## US-ARM-006 — Accéder au tier sept

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite recruter les unités supérieures autorisées afin de préparer les grands affrontements.

### 2. Conversation — règles et décisions

- **Préconditions :** demeure et capacité Meneur requises.
- **Règles / traces :** SS-020 et catalogue Meneur.
- **Question à traiter :** Qualifier conditions exactes par faction.
- **Incertitudes liées :** `U06`, `U25` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-005](09-ARM.md#us-arm-005), [US-HER-011](07-HER.md#us-her-011).
- **Exigences :** `REQ-RECRUIT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-006-CA01 — Parcours nominal**

- **Étant donné** demeure et capacité Meneur requises ;
- **Quand** je réalise le parcours « Accéder au tier sept » ;
- **Alors** T7 accessible avec toutes les conditions.

**US-ARM-006-CA02 — Refus ou exception**

- **Étant donné** talent absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** recrutement refusé si requis.

**US-ARM-006-CA03 — Cas frontière**

- **Étant donné** bonus quotidien ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** exception T7 respectée.

**US-ARM-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-005, US-HER-011. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier conditions exactes par faction. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer les grands affrontements. |
| E | Qualifier U06, U25 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **T7 accessible avec toutes les conditions**.
- [ ] Le cas frontière est vérifié : **bonus quotidien → exception T7 respectée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-007"></a>
## US-ARM-007 — Améliorer des troupes

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite convertir des unités vers leur variante afin de adapter la composition de mon armée.

### 2. Conversation — règles et décisions

- **Préconditions :** demeure améliorée et unités disponibles.
- **Règles / traces :** Pas de multiplicateur uniforme.
- **Question à traiter :** Qualifier durée, coût différentiel et localisation.
- **Incertitudes liées :** `U06` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-010](02-CIT.md#us-cit-010), [US-ARM-005](09-ARM.md#us-arm-005).
- **Exigences :** `REQ-UPGRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-007-CA01 — Parcours nominal**

- **Étant donné** demeure améliorée et unités disponibles ;
- **Quand** je réalise le parcours « Améliorer des troupes » ;
- **Alors** nombre conservé et type remplacé au coût prévu.

**US-ARM-007-CA02 — Refus ou exception**

- **Étant donné** unités déjà engagées ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** conversion refusée.

**US-ARM-007-CA03 — Cas frontière**

- **Étant donné** arme différente ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** nouvelle contre-arme appliquée.

**US-ARM-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-010, US-ARM-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier durée, coût différentiel et localisation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter la composition de mon armée. |
| E | Qualifier U06 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **nombre conservé et type remplacé au coût prévu**.
- [ ] Le cas frontière est vérifié : **arme différente → nouvelle contre-arme appliquée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-008"></a>
## US-ARM-008 — Affecter des troupes à un héros

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite transférer des unités depuis la garnison afin de préparer une expédition.

### 2. Conversation — règles et décisions

- **Préconditions :** héros et troupes réunis au lieu autorisé.
- **Règles / traces :** Manipulation d’armée attestée, contraintes à qualifier.
- **Question à traiter :** Définir proximité, disponibilité et capacité.
- **Incertitudes liées :** `U18` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-001](09-ARM.md#us-arm-001), [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-ARMY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-008-CA01 — Parcours nominal**

- **Étant donné** héros et troupes réunis au lieu autorisé ;
- **Quand** je réalise le parcours « Affecter des troupes à un héros » ;
- **Alors** effectifs déplacés sans duplication.

**US-ARM-008-CA02 — Refus ou exception**

- **Étant donné** héros distant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** transfert refusé si proximité requise.

**US-ARM-008-CA03 — Cas frontière**

- **Étant donné** deux transferts ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** quantité totale conservée.

**US-ARM-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-001, US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir proximité, disponibilité et capacité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer une expédition. |
| E | Qualifier U18 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **effectifs déplacés sans duplication**.
- [ ] Le cas frontière est vérifié : **deux transferts → quantité totale conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-009"></a>
## US-ARM-009 — Composer mes pelotons

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite former une armée ordonnée afin de préparer les rencontres successives.

### 2. Conversation — règles et décisions

- **Préconditions :** unités affectées au héros.
- **Règles / traces :** Sept emplacements CODE-01-COMBAT.
- **Question à traiter :** Qualifier types identiques répartis et restrictions.
- **Incertitudes liées :** `U18` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-008](09-ARM.md#us-arm-008).
- **Exigences :** `REQ-ARMY-01`, `REQ-UI-06`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-009-CA01 — Parcours nominal**

- **Étant donné** unités affectées au héros ;
- **Quand** je réalise le parcours « Composer mes pelotons » ;
- **Alors** chaque peloton contient un type et un entier positif.

**US-ARM-009-CA02 — Refus ou exception**

- **Étant donné** huitième position ordinaire ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-ARM-009-CA03 — Cas frontière**

- **Étant donné** invocation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** traitée hors sept positions ordinaires.

**US-ARM-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier types identiques répartis et restrictions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer les rencontres successives. |
| E | Qualifier U18 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **chaque peloton contient un type et un entier positif**.
- [ ] Le cas frontière est vérifié : **invocation → traitée hors sept positions ordinaires**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-010"></a>
## US-ARM-010 — Diviser un peloton

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite répartir ses unités sur plusieurs positions afin de ajuster mon ordre de bataille.

### 2. Conversation — règles et décisions

- **Préconditions :** un peloton divisible existe.
- **Règles / traces :** Préparation militaire.
- **Question à traiter :** Qualifier limites de positions identiques.
- **Incertitudes liées :** `U18` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-009](09-ARM.md#us-arm-009).
- **Exigences :** `REQ-ARMY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-010-CA01 — Parcours nominal**

- **Étant donné** un peloton divisible existe ;
- **Quand** je réalise le parcours « Diviser un peloton » ;
- **Alors** somme des effectifs conservée.

**US-ARM-010-CA02 — Refus ou exception**

- **Étant donné** division supérieure au stock ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-ARM-010-CA03 — Cas frontière**

- **Étant donné** une unité restante ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de quantité fractionnaire.

**US-ARM-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier limites de positions identiques. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : ajuster mon ordre de bataille. |
| E | Qualifier U18 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **somme des effectifs conservée**.
- [ ] Le cas frontière est vérifié : **une unité restante → pas de quantité fractionnaire**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-011"></a>
## US-ARM-011 — Fusionner des pelotons

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite regrouper des unités compatibles afin de libérer une position de combat.

### 2. Conversation — règles et décisions

- **Préconditions :** deux pelotons compatibles disponibles.
- **Règles / traces :** Préparation militaire.
- **Question à traiter :** Qualifier identité base/améliorée.
- **Incertitudes liées :** `U18` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-009](09-ARM.md#us-arm-009).
- **Exigences :** `REQ-ARMY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-011-CA01 — Parcours nominal**

- **Étant donné** deux pelotons compatibles disponibles ;
- **Quand** je réalise le parcours « Fusionner des pelotons » ;
- **Alors** effectifs réunis sans changer de type.

**US-ARM-011-CA02 — Refus ou exception**

- **Étant donné** types différents ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** fusion refusée.

**US-ARM-011-CA03 — Cas frontière**

- **Étant donné** dernière position vidée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun peloton fantôme.

**US-ARM-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier identité base/améliorée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : libérer une position de combat. |
| E | Qualifier U18 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **effectifs réunis sans changer de type**.
- [ ] Le cas frontière est vérifié : **dernière position vidée → aucun peloton fantôme**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-012"></a>
## US-ARM-012 — Réordonner mon armée

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite changer l’ordre des pelotons afin de exploiter les contre-armes.

### 2. Conversation — règles et décisions

- **Préconditions :** préparation non engagée.
- **Règles / traces :** Ordre déterminant CODE-01-COMBAT.
- **Question à traiter :** Qualifier verrouillage et ordre défensif.
- **Incertitudes liées :** `U18` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-009](09-ARM.md#us-arm-009).
- **Exigences :** `REQ-ARMY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-012-CA01 — Parcours nominal**

- **Étant donné** préparation non engagée ;
- **Quand** je réalise le parcours « Réordonner mon armée » ;
- **Alors** ordre sauvegardé et utilisé à la bataille.

**US-ARM-012-CA02 — Refus ou exception**

- **Étant donné** armée déjà partie ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** modification refusée selon profil.

**US-ARM-012-CA03 — Cas frontière**

- **Étant donné** permutation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** effectifs inchangés.

**US-ARM-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier verrouillage et ordre défensif. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : exploiter les contre-armes. |
| E | Qualifier U18 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **ordre sauvegardé et utilisé à la bataille**.
- [ ] Le cas frontière est vérifié : **permutation → effectifs inchangés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-013"></a>
## US-ARM-013 — Déposer des troupes en garnison

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retirer des unités d’un héros présent afin de renforcer la défense locale.

### 2. Conversation — règles et décisions

- **Préconditions :** héros et cité accessibles.
- **Règles / traces :** Garnison distincte du héros.
- **Question à traiter :** Qualifier restrictions sous siège.
- **Incertitudes liées :** `U18`, `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-008](09-ARM.md#us-arm-008).
- **Exigences :** `REQ-ARMY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-013-CA01 — Parcours nominal**

- **Étant donné** héros et cité accessibles ;
- **Quand** je réalise le parcours « Déposer des troupes en garnison » ;
- **Alors** unités rejoignent la garnison une fois.

**US-ARM-013-CA02 — Refus ou exception**

- **Étant donné** héros en transit ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun dépôt distant implicite.

**US-ARM-013-CA03 — Cas frontière**

- **Étant donné** armée vide ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** héros conservé sans troupe.

**US-ARM-013-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier restrictions sous siège. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : renforcer la défense locale. |
| E | Qualifier U18, U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **unités rejoignent la garnison une fois**.
- [ ] Le cas frontière est vérifié : **armée vide → héros conservé sans troupe**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-014"></a>
## US-ARM-014 — Évaluer la puissance brute

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir la force de base de mon armée afin de comparer les seuils militaires.

### 2. Conversation — règles et décisions

- **Préconditions :** pelotons définis.
- **Règles / traces :** CODE-01-COMBAT.
- **Question à traiter :** Choisir la présentation du brut et des bonus.
- **Incertitudes liées :** aucune incertitude locale déclarée ; profil et préconditions communs restent à qualifier.
- **Dépendances fonctionnelles :** [US-ARM-009](09-ARM.md#us-arm-009).
- **Exigences :** `REQ-ARMY-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-014-CA01 — Parcours nominal**

- **Étant donné** pelotons définis ;
- **Quand** je réalise le parcours « Évaluer la puissance brute » ;
- **Alors** somme effectif × puissance unitaire affichée.

**US-ARM-014-CA02 — Refus ou exception**

- **Étant donné** bonus héros ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** exclu de la puissance brute.

**US-ARM-014-CA03 — Cas frontière**

- **Étant donné** peloton vide ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** contribution nulle.

**US-ARM-014-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ARM-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Choisir la présentation du brut et des bonus. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comparer les seuils militaires. |
| E | L’équipe doit estimer cette fiche après revue des données et du parcours ; aucun chiffrage en points n’est inventé. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Exécution et résultats restent à produire. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **somme effectif × puissance unitaire affichée**.
- [ ] Le cas frontière est vérifié : **peloton vide → contribution nulle**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-015"></a>
## US-ARM-015 — Recruter un engin de siège

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite acquérir les engins autorisés afin de préparer un bombardement.

### 2. Conversation — règles et décisions

- **Préconditions :** bâtiment et prérequis d’engin satisfaits.
- **Règles / traces :** Catalogue des engins, G10.
- **Question à traiter :** Qualifier recrutement, transport et admission.
- **Incertitudes liées :** `U06`, `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-005](09-ARM.md#us-arm-005).
- **Exigences :** `REQ-RECRUIT-01`, `REQ-SIEGE-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-015-CA01 — Parcours nominal**

- **Étant donné** bâtiment et prérequis d’engin satisfaits ;
- **Quand** je réalise le parcours « Recruter un engin de siège » ;
- **Alors** engin acquis selon son coût et statut.

**US-ARM-015-CA02 — Refus ou exception**

- **Étant donné** unité de type E ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de contre-arme I/R/C inventée.

**US-ARM-015-CA03 — Cas frontière**

- **Étant donné** mouvement ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** vitesse de siège qualifiée.

**US-ARM-015-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-015-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier recrutement, transport et admission. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer un bombardement. |
| E | Qualifier U06, U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **engin acquis selon son coût et statut**.
- [ ] Le cas frontière est vérifié : **mouvement → vitesse de siège qualifiée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-arm-016"></a>
## US-ARM-016 — Recevoir les survivants

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver mes unités après la bataille afin de préparer la suite de la campagne.

### 2. Conversation — règles et décisions

- **Préconditions :** combat et retour résolus.
- **Règles / traces :** Dispersion distincte des morts définitifs.
- **Question à traiter :** Qualifier lieu de rassemblement et retour.
- **Incertitudes liées :** `U13`, `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-001](09-ARM.md#us-arm-001), [US-COM-014](11-COM.md#us-com-014).
- **Exigences :** `REQ-ARMY-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ARM-016-CA01 — Parcours nominal**

- **Étant donné** combat et retour résolus ;
- **Quand** je réalise le parcours « Recevoir les survivants » ;
- **Alors** survivants permanents affectés au lieu prévu.

**US-ARM-016-CA02 — Refus ou exception**

- **Étant donné** unités invoquées ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non ajoutées au stock durable.

**US-ARM-016-CA03 — Cas frontière**

- **Étant donné** rapport relu ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune nouvelle troupe.

**US-ARM-016-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ARM-016-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-001, US-COM-014. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier lieu de rassemblement et retour. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer la suite de la campagne. |
| E | Qualifier U13, U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **survivants permanents affectés au lieu prévu**.
- [ ] Le cas frontière est vérifié : **rapport relu → aucune nouvelle troupe**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

