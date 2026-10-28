-- V017: bounded repeated caravan programs (US-ECH-014..017).
-- All timing/mode semantics are explicit LAB choices, never historic S2 claims.
-- Individual shipments remain independent worker-settled cargo escrow.
CREATE TABLE caravan_dispatch_programs (
  program_id uuid PRIMARY KEY,
  world_id text NOT NULL,
  owner_account_id uuid NOT NULL REFERENCES accounts(account_id),
  source_city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE RESTRICT,
  destination_city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE RESTRICT,
  policy_id text NOT NULL,
  cargo_template jsonb NOT NULL CHECK(jsonb_typeof(cargo_template)='object'),
  quantity_mode text NOT NULL CHECK(quantity_mode IN ('exact','available_up_to')),
  shipments_total smallint NOT NULL CHECK(shipments_total BETWEEN 2 AND 12),
  shipments_sent smallint NOT NULL DEFAULT 0 CHECK(shipments_sent >= 0),
  wait_seconds integer NOT NULL CHECK(wait_seconds BETWEEN 60 AND 86400),
  -- Freeze approved operator profile to avoid silent changes in an existing version.
  capacity_units bigint NOT NULL CHECK(capacity_units BETWEEN 1 AND 1000000000),
  resource_weights jsonb NOT NULL CHECK(jsonb_typeof(resource_weights)='object'),
  seconds_per_tile integer NOT NULL CHECK(seconds_per_tile BETWEEN 1 AND 86400),
  status text NOT NULL DEFAULT 'active'
    CHECK(status IN ('active','waiting_stock','paused','stopped','completed')),
  status_reason text,
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  next_departure_at timestamptz,
  last_departed_at timestamptz,
  closed_at timestamptz,
  FOREIGN KEY(world_id,policy_id)
    REFERENCES caravan_transport_policies(world_id,policy_id),
  CHECK(source_city_id <> destination_city_id),
  CHECK(shipments_sent <= shipments_total),
  CHECK((status IN ('active','waiting_stock')) = (next_departure_at IS NOT NULL)),
  CHECK((status IN ('completed','stopped','paused')) = (closed_at IS NOT NULL)),
  CHECK(status <> 'completed' OR shipments_sent = shipments_total)
);
CREATE INDEX caravan_program_due
  ON caravan_dispatch_programs(next_departure_at,program_id)
  WHERE status IN ('active','waiting_stock');
CREATE INDEX caravan_program_city
  ON caravan_dispatch_programs(source_city_id,created_at DESC,program_id DESC);

ALTER TABLE caravan_shipments
  ADD COLUMN program_id uuid REFERENCES caravan_dispatch_programs(program_id)
    ON DELETE RESTRICT,
  ADD COLUMN program_sequence smallint CHECK(program_sequence BETWEEN 1 AND 12),
  ADD CONSTRAINT caravan_program_shipment_pair CHECK
    ((program_id IS NULL) = (program_sequence IS NULL));
CREATE UNIQUE INDEX caravan_program_unique_sequence
  ON caravan_shipments(program_id,program_sequence)
  WHERE program_id IS NOT NULL;

CREATE TABLE caravan_program_stop_orders (
  order_id uuid PRIMARY KEY,
  program_id uuid NOT NULL REFERENCES caravan_dispatch_programs(program_id)
    ON DELETE RESTRICT,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE RESTRICT,
  receipt jsonb NOT NULL CHECK(jsonb_typeof(receipt)='object'),
  accepted_at timestamptz NOT NULL
);
