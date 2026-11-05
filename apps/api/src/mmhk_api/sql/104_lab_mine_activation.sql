-- V104: opt-in laboratory mine activation backed by a REAL registered
-- city mine, physical deposit, source-qualified guardian, and V103 victory.
-- A gate enrolled here disables only this existing rate until the player
-- explicitly activates it. No resource, price, mine, or rate is invented.
CREATE TABLE city_lab_mine_unlocks (
  city_id uuid NOT NULL,
  resource text NOT NULL CHECK (
    resource IN ('gold','wood','ore','crystal','gems','sulfur','mercury')
  ),
  encounter_id uuid NOT NULL UNIQUE REFERENCES region_encounters(encounter_id) ON DELETE CASCADE,
  deposit_slot smallint NOT NULL CHECK (deposit_slot BETWEEN 0 AND 3),
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 3 AND 255),
  enrolled_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  activated_at timestamptz,
  activated_order_id uuid UNIQUE,
  activated_by uuid REFERENCES accounts(account_id),
  PRIMARY KEY (city_id,resource),
  FOREIGN KEY (city_id,resource) REFERENCES city_mine_rates(city_id,resource)
    ON DELETE CASCADE,
  FOREIGN KEY (city_id,resource) REFERENCES city_mine_positions(city_id,resource)
    ON DELETE CASCADE,
  CHECK (
    (activated_at IS NULL AND activated_order_id IS NULL AND activated_by IS NULL)
    OR (activated_at IS NOT NULL AND activated_order_id IS NOT NULL
        AND activated_by IS NOT NULL AND activated_at >= enrolled_at)
  )
);

-- The guardian and resource identity of a gate cannot be swapped after
-- enrollment. Activation is irreversible; its request UUID guarantees replay.
CREATE FUNCTION protect_lab_mine_unlock_v104() RETURNS trigger
LANGUAGE plpgsql AS $gate$
BEGIN
  IF TG_OP='DELETE' THEN
    -- Direct removal while the economic rate exists would bypass the gate.
    -- Parent deletion cascades only after the parent is removed.
    IF EXISTS (SELECT 1 FROM cities c WHERE c.city_id=OLD.city_id) THEN
      RAISE EXCEPTION 'Qualified LAB mine gate cannot be deleted'
        USING ERRCODE='23514';
    END IF;
    RETURN OLD;
  END IF;
  IF ROW(OLD.city_id,OLD.resource,OLD.encounter_id,OLD.deposit_slot,
         OLD.source_ref,OLD.enrolled_at)
      IS DISTINCT FROM
     ROW(NEW.city_id,NEW.resource,NEW.encounter_id,NEW.deposit_slot,
         NEW.source_ref,NEW.enrolled_at)
     OR OLD.activated_at IS NOT NULL
        AND ROW(OLD.activated_at,OLD.activated_order_id,OLD.activated_by)
            IS DISTINCT FROM
            ROW(NEW.activated_at,NEW.activated_order_id,NEW.activated_by)
  THEN
    RAISE EXCEPTION 'Qualified LAB mine gate is immutable'
      USING ERRCODE='23514';
  END IF;
  IF OLD.activated_at IS NULL AND NEW.activated_at IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM pve_lab_neutral_resolutions n
      JOIN pve_missions m ON m.mission_id=n.mission_id
      JOIN cities c ON c.city_id=m.city_id
      WHERE n.encounter_id=NEW.encounter_id
        AND m.city_id=NEW.city_id AND c.owner_account_id=NEW.activated_by
    ) THEN
      RAISE EXCEPTION 'LAB mine activation requires an owned resolved neutral'
        USING ERRCODE='23514';
    END IF;
  END IF;
  RETURN NEW;
END;
$gate$;

CREATE TRIGGER city_lab_mine_unlock_immutable_v104
BEFORE UPDATE OR DELETE ON city_lab_mine_unlocks
FOR EACH ROW EXECUTE FUNCTION protect_lab_mine_unlock_v104();

COMMENT ON TABLE city_lab_mine_unlocks IS
  'V104 qualified mine/deposit guardian linkage; pending gates suppress only their existing mine rate. Player activates after one V103 victory. Not historical S2.';
COMMENT ON COLUMN city_lab_mine_unlocks.activated_at IS
  'Real server time of player activation. The economy starts earning on the first whole tick whose START is at or after activation; no retroactive credits.';
