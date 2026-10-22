# 11. Combat et résolution des batailles

18 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-COM-001 — Préparer une bataille](#us-com-001)
- [US-COM-002 — Engager un combat PvE](#us-com-002)
- [US-COM-003 — Engager un combat PvP](#us-com-003)
- [US-COM-004 — Appliquer les contre-armes](#us-com-004)
- [US-COM-005 — Appliquer les bonus du héros](#us-com-005)
- [US-COM-006 — Appliquer les fortifications](#us-com-006)
- [US-COM-007 — Résoudre les tirs préalables](#us-com-007)
- [US-COM-008 — Enchaîner les pelotons](#us-com-008)
- [US-COM-009 — Obtenir un écrasement](#us-com-009)
- [US-COM-010 — Départager un duel égal](#us-com-010)
- [US-COM-011 — Subir une fuite PvE](#us-com-011)
- [US-COM-012 — Subir l’admission PvP](#us-com-012)
- [US-COM-013 — Comprendre les dispersions](#us-com-013)
- [US-COM-014 — Calculer les morts définitives](#us-com-014)
- [US-COM-015 — Traiter les armées particulières](#us-com-015)
- [US-COM-016 — Recevoir l’expérience du combat](#us-com-016)
- [US-COM-017 — Lire les étapes d’une bataille](#us-com-017)
- [US-COM-018 — Simuler une composition autorisée](#us-com-018)

<a id="us-com-001"></a>
## US-COM-001 — Préparer une bataille

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite examiner forces, sorts et durée avant engagement afin de prendre une décision éclairée.

### 2. Conversation — règles et décisions

- **Préconditions :** cible et héros sélectionnés.
- **Règles / traces :** SS-016/018.
- **Question à traiter :** Qualifier les renseignements nécessaires à l’estimation.
- **Incertitudes liées :** `U18`, `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ARM-009](09-ARM.md#us-arm-009).
- **Exigences :** `REQ-COMBAT-01`, `REQ-UI-06`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-001-CA01 — Parcours nominal**

- **Étant donné** cible et héros sélectionnés ;
- **Quand** je réalise le parcours « Préparer une bataille » ;
- **Alors** sept positions, bonus, tours et haltes présentés.

**US-COM-001-CA02 — Refus ou exception**

- **Étant donné** données ennemies inconnues ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune estimation présentée comme certitude.

**US-COM-001-CA03 — Cas frontière**

- **Étant donné** préparation annulée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune mission créée.

**US-COM-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-COM-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ARM-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier les renseignements nécessaires à l’estimation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : prendre une décision éclairée. |
| E | Qualifier U18, U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **sept positions, bonus, tours et haltes présentés**.
- [ ] Le cas frontière est vérifié : **préparation annulée → aucune mission créée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-002"></a>
## US-COM-002 — Engager un combat PvE

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite confirmer l’attaque d’une rencontre admissible afin de libérer une région ou progresser.

### 2. Conversation — règles et décisions

- **Préconditions :** préparation valide contre PNJ actif.
- **Règles / traces :** PvE régional, résolution automatique.
- **Question à traiter :** Qualifier départ, arrivée et retour local.
- **Incertitudes liées :** `U09`, `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-001](11-COM.md#us-com-001).
- **Exigences :** `REQ-COMBAT-01`, `REQ-PVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-002-CA01 — Parcours nominal**

- **Étant donné** préparation valide contre PNJ actif ;
- **Quand** je réalise le parcours « Engager un combat PvE » ;
- **Alors** forces réservées et bataille planifiée.

**US-COM-002-CA02 — Refus ou exception**

- **Étant donné** rencontre déjà résolue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** engagement refusé.

**US-COM-002-CA03 — Cas frontière**

- **Étant donné** double confirmation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une mission.

**US-COM-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier départ, arrivée et retour local. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : libérer une région ou progresser. |
| E | Qualifier U09, U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **forces réservées et bataille planifiée**.
- [ ] Le cas frontière est vérifié : **double confirmation → une mission**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-003"></a>
## US-COM-003 — Engager un combat PvP

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite confirmer un affrontement autorisé afin de contester une position ennemie.

### 2. Conversation — règles et décisions

- **Préconditions :** cible hostile et forces disponibles.
- **Règles / traces :** G05/G10 ; pas de bataille tactique en direct.
- **Question à traiter :** Qualifier restrictions de cible et arrivée.
- **Incertitudes liées :** `U20`, `U32` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-001](11-COM.md#us-com-001).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-003-CA01 — Parcours nominal**

- **Étant donné** cible hostile et forces disponibles ;
- **Quand** je réalise le parcours « Engager un combat PvP » ;
- **Alors** ordres admis selon diplomatie et protections.

**US-COM-003-CA02 — Refus ou exception**

- **Étant donné** cible protégée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus sans débit indu.

**US-COM-003-CA03 — Cas frontière**

- **Étant donné** relation changée avant validation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** droits réévalués.

**US-COM-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier restrictions de cible et arrivée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : contester une position ennemie. |
| E | Qualifier U20, U32 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **ordres admis selon diplomatie et protections**.
- [ ] Le cas frontière est vérifié : **relation changée avant validation → droits réévalués**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-004"></a>
## US-COM-004 — Appliquer les contre-armes

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite bénéficier de l’avantage de mon type d’unité afin de construire une composition efficace.

### 2. Conversation — règles et décisions

- **Préconditions :** deux pelotons s’affrontent.
- **Règles / traces :** CODE-01-COMBAT, bonus de 50 %.
- **Question à traiter :** Qualifier compatibilité saisonnière et talents spécialisés.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-001](11-COM.md#us-com-001).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-004-CA01 — Parcours nominal**

- **Étant donné** deux pelotons s’affrontent ;
- **Quand** je réalise le parcours « Appliquer les contre-armes » ;
- **Alors** I bat C, R bat I, C bat R avec bonus de référence.

**US-COM-004-CA02 — Refus ou exception**

- **Étant donné** type E ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune relation I/R/C inventée.

**US-COM-004-CA03 — Cas frontière**

- **Étant donné** 100 unités fictives p100 I contre C ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** 15000 contre 10000.

**US-COM-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier compatibilité saisonnière et talents spécialisés. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : construire une composition efficace. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **I bat C, R bat I, C bat R avec bonus de référence**.
- [ ] Le cas frontière est vérifié : **100 unités fictives p100 I contre C → 15000 contre 10000**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-005"></a>
## US-COM-005 — Appliquer les bonus du héros

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir attaque ou défense influencer le duel afin de valoriser ma spécialisation.

### 2. Conversation — règles et décisions

- **Préconditions :** bataille avec héros et bonus connus.
- **Règles / traces :** CODE-01-COMBAT, 0,5 % par point.
- **Question à traiter :** Qualifier ordre et arrondis des cumuls.
- **Incertitudes liées :** `U02`, `U42` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-004](11-COM.md#us-com-004).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-005-CA01 — Parcours nominal**

- **Étant donné** bataille avec héros et bonus connus ;
- **Quand** je réalise le parcours « Appliquer les bonus du héros » ;
- **Alors** caractéristique du rôle et talents applicables utilisés.

**US-COM-005-CA02 — Refus ou exception**

- **Étant donné** talent conditionnel inactif ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun bonus.

**US-COM-005-CA03 — Cas frontière**

- **Étant donné** bonus fixe par unité ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** distinct du pourcentage.

**US-COM-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier ordre et arrondis des cumuls. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : valoriser ma spécialisation. |
| E | Qualifier U02, U42 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **caractéristique du rôle et talents applicables utilisés**.
- [ ] Le cas frontière est vérifié : **bonus fixe par unité → distinct du pourcentage**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-006"></a>
## US-COM-006 — Appliquer les fortifications

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite bénéficier de la défense du lieu afin de rendre mes cités résistantes.

### 2. Conversation — règles et décisions

- **Préconditions :** combat dans un lieu fortifié.
- **Règles / traces :** CODE-01-COMBAT.
- **Question à traiter :** Qualifier lieux, sapeurs et effets de Larmes.
- **Incertitudes liées :** `U18`, `U42` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-004](11-COM.md#us-com-004), [US-CIT-011](02-CIT.md#us-cit-011).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-006-CA01 — Parcours nominal**

- **Étant donné** combat dans un lieu fortifié ;
- **Quand** je réalise le parcours « Appliquer les fortifications » ;
- **Alors** bonus défense et réductions expliqués.

**US-COM-006-CA02 — Refus ou exception**

- **Étant donné** combat hors lieu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun bonus urbain global.

**US-COM-006-CA03 — Cas frontière**

- **Étant donné** réduction supérieure ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** fortification bornée à zéro.

**US-COM-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-004, US-CIT-011. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier lieux, sapeurs et effets de Larmes. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : rendre mes cités résistantes. |
| E | Qualifier U18, U42 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **bonus défense et réductions expliqués**.
- [ ] Le cas frontière est vérifié : **réduction supérieure → fortification bornée à zéro**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-007"></a>
## US-COM-007 — Résoudre les tirs préalables

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les effets d’avant-combat afin de comprendre les pertes avant les duels.

### 2. Conversation — règles et décisions

- **Préconditions :** capacités préalables autorisées.
- **Règles / traces :** Barrage, balistes et branches CODE-01-COMBAT.
- **Question à traiter :** Qualifier disponibilité et simultanéité des capacités.
- **Incertitudes liées :** `U13`, `U42` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-001](11-COM.md#us-com-001).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-007-CA01 — Parcours nominal**

- **Étant donné** capacités préalables autorisées ;
- **Quand** je réalise le parcours « Résoudre les tirs préalables » ;
- **Alors** pertes préalables calculées puis appliquées dans l’ordre prévu.

**US-COM-007-CA02 — Refus ou exception**

- **Étant donné** capacité absente du profil ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun tir automatique.

**US-COM-007-CA03 — Cas frontière**

- **Étant donné** tirs des deux camps ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de priorité dépendant du réseau.

**US-COM-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier disponibilité et simultanéité des capacités. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre les pertes avant les duels. |
| E | Qualifier U13, U42 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **pertes préalables calculées puis appliquées dans l’ordre prévu**.
- [ ] Le cas frontière est vérifié : **tirs des deux camps → pas de priorité dépendant du réseau**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-008"></a>
## US-COM-008 — Enchaîner les pelotons

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir mon survivant affronter la ligne suivante afin de comprendre l’ordre de bataille.

### 2. Conversation — règles et décisions

- **Préconditions :** premiers pelotons actifs sélectionnés.
- **Règles / traces :** Séquence du calculateur.
- **Question à traiter :** Qualifier tous les effets entre tours.
- **Incertitudes liées :** `U13` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-004](11-COM.md#us-com-004).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-008-CA01 — Parcours nominal**

- **Étant donné** premiers pelotons actifs sélectionnés ;
- **Quand** je réalise le parcours « Enchaîner les pelotons » ;
- **Alors** survivant poursuit avec son effectif restant.

**US-COM-008-CA02 — Refus ou exception**

- **Étant donné** peloton dispersé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ne rejoue pas comme intact.

**US-COM-008-CA03 — Cas frontière**

- **Étant donné** plusieurs victoires ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune fatigue inventée.

**US-COM-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier tous les effets entre tours. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre l’ordre de bataille. |
| E | Qualifier U13 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **survivant poursuit avec son effectif restant**.
- [ ] Le cas frontière est vérifié : **plusieurs victoires → aucune fatigue inventée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-009"></a>
## US-COM-009 — Obtenir un écrasement

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir reconnaître une victoire sans dispersion afin de évaluer l’avantage de puissance.

### 2. Conversation — règles et décisions

- **Préconditions :** totaux strictement différents.
- **Règles / traces :** CODE-01-COMBAT, floor et comparaison stricte.
- **Question à traiter :** Qualifier affichage et seuil des quêtes associées.
- **Incertitudes liées :** `U11`, `U38` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-008](11-COM.md#us-com-008).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-009-CA01 — Parcours nominal**

- **Étant donné** totaux strictement différents ;
- **Quand** je réalise le parcours « Obtenir un écrasement » ;
- **Alors** condition stricte d’écrasement appliquée.

**US-COM-009-CA02 — Refus ou exception**

- **Étant donné** delta égal à la base ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** branche stricte respectée.

**US-COM-009-CA03 — Cas frontière**

- **Étant donné** marqueur interne −1 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas d’unité ajoutée au stock.

**US-COM-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier affichage et seuil des quêtes associées. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : évaluer l’avantage de puissance. |
| E | Qualifier U11, U38 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **condition stricte d’écrasement appliquée**.
- [ ] Le cas frontière est vérifié : **marqueur interne −1 → pas d’unité ajoutée au stock**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-010"></a>
## US-COM-010 — Départager un duel égal

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir un résultat explicable à puissance égale afin de éviter une issue arbitraire.

### 2. Conversation — règles et décisions

- **Préconditions :** totaux égaux ou arrondis voisins.
- **Règles / traces :** Faux nuls et égalités Jactari.
- **Question à traiter :** Retrouver les rapports permettant de qualifier cette branche.
- **Incertitudes liées :** `U11` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-008](11-COM.md#us-com-008).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-010-CA01 — Parcours nominal**

- **Étant donné** totaux égaux ou arrondis voisins ;
- **Quand** je réalise le parcours « Départager un duel égal » ;
- **Alors** branche d’égalité du profil produit un résultat stable.

**US-COM-010-CA02 — Refus ou exception**

- **Étant donné** règle non qualifiée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de vainqueur aléatoire improvisé.

**US-COM-010-CA03 — Cas frontière**

- **Étant donné** écart d’une unité ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** frontière contrôlée.

**US-COM-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver les rapports permettant de qualifier cette branche. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter une issue arbitraire. |
| E | Qualifier U11 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **branche d’égalité du profil produit un résultat stable**.
- [ ] Le cas frontière est vérifié : **écart d’une unité → frontière contrôlée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-011"></a>
## US-COM-011 — Subir une fuite PvE

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître l’issue d’une attaque trop faible afin de comprendre un combat non engagé.

### 2. Conversation — règles et décisions

- **Préconditions :** rapport de puissance sous le seuil PvE.
- **Règles / traces :** CODE-01-COMBAT.
- **Question à traiter :** Qualifier conséquences et défense nulle.
- **Incertitudes liées :** `U11`, `U13` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-002](11-COM.md#us-com-002).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-011-CA01 — Parcours nominal**

- **Étant donné** rapport de puissance sous le seuil PvE ;
- **Quand** je réalise le parcours « Subir une fuite PvE » ;
- **Alors** fuite et conséquences du profil rapportées.

**US-COM-011-CA02 — Refus ou exception**

- **Étant donné** bonus de héros ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non ajouté au ratio brut d’admission.

**US-COM-011-CA03 — Cas frontière**

- **Étant donné** ratio exactement 1/7 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** branche de fuite outil.

**US-COM-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier conséquences et défense nulle. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre un combat non engagé. |
| E | Qualifier U11, U13 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **fuite et conséquences du profil rapportées**.
- [ ] Le cas frontière est vérifié : **ratio exactement 1/7 → branche de fuite outil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-012"></a>
## US-COM-012 — Subir l’admission PvP

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître fuite, blessure ou capture avant bataille afin de mesurer le risque d’une attaque faible.

### 2. Conversation — règles et décisions

- **Préconditions :** ratio brut calculé à l’arrivée.
- **Règles / traces :** CODE-01-COMBAT, blessures 6/12/18/24 h.
- **Question à traiter :** Qualifier avec rapports du serveur cible.
- **Incertitudes liées :** `U12` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-003](11-COM.md#us-com-003).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-012-CA01 — Parcours nominal**

- **Étant donné** ratio brut calculé à l’arrivée ;
- **Quand** je réalise le parcours « Subir l’admission PvP » ;
- **Alors** floor(30r) sélectionne la branche du profil.

**US-COM-012-CA02 — Refus ou exception**

- **Étant donné** constante 0,23 ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non substituée à la branche active.

**US-COM-012-CA03 — Cas frontière**

- **Étant donné** q7 puis q8 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** fuite puis combat dans l’oracle.

**US-COM-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier avec rapports du serveur cible. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : mesurer le risque d’une attaque faible. |
| E | Qualifier U12 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **floor(30r) sélectionne la branche du profil**.
- [ ] Le cas frontière est vérifié : **q7 puis q8 → fuite puis combat dans l’oracle**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-013"></a>
## US-COM-013 — Comprendre les dispersions

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir combien d’unités cessent de combattre afin de lire correctement les échanges.

### 2. Conversation — règles et décisions

- **Préconditions :** un duel est résolu.
- **Règles / traces :** Exemple synthétique documenté, pas rapport historique.
- **Question à traiter :** Qualifier magie et exceptions de dispersion.
- **Incertitudes liées :** `U13` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-008](11-COM.md#us-com-008).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-013-CA01 — Parcours nominal**

- **Étant donné** un duel est résolu ;
- **Quand** je réalise le parcours « Comprendre les dispersions » ;
- **Alors** dispersion distinguée des morts permanentes.

**US-COM-013-CA02 — Refus ou exception**

- **Étant donné** dispersion totale ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de destruction permanente automatique.

**US-COM-013-CA03 — Cas frontière**

- **Étant donné** duel fictif I/C 100 contre100 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** 50 I et100 C dispersés.

**US-COM-013-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-COM-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier magie et exceptions de dispersion. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : lire correctement les échanges. |
| E | Qualifier U13 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **dispersion distinguée des morts permanentes**.
- [ ] Le cas frontière est vérifié : **duel fictif I/C 100 contre100 → 50 I et100 C dispersés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-014"></a>
## US-COM-014 — Calculer les morts définitives

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver mes pertes durables afin de préparer le recrutement suivant.

### 2. Conversation — règles et décisions

- **Préconditions :** bataille ordinaire avec héros terminée.
- **Règles / traces :** CODE-01-COMBAT, facteur de base 0,30.
- **Question à traiter :** Qualifier exceptions et planchers.
- **Incertitudes liées :** `U13` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-013](11-COM.md#us-com-013).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-014-CA01 — Parcours nominal**

- **Étant donné** bataille ordinaire avec héros terminée ;
- **Quand** je réalise le parcours « Calculer les morts définitives » ;
- **Alors** coefficient et modificateurs convertissent les dispersions.

**US-COM-014-CA02 — Refus ou exception**

- **Étant donné** 0 dispersé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de mort minimale artificielle.

**US-COM-014-CA03 — Cas frontière**

- **Étant donné** exemple fictif 50/100 dispersés ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** 15/30 morts sans bonus.

**US-COM-014-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-013. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier exceptions et planchers. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer le recrutement suivant. |
| E | Qualifier U13 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **coefficient et modificateurs convertissent les dispersions**.
- [ ] Le cas frontière est vérifié : **exemple fictif 50/100 dispersés → 15/30 morts sans bonus**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-015"></a>
## US-COM-015 — Traiter les armées particulières

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir les pertes adaptées aux PNJ et sans héros afin de comprendre leurs résultats spécifiques.

### 2. Conversation — règles et décisions

- **Préconditions :** statut des participants connu.
- **Règles / traces :** Branches distinctes CODE-01-COMBAT.
- **Question à traiter :** Qualifier toutes les exceptions et anomalies connues.
- **Incertitudes liées :** `U13`, `U42` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-014](11-COM.md#us-com-014).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-015-CA01 — Parcours nominal**

- **Étant donné** statut des participants connu ;
- **Quand** je réalise le parcours « Traiter les armées particulières » ;
- **Alors** branche appropriée appliquée à chaque camp.

**US-COM-015-CA02 — Refus ou exception**

- **Étant donné** PNJ ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de conservation automatique de 70 %.

**US-COM-015-CA03 — Cas frontière**

- **Étant donné** invocations ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun stock permanent restant.

**US-COM-015-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-015-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-014. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier toutes les exceptions et anomalies connues. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre leurs résultats spécifiques. |
| E | Qualifier U13, U42 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **branche appropriée appliquée à chaque camp**.
- [ ] Le cas frontière est vérifié : **invocations → aucun stock permanent restant**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-016"></a>
## US-COM-016 — Recevoir l’expérience du combat

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite gagner l’XP correspondant à l’adversité afin de faire progresser mon héros et mon Honneur.

### 2. Conversation — règles et décisions

- **Préconditions :** combat achevé avec entrées connues.
- **Règles / traces :** CODE-01-COMBAT, modificateur borné −1 à +4.
- **Question à traiter :** Qualifier invocations, magie et contribution à Honneur.
- **Incertitudes liées :** `U13` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-014](11-COM.md#us-com-014).
- **Exigences :** `REQ-COMBAT-01`, `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-016-CA01 — Parcours nominal**

- **Étant donné** combat achevé avec entrées connues ;
- **Quand** je réalise le parcours « Recevoir l’expérience du combat » ;
- **Alors** base dispersée admissible, ratios et bonus détaillés.

**US-COM-016-CA02 — Refus ou exception**

- **Étant donné** morts seuls ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ne remplacent pas l’assiette d’XP.

**US-COM-016-CA03 — Cas frontière**

- **Étant donné** défaite ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** modificateur nul ne signifie pas XP forcément nulle.

**US-COM-016-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-COM-016-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-014. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier invocations, magie et contribution à Honneur. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : faire progresser mon héros et mon Honneur. |
| E | Qualifier U13 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **base dispersée admissible, ratios et bonus détaillés**.
- [ ] Le cas frontière est vérifié : **défaite → modificateur nul ne signifie pas XP forcément nulle**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-017"></a>
## US-COM-017 — Lire les étapes d’une bataille

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter sorts, duels et pertes par tour afin de comprendre mon résultat.

### 2. Conversation — règles et décisions

- **Préconditions :** rapport militaire disponible.
- **Règles / traces :** SS-017 et CODE-01-COMBAT.
- **Question à traiter :** Qualifier visibilité selon participant et officier.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-001](11-COM.md#us-com-001).
- **Exigences :** `REQ-REPORT-01`, `REQ-UI-07`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-COM-017-CA01 — Parcours nominal**

- **Étant donné** rapport militaire disponible ;
- **Quand** je réalise le parcours « Lire les étapes d’une bataille » ;
- **Alors** séquence explique le bilan final.

**US-COM-017-CA02 — Refus ou exception**

- **Étant donné** données privées non acquises ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** masquées.

**US-COM-017-CA03 — Cas frontière**

- **Étant donné** catalogue mis à jour ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ancien rapport non recalculé.

**US-COM-017-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-COM-017-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier visibilité selon participant et officier. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre mon résultat. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **séquence explique le bilan final**.
- [ ] Le cas frontière est vérifié : **catalogue mis à jour → ancien rapport non recalculé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-com-018"></a>
## US-COM-018 — Simuler une composition autorisée

**Priorité proposée :** P2 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite comparer des configurations avant engagement afin de apprendre les conséquences de mes choix.

### 2. Conversation — règles et décisions

- **Préconditions :** simulation permise par le profil de test ou de jeu.
- **Règles / traces :** Outil Jactari ; intégration au client à décider.
- **Question à traiter :** Décider disponibilité de l’aide, sans abonnement implicite.
- **Incertitudes liées :** `U40` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-001](11-COM.md#us-com-001).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/04-COMBAT.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-COM-018-CA01 — Parcours nominal**

- **Étant donné** simulation permise par le profil de test ou de jeu ;
- **Quand** je réalise le parcours « Simuler une composition autorisée » ;
- **Alors** résultat séparé de toute mission réelle.

**US-COM-018-CA02 — Refus ou exception**

- **Étant donné** troupes ennemies inconnues ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune donnée cachée injectée.

**US-COM-018-CA03 — Cas frontière**

- **Étant donné** simulation répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun gain ni dépense.

**US-COM-018-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-COM-018-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Décider disponibilité de l’aide, sans abonnement implicite. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : apprendre les conséquences de mes choix. |
| E | Qualifier U40 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **résultat séparé de toute mission réelle**.
- [ ] Le cas frontière est vérifié : **simulation répétée → aucun gain ni dépense**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

