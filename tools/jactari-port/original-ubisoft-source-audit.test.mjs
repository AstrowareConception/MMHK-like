import test from 'node:test';
import assert from 'node:assert/strict';
import {scanOriginalUbisoftClient} from './original-ubisoft-source-audit.mjs';

test('recoveried Ubisoft prod.js clients exist and their game-rule tokens are inventoried without executing',()=>{
 const results=scanOriginalUbisoftClient();
 assert.equal(results.length,2);
 for(const file of results){
  assert.ok(file.bytes>1000000,'Expected archived client JS: '+file.file);
  assert.equal(file.executed,false);
  for(const [token,hit] of Object.entries(file.keywordHits)){
   assert.ok(Number.isSafeInteger(hit.count));
   assert.ok(hit.samples.length<=3);
   for(const s of hit.samples)assert.ok(s.at>=0&&s.context.length<180);
  }
  console.log('MMHK_ORIGINAL_CLIENT_AUDIT '+JSON.stringify({
   file:file.file,bytes:file.bytes,head:file.head,
   matches:Object.fromEntries(Object.entries(file.keywordHits)
    .filter(([,v])=>v.count>0).map(([k,v])=>[k,v]))
  }));
 }
});
