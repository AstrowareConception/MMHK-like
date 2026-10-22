# 14. Reconnaissance, espionnage et prisonniers

10 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-ESP-001 — Choisir un renseignement](#us-esp-001)
- [US-ESP-002 — Régler la durée d’espionnage](#us-esp-002)
- [US-ESP-003 — Lancer une reconnaissance](#us-esp-003)
- [US-ESP-004 — Lire un rapport d’espionnage](#us-esp-004)
- [US-ESP-005 — Détecter une reconnaissance](#us-esp-005)
- [US-ESP-006 — Subir une blessure d’espion](#us-esp-006)
- [US-ESP-007 — Capturer un éclaireur](#us-esp-007)
- [US-ESP-008 — Consulter un héros captif](#us-esp-008)
- [US-ESP-009 — Obtenir une libération autorisée](#us-esp-009)
- [US-ESP-010 — Partager un renseignement autorisé](#us-esp-010)

<a id="us-esp-001"></a>
## US-ESP-001 — Choisir un renseignement

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite sélectionner troupes, cité ou région afin de obtenir l’information utile.

### 2. Conversation — règles et décisions

- **Préconditions :** cible reconnaissable et héros disponible.
- **Règles / traces :** SS-031 et G15.
- **Question à traiter :** Qualifier carrières et prérequis par périmètre.
- **Incertitudes liées :** `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-003](12-MON.md#us-mon-003), [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-SPY-01`, `REQ-UI-09`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-001-CA01 — Parcours nominal**

- **Étant donné** cible reconnaissable et héros disponible ;
- **Quand** je réalise le parcours « Choisir un renseignement » ;
- **Alors** les trois périmètres sont distincts.

**US-ESP-001-CA02 — Refus ou exception**

- **Étant donné** périmètre non autorisé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** commande refusée.

**US-ESP-001-CA03 — Cas frontière**

- **Étant donné** changement de périmètre ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** estimation recalculée.

**US-ESP-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ESP-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-003, US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier carrières et prérequis par périmètre. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : obtenir l’information utile. |
| E | Qualifier U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **les trois périmètres sont distincts**.
- [ ] Le cas frontière est vérifié : **changement de périmètre → estimation recalculée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-002"></a>
## US-ESP-002 — Régler la durée d’espionnage

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite arbitrer temps consacré et valeur d’information afin de adapter le risque et la précision.

### 2. Conversation — règles et décisions

- **Préconditions :** reconnaissance préparée.
- **Règles / traces :** SS-031.
- **Question à traiter :** Retrouver courbe et bornes du curseur.
- **Incertitudes liées :** `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ESP-001](14-ESP.md#us-esp-001).
- **Exigences :** `REQ-SPY-01`, `REQ-UI-09`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-002-CA01 — Parcours nominal**

- **Étant donné** reconnaissance préparée ;
- **Quand** je réalise le parcours « Régler la durée d’espionnage » ;
- **Alors** durée et score estimé évoluent selon le profil.

**US-ESP-002-CA02 — Refus ou exception**

- **Étant donné** durée hors intervalle ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-ESP-002-CA03 — Cas frontière**

- **Étant donné** 4 h 34 min 28 s et130 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** exemple, pas formule.

**US-ESP-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ESP-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ESP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver courbe et bornes du curseur. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter le risque et la précision. |
| E | Qualifier U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **durée et score estimé évoluent selon le profil**.
- [ ] Le cas frontière est vérifié : **4 h 34 min 28 s et130 → exemple, pas formule**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-003"></a>
## US-ESP-003 — Lancer une reconnaissance

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite envoyer un héros sur une cible autorisée afin de préparer une opération militaire.

### 2. Conversation — règles et décisions

- **Préconditions :** héros libre et paramètres valides.
- **Règles / traces :** G15 et SS-031.
- **Question à traiter :** Qualifier déplacement, durée locale et retour.
- **Incertitudes liées :** `U23`, `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ESP-002](14-ESP.md#us-esp-002).
- **Exigences :** `REQ-SPY-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-003-CA01 — Parcours nominal**

- **Étant donné** héros libre et paramètres valides ;
- **Quand** je réalise le parcours « Lancer une reconnaissance » ;
- **Alors** mission temporisée réservant le héros.

**US-ESP-003-CA02 — Refus ou exception**

- **Étant donné** héros occupé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ordre refusé.

**US-ESP-003-CA03 — Cas frontière**

- **Étant donné** double lancement ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une reconnaissance.

**US-ESP-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ESP-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ESP-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier déplacement, durée locale et retour. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer une opération militaire. |
| E | Qualifier U23, U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **mission temporisée réservant le héros**.
- [ ] Le cas frontière est vérifié : **double lancement → une reconnaissance**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-004"></a>
## US-ESP-004 — Lire un rapport d’espionnage

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter les informations réellement obtenues afin de évaluer mon adversaire.

### 2. Conversation — règles et décisions

- **Préconditions :** mission résolue avec rapport.
- **Règles / traces :** G15, renseignement progressif.
- **Question à traiter :** Qualifier champs par niveau de qualité.
- **Incertitudes liées :** `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ESP-003](14-ESP.md#us-esp-003).
- **Exigences :** `REQ-SPY-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-004-CA01 — Parcours nominal**

- **Étant donné** mission résolue avec rapport ;
- **Quand** je réalise le parcours « Lire un rapport d’espionnage » ;
- **Alors** date, qualité et champs connus sont visibles.

**US-ESP-004-CA02 — Refus ou exception**

- **Étant donné** champ non découvert ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** inconnu, pas zéro.

**US-ESP-004-CA03 — Cas frontière**

- **Étant donné** rapport ancien ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** non mis à jour comme état actuel.

**US-ESP-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ESP-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ESP-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier champs par niveau de qualité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : évaluer mon adversaire. |
| E | Qualifier U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **date, qualité et champs connus sont visibles**.
- [ ] Le cas frontière est vérifié : **rapport ancien → non mis à jour comme état actuel**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-005"></a>
## US-ESP-005 — Détecter une reconnaissance

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite être informé d’un espion repéré afin de adapter ma défense.

### 2. Conversation — règles et décisions

- **Préconditions :** règle de détection déclenchée.
- **Règles / traces :** G15.
- **Question à traiter :** Qualifier probabilités et moyens défensifs.
- **Incertitudes liées :** `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ESP-003](14-ESP.md#us-esp-003).
- **Exigences :** `REQ-SPY-01`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-005-CA01 — Parcours nominal**

- **Étant donné** règle de détection déclenchée ;
- **Quand** je réalise le parcours « Détecter une reconnaissance » ;
- **Alors** alerte conforme au degré d’identification.

**US-ESP-005-CA02 — Refus ou exception**

- **Étant donné** espion anonyme ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** identité non révélée.

**US-ESP-005-CA03 — Cas frontière**

- **Étant donné** détection répétée du même événement ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une alerte.

**US-ESP-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ESP-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ESP-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier probabilités et moyens défensifs. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter ma défense. |
| E | Qualifier U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **alerte conforme au degré d’identification**.
- [ ] Le cas frontière est vérifié : **détection répétée du même événement → une alerte**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-006"></a>
## US-ESP-006 — Subir une blessure d’espion

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître les conséquences d’une mission détectée afin de réorganiser mes héros.

### 2. Conversation — règles et décisions

- **Préconditions :** résultat de reconnaissance blessant le héros.
- **Règles / traces :** G15.
- **Question à traiter :** Qualifier issues et durées.
- **Incertitudes liées :** `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ESP-003](14-ESP.md#us-esp-003), [US-HER-017](07-HER.md#us-her-017).
- **Exigences :** `REQ-SPY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-006-CA01 — Parcours nominal**

- **Étant donné** résultat de reconnaissance blessant le héros ;
- **Quand** je réalise le parcours « Subir une blessure d’espion » ;
- **Alors** durée et identité révélée selon profil.

**US-ESP-006-CA02 — Refus ou exception**

- **Étant donné** simple détection anonyme ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de blessure ajoutée.

**US-ESP-006-CA03 — Cas frontière**

- **Étant donné** guérison atteinte ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** disponibilité cohérente.

**US-ESP-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ESP-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ESP-003, US-HER-017. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier issues et durées. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réorganiser mes héros. |
| E | Qualifier U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **durée et identité révélée selon profil**.
- [ ] Le cas frontière est vérifié : **guérison atteinte → disponibilité cohérente**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-007"></a>
## US-ESP-007 — Capturer un éclaireur

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que défenseur, je souhaite retenir un espion selon mes capacités afin de récompenser ma défense de renseignement.

### 2. Conversation — règles et décisions

- **Préconditions :** conditions de capture remplies.
- **Règles / traces :** G15, capture distincte de détection.
- **Question à traiter :** Qualifier chances, prérequis et stockage du prisonnier.
- **Incertitudes liées :** `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ESP-005](14-ESP.md#us-esp-005).
- **Exigences :** `REQ-SPY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-007-CA01 — Parcours nominal**

- **Étant donné** conditions de capture remplies ;
- **Quand** je réalise le parcours « Capturer un éclaireur » ;
- **Alors** héros adverse passe dans un état captif identifié.

**US-ESP-007-CA02 — Refus ou exception**

- **Étant donné** capacité requise absente ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** capture non garantie.

**US-ESP-007-CA03 — Cas frontière**

- **Étant donné** ordre concurrent ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un lieu de détention.

**US-ESP-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ESP-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ESP-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier chances, prérequis et stockage du prisonnier. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : récompenser ma défense de renseignement. |
| E | Qualifier U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **héros adverse passe dans un état captif identifié**.
- [ ] Le cas frontière est vérifié : **ordre concurrent → un lieu de détention**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-008"></a>
## US-ESP-008 — Consulter un héros captif

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir le lieu et la cause de sa captivité afin de préparer sa récupération.

### 2. Conversation — règles et décisions

- **Préconditions :** un héros de mon royaume est prisonnier.
- **Règles / traces :** État DISTANT JAIL observé.
- **Question à traiter :** Qualifier visibilité et commandes disponibles.
- **Incertitudes liées :** `U23`, `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-SPY-01`, `REQ-HERO-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-008-CA01 — Parcours nominal**

- **Étant donné** un héros de mon royaume est prisonnier ;
- **Quand** je réalise le parcours « Consulter un héros captif » ;
- **Alors** détenteur, lieu et actions connues affichés.

**US-ESP-008-CA02 — Refus ou exception**

- **Étant donné** information non révélée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’identité devinée.

**US-ESP-008-CA03 — Cas frontière**

- **Étant donné** SS-026/037 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** prison distante distincte d’une blessure.

**US-ESP-008-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-ESP-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier visibilité et commandes disponibles. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer sa récupération. |
| E | Qualifier U23, U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **détenteur, lieu et actions connues affichés**.
- [ ] Le cas frontière est vérifié : **SS-026/037 → prison distante distincte d’une blessure**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-009"></a>
## US-ESP-009 — Obtenir une libération autorisée

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite récupérer un héros captif par le moyen prévu afin de retrouver sa capacité d’action.

### 2. Conversation — règles et décisions

- **Préconditions :** profil comportant une procédure qualifiée.
- **Règles / traces :** Libération historiquement incomplète.
- **Question à traiter :** Retrouver rançon, délai, conquête et sort des troupes.
- **Incertitudes liées :** `U19`, `U23` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ESP-008](14-ESP.md#us-esp-008).
- **Exigences :** `REQ-HERO-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-ESP-009-CA01 — Parcours nominal**

- **Étant donné** profil comportant une procédure qualifiée ;
- **Quand** je réalise le parcours « Obtenir une libération autorisée » ;
- **Alors** conditions satisfaites produisent une seule libération.

**US-ESP-009-CA02 — Refus ou exception**

- **Étant donné** rançon ou échange non établi ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de mécanisme inventé.

**US-ESP-009-CA03 — Cas frontière**

- **Étant donné** cité de détention capturée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** transition explicite.

**US-ESP-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ESP-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ESP-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver rançon, délai, conquête et sort des troupes. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : retrouver sa capacité d’action. |
| E | Qualifier U19, U23 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **conditions satisfaites produisent une seule libération**.
- [ ] Le cas frontière est vérifié : **cité de détention capturée → transition explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-esp-010"></a>
## US-ESP-010 — Partager un renseignement autorisé

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite rendre un rapport accessible aux bons alliés afin de coordonner une attaque informée.

### 2. Conversation — règles et décisions

- **Préconditions :** rapport détenu et permission de partage.
- **Règles / traces :** G09, maître espion ; partage détaillé à qualifier.
- **Question à traiter :** Définir permissions et durée de partage.
- **Incertitudes liées :** `U31`, `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ESP-004](14-ESP.md#us-esp-004).
- **Exigences :** `REQ-SPY-01`, `REQ-ALLY-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-ESP-010-CA01 — Parcours nominal**

- **Étant donné** rapport détenu et permission de partage ;
- **Quand** je réalise le parcours « Partager un renseignement autorisé » ;
- **Alors** destinataires voient le même instantané autorisé.

**US-ESP-010-CA02 — Refus ou exception**

- **Étant donné** membre sans droit ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** rapport non accessible.

**US-ESP-010-CA03 — Cas frontière**

- **Étant donné** rôle révoqué ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** accès futur réévalué.

**US-ESP-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-ESP-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ESP-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir permissions et durée de partage. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : coordonner une attaque informée. |
| E | Qualifier U31, U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **destinataires voient le même instantané autorisé**.
- [ ] Le cas frontière est vérifié : **rôle révoqué → accès futur réévalué**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

