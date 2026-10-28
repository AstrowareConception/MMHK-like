# Tranche fonctionnelle : hôtel des ventes à prix fixe (laboratoire)

## Correspondance avec les 300 US
Couvre partiellement US-ECH-004 (parcourir), US-ECH-005 (publier),
US-ECH-006 (acheter) et US-ECH-008 (retirer), sans prétendre avoir
certifié la saison 2. Les enchères (US-ECH-007), commissions, évaluations de
balance et livraison par caravane (US-ECH-010 à 018) ne sont pas intégrées.

## Politique de laboratoire
La table marketplace_policies est administrée hors HTTP public, par monde
et version. Par défaut, aucune place de marché n'est ouverte. La démo
locale possède un profil opt-in LOCAL-FIXED-MARKET-V1 :
quantité <=200, prix <=1000, durée entre 60 s et 24 h, sans commission.
Il s'agit de conventions fictives, pas de règles Ubisoft authentifiées.

## Conservation et double dépense
- L'offre fixe comprend ressource, quantité entière, contrepartie, prix total,
  échéance et politique figée. Elle est visible dans le monde du vendeur,
  sans divulguer ses coordonnées ni le nom d'une cité adverse inconnue.
- À la publication, le serveur exige un marché actif et débite la quantité
  du stock de la cité dans la même transaction qui crée l'offre et son reçu.
  La marchandise est alors **en dépôt** et ne peut être dépensée ailleurs.
- L'achat intégral exige une autre identité dans le même monde, un marché
  actif des deux côtés, le même profil autorisé, des stocks suffisants et de
  la place dans les deux villes. Les deux cités sont verrouillées dans un
  ordre déterministe ; les stocks le sont en ordre lexical, comme dans
  l'ouvrier économique. Débit acheteur, crédit marchandises, règlement
  vendeur et clôture sont un seul COMMIT PostgreSQL.
- L'acheteur doit confirmer les conditions exactes du lot. Une offre
  vendue, expirée, d'un autre monde ou déjà retirée n'est plus achetable.
- Le retrait propriétaire marque immédiatement l'offre close. Les
  marchandises sont restituées si la capacité autorise le crédit. Dans
  le cas contraire, elles restent en dépôt privé, récupérables par
  une nouvelle intention lorsque de la place se libère. Aucune perte
  par débordement ou double restitution n'est tolérée.

## Double validation, temps et reprise
Les opérations utilisent toutes un order_id UUID stable fourni par un
formulaire serveur et conservé dans marketplace_orders avec l'intention
et son reçu. Un replay conforme rend l'ancien reçu ; un identifiant
réutilisé avec des conditions différentes est refusé. L'expiration
s'applique selon clock_timestamp PostgreSQL ; le statut expiré n'exige
aucun calcul de confiance dans le navigateur. Un travail de clôture
automatique des lots périmés reste à définir, mais le propriétaire peut
déjà récupérer ses lots en dépôt après échéance.

## Vérification attendue
Tests PostgreSQL : univers séparés, anonymat des vendeurs, version de
politique, réservation transactionnelle, paiement exact, replay,
achat concurrent par deux comptes, retour différé si stockage plein,
expiration et bâtiment suspendu.
Parcours navigateur : marché construit → offre publiée → dépôt comptabilisé
→ offre retirée → stock récupéré, puis suite du recrutement et du PvE.

**Validation CI non encore exécutée**. Les chiffres de démonstration sont
explicitement expérimentaux. Ne pas annoncer ces stories terminées avant
les tests du serveur, du build Next et du navigateur.
