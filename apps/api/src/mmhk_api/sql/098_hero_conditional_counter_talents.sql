-- V098: one explicitly qualified experimental conditional counter talent per hero.
-- The archived sources establish the conditional nature, not the magnitude.
-- No automatic migration of hero skills or faction assumptions.
CREATE TABLE hero_conditional_counter_talents (
  hero_id uuid PRIMARY KEY REFERENCES city_heroes(hero_id) ON DELETE CASCADE,
  additional_attack_fraction numeric(6,4) NOT NULL
    CHECK (additional_attack_fraction BETWEEN 0 AND 1),
  source_ref text NOT NULL CHECK (length(source_ref) BETWEEN 3 AND 255),
  policy_id text NOT NULL DEFAULT 'jactari-conditional-counter-talent-lab-v1'
    CHECK (policy_id='jactari-conditional-counter-talent-lab-v1'),
  qualified_at timestamptz NOT NULL DEFAULT clock_timestamp()
);
