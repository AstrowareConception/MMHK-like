/**
 * Strict constants extracted from checked-in Jactari 4.1.3-MTR data.
 * No inferred Ubisoft MMHK S2 rules. SPDX-License-Identifier: GPL-3.0-or-later.
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const source=fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../../data/Jactari/src/scripts/donnees.general.min.js'),'utf8');
function constant(name){
 const found=new RegExp('\\bvar\\s+'+name+'\\s*=\\s*([0-9.]+(?:\\s*\\/\\s*[0-9.]+)?)\\s*;').exec(source);
 if(!found)throw Error('Missing source constant: '+name);
 const [top,bottom]=found[1].split('/').map(Number);
 const number=bottom===undefined?top:top/bottom;
 if(!Number.isFinite(number))throw Error('Invalid upstream constant: '+name);
 return number;
}
export function jactariReferenceProfile(){
 const version=/_version\s*=\s*\{\s*v:\s*'([^']+)',\s*date:\s*'([^']+)'/.exec(source);
 if(!version)throw Error('Unverifiable upstream version marker');
 return Object.freeze({
  calculatorVersion:version[1],date:version[2],
  weaponAdvantageFactor:constant('_facteur_bonus'),
  lossFactor:constant('_facteur_pertes'),
  pveRetreatThreshold:constant('_seuil_fuite_jce'),
  declaredPvpThreshold:constant('_seuil_fuite_jcj'),
  pvpHonorBonus:constant('_bonus_jcj'),
  source:'data/Jactari/src/scripts/donnees.general.min.js',
  appliesTo:'Jactari calculator only; not certified MMHK S2'
 });
}
