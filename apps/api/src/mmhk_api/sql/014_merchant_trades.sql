-- V014: versioned laboratory merchant exchange (US-ECH-001/002/003).
-- Version 013 is reserved for hero formations on the parallel PR #30.
-- No Ubisoft season-2 exchange ratio or fee is inferred here.
CREATE TABLE merchant_rate_policies (
  world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
  pay_resource text NOT NULL CHECK(pay_resource IN
    ('gold','wood','ore','crystal','gems','sulfur','mercury')),
  receive_resource text NOT NULL CHECK(receive_resource IN
    ('gold','wood','ore','crystal','gems','sulfur','mercury')),
  policy_id text NOT NULL CHECK(length(policy_id) BETWEEN 3 AND 100),
  numerator bigint NOT NULL CHECK(numerator BETWEEN 1 AND 1000000),
  denominator bigint NOT NULL CHECK(denominator BETWEEN 1 AND 1000000),
  enabled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(world_id,pay_resource,receive_resource,policy_id),
  CHECK(pay_resource <> receive_resource)
);
CREATE UNIQUE INDEX merchant_one_active_pair
  ON merchant_rate_policies(world_id,pay_resource,receive_resource)
  WHERE enabled;

CREATE TABLE city_merchant_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  pay_resource text NOT NULL CHECK(pay_resource IN
    ('gold','wood','ore','crystal','gems','sulfur','mercury')),
  receive_resource text NOT NULL CHECK(receive_resource IN
    ('gold','wood','ore','crystal','gems','sulfur','mercury')),
  pay_amount bigint NOT NULL CHECK(pay_amount BETWEEN 1 AND 1000000),
  receive_amount bigint NOT NULL CHECK(receive_amount BETWEEN 1 AND 1000000000000),
  rate_policy_id text NOT NULL,
  rate_numerator bigint NOT NULL CHECK(rate_numerator BETWEEN 1 AND 1000000),
  rate_denominator bigint NOT NULL CHECK(rate_denominator BETWEEN 1 AND 1000000),
  completed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK(pay_resource <> receive_resource)
);
CREATE INDEX city_merchant_orders_recent
  ON city_merchant_orders(city_id,completed_at DESC,order_id DESC);
