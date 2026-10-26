import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {decideJactariAdmission,armyPower} from './admission.mjs';

const source=fs.readFileSync(path.resolve(path.dirname(fileURLToPath(import.meta.url)),
  '../../data/Jactari/src/scripts/combat.min.js'),'utf8');
const encounter=source.slice(source.indexOf('function simulation_rencontre('));
const start=encounter.indexOf('if(!rencontre_jcj){');
const end=encounter.indexOf('if(competences_hereditaires.attaquant.moral_eleve>0',start);
if(start<0||end<start)throw new Error('Original Jactari admission branch changed');
const original=encounter.slice(start,end);
function reference(attackPower,defensePower,mode){
 const rows=[];
 const context={
  puissance_armee_attaque:attackPower,puissance_armee_defense:defensePower,
  rencontre_jcj:mode==='pvp',_seuil_fuite_jce:1/7,
  _langue:0,
  _traduction:{fin:['end'],attaquant_capture:['capture'],
    attaquant_blesse:['wound X'],attaquant_fuite:['retreat']},
  $:()=>({append:x=>rows.push(x)})
 };
 vm.runInNewContext('(function(){'+original+';return false})()',context,{timeout:1000});
 const row=rows.join('');
 if(row.includes('capture'))return {outcome:'attacker-captured',woundHours:null};
 const hours=/wound (\d+)/.exec(row);
 if(hours)return {outcome:'attacker-wounded',woundHours:Number(hours[1])};
 if(row.includes('retreat'))return {outcome:'attacker-retreat',woundHours:null};
 return {outcome:'battle',woundHours:null};
}
test('PvP admission and wounds: 2000 deterministic powers against original branch',()=>{
 let seed=20261026;
 const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 for(let i=0;i<2000;i++){
  const defender=1+Math.floor(rnd()*250000);
  const attacker=1+Math.floor(rnd()*250000);
  const expected=reference(attacker,defender,'pvp');
  const actual=decideJactariAdmission({attackPower:attacker,defensePower:defender,mode:'pvp'});
  assert.equal(actual.outcome,expected.outcome,'case '+i);
  assert.equal(actual.woundHours,expected.woundHours,'case '+i);
 }
});
test('PvE admission: 2000 comparisons with original ratio branch',()=>{
 for(let i=1;i<=2000;i++){
  const defender=10000,attacker=i;
  const expected=reference(attacker,defender,'pve');
  const actual=decideJactariAdmission({attackPower:attacker,defensePower:defender,mode:'pve'});
  assert.equal(actual.outcome,expected.outcome,'attack '+attacker);
 }
});
test('PvP boundary bands: capture, wound 24/18/12/6, retreat, battle',()=>{
 const expected=['attacker-captured','attacker-captured','attacker-captured',
  'attacker-wounded','attacker-wounded','attacker-wounded','attacker-wounded',
  'attacker-retreat','battle'];
 for(let i=0;i<expected.length;i++){
  const actual=decideJactariAdmission({attackPower:i,defensePower:30,mode:'pvp'});
  assert.equal(actual.outcome,expected[i],'band '+i);
  if(i>=3&&i<=6)assert.equal(actual.woundHours,24-(i-3)*6);
 }
});
test('PvE exact one-seventh cutoff and neighboring powers',()=>{
 assert.equal(decideJactariAdmission({attackPower:1,defensePower:7,mode:'pve'}).outcome,'attacker-retreat');
 assert.equal(decideJactariAdmission({attackPower:2,defensePower:7,mode:'pve'}).outcome,'battle');
});
test('initial army power comes only from seven real slots',()=>{
 const u=(count,unitPower)=>({count,unitPower});
 assert.equal(armyPower([u(10,10),null,u(3,20),null,null,null,null]),160);
 assert.throws(()=>armyPower([u(10,10)]),/Seven/);
});
test('empty/invalid powers and missing game mode fail closed',()=>{
 assert.throws(()=>decideJactariAdmission({attackPower:10,defensePower:0,mode:'pvp'}),RangeError);
 assert.throws(()=>decideJactariAdmission({attackPower:10,defensePower:10}),RangeError);
});
