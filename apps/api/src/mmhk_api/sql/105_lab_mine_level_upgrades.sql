-- V106 — G11 normal-mode level upgrades, explicitly qualified per LAB mine.
-- No backfill: legacy mines have no level, no executable upgrade.
-- A real rate must equal the G11 baseline at enrollment. Future level costs
-- and hero requirements are approved one step at a time by the operator.
CREATE TABLE city_lab_mine_levels (
  city_id uuid NOT NULL,
  resource text NOT NULL,
  level integer NOT NULL CHECK(level BETWEEN 1 AND 10),
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
  established_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(city_id,resource),
  FOREIGN KEY(city_id,resource)
    REFERENCES city_lab_mine_unlocks(city_id,resource) ON DELETE CASCADE
);

CREATE TABLE city_lab_mine_level_qualifications (
  city_id uuid NOT NULL,
  resource text NOT NULL,
  target_level integer NOT NULL CHECK(target_level BETWEEN 2 AND 10),
  required_hero_level integer NOT NULL CHECK(required_hero_level BETWEEN 1 AND 100),
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
  approved_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(city_id,resource,target_level),
  FOREIGN KEY(city_id,resource)
    REFERENCES city_lab_mine_levels(city_id,resource) ON DELETE CASCADE
);

CREATE TABLE city_lab_mine_upgrade_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL,
  resource text NOT NULL,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id) ON DELETE CASCADE,
  from_level integer NOT NULL CHECK(from_level BETWEEN 1 AND 9),
  target_level integer NOT NULL CHECK(target_level=from_level+1 AND target_level<=10),
  hero_level_at_start integer NOT NULL CHECK(hero_level_at_start BETWEEN 1 AND 100),
  required_hero_level integer NOT NULL CHECK(required_hero_level BETWEEN 1 AND 100),
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
  cost_gold integer NOT NULL CHECK(cost_gold>0),
  old_rate numeric(18,6) NOT NULL CHECK(old_rate>0),
  new_rate numeric(18,6) NOT NULL CHECK(new_rate>old_rate),
  started_at timestamptz NOT NULL,
  due_at timestamptz NOT NULL CHECK(due_at>started_at),
  status text NOT NULL CHECK(status IN ('building','completed')),
  completed_at timestamptz,
  CHECK((status='building' AND completed_at IS NULL) OR
        (status='completed' AND completed_at IS NOT NULL)),
  FOREIGN KEY(city_id,resource)
    REFERENCES city_lab_mine_levels(city_id,resource) ON DELETE CASCADE,
  FOREIGN KEY(city_id,resource,target_level)
    REFERENCES city_lab_mine_level_qualifications(city_id,resource,target_level)
    ON DELETE CASCADE
);
CREATE UNIQUE INDEX one_pending_lab_mine_upgrade
  ON city_lab_mine_upgrade_orders(city_id,resource)
  WHERE status='building';
CREATE INDEX lab_mine_upgrade_due
  ON city_lab_mine_upgrade_orders(city_id,due_at)
  WHERE status='building';

-- Protected order facts are immutable after dispatch; only completion changes.
CREATE FUNCTION protect_lab_mine_upgrade_order_v106() RETURNS trigger
LANGUAGE plpgsql AS $upgrade$
BEGIN
  IF ROW(OLD.order_id,OLD.city_id,OLD.resource,OLD.actor_account_id,
         OLD.hero_id,OLD.from_level,OLD.target_level,OLD.hero_level_at_start,
         OLD.required_hero_level,OLD.source_ref,OLD.cost_gold,
         OLD.old_rate,OLD.new_rate,OLD.started_at,OLD.due_at)
     IS DISTINCT FROM
     ROW(NEW.order_id,NEW.city_id,NEW.resource,NEW.actor_account_id,
         NEW.hero_id,NEW.from_level,NEW.target_level,NEW.hero_level_at_start,
         NEW.required_hero_level,NEW.source_ref,NEW.cost_gold,
         NEW.old_rate,NEW.new_rate,NEW.started_at,NEW.due_at)
     OR OLD.status='completed' AND
        (NEW.status<>'completed' OR OLD.completed_at IS DISTINCT FROM NEW.completed_at)
     OR OLD.status='building' AND NEW.status='completed'
        AND NEW.completed_at < OLD.due_at
  THEN
    RAISE EXCEPTION 'G11 mine upgrade order cannot be rewritten or reversed'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$upgrade$;
CREATE TRIGGER lab_mine_upgrade_order_immutable_v106
BEFORE UPDATE ON city_lab_mine_upgrade_orders FOR EACH ROW
EXECUTE FUNCTION protect_lab_mine_upgrade_order_v106();

-- A mine level can only advance alongside a paid due order, and no
-- operator may silently change the qualification used to accept an order.
CREATE FUNCTION guard_g11_lab_level_v106() RETURNS trigger
LANGUAGE plpgsql AS $levelguard$
BEGIN
  IF TG_OP='DELETE' THEN
    IF EXISTS (SELECT 1 FROM cities c WHERE c.city_id=OLD.city_id) THEN
      RAISE EXCEPTION 'Qualified LAB mine level cannot be removed'
        USING ERRCODE='23514';
    END IF;
    RETURN OLD;
  END IF;
  IF ROW(OLD.city_id,OLD.resource,OLD.source_ref,OLD.established_at)
     IS DISTINCT FROM
     ROW(NEW.city_id,NEW.resource,NEW.source_ref,NEW.established_at) THEN
    RAISE EXCEPTION 'Qualified LAB mine provenance cannot be changed'
      USING ERRCODE='23514';
  END IF;
  IF OLD.level IS DISTINCT FROM NEW.level AND NOT EXISTS (
    SELECT 1 FROM city_lab_mine_upgrade_orders o
    JOIN city_economy_clock clock ON clock.city_id=o.city_id
    WHERE o.city_id=OLD.city_id AND o.resource=OLD.resource
      AND o.status='building'
      AND o.from_level=OLD.level AND o.target_level=NEW.level
      AND o.due_at<=clock.last_tick_at
  ) THEN
    RAISE EXCEPTION 'Mine level requires a due paid LAB construction order'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$levelguard$;
CREATE TRIGGER city_lab_mine_level_guard_v106
BEFORE UPDATE OR DELETE ON city_lab_mine_levels FOR EACH ROW
EXECUTE FUNCTION guard_g11_lab_level_v106();

CREATE FUNCTION guard_g11_lab_qualification_v106() RETURNS trigger
LANGUAGE plpgsql AS $quali$
BEGIN
  IF TG_OP='UPDATE' OR EXISTS (
    SELECT 1 FROM cities c WHERE c.city_id=OLD.city_id
  ) THEN
    RAISE EXCEPTION 'LAB G11 next-step qualification is immutable'
      USING ERRCODE='23514';
  END IF;
  RETURN OLD;
END;
$quali$;
CREATE TRIGGER city_lab_mine_qualification_guard_v106
BEFORE UPDATE OR DELETE ON city_lab_mine_level_qualifications FOR EACH ROW
EXECUTE FUNCTION guard_g11_lab_qualification_v106();

COMMENT ON TABLE city_lab_mine_levels IS
 'V106 opt-in LAB mine levels: never created from undocumented experimental rates.';
COMMENT ON TABLE city_lab_mine_upgrade_orders IS
 'G11 normal upgrades only; existing mine production continues during works and increases only when economy clock catches up.';
