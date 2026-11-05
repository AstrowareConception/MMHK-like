-- V107: one explicitly qualified and physically reserved LAB extension per mine.
-- G11 supports +5% nominal yield and no production during construction.
-- G11 does NOT qualify site placement, cost, build time, extension stacking,
-- hero prerequisites or combined regional bonuses. Operator attests them
-- separately, and V107 refuses to build a second extension on the same mine.
CREATE TABLE city_lab_mine_extension_sites (
  city_id uuid NOT NULL,
  resource text NOT NULL,
  site_i smallint NOT NULL CHECK(site_i BETWEEN 0 AND 4),
  site_j smallint NOT NULL CHECK(site_j BETWEEN 0 AND 4),
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
  required_hero_level integer NOT NULL CHECK(required_hero_level BETWEEN 1 AND 100),
  cost_gold integer NOT NULL CHECK(cost_gold BETWEEN 1 AND 1000000000),
  duration_seconds integer NOT NULL CHECK(duration_seconds BETWEEN 60 AND 2592000),
  qualified_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY(city_id,resource),
  UNIQUE(city_id,site_i,site_j),
  FOREIGN KEY(city_id,resource)
    REFERENCES city_lab_mine_unlocks(city_id,resource) ON DELETE CASCADE,
  CHECK(NOT(site_i=2 AND site_j=2))
);

CREATE FUNCTION validate_lab_extension_site_v107() RETURNS trigger
LANGUAGE plpgsql AS $checksite$
DECLARE
  mine_i int;
  mine_j int;
BEGIN
  -- Position is LAB-only, not a claim about Ubisoft expansion geometry.
  IF NOT EXISTS (
    SELECT 1 FROM city_lab_mine_unlocks u
    JOIN city_mine_rates r USING(city_id,resource)
    JOIN cities c ON c.city_id=u.city_id
    JOIN pve_travel_policies t ON t.world_id=c.world_id
    WHERE u.city_id=NEW.city_id AND u.resource=NEW.resource
      AND u.activated_at IS NOT NULL AND r.additive_bonus=0
      AND left(t.policy_id,4)='LAB-' AND NOT t.historically_certified
  ) THEN
    RAISE EXCEPTION 'LAB extension requires an active zero-bonus mine'
      USING ERRCODE='23514';
  END IF;
  SELECT p.i,p.j INTO mine_i,mine_j
    FROM city_mine_positions p
    WHERE p.city_id=NEW.city_id AND p.resource=NEW.resource;
  IF mine_i IS NULL OR
     abs(mine_i-NEW.site_i)+abs(mine_j-NEW.site_j)<>1 THEN
    RAISE EXCEPTION 'Experimental extension site must adjoin its mine'
      USING ERRCODE='23514';
  END IF;
  IF EXISTS (
    SELECT 1 FROM city_mine_positions p WHERE p.city_id=NEW.city_id
      AND p.i=NEW.site_i AND p.j=NEW.site_j
  ) OR EXISTS (
    SELECT 1 FROM region_encounters e WHERE e.city_id=NEW.city_id
      AND e.cell_i=NEW.site_i AND e.cell_j=NEW.site_j
  ) OR EXISTS (
    SELECT 1 FROM cities c
    JOIN world_region_deposits d
      ON d.world_id=c.world_id AND d.x=c.x AND d.y=c.y
    WHERE c.city_id=NEW.city_id AND d.i=NEW.site_i AND d.j=NEW.site_j
  ) THEN
    RAISE EXCEPTION 'LAB extension site is physically occupied'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$checksite$;
CREATE TRIGGER lab_extension_site_validate_v107
BEFORE INSERT ON city_lab_mine_extension_sites
FOR EACH ROW EXECUTE FUNCTION validate_lab_extension_site_v107();

CREATE FUNCTION preserve_lab_extension_site_v107() RETURNS trigger
LANGUAGE plpgsql AS $site$
BEGIN
  IF TG_OP='UPDATE' OR EXISTS (
    SELECT 1 FROM cities WHERE city_id=OLD.city_id
  ) THEN
    RAISE EXCEPTION 'LAB extension site qualification is immutable'
      USING ERRCODE='23514';
  END IF;
  RETURN OLD;
END;
$site$;
CREATE TRIGGER lab_extension_site_protect_v107
BEFORE UPDATE OR DELETE ON city_lab_mine_extension_sites
FOR EACH ROW EXECUTE FUNCTION preserve_lab_extension_site_v107();

-- No later world mutation may occupy a site reserved for the LAB extension.
CREATE FUNCTION reject_lab_extension_site_overlap_v107() RETURNS trigger
LANGUAGE plpgsql AS $overlap$
BEGIN
  IF EXISTS (
    SELECT 1 FROM city_lab_mine_extension_sites s
    WHERE s.city_id=NEW.city_id AND s.site_i=NEW.i AND s.site_j=NEW.j
  ) THEN
    RAISE EXCEPTION 'New mine collides with reserved LAB extension site'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$overlap$;
CREATE TRIGGER lab_ext_block_mine_overlap_v107
BEFORE INSERT OR UPDATE OF city_id,i,j ON city_mine_positions
FOR EACH ROW EXECUTE FUNCTION reject_lab_extension_site_overlap_v107();

CREATE FUNCTION reject_lab_extension_encounter_v107() RETURNS trigger
LANGUAGE plpgsql AS $enc$
BEGIN
  IF EXISTS (
    SELECT 1 FROM city_lab_mine_extension_sites s
    WHERE s.city_id=NEW.city_id
      AND s.site_i=NEW.cell_i AND s.site_j=NEW.cell_j
  ) THEN
    RAISE EXCEPTION 'Encounter collides with reserved LAB extension site'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$enc$;
CREATE TRIGGER lab_ext_block_encounter_overlap_v107
BEFORE INSERT OR UPDATE OF city_id,cell_i,cell_j ON region_encounters
FOR EACH ROW EXECUTE FUNCTION reject_lab_extension_encounter_v107();

CREATE FUNCTION reject_lab_extension_deposit_v107() RETURNS trigger
LANGUAGE plpgsql AS $deposit$
BEGIN
  IF EXISTS (
    SELECT 1 FROM city_lab_mine_extension_sites s
    JOIN cities c ON c.city_id=s.city_id
    WHERE c.world_id=NEW.world_id AND c.x=NEW.x AND c.y=NEW.y
      AND s.site_i=NEW.i AND s.site_j=NEW.j
  ) THEN
    RAISE EXCEPTION 'Natural deposit collides with reserved LAB extension site'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$deposit$;
CREATE TRIGGER lab_ext_block_deposit_overlap_v107
BEFORE INSERT OR UPDATE OF world_id,x,y,i,j ON world_region_deposits
FOR EACH ROW EXECUTE FUNCTION reject_lab_extension_deposit_v107();

CREATE TABLE city_lab_mine_extension_orders (
  order_id uuid PRIMARY KEY,
  city_id uuid NOT NULL,
  resource text NOT NULL,
  actor_account_id uuid NOT NULL REFERENCES accounts(account_id),
  hero_id uuid NOT NULL REFERENCES city_heroes(hero_id) ON DELETE CASCADE,
  source_ref text NOT NULL CHECK(length(source_ref) BETWEEN 3 AND 255),
  site_i smallint NOT NULL CHECK(site_i BETWEEN 0 AND 4),
  site_j smallint NOT NULL CHECK(site_j BETWEEN 0 AND 4),
  required_hero_level integer NOT NULL CHECK(required_hero_level BETWEEN 1 AND 100),
  hero_level_at_start integer NOT NULL CHECK(hero_level_at_start BETWEEN 1 AND 100),
  cost_gold integer NOT NULL CHECK(cost_gold BETWEEN 1 AND 1000000000),
  bonus_delta numeric(6,4) NOT NULL DEFAULT 0.0500 CHECK(bonus_delta=0.0500),
  started_at timestamptz NOT NULL,
  due_at timestamptz NOT NULL CHECK(due_at>started_at),
  status text NOT NULL CHECK(status IN ('building','completed')),
  completed_at timestamptz,
  UNIQUE(city_id,resource),
  FOREIGN KEY(city_id,resource)
    REFERENCES city_lab_mine_extension_sites(city_id,resource) ON DELETE CASCADE,
  CHECK((status='building' AND completed_at IS NULL) OR
        (status='completed' AND completed_at IS NOT NULL
         AND completed_at>=due_at))
);

CREATE FUNCTION protect_lab_extension_order_v107() RETURNS trigger
LANGUAGE plpgsql AS $order$
BEGIN
  IF ROW(OLD.order_id,OLD.city_id,OLD.resource,OLD.actor_account_id,
         OLD.hero_id,OLD.source_ref,OLD.site_i,OLD.site_j,
         OLD.required_hero_level,OLD.hero_level_at_start,
         OLD.cost_gold,OLD.bonus_delta,OLD.started_at,OLD.due_at)
     IS DISTINCT FROM
     ROW(NEW.order_id,NEW.city_id,NEW.resource,NEW.actor_account_id,
         NEW.hero_id,NEW.source_ref,NEW.site_i,NEW.site_j,
         NEW.required_hero_level,NEW.hero_level_at_start,
         NEW.cost_gold,NEW.bonus_delta,NEW.started_at,NEW.due_at)
     OR (OLD.status='completed' AND
        (NEW.status<>'completed' OR OLD.completed_at IS DISTINCT FROM NEW.completed_at))
  THEN
    RAISE EXCEPTION 'LAB mine extension order cannot be modified or replayed'
      USING ERRCODE='23514';
  END IF;
  RETURN NEW;
END;
$order$;
CREATE TRIGGER lab_ext_order_protect_v107
BEFORE UPDATE ON city_lab_mine_extension_orders
FOR EACH ROW EXECUTE FUNCTION protect_lab_extension_order_v107();

COMMENT ON TABLE city_lab_mine_extension_sites IS
  'Explicitly attested LAB-only free site, adjacent to existing mine; not historical layout.';
COMMENT ON TABLE city_lab_mine_extension_orders IS
  'Only one experimental +5% extension per mine. During works production stops; cost/time/operator hero gate not derived from G11.';
