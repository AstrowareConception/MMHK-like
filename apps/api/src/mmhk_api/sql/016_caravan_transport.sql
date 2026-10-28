-- V016 · Laboratory caravan shipments, owner-scoped and non-interceptable.
-- Historical mixed-load weights and travel speeds are NOT certified S2 rules.
-- Repeat programs / allied transport / attacks are deliberately not enabled.
CREATE TABLE caravan_transport_policies (
  world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
  policy_id text NOT NULL CHECK(length(policy_id) BETWEEN 3 AND 100),
  capacity_units bigint NOT NULL CHECK(capacity_units BETWEEN 1 AND 1000000000),
  resource_weights jsonb NOT NULL CHECK(jsonb_typeof(resource_weights)='object'),
  seconds_per_tile integer NOT NULL CHECK(seconds_per_tile BETWEEN 1 AND 86400),
  enabled boolean NOT NULL DEFAULT false,
  PRIMARY KEY(world_id,policy_id)
);
CREATE UNIQUE INDEX one_active_caravan_policy_per_world
  ON caravan_transport_policies(world_id) WHERE enabled;

CREATE TABLE caravan_shipments (
  shipment_id uuid PRIMARY KEY,
  world_id text NOT NULL,
  owner_account_id uuid NOT NULL REFERENCES accounts(account_id),
  source_city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE RESTRICT,
  destination_city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE RESTRICT,
  policy_id text NOT NULL,
  cargo jsonb NOT NULL CHECK(jsonb_typeof(cargo)='object'),
  resource_weights jsonb NOT NULL CHECK(jsonb_typeof(resource_weights)='object'),
  load_units bigint NOT NULL CHECK(load_units BETWEEN 1 AND 1000000000),
  capacity_units bigint NOT NULL CHECK(capacity_units BETWEEN 1 AND 1000000000),
  distance_steps integer NOT NULL CHECK(distance_steps BETWEEN 1 AND 200000),
  travel_seconds integer NOT NULL CHECK(travel_seconds BETWEEN 1 AND 2592000),
  dispatched_at timestamptz NOT NULL,
  arrival_due_at timestamptz NOT NULL,
  return_due_at timestamptz,
  next_attempt_at timestamptz,
  completed_at timestamptz,
  status text NOT NULL DEFAULT 'in_transit'
    CHECK(status IN ('in_transit','returning','awaiting_storage','delivered','returned')),
  return_leg boolean NOT NULL DEFAULT false,
  FOREIGN KEY(world_id,policy_id)
    REFERENCES caravan_transport_policies(world_id,policy_id),
  CHECK(source_city_id <> destination_city_id),
  CHECK(arrival_due_at > dispatched_at),
  CHECK(
    (status IN ('delivered','returned') AND completed_at IS NOT NULL
      AND next_attempt_at IS NULL)
    OR
    (status IN ('in_transit','returning','awaiting_storage')
      AND completed_at IS NULL AND next_attempt_at IS NOT NULL)
  ),
  CHECK(status <> 'in_transit' OR return_leg=false),
  CHECK(status <> 'returning' OR return_leg=true),
  CHECK(status <> 'delivered' OR return_leg=false),
  CHECK(status <> 'returned' OR return_leg=true)
);
CREATE INDEX caravan_worker_due ON caravan_shipments(next_attempt_at,shipment_id)
  WHERE status IN ('in_transit','returning','awaiting_storage');
CREATE INDEX caravan_city_dispatch_history ON caravan_shipments
  (source_city_id,dispatched_at DESC,shipment_id DESC);

CREATE TABLE caravan_shipment_events (
  shipment_id uuid NOT NULL REFERENCES caravan_shipments(shipment_id) ON DELETE CASCADE,
  phase text NOT NULL CHECK(phase IN
    ('departed','returning','delivered','returned','awaiting_storage','awaiting_ownership')),
  occurred_at timestamptz NOT NULL,
  details jsonb NOT NULL DEFAULT '{}'::jsonb CHECK(jsonb_typeof(details)='object'),
  PRIMARY KEY(shipment_id,phase)
);
