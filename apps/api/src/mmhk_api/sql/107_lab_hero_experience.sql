-- V109 (migration 107): source-backed levels and opt-in LAB PvE XP.
-- Thresholds: CODE-01 / data/reference/heros.json / _niveaux[1..40].
-- Reward size is operator-qualified for EACH real neutral encounter; the
-- historical formula is NOT inferred from ordinary dispersions alone.
CREATE TABLE hero_xp_thresholds_v109 (
  level smallint PRIMARY KEY CHECK (level BETWEEN 1 AND 40),
  required_xp bigint NOT NULL UNIQUE CHECK (required_xp BETWEEN 0 AND 3003584)
);
INSERT INTO hero_xp_thresholds_v109(level,required_xp) VALUES
  (1,0),
  (2,800),
  (3,2000),
  (4,3200),
  (5,4600),
  (6,6200),
  (7,8000),
  (8,10000),
  (9,12200),
  (10,14700),
  (11,17500),
  (12,20600),
  (13,24320),
  (14,28784),
  (15,34140),
  (16,40567),
  (17,48279),
  (18,57533),
  (19,68637),
  (20,81961),
  (21,97949),
  (22,117134),
  (23,140156),
  (24,167782),
  (25,200933),
  (26,240634),
  (27,288179),
  (28,345119),
  (29,413309),
  (30,494972),
  (31,592770),
  (32,709892),
  (33,850155),
  (34,1018132),
  (35,1219299),
  (36,1460212),
  (37,1748727),
  (38,2094247),
  (39,2508036),
  (40,3003584);

CREATE FUNCTION protect_hero_xp_thresholds_v109() RETURNS trigger
LANGUAGE plpgsql AS $threshold$
BEGIN
  RAISE EXCEPTION 'Historical hero XP thresholds are immutable'
    USING ERRCODE='23514';
END;
$threshold$;
CREATE TRIGGER hero_xp_thresholds_immutable_v109
BEFORE UPDATE OR DELETE ON hero_xp_thresholds_v109
FOR EACH ROW EXECUTE FUNCTION protect_hero_xp_thresholds_v109();

CREATE TABLE pve_lab_xp_policies (
  world_id text PRIMARY KEY REFERENCES worlds(world_id) ON DELETE CASCADE,
  policy_id text NOT NULL DEFAULT 'LAB-PVE-QUALIFIED-XP-V1'
    CHECK (policy_id='LAB-PVE-QUALIFIED-XP-V1'),
  enabled boolean NOT NULL DEFAULT false,
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 3 AND 255),
  configured_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE FUNCTION verify_lab_xp_policy_v109() RETURNS trigger
LANGUAGE plpgsql AS $policy$
BEGIN
  IF NEW.enabled AND NOT EXISTS (
    SELECT 1 FROM pve_travel_policies t
    JOIN pve_lab_casualty_policies c ON c.world_id=t.world_id AND c.enabled
    JOIN pve_lab_neutral_resolution_policies n
      ON n.world_id=t.world_id AND n.enabled
    WHERE t.world_id=NEW.world_id AND t.policy_id LIKE 'LAB-%'
      AND NOT t.historically_certified
  ) THEN
    RAISE EXCEPTION 'LAB hero XP requires explicit V102/V103 policies'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$policy$;
CREATE TRIGGER pve_lab_xp_policy_guard_v109
BEFORE INSERT OR UPDATE ON pve_lab_xp_policies FOR EACH ROW
EXECUTE FUNCTION verify_lab_xp_policy_v109();

-- Every amount is a declared LAB test rule, NEVER an Ubisoft payout.
CREATE TABLE pve_lab_xp_reward_qualifications (
  encounter_id uuid PRIMARY KEY REFERENCES region_encounters(encounter_id)
    ON DELETE CASCADE,
  experience_amount bigint NOT NULL CHECK(experience_amount BETWEEN 1 AND 3003584),
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 3 AND 255),
  qualified_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE FUNCTION verify_lab_xp_reward_v109() RETURNS trigger
LANGUAGE plpgsql AS $reward$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM region_encounters e
    JOIN cities c ON c.city_id=e.city_id
    JOIN pve_travel_policies t ON t.world_id=c.world_id
    JOIN pve_lab_neutral_defender_profiles n
      ON n.encounter_id=e.encounter_id
    WHERE e.encounter_id=NEW.encounter_id AND NOT e.resolved
      AND t.policy_id LIKE 'LAB-%' AND NOT t.historically_certified
      AND n.no_hero_confirmed AND n.no_attrition_confirmed
  ) THEN
    RAISE EXCEPTION 'LAB XP reward requires a qualified unresolved neutral'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$reward$;
CREATE TRIGGER pve_lab_xp_reward_guard_v109
BEFORE INSERT ON pve_lab_xp_reward_qualifications FOR EACH ROW
EXECUTE FUNCTION verify_lab_xp_reward_v109();

CREATE FUNCTION protect_lab_xp_reward_v109() RETURNS trigger
LANGUAGE plpgsql AS $rewardimmut$
BEGIN
  IF TG_OP='UPDATE' OR EXISTS (
    SELECT 1 FROM region_encounters WHERE encounter_id=OLD.encounter_id
  ) THEN
    RAISE EXCEPTION 'LAB XP reward qualification is immutable'
      USING ERRCODE='23514';
  END IF;
  RETURN OLD;
END;
$rewardimmut$;
CREATE TRIGGER pve_lab_xp_reward_immutable_v109
BEFORE UPDATE OR DELETE ON pve_lab_xp_reward_qualifications
FOR EACH ROW EXECUTE FUNCTION protect_lab_xp_reward_v109();

ALTER TABLE pve_missions ADD COLUMN xp_reward_snapshot jsonb;
ALTER TABLE pve_missions ADD CONSTRAINT pve_lab_xp_snapshot_shape_v109 CHECK (
  xp_reward_snapshot IS NULL OR (
    jsonb_typeof(xp_reward_snapshot)='object'
    AND xp_reward_snapshot->>'policy_id'='LAB-PVE-QUALIFIED-XP-V1'
    AND jsonb_typeof(xp_reward_snapshot->'enabled')='boolean'
    AND jsonb_typeof(xp_reward_snapshot->'policy_source_ref') IN ('string','null')
    AND jsonb_typeof(xp_reward_snapshot->'reward_source_ref') IN ('string','null')
    AND jsonb_typeof(xp_reward_snapshot->'experience_amount') IN ('number','null')
  )
);
CREATE FUNCTION freeze_pve_xp_at_departure_v109() RETURNS trigger
LANGUAGE plpgsql AS $snapshot$
DECLARE
  policy_enabled boolean;
  policy_source text;
  reward_source text;
  reward_amount bigint;
BEGIN
  IF NEW.xp_reward_snapshot IS NOT NULL THEN
    RAISE EXCEPTION 'LAB PvE experience reward must be server-frozen'
      USING ERRCODE='23514';
  END IF;
  SELECT p.enabled,p.source_ref INTO policy_enabled,policy_source
  FROM pve_lab_xp_policies p JOIN cities c ON c.world_id=p.world_id
  WHERE c.city_id=NEW.city_id FOR SHARE OF p;
  SELECT q.source_ref,q.experience_amount
    INTO reward_source,reward_amount
    FROM pve_lab_xp_reward_qualifications q
    WHERE q.encounter_id=NEW.encounter_id FOR SHARE;
  NEW.xp_reward_snapshot=jsonb_build_object(
    'policy_id','LAB-PVE-QUALIFIED-XP-V1',
    'enabled',COALESCE(policy_enabled,false),
    'policy_source_ref',policy_source,
    'reward_source_ref',reward_source,
    'experience_amount',reward_amount
  );
  RETURN NEW;
END;
$snapshot$;
CREATE TRIGGER pve_freeze_xp_at_departure_v109
BEFORE INSERT ON pve_missions
FOR EACH ROW EXECUTE FUNCTION freeze_pve_xp_at_departure_v109();

CREATE FUNCTION prevent_pve_xp_snapshot_edit_v109() RETURNS trigger
LANGUAGE plpgsql AS $immut$
BEGIN
  IF OLD.xp_reward_snapshot IS DISTINCT FROM NEW.xp_reward_snapshot THEN
    RAISE EXCEPTION 'Frozen PvE experience policy cannot change'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$immut$;
CREATE TRIGGER pve_xp_snapshot_immutable_v109
BEFORE UPDATE ON pve_missions FOR EACH ROW
EXECUTE FUNCTION prevent_pve_xp_snapshot_edit_v109();

-- Records the *actual* durable gain, not the speculative preview.
CREATE TABLE pve_lab_xp_awards (
  mission_id uuid PRIMARY KEY REFERENCES pve_missions(mission_id)
    ON DELETE CASCADE,
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id) ON DELETE CASCADE,
  encounter_id uuid NOT NULL UNIQUE,
  policy_id text NOT NULL CHECK(policy_id='LAB-PVE-QUALIFIED-XP-V1'),
  policy_source_ref text NOT NULL CHECK(length(policy_source_ref) BETWEEN 3 AND 255),
  reward_source_ref text NOT NULL CHECK(length(reward_source_ref) BETWEEN 3 AND 255),
  experience_awarded bigint NOT NULL CHECK(experience_awarded BETWEEN 1 AND 3003584),
  before_experience bigint NOT NULL CHECK(before_experience>=0),
  after_experience bigint NOT NULL CHECK(after_experience=before_experience+experience_awarded),
  before_level smallint NOT NULL CHECK(before_level BETWEEN 1 AND 40),
  after_level smallint NOT NULL CHECK(after_level BETWEEN before_level AND 40),
  awarded_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
CREATE FUNCTION prevent_pve_lab_xp_award_edit_v109() RETURNS trigger
LANGUAGE plpgsql AS $ledger$
BEGIN
  IF TG_OP='UPDATE' OR EXISTS (
    SELECT 1 FROM pve_missions WHERE mission_id=OLD.mission_id
  ) THEN
    RAISE EXCEPTION 'PvE experience award is append-only'
      USING ERRCODE='23514';
  END IF;
  RETURN OLD;
END;
$ledger$;
CREATE TRIGGER pve_lab_xp_award_immutable_v109
BEFORE UPDATE OR DELETE ON pve_lab_xp_awards FOR EACH ROW
EXECUTE FUNCTION prevent_pve_lab_xp_award_edit_v109();

COMMENT ON TABLE hero_xp_thresholds_v109 IS
  'Jactari CODE-01 _niveaux levels 1 to 40, not an independently certified MMHK S2 season.';
COMMENT ON COLUMN pve_missions.xp_reward_snapshot IS
  'V109 frozen opt-in LAB XP, NULL only for older missions; missing amount never defaults to XP.';
