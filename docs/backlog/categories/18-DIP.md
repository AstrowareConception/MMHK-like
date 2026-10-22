# 18. Diplomatie et coordination

8 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-DIP-001 — Consulter nos relations](#us-dip-001)
- [US-DIP-002 — Proposer un accord](#us-dip-002)
- [US-DIP-003 — Accepter un accord](#us-dip-003)
- [US-DIP-004 — Rompre un accord](#us-dip-004)
- [US-DIP-005 — Respecter un passage accordé](#us-dip-005)
- [US-DIP-006 — Partager une cible](#us-dip-006)
- [US-DIP-007 — Organiser une échéance commune](#us-dip-007)
- [US-DIP-008 — Être informé d’un changement diplomatique](#us-dip-008)

<a id="us-dip-001"></a>
## US-DIP-001 — Consulter nos relations

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que membre d’alliance, je souhaite voir les accords avec les autres alliances afin de éviter les erreurs diplomatiques.

### 2. Conversation — règles et décisions

- **Préconditions :** des alliances sont identifiées.
- **Règles / traces :** G09, droit de passage documenté.
- **Question à traiter :** Qualifier types de relations disponibles.
- **Incertitudes liées :** `U32` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-001](17-ALL.md#us-all-001).
- **Exigences :** `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-DIP-001-CA01 — Parcours nominal**

- **Étant donné** des alliances sont identifiées ;
- **Quand** je réalise le parcours « Consulter nos relations » ;
- **Alors** relations, portée et dates d’effet visibles.

**US-DIP-001-CA02 — Refus ou exception**

- **Étant donné** absence de pacte ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’amitié supposée.

**US-DIP-001-CA03 — Cas frontière**

- **Étant donné** relation future ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** distincte de la relation active.

**US-DIP-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-DIP-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier types de relations disponibles. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter les erreurs diplomatiques. |
| E | Qualifier U32 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **relations, portée et dates d’effet visibles**.
- [ ] Le cas frontière est vérifié : **relation future → distincte de la relation active**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-dip-002"></a>
## US-DIP-002 — Proposer un accord

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que diplomate autorisé, je souhaite soumettre une relation autorisée afin de organiser notre voisinage.

### 2. Conversation — règles et décisions

- **Préconditions :** permission diplomatique et cible valide.
- **Règles / traces :** Diplomatie détaillée incomplète.
- **Question à traiter :** Qualifier pactes, conditions et délais.
- **Incertitudes liées :** `U32` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-DIP-001](18-DIP.md#us-dip-001).
- **Exigences :** `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-DIP-002-CA01 — Parcours nominal**

- **Étant donné** permission diplomatique et cible valide ;
- **Quand** je réalise le parcours « Proposer un accord » ;
- **Alors** proposition en attente sans effet prématuré.

**US-DIP-002-CA02 — Refus ou exception**

- **Étant donné** type non qualifié ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** accord non disponible.

**US-DIP-002-CA03 — Cas frontière**

- **Étant donné** proposition retirée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** acceptation ultérieure impossible.

**US-DIP-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-DIP-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-DIP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier pactes, conditions et délais. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : organiser notre voisinage. |
| E | Qualifier U32 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **proposition en attente sans effet prématuré**.
- [ ] Le cas frontière est vérifié : **proposition retirée → acceptation ultérieure impossible**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-dip-003"></a>
## US-DIP-003 — Accepter un accord

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que diplomate autorisé, je souhaite valider une proposition diplomatique afin de bénéficier de ses droits réciproques.

### 2. Conversation — règles et décisions

- **Préconditions :** proposition encore valide.
- **Règles / traces :** Contrat proposé de diplomatie.
- **Question à traiter :** Qualifier réciprocité et prise d’effet.
- **Incertitudes liées :** `U32` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-DIP-002](18-DIP.md#us-dip-002).
- **Exigences :** `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-DIP-003-CA01 — Parcours nominal**

- **Étant donné** proposition encore valide ;
- **Quand** je réalise le parcours « Accepter un accord » ;
- **Alors** relation active à la date prévue.

**US-DIP-003-CA02 — Refus ou exception**

- **Étant donné** proposition expirée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun pacte.

**US-DIP-003-CA03 — Cas frontière**

- **Étant donné** double acceptation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une relation.

**US-DIP-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-DIP-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-DIP-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier réciprocité et prise d’effet. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : bénéficier de ses droits réciproques. |
| E | Qualifier U32 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **relation active à la date prévue**.
- [ ] Le cas frontière est vérifié : **double acceptation → une relation**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-dip-004"></a>
## US-DIP-004 — Rompre un accord

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que diplomate autorisé, je souhaite mettre fin à une relation afin de adapter notre stratégie.

### 2. Conversation — règles et décisions

- **Préconditions :** rupture autorisée.
- **Règles / traces :** G09, rupture non décrite complètement.
- **Question à traiter :** Retrouver préavis et effets sur missions.
- **Incertitudes liées :** `U32`, `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-DIP-003](18-DIP.md#us-dip-003).
- **Exigences :** `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-DIP-004-CA01 — Parcours nominal**

- **Étant donné** rupture autorisée ;
- **Quand** je réalise le parcours « Rompre un accord » ;
- **Alors** fin d’effet et éventuel préavis visibles.

**US-DIP-004-CA02 — Refus ou exception**

- **Étant donné** acteur sans permission ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** relation inchangée.

**US-DIP-004-CA03 — Cas frontière**

- **Étant donné** armées en route ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** politique explicitement appliquée.

**US-DIP-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-DIP-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-DIP-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver préavis et effets sur missions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter notre stratégie. |
| E | Qualifier U32, U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **fin d’effet et éventuel préavis visibles**.
- [ ] Le cas frontière est vérifié : **armées en route → politique explicitement appliquée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-dip-005"></a>
## US-DIP-005 — Respecter un passage accordé

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite bénéficier du passage sans acte hostile interdit afin de traverser un territoire partenaire.

### 2. Conversation — règles et décisions

- **Préconditions :** accord de passage actif.
- **Règles / traces :** G09.
- **Question à traiter :** Qualifier actions couvertes et retour des armées.
- **Incertitudes liées :** `U32` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-DIP-003](18-DIP.md#us-dip-003).
- **Exigences :** `REQ-ALLY-02`, `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-DIP-005-CA01 — Parcours nominal**

- **Étant donné** accord de passage actif ;
- **Quand** je réalise le parcours « Respecter un passage accordé » ;
- **Alors** déplacement autorisé et actes interdits bloqués.

**US-DIP-005-CA02 — Refus ou exception**

- **Étant donné** pillage interdit par accord ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** commande refusée.

**US-DIP-005-CA03 — Cas frontière**

- **Étant donné** passage ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune fusion d’alliances.

**US-DIP-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-DIP-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-DIP-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier actions couvertes et retour des armées. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : traverser un territoire partenaire. |
| E | Qualifier U32 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **déplacement autorisé et actes interdits bloqués**.
- [ ] Le cas frontière est vérifié : **passage → aucune fusion d’alliances**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-dip-006"></a>
## US-DIP-006 — Partager une cible

**Priorité proposée :** P2 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que membre d’alliance, je souhaite communiquer des coordonnées à mon alliance afin de coordonner une opération.

### 2. Conversation — règles et décisions

- **Préconditions :** outil de partage et droits disponibles.
- **Règles / traces :** Coordination proposée, SS-040 alerte.
- **Question à traiter :** Définir repère privé et partagé.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-004](12-MON.md#us-mon-004), [US-ALL-003](17-ALL.md#us-all-003).
- **Exigences :** `REQ-ALLY-02`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-DIP-006-CA01 — Parcours nominal**

- **Étant donné** outil de partage et droits disponibles ;
- **Quand** je réalise le parcours « Partager une cible » ;
- **Alors** lien ouvre la même cible dans le bon monde.

**US-DIP-006-CA02 — Refus ou exception**

- **Étant donné** information secrète non partageable ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non jointe.

**US-DIP-006-CA03 — Cas frontière**

- **Étant donné** cible déplacée ou perdue ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** état actuel distingué du message.

**US-DIP-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-DIP-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-004, US-ALL-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir repère privé et partagé. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : coordonner une opération. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **lien ouvre la même cible dans le bon monde**.
- [ ] Le cas frontière est vérifié : **cible déplacée ou perdue → état actuel distingué du message**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-dip-007"></a>
## US-DIP-007 — Organiser une échéance commune

**Priorité proposée :** P2 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que officier d’alliance, je souhaite annoncer une cible et un horaire aux membres autorisés afin de synchroniser nos décisions militaires.

### 2. Conversation — règles et décisions

- **Préconditions :** coordination activée.
- **Règles / traces :** Fonction proposée pour le successeur.
- **Question à traiter :** Qualifier besoin et visibilité du plan.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-DIP-006](18-DIP.md#us-dip-006).
- **Exigences :** `REQ-ALLY-02`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-DIP-007-CA01 — Parcours nominal**

- **Étant donné** coordination activée ;
- **Quand** je réalise le parcours « Organiser une échéance commune » ;
- **Alors** horaire et fuseau non ambigus, participants identifiés.

**US-DIP-007-CA02 — Refus ou exception**

- **Étant donné** simple annonce ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun ordre lancé au nom des autres.

**US-DIP-007-CA03 — Cas frontière**

- **Étant donné** horaire révisé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** version précédente identifiable.

**US-DIP-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-DIP-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-DIP-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier besoin et visibilité du plan. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : synchroniser nos décisions militaires. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **horaire et fuseau non ambigus, participants identifiés**.
- [ ] Le cas frontière est vérifié : **horaire révisé → version précédente identifiable**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-dip-008"></a>
## US-DIP-008 — Être informé d’un changement diplomatique

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que membre d’alliance, je souhaite recevoir l’effet d’un accord ou d’une rupture afin de réévaluer mes missions.

### 2. Conversation — règles et décisions

- **Préconditions :** relation me concernant modifiée.
- **Règles / traces :** Contrat de communication proposé.
- **Question à traiter :** Qualifier destinataires et impact sur ordres.
- **Incertitudes liées :** `U32`, `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-DIP-001](18-DIP.md#us-dip-001).
- **Exigences :** `REQ-ALLY-02`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-DIP-008-CA01 — Parcours nominal**

- **Étant donné** relation me concernant modifiée ;
- **Quand** je réalise le parcours « Être informé d’un changement diplomatique » ;
- **Alors** date et conséquences connues notifiées.

**US-DIP-008-CA02 — Refus ou exception**

- **Étant donné** non membre ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de détail privé de négociation.

**US-DIP-008-CA03 — Cas frontière**

- **Étant donné** ordre déjà engagé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** son statut réel précisé.

**US-DIP-008-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-DIP-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-DIP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier destinataires et impact sur ordres. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réévaluer mes missions. |
| E | Qualifier U32, U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **date et conséquences connues notifiées**.
- [ ] Le cas frontière est vérifié : **ordre déjà engagé → son statut réel précisé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

