# 21. End game, clôture et hérédité

12 fiches du backlog PvP classique. [Index général](../README.md) · [Méthode, INVEST et DoD](../METHODE-ET-QUALITE.md) · [Story map](../STORY-MAP.md).

Toutes les fiches sont **à affiner**, non implémentées et non estimées. Les scénarios sont spécifiés, pas exécutés. Une marque de preuve qualifie la mécanique principale ; elle ne certifie pas les contrats techniques proposés ni tous les détails d’interface.

## Sommaire

- [US-FIN-001 — Constater la victoire définitive](#us-fin-001)
- [US-FIN-002 — Comprendre les prétentions simultanées à la victoire](#us-fin-002)
- [US-FIN-003 — Voir le monde passer en lecture seule](#us-fin-003)
- [US-FIN-004 — Connaître le sort des missions à la clôture](#us-fin-004)
- [US-FIN-005 — Consulter les classements finaux gelés](#us-fin-005)
- [US-FIN-006 — Lire mon bilan de campagne](#us-fin-006)
- [US-FIN-007 — Calculer les points d’hérédité](#us-fin-007)
- [US-FIN-008 — Conserver mes droits d’hérédité entre mondes](#us-fin-008)
- [US-FIN-009 — Choisir des avantages d’hérédité](#us-fin-009)
- [US-FIN-010 — Former une union dynastique si le profil l’autorise](#us-fin-010)
- [US-FIN-011 — Préparer un héritier et une transmission autorisée](#us-fin-011)
- [US-FIN-012 — Appliquer l’hérédité au prochain royaume](#us-fin-012)

<a id="us-fin-001"></a>
## US-FIN-001 — Constater la victoire définitive

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir la confirmation de notre victoire après la période requise afin de connaître l’issue de la campagne.

### 2. Conversation — règles et décisions

- **Préconditions :** alliance au seuil durant 14 jours consécutifs selon profil et vérification finale valide.
- **Règles / traces :** G01 et REQ-END-01 ; la clôture recontrôle les monuments actifs.
- **Question à traiter :** Valider ordre entre fin de maintien et capture horodatée au même instant.
- **Incertitudes liées :** `U34`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-023](20-LAR.md#us-lar-023), [US-LAR-024](20-LAR.md#us-lar-024).
- **Exigences :** `REQ-WIN-01`, `REQ-END-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-FIN-001-CA01 — Parcours nominal**

- **Étant donné** alliance au seuil durant 14 jours consécutifs selon profil et vérification finale valide ;
- **Quand** je réalise le parcours « Constater la victoire définitive » ;
- **Alors** victoire unique enregistrée à l’échéance avec alliance, preuves et version de règles.

**US-FIN-001-CA02 — Refus ou exception**

- **Étant donné** continuité rompue avant l’échéance ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune victoire attribuée.

**US-FIN-001-CA03 — Cas frontière**

- **Étant donné** traitement relancé après un incident ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** même vainqueur sans double récompense.

**US-FIN-001-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-001-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-023, US-LAR-024. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Valider ordre entre fin de maintien et capture horodatée au même instant. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : connaître l’issue de la campagne. |
| E | Qualifier U34, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **victoire unique enregistrée à l’échéance avec alliance, preuves et version de règles**.
- [ ] Le cas frontière est vérifié : **traitement relancé après un incident → même vainqueur sans double récompense**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-002"></a>
## US-FIN-002 — Comprendre les prétentions simultanées à la victoire

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite voir un arbitrage explicite si plusieurs alliances remplissent la condition afin de faire confiance au résultat du monde.

### 2. Conversation — règles et décisions

- **Préconditions :** plusieurs prétentions satisfaisant les mêmes conditions temporelles.
- **Règles / traces :** Contrat proposé de déterminisme ; aucun départage historique établi.
- **Question à traiter :** Retrouver le départage ou faire valider une variante explicitement choisie.
- **Incertitudes liées :** `U34`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-LAR-023](20-LAR.md#us-lar-023).
- **Exigences :** `REQ-WIN-01`, `REQ-END-01`, `REQ-TIME-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-FIN-002-CA01 — Parcours nominal**

- **Étant donné** plusieurs prétentions satisfaisant les mêmes conditions temporelles ;
- **Quand** je réalise le parcours « Comprendre les prétentions simultanées à la victoire » ;
- **Alors** règle du profil appliquée et expliquée dans le résultat final.

**US-FIN-002-CA02 — Refus ou exception**

- **Étant donné** ordre d’arrivée réseau différent ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ne change pas à lui seul le vainqueur.

**US-FIN-002-CA03 — Cas frontière**

- **Étant donné** égalité parfaite dans le modèle ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** issue prévue par une règle qualifiée, jamais un choix caché.

**US-FIN-002-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-002-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-LAR-023. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Retrouver le départage ou faire valider une variante explicitement choisie. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : faire confiance au résultat du monde. |
| E | Qualifier U34, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **règle du profil appliquée et expliquée dans le résultat final**.
- [ ] Le cas frontière est vérifié : **égalité parfaite dans le modèle → issue prévue par une règle qualifiée, jamais un choix caché**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-003"></a>
## US-FIN-003 — Voir le monde passer en lecture seule

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite comprendre que la campagne est terminée afin de éviter de donner des ordres sans effet.

### 2. Conversation — règles et décisions

- **Préconditions :** clôture enregistrée.
- **Règles / traces :** REQ-WORLD-01/END-01 ; comportement de reconstruction proposé.
- **Question à traiter :** Définir éventuel délai de consultation et contenu encore modifiable.
- **Incertitudes liées :** `U34` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-001](21-FIN.md#us-fin-001).
- **Exigences :** `REQ-WORLD-01`, `REQ-END-01`, `REQ-AUTH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-FIN-003-CA01 — Parcours nominal**

- **Étant donné** clôture enregistrée ;
- **Quand** je réalise le parcours « Voir le monde passer en lecture seule » ;
- **Alors** accès au bilan conservé et nouvelles commandes de gameplay refusées avec motif.

**US-FIN-003-CA02 — Refus ou exception**

- **Étant donné** ancien écran encore ouvert ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** une commande n’est pas acceptée après la clôture.

**US-FIN-003-CA03 — Cas frontière**

- **Étant donné** consultation d’un monde terminé et d’un monde actif ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** statuts et données restent séparés.

**US-FIN-003-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-003-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir éventuel délai de consultation et contenu encore modifiable. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : éviter de donner des ordres sans effet. |
| E | Qualifier U34 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **accès au bilan conservé et nouvelles commandes de gameplay refusées avec motif**.
- [ ] Le cas frontière est vérifié : **consultation d’un monde terminé et d’un monde actif → statuts et données restent séparés**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-004"></a>
## US-FIN-004 — Connaître le sort des missions à la clôture

**Priorité proposée :** P0 · **Phases :** End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter le résultat de mes ordres encore en cours afin de comprendre mon bilan sans ressources ni troupes fantômes.

### 2. Conversation — règles et décisions

- **Préconditions :** missions ou chantiers non achevés à la clôture.
- **Règles / traces :** REQ-END-01 ; politique de résolution non retrouvée.
- **Question à traiter :** Choisir résolution, annulation ou gel par famille d’ordres avant implémentation.
- **Incertitudes liées :** `U34`, `U14` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-001](21-FIN.md#us-fin-001).
- **Exigences :** `REQ-END-01`, `REQ-ORDER-01`, `REQ-REPORT-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-FIN-004-CA01 — Parcours nominal**

- **Étant donné** missions ou chantiers non achevés à la clôture ;
- **Quand** je réalise le parcours « Connaître le sort des missions à la clôture » ;
- **Alors** chaque ordre reçoit un état final conforme à la politique de clôture, visible dans un rapport.

**US-FIN-004-CA02 — Refus ou exception**

- **Étant donné** arrivée après clôture ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun gain ajouté au classement déjà gelé hors règle explicite.

**US-FIN-004-CA03 — Cas frontière**

- **Étant donné** arrivée exactement à l’échéance finale ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** priorité d’événements définie et reproductible.

**US-FIN-004-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-004-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Choisir résolution, annulation ou gel par famille d’ordres avant implémentation. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre mon bilan sans ressources ni troupes fantômes. |
| E | Qualifier U34, U14 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Le parcours comporte plusieurs transitions : examiner un découpage vertical avant engagement et attribuer de nouveaux identifiants aux fiches filles. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **chaque ordre reçoit un état final conforme à la politique de clôture, visible dans un rapport**.
- [ ] Le cas frontière est vérifié : **arrivée exactement à l’échéance finale → priorité d’événements définie et reproductible**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-005"></a>
## US-FIN-005 — Consulter les classements finaux gelés

**Priorité proposée :** P0 · **Phases :** Après-campagne / hérédité · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver les classements définitifs du monde afin de comparer les résultats de campagne.

### 2. Conversation — règles et décisions

- **Préconditions :** clôture et calcul final achevés.
- **Règles / traces :** G01/G25 et REQ-END-01.
- **Question à traiter :** Fixer données archivées, égalités et accès public.
- **Incertitudes liées :** `U34` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-001](21-FIN.md#us-fin-001), [US-CLA-008](19-CLA.md#us-cla-008), [US-CLA-012](19-CLA.md#us-cla-012).
- **Exigences :** `REQ-END-01`, `REQ-PATH-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-FIN-005-CA01 — Parcours nominal**

- **Étant donné** clôture et calcul final achevés ;
- **Quand** je réalise le parcours « Consulter les classements finaux gelés » ;
- **Alors** classements personnels et collectifs portent une date et une version immuables.

**US-FIN-005-CA02 — Refus ou exception**

- **Étant donné** changement ultérieur de catalogue ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** ne recalcule pas rétroactivement le résultat.

**US-FIN-005-CA03 — Cas frontière**

- **Étant donné** ex æquo ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** règle de classement final explicitement appliquée.

**US-FIN-005-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-FIN-005-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-001, US-CLA-008, US-CLA-012. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Fixer données archivées, égalités et accès public. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comparer les résultats de campagne. |
| E | Qualifier U34 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **classements personnels et collectifs portent une date et une version immuables**.
- [ ] Le cas frontière est vérifié : **ex æquo → règle de classement final explicitement appliquée**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-006"></a>
## US-FIN-006 — Lire mon bilan de campagne

**Priorité proposée :** P1 · **Phases :** Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite consulter ma progression et mes contributions finales afin de comprendre ce que j’ai accompli.

### 2. Conversation — règles et décisions

- **Préconditions :** résultat individuel disponible.
- **Règles / traces :** G25–G28 ; présentation de bilan proposée.
- **Question à traiter :** Définir durée d’historique et attribution des contributions après changements d’alliance.
- **Incertitudes liées :** `U34`, `U35` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-005](21-FIN.md#us-fin-005).
- **Exigences :** `REQ-END-01`, `REQ-REPORT-01`, `REQ-VIS-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-FIN-006-CA01 — Parcours nominal**

- **Étant donné** résultat individuel disponible ;
- **Quand** je réalise le parcours « Lire mon bilan de campagne » ;
- **Alors** voies, alliance, Larmes et événements retenus présentés sans confondre score personnel et collectif.

**US-FIN-006-CA02 — Refus ou exception**

- **Étant donné** données d’un autre royaume privées ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas d’accès par simple changement d’identifiant.

**US-FIN-006-CA03 — Cas frontière**

- **Étant donné** joueur sans alliance ou sans Larme ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** bilan valable sans division par zéro.

**US-FIN-006-CA04 — Cohérence et reprise**

- **Étant donné** les données sont accessibles dans le monde sélectionné ;
- **Quand** je consulte puis actualise la vue ;
- **Alors** la consultation ne dépense rien et ne déclenche aucun ordre métier ; la vue indique l’état autorisé actuel sans mélanger les mondes.

**US-FIN-006-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir durée d’historique et attribution des contributions après changements d’alliance. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : comprendre ce que j’ai accompli. |
| E | Qualifier U34, U35 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **voies, alliance, Larmes et événements retenus présentés sans confondre score personnel et collectif**.
- [ ] Le cas frontière est vérifié : **joueur sans alliance ou sans Larme → bilan valable sans division par zéro**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-007"></a>
## US-FIN-007 — Calculer les points d’hérédité

**Priorité proposée :** P1 · **Phases :** Après-campagne / hérédité · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite obtenir le détail de mes droits acquis pour une future campagne afin de vérifier la valeur de ma progression.

### 2. Conversation — règles et décisions

- **Préconditions :** monde clos et barème d’hérédité sélectionné.
- **Règles / traces :** G25–G28 : formules et périodes divergentes ; hérédité S4 hors socle.
- **Question à traiter :** Choisir saison d’hérédité et résoudre moyenne de rang, unions et frontière de formule.
- **Incertitudes liées :** `U35` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-005](21-FIN.md#us-fin-005).
- **Exigences :** `REQ-LEGACY-01`, `REQ-END-01`, `REQ-DATA-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-FIN-007-CA01 — Parcours nominal**

- **Étant donné** monde clos et barème d’hérédité sélectionné ;
- **Quand** je réalise le parcours « Calculer les points d’hérédité » ;
- **Alors** calcul explicable avec ses assiettes, coefficients et version, attribué une seule fois.

**US-FIN-007-CA02 — Refus ou exception**

- **Étant donné** barème S3 ou S4 dans un profil classique non qualifié ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** pas de mélange automatique.

**US-FIN-007-CA03 — Cas frontière**

- **Étant donné** total de Graals égal à 5 ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** branche de formule explicitement résolue avant qualification.

**US-FIN-007-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-007-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-005. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Choisir saison d’hérédité et résoudre moyenne de rang, unions et frontière de formule. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : vérifier la valeur de ma progression. |
| E | Qualifier U35 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **calcul explicable avec ses assiettes, coefficients et version, attribué une seule fois**.
- [ ] Le cas frontière est vérifié : **total de Graals égal à 5 → branche de formule explicitement résolue avant qualification**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-008"></a>
## US-FIN-008 — Conserver mes droits d’hérédité entre mondes

**Priorité proposée :** P1 · **Phases :** Après-campagne / hérédité · **Preuve principale :** PROP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite retrouver les points acquis et déjà utilisés afin de préparer ma prochaine participation.

### 2. Conversation — règles et décisions

- **Préconditions :** résultat d’hérédité finalisé.
- **Règles / traces :** REQ-LEGACY-01 ; registre de droits proposé.
- **Question à traiter :** Définir portée du compte, cumul, péremption et corrections.
- **Incertitudes liées :** `U35` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-007](21-FIN.md#us-fin-007).
- **Exigences :** `REQ-LEGACY-01`, `REQ-AUTH-01`, `REQ-ORDER-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche propose un comportement du successeur ; elle nécessite un arbitrage produit, sans être présentée comme une règle Ubisoft attestée.

### 3. Confirmation — critères d’acceptation

**US-FIN-008-CA01 — Parcours nominal**

- **Étant donné** résultat d’hérédité finalisé ;
- **Quand** je réalise le parcours « Conserver mes droits d’hérédité entre mondes » ;
- **Alors** solde et historique de provenance persistants, sans transfert libre des troupes ou ressources.

**US-FIN-008-CA02 — Refus ou exception**

- **Étant donné** ouverture d’un autre compte ou monde ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun droit usurpé.

**US-FIN-008-CA03 — Cas frontière**

- **Étant donné** attribution de fin de monde répétée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** solde crédité une seule fois.

**US-FIN-008-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-008-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir portée du compte, cumul, péremption et corrections. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer ma prochaine participation. |
| E | Qualifier U35 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **solde et historique de provenance persistants, sans transfert libre des troupes ou ressources**.
- [ ] Le cas frontière est vérifié : **attribution de fin de monde répétée → solde crédité une seule fois**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-009"></a>
## US-FIN-009 — Choisir des avantages d’hérédité

**Priorité proposée :** P1 · **Phases :** Après-campagne / hérédité · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite allouer mes droits aux avantages autorisés afin de personnaliser le début du prochain monde.

### 2. Conversation — règles et décisions

- **Préconditions :** solde et catalogue d’avantages qualifiés.
- **Règles / traces :** G25–G28 ; 15 compétences cataloguées, coûts d’achat incomplets.
- **Question à traiter :** Reconstituer coûts, plafonds, cumul, moment de verrouillage et respec.
- **Incertitudes liées :** `U35` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-008](21-FIN.md#us-fin-008).
- **Exigences :** `REQ-LEGACY-01`, `REQ-DATA-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-FIN-009-CA01 — Parcours nominal**

- **Étant donné** solde et catalogue d’avantages qualifiés ;
- **Quand** je réalise le parcours « Choisir des avantages d’hérédité » ;
- **Alors** choix affiche coût, effet, limites et solde restant avant confirmation.

**US-FIN-009-CA02 — Refus ou exception**

- **Étant donné** coût inconnu ou budget dépassé ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** achat impossible.

**US-FIN-009-CA03 — Cas frontière**

- **Étant donné** changement de choix avant engagement ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** règle de remboursement ou verrouillage explicite.

**US-FIN-009-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-009-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-008. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Reconstituer coûts, plafonds, cumul, moment de verrouillage et respec. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : personnaliser le début du prochain monde. |
| E | Qualifier U35 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **choix affiche coût, effet, limites et solde restant avant confirmation**.
- [ ] Le cas frontière est vérifié : **changement de choix avant engagement → règle de remboursement ou verrouillage explicite**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-010"></a>
## US-FIN-010 — Former une union dynastique si le profil l’autorise

**Priorité proposée :** P2 · **Phases :** Mid game, End game / Guerre des Larmes, Après-campagne / hérédité · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite établir une union distincte de l’alliance afin de préparer les bénéfices dynastiques documentés.

### 2. Conversation — règles et décisions

- **Préconditions :** monde autorisant les unions et deux participants admissibles.
- **Règles / traces :** G25–G28 ; fonctionnement détaillé non reconstitué.
- **Question à traiter :** Qualifier consentement, exclusivité, rupture, titres et effet sur hérédité.
- **Incertitudes liées :** `U35` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-007](21-FIN.md#us-fin-007).
- **Exigences :** `REQ-LEGACY-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-FIN-010-CA01 — Parcours nominal**

- **Étant donné** monde autorisant les unions et deux participants admissibles ;
- **Quand** je réalise le parcours « Former une union dynastique si le profil l’autorise » ;
- **Alors** consentements et état d’union tracés, bénéfices attachés au bon barème.

**US-FIN-010-CA02 — Refus ou exception**

- **Étant donné** invitation sans acceptation ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucune union imposée.

**US-FIN-010-CA03 — Cas frontière**

- **Étant donné** départ d’alliance ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** ne rompt pas une union par assimilation entre deux systèmes.

**US-FIN-010-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-010-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-007. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Qualifier consentement, exclusivité, rupture, titres et effet sur hérédité. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : préparer les bénéfices dynastiques documentés. |
| E | Qualifier U35 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **consentements et état d’union tracés, bénéfices attachés au bon barème**.
- [ ] Le cas frontière est vérifié : **départ d’alliance → ne rompt pas une union par assimilation entre deux systèmes**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-011"></a>
## US-FIN-011 — Préparer un héritier et une transmission autorisée

**Priorité proposée :** P2 · **Phases :** Après-campagne / hérédité · **Preuve principale :** HYP · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite choisir l’héritier et les objets transmissibles prévus par le profil afin de conserver un lien entre campagnes.

### 2. Conversation — règles et décisions

- **Préconditions :** système dynastique qualifié et droits de transmission disponibles.
- **Règles / traces :** G25–G28 : héritiers et transmission évoqués ; modalités incomplètes.
- **Question à traiter :** Établir types transmissibles, consommation, bénéficiaire et limites entre saisons.
- **Incertitudes liées :** `U35`, `U27` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-010](21-FIN.md#us-fin-010), [US-ART-001](10-ART.md#us-art-001).
- **Exigences :** `REQ-LEGACY-01`, `REQ-EQUIP-02`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. Cette fiche est conditionnelle : confirmer la mécanique avant de l’inclure dans le périmètre engagé.

### 3. Confirmation — critères d’acceptation

**US-FIN-011-CA01 — Parcours nominal**

- **Étant donné** système dynastique qualifié et droits de transmission disponibles ;
- **Quand** je réalise le parcours « Préparer un héritier et une transmission autorisée » ;
- **Alors** héritier, objet et destination validés sans dupliquer l’objet ni transporter librement l’inventaire.

**US-FIN-011-CA02 — Refus ou exception**

- **Étant donné** objet non transmissible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** choix refusé avec motif.

**US-FIN-011-CA03 — Cas frontière**

- **Étant donné** objet vendu après sélection mais avant verrouillage ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** validation finale échoue sans avantage indu.

**US-FIN-011-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-011-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-010, US-ART-001. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Établir types transmissibles, consommation, bénéficiaire et limites entre saisons. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : conserver un lien entre campagnes. |
| E | Qualifier U35, U27 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Le parcours comporte plusieurs transitions : examiner un découpage vertical avant engagement et attribuer de nouveaux identifiants aux fiches filles. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **héritier, objet et destination validés sans dupliquer l’objet ni transporter librement l’inventaire**.
- [ ] Le cas frontière est vérifié : **objet vendu après sélection mais avant verrouillage → validation finale échoue sans avantage indu**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

<a id="us-fin-012"></a>
## US-FIN-012 — Appliquer l’hérédité au prochain royaume

**Priorité proposée :** P1 · **Phases :** Early game, Après-campagne / hérédité · **Preuve principale :** DOC · **Statut :** à affiner.

### 1. Card — besoin du joueur

> En tant que joueur, je souhaite recevoir les avantages confirmés dans un nouveau monde compatible afin de commencer la campagne avec mes choix acquis.

### 2. Conversation — règles et décisions

- **Préconditions :** nouveau royaume admissible et choix d’hérédité engagés.
- **Règles / traces :** REQ-LEGACY-01 ; compatibilité et consommation à qualifier.
- **Question à traiter :** Définir moment d’engagement et conversion entre profils, sans présumer de valeurs.
- **Incertitudes liées :** `U35` — voir le [registre](../../research/INCERTITUDES.md).
- **Dépendances fonctionnelles :** [US-FIN-009](21-FIN.md#us-fin-009), [US-ACC-003](01-ACC.md#us-acc-003).
- **Exigences :** `REQ-LEGACY-01`, `REQ-ORDER-01`, `REQ-PROFILE-01`.
- **Sources :** [chapitre de référence](../../../docs/game-design/06-ALLIANCES-FIN-DE-MONDE.md), [traçabilité des preuves](../../research/SOURCES.md) ; les identifiants SS renvoient à l’[analyse des captures](../../research/ANALYSE-CAPTURES.md).

**État de la conversation :** préparée, non tenue. Les arbitrages, la version numérique et les exemples chiffrés restent à consigner. La mécanique est documentée ou observée ; son applicabilité à la saison classique cible doit encore être qualifiée.

### 3. Confirmation — critères d’acceptation

**US-FIN-012-CA01 — Parcours nominal**

- **Étant donné** nouveau royaume admissible et choix d’hérédité engagés ;
- **Quand** je réalise le parcours « Appliquer l’hérédité au prochain royaume » ;
- **Alors** avantages appliqués une seule fois selon catalogue de destination et droits débités selon contrat.

**US-FIN-012-CA02 — Refus ou exception**

- **Étant donné** monde incompatible ;
- **Quand** le parcours est demandé ou son événement est traité ;
- **Alors** aucun avantage appliqué silencieusement.

**US-FIN-012-CA03 — Cas frontière**

- **Étant donné** création du royaume relancée ;
- **Quand** le parcours atteint cette frontière ;
- **Alors** pas de double bonus initial.

**US-FIN-012-CA04 — Cohérence et reprise**

- **Étant donné** une première intention a déjà été acceptée ou son résultat enregistré ;
- **Quand** la même intention est rejouée après un délai, une reconnexion ou une réponse perdue ;
- **Alors** le même ordre ou résultat est retrouvé, sans second débit, récompense, réservation ou transition ; seules les évolutions légitimes du monde se poursuivent.

**US-FIN-012-CA05 — Droits et visibilité**

- **Étant donné** le compte n’a pas le droit sur l’entité, le monde ou les données demandées ;
- **Quand** le parcours est tenté depuis un lien direct, une requête modifiée ou un écran devenu périmé ;
- **Alors** le serveur refuse l’accès ou la mutation, sans changement métier et sans révéler les informations cachées.

CA01–CA03 portent sur cette fiche ; CA04–CA05 appliquent les contrats transversaux proposés. Les paramètres historiques non établis doivent être fixés dans une fixture versionnée avant exécution. Aucune valeur absente n’est remplacée implicitement par zéro.

### Contrôle INVEST

| Principe | Évaluation à ce stade |
| --- | --- |
| I | Préconditions fonctionnelles : US-FIN-009, US-ACC-003. Préparer des fixtures pour tester la fiche isolément ; la livraison intégrée exige ces contrats. |
| N | Définir moment d’engagement et conversion entre profils, sans présumer de valeurs. Le résultat attendu guide l’échange ; ergonomie et solution technique restent négociables. |
| V | Bénéfice pour le rôle : commencer la campagne avec mes choix acquis. |
| E | Qualifier U35 avant d’engager l’estimation de fidélité. Estimation de prototype possible sur un profil de test explicitement distinct. |
| S | Périmètre borné par les cinq critères ; confirmer qu’il tient dans une itération avec l’équipe, puis découper si nécessaire. |
| T | Cinq critères identifiés, dont trois spécifiques. Les données attendues dépendant de règles inconnues restent à figer ; aucun test de fidélité n’est déclaré réussi. |

### Definition of Done de cette fiche

La [DoD commune DOD-01 à DOD-10](../METHODE-ET-QUALITE.md#definition-of-done) s’applique, avec justification explicite des contrôles non applicables. Pour cette fiche :

- [ ] Les cinq critères ont des résultats de validation consignés sur un profil identifié.
- [ ] La démonstration montre le résultat : **avantages appliqués une seule fois selon catalogue de destination et droits débités selon contrat**.
- [ ] Le cas frontière est vérifié : **création du royaume relancée → pas de double bonus initial**.
- [ ] Les décisions de la Conversation et les preuves de fidélité sont reliées à cette fiche ; les variantes volontaires sont signalées.
- [ ] La revue et l’acceptation fonctionnelle sont enregistrées ; aucune case ci-dessus n’est considérée cochée par la rédaction du backlog.

---

