# Décisions complémentaires C01–C09 — 23 octobre 2026

Ces choix sont des règles du **futur MMHK-like** et non des preuves du serveur historique Ubisoft S2. Les valeurs ou formules non précisées restent à qualifier.

## C01

Initial legacy is a fixed 1000-point starting build, equal and reset for every world, no cross-world accrual; expenditure/cost balance requires research.

**Profil :** `initial_legacy`.

## C02

Special sites of ALL types form an almost regular grid on the toroidal map with up to ±2 cells of positional jitter, excluding impossible terrain and preserving legal geographic constraints.

**Profil :** `region.world_special_sites`.

## C03

Each player gets exactly three single-use world-scoped invitation codes, consumed only on successful spawn registration.

**Profil :** `world.friend_codes`.

## C04

NPCs respawn after seven complete days of an unused cleared regional plot; each new encounter can give XP and artifact loot again.

**Profil :** `region.pnj_respawn`.

## C05

Keep the historically documented mine upgrade progression through level 10; do not add a parallel five-level drilling system.

**Profil :** `economy.mines`.

## C06

On unpaid hourly maintenance, consume all available gold in host city and additionally inflict ceil(10% of headcount) casualties on each nonempty stack.

**Profil :** `economy.maintenance`.

## C07

Protection blocks hostile player-versus-player military deployments involving protected cities, not regional PvE or friendly nonhostile movements; incoming allied convoys remain allowed.

**Profil :** `world.protection`.

## C08

Each world has a configurable IANA timezone used for the 23:00-06:00 truce, with DST applied according to the timezone rules.

**Profil :** `timing.world_map_truce`.

## C09

Repeated scheduled caravans are an explicit exception to the ban on generic future order queues.

**Profil :** `timing.programming`.

## Précisions conservées

- Le montant **1 000 points d'hérédité** est un capital de référence arbitraire de conception. Les coûts et options de dépense restent à étudier et équilibrer. Il n'existe **aucun transfert ni gain entre mondes**.
- Le quadrillage « à deux cases près » vise la *position des sites* et non un intervalle absolument fixé à 15 cases : l'espacement de base demeure paramétrable pour chaque preset de carte.
- Les sept jours sans exploitation conditionnent le retour des PNJ ; il faut définir précisément ce qui constitue une case « utilisée », afin de ne jamais perturber une exploitation active.
- Le système d'amélioration des mines **historiquement documenté à dix niveaux** est conservé sans système additionnel de creusement.
- Les caravanes répétées doivent revalider les stocks et les droits à **chaque départ** ; autoriser la répétition ne garantit pas des stocks futurs.
