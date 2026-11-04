-- V094: allow the corrected P0 regional resource generator v2.
-- Historical v1 compositions are immutable; this migration never rewrites
-- existing world_region_resources, deposits, cities or mining rates.
ALTER TABLE world_region_resources
  DROP CONSTRAINT IF EXISTS world_region_resources_generation_policy_check;

ALTER TABLE world_region_resources
  ADD CONSTRAINT world_region_resources_generation_policy_check
  CHECK (generation_policy IN (
    'regional-composition-v1',
    'regional-composition-v2',
    'existing-city-v1',
    'operator-v1'
  ));
