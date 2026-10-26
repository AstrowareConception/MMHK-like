/**
 * Read the checked-in Jactari data tables as reviewed JavaScript, NOT
 * game-client input. Snapshots are JSON-copied out of the isolated VM.
 * SPDX-License-Identifier: GPL-3.0-or-later.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
const base=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../data/Jactari/src/scripts');
const scripts=['donnees.general.min.js','donnees.heros.min.js','donnees.artefacts.min.js'];
let cached;
export function getJactariHeroTables(){
 if(!cached){
   const context={};vm.createContext(context,{name:'vendored-jactari-static-tables'});
   for(const name of scripts){
     const source=fs.readFileSync(path.join(base,name),'utf8');
     vm.runInContext(source,context,{timeout:5000,filename:name});
   }
   cached=JSON.parse(JSON.stringify({
     factions:context._factions,
     learningCosts:context._apprentissage,
     archetypes:context._archetypes,
     levels:context._niveaux,
     hereditary:context._competences_hereditaires,
     wayRanking:context._classement_voies,
     wayMultiplier:context._multiplicateur_voie,
     artifacts:context._artefacts,
     artifactEffects:context._effets,
     combatArtifactEffects:context._effets_combat,
     magicArtifactCategories:context._types_effets_magie,
     equipmentSlots:context._slots,
     careers:context._carrieres,
     talents:context._talents,
     sources:scripts
   }));
 }
 return structuredClone(cached);
}
