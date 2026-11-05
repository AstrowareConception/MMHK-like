-- V101: preserve the entire ordinary line, not only the chosen LAB stack.
-- A new mission uses frozen profiles at dispatch and never reads live
-- profile strengths or weapon classes at worker arrival.
-- NULL is intentionally preserved for historical V100 and older missions.
ALTER TABLE pve_missions ADD COLUMN ordinary_line_snapshot jsonb;
ALTER TABLE pve_missions ADD CONSTRAINT pve_ordinary_line_snapshot_shape_check
  CHECK (ordinary_line_snapshot IS NULL OR (
    jsonb_typeof(ordinary_line_snapshot)='object'
    AND ordinary_line_snapshot->>'policy_id'='LAB-PVE-ORDINARY-LINE-AT-DEPARTURE-V1'
    AND jsonb_typeof(ordinary_line_snapshot->'attacker')='array'
    AND jsonb_typeof(ordinary_line_snapshot->'defender')='array'
  ));

CREATE FUNCTION freeze_pve_ordinary_line_on_insert_v1() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  slots_count integer;
  distinct_positions integer;
  qualified boolean;
  attacker_line jsonb;
  defender_line jsonb;
BEGIN
  IF NEW.ordinary_line_snapshot IS NOT NULL THEN
    RAISE EXCEPTION 'PvE ordinary line snapshot is server-generated'
      USING ERRCODE='23514';
  END IF;
  -- V100's BEFORE INSERT trigger is alphabetically before this trigger;
  -- both source snapshots are captured in the same dispatch transaction.
  IF NEW.defender_snapshot IS NULL OR NEW.formation_snapshot IS NULL
      OR jsonb_typeof(NEW.formation_snapshot)<>'array'
      OR jsonb_array_length(NEW.formation_snapshot) NOT BETWEEN 1 AND 7 THEN
    RAISE EXCEPTION 'Missing eligible PvE departure formation/defender'
      USING ERRCODE='23514';
  END IF;

  SELECT count(*),count(DISTINCT f.position),
         bool_and(f.position BETWEEN 1 AND 7 AND f.quantity BETWEEN 1 AND 1000000
           AND f.unit_code IS NOT NULL AND p.unit_code IS NOT NULL
           AND p.lab_duel_power BETWEEN 0.001 AND 1000000
           AND p.policy_id IS NOT NULL),
         jsonb_agg(jsonb_build_object(
           'position',f.position,'unit_code',f.unit_code,'count',f.quantity,
           'unit_power',p.lab_duel_power,'weapon_code',p.combat_weapon_code,
           'weapon_source_ref',p.combat_weapon_source_ref,
           'profile_policy_id',p.policy_id
         ) ORDER BY f.position)
    INTO slots_count,distinct_positions,qualified,attacker_line
  FROM jsonb_to_recordset(NEW.formation_snapshot) AS f(
       position integer,unit_code text,quantity integer)
  LEFT JOIN city_unit_profiles p ON p.unit_code=f.unit_code;
  IF slots_count<>jsonb_array_length(NEW.formation_snapshot)
     OR distinct_positions<>slots_count OR NOT COALESCE(qualified,false) THEN
    RAISE EXCEPTION 'PvE ordinary line contains unqualified profiles or slots'
      USING ERRCODE='23514';
  END IF;

  -- The line must represent exactly the actually assigned troops. A crafted
  -- direct INSERT must not be able to freeze phantom units.
  IF EXISTS (
    WITH requested AS (
      SELECT unit_code,sum(quantity)::bigint AS quantity
        FROM jsonb_to_recordset(NEW.formation_snapshot)
          AS f(position integer,unit_code text,quantity integer)
        GROUP BY unit_code
    ), assigned AS (
      SELECT unit_code,quantity::bigint AS quantity FROM hero_army_units
        WHERE hero_id=NEW.hero_id AND quantity>0
    )
    SELECT 1 FROM requested r FULL JOIN assigned a USING(unit_code)
      WHERE r.unit_code IS NULL OR a.unit_code IS NULL OR r.quantity<>a.quantity
  ) THEN
    RAISE EXCEPTION 'PvE frozen line must match assigned hero units'
      USING ERRCODE='23514';
  END IF;

  SELECT jsonb_build_object(
    'position',1,
    'unit_code',NEW.defender_snapshot->>'unit_code',
    'count',(NEW.defender_snapshot->>'unit_count')::integer,
    'unit_power',(NEW.defender_snapshot->>'unit_power')::numeric,
    'weapon_code',e.combat_weapon_code,
    'weapon_source_ref',e.combat_weapon_source_ref,
    'profile_policy_id',NEW.defender_snapshot->>'policy_id',
    'source_ref',NEW.defender_snapshot->>'source_ref'
  ) INTO defender_line
  FROM region_encounters e
  WHERE e.encounter_id=NEW.encounter_id AND e.city_id=NEW.city_id AND NOT e.resolved
  FOR SHARE;
  IF defender_line IS NULL THEN
    RAISE EXCEPTION 'No eligible PvE line defender'
      USING ERRCODE='23514';
  END IF;
  NEW.ordinary_line_snapshot=jsonb_build_object(
    'policy_id','LAB-PVE-ORDINARY-LINE-AT-DEPARTURE-V1',
    'attacker',attacker_line,'defender',jsonb_build_array(defender_line)
  );
  RETURN NEW;
END;
$$;

-- PostgreSQL runs triggers of the same kind in alphabetical name order.
-- pve_freeze_defender_on_insert (V100) therefore runs before this one.
CREATE TRIGGER pve_freeze_ordinary_line_on_insert
  BEFORE INSERT ON pve_missions
  FOR EACH ROW EXECUTE FUNCTION freeze_pve_ordinary_line_on_insert_v1();

CREATE FUNCTION prevent_pve_ordinary_line_update_v1() RETURNS trigger
LANGUAGE plpgsql AS $$
BEGIN
  IF OLD.ordinary_line_snapshot IS DISTINCT FROM NEW.ordinary_line_snapshot THEN
    RAISE EXCEPTION 'Frozen PvE ordinary line cannot be changed'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$$;
CREATE TRIGGER pve_ordinary_line_immutable
  BEFORE UPDATE ON pve_missions
  FOR EACH ROW EXECUTE FUNCTION prevent_pve_ordinary_line_update_v1();

COMMENT ON COLUMN pve_missions.ordinary_line_snapshot IS
  'V101+ frozen ordinary 1..7 attacking positions and neutral defender; NULL for historical orders. Preview only: no durable losses, XP, loot or liberation.';
