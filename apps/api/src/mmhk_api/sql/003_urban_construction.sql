-- V003: urban constructions, with explicitly versioned experimental costs.
-- P0: one active urban project per city; paid at launch; no queue/cancel/hero.
CREATE TABLE urban_building_profiles (
  building_code text NOT NULL CHECK (building_code ~ '^[a-z][a-z0-9_]{1,47}$'),
  target_level integer NOT NULL CHECK (target_level BETWEEN 1 AND 100),
  policy_id text NOT NULL CHECK (length(policy_id) BETWEEN 1 AND 100),
  base_seconds integer NOT NULL CHECK (base_seconds BETWEEN 1 AND 2592000),
  base_costs jsonb NOT NULL CHECK (jsonb_typeof(base_costs) = 'object'),
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (building_code, target_level)
);
CREATE TABLE urban_city_buildings (
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  building_code text NOT NULL,
  level integer NOT NULL CHECK (level BETWEEN 1 AND 100),
  completed_at timestamptz NOT NULL,
  PRIMARY KEY (city_id, building_code)
);
CREATE TABLE urban_construction_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  building_code text NOT NULL,
  target_level integer NOT NULL CHECK(target_level BETWEEN 1 AND 100),
  mode text NOT NULL CHECK(mode IN ('normal','rapid','economic')),
  policy_id text NOT NULL,
  applied_costs jsonb NOT NULL CHECK(jsonb_typeof(applied_costs)='object'),
  started_at timestamptz NOT NULL,
  due_at timestamptz NOT NULL CHECK(due_at > started_at),
  status text NOT NULL CHECK(status IN ('building','completed')),
  completed_at timestamptz,
  CHECK((status='building' AND completed_at IS NULL) OR
        (status='completed' AND completed_at IS NOT NULL)),
  FOREIGN KEY(building_code,target_level)
    REFERENCES urban_building_profiles(building_code,target_level)
);
CREATE UNIQUE INDEX one_active_urban_construction_per_city
  ON urban_construction_orders(city_id) WHERE status='building';
CREATE INDEX urban_construction_due
  ON urban_construction_orders(due_at,order_id) WHERE status='building';
CREATE TABLE urban_construction_events (
  order_id uuid NOT NULL REFERENCES urban_construction_orders(order_id) ON DELETE CASCADE,
  phase text NOT NULL CHECK(phase IN ('started','completed')),
  occurred_at timestamptz NOT NULL,
  details jsonb NOT NULL,
  PRIMARY KEY(order_id,phase)
);
