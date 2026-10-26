/**
 * Read-only inventory of recovered Ubisoft client JS.
 * Never eval the game's scripts. Extract context around known terms only.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const files=[
 'data/assets-recovered/ubisoft-archive/1.5.0.39-4-MTR/js/prod.js',
 'data/assets-recovered/ubisoft-archive/4.1.3-MTR/js/prod.js'
];
const keywords=[
 'legendary','heredit','heritage','revelation','revelation_de_caracteristiques',
 'sovereign','legwarrior','heroClass','HeroClass','heroSkills',
 'career','skills','classId','experience','unlock','levelRequirement',
 'ascension','perk','advanced','leader','heroClassSkill','heroClassSkillEntityTagName',
 'playerHeredityAbilityList','heroSkillList','learntClasses',
 'LEGENDARY_WARRIOR','LEGENDARY_WIZARD','SHEOGH_SOVEREIGN',
 'CHARACTERISTICS_ILLUMINATION','rankingPath','classRequirement'
];
const context=(source,index,n=76)=>source.slice(Math.max(0,index-n),Math.min(source.length,index+n))
 .replace(/[\r\n\t]/g,' ').slice(0,170);
export function scanOriginalUbisoftClient(){
 return files.map(file=>{
  const abs=path.join(root,file),code=fs.readFileSync(abs,'utf8');
  const matches=Object.fromEntries([...new Set(keywords)].map(key=>{
   const re=new RegExp(key,'gi'),offsets=[...code.matchAll(re)].map(m=>m.index);
   return [key,{count:offsets.length,
    samples:offsets.slice(0,3).map(i=>({at:i,context:context(code,i)}))}];
  }));
  return {file,bytes:Buffer.byteLength(code),head:context(code,0,100),
   keywordHits:matches,executed:false,versionHint:file.includes('4.1.3')?'4.1.3-MTR':'1.5.0.39-4-MTR'};
 });
}
