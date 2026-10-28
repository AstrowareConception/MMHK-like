-- V018 · Colonization/second city. Laboratory parameters are not authentic S2 prices.
-- The P0 beginner protection is a NON-CANCELABLE seven days from world joining.
-- Only explicit, operator-proven own influence and qualified plots can be founded.
CREATE TABLE colonization_world_policies (
  world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
  policy_id text NOT NULL CHECK (length(policy_id) BETWEEN 3 AND 100),
  costs jsonb NOT NULL CHECK (jsonb_typeof(costs)='object'),
  max_owned_cities smallint NOT NULL CHECK (max_owned_cities BETWEEN 2 AND 10),
  max_distance_steps smallint NOT NULL CHECK (max_distance_steps BETWEEN 1 AND 20),
  seconds_per_step integer NOT NULL CHECK (seconds_per_step BETWEEN 5 AND 86400),
  enabled boolean NOT NULL DEFAULT false,
  PRIMARY KEY (world_id,policy_id)
);
CREATE UNIQUE INDEX colonization_one_active_world_policy
  ON colonization_world_policies(world_id) WHERE enabled;

-- The generator/operator must qualify the future mine types and rates.
-- These rows do NOT establish historic resource placement. No player writes.
CREATE TABLE colonization_site_profiles (
  world_id text NOT NULL,
  x integer NOT NULL CHECK (x>=1),
  y integer NOT NULL CHECK (y>=1),
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 3 AND 255),
  mine_types jsonb NOT NULL CHECK (jsonb_typeof(mine_types)='array'),
  rates_per_day jsonb NOT NULL CHECK (jsonb_typeof(rates_per_day)='object'),
  stock_capacities jsonb NOT NULL CHECK (jsonb_typeof(stock_capacities)='object'),
  tick_seconds integer NOT NULL CHECK (tick_seconds BETWEEN 1 AND 86400),
  enabled boolean NOT NULL DEFAULT false,
  PRIMARY KEY(world_id,x,y),
  FOREIGN KEY(world_id,x,y) REFERENCES map_influence_cells(world_id,x,y)
);
CREATE INDEX colonization_sites_world_enabled
  ON colonization_site_profiles(world_id,x,y) WHERE enabled;

ALTER TABLE city_heroes DROP CONSTRAINT city_heroes_status_check;
ALTER TABLE city_heroes ADD CONSTRAINT city_heroes_status_check
  CHECK(status IN ('idle','on_mission','wounded','colonizing'));

CREATE TABLE colonization_orders (
  order_id uuid PRIMARY KEY,
  world_id text NOT NULL,
  source_city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE RESTRICT,
  owner_account_id uuid NOT NULL REFERENCES accounts(account_id),
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id) ON DELETE RESTRICT,
  new_city_id uuid NOT NULL UNIQUE,
  colony_name text NOT NULL CHECK(length(colony_name) BETWEEN 2 AND 80),
  x integer NOT NULL CHECK(x>=1),
  y integer NOT NULL CHECK(y>=1),
  policy_id text NOT NULL,
  applied_costs jsonb NOT NULL CHECK(jsonb_typeof(applied_costs)='object'),
  mine_types jsonb NOT NULL CHECK(jsonb_typeof(mine_types)='array'),
  rates_per_day jsonb NOT NULL CHECK(jsonb_typeof(rates_per_day)='object'),
  stock_capacities jsonb NOT NULL CHECK(jsonb_typeof(stock_capacities)='object'),
  tick_seconds integer NOT NULL CHECK(tick_seconds BETWEEN 1 AND 86400),
  site_source_ref text NOT NULL CHECK(length(site_source_ref) BETWEEN 3 AND 255),
  travel_seconds integer NOT NULL CHECK(travel_seconds BETWEEN 5 AND 1728000),
  started_at timestamptz NOT NULL,
  due_at timestamptz NOT NULL CHECK(due_at > started_at),
  status text NOT NULL DEFAULT 'traveling'
    CHECK(status IN ('traveling','founded','blocked','refunded')),
  completed_at timestamptz,
  blocked_at timestamptz,
  blocked_reason text,
  refunded_at timestamptz,
  refund_order_id uuid UNIQUE,
  FOREIGN KEY(world_id,policy_id)
    REFERENCES colonization_world_policies(world_id,policy_id),
  CHECK(
    (status='traveling' AND completed_at IS NULL AND blocked_at IS NULL
      AND refunded_at IS NULL AND refund_order_id IS NULL)
    OR (status='founded' AND completed_at IS NOT NULL
      AND blocked_at IS NULL AND refunded_at IS NULL)
    OR (status='blocked' AND blocked_at IS NOT NULL
      AND completed_at IS NULL AND refunded_at IS NULL)
    OR (status='refunded' AND blocked_at IS NOT NULL
      AND refunded_at IS NOT NULL AND refund_order_id IS NOT NULL
      AND completed_at IS NULL)
  )
);
CREATE UNIQUE INDEX colonization_reserve_site_world
  ON colonization_orders(world_id,x,y)
  WHERE status IN ('traveling','blocked');
CREATE UNIQUE INDEX colonization_one_expedition_per_hero
  ON colonization_orders(hero_id) WHERE status='traveling';
CREATE INDEX colonization_due_worker
  ON colonization_orders(due_at,order_id) WHERE status='traveling';
CREATE INDEX colonization_owner_history
  ON colonization_orders(world_id,owner_account_id,started_at DESC,order_id DESC);

CREATE TABLE colonization_order_events (
  order_id uuid NOT NULL REFERENCES colonization_orders(order_id) ON DELETE CASCADE,
  phase text NOT NULL CHECK(phase IN ('departed','founded','blocked','refunded')),
  occurred_at timestamptz NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(details)='object'),
  PRIMARY KEY(order_id,phase)
);
