# 20. Guerre des Larmes et monuments

24 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-LAR-001 — Déclencher la Guerre des Larmes](#us-lar-001)
- [US-LAR-002 — Vérifier l’éligibilité aux quêtes de Larme](#us-lar-002)
- [US-LAR-003 — Suivre les Larmes et leurs provenances](#us-lar-003)
- [US-LAR-004 — Construire la cartographie de la voie Domination](#us-lar-004)
- [US-LAR-005 — Lancer une expédition de cartographie](#us-lar-005)
- [US-LAR-006 — Découvrir l’obélisque révélé](#us-lar-006)
- [US-LAR-007 — Déchiffrer les indications de l’obélisque](#us-lar-007)
- [US-LAR-008 — Voir la révélation publique de la fouille](#us-lar-008)
- [US-LAR-009 — Préparer une région pour la fouille](#us-lar-009)
- [US-LAR-010 — Fouiller pour obtenir une Larme de Domination](#us-lar-010)
- [US-LAR-011 — Préparer le creuset de la voie Richesse](#us-lar-011)
- [US-LAR-012 — Fabriquer un composant de Larme de Richesse](#us-lar-012)
- [US-LAR-013 — Synthétiser la Larme de Richesse](#us-lar-013)
- [US-LAR-014 — Constater l’interruption d’un creuset capturé](#us-lar-014)
- [US-LAR-015 — Ouvrir le portail de la voie Honneur](#us-lar-015)
- [US-LAR-016 — Présenter une armée admissible aux épreuves](#us-lar-016)
- [US-LAR-017 — Résoudre un défi d’attaque puis de défense](#us-lar-017)
- [US-LAR-018 — Passer le campement entre deux défis](#us-lar-018)
- [US-LAR-019 — Vaincre le Chevalier de la Mort final](#us-lar-019)
- [US-LAR-020 — Construire un monument avec une Larme](#us-lar-020)
- [US-LAR-021 — Activer les effets d’un monument achevé](#us-lar-021)
- [US-LAR-022 — Résoudre la perte ou le changement de propriétaire d’un monument](#us-lar-022)
- [US-LAR-023 — Suivre les quatorze jours de suprématie](#us-lar-023)
- [US-LAR-024 — Interrompre la suprématie d’une alliance](#us-lar-024)

<a id="us-lar-001"></a>
## US-LAR-001 — Déclencher la Guerre des Larmes

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite être averti du passage à la Guerre des Larmes afin de adapter mes objectifs à la phase finale.

### 2. Conversation — règles et décisions

- **Préconditions :** aucune guerre des Larmes encore déclenchée et première alliance atteignant le rang 7.
- **Règles / traces :** G01 : première alliance rang 7 et première Larme.
- **Question à traiter :** Fixer l’ordre simultané et le bénéficiaire exact de la Larme initiale.
- **Incertitudes liées :** `U33`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CLA-011](19-CLA.md#us-cla-011).
- **Exigences :** `REQ-TEAR-01`, `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-001-CA01 — Parcours nominal**

- **Étant donné** aucune guerre des Larmes encore déclenchée et première alliance atteignant le rang 7 ;
- **Quand** je réalise le parcours « Déclencher la Guerre des Larmes » ;
- **Alors** événement mondial unique, attribution initiale documentée et date de déclenchement enregistrés.

**US-LAR-001-CA02 — Refus ou exception**

- **Étant donné** rang inférieur au seuil ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** la guerre ne démarre pas.

**US-LAR-001-CA03 — Cas frontière**

- **Étant donné** deux alliances au seuil au même instant ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** arbitrage déterministe sans deux premières Larmes.

**US-LAR-001-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CLA-011. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer l’ordre simultané et le bénéficiaire exact de la Larme initiale. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : adapter mes objectifs à la phase finale. |
| E | Qualifier U33, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **événement mondial unique, attribution initiale documentée et date de déclenchement enregistrés**.
- [ ] Le cas frontière est vérifié : **deux alliances au seuil au même instant → arbitrage déterministe sans deux premières Larmes**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-002"></a>
## US-LAR-002 — Vérifier l’éligibilité aux quêtes de Larme

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite savoir si mon alliance peut entreprendre les quêtes de Larme afin de engager mes ressources au bon moment.

### 2. Conversation — règles et décisions

- **Préconditions :** Guerre des Larmes ouverte.
- **Règles / traces :** G01 : alliances rang 4 ou plus.
- **Question à traiter :** Qualifier maintien d’éligibilité et changement d’alliance.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-001](20-LAR.md#us-lar-001), [US-ALL-003](17-ALL.md#us-all-003).
- **Exigences :** `REQ-TEAR-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-002-CA01 — Parcours nominal**

- **Étant donné** Guerre des Larmes ouverte ;
- **Quand** je réalise le parcours « Vérifier l’éligibilité aux quêtes de Larme » ;
- **Alors** accès expliqué selon le rang de mon alliance et les conditions de la voie.

**US-LAR-002-CA02 — Refus ou exception**

- **Étant donné** alliance sous le rang 4 ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** quête refusée avec motif.

**US-LAR-002-CA03 — Cas frontière**

- **Étant donné** changement d’alliance ou perte d’éligibilité en cours ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** sort de la quête explicite.

**US-LAR-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-LAR-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-001, US-ALL-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier maintien d’éligibilité et changement d’alliance. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : engager mes ressources au bon moment. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **accès expliqué selon le rang de mon alliance et les conditions de la voie**.
- [ ] Le cas frontière est vérifié : **changement d’alliance ou perte d’éligibilité en cours → sort de la quête explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-003"></a>
## US-LAR-003 — Suivre les Larmes et leurs provenances

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter les Larmes de mon royaume et les étapes des trois voies afin de choisir mon prochain effort collectif.

### 2. Conversation — règles et décisions

- **Préconditions :** accès aux informations autorisées de mon royaume.
- **Règles / traces :** G01–G04 ; distinguer objet Larme, monument et score collectif.
- **Question à traiter :** Définir propriétaire, transport éventuel et visibilité alliée.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-001](20-LAR.md#us-lar-001).
- **Exigences :** `REQ-TEAR-01`, `REQ-GRAIL-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-003-CA01 — Parcours nominal**

- **Étant donné** accès aux informations autorisées de mon royaume ;
- **Quand** je réalise le parcours « Suivre les Larmes et leurs provenances » ;
- **Alors** voies Domination, Richesse et Honneur distinguées, Larme obtenue ou volée et usage visibles.

**US-LAR-003-CA02 — Refus ou exception**

- **Étant donné** Larme adverse non publique ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** position privée masquée.

**US-LAR-003-CA03 — Cas frontière**

- **Étant donné** Larme consommée par un monument ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** elle ne reste pas disponible pour un second usage.

**US-LAR-003-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-LAR-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir propriétaire, transport éventuel et visibilité alliée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir mon prochain effort collectif. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **voies Domination, Richesse et Honneur distinguées, Larme obtenue ou volée et usage visibles**.
- [ ] Le cas frontière est vérifié : **Larme consommée par un monument → elle ne reste pas disponible pour un second usage**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-004"></a>
## US-LAR-004 — Construire la cartographie de la voie Domination

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite établir la guilde des cartographes requise afin de commencer la recherche d’une Larme.

### 2. Conversation — règles et décisions

- **Préconditions :** cité et voie éligibles, prérequis satisfaits.
- **Règles / traces :** G02 : 100000 or, 60 bois, 60 minerai et 7 jours, profil à qualifier.
- **Question à traiter :** Vérifier bâtiment exact, disponibilité du héros et version de ces valeurs.
- **Incertitudes liées :** `U33`, `U05`, `U02` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-002](20-LAR.md#us-lar-002), [US-CIT-006](02-CIT.md#us-cit-006).
- **Exigences :** `REQ-TEAR-01`, `REQ-BUILD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-004-CA01 — Parcours nominal**

- **Étant donné** cité et voie éligibles, prérequis satisfaits ;
- **Quand** je réalise le parcours « Construire la cartographie de la voie Domination » ;
- **Alors** construction débite le devis et rend les expéditions accessibles à son achèvement.

**US-LAR-004-CA02 — Refus ou exception**

- **Étant donné** ressources ou emplacement insuffisants ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun démarrage ni débit.

**US-LAR-004-CA03 — Cas frontière**

- **Étant donné** rechargement pendant les sept jours documentés ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** même date d’achèvement.

**US-LAR-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-002, US-CIT-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Vérifier bâtiment exact, disponibilité du héros et version de ces valeurs. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : commencer la recherche d’une Larme. |
| E | Qualifier U33, U05, U02 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **construction débite le devis et rend les expéditions accessibles à son achèvement**.
- [ ] Le cas frontière est vérifié : **rechargement pendant les sept jours documentés → même date d’achèvement**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-005"></a>
## US-LAR-005 — Lancer une expédition de cartographie

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite financer une expédition de recherche afin de localiser un obélisque utile.

### 2. Conversation — règles et décisions

- **Préconditions :** cartographie disponible et aucune restriction d’expédition violée.
- **Règles / traces :** G02 : 20000 or, 24 h, progression annoncée de 20 à 100 %.
- **Question à traiter :** Définir incréments, tirage et portée de la progression entre héros/cités.
- **Incertitudes liées :** `U33`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-004](20-LAR.md#us-lar-004).
- **Exigences :** `REQ-TEAR-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-005-CA01 — Parcours nominal**

- **Étant donné** cartographie disponible et aucune restriction d’expédition violée ;
- **Quand** je réalise le parcours « Lancer une expédition de cartographie » ;
- **Alors** coût débité une fois, résultat après la durée prévue et progression d’échec conservée.

**US-LAR-005-CA02 — Refus ou exception**

- **Étant donné** coût manquant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune expédition.

**US-LAR-005-CA03 — Cas frontière**

- **Étant donné** dernier palier de probabilité ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** succès garanti seulement si le profil valide le palier 100 %.

**US-LAR-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir incréments, tirage et portée de la progression entre héros/cités. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : localiser un obélisque utile. |
| E | Qualifier U33, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **coût débité une fois, résultat après la durée prévue et progression d’échec conservée**.
- [ ] Le cas frontière est vérifié : **dernier palier de probabilité → succès garanti seulement si le profil valide le palier 100 %**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-006"></a>
## US-LAR-006 — Découvrir l’obélisque révélé

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver l’obélisque indiqué par l’expédition afin de poursuivre la voie Domination.

### 2. Conversation — règles et décisions

- **Préconditions :** expédition réussie.
- **Règles / traces :** G02 : recherche dans un rayon annoncé de 10 cases ; géométrie non établie.
- **Question à traiter :** Fixer distance, sélection et existence préalable de l’obélisque.
- **Incertitudes liées :** `U33`, `U17` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-005](20-LAR.md#us-lar-005), [US-REL-008](06-REL.md#us-rel-008).
- **Exigences :** `REQ-TEAR-01`, `REQ-WORLD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-006-CA01 — Parcours nominal**

- **Étant donné** expédition réussie ;
- **Quand** je réalise le parcours « Découvrir l’obélisque révélé » ;
- **Alors** obélisque identifié sur la carte selon les droits de visibilité.

**US-LAR-006-CA02 — Refus ou exception**

- **Étant donné** expédition échouée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun faux emplacement révélé.

**US-LAR-006-CA03 — Cas frontière**

- **Étant donné** bord de carte ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** localisation valide sans coordonnée hors monde.

**US-LAR-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-LAR-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-005, US-REL-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer distance, sélection et existence préalable de l’obélisque. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : poursuivre la voie Domination. |
| E | Qualifier U33, U17 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **obélisque identifié sur la carte selon les droits de visibilité**.
- [ ] Le cas frontière est vérifié : **bord de carte → localisation valide sans coordonnée hors monde**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-007"></a>
## US-LAR-007 — Déchiffrer les indications de l’obélisque

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite faire déchiffrer les inscriptions découvertes afin de connaître la région de fouille.

### 2. Conversation — règles et décisions

- **Préconditions :** obélisque connu, guilde des mages niveau 3 et ressources disponibles.
- **Règles / traces :** G02 : 10000 or et 2 h 24, guilde des mages 3.
- **Question à traiter :** Qualifier héros requis, indice rendu et simultanéité.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-006](20-LAR.md#us-lar-006), [US-CIT-012](02-CIT.md#us-cit-012).
- **Exigences :** `REQ-TEAR-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-007-CA01 — Parcours nominal**

- **Étant donné** obélisque connu, guilde des mages niveau 3 et ressources disponibles ;
- **Quand** je réalise le parcours « Déchiffrer les indications de l’obélisque » ;
- **Alors** opération rend l’indice prévu après sa durée et enregistre son coût.

**US-LAR-007-CA02 — Refus ou exception**

- **Étant donné** guilde de niveau insuffisant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** déchiffrement indisponible.

**US-LAR-007-CA03 — Cas frontière**

- **Étant donné** nouvelle demande pendant l’opération ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de second débit.

**US-LAR-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-006, US-CIT-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier héros requis, indice rendu et simultanéité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : connaître la région de fouille. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **opération rend l’indice prévu après sa durée et enregistre son coût**.
- [ ] Le cas frontière est vérifié : **nouvelle demande pendant l’opération → pas de second débit**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-008"></a>
## US-LAR-008 — Voir la révélation publique de la fouille

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître les régions de fouille devenues publiques afin de disputer une Larme aux autres alliances.

### 2. Conversation — règles et décisions

- **Préconditions :** déchiffrement terminé et délai de publication applicable.
- **Règles / traces :** G02 : révélation publique annoncée 24 h plus tard.
- **Question à traiter :** Confirmer origine du délai et niveau de précision de l’annonce.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-007](20-LAR.md#us-lar-007).
- **Exigences :** `REQ-TEAR-01`, `REQ-VIS-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-008-CA01 — Parcours nominal**

- **Étant donné** déchiffrement terminé et délai de publication applicable ;
- **Quand** je réalise le parcours « Voir la révélation publique de la fouille » ;
- **Alors** information publique publiée à son échéance, avec sa précision autorisée.

**US-LAR-008-CA02 — Refus ou exception**

- **Étant donné** avant échéance ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune fuite par carte ou rapport public.

**US-LAR-008-CA03 — Cas frontière**

- **Étant donné** déconnexion au moment de publication ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** information accessible à la reconnexion.

**US-LAR-008-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-LAR-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Confirmer origine du délai et niveau de précision de l’annonce. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : disputer une Larme aux autres alliances. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **information publique publiée à son échéance, avec sa précision autorisée**.
- [ ] Le cas frontière est vérifié : **déconnexion au moment de publication → information accessible à la reconnexion**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-009"></a>
## US-LAR-009 — Préparer une région pour la fouille

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite identifier les combats régionaux restant à gagner afin de rendre la région fouillable.

### 2. Conversation — règles et décisions

- **Préconditions :** région de fouille connue.
- **Règles / traces :** G02 : tous les combats régionaux à libérer.
- **Question à traiter :** Définir quels occupants comptent et les droits de fouille hors de ses cités.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-007](20-LAR.md#us-lar-007), [US-REG-003](05-REG.md#us-reg-003).
- **Exigences :** `REQ-TEAR-01`, `REQ-REGION-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-009-CA01 — Parcours nominal**

- **Étant donné** région de fouille connue ;
- **Quand** je réalise le parcours « Préparer une région pour la fouille » ;
- **Alors** tous les obstacles PvE requis sont listés et la condition de libération se met à jour.

**US-LAR-009-CA02 — Refus ou exception**

- **Étant donné** un combat requis subsiste ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** fouille refusée avec obstacle identifié.

**US-LAR-009-CA03 — Cas frontière**

- **Étant donné** dernier combat gagné ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** éligibilité de fouille actualisée sans attente artificielle.

**US-LAR-009-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-LAR-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-007, US-REG-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir quels occupants comptent et les droits de fouille hors de ses cités. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : rendre la région fouillable. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **tous les obstacles PvE requis sont listés et la condition de libération se met à jour**.
- [ ] Le cas frontière est vérifié : **dernier combat gagné → éligibilité de fouille actualisée sans attente artificielle**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-010"></a>
## US-LAR-010 — Fouiller pour obtenir une Larme de Domination

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite affecter un héros à la fouille d’une case admissible afin de découvrir la Larme cachée.

### 2. Conversation — règles et décisions

- **Préconditions :** région libérée, case fouillable et héros disponible.
- **Règles / traces :** G02 : plusieurs héros possibles ; distribution aléatoire non établie.
- **Question à traiter :** Fixer occupation des cases, tirage, concurrence et traitement d’une Larme déjà trouvée.
- **Incertitudes liées :** `U33`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-009](20-LAR.md#us-lar-009), [US-HER-016](07-HER.md#us-her-016).
- **Exigences :** `REQ-TEAR-01`, `REQ-HERO-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-010-CA01 — Parcours nominal**

- **Étant donné** région libérée, case fouillable et héros disponible ;
- **Quand** je réalise le parcours « Fouiller pour obtenir une Larme de Domination » ;
- **Alors** fouille de 12 h résolue, découverte éventuelle attribuée une seule fois et case déjà fouillée mémorisée.

**US-LAR-010-CA02 — Refus ou exception**

- **Étant donné** case ou héros indisponible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ordre refusé sans immobilisation abusive.

**US-LAR-010-CA03 — Cas frontière**

- **Étant donné** deux fouilles concurrentes trouvent la même Larme ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un seul propriétaire et rapports cohérents.

**US-LAR-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-009, US-HER-016. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer occupation des cases, tirage, concurrence et traitement d’une Larme déjà trouvée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : découvrir la Larme cachée. |
| E | Qualifier U33, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **fouille de 12 h résolue, découverte éventuelle attribuée une seule fois et case déjà fouillée mémorisée**.
- [ ] Le cas frontière est vérifié : **deux fouilles concurrentes trouvent la même Larme → un seul propriétaire et rapports cohérents**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-011"></a>
## US-LAR-011 — Préparer le creuset de la voie Richesse

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite développer le creuset jusqu’au niveau requis afin de préparer les composants d’une Larme.

### 2. Conversation — règles et décisions

- **Préconditions :** cité éligible et progression économique suffisante.
- **Règles / traces :** G03 : creuset 5 ; chaîne complète non reconstruite.
- **Question à traiter :** Reconstituer niveaux, coûts, durées et prérequis du creuset.
- **Incertitudes liées :** `U33`, `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-002](20-LAR.md#us-lar-002), [US-CIT-007](02-CIT.md#us-cit-007).
- **Exigences :** `REQ-TEAR-01`, `REQ-BUILD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-011-CA01 — Parcours nominal**

- **Étant donné** cité éligible et progression économique suffisante ;
- **Quand** je réalise le parcours « Préparer le creuset de la voie Richesse » ;
- **Alors** prérequis et niveau 5 nécessaires à la suite sont visibles et vérifiés.

**US-LAR-011-CA02 — Refus ou exception**

- **Étant donné** chaîne de prérequis incomplète ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** synthèse indisponible.

**US-LAR-011-CA03 — Cas frontière**

- **Étant donné** creuset détruit ou déclassé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** opérations restantes réévaluées selon politique du profil.

**US-LAR-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-002, US-CIT-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Reconstituer niveaux, coûts, durées et prérequis du creuset. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer les composants d’une Larme. |
| E | Qualifier U33, U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **prérequis et niveau 5 nécessaires à la suite sont visibles et vérifiés**.
- [ ] Le cas frontière est vérifié : **creuset détruit ou déclassé → opérations restantes réévaluées selon politique du profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-012"></a>
## US-LAR-012 — Fabriquer un composant de Larme de Richesse

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite transformer une ressource rare en composant identifié afin de réunir les quatre composants nécessaires.

### 2. Conversation — règles et décisions

- **Préconditions :** creuset admissible et quantité requise de la ressource choisie.
- **Règles / traces :** G03 : quatre composants, chacun 228 d’une ressource rare, 3 jours.
- **Question à traiter :** Identifier les composants, parallélisme et stockage lors d’une capture.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-011](20-LAR.md#us-lar-011).
- **Exigences :** `REQ-TEAR-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-012-CA01 — Parcours nominal**

- **Étant donné** creuset admissible et quantité requise de la ressource choisie ;
- **Quand** je réalise le parcours « Fabriquer un composant de Larme de Richesse » ;
- **Alors** composant correspondant disponible après fabrication, coût et durée tracés.

**US-LAR-012-CA02 — Refus ou exception**

- **Étant donné** moins de 228 unités requises dans le profil qualifié ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun lancement.

**US-LAR-012-CA03 — Cas frontière**

- **Étant donné** fabrication du dernier composant manquant ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** assemblage rendu éligible, sans synthèse automatique.

**US-LAR-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-011. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Identifier les composants, parallélisme et stockage lors d’une capture. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réunir les quatre composants nécessaires. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **composant correspondant disponible après fabrication, coût et durée tracés**.
- [ ] Le cas frontière est vérifié : **fabrication du dernier composant manquant → assemblage rendu éligible, sans synthèse automatique**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-013"></a>
## US-LAR-013 — Synthétiser la Larme de Richesse

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite assembler les quatre composants et l’or requis afin de obtenir une Larme pour mon alliance.

### 2. Conversation — règles et décisions

- **Préconditions :** quatre composants disponibles et 500000 or dans le profil qualifié.
- **Règles / traces :** G03 : synthèse 500000 or et 14 jours.
- **Question à traiter :** Fixer moment de consommation, héros requis et interruption.
- **Incertitudes liées :** `U33`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-012](20-LAR.md#us-lar-012).
- **Exigences :** `REQ-TEAR-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-013-CA01 — Parcours nominal**

- **Étant donné** quatre composants disponibles et 500000 or dans le profil qualifié ;
- **Quand** je réalise le parcours « Synthétiser la Larme de Richesse » ;
- **Alors** composants et or réservés ou consommés selon règle fixée, Larme unique à la fin des 14 jours.

**US-LAR-013-CA02 — Refus ou exception**

- **Étant donné** composant absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** lancement impossible sans débit partiel.

**US-LAR-013-CA03 — Cas frontière**

- **Étant donné** deux soumissions de synthèse ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une seule opération avec les mêmes composants.

**US-LAR-013-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-013-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer moment de consommation, héros requis et interruption. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : obtenir une Larme pour mon alliance. |
| E | Qualifier U33, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **composants et or réservés ou consommés selon règle fixée, Larme unique à la fin des 14 jours**.
- [ ] Le cas frontière est vérifié : **deux soumissions de synthèse → une seule opération avec les mêmes composants**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-014"></a>
## US-LAR-014 — Constater l’interruption d’un creuset capturé

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite comprendre le sort de mes composants lors de la perte de la cité afin de mesurer le risque de la voie Richesse.

### 2. Conversation — règles et décisions

- **Préconditions :** cité abritant une préparation de Larme conquise.
- **Règles / traces :** G03 : capture de la cité réinitialisant les composants ; synthèse à qualifier.
- **Question à traiter :** Distinguer composants achevés, fabrication et Larme déjà obtenue.
- **Incertitudes liées :** `U33`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-012](20-LAR.md#us-lar-012), [US-SIE-012](16-SIE.md#us-sie-012).
- **Exigences :** `REQ-TEAR-01`, `REQ-SIEGE-02`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-014-CA01 — Parcours nominal**

- **Étant donné** cité abritant une préparation de Larme conquise ;
- **Quand** je réalise le parcours « Constater l’interruption d’un creuset capturé » ;
- **Alors** composants et synthèse traités selon la règle documentée, pertes expliquées aux propriétaires concernés.

**US-LAR-014-CA02 — Refus ou exception**

- **Étant donné** simple pillage sans conquête ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de remise à zéro assimilée à une capture.

**US-LAR-014-CA03 — Cas frontière**

- **Étant donné** capture à l’instant de fin de synthèse ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ordre d’événements fixé, sans objet dupliqué.

**US-LAR-014-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-014-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-012, US-SIE-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Distinguer composants achevés, fabrication et Larme déjà obtenue. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : mesurer le risque de la voie Richesse. |
| E | Qualifier U33, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **composants et synthèse traités selon la règle documentée, pertes expliquées aux propriétaires concernés**.
- [ ] Le cas frontière est vérifié : **capture à l’instant de fin de synthèse → ordre d’événements fixé, sans objet dupliqué**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-015"></a>
## US-LAR-015 — Ouvrir le portail de la voie Honneur

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite construire le portail d’épreuve avec un héros admissible afin de accéder aux défis de la Larme d’Honneur.

### 2. Conversation — règles et décisions

- **Préconditions :** héros niveau 35, guilde des mages 5 et autres prérequis qualifiés.
- **Règles / traces :** G04 : 100000 or, 90 bois, 90 minerai, 7 jours ; distinguer portail d’épreuve et portail S3.
- **Question à traiter :** Confirmer immobilisation, présence et version des prérequis.
- **Incertitudes liées :** `U33`, `U05` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-002](20-LAR.md#us-lar-002), [US-CIT-012](02-CIT.md#us-cit-012), [US-HER-007](07-HER.md#us-her-007).
- **Exigences :** `REQ-TEAR-01`, `REQ-BUILD-01`, `REQ-HERO-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-015-CA01 — Parcours nominal**

- **Étant donné** héros niveau 35, guilde des mages 5 et autres prérequis qualifiés ;
- **Quand** je réalise le parcours « Ouvrir le portail de la voie Honneur » ;
- **Alors** portail disponible après construction, coût et héros engagé visibles.

**US-LAR-015-CA02 — Refus ou exception**

- **Étant donné** héros sous le niveau requis ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ouverture refusée.

**US-LAR-015-CA03 — Cas frontière**

- **Étant donné** héros devient indisponible avant validation ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun ordre invalide accepté.

**US-LAR-015-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-015-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-002, US-CIT-012, US-HER-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Confirmer immobilisation, présence et version des prérequis. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : accéder aux défis de la Larme d’Honneur. |
| E | Qualifier U33, U05 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **portail disponible après construction, coût et héros engagé visibles**.
- [ ] Le cas frontière est vérifié : **héros devient indisponible avant validation → aucun ordre invalide accepté**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-016"></a>
## US-LAR-016 — Présenter une armée admissible aux épreuves

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite vérifier les limites de mon armée avant d’entrer afin de participer sans enfreindre les contraintes du portail.

### 2. Conversation — règles et décisions

- **Préconditions :** portail d’Honneur ouvert et armée préparée.
- **Règles / traces :** G04 : 100000 total, 50000 par peloton ; notion de puissance à qualifier.
- **Question à traiter :** Définir puissance brute ou modifiée, renforts, invocations et remplacement de troupes.
- **Incertitudes liées :** `U33`, `U18` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-015](20-LAR.md#us-lar-015), [US-ARM-014](09-ARM.md#us-arm-014).
- **Exigences :** `REQ-TEAR-01`, `REQ-ARMY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-016-CA01 — Parcours nominal**

- **Étant donné** portail d’Honneur ouvert et armée préparée ;
- **Quand** je réalise le parcours « Présenter une armée admissible aux épreuves » ;
- **Alors** validation des plafonds total et par peloton avant engagement.

**US-LAR-016-CA02 — Refus ou exception**

- **Étant donné** armée supérieure à 100000 ou peloton supérieur à 50000 de puissance selon profil ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus motivé.

**US-LAR-016-CA03 — Cas frontière**

- **Étant donné** armée exactement aux deux plafonds ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** admise si les autres prérequis sont satisfaits.

**US-LAR-016-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-016-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-015, US-ARM-014. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir puissance brute ou modifiée, renforts, invocations et remplacement de troupes. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : participer sans enfreindre les contraintes du portail. |
| E | Qualifier U33, U18 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **validation des plafonds total et par peloton avant engagement**.
- [ ] Le cas frontière est vérifié : **armée exactement aux deux plafonds → admise si les autres prérequis sont satisfaits**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-017"></a>
## US-LAR-017 — Résoudre un défi d’attaque puis de défense

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite affronter les deux étapes d’un défi du portail afin de progresser dans les quatre premières épreuves.

### 2. Conversation — règles et décisions

- **Préconditions :** héros et armée admis à une épreuve numérotée de 1 à 4.
- **Règles / traces :** G04 : attaque annoncée 5 min et défense 15 min plus tard ; préciser ancrage des délais.
- **Question à traiter :** Reconstituer armées adverses, sorts permis, défaite et chronologie exacte.
- **Incertitudes liées :** `U33`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-016](20-LAR.md#us-lar-016), [US-COM-017](11-COM.md#us-com-017).
- **Exigences :** `REQ-TEAR-01`, `REQ-COMBAT-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-017-CA01 — Parcours nominal**

- **Étant donné** héros et armée admis à une épreuve numérotée de 1 à 4 ;
- **Quand** je réalise le parcours « Résoudre un défi d’attaque puis de défense » ;
- **Alors** attaque puis défense s’enchaînent avec rapports, pertes et résultat de progression.

**US-LAR-017-CA02 — Refus ou exception**

- **Étant donné** échec à une étape ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune validation indue de l’épreuve complète.

**US-LAR-017-CA03 — Cas frontière**

- **Étant donné** déconnexion entre attaque et défense ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** défense résolue à l’échéance sans action client.

**US-LAR-017-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-017-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-016, US-COM-017. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Reconstituer armées adverses, sorts permis, défaite et chronologie exacte. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : progresser dans les quatre premières épreuves. |
| E | Qualifier U33, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Le parcours comporte plusieurs transitions : examiner un découpage vertical avant engagement et attribuer de nouveaux identifiants aux fiches filles. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **attaque puis défense s’enchaînent avec rapports, pertes et résultat de progression**.
- [ ] Le cas frontière est vérifié : **déconnexion entre attaque et défense → défense résolue à l’échéance sans action client**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-018"></a>
## US-LAR-018 — Passer le campement entre deux défis

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite suivre la récupération et l’attente entre les épreuves afin de préparer le défi suivant.

### 2. Conversation — règles et décisions

- **Préconditions :** épreuve intermédiaire réussie et héros au campement.
- **Règles / traces :** G04 : campement d’une semaine documenté entre défis ; variantes à isoler.
- **Question à traiter :** Qualifier soins, renforts, retrait, ravitaillement et départ de l’alliance.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-017](20-LAR.md#us-lar-017).
- **Exigences :** `REQ-TEAR-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-018-CA01 — Parcours nominal**

- **Étant donné** épreuve intermédiaire réussie et héros au campement ;
- **Quand** je réalise le parcours « Passer le campement entre deux défis » ;
- **Alors** prochaine échéance et actions permises affichées, progression conservée.

**US-LAR-018-CA02 — Refus ou exception**

- **Étant donné** prochaine épreuve avant disponibilité ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** lancement refusé.

**US-LAR-018-CA03 — Cas frontière**

- **Étant donné** profil classique et variante accélérée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** durée issue du profil sélectionné, sans mélange.

**US-LAR-018-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-018-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-017. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier soins, renforts, retrait, ravitaillement et départ de l’alliance. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer le défi suivant. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **prochaine échéance et actions permises affichées, progression conservée**.
- [ ] Le cas frontière est vérifié : **profil classique et variante accélérée → durée issue du profil sélectionné, sans mélange**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-019"></a>
## US-LAR-019 — Vaincre le Chevalier de la Mort final

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite accomplir la cinquième épreuve du portail afin de gagner une Larme d’Honneur.

### 2. Conversation — règles et décisions

- **Préconditions :** quatre épreuves validées et phase finale accessible.
- **Règles / traces :** G04 : cinquième défi contre le Chevalier de la Mort, phase finale annoncée sur une journée.
- **Question à traiter :** Établir adversaire exact, durée, revanche et récompenses secondaires.
- **Incertitudes liées :** `U33`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-018](20-LAR.md#us-lar-018), [US-COM-017](11-COM.md#us-com-017).
- **Exigences :** `REQ-TEAR-01`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-019-CA01 — Parcours nominal**

- **Étant donné** quatre épreuves validées et phase finale accessible ;
- **Quand** je réalise le parcours « Vaincre le Chevalier de la Mort final » ;
- **Alors** victoire finale attribue une seule Larme et clôt la progression correspondante.

**US-LAR-019-CA02 — Refus ou exception**

- **Étant donné** défaite finale ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de Larme attribuée.

**US-LAR-019-CA03 — Cas frontière**

- **Étant donné** résultat final traité à nouveau ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucune seconde récompense.

**US-LAR-019-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-019-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-018, US-COM-017. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Établir adversaire exact, durée, revanche et récompenses secondaires. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : gagner une Larme d’Honneur. |
| E | Qualifier U33, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **victoire finale attribue une seule Larme et clôt la progression correspondante**.
- [ ] Le cas frontière est vérifié : **résultat final traité à nouveau → aucune seconde récompense**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-020"></a>
## US-LAR-020 — Construire un monument avec une Larme

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite engager une Larme disponible dans une cité autorisée afin de contribuer à la victoire de mon alliance.

### 2. Conversation — règles et décisions

- **Préconditions :** Larme possédée, cité éligible sans monument et conditions de construction satisfaites.
- **Règles / traces :** G01 : un monument par cité, durée de base 10 jours, restrictions de simultanéité selon provenance.
- **Question à traiter :** Fixer coûts, héros, Larmes obtenues ou volées, annulation et comptage avant achèvement.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-003](20-LAR.md#us-lar-003), [US-CIT-006](02-CIT.md#us-cit-006).
- **Exigences :** `REQ-GRAIL-01`, `REQ-TEAR-01`, `REQ-BUILD-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-020-CA01 — Parcours nominal**

- **Étant donné** Larme possédée, cité éligible sans monument et conditions de construction satisfaites ;
- **Quand** je réalise le parcours « Construire un monument avec une Larme » ;
- **Alors** Larme affectée à une construction unique, coût et fin prévue visibles.

**US-LAR-020-CA02 — Refus ou exception**

- **Étant donné** cité possédant déjà un monument ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** second monument refusé.

**US-LAR-020-CA03 — Cas frontière**

- **Étant donné** deux constructions avec la même Larme ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une seule est acceptée.

**US-LAR-020-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-020-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-003, US-CIT-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer coûts, héros, Larmes obtenues ou volées, annulation et comptage avant achèvement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : contribuer à la victoire de mon alliance. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **Larme affectée à une construction unique, coût et fin prévue visibles**.
- [ ] Le cas frontière est vérifié : **deux constructions avec la même Larme → une seule est acceptée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-021"></a>
## US-LAR-021 — Activer les effets d’un monument achevé

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite bénéficier du monument de ma faction afin de renforcer mon royaume et la contribution collective.

### 2. Conversation — règles et décisions

- **Préconditions :** construction terminée et propriétaire/alliance admissibles.
- **Règles / traces :** G01 : exemple Nef Céleste ; bonus par faction et courbes collectives à qualifier.
- **Question à traiter :** Établir effets de chaque faction et sort des ordres déjà partis lors d’un changement de bonus.
- **Incertitudes liées :** `U33`, `U03`, `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-020](20-LAR.md#us-lar-020).
- **Exigences :** `REQ-GRAIL-01`, `REQ-ALLY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-021-CA01 — Parcours nominal**

- **Étant donné** construction terminée et propriétaire/alliance admissibles ;
- **Quand** je réalise le parcours « Activer les effets d’un monument achevé » ;
- **Alors** effets corrects appliqués une seule fois et contribution active recalculée.

**US-LAR-021-CA02 — Refus ou exception**

- **Étant donné** construction inachevée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun monument actif compté.

**US-LAR-021-CA03 — Cas frontière**

- **Étant donné** perte du monument ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** bonus révoqués sans conserver une production ou vitesse indue.

**US-LAR-021-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-021-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-020. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Établir effets de chaque faction et sort des ordres déjà partis lors d’un changement de bonus. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : renforcer mon royaume et la contribution collective. |
| E | Qualifier U33, U03, U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **effets corrects appliqués une seule fois et contribution active recalculée**.
- [ ] Le cas frontière est vérifié : **perte du monument → bonus révoqués sans conserver une production ou vitesse indue**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-022"></a>
## US-LAR-022 — Résoudre la perte ou le changement de propriétaire d’un monument

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître les conséquences d’une capture ou d’un départ d’alliance afin de anticiper la perte de ma contribution aux Larmes.

### 2. Conversation — règles et décisions

- **Préconditions :** cité à monument capturée ou propriétaire quittant l’alliance.
- **Règles / traces :** G01 : vol classique, possible destruction au départ ; ne pas importer la destruction définitive S4.
- **Question à traiter :** Valider matrice capture, vol, départ, exclusion, dissolution et reconstruction.
- **Incertitudes liées :** `U33`, `U14`, `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-021](20-LAR.md#us-lar-021), [US-SIE-014](16-SIE.md#us-sie-014), [US-ALL-005](17-ALL.md#us-all-005).
- **Exigences :** `REQ-GRAIL-01`, `REQ-SIEGE-03`, `REQ-ALLY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-022-CA01 — Parcours nominal**

- **Étant donné** cité à monument capturée ou propriétaire quittant l’alliance ;
- **Quand** je réalise le parcours « Résoudre la perte ou le changement de propriétaire d’un monument » ;
- **Alors** monument, Larme et compteurs modifiés selon la transition qualifiée, avec rapport.

**US-LAR-022-CA02 — Refus ou exception**

- **Étant donné** attaque repoussée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de transfert ni destruction de monument.

**US-LAR-022-CA03 — Cas frontière**

- **Étant donné** départ d’alliance pendant une capture ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une seule transition cohérente de propriété.

**US-LAR-022-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-022-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-021, US-SIE-014, US-ALL-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Valider matrice capture, vol, départ, exclusion, dissolution et reconstruction. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : anticiper la perte de ma contribution aux Larmes. |
| E | Qualifier U33, U14, U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Le parcours comporte plusieurs transitions : examiner un découpage vertical avant engagement et attribuer de nouveaux identifiants aux fiches filles. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **monument, Larme et compteurs modifiés selon la transition qualifiée, avec rapport**.
- [ ] Le cas frontière est vérifié : **départ d’alliance pendant une capture → une seule transition cohérente de propriété**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-023"></a>
## US-LAR-023 — Suivre les quatorze jours de suprématie

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir le nombre de monuments actifs et la continuité de notre avance afin de organiser la défense jusqu’à la victoire.

### 2. Conversation — règles et décisions

- **Préconditions :** alliance possédant un compte de monuments actifs confirmé.
- **Règles / traces :** G01 : 13 monuments actifs maintenus 14 jours.
- **Question à traiter :** Définir périmètre des monuments actifs, horloge et visibilité des rivaux.
- **Incertitudes liées :** `U34`, `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-021](20-LAR.md#us-lar-021).
- **Exigences :** `REQ-WIN-01`, `REQ-GRAIL-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-023-CA01 — Parcours nominal**

- **Étant donné** alliance possédant un compte de monuments actifs confirmé ;
- **Quand** je réalise le parcours « Suivre les quatorze jours de suprématie » ;
- **Alors** seuil 13 et échéance de 14 jours consécutifs affichés selon profil classique qualifié.

**US-LAR-023-CA02 — Refus ou exception**

- **Étant donné** monument en construction ou inactif ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de contribution indue.

**US-LAR-023-CA03 — Cas frontière**

- **Étant donné** quatorzième monument ajouté pendant la période ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** continuité existante conservée.

**US-LAR-023-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-LAR-023-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-021. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir périmètre des monuments actifs, horloge et visibilité des rivaux. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : organiser la défense jusqu’à la victoire. |
| E | Qualifier U34, U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **seuil 13 et échéance de 14 jours consécutifs affichés selon profil classique qualifié**.
- [ ] Le cas frontière est vérifié : **quatorzième monument ajouté pendant la période → continuité existante conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-lar-024"></a>
## US-LAR-024 — Interrompre la suprématie d’une alliance

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite constater la remise à zéro après une perte sous le seuil afin de savoir qu’une contre-offensive a retardé la victoire.

### 2. Conversation — règles et décisions

- **Préconditions :** compteur de continuité actif puis passage sous 13 monuments.
- **Règles / traces :** G01 : continuité requise, pas un cumul de jours disjoints.
- **Question à traiter :** Fixer traitement des événements simultanés et annonce d’interruption.
- **Incertitudes liées :** `U34`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-023](20-LAR.md#us-lar-023), [US-LAR-022](20-LAR.md#us-lar-022).
- **Exigences :** `REQ-WIN-01`, `REQ-TIME-01`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-LAR-024-CA01 — Parcours nominal**

- **Étant donné** compteur de continuité actif puis passage sous 13 monuments ;
- **Quand** je réalise le parcours « Interrompre la suprématie d’une alliance » ;
- **Alors** période interrompue et nouveau départ seulement après retour au seuil.

**US-LAR-024-CA02 — Refus ou exception**

- **Étant donné** perte d’un monument laissant 13 actifs ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune remise à zéro.

**US-LAR-024-CA03 — Cas frontière**

- **Étant donné** perte et achèvement à la même échéance ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** résultat conforme à un ordre d’événements explicite.

**US-LAR-024-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-LAR-024-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-023, US-LAR-022. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer traitement des événements simultanés et annonce d’interruption. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : savoir qu’une contre-offensive a retardé la victoire. |
| E | Qualifier U34, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **période interrompue et nouveau départ seulement après retour au seuil**.
- [ ] Le cas frontière est vérifié : **perte et achèvement à la même échéance → résultat conforme à un ordre d’événements explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

