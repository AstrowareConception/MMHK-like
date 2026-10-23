import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {resolveStackDuel} from './core.mjs';
const here=path.dirname(fileURLToPath(import.meta.url));
const source=fs.readFileSync(path.resolve(here,'../../data/Jactari/src/scripts/combat.min.js'),'utf8');
function extractFunction(name){
  const start=source.indexOf('function '+name+'(');
  if(start<0)throw Error('Missing upstream Jactari function');
  let p=source.indexOf('{',start),depth=0;
  for(let i=p;i<source.length;i++){
    if(source[i]==='{')depth++;
    else if(source[i]==='}'&&--depth===0)return source.slice(start,i+1);
  }
  throw Error('Unclosed upstream function');
}
const original=extractFunction('simulation_combat');
function reference(a,d,ba,bd,unitPowerA=10,unitPowerD=10){
  const atk={type:0,nombre_debut_combat:a,nombre_restant:a,nombre_bonus:0,nombre_bonus_perdu:0};
  const def={type:1,nombre_debut_combat:d,nombre_restant:d,nombre_bonus:0,nombre_bonus_perdu:0};
  const sandbox={peloton_attaque:2,peloton_defense:2,pelotons_attaquant:{2:atk},pelotons_defenseur:{2:def},
    _unites:[{puissance:unitPowerA,arme:'I'},{puissance:unitPowerD,arme:'C'}],
    id_heros:{attaquant:null,defenseur:null},bonus_attaque_defense:()=>({
      attaque_peloton_heros:ba.attackStackHero??0,attaque_unites_heros:ba.attackUnitsHero??0,
      attaque_peloton_arme:ba.attackWeapon??0,attaque_peloton_special:ba.attackSpecial??0,
      defense_peloton_heros:bd.defendStackHero??0,defense_unites_heros:bd.defendUnitsHero??0,
      defense_peloton_arme:bd.defendWeapon??0,defense_peloton_special:bd.defendSpecial??0,
      defense_peloton_fortifications:bd.defendFortification??0 }),
    avertissement:()=>{},_traduction:{alerte_egalite:['tie X']},_langue:0,dernier_peloton:null};
  vm.createContext(sandbox);
  vm.runInContext(original+';result=simulation_combat(1);',sandbox);
  return {result:sandbox.result,attacker:atk,defender:def};
}
test('differential original Jactari duel, 350 deterministic cases',()=>{
  const xorshift=(x)=>()=>{x^=x<<13;x^=x>>>17;x^=x<<5;return (x>>>0)/4294967296;};
  const rnd=xorshift(20261023);
  for(let i=0;i<350;i++){
    const a=1+Math.floor(rnd()*150),d=1+Math.floor(rnd()*150);
    const pa=1+Math.floor(rnd()*40),pd=1+Math.floor(rnd()*40);
    const m={attackStackHero:Math.floor(rnd()*5)*.125,
      attackWeapon:Math.floor(rnd()*3)*.1,attackUnitsHero:Math.floor(rnd()*3),
      defendStackHero:Math.floor(rnd()*5)*.125,defendFortification:Math.floor(rnd()*3)*.1,
      defendUnitsHero:Math.floor(rnd()*3)};
    const legacy=reference(a,d,m,m,pa,pd);
    const result=resolveStackDuel({attacker:{count:a,unitPower:pa},
      defender:{count:d,unitPower:pd},modifiers:m});
    for(const [side,key] of [['attacker','pertes_attaquant'],['defender','pertes_defenseur']])
      assert.equal(result.losses[side],legacy.result[key],'case '+i+' '+side+' losses');
    assert.equal(result.remaining.attacker,legacy.attacker.nombre_restant,'case '+i+' A remain');
    assert.equal(result.remaining.defender,legacy.defender.nombre_restant,'case '+i+' D remain');
    assert.equal(result.draw,legacy.result.nul,'case '+i+' equality');
    assert.equal(result.falseDraw,legacy.result.faux_nul,'case '+i+' false draw');
  }
});
