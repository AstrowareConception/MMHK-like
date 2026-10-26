import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {deriveJactariHeroPageSnapshot} from './hero-page-snapshot.mjs';
const file=path.resolve(path.dirname(fileURLToPath(import.meta.url)),
 '../../data/Jactari/src/scripts/heros.min.js');
const source=fs.readFileSync(file,'utf8');
function fragment(name){
 const start=source.indexOf('function '+name+'('),open=source.indexOf('{',start);
 if(start<0)throw Error('Missing historic limit function');
 let depth=0;
 for(let i=open;i<source.length;i++){
  if(source[i]==='{')depth++;
  else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
 }
 throw Error('Historical function unclosed');
}
const funcs=['change_respec','change_tenancier'].map(fragment).join('\n');
function original(level,field,value){
 const ctx={
  heros:{niveau:level,respecialisations:0,bonus_tenancier:0},
  bouton_liens_permanents:()=>{},maj_comp:()=>{}
 };
 vm.createContext(ctx);
 vm.runInContext(funcs,ctx,{timeout:1000});
 ctx.value=value;
 const f=field==='respecializations'?'change_respec':'change_tenancier';
 const ok=vm.runInContext(f+'(value)',ctx,{timeout:1000});
 return {accepted:ok!==false,
  result:field==='respecializations'?ctx.heros.respecialisations:ctx.heros.bonus_tenancier};
}
test('original change_respec limits tested at every level up to 40',()=>{
 for(let level=1;level<=40;level++)
  for(let amount=0;amount<=21;amount++){
   const legacy=original(level,'respecializations',amount);
   const request={faction:1,archetype:0,level,respecializations:amount};
   const port=()=>deriveJactariHeroPageSnapshot(request);
   if(legacy.accepted)assert.doesNotThrow(port,'level '+level+' respec '+amount);
   else assert.throws(port,/respecialization cap/,'level '+level+' respec '+amount);
  }
});
test('original stewardship interval 0..3 confirmed and illegal bonuses rejected',()=>{
 for(const value of [0,1,2,3,4,5]){
  const legacy=original(40,'stewardBonus',value);
  const port=()=>deriveJactariHeroPageSnapshot({
   faction:1,archetype:0,level:40,stewardBonus:value
  });
  if(legacy.accepted)assert.doesNotThrow(port);
  else assert.throws(port,/steward bonus/);
 }
});
