-- V100 — immutable PvE encounter inputs for the existing LAB mission lifecycle.
--
-- Earlier missions have NULL here: we cannot recreate their original
-- opponent attributes after the fact. New launches freeze their defender
-- atomically in the INSERT transaction, including launches through an
-- older version of the API during a rolling deployment.
ALTER TABLE pve_missions ADD COLUMN defender_snapshot jsonb;

ALTER TABLE pve_missions ADD CONSTRAINT pve_defender_snapshot_shape_check
CHECK (
  defender_snapshot IS NULL OR (
    jsonb_typeof(defender_snapshot)='object'
    AND defender_snapshot->>'policy_id'='LAB-PVE-DEFENDER-AT-DEPARTURE-V1'
    AND jsonb_typeof(defender_snapshot->'unit_code')='string'
    AND jsonb_typeof(defender_snapshot->'unit_count')='number'
    AND jsonb_typeof(defender_snapshot->'unit_power')='number'
    AND jsonb_typeof(defender_snapshot->'source_ref') IN ('string','null')
  )
);

CREATE FUNCTION freeze_pve_defender_on_insert_v1() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  -- No client or worker may supply its own defensive strength.
  IF NEW.defender_snapshot IS NOT NULL THEN
    RAISE EXCEPTION 'PvE defender snapshot is server-generated'
      USING ERRCODE='23514';
  END IF;
  SELECT jsonb_build_object(
    'policy_id','LAB-PVE-DEFENDER-AT-DEPARTURE-V1',
    'unit_code',e.unit_code,
    'unit_count',e.unit_count,
    'unit_power',e.unit_power,
    'source_ref',e.source_ref
  ) INTO NEW.defender_snapshot
  FROM region_encounters e
  WHERE e.encounter_id=NEW.encounter_id
    AND e.city_id=NEW.city_id
    AND NOT e.resolved
  FOR SHARE;

  IF NEW.defender_snapshot IS NULL THEN
    RAISE EXCEPTION 'No eligible region encounter to snapshot'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER pve_freeze_defender_on_insert
BEFORE INSERT ON pve_missions
FOR EACH ROW EXECUTE FUNCTION freeze_pve_defender_on_insert_v1();

CREATE FUNCTION prevent_pve_defender_snapshot_update_v1() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  -- Identity, authorization, attacker and formation must never change
  -- after dispatch. Only stage/timing fields have legitimate transitions.
  IF ROW(OLD.mission_id,OLD.city_id,OLD.hero_id,OLD.encounter_id,
         OLD.actor_account_id,OLD.unit_code,OLD.stack_count,
         OLD.stack_power,OLD.target_i,OLD.target_j,OLD.travel_seconds,
         OLD.travel_policy_id,OLD.started_at,OLD.arrival_due_at,
         OLD.formation_snapshot)
     IS DISTINCT FROM
     ROW(NEW.mission_id,NEW.city_id,NEW.hero_id,NEW.encounter_id,
         NEW.actor_account_id,NEW.unit_code,NEW.stack_count,
         NEW.stack_power,NEW.target_i,NEW.target_j,NEW.travel_seconds,
         NEW.travel_policy_id,NEW.started_at,NEW.arrival_due_at,
         NEW.formation_snapshot) THEN
    RAISE EXCEPTION 'Dispatched PvE order is immutable'
      USING ERRCODE='23514';
  END IF;
  IF OLD.defender_snapshot IS DISTINCT FROM NEW.defender_snapshot THEN
    RAISE EXCEPTION 'Frozen PvE defender input cannot be changed'
      USING ERRCODE='23514';
  END IF;
  -- A completed report is a historical record, not a live recalculation.
  IF OLD.duel_report IS NOT NULL
     AND OLD.duel_report IS DISTINCT FROM NEW.duel_report THEN
    RAISE EXCEPTION 'Persisted PvE report cannot be recalculated'
      USING ERRCODE='23514';
  END IF;
  IF (OLD.stage='completed' AND NEW.stage<>'completed')
    OR (OLD.stage='returning' AND NEW.stage='outbound') THEN
    RAISE EXCEPTION 'PvE mission cannot move backwards'
      USING ERRCODE='23514';
  END IF;
  IF OLD.stage IN ('returning','completed')
     AND OLD.return_due_at IS DISTINCT FROM NEW.return_due_at THEN
    RAISE EXCEPTION 'Confirmed PvE return deadline is immutable'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;

CREATE TRIGGER pve_defender_snapshot_immutable
BEFORE UPDATE ON pve_missions
FOR EACH ROW EXECUTE FUNCTION prevent_pve_defender_snapshot_update_v1();

COMMENT ON COLUMN pve_missions.defender_snapshot IS
  'Immutable opponent profile at departure for v100+ missions; NULL only for legacy launches, never silently backfilled.';
