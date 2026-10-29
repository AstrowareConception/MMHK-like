-- V020: qualified terrain independent of ownership, for calculated dynamic influence.
-- An explicit operator-evidenced terrain profile does NOT assert Ubisoft S2 mine
-- distribution. Inactive/non-controlled squares remain uncolonizable.
CREATE TABLE world_colonizable_terrain(
  world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
  x integer NOT NULL CHECK(x>=1),
  y integer NOT NULL CHECK(y>=1),
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
  mine_types jsonb NOT NULL CHECK(jsonb_typeof(mine_types)='array'),
  rates_per_day jsonb NOT NULL CHECK(jsonb_typeof(rates_per_day)='object'),
  stock_capacities jsonb NOT NULL CHECK(jsonb_typeof(stock_capacities)='object'),
  tick_seconds integer NOT NULL CHECK(tick_seconds BETWEEN 1 AND 86400),
  enabled boolean NOT NULL DEFAULT false,
  historically_certified_s2 boolean NOT NULL DEFAULT false
    CHECK(historically_certified_s2=false),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(world_id,x,y)
);
CREATE INDEX colony_qualified_terrain_active
  ON world_colonizable_terrain(world_id,x,y) WHERE enabled;
ALTER TABLE colonization_orders ADD COLUMN site_qualification text
  NOT NULL DEFAULT 'legacy_operator'
  CHECK(site_qualification IN ('legacy_operator','terrain_registry'));
