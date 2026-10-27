-- Experimental effects and prerequisite graph; all numbers defined by operator.
-- A completed level REPLACES the previous level effect. Disabled prerequisites
-- keep buildings in city but make dependent effects inactive (P0).
CREATE TABLE urban_effect_profiles (
  building_code text NOT NULL,
  target_level integer NOT NULL,
  prerequisites jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK(jsonb_typeof(prerequisites)='object'),
  mine_additive_bonus jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK(jsonb_typeof(mine_additive_bonus)='object'),
  capacity_bonus jsonb NOT NULL DEFAULT '{}'::jsonb
    CHECK(jsonb_typeof(capacity_bonus)='object'),
  effect_policy_id text NOT NULL,
  PRIMARY KEY(building_code,target_level),
  FOREIGN KEY(building_code,target_level)
    REFERENCES urban_building_profiles(building_code,target_level)
);
ALTER TABLE urban_city_buildings
  ADD COLUMN operator_disabled boolean NOT NULL DEFAULT false;
-- A versioned snapshot makes late worker catch-up respect *when* effects
-- became available. Each tick uses the latest snapshot at its START.
CREATE TABLE city_economy_effect_snapshots (
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  revision bigint NOT NULL CHECK(revision>0),
  effective_at timestamptz NOT NULL,
  mine_additive_bonus jsonb NOT NULL,
  capacity_bonus jsonb NOT NULL,
  PRIMARY KEY(city_id,revision)
);
CREATE INDEX city_effect_snapshot_timeline
  ON city_economy_effect_snapshots(city_id,effective_at,revision);
