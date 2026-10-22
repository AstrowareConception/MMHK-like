# 15. Pillage et affrontements territoriaux

10 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-PVP-001 — Vérifier une cible de pillage](#us-pvp-001)
- [US-PVP-002 — Choisir la case principale](#us-pvp-002)
- [US-PVP-003 — Estimer le pillage](#us-pvp-003)
- [US-PVP-004 — Lancer un pillage](#us-pvp-004)
- [US-PVP-005 — Combattre une défense de pillage](#us-pvp-005)
- [US-PVP-006 — Charger le butin](#us-pvp-006)
- [US-PVP-007 — Subir des dégâts économiques](#us-pvp-007)
- [US-PVP-008 — Rétablir une production pillée](#us-pvp-008)
- [US-PVP-009 — Recevoir le retour du raid](#us-pvp-009)
- [US-PVP-010 — Comprendre les restrictions militaires](#us-pvp-010)

<a id="us-pvp-001"></a>
## US-PVP-001 — Vérifier une cible de pillage

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter son éligibilité afin de éviter une expédition impossible.

### 2. Conversation — règles et décisions

- **Préconditions :** une région adverse est sélectionnée.
- **Règles / traces :** G06/G10.
- **Question à traiter :** Qualifier protections et exceptions.
- **Incertitudes liées :** `U20`, `U22` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-003](12-MON.md#us-mon-003).
- **Exigences :** `REQ-RAID-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-001-CA01 — Parcours nominal**

- **Étant donné** une région adverse est sélectionnée ;
- **Quand** je réalise le parcours « Vérifier une cible de pillage » ;
- **Alors** relation, protection et conditions d’attaque contrôlées.

**US-PVP-001-CA02 — Refus ou exception**

- **Étant donné** cible protégée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ordre refusé avec motif.

**US-PVP-001-CA03 — Cas frontière**

- **Étant donné** propriété modifiée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** éligibilité actualisée.

**US-PVP-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-PVP-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier protections et exceptions. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter une expédition impossible. |
| E | Qualifier U20, U22 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **relation, protection et conditions d’attaque contrôlées**.
- [ ] Le cas frontière est vérifié : **propriété modifiée → éligibilité actualisée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-002"></a>
## US-PVP-002 — Choisir la case principale

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite désigner l’objectif du pillage afin de viser la production prioritaire.

### 2. Conversation — règles et décisions

- **Préconditions :** région connue et cible admissible.
- **Règles / traces :** SS-041.
- **Question à traiter :** Qualifier voisinage et types pillables.
- **Incertitudes liées :** `U22` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-001](15-PVP.md#us-pvp-001).
- **Exigences :** `REQ-RAID-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-002-CA01 — Parcours nominal**

- **Étant donné** région connue et cible admissible ;
- **Quand** je réalise le parcours « Choisir la case principale » ;
- **Alors** case principale et secondaires distinguées.

**US-PVP-002-CA02 — Refus ou exception**

- **Étant donné** case inconnue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** butin non promis.

**US-PVP-002-CA03 — Cas frontière**

- **Étant donné** cible inconnue sans butin ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** information conservée.

**US-PVP-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-PVP-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier voisinage et types pillables. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : viser la production prioritaire. |
| E | Qualifier U22 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **case principale et secondaires distinguées**.
- [ ] Le cas frontière est vérifié : **cible inconnue sans butin → information conservée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-003"></a>
## US-PVP-003 — Estimer le pillage

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir butin et dégâts estimés afin de arbitrer le risque de l’expédition.

### 2. Conversation — règles et décisions

- **Préconditions :** cible et forces préparées.
- **Règles / traces :** G06 et SS-041.
- **Question à traiter :** Qualifier rendement, capacité et arrondis.
- **Incertitudes liées :** `U22` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-002](15-PVP.md#us-pvp-002).
- **Exigences :** `REQ-RAID-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-003-CA01 — Parcours nominal**

- **Étant donné** cible et forces préparées ;
- **Quand** je réalise le parcours « Estimer le pillage » ;
- **Alors** estimations séparées pour principal et secondaires.

**US-PVP-003-CA02 — Refus ou exception**

- **Étant donné** production inconnue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** quantité marquée inconnue.

**US-PVP-003-CA03 — Cas frontière**

- **Étant donné** ratio temporel observé5:1 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de coefficient universel déduit.

**US-PVP-003-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-PVP-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-002. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier rendement, capacité et arrondis. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : arbitrer le risque de l’expédition. |
| E | Qualifier U22 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **estimations séparées pour principal et secondaires**.
- [ ] Le cas frontière est vérifié : **ratio temporel observé5:1 → pas de coefficient universel déduit**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-004"></a>
## US-PVP-004 — Lancer un pillage

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite engager une expédition contre la cible choisie afin de capturer des ressources.

### 2. Conversation — règles et décisions

- **Préconditions :** armée, route et cible valides.
- **Règles / traces :** G06, phases trajet/combat/pillage/retour.
- **Question à traiter :** Qualifier moment du choix et changements à l’arrivée.
- **Incertitudes liées :** `U22`, `U09` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-003](15-PVP.md#us-pvp-003), [US-MOV-003](13-MOV.md#us-mov-003).
- **Exigences :** `REQ-RAID-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-004-CA01 — Parcours nominal**

- **Étant donné** armée, route et cible valides ;
- **Quand** je réalise le parcours « Lancer un pillage » ;
- **Alors** mission réserve forces et cible de pillage.

**US-PVP-004-CA02 — Refus ou exception**

- **Étant donné** armée déjà engagée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus.

**US-PVP-004-CA03 — Cas frontière**

- **Étant donné** double envoi ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** une mission.

**US-PVP-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-PVP-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-003, US-MOV-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier moment du choix et changements à l’arrivée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : capturer des ressources. |
| E | Qualifier U22, U09 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **mission réserve forces et cible de pillage**.
- [ ] Le cas frontière est vérifié : **double envoi → une mission**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-005"></a>
## US-PVP-005 — Combattre une défense de pillage

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite affronter les défenseurs présents afin de obtenir l’accès au butin.

### 2. Conversation — règles et décisions

- **Préconditions :** mission atteint une cible défendue.
- **Règles / traces :** G06 et moteur commun.
- **Question à traiter :** Qualifier défense régionale et interception.
- **Incertitudes liées :** `U18`, `U22`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-004](15-PVP.md#us-pvp-004).
- **Exigences :** `REQ-RAID-01`, `REQ-COMBAT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-005-CA01 — Parcours nominal**

- **Étant donné** mission atteint une cible défendue ;
- **Quand** je réalise le parcours « Combattre une défense de pillage » ;
- **Alors** combat résolu avant attribution du pillage.

**US-PVP-005-CA02 — Refus ou exception**

- **Étant donné** défaite ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de butin automatiquement accordé.

**US-PVP-005-CA03 — Cas frontière**

- **Étant donné** défense arrivée simultanément ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ordre du profil.

**US-PVP-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-PVP-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-004. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier défense régionale et interception. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : obtenir l’accès au butin. |
| E | Qualifier U18, U22, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **combat résolu avant attribution du pillage**.
- [ ] Le cas frontière est vérifié : **défense arrivée simultanément → ordre du profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-006"></a>
## US-PVP-006 — Charger le butin

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite emporter les ressources admissibles afin de profiter de mon raid réussi.

### 2. Conversation — règles et décisions

- **Préconditions :** pillage effectif et capacité disponible.
- **Règles / traces :** G06 ; capacité inconnue.
- **Question à traiter :** Retrouver charge et partage des ressources.
- **Incertitudes liées :** `U22` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-005](15-PVP.md#us-pvp-005).
- **Exigences :** `REQ-RAID-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-006-CA01 — Parcours nominal**

- **Étant donné** pillage effectif et capacité disponible ;
- **Quand** je réalise le parcours « Charger le butin » ;
- **Alors** butin calculé, retiré à la source et placé en transit.

**US-PVP-006-CA02 — Refus ou exception**

- **Étant donné** capacité insuffisante ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de transport illimité.

**US-PVP-006-CA03 — Cas frontière**

- **Étant donné** production déjà endommagée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** assiette du profil.

**US-PVP-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-PVP-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver charge et partage des ressources. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : profiter de mon raid réussi. |
| E | Qualifier U22 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **butin calculé, retiré à la source et placé en transit**.
- [ ] Le cas frontière est vérifié : **production déjà endommagée → assiette du profil**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-007"></a>
## US-PVP-007 — Subir des dégâts économiques

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que défenseur, je souhaite voir l’effet d’un pillage sur mes sites afin de planifier ma récupération.

### 2. Conversation — règles et décisions

- **Préconditions :** un pillage ennemi produit des dégâts.
- **Règles / traces :** SS-041, dégâts temporels.
- **Question à traiter :** Qualifier cumul, réparation et restauration.
- **Incertitudes liées :** `U22` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-006](15-PVP.md#us-pvp-006).
- **Exigences :** `REQ-RAID-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-007-CA01 — Parcours nominal**

- **Étant donné** un pillage ennemi produit des dégâts ;
- **Quand** je réalise le parcours « Subir des dégâts économiques » ;
- **Alors** production affectée pour la durée configurée.

**US-PVP-007-CA02 — Refus ou exception**

- **Étant donné** site non touché ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de pénalité globale.

**US-PVP-007-CA03 — Cas frontière**

- **Étant donné** deux pillages ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** cumul ou prolongation selon règle.

**US-PVP-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-PVP-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier cumul, réparation et restauration. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : planifier ma récupération. |
| E | Qualifier U22 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **production affectée pour la durée configurée**.
- [ ] Le cas frontière est vérifié : **deux pillages → cumul ou prolongation selon règle**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-008"></a>
## US-PVP-008 — Rétablir une production pillée

**Priorité proposée :** P1 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que défenseur, je souhaite retrouver le rendement après les dégâts afin de reprendre mon développement.

### 2. Conversation — règles et décisions

- **Préconditions :** délai de dégâts arrivé à terme.
- **Règles / traces :** Cycle de récupération G06.
- **Question à traiter :** Qualifier restauration automatique et effets superposés.
- **Incertitudes liées :** `U22`, `U04` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-007](15-PVP.md#us-pvp-007).
- **Exigences :** `REQ-RAID-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-008-CA01 — Parcours nominal**

- **Étant donné** délai de dégâts arrivé à terme ;
- **Quand** je réalise le parcours « Rétablir une production pillée » ;
- **Alors** production rétablie au bon instant.

**US-PVP-008-CA02 — Refus ou exception**

- **Étant donné** dégâts encore actifs ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de restauration anticipée.

**US-PVP-008-CA03 — Cas frontière**

- **Étant donné** amélioration pendant dégâts ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** bases séparées.

**US-PVP-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-PVP-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier restauration automatique et effets superposés. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : reprendre mon développement. |
| E | Qualifier U22, U04 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **production rétablie au bon instant**.
- [ ] Le cas frontière est vérifié : **amélioration pendant dégâts → bases séparées**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-009"></a>
## US-PVP-009 — Recevoir le retour du raid

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver survivants et butin à destination afin de réemployer mes gains.

### 2. Conversation — règles et décisions

- **Préconditions :** mission de retour achevée.
- **Règles / traces :** Retour militaire et logistique.
- **Question à traiter :** Qualifier lieu de retour, charge et dépassement.
- **Incertitudes liées :** `U09`, `U22`, `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-006](15-PVP.md#us-pvp-006).
- **Exigences :** `REQ-RAID-01`, `REQ-STOCK-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-009-CA01 — Parcours nominal**

- **Étant donné** mission de retour achevée ;
- **Quand** je réalise le parcours « Recevoir le retour du raid » ;
- **Alors** forces et ressources créditées une fois.

**US-PVP-009-CA02 — Refus ou exception**

- **Étant donné** cité retour devenue interdite ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** politique explicite.

**US-PVP-009-CA03 — Cas frontière**

- **Étant donné** stock plein ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** excédent traité selon provenance.

**US-PVP-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-PVP-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier lieu de retour, charge et dépassement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : réemployer mes gains. |
| E | Qualifier U09, U22, U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **forces et ressources créditées une fois**.
- [ ] Le cas frontière est vérifié : **stock plein → excédent traité selon provenance**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-pvp-010"></a>
## US-PVP-010 — Comprendre les restrictions militaires

**Priorité proposée :** P0 · **Phases :** Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter les protections d’une cible afin de choisir une action légale.

### 2. Conversation — règles et décisions

- **Préconditions :** cible débutante, inactive ou dernière cité.
- **Règles / traces :** G10, exceptions partielles.
- **Question à traiter :** Qualifier inactivité, vacances et dernière cité.
- **Incertitudes liées :** `U20` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-PVP-001](15-PVP.md#us-pvp-001).
- **Exigences :** `REQ-RAID-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/05-CARTE-PVP-SIEGES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-PVP-010-CA01 — Parcours nominal**

- **Étant donné** cible débutante, inactive ou dernière cité ;
- **Quand** je réalise le parcours « Comprendre les restrictions militaires » ;
- **Alors** motif applicable affiché sans données cachées.

**US-PVP-010-CA02 — Refus ou exception**

- **Étant donné** profil sans exception ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’immunité inventée.

**US-PVP-010-CA03 — Cas frontière**

- **Étant donné** protection expirée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** droits recalculés.

**US-PVP-010-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-PVP-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-PVP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier inactivité, vacances et dernière cité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : choisir une action légale. |
| E | Qualifier U20 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **motif applicable affiché sans données cachées**.
- [ ] Le cas frontière est vérifié : **protection expirée → droits recalculés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

