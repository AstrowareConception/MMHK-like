# 2. Gestion de la ville et constructions

16 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-CIT-001 — Consulter ma ville](#us-cit-001)
- [US-CIT-002 — Examiner les prérequis](#us-cit-002)
- [US-CIT-003 — Obtenir un devis](#us-cit-003)
- [US-CIT-004 — Lancer un chantier](#us-cit-004)
- [US-CIT-005 — Suivre un chantier](#us-cit-005)
- [US-CIT-006 — Achever un bâtiment](#us-cit-006)
- [US-CIT-007 — Améliorer un bâtiment](#us-cit-007)
- [US-CIT-008 — Développer l’administration](#us-cit-008)
- [US-CIT-009 — Construire une demeure](#us-cit-009)
- [US-CIT-010 — Améliorer une demeure](#us-cit-010)
- [US-CIT-011 — Élever des fortifications](#us-cit-011)
- [US-CIT-012 — Développer la guilde](#us-cit-012)
- [US-CIT-013 — Ouvrir un service urbain](#us-cit-013)
- [US-CIT-014 — Augmenter les silos](#us-cit-014)
- [US-CIT-015 — Choisir un constructeur](#us-cit-015)
- [US-CIT-016 — Traiter un chantier interrompu](#us-cit-016)

<a id="us-cit-001"></a>
## US-CIT-001 — Consulter ma ville

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** COR · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir bâtiments et niveau urbain afin de choisir mon investissement.

### 2. Conversation — règles et décisions

- **Préconditions :** ma cité est sélectionnée.
- **Règles / traces :** SS-050 à 056.
- **Question à traiter :** Définir les états visuels temporaires.
- **Incertitudes liées :** `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-BUILD-01`, `REQ-UI-04`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-001-CA01 — Parcours nominal**

- **Étant donné** ma cité est sélectionnée ;
- **Quand** je réalise le parcours « Consulter ma ville » ;
- **Alors** états construits et en chantier sont distingués.

**US-CIT-001-CA02 — Refus ou exception**

- **Étant donné** cité adverse ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** gestion interdite.

**US-CIT-001-CA03 — Cas frontière**

- **Étant donné** chantier ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** bonus futur séparé du bonus actif.

**US-CIT-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CIT-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir les états visuels temporaires. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir mon investissement. |
| E | Qualifier U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **états construits et en chantier sont distingués**.
- [ ] Le cas frontière est vérifié : **chantier → bonus futur séparé du bonus actif**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-002"></a>
## US-CIT-002 — Examiner les prérequis

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite lire les conditions d’un bâtiment afin de comprendre les blocages.

### 2. Conversation — règles et décisions

- **Préconditions :** bâtiment de ma faction sélectionné.
- **Règles / traces :** Graphe CODE-01-DATA.
- **Question à traiter :** Résoudre les références incomplètes.
- **Incertitudes liées :** `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-001](02-CIT.md#us-cit-001).
- **Exigences :** `REQ-BUILD-01`, `REQ-DATA-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-002-CA01 — Parcours nominal**

- **Étant donné** bâtiment de ma faction sélectionné ;
- **Quand** je réalise le parcours « Examiner les prérequis » ;
- **Alors** ressources, niveau, bâtiment précédent et héros sont explicités.

**US-CIT-002-CA02 — Refus ou exception**

- **Étant donné** prérequis inconnu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** construction non prête.

**US-CIT-002-CA03 — Cas frontière**

- **Étant donné** amélioration ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** chaîne précédente conservée.

**US-CIT-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CIT-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Résoudre les références incomplètes. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre les blocages. |
| E | Qualifier U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **ressources, niveau, bâtiment précédent et héros sont explicités**.
- [ ] Le cas frontière est vérifié : **amélioration → chaîne précédente conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-003"></a>
## US-CIT-003 — Obtenir un devis

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite prévisualiser coût et échéance afin de mesurer mon investissement.

### 2. Conversation — règles et décisions

- **Préconditions :** construction envisagée.
- **Règles / traces :** Contrat FONCTIONNEL.
- **Question à traiter :** Fixer la validité du devis.
- **Incertitudes liées :** `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-002](02-CIT.md#us-cit-002).
- **Exigences :** `REQ-BUILD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-CIT-003-CA01 — Parcours nominal**

- **Étant donné** construction envisagée ;
- **Quand** je réalise le parcours « Obtenir un devis » ;
- **Alors** ressources, exécutant, durée et bonus sont présentés.

**US-CIT-003-CA02 — Refus ou exception**

- **Étant donné** durée inconnue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun zéro implicite.

**US-CIT-003-CA03 — Cas frontière**

- **Étant donné** bonus modifié ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** devis réévalué.

**US-CIT-003-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CIT-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer la validité du devis. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : mesurer mon investissement. |
| E | Qualifier U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **ressources, exécutant, durée et bonus sont présentés**.
- [ ] Le cas frontière est vérifié : **bonus modifié → devis réévalué**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-004"></a>
## US-CIT-004 — Lancer un chantier

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite engager une construction admissible afin de débloquer une capacité.

### 2. Conversation — règles et décisions

- **Préconditions :** devis valide et moyens disponibles.
- **Règles / traces :** Atomicité proposée.
- **Question à traiter :** Qualifier réservation du héros.
- **Incertitudes liées :** `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-003](02-CIT.md#us-cit-003).
- **Exigences :** `REQ-BUILD-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-004-CA01 — Parcours nominal**

- **Étant donné** devis valide et moyens disponibles ;
- **Quand** je réalise le parcours « Lancer un chantier » ;
- **Alors** un chantier et son débit exact sont créés.

**US-CIT-004-CA02 — Refus ou exception**

- **Étant donné** fonds dépensés ailleurs ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus intégral.

**US-CIT-004-CA03 — Cas frontière**

- **Étant donné** double confirmation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un chantier.

**US-CIT-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier réservation du héros. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : débloquer une capacité. |
| E | Qualifier U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **un chantier et son débit exact sont créés**.
- [ ] Le cas frontière est vérifié : **double confirmation → un chantier**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-005"></a>
## US-CIT-005 — Suivre un chantier

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter l’avancement afin de planifier ma prochaine action.

### 2. Conversation — règles et décisions

- **Préconditions :** un chantier est actif.
- **Règles / traces :** Persistance et SS-051.
- **Question à traiter :** Qualifier les pauses du monde.
- **Incertitudes liées :** `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-004](02-CIT.md#us-cit-004).
- **Exigences :** `REQ-BUILD-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-005-CA01 — Parcours nominal**

- **Étant donné** un chantier est actif ;
- **Quand** je réalise le parcours « Suivre un chantier » ;
- **Alors** état et fin serveur sont consultables.

**US-CIT-005-CA02 — Refus ou exception**

- **Étant donné** chantier adverse ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** détails privés masqués.

**US-CIT-005-CA03 — Cas frontière**

- **Étant donné** déconnexion ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** progression conservée.

**US-CIT-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CIT-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier les pauses du monde. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier ma prochaine action. |
| E | Qualifier U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **état et fin serveur sont consultables**.
- [ ] Le cas frontière est vérifié : **déconnexion → progression conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-006"></a>
## US-CIT-006 — Achever un bâtiment

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite utiliser une construction terminée afin de faire progresser ma cité.

### 2. Conversation — règles et décisions

- **Préconditions :** l’échéance est atteinte.
- **Règles / traces :** Activation selon catalogue.
- **Question à traiter :** Qualifier achèvement sous siège.
- **Incertitudes liées :** `U05`, `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-004](02-CIT.md#us-cit-004).
- **Exigences :** `REQ-BUILD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-006-CA01 — Parcours nominal**

- **Étant donné** l’échéance est atteinte ;
- **Quand** je réalise le parcours « Achever un bâtiment » ;
- **Alors** fonction, niveau et bonus sont actualisés.

**US-CIT-006-CA02 — Refus ou exception**

- **Étant donné** chantier incomplet ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de bonus anticipé.

**US-CIT-006-CA03 — Cas frontière**

- **Étant donné** échéance retraitée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** effet unique.

**US-CIT-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier achèvement sous siège. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : faire progresser ma cité. |
| E | Qualifier U05, U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **fonction, niveau et bonus sont actualisés**.
- [ ] Le cas frontière est vérifié : **échéance retraitée → effet unique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-007"></a>
## US-CIT-007 — Améliorer un bâtiment

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite passer au niveau suivant afin de renforcer sa fonction.

### 2. Conversation — règles et décisions

- **Préconditions :** niveau précédent disponible.
- **Règles / traces :** Chaînes CODE-01-DATA.
- **Question à traiter :** Qualifier effets pendant travaux.
- **Incertitudes liées :** `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-006](02-CIT.md#us-cit-006).
- **Exigences :** `REQ-BUILD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-007-CA01 — Parcours nominal**

- **Étant donné** niveau précédent disponible ;
- **Quand** je réalise le parcours « Améliorer un bâtiment » ;
- **Alors** remplacement de niveau programmé.

**US-CIT-007-CA02 — Refus ou exception**

- **Étant donné** niveau maximal ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** commande refusée.

**US-CIT-007-CA03 — Cas frontière**

- **Étant donné** administration ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** anciens revenus non additionnés.

**US-CIT-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier effets pendant travaux. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : renforcer sa fonction. |
| E | Qualifier U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **remplacement de niveau programmé**.
- [ ] Le cas frontière est vérifié : **administration → anciens revenus non additionnés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-008"></a>
## US-CIT-008 — Développer l’administration

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite améliorer le centre administratif afin de accroître mes revenus.

### 2. Conversation — règles et décisions

- **Préconditions :** prochaine étape admissible.
- **Règles / traces :** Catalogue 2000/4000/7000/13000 or par jour.
- **Question à traiter :** Qualifier les valeurs saisonnières.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-007](02-CIT.md#us-cit-007).
- **Exigences :** `REQ-BUILD-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-008-CA01 — Parcours nominal**

- **Étant donné** prochaine étape admissible ;
- **Quand** je réalise le parcours « Développer l’administration » ;
- **Alors** nouveau revenu remplace l’ancien.

**US-CIT-008-CA02 — Refus ou exception**

- **Étant donné** prérequis absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** saut refusé.

**US-CIT-008-CA03 — Cas frontière**

- **Étant donné** bonus proportionnel ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** base correcte.

**US-CIT-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier les valeurs saisonnières. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : accroître mes revenus. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **nouveau revenu remplace l’ancien**.
- [ ] Le cas frontière est vérifié : **bonus proportionnel → base correcte**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-009"></a>
## US-CIT-009 — Construire une demeure

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite ouvrir un tier militaire afin de diversifier mon armée.

### 2. Conversation — règles et décisions

- **Préconditions :** demeure de faction admissible.
- **Règles / traces :** T1–T7 CODE-01-DATA.
- **Question à traiter :** Qualifier première production.
- **Incertitudes liées :** `U06` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-006](02-CIT.md#us-cit-006).
- **Exigences :** `REQ-BUILD-01`, `REQ-RECRUIT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-009-CA01 — Parcours nominal**

- **Étant donné** demeure de faction admissible ;
- **Quand** je réalise le parcours « Construire une demeure » ;
- **Alors** tier accessible après achèvement.

**US-CIT-009-CA02 — Refus ou exception**

- **Étant donné** prérequis absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune production.

**US-CIT-009-CA03 — Cas frontière**

- **Étant donné** tier ouvert ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** autres demeures inchangées.

**US-CIT-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier première production. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : diversifier mon armée. |
| E | Qualifier U06 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **tier accessible après achèvement**.
- [ ] Le cas frontière est vérifié : **tier ouvert → autres demeures inchangées**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-010"></a>
## US-CIT-010 — Améliorer une demeure

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite ouvrir une unité améliorée afin de adapter mes contre-armes.

### 2. Conversation — règles et décisions

- **Préconditions :** demeure de base construite.
- **Règles / traces :** Squelette et archer squelette.
- **Question à traiter :** Qualifier stock partagé des variantes.
- **Incertitudes liées :** `U06` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-009](02-CIT.md#us-cit-009).
- **Exigences :** `REQ-BUILD-01`, `REQ-UPGRADE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-010-CA01 — Parcours nominal**

- **Étant donné** demeure de base construite ;
- **Quand** je réalise le parcours « Améliorer une demeure » ;
- **Alors** variante exacte débloquée.

**US-CIT-010-CA02 — Refus ou exception**

- **Étant donné** autre faction ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** lignée non substituée.

**US-CIT-010-CA03 — Cas frontière**

- **Étant donné** puissance inférieure ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** valeur conservée.

**US-CIT-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier stock partagé des variantes. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter mes contre-armes. |
| E | Qualifier U06 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **variante exacte débloquée**.
- [ ] Le cas frontière est vérifié : **puissance inférieure → valeur conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-011"></a>
## US-CIT-011 — Élever des fortifications

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite construire mes défenses afin de résister aux attaques.

### 2. Conversation — règles et décisions

- **Préconditions :** défense suivante admissible.
- **Règles / traces :** Fortin/citadelle/château.
- **Question à traiter :** Qualifier cumul et instant d’évaluation.
- **Incertitudes liées :** `U02`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-006](02-CIT.md#us-cit-006).
- **Exigences :** `REQ-BUILD-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-011-CA01 — Parcours nominal**

- **Étant donné** défense suivante admissible ;
- **Quand** je réalise le parcours « Élever des fortifications » ;
- **Alors** bonus actif à l’achèvement.

**US-CIT-011-CA02 — Refus ou exception**

- **Étant donné** combat avant fin ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ancien niveau retenu.

**US-CIT-011-CA03 — Cas frontière**

- **Étant donné** citadelle ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** production traitée séparément.

**US-CIT-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier cumul et instant d’évaluation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : résister aux attaques. |
| E | Qualifier U02, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **bonus actif à l’achèvement**.
- [ ] Le cas frontière est vérifié : **citadelle → production traitée séparément**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-012"></a>
## US-CIT-012 — Développer la guilde

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite améliorer la guilde de magie afin de ouvrir de nouveaux cercles.

### 2. Conversation — règles et décisions

- **Préconditions :** prérequis remplis.
- **Règles / traces :** Catalogue des guildes.
- **Question à traiter :** Qualifier apprentissage distinct de construction.
- **Incertitudes liées :** `U26` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-006](02-CIT.md#us-cit-006).
- **Exigences :** `REQ-BUILD-01`, `REQ-MAGIC-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-012-CA01 — Parcours nominal**

- **Étant donné** prérequis remplis ;
- **Quand** je réalise le parcours « Développer la guilde » ;
- **Alors** cercles accessibles selon niveau achevé.

**US-CIT-012-CA02 — Refus ou exception**

- **Étant donné** guilde insuffisante ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** sort supérieur inaccessible.

**US-CIT-012-CA03 — Cas frontière**

- **Étant donné** amélioration ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** écoles de faction inchangées.

**US-CIT-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier apprentissage distinct de construction. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : ouvrir de nouveaux cercles. |
| E | Qualifier U26 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **cercles accessibles selon niveau achevé**.
- [ ] Le cas frontière est vérifié : **amélioration → écoles de faction inchangées**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-013"></a>
## US-CIT-013 — Ouvrir un service urbain

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite construire le service sélectionné afin de accéder à sa fonction.

### 2. Conversation — règles et décisions

- **Préconditions :** marché ou taverne admissible.
- **Règles / traces :** Prérequis des services.
- **Question à traiter :** Scinder marché/taverne si nécessaire à l’estimation.
- **Incertitudes liées :** `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-006](02-CIT.md#us-cit-006).
- **Exigences :** `REQ-BUILD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-013-CA01 — Parcours nominal**

- **Étant donné** marché ou taverne admissible ;
- **Quand** je réalise le parcours « Ouvrir un service urbain » ;
- **Alors** seul le service construit est ouvert.

**US-CIT-013-CA02 — Refus ou exception**

- **Étant donné** bâtiment absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** opération refusée.

**US-CIT-013-CA03 — Cas frontière**

- **Étant donné** aide consultée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun bâtiment créé.

**US-CIT-013-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Scinder marché/taverne si nécessaire à l’estimation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : accéder à sa fonction. |
| E | Qualifier U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Le parcours comporte plusieurs transitions : examiner un découpage vertical avant engagement et attribuer de nouveaux identifiants aux fiches filles. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **seul le service construit est ouvert**.
- [ ] Le cas frontière est vérifié : **aide consultée → aucun bâtiment créé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-014"></a>
## US-CIT-014 — Augmenter les silos

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite améliorer le stockage afin de préparer un grand chantier.

### 2. Conversation — règles et décisions

- **Préconditions :** niveau suivant disponible.
- **Règles / traces :** G16 et exceptions de niveau urbain.
- **Question à traiter :** Qualifier arrondis et plafond d’or.
- **Incertitudes liées :** `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-007](02-CIT.md#us-cit-007).
- **Exigences :** `REQ-BUILD-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-014-CA01 — Parcours nominal**

- **Étant donné** niveau suivant disponible ;
- **Quand** je réalise le parcours « Augmenter les silos » ;
- **Alors** capacités recalculées à l’achèvement.

**US-CIT-014-CA02 — Refus ou exception**

- **Étant donné** maximum atteint ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** dépense refusée.

**US-CIT-014-CA03 — Cas frontière**

- **Étant donné** or et rares ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** plafonds distincts.

**US-CIT-014-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier arrondis et plafond d’or. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer un grand chantier. |
| E | Qualifier U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **capacités recalculées à l’achèvement**.
- [ ] Le cas frontière est vérifié : **or et rares → plafonds distincts**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-015"></a>
## US-CIT-015 — Choisir un constructeur

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite identifier un héros admissible afin de répartir mes activités.

### 2. Conversation — règles et décisions

- **Préconditions :** un chantier exige un exécutant.
- **Règles / traces :** Héros exécutants.
- **Question à traiter :** Qualifier simultanéité par héros et cité.
- **Incertitudes liées :** `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-HER-001](07-HER.md#us-her-001), [US-CIT-003](02-CIT.md#us-cit-003).
- **Exigences :** `REQ-BUILD-01`, `REQ-HERO-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CIT-015-CA01 — Parcours nominal**

- **Étant donné** un chantier exige un exécutant ;
- **Quand** je réalise le parcours « Choisir un constructeur » ;
- **Alors** disponibilités et motifs de refus sont visibles.

**US-CIT-015-CA02 — Refus ou exception**

- **Étant donné** héros en mission ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** engagement refusé.

**US-CIT-015-CA03 — Cas frontière**

- **Étant donné** chantiers concurrents ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** limite respectée.

**US-CIT-015-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CIT-015-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-HER-001, US-CIT-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier simultanéité par héros et cité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : répartir mes activités. |
| E | Qualifier U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **disponibilités et motifs de refus sont visibles**.
- [ ] Le cas frontière est vérifié : **chantiers concurrents → limite respectée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cit-016"></a>
## US-CIT-016 — Traiter un chantier interrompu

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître le devenir d’une construction arrêtée afin de mesurer les conséquences d’une capture.

### 2. Conversation — règles et décisions

- **Préconditions :** capture ou interruption autorisée.
- **Règles / traces :** Politique proposée à qualifier.
- **Question à traiter :** Définir annulation, capture et remboursements.
- **Incertitudes liées :** `U05`, `U14`, `U19` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-004](02-CIT.md#us-cit-004).
- **Exigences :** `REQ-BUILD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-CIT-016-CA01 — Parcours nominal**

- **Étant donné** capture ou interruption autorisée ;
- **Quand** je réalise le parcours « Traiter un chantier interrompu » ;
- **Alors** état, coût et exécutant suivent le profil.

**US-CIT-016-CA02 — Refus ou exception**

- **Étant donné** annulation interdite ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** commande absente.

**US-CIT-016-CA03 — Cas frontière**

- **Étant donné** interruption à échéance ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** résultat unique.

**US-CIT-016-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CIT-016-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir annulation, capture et remboursements. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : mesurer les conséquences d’une capture. |
| E | Qualifier U05, U14, U19 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **état, coût et exécutant suivent le profil**.
- [ ] Le cas frontière est vérifié : **interruption à échéance → résultat unique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

