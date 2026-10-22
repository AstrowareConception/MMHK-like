# 8. Magie et programmation des sorts

12 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-MAG-001 — Consulter le grimoire](#us-mag-001)
- [US-MAG-002 — Apprendre un sort](#us-mag-002)
- [US-MAG-003 — Respecter la capacité du grimoire](#us-mag-003)
- [US-MAG-004 — Programmer un sort](#us-mag-004)
- [US-MAG-005 — Préparer le second sort](#us-mag-005)
- [US-MAG-006 — Connaître la recharge](#us-mag-006)
- [US-MAG-007 — Comprendre la puissance magique](#us-mag-007)
- [US-MAG-008 — Résoudre un sort de dégâts](#us-mag-008)
- [US-MAG-009 — Invoquer des unités temporaires](#us-mag-009)
- [US-MAG-010 — Résoudre une résurrection](#us-mag-010)
- [US-MAG-011 — Appliquer une amélioration ou altération](#us-mag-011)
- [US-MAG-012 — Lire un sort non exécuté](#us-mag-012)

<a id="us-mag-001"></a>
## US-MAG-001 — Consulter le grimoire

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir mes sorts et leurs effets afin de préparer mes combats.

### 2. Conversation — règles et décisions

- **Préconditions :** héros doté d’accès magique.
- **Règles / traces :** 36 sorts, quatre écoles CODE-01-DATA.
- **Question à traiter :** Qualifier disponibilité saisonnière.
- **Incertitudes liées :** `U02`, `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-MAGIC-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-001-CA01 — Parcours nominal**

- **Étant donné** héros doté d’accès magique ;
- **Quand** je réalise le parcours « Consulter le grimoire » ;
- **Alors** école, cercle, cible et disponibilité visibles.

**US-MAG-001-CA02 — Refus ou exception**

- **Étant donné** sort hors profil ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non apprenable.

**US-MAG-001-CA03 — Cas frontière**

- **Étant donné** même nom de traduction ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** identité logique conservée.

**US-MAG-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MAG-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier disponibilité saisonnière. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer mes combats. |
| E | Qualifier U02, U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **école, cercle, cible et disponibilité visibles**.
- [ ] Le cas frontière est vérifié : **même nom de traduction → identité logique conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-002"></a>
## US-MAG-002 — Apprendre un sort

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite acquérir un sort autorisé afin de élargir mes options tactiques.

### 2. Conversation — règles et décisions

- **Préconditions :** école, cercle et moyens admissibles.
- **Règles / traces :** G14 et guildes.
- **Question à traiter :** Retrouver coût, durée et capacité de grimoire.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-001](08-MAG.md#us-mag-001), [US-CIT-012](02-CIT.md#us-cit-012).
- **Exigences :** `REQ-MAGIC-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-002-CA01 — Parcours nominal**

- **Étant donné** école, cercle et moyens admissibles ;
- **Quand** je réalise le parcours « Apprendre un sort » ;
- **Alors** sort ajouté à l’issue de l’apprentissage.

**US-MAG-002-CA02 — Refus ou exception**

- **Étant donné** guilde insuffisante ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** apprentissage refusé.

**US-MAG-002-CA03 — Cas frontière**

- **Étant donné** école incompatible ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun achat.

**US-MAG-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MAG-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-001, US-CIT-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver coût, durée et capacité de grimoire. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : élargir mes options tactiques. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **sort ajouté à l’issue de l’apprentissage**.
- [ ] Le cas frontière est vérifié : **école incompatible → aucun achat**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-003"></a>
## US-MAG-003 — Respecter la capacité du grimoire

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître le nombre de sorts apprenables afin de choisir mes apprentissages.

### 2. Conversation — règles et décisions

- **Préconditions :** limite de grimoire définie.
- **Règles / traces :** Talents Scribe, SS-020.
- **Question à traiter :** Qualifier capacité de base et dépassement.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-002](08-MAG.md#us-mag-002).
- **Exigences :** `REQ-MAGIC-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-003-CA01 — Parcours nominal**

- **Étant donné** limite de grimoire définie ;
- **Quand** je réalise le parcours « Respecter la capacité du grimoire » ;
- **Alors** capacité et effet de Scribe explicités.

**US-MAG-003-CA02 — Refus ou exception**

- **Étant donné** capacité pleine ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** nouvel apprentissage refusé.

**US-MAG-003-CA03 — Cas frontière**

- **Étant donné** bonus retiré ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** devenir des sorts excédentaires défini.

**US-MAG-003-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MAG-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier capacité de base et dépassement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir mes apprentissages. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **capacité et effet de Scribe explicités**.
- [ ] Le cas frontière est vérifié : **bonus retiré → devenir des sorts excédentaires défini**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-004"></a>
## US-MAG-004 — Programmer un sort

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite choisir sort et tour de lancement afin de agir au bon moment du combat.

### 2. Conversation — règles et décisions

- **Préconditions :** une préparation militaire est ouverte.
- **Règles / traces :** SS-016/018.
- **Question à traiter :** Qualifier indices de tour et sélection des cibles.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-001](08-MAG.md#us-mag-001).
- **Exigences :** `REQ-MAGIC-01`, `REQ-UI-06`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-004-CA01 — Parcours nominal**

- **Étant donné** une préparation militaire est ouverte ;
- **Quand** je réalise le parcours « Programmer un sort » ;
- **Alors** sort associé à un tour autorisé.

**US-MAG-004-CA02 — Refus ou exception**

- **Étant donné** tour invalide ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** préparation refusée.

**US-MAG-004-CA03 — Cas frontière**

- **Étant donné** annulation de préparation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun sort consommé.

**US-MAG-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MAG-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier indices de tour et sélection des cibles. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : agir au bon moment du combat. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **sort associé à un tour autorisé**.
- [ ] Le cas frontière est vérifié : **annulation de préparation → aucun sort consommé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-005"></a>
## US-MAG-005 — Préparer le second sort

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite utiliser le second emplacement autorisé afin de combiner deux effets.

### 2. Conversation — règles et décisions

- **Préconditions :** talent et conditions satisfaits.
- **Règles / traces :** G14, deux emplacements visibles.
- **Question à traiter :** Qualifier conditions exactes et cumul des mêmes sorts.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-004](08-MAG.md#us-mag-004), [US-HER-012](07-HER.md#us-her-012).
- **Exigences :** `REQ-MAGIC-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-005-CA01 — Parcours nominal**

- **Étant donné** talent et conditions satisfaits ;
- **Quand** je réalise le parcours « Préparer le second sort » ;
- **Alors** second sort validé avec cercle autorisé.

**US-MAG-005-CA02 — Refus ou exception**

- **Étant donné** talent absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** emplacement non utilisable.

**US-MAG-005-CA03 — Cas frontière**

- **Étant donné** rangs du talent ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** cercles 1/3/5 si profil retenu.

**US-MAG-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MAG-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-004, US-HER-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier conditions exactes et cumul des mêmes sorts. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : combiner deux effets. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **second sort validé avec cercle autorisé**.
- [ ] Le cas frontière est vérifié : **rangs du talent → cercles 1/3/5 si profil retenu**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-006"></a>
## US-MAG-006 — Connaître la recharge

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir quand un sort redevient disponible afin de planifier mes attaques successives.

### 2. Conversation — règles et décisions

- **Préconditions :** un sort soumis à recharge a été employé.
- **Règles / traces :** G14 décrit douze heures, à versionner.
- **Question à traiter :** Qualifier début de recharge et lancement non atteint.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-004](08-MAG.md#us-mag-004).
- **Exigences :** `REQ-MAGIC-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-006-CA01 — Parcours nominal**

- **Étant donné** un sort soumis à recharge a été employé ;
- **Quand** je réalise le parcours « Connaître la recharge » ;
- **Alors** prochaine disponibilité est datée.

**US-MAG-006-CA02 — Refus ou exception**

- **Étant donné** sort non disponible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** programmation opérationnelle refusée.

**US-MAG-006-CA03 — Cas frontière**

- **Étant donné** préparation annulée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de recharge injustifiée.

**US-MAG-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MAG-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier début de recharge et lancement non atteint. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier mes attaques successives. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **prochaine disponibilité est datée**.
- [ ] Le cas frontière est vérifié : **préparation annulée → pas de recharge injustifiée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-007"></a>
## US-MAG-007 — Comprendre la puissance magique

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les facteurs d’un sort afin de choisir héros et équipement.

### 2. Conversation — règles et décisions

- **Préconditions :** sort et contexte connus.
- **Règles / traces :** puissance_effective_sort CODE-01-COMBAT.
- **Question à traiter :** Qualifier arrondis et efficacité négative.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-001](08-MAG.md#us-mag-001).
- **Exigences :** `REQ-MAGIC-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-007-CA01 — Parcours nominal**

- **Étant donné** sort et contexte connus ;
- **Quand** je réalise le parcours « Comprendre la puissance magique » ;
- **Alors** coefficient, magie et bonus applicables explicités.

**US-MAG-007-CA02 — Refus ou exception**

- **Étant donné** résistance inconnue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** résultat signalé estimatif.

**US-MAG-007-CA03 — Cas frontière**

- **Étant donné** facteur d’arme ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** camp pertinent utilisé.

**US-MAG-007-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MAG-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier arrondis et efficacité négative. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir héros et équipement. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **coefficient, magie et bonus applicables explicités**.
- [ ] Le cas frontière est vérifié : **facteur d’arme → camp pertinent utilisé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-008"></a>
## US-MAG-008 — Résoudre un sort de dégâts

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir ses pertes au tour programmé afin de comprendre l’effet de ma magie.

### 2. Conversation — règles et décisions

- **Préconditions :** sort de dégâts effectivement lancé.
- **Règles / traces :** Classes de sorts CODE-01-COMBAT.
- **Question à traiter :** Qualifier saturation et arrondis.
- **Incertitudes liées :** `U13`, `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-004](08-MAG.md#us-mag-004).
- **Exigences :** `REQ-MAGIC-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-008-CA01 — Parcours nominal**

- **Étant donné** sort de dégâts effectivement lancé ;
- **Quand** je réalise le parcours « Résoudre un sort de dégâts » ;
- **Alors** cible et pertes suivent sa formule.

**US-MAG-008-CA02 — Refus ou exception**

- **Étant donné** cible absente ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** branche explicite sans victime inventée.

**US-MAG-008-CA03 — Cas frontière**

- **Étant donné** résistance applicable ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** réduction selon type.

**US-MAG-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MAG-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier saturation et arrondis. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre l’effet de ma magie. |
| E | Qualifier U13, U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **cible et pertes suivent sa formule**.
- [ ] Le cas frontière est vérifié : **résistance applicable → réduction selon type**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-009"></a>
## US-MAG-009 — Invoquer des unités temporaires

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir le soutien d’une invocation afin de renforcer un combat donné.

### 2. Conversation — règles et décisions

- **Préconditions :** sort d’invocation résolu.
- **Règles / traces :** Indices dédiés du calculateur.
- **Question à traiter :** Qualifier ordre d’insertion et pertes temporaires.
- **Incertitudes liées :** `U13`, `U42` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-004](08-MAG.md#us-mag-004).
- **Exigences :** `REQ-MAGIC-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-009-CA01 — Parcours nominal**

- **Étant donné** sort d’invocation résolu ;
- **Quand** je réalise le parcours « Invoquer des unités temporaires » ;
- **Alors** unités temporaires participent à leur place prévue.

**US-MAG-009-CA02 — Refus ou exception**

- **Étant donné** fin de bataille ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de recrues permanentes créées.

**US-MAG-009-CA03 — Cas frontière**

- **Étant donné** XP adverse ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** invocations traitées selon leur statut.

**US-MAG-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MAG-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier ordre d’insertion et pertes temporaires. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : renforcer un combat donné. |
| E | Qualifier U13, U42 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **unités temporaires participent à leur place prévue**.
- [ ] Le cas frontière est vérifié : **XP adverse → invocations traitées selon leur statut**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-010"></a>
## US-MAG-010 — Résoudre une résurrection

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver les unités rétablies par un sort afin de évaluer mes pertes finales.

### 2. Conversation — règles et décisions

- **Préconditions :** résurrection admissible et cible présente.
- **Règles / traces :** Branches spécifiques Jactari.
- **Question à traiter :** Qualifier exceptions et anomalies du simulateur.
- **Incertitudes liées :** `U13`, `U42` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-004](08-MAG.md#us-mag-004).
- **Exigences :** `REQ-MAGIC-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-010-CA01 — Parcours nominal**

- **Étant donné** résurrection admissible et cible présente ;
- **Quand** je réalise le parcours « Résoudre une résurrection » ;
- **Alors** temporaire et définitive sont distinguées.

**US-MAG-010-CA02 — Refus ou exception**

- **Étant donné** unités non admissibles ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun retour indu.

**US-MAG-010-CA03 — Cas frontière**

- **Étant donné** fin du combat ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** effectif durable calculé selon type.

**US-MAG-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MAG-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier exceptions et anomalies du simulateur. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : évaluer mes pertes finales. |
| E | Qualifier U13, U42 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **temporaire et définitive sont distinguées**.
- [ ] Le cas frontière est vérifié : **fin du combat → effectif durable calculé selon type**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-011"></a>
## US-MAG-011 — Appliquer une amélioration ou altération

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir une modification magique de puissance afin de comprendre les échanges suivants.

### 2. Conversation — règles et décisions

- **Préconditions :** sort applicable lancé.
- **Règles / traces :** Cinq classes de sorts CODE-01-DATA.
- **Question à traiter :** Qualifier durée, cumul et résistance par classe.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-004](08-MAG.md#us-mag-004).
- **Exigences :** `REQ-MAGIC-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MAG-011-CA01 — Parcours nominal**

- **Étant donné** sort applicable lancé ;
- **Quand** je réalise le parcours « Appliquer une amélioration ou altération » ;
- **Alors** effet touche uniquement la cible et la durée prévues.

**US-MAG-011-CA02 — Refus ou exception**

- **Étant donné** type non compatible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de bonus global arbitraire.

**US-MAG-011-CA03 — Cas frontière**

- **Étant donné** effets simultanés ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ordre et cumul explicites.

**US-MAG-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MAG-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier durée, cumul et résistance par classe. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre les échanges suivants. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **effet touche uniquement la cible et la durée prévues**.
- [ ] Le cas frontière est vérifié : **effets simultanés → ordre et cumul explicites**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mag-012"></a>
## US-MAG-012 — Lire un sort non exécuté

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite comprendre pourquoi un sort préparé n’a pas agi afin de corriger ma prochaine préparation.

### 2. Conversation — règles et décisions

- **Préconditions :** bataille terminée ou cible disparue avant lancement.
- **Règles / traces :** Programmation par tours, contrat de rapport PROP.
- **Question à traiter :** Qualifier motifs et consommation éventuelle.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MAG-004](08-MAG.md#us-mag-004).
- **Exigences :** `REQ-MAGIC-01`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-MAG-012-CA01 — Parcours nominal**

- **Étant donné** bataille terminée ou cible disparue avant lancement ;
- **Quand** je réalise le parcours « Lire un sort non exécuté » ;
- **Alors** rapport distingue programmé, exécuté et non exécuté.

**US-MAG-012-CA02 — Refus ou exception**

- **Étant donné** sort non exécuté ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’effet fictif.

**US-MAG-012-CA03 — Cas frontière**

- **Étant donné** recharge ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** règle du profil appliquée et expliquée.

**US-MAG-012-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MAG-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MAG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier motifs et consommation éventuelle. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : corriger ma prochaine préparation. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rapport distingue programmé, exécuté et non exécuté**.
- [ ] Le cas frontière est vérifié : **recharge → règle du profil appliquée et expliquée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

