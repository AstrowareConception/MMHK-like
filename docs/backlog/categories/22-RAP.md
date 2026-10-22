# 22. Rapports, courrier et récompenses

10 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-RAP-001 — Retrouver mes rapports dans une boîte organisée](#us-rap-001)
- [US-RAP-002 — Marquer un courrier comme lu](#us-rap-002)
- [US-RAP-003 — Archiver un rapport utile](#us-rap-003)
- [US-RAP-004 — Mettre un courrier à la corbeille et le restaurer](#us-rap-004)
- [US-RAP-005 — Partager un rapport de combat autorisé](#us-rap-005)
- [US-RAP-006 — Réclamer une récompense reçue par courrier](#us-rap-006)
- [US-RAP-007 — Comprendre l’expiration d’une récompense](#us-rap-007)
- [US-RAP-008 — Être averti de l’achèvement d’une mission](#us-rap-008)
- [US-RAP-009 — Consulter la chronologie de mes ordres](#us-rap-009)
- [US-RAP-010 — Échanger un message interne au monde](#us-rap-010)

<a id="us-rap-001"></a>
## US-RAP-001 — Retrouver mes rapports dans une boîte organisée

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter mes rapports par nature et date afin de retrouver le résultat de mes actions.

### 2. Conversation — règles et décisions

- **Préconditions :** rapports appartenant au joueur dans le monde sélectionné.
- **Règles / traces :** REQ-REPORT-01 et captures de rapports.
- **Question à traiter :** Définir catégories, tri et durée de conservation.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-003](01-ACC.md#us-acc-003).
- **Exigences :** `REQ-REPORT-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-RAP-001-CA01 — Parcours nominal**

- **Étant donné** rapports appartenant au joueur dans le monde sélectionné ;
- **Quand** je réalise le parcours « Retrouver mes rapports dans une boîte organisée » ;
- **Alors** liste paginée distingue combat, reconnaissance, économie et notifications disponibles.

**US-RAP-001-CA02 — Refus ou exception**

- **Étant donné** rapport d’un autre joueur non partagé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** absent de la liste et inaccessible directement.

**US-RAP-001-CA03 — Cas frontière**

- **Étant donné** page vide ou arrivée d’un nouveau rapport ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** navigation stable sans rapport perdu.

**US-RAP-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-RAP-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir catégories, tri et durée de conservation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : retrouver le résultat de mes actions. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **liste paginée distingue combat, reconnaissance, économie et notifications disponibles**.
- [ ] Le cas frontière est vérifié : **page vide ou arrivée d’un nouveau rapport → navigation stable sans rapport perdu**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-002"></a>
## US-RAP-002 — Marquer un courrier comme lu

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite distinguer les événements consultés des nouveaux afin de traiter les informations restantes.

### 2. Conversation — règles et décisions

- **Préconditions :** courrier accessible au destinataire.
- **Règles / traces :** Gestion de courrier proposée à partir de l’interface.
- **Question à traiter :** Confirmer existence historique d’un retour à non lu et sa portée.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-RAP-001](22-RAP.md#us-rap-001).
- **Exigences :** `REQ-REPORT-01`, `REQ-AUTH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-RAP-002-CA01 — Parcours nominal**

- **Étant donné** courrier accessible au destinataire ;
- **Quand** je réalise le parcours « Marquer un courrier comme lu » ;
- **Alors** ouverture met à jour l’état de lecture et le compteur de non lus.

**US-RAP-002-CA02 — Refus ou exception**

- **Étant donné** ouverture refusée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun état de lecture d’un autre joueur modifié.

**US-RAP-002-CA03 — Cas frontière**

- **Étant donné** même courrier ouvert sur deux sessions ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** compteur cohérent sans valeur négative.

**US-RAP-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-RAP-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-RAP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Confirmer existence historique d’un retour à non lu et sa portée. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : traiter les informations restantes. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **ouverture met à jour l’état de lecture et le compteur de non lus**.
- [ ] Le cas frontière est vérifié : **même courrier ouvert sur deux sessions → compteur cohérent sans valeur négative**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-003"></a>
## US-RAP-003 — Archiver un rapport utile

**Priorité proposée :** P2 · **Phases :** Early game, Mid game, End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite conserver un rapport hors de ma liste courante afin de garder une preuve sans encombrer mes nouveautés.

### 2. Conversation — règles et décisions

- **Préconditions :** rapport possédé et archivage autorisé.
- **Règles / traces :** Fonction d’organisation proposée, à confirmer dans le client d’origine.
- **Question à traiter :** Fixer capacité, expiration et interaction avec partage.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-RAP-001](22-RAP.md#us-rap-001).
- **Exigences :** `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-RAP-003-CA01 — Parcours nominal**

- **Étant donné** rapport possédé et archivage autorisé ;
- **Quand** je réalise le parcours « Archiver un rapport utile » ;
- **Alors** rapport retiré de la liste courante et retrouvable dans les archives.

**US-RAP-003-CA02 — Refus ou exception**

- **Étant donné** rapport portant une récompense non réclamée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** politique explicite, aucune récompense perdue sans indication.

**US-RAP-003-CA03 — Cas frontière**

- **Étant donné** archivage répété ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un seul rapport et même état final.

**US-RAP-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-RAP-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-RAP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer capacité, expiration et interaction avec partage. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : garder une preuve sans encombrer mes nouveautés. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **rapport retiré de la liste courante et retrouvable dans les archives**.
- [ ] Le cas frontière est vérifié : **archivage répété → un seul rapport et même état final**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-004"></a>
## US-RAP-004 — Mettre un courrier à la corbeille et le restaurer

**Priorité proposée :** P2 · **Phases :** Early game, Mid game, End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retirer puis récupérer un courrier supprimable afin de corriger une suppression involontaire.

### 2. Conversation — règles et décisions

- **Préconditions :** courrier possédé et corbeille activée par le profil d’interface.
- **Règles / traces :** Comportement proposé ; non attesté comme règle historique complète.
- **Question à traiter :** Décider corbeille, délai et protection des récompenses avant développement.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-RAP-001](22-RAP.md#us-rap-001).
- **Exigences :** `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-RAP-004-CA01 — Parcours nominal**

- **Étant donné** courrier possédé et corbeille activée par le profil d’interface ;
- **Quand** je réalise le parcours « Mettre un courrier à la corbeille et le restaurer » ;
- **Alors** déplacement puis restauration conservent contenu, lecture et récompense selon règle définie.

**US-RAP-004-CA02 — Refus ou exception**

- **Étant donné** courrier non supprimable ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus motivé.

**US-RAP-004-CA03 — Cas frontière**

- **Étant donné** expiration définitive ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** restauration indisponible et date limite annoncée.

**US-RAP-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-RAP-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-RAP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Décider corbeille, délai et protection des récompenses avant développement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : corriger une suppression involontaire. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **déplacement puis restauration conservent contenu, lecture et récompense selon règle définie**.
- [ ] Le cas frontière est vérifié : **expiration définitive → restauration indisponible et date limite annoncée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-005"></a>
## US-RAP-005 — Partager un rapport de combat autorisé

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite rendre un rapport lisible par les destinataires permis afin de préparer la stratégie avec mes alliés.

### 2. Conversation — règles et décisions

- **Préconditions :** rapport de combat consultable et droit de partage disponible.
- **Règles / traces :** REQ-REPORT-01/VIS-01 ; partage à qualifier.
- **Question à traiter :** Fixer portée, durée, données masquées et révocation.
- **Incertitudes liées :** `U31`, `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-COM-017](11-COM.md#us-com-017), [US-ALL-007](17-ALL.md#us-all-007).
- **Exigences :** `REQ-REPORT-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-RAP-005-CA01 — Parcours nominal**

- **Étant donné** rapport de combat consultable et droit de partage disponible ;
- **Quand** je réalise le parcours « Partager un rapport de combat autorisé » ;
- **Alors** destinataires autorisés voient une version dont les données respectent la politique de visibilité.

**US-RAP-005-CA02 — Refus ou exception**

- **Étant donné** lien transmis à un non-destinataire ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** accès refusé sans fuite du contenu.

**US-RAP-005-CA03 — Cas frontière**

- **Étant donné** départ du destinataire de l’alliance ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** accès maintenu ou révoqué selon politique explicite.

**US-RAP-005-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-RAP-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-COM-017, US-ALL-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer portée, durée, données masquées et révocation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer la stratégie avec mes alliés. |
| E | Qualifier U31, U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **destinataires autorisés voient une version dont les données respectent la politique de visibilité**.
- [ ] Le cas frontière est vérifié : **départ du destinataire de l’alliance → accès maintenu ou révoqué selon politique explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-006"></a>
## US-RAP-006 — Réclamer une récompense reçue par courrier

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite récupérer la récompense attachée à un événement valide afin de disposer de mon gain.

### 2. Conversation — règles et décisions

- **Préconditions :** courrier récompensé, non réclamé et non expiré.
- **Règles / traces :** G08 et REQ-REPORT-01 ; distinguer gain automatique et réclamation.
- **Question à traiter :** Identifier récompenses à réclamer, bénéficiaire et débordement.
- **Incertitudes liées :** `U38`, `U30` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-RAP-001](22-RAP.md#us-rap-001), [US-ECO-010](03-ECO.md#us-eco-010).
- **Exigences :** `REQ-REPORT-01`, `REQ-STOCK-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-RAP-006-CA01 — Parcours nominal**

- **Étant donné** courrier récompensé, non réclamé et non expiré ;
- **Quand** je réalise le parcours « Réclamer une récompense reçue par courrier » ;
- **Alors** récompense créditée une seule fois avec résultat de stockage visible.

**US-RAP-006-CA02 — Refus ou exception**

- **Étant donné** courrier déjà réclamé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun nouveau crédit.

**US-RAP-006-CA03 — Cas frontière**

- **Étant donné** capacité de stockage dépassée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** politique de récompense explicite avant confirmation.

**US-RAP-006-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-RAP-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-RAP-001, US-ECO-010. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Identifier récompenses à réclamer, bénéficiaire et débordement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : disposer de mon gain. |
| E | Qualifier U38, U30 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **récompense créditée une seule fois avec résultat de stockage visible**.
- [ ] Le cas frontière est vérifié : **capacité de stockage dépassée → politique de récompense explicite avant confirmation**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-007"></a>
## US-RAP-007 — Comprendre l’expiration d’une récompense

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite connaître la date limite d’une récompense temporaire afin de la réclamer à temps.

### 2. Conversation — règles et décisions

- **Préconditions :** récompense assortie d’une expiration dans le profil.
- **Règles / traces :** REQ-REPORT-01 ; existence et durées selon type de récompense à confirmer.
- **Question à traiter :** Retrouver récompenses concernées et convention d’inclusion de l’échéance.
- **Incertitudes liées :** `U38`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-RAP-006](22-RAP.md#us-rap-006).
- **Exigences :** `REQ-REPORT-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-RAP-007-CA01 — Parcours nominal**

- **Étant donné** récompense assortie d’une expiration dans le profil ;
- **Quand** je réalise le parcours « Comprendre l’expiration d’une récompense » ;
- **Alors** date limite et état expiré visibles, sans confondre expiration du courrier et du droit.

**US-RAP-007-CA02 — Refus ou exception**

- **Étant donné** réclamation après échéance ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** refus et aucun crédit.

**US-RAP-007-CA03 — Cas frontière**

- **Étant donné** réclamation exactement à l’échéance ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** borne temporelle définie et appliquée.

**US-RAP-007-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-RAP-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-RAP-006. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver récompenses concernées et convention d’inclusion de l’échéance. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : la réclamer à temps. |
| E | Qualifier U38, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **date limite et état expiré visibles, sans confondre expiration du courrier et du droit**.
- [ ] Le cas frontière est vérifié : **réclamation exactement à l’échéance → borne temporelle définie et appliquée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-008"></a>
## US-RAP-008 — Être averti de l’achèvement d’une mission

**Priorité proposée :** P1 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite recevoir une notification interne quand une action se termine afin de reprendre mes décisions au bon moment.

### 2. Conversation — règles et décisions

- **Préconditions :** mission ou chantier résolu par le monde.
- **Règles / traces :** Contrat d’interface et REQ-REPORT-01 ; pas d’envoi externe implicite.
- **Question à traiter :** Fixer familles d’alertes, regroupement et état lu.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-RAP-001](22-RAP.md#us-rap-001).
- **Exigences :** `REQ-REPORT-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-RAP-008-CA01 — Parcours nominal**

- **Étant donné** mission ou chantier résolu par le monde ;
- **Quand** je réalise le parcours « Être averti de l’achèvement d’une mission » ;
- **Alors** notification interne renvoie vers résultat et entité autorisée, avec état actuel.

**US-RAP-008-CA02 — Refus ou exception**

- **Étant donné** résultat non encore résolu ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de notification de succès prématurée.

**US-RAP-008-CA03 — Cas frontière**

- **Étant donné** reconnexion après plusieurs fins ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** événements retrouvables sans notification qui crédite à nouveau les gains.

**US-RAP-008-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-RAP-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-RAP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer familles d’alertes, regroupement et état lu. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : reprendre mes décisions au bon moment. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **notification interne renvoie vers résultat et entité autorisée, avec état actuel**.
- [ ] Le cas frontière est vérifié : **reconnexion après plusieurs fins → événements retrouvables sans notification qui crédite à nouveau les gains**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-009"></a>
## US-RAP-009 — Consulter la chronologie de mes ordres

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite classer mes événements futurs par échéance afin de coordonner construction, déplacements et défense.

### 2. Conversation — règles et décisions

- **Préconditions :** plusieurs ordres actifs et droits de consultation suffisants.
- **Règles / traces :** SS-033/034/045/054 ; REQ-UI-01/05.
- **Question à traiter :** Fixer horizons, filtres, fuseau d’affichage et visibilité des ordres alliés.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-005](01-ACC.md#us-acc-005).
- **Exigences :** `REQ-UI-01`, `REQ-UI-05`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-RAP-009-CA01 — Parcours nominal**

- **Étant donné** plusieurs ordres actifs et droits de consultation suffisants ;
- **Quand** je réalise le parcours « Consulter la chronologie de mes ordres » ;
- **Alors** chronologie affiche type, cible, état et heure serveur, avec accès au détail.

**US-RAP-009-CA02 — Refus ou exception**

- **Étant donné** mission militaire non autorisée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun détail divulgué.

**US-RAP-009-CA03 — Cas frontière**

- **Étant donné** ordre rappelé ou délai recalculé ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ancienne échéance remplacée sans doublon.

**US-RAP-009-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-RAP-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer horizons, filtres, fuseau d’affichage et visibilité des ordres alliés. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : coordonner construction, déplacements et défense. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **chronologie affiche type, cible, état et heure serveur, avec accès au détail**.
- [ ] Le cas frontière est vérifié : **ordre rappelé ou délai recalculé → ancienne échéance remplacée sans doublon**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-rap-010"></a>
## US-RAP-010 — Échanger un message interne au monde

**Priorité proposée :** P2 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite envoyer un courrier à un destinataire autorisé afin de coordonner une action de jeu.

### 2. Conversation — règles et décisions

- **Préconditions :** joueur inscrit au même monde et messagerie interne disponible.
- **Règles / traces :** Fonction de communication proposée à qualifier ; aucune messagerie externe.
- **Question à traiter :** Qualifier destinataires collectifs, blocage, limites et signalement.
- **Incertitudes liées :** `U41`, `U31` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-RAP-001](22-RAP.md#us-rap-001).
- **Exigences :** `REQ-REPORT-01`, `REQ-AUTH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/07-PVE-QUETES-SERVICES.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-RAP-010-CA01 — Parcours nominal**

- **Étant donné** joueur inscrit au même monde et messagerie interne disponible ;
- **Quand** je réalise le parcours « Échanger un message interne au monde » ;
- **Alors** message reçu une fois avec auteur, destinataire, date et monde identifiés.

**US-RAP-010-CA02 — Refus ou exception**

- **Étant donné** destinataire absent ou non autorisé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’envoi vers un autre monde.

**US-RAP-010-CA03 — Cas frontière**

- **Étant donné** double validation de l’envoi ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** un seul courrier ou avertissement explicite.

**US-RAP-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-RAP-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-RAP-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier destinataires collectifs, blocage, limites et signalement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : coordonner une action de jeu. |
| E | Qualifier U41, U31 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Le parcours comporte plusieurs transitions : examiner un découpage vertical avant engagement et attribuer de nouveaux identifiants aux fiches filles. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **message reçu une fois avec auteur, destinataire, date et monde identifiés**.
- [ ] Le cas frontière est vérifié : **double validation de l’envoi → un seul courrier ou avertissement explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

