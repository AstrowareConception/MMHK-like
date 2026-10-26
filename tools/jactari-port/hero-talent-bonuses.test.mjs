import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {getJactariHeroTables} from './hero-source-tables.mjs';
import {deriveJactariTalentBonuses} from './hero-talent-bonuses.mjs';
const folder=path.resolve(path.dirname(fileURLToPath(import.meta.url)),
 '../../data/Jactari/src/scripts');
const code=fs.readFileSync(path.join(folder,'combat.min.js'),'utf8');
const opening='for(var c in _talents)for(var t in _talents[c]){';
const at=code.indexOf(opening);
if(at<0)throw Error('Missing original talent enumeration');
const b=code.indexOf('{',at);let depth=0,end=-1;
for(let i=b;i<code.length;i++){
 if(code[i]==='{')depth++;
 else if(code[i]==='}'&&--depth===0){end=i+1;break;}
}
if(end<0)throw Error('Unclosed original talent enumeration');
const ORIGINAL=code.slice(at,end);
const data=fs.readFileSync(path.join(folder,'donnees.heros.min.js'),'utf8');
const tables=getJactariHeroTables();
const eligible=[];
for(let ci=0;ci<tables.talents.length;ci++){
 for(let ti=0;ti<tables.talents[ci].length;ti++){
  const t=tables.talents[ci][ti];
  if(t?.nom_machine&&t.v?.length>1&&t.v.every(Number.isFinite))
   eligible.push({careerId:ci,talentIndex:ti,name:t.nom_machine,max:t.v.length});
 }
}
function oracle(selections){
 const ranks=Object.fromEntries(selections.map(({careerId,talentIndex,rank})=>
   [tables.talents[careerId][talentIndex].nom_machine,rank]));
 const ctx={liste_heros:{0:{}},heros:0,$:selector=>({
   val:()=>ranks[selector.slice(1,selector.lastIndexOf('-'))]??0
 })};
 // Combat original uses '-attaquant' suffix for the first camp.
 ctx.camp='attaquant';
 vm.createContext(ctx,{name:'Jactari-original-talent-fields'});
 vm.runInContext(data,ctx,{timeout:2000});
 vm.runInContext(ORIGINAL,ctx,{timeout:1000});
 return JSON.parse(JSON.stringify(ctx.liste_heros[0]));
}
test('all named talent rank-zero source values match original combat parser',()=>{
 const raw=oracle([]);
 const got=deriveJactariTalentBonuses();
 for(const [key,value] of Object.entries(got.bonuses))assert.equal(value,raw[key],key);
 for(const [key,value] of Object.entries(got.levels))assert.equal(value,raw[key],key);
});
test('150 real career/talent rank selections compared with original function',()=>{
 assert.ok(eligible.length>20,'Historical talent definitions are missing');
 for(let i=0;i<150;i++){
  const x=eligible[i%eligible.length],rank=1+(i%(x.max-1));
  const selections=[{careerId:x.careerId,talentIndex:x.talentIndex,rank}];
  const raw=oracle(selections),got=deriveJactariTalentBonuses(selections);
  for(const [key,value] of Object.entries(got.bonuses))
   assert.equal(value,raw[key],i+' '+key);
  for(const [key,value] of Object.entries(got.levels))
   assert.equal(value,raw[key],i+' '+key);
 }
});
test('unknown talents, invalid ranks and forged bonus fields fail closed',()=>{
 assert.throws(()=>deriveJactariTalentBonuses([{careerId:999,talentIndex:1,rank:1}]),/Unknown/);
 assert.throws(()=>deriveJactariTalentBonuses([{careerId:0,talentIndex:0,rank:99}]),/Unknown/);
 assert.throws(()=>deriveJactariTalentBonuses([{careerId:0,talentIndex:0,rank:1,
  bonus_tacticien:99}]),/Only trusted/);
});
