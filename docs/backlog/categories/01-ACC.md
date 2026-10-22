# 1. Accueil, early game et quêtes

12 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-ACC-001 — Comparer les mondes](#us-acc-001)
- [US-ACC-002 — Choisir ma faction](#us-acc-002)
- [US-ACC-003 — Créer mon royaume](#us-acc-003)
- [US-ACC-004 — Retrouver ma cité initiale](#us-acc-004)
- [US-ACC-005 — Comprendre les trois vues](#us-acc-005)
- [US-ACC-006 — Consulter mes quêtes](#us-acc-006)
- [US-ACC-007 — Apprendre les contre-armes](#us-acc-007)
- [US-ACC-008 — Apprendre la composition](#us-acc-008)
- [US-ACC-009 — Apprendre la magie](#us-acc-009)
- [US-ACC-010 — Recevoir une récompense initiale](#us-acc-010)
- [US-ACC-011 — Connaître ma protection initiale](#us-acc-011)
- [US-ACC-012 — Comprendre une quête inaccessible](#us-acc-012)

<a id="us-acc-001"></a>
## US-ACC-001 — Comparer les mondes

**Priorité proposée :** P0 · **Phases :** Early game · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que nouveau joueur, je souhaite consulter les mondes et leurs règles afin de choisir ma campagne.

### 2. Conversation — règles et décisions

- **Préconditions :** plusieurs mondes existent.
- **Règles / traces :** DEC-001 ; paramètres par monde.
- **Question à traiter :** Qualifier capacité et champs publics.
- **Incertitudes liées :** `U01` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** aucune déclarée.
- **Exigences :** `REQ-WORLD-01`, `REQ-PROFILE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ACC-001-CA01 — Parcours nominal**

- **Étant donné** plusieurs mondes existent ;
- **Quand** je réalise le parcours « Comparer les mondes » ;
- **Alors** mode, phase, vitesse et trêve sont distingués.

**US-ACC-001-CA02 — Refus ou exception**

- **Étant donné** monde clos ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** inscription désactivée avec motif.

**US-ACC-001-CA03 — Cas frontière**

- **Étant donné** monde classique ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** Guerre des Larmes annoncée.

**US-ACC-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ACC-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Pas de dépendance fonctionnelle déclarée ; vérifier l’autonomie pendant l’affinage. |
| N | Qualifier capacité et champs publics. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir ma campagne. |
| E | Qualifier U01 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **mode, phase, vitesse et trêve sont distingués**.
- [ ] Le cas frontière est vérifié : **monde classique → Guerre des Larmes annoncée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-002"></a>
## US-ACC-002 — Choisir ma faction

**Priorité proposée :** P0 · **Phases :** Early game · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que nouveau joueur, je souhaite comparer les factions autorisées afin de adopter une stratégie de départ.

### 2. Conversation — règles et décisions

- **Préconditions :** un monde accepte les inscriptions.
- **Règles / traces :** CODE-01-DATA, cinq factions étudiées.
- **Question à traiter :** Qualifier disponibilité de chaque faction.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-001](01-ACC.md#us-acc-001).
- **Exigences :** `REQ-DATA-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-002-CA01 — Parcours nominal**

- **Étant donné** un monde accepte les inscriptions ;
- **Quand** je réalise le parcours « Choisir ma faction » ;
- **Alors** lignées T1–T7 et écoles sont comparables.

**US-ACC-002-CA02 — Refus ou exception**

- **Étant donné** faction hors profil ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** choix refusé.

**US-ACC-002-CA03 — Cas frontière**

- **Étant donné** Donjon au catalogue ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** non sélectionnable sans règle.

**US-ACC-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ACC-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier disponibilité de chaque faction. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adopter une stratégie de départ. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **lignées T1–T7 et écoles sont comparables**.
- [ ] Le cas frontière est vérifié : **Donjon au catalogue → non sélectionnable sans règle**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-003"></a>
## US-ACC-003 — Créer mon royaume

**Priorité proposée :** P0 · **Phases :** Early game · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que nouveau joueur, je souhaite rejoindre un monde avec ma faction afin de commencer une campagne persistante.

### 2. Conversation — règles et décisions

- **Préconditions :** monde ouvert et faction autorisée.
- **Règles / traces :** Installation selon profil, cohérence PROP.
- **Question à traiter :** Fixer placement et unicité de participation.
- **Incertitudes liées :** `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-002](01-ACC.md#us-acc-002).
- **Exigences :** `REQ-WORLD-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ACC-003-CA01 — Parcours nominal**

- **Étant donné** monde ouvert et faction autorisée ;
- **Quand** je réalise le parcours « Créer mon royaume » ;
- **Alors** un royaume reçoit son emplacement initial.

**US-ACC-003-CA02 — Refus ou exception**

- **Étant donné** monde rempli entre-temps ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune création partielle.

**US-ACC-003-CA03 — Cas frontière**

- **Étant donné** double confirmation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une inscription.

**US-ACC-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ACC-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer placement et unicité de participation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : commencer une campagne persistante. |
| E | Qualifier U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **un royaume reçoit son emplacement initial**.
- [ ] Le cas frontière est vérifié : **double confirmation → une inscription**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-004"></a>
## US-ACC-004 — Retrouver ma cité initiale

**Priorité proposée :** P0 · **Phases :** Early game · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite ouvrir ma première cité et sa région afin de identifier mes moyens de départ.

### 2. Conversation — règles et décisions

- **Préconditions :** mon inscription est terminée.
- **Règles / traces :** Grille 5×5, dotations incomplètes.
- **Question à traiter :** Qualifier dotations et états initiaux.
- **Incertitudes liées :** `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-003](01-ACC.md#us-acc-003).
- **Exigences :** `REQ-AUTH-01`, `REQ-WORLD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-004-CA01 — Parcours nominal**

- **Étant donné** mon inscription est terminée ;
- **Quand** je réalise le parcours « Retrouver ma cité initiale » ;
- **Alors** cité, héros, stocks et 25 cases correspondent au royaume.

**US-ACC-004-CA02 — Refus ou exception**

- **Étant donné** cité adverse ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** gestion privée interdite.

**US-ACC-004-CA03 — Cas frontière**

- **Étant donné** reconnexion ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** dotations inchangées hors progression réelle.

**US-ACC-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ACC-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier dotations et états initiaux. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : identifier mes moyens de départ. |
| E | Qualifier U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **cité, héros, stocks et 25 cases correspondent au royaume**.
- [ ] Le cas frontière est vérifié : **reconnexion → dotations inchangées hors progression réelle**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-005"></a>
## US-ACC-005 — Comprendre les trois vues

**Priorité proposée :** P1 · **Phases :** Early game · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que nouveau joueur, je souhaite parcourir monde, région et ville avec une aide afin de m’orienter dans le jeu.

### 2. Conversation — règles et décisions

- **Préconditions :** ma première cité existe.
- **Règles / traces :** Parcours guidé proposé, vues attestées.
- **Question à traiter :** Définir un accompagnement sans prérequis artificiels.
- **Incertitudes liées :** `U38` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-UI-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ACC-005-CA01 — Parcours nominal**

- **Étant donné** ma première cité existe ;
- **Quand** je réalise le parcours « Comprendre les trois vues » ;
- **Alors** chaque vue explique son rôle et permet le retour.

**US-ACC-005-CA02 — Refus ou exception**

- **Étant donné** aide fermée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** navigation toujours disponible.

**US-ACC-005-CA03 — Cas frontière**

- **Étant donné** étape répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun gain ajouté.

**US-ACC-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ACC-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir un accompagnement sans prérequis artificiels. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : m’orienter dans le jeu. |
| E | Qualifier U38 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **chaque vue explique son rôle et permet le retour**.
- [ ] Le cas frontière est vérifié : **étape répétée → aucun gain ajouté**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-006"></a>
## US-ACC-006 — Consulter mes quêtes

**Priorité proposée :** P1 · **Phases :** Early game · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite lire objectifs et prérequis du tutoriel afin de organiser mes premières actions.

### 2. Conversation — règles et décisions

- **Préconditions :** des quêtes du profil sont ouvertes.
- **Règles / traces :** G22 et SS-036/044.
- **Question à traiter :** Retrouver les chaînes et seuils manquants.
- **Incertitudes liées :** `U38` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-PVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-006-CA01 — Parcours nominal**

- **Étant donné** des quêtes du profil sont ouvertes ;
- **Quand** je réalise le parcours « Consulter mes quêtes » ;
- **Alors** objectif, progression et récompense sont distingués.

**US-ACC-006-CA02 — Refus ou exception**

- **Étant donné** quête verrouillée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** validation impossible.

**US-ACC-006-CA03 — Cas frontière**

- **Étant donné** titre Cité assiégée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun siège PvP créé.

**US-ACC-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ACC-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver les chaînes et seuils manquants. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : organiser mes premières actions. |
| E | Qualifier U38 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **objectif, progression et récompense sont distingués**.
- [ ] Le cas frontière est vérifié : **titre Cité assiégée → aucun siège PvP créé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-007"></a>
## US-ACC-007 — Apprendre les contre-armes

**Priorité proposée :** P1 · **Phases :** Early game · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite faire reconnaître un combat avec avantage d’arme afin de apprendre à choisir mes unités.

### 2. Conversation — règles et décisions

- **Préconditions :** la quête correspondante est active.
- **Règles / traces :** G22 et triangle I/C/R.
- **Question à traiter :** Qualifier le prédicat exact de la quête.
- **Incertitudes liées :** `U38` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-006](01-ACC.md#us-acc-006), [US-COM-004](11-COM.md#us-com-004).
- **Exigences :** `REQ-PVE-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-007-CA01 — Parcours nominal**

- **Étant donné** la quête correspondante est active ;
- **Quand** je réalise le parcours « Apprendre les contre-armes » ;
- **Alors** un rapport admissible fait progresser l’objectif.

**US-ACC-007-CA02 — Refus ou exception**

- **Étant donné** contre-arme absente ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** quête inchangée.

**US-ACC-007-CA03 — Cas frontière**

- **Étant donné** rapport relu ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun progrès supplémentaire.

**US-ACC-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ACC-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-006, US-COM-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier le prédicat exact de la quête. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : apprendre à choisir mes unités. |
| E | Qualifier U38 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **un rapport admissible fait progresser l’objectif**.
- [ ] Le cas frontière est vérifié : **rapport relu → aucun progrès supplémentaire**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-008"></a>
## US-ACC-008 — Apprendre la composition

**Priorité proposée :** P1 · **Phases :** Early game · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite faire reconnaître une bataille à plusieurs pelotons afin de maîtriser la préparation militaire.

### 2. Conversation — règles et décisions

- **Préconditions :** une quête de composition est ouverte.
- **Règles / traces :** G22, validation sur combat réel.
- **Question à traiter :** Qualifier nombre et diversité requis.
- **Incertitudes liées :** `U38` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-006](01-ACC.md#us-acc-006), [US-ARM-009](09-ARM.md#us-arm-009).
- **Exigences :** `REQ-PVE-01`, `REQ-ARMY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-008-CA01 — Parcours nominal**

- **Étant donné** une quête de composition est ouverte ;
- **Quand** je réalise le parcours « Apprendre la composition » ;
- **Alors** seuls les pelotons engagés comptent.

**US-ACC-008-CA02 — Refus ou exception**

- **Étant donné** effectif nul ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** peloton non compté.

**US-ACC-008-CA03 — Cas frontière**

- **Étant donné** mêmes unités sur deux lignes ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** règle de diversité appliquée.

**US-ACC-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ACC-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-006, US-ARM-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier nombre et diversité requis. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : maîtriser la préparation militaire. |
| E | Qualifier U38 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **seuls les pelotons engagés comptent**.
- [ ] Le cas frontière est vérifié : **mêmes unités sur deux lignes → règle de diversité appliquée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-009"></a>
## US-ACC-009 — Apprendre la magie

**Priorité proposée :** P1 · **Phases :** Early game · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite faire reconnaître un sort lancé en combat afin de découvrir son usage tactique.

### 2. Conversation — règles et décisions

- **Préconditions :** une quête de magie est active.
- **Règles / traces :** G22, intention distincte du résultat.
- **Question à traiter :** Qualifier sort, cible et succès attendus.
- **Incertitudes liées :** `U38` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-006](01-ACC.md#us-acc-006), [US-MAG-004](08-MAG.md#us-mag-004).
- **Exigences :** `REQ-PVE-01`, `REQ-MAGIC-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-009-CA01 — Parcours nominal**

- **Étant donné** une quête de magie est active ;
- **Quand** je réalise le parcours « Apprendre la magie » ;
- **Alors** le sort effectivement résolu satisfait son objectif.

**US-ACC-009-CA02 — Refus ou exception**

- **Étant donné** sort seulement préparé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** quête inchangée.

**US-ACC-009-CA03 — Cas frontière**

- **Étant donné** combat fini avant son tour ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** sort non lancé.

**US-ACC-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ACC-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-006, US-MAG-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier sort, cible et succès attendus. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : découvrir son usage tactique. |
| E | Qualifier U38 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **le sort effectivement résolu satisfait son objectif**.
- [ ] Le cas frontière est vérifié : **combat fini avant son tour → sort non lancé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-010"></a>
## US-ACC-010 — Recevoir une récompense initiale

**Priorité proposée :** P1 · **Phases :** Early game · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir le gain d’une quête terminée afin de poursuivre mon développement.

### 2. Conversation — règles et décisions

- **Préconditions :** objectif validé et gain non reçu.
- **Règles / traces :** G22 ; récompenses versionnées.
- **Question à traiter :** Fixer attribution automatique ou réclamation.
- **Incertitudes liées :** `U38`, `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-006](01-ACC.md#us-acc-006).
- **Exigences :** `REQ-PVE-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-010-CA01 — Parcours nominal**

- **Étant donné** objectif validé et gain non reçu ;
- **Quand** je réalise le parcours « Recevoir une récompense initiale » ;
- **Alors** le contenu prévu est attribué une fois.

**US-ACC-010-CA02 — Refus ou exception**

- **Étant donné** objectif incomplet ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** gain refusé.

**US-ACC-010-CA03 — Cas frontière**

- **Étant donné** stock plein ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** excédent traité explicitement.

**US-ACC-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ACC-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer attribution automatique ou réclamation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : poursuivre mon développement. |
| E | Qualifier U38, U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **le contenu prévu est attribué une fois**.
- [ ] Le cas frontière est vérifié : **stock plein → excédent traité explicitement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-011"></a>
## US-ACC-011 — Connaître ma protection initiale

**Priorité proposée :** P0 · **Phases :** Early game · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter ma protection et ses limites afin de préparer mon entrée en guerre.

### 2. Conversation — règles et décisions

- **Préconditions :** le profil prévoit une protection débutant.
- **Règles / traces :** G10, protection partiellement documentée.
- **Question à traiter :** Qualifier durée, rupture et portée.
- **Incertitudes liées :** `U20` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-011-CA01 — Parcours nominal**

- **Étant donné** le profil prévoit une protection débutant ;
- **Quand** je réalise le parcours « Connaître ma protection initiale » ;
- **Alors** échéance et actions protégées sont expliquées.

**US-ACC-011-CA02 — Refus ou exception**

- **Étant donné** profil sans protection ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune immunité promise.

**US-ACC-011-CA03 — Cas frontière**

- **Étant donné** expiration pendant consultation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** droits actualisés.

**US-ACC-011-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ACC-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier durée, rupture et portée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer mon entrée en guerre. |
| E | Qualifier U20 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **échéance et actions protégées sont expliquées**.
- [ ] Le cas frontière est vérifié : **expiration pendant consultation → droits actualisés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-acc-012"></a>
## US-ACC-012 — Comprendre une quête inaccessible

**Priorité proposée :** P2 · **Phases :** Early game · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite identifier une impasse du tutoriel afin de éviter des tentatives inutiles.

### 2. Conversation — règles et décisions

- **Préconditions :** les rencontres utiles sont déjà consommées.
- **Règles / traces :** Risque signalé par G22.
- **Question à traiter :** Décider fidélité stricte ou assistance du successeur.
- **Incertitudes liées :** `U38` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-006](01-ACC.md#us-acc-006).
- **Exigences :** `REQ-PVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ACC-012-CA01 — Parcours nominal**

- **Étant donné** les rencontres utiles sont déjà consommées ;
- **Quand** je réalise le parcours « Comprendre une quête inaccessible » ;
- **Alors** cause et objectif restant sont explicités.

**US-ACC-012-CA02 — Refus ou exception**

- **Étant donné** rattrapage non prévu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune rencontre inventée.

**US-ACC-012-CA03 — Cas frontière**

- **Étant donné** exercice en mode test ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** écart annoncé.

**US-ACC-012-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ACC-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Décider fidélité stricte ou assistance du successeur. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter des tentatives inutiles. |
| E | Qualifier U38 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **cause et objectif restant sont explicités**.
- [ ] Le cas frontière est vérifié : **exercice en mode test → écart annoncé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

