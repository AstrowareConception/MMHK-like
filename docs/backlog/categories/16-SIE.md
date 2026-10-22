# 16. Sièges, bombardements et conquêtes

14 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-SIE-001 — Vérifier une conquête possible](#us-sie-001)
- [US-SIE-002 — Préparer une armée de siège](#us-sie-002)
- [US-SIE-003 — Installer un siège](#us-sie-003)
- [US-SIE-004 — Consulter un siège actif](#us-sie-004)
- [US-SIE-005 — Subir le blocus](#us-sie-005)
- [US-SIE-006 — Préparer un bombardement](#us-sie-006)
- [US-SIE-007 — Bombarder la ville](#us-sie-007)
- [US-SIE-008 — Lancer un assaut](#us-sie-008)
- [US-SIE-009 — Faire une sortie défensive](#us-sie-009)
- [US-SIE-010 — Secourir une cité](#us-sie-010)
- [US-SIE-011 — Lever mon siège](#us-sie-011)
- [US-SIE-012 — Recevoir une cité conquise](#us-sie-012)
- [US-SIE-013 — Perdre une cité](#us-sie-013)
- [US-SIE-014 — Conquérir une cité à monument](#us-sie-014)

<a id="us-sie-001"></a>
## US-SIE-001 — Vérifier une conquête possible

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite examiner l’éligibilité d’une cité afin de éviter un siège sans issue.

### 2. Conversation — règles et décisions

- **Préconditions :** cité hostile sélectionnée.
- **Règles / traces :** G10 et G08.
- **Question à traiter :** Qualifier toutes les conditions de conquête.
- **Incertitudes liées :** `U19`, `U20`, `U16` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-003](12-MON.md#us-mon-003).
- **Exigences :** `REQ-SIEGE-01`, `REQ-CITY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-001-CA01 — Parcours nominal**

- **Étant donné** cité hostile sélectionnée ;
- **Quand** je réalise le parcours « Vérifier une conquête possible » ;
- **Alors** droit de cité, protection et force requis expliqués.

**US-SIE-001-CA02 — Refus ou exception**

- **Étant donné** dernier bastion protégé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** commande refusée.

**US-SIE-001-CA03 — Cas frontière**

- **Étant donné** droit de cité épuisé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** prise non promise.

**US-SIE-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-SIE-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier toutes les conditions de conquête. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter un siège sans issue. |
| E | Qualifier U19, U20, U16 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **droit de cité, protection et force requis expliqués**.
- [ ] Le cas frontière est vérifié : **droit de cité épuisé → prise non promise**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-002"></a>
## US-SIE-002 — Préparer une armée de siège

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite composer forces et engins pour assiéger afin de engager une campagne adaptée.

### 2. Conversation — règles et décisions

- **Préconditions :** cible éligible.
- **Règles / traces :** G05/G10.
- **Question à traiter :** Qualifier composition et vitesses.
- **Incertitudes liées :** `U19`, `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-001](16-SIE.md#us-sie-001), [US-ARM-015](09-ARM.md#us-arm-015).
- **Exigences :** `REQ-SIEGE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-002-CA01 — Parcours nominal**

- **Étant donné** cible éligible ;
- **Quand** je réalise le parcours « Préparer une armée de siège » ;
- **Alors** trajet et restrictions propres au siège présentés.

**US-SIE-002-CA02 — Refus ou exception**

- **Étant donné** engin insuffisant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** bombardement non annoncé disponible.

**US-SIE-002-CA03 — Cas frontière**

- **Étant donné** armée ordinaire ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** vitesse de siège non supposée identique.

**US-SIE-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-SIE-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-001, US-ARM-015. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier composition et vitesses. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : engager une campagne adaptée. |
| E | Qualifier U19, U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **trajet et restrictions propres au siège présentés**.
- [ ] Le cas frontière est vérifié : **armée ordinaire → vitesse de siège non supposée identique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-003"></a>
## US-SIE-003 — Installer un siège

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite occuper la position d’assiégeant afin de faire pression sur une cité.

### 2. Conversation — règles et décisions

- **Préconditions :** armée arrivée et conditions satisfaites.
- **Règles / traces :** G10, occupation persistante.
- **Question à traiter :** Qualifier priorités et encerclement.
- **Incertitudes liées :** `U19`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-002](16-SIE.md#us-sie-002).
- **Exigences :** `REQ-SIEGE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-003-CA01 — Parcours nominal**

- **Étant donné** armée arrivée et conditions satisfaites ;
- **Quand** je réalise le parcours « Installer un siège » ;
- **Alors** siège actif avec assiégeant identifié.

**US-SIE-003-CA02 — Refus ou exception**

- **Étant donné** place de siège déjà prise ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** résolution explicite.

**US-SIE-003-CA03 — Cas frontière**

- **Étant donné** deux arrivées ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un propriétaire de siège selon règle.

**US-SIE-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier priorités et encerclement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : faire pression sur une cité. |
| E | Qualifier U19, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **siège actif avec assiégeant identifié**.
- [ ] Le cas frontière est vérifié : **deux arrivées → un propriétaire de siège selon règle**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-004"></a>
## US-SIE-004 — Consulter un siège actif

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir ses forces, délais et possibilités afin de prendre une décision militaire.

### 2. Conversation — règles et décisions

- **Préconditions :** siège installé et droit de consultation.
- **Règles / traces :** G10 ; écran historique absent.
- **Question à traiter :** Définir vues assiégeant, assiégé et allié.
- **Incertitudes liées :** `U19`, `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-003](16-SIE.md#us-sie-003).
- **Exigences :** `REQ-SIEGE-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-004-CA01 — Parcours nominal**

- **Étant donné** siège installé et droit de consultation ;
- **Quand** je réalise le parcours « Consulter un siège actif » ;
- **Alors** état et actions disponibles sont actualisés.

**US-SIE-004-CA02 — Refus ou exception**

- **Étant donné** adversaire sans renseignement ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** détails cachés.

**US-SIE-004-CA03 — Cas frontière**

- **Étant donné** action en cours ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** commandes incompatibles bloquées.

**US-SIE-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-SIE-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir vues assiégeant, assiégé et allié. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : prendre une décision militaire. |
| E | Qualifier U19, U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **état et actions disponibles sont actualisés**.
- [ ] Le cas frontière est vérifié : **action en cours → commandes incompatibles bloquées**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-005"></a>
## US-SIE-005 — Subir le blocus

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que défenseur, je souhaite connaître les fonctions bloquées de ma cité afin de organiser ma résistance.

### 2. Conversation — règles et décisions

- **Préconditions :** ma cité est assiégée.
- **Règles / traces :** G10, périmètre incomplet.
- **Question à traiter :** Qualifier précisément chaque action sous siège.
- **Incertitudes liées :** `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-003](16-SIE.md#us-sie-003).
- **Exigences :** `REQ-SIEGE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-005-CA01 — Parcours nominal**

- **Étant donné** ma cité est assiégée ;
- **Quand** je réalise le parcours « Subir le blocus » ;
- **Alors** commerce, déplacements et travaux suivent le profil.

**US-SIE-005-CA02 — Refus ou exception**

- **Étant donné** action interdite ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus sans débit.

**US-SIE-005-CA03 — Cas frontière**

- **Étant donné** convoi déjà en route ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** politique d’arrivée explicite.

**US-SIE-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-SIE-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier précisément chaque action sous siège. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : organiser ma résistance. |
| E | Qualifier U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **commerce, déplacements et travaux suivent le profil**.
- [ ] Le cas frontière est vérifié : **convoi déjà en route → politique d’arrivée explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-006"></a>
## US-SIE-006 — Préparer un bombardement

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir cibles possibles et conséquences afin de employer mes engins efficacement.

### 2. Conversation — règles et décisions

- **Préconditions :** siège et engins admissibles.
- **Règles / traces :** G10, poids de catégories.
- **Question à traiter :** Retrouver tables et bâtiments admissibles.
- **Incertitudes liées :** `U21` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-004](16-SIE.md#us-sie-004).
- **Exigences :** `REQ-SIEGE-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-006-CA01 — Parcours nominal**

- **Étant donné** siège et engins admissibles ;
- **Quand** je réalise le parcours « Préparer un bombardement » ;
- **Alors** opération, délai et règle de ciblage explicités.

**US-SIE-006-CA02 — Refus ou exception**

- **Étant donné** engin absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** commande indisponible.

**US-SIE-006-CA03 — Cas frontière**

- **Étant donné** ciblage aléatoire ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune garantie de bâtiment précis.

**US-SIE-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-SIE-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver tables et bâtiments admissibles. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : employer mes engins efficacement. |
| E | Qualifier U21 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **opération, délai et règle de ciblage explicités**.
- [ ] Le cas frontière est vérifié : **ciblage aléatoire → aucune garantie de bâtiment précis**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-007"></a>
## US-SIE-007 — Bombarder la ville

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite engager l’opération de destruction afin de affaiblir les infrastructures ennemies.

### 2. Conversation — règles et décisions

- **Préconditions :** bombardement autorisé.
- **Règles / traces :** G10, aucune cascade inventée.
- **Question à traiter :** Qualifier tirage, intensité et dépendances détruites.
- **Incertitudes liées :** `U21`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-006](16-SIE.md#us-sie-006).
- **Exigences :** `REQ-SIEGE-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-007-CA01 — Parcours nominal**

- **Étant donné** bombardement autorisé ;
- **Quand** je réalise le parcours « Bombarder la ville » ;
- **Alors** bâtiments touchés et dégâts enregistrés une fois.

**US-SIE-007-CA02 — Refus ou exception**

- **Étant donné** opération incompatible en cours ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-SIE-007-CA03 — Cas frontière**

- **Étant donné** destruction d’un prérequis ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** dépendants traités selon profil.

**US-SIE-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier tirage, intensité et dépendances détruites. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : affaiblir les infrastructures ennemies. |
| E | Qualifier U21, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **bâtiments touchés et dégâts enregistrés une fois**.
- [ ] Le cas frontière est vérifié : **destruction d’un prérequis → dépendants traités selon profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-008"></a>
## US-SIE-008 — Lancer un assaut

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite attaquer depuis le siège afin de prendre la cité.

### 2. Conversation — règles et décisions

- **Préconditions :** conditions d’assaut et délai satisfaits.
- **Règles / traces :** G10, bataille dans contexte spécifique.
- **Question à traiter :** Qualifier victoire, attrition et survie du siège.
- **Incertitudes liées :** `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-004](16-SIE.md#us-sie-004).
- **Exigences :** `REQ-SIEGE-02`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-008-CA01 — Parcours nominal**

- **Étant donné** conditions d’assaut et délai satisfaits ;
- **Quand** je réalise le parcours « Lancer un assaut » ;
- **Alors** combat et contrôle de conquête résolus.

**US-SIE-008-CA02 — Refus ou exception**

- **Étant donné** délai non atteint ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** assaut refusé.

**US-SIE-008-CA03 — Cas frontière**

- **Étant donné** défaite ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** état du siège déterminé par profil.

**US-SIE-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier victoire, attrition et survie du siège. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : prendre la cité. |
| E | Qualifier U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **combat et contrôle de conquête résolus**.
- [ ] Le cas frontière est vérifié : **défaite → état du siège déterminé par profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-009"></a>
## US-SIE-009 — Faire une sortie défensive

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que défenseur, je souhaite attaquer les assiégeants depuis ma cité afin de tenter de lever le siège.

### 2. Conversation — règles et décisions

- **Préconditions :** sortie admissible et forces présentes.
- **Règles / traces :** G10.
- **Question à traiter :** Qualifier composition, héros et issue de sortie.
- **Incertitudes liées :** `U18`, `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-004](16-SIE.md#us-sie-004).
- **Exigences :** `REQ-SIEGE-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-009-CA01 — Parcours nominal**

- **Étant donné** sortie admissible et forces présentes ;
- **Quand** je réalise le parcours « Faire une sortie défensive » ;
- **Alors** forces engagées et résultat de levée évalué.

**US-SIE-009-CA02 — Refus ou exception**

- **Étant donné** sortie interdite pendant opération ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-SIE-009-CA03 — Cas frontière**

- **Étant donné** échec ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** survivants et cité traités explicitement.

**US-SIE-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier composition, héros et issue de sortie. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : tenter de lever le siège. |
| E | Qualifier U18, U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **forces engagées et résultat de levée évalué**.
- [ ] Le cas frontière est vérifié : **échec → survivants et cité traités explicitement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-010"></a>
## US-SIE-010 — Secourir une cité

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que membre d’alliance, je souhaite attaquer un siège menaçant un allié afin de libérer sa position.

### 2. Conversation — règles et décisions

- **Préconditions :** relation et forces admissibles.
- **Règles / traces :** G10, secours distinct du renfort.
- **Question à traiter :** Qualifier accès, cible et simultanéités.
- **Incertitudes liées :** `U19`, `U32`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-004](16-SIE.md#us-sie-004), [US-MOV-003](13-MOV.md#us-mov-003).
- **Exigences :** `REQ-SIEGE-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-010-CA01 — Parcours nominal**

- **Étant donné** relation et forces admissibles ;
- **Quand** je réalise le parcours « Secourir une cité » ;
- **Alors** mission de secours puis combat contre siège.

**US-SIE-010-CA02 — Refus ou exception**

- **Étant donné** relation devenue hostile ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** mission réévaluée.

**US-SIE-010-CA03 — Cas frontière**

- **Étant donné** succès ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** levée et retour des forces selon profil.

**US-SIE-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-004, US-MOV-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier accès, cible et simultanéités. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : libérer sa position. |
| E | Qualifier U19, U32, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **mission de secours puis combat contre siège**.
- [ ] Le cas frontière est vérifié : **succès → levée et retour des forces selon profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-011"></a>
## US-SIE-011 — Lever mon siège

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que assiégeant, je souhaite retirer mes forces d’un siège afin de éviter un engagement défavorable.

### 2. Conversation — règles et décisions

- **Préconditions :** levée autorisée dans l’état courant.
- **Règles / traces :** G10.
- **Question à traiter :** Qualifier fenêtres de retrait et risques.
- **Incertitudes liées :** `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-004](16-SIE.md#us-sie-004).
- **Exigences :** `REQ-SIEGE-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-011-CA01 — Parcours nominal**

- **Étant donné** levée autorisée dans l’état courant ;
- **Quand** je réalise le parcours « Lever mon siège » ;
- **Alors** siège clos et retour planifié.

**US-SIE-011-CA02 — Refus ou exception**

- **Étant donné** assaut engagé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** levée selon restriction du profil.

**US-SIE-011-CA03 — Cas frontière**

- **Étant donné** levée répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une mission de retour.

**US-SIE-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier fenêtres de retrait et risques. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter un engagement défavorable. |
| E | Qualifier U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **siège clos et retour planifié**.
- [ ] Le cas frontière est vérifié : **levée répétée → une mission de retour**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-012"></a>
## US-SIE-012 — Recevoir une cité conquise

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite prendre le contrôle d’une ville gagnée afin de étendre mon territoire.

### 2. Conversation — règles et décisions

- **Préconditions :** conquête validée.
- **Règles / traces :** G08/G10.
- **Question à traiter :** Qualifier stocks, bâtiments, héros et dotation après prise.
- **Incertitudes liées :** `U19`, `U16` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-008](16-SIE.md#us-sie-008).
- **Exigences :** `REQ-SIEGE-02`, `REQ-CITY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-012-CA01 — Parcours nominal**

- **Étant donné** conquête validée ;
- **Quand** je réalise le parcours « Recevoir une cité conquise » ;
- **Alors** propriétaire, droits et région changent ensemble.

**US-SIE-012-CA02 — Refus ou exception**

- **Étant donné** droit de possession devenu insuffisant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** politique explicite.

**US-SIE-012-CA03 — Cas frontière**

- **Étant donné** résolution répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de seconde acquisition.

**US-SIE-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier stocks, bâtiments, héros et dotation après prise. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : étendre mon territoire. |
| E | Qualifier U19, U16 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **propriétaire, droits et région changent ensemble**.
- [ ] Le cas frontière est vérifié : **résolution répétée → pas de seconde acquisition**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-013"></a>
## US-SIE-013 — Perdre une cité

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que défenseur, je souhaite retrouver les conséquences d’une conquête ennemie afin de réorganiser mon royaume.

### 2. Conversation — règles et décisions

- **Préconditions :** ma cité change de propriétaire.
- **Règles / traces :** G10, multiples états à qualifier.
- **Question à traiter :** Définir fuite, prisonniers, objets et commandes en cours.
- **Incertitudes liées :** `U19`, `U20`, `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-012](16-SIE.md#us-sie-012).
- **Exigences :** `REQ-SIEGE-02`, `REQ-AUTH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-013-CA01 — Parcours nominal**

- **Étant donné** ma cité change de propriétaire ;
- **Quand** je réalise le parcours « Perdre une cité » ;
- **Alors** accès privés retirés et ordres affectés expliqués.

**US-SIE-013-CA02 — Refus ou exception**

- **Étant donné** ancienne session ouverte ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** gestion interdite après transfert.

**US-SIE-013-CA03 — Cas frontière**

- **Étant donné** dernière cité ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** protection et devenir du joueur selon profil.

**US-SIE-013-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir fuite, prisonniers, objets et commandes en cours. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réorganiser mon royaume. |
| E | Qualifier U19, U20, U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **accès privés retirés et ordres affectés expliqués**.
- [ ] Le cas frontière est vérifié : **dernière cité → protection et devenir du joueur selon profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-sie-014"></a>
## US-SIE-014 — Conquérir une cité à monument

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir le sort de sa Larme et de ses bonus afin de agir sur la victoire ennemie.

### 2. Conversation — règles et décisions

- **Préconditions :** conquête d’une cité à Graal validée.
- **Règles / traces :** G01/G10, classique distinct de S4.
- **Question à traiter :** Qualifier vol, destruction, transfert et simultanéité.
- **Incertitudes liées :** `U33`, `U34`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-SIE-012](16-SIE.md#us-sie-012), [US-LAR-020](20-LAR.md#us-lar-020).
- **Exigences :** `REQ-SIEGE-02`, `REQ-GRAIL-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-SIE-014-CA01 — Parcours nominal**

- **Étant donné** conquête d’une cité à Graal validée ;
- **Quand** je réalise le parcours « Conquérir une cité à monument » ;
- **Alors** compteurs, possession et effet suivent règle classique.

**US-SIE-014-CA02 — Refus ou exception**

- **Étant donné** règle tournoi ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non utilisée pour détruire automatiquement la Larme.

**US-SIE-014-CA03 — Cas frontière**

- **Étant donné** conquête au terme du maintien ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** priorité explicite.

**US-SIE-014-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-SIE-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-SIE-012, US-LAR-020. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier vol, destruction, transfert et simultanéité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : agir sur la victoire ennemie. |
| E | Qualifier U33, U34, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **compteurs, possession et effet suivent règle classique**.
- [ ] Le cas frontière est vérifié : **conquête au terme du maintien → priorité explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

