# Exécution — marchand local et échanges atomiques

## User stories
Cette tranche couvre **partiellement** US-ECH-001, US-ECH-002 et US-ECH-003.
Les enchères (US-ECH-004 à 009), les caravanes (US-ECH-010 à 017) et le
calcul global de balance commerciale (US-ECH-018) restent hors périmètre.

## Fonctionnement réellement implémenté
- Un marché **construit et actif** est requis, y compris après suspension
  par l'opérateur. Un marché simplement au catalogue ou en chantier est fermé.
- Les taux sont configurés **par monde et paire de ressources**, depuis un
  processus d'administration ; pas d'endpoint opérateur public. Chaque profil
  comporte un identifiant de version, numérateur, dénominateur et état actif.
  Une seule version peut être activée par paire et monde.
- Le devis est **lu** depuis FastAPI : quantité reçue arrondie à l'entier
  inférieur, stocks avant/après, capacité réelle et état. Un devis modifié
  doit être explicitement confirmé de nouveau.
- La confirmation envoie un **UUID généré une fois par formulaire** :
  le serveur verrouille la cité, revalide le tarif/version, les deux stocks et
  la capacité après bonus, puis débite, crédite et journalise atomiquement.
  Rejouer exactement le même UUID renvoie le même reçu sans deuxième débit.
- Le registre renvoie les douze derniers ordres de la cité, uniquement pour
  son propriétaire. Les anciennes transactions restent visibles si le
  marché est ultérieurement fermé.

## Stockage et migrations
Migration 014_merchant_trades.sql : tables merchant_rate_policies et
city_merchant_orders. Le numéro 013 est réservé à la PR n° 30
(formations et rapports de missions), actuellement développée en parallèle.

## Scénarios de recette
Les tests PostgreSQL couvrent : marché absent, cité étrangère, devis non
facturé, quantité nulle/trop faible, capacité saturée, tarif révisé,
ressources insuffisantes, ordre rejoué et suspension d'un marché.
Le scénario Playwright construit le marché depuis la scène, obtient un devis,
confirme un échange et consulte le journal.

La chaîne GitHub Actions doit encore exécuter la validation complète.
Toutes les valeurs de la démo locale sont explicitement fictives.
