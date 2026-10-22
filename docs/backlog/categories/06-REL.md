# 6. Reliques, sphinx, obélisques et sites

10 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-REL-001 — Identifier les sites remarquables](#us-rel-001)
- [US-REL-002 — Construire un sphinx](#us-rel-002)
- [US-REL-003 — Appliquer l’effet du sphinx](#us-rel-003)
- [US-REL-004 — Aménager un dolmen](#us-rel-004)
- [US-REL-005 — Comprendre le bonus du dolmen](#us-rel-005)
- [US-REL-006 — Construire un fort régional](#us-rel-006)
- [US-REL-007 — Installer un relais](#us-rel-007)
- [US-REL-008 — Inspecter un obélisque](#us-rel-008)
- [US-REL-009 — Distinguer les portails](#us-rel-009)
- [US-REL-010 — Perdre le bénéfice d’un site](#us-rel-010)

<a id="us-rel-001"></a>
## US-REL-001 — Identifier les sites remarquables

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite distinguer sphinx, obélisque et autres sites afin de comprendre leur usage.

### 2. Conversation — règles et décisions

- **Préconditions :** un site connu est visible.
- **Règles / traces :** Regroupement fonctionnel, nomenclature à qualifier.
- **Question à traiter :** Établir les types réellement disponibles en classique.
- **Incertitudes liées :** `U17`, `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-001](05-REG.md#us-reg-001).
- **Exigences :** `REQ-REGION-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-001-CA01 — Parcours nominal**

- **Étant donné** un site connu est visible ;
- **Quand** je réalise le parcours « Identifier les sites remarquables » ;
- **Alors** type, localisation et fonction connue présentés.

**US-REL-001-CA02 — Refus ou exception**

- **Étant donné** site non identifié ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun effet inventé.

**US-REL-001-CA03 — Cas frontière**

- **Étant donné** obélisque ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** site fixe, pas objet équipable.

**US-REL-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-REL-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Établir les types réellement disponibles en classique. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre leur usage. |
| E | Qualifier U17, U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **type, localisation et fonction connue présentés**.
- [ ] Le cas frontière est vérifié : **obélisque → site fixe, pas objet équipable**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-002"></a>
## US-REL-002 — Construire un sphinx

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite installer un sphinx autorisé afin de améliorer le soutien économique militaire.

### 2. Conversation — règles et décisions

- **Préconditions :** profil et emplacement admissibles.
- **Règles / traces :** Sphinx évoqué par G08 et entretien.
- **Question à traiter :** Retrouver coûts, limites et conditions.
- **Incertitudes liées :** `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-008](05-REG.md#us-reg-008).
- **Exigences :** `REQ-REGION-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-002-CA01 — Parcours nominal**

- **Étant donné** profil et emplacement admissibles ;
- **Quand** je réalise le parcours « Construire un sphinx » ;
- **Alors** construction soumise à ses propres prérequis.

**US-REL-002-CA02 — Refus ou exception**

- **Étant donné** coût inconnu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** commande non déclarée prête.

**US-REL-002-CA03 — Cas frontière**

- **Étant donné** case occupée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** construction refusée.

**US-REL-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REL-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver coûts, limites et conditions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : améliorer le soutien économique militaire. |
| E | Qualifier U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **construction soumise à ses propres prérequis**.
- [ ] Le cas frontière est vérifié : **case occupée → construction refusée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-003"></a>
## US-REL-003 — Appliquer l’effet du sphinx

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir sa réduction d’entretien afin de évaluer son intérêt.

### 2. Conversation — règles et décisions

- **Préconditions :** un sphinx est actif.
- **Règles / traces :** G08 et calculateur tardif.
- **Question à traiter :** Qualifier cumul et plafond de réduction.
- **Incertitudes liées :** `U07` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REL-002](06-REL.md#us-rel-002), [US-ECO-007](03-ECO.md#us-eco-007).
- **Exigences :** `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-003-CA01 — Parcours nominal**

- **Étant donné** un sphinx est actif ;
- **Quand** je réalise le parcours « Appliquer l’effet du sphinx » ;
- **Alors** réduction du profil expliquée dans l’entretien.

**US-REL-003-CA02 — Refus ou exception**

- **Étant donné** sphinx inactif ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de réduction.

**US-REL-003-CA03 — Cas frontière**

- **Étant donné** 7 % guide ou 5 % outil ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** aucun mélange.

**US-REL-003-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-REL-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REL-002, US-ECO-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier cumul et plafond de réduction. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : évaluer son intérêt. |
| E | Qualifier U07 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **réduction du profil expliquée dans l’entretien**.
- [ ] Le cas frontière est vérifié : **7 % guide ou 5 % outil → aucun mélange**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-004"></a>
## US-REL-004 — Aménager un dolmen

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite construire le site de progression autorisé afin de améliorer les gains d’expérience.

### 2. Conversation — règles et décisions

- **Préconditions :** type disponible dans le profil.
- **Règles / traces :** Dolmens présents dans le calculateur d’XP.
- **Question à traiter :** Retrouver construction et portée.
- **Incertitudes liées :** `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-008](05-REG.md#us-reg-008).
- **Exigences :** `REQ-REGION-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-004-CA01 — Parcours nominal**

- **Étant donné** type disponible dans le profil ;
- **Quand** je réalise le parcours « Aménager un dolmen » ;
- **Alors** coûts et conditions du dolmen sont contrôlés.

**US-REL-004-CA02 — Refus ou exception**

- **Étant donné** règles non retrouvées ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** construction bloquée en référence fidèle.

**US-REL-004-CA03 — Cas frontière**

- **Étant donné** doublon ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** limite du profil respectée.

**US-REL-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REL-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver construction et portée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : améliorer les gains d’expérience. |
| E | Qualifier U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **coûts et conditions du dolmen sont contrôlés**.
- [ ] Le cas frontière est vérifié : **doublon → limite du profil respectée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-005"></a>
## US-REL-005 — Comprendre le bonus du dolmen

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver sa contribution à l’expérience afin de mesurer le résultat d’un combat.

### 2. Conversation — règles et décisions

- **Préconditions :** un bonus dolmen est applicable.
- **Règles / traces :** CODE-01-COMBAT.
- **Question à traiter :** Qualifier portée locale et conditions de victoire.
- **Incertitudes liées :** `U13`, `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REL-004](06-REL.md#us-rel-004), [US-COM-016](11-COM.md#us-com-016).
- **Exigences :** `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-005-CA01 — Parcours nominal**

- **Étant donné** un bonus dolmen est applicable ;
- **Quand** je réalise le parcours « Comprendre le bonus du dolmen » ;
- **Alors** rapport distingue XP de base et modificateur.

**US-REL-005-CA02 — Refus ou exception**

- **Étant donné** lieu non admissible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** bonus absent.

**US-REL-005-CA03 — Cas frontière**

- **Étant donné** défaite ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** traitement spécifique du modificateur.

**US-REL-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-REL-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REL-004, US-COM-016. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier portée locale et conditions de victoire. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : mesurer le résultat d’un combat. |
| E | Qualifier U13, U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rapport distingue XP de base et modificateur**.
- [ ] Le cas frontière est vérifié : **défaite → traitement spécifique du modificateur**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-006"></a>
## US-REL-006 — Construire un fort régional

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite fortifier une position admissible afin de renforcer une défense locale.

### 2. Conversation — règles et décisions

- **Préconditions :** case et type de fort autorisés.
- **Règles / traces :** G10 et catalogue régional incomplet.
- **Question à traiter :** Qualifier coûts, niveaux et zone d’effet.
- **Incertitudes liées :** `U43`, `U18` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-008](05-REG.md#us-reg-008).
- **Exigences :** `REQ-REGION-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-006-CA01 — Parcours nominal**

- **Étant donné** case et type de fort autorisés ;
- **Quand** je réalise le parcours « Construire un fort régional » ;
- **Alors** fort actif associé à sa position.

**US-REL-006-CA02 — Refus ou exception**

- **Étant donné** préconditions inconnues ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de fort gratuit.

**US-REL-006-CA03 — Cas frontière**

- **Étant donné** combat hors zone ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** bonus non globalisé.

**US-REL-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REL-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier coûts, niveaux et zone d’effet. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : renforcer une défense locale. |
| E | Qualifier U43, U18 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **fort actif associé à sa position**.
- [ ] Le cas frontière est vérifié : **combat hors zone → bonus non globalisé**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-007"></a>
## US-REL-007 — Installer un relais

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-CODE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite construire un aménagement de déplacement afin de faciliter ma logistique.

### 2. Conversation — règles et décisions

- **Préconditions :** relais du catalogue admissible.
- **Règles / traces :** Deux entrées de relais dans le catalogue.
- **Question à traiter :** Retrouver fonctions exactes et cumuls.
- **Incertitudes liées :** `U09`, `U43` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-008](05-REG.md#us-reg-008).
- **Exigences :** `REQ-REGION-01`, `REQ-MOVE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-007-CA01 — Parcours nominal**

- **Étant donné** relais du catalogue admissible ;
- **Quand** je réalise le parcours « Installer un relais » ;
- **Alors** effet et utilisateurs concernés sont explicités.

**US-REL-007-CA02 — Refus ou exception**

- **Étant donné** trajet hors portée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun bonus.

**US-REL-007-CA03 — Cas frontière**

- **Étant donné** plusieurs relais ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** cumul selon profil.

**US-REL-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REL-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver fonctions exactes et cumuls. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : faciliter ma logistique. |
| E | Qualifier U09, U43 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **effet et utilisateurs concernés sont explicités**.
- [ ] Le cas frontière est vérifié : **plusieurs relais → cumul selon profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-008"></a>
## US-REL-008 — Inspecter un obélisque

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter un obélisque découvert afin de préparer la voie de Domination.

### 2. Conversation — règles et décisions

- **Préconditions :** obélisque connu sur la carte.
- **Règles / traces :** G02 ; traitement de la quête dans LAR.
- **Question à traiter :** Qualifier visibilité et partage de découverte.
- **Incertitudes liées :** `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-TEAR-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-008-CA01 — Parcours nominal**

- **Étant donné** obélisque connu sur la carte ;
- **Quand** je réalise le parcours « Inspecter un obélisque » ;
- **Alors** emplacement et accès à l’étape de déchiffrement visibles.

**US-REL-008-CA02 — Refus ou exception**

- **Étant donné** non découvert ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune localisation révélée.

**US-REL-008-CA03 — Cas frontière**

- **Étant donné** déjà déchiffré ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** progression retrouvée sans recommencer.

**US-REL-008-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-REL-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier visibilité et partage de découverte. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer la voie de Domination. |
| E | Qualifier U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **emplacement et accès à l’étape de déchiffrement visibles**.
- [ ] Le cas frontière est vérifié : **déjà déchiffré → progression retrouvée sans recommencer**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-009"></a>
## US-REL-009 — Distinguer les portails

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite identifier la fonction du portail sélectionné afin de éviter une mission inadaptée.

### 2. Conversation — règles et décisions

- **Préconditions :** un portail est visible.
- **Règles / traces :** G04 contre G01/G25 tardifs.
- **Question à traiter :** Qualifier les portails du profil retenu.
- **Incertitudes liées :** `U02`, `U33` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REL-001](06-REL.md#us-rel-001).
- **Exigences :** `REQ-TEAR-01`, `REQ-PROFILE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-REL-009-CA01 — Parcours nominal**

- **Étant donné** un portail est visible ;
- **Quand** je réalise le parcours « Distinguer les portails » ;
- **Alors** portail d’Honneur distinct des variantes tardives.

**US-REL-009-CA02 — Refus ou exception**

- **Étant donné** profil classique ancien ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de portail S4 automatique.

**US-REL-009-CA03 — Cas frontière**

- **Étant donné** même icône ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** type logique et prérequis distincts.

**US-REL-009-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-REL-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REL-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier les portails du profil retenu. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter une mission inadaptée. |
| E | Qualifier U02, U33 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **portail d’Honneur distinct des variantes tardives**.
- [ ] Le cas frontière est vérifié : **même icône → type logique et prérequis distincts**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rel-010"></a>
## US-REL-010 — Perdre le bénéfice d’un site

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir les effets recalculés après sa perte afin de comprendre les conséquences territoriales.

### 2. Conversation — règles et décisions

- **Préconditions :** site détruit ou cité perdue.
- **Règles / traces :** Contrat proposé de cycle de vie.
- **Question à traiter :** Qualifier conquête, destruction et portée des effets.
- **Incertitudes liées :** `U14`, `U21` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REL-001](06-REL.md#us-rel-001).
- **Exigences :** `REQ-REGION-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/02-MONDE-VILLES-ECONOMIE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-REL-010-CA01 — Parcours nominal**

- **Étant donné** site détruit ou cité perdue ;
- **Quand** je réalise le parcours « Perdre le bénéfice d’un site » ;
- **Alors** bonus retiré à l’instant défini.

**US-REL-010-CA02 — Refus ou exception**

- **Étant donné** ancien propriétaire ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’effet conservé indu.

**US-REL-010-CA03 — Cas frontière**

- **Étant donné** combat simultané ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** instantané du profil respecté.

**US-REL-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-REL-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REL-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier conquête, destruction et portée des effets. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre les conséquences territoriales. |
| E | Qualifier U14, U21 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **bonus retiré à l’instant défini**.
- [ ] Le cas frontière est vérifié : **combat simultané → instantané du profil respecté**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

