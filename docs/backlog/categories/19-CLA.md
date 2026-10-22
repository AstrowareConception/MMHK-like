# 19. Classements et voies de progression

12 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-CLA-001 — Consulter mes trois voies](#us-cla-001)
- [US-CLA-002 — Calculer la Domination](#us-cla-002)
- [US-CLA-003 — Calculer l’Honneur](#us-cla-003)
- [US-CLA-004 — Calculer la Richesse](#us-cla-004)
- [US-CLA-005 — Franchir un rang personnel](#us-cla-005)
- [US-CLA-006 — Recevoir une récompense de rang](#us-cla-006)
- [US-CLA-007 — Débloquer un droit de cité](#us-cla-007)
- [US-CLA-008 — Consulter les classements personnels](#us-cla-008)
- [US-CLA-009 — Retrouver un royaume classé](#us-cla-009)
- [US-CLA-010 — Calculer le score d’alliance](#us-cla-010)
- [US-CLA-011 — Franchir un rang d’alliance](#us-cla-011)
- [US-CLA-012 — Consulter le classement des alliances](#us-cla-012)

<a id="us-cla-001"></a>
## US-CLA-001 — Consulter mes trois voies

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir Domination, Honneur et Richesse afin de choisir mon axe de progression.

### 2. Conversation — règles et décisions

- **Préconditions :** un royaume existe.
- **Règles / traces :** G19–G21.
- **Question à traiter :** Qualifier fréquence de recalcul.
- **Incertitudes liées :** `U01` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-004](01-ACC.md#us-acc-004).
- **Exigences :** `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-001-CA01 — Parcours nominal**

- **Étant donné** un royaume existe ;
- **Quand** je réalise le parcours « Consulter mes trois voies » ;
- **Alors** scores et rangs de chaque voie séparés.

**US-CLA-001-CA02 — Refus ou exception**

- **Étant donné** score élevé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de monnaie dépensable créée.

**US-CLA-001-CA03 — Cas frontière**

- **Étant donné** date de calcul ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** affichée si différée.

**US-CLA-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CLA-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier fréquence de recalcul. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir mon axe de progression. |
| E | Qualifier U01 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **scores et rangs de chaque voie séparés**.
- [ ] Le cas frontière est vérifié : **date de calcul → affichée si différée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-002"></a>
## US-CLA-002 — Calculer la Domination

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver la valeur de mes bâtiments et armées afin de mesurer ma puissance de royaume.

### 2. Conversation — règles et décisions

- **Préconditions :** actifs admissibles présents.
- **Règles / traces :** G19 et champs domination du catalogue.
- **Question à traiter :** Qualifier cumul et instantané des actifs.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-001](19-CLA.md#us-cla-001).
- **Exigences :** `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-002-CA01 — Parcours nominal**

- **Étant donné** actifs admissibles présents ;
- **Quand** je réalise le parcours « Calculer la Domination » ;
- **Alors** assiettes du profil expliquées.

**US-CLA-002-CA02 — Refus ou exception**

- **Étant donné** coût du dernier bâtiment ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de 20 % naïf universel.

**US-CLA-002-CA03 — Cas frontière**

- **Étant donné** perte d’armée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** part courante recalculée selon profil.

**US-CLA-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CLA-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier cumul et instantané des actifs. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : mesurer ma puissance de royaume. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **assiettes du profil expliquées**.
- [ ] Le cas frontière est vérifié : **perte d’armée → part courante recalculée selon profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-003"></a>
## US-CLA-003 — Calculer l’Honneur

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir l’effet des combats admissibles afin de suivre ma progression militaire.

### 2. Conversation — règles et décisions

- **Préconditions :** XP et récompenses d’Honneur validées.
- **Règles / traces :** G20 et CODE-01-COMBAT.
- **Question à traiter :** Qualifier assiette et récompenses additionnelles.
- **Incertitudes liées :** `U13` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-001](19-CLA.md#us-cla-001), [US-COM-016](11-COM.md#us-com-016).
- **Exigences :** `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-003-CA01 — Parcours nominal**

- **Étant donné** XP et récompenses d’Honneur validées ;
- **Quand** je réalise le parcours « Calculer l’Honneur » ;
- **Alors** contributions admises ajoutées selon règle.

**US-CLA-003-CA02 — Refus ou exception**

- **Étant donné** rapport relu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de points nouveaux.

**US-CLA-003-CA03 — Cas frontière**

- **Étant donné** défaite avec XP ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** traitement du profil conservé.

**US-CLA-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CLA-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-001, US-COM-016. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier assiette et récompenses additionnelles. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : suivre ma progression militaire. |
| E | Qualifier U13 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **contributions admises ajoutées selon règle**.
- [ ] Le cas frontière est vérifié : **défaite avec XP → traitement du profil conservé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-004"></a>
## US-CLA-004 — Calculer la Richesse

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les revenus retenus dans ma voie afin de planifier ma progression économique.

### 2. Conversation — règles et décisions

- **Préconditions :** production et gains qualifiés existent.
- **Règles / traces :** G21, communes1000 et rares2000 dans le guide.
- **Question à traiter :** Qualifier toutes les sources et arrondis.
- **Incertitudes liées :** `U02`, `U04` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-001](19-CLA.md#us-cla-001), [US-ECO-003](03-ECO.md#us-eco-003).
- **Exigences :** `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-004-CA01 — Parcours nominal**

- **Étant donné** production et gains qualifiés existent ;
- **Quand** je réalise le parcours « Calculer la Richesse » ;
- **Alors** ressources valorisées selon leur catégorie.

**US-CLA-004-CA02 — Refus ou exception**

- **Étant donné** achat marché ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de création de Richesse si G21 retenu.

**US-CLA-004-CA03 — Cas frontière**

- **Étant donné** pillage PvP ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** distinct du butin PvE admissible.

**US-CLA-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CLA-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-001, US-ECO-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier toutes les sources et arrondis. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier ma progression économique. |
| E | Qualifier U02, U04 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **ressources valorisées selon leur catégorie**.
- [ ] Le cas frontière est vérifié : **pillage PvP → distinct du butin PvE admissible**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-005"></a>
## US-CLA-005 — Franchir un rang personnel

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir le rang correspondant à mon score afin de débloquer les capacités prévues.

### 2. Conversation — règles et décisions

- **Préconditions :** score atteint un seuil configuré.
- **Règles / traces :** G19–G21, tables versionnées.
- **Question à traiter :** Qualifier franchissements multiples et régressions.
- **Incertitudes liées :** `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-001](19-CLA.md#us-cla-001).
- **Exigences :** `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-005-CA01 — Parcours nominal**

- **Étant donné** score atteint un seuil configuré ;
- **Quand** je réalise le parcours « Franchir un rang personnel » ;
- **Alors** rang actualisé une fois.

**US-CLA-005-CA02 — Refus ou exception**

- **Étant donné** seuil non atteint ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’anticipation.

**US-CLA-005-CA03 — Cas frontière**

- **Étant donné** seuil exact ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** rang supérieur reconnu.

**US-CLA-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CLA-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier franchissements multiples et régressions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : débloquer les capacités prévues. |
| E | Qualifier U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rang actualisé une fois**.
- [ ] Le cas frontière est vérifié : **seuil exact → rang supérieur reconnu**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-006"></a>
## US-CLA-006 — Recevoir une récompense de rang

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir le gain de mon nouveau rang afin de poursuivre ma progression.

### 2. Conversation — règles et décisions

- **Préconditions :** rang qualifié nouvellement atteint.
- **Règles / traces :** G19–G21, récompenses incomplètes.
- **Question à traiter :** Retrouver récompenses et moment d’attribution.
- **Incertitudes liées :** `U38` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-005](19-CLA.md#us-cla-005).
- **Exigences :** `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-006-CA01 — Parcours nominal**

- **Étant donné** rang qualifié nouvellement atteint ;
- **Quand** je réalise le parcours « Recevoir une récompense de rang » ;
- **Alors** récompense de cette voie attribuée une fois.

**US-CLA-006-CA02 — Refus ou exception**

- **Étant donné** rang redescendu puis remonté ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** règle anti-duplication.

**US-CLA-006-CA03 — Cas frontière**

- **Étant donné** gain contribuant à une voie ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de boucle infinie.

**US-CLA-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CLA-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver récompenses et moment d’attribution. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : poursuivre ma progression. |
| E | Qualifier U38 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **récompense de cette voie attribuée une fois**.
- [ ] Le cas frontière est vérifié : **gain contribuant à une voie → pas de boucle infinie**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-007"></a>
## US-CLA-007 — Débloquer un droit de cité

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir la capacité liée à mon meilleur rang afin de préparer ma prochaine colonie.

### 2. Conversation — règles et décisions

- **Préconditions :** rangs personnels calculés.
- **Règles / traces :** G08.
- **Question à traiter :** Qualifier limites, Graals et régressions.
- **Incertitudes liées :** `U16` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-005](19-CLA.md#us-cla-005).
- **Exigences :** `REQ-PATH-01`, `REQ-CITY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-007-CA01 — Parcours nominal**

- **Étant donné** rangs personnels calculés ;
- **Quand** je réalise le parcours « Débloquer un droit de cité » ;
- **Alors** meilleur rang retenu plutôt que somme des trois.

**US-CLA-007-CA02 — Refus ou exception**

- **Étant donné** rangs additionnés ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun droit fictif.

**US-CLA-007-CA03 — Cas frontière**

- **Étant donné** baisse de rang ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** sort des cités existantes explicité.

**US-CLA-007-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CLA-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier limites, Graals et régressions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer ma prochaine colonie. |
| E | Qualifier U16 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **meilleur rang retenu plutôt que somme des trois**.
- [ ] Le cas frontière est vérifié : **baisse de rang → sort des cités existantes explicité**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-008"></a>
## US-CLA-008 — Consulter les classements personnels

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite me situer parmi les autres royaumes afin de mesurer ma progression relative.

### 2. Conversation — règles et décisions

- **Préconditions :** classements du monde accessibles.
- **Règles / traces :** Classements attestés, détails incomplets.
- **Question à traiter :** Qualifier actualisation et égalités.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-001](19-CLA.md#us-cla-001).
- **Exigences :** `REQ-PATH-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-008-CA01 — Parcours nominal**

- **Étant donné** classements du monde accessibles ;
- **Quand** je réalise le parcours « Consulter les classements personnels » ;
- **Alors** voie, score public et position visibles.

**US-CLA-008-CA02 — Refus ou exception**

- **Étant donné** autre monde ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** scores non mélangés.

**US-CLA-008-CA03 — Cas frontière**

- **Étant donné** égalité ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** départage ou rang partagé explicite.

**US-CLA-008-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CLA-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier actualisation et égalités. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : mesurer ma progression relative. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **voie, score public et position visibles**.
- [ ] Le cas frontière est vérifié : **égalité → départage ou rang partagé explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-009"></a>
## US-CLA-009 — Retrouver un royaume classé

**Priorité proposée :** P2 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite chercher ma position ou un voisin afin de accéder à une comparaison utile.

### 2. Conversation — règles et décisions

- **Préconditions :** un classement existe.
- **Règles / traces :** Navigation proposée dans les classements.
- **Question à traiter :** Définir recherche sans accès aux données privées.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-008](19-CLA.md#us-cla-008).
- **Exigences :** `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-CLA-009-CA01 — Parcours nominal**

- **Étant donné** un classement existe ;
- **Quand** je réalise le parcours « Retrouver un royaume classé » ;
- **Alors** recherche retrouve la bonne identité et page.

**US-CLA-009-CA02 — Refus ou exception**

- **Étant donné** homonyme ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** identifiant distingue les joueurs.

**US-CLA-009-CA03 — Cas frontière**

- **Étant donné** changement de classement ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** position datée.

**US-CLA-009-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CLA-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir recherche sans accès aux données privées. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : accéder à une comparaison utile. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **recherche retrouve la bonne identité et page**.
- [ ] Le cas frontière est vérifié : **changement de classement → position datée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-010"></a>
## US-CLA-010 — Calculer le score d’alliance

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les contributions collectives afin de comprendre notre progression.

### 2. Conversation — règles et décisions

- **Préconditions :** alliance et événements admissibles existent.
- **Règles / traces :** G09, score composite.
- **Question à traiter :** Qualifier coefficients et contributions conservées.
- **Incertitudes liées :** `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ALL-001](17-ALL.md#us-all-001).
- **Exigences :** `REQ-ALLY-01`, `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-010-CA01 — Parcours nominal**

- **Étant donné** alliance et événements admissibles existent ;
- **Quand** je réalise le parcours « Calculer le score d’alliance » ;
- **Alors** captures, XP, puissance, pillage et régions distingués.

**US-CLA-010-CA02 — Refus ou exception**

- **Étant donné** départ d’un membre ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** historique et courant non confondus.

**US-CLA-010-CA03 — Cas frontière**

- **Étant donné** coefficient suspect ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** version du barème affichée.

**US-CLA-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CLA-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ALL-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier coefficients et contributions conservées. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre notre progression. |
| E | Qualifier U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **captures, XP, puissance, pillage et régions distingués**.
- [ ] Le cas frontière est vérifié : **coefficient suspect → version du barème affichée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-011"></a>
## US-CLA-011 — Franchir un rang d’alliance

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir les capacités du rang collectif afin de préparer notre fin de campagne.

### 2. Conversation — règles et décisions

- **Préconditions :** score atteint un seuil qualifié.
- **Règles / traces :** G09/G01.
- **Question à traiter :** Qualifier seuils et ordre du déclenchement.
- **Incertitudes liées :** `U31`, `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-010](19-CLA.md#us-cla-010).
- **Exigences :** `REQ-ALLY-01`, `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-011-CA01 — Parcours nominal**

- **Étant donné** score atteint un seuil qualifié ;
- **Quand** je réalise le parcours « Franchir un rang d’alliance » ;
- **Alors** rang, capacité et éligibilité actualisés.

**US-CLA-011-CA02 — Refus ou exception**

- **Étant donné** seuil douteux ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de correction silencieuse.

**US-CLA-011-CA03 — Cas frontière**

- **Étant donné** premier rang7 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** événement unique de déclenchement.

**US-CLA-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-CLA-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-010. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier seuils et ordre du déclenchement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer notre fin de campagne. |
| E | Qualifier U31, U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rang, capacité et éligibilité actualisés**.
- [ ] Le cas frontière est vérifié : **premier rang7 → événement unique de déclenchement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-cla-012"></a>
## US-CLA-012 — Consulter le classement des alliances

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite comparer les forces collectives afin de orienter notre diplomatie.

### 2. Conversation — règles et décisions

- **Préconditions :** classements d’alliance disponibles.
- **Règles / traces :** G09 et fin de monde.
- **Question à traiter :** Qualifier égalités, périodicité et historique.
- **Incertitudes liées :** `U31`, `U34` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-010](19-CLA.md#us-cla-010).
- **Exigences :** `REQ-PATH-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-CLA-012-CA01 — Parcours nominal**

- **Étant donné** classements d’alliance disponibles ;
- **Quand** je réalise le parcours « Consulter le classement des alliances » ;
- **Alors** rang, score et données publiques séparés.

**US-CLA-012-CA02 — Refus ou exception**

- **Étant donné** détails militaires privés ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** non révélés.

**US-CLA-012-CA03 — Cas frontière**

- **Étant donné** clôture du monde ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** classement final gelé.

**US-CLA-012-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-CLA-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-010. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier égalités, périodicité et historique. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : orienter notre diplomatie. |
| E | Qualifier U31, U34 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rang, score et données publiques séparés**.
- [ ] Le cas frontière est vérifié : **clôture du monde → classement final gelé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

