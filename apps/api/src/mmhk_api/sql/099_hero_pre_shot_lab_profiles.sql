-- V099: explicit, optional laboratory abilities for pre-duel shots.
-- No ability, magnitude, unit lineage or hero trait is inferred.
-- A qualified basic hero profile is required to configure these skills.
CREATE TABLE hero_pre_shot_lab_profiles (
  hero_id uuid PRIMARY KEY
    REFERENCES hero_basic_combat_profiles(hero_id) ON DELETE CASCADE,
  barrage_percent numeric(8,4) NOT NULL DEFAULT 0
    CHECK (barrage_percent BETWEEN 0 AND 1000),
  ballista_percent numeric(8,4) NOT NULL DEFAULT 0
    CHECK (ballista_percent BETWEEN 0 AND 1000),
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 3 AND 255),
  policy_id text NOT NULL DEFAULT 'jactari-pre-shots-lab-v1'
    CHECK (policy_id='jactari-pre-shots-lab-v1'),
  qualified_at timestamptz NOT NULL DEFAULT clock_timestamp(),
  CHECK (barrage_percent > 0 OR ballista_percent > 0)
);
