-- V009: assignment between city garrison and owned heroes.
-- Moves existing units only; no combat or travel command is enabled.
CREATE TABLE hero_army_units (
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id) ON DELETE CASCADE,
  unit_code text NOT NULL REFERENCES city_unit_profiles(unit_code),
  quantity bigint NOT NULL CHECK(quantity>=0),
  PRIMARY KEY(hero_id,unit_code)
);
CREATE TABLE hero_unit_transfer_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id),
  unit_code text NOT NULL REFERENCES city_unit_profiles(unit_code),
  quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 1000),
  direction text NOT NULL CHECK(direction IN ('to_hero','to_garrison')),
  completed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
