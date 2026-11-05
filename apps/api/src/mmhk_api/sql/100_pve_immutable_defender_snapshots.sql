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
  IF OLD.defender_snapshot IS DISTINCT FROM NEW.defender_snapshot THEN
    RAISE EXCEPTION 'Frozen PvE defender input cannot be changed'
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
