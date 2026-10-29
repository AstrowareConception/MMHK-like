-- V020 · Site terrain qualification independent from influence ownership.
-- A site can be operator-prequalified before any account controls its tile.
-- Its seven storage capacities, 3–4 mine types and production rates are
-- evidence/explicit laboratory inputs, never a guessed S2 map generator.
--
-- V018 forced a FOREIGN KEY from site coordinates to manually recorded
-- influence. That made genuinely dynamic territorial conquest unusable:
-- future qualified terrain could not exist until manual influence was forged.
-- Remove only that dependency; all founding authorization remains server-side.
ALTER TABLE colonization_site_profiles
  DROP CONSTRAINT colonization_site_profiles_world_id_x_y_fkey;

ALTER TABLE colonization_site_profiles
  ADD COLUMN qualification_mode text NOT NULL DEFAULT 'manual_influence'
    CHECK(qualification_mode IN ('manual_influence','operator_terrain'));

CREATE INDEX colony_operator_terrain_world
  ON colonization_site_profiles(world_id,x,y)
  WHERE enabled AND qualification_mode='operator_terrain';

-- Security invariant:
-- A qualification row NEVER grants territory. The active dynamic revision,
-- or legacy operator-proven manual influence when no dynamic policy is active,
-- is checked separately at quote, dispatch and worker-arrival time.
-- Source provenance remains immutable; changes require an explicit
-- new version and review, not mutation of an existing regional resource roll.
