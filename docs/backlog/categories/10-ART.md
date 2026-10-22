# 10. Artefacts et inventaires

14 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-ART-001 — Consulter mes inventaires](#us-art-001)
- [US-ART-002 — Inspecter un artefact](#us-art-002)
- [US-ART-003 — Équiper un artefact](#us-art-003)
- [US-ART-004 — Respecter le budget d’équipement](#us-art-004)
- [US-ART-005 — Remplacer un objet équipé](#us-art-005)
- [US-ART-006 — Déséquiper un objet](#us-art-006)
- [US-ART-007 — Déposer un objet en cité](#us-art-007)
- [US-ART-008 — Retirer un objet de réserve](#us-art-008)
- [US-ART-009 — Transporter un artefact entre cités](#us-art-009)
- [US-ART-010 — Recevoir un artefact de butin](#us-art-010)
- [US-ART-011 — Compléter un ensemble autorisé](#us-art-011)
- [US-ART-012 — Vendre un artefact admissible](#us-art-012)
- [US-ART-013 — Comprendre une restriction d’objet](#us-art-013)
- [US-ART-014 — Retrouver les effets réels d’un objet](#us-art-014)

<a id="us-art-001"></a>
## US-ART-001 — Consulter mes inventaires

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite distinguer équipement, sac et réserve de cité afin de localiser mes objets.

### 2. Conversation — règles et décisions

- **Préconditions :** héros et cité consultables.
- **Règles / traces :** SS-023.
- **Question à traiter :** Qualifier capacités de chaque conteneur.
- **Incertitudes liées :** `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-EQUIP-02`, `REQ-UI-08`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-001-CA01 — Parcours nominal**

- **Étant donné** héros et cité consultables ;
- **Quand** je réalise le parcours « Consulter mes inventaires » ;
- **Alors** trois conteneurs et propriétaires sont distincts.

**US-ART-001-CA02 — Refus ou exception**

- **Étant donné** cité étrangère ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** réserve privée inaccessible.

**US-ART-001-CA03 — Cas frontière**

- **Étant donné** pagination ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de limite de capacité déduite.

**US-ART-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ART-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier capacités de chaque conteneur. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : localiser mes objets. |
| E | Qualifier U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **trois conteneurs et propriétaires sont distincts**.
- [ ] Le cas frontière est vérifié : **pagination → pas de limite de capacité déduite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-002"></a>
## US-ART-002 — Inspecter un artefact

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite lire niveau, emplacement et effets afin de évaluer son utilité.

### 2. Conversation — règles et décisions

- **Préconditions :** un objet est visible légalement.
- **Règles / traces :** 563 entrées CODE-01-DATA.
- **Question à traiter :** Qualifier types et availability historique.
- **Incertitudes liées :** `U27`, `U45` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-001](10-ART.md#us-art-001).
- **Exigences :** `REQ-EQUIP-01`, `REQ-DATA-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-002-CA01 — Parcours nominal**

- **Étant donné** un objet est visible légalement ;
- **Quand** je réalise le parcours « Inspecter un artefact » ;
- **Alors** effets militaires et économiques sont détaillés.

**US-ART-002-CA02 — Refus ou exception**

- **Étant donné** icône absente ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** nom et données restent lisibles.

**US-ART-002-CA03 — Cas frontière**

- **Étant donné** objet tardif ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** disponibilité du profil signalée.

**US-ART-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ART-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier types et availability historique. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : évaluer son utilité. |
| E | Qualifier U27, U45 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **effets militaires et économiques sont détaillés**.
- [ ] Le cas frontière est vérifié : **objet tardif → disponibilité du profil signalée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-003"></a>
## US-ART-003 — Équiper un artefact

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite placer un objet dans son emplacement afin de améliorer mon héros.

### 2. Conversation — règles et décisions

- **Préconditions :** objet détenu et contraintes satisfaites.
- **Règles / traces :** Huit emplacements CODE-01-DATA.
- **Question à traiter :** Qualifier restrictions de faction et liaison.
- **Incertitudes liées :** `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-002](10-ART.md#us-art-002).
- **Exigences :** `REQ-EQUIP-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-003-CA01 — Parcours nominal**

- **Étant donné** objet détenu et contraintes satisfaites ;
- **Quand** je réalise le parcours « Équiper un artefact » ;
- **Alors** objet retiré du sac et bonus recalculés.

**US-ART-003-CA02 — Refus ou exception**

- **Étant donné** mauvais emplacement ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** équipement refusé.

**US-ART-003-CA03 — Cas frontière**

- **Étant donné** objet déjà équipé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de copie créée.

**US-ART-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier restrictions de faction et liaison. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : améliorer mon héros. |
| E | Qualifier U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **objet retiré du sac et bonus recalculés**.
- [ ] Le cas frontière est vérifié : **objet déjà équipé → pas de copie créée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-004"></a>
## US-ART-004 — Respecter le budget d’équipement

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître la somme des niveaux portés afin de éviter une composition illégale.

### 2. Conversation — règles et décisions

- **Préconditions :** plusieurs objets équipés.
- **Règles / traces :** G07, somme des niveaux limitée.
- **Question à traiter :** Qualifier exceptions saisonnières.
- **Incertitudes liées :** `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-003](10-ART.md#us-art-003).
- **Exigences :** `REQ-EQUIP-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-004-CA01 — Parcours nominal**

- **Étant donné** plusieurs objets équipés ;
- **Quand** je réalise le parcours « Respecter le budget d’équipement » ;
- **Alors** somme comparée au niveau du héros selon G07.

**US-ART-004-CA02 — Refus ou exception**

- **Étant donné** budget dépassé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** équipement refusé.

**US-ART-004-CA03 — Cas frontière**

- **Étant donné** égalité au niveau ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** acceptation si règle retenue.

**US-ART-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ART-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier exceptions saisonnières. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter une composition illégale. |
| E | Qualifier U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **somme comparée au niveau du héros selon G07**.
- [ ] Le cas frontière est vérifié : **égalité au niveau → acceptation si règle retenue**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-005"></a>
## US-ART-005 — Remplacer un objet équipé

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite échanger une pièce d’équipement afin de adapter mon héros.

### 2. Conversation — règles et décisions

- **Préconditions :** nouvel objet et destination de l’ancien disponibles.
- **Règles / traces :** Échange atomique proposé.
- **Question à traiter :** Qualifier destination et capacité lors du remplacement.
- **Incertitudes liées :** `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-003](10-ART.md#us-art-003).
- **Exigences :** `REQ-EQUIP-01`, `REQ-EQUIP-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ART-005-CA01 — Parcours nominal**

- **Étant donné** nouvel objet et destination de l’ancien disponibles ;
- **Quand** je réalise le parcours « Remplacer un objet équipé » ;
- **Alors** échange complet et bonus actualisés.

**US-ART-005-CA02 — Refus ou exception**

- **Étant donné** sac sans capacité ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune perte silencieuse.

**US-ART-005-CA03 — Cas frontière**

- **Étant donné** nouveau budget invalide ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ancien équipement conservé.

**US-ART-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier destination et capacité lors du remplacement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter mon héros. |
| E | Qualifier U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **échange complet et bonus actualisés**.
- [ ] Le cas frontière est vérifié : **nouveau budget invalide → ancien équipement conservé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-006"></a>
## US-ART-006 — Déséquiper un objet

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retirer un artefact porté afin de le conserver pour un autre usage.

### 2. Conversation — règles et décisions

- **Préconditions :** retrait autorisé et place disponible.
- **Règles / traces :** Inventaire et emplacements.
- **Question à traiter :** Qualifier liaison et restrictions en mission.
- **Incertitudes liées :** `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-003](10-ART.md#us-art-003).
- **Exigences :** `REQ-EQUIP-01`, `REQ-EQUIP-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-006-CA01 — Parcours nominal**

- **Étant donné** retrait autorisé et place disponible ;
- **Quand** je réalise le parcours « Déséquiper un objet » ;
- **Alors** objet déplacé et seuls ses bonus retirés.

**US-ART-006-CA02 — Refus ou exception**

- **Étant donné** objet verrouillé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** retrait refusé avec motif.

**US-ART-006-CA03 — Cas frontière**

- **Étant donné** ensemble rompu ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** bonus associé recalculé.

**US-ART-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier liaison et restrictions en mission. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : le conserver pour un autre usage. |
| E | Qualifier U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **objet déplacé et seuls ses bonus retirés**.
- [ ] Le cas frontière est vérifié : **ensemble rompu → bonus associé recalculé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-007"></a>
## US-ART-007 — Déposer un objet en cité

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite transférer un artefact du sac à la réserve afin de organiser mes équipements.

### 2. Conversation — règles et décisions

- **Préconditions :** héros au lieu autorisé.
- **Règles / traces :** SS-023, contrat de transfert.
- **Question à traiter :** Qualifier proximité et capacité de réserve.
- **Incertitudes liées :** `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-001](10-ART.md#us-art-001).
- **Exigences :** `REQ-EQUIP-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-007-CA01 — Parcours nominal**

- **Étant donné** héros au lieu autorisé ;
- **Quand** je réalise le parcours « Déposer un objet en cité » ;
- **Alors** objet change de conteneur une fois.

**US-ART-007-CA02 — Refus ou exception**

- **Étant donné** distance non admissible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** transfert refusé.

**US-ART-007-CA03 — Cas frontière**

- **Étant donné** double validation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un objet final.

**US-ART-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier proximité et capacité de réserve. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : organiser mes équipements. |
| E | Qualifier U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **objet change de conteneur une fois**.
- [ ] Le cas frontière est vérifié : **double validation → un objet final**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-008"></a>
## US-ART-008 — Retirer un objet de réserve

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite confier un artefact stocké à un héros afin de préparer son équipement.

### 2. Conversation — règles et décisions

- **Préconditions :** héros et réserve accessibles.
- **Règles / traces :** Conteneurs distincts SS-023.
- **Question à traiter :** Qualifier disponibilité et capacité.
- **Incertitudes liées :** `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-007](10-ART.md#us-art-007).
- **Exigences :** `REQ-EQUIP-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-008-CA01 — Parcours nominal**

- **Étant donné** héros et réserve accessibles ;
- **Quand** je réalise le parcours « Retirer un objet de réserve » ;
- **Alors** objet rejoint le sac choisi.

**US-ART-008-CA02 — Refus ou exception**

- **Étant donné** sac plein ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** retrait refusé.

**US-ART-008-CA03 — Cas frontière**

- **Étant donné** deux héros demandent l’objet ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un seul l’obtient.

**US-ART-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier disponibilité et capacité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer son équipement. |
| E | Qualifier U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **objet rejoint le sac choisi**.
- [ ] Le cas frontière est vérifié : **deux héros demandent l’objet → un seul l’obtient**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-009"></a>
## US-ART-009 — Transporter un artefact entre cités

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite déplacer un objet selon le moyen autorisé afin de équiper un héros ailleurs.

### 2. Conversation — règles et décisions

- **Préconditions :** objet et transport admissibles.
- **Règles / traces :** Transfert inter-cités historiquement incomplet.
- **Question à traiter :** Retrouver porteur, coût, durée et risques.
- **Incertitudes liées :** `U27`, `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-007](10-ART.md#us-art-007).
- **Exigences :** `REQ-EQUIP-02`, `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-ART-009-CA01 — Parcours nominal**

- **Étant donné** objet et transport admissibles ;
- **Quand** je réalise le parcours « Transporter un artefact entre cités » ;
- **Alors** localisation ou transit unique consultable.

**US-ART-009-CA02 — Refus ou exception**

- **Étant donné** aucun transport qualifié ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de téléportation inventée.

**US-ART-009-CA03 — Cas frontière**

- **Étant donné** cité d’arrivée capturée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** politique explicite.

**US-ART-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver porteur, coût, durée et risques. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : équiper un héros ailleurs. |
| E | Qualifier U27, U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **localisation ou transit unique consultable**.
- [ ] Le cas frontière est vérifié : **cité d’arrivée capturée → politique explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-010"></a>
## US-ART-010 — Recevoir un artefact de butin

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir l’objet accordé par une rencontre afin de enrichir mes options.

### 2. Conversation — règles et décisions

- **Préconditions :** rencontre résolue avec récompense d’objet.
- **Règles / traces :** Catégories de butin CODE-01-DATA.
- **Question à traiter :** Qualifier tirage et saturation.
- **Incertitudes liées :** `U27`, `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-001](10-ART.md#us-art-001), [US-REG-003](05-REG.md#us-reg-003).
- **Exigences :** `REQ-EQUIP-02`, `REQ-PVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-010-CA01 — Parcours nominal**

- **Étant donné** rencontre résolue avec récompense d’objet ;
- **Quand** je réalise le parcours « Recevoir un artefact de butin » ;
- **Alors** identifiant, provenance et destination enregistrés.

**US-ART-010-CA02 — Refus ou exception**

- **Étant donné** rapport rejoué ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de second objet.

**US-ART-010-CA03 — Cas frontière**

- **Étant donné** inventaire saturé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** règle explicite.

**US-ART-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-001, US-REG-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier tirage et saturation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : enrichir mes options. |
| E | Qualifier U27, U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **identifiant, provenance et destination enregistrés**.
- [ ] Le cas frontière est vérifié : **inventaire saturé → règle explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-011"></a>
## US-ART-011 — Compléter un ensemble autorisé

**Priorité proposée :** P2 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les bonus d’un ensemble équipé afin de spécialiser mon héros.

### 2. Conversation — règles et décisions

- **Préconditions :** ensemble présent dans le profil.
- **Règles / traces :** Douze ensembles catalogués, disponibilité incertaine.
- **Question à traiter :** Qualifier seuils et saison, sinon laisser désactivé.
- **Incertitudes liées :** `U27`, `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-003](10-ART.md#us-art-003).
- **Exigences :** `REQ-EQUIP-01`, `REQ-PROFILE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-011-CA01 — Parcours nominal**

- **Étant donné** ensemble présent dans le profil ;
- **Quand** je réalise le parcours « Compléter un ensemble autorisé » ;
- **Alors** bonus déclenché selon pièces réellement portées.

**US-ART-011-CA02 — Refus ou exception**

- **Étant donné** objet dans le sac ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ne compte pas comme porté.

**US-ART-011-CA03 — Cas frontière**

- **Étant donné** pièce retirée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** seuil recalculé.

**US-ART-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier seuils et saison, sinon laisser désactivé. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : spécialiser mon héros. |
| E | Qualifier U27, U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **bonus déclenché selon pièces réellement portées**.
- [ ] Le cas frontière est vérifié : **pièce retirée → seuil recalculé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-012"></a>
## US-ART-012 — Vendre un artefact admissible

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite mettre un objet échangeable sur le marché afin de valoriser un équipement inutilisé.

### 2. Conversation — règles et décisions

- **Préconditions :** objet détenu et vente autorisée.
- **Règles / traces :** G18 et catégories d’objets.
- **Question à traiter :** Qualifier objets échangeables et valorisation.
- **Incertitudes liées :** `U27`, `U28` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-001](10-ART.md#us-art-001), [US-ECH-005](04-ECH.md#us-ech-005).
- **Exigences :** `REQ-EQUIP-02`, `REQ-TRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-012-CA01 — Parcours nominal**

- **Étant donné** objet détenu et vente autorisée ;
- **Quand** je réalise le parcours « Vendre un artefact admissible » ;
- **Alors** objet réservé dans le lot de vente.

**US-ART-012-CA02 — Refus ou exception**

- **Étant donné** objet lié ou équipé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus selon profil.

**US-ART-012-CA03 — Cas frontière**

- **Étant donné** vente conclue ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ancien inventaire ne le possède plus.

**US-ART-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ART-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-001, US-ECH-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier objets échangeables et valorisation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : valoriser un équipement inutilisé. |
| E | Qualifier U27, U28 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **objet réservé dans le lot de vente**.
- [ ] Le cas frontière est vérifié : **vente conclue → ancien inventaire ne le possède plus**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-013"></a>
## US-ART-013 — Comprendre une restriction d’objet

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir pourquoi un artefact ne peut pas être déplacé afin de choisir une action légale.

### 2. Conversation — règles et décisions

- **Préconditions :** objet soumis à restriction.
- **Règles / traces :** Catalogue incomplet sur liaison.
- **Question à traiter :** Qualifier liaison/déliaison et services éventuels.
- **Incertitudes liées :** `U27`, `U40` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-002](10-ART.md#us-art-002).
- **Exigences :** `REQ-EQUIP-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-013-CA01 — Parcours nominal**

- **Étant donné** objet soumis à restriction ;
- **Quand** je réalise le parcours « Comprendre une restriction d’objet » ;
- **Alors** liaison, faction ou état bloquant expliqué.

**US-ART-013-CA02 — Refus ou exception**

- **Étant donné** restriction inconnue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune règle inventée.

**US-ART-013-CA03 — Cas frontière**

- **Étant donné** héros libéré de mission ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** éligibilité réévaluée.

**US-ART-013-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ART-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier liaison/déliaison et services éventuels. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir une action légale. |
| E | Qualifier U27, U40 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **liaison, faction ou état bloquant expliqué**.
- [ ] Le cas frontière est vérifié : **héros libéré de mission → éligibilité réévaluée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-art-014"></a>
## US-ART-014 — Retrouver les effets réels d’un objet

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite identifier sa contribution au résultat afin de vérifier l’intérêt de mon équipement.

### 2. Conversation — règles et décisions

- **Préconditions :** objet actif au moment de l’action.
- **Règles / traces :** Effets séparés CODE-01-DATA.
- **Question à traiter :** Qualifier portée et instant d’évaluation.
- **Incertitudes liées :** `U27`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ART-003](10-ART.md#us-art-003).
- **Exigences :** `REQ-EQUIP-01`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ART-014-CA01 — Parcours nominal**

- **Étant donné** objet actif au moment de l’action ;
- **Quand** je réalise le parcours « Retrouver les effets réels d’un objet » ;
- **Alors** effet rattaché au bon héros, lieu et instant.

**US-ART-014-CA02 — Refus ou exception**

- **Étant donné** objet retiré avant prise en compte ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** bonus absent.

**US-ART-014-CA03 — Cas frontière**

- **Étant donné** rapport ancien ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** effet historique non réécrit.

**US-ART-014-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ART-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ART-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier portée et instant d’évaluation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : vérifier l’intérêt de mon équipement. |
| E | Qualifier U27, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **effet rattaché au bon héros, lieu et instant**.
- [ ] Le cas frontière est vérifié : **rapport ancien → effet historique non réécrit**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

