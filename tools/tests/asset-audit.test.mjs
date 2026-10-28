import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, rmSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { tmpdir } from 'node:os';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
const tool=resolve(dirname(fileURLToPath(import.meta.url)),'../audit-graphic-assets.mjs');
test('physical inventory, exact duplicates, expected city gaps',()=>{
  const root=mkdtempSync(join(tmpdir(),'mmhk-audit-'));
  const add=(path,content)=>{const target=join(root,path);mkdirSync(dirname(target),{recursive:true});writeFileSync(target,content);};
  try {
    const png=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Wp5tQAAAABJRU5ErkJggg==','base64');
    add('data/assets-recovered/cdn-bulk/v1/img/city/HAVEN/TAVERN.gif',png);
    add('data/assets-private-original/v2/img/city/HAVEN/TAVERN.gif',png);
    add('data/analysis/expected-city-files.json',JSON.stringify({files:[
      {relative_path:'img/city/HAVEN/TAVERN.gif'},
      {relative_path:'img/city/HAVEN/base.jpg'}
    ]}));
    const report=JSON.parse(execFileSync(process.execPath,[tool,'--root',root],{encoding:'utf8'}));
    assert.equal(report.found,2);
    assert.equal(report.unique_sha256,1);
    assert.equal(report.missing_city_files,1);
    const inv=JSON.parse(readFileSync(join(root,'data/asset-catalog/generated/inventory.json'),'utf8'));
    assert.equal(inv.assets[0].redistribution,'restricted_or_unverified');
    const check=JSON.parse(execFileSync(process.execPath,[tool,'--root',root,'--check'],{encoding:'utf8'}));
    assert.equal(check.found,2);
  }finally{rmSync(root,{recursive:true,force:true});}
});
