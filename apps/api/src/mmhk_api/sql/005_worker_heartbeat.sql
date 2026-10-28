-- Supervised economy/construction runners. Worker liveness is not gameplay.
CREATE TABLE app_worker_heartbeats (
  worker_id text PRIMARY KEY CHECK (worker_id ~ '^[a-zA-Z0-9_-]{1,64}$'),
  started_at timestamptz NOT NULL,
  heartbeat_at timestamptz NOT NULL,
  state text NOT NULL CHECK (state IN ('healthy','degraded','stopped')),
  iteration bigint NOT NULL DEFAULT 0 CHECK (iteration>=0),
  last_economy_count integer NOT NULL DEFAULT 0 CHECK(last_economy_count>=0),
  last_construction_count integer NOT NULL DEFAULT 0 CHECK(last_construction_count>=0),
  failures bigint NOT NULL DEFAULT 0 CHECK(failures>=0),
  last_error_kind text,
  CHECK(last_error_kind IS NULL OR
        last_error_kind IN ('database','economy','construction','heartbeat'))
);
CREATE INDEX app_worker_latest_heartbeat
  ON app_worker_heartbeats(heartbeat_at DESC);
