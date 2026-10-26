/**
 * Trace which historic heritage branches are executable with the checked-in
 * Jactari v4.1.3-MTR skill catalog. This is an AUDIT, not inferred mechanics.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getJactariHeroTables} from './hero-source-tables.mjs';

const directory=path.resolve(path.dirname(fileURLToPath(import.meta.url)),
 '../../data/Jactari/src/scripts');
const source=fs.readFileSync(path.join(directory,'combat.min.js'),'utf8');
const names=['heros_superieur','revelation_de_caracteristiques',
 'revelation_de_caracteristiques_15','revelation_de_caracteristiques_30'];

export function auditJactariCombatHeritage(tables=getJactariHeroTables()){
 return names.map(name=>{
  const defined=Object.hasOwn(tables.hereditary,name);
  const references=[...source.matchAll(new RegExp(
   '(?<![A-Za-z_])'+name+'(?![A-Za-z_])','g'))].length;
  return {name,definedInArchivedTable:defined,
   referencedInArchivedCombat:references>0,
   referenceCount:references,
   combatUsable:defined&&references>0,
   status:!defined&&references>0?'unresolved-vendor-source-mismatch':
    defined&&references>0?'source-backed':'not-referenced',
   sourcePaths:[
    'data/Jactari/src/scripts/donnees.general.min.js',
    'data/Jactari/src/scripts/combat.min.js'
   ]};
 });
}

/**
 * Do not ignore unknown positive ranks while claiming historical fidelity.
 * Source-backed fields are validated by hero-page-snapshot; this guard
 * distinguishes missing vendor data for _15/_30 from an ordinary typo.
 */
export function assertDocumentedJactariCombatHeritage(heritage={}){
 if(!heritage||typeof heritage!=='object'||Array.isArray(heritage))
  throw new TypeError('Hero heritage choices must be an object');
 const catalog=auditJactariCombatHeritage();
 for(const missing of catalog.filter(x=>x.status==='unresolved-vendor-source-mismatch')){
  if(Object.hasOwn(heritage,missing.name)&&heritage[missing.name]!==0)
   throw new RangeError('Unresolved original Jactari heritage variant: '+
    missing.name+' referenced in combat source but not defined in archived tables');
 }
 return true;
}
