# Exécution — interactions des bâtiments et historique des constructions

US existantes partiellement couvertes : **US-CIT-001/002/003/004/005/007** et **US-UIX-004/006**.

- Le panorama Havre permet de sélectionner au clavier ou au pointeur les bâtiments dont les ancres sont attestées. Les projets sans ancre vérifiée restent accessibles dans le catalogue.
- La fiche contextuelle montre état, niveau, prérequis, durées, trois modes, coûts et déficits selon les données réellement transmises par FastAPI.
- La sélection ne débite rien ; le paiement au lancement reste transactionnel, limité à un chantier par cité, revalidé côté serveur.
- Le catalogue contient les douze derniers ordres de construction du propriétaire, avec leur coût payé réellement persisté et leur statut. Les ordres étrangers restent privés.
- La validation couvre un test PostgreSQL de confidentialité, tarification, achèvement par worker et historique, et un parcours Playwright depuis le panorama jusqu'au lancement.

Aucun prix saison 2 non prouvé ni visuel Ubisoft n'est publié. Les US ne sont pas encore totalement validées au regard de toutes leurs exigences historiques.
