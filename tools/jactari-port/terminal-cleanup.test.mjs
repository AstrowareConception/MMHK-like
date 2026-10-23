import test from 'node:test';
import assert from 'node:assert/strict';
import {projectTerminalTemporaryRevival} from './terminal-cleanup.mjs';
import {simulateDualMagicEncounter} from './magic-rounds.mjs';
const army=(...s)=>Array.from({length:7},(_,i)=>s[i]??null);
const stack=n=>({count:n,unitPower:10,weapon:'I'});
const tmp=(power=50)=>({type:2,target:8,unit:2,power});
test('winner last temporary revival stripped from display, not combat state',()=>{
 const r=simulateDualMagicEncounter({attackers:army(stack(100)),defenders:army(stack(50)),attackerSpells:{1:tmp()}});
 assert.equal(r.attacker[0].remaining,75);assert.equal(r.terminalDisplay.attacker[0],50);
 assert.equal(r.terminalCleanup.temporaryUnitsRemoved,25);
 assert.deepEqual(r.events.map(e=>e.phase),['spell','duel','revival']);
});
test('defender winner temporary cleanup',()=>{
 const r=simulateDualMagicEncounter({attackers:army(stack(50)),defenders:army(stack(100)),defenderSpells:{1:tmp()}});
 assert.equal(r.defender[0].remaining,75);assert.equal(r.terminalDisplay.defender[0],50);
});
test('winning side cleanup unaffected by opposing revival',()=>{
 const r=simulateDualMagicEncounter({attackers:army(stack(100)),defenders:army(stack(50)),attackerSpells:{1:tmp()},defenderSpells:{1:tmp()}});
 assert.equal(r.terminalDisplay.attacker[0],50);
});
test('revival on earlier round not cleaned as last-round revival',()=>{
 const r=simulateDualMagicEncounter({attackers:army(stack(100)),defenders:army(stack(20),stack(20)),attackerSpells:{1:tmp()}});
 assert.equal(r.terminalCleanup,null);assert.equal(r.terminalDisplay.attacker[0],r.attacker[0].remaining);
});
test('definitive revival stays in display',()=>{
 const r=simulateDualMagicEncounter({attackers:army(stack(100)),defenders:army(stack(50)),attackerSpells:{1:{type:2,target:9,unit:2,power:50}}});
 assert.equal(r.terminalCleanup,null);assert.equal(r.terminalDisplay.attacker[0],75);
});
test('a losing side is not terminal-cleaned',()=>{
 const r=projectTerminalTemporaryRevival({status:'defender',attacker:army({remaining:50,dispersed:false}),defender:army({remaining:10,dispersed:false}),lastRevival:{side:'attacker',slot:1,revived:20,mode:'tmp'}});
 assert.equal(r.cleanup,null);
});
test('revival without surviving two-sided duel fails closed',()=>{
 assert.throws(()=>simulateDualMagicEncounter({attackers:army(stack(10)),defenders:army(stack(10)),attackerSpells:{1:{type:0,target:4,unit:7,power:1000}},defenderSpells:{1:tmp()}}),/Unsupported resurrection without a duel/);
});
test('projection does not mutate original state',()=>{
 const a=army({remaining:50,dispersed:false});
 const r=projectTerminalTemporaryRevival({status:'attacker',attacker:a,defender:army(),lastRevival:{side:'attacker',slot:1,revived:20,mode:'tmp'}});
 assert.equal(r.displayed.attacker[0],30);assert.equal(a[0].remaining,50);
});
