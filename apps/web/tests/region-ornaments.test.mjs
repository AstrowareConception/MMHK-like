import assert from "node:assert/strict";
import test from "node:test";
import {regionOrnaments} from "../lib/region-ornaments.ts";

test("regional visual ornaments are stable and bounded",()=>{
  const a=regionOrnaments("local-sandbox",12,19);
  assert.deepEqual(a,regionOrnaments("local-sandbox",12,19));
  assert.equal(a.length,25);
  assert.deepEqual(new Set(a.map(t=>t.i+":"+t.j)).size,25);
  assert.equal(a.find(t=>t.i===2&&t.j===2).variant,"none");
  assert.ok(a.every(t=>t.i>=0&&t.i<5&&t.j>=0&&t.j<5));
});

test("visual variants depend on regional identity without claiming terrain",()=>{
  const first=regionOrnaments("local-sandbox",12,19).map(x=>x.variant+":"+x.rotation);
  const second=regionOrnaments("local-sandbox",13,19).map(x=>x.variant+":"+x.rotation);
  assert.notDeepEqual(first,second);
});
