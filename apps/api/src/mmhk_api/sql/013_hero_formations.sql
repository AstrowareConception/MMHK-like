-- V013: Seven ordinary army positions, preserving the aggregated owned unit counts.
-- Positions 1..7 map to historic Jactari ordinary indices 2..8.
-- No battle effects are implied by editing an army formation.
CREATE TABLE hero_formation_slots (
  city_id uuid NOT NULL,
  hero_id uuid NOT NULL,
  position smallint NOT NULL CHECK(position BETWEEN 1 AND 7),
  unit_code text NOT NULL REFERENCES city_unit_profiles(unit_code),
  quantity bigint NOT NULL CHECK(quantity BETWEEN 1 AND 1000000),
  PRIMARY KEY(hero_id,position),
  FOREIGN KEY(city_id,hero_id)
    REFERENCES city_heroes(city_id,hero_id) ON DELETE CASCADE
);
CREATE INDEX hero_formation_slots_city ON hero_formation_slots(city_id,hero_id);
CREATE TABLE hero_formation_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id) ON DELETE CASCADE,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  positions jsonb NOT NULL CHECK(jsonb_typeof(positions)='array'),
  accepted_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
ALTER TABLE pve_missions
  ADD COLUMN formation_snapshot jsonb CHECK(
    formation_snapshot IS NULL OR jsonb_typeof(formation_snapshot)='array');
