# 17. Alliances, membres et compétences

14 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-ALL-001 — Créer une alliance](#us-all-001)
- [US-ALL-002 — Inviter un joueur](#us-all-002)
- [US-ALL-003 — Accepter une invitation](#us-all-003)
- [US-ALL-004 — Révoquer une invitation](#us-all-004)
- [US-ALL-005 — Quitter une alliance](#us-all-005)
- [US-ALL-006 — Exclure un membre](#us-all-006)
- [US-ALL-007 — Consulter les membres](#us-all-007)
- [US-ALL-008 — Attribuer un rôle](#us-all-008)
- [US-ALL-009 — Consulter selon mon rôle](#us-all-009)
- [US-ALL-010 — Transmettre la direction](#us-all-010)
- [US-ALL-011 — Consulter la progression collective](#us-all-011)
- [US-ALL-012 — Choisir une compétence collective](#us-all-012)
- [US-ALL-013 — Activer une compétence d’alliance](#us-all-013)
- [US-ALL-014 — Remplacer un chef inactif](#us-all-014)

<a id="us-all-001"></a>
## US-ALL-001 — Créer une alliance

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite fonder un groupe de joueurs afin de organiser une stratégie collective.

### 2. Conversation — règles et décisions

- **Préconditions :** création autorisée dans le monde.
- **Règles / traces :** G09 ; création détaillée à qualifier.
- **Question à traiter :** Fixer coût, nom et conditions d’ouverture.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-ALLY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-001-CA01 — Parcours nominal**

- **Étant donné** création autorisée dans le monde ;
- **Quand** je réalise le parcours « Créer une alliance » ;
- **Alors** alliance et premier responsable établis.

**US-ALL-001-CA02 — Refus ou exception**

- **Étant donné** joueur déjà membre ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** règle d’appartenance respectée.

**US-ALL-001-CA03 — Cas frontière**

- **Étant donné** création répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de groupe dupliqué.

**US-ALL-001-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer coût, nom et conditions d’ouverture. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : organiser une stratégie collective. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **alliance et premier responsable établis**.
- [ ] Le cas frontière est vérifié : **création répétée → pas de groupe dupliqué**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-002"></a>
## US-ALL-002 — Inviter un joueur

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que officier autorisé, je souhaite proposer une place dans mon alliance afin de renforcer notre collectif.

### 2. Conversation — règles et décisions

- **Préconditions :** permission et capacité disponibles.
- **Règles / traces :** G09, capacité variable.
- **Question à traiter :** Qualifier expiration et réservation de places.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-001](17-ALL.md#us-all-001).
- **Exigences :** `REQ-ALLY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-002-CA01 — Parcours nominal**

- **Étant donné** permission et capacité disponibles ;
- **Quand** je réalise le parcours « Inviter un joueur » ;
- **Alors** invitation adressée au bon royaume et monde.

**US-ALL-002-CA02 — Refus ou exception**

- **Étant donné** capacité atteinte ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** invitation ou admission refusée selon règle.

**US-ALL-002-CA03 — Cas frontière**

- **Étant donné** invitation répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de doublon actif.

**US-ALL-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier expiration et réservation de places. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : renforcer notre collectif. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **invitation adressée au bon royaume et monde**.
- [ ] Le cas frontière est vérifié : **invitation répétée → pas de doublon actif**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-003"></a>
## US-ALL-003 — Accepter une invitation

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite rejoindre une alliance proposée afin de participer à ses activités.

### 2. Conversation — règles et décisions

- **Préconditions :** invitation valide et joueur admissible.
- **Règles / traces :** G09.
- **Question à traiter :** Qualifier unicité d’alliance et délais de changement.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-002](17-ALL.md#us-all-002).
- **Exigences :** `REQ-ALLY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-003-CA01 — Parcours nominal**

- **Étant donné** invitation valide et joueur admissible ;
- **Quand** je réalise le parcours « Accepter une invitation » ;
- **Alors** appartenance créée avec rôle initial.

**US-ALL-003-CA02 — Refus ou exception**

- **Étant donné** invitation révoquée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** adhésion refusée.

**US-ALL-003-CA03 — Cas frontière**

- **Étant donné** dernière place prise ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de dépassement.

**US-ALL-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier unicité d’alliance et délais de changement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : participer à ses activités. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **appartenance créée avec rôle initial**.
- [ ] Le cas frontière est vérifié : **dernière place prise → pas de dépassement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-004"></a>
## US-ALL-004 — Révoquer une invitation

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que officier autorisé, je souhaite retirer une proposition encore ouverte afin de contrôler nos recrutements.

### 2. Conversation — règles et décisions

- **Préconditions :** invitation administrable et non acceptée.
- **Règles / traces :** Administration proposée à qualifier.
- **Question à traiter :** Fixer droits et ordre d’acceptation/révocation.
- **Incertitudes liées :** `U31`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-002](17-ALL.md#us-all-002).
- **Exigences :** `REQ-ALLY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ALL-004-CA01 — Parcours nominal**

- **Étant donné** invitation administrable et non acceptée ;
- **Quand** je réalise le parcours « Révoquer une invitation » ;
- **Alors** proposition rendue inutilisable.

**US-ALL-004-CA02 — Refus ou exception**

- **Étant donné** invitation déjà acceptée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’exclusion implicite.

**US-ALL-004-CA03 — Cas frontière**

- **Étant donné** acceptation concurrente ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** résultat unique.

**US-ALL-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer droits et ordre d’acceptation/révocation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : contrôler nos recrutements. |
| E | Qualifier U31, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **proposition rendue inutilisable**.
- [ ] Le cas frontière est vérifié : **acceptation concurrente → résultat unique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-005"></a>
## US-ALL-005 — Quitter une alliance

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que membre d’alliance, je souhaite mettre fin à mon appartenance afin de changer de stratégie collective.

### 2. Conversation — règles et décisions

- **Préconditions :** départ autorisé et conséquences affichées.
- **Règles / traces :** G09/G01, contribution historique distincte.
- **Question à traiter :** Qualifier délais et devenir des monuments.
- **Incertitudes liées :** `U31`, `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-003](17-ALL.md#us-all-003).
- **Exigences :** `REQ-ALLY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-005-CA01 — Parcours nominal**

- **Étant donné** départ autorisé et conséquences affichées ;
- **Quand** je réalise le parcours « Quitter une alliance » ;
- **Alors** rôle, accès et contributions recalculés.

**US-ALL-005-CA02 — Refus ou exception**

- **Étant donné** restriction de départ active ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus expliqué.

**US-ALL-005-CA03 — Cas frontière**

- **Étant donné** monument possédé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** conséquence classique explicitée.

**US-ALL-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier délais et devenir des monuments. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : changer de stratégie collective. |
| E | Qualifier U31, U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rôle, accès et contributions recalculés**.
- [ ] Le cas frontière est vérifié : **monument possédé → conséquence classique explicitée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-006"></a>
## US-ALL-006 — Exclure un membre

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que chef d’alliance, je souhaite retirer un joueur de l’alliance afin de administrer notre groupe.

### 2. Conversation — règles et décisions

- **Préconditions :** permission et cible admissibles.
- **Règles / traces :** G09, droits à préciser.
- **Question à traiter :** Qualifier autorité, notifications et monuments.
- **Incertitudes liées :** `U31`, `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-003](17-ALL.md#us-all-003).
- **Exigences :** `REQ-ALLY-01`, `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-006-CA01 — Parcours nominal**

- **Étant donné** permission et cible admissibles ;
- **Quand** je réalise le parcours « Exclure un membre » ;
- **Alors** appartenance terminée avec conséquences tracées.

**US-ALL-006-CA02 — Refus ou exception**

- **Étant donné** officier sans droit ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun changement.

**US-ALL-006-CA03 — Cas frontière**

- **Étant donné** dernier chef ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** règle de succession respectée.

**US-ALL-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier autorité, notifications et monuments. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : administrer notre groupe. |
| E | Qualifier U31, U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **appartenance terminée avec conséquences tracées**.
- [ ] Le cas frontière est vérifié : **dernier chef → règle de succession respectée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-007"></a>
## US-ALL-007 — Consulter les membres

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que membre d’alliance, je souhaite voir rôles et informations autorisées afin de répartir nos responsabilités.

### 2. Conversation — règles et décisions

- **Préconditions :** je suis membre de l’alliance.
- **Règles / traces :** G09.
- **Question à traiter :** Qualifier informations de présence et activité.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-003](17-ALL.md#us-all-003).
- **Exigences :** `REQ-ALLY-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-007-CA01 — Parcours nominal**

- **Étant donné** je suis membre de l’alliance ;
- **Quand** je réalise le parcours « Consulter les membres » ;
- **Alors** liste et rôle courant de chacun visibles.

**US-ALL-007-CA02 — Refus ou exception**

- **Étant donné** visiteur extérieur ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** vue publique seulement.

**US-ALL-007-CA03 — Cas frontière**

- **Étant donné** membre sorti ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** accès partagés retirés.

**US-ALL-007-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ALL-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier informations de présence et activité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : répartir nos responsabilités. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **liste et rôle courant de chacun visibles**.
- [ ] Le cas frontière est vérifié : **membre sorti → accès partagés retirés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-008"></a>
## US-ALL-008 — Attribuer un rôle

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que chef d’alliance, je souhaite nommer un officier autorisé afin de déléguer une responsabilité.

### 2. Conversation — règles et décisions

- **Préconditions :** membre et rôle disponibles.
- **Règles / traces :** G09, général, maître espion, marchand.
- **Question à traiter :** Retrouver matrice précise des pouvoirs.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-007](17-ALL.md#us-all-007).
- **Exigences :** `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-008-CA01 — Parcours nominal**

- **Étant donné** membre et rôle disponibles ;
- **Quand** je réalise le parcours « Attribuer un rôle » ;
- **Alors** permissions du rôle prennent effet.

**US-ALL-008-CA02 — Refus ou exception**

- **Étant donné** attribuant sans droit ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-ALL-008-CA03 — Cas frontière**

- **Étant donné** rôle retiré ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** anciens accès cessent.

**US-ALL-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver matrice précise des pouvoirs. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : déléguer une responsabilité. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **permissions du rôle prennent effet**.
- [ ] Le cas frontière est vérifié : **rôle retiré → anciens accès cessent**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-009"></a>
## US-ALL-009 — Consulter selon mon rôle

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que officier d’alliance, je souhaite accéder aux rapports relevant de ma fonction afin de coordonner sans dépasser mes droits.

### 2. Conversation — règles et décisions

- **Préconditions :** un rôle spécialisé m’est attribué.
- **Règles / traces :** G09.
- **Question à traiter :** Qualifier profondeur des rapports partagés.
- **Incertitudes liées :** `U31`, `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-008](17-ALL.md#us-all-008).
- **Exigences :** `REQ-ALLY-02`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-009-CA01 — Parcours nominal**

- **Étant donné** un rôle spécialisé m’est attribué ;
- **Quand** je réalise le parcours « Consulter selon mon rôle » ;
- **Alors** général, espion et marchand accèdent aux catégories prévues.

**US-ALL-009-CA02 — Refus ou exception**

- **Étant donné** autre catégorie privée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** accès refusé.

**US-ALL-009-CA03 — Cas frontière**

- **Étant donné** changement de rôle ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** droits réévalués.

**US-ALL-009-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ALL-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier profondeur des rapports partagés. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : coordonner sans dépasser mes droits. |
| E | Qualifier U31, U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **général, espion et marchand accèdent aux catégories prévues**.
- [ ] Le cas frontière est vérifié : **changement de rôle → droits réévalués**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-010"></a>
## US-ALL-010 — Transmettre la direction

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que chef d’alliance, je souhaite désigner le responsable suivant afin de assurer la continuité de l’alliance.

### 2. Conversation — règles et décisions

- **Préconditions :** transmission volontaire autorisée.
- **Règles / traces :** Fonction de gouvernance à qualifier.
- **Question à traiter :** Retrouver procédure, consentement et restrictions.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-008](17-ALL.md#us-all-008).
- **Exigences :** `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-ALL-010-CA01 — Parcours nominal**

- **Étant donné** transmission volontaire autorisée ;
- **Quand** je réalise le parcours « Transmettre la direction » ;
- **Alors** nouveau chef et ancien rôle cohérents.

**US-ALL-010-CA02 — Refus ou exception**

- **Étant donné** candidat non membre ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-ALL-010-CA03 — Cas frontière**

- **Étant donné** deux transmissions concurrentes ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un chef final.

**US-ALL-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver procédure, consentement et restrictions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : assurer la continuité de l’alliance. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **nouveau chef et ancien rôle cohérents**.
- [ ] Le cas frontière est vérifié : **deux transmissions concurrentes → un chef final**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-011"></a>
## US-ALL-011 — Consulter la progression collective

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que membre d’alliance, je souhaite voir rang, capacité et objectifs de l’alliance afin de orienter notre effort commun.

### 2. Conversation — règles et décisions

- **Préconditions :** alliance existante.
- **Règles / traces :** G09, seuils suspects conservés comme tels.
- **Question à traiter :** Qualifier capacités par rang.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-001](17-ALL.md#us-all-001).
- **Exigences :** `REQ-ALLY-01`, `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-011-CA01 — Parcours nominal**

- **Étant donné** alliance existante ;
- **Quand** je réalise le parcours « Consulter la progression collective » ;
- **Alors** rang et prochains déblocages détaillés.

**US-ALL-011-CA02 — Refus ou exception**

- **Étant donné** seuil inconnu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune capacité chiffrée inventée.

**US-ALL-011-CA03 — Cas frontière**

- **Étant donné** rang évolue ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** droits et interface actualisés.

**US-ALL-011-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ALL-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier capacités par rang. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : orienter notre effort commun. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rang et prochains déblocages détaillés**.
- [ ] Le cas frontière est vérifié : **rang évolue → droits et interface actualisés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-012"></a>
## US-ALL-012 — Choisir une compétence collective

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que officier autorisé, je souhaite comparer Cri de guerre, Ralliement et Inspiration afin de préparer un bonus utile.

### 2. Conversation — règles et décisions

- **Préconditions :** compétences autorisées accessibles.
- **Règles / traces :** CODE-01 bonus et G09.
- **Question à traiter :** Qualifier branche et cible de chaque effet.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-011](17-ALL.md#us-all-011).
- **Exigences :** `REQ-ALLY-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-012-CA01 — Parcours nominal**

- **Étant donné** compétences autorisées accessibles ;
- **Quand** je réalise le parcours « Choisir une compétence collective » ;
- **Alors** effets, rang, durée et recharge présentés.

**US-ALL-012-CA02 — Refus ou exception**

- **Étant donné** rang insuffisant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** activation non proposée.

**US-ALL-012-CA03 — Cas frontière**

- **Étant donné** même valeur numérique ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de bonus universel à toutes statistiques.

**US-ALL-012-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ALL-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-011. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier branche et cible de chaque effet. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer un bonus utile. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **effets, rang, durée et recharge présentés**.
- [ ] Le cas frontière est vérifié : **même valeur numérique → pas de bonus universel à toutes statistiques**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-013"></a>
## US-ALL-013 — Activer une compétence d’alliance

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que officier autorisé, je souhaite déclencher un bonus collectif admissible afin de soutenir une opération.

### 2. Conversation — règles et décisions

- **Préconditions :** permission, rang et recharge satisfaits.
- **Règles / traces :** G09 décrit 24 h et sept jours, à qualifier.
- **Question à traiter :** Fixer portée, horodatage et interaction des activations.
- **Incertitudes liées :** `U31`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-012](17-ALL.md#us-all-012).
- **Exigences :** `REQ-ALLY-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-013-CA01 — Parcours nominal**

- **Étant donné** permission, rang et recharge satisfaits ;
- **Quand** je réalise le parcours « Activer une compétence d’alliance » ;
- **Alors** fenêtre d’effet et prochaine disponibilité enregistrées.

**US-ALL-013-CA02 — Refus ou exception**

- **Étant donné** autre compétence active ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus si exclusivité.

**US-ALL-013-CA03 — Cas frontière**

- **Étant donné** expiration ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** effet retiré sans prolongation par reconnexion.

**US-ALL-013-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer portée, horodatage et interaction des activations. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : soutenir une opération. |
| E | Qualifier U31, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **fenêtre d’effet et prochaine disponibilité enregistrées**.
- [ ] Le cas frontière est vérifié : **expiration → effet retiré sans prolongation par reconnexion**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-all-014"></a>
## US-ALL-014 — Remplacer un chef inactif

**Priorité proposée :** P2 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que membre d’alliance, je souhaite appliquer la succession prévue afin de éviter le blocage de l’alliance.

### 2. Conversation — règles et décisions

- **Préconditions :** inactivité et procédure admissibles.
- **Règles / traces :** G09 décrit quinze jours.
- **Question à traiter :** Qualifier mesure d’inactivité et choix du successeur.
- **Incertitudes liées :** `U31`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-001](17-ALL.md#us-all-001).
- **Exigences :** `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ALL-014-CA01 — Parcours nominal**

- **Étant donné** inactivité et procédure admissibles ;
- **Quand** je réalise le parcours « Remplacer un chef inactif » ;
- **Alors** responsable remplacé selon la règle publiée.

**US-ALL-014-CA02 — Refus ou exception**

- **Étant donné** inactivité trop courte ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune destitution automatique.

**US-ALL-014-CA03 — Cas frontière**

- **Étant donné** chef revenu à échéance ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ordre défini.

**US-ALL-014-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ALL-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier mesure d’inactivité et choix du successeur. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter le blocage de l’alliance. |
| E | Qualifier U31, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **responsable remplacé selon la règle publiée**.
- [ ] Le cas frontière est vérifié : **chef revenu à échéance → ordre défini**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

