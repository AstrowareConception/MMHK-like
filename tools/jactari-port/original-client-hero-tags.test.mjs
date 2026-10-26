import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {deriveJactariLegendaryTalents} from './hero-legendary.mjs';
import {originalClientLegendaryTagMap,projectOriginalHeroLegendarySkills,
 upstreamAddonPath} from './original-client-hero-tags.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const original=fs.readFileSync(path.join(root,upstreamAddonPath),'utf8');
const tables=getJactariHeroTables();
const start=original.indexOf('prepare_talent : function(');
const end=original.indexOf('prepare_heros : function(',start);
if(start<0||end<start)throw new Error('Original MMHK-Plus translator changed');
const objectFragment=original.slice(start,end).trim().replace(/,\s*$/,'');
function nativeMap(tag,level){
 const ctx={skill:{heroClassSkillEntityTagName:tag,level},
  dest:{expert:[0,0,0,0],instinct:[0,0,0,0]}};
 vm.createContext(ctx,{name:'unmodified original MMHK-Plus prepare_talent'});
 vm.runInContext('var mapper={'+objectFragment+'};mapper.prepare_talent(dest,skill)',ctx,{timeout:1500});
 return JSON.parse(JSON.stringify(ctx.dest));
}
test('all 24 legendary game skill tags match the unmodified MMHK-Plus mapper at ranks 0-3',()=>{
 const mapping=originalClientLegendaryTagMap(),entries=Object.entries(mapping);
 assert.equal(entries.length,24);
 assert.equal(new Set(entries.map(([,v])=>v.name)).size,24);
 let checked=0;
 for(const [tag,row] of entries)for(const rank of [0,1,2,3]){
  const expected=nativeMap(tag,rank);
  assert.equal(expected[row.name],rank,tag+' rank '+rank);
  const candidate=projectOriginalHeroLegendarySkills({heroSkillList:[
   {heroClassSkillEntityTagName:tag,level:rank}
  ]});
  assert.equal(candidate.observedRanks[row.name],rank);
  if(rank>0){
   assert.deepEqual(candidate.selections,[{careerId:row.careerId,
    talentIndex:row.talentIndex,rank}]);
   assert.equal(deriveJactariLegendaryTalents({
    selections:candidate.selections,policy:'server-entitlement',
    entitlements:candidate.observedRanks
   }).bonuses['bonus_'+row.name],
    tables.talents[row.careerId][row.talentIndex].v[rank]);
  }
  checked++;
 }
 assert.equal(checked,96);
});
test('real client record shapes do not create fictional extra legend bonuses',()=>{
 const mapping=originalClientLegendaryTagMap();
 const items=Object.entries(mapping).slice(0,4).map(([key],i)=>
  ({heroClassSkillEntityTagName:key,level:(i%3)+1}));
 items.push({heroClassSkillEntityTagName:'INFANTRY_ATTACK_POWER_INCREASE',level:2});
 const result=projectOriginalHeroLegendarySkills({heroSkillList:items});
 assert.equal(result.selections.length,4);
 assert.deepEqual(result.ignoredNonLegendaryTags,['INFANTRY_ATTACK_POWER_INCREASE']);
 assert.equal(result.authoritative,false);
 assert.deepEqual(projectOriginalHeroLegendarySkills({heroSkillList:[]}).selections,[]);
});
test('malformed, duplicate and forged game skill ranks fail closed',()=>{
 const first=Object.keys(originalClientLegendaryTagMap())[0];
 const make=(level)=>({heroClassSkillEntityTagName:first,level});
 assert.throws(()=>projectOriginalHeroLegendarySkills({
  heroSkillList:[make(4)]}),/rank outside original catalog/);
 assert.throws(()=>projectOriginalHeroLegendarySkills({
  heroSkillList:[make(1),make(2)]}),/Duplicate game legendary/);
 assert.throws(()=>projectOriginalHeroLegendarySkills({
  heroSkillList:[{heroClassSkillEntityTagName:first,level:2.1}]}),/Invalid original/);
 assert.throws(()=>projectOriginalHeroLegendarySkills({
  heroSkillList:[{heroClassSkillEntityTagName:first,level:-1}]}),/Invalid original/);
 assert.throws(()=>projectOriginalHeroLegendarySkills({
  heroSkillList:[{heroClassSkillEntityTagName:first}]}),/Invalid original/);
});
