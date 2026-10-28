-- V011. Explicit regional laboratory encounters (not a world generator).
-- Only a verified operator/seed may create them; each position is unique.
CREATE TABLE region_encounters (
  encounter_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  cell_i integer NOT NULL CHECK(cell_i BETWEEN 0 AND 4),
  cell_j integer NOT NULL CHECK(cell_j BETWEEN 0 AND 4),
  name text NOT NULL CHECK(length(name) BETWEEN 2 AND 100),
  unit_code text NOT NULL CHECK(unit_code ~ '^[a-z][a-z0-9_]{1,47}$'),
  unit_count integer NOT NULL CHECK(unit_count BETWEEN 1 AND 1000000),
  unit_power numeric(12,3) NOT NULL CHECK(unit_power>0),
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 120),
  resolved boolean NOT NULL DEFAULT false,
  UNIQUE(city_id,cell_i,cell_j),
  CONSTRAINT encounter_not_city_center CHECK(NOT (cell_i=2 AND cell_j=2))
);
-- Power must be configured, never inferred from an unverified unit tier.
ALTER TABLE city_unit_profiles ADD COLUMN lab_duel_power numeric(12,3)
  CHECK(lab_duel_power>0);
