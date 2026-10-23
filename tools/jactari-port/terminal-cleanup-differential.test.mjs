import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import vm from 'node:vm';
import {projectTerminalTemporaryRevival} from './terminal-cleanup.mjs';

const dir=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.resolve(dir,'../../data/Jactari/src/scripts/combat.min.js'),'utf8');
const encounter=source.slice(source.indexOf('function simulation_rencontre('));
function originalTerminal(side){
 const prefix=side==='attacker'?'a':'d',action=side==='attacker'?'attaque':'defense';
 const condition=`if(rez_${prefix}_peloton${prefix==='a'?'===':'=='}peloton_${action}&&rez_${prefix}=='tmp')`;
 const start=encounter.indexOf(condition);
 if(start<0)throw new Error('Original terminal cleanup branch missing: '+side);
 const end=encounter.indexOf('var html=',start);
 if(end<=start)throw new Error('Original terminal cleanup end missing');
 const snippet=encounter.slice(start,end);
 return ctx=>vm.runInNewContext(`with(ctx){${snippet};return pelotons_${side==='attacker'?'attaquant':'defenseur'}[2].nombre_restant}`,{ctx},{timeout:1000});
}
for(const side of ['attacker','defender']){
 test('500 final cleanup comparisons against original Jactari, '+side,()=>{
  const legacy=originalTerminal(side);let cases=0;
  for(let remaining=1;remaining<=100;remaining++)for(const revived of [0,1,5,30,120]){
   const prefix=side==='attacker'?'a':'d',action=side==='attacker'?'attaque':'defense';
   const ctx={tour:2};
   ctx[`rez_${prefix}_peloton`]=2;
   ctx[`peloton_${action}`]=2;
   ctx[`rez_${prefix}`]='tmp';
   ctx[`rez_${prefix}_nombre`]=revived;
   ctx[`pelotons_${side==='attacker'?'attaquant':'defenseur'}`]={2:{nombre_restant:remaining}};
   const expected=legacy(ctx);
   const army=Array(7).fill(null);army[0]={remaining,dispersed:false};
   const actual=projectTerminalTemporaryRevival({
    status:side,attacker:side==='attacker'?army:Array(7).fill(null),
    defender:side==='defender'?army:Array(7).fill(null),
    lastRevival:{mode:'tmp',side,slot:1,revived}
   });
   assert.equal(actual.displayed[side][0],expected,`remaining=${remaining},revived=${revived}`);
   cases++;
  }
  assert.equal(cases,500);
 });
}
