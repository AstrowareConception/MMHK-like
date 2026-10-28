-- V015: lab-only fixed-price resource offers, secured by separate escrow.
-- Historical auctions, commission, delivery routes and balance rules are NOT inferred.
CREATE TABLE marketplace_policies (
  world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
  policy_id text NOT NULL CHECK(length(policy_id) BETWEEN 3 AND 100),
  enabled boolean NOT NULL DEFAULT false,
  max_quantity integer NOT NULL CHECK(max_quantity BETWEEN 1 AND 1000000),
  max_price integer NOT NULL CHECK(max_price BETWEEN 1 AND 1000000),
  min_duration_seconds integer NOT NULL CHECK(min_duration_seconds BETWEEN 60 AND 604800),
  max_duration_seconds integer NOT NULL CHECK(max_duration_seconds BETWEEN min_duration_seconds AND 604800),
  delivery_mode text NOT NULL DEFAULT 'instant_lab'
    CHECK(delivery_mode='instant_lab'),
  PRIMARY KEY(world_id,policy_id)
);
CREATE UNIQUE INDEX marketplace_one_active_policy
  ON marketplace_policies(world_id) WHERE enabled;

CREATE TABLE marketplace_offers (
  offer_id uuid PRIMARY KEY,
  world_id text NOT NULL,
  seller_city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  seller_account_id uuid NOT NULL REFERENCES accounts(account_id),
  policy_id text NOT NULL,
  resource text NOT NULL CHECK(resource IN
    ('gold','wood','ore','crystal','gems','sulfur','mercury')),
  quantity integer NOT NULL CHECK(quantity BETWEEN 1 AND 1000000),
  price_resource text NOT NULL CHECK(price_resource IN
    ('gold','wood','ore','crystal','gems','sulfur','mercury')),
  price_amount integer NOT NULL CHECK(price_amount BETWEEN 1 AND 1000000),
  created_at timestamptz NOT NULL,
  expires_at timestamptz NOT NULL,
  status text NOT NULL DEFAULT 'active'
    CHECK(status IN ('active','sold','cancelled','expired')),
  buyer_city_id uuid REFERENCES cities(city_id),
  purchase_order_id uuid UNIQUE,
  purchased_at timestamptz,
  closed_at timestamptz,
  escrow_claimed_at timestamptz,
  FOREIGN KEY(world_id,policy_id)
    REFERENCES marketplace_policies(world_id,policy_id),
  CHECK(resource<>price_resource),
  CHECK(expires_at>created_at),
  CHECK((status='sold') =
        (buyer_city_id IS NOT NULL AND purchase_order_id IS NOT NULL AND purchased_at IS NOT NULL)),
  CHECK((status='sold') = (escrow_claimed_at IS NULL AND closed_at IS NULL)
        OR status<>'sold'),
  CHECK(status<>'active' OR (closed_at IS NULL AND escrow_claimed_at IS NULL)),
  CHECK(status<>'sold' OR (buyer_city_id IS NOT NULL AND purchase_order_id IS NOT NULL))
);
CREATE INDEX marketplace_active_offers
  ON marketplace_offers(world_id,expires_at,created_at DESC,offer_id)
  WHERE status='active';
CREATE INDEX marketplace_seller_offers
  ON marketplace_offers(seller_city_id,created_at DESC,offer_id);

-- An idempotency key is unique across publishing, purchasing and withdrawal.
-- Immutable intent and receipt snapshots let a duplicate return unchanged
-- after another player buys, the seller suspends the building, or the offer expires.
CREATE TABLE marketplace_orders (
  order_id uuid PRIMARY KEY,
  offer_id uuid NOT NULL REFERENCES marketplace_offers(offer_id) ON DELETE CASCADE,
  actor_city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  operation text NOT NULL CHECK(operation IN ('publish','buy','withdraw')),
  intent jsonb NOT NULL CHECK(jsonb_typeof(intent)='object'),
  receipt jsonb NOT NULL CHECK(jsonb_typeof(receipt)='object'),
  completed_at timestamptz NOT NULL
);
CREATE INDEX marketplace_orders_by_city
  ON marketplace_orders(actor_city_id,completed_at DESC,order_id);
