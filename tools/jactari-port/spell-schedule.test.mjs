import test from 'node:test';
import assert from 'node:assert/strict';
import {spellsForRound,planSpellEffects} from './spell-schedule.mjs';
test('spells ordered attacker then defender for same turn',()=>{
 assert.deepEqual(spellsForRound({turn:2,attackerSpells:{2:10},defenderSpells:{2:11}}),[
 {turn:2,side:'attacker',spellId:10},{turn:2,side:'defender',spellId:11}]);
});
test('spells not scheduled on this round are ignored',()=>{
 assert.deepEqual(spellsForRound({turn:1,attackerSpells:{2:10}}),[]);
});
test('known effect uses registered handler',()=>{
 const handler=()=>42;
 const events=planSpellEffects({turn:1,attackerSpells:{1:3},
 spellCatalog:{3:{type:0,target:4,unit:7}},supportedEffects:{'0:4:7':handler}});
 assert.equal(events[0].handler,handler);assert.equal(events[0].effectKey,'0:4:7');
});
test('unknown spell fails closed',()=>assert.throws(()=>planSpellEffects({
 turn:1,attackerSpells:{1:4}}),/Unknown spell/));
test('unsupported spell effect fails closed',()=>assert.throws(()=>planSpellEffects({
 turn:1,defenderSpells:{1:4},spellCatalog:{4:{type:2,target:3,unit:0}}}),/Unsupported spell effect/));
test('invalid casting turn refused',()=>assert.throws(()=>spellsForRound({turn:0}),RangeError));
test('scheduling input stays immutable',()=>{
 const a={1:2};spellsForRound({turn:1,attackerSpells:a});assert.deepEqual(a,{1:2});
});
