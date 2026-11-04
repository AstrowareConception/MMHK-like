-- V096: provenance for manually qualified counter-weapon classes.
-- A non-NULL classification must cite a source or an explicit LAB policy.
ALTER TABLE city_unit_profiles
  ADD COLUMN combat_weapon_source_ref text;
ALTER TABLE region_encounters
  ADD COLUMN combat_weapon_source_ref text;

ALTER TABLE city_unit_profiles
  ADD CONSTRAINT city_unit_weapon_provenance_check
  CHECK (
    (combat_weapon_code IS NULL AND combat_weapon_source_ref IS NULL) OR
    (combat_weapon_code IS NOT NULL AND
     combat_weapon_source_ref IS NOT NULL AND
     length(combat_weapon_source_ref) BETWEEN 3 AND 255)
  );

ALTER TABLE region_encounters
  ADD CONSTRAINT region_encounter_weapon_provenance_check
  CHECK (
    (combat_weapon_code IS NULL AND combat_weapon_source_ref IS NULL) OR
    (combat_weapon_code IS NOT NULL AND
     combat_weapon_source_ref IS NOT NULL AND
     length(combat_weapon_source_ref) BETWEEN 3 AND 255)
  );
