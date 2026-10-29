-- V019: opt-in dynamic influence, independent from operator-proven map cells.
-- Four-day mean and thresholds documented 2009/2013; S2 still uncertain.
CREATE TABLE world_influence_policies(
 world_id text PRIMARY KEY REFERENCES worlds(world_id) ON DELETE CASCADE,
 policy_id text NOT NULL CHECK(length(policy_id) BETWEEN 3 AND 100),
 enabled boolean NOT NULL DEFAULT false,
 period_seconds integer NOT NULL CHECK(period_seconds BETWEEN 3600 AND 86400),
 next_refresh_at timestamptz NOT NULL,
 last_refresh_at timestamptz,
 revision bigint NOT NULL DEFAULT 0 CHECK(revision>=0)
);
CREATE INDEX influence_due ON world_influence_policies(next_refresh_at) WHERE enabled;
CREATE TABLE city_domination_samples(
 world_id text NOT NULL,city_id uuid NOT NULL,
 owner_account_id uuid NOT NULL REFERENCES accounts(account_id),
 sample_day date NOT NULL,
 military_power bigint NOT NULL CHECK(military_power BETWEEN 0 AND 1000000000000),
 building_domination bigint NOT NULL CHECK(building_domination BETWEEN 0 AND 1000000000000),
 source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
 recorded_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(world_id,city_id,sample_day),
 FOREIGN KEY(world_id,city_id) REFERENCES cities(world_id,city_id) ON DELETE CASCADE
);
CREATE TABLE world_influence_cells(
 world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
 x integer NOT NULL CHECK(x>=1),y integer NOT NULL CHECK(y>=1),
 owner_account_id uuid REFERENCES accounts(account_id),
 state text NOT NULL CHECK(state IN ('controlled','contested')),
 score numeric(34,12) NOT NULL CHECK(score>=0),
 revision bigint NOT NULL CHECK(revision>0),
 policy_id text NOT NULL,
 refreshed_at timestamptz NOT NULL,
 PRIMARY KEY(world_id,x,y),
 CHECK((state='controlled' AND owner_account_id IS NOT NULL)
    OR(state='contested' AND owner_account_id IS NULL))
);
CREATE INDEX influence_cells_owner ON world_influence_cells(world_id,owner_account_id);
CREATE TABLE world_influence_visibility(
 world_id text NOT NULL,y integer NOT NULL,x integer NOT NULL,
 viewer_account_id uuid NOT NULL,
 revealed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
 PRIMARY KEY(world_id,x,y,viewer_account_id),
 FOREIGN KEY(world_id,viewer_account_id)
 REFERENCES world_memberships(world_id,account_id) ON DELETE CASCADE
);
CREATE TABLE world_influence_runs(
 world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
 revision bigint NOT NULL CHECK(revision>0),
 policy_id text NOT NULL,cutoff_day date NOT NULL,
 city_count integer NOT NULL CHECK(city_count>=0),
 controlled_cells integer NOT NULL CHECK(controlled_cells>=0),
 contested_cells integer NOT NULL CHECK(contested_cells>=0),
 calculated_at timestamptz NOT NULL,PRIMARY KEY(world_id,revision)
);
