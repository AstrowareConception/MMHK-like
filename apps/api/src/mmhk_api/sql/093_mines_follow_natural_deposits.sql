-- V093: when creating a mine in an already mapped region, prefer the
-- matching natural deposit tile. Preserve existing mine coordinates.
-- No change to stocks, mining rates, or city ownership.
CREATE OR REPLACE FUNCTION place_city_mine_v1() RETURNS trigger
LANGUAGE plpgsql AS $$
DECLARE
  location record;
BEGIN
  PERFORM 1 FROM cities WHERE city_id=NEW.city_id FOR UPDATE;

  SELECT d.i,d.j INTO location
    FROM cities c
    JOIN world_region_deposits d
      ON d.world_id=c.world_id AND d.x=c.x AND d.y=c.y
    WHERE c.city_id=NEW.city_id AND d.resource=NEW.resource
      AND NOT EXISTS (
        SELECT 1 FROM city_mine_positions p
        WHERE p.city_id=NEW.city_id AND p.i=d.i AND p.j=d.j
      )
    ORDER BY d.slot LIMIT 1;

  IF NOT FOUND THEN
    SELECT gx.i,gy.j INTO location
      FROM generate_series(0,4) AS gx(i)
      CROSS JOIN generate_series(0,4) AS gy(j)
      WHERE (gx.i<>2 OR gy.j<>2)
        AND NOT EXISTS (
          SELECT 1 FROM city_mine_positions p
          WHERE p.city_id=NEW.city_id AND p.i=gx.i AND p.j=gy.j
        )
      ORDER BY md5(NEW.city_id::text || ':' || NEW.resource || ':' ||
                   gx.i::text || ':' || gy.j::text),
               gx.i,gy.j
      LIMIT 1;
  END IF;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'No region tile available for mine in city %', NEW.city_id;
  END IF;
  INSERT INTO city_mine_positions(city_id,resource,i,j)
  VALUES(NEW.city_id,NEW.resource,location.i,location.j);
  RETURN NULL;
END;
$$;
