# Exécution — formations d’armée et rapports de missions

US existantes : US-ARM-009/010/011/012, US-COM-001/017, US-MOV-007. Les US et critères d'origine restent inchangés.

## Sept positions et conservation des effectifs
Migration 013 : les sept positions ordinaires, indices Jactari 2–8, sont sauvegardées par héros. L'éditeur permet division, fusion, réordonnancement. Chaque quantité est positive, chaque position unique de 1 à 7, et la somme par unité doit égaler exactement les quantités réelles du héros. Impossible de créer ou perdre un soldat en modifiant cette formation.
Ordres UUID idempotents ; héros occupé interdit ; changement de garnison invalidant la formation enregistrée. L'API retourne un projet de formation non enregistré lorsqu'aucune configuration n'a été sauvegardée.

## Départ et rapport durable
Un instantané de la formation est associé au départ de chaque nouvelle mission et reste inchangé. Les missions antérieures ne reçoivent pas de fausse photographie rétroactive.
La route GET /api/v1/me/cities/{city_id}/missions/{mission_id}/report exige le propriétaire authentifié. Elle fournit les trois événements effectivement persistés, les échéances et l'issue de laboratoire si elle existe. La page de rapport est accessible depuis le suivi régional, y compris après retour du héros.

## Limitations et prochaine étape
Le laboratoire Jactari utilise encore un seul peloton sélectionné ; la formation complète n'est pas envoyée à un vrai arbitre à sept pelotons. Les pertes définitives, XP, butin et libération des cases sont toujours inactifs. Le calculateur complet requiert aussi les caractéristiques des héros, équipements, talents, contre-armes, sorts et admission avant certification MMHK S2.

Les tests PostgreSQL ajoutés vérifient conservation, huitième case refusée, refus d'édition pendant une mission, idempotence, transfert de troupes et photographie persistante. L'interface ne revendique pas de paramètres historiques non prouvés.