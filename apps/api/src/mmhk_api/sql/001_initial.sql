-- MMHK-like application schema, not the historic node:sqlite laboratory.
-- Initial version: account + sessions + worlds + first city + explicit stock.
-- PostgreSQL is authoritative. No automatic historical resource production.
CREATE TABLE accounts (
  account_id uuid PRIMARY KEY,
  username text NOT NULL UNIQUE
    CHECK (username ~ '^[a-z0-9_]{3,32}$'),
  password_salt bytea NOT NULL,
  password_hash bytea NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE sessions (
  token_digest bytea PRIMARY KEY,
  account_id uuid NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  expires_at timestamptz NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX sessions_account ON sessions(account_id);
CREATE TABLE worlds (
  world_id text PRIMARY KEY CHECK (world_id ~ '^[a-z0-9_-]{1,64}$'),
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 100),
  world_size integer NOT NULL CHECK (world_size BETWEEN 2 AND 100000),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE world_memberships (
  world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
  account_id uuid NOT NULL REFERENCES accounts(account_id) ON DELETE CASCADE,
  joined_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (world_id, account_id)
);
CREATE TABLE cities (
  city_id uuid PRIMARY KEY,
  world_id text NOT NULL,
  owner_account_id uuid NOT NULL,
  name text NOT NULL CHECK (length(name) BETWEEN 1 AND 80),
  x integer NOT NULL CHECK (x >= 1),
  y integer NOT NULL CHECK (y >= 1),
  first_city boolean NOT NULL DEFAULT false,
  founded_at timestamptz NOT NULL DEFAULT now(),
  FOREIGN KEY (world_id, owner_account_id)
    REFERENCES world_memberships(world_id, account_id),
  UNIQUE (world_id, x, y)
);
CREATE UNIQUE INDEX one_first_city_per_player_and_world
  ON cities(world_id, owner_account_id) WHERE first_city;
CREATE TABLE city_stocks (
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  resource text NOT NULL
    CHECK (resource IN ('gold','wood','ore','crystal','gems','sulfur','mercury')),
  amount bigint NOT NULL DEFAULT 0 CHECK(amount >= 0),
  PRIMARY KEY (city_id, resource)
);
CREATE TABLE city_mines (
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  resource text NOT NULL
    CHECK(resource IN ('gold','wood','ore','crystal','gems','sulfur','mercury')),
  PRIMARY KEY(city_id,resource)
);
-- Avoid ambiguous faction-era mine rules. The first Havre city is explicitly
-- seeded with the P0 decided set: gold, wood, ore, crystal.
