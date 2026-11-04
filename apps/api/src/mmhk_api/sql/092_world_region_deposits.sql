-- V092: four physical deposits per persistently registered world region.
-- A deposit is a natural resource slot, not an operational mine.
-- Two slots may hold the same resource. Position is unique per region.
CREATE TABLE world_region_deposits (
    world_id text NOT NULL,
    x integer NOT NULL CHECK (x >= 1),
    y integer NOT NULL CHECK (y >= 1),
    slot smallint NOT NULL CHECK (slot BETWEEN 0 AND 3),
    resource text NOT NULL CHECK (
      resource IN ('gold','wood','ore','crystal','gems','sulfur','mercury')
    ),
    i smallint NOT NULL CHECK (i BETWEEN 0 AND 4),
    j smallint NOT NULL CHECK (j BETWEEN 0 AND 4),
    layout_policy text NOT NULL DEFAULT 'deposits-layout-v1',
    PRIMARY KEY (world_id,x,y,slot),
    UNIQUE (world_id,x,y,i,j),
    CHECK (i <> 2 OR j <> 2),
    FOREIGN KEY (world_id,x,y)
      REFERENCES world_region_resources(world_id,x,y) ON DELETE CASCADE
);

-- Deposits become visible through world_region_resource_discoveries,
-- not through membership or unrestricted direct table access.
