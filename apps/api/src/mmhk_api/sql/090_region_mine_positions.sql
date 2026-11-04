-- Regional mine placements, experimental cartographic layout v1.
-- Resource identity remains authoritative in city_mines; these are positions
-- only. Every owned city may have a different stable configuration.
-- The historical 5x5 mine positions are not certified.
CREATE TABLE city_mine_positions (
  city_id uuid NOT NULL,
  resource text NOT NULL,
  i smallint NOT NULL CHECK (i BETWEEN 0 AND 4),
  j smallint NOT NULL CHECK (j BETWEEN 0 AND 4),
  layout_policy text NOT NULL DEFAULT 'regional-layout-v1',
  PRIMARY KEY (city_id, resource),
  UNIQUE (city_id, i, j),
  FOREIGN KEY (city_id, resource) REFERENCES city_mines(city_id, resource)
    ON DELETE CASCADE,
  CHECK (i <> 2 OR j <> 2)
);

-- A city has at most seven mines, so 24 free locations always suffice.
-- Serialize concurrent placements for a city and take a stable per-mine
-- permutation of available locations. An insert never reshuffles old mines.
CREATE FUNCTION place_city_mine_v1() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  location record;
BEGIN
  PERFORM 1 FROM cities WHERE city_id=NEW.city_id FOR UPDATE;
  SELECT candidate.i, candidate.j INTO location
    FROM generate_series(0, 4) AS gx(i)
    CROSS JOIN generate_series(0, 4) AS gy(j)
    CROSS JOIN LATERAL (SELECT gx.i AS i, gy.j AS j) AS candidate
   WHERE (candidate.i <> 2 OR candidate.j <> 2)
     AND NOT EXISTS (
       SELECT 1 FROM city_mine_positions p
       WHERE p.city_id=NEW.city_id
         AND p.i=candidate.i AND p.j=candidate.j
     )
   ORDER BY md5(NEW.city_id::text || ':' || NEW.resource || ':' ||
                candidate.i::text || ':' || candidate.j::text),
            candidate.i, candidate.j
   LIMIT 1;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'No region tile available for mine in city %', NEW.city_id;
  END IF;
  INSERT INTO city_mine_positions(city_id,resource,i,j)
  VALUES (NEW.city_id,NEW.resource,location.i,location.j);
  RETURN NULL;
END;
$$;

CREATE TRIGGER city_mines_place_position
AFTER INSERT ON city_mines
FOR EACH ROW EXECUTE FUNCTION place_city_mine_v1();

-- Existing cities are migrated without touching their mining profiles.
INSERT INTO city_mine_positions(city_id,resource,i,j)
SELECT m.city_id,m.resource,
       ((ranked.position / 5)::integer)::smallint,
       ((ranked.position % 5)::integer)::smallint
FROM (
  SELECT m.city_id,m.resource,
         row_number() OVER (PARTITION BY m.city_id ORDER BY m.resource) - 1 AS mine_rank
  FROM city_mines m
) m
CROSS JOIN LATERAL (
  SELECT positions.position
  FROM (
    SELECT (gx.i*5+gy.j) AS position,
           row_number() OVER (
             ORDER BY md5(m.city_id::text || ':' || (gx.i*5+gy.j)::text)
           ) - 1 AS available_rank
    FROM generate_series(0,4) gx(i)
    CROSS JOIN generate_series(0,4) gy(j)
    WHERE (gx.i<>2 OR gy.j<>2)
  ) positions
  WHERE positions.available_rank=m.mine_rank
) ranked;
