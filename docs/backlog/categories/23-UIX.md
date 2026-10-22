# 23. Navigation, lisibilité et continuité

6 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-UIX-001 — Conserver le cadre de navigation du royaume](#us-uix-001)
- [US-UIX-002 — Distinguer les niveaux de carte et les commandes](#us-uix-002)
- [US-UIX-003 — Sélectionner une case isométrique précisément](#us-uix-003)
- [US-UIX-004 — Ouvrir les bâtiments depuis la scène de ville](#us-uix-004)
- [US-UIX-005 — Lire les informations et les états de commande](#us-uix-005)
- [US-UIX-006 — Reconnaître les objets malgré un asset manquant](#us-uix-006)

<a id="us-uix-001"></a>
## US-UIX-001 — Conserver le cadre de navigation du royaume

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver mes cités, héros, ressources et événements autour de chaque vue afin de changer de contexte sans perdre mes repères.

### 2. Conversation — règles et décisions

- **Préconditions :** royaume chargé dans une session valide.
- **Règles / traces :** SS-033/034/045/054 ; conservation de contexte proposée.
- **Question à traiter :** Définir dimensions de référence, menus persistants et état de reprise.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-ACC-005](01-ACC.md#us-acc-005), [US-RAP-009](22-RAP.md#us-rap-009).
- **Exigences :** `REQ-UI-01`, `REQ-UI-02`, `REQ-AUTH-01`.
- **Sources :** [chapitre de référence](../../../docs/specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-UIX-001-CA01 — Parcours nominal**

- **Étant donné** royaume chargé dans une session valide ;
- **Quand** je réalise le parcours « Conserver le cadre de navigation du royaume » ;
- **Alors** structure scène, royaume, chronologie et navigation cohérente à chaque changement de vue.

**US-UIX-001-CA02 — Refus ou exception**

- **Étant donné** session expirée ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** actions refusées et reprise contrôlée sans afficher un autre royaume.

**US-UIX-001-CA03 — Cas frontière**

- **Étant donné** retour après reconnexion ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** état serveur actualisé et sélection conservée si encore autorisée.

**US-UIX-001-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-UIX-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-ACC-005, US-RAP-009. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir dimensions de référence, menus persistants et état de reprise. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : changer de contexte sans perdre mes repères. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Le parcours comporte plusieurs transitions : examiner un découpage vertical avant engagement et attribuer de nouveaux identifiants aux fiches filles. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **structure scène, royaume, chronologie et navigation cohérente à chaque changement de vue**.
- [ ] Le cas frontière est vérifié : **retour après reconnexion → état serveur actualisé et sélection conservée si encore autorisée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-uix-002"></a>
## US-UIX-002 — Distinguer les niveaux de carte et les commandes

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite reconnaître monde détaillé, monde politique, région et ville afin de agir à la bonne échelle.

### 2. Conversation — règles et décisions

- **Préconditions :** une des quatre vues ouverte.
- **Règles / traces :** SS-033/034/045/054 ; monde politique distinct d’un niveau de bâtiment.
- **Question à traiter :** Qualifier gestes de zoom, pas disponibles et raccourcis sans les inventer historiquement.
- **Incertitudes liées :** `U41`, `U46` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-MON-002](12-MON.md#us-mon-002), [US-REG-001](05-REG.md#us-reg-001), [US-CIT-001](02-CIT.md#us-cit-001).
- **Exigences :** `REQ-UI-02`.
- **Sources :** [chapitre de référence](../../../docs/specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-UIX-002-CA01 — Parcours nominal**

- **Étant donné** une des quatre vues ouverte ;
- **Quand** je réalise le parcours « Distinguer les niveaux de carte et les commandes » ;
- **Alors** titre, sélection, actions disponibles et navigation expriment clairement l’échelle courante.

**US-UIX-002-CA02 — Refus ou exception**

- **Étant donné** changement d’échelle ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune commande de la vue précédente appliquée à une nouvelle cible.

**US-UIX-002-CA03 — Cas frontière**

- **Étant donné** revenir d’une ville vers le monde ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** sélection et position précédentes retrouvées si valides.

**US-UIX-002-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-UIX-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-MON-002, US-REG-001, US-CIT-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier gestes de zoom, pas disponibles et raccourcis sans les inventer historiquement. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : agir à la bonne échelle. |
| E | Qualifier U41, U46 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **titre, sélection, actions disponibles et navigation expriment clairement l’échelle courante**.
- [ ] Le cas frontière est vérifié : **revenir d’une ville vers le monde → sélection et position précédentes retrouvées si valides**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-uix-003"></a>
## US-UIX-003 — Sélectionner une case isométrique précisément

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite choisir la case visible sous mon pointeur afin de inspecter ou ordonner une action sur la bonne cible.

### 2. Conversation — règles et décisions

- **Préconditions :** carte déplacée ou zoomée, décor et objets en surplomb présents.
- **Règles / traces :** REQ-UI-03 ; projection et hit-testing proposés pour reproduire les vues observées.
- **Question à traiter :** Mesurer grille, superposition, caméra et comportement sur petits écrans.
- **Incertitudes liées :** `U41`, `U46` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-REG-001](05-REG.md#us-reg-001), [US-MON-001](12-MON.md#us-mon-001).
- **Exigences :** `REQ-UI-03`, `REQ-WORLD-01`.
- **Sources :** [chapitre de référence](../../../docs/specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-UIX-003-CA01 — Parcours nominal**

- **Étant donné** carte déplacée ou zoomée, décor et objets en surplomb présents ;
- **Quand** je réalise le parcours « Sélectionner une case isométrique précisément » ;
- **Alors** survol et clic désignent la même case logique, puis présentent ses actions légales.

**US-UIX-003-CA02 — Refus ou exception**

- **Étant donné** clic sur décor périphérique non jouable ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun ordre sur une case voisine.

**US-UIX-003-CA03 — Cas frontière**

- **Étant donné** bord entre deux cases ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** règle de sélection stable quelle que soit la caméra.

**US-UIX-003-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-UIX-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-REG-001, US-MON-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Mesurer grille, superposition, caméra et comportement sur petits écrans. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : inspecter ou ordonner une action sur la bonne cible. |
| E | Qualifier U41, U46 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **survol et clic désignent la même case logique, puis présentent ses actions légales**.
- [ ] Le cas frontière est vérifié : **bord entre deux cases → règle de sélection stable quelle que soit la caméra**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-uix-004"></a>
## US-UIX-004 — Ouvrir les bâtiments depuis la scène de ville

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes · **Preuve principale :** OBS-IMAGE · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite sélectionner un bâtiment dans le décor de ma faction afin de accéder directement à sa gestion.

### 2. Conversation — règles et décisions

- **Préconditions :** ville affichée avec bâtiments construits, absents ou en chantier.
- **Règles / traces :** SS-050/051/054/055/056 ; niveau urbain distinct du zoom.
- **Question à traiter :** Cartographier hotspots et variantes de faction ; assets de ville attendus séparément.
- **Incertitudes liées :** `U41`, `U44`, `U46` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-CIT-001](02-CIT.md#us-cit-001), [US-CIT-005](02-CIT.md#us-cit-005).
- **Exigences :** `REQ-UI-04`.
- **Sources :** [chapitre de référence](../../../docs/specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-UIX-004-CA01 — Parcours nominal**

- **Étant donné** ville affichée avec bâtiments construits, absents ou en chantier ;
- **Quand** je réalise le parcours « Ouvrir les bâtiments depuis la scène de ville » ;
- **Alors** zones actives correspondent aux bâtiments et états corrects, panneau ouvre la bonne action.

**US-UIX-004-CA02 — Refus ou exception**

- **Étant donné** bâtiment absent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’accès indu à un service débloqué.

**US-UIX-004-CA03 — Cas frontière**

- **Étant donné** bâtiment recouvrant visuellement un autre ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** priorité de sélection cohérente et solution d’accès alternative.

**US-UIX-004-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-UIX-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-CIT-001, US-CIT-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Cartographier hotspots et variantes de faction ; assets de ville attendus séparément. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : accéder directement à sa gestion. |
| E | Qualifier U41, U44, U46 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Le parcours comporte plusieurs transitions : examiner un découpage vertical avant engagement et attribuer de nouveaux identifiants aux fiches filles. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **zones actives correspondent aux bâtiments et états corrects, panneau ouvre la bonne action**.
- [ ] Le cas frontière est vérifié : **bâtiment recouvrant visuellement un autre → priorité de sélection cohérente et solution d’accès alternative**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-uix-005"></a>
## US-UIX-005 — Lire les informations et les états de commande

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite comprendre coûts, délais, erreurs et valeurs sans ambiguïté afin de décider avant de confirmer une action.

### 2. Conversation — règles et décisions

- **Préconditions :** panneau de jeu ouvert dans les dimensions de référence.
- **Règles / traces :** REQ-UI-12 ; gabarits des captures, adaptation proposée.
- **Question à traiter :** Fixer dimensions, formats numériques, navigation clavier et règles de contraste.
- **Incertitudes liées :** `U41` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-UIX-001](23-UIX.md#us-uix-001).
- **Exigences :** `REQ-UI-12`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-UIX-005-CA01 — Parcours nominal**

- **Étant donné** panneau de jeu ouvert dans les dimensions de référence ;
- **Quand** je réalise le parcours « Lire les informations et les états de commande » ;
- **Alors** texte lisible, ressources identifiées, états indisponible/interdit/en cours/terminé explicités et confirmation contextualisée.

**US-UIX-005-CA02 — Refus ou exception**

- **Étant donné** condition bloquante ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** motif utile sans divulguer une information privée.

**US-UIX-005-CA03 — Cas frontière**

- **Étant donné** grand nombre, libellé long ou fort contraste du décor ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** valeur et commande restent lisibles et utilisables.

**US-UIX-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-UIX-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-UIX-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer dimensions, formats numériques, navigation clavier et règles de contraste. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : décider avant de confirmer une action. |
| E | Qualifier U41 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **texte lisible, ressources identifiées, états indisponible/interdit/en cours/terminé explicités et confirmation contextualisée**.
- [ ] Le cas frontière est vérifié : **grand nombre, libellé long ou fort contraste du décor → valeur et commande restent lisibles et utilisables**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-uix-006"></a>
## US-UIX-006 — Reconnaître les objets malgré un asset manquant

**Priorité proposée :** P0 · **Phases :** Early game, Mid game, End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir une représentation identifiable pour chaque entité afin de continuer à jouer pendant la reconstitution graphique.

### 2. Conversation — règles et décisions

- **Préconditions :** manifeste d’images utilisé et certaines variantes indisponibles.
- **Règles / traces :** CODE-02-IMAGES ; absence d’assets de ville ne bloque pas les fonctions ; fidélité graphique reste à valider.
- **Question à traiter :** Définir substitutions temporaires et critères d’acceptation visuelle par famille.
- **Incertitudes liées :** `U44`, `U45` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-UIX-005](23-UIX.md#us-uix-005).
- **Exigences :** `REQ-UI-11`, `REQ-UI-12`, `REQ-DATA-01`.
- **Sources :** [chapitre de référence](../../../docs/specifications/INTERFACE-ET-RENDU-ISOMETRIQUE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-UIX-006-CA01 — Parcours nominal**

- **Étant donné** manifeste d’images utilisé et certaines variantes indisponibles ;
- **Quand** je réalise le parcours « Reconnaître les objets malgré un asset manquant » ;
- **Alors** sprite valide affiché à la bonne échelle ou substitut nommé sans changer l’identité ni les statistiques.

**US-UIX-006-CA02 — Refus ou exception**

- **Étant donné** fichier absent ou rectangle débordant ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de sprite trompeur ni de contrôle rendu inutilisable.

**US-UIX-006-CA03 — Cas frontière**

- **Étant donné** remplacement ultérieur d’un substitut ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** même entité, mêmes actions et même état de jeu.

**US-UIX-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-UIX-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-UIX-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir substitutions temporaires et critères d’acceptation visuelle par famille. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : continuer à jouer pendant la reconstitution graphique. |
| E | Qualifier U44, U45 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **sprite valide affiché à la bonne échelle ou substitut nommé sans changer l’identité ni les statistiques**.
- [ ] Le cas frontière est vérifié : **remplacement ultérieur d’un substitut → même entité, mêmes actions et même état de jeu**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

