-- V091: authoritative experimental composition of world regions.
-- This does NOT alter existing city_mines or colonial terrain policies.
-- Do not create 100000^2 regions eagerly: populate in bounded batches.
CREATE TABLE world_region_resources (
  world_id text NOT NULL REFERENCES worlds(world_id) ON DELETE CASCADE,
  x integer NOT NULL CHECK (x >= 1),
  y integer NOT NULL CHECK (y >= 1),
  resources text[] NOT NULL,
  generation_policy text NOT NULL
    CHECK (generation_policy IN ('regional-composition-v1','existing-city-v1','operator-v1')),
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 3 AND 255),
  generated_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (world_id,x,y),
  CHECK (cardinality(resources) = 4),
  CHECK (array_position(resources,NULL) IS NULL),
  CHECK (resources <@ ARRAY['gold','wood','ore','crystal','gems','sulfur','mercury']::text[])
);

-- Explicit discoveries are distinct from political influence and from a
-- membership: joining a world does not reveal all regional resources.
CREATE TABLE world_region_resource_discoveries (
  world_id text NOT NULL,
  x integer NOT NULL CHECK (x>=1),
  y integer NOT NULL CHECK (y>=1),
  viewer_account_id uuid NOT NULL,
  revealed_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  PRIMARY KEY (world_id,x,y,viewer_account_id),
  FOREIGN KEY (world_id,x,y) REFERENCES world_region_resources(world_id,x,y)
    ON DELETE CASCADE,
  FOREIGN KEY (world_id,viewer_account_id)
    REFERENCES world_memberships(world_id,account_id) ON DELETE CASCADE
);

-- Legacy cities keep the exact mining resources already purchased/seeded.
-- Four distinct city mines are a complete composition; otherwise the legacy
-- region is left unprovisioned for an explicit administrative decision.
INSERT INTO world_region_resources(world_id,x,y,resources,generation_policy,source_ref)
SELECT c.world_id,c.x,c.y,array_agg(m.resource ORDER BY m.resource),
       'existing-city-v1','existing-city-mines:' || c.city_id::text
FROM cities c JOIN city_mines m ON m.city_id=c.city_id
GROUP BY c.city_id,c.world_id,c.x,c.y
HAVING count(*)=4
ON CONFLICT (world_id,x,y) DO NOTHING;

-- Existing owners know their own region; never reveal a foreign region here.
INSERT INTO world_region_resource_discoveries(world_id,x,y,viewer_account_id)
SELECT c.world_id,c.x,c.y,c.owner_account_id
FROM cities c JOIN world_region_resources r
  ON r.world_id=c.world_id AND r.x=c.x AND r.y=c.y
ON CONFLICT DO NOTHING;

-- Subsequent city creation or ownership changes do not silently override
-- regional composition. Write access remains operator-only.
