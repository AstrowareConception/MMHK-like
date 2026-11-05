-- V102 — opt-in experimental *attacker-only* durable ordinary losses.
-- No policy row means no durable effect. No historical V100/V101 order is
-- retroactively enabled. Live policy/hero profile changes never alter an order.
CREATE TABLE pve_lab_casualty_policies (
  world_id text PRIMARY KEY REFERENCES worlds(world_id) ON DELETE CASCADE,
  policy_id text NOT NULL DEFAULT 'LAB-PVE-ORDINARY-HERO-030-V1'
    CHECK(policy_id='LAB-PVE-ORDINARY-HERO-030-V1'),
  enabled boolean NOT NULL DEFAULT false,
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
  configured_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

ALTER TABLE pve_missions ADD COLUMN attacker_settlement_snapshot jsonb;
ALTER TABLE pve_missions ADD CONSTRAINT pve_attacker_settlement_shape_v102 CHECK (
  attacker_settlement_snapshot IS NULL OR (
    jsonb_typeof(attacker_settlement_snapshot)='object'
    AND attacker_settlement_snapshot->>'policy_id'='LAB-PVE-ORDINARY-HERO-030-V1'
    AND jsonb_typeof(attacker_settlement_snapshot->'enabled')='boolean'
    AND jsonb_typeof(attacker_settlement_snapshot->'zero_hero_profile')='boolean'
    AND jsonb_typeof(attacker_settlement_snapshot->'source_ref') IN ('string','null')
    AND jsonb_typeof(attacker_settlement_snapshot->'hero_profile_source_ref') IN ('string','null')
  )
);

CREATE FUNCTION freeze_pve_attacker_settlement_v102() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  policy_enabled boolean;
  policy_source text;
  zero_hero boolean;
  hero_source text;
BEGIN
  IF NEW.attacker_settlement_snapshot IS NOT NULL THEN
    RAISE EXCEPTION 'PvE casualty policy snapshot is server-generated'
      USING ERRCODE='23514';
  END IF;
  SELECT p.enabled,p.source_ref INTO policy_enabled,policy_source
    FROM pve_lab_casualty_policies p
    JOIN cities c ON c.world_id=p.world_id
    WHERE c.city_id=NEW.city_id FOR SHARE OF p;
  SELECT h.source_ref INTO hero_source FROM hero_basic_combat_profiles h
    WHERE h.hero_id=NEW.hero_id
      AND h.attack_points=0 AND h.defense_points=0
      AND h.attack_per_unit=0 AND h.defense_per_unit=0
      AND NOT EXISTS (
        SELECT 1 FROM hero_conditional_counter_talents t WHERE t.hero_id=h.hero_id
      ) AND NOT EXISTS (
        SELECT 1 FROM hero_pre_shot_lab_profiles s WHERE s.hero_id=h.hero_id
      ) FOR SHARE;
  zero_hero=(hero_source IS NOT NULL);
  NEW.attacker_settlement_snapshot=jsonb_build_object(
    'policy_id','LAB-PVE-ORDINARY-HERO-030-V1',
    'enabled',COALESCE(policy_enabled,false),
    'source_ref',policy_source,
    'zero_hero_profile',zero_hero,
    'hero_profile_source_ref',hero_source
  );
  RETURN NEW;
END;
$$;
CREATE TRIGGER pve_freeze_settlement_policy_on_insert_v102
  BEFORE INSERT ON pve_missions FOR EACH ROW
  EXECUTE FUNCTION freeze_pve_attacker_settlement_v102();

CREATE FUNCTION prevent_pve_attacker_settlement_edit_v102() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.attacker_settlement_snapshot IS DISTINCT FROM NEW.attacker_settlement_snapshot THEN
    RAISE EXCEPTION 'Frozen PvE casualty policy cannot change'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER pve_settlement_policy_immutable_v102
  BEFORE UPDATE ON pve_missions FOR EACH ROW
  EXECUTE FUNCTION prevent_pve_attacker_settlement_edit_v102();

-- One irreversible ledger entry per mission, applied atomically with troop
-- debits, the immutable combat report, and the outbound -> returning transition.
CREATE TABLE pve_lab_casualty_settlements (
  mission_id uuid PRIMARY KEY REFERENCES pve_missions(mission_id),
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id),
  policy_id text NOT NULL CHECK(policy_id='LAB-PVE-ORDINARY-HERO-030-V1'),
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
  total_deaths integer NOT NULL CHECK(total_deaths BETWEEN 0 AND 7000000),
  entries jsonb NOT NULL CHECK(jsonb_typeof(entries)='array'),
  applied_at timestamptz NOT NULL DEFAULT clock_timestamp()
);

CREATE FUNCTION prevent_pve_lab_settlement_mutation_v102() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  RAISE EXCEPTION 'PvE casualty settlement ledger is append-only'
    USING ERRCODE='23514';
END;
$$;
CREATE TRIGGER pve_lab_settlement_append_only_v102
  BEFORE UPDATE OR DELETE ON pve_lab_casualty_settlements
  FOR EACH ROW EXECUTE FUNCTION prevent_pve_lab_settlement_mutation_v102();

COMMENT ON COLUMN pve_missions.attacker_settlement_snapshot IS
  'V102+ frozen operator opt-in and zero-modifier hero evidence. NULL = order predates V102, never backfilled.';
COMMENT ON TABLE pve_lab_casualty_settlements IS
  'Experimental ordinary attacker deaths only: no PNJ losses, XP, loot or mine liberation.';
