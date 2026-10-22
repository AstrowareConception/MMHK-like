# 5. Actions sur la carte région

12 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-REG-001 — Inspecter une région](#us-reg-001)
- [US-REG-002 — Examiner une rencontre](#us-reg-002)
- [US-REG-003 — Libérer une case](#us-reg-003)
- [US-REG-004 — Exploiter une mine libérée](#us-reg-004)
- [US-REG-005 — Améliorer une mine](#us-reg-005)
- [US-REG-006 — Étendre une mine](#us-reg-006)
- [US-REG-007 — Choisir le rythme des travaux miniers](#us-reg-007)
- [US-REG-008 — Construire un aménagement](#us-reg-008)
- [US-REG-009 — Développer un atelier de ressource](#us-reg-009)
- [US-REG-010 — Bénéficier de la contiguïté](#us-reg-010)
- [US-REG-011 — Construire un entrepôt régional](#us-reg-011)
- [US-REG-012 — Aménager des champs](#us-reg-012)

<a id="us-reg-001"></a>
## US-REG-001 — Inspecter une région

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir ses cases et occupations afin de planifier mon développement local.

### 2. Conversation — règles et décisions

- **Préconditions :** une région est accessible.
- **Règles / traces :** SS-045/047.
- **Question à traiter :** Qualifier les zones interactives.
- **Incertitudes liées :** `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-UI-03`, `REQ-REGION-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-001-CA01 — Parcours nominal**

- **Étant donné** une région est accessible ;
- **Quand** je réalise le parcours « Inspecter une région » ;
- **Alors** 25 cases et ville centrale distinguées du décor.

**US-REG-001-CA02 — Refus ou exception**

- **Étant donné** clic hors grille ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune case créée.

**US-REG-001-CA03 — Cas frontière**

- **Étant donné** objet haut ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** bonne case sélectionnée.

**US-REG-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-REG-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier les zones interactives. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier mon développement local. |
| E | Qualifier U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **25 cases et ville centrale distinguées du décor**.
- [ ] Le cas frontière est vérifié : **objet haut → bonne case sélectionnée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-002"></a>
## US-REG-002 — Examiner une rencontre

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter un groupe de PNJ régional afin de évaluer un combat de libération.

### 2. Conversation — règles et décisions

- **Préconditions :** une case est occupée.
- **Règles / traces :** CODE-01-DATA et corpus régional.
- **Question à traiter :** Qualifier compositions et visibilité du butin.
- **Incertitudes liées :** `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-001](05-REG.md#us-reg-001).
- **Exigences :** `REQ-PVE-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-002-CA01 — Parcours nominal**

- **Étant donné** une case est occupée ;
- **Quand** je réalise le parcours « Examiner une rencontre » ;
- **Alors** troupes connues et récompense visible présentées.

**US-REG-002-CA02 — Refus ou exception**

- **Étant donné** information cachée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** inconnu maintenu.

**US-REG-002-CA03 — Cas frontière**

- **Étant donné** case déjà libérée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de nouveau PNJ.

**US-REG-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-REG-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier compositions et visibilité du butin. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : évaluer un combat de libération. |
| E | Qualifier U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **troupes connues et récompense visible présentées**.
- [ ] Le cas frontière est vérifié : **case déjà libérée → pas de nouveau PNJ**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-003"></a>
## US-REG-003 — Libérer une case

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite engager un combat contre ses occupants afin de accéder à son exploitation.

### 2. Conversation — règles et décisions

- **Préconditions :** héros et armée admissibles.
- **Règles / traces :** Boucle PvE régionale.
- **Question à traiter :** Qualifier état des PNJ après défaite.
- **Incertitudes liées :** `U17`, `U13` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-002](05-REG.md#us-reg-002), [US-COM-001](11-COM.md#us-com-001).
- **Exigences :** `REQ-PVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-003-CA01 — Parcours nominal**

- **Étant donné** héros et armée admissibles ;
- **Quand** je réalise le parcours « Libérer une case » ;
- **Alors** combat crée un résultat et libère si victoire requise.

**US-REG-003-CA02 — Refus ou exception**

- **Étant donné** défaite ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de libération automatique.

**US-REG-003-CA03 — Cas frontière**

- **Étant donné** attaque répétée d’un rapport ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun second butin.

**US-REG-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-002, US-COM-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier état des PNJ après défaite. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : accéder à son exploitation. |
| E | Qualifier U17, U13 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **combat crée un résultat et libère si victoire requise**.
- [ ] Le cas frontière est vérifié : **attaque répétée d’un rapport → aucun second butin**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-004"></a>
## US-REG-004 — Exploiter une mine libérée

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite activer la production d’une mine accessible afin de augmenter mes revenus.

### 2. Conversation — règles et décisions

- **Préconditions :** site minier libéré.
- **Règles / traces :** G11 et captures.
- **Question à traiter :** Qualifier activation et dotation initiale.
- **Incertitudes liées :** `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-003](05-REG.md#us-reg-003).
- **Exigences :** `REQ-MINE-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-004-CA01 — Parcours nominal**

- **Étant donné** site minier libéré ;
- **Quand** je réalise le parcours « Exploiter une mine libérée » ;
- **Alors** ressource et production de la mine sont identifiées.

**US-REG-004-CA02 — Refus ou exception**

- **Étant donné** site occupé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** production non accordée.

**US-REG-004-CA03 — Cas frontière**

- **Étant donné** quatre mines initiales ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** distribution du profil conservée.

**US-REG-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier activation et dotation initiale. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : augmenter mes revenus. |
| E | Qualifier U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **ressource et production de la mine sont identifiées**.
- [ ] Le cas frontière est vérifié : **quatre mines initiales → distribution du profil conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-005"></a>
## US-REG-005 — Améliorer une mine

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite augmenter son niveau afin de accroître son rendement.

### 2. Conversation — règles et décisions

- **Préconditions :** mine accessible et héros admissible.
- **Règles / traces :** G11, niveaux et extensions distincts.
- **Question à traiter :** Qualifier tables et niveau du héros.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-004](05-REG.md#us-reg-004).
- **Exigences :** `REQ-MINE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-005-CA01 — Parcours nominal**

- **Étant donné** mine accessible et héros admissible ;
- **Quand** je réalise le parcours « Améliorer une mine » ;
- **Alors** niveau suivant planifié avec coût et durée.

**US-REG-005-CA02 — Refus ou exception**

- **Étant donné** niveau ou héros insuffisant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-REG-005-CA03 — Cas frontière**

- **Étant donné** travaux de niveau ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** production conservée si G11 retenu.

**US-REG-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier tables et niveau du héros. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : accroître son rendement. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **niveau suivant planifié avec coût et durée**.
- [ ] Le cas frontière est vérifié : **travaux de niveau → production conservée si G11 retenu**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-006"></a>
## US-REG-006 — Étendre une mine

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite construire une extension afin de améliorer sa production.

### 2. Conversation — règles et décisions

- **Préconditions :** extension admissible.
- **Règles / traces :** G11, bonus nominal 5 %.
- **Question à traiter :** Qualifier cumul, nombre et espace utilisé.
- **Incertitudes liées :** `U04`, `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-004](05-REG.md#us-reg-004).
- **Exigences :** `REQ-MINE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-006-CA01 — Parcours nominal**

- **Étant donné** extension admissible ;
- **Quand** je réalise le parcours « Étendre une mine » ;
- **Alors** bonus d’extension appliqué après travaux.

**US-REG-006-CA02 — Refus ou exception**

- **Étant donné** occupation incompatible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** extension refusée.

**US-REG-006-CA03 — Cas frontière**

- **Étant donné** extension en cours ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** production suspendue selon G11.

**US-REG-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier cumul, nombre et espace utilisé. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : améliorer sa production. |
| E | Qualifier U04, U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **bonus d’extension appliqué après travaux**.
- [ ] Le cas frontière est vérifié : **extension en cours → production suspendue selon G11**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-007"></a>
## US-REG-007 — Choisir le rythme des travaux miniers

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite sélectionner l’option normale, rapide ou économique afin de arbitrer temps et ressources.

### 2. Conversation — règles et décisions

- **Préconditions :** profil offrant ces options.
- **Règles / traces :** G11, +40 % coût/−20 % durée et −20 %/+60 %.
- **Question à traiter :** Qualifier les arrondis et disponibilité saisonnière.
- **Incertitudes liées :** `U02`, `U04` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-005](05-REG.md#us-reg-005).
- **Exigences :** `REQ-MINE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-007-CA01 — Parcours nominal**

- **Étant donné** profil offrant ces options ;
- **Quand** je réalise le parcours « Choisir le rythme des travaux miniers » ;
- **Alors** devis compare les coûts et durées.

**US-REG-007-CA02 — Refus ou exception**

- **Étant donné** option absente ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun accélérateur inventé.

**US-REG-007-CA03 — Cas frontière**

- **Étant donné** changement avant validation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un seul devis engagé.

**US-REG-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier les arrondis et disponibilité saisonnière. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : arbitrer temps et ressources. |
| E | Qualifier U02, U04 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **devis compare les coûts et durées**.
- [ ] Le cas frontière est vérifié : **changement avant validation → un seul devis engagé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-008"></a>
## US-REG-008 — Construire un aménagement

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite occuper une case libre avec un bâtiment régional afin de spécialiser ma région.

### 2. Conversation — règles et décisions

- **Préconditions :** case et héros admissibles.
- **Règles / traces :** G12, catalogue régional partiel.
- **Question à traiter :** Qualifier coûts et unicité par type.
- **Incertitudes liées :** `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-003](05-REG.md#us-reg-003).
- **Exigences :** `REQ-REGION-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-008-CA01 — Parcours nominal**

- **Étant donné** case et héros admissibles ;
- **Quand** je réalise le parcours « Construire un aménagement » ;
- **Alors** construction réserve la case et active son effet à terme.

**US-REG-008-CA02 — Refus ou exception**

- **Étant donné** case occupée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** construction refusée.

**US-REG-008-CA03 — Cas frontière**

- **Étant donné** type unique déjà présent ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** doublon interdit si prévu.

**US-REG-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier coûts et unicité par type. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : spécialiser ma région. |
| E | Qualifier U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **construction réserve la case et active son effet à terme**.
- [ ] Le cas frontière est vérifié : **type unique déjà présent → doublon interdit si prévu**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-009"></a>
## US-REG-009 — Développer un atelier de ressource

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite améliorer la recherche de production afin de augmenter le rendement ciblé.

### 2. Conversation — règles et décisions

- **Préconditions :** atelier et mine associés disponibles.
- **Règles / traces :** G12, cinq niveaux et 4 % par niveau.
- **Question à traiter :** Qualifier table complète de chaque ressource.
- **Incertitudes liées :** `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-008](05-REG.md#us-reg-008).
- **Exigences :** `REQ-REGION-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-009-CA01 — Parcours nominal**

- **Étant donné** atelier et mine associés disponibles ;
- **Quand** je réalise le parcours « Développer un atelier de ressource » ;
- **Alors** bonus limité par niveau et prérequis.

**US-REG-009-CA02 — Refus ou exception**

- **Étant donné** atelier d’or non prévu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** construction absente.

**US-REG-009-CA03 — Cas frontière**

- **Étant donné** mine moins développée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** atelier borné.

**US-REG-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier table complète de chaque ressource. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : augmenter le rendement ciblé. |
| E | Qualifier U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **bonus limité par niveau et prérequis**.
- [ ] Le cas frontière est vérifié : **mine moins développée → atelier borné**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-010"></a>
## US-REG-010 — Bénéficier de la contiguïté

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir le bonus lié à la position d’un atelier afin de choisir son emplacement.

### 2. Conversation — règles et décisions

- **Préconditions :** atelier et mine placés dans la région.
- **Règles / traces :** G12, amplification de 20 %.
- **Question à traiter :** Qualifier cumul avec autres bonus.
- **Incertitudes liées :** `U04` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-009](05-REG.md#us-reg-009).
- **Exigences :** `REQ-REGION-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-010-CA01 — Parcours nominal**

- **Étant donné** atelier et mine placés dans la région ;
- **Quand** je réalise le parcours « Bénéficier de la contiguïté » ;
- **Alors** contiguïté orthogonale évaluée sur cases logiques.

**US-REG-010-CA02 — Refus ou exception**

- **Étant donné** diagonale seule ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de bonus orthogonal.

**US-REG-010-CA03 — Cas frontière**

- **Étant donné** caméra déplacée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** résultat inchangé.

**US-REG-010-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-REG-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier cumul avec autres bonus. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir son emplacement. |
| E | Qualifier U04 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **contiguïté orthogonale évaluée sur cases logiques**.
- [ ] Le cas frontière est vérifié : **caméra déplacée → résultat inchangé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-011"></a>
## US-REG-011 — Construire un entrepôt régional

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite accroître la capacité de stockage afin de préparer mes opérations coûteuses.

### 2. Conversation — règles et décisions

- **Préconditions :** case et prérequis disponibles.
- **Règles / traces :** G16 et SS-042.
- **Question à traiter :** Qualifier arrondis, spécialisation et or.
- **Incertitudes liées :** `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-008](05-REG.md#us-reg-008).
- **Exigences :** `REQ-REGION-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-011-CA01 — Parcours nominal**

- **Étant donné** case et prérequis disponibles ;
- **Quand** je réalise le parcours « Construire un entrepôt régional » ;
- **Alors** capacité accrue selon entrepôts actifs.

**US-REG-011-CA02 — Refus ou exception**

- **Étant donné** maximum du profil atteint ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** construction refusée.

**US-REG-011-CA03 — Cas frontière**

- **Étant donné** SS-042 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** +50 % et cinq maximum en référence observée.

**US-REG-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier arrondis, spécialisation et or. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer mes opérations coûteuses. |
| E | Qualifier U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **capacité accrue selon entrepôts actifs**.
- [ ] Le cas frontière est vérifié : **SS-042 → +50 % et cinq maximum en référence observée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-reg-012"></a>
## US-REG-012 — Aménager des champs

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite augmenter le soutien de mon armée afin de réduire la pression de l’entretien.

### 2. Conversation — règles et décisions

- **Préconditions :** champ admissible dans la région.
- **Règles / traces :** G08 et calculateur tardif.
- **Question à traiter :** Arbitrer le barème de la saison cible.
- **Incertitudes liées :** `U07`, `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-008](05-REG.md#us-reg-008).
- **Exigences :** `REQ-REGION-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REG-012-CA01 — Parcours nominal**

- **Étant donné** champ admissible dans la région ;
- **Quand** je réalise le parcours « Aménager des champs » ;
- **Alors** capacité de soutien recalculée.

**US-REG-012-CA02 — Refus ou exception**

- **Étant donné** profil non qualifié ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de coefficient choisi arbitrairement.

**US-REG-012-CA03 — Cas frontière**

- **Étant donné** guide 5 % contre outil 10 % ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** valeurs séparées.

**US-REG-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REG-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Arbitrer le barème de la saison cible. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réduire la pression de l’entretien. |
| E | Qualifier U07, U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **capacité de soutien recalculée**.
- [ ] Le cas frontière est vérifié : **guide 5 % contre outil 10 % → valeurs séparées**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

