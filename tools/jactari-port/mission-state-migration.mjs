/**
 * V7.0 / schema V12: transactional rebuild of the military missions CHECK.
 * Compatible with SQLite databases created by V7.0 tranche 11.
 * All referring tables retain the SAME military_missions name and primary keys.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
export const MILITARY_MISSION_SCHEMA_VERSION=12;
const NEW_STATUS="'recall_returning'";
export function ensureExplicitRecallMissionStates(db){
 if(!db||typeof db.prepare!=='function'||typeof db.exec!=='function')
  throw new TypeError('Trusted SQLite connection required');
 const version=db.prepare('PRAGMA user_version').get().user_version;
 if(version>MILITARY_MISSION_SCHEMA_VERSION)
  throw new Error('Database has a newer military schema version: '+version);
 const original=db.prepare("SELECT sql FROM sqlite_master WHERE type='table' AND name='military_missions'").get();
 if(!original||typeof original.sql!=='string')
  throw new Error('military_missions table is missing');
 if(original.sql.includes(NEW_STATUS)){
  const invalid=db.prepare("PRAGMA foreign_key_check").all();
  if(invalid.length)throw new Error('Existing database fails foreign key check');
  if(version<MILITARY_MISSION_SCHEMA_VERSION)
   db.exec('PRAGMA user_version = '+MILITARY_MISSION_SCHEMA_VERSION);
  return {version:MILITARY_MISSION_SCHEMA_VERSION,migrated:false};
 }
 if(!original.sql.includes("'traveling'")||
    !original.sql.includes("'cancelled'"))
  throw new Error('Unknown legacy military mission status schema; migration refused');
 // Full connection-exclusive maintenance window is required by the host.
 // There must be NO other active writers or workers during a schema upgrade.
 const invalidBefore=db.prepare('PRAGMA foreign_key_check').all();
 if(invalidBefore.length)throw new Error('Legacy database already has broken foreign keys');
 // Migration must be the very first statement in a writer transaction, with
 // foreign key enforcement temporarily disabled for SQLite's table rebuild.
 db.exec('PRAGMA foreign_keys = OFF');
 try{
  db.exec('BEGIN IMMEDIATE');
  const impossible=db.prepare(`
    SELECT m.mission_id
    FROM military_missions m
    JOIN military_mission_recall_plans p ON p.mission_id=m.mission_id
    WHERE (m.status='cancelled' AND NOT EXISTS (
      SELECT 1 FROM military_mission_events e
      WHERE e.mission_id=m.mission_id
        AND json_extract(e.event_json,'$.phase')='recall_return_completed'
    )) OR m.status NOT IN ('traveling','cancelled')
    LIMIT 1
  `).get();
  if(impossible)throw new Error('Unrecognized legacy recall mission lifecycle: '+impossible.mission_id);
  db.exec(`
    CREATE TABLE military_missions_v12(
     mission_id TEXT PRIMARY KEY,
     actor_player_id TEXT NOT NULL REFERENCES players(player_id),
     attacker_hero_id TEXT NOT NULL REFERENCES heroes(hero_id),
     defender_hero_id TEXT NOT NULL REFERENCES heroes(hero_id),
     status TEXT NOT NULL CHECK(status IN
       ('traveling','arrived','returning','recall_returning','completed','cancelled','recalled')),
     arrival_at_ms INTEGER NOT NULL,
     attacker_revision INTEGER NOT NULL,
     return_at_ms INTEGER,
     battle_command_id TEXT UNIQUE REFERENCES battle_commands(command_id),
     CHECK(attacker_hero_id <> defender_hero_id)
    );
    INSERT INTO military_missions_v12
     (mission_id,actor_player_id,attacker_hero_id,defender_hero_id,
      status,arrival_at_ms,attacker_revision,return_at_ms,battle_command_id)
    SELECT m.mission_id,m.actor_player_id,m.attacker_hero_id,m.defender_hero_id,
     CASE
      WHEN p.mission_id IS NOT NULL AND m.status='traveling' THEN 'recall_returning'
      WHEN p.mission_id IS NOT NULL AND m.status='cancelled' THEN 'recalled'
      ELSE m.status END,
     m.arrival_at_ms,m.attacker_revision,m.return_at_ms,m.battle_command_id
    FROM military_missions m
    LEFT JOIN military_mission_recall_plans p ON p.mission_id=m.mission_id;
    DROP TABLE military_missions;
    ALTER TABLE military_missions_v12 RENAME TO military_missions;
    CREATE UNIQUE INDEX one_active_mission_per_attacker
     ON military_missions(attacker_hero_id)
     WHERE status IN ('traveling','arrived','returning','recall_returning');
  `);
  const integrity=db.prepare('PRAGMA integrity_check').get();
  if(integrity?.integrity_check!=='ok')
   throw new Error('SQLite integrity check failed after mission schema migration');
  const broken=db.prepare('PRAGMA foreign_key_check').all();
  if(broken.length)
   throw new Error('Foreign key references failed after mission schema migration: '+
    JSON.stringify(broken.slice(0,3)));
  db.exec('PRAGMA user_version = '+MILITARY_MISSION_SCHEMA_VERSION);
  db.exec('COMMIT');
 }catch(error){
  db.exec('ROLLBACK');
  throw error;
 }finally{
  db.exec('PRAGMA foreign_keys = ON');
 }
 if(db.prepare('PRAGMA foreign_keys').get().foreign_keys!==1)
  throw new Error('SQLite foreign key enforcement not restored');
 return {version:MILITARY_MISSION_SCHEMA_VERSION,migrated:true};
}
