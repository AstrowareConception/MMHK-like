import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync } from 'node:fs';
import { join,dirname,resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const script=resolve(dirname(fileURLToPath(import.meta.url)),'../prepare-private-historical.mjs');
test('preparation is local, idempotent and refuses modifications to existing historical binaries',()=>{
  const root=mkdtempSync(join(tmpdir(),'mmhk-local-pack-'));
  const source=join(root,'data/assets-recovered/cdn-bulk/4.1.27-MTR/img/city/HAVEN/TAVERN.gif');
  mkdirSync(dirname(source),{recursive:true});
  writeFileSync(source,Buffer.from('GIF89a-test-fixture'));
  try{
    const first=JSON.parse(execFileSync(process.execPath,[script,'--root',root],{encoding:'utf8'}));
    assert.equal(first.copied,1);
    const second=JSON.parse(execFileSync(process.execPath,[script,'--root',root],{encoding:'utf8'}));
    assert.equal(second.reused,1);
    const destination=join(root,'data/assets-private-original/4.1.27-MTR/img/city/HAVEN/TAVERN.gif');
    assert.deepEqual(readFileSync(destination),readFileSync(source));
    const manifest=JSON.parse(readFileSync(join(root,'data/assets-private-original/manifest.json'),'utf8'));
    assert.equal(manifest['building.haven.tavern.1'],'4.1.27-MTR/img/city/HAVEN/TAVERN.gif');
    writeFileSync(destination,'different');
    assert.throws(()=>execFileSync(process.execPath,[script,'--root',root],{stdio:'pipe'}));
  }finally{rmSync(root,{recursive:true,force:true});}
});
