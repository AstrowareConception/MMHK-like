# Couverture des exigences, preuves et inconnues

[Retour au backlog](README.md). Les 57 identifiants ci-dessous proviennent du [référentiel fonctionnel](../specifications/FONCTIONNEL.md). **55 sont actifs et tous sont reliés à des fiches ; 2 restent hors périmètre.** Un lien de couverture signifie « comportement spécifié », pas « code livré » ou « règle authentifiée ».

## Exigences actives

| Exigence | Objet | Fiches |
| --- | --- | --- |
| REQ-WORLD-01 | Un monde possède un profil de règles, une ouverture, une phase courante et une clôture | [US-ACC-001](categories/01-ACC.md#us-acc-001), [US-ACC-003](categories/01-ACC.md#us-acc-003), [US-ACC-004](categories/01-ACC.md#us-acc-004), [US-LAR-006](categories/20-LAR.md#us-lar-006), [US-FIN-003](categories/21-FIN.md#us-fin-003), [US-UIX-003](categories/23-UIX.md#us-uix-003) |
| REQ-TIME-01 | Les ordres progressent hors connexion et sont résolus à l’heure serveur | [US-CIT-005](categories/02-CIT.md#us-cit-005), [US-ECO-003](categories/03-ECO.md#us-eco-003), [US-ECO-008](categories/03-ECO.md#us-eco-008), [US-HER-015](categories/07-HER.md#us-her-015), [US-MAG-006](categories/08-MAG.md#us-mag-006), [US-MOV-003](categories/13-MOV.md#us-mov-003), [US-MOV-005](categories/13-MOV.md#us-mov-005), [US-MOV-007](categories/13-MOV.md#us-mov-007), [US-LAR-005](categories/20-LAR.md#us-lar-005), [US-LAR-008](categories/20-LAR.md#us-lar-008), [US-LAR-017](categories/20-LAR.md#us-lar-017), [US-LAR-018](categories/20-LAR.md#us-lar-018), [US-LAR-024](categories/20-LAR.md#us-lar-024), [US-FIN-002](categories/21-FIN.md#us-fin-002), [US-RAP-007](categories/22-RAP.md#us-rap-007), [US-RAP-008](categories/22-RAP.md#us-rap-008) |
| REQ-DATA-01 | Toute valeur de gameplay dépend d’un catalogue et d’une version explicites | [US-ACC-002](categories/01-ACC.md#us-acc-002), [US-CIT-002](categories/02-CIT.md#us-cit-002), [US-HER-007](categories/07-HER.md#us-her-007), [US-HER-008](categories/07-HER.md#us-her-008), [US-ARM-002](categories/09-ARM.md#us-arm-002), [US-ART-002](categories/10-ART.md#us-art-002), [US-FIN-007](categories/21-FIN.md#us-fin-007), [US-FIN-009](categories/21-FIN.md#us-fin-009), [US-UIX-006](categories/23-UIX.md#us-uix-006) |
| REQ-AUTH-01 | Une commande vérifie propriétaire, monde et permissions | [US-ACC-004](categories/01-ACC.md#us-acc-004), [US-ECO-011](categories/03-ECO.md#us-eco-011), [US-SIE-013](categories/16-SIE.md#us-sie-013), [US-FIN-003](categories/21-FIN.md#us-fin-003), [US-FIN-008](categories/21-FIN.md#us-fin-008), [US-RAP-002](categories/22-RAP.md#us-rap-002), [US-RAP-010](categories/22-RAP.md#us-rap-010), [US-UIX-001](categories/23-UIX.md#us-uix-001) |
| REQ-ORDER-01 | Une même intention rejouée ne produit qu’un débit et un ordre | [US-ACC-003](categories/01-ACC.md#us-acc-003), [US-CIT-004](categories/02-CIT.md#us-cit-004), [US-ECO-005](categories/03-ECO.md#us-eco-005), [US-ECO-006](categories/03-ECO.md#us-eco-006), [US-ECH-003](categories/04-ECH.md#us-ech-003), [US-ECH-006](categories/04-ECH.md#us-ech-006), [US-ECH-012](categories/04-ECH.md#us-ech-012), [US-HER-003](categories/07-HER.md#us-her-003), [US-HER-016](categories/07-HER.md#us-her-016), [US-ARM-005](categories/09-ARM.md#us-arm-005), [US-MON-007](categories/12-MON.md#us-mon-007), [US-ESP-003](categories/14-ESP.md#us-esp-003), [US-PVP-004](categories/15-PVP.md#us-pvp-004), [US-LAR-007](categories/20-LAR.md#us-lar-007), [US-LAR-010](categories/20-LAR.md#us-lar-010), [US-LAR-013](categories/20-LAR.md#us-lar-013), [US-FIN-004](categories/21-FIN.md#us-fin-004), [US-FIN-008](categories/21-FIN.md#us-fin-008), [US-FIN-012](categories/21-FIN.md#us-fin-012), [US-RAP-006](categories/22-RAP.md#us-rap-006) |
| REQ-REPORT-01 | Le résultat d’une action est consultable avec son contexte et sa version | [US-ECO-012](categories/03-ECO.md#us-eco-012), [US-ECH-009](categories/04-ECH.md#us-ech-009), [US-MAG-012](categories/08-MAG.md#us-mag-012), [US-ART-014](categories/10-ART.md#us-art-014), [US-COM-017](categories/11-COM.md#us-com-017), [US-ESP-005](categories/14-ESP.md#us-esp-005), [US-DIP-006](categories/18-DIP.md#us-dip-006), [US-DIP-007](categories/18-DIP.md#us-dip-007), [US-DIP-008](categories/18-DIP.md#us-dip-008), [US-LAR-014](categories/20-LAR.md#us-lar-014), [US-LAR-019](categories/20-LAR.md#us-lar-019), [US-LAR-024](categories/20-LAR.md#us-lar-024), [US-FIN-004](categories/21-FIN.md#us-fin-004), [US-FIN-006](categories/21-FIN.md#us-fin-006), [US-RAP-001](categories/22-RAP.md#us-rap-001), [US-RAP-002](categories/22-RAP.md#us-rap-002), [US-RAP-003](categories/22-RAP.md#us-rap-003), [US-RAP-004](categories/22-RAP.md#us-rap-004), [US-RAP-005](categories/22-RAP.md#us-rap-005), [US-RAP-006](categories/22-RAP.md#us-rap-006), [US-RAP-007](categories/22-RAP.md#us-rap-007), [US-RAP-008](categories/22-RAP.md#us-rap-008), [US-RAP-010](categories/22-RAP.md#us-rap-010) |
| REQ-VIS-01 | Une vue n’expose que les informations autorisées ou obtenues par reconnaissance | [US-ACC-011](categories/01-ACC.md#us-acc-011), [US-REG-002](categories/05-REG.md#us-reg-002), [US-REL-001](categories/06-REL.md#us-rel-001), [US-REL-008](categories/06-REL.md#us-rel-008), [US-MON-002](categories/12-MON.md#us-mon-002), [US-MON-003](categories/12-MON.md#us-mon-003), [US-MON-005](categories/12-MON.md#us-mon-005), [US-MON-010](categories/12-MON.md#us-mon-010), [US-ESP-004](categories/14-ESP.md#us-esp-004), [US-PVP-010](categories/15-PVP.md#us-pvp-010), [US-SIE-004](categories/16-SIE.md#us-sie-004), [US-ALL-007](categories/17-ALL.md#us-all-007), [US-ALL-009](categories/17-ALL.md#us-all-009), [US-CLA-008](categories/19-CLA.md#us-cla-008), [US-CLA-012](categories/19-CLA.md#us-cla-012), [US-LAR-003](categories/20-LAR.md#us-lar-003), [US-LAR-008](categories/20-LAR.md#us-lar-008), [US-FIN-006](categories/21-FIN.md#us-fin-006), [US-RAP-001](categories/22-RAP.md#us-rap-001), [US-RAP-005](categories/22-RAP.md#us-rap-005), [US-RAP-009](categories/22-RAP.md#us-rap-009), [US-UIX-005](categories/23-UIX.md#us-uix-005) |
| REQ-END-01 | La victoire et l’hérédité d’un monde sont attribuées une seule fois | [US-FIN-001](categories/21-FIN.md#us-fin-001), [US-FIN-002](categories/21-FIN.md#us-fin-002), [US-FIN-003](categories/21-FIN.md#us-fin-003), [US-FIN-004](categories/21-FIN.md#us-fin-004), [US-FIN-005](categories/21-FIN.md#us-fin-005), [US-FIN-006](categories/21-FIN.md#us-fin-006), [US-FIN-007](categories/21-FIN.md#us-fin-007) |
| REQ-CITY-01 | Coloniser | [US-MON-006](categories/12-MON.md#us-mon-006), [US-MON-007](categories/12-MON.md#us-mon-007), [US-SIE-001](categories/16-SIE.md#us-sie-001), [US-SIE-012](categories/16-SIE.md#us-sie-012), [US-CLA-007](categories/19-CLA.md#us-cla-007) |
| REQ-BUILD-01 | Construire/améliorer | [US-CIT-001](categories/02-CIT.md#us-cit-001), [US-CIT-002](categories/02-CIT.md#us-cit-002), [US-CIT-003](categories/02-CIT.md#us-cit-003), [US-CIT-004](categories/02-CIT.md#us-cit-004), [US-CIT-005](categories/02-CIT.md#us-cit-005), [US-CIT-006](categories/02-CIT.md#us-cit-006), [US-CIT-007](categories/02-CIT.md#us-cit-007), [US-CIT-008](categories/02-CIT.md#us-cit-008), [US-CIT-009](categories/02-CIT.md#us-cit-009), [US-CIT-010](categories/02-CIT.md#us-cit-010), [US-CIT-011](categories/02-CIT.md#us-cit-011), [US-CIT-012](categories/02-CIT.md#us-cit-012), [US-CIT-013](categories/02-CIT.md#us-cit-013), [US-CIT-014](categories/02-CIT.md#us-cit-014), [US-CIT-015](categories/02-CIT.md#us-cit-015), [US-CIT-016](categories/02-CIT.md#us-cit-016), [US-LAR-004](categories/20-LAR.md#us-lar-004), [US-LAR-011](categories/20-LAR.md#us-lar-011), [US-LAR-015](categories/20-LAR.md#us-lar-015), [US-LAR-020](categories/20-LAR.md#us-lar-020) |
| REQ-MINE-01 | Améliorer une mine | [US-REG-004](categories/05-REG.md#us-reg-004), [US-REG-005](categories/05-REG.md#us-reg-005), [US-REG-006](categories/05-REG.md#us-reg-006), [US-REG-007](categories/05-REG.md#us-reg-007) |
| REQ-REGION-01 | Construire un aménagement | [US-REG-001](categories/05-REG.md#us-reg-001), [US-REG-008](categories/05-REG.md#us-reg-008), [US-REG-009](categories/05-REG.md#us-reg-009), [US-REG-010](categories/05-REG.md#us-reg-010), [US-REG-011](categories/05-REG.md#us-reg-011), [US-REG-012](categories/05-REG.md#us-reg-012), [US-REL-001](categories/06-REL.md#us-rel-001), [US-REL-002](categories/06-REL.md#us-rel-002), [US-REL-004](categories/06-REL.md#us-rel-004), [US-REL-006](categories/06-REL.md#us-rel-006), [US-REL-007](categories/06-REL.md#us-rel-007), [US-REL-010](categories/06-REL.md#us-rel-010), [US-LAR-009](categories/20-LAR.md#us-lar-009) |
| REQ-STOCK-01 | Produire/stocker | [US-ACC-010](categories/01-ACC.md#us-acc-010), [US-CIT-008](categories/02-CIT.md#us-cit-008), [US-CIT-014](categories/02-CIT.md#us-cit-014), [US-ECO-001](categories/03-ECO.md#us-eco-001), [US-ECO-002](categories/03-ECO.md#us-eco-002), [US-ECO-003](categories/03-ECO.md#us-eco-003), [US-ECO-004](categories/03-ECO.md#us-eco-004), [US-ECO-005](categories/03-ECO.md#us-eco-005), [US-ECO-006](categories/03-ECO.md#us-eco-006), [US-ECO-007](categories/03-ECO.md#us-eco-007), [US-ECO-008](categories/03-ECO.md#us-eco-008), [US-ECO-009](categories/03-ECO.md#us-eco-009), [US-ECO-010](categories/03-ECO.md#us-eco-010), [US-ECO-011](categories/03-ECO.md#us-eco-011), [US-ECO-012](categories/03-ECO.md#us-eco-012), [US-REG-004](categories/05-REG.md#us-reg-004), [US-REG-011](categories/05-REG.md#us-reg-011), [US-REG-012](categories/05-REG.md#us-reg-012), [US-REL-003](categories/06-REL.md#us-rel-003), [US-REL-010](categories/06-REL.md#us-rel-010), [US-PVP-007](categories/15-PVP.md#us-pvp-007), [US-PVP-008](categories/15-PVP.md#us-pvp-008), [US-PVP-009](categories/15-PVP.md#us-pvp-009), [US-LAR-012](categories/20-LAR.md#us-lar-012), [US-RAP-006](categories/22-RAP.md#us-rap-006) |
| REQ-RECRUIT-01 | Recruter des unités | [US-CIT-009](categories/02-CIT.md#us-cit-009), [US-ARM-002](categories/09-ARM.md#us-arm-002), [US-ARM-003](categories/09-ARM.md#us-arm-003), [US-ARM-004](categories/09-ARM.md#us-arm-004), [US-ARM-005](categories/09-ARM.md#us-arm-005), [US-ARM-006](categories/09-ARM.md#us-arm-006), [US-ARM-015](categories/09-ARM.md#us-arm-015) |
| REQ-UPGRADE-01 | Améliorer des unités | [US-CIT-010](categories/02-CIT.md#us-cit-010), [US-ARM-007](categories/09-ARM.md#us-arm-007) |
| REQ-HERO-01 | Recruter un héros | [US-HER-002](categories/07-HER.md#us-her-002), [US-HER-003](categories/07-HER.md#us-her-003), [US-HER-004](categories/07-HER.md#us-her-004), [US-LAR-010](categories/20-LAR.md#us-lar-010), [US-LAR-015](categories/20-LAR.md#us-lar-015) |
| REQ-HERO-02 | Apprendre/réorienter | [US-CIT-015](categories/02-CIT.md#us-cit-015), [US-HER-001](categories/07-HER.md#us-her-001), [US-HER-006](categories/07-HER.md#us-her-006), [US-HER-007](categories/07-HER.md#us-her-007), [US-HER-008](categories/07-HER.md#us-her-008), [US-HER-011](categories/07-HER.md#us-her-011), [US-HER-014](categories/07-HER.md#us-her-014), [US-HER-015](categories/07-HER.md#us-her-015), [US-HER-016](categories/07-HER.md#us-her-016), [US-HER-017](categories/07-HER.md#us-her-017), [US-HER-018](categories/07-HER.md#us-her-018), [US-ESP-008](categories/14-ESP.md#us-esp-008), [US-ESP-009](categories/14-ESP.md#us-esp-009) |
| REQ-EQUIP-01 | Équiper un artéfact | [US-ART-002](categories/10-ART.md#us-art-002), [US-ART-003](categories/10-ART.md#us-art-003), [US-ART-004](categories/10-ART.md#us-art-004), [US-ART-005](categories/10-ART.md#us-art-005), [US-ART-006](categories/10-ART.md#us-art-006), [US-ART-011](categories/10-ART.md#us-art-011), [US-ART-013](categories/10-ART.md#us-art-013), [US-ART-014](categories/10-ART.md#us-art-014) |
| REQ-MAGIC-01 | Apprendre/préparer un sort | [US-ACC-009](categories/01-ACC.md#us-acc-009), [US-CIT-012](categories/02-CIT.md#us-cit-012), [US-HER-010](categories/07-HER.md#us-her-010), [US-MAG-001](categories/08-MAG.md#us-mag-001), [US-MAG-002](categories/08-MAG.md#us-mag-002), [US-MAG-003](categories/08-MAG.md#us-mag-003), [US-MAG-004](categories/08-MAG.md#us-mag-004), [US-MAG-005](categories/08-MAG.md#us-mag-005), [US-MAG-006](categories/08-MAG.md#us-mag-006), [US-MAG-007](categories/08-MAG.md#us-mag-007), [US-MAG-008](categories/08-MAG.md#us-mag-008), [US-MAG-009](categories/08-MAG.md#us-mag-009), [US-MAG-010](categories/08-MAG.md#us-mag-010), [US-MAG-011](categories/08-MAG.md#us-mag-011), [US-MAG-012](categories/08-MAG.md#us-mag-012) |
| REQ-TRADE-01 | Acheter/vendre | [US-ECH-001](categories/04-ECH.md#us-ech-001), [US-ECH-002](categories/04-ECH.md#us-ech-002), [US-ECH-003](categories/04-ECH.md#us-ech-003), [US-ECH-004](categories/04-ECH.md#us-ech-004), [US-ECH-005](categories/04-ECH.md#us-ech-005), [US-ECH-006](categories/04-ECH.md#us-ech-006), [US-ECH-007](categories/04-ECH.md#us-ech-007), [US-ECH-008](categories/04-ECH.md#us-ech-008), [US-ECH-009](categories/04-ECH.md#us-ech-009), [US-ECH-018](categories/04-ECH.md#us-ech-018), [US-ART-012](categories/10-ART.md#us-art-012) |
| REQ-CONVOY-01 | Envoyer une caravane | [US-ECH-010](categories/04-ECH.md#us-ech-010), [US-ECH-011](categories/04-ECH.md#us-ech-011), [US-ECH-012](categories/04-ECH.md#us-ech-012), [US-ECH-013](categories/04-ECH.md#us-ech-013) |
| REQ-ARMY-01 | Composer une armée | [US-ACC-008](categories/01-ACC.md#us-acc-008), [US-ARM-001](categories/09-ARM.md#us-arm-001), [US-ARM-008](categories/09-ARM.md#us-arm-008), [US-ARM-009](categories/09-ARM.md#us-arm-009), [US-ARM-010](categories/09-ARM.md#us-arm-010), [US-ARM-011](categories/09-ARM.md#us-arm-011), [US-ARM-012](categories/09-ARM.md#us-arm-012), [US-ARM-013](categories/09-ARM.md#us-arm-013), [US-ARM-014](categories/09-ARM.md#us-arm-014), [US-ARM-016](categories/09-ARM.md#us-arm-016), [US-LAR-016](categories/20-LAR.md#us-lar-016) |
| REQ-PVE-01 | Attaquer une rencontre | [US-ACC-006](categories/01-ACC.md#us-acc-006), [US-ACC-007](categories/01-ACC.md#us-acc-007), [US-ACC-008](categories/01-ACC.md#us-acc-008), [US-ACC-009](categories/01-ACC.md#us-acc-009), [US-ACC-010](categories/01-ACC.md#us-acc-010), [US-ACC-012](categories/01-ACC.md#us-acc-012), [US-REG-002](categories/05-REG.md#us-reg-002), [US-REG-003](categories/05-REG.md#us-reg-003), [US-ART-010](categories/10-ART.md#us-art-010), [US-COM-002](categories/11-COM.md#us-com-002) |
| REQ-MOVE-01 | Déplacer | [US-REL-007](categories/06-REL.md#us-rel-007), [US-HER-018](categories/07-HER.md#us-her-018), [US-ART-009](categories/10-ART.md#us-art-009), [US-MON-001](categories/12-MON.md#us-mon-001), [US-MON-004](categories/12-MON.md#us-mon-004), [US-MOV-001](categories/13-MOV.md#us-mov-001), [US-MOV-002](categories/13-MOV.md#us-mov-002), [US-MOV-003](categories/13-MOV.md#us-mov-003), [US-MOV-004](categories/13-MOV.md#us-mov-004), [US-MOV-005](categories/13-MOV.md#us-mov-005), [US-MOV-006](categories/13-MOV.md#us-mov-006), [US-MOV-008](categories/13-MOV.md#us-mov-008), [US-MOV-009](categories/13-MOV.md#us-mov-009), [US-MOV-010](categories/13-MOV.md#us-mov-010), [US-MOV-011](categories/13-MOV.md#us-mov-011), [US-MOV-012](categories/13-MOV.md#us-mov-012), [US-DIP-005](categories/18-DIP.md#us-dip-005) |
| REQ-SPY-01 | Reconnaître | [US-ESP-001](categories/14-ESP.md#us-esp-001), [US-ESP-002](categories/14-ESP.md#us-esp-002), [US-ESP-003](categories/14-ESP.md#us-esp-003), [US-ESP-004](categories/14-ESP.md#us-esp-004), [US-ESP-005](categories/14-ESP.md#us-esp-005), [US-ESP-006](categories/14-ESP.md#us-esp-006), [US-ESP-007](categories/14-ESP.md#us-esp-007), [US-ESP-008](categories/14-ESP.md#us-esp-008), [US-ESP-010](categories/14-ESP.md#us-esp-010) |
| REQ-RAID-01 | Piller | [US-PVP-001](categories/15-PVP.md#us-pvp-001), [US-PVP-002](categories/15-PVP.md#us-pvp-002), [US-PVP-003](categories/15-PVP.md#us-pvp-003), [US-PVP-004](categories/15-PVP.md#us-pvp-004), [US-PVP-005](categories/15-PVP.md#us-pvp-005), [US-PVP-006](categories/15-PVP.md#us-pvp-006), [US-PVP-007](categories/15-PVP.md#us-pvp-007), [US-PVP-008](categories/15-PVP.md#us-pvp-008), [US-PVP-009](categories/15-PVP.md#us-pvp-009), [US-PVP-010](categories/15-PVP.md#us-pvp-010) |
| REQ-SIEGE-01 | Installer un siège | [US-SIE-001](categories/16-SIE.md#us-sie-001), [US-SIE-002](categories/16-SIE.md#us-sie-002), [US-SIE-003](categories/16-SIE.md#us-sie-003), [US-SIE-004](categories/16-SIE.md#us-sie-004), [US-SIE-005](categories/16-SIE.md#us-sie-005) |
| REQ-SIEGE-02 | Bombarder/assaillir | [US-ARM-015](categories/09-ARM.md#us-arm-015), [US-SIE-006](categories/16-SIE.md#us-sie-006), [US-SIE-007](categories/16-SIE.md#us-sie-007), [US-SIE-008](categories/16-SIE.md#us-sie-008), [US-SIE-012](categories/16-SIE.md#us-sie-012), [US-SIE-013](categories/16-SIE.md#us-sie-013), [US-SIE-014](categories/16-SIE.md#us-sie-014), [US-LAR-014](categories/20-LAR.md#us-lar-014) |
| REQ-SIEGE-03 | Lever/secourir/sortir | [US-MOV-010](categories/13-MOV.md#us-mov-010), [US-MOV-011](categories/13-MOV.md#us-mov-011), [US-SIE-009](categories/16-SIE.md#us-sie-009), [US-SIE-010](categories/16-SIE.md#us-sie-010), [US-SIE-011](categories/16-SIE.md#us-sie-011), [US-LAR-022](categories/20-LAR.md#us-lar-022) |
| REQ-COMBAT-01 | Résoudre une bataille | [US-ACC-007](categories/01-ACC.md#us-acc-007), [US-CIT-011](categories/02-CIT.md#us-cit-011), [US-REL-005](categories/06-REL.md#us-rel-005), [US-REL-006](categories/06-REL.md#us-rel-006), [US-MAG-007](categories/08-MAG.md#us-mag-007), [US-MAG-008](categories/08-MAG.md#us-mag-008), [US-MAG-009](categories/08-MAG.md#us-mag-009), [US-MAG-010](categories/08-MAG.md#us-mag-010), [US-MAG-011](categories/08-MAG.md#us-mag-011), [US-ARM-014](categories/09-ARM.md#us-arm-014), [US-ARM-016](categories/09-ARM.md#us-arm-016), [US-COM-001](categories/11-COM.md#us-com-001), [US-COM-002](categories/11-COM.md#us-com-002), [US-COM-003](categories/11-COM.md#us-com-003), [US-COM-004](categories/11-COM.md#us-com-004), [US-COM-005](categories/11-COM.md#us-com-005), [US-COM-006](categories/11-COM.md#us-com-006), [US-COM-007](categories/11-COM.md#us-com-007), [US-COM-008](categories/11-COM.md#us-com-008), [US-COM-009](categories/11-COM.md#us-com-009), [US-COM-010](categories/11-COM.md#us-com-010), [US-COM-011](categories/11-COM.md#us-com-011), [US-COM-012](categories/11-COM.md#us-com-012), [US-COM-013](categories/11-COM.md#us-com-013), [US-COM-014](categories/11-COM.md#us-com-014), [US-COM-015](categories/11-COM.md#us-com-015), [US-COM-016](categories/11-COM.md#us-com-016), [US-COM-018](categories/11-COM.md#us-com-018), [US-PVP-005](categories/15-PVP.md#us-pvp-005), [US-SIE-008](categories/16-SIE.md#us-sie-008), [US-LAR-017](categories/20-LAR.md#us-lar-017) |
| REQ-ALLY-01 | Créer/rejoindre/quitter | [US-ALL-001](categories/17-ALL.md#us-all-001), [US-ALL-002](categories/17-ALL.md#us-all-002), [US-ALL-003](categories/17-ALL.md#us-all-003), [US-ALL-004](categories/17-ALL.md#us-all-004), [US-ALL-005](categories/17-ALL.md#us-all-005), [US-ALL-006](categories/17-ALL.md#us-all-006), [US-ALL-007](categories/17-ALL.md#us-all-007), [US-ALL-011](categories/17-ALL.md#us-all-011), [US-CLA-010](categories/19-CLA.md#us-cla-010), [US-CLA-011](categories/19-CLA.md#us-cla-011), [US-LAR-021](categories/20-LAR.md#us-lar-021), [US-LAR-022](categories/20-LAR.md#us-lar-022) |
| REQ-ALLY-02 | Rôle/diplomatie | [US-ESP-010](categories/14-ESP.md#us-esp-010), [US-ALL-006](categories/17-ALL.md#us-all-006), [US-ALL-008](categories/17-ALL.md#us-all-008), [US-ALL-009](categories/17-ALL.md#us-all-009), [US-ALL-010](categories/17-ALL.md#us-all-010), [US-ALL-014](categories/17-ALL.md#us-all-014), [US-DIP-001](categories/18-DIP.md#us-dip-001), [US-DIP-002](categories/18-DIP.md#us-dip-002), [US-DIP-003](categories/18-DIP.md#us-dip-003), [US-DIP-004](categories/18-DIP.md#us-dip-004), [US-DIP-005](categories/18-DIP.md#us-dip-005), [US-DIP-006](categories/18-DIP.md#us-dip-006), [US-DIP-007](categories/18-DIP.md#us-dip-007), [US-DIP-008](categories/18-DIP.md#us-dip-008) |
| REQ-ALLY-03 | Activer une compétence | [US-ALL-012](categories/17-ALL.md#us-all-012), [US-ALL-013](categories/17-ALL.md#us-all-013) |
| REQ-PATH-01 | Attribuer un rang/récompense | [US-COM-016](categories/11-COM.md#us-com-016), [US-ALL-011](categories/17-ALL.md#us-all-011), [US-CLA-001](categories/19-CLA.md#us-cla-001), [US-CLA-002](categories/19-CLA.md#us-cla-002), [US-CLA-003](categories/19-CLA.md#us-cla-003), [US-CLA-004](categories/19-CLA.md#us-cla-004), [US-CLA-005](categories/19-CLA.md#us-cla-005), [US-CLA-006](categories/19-CLA.md#us-cla-006), [US-CLA-007](categories/19-CLA.md#us-cla-007), [US-CLA-008](categories/19-CLA.md#us-cla-008), [US-CLA-009](categories/19-CLA.md#us-cla-009), [US-CLA-010](categories/19-CLA.md#us-cla-010), [US-CLA-011](categories/19-CLA.md#us-cla-011), [US-CLA-012](categories/19-CLA.md#us-cla-012), [US-LAR-001](categories/20-LAR.md#us-lar-001), [US-FIN-005](categories/21-FIN.md#us-fin-005) |
| REQ-TEAR-01 | Lancer une étape de Larme | [US-REL-008](categories/06-REL.md#us-rel-008), [US-REL-009](categories/06-REL.md#us-rel-009), [US-LAR-001](categories/20-LAR.md#us-lar-001), [US-LAR-002](categories/20-LAR.md#us-lar-002), [US-LAR-003](categories/20-LAR.md#us-lar-003), [US-LAR-004](categories/20-LAR.md#us-lar-004), [US-LAR-005](categories/20-LAR.md#us-lar-005), [US-LAR-006](categories/20-LAR.md#us-lar-006), [US-LAR-007](categories/20-LAR.md#us-lar-007), [US-LAR-008](categories/20-LAR.md#us-lar-008), [US-LAR-009](categories/20-LAR.md#us-lar-009), [US-LAR-010](categories/20-LAR.md#us-lar-010), [US-LAR-011](categories/20-LAR.md#us-lar-011), [US-LAR-012](categories/20-LAR.md#us-lar-012), [US-LAR-013](categories/20-LAR.md#us-lar-013), [US-LAR-014](categories/20-LAR.md#us-lar-014), [US-LAR-015](categories/20-LAR.md#us-lar-015), [US-LAR-016](categories/20-LAR.md#us-lar-016), [US-LAR-017](categories/20-LAR.md#us-lar-017), [US-LAR-018](categories/20-LAR.md#us-lar-018), [US-LAR-019](categories/20-LAR.md#us-lar-019), [US-LAR-020](categories/20-LAR.md#us-lar-020) |
| REQ-GRAIL-01 | Construire/perdre un monument | [US-SIE-014](categories/16-SIE.md#us-sie-014), [US-LAR-003](categories/20-LAR.md#us-lar-003), [US-LAR-020](categories/20-LAR.md#us-lar-020), [US-LAR-021](categories/20-LAR.md#us-lar-021), [US-LAR-022](categories/20-LAR.md#us-lar-022), [US-LAR-023](categories/20-LAR.md#us-lar-023) |
| REQ-WIN-01 | Vérifier la victoire classique | [US-LAR-023](categories/20-LAR.md#us-lar-023), [US-LAR-024](categories/20-LAR.md#us-lar-024), [US-FIN-001](categories/21-FIN.md#us-fin-001), [US-FIN-002](categories/21-FIN.md#us-fin-002) |
| REQ-LEGACY-01 | Transmettre l’hérédité | [US-FIN-007](categories/21-FIN.md#us-fin-007), [US-FIN-008](categories/21-FIN.md#us-fin-008), [US-FIN-009](categories/21-FIN.md#us-fin-009), [US-FIN-010](categories/21-FIN.md#us-fin-010), [US-FIN-011](categories/21-FIN.md#us-fin-011), [US-FIN-012](categories/21-FIN.md#us-fin-012) |
| REQ-PROFILE-01 | Le profil classique active la Guerre des Larmes et refuse tournoi S4, victoire Arkath et contenu non qualifié | [US-ACC-001](categories/01-ACC.md#us-acc-001), [US-REL-009](categories/06-REL.md#us-rel-009), [US-ART-011](categories/10-ART.md#us-art-011), [US-FIN-012](categories/21-FIN.md#us-fin-012) |
| REQ-HERO-03 | Modéliser trois carrières distinctes, coût d’ouverture et coûts cumulés des talents, budget et partage Scribe/Arcanes selon le profil | [US-HER-009](categories/07-HER.md#us-her-009), [US-HER-010](categories/07-HER.md#us-her-010), [US-HER-011](categories/07-HER.md#us-her-011), [US-HER-012](categories/07-HER.md#us-her-012), [US-HER-013](categories/07-HER.md#us-her-013), [US-HER-014](categories/07-HER.md#us-her-014) |
| REQ-HERO-04 | Distinguer recruter une offre et renouveler les offres de taverne, avec coûts, durées et restrictions séparés | [US-HER-005](categories/07-HER.md#us-her-005) |
| REQ-EQUIP-02 | Distinguer équipement, sac du héros et réserve de cité ; toute mutation conserve l’unicité d’un objet | [US-ART-001](categories/10-ART.md#us-art-001), [US-ART-005](categories/10-ART.md#us-art-005), [US-ART-006](categories/10-ART.md#us-art-006), [US-ART-007](categories/10-ART.md#us-art-007), [US-ART-008](categories/10-ART.md#us-art-008), [US-ART-009](categories/10-ART.md#us-art-009), [US-ART-010](categories/10-ART.md#us-art-010), [US-ART-012](categories/10-ART.md#us-art-012), [US-FIN-011](categories/21-FIN.md#us-fin-011) |
| REQ-CONVOY-02 | Un programme de caravanes expose répétition, politique de quantité et attente ; chaque trajet revalide ressources et destination | [US-ECH-014](categories/04-ECH.md#us-ech-014), [US-ECH-015](categories/04-ECH.md#us-ech-015), [US-ECH-016](categories/04-ECH.md#us-ech-016), [US-ECH-017](categories/04-ECH.md#us-ech-017) |
| REQ-UI-01 | Conserver la structure scène/royaume/chronologie/navigation pendant les changements de vue | [US-MON-008](categories/12-MON.md#us-mon-008), [US-RAP-009](categories/22-RAP.md#us-rap-009), [US-UIX-001](categories/23-UIX.md#us-uix-001) |
| REQ-UI-02 | Distinguer monde détaillé, monde politique éloigné, région et ville ; conserver la sélection au retour | [US-ACC-005](categories/01-ACC.md#us-acc-005), [US-MON-001](categories/12-MON.md#us-mon-001), [US-MON-002](categories/12-MON.md#us-mon-002), [US-MON-004](categories/12-MON.md#us-mon-004), [US-MON-008](categories/12-MON.md#us-mon-008), [US-MON-009](categories/12-MON.md#us-mon-009), [US-UIX-001](categories/23-UIX.md#us-uix-001), [US-UIX-002](categories/23-UIX.md#us-uix-002) |
| REQ-UI-03 | Sélectionner correctement une case isométrique malgré caméra, bord et objets en surplomb ; exclure le décor périphérique | [US-REG-001](categories/05-REG.md#us-reg-001), [US-UIX-003](categories/23-UIX.md#us-uix-003) |
| REQ-UI-04 | Afficher une scène de ville propre à la faction et des zones de bâtiments/états ; niveau urbain distinct du zoom | [US-CIT-001](categories/02-CIT.md#us-cit-001), [US-UIX-004](categories/23-UIX.md#us-uix-004) |
| REQ-UI-05 | Afficher routes, haltes et comptes à rebours depuis les missions serveur ; une animation ne résout pas un ordre | [US-MON-010](categories/12-MON.md#us-mon-010), [US-MOV-007](categories/13-MOV.md#us-mov-007), [US-RAP-009](categories/22-RAP.md#us-rap-009) |
| REQ-UI-06 | Préparer une bataille avec sept positions, unités, puissance expliquée, sorts/tours, durée, annuler/engager | [US-MAG-004](categories/08-MAG.md#us-mag-004), [US-ARM-009](categories/09-ARM.md#us-arm-009), [US-COM-001](categories/11-COM.md#us-com-001) |
| REQ-UI-07 | Lire un rapport par tours, avec magie, bonus d’arme et pertes, dans un panneau défilant | [US-COM-017](categories/11-COM.md#us-com-017) |
| REQ-UI-08 | Montrer les onglets héros et les trois conteneurs d’objets, avec effets et pagination sans capacité inventée | [US-HER-001](categories/07-HER.md#us-her-001), [US-ART-001](categories/10-ART.md#us-art-001) |
| REQ-UI-09 | Proposer une reconnaissance troupes/ville/région, durée et valeur d’information sans dévoiler les données cachées | [US-ESP-001](categories/14-ESP.md#us-esp-001), [US-ESP-002](categories/14-ESP.md#us-esp-002) |
| REQ-UI-10 | Présenter caravanes, colonisation et taverne en séparant coûts, délais, capacité et verrous commerciaux éventuels | [US-ECH-001](categories/04-ECH.md#us-ech-001), [US-ECH-010](categories/04-ECH.md#us-ech-010), [US-HER-002](categories/07-HER.md#us-her-002) |
| REQ-UI-11 | Résoudre les sprites depuis un manifeste ; gérer explicitement fichier absent, rectangle débordant et variante indisponible | [US-UIX-006](categories/23-UIX.md#us-uix-006) |
| REQ-UI-12 | Reproduire une famille graphique cohérente, avec textes lisibles et contrôle des états aux dimensions de référence | [US-UIX-005](categories/23-UIX.md#us-uix-005), [US-UIX-006](categories/23-UIX.md#us-uix-006) |

Les garanties AUTH, ORDER, TIME, DATA, REPORT et VIS sont également portées par la DoD commune. La table montre les rattachements explicites ; elle ne dispense aucune autre fiche des obligations transversales pertinentes.

## Exclusions explicites

| Référence | Décision |
| --- | --- |
| REQ-TOURNAMENT-01 / U37 | Tournoi saison 4 archivé ; aucune story active de manche, appariement ou destruction S4. |
| REQ-COOP-01 / U36 | Victoire coopérative Arkath archivée ; aucune story active de forteresse coopérative. |
| U39 | Ruines et règles tardives de génération/récompense non qualifiées pour le classique ; hors de cette version du backlog. |
| Services premium / U40 | Des restrictions observées sont décrites dans les fiches concernées. Aucun achat réel, abonnement ou modèle économique n’est spécifié comme condition du gameplay reconstruit. |
| Décors historiques / U44 | Recherche en cours côté projet ; substituts admis pour les parcours fonctionnels, avec validation visuelle distincte. |

Les sites régionaux sphinx, dolmen et obélisque restent bien couverts par REL/LAR. L’exclusion des ruines tardives ne les exclut pas.

## Registre des inconnues vers les fiches

Les questions et vérifications suivantes sont reprises du [registre de rétroconception](../research/INCERTITUDES.md). Les liens montrent où reporter une preuve ou un arbitrage nouvellement obtenu.

### U01 — P0, partiellement résolu

**Question :** Mode confirmé : PvP classique et Guerre des Larmes. Quelle saison/révision exacte, trêve et options ?

**Prochaine preuve :** Qualifier le profil numérique sans redemander le choix du mode

**Fiches liées (2) :** [US-ACC-001](categories/01-ACC.md#us-acc-001), [US-CLA-001](categories/19-CLA.md#us-cla-001).

### U02 — P0, version

**Question :** Quelles tables du commit 2013 sont déjà valables en S2 ?

**Prochaine preuve :** Comparer une révision antérieure de Jactari et un rapport S2

**Fiches liées (17) :** [US-ACC-002](categories/01-ACC.md#us-acc-002), [US-CIT-008](categories/02-CIT.md#us-cit-008), [US-CIT-011](categories/02-CIT.md#us-cit-011), [US-REG-005](categories/05-REG.md#us-reg-005), [US-REG-007](categories/05-REG.md#us-reg-007), [US-REL-009](categories/06-REL.md#us-rel-009), [US-HER-007](categories/07-HER.md#us-her-007), [US-HER-008](categories/07-HER.md#us-her-008), [US-MAG-001](categories/08-MAG.md#us-mag-001), [US-ARM-002](categories/09-ARM.md#us-arm-002), [US-ART-011](categories/10-ART.md#us-art-011), [US-COM-004](categories/11-COM.md#us-com-004), [US-COM-005](categories/11-COM.md#us-com-005), [US-CLA-002](categories/19-CLA.md#us-cla-002), [US-CLA-004](categories/19-CLA.md#us-cla-004), [US-CLA-005](categories/19-CLA.md#us-cla-005), [US-LAR-004](categories/20-LAR.md#us-lar-004).

### U03 — P0, temps

**Question :** À quelle cadence ressources et recrues sont-elles créditées ?

**Prochaine preuve :** Observer chiffres avant/après une frontière horaire sur archive ou capture

**Fiches liées (5) :** [US-ECO-002](categories/03-ECO.md#us-eco-002), [US-ECO-003](categories/03-ECO.md#us-eco-003), [US-ECO-008](categories/03-ECO.md#us-eco-008), [US-ARM-003](categories/09-ARM.md#us-arm-003), [US-LAR-021](categories/20-LAR.md#us-lar-021).

### U04 — P0, arrondis

**Question :** Fractions conservées, arrondis par mine ou par total ?

**Prochaine preuve :** Cas de petite production avec bonus et plafond

**Fiches liées (8) :** [US-ECO-002](categories/03-ECO.md#us-eco-002), [US-ECO-003](categories/03-ECO.md#us-eco-003), [US-ECO-004](categories/03-ECO.md#us-eco-004), [US-REG-006](categories/05-REG.md#us-reg-006), [US-REG-007](categories/05-REG.md#us-reg-007), [US-REG-010](categories/05-REG.md#us-reg-010), [US-PVP-008](categories/15-PVP.md#us-pvp-008), [US-CLA-004](categories/19-CLA.md#us-cla-004).

### U05 — P0, construction

**Question :** Combien de chantiers par cité/héros ; exécutant immobilisé combien de temps ?

**Prochaine preuve :** Tutoriel filmé et interface de files

**Fiches liées (13) :** [US-CIT-001](categories/02-CIT.md#us-cit-001), [US-CIT-003](categories/02-CIT.md#us-cit-003), [US-CIT-004](categories/02-CIT.md#us-cit-004), [US-CIT-005](categories/02-CIT.md#us-cit-005), [US-CIT-006](categories/02-CIT.md#us-cit-006), [US-CIT-007](categories/02-CIT.md#us-cit-007), [US-CIT-013](categories/02-CIT.md#us-cit-013), [US-CIT-015](categories/02-CIT.md#us-cit-015), [US-CIT-016](categories/02-CIT.md#us-cit-016), [US-ECO-006](categories/03-ECO.md#us-eco-006), [US-HER-016](categories/07-HER.md#us-her-016), [US-LAR-004](categories/20-LAR.md#us-lar-004), [US-LAR-015](categories/20-LAR.md#us-lar-015).

### U06 — P0, recrutement

**Question :** Recrues communes entre variantes ; cadence, coût et durée du recrutement ?

**Prochaine preuve :** Comparer un bâtiment avant/après amélioration et une commande de recrutement

**Fiches liées (8) :** [US-CIT-009](categories/02-CIT.md#us-cit-009), [US-CIT-010](categories/02-CIT.md#us-cit-010), [US-ARM-003](categories/09-ARM.md#us-arm-003), [US-ARM-004](categories/09-ARM.md#us-arm-004), [US-ARM-005](categories/09-ARM.md#us-arm-005), [US-ARM-006](categories/09-ARM.md#us-arm-006), [US-ARM-007](categories/09-ARM.md#us-arm-007), [US-ARM-015](categories/09-ARM.md#us-arm-015).

### U07 — P0, entretien

**Question :** Quel barème s’applique au monde cible ; quelles unités et quelle cité paient ?

**Prochaine preuve :** Retrouver outil TotG du serveur ou bilan quotidien authentique

**Fiches liées (4) :** [US-ECO-007](categories/03-ECO.md#us-eco-007), [US-ECO-008](categories/03-ECO.md#us-eco-008), [US-REG-012](categories/05-REG.md#us-reg-012), [US-REL-003](categories/06-REL.md#us-rel-003).

### U08 — P0, insolvabilité

**Question :** Déficit d’or : dette, blocage, désertion, délai ou autre ?

**Prochaine preuve :** Rapport et écran d’une cité insolvable

**Fiches liées (1) :** [US-ECO-009](categories/03-ECO.md#us-eco-009).

### U09 — P0, mouvement

**Question :** Chemin réellement traversé, diagonales, points et arrondis ?

**Prochaine preuve :** Tracé et heure réelle sur deux trajets tests dont franchissement de bord

**Fiches liées (23) :** [US-ECH-012](categories/04-ECH.md#us-ech-012), [US-REL-007](categories/06-REL.md#us-rel-007), [US-HER-018](categories/07-HER.md#us-her-018), [US-ARM-016](categories/09-ARM.md#us-arm-016), [US-ART-009](categories/10-ART.md#us-art-009), [US-COM-002](categories/11-COM.md#us-com-002), [US-MON-001](categories/12-MON.md#us-mon-001), [US-MON-004](categories/12-MON.md#us-mon-004), [US-MOV-001](categories/13-MOV.md#us-mov-001), [US-MOV-002](categories/13-MOV.md#us-mov-002), [US-MOV-003](categories/13-MOV.md#us-mov-003), [US-MOV-004](categories/13-MOV.md#us-mov-004), [US-MOV-006](categories/13-MOV.md#us-mov-006), [US-MOV-007](categories/13-MOV.md#us-mov-007), [US-MOV-008](categories/13-MOV.md#us-mov-008), [US-MOV-009](categories/13-MOV.md#us-mov-009), [US-MOV-012](categories/13-MOV.md#us-mov-012), [US-ESP-003](categories/14-ESP.md#us-esp-003), [US-PVP-004](categories/15-PVP.md#us-pvp-004), [US-PVP-009](categories/15-PVP.md#us-pvp-009), [US-SIE-002](categories/16-SIE.md#us-sie-002), [US-DIP-004](categories/18-DIP.md#us-dip-004), [US-LAR-021](categories/20-LAR.md#us-lar-021).

### U10 — P0, trêve

**Question :** Fuseau, heures, heure d’été, influence sur marche/halte/siège ?

**Prochaine preuve :** Paramètres d’un serveur français et exemples de frontière nocturne

**Fiches liées (3) :** [US-MOV-001](categories/13-MOV.md#us-mov-001), [US-MOV-004](categories/13-MOV.md#us-mov-004), [US-MOV-005](categories/13-MOV.md#us-mov-005).

### U11 — P0, combat

**Question :** Départage des égalités et faux nuls ; zéro défense ?

**Prochaine preuve :** Rapport authentique aux seuils exacts

**Fiches liées (3) :** [US-COM-009](categories/11-COM.md#us-com-009), [US-COM-010](categories/11-COM.md#us-com-010), [US-COM-011](categories/11-COM.md#us-com-011).

### U12 — P0, combat

**Question :** Admission PvP : branches de `floor(30r)` identiques au serveur ?

**Prochaine preuve :** Quatre captures autour de ratios limites

**Fiches liées (2) :** [US-HER-017](categories/07-HER.md#us-her-017), [US-COM-012](categories/11-COM.md#us-com-012).

### U13 — P0, pertes

**Question :** Traitement complet des PNJ, invocations, résurrections et absence de héros ?

**Prochaine preuve :** Rapports par catégorie et comparaison d’oracles

**Fiches liées (14) :** [US-REG-003](categories/05-REG.md#us-reg-003), [US-REL-005](categories/06-REL.md#us-rel-005), [US-MAG-008](categories/08-MAG.md#us-mag-008), [US-MAG-009](categories/08-MAG.md#us-mag-009), [US-MAG-010](categories/08-MAG.md#us-mag-010), [US-ARM-016](categories/09-ARM.md#us-arm-016), [US-COM-007](categories/11-COM.md#us-com-007), [US-COM-008](categories/11-COM.md#us-com-008), [US-COM-011](categories/11-COM.md#us-com-011), [US-COM-013](categories/11-COM.md#us-com-013), [US-COM-014](categories/11-COM.md#us-com-014), [US-COM-015](categories/11-COM.md#us-com-015), [US-COM-016](categories/11-COM.md#us-com-016), [US-CLA-003](categories/19-CLA.md#us-cla-003).

### U14 — P0, simultanéité

**Question :** Renfort et attaque à même seconde ; capture et victoire à même instant ?

**Prochaine preuve :** Historique d’incident ou règle officielle ; sinon choix annoncé

**Fiches liées (30) :** [US-CIT-011](categories/02-CIT.md#us-cit-011), [US-CIT-016](categories/02-CIT.md#us-cit-016), [US-ECH-006](categories/04-ECH.md#us-ech-006), [US-ECH-009](categories/04-ECH.md#us-ech-009), [US-ECH-017](categories/04-ECH.md#us-ech-017), [US-REL-010](categories/06-REL.md#us-rel-010), [US-ART-014](categories/10-ART.md#us-art-014), [US-MOV-008](categories/13-MOV.md#us-mov-008), [US-MOV-010](categories/13-MOV.md#us-mov-010), [US-PVP-005](categories/15-PVP.md#us-pvp-005), [US-SIE-003](categories/16-SIE.md#us-sie-003), [US-SIE-007](categories/16-SIE.md#us-sie-007), [US-SIE-010](categories/16-SIE.md#us-sie-010), [US-SIE-014](categories/16-SIE.md#us-sie-014), [US-ALL-004](categories/17-ALL.md#us-all-004), [US-ALL-013](categories/17-ALL.md#us-all-013), [US-ALL-014](categories/17-ALL.md#us-all-014), [US-LAR-001](categories/20-LAR.md#us-lar-001), [US-LAR-005](categories/20-LAR.md#us-lar-005), [US-LAR-010](categories/20-LAR.md#us-lar-010), [US-LAR-013](categories/20-LAR.md#us-lar-013), [US-LAR-014](categories/20-LAR.md#us-lar-014), [US-LAR-017](categories/20-LAR.md#us-lar-017), [US-LAR-019](categories/20-LAR.md#us-lar-019), [US-LAR-022](categories/20-LAR.md#us-lar-022), [US-LAR-024](categories/20-LAR.md#us-lar-024), [US-FIN-001](categories/21-FIN.md#us-fin-001), [US-FIN-002](categories/21-FIN.md#us-fin-002), [US-FIN-004](categories/21-FIN.md#us-fin-004), [US-RAP-007](categories/22-RAP.md#us-rap-007).

### U15 — P1, influence

**Question :** Formule spatiale, fenêtre de moyenne, fréquence et conflits ?

**Prochaine preuve :** Export de carte sur plusieurs jours avec puissances connues

**Fiches liées (1) :** [US-MON-005](categories/12-MON.md#us-mon-005).

### U16 — P1, colonisation

**Question :** Coût complet, limites, distance, état initial et réservation ?

**Prochaine preuve :** Formulaires sur monde classique normal avec différents nombres de cités

**Fiches liées (5) :** [US-MON-006](categories/12-MON.md#us-mon-006), [US-MON-007](categories/12-MON.md#us-mon-007), [US-SIE-001](categories/16-SIE.md#us-sie-001), [US-SIE-012](categories/16-SIE.md#us-sie-012), [US-CLA-007](categories/19-CLA.md#us-cla-007).

### U17 — P1, génération

**Question :** Taille, terrain, distribution des quatre mines, PNJ, sites spéciaux ?

**Prochaine preuve :** Plusieurs régions initiales, générateur/client archivé s’il existe

**Fiches liées (12) :** [US-ACC-003](categories/01-ACC.md#us-acc-003), [US-ACC-004](categories/01-ACC.md#us-acc-004), [US-REG-001](categories/05-REG.md#us-reg-001), [US-REG-002](categories/05-REG.md#us-reg-002), [US-REG-003](categories/05-REG.md#us-reg-003), [US-REG-004](categories/05-REG.md#us-reg-004), [US-REG-006](categories/05-REG.md#us-reg-006), [US-REL-001](categories/06-REL.md#us-rel-001), [US-ART-010](categories/10-ART.md#us-art-010), [US-COM-002](categories/11-COM.md#us-com-002), [US-MON-007](categories/12-MON.md#us-mon-007), [US-LAR-006](categories/20-LAR.md#us-lar-006).

### U18 — P1, défense

**Question :** Sélection/tri des sept pelotons et attribution des héros en garnison ?

**Prochaine preuve :** Rapport avec plus de sept pelotons et plusieurs héros

**Fiches liées (14) :** [US-REL-006](categories/06-REL.md#us-rel-006), [US-ARM-001](categories/09-ARM.md#us-arm-001), [US-ARM-008](categories/09-ARM.md#us-arm-008), [US-ARM-009](categories/09-ARM.md#us-arm-009), [US-ARM-010](categories/09-ARM.md#us-arm-010), [US-ARM-011](categories/09-ARM.md#us-arm-011), [US-ARM-012](categories/09-ARM.md#us-arm-012), [US-ARM-013](categories/09-ARM.md#us-arm-013), [US-COM-001](categories/11-COM.md#us-com-001), [US-COM-006](categories/11-COM.md#us-com-006), [US-MOV-010](categories/13-MOV.md#us-mov-010), [US-PVP-005](categories/15-PVP.md#us-pvp-005), [US-SIE-009](categories/16-SIE.md#us-sie-009), [US-LAR-016](categories/20-LAR.md#us-lar-016).

### U19 — P1, siège

**Question :** Durée totale, encerclement, Graals, sortie/secours et retour des renforts ?

**Prochaine preuve :** Calculateur TotG et rapports horodatés de siège

**Fiches liées (22) :** [US-CIT-006](categories/02-CIT.md#us-cit-006), [US-CIT-016](categories/02-CIT.md#us-cit-016), [US-ECH-013](categories/04-ECH.md#us-ech-013), [US-HER-018](categories/07-HER.md#us-her-018), [US-ARM-013](categories/09-ARM.md#us-arm-013), [US-ARM-015](categories/09-ARM.md#us-arm-015), [US-MOV-009](categories/13-MOV.md#us-mov-009), [US-MOV-010](categories/13-MOV.md#us-mov-010), [US-MOV-011](categories/13-MOV.md#us-mov-011), [US-ESP-008](categories/14-ESP.md#us-esp-008), [US-ESP-009](categories/14-ESP.md#us-esp-009), [US-SIE-001](categories/16-SIE.md#us-sie-001), [US-SIE-002](categories/16-SIE.md#us-sie-002), [US-SIE-003](categories/16-SIE.md#us-sie-003), [US-SIE-004](categories/16-SIE.md#us-sie-004), [US-SIE-005](categories/16-SIE.md#us-sie-005), [US-SIE-008](categories/16-SIE.md#us-sie-008), [US-SIE-009](categories/16-SIE.md#us-sie-009), [US-SIE-010](categories/16-SIE.md#us-sie-010), [US-SIE-011](categories/16-SIE.md#us-sie-011), [US-SIE-012](categories/16-SIE.md#us-sie-012), [US-SIE-013](categories/16-SIE.md#us-sie-013).

### U20 — P1, protection

**Question :** Dernière cité, débutant, inactif, vacances et immunités ?

**Prochaine preuve :** Règles de serveur et écrans de refus d’attaque

**Fiches liées (6) :** [US-ACC-011](categories/01-ACC.md#us-acc-011), [US-COM-003](categories/11-COM.md#us-com-003), [US-PVP-001](categories/15-PVP.md#us-pvp-001), [US-PVP-010](categories/15-PVP.md#us-pvp-010), [US-SIE-001](categories/16-SIE.md#us-sie-001), [US-SIE-013](categories/16-SIE.md#us-sie-013).

### U21 — P1, bombardement

**Question :** Tirage de cibles et sort des prérequis après destruction ?

**Prochaine preuve :** Rapport détaillé avant/après destruction de plusieurs bâtiments

**Fiches liées (3) :** [US-REL-010](categories/06-REL.md#us-rel-010), [US-SIE-006](categories/16-SIE.md#us-sie-006), [US-SIE-007](categories/16-SIE.md#us-sie-007).

### U22 — P1, pillage

**Question :** Capacité de butin, transport, fraction adjacente et ciblage ?

**Prochaine preuve :** Rapport de pillage de faible et forte puissance

**Fiches liées (9) :** [US-PVP-001](categories/15-PVP.md#us-pvp-001), [US-PVP-002](categories/15-PVP.md#us-pvp-002), [US-PVP-003](categories/15-PVP.md#us-pvp-003), [US-PVP-004](categories/15-PVP.md#us-pvp-004), [US-PVP-005](categories/15-PVP.md#us-pvp-005), [US-PVP-006](categories/15-PVP.md#us-pvp-006), [US-PVP-007](categories/15-PVP.md#us-pvp-007), [US-PVP-008](categories/15-PVP.md#us-pvp-008), [US-PVP-009](categories/15-PVP.md#us-pvp-009).

### U23 — P1, espionnage

**Question :** Probabilités de qualité/détection/capture et défense ?

**Prochaine preuve :** Plusieurs couples durée/score et rapports de résultat avec héros connus

**Fiches liées (13) :** [US-HER-017](categories/07-HER.md#us-her-017), [US-COM-001](categories/11-COM.md#us-com-001), [US-MON-003](categories/12-MON.md#us-mon-003), [US-MON-010](categories/12-MON.md#us-mon-010), [US-ESP-001](categories/14-ESP.md#us-esp-001), [US-ESP-002](categories/14-ESP.md#us-esp-002), [US-ESP-003](categories/14-ESP.md#us-esp-003), [US-ESP-004](categories/14-ESP.md#us-esp-004), [US-ESP-005](categories/14-ESP.md#us-esp-005), [US-ESP-006](categories/14-ESP.md#us-esp-006), [US-ESP-007](categories/14-ESP.md#us-esp-007), [US-ESP-008](categories/14-ESP.md#us-esp-008), [US-ESP-009](categories/14-ESP.md#us-esp-009).

### U24 — P1, partiellement résolu

**Question :** Courbe des prix, renouvellement et limites de héros ?

**Prochaine preuve :** Captures de recrutements successifs ; prix observés non universalisés

**Fiches liées (5) :** [US-HER-002](categories/07-HER.md#us-her-002), [US-HER-003](categories/07-HER.md#us-her-003), [US-HER-004](categories/07-HER.md#us-her-004), [US-HER-005](categories/07-HER.md#us-her-005), [US-HER-006](categories/07-HER.md#us-her-006).

### U25 — P1, partiellement résolu

**Question :** Niveaux d’ouverture, calendrier serveur et disponibilité des bonus ?

**Prochaine preuve :** Comparer le configurateur tardif à un héros de la saison classique cible

**Fiches liées (8) :** [US-HER-009](categories/07-HER.md#us-her-009), [US-HER-010](categories/07-HER.md#us-her-010), [US-HER-011](categories/07-HER.md#us-her-011), [US-HER-012](categories/07-HER.md#us-her-012), [US-HER-013](categories/07-HER.md#us-her-013), [US-HER-014](categories/07-HER.md#us-her-014), [US-HER-015](categories/07-HER.md#us-her-015), [US-ARM-006](categories/09-ARM.md#us-arm-006).

### U26 — P1, magie

**Question :** Apprentissage, recharge, cumul des mêmes sorts, effet négatif ?

**Prochaine preuve :** Rapports et écrans de sorts de la saison cible

**Fiches liées (11) :** [US-CIT-012](categories/02-CIT.md#us-cit-012), [US-MAG-001](categories/08-MAG.md#us-mag-001), [US-MAG-002](categories/08-MAG.md#us-mag-002), [US-MAG-003](categories/08-MAG.md#us-mag-003), [US-MAG-004](categories/08-MAG.md#us-mag-004), [US-MAG-005](categories/08-MAG.md#us-mag-005), [US-MAG-006](categories/08-MAG.md#us-mag-006), [US-MAG-007](categories/08-MAG.md#us-mag-007), [US-MAG-008](categories/08-MAG.md#us-mag-008), [US-MAG-011](categories/08-MAG.md#us-mag-011), [US-MAG-012](categories/08-MAG.md#us-mag-012).

### U27 — P1, partiellement résolu

**Question :** Butin, liaison, capacité et conditions de transfert ?

**Prochaine preuve :** Parcours de transfert et tables de disponibilité par saison

**Fiches liées (16) :** [US-ART-001](categories/10-ART.md#us-art-001), [US-ART-002](categories/10-ART.md#us-art-002), [US-ART-003](categories/10-ART.md#us-art-003), [US-ART-004](categories/10-ART.md#us-art-004), [US-ART-005](categories/10-ART.md#us-art-005), [US-ART-006](categories/10-ART.md#us-art-006), [US-ART-007](categories/10-ART.md#us-art-007), [US-ART-008](categories/10-ART.md#us-art-008), [US-ART-009](categories/10-ART.md#us-art-009), [US-ART-010](categories/10-ART.md#us-art-010), [US-ART-011](categories/10-ART.md#us-art-011), [US-ART-012](categories/10-ART.md#us-art-012), [US-ART-013](categories/10-ART.md#us-art-013), [US-ART-014](categories/10-ART.md#us-art-014), [US-SIE-013](categories/16-SIE.md#us-sie-013), [US-FIN-011](categories/21-FIN.md#us-fin-011).

### U28 — P1, commerce

**Question :** Tarifs, commissions, capacité mixte et sémantique des convois répétés ?

**Prochaine preuve :** Capturer les listes et un cycle complet de répétition ; ne pas additionner les maxima

**Fiches liées (19) :** [US-ECO-006](categories/03-ECO.md#us-eco-006), [US-ECH-001](categories/04-ECH.md#us-ech-001), [US-ECH-002](categories/04-ECH.md#us-ech-002), [US-ECH-003](categories/04-ECH.md#us-ech-003), [US-ECH-004](categories/04-ECH.md#us-ech-004), [US-ECH-005](categories/04-ECH.md#us-ech-005), [US-ECH-006](categories/04-ECH.md#us-ech-006), [US-ECH-007](categories/04-ECH.md#us-ech-007), [US-ECH-008](categories/04-ECH.md#us-ech-008), [US-ECH-009](categories/04-ECH.md#us-ech-009), [US-ECH-010](categories/04-ECH.md#us-ech-010), [US-ECH-011](categories/04-ECH.md#us-ech-011), [US-ECH-012](categories/04-ECH.md#us-ech-012), [US-ECH-013](categories/04-ECH.md#us-ech-013), [US-ECH-014](categories/04-ECH.md#us-ech-014), [US-ECH-015](categories/04-ECH.md#us-ech-015), [US-ECH-016](categories/04-ECH.md#us-ech-016), [US-ECH-017](categories/04-ECH.md#us-ech-017), [US-ART-012](categories/10-ART.md#us-art-012).

### U29 — P1, balance

**Question :** Solde par paire ou agrégé, croissance, exclusions et contrôle exact ?

**Prochaine preuve :** Message de refus et soldes avant/après plusieurs échanges

**Fiches liées (1) :** [US-ECH-018](categories/04-ECH.md#us-ech-018).

### U30 — P1, partiellement résolu

**Question :** Arrondis, or, débordements et marchandises en vente ?

**Prochaine preuve :** Capacités par niveau et crédits au-delà du plafond

**Fiches liées (11) :** [US-ACC-010](categories/01-ACC.md#us-acc-010), [US-CIT-014](categories/02-CIT.md#us-cit-014), [US-ECO-001](categories/03-ECO.md#us-eco-001), [US-ECO-004](categories/03-ECO.md#us-eco-004), [US-ECO-010](categories/03-ECO.md#us-eco-010), [US-ECH-003](categories/04-ECH.md#us-ech-003), [US-ECH-008](categories/04-ECH.md#us-ech-008), [US-ECH-013](categories/04-ECH.md#us-ech-013), [US-REG-011](categories/05-REG.md#us-reg-011), [US-PVP-009](categories/15-PVP.md#us-pvp-009), [US-RAP-006](categories/22-RAP.md#us-rap-006).

### U31 — P1, alliance

**Question :** Capacités/rangs exacts, score et droits détaillés ?

**Prochaine preuve :** Écran d’alliance de rangs 1, 5, 6, 7 et 10

**Fiches liées (21) :** [US-ESP-010](categories/14-ESP.md#us-esp-010), [US-ALL-001](categories/17-ALL.md#us-all-001), [US-ALL-002](categories/17-ALL.md#us-all-002), [US-ALL-003](categories/17-ALL.md#us-all-003), [US-ALL-004](categories/17-ALL.md#us-all-004), [US-ALL-005](categories/17-ALL.md#us-all-005), [US-ALL-006](categories/17-ALL.md#us-all-006), [US-ALL-007](categories/17-ALL.md#us-all-007), [US-ALL-008](categories/17-ALL.md#us-all-008), [US-ALL-009](categories/17-ALL.md#us-all-009), [US-ALL-010](categories/17-ALL.md#us-all-010), [US-ALL-011](categories/17-ALL.md#us-all-011), [US-ALL-012](categories/17-ALL.md#us-all-012), [US-ALL-013](categories/17-ALL.md#us-all-013), [US-ALL-014](categories/17-ALL.md#us-all-014), [US-CLA-010](categories/19-CLA.md#us-cla-010), [US-CLA-011](categories/19-CLA.md#us-cla-011), [US-CLA-012](categories/19-CLA.md#us-cla-012), [US-LAR-022](categories/20-LAR.md#us-lar-022), [US-RAP-005](categories/22-RAP.md#us-rap-005), [US-RAP-010](categories/22-RAP.md#us-rap-010).

### U32 — P1, diplomatie

**Question :** Pactes, délais, alliances parentes et effets sur ordres déjà partis ?

**Prochaine preuve :** Messages diplomatiques et temps d’effet

**Fiches liées (10) :** [US-COM-003](categories/11-COM.md#us-com-003), [US-MOV-006](categories/13-MOV.md#us-mov-006), [US-MOV-009](categories/13-MOV.md#us-mov-009), [US-SIE-010](categories/16-SIE.md#us-sie-010), [US-DIP-001](categories/18-DIP.md#us-dip-001), [US-DIP-002](categories/18-DIP.md#us-dip-002), [US-DIP-003](categories/18-DIP.md#us-dip-003), [US-DIP-004](categories/18-DIP.md#us-dip-004), [US-DIP-005](categories/18-DIP.md#us-dip-005), [US-DIP-008](categories/18-DIP.md#us-dip-008).

### U33 — P1, Larmes

**Question :** Fréquence d’obtention, simultanéité, possession/vol et perte en conquête ?

**Prochaine preuve :** Journal de progression d’une alliance sur toute la guerre

**Fiches liées (30) :** [US-REL-008](categories/06-REL.md#us-rel-008), [US-REL-009](categories/06-REL.md#us-rel-009), [US-MOV-012](categories/13-MOV.md#us-mov-012), [US-SIE-014](categories/16-SIE.md#us-sie-014), [US-ALL-005](categories/17-ALL.md#us-all-005), [US-ALL-006](categories/17-ALL.md#us-all-006), [US-CLA-011](categories/19-CLA.md#us-cla-011), [US-LAR-001](categories/20-LAR.md#us-lar-001), [US-LAR-002](categories/20-LAR.md#us-lar-002), [US-LAR-003](categories/20-LAR.md#us-lar-003), [US-LAR-004](categories/20-LAR.md#us-lar-004), [US-LAR-005](categories/20-LAR.md#us-lar-005), [US-LAR-006](categories/20-LAR.md#us-lar-006), [US-LAR-007](categories/20-LAR.md#us-lar-007), [US-LAR-008](categories/20-LAR.md#us-lar-008), [US-LAR-009](categories/20-LAR.md#us-lar-009), [US-LAR-010](categories/20-LAR.md#us-lar-010), [US-LAR-011](categories/20-LAR.md#us-lar-011), [US-LAR-012](categories/20-LAR.md#us-lar-012), [US-LAR-013](categories/20-LAR.md#us-lar-013), [US-LAR-014](categories/20-LAR.md#us-lar-014), [US-LAR-015](categories/20-LAR.md#us-lar-015), [US-LAR-016](categories/20-LAR.md#us-lar-016), [US-LAR-017](categories/20-LAR.md#us-lar-017), [US-LAR-018](categories/20-LAR.md#us-lar-018), [US-LAR-019](categories/20-LAR.md#us-lar-019), [US-LAR-020](categories/20-LAR.md#us-lar-020), [US-LAR-021](categories/20-LAR.md#us-lar-021), [US-LAR-022](categories/20-LAR.md#us-lar-022), [US-LAR-023](categories/20-LAR.md#us-lar-023).

### U34 — P1, victoire

**Question :** Décompte précis du maintien, égalité entre alliances, date de clôture ?

**Prochaine preuve :** Annonce de victoire et derniers changements de monuments

**Fiches liées (10) :** [US-SIE-014](categories/16-SIE.md#us-sie-014), [US-CLA-012](categories/19-CLA.md#us-cla-012), [US-LAR-023](categories/20-LAR.md#us-lar-023), [US-LAR-024](categories/20-LAR.md#us-lar-024), [US-FIN-001](categories/21-FIN.md#us-fin-001), [US-FIN-002](categories/21-FIN.md#us-fin-002), [US-FIN-003](categories/21-FIN.md#us-fin-003), [US-FIN-004](categories/21-FIN.md#us-fin-004), [US-FIN-005](categories/21-FIN.md#us-fin-005), [US-FIN-006](categories/21-FIN.md#us-fin-006).

### U35 — P1, hérédité

**Question :** Calcul exact, cas G=5, prix, unions, héritier et consommation ?

**Prochaine preuve :** Résultat final et écran de sélection du monde suivant

**Fiches liées (7) :** [US-FIN-006](categories/21-FIN.md#us-fin-006), [US-FIN-007](categories/21-FIN.md#us-fin-007), [US-FIN-008](categories/21-FIN.md#us-fin-008), [US-FIN-009](categories/21-FIN.md#us-fin-009), [US-FIN-010](categories/21-FIN.md#us-fin-010), [US-FIN-011](categories/21-FIN.md#us-fin-011), [US-FIN-012](categories/21-FIN.md#us-fin-012).

### U36 — Hors socle, Arkath

**Question :** Génération des assauts, forteresses et cérémonie ?

**Prochaine preuve :** Archivé ; ne bloque pas le PvP classique confirmé

**Fiches liées (0) :** aucune fiche active ; exclusion explicitée ci-dessus.

### U37 — Hors socle, tournoi

**Question :** Seuils intermédiaires, appariement et égalités S4 ?

**Prochaine preuve :** Archivé ; ne bloque pas la Guerre des Larmes classique

**Fiches liées (0) :** aucune fiche active ; exclusion explicitée ci-dessus.

### U38 — P2, contenu

**Question :** Quêtes et récompenses exhaustives, blocages du tutoriel ?

**Prochaine preuve :** Archives de quêtes et parcours filmé neuf

**Fiches liées (11) :** [US-ACC-005](categories/01-ACC.md#us-acc-005), [US-ACC-006](categories/01-ACC.md#us-acc-006), [US-ACC-007](categories/01-ACC.md#us-acc-007), [US-ACC-008](categories/01-ACC.md#us-acc-008), [US-ACC-009](categories/01-ACC.md#us-acc-009), [US-ACC-010](categories/01-ACC.md#us-acc-010), [US-ACC-012](categories/01-ACC.md#us-acc-012), [US-COM-009](categories/11-COM.md#us-com-009), [US-CLA-006](categories/19-CLA.md#us-cla-006), [US-RAP-006](categories/22-RAP.md#us-rap-006), [US-RAP-007](categories/22-RAP.md#us-rap-007).

### U39 — P2, aléatoire

**Question :** Ruines : probabilités, fortification, effondrement et récompenses ?

**Prochaine preuve :** Table d’origine lisible ou distribution documentée

**Fiches liées (0) :** aucune fiche active ; exclusion explicitée ci-dessus.

### U40 — P2, services

**Question :** Fonctions gratuites/premium par date et serveur ?

**Prochaine preuve :** Archive des offres et droits effectifs

**Fiches liées (4) :** [US-ECH-001](categories/04-ECH.md#us-ech-001), [US-HER-004](categories/07-HER.md#us-her-004), [US-ART-013](categories/10-ART.md#us-art-013), [US-COM-018](categories/11-COM.md#us-com-018).

### U41 — P1, partiellement résolu

**Question :** Gestes exacts, filtres, écrans alliance/Larmes, états et animations ?

**Prochaine preuve :** Vidéos avant/clic/résultat ; alliance et fin de campagne absentes du lot

**Fiches liées (28) :** [US-HER-001](categories/07-HER.md#us-her-001), [US-HER-006](categories/07-HER.md#us-her-006), [US-COM-017](categories/11-COM.md#us-com-017), [US-MON-003](categories/12-MON.md#us-mon-003), [US-MON-008](categories/12-MON.md#us-mon-008), [US-MON-009](categories/12-MON.md#us-mon-009), [US-MON-010](categories/12-MON.md#us-mon-010), [US-ESP-010](categories/14-ESP.md#us-esp-010), [US-SIE-004](categories/16-SIE.md#us-sie-004), [US-ALL-009](categories/17-ALL.md#us-all-009), [US-DIP-006](categories/18-DIP.md#us-dip-006), [US-DIP-007](categories/18-DIP.md#us-dip-007), [US-DIP-008](categories/18-DIP.md#us-dip-008), [US-CLA-008](categories/19-CLA.md#us-cla-008), [US-CLA-009](categories/19-CLA.md#us-cla-009), [US-RAP-001](categories/22-RAP.md#us-rap-001), [US-RAP-002](categories/22-RAP.md#us-rap-002), [US-RAP-003](categories/22-RAP.md#us-rap-003), [US-RAP-004](categories/22-RAP.md#us-rap-004), [US-RAP-005](categories/22-RAP.md#us-rap-005), [US-RAP-008](categories/22-RAP.md#us-rap-008), [US-RAP-009](categories/22-RAP.md#us-rap-009), [US-RAP-010](categories/22-RAP.md#us-rap-010), [US-UIX-001](categories/23-UIX.md#us-uix-001), [US-UIX-002](categories/23-UIX.md#us-uix-002), [US-UIX-003](categories/23-UIX.md#us-uix-003), [US-UIX-004](categories/23-UIX.md#us-uix-004), [US-UIX-005](categories/23-UIX.md#us-uix-005).

### U42 — P1, anomalie outil

**Question :** Double ajout de bonus légendaire et pertes temporaires erronées ?

**Prochaine preuve :** Versions antérieures/suivantes et rapports tardifs

**Fiches liées (6) :** [US-MAG-009](categories/08-MAG.md#us-mag-009), [US-MAG-010](categories/08-MAG.md#us-mag-010), [US-COM-005](categories/11-COM.md#us-com-005), [US-COM-006](categories/11-COM.md#us-com-006), [US-COM-007](categories/11-COM.md#us-com-007), [US-COM-015](categories/11-COM.md#us-com-015).

### U43 — P2, référentiel

**Question :** Entrées vides, descriptions manquantes, placeholders régionaux ?

**Prochaine preuve :** Rapport du validateur puis recherche ciblée

**Fiches liées (11) :** [US-CIT-002](categories/02-CIT.md#us-cit-002), [US-REG-008](categories/05-REG.md#us-reg-008), [US-REG-009](categories/05-REG.md#us-reg-009), [US-REG-012](categories/05-REG.md#us-reg-012), [US-REL-001](categories/06-REL.md#us-rel-001), [US-REL-002](categories/06-REL.md#us-rel-002), [US-REL-004](categories/06-REL.md#us-rel-004), [US-REL-005](categories/06-REL.md#us-rel-005), [US-REL-006](categories/06-REL.md#us-rel-006), [US-REL-007](categories/06-REL.md#us-rel-007), [US-LAR-011](categories/20-LAR.md#us-lar-011).

### U44 — P1, graphisme

**Question :** Où sont les tuiles monde/région, scènes de ville, couches de bâtiments et hotspots ?

**Prochaine preuve :** Retrouver le client/assets séparés ou reconstruire les éléments avec écart annoncé

**Fiches liées (2) :** [US-UIX-004](categories/23-UIX.md#us-uix-004), [US-UIX-006](categories/23-UIX.md#us-uix-006).

### U45 — P2, anomalies visuelles

**Question :** Quels remplacements pour placeholders et contrôles absents ?

**Prochaine preuve :** Couche d’adaptation et contrôle visuel, sans modifier l’archive

**Fiches liées (2) :** [US-ART-002](categories/10-ART.md#us-art-002), [US-UIX-006](categories/23-UIX.md#us-uix-006).

### U46 — P1, interface

**Question :** Zoom politique automatique ou filtre ; nombre d’échelles et gestes d’origine ?

**Prochaine preuve :** Séquence de navigation filmée ; spécification proposée explicitement distincte

**Fiches liées (5) :** [US-MON-001](categories/12-MON.md#us-mon-001), [US-MON-002](categories/12-MON.md#us-mon-002), [US-UIX-002](categories/23-UIX.md#us-uix-002), [US-UIX-003](categories/23-UIX.md#us-uix-003), [US-UIX-004](categories/23-UIX.md#us-uix-004).


## Décisions à instruire avant les premières estimations

| Groupe | Résultat concret attendu | Impact |
| --- | --- | --- |
| Profil numérique U01/U02 | Une saison, une révision de tables, des options de trêve et une liste de contenus autorisés | Toutes les valeurs historiques et l’activation des variantes |
| Temps et économie U03–U08 | Exemples avant/après : cadence, arrondis, files, recrutement, entretien et déficit | Boucle locale ; ne pas choisir silencieusement une désertion ou une dette |
| Combat U11–U14/U18/U26/U42 | Rapports étalons avec entrées et sorties, règles de simultanéité | Combat local puis PvP ; isoler les anomalies du calculateur |
| Monde U09/U10/U15/U16/U19–U23 | Trajets horodatés, protection, reconnaissance et siège complet | Guerre territoriale et logistique |
| Collectif U31/U32 | Table de rangs confirmée, permissions et effets des accords sur les ordres partis | Alliances, diplomatie et déclenchement des Larmes |
| Larmes U33/U34 | Journal d’acquisition, construction, vol/perte et maintien jusqu’à la clôture | Fin de campagne ; priorité sur les écrans non présents dans le lot |
| Hérédité U35 | Barème sélectionné et exemple complet de fin puis nouveau monde | Transmission ; unions et héritier restent conditionnels |
| Interface U41/U44–U46 | Séquences de navigation, dimensions/hotspots et assets disponibles | Fidélité visuelle, sans bloquer toute la validation fonctionnelle |

Ces travaux de recherche sont des activités d’affinage, pas des user stories de gameplay supplémentaires ajoutées artificiellement au total de 300.

## Cas conditionnels à arbitrer

| Fiche | Capacité | État |
| --- | --- | --- |
| [US-ECH-007](categories/04-ECH.md#us-ech-007) | Participer à une enchère autorisée | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-ECH-008](categories/04-ECH.md#us-ech-008) | Retirer une offre | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-ART-009](categories/10-ART.md#us-art-009) | Transporter un artefact entre cités | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-MOV-008](categories/13-MOV.md#us-mov-008) | Rappeler une mission autorisée | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-ESP-009](categories/14-ESP.md#us-esp-009) | Obtenir une libération autorisée | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-DIP-002](categories/18-DIP.md#us-dip-002) | Proposer un accord | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-DIP-003](categories/18-DIP.md#us-dip-003) | Accepter un accord | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-DIP-004](categories/18-DIP.md#us-dip-004) | Rompre un accord | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-FIN-010](categories/21-FIN.md#us-fin-010) | Former une union dynastique si le profil l’autorise | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-FIN-011](categories/21-FIN.md#us-fin-011) | Préparer un héritier et une transmission autorisée | Conditionnelle ; règle ou disponibilité à confirmer |
| [US-RAP-007](categories/22-RAP.md#us-rap-007) | Comprendre l’expiration d’une récompense | Conditionnelle ; règle ou disponibilité à confirmer |

Les 44 propositions PROP sont repérables dans l’[index](INDEX-STORIES.md) et le JSON. Elles couvrent principalement les garanties nécessaires à la reconstruction et des choix d’interface/coordination, sans être présentées comme des traces historiques.
