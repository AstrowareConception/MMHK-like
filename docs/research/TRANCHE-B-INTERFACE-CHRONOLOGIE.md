# Tranche B — Habillage global et frise

Les vues authentifiées Mes mondes, Monde, Région et Ville utilisent le même GameShell, des panneaux décoratifs et les stocks PostgreSQL de la cité courante.

La timeline affiche une fenêtre de 12 heures. L'API GET /api/v1/me/timeline filtre les chantiers par propriétaire et appartenance au monde. L'état réel reste piloté par PostgreSQL et les workers. Le client met à jour la position une fois par seconde, vérifie les événements toutes les 30 secondes, suspend ses animations en onglet masqué et se resynchronise à son retour.

Le script node tools/prepare-private-historical.mjs prépare le pack historique local : fond extérieur Havre (img/backgroundGame/bg_haven.jpg), texture métal (img/background/metal.jpg), chronologie (img/timeLine/background.jpg), Monde (img/worldMap/zoom1/background.jpg), Région (img/region/background_region.jpg) et calque de la taverne. Le lanceur Windows demarrer.bat prépare et active désormais ce pack automatiquement. Les images restent hors des builds et des captures CI.

Le thème public-safe conserve une esthétique originale et redistribuable, distincte des graphismes Ubisoft. La scène complète du Havre reste schématique, faute des fonds vierges et des 169 calques de bâtiments manquants. Les composites AcidCave ne sont pas utilisés comme faux décors dynamiques. La reconstruction de la ville reste du ressort de la tranche C.

Les contrats API, la confidentialité, les parcours authentifiés et la CI sont à vérifier avant fusion.
