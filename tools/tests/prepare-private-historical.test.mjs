import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync,mkdirSync,readFileSync,writeFileSync,rmSync,statSync,chmodSync } from 'node:fs';
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
    assert.ok(statSync(join(root,'data/assets-private-original/manifest.json')).mode & 0o004,
      'The non-root Node.js Web container must be able to read the path-only manifest');
    // Existing private packs created by older versions have a 0600 manifest.
    const manifestFile=join(root,'data/assets-private-original/manifest.json');
    chmodSync(manifestFile,0o600);
    execFileSync(process.execPath,[script,'--root',root],{stdio:'pipe'});
    assert.equal(statSync(manifestFile).mode & 0o777,0o644,
      'Repair private manifest permissions without touching historical binaries');
    writeFileSync(destination,'different');
    assert.throws(()=>execFileSync(process.execPath,[script,'--root',root],{stdio:'pipe'}));
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('historic hero and formation visuals remain private after opt-in preparation',()=>{
  const root=mkdtempSync(join(tmpdir(),'mmhk-historical-ui-'));
  const relative='4.1.13-MTR/img/hero/equipementBg_Haven.jpg';
  const source=join(root,'data/assets-recovered/cdn-bulk',relative);
  mkdirSync(dirname(source),{recursive:true});
  writeFileSync(source,Buffer.from('PRIVATE-TEST-ARTWORK'));
  try{
    const result=JSON.parse(execFileSync(process.execPath,[script,'--root',root],{
      encoding:'utf8'
    }));
    assert.equal(result.copied,1);
    const manifest=JSON.parse(readFileSync(join(root,
      'data/assets-private-original/manifest.json'),'utf8'));
    assert.equal(manifest['hero.background.haven'],relative);
    assert.deepEqual(readFileSync(join(root,'data/assets-private-original',relative)),
      Buffer.from('PRIVATE-TEST-ARTWORK'));
    assert.equal(result.unavailable.includes('hero.portrait.might'),true);
  }finally{rmSync(root,{recursive:true,force:true});}
});


test('five original MMHK faction portrait sheets and Haven troops are copied only to private pack',()=>{
  const root=mkdtempSync(join(tmpdir(),'mmhk-heros-95-'));
  const entries=[
    ['hero.sheet.haven','Hero_HAVEN_2.jpg'],
    ['hero.sheet.academy','Hero_ACADEMY_2.jpg'],
    ['hero.sheet.inferno','Hero_INFERNO_2.jpg'],
    ['hero.sheet.necropolis','Hero_NECROPOLIS_2.jpg'],
    ['hero.sheet.sylvan','Hero_SYLVAN_2.jpg'],
    ['army.sheet.haven','BattleUnitStack_HAVEN.jpg'],
    ['army.sheet.haven.small','UnitStack_HAVEN.png'],
    ['hero.slot.sheet.haven','emplacements-artefacts.png']
  ];
  try {
    for(const [,filename] of entries){
      const original=join(root,'data/Jactari/src/images',filename);
      mkdirSync(dirname(original),{recursive:true});
      writeFileSync(original,Buffer.from('ORIGINAL-SHEET-'+filename));
    }
    const first=JSON.parse(execFileSync(process.execPath,[script,'--root',root],{encoding:'utf8'}));
    assert.equal(first.copied,entries.length);
    const manifest=JSON.parse(readFileSync(join(root,'data/assets-private-original/manifest.json'),'utf8'));
    for(const [id,filename] of entries){
      assert.equal(manifest[id],'jactari/mmhk/'+filename);
      assert.deepEqual(
        readFileSync(join(root,'data/assets-private-original/jactari/mmhk',filename)),
        readFileSync(join(root,'data/Jactari/src/images',filename))
      );
    }
    const repeat=JSON.parse(execFileSync(process.execPath,[script,'--root',root],{encoding:'utf8'}));
    assert.equal(repeat.reused,entries.length);
    assert.equal(repeat.copied,0);
  }finally {rmSync(root,{recursive:true,force:true});}
});
