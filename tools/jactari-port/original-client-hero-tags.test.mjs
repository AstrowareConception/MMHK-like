import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {deriveJactariLegendaryTalents} from './hero-legendary.mjs';
import {originalClientLegendaryTagMap,projectOriginalHeroLegendarySkills,
 upstreamAddonPath,originalClientHereditaryTagMap,projectOriginalPlayerHeredity} from './original-client-hero-tags.mjs';

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

test('2013 native heredity bridge maps exact server CHARACTERISTICS_ILLUMINATION to source-backed skill',()=>{
 const map=originalClientHereditaryTagMap();
 assert.equal(Object.keys(map).length,9);
 assert.equal(map.CHARACTERISTICS_ILLUMINATION,'revelation_de_caracteristiques');
 assert.equal(Object.values(map).includes('revelation_de_caracteristiques_15'),false);
 assert.equal(Object.values(map).includes('revelation_de_caracteristiques_30'),false);
 for(const name of Object.values(map))
  assert.ok(tables.hereditary[name],'Native Jactari heredity target not in archived catalog: '+name);
 const payload={playerHeredityAbilityList:[
  {heredityAbilityEntity:{tagName:'CHARACTERISTICS_ILLUMINATION',rankingPath:'H'},level:7},
  {heredityAbilityEntity:{tagName:'TOUGHER_HERO',rankingPath:'R'},level:3}
 ]};
 const before=structuredClone(payload);
 const x=projectOriginalPlayerHeredity(payload);
 assert.deepEqual(x.heritage,{revelation_de_caracteristiques:7,heros_superieur:3});
 assert.equal(x.authoritative,false);
 assert.deepEqual(payload,before);
});
test('unknown native heredity tags do not silently become fictitious _15/_30 skills',()=>{
 const x=projectOriginalPlayerHeredity({playerHeredityAbilityList:[
  {heredityAbilityEntity:{tagName:'CHARACTERISTICS_ILLUMINATION_15'},level:2}
 ]});
 assert.deepEqual(x.heritage,{});
 assert.deepEqual(x.unmappedTags,['CHARACTERISTICS_ILLUMINATION_15']);
 assert.throws(()=>projectOriginalPlayerHeredity({playerHeredityAbilityList:[
  {heredityAbilityEntity:{tagName:'TOUGHER_HERO'},level:1},
  {heredityAbilityEntity:{tagName:'TOUGHER_HERO'},level:2}
 ]}),/Duplicate original hereditary/);
 assert.throws(()=>projectOriginalPlayerHeredity({playerHeredityAbilityList:[
  {heredityAbilityEntity:{tagName:'TOUGHER_HERO'},level:'9'}
 ]}),/Invalid archived player heredity/);
});
