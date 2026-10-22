# 12. Actions sur la carte du monde

10 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-MON-001 — Explorer le monde](#us-mon-001)
- [US-MON-002 — Passer en vue politique](#us-mon-002)
- [US-MON-003 — Inspecter une cité du monde](#us-mon-003)
- [US-MON-004 — Rejoindre des coordonnées](#us-mon-004)
- [US-MON-005 — Lire l’influence territoriale](#us-mon-005)
- [US-MON-006 — Examiner un emplacement de colonie](#us-mon-006)
- [US-MON-007 — Fonder une cité](#us-mon-007)
- [US-MON-008 — Retrouver mes villes](#us-mon-008)
- [US-MON-009 — Placer un repère de carte](#us-mon-009)
- [US-MON-010 — Voir les missions connues](#us-mon-010)

<a id="us-mon-001"></a>
## US-MON-001 — Explorer le monde

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite déplacer la carte autour de mon royaume afin de identifier voisins et positions.

### 2. Conversation — règles et décisions

- **Préconditions :** un monde est chargé.
- **Règles / traces :** SS-029/033.
- **Question à traiter :** Qualifier gestes et limites de navigation.
- **Incertitudes liées :** `U09`, `U46` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-UI-02`, `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-001-CA01 — Parcours nominal**

- **Étant donné** un monde est chargé ;
- **Quand** je réalise le parcours « Explorer le monde » ;
- **Alors** cases, villes et repères restent attachés aux coordonnées.

**US-MON-001-CA02 — Refus ou exception**

- **Étant donné** hors limite logique ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune région fictive.

**US-MON-001-CA03 — Cas frontière**

- **Étant donné** déplacement caméra ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune mission créée.

**US-MON-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MON-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier gestes et limites de navigation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : identifier voisins et positions. |
| E | Qualifier U09, U46 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **cases, villes et repères restent attachés aux coordonnées**.
- [ ] Le cas frontière est vérifié : **déplacement caméra → aucune mission créée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-002"></a>
## US-MON-002 — Passer en vue politique

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter les territoires à petite échelle afin de comprendre les rapports de force.

### 2. Conversation — règles et décisions

- **Préconditions :** carte détaillée ouverte.
- **Règles / traces :** SS-033/034.
- **Question à traiter :** Qualifier filtre automatique ou commande distincte.
- **Incertitudes liées :** `U46` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-UI-02`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-002-CA01 — Parcours nominal**

- **Étant donné** carte détaillée ouverte ;
- **Quand** je réalise le parcours « Passer en vue politique » ;
- **Alors** vue éloignée conserve les mêmes entités.

**US-MON-002-CA02 — Refus ou exception**

- **Étant donné** information non connue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de révélation au dézoom.

**US-MON-002-CA03 — Cas frontière**

- **Étant donné** retour au détail ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** sélection conservée.

**US-MON-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MON-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier filtre automatique ou commande distincte. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre les rapports de force. |
| E | Qualifier U46 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **vue éloignée conserve les mêmes entités**.
- [ ] Le cas frontière est vérifié : **retour au détail → sélection conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-003"></a>
## US-MON-003 — Inspecter une cité du monde

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter les informations autorisées d’une cible afin de choisir une action pertinente.

### 2. Conversation — règles et décisions

- **Préconditions :** cité visible sur la carte.
- **Règles / traces :** SS-030 et reconnaissance.
- **Question à traiter :** Qualifier fiche publique et fraîcheur des informations.
- **Incertitudes liées :** `U23`, `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-003-CA01 — Parcours nominal**

- **Étant donné** cité visible sur la carte ;
- **Quand** je réalise le parcours « Inspecter une cité du monde » ;
- **Alors** propriétaire, alliance et informations connues distingués.

**US-MON-003-CA02 — Refus ou exception**

- **Étant donné** détails militaires privés ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non exposés.

**US-MON-003-CA03 — Cas frontière**

- **Étant donné** propriétaire modifié ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** actions actualisées.

**US-MON-003-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MON-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier fiche publique et fraîcheur des informations. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir une action pertinente. |
| E | Qualifier U23, U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **propriétaire, alliance et informations connues distingués**.
- [ ] Le cas frontière est vérifié : **propriétaire modifié → actions actualisées**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-004"></a>
## US-MON-004 — Rejoindre des coordonnées

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite centrer la carte sur une position afin de retrouver une cible communiquée.

### 2. Conversation — règles et décisions

- **Préconditions :** coordonnées dans un monde choisi.
- **Règles / traces :** Coordonnées toriques de l’outil.
- **Question à traiter :** Qualifier taille et convention de coordonnées.
- **Incertitudes liées :** `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-UI-02`, `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-004-CA01 — Parcours nominal**

- **Étant donné** coordonnées dans un monde choisi ;
- **Quand** je réalise le parcours « Rejoindre des coordonnées » ;
- **Alors** position normalisée et identifiée sans ambiguïté.

**US-MON-004-CA02 — Refus ou exception**

- **Étant donné** coordonnées invalides ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** message explicite.

**US-MON-004-CA03 — Cas frontière**

- **Étant donné** bords raccordés ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** même région logique.

**US-MON-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MON-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier taille et convention de coordonnées. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : retrouver une cible communiquée. |
| E | Qualifier U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **position normalisée et identifiée sans ambiguïté**.
- [ ] Le cas frontière est vérifié : **bords raccordés → même région logique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-005"></a>
## US-MON-005 — Lire l’influence territoriale

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les limites et propriétaires de régions afin de planifier mon expansion.

### 2. Conversation — règles et décisions

- **Préconditions :** territoires calculés.
- **Règles / traces :** G08 et SS-033/034.
- **Question à traiter :** Qualifier formule, cadence et conflits.
- **Incertitudes liées :** `U15` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-005-CA01 — Parcours nominal**

- **Étant donné** territoires calculés ;
- **Quand** je réalise le parcours « Lire l’influence territoriale » ;
- **Alors** frontières suivent les cases et la date de calcul.

**US-MON-005-CA02 — Refus ou exception**

- **Étant donné** couleur seule ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune relation allié/ennemi inventée.

**US-MON-005-CA03 — Cas frontière**

- **Étant donné** variation d’influence ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** mise à jour cohérente.

**US-MON-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MON-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier formule, cadence et conflits. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier mon expansion. |
| E | Qualifier U15 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **frontières suivent les cases et la date de calcul**.
- [ ] Le cas frontière est vérifié : **variation d’influence → mise à jour cohérente**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-006"></a>
## US-MON-006 — Examiner un emplacement de colonie

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter l’éligibilité d’une région libre afin de préparer une nouvelle cité.

### 2. Conversation — règles et décisions

- **Préconditions :** emplacement ciblé.
- **Règles / traces :** SS-040 et G08.
- **Question à traiter :** Qualifier limites et réservation du site.
- **Incertitudes liées :** `U16` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-CITY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-006-CA01 — Parcours nominal**

- **Étant donné** emplacement ciblé ;
- **Quand** je réalise le parcours « Examiner un emplacement de colonie » ;
- **Alors** droits, distance et territoire sont évalués.

**US-MON-006-CA02 — Refus ou exception**

- **Étant donné** place déjà occupée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** colonisation refusée.

**US-MON-006-CA03 — Cas frontière**

- **Étant donné** limite commerciale ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** distincte du droit par rang.

**US-MON-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MON-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier limites et réservation du site. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer une nouvelle cité. |
| E | Qualifier U16 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **droits, distance et territoire sont évalués**.
- [ ] Le cas frontière est vérifié : **limite commerciale → distincte du droit par rang**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-007"></a>
## US-MON-007 — Fonder une cité

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite engager la colonisation d’un site valide afin de étendre mon royaume.

### 2. Conversation — règles et décisions

- **Préconditions :** héros, droit et ressources disponibles.
- **Règles / traces :** G08 ; coût x200 non universel.
- **Question à traiter :** Qualifier coût, trajet et état initial.
- **Incertitudes liées :** `U16`, `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-006](12-MON.md#us-mon-006).
- **Exigences :** `REQ-CITY-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-007-CA01 — Parcours nominal**

- **Étant donné** héros, droit et ressources disponibles ;
- **Quand** je réalise le parcours « Fonder une cité » ;
- **Alors** mission et nouvelle cité suivent le profil.

**US-MON-007-CA02 — Refus ou exception**

- **Étant donné** cible prise entre-temps ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** résolution sans double cité.

**US-MON-007-CA03 — Cas frontière**

- **Étant donné** confirmation répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une colonie.

**US-MON-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MON-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier coût, trajet et état initial. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : étendre mon royaume. |
| E | Qualifier U16, U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **mission et nouvelle cité suivent le profil**.
- [ ] Le cas frontière est vérifié : **confirmation répétée → une colonie**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-008"></a>
## US-MON-008 — Retrouver mes villes

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite naviguer entre mes cités depuis le monde afin de gérer un royaume dispersé.

### 2. Conversation — règles et décisions

- **Préconditions :** plusieurs cités possédées.
- **Règles / traces :** Panneau royaume des captures.
- **Question à traiter :** Qualifier nommage et accès rapide.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-UI-01`, `REQ-UI-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-008-CA01 — Parcours nominal**

- **Étant donné** plusieurs cités possédées ;
- **Quand** je réalise le parcours « Retrouver mes villes » ;
- **Alors** sélection recentre la bonne région.

**US-MON-008-CA02 — Refus ou exception**

- **Étant donné** cité perdue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** gestion privée retirée.

**US-MON-008-CA03 — Cas frontière**

- **Étant donné** nom identique ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** identifiants distinguent les villes.

**US-MON-008-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MON-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier nommage et accès rapide. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : gérer un royaume dispersé. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **sélection recentre la bonne région**.
- [ ] Le cas frontière est vérifié : **nom identique → identifiants distinguent les villes**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-009"></a>
## US-MON-009 — Placer un repère de carte

**Priorité proposée :** P2 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite mémoriser une position utile afin de retrouver mes objectifs.

### 2. Conversation — règles et décisions

- **Préconditions :** fonction de repère autorisée.
- **Règles / traces :** Alerte de carte visible SS-040, fonctions à qualifier.
- **Question à traiter :** Distinguer repère, alerte et diffusion collective.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-004](12-MON.md#us-mon-004).
- **Exigences :** `REQ-UI-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-MON-009-CA01 — Parcours nominal**

- **Étant donné** fonction de repère autorisée ;
- **Quand** je réalise le parcours « Placer un repère de carte » ;
- **Alors** repère personnel attaché aux coordonnées du monde.

**US-MON-009-CA02 — Refus ou exception**

- **Étant donné** partage non demandé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** repère non public.

**US-MON-009-CA03 — Cas frontière**

- **Étant donné** reconnexion ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** repère conservé selon contrat.

**US-MON-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-MON-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Distinguer repère, alerte et diffusion collective. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : retrouver mes objectifs. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **repère personnel attaché aux coordonnées du monde**.
- [ ] Le cas frontière est vérifié : **reconnexion → repère conservé selon contrat**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-mon-010"></a>
## US-MON-010 — Voir les missions connues

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite afficher les routes et marqueurs accessibles afin de suivre l’activité militaire.

### 2. Conversation — règles et décisions

- **Préconditions :** des missions sont visibles selon mes droits.
- **Règles / traces :** SS-029/033.
- **Question à traiter :** Qualifier détection et visibilité partagée.
- **Incertitudes liées :** `U23`, `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-UI-05`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-MON-010-CA01 — Parcours nominal**

- **Étant donné** des missions sont visibles selon mes droits ;
- **Quand** je réalise le parcours « Voir les missions connues » ;
- **Alors** trajets distingués des frontières et sélections.

**US-MON-010-CA02 — Refus ou exception**

- **Étant donné** mission ennemie non détectée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non révélée.

**US-MON-010-CA03 — Cas frontière**

- **Étant donné** dézoom ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** confidentialité inchangée.

**US-MON-010-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-MON-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier détection et visibilité partagée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : suivre l’activité militaire. |
| E | Qualifier U23, U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **trajets distingués des frontières et sélections**.
- [ ] Le cas frontière est vérifié : **dézoom → confidentialité inchangée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

