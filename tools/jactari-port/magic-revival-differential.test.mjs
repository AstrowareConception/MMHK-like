import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {resolvePostDuelRevival} from './magic-revival.mjs';

const currentDir=path.dirname(fileURLToPath(import.meta.url));
const legacyPath=process.env.JACTARI_SOURCE_PATH ??
  path.resolve(currentDir,'../../data/Jactari/src/scripts/combat.min.js');
const source=fs.readFileSync(legacyPath,'utf8');
const encounter=source.indexOf('function simulation_rencontre(');
if(encounter<0)throw new Error('Original Jactari encounter source missing');
const start=source.indexOf("if(rez_a=='tmp'){",encounter);
const endMarker="if(rez_a=='def')pelotons_attaquant[peloton_attaque].nombre_pertes-=rez_a_nombre;";
const end=source.indexOf(endMarker,start);
if(start<0||end<start)throw new Error('Jactari resurrection reference snippet changed upstream');
const original=source.slice(start,end+endMarker.length);

function reference({remaining,losses,roundStart,mode,percent}){
 const troops={nombre_restant:remaining,nombre_debut_tour:roundStart,nombre_pertes:Math.max(0,losses)};
 const sandbox={rez_a:mode,peloton_attaque:2,pelotons_attaquant:{2:troops},
  resultat:{pertes_attaquant:losses},resultat_sorts:{a:{puissance:percent}}};
 vm.runInNewContext(original,sandbox,{timeout:1000});
 return {revived:sandbox.rez_a_nombre,remaining:troops.nombre_restant,
  recordedLossAdjustment:troops.nombre_pertes-Math.max(0,losses)};
}
test('350 differential cases against original Jactari post-duel resurrection arithmetic',()=>{
 let cases=0;
 for(const mode of ['tmp','def']){
  for(const roundStart of [25,50,100,350,1000]){
   for(const percent of [0,10,25,50,80,100,175]){
    for(const remainingFraction of [0.10,0.33,0.7,1,0.99]){
     const remaining=Math.max(1,Math.floor(roundStart*remainingFraction));
     const losses=Math.max(0,roundStart-remaining);
     const input={remaining,losses,roundStart,mode,percent};
     const expected=reference(input),observed=resolvePostDuelRevival(input);
     assert.equal(observed.revived,expected.revived,JSON.stringify(input));
     assert.equal(observed.remaining,expected.remaining,JSON.stringify(input));
     // -0 and +0 are numerically equal, even though assert.strictEqual treats them differently.
     assert.ok(observed.recordedLossAdjustment===expected.recordedLossAdjustment,JSON.stringify(input));
     cases++;
    }
   }
  }
 }
 assert.equal(cases,350);
});
