-- Experimental economic tick engine, not a Ubisoft S2 production oracle.
-- All rates, capacities and tick duration require explicit trusted operator
-- configuration. Existing inactive cities remain unchanged.
ALTER TABLE city_stocks
  ADD COLUMN capacity bigint CHECK(capacity IS NULL OR capacity >= 0);

CREATE TABLE city_economy_clock (
  city_id uuid PRIMARY KEY REFERENCES cities(city_id) ON DELETE CASCADE,
  tick_seconds integer NOT NULL CHECK(tick_seconds BETWEEN 1 AND 86400),
  last_tick_at timestamptz NOT NULL,
  enabled boolean NOT NULL DEFAULT false,
  revision bigint NOT NULL DEFAULT 0 CHECK(revision >= 0)
);

CREATE TABLE city_mine_rates (
  city_id uuid NOT NULL,
  resource text NOT NULL,
  base_units_per_day numeric(18,6) NOT NULL
    CHECK(base_units_per_day >= 0),
  -- Sum of percentage bonuses, e.g. 0.10 + 0.20 is 0.30.
  additive_bonus numeric(9,6) NOT NULL DEFAULT 0
    CHECK(additive_bonus >= -1 AND additive_bonus <= 100),
  fractional_units numeric(20,12) NOT NULL DEFAULT 0
    CHECK(fractional_units >= 0 AND fractional_units < 1),
  PRIMARY KEY(city_id, resource),
  FOREIGN KEY(city_id, resource) REFERENCES city_mines(city_id, resource)
    ON DELETE CASCADE,
  FOREIGN KEY(city_id) REFERENCES city_economy_clock(city_id)
    ON DELETE CASCADE
);

CREATE TABLE city_economy_events (
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  revision bigint NOT NULL CHECK(revision > 0),
  from_at timestamptz NOT NULL,
  to_at timestamptz NOT NULL CHECK(to_at > from_at),
  ticks integer NOT NULL CHECK(ticks > 0),
  credits jsonb NOT NULL,
  overflow jsonb NOT NULL,
  PRIMARY KEY(city_id, revision)
);
CREATE INDEX economy_due_clock ON city_economy_clock(last_tick_at,city_id)
  WHERE enabled;
