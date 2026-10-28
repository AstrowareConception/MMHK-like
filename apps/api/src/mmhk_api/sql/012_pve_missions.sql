-- V012: actual, server-clocked outbound/return regional missions.
-- Travel durations are per-world explicit EXPERIMENTAL policies, not historical MMHK times.
CREATE TABLE pve_travel_policies (
  world_id text PRIMARY KEY REFERENCES worlds(world_id) ON DELETE CASCADE,
  seconds_per_step integer NOT NULL CHECK(seconds_per_step BETWEEN 5 AND 86400),
  policy_id text NOT NULL CHECK(length(policy_id) BETWEEN 3 AND 120),
  historically_certified boolean NOT NULL DEFAULT false
);
CREATE TABLE pve_missions (
  mission_id uuid PRIMARY KEY,
  city_id uuid NOT NULL REFERENCES cities(city_id) ON DELETE CASCADE,
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id),
  encounter_id uuid NOT NULL REFERENCES region_encounters(encounter_id),
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  unit_code text NOT NULL REFERENCES city_unit_profiles(unit_code),
  stack_count integer NOT NULL CHECK(stack_count BETWEEN 1 AND 1000000),
  stack_power numeric(12,3) NOT NULL CHECK(stack_power > 0),
  target_i integer NOT NULL CHECK(target_i BETWEEN 0 AND 4),
  target_j integer NOT NULL CHECK(target_j BETWEEN 0 AND 4),
  travel_seconds integer NOT NULL CHECK(travel_seconds BETWEEN 5 AND 172800),
  travel_policy_id text NOT NULL,
  stage text NOT NULL CHECK(stage IN ('outbound','returning','completed')),
  started_at timestamptz NOT NULL,
  arrival_due_at timestamptz NOT NULL,
  return_due_at timestamptz NOT NULL,
  arrived_at timestamptz,
  returned_at timestamptz,
  duel_report jsonb CHECK(duel_report IS NULL OR jsonb_typeof(duel_report)='object'),
  created_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK(arrival_due_at > started_at AND return_due_at > arrival_due_at),
  CHECK((stage='outbound' AND arrived_at IS NULL AND returned_at IS NULL AND duel_report IS NULL)
    OR (stage='returning' AND arrived_at IS NOT NULL AND returned_at IS NULL AND duel_report IS NOT NULL)
    OR (stage='completed' AND arrived_at IS NOT NULL AND returned_at IS NOT NULL AND duel_report IS NOT NULL))
);
CREATE UNIQUE INDEX one_active_pve_mission_per_hero ON pve_missions(hero_id)
  WHERE stage <> 'completed';
CREATE UNIQUE INDEX one_active_pve_mission_per_encounter ON pve_missions(encounter_id)
  WHERE stage <> 'completed';
CREATE INDEX pve_missions_due ON pve_missions(stage,arrival_due_at,return_due_at)
  WHERE stage <> 'completed';
CREATE TABLE pve_mission_events (
  mission_id uuid NOT NULL REFERENCES pve_missions(mission_id) ON DELETE CASCADE,
  phase text NOT NULL CHECK(phase IN ('departed','arrived','returned')),
  occurred_at timestamptz NOT NULL,
  PRIMARY KEY(mission_id,phase)
);
