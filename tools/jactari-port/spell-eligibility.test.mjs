import test from 'node:test';
import assert from 'node:assert/strict';
import {eligibleSpells,jactariSpellChoices,validateJactariPresetTurns} from './spell-eligibility.mjs';
const catalog=[{school:0,circle:1},{school:1,circle:2},{school:0,circle:4},{school:3,circle:5}];
test('spell list filters by faction school and circle',()=>assert.deepEqual(eligibleSpells({spellCatalog:catalog,factionSchools:[0],circle:2}),[0]));
test('second list excludes first selected spell',()=>assert.deepEqual(eligibleSpells({spellCatalog:catalog,factionSchools:[0],excludedId:0}),[2]));
test('first list in Jactari UI permits circles up to five, second follows arcana',()=>{
 const r=jactariSpellChoices({spellCatalog:catalog,factionSchools:[0],arcanaCircle:2,heroPresent:true,archetypeMagic:10,firstSpell:0});
 assert.deepEqual(r.first,[0,2]);assert.deepEqual(r.second,[]);
});
test('hero without magical archetype has no spells',()=>assert.deepEqual(jactariSpellChoices({spellCatalog:catalog,factionSchools:[0],arcanaCircle:2,heroPresent:false,archetypeMagic:10}),{first:[],second:[]}));
test('turns must be distinct and within original 1..14',()=>{
 assert.equal(validateJactariPresetTurns([{id:0,turn:1},{id:1,turn:14}]),true);
 assert.throws(()=>validateJactariPresetTurns([{id:0,turn:1},{id:1,turn:1}]),/Duplicate/);
 assert.throws(()=>validateJactariPresetTurns([{id:0,turn:15}]),RangeError);
});
test('duplicate spell cannot be chosen twice',()=>assert.throws(()=>validateJactariPresetTurns([{id:0,turn:1},{id:0,turn:2}]),/Duplicate/));
test('more than two spells refused',()=>assert.throws(()=>validateJactariPresetTurns([{id:0,turn:1},{id:1,turn:2},{id:2,turn:3}]),RangeError));
