-- V008. First incremental hero + recruitment vertical slice (experimental local policies).
-- Stored counts and costs are authoritative. No historic stats or auto growth inferred.
CREATE TABLE city_unit_profiles (
  unit_code text PRIMARY KEY CHECK(unit_code ~ '^[a-z][a-z0-9_]{1,47}$'),
  display_name text NOT NULL CHECK(length(display_name) BETWEEN 2 AND 80),
  dwelling_code text NOT NULL CHECK(dwelling_code ~ '^[a-z][a-z0-9_]{1,47}$'),
  tier integer NOT NULL CHECK(tier BETWEEN 1 AND 7),
  unit_costs jsonb NOT NULL CHECK(jsonb_typeof(unit_costs)='object'),
  policy_id text NOT NULL CHECK(length(policy_id) BETWEEN 3 AND 100),
  enabled boolean NOT NULL DEFAULT true
);
CREATE TABLE city_recruit_pools (
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  unit_code text NOT NULL REFERENCES city_unit_profiles(unit_code),
  available integer NOT NULL DEFAULT 0 CHECK(available>=0),
  PRIMARY KEY(city_id,unit_code)
);
CREATE TABLE city_garrison_units (
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  unit_code text NOT NULL REFERENCES city_unit_profiles(unit_code),
  quantity bigint NOT NULL CHECK(quantity>=0),
  PRIMARY KEY(city_id,unit_code)
);
CREATE TABLE unit_recruitment_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  unit_code text NOT NULL REFERENCES city_unit_profiles(unit_code),
  quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 1000),
  applied_costs jsonb NOT NULL CHECK(jsonb_typeof(applied_costs)='object'),
  completed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE TABLE city_hero_offers (
  offer_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  hero_name text NOT NULL CHECK(length(hero_name) BETWEEN 2 AND 80),
  archetype text NOT NULL CHECK(archetype IN ('might','magic')),
  gold_cost integer NOT NULL CHECK(gold_cost>=0),
  available boolean NOT NULL DEFAULT true,
  policy_id text NOT NULL
);
CREATE TABLE city_heroes (
  hero_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  owner_account_id uuid NOT NULL REFERENCES accounts(account_id),
  name text NOT NULL,
  archetype text NOT NULL CHECK(archetype IN ('might','magic')),
  level integer NOT NULL DEFAULT 1 CHECK(level BETWEEN 1 AND 100),
  experience bigint NOT NULL DEFAULT 0 CHECK(experience>=0),
  status text NOT NULL DEFAULT 'idle' CHECK(status IN ('idle','on_mission','wounded')),
  hired_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX city_heroes_owner ON city_heroes(owner_account_id,city_id);
CREATE TABLE hero_hire_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  offer_id uuid NOT NULL UNIQUE REFERENCES city_hero_offers(offer_id),
  hero_id uuid NOT NULL UNIQUE REFERENCES city_heroes(hero_id),
  gold_paid integer NOT NULL CHECK(gold_paid>=0),
  completed_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
