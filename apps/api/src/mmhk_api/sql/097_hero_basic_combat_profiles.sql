-- V097: optional, operator-qualified basic hero combat attributes.
-- Do not derive hero combat statistics from level, archetype or faction.
-- NULL/absent record means unknown; all historical heroes remain untouched.
CREATE TABLE hero_basic_combat_profiles (
  hero_id uuid PRIMARY KEY REFERENCES city_heroes(hero_id) ON DELETE CASCADE,
  attack_points integer NOT NULL CHECK (attack_points BETWEEN 0 AND 1000),
  defense_points integer NOT NULL CHECK (defense_points BETWEEN 0 AND 1000),
  attack_per_unit numeric(16,4) NOT NULL DEFAULT 0
    CHECK (attack_per_unit BETWEEN 0 AND 100000),
  defense_per_unit numeric(16,4) NOT NULL DEFAULT 0
    CHECK (defense_per_unit BETWEEN 0 AND 100000),
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 3 AND 255),
  policy_id text NOT NULL DEFAULT 'jactari-hero-basic-attributes-v1'
    CHECK (policy_id='jactari-hero-basic-attributes-v1'),
  qualified_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
