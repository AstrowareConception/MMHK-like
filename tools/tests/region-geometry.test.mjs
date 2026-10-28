import test from "node:test";
import assert from "node:assert/strict";
import {regionCellAt,regionCellCenter,regionPolygon,REGION_VIEW} from "../../apps/web/lib/region-geometry.ts";
test("25 centre hitboxes use identical draw and interaction geometry",()=>{
  const shapes=new Set();
  for(let i=0;i<5;i++)for(let j=0;j<5;j++){
    const p=regionCellCenter(i,j);
    assert.deepEqual(regionCellAt(p.x,p.y),{i,j});
    assert.equal(regionPolygon(i,j).split(" ").length,4);
    shapes.add(regionPolygon(i,j));
    assert.deepEqual(regionCellAt(p.x+REGION_VIEW.halfWidth*.2,p.y),{i,j});
  }
  assert.equal(shapes.size,25);
  assert.deepEqual(regionCellCenter(2,2),{x:340,y:281});
});
test("outside and between tiles never assigns a fabricated tile",()=>{
  assert.equal(regionCellAt(0,0),null);
  assert.equal(regionCellAt(680,562),null);
  assert.equal(regionCellAt(340,5),null);
  assert.throws(()=>regionCellCenter(5,0));
});
