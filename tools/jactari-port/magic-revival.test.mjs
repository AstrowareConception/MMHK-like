import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePostDuelRevival} from './magic-revival.mjs';
test('temporary resurrection based on duel losses',()=>{
 const r=resolvePostDuelRevival({remaining:70,losses:30,roundStart:100,mode:'tmp',percent:50});
 assert.deepEqual(r,{revived:15,remaining:85,recordedLossAdjustment:0,temporary:true});
});
test('definitive revival based on surviving stack',()=>{
 const r=resolvePostDuelRevival({remaining:70,losses:30,roundStart:100,mode:'def',percent:50});
 assert.equal(r.revived,30);assert.equal(r.recordedLossAdjustment,-30);
});
test('revival capped by casualties since start of round',()=>{
 const r=resolvePostDuelRevival({remaining:98,losses:20,roundStart:100,mode:'tmp',percent:100});
 assert.equal(r.revived,2);
});
test('no revival of a completely destroyed stack',()=>{
 assert.equal(resolvePostDuelRevival({remaining:0,losses:100,roundStart:100,mode:'tmp',percent:100}).revived,0);
});
test('the -1 no-loss marker cannot create troops',()=>{
 assert.equal(resolvePostDuelRevival({remaining:100,losses:-1,roundStart:100,mode:'tmp',percent:100}).revived,0);
});
test('invalid spell modes are rejected',()=>{
 assert.throws(()=>resolvePostDuelRevival({remaining:10,losses:3,roundStart:10,mode:'unknown',percent:50}),RangeError);
});
