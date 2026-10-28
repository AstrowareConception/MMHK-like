# Ville du Havre — bâtiments, héros, garnison et recrutements

**Tranche jouable incrémentale (28 octobre 2026)**. Les 300 US existantes restent les exigences de référence : aucune US supplémentaire n'a été créée. Les coûts ci-dessous et les deux types d'unités du laboratoire sont **des profils expérimentaux**, pas des règles historiques MMHK prouvées.

## Rattachement aux US

| Partie livrée | US existantes | Limite avant validation complète |
| --- | --- | --- |
| Ville illustrée, emplacements historiques et bâtiments construits | US-CIT-001, US-UIX-004, US-UIX-006 | La plupart des vrais GIF Ubisoft ne sont pas récupérés ; art SVG original et labels d'état à la place |
| Devis, lancement, prérequis, achèvement | US-CIT-002/003/004/005/006/007 | Catalogue laboratoire, une construction active, coûts non certifiés |
| Branches de construction | US-CIT-008/009/011/012/013/014 | Effets de certains bâtiments pas encore réalisés |
| Consulter héros, taverne, embauche | US-HER-001/002/003/004 | Offres et capacité locale expérimentales, pas de talents ou évolution |
| Garnison et recrutement | US-ARM-001/002/003/004/005 | Stock local de recrues fini ; cadence de renouvellement et files historiques non simulées |
| Affecter les unités à un héros et les rapatrier | US-ARM-008/009, US-HER-016 | Sans combat ni déplacements, héros uniquement disponibles |

## Scène de ville

- Remplacement du panorama CSS extrêmement rudimentaire par `apps/web/public/themes/public-safe/haven-landscape.svg` (illustration **originale**, redistribuable).
- Bâtiments vectoriels dessinés à partir de formes originales, apparaissant seulement quand les niveaux sont **terminés dans PostgreSQL**. Les emplacements libres restent de petits repères de construction ; aucune forteresse préconstruite ne s'affiche dans une jeune ville.
- Coordonnées d'implantation retenues uniquement quand extraites du `CITYVIEW_CONF` 4.1.3-MTR : Hôtel de village, Hôtel de ville, Taverne, Marché, Silos, Fort, demeures T1/T2, forge et guilde. Les bâtiments sans ancrage vérifié restent disponibles dans les cartes de construction, sans être disposés au hasard.
- Portraits SVG originaux `haven-militia.svg` et `haven-archer.svg`. Aucun PNG/JPG historique n'est ajouté au bundle public.
- Le calque historique de la taverne reste accessible dans le thème local privé si celui-ci est activé et que le bâtiment existe.

## Économie de la tranche

La migration 008 ajoute des profils d'unités, des réserves de recrues, des garnisons, des offres de taverne, des héros et des reçus d'ordres. La migration 009 ajoute les unités des héros et les transferts enregistrés. Les ordres de recrutement/embauche/transfert :
- vérifient le propriétaire de la ville et les droits ;
- contrôlent les bâtiments opérationnels et les disponibilités réelles ;
- appliquent des débits atomiques au serveur avec validation de coûts non négatifs et sans dépassement de bigint ;
- utilisent un UUID d'idempotence pour ne pas débiter/embaucher/déplacer deux fois un même ordre ;
- empêchent les emprunts d'unités à des héros ou villes d'autres joueurs ;
- ne proposent aucune API de combat non certifiée.

## Mise à niveau des parties locales existantes

`tools/local/stack.py start --historical` lance `mmhk_api.demo_expansion` après démarrage. L'outil refuse l'opération hors de `MMHK_LOCAL_DEMO_ENABLED=true` et de la base `PGDATABASE=mmhk_local`. Il vérifie l'existence de `local-sandbox`, enrichit le **catalogue** de bâtiments avec des branches (taverne, demeures T1 et T2, fortifications, hôtel de ville, forge, guilde des mages, écuries, tour de guet et niveaux supplémentaires de marché/silos), initialise des offres de héros et des réserves expérimentales de recrues si absentes.

Cette opération est **idempotente** et ne réinitialise ni villes, ni stocks, ni chantiers, ni mots de passe, ni héros ou armées déjà créés. La protection reste valable lorsque l'application est redémarrée.

## Statut réel des tests

La CI vérifie les migrations PostgreSQL, les permissions d'accès, les dépenses, les replays, les capacités de recrutement, les transferts réversibles, les contrats API, le build Next.js, le thème public sûr, Docker et un parcours Chromium comprenant construction, recrutement et affectation.

Les US ci-dessus ne sont pas déclarées entièrement acceptées : le recrutement reste instantané, la croissance des pools est à modéliser, les héros n'ont pas encore de caractéristiques complètes ni de fonctions de déplacement/combat. Le patrimoine graphique d'origine est incomplet et l'écart artistique avec MMHK doit encore être revu.
