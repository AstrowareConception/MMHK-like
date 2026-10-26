import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const source='data/analysis/jactari-combat-conformance-roadmap.json';
const doc='docs/game-design/32-ROADMAP-CONFORMITE-MOTEUR-COMBAT.md';
const json=JSON.parse(fs.readFileSync(path.join(root,source),'utf8'));
const statuses=new Set(['differential_bounded','integration_tested','implemented_partial',
 'not_started','blocked_source','certified']);
test('conformance plan has unique stable requirements with real source paths',()=>{
 assert.equal(json.schemaVersion,1);
 assert.equal(json.requirements.length,19);
 const ids=new Set(),milestones=new Set(json.milestones.map(x=>x.id));
 for(const req of json.requirements){
  assert.match(req.id,/^C\d{2}$/);
  assert.equal(ids.has(req.id),false,'Duplicate requirement '+req.id);
  ids.add(req.id);
  assert.equal(statuses.has(req.status),true,'Unknown state '+req.status);
  assert.ok(milestones.has(req.milestone),'Unknown milestone on '+req.id);
  assert.ok(req.acceptance?.length>30);
  assert.ok(req.gap?.length>8);
  assert.ok(fs.existsSync(path.join(root,req.implementation)),
    'No implementation or historic source for '+req.id);
  for(const evidence of req.evidence){
   assert.ok(evidence.startsWith('tools/jactari-port/'));
   assert.ok(evidence.endsWith('.test.mjs'));
   assert.ok(fs.existsSync(path.join(root,evidence)),
     req.id+' nonexistent differential evidence '+evidence);
  }
  if(req.status==='differential_bounded')
   assert.ok(req.evidence.length>0,req.id+' missing differential test');
 }
});
test('markdown index documents each registered requirement and every release milestone',()=>{
 const text=fs.readFileSync(path.join(root,doc),'utf8');
 for(const req of json.requirements)assert.ok(text.includes(req.id),req.id+' absent from documentation');
 for(const milestone of json.milestones)
  assert.ok(text.includes(milestone.id),milestone.id+' absent from roadmap');
 assert.ok(text.includes('100 %'));
});
test('certificate or production switch cannot be enabled without verifiable S2 evidence',()=>{
 const anyUncertified=json.requirements.some(r=>r.status!=='certified');
 if(anyUncertified){
  assert.equal(json.releaseGate.certified,false);
  assert.equal(json.releaseGate.productionBattleArbiterAllowed,false);
 }
 if(json.releaseGate.certified||json.releaseGate.productionBattleArbiterAllowed){
  assert.equal(anyUncertified,false,'One or more rules are not historically certified');
  assert.equal(json.originalReference.seasonTwoCertified,true,
   'Original Jactari is not the independent MMHK S2 ruleset');
 }
 assert.equal(json.originalReference.version,'v.4.1.3-MTR');
});
test('last observed run must have credible nonzero counts and a GitHub Actions URL',()=>{
 const ci=json.tracking.lastVerifiedFullSuite;
 assert.ok(ci.tests>0&&ci.tests===ci.passed+ci.failed);
 assert.ok(/^https:\/\/github\.com\/AstrowareConception\/MMHK-like\/actions\/runs\/\d+$/.test(ci.ciUrl));
 assert.match(json.tracking.metricPolicy,/pas un pourcentage/);
});
