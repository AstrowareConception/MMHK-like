# 13. Déplacements, haltes et renforts

12 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-MOV-001 — Estimer un trajet](#us-mov-001)
- [US-MOV-002 — Déplacer un héros seul](#us-mov-002)
- [US-MOV-003 — Déplacer une armée](#us-mov-003)
- [US-MOV-004 — Respecter les haltes](#us-mov-004)
- [US-MOV-005 — Respecter la trêve](#us-mov-005)
- [US-MOV-006 — Bénéficier du passage allié](#us-mov-006)
- [US-MOV-007 — Suivre une mission](#us-mov-007)
- [US-MOV-008 — Rappeler une mission autorisée](#us-mov-008)
- [US-MOV-009 — Gérer une cible devenue indisponible](#us-mov-009)
- [US-MOV-010 — Envoyer des renforts](#us-mov-010)
- [US-MOV-011 — Rapatrier mes renforts](#us-mov-011)
- [US-MOV-012 — Appliquer un bonus de déplacement](#us-mov-012)

<a id="us-mov-001"></a>
## US-MOV-001 — Estimer un trajet

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir distance, durée et arrivée prévues afin de planifier mes opérations.

### 2. Conversation — règles et décisions

- **Préconditions :** origine, cible et forces connues.
- **Règles / traces :** CODE-01-DIST et G05.
- **Question à traiter :** Qualifier route réelle et arrondis.
- **Incertitudes liées :** `U09`, `U10` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001), [US-HER-001](07-HER.md#us-her-001).
- **Exigences :** `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-001-CA01 — Parcours nominal**

- **Étant donné** origine, cible et forces connues ;
- **Quand** je réalise le parcours « Estimer un trajet » ;
- **Alors** marche, haltes et trêve sont séparées.

**US-MOV-001-CA02 — Refus ou exception**

- **Étant donné** règle inconnue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’arrivée présentée comme certaine.

**US-MOV-001-CA03 — Cas frontière**

- **Étant donné** héros seul ou armée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** vitesse adaptée.

**US-MOV-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MOV-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001, US-HER-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier route réelle et arrondis. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier mes opérations. |
| E | Qualifier U09, U10 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **marche, haltes et trêve sont séparées**.
- [ ] Le cas frontière est vérifié : **héros seul ou armée → vitesse adaptée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-002"></a>
## US-MOV-002 — Déplacer un héros seul

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite envoyer un héros sans troupe afin de le repositionner rapidement.

### 2. Conversation — règles et décisions

- **Préconditions :** héros libre et destination admissible.
- **Règles / traces :** Estimateur distance/12 h, non durée complète certifiée.
- **Question à traiter :** Qualifier disponibilité et lieux autorisés.
- **Incertitudes liées :** `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-001](13-MOV.md#us-mov-001).
- **Exigences :** `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-002-CA01 — Parcours nominal**

- **Étant donné** héros libre et destination admissible ;
- **Quand** je réalise le parcours « Déplacer un héros seul » ;
- **Alors** mission sans armée utilise son profil de vitesse.

**US-MOV-002-CA02 — Refus ou exception**

- **Étant donné** héros occupé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ordre refusé.

**US-MOV-002-CA03 — Cas frontière**

- **Étant donné** troupes ajoutées avant départ ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** devis réévalué.

**US-MOV-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MOV-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier disponibilité et lieux autorisés. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : le repositionner rapidement. |
| E | Qualifier U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **mission sans armée utilise son profil de vitesse**.
- [ ] Le cas frontière est vérifié : **troupes ajoutées avant départ → devis réévalué**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-003"></a>
## US-MOV-003 — Déplacer une armée

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite envoyer un héros avec ses troupes afin de rejoindre une cible.

### 2. Conversation — règles et décisions

- **Préconditions :** armée disponible et trajet valide.
- **Règles / traces :** G05 ; estimateur distance/4 incomplet.
- **Question à traiter :** Qualifier force prise en compte et arrivée.
- **Incertitudes liées :** `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-001](13-MOV.md#us-mov-001), [US-ARM-008](09-ARM.md#us-arm-008).
- **Exigences :** `REQ-MOVE-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-003-CA01 — Parcours nominal**

- **Étant donné** armée disponible et trajet valide ;
- **Quand** je réalise le parcours « Déplacer une armée » ;
- **Alors** forces réservées et marche enregistrée.

**US-MOV-003-CA02 — Refus ou exception**

- **Étant donné** troupes déjà engagées ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-MOV-003-CA03 — Cas frontière**

- **Étant donné** onglet fermé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** marche continue.

**US-MOV-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MOV-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-001, US-ARM-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier force prise en compte et arrivée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : rejoindre une cible. |
| E | Qualifier U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **forces réservées et marche enregistrée**.
- [ ] Le cas frontière est vérifié : **onglet fermé → marche continue**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-004"></a>
## US-MOV-004 — Respecter les haltes

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les arrêts imposés au trajet afin de anticiper la vulnérabilité de mon armée.

### 2. Conversation — règles et décisions

- **Préconditions :** trajet en territoire concerné.
- **Règles / traces :** G05, huit points et deux heures à qualifier.
- **Question à traiter :** Retrouver transitions et seuils exacts.
- **Incertitudes liées :** `U09`, `U10` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-003](13-MOV.md#us-mov-003).
- **Exigences :** `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-004-CA01 — Parcours nominal**

- **Étant donné** trajet en territoire concerné ;
- **Quand** je réalise le parcours « Respecter les haltes » ;
- **Alors** haltes placées selon points de mouvement du profil.

**US-MOV-004-CA02 — Refus ou exception**

- **Étant donné** territoire exempt ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de halte ordinaire ajoutée.

**US-MOV-004-CA03 — Cas frontière**

- **Étant donné** retour ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** compteur distinct si règle retenue.

**US-MOV-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MOV-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver transitions et seuils exacts. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : anticiper la vulnérabilité de mon armée. |
| E | Qualifier U09, U10 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **haltes placées selon points de mouvement du profil**.
- [ ] Le cas frontière est vérifié : **retour → compteur distinct si règle retenue**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-005"></a>
## US-MOV-005 — Respecter la trêve

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître l’effet de la nuit sur une mission afin de organiser mon temps de jeu.

### 2. Conversation — règles et décisions

- **Préconditions :** monde avec trêve configurée.
- **Règles / traces :** G05 ; 23 h–9 h seulement contexte source.
- **Question à traiter :** Qualifier marche, halte et siège pendant trêve.
- **Incertitudes liées :** `U10` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-004](13-MOV.md#us-mov-004).
- **Exigences :** `REQ-MOVE-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-005-CA01 — Parcours nominal**

- **Étant donné** monde avec trêve configurée ;
- **Quand** je réalise le parcours « Respecter la trêve » ;
- **Alors** arrivée tient compte des fenêtres applicables.

**US-MOV-005-CA02 — Refus ou exception**

- **Étant donné** horaire russe ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non copié sur serveur français.

**US-MOV-005-CA03 — Cas frontière**

- **Étant donné** changement d’heure ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** fuseau explicite.

**US-MOV-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MOV-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier marche, halte et siège pendant trêve. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : organiser mon temps de jeu. |
| E | Qualifier U10 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **arrivée tient compte des fenêtres applicables**.
- [ ] Le cas frontière est vérifié : **changement d’heure → fuseau explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-006"></a>
## US-MOV-006 — Bénéficier du passage allié

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les effets d’un territoire autorisé afin de préparer une route plus favorable.

### 2. Conversation — règles et décisions

- **Préconditions :** un droit de passage est actif.
- **Règles / traces :** G05/G09.
- **Question à traiter :** Qualifier calcul au départ et changements de relation.
- **Incertitudes liées :** `U09`, `U32` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-001](13-MOV.md#us-mov-001).
- **Exigences :** `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-006-CA01 — Parcours nominal**

- **Étant donné** un droit de passage est actif ;
- **Quand** je réalise le parcours « Bénéficier du passage allié » ;
- **Alors** haltes et restrictions suivent la relation.

**US-MOV-006-CA02 — Refus ou exception**

- **Étant donné** simple proximité ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’alliance déduite.

**US-MOV-006-CA03 — Cas frontière**

- **Étant donné** pacte rompu en route ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** politique explicite.

**US-MOV-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MOV-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier calcul au départ et changements de relation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer une route plus favorable. |
| E | Qualifier U09, U32 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **haltes et restrictions suivent la relation**.
- [ ] Le cas frontière est vérifié : **pacte rompu en route → politique explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-007"></a>
## US-MOV-007 — Suivre une mission

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter progression, destination et échéance afin de réagir à temps.

### 2. Conversation — règles et décisions

- **Préconditions :** mission acceptée.
- **Règles / traces :** SS-018/033 et contrat de temps.
- **Question à traiter :** Qualifier messages de retard et reconnexion.
- **Incertitudes liées :** `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-002](13-MOV.md#us-mov-002).
- **Exigences :** `REQ-UI-05`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-MOV-007-CA01 — Parcours nominal**

- **Étant donné** mission acceptée ;
- **Quand** je réalise le parcours « Suivre une mission » ;
- **Alors** temps affiché dérive de l’état serveur.

**US-MOV-007-CA02 — Refus ou exception**

- **Étant donné** horloge locale modifiée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** arrivée réelle inchangée.

**US-MOV-007-CA03 — Cas frontière**

- **Étant donné** onglet suspendu ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** reprise resynchronisée.

**US-MOV-007-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MOV-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier messages de retard et reconnexion. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réagir à temps. |
| E | Qualifier U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **temps affiché dérive de l’état serveur**.
- [ ] Le cas frontière est vérifié : **onglet suspendu → reprise resynchronisée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-008"></a>
## US-MOV-008 — Rappeler une mission autorisée

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite demander le retour d’une force en route afin de réagir à un changement de situation.

### 2. Conversation — règles et décisions

- **Préconditions :** profil autorisant le rappel à cet état.
- **Règles / traces :** Rappel non entièrement documenté.
- **Question à traiter :** Qualifier fenêtres, temps retour et coûts.
- **Incertitudes liées :** `U09`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-003](13-MOV.md#us-mov-003).
- **Exigences :** `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-MOV-008-CA01 — Parcours nominal**

- **Étant donné** profil autorisant le rappel à cet état ;
- **Quand** je réalise le parcours « Rappeler une mission autorisée » ;
- **Alors** retour planifié avec conséquences affichées.

**US-MOV-008-CA02 — Refus ou exception**

- **Étant donné** rappel interdit ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ordre non modifié.

**US-MOV-008-CA03 — Cas frontière**

- **Étant donné** rappel à l’arrivée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** transition unique.

**US-MOV-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MOV-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier fenêtres, temps retour et coûts. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réagir à un changement de situation. |
| E | Qualifier U09, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **retour planifié avec conséquences affichées**.
- [ ] Le cas frontière est vérifié : **rappel à l’arrivée → transition unique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-009"></a>
## US-MOV-009 — Gérer une cible devenue indisponible

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver le sort d’une mission sans cible valide afin de éviter la disparition de mes forces.

### 2. Conversation — règles et décisions

- **Préconditions :** cible capturée, détruite ou inaccessible.
- **Règles / traces :** Contrat de mission proposé.
- **Question à traiter :** Définir la politique par type de mission.
- **Incertitudes liées :** `U09`, `U19`, `U32` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-003](13-MOV.md#us-mov-003).
- **Exigences :** `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-MOV-009-CA01 — Parcours nominal**

- **Étant donné** cible capturée, détruite ou inaccessible ;
- **Quand** je réalise le parcours « Gérer une cible devenue indisponible » ;
- **Alors** attente, retour ou engagement selon profil expliqués.

**US-MOV-009-CA02 — Refus ou exception**

- **Étant donné** cible absente ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun combat contre état fantôme.

**US-MOV-009-CA03 — Cas frontière**

- **Étant donné** propriétaire différent ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** droits réévalués.

**US-MOV-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MOV-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir la politique par type de mission. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter la disparition de mes forces. |
| E | Qualifier U09, U19, U32 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **attente, retour ou engagement selon profil expliqués**.
- [ ] Le cas frontière est vérifié : **propriétaire différent → droits réévalués**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-010"></a>
## US-MOV-010 — Envoyer des renforts

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite soutenir une cité autorisée afin de participer à sa défense.

### 2. Conversation — règles et décisions

- **Préconditions :** relation, destination et forces admissibles.
- **Règles / traces :** Défense et secours G10.
- **Question à traiter :** Qualifier commandement, entretien et inclusion en défense.
- **Incertitudes liées :** `U18`, `U19`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-003](13-MOV.md#us-mov-003).
- **Exigences :** `REQ-MOVE-01`, `REQ-SIEGE-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-010-CA01 — Parcours nominal**

- **Étant donné** relation, destination et forces admissibles ;
- **Quand** je réalise le parcours « Envoyer des renforts » ;
- **Alors** renfort en transit puis présent avec propriétaire conservé.

**US-MOV-010-CA02 — Refus ou exception**

- **Étant donné** destination interdite ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** envoi refusé.

**US-MOV-010-CA03 — Cas frontière**

- **Étant donné** arrivée en même temps qu’attaque ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ordre documenté.

**US-MOV-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MOV-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier commandement, entretien et inclusion en défense. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : participer à sa défense. |
| E | Qualifier U18, U19, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **renfort en transit puis présent avec propriétaire conservé**.
- [ ] Le cas frontière est vérifié : **arrivée en même temps qu’attaque → ordre documenté**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-011"></a>
## US-MOV-011 — Rapatrier mes renforts

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite récupérer mes forces stationnées afin de les redéployer.

### 2. Conversation — règles et décisions

- **Préconditions :** retrait autorisé et forces encore présentes.
- **Règles / traces :** Renforts et retour à qualifier.
- **Question à traiter :** Définir fenêtres de retrait sous siège.
- **Incertitudes liées :** `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-010](13-MOV.md#us-mov-010).
- **Exigences :** `REQ-MOVE-01`, `REQ-SIEGE-03`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-011-CA01 — Parcours nominal**

- **Étant donné** retrait autorisé et forces encore présentes ;
- **Quand** je réalise le parcours « Rapatrier mes renforts » ;
- **Alors** retour concerne mes troupes uniquement.

**US-MOV-011-CA02 — Refus ou exception**

- **Étant donné** autre propriétaire ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun retrait possible.

**US-MOV-011-CA03 — Cas frontière**

- **Étant donné** combat déjà engagé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** résolution selon profil.

**US-MOV-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MOV-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-010. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir fenêtres de retrait sous siège. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : les redéployer. |
| E | Qualifier U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **retour concerne mes troupes uniquement**.
- [ ] Le cas frontière est vérifié : **combat déjà engagé → résolution selon profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mov-012"></a>
## US-MOV-012 — Appliquer un bonus de déplacement

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite bénéficier d’un effet de vitesse admissible afin de valoriser mes infrastructures.

### 2. Conversation — règles et décisions

- **Préconditions :** départ depuis un lieu donnant un bonus.
- **Règles / traces :** Monuments et relais du catalogue.
- **Question à traiter :** Qualifier cumul et calcul au départ ou en continu.
- **Incertitudes liées :** `U09`, `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MOV-001](13-MOV.md#us-mov-001).
- **Exigences :** `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MOV-012-CA01 — Parcours nominal**

- **Étant donné** départ depuis un lieu donnant un bonus ;
- **Quand** je réalise le parcours « Appliquer un bonus de déplacement » ;
- **Alors** bonus et portée figurent dans le devis.

**US-MOV-012-CA02 — Refus ou exception**

- **Étant donné** héros ou trajet exclu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** vitesse inchangée.

**US-MOV-012-CA03 — Cas frontière**

- **Étant donné** bonus perdu en route ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** politique d’évaluation explicite.

**US-MOV-012-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MOV-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MOV-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier cumul et calcul au départ ou en continu. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : valoriser mes infrastructures. |
| E | Qualifier U09, U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **bonus et portée figurent dans le devis**.
- [ ] Le cas frontière est vérifié : **bonus perdu en route → politique d’évaluation explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

