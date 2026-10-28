-- 006: anonymous sign-in attempt reservation; no plaintext usernames, IPs,
-- passwords, session tokens or request headers are ever persisted here.
-- PostgreSQL bucket updates are atomic across FastAPI processes.
CREATE TABLE auth_login_buckets (
  bucket_digest bytea PRIMARY KEY CHECK (octet_length(bucket_digest)=32),
  scope text NOT NULL CHECK (scope IN ('source','username')),
  window_ends_at timestamptz NOT NULL,
  attempts integer NOT NULL CHECK (attempts>=1),
  updated_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE INDEX auth_login_buckets_expiry ON auth_login_buckets(window_ends_at);
CREATE TABLE auth_login_events (
  event_id bigint GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  occurred_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  username_digest bytea NOT NULL CHECK(octet_length(username_digest)=32),
  event_kind text NOT NULL CHECK (event_kind IN ('accepted','rejected','limited'))
);
CREATE INDEX auth_login_events_time ON auth_login_events(occurred_at);
