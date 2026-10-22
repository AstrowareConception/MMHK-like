# 7. Gestion du héros et carrières

18 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-HER-001 — Consulter mes héros](#us-her-001)
- [US-HER-002 — Examiner les offres de taverne](#us-her-002)
- [US-HER-003 — Recruter un héros](#us-her-003)
- [US-HER-004 — Comprendre mes limites de héros](#us-her-004)
- [US-HER-005 — Renouveler les offres](#us-her-005)
- [US-HER-006 — Personnaliser un héros](#us-her-006)
- [US-HER-007 — Suivre l’expérience](#us-her-007)
- [US-HER-008 — Comprendre mes caractéristiques](#us-her-008)
- [US-HER-009 — Ouvrir une carrière](#us-her-009)
- [US-HER-010 — Choisir une carrière magique](#us-her-010)
- [US-HER-011 — Apprendre un talent](#us-her-011)
- [US-HER-012 — Partager Scribe et Arcanes](#us-her-012)
- [US-HER-013 — Consulter le budget de compétence](#us-her-013)
- [US-HER-014 — Réorienter un héros](#us-her-014)
- [US-HER-015 — Suivre une formation](#us-her-015)
- [US-HER-016 — Affecter un héros à une activité](#us-her-016)
- [US-HER-017 — Attendre la guérison](#us-her-017)
- [US-HER-018 — Libérer un héros d’une mission terminée](#us-her-018)

<a id="us-her-001"></a>
## US-HER-001 — Consulter mes héros

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir position, activité et caractéristiques de mes héros afin de affecter le bon personnage.

### 2. Conversation — règles et décisions

- **Préconditions :** mon royaume possède des héros.
- **Règles / traces :** SS-019/025, CODE-02-HEROS.
- **Question à traiter :** Qualifier informations publiques et privées.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-HERO-02`, `REQ-UI-08`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-001-CA01 — Parcours nominal**

- **Étant donné** mon royaume possède des héros ;
- **Quand** je réalise le parcours « Consulter mes héros » ;
- **Alors** portrait, niveau, statistiques et mission sont cohérents.

**US-HER-001-CA02 — Refus ou exception**

- **Étant donné** héros adverse ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune fiche privée complète.

**US-HER-001-CA03 — Cas frontière**

- **Étant donné** héros en mission ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** position distinguée de la cité consultée.

**US-HER-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-HER-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier informations publiques et privées. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : affecter le bon personnage. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **portrait, niveau, statistiques et mission sont cohérents**.
- [ ] Le cas frontière est vérifié : **héros en mission → position distinguée de la cité consultée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-002"></a>
## US-HER-002 — Examiner les offres de taverne

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite comparer les héros proposés afin de choisir un profil adapté.

### 2. Conversation — règles et décisions

- **Préconditions :** taverne active.
- **Règles / traces :** SS-057.
- **Question à traiter :** Retrouver génération et courbe des prix.
- **Incertitudes liées :** `U24` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-013](02-CIT.md#us-cit-013).
- **Exigences :** `REQ-HERO-01`, `REQ-UI-10`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-002-CA01 — Parcours nominal**

- **Étant donné** taverne active ;
- **Quand** je réalise le parcours « Examiner les offres de taverne » ;
- **Alors** archétype, courbes, prix et délai par offre.

**US-HER-002-CA02 — Refus ou exception**

- **Étant donné** offre indisponible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** recrutement désactivé.

**US-HER-002-CA03 — Cas frontière**

- **Étant donné** 46 000 or observés ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de tarif universel.

**US-HER-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-HER-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-013. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver génération et courbe des prix. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir un profil adapté. |
| E | Qualifier U24 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **archétype, courbes, prix et délai par offre**.
- [ ] Le cas frontière est vérifié : **46 000 or observés → pas de tarif universel**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-003"></a>
## US-HER-003 — Recruter un héros

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite engager une offre valide afin de accroître ma capacité d’action.

### 2. Conversation — règles et décisions

- **Préconditions :** capacité et ressources disponibles.
- **Règles / traces :** Taverne ; coût/durée par profil.
- **Question à traiter :** Qualifier dotation et disponibilité initiale.
- **Incertitudes liées :** `U24` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-002](07-HER.md#us-her-002).
- **Exigences :** `REQ-HERO-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-003-CA01 — Parcours nominal**

- **Étant donné** capacité et ressources disponibles ;
- **Quand** je réalise le parcours « Recruter un héros » ;
- **Alors** une offre crée un recrutement et un héros à terme.

**US-HER-003-CA02 — Refus ou exception**

- **Étant donné** offre remplacée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** engagement refusé.

**US-HER-003-CA03 — Cas frontière**

- **Étant donné** deux validations ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un seul recrutement.

**US-HER-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier dotation et disponibilité initiale. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : accroître ma capacité d’action. |
| E | Qualifier U24 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **une offre crée un recrutement et un héros à terme**.
- [ ] Le cas frontière est vérifié : **deux validations → un seul recrutement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-004"></a>
## US-HER-004 — Comprendre mes limites de héros

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir le droit de recrutement restant afin de préparer mon développement.

### 2. Conversation — règles et décisions

- **Préconditions :** je consulte la taverne.
- **Règles / traces :** SS-057.
- **Question à traiter :** Qualifier plafonds du monde sans modèle payant implicite.
- **Incertitudes liées :** `U24`, `U40` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-002](07-HER.md#us-her-002).
- **Exigences :** `REQ-HERO-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-004-CA01 — Parcours nominal**

- **Étant donné** je consulte la taverne ;
- **Quand** je réalise le parcours « Comprendre mes limites de héros » ;
- **Alors** limite de jeu et verrou de service distingués.

**US-HER-004-CA02 — Refus ou exception**

- **Étant donné** capacité atteinte ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** motif précis.

**US-HER-004-CA03 — Cas frontière**

- **Étant donné** délai commercial ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** distinct du temps de recrutement.

**US-HER-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-HER-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier plafonds du monde sans modèle payant implicite. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer mon développement. |
| E | Qualifier U24, U40 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **limite de jeu et verrou de service distingués**.
- [ ] Le cas frontière est vérifié : **délai commercial → distinct du temps de recrutement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-005"></a>
## US-HER-005 — Renouveler les offres

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite demander de nouveaux candidats afin de chercher un autre archétype.

### 2. Conversation — règles et décisions

- **Préconditions :** renouvellement autorisé.
- **Règles / traces :** SS-057, 3200 or contextuels.
- **Question à traiter :** Qualifier délai et tirage des candidats.
- **Incertitudes liées :** `U24` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-002](07-HER.md#us-her-002).
- **Exigences :** `REQ-HERO-04`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-005-CA01 — Parcours nominal**

- **Étant donné** renouvellement autorisé ;
- **Quand** je réalise le parcours « Renouveler les offres » ;
- **Alors** coût et temporisation propres appliqués.

**US-HER-005-CA02 — Refus ou exception**

- **Étant donné** délai non écoulé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** renouvellement refusé.

**US-HER-005-CA03 — Cas frontière**

- **Étant donné** nouvelle offre ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ancien devis invalidé.

**US-HER-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier délai et tirage des candidats. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : chercher un autre archétype. |
| E | Qualifier U24 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **coût et temporisation propres appliqués**.
- [ ] Le cas frontière est vérifié : **nouvelle offre → ancien devis invalidé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-006"></a>
## US-HER-006 — Personnaliser un héros

**Priorité proposée :** P2 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite modifier son nom ou portrait autorisé afin de identifier son rôle dans mon royaume.

### 2. Conversation — règles et décisions

- **Préconditions :** héros possédé et personnalisation disponible.
- **Règles / traces :** SS-019/023, 19 portraits dans le configurateur.
- **Question à traiter :** Qualifier noms, portraits et éventuels coûts.
- **Incertitudes liées :** `U24`, `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-HERO-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-006-CA01 — Parcours nominal**

- **Étant donné** héros possédé et personnalisation disponible ;
- **Quand** je réalise le parcours « Personnaliser un héros » ;
- **Alors** identité affichée changée sans modifier ses statistiques.

**US-HER-006-CA02 — Refus ou exception**

- **Étant donné** nom invalide ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** modification refusée.

**US-HER-006-CA03 — Cas frontière**

- **Étant donné** portrait changé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** archétype et faction inchangés.

**US-HER-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier noms, portraits et éventuels coûts. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : identifier son rôle dans mon royaume. |
| E | Qualifier U24, U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **identité affichée changée sans modifier ses statistiques**.
- [ ] Le cas frontière est vérifié : **portrait changé → archétype et faction inchangés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-007"></a>
## US-HER-007 — Suivre l’expérience

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter niveau et prochain seuil afin de anticiper la progression du héros.

### 2. Conversation — règles et décisions

- **Préconditions :** un héros possède de l’XP.
- **Règles / traces :** CODE-01-DATA, niveaux 1–40.
- **Question à traiter :** Qualifier récompenses au niveau maximum.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-HERO-02`, `REQ-DATA-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-007-CA01 — Parcours nominal**

- **Étant donné** un héros possède de l’XP ;
- **Quand** je réalise le parcours « Suivre l’expérience » ;
- **Alors** niveau calculé selon la table du profil.

**US-HER-007-CA02 — Refus ou exception**

- **Étant donné** courbe zéro ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de lecture de la colonne XP comme statistique.

**US-HER-007-CA03 — Cas frontière**

- **Étant donné** seuil exact ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** niveau supérieur atteint une fois.

**US-HER-007-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-HER-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier récompenses au niveau maximum. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : anticiper la progression du héros. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **niveau calculé selon la table du profil**.
- [ ] Le cas frontière est vérifié : **seuil exact → niveau supérieur atteint une fois**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-008"></a>
## US-HER-008 — Comprendre mes caractéristiques

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir l’origine attaque, défense et magie afin de choisir mon équipement et mes talents.

### 2. Conversation — règles et décisions

- **Préconditions :** héros équipé ou spécialisé.
- **Règles / traces :** 15 archétypes et courbes automatiques.
- **Question à traiter :** Qualifier ordre de cumul des effets.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-HERO-02`, `REQ-DATA-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-008-CA01 — Parcours nominal**

- **Étant donné** héros équipé ou spécialisé ;
- **Quand** je réalise le parcours « Comprendre mes caractéristiques » ;
- **Alors** base, courbe et modificateurs distingués.

**US-HER-008-CA02 — Refus ou exception**

- **Étant donné** indice de courbe ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** jamais affiché comme valeur brute.

**US-HER-008-CA03 — Cas frontière**

- **Étant donné** objet retiré ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** seul son bonus disparaît.

**US-HER-008-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-HER-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier ordre de cumul des effets. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir mon équipement et mes talents. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **base, courbe et modificateurs distingués**.
- [ ] Le cas frontière est vérifié : **objet retiré → seul son bonus disparaît**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-009"></a>
## US-HER-009 — Ouvrir une carrière

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite choisir une spécialisation autorisée afin de donner un rôle à mon héros.

### 2. Conversation — règles et décisions

- **Préconditions :** emplacement et point disponibles.
- **Règles / traces :** CODE-02-HEROS, trois emplacements et coût 1.
- **Question à traiter :** Qualifier niveaux d’ouverture de la saison.
- **Incertitudes liées :** `U25` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-HERO-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-009-CA01 — Parcours nominal**

- **Étant donné** emplacement et point disponibles ;
- **Quand** je réalise le parcours « Ouvrir une carrière » ;
- **Alors** carrière ajoutée avec coût d’ouverture.

**US-HER-009-CA02 — Refus ou exception**

- **Étant donné** quatrième carrière ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-HER-009-CA03 — Cas frontière**

- **Étant donné** carrière déjà choisie ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** doublon refusé.

**US-HER-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier niveaux d’ouverture de la saison. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : donner un rôle à mon héros. |
| E | Qualifier U25 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **carrière ajoutée avec coût d’ouverture**.
- [ ] Le cas frontière est vérifié : **carrière déjà choisie → doublon refusé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-010"></a>
## US-HER-010 — Choisir une carrière magique

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite adopter une école compatible afin de développer les capacités du héros.

### 2. Conversation — règles et décisions

- **Préconditions :** carrière et emplacement disponibles.
- **Règles / traces :** validite_carriere de Jactari.
- **Question à traiter :** Qualifier toute exception saisonnière.
- **Incertitudes liées :** `U25` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-009](07-HER.md#us-her-009).
- **Exigences :** `REQ-HERO-03`, `REQ-MAGIC-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-010-CA01 — Parcours nominal**

- **Étant donné** carrière et emplacement disponibles ;
- **Quand** je réalise le parcours « Choisir une carrière magique » ;
- **Alors** école autorisée par faction et archétype.

**US-HER-010-CA02 — Refus ou exception**

- **Étant donné** archétype guerrier ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** carrière magique refusée.

**US-HER-010-CA03 — Cas frontière**

- **Étant donné** école étrangère ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** non sélectionnable.

**US-HER-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier toute exception saisonnière. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : développer les capacités du héros. |
| E | Qualifier U25 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **école autorisée par faction et archétype**.
- [ ] Le cas frontière est vérifié : **école étrangère → non sélectionnable**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-011"></a>
## US-HER-011 — Apprendre un talent

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite dépenser des points pour un rang afin de renforcer une aptitude.

### 2. Conversation — règles et décisions

- **Préconditions :** carrière ouverte et budget suffisant.
- **Règles / traces :** CODE-02-HEROS ; G07 durée distincte.
- **Question à traiter :** Qualifier délai et indisponibilité pendant formation.
- **Incertitudes liées :** `U25` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-009](07-HER.md#us-her-009).
- **Exigences :** `REQ-HERO-02`, `REQ-HERO-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-011-CA01 — Parcours nominal**

- **Étant donné** carrière ouverte et budget suffisant ;
- **Quand** je réalise le parcours « Apprendre un talent » ;
- **Alors** rang engagé au coût supplémentaire attendu.

**US-HER-011-CA02 — Refus ou exception**

- **Étant donné** budget insuffisant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun apprentissage.

**US-HER-011-CA03 — Cas frontière**

- **Étant donné** rangs 1/2/3 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** coûts cumulés 1/3/6.

**US-HER-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier délai et indisponibilité pendant formation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : renforcer une aptitude. |
| E | Qualifier U25 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rang engagé au coût supplémentaire attendu**.
- [ ] Le cas frontière est vérifié : **rangs 1/2/3 → coûts cumulés 1/3/6**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-012"></a>
## US-HER-012 — Partager Scribe et Arcanes

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver le même rang dans mes écoles afin de éviter de payer deux fois un talent commun.

### 2. Conversation — règles et décisions

- **Préconditions :** deux carrières magiques concernées.
- **Règles / traces :** change_talent de Jactari.
- **Question à traiter :** Qualifier compatibilité avec le profil ancien.
- **Incertitudes liées :** `U25` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-010](07-HER.md#us-her-010), [US-HER-011](07-HER.md#us-her-011).
- **Exigences :** `REQ-HERO-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-012-CA01 — Parcours nominal**

- **Étant donné** deux carrières magiques concernées ;
- **Quand** je réalise le parcours « Partager Scribe et Arcanes » ;
- **Alors** rang commun synchronisé avec dépense unique.

**US-HER-012-CA02 — Refus ou exception**

- **Étant donné** seconde école ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de nouveau coût pour rang acquis.

**US-HER-012-CA03 — Cas frontière**

- **Étant donné** carrière retirée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** rang restant et budget cohérents.

**US-HER-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-010, US-HER-011. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier compatibilité avec le profil ancien. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter de payer deux fois un talent commun. |
| E | Qualifier U25 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rang commun synchronisé avec dépense unique**.
- [ ] Le cas frontière est vérifié : **carrière retirée → rang restant et budget cohérents**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-013"></a>
## US-HER-013 — Consulter le budget de compétence

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir points acquis, dépensés et disponibles afin de planifier ma spécialisation.

### 2. Conversation — règles et décisions

- **Préconditions :** un héros possède niveau et carrières.
- **Règles / traces :** CODE-02-HEROS.
- **Question à traiter :** Qualifier bonus héréditaires autorisés.
- **Incertitudes liées :** `U25` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-009](07-HER.md#us-her-009).
- **Exigences :** `REQ-HERO-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-013-CA01 — Parcours nominal**

- **Étant donné** un héros possède niveau et carrières ;
- **Quand** je réalise le parcours « Consulter le budget de compétence » ;
- **Alors** budget détaillé avec bonus et réorientations.

**US-HER-013-CA02 — Refus ou exception**

- **Étant donné** budget négatif de configuration ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** anomalie visible, achat refusé.

**US-HER-013-CA03 — Cas frontière**

- **Étant donné** niveau 18, trois carrières ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** 15 points restants sans bonus.

**US-HER-013-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-HER-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier bonus héréditaires autorisés. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier ma spécialisation. |
| E | Qualifier U25 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **budget détaillé avec bonus et réorientations**.
- [ ] Le cas frontière est vérifié : **niveau 18, trois carrières → 15 points restants sans bonus**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-014"></a>
## US-HER-014 — Réorienter un héros

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite changer une spécialisation selon les règles afin de adapter ma stratégie.

### 2. Conversation — règles et décisions

- **Préconditions :** réorientation admissible et conséquences affichées.
- **Règles / traces :** G07 et CODE-02-HEROS.
- **Question à traiter :** Qualifier durée, coût et sort des talents communs.
- **Incertitudes liées :** `U25` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-013](07-HER.md#us-her-013).
- **Exigences :** `REQ-HERO-02`, `REQ-HERO-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-014-CA01 — Parcours nominal**

- **Étant donné** réorientation admissible et conséquences affichées ;
- **Quand** je réalise le parcours « Réorienter un héros » ;
- **Alors** délai et perte de points appliqués.

**US-HER-014-CA02 — Refus ou exception**

- **Étant donné** héros indisponible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** réorientation refusée.

**US-HER-014-CA03 — Cas frontière**

- **Étant donné** une réorientation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** −2 points dans la référence outil.

**US-HER-014-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-013. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier durée, coût et sort des talents communs. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter ma stratégie. |
| E | Qualifier U25 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **délai et perte de points appliqués**.
- [ ] Le cas frontière est vérifié : **une réorientation → −2 points dans la référence outil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-015"></a>
## US-HER-015 — Suivre une formation

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir quand un talent devient actif afin de préparer mes prochaines missions.

### 2. Conversation — règles et décisions

- **Préconditions :** un apprentissage est engagé.
- **Règles / traces :** G07, apprentissage décrit à trois heures.
- **Question à traiter :** Qualifier exceptions et simultanéités.
- **Incertitudes liées :** `U25` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-011](07-HER.md#us-her-011).
- **Exigences :** `REQ-HERO-02`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-015-CA01 — Parcours nominal**

- **Étant donné** un apprentissage est engagé ;
- **Quand** je réalise le parcours « Suivre une formation » ;
- **Alors** échéance et effet futur distingués.

**US-HER-015-CA02 — Refus ou exception**

- **Étant donné** formation inachevée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** bonus non utilisé trop tôt.

**US-HER-015-CA03 — Cas frontière**

- **Étant donné** connexion après échéance ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** talent retrouvé actif.

**US-HER-015-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-HER-015-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-011. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier exceptions et simultanéités. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer mes prochaines missions. |
| E | Qualifier U25 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **échéance et effet futur distingués**.
- [ ] Le cas frontière est vérifié : **connexion après échéance → talent retrouvé actif**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-016"></a>
## US-HER-016 — Affecter un héros à une activité

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite choisir un exécutant libre afin de répartir développement et missions.

### 2. Conversation — règles et décisions

- **Préconditions :** plusieurs héros disponibles.
- **Règles / traces :** Héros agents de développement.
- **Question à traiter :** Qualifier activités compatibles et bonus passifs.
- **Incertitudes liées :** `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-HERO-02`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-016-CA01 — Parcours nominal**

- **Étant donné** plusieurs héros disponibles ;
- **Quand** je réalise le parcours « Affecter un héros à une activité » ;
- **Alors** activité acceptée réserve le bon héros.

**US-HER-016-CA02 — Refus ou exception**

- **Étant donné** ordre concurrent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** héros non engagé deux fois.

**US-HER-016-CA03 — Cas frontière**

- **Étant donné** activité terminée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** disponibilité rétablie.

**US-HER-016-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-016-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier activités compatibles et bonus passifs. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : répartir développement et missions. |
| E | Qualifier U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **activité acceptée réserve le bon héros**.
- [ ] Le cas frontière est vérifié : **activité terminée → disponibilité rétablie**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-017"></a>
## US-HER-017 — Attendre la guérison

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter l’indisponibilité d’un héros blessé afin de planifier son retour.

### 2. Conversation — règles et décisions

- **Préconditions :** une bataille ou reconnaissance a blessé le héros.
- **Règles / traces :** Admission PvP et G15.
- **Question à traiter :** Qualifier durées par cause et soins éventuels.
- **Incertitudes liées :** `U12`, `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-HERO-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-HER-017-CA01 — Parcours nominal**

- **Étant donné** une bataille ou reconnaissance a blessé le héros ;
- **Quand** je réalise le parcours « Attendre la guérison » ;
- **Alors** cause et fin de blessure visibles.

**US-HER-017-CA02 — Refus ou exception**

- **Étant donné** héros blessé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** mission interdite selon profil.

**US-HER-017-CA03 — Cas frontière**

- **Étant donné** échéance atteinte ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** disponibilité rétablie une fois.

**US-HER-017-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-HER-017-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier durées par cause et soins éventuels. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier son retour. |
| E | Qualifier U12, U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **cause et fin de blessure visibles**.
- [ ] Le cas frontière est vérifié : **échéance atteinte → disponibilité rétablie une fois**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-her-018"></a>
## US-HER-018 — Libérer un héros d’une mission terminée

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver son état final et ses biens afin de le réemployer sans perte.

### 2. Conversation — règles et décisions

- **Préconditions :** mission résolue ou retour arrivé.
- **Règles / traces :** Contrat de fin de mission proposé.
- **Question à traiter :** Qualifier lieu de retour selon résultat.
- **Incertitudes liées :** `U09`, `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-016](07-HER.md#us-her-016).
- **Exigences :** `REQ-HERO-02`, `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/03-HEROS-ARMEES-MAGIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-HER-018-CA01 — Parcours nominal**

- **Étant donné** mission résolue ou retour arrivé ;
- **Quand** je réalise le parcours « Libérer un héros d’une mission terminée » ;
- **Alors** position, troupes, objets et disponibilité concordent.

**US-HER-018-CA02 — Refus ou exception**

- **Étant donné** mission encore active ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** héros non téléporté.

**US-HER-018-CA03 — Cas frontière**

- **Étant donné** résolution répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune troupe dupliquée.

**US-HER-018-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-HER-018-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-016. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier lieu de retour selon résultat. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : le réemployer sans perte. |
| E | Qualifier U09, U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **position, troupes, objets et disponibilité concordent**.
- [ ] Le cas frontière est vérifié : **résolution répétée → aucune troupe dupliquée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

