-- V010: city artifacts as unique objects, with bag/equipment/reserve locations.
-- No historical combat bonus is assumed to be active until a verified engine uses it.
CREATE TABLE artifact_profiles (
  artifact_code text PRIMARY KEY CHECK(artifact_code ~ '^[a-z][a-z0-9_]{1,63}$'),
  name text NOT NULL CHECK(length(name) BETWEEN 2 AND 100),
  slot text NOT NULL CHECK(slot IN ('head','neck','chest','weapon','shield','hands','feet','ring')),
  required_level integer NOT NULL CHECK(required_level BETWEEN 1 AND 100),
  effects jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(effects)='object'),
  policy_id text NOT NULL CHECK(length(policy_id) BETWEEN 3 AND 100),
  historically_certified boolean NOT NULL DEFAULT false
);
CREATE TABLE city_artifacts (
  artifact_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  artifact_code text NOT NULL REFERENCES artifact_profiles(artifact_code),
  location text NOT NULL CHECK(location IN ('reserve','bag','equipped')),
  hero_id uuid REFERENCES city_heroes(hero_id),
  equipped_slot text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CONSTRAINT artifact_location_consistency CHECK (
    (location='reserve' AND hero_id IS NULL AND equipped_slot IS NULL) OR
    (location='bag' AND hero_id IS NOT NULL AND equipped_slot IS NULL) OR
    (location='equipped' AND hero_id IS NOT NULL AND equipped_slot IS NOT NULL)
  )
);
CREATE UNIQUE INDEX artifact_one_per_slot ON city_artifacts(hero_id,equipped_slot)
  WHERE location='equipped';
CREATE INDEX city_artifacts_owner ON city_artifacts(city_id,location,hero_id);
CREATE TABLE artifact_transfer_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  artifact_id uuid NOT NULL REFERENCES city_artifacts(artifact_id),
  operation text NOT NULL CHECK(operation IN ('equip','unequip','to_reserve','to_bag','to_hero')),
  target_hero_id uuid REFERENCES city_heroes(hero_id),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
