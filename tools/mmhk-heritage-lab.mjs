#!/usr/bin/env node
/**
 * Heritage: transparent 1000-point build LAB, not Ubisoft's historic costs.
 * node tools/mmhk-heritage-lab.mjs --build '{"resource_yield":3,"attack":3}'
 */
import {readFileSync} from 'node:fs';
import {resolve,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
const base=resolve(dirname(fileURLToPath(import.meta.url)),'..');
export const config=JSON.parse(readFileSync(resolve(base,'data/game-design/heritage-balance-lab.json'),'utf8'));
const lookup=new Map(config.groups.flatMap(group=>group.skills.map(skill=>[skill.id,skill])));
export function buildCost(build){
 let total=0,errors=[],effects={};
 for(const [key,rank] of Object.entries(build)){
  const skill=lookup.get(key);
  if(!skill){errors.push('unknown skill '+key);continue;}
  if(!Number.isInteger(rank)||rank<0||rank>config.skill_ranks){errors.push('bad rank '+key);continue;}
  total+=config.rank_incremental_costs.slice(0,rank).reduce((a,b)=>a+b,0);
  effects[key]=Number((rank*skill.per_rank_percent).toFixed(6));
 }
 if(total>config.budget)errors.push('budget exceeded');
 return {valid:errors.length===0,total,unspent:config.budget-total,effects,errors};
}
export function startingWorldBuild(allocation){
 const result=buildCost(allocation);
 if(!result.valid)throw Error(result.errors.join('; '));
 return {world_points_total:config.budget,world_points_used:result.total,world_points_unspent:result.unspent,allocation:structuredClone(allocation),carry_from_other_worlds:0};
}
if(process.argv[1]&&process.argv[1].endsWith('mmhk-heritage-lab.mjs')){
 const idx=process.argv.indexOf('--build'),raw=idx<0?'{}':process.argv[idx+1];
 console.log(JSON.stringify(buildCost(JSON.parse(raw)),null,2));
}
