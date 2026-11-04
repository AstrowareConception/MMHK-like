-- V095: explicit weapon classifications for US-COM-004.
-- NULL is unknown and must NOT be guessed from unit codes or tier.
-- Existing game data and historical profiles are left unchanged.
ALTER TABLE city_unit_profiles
  ADD COLUMN combat_weapon_code text
  CHECK (combat_weapon_code IN ('I','R','C','E'));

ALTER TABLE region_encounters
  ADD COLUMN combat_weapon_code text
  CHECK (combat_weapon_code IN ('I','R','C','E'));

COMMENT ON COLUMN city_unit_profiles.combat_weapon_code IS
  'Operator-qualified Jactari I (infantry), R (ranged), C (cavalry), E (other); NULL unknown.';
COMMENT ON COLUMN region_encounters.combat_weapon_code IS
  'Operator-qualified neutral encounter weapon; NULL unknown, never infer automatically.';
