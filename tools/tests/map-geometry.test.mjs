import test from "node:test";
import assert from "node:assert/strict";
import {
  worldWrap, worldDelta, tileFromPoint, tileToPoint,
  screenToWorld, TILE_METRICS, MAP_VIEW
} from "../../apps/web/lib/map-geometry.ts";

test("US-MON-004: world coordinates wrap on all four edges",()=>{
  assert.equal(worldWrap(0,100),100);
  assert.equal(worldWrap(101,100),1);
  assert.equal(worldWrap(200,100),100);
  assert.equal(worldWrap(-100,100),100);
  assert.equal(worldDelta(1,100,100),1);
  assert.equal(worldDelta(100,1,100),-1);
  assert.throws(()=>worldWrap(NaN,100));
  assert.throws(()=>worldWrap(5,1));
});
test("US-UIX-003: projection and tile hit testing agree for BOTH zooms",()=>{
  for(const {hw,hh} of Object.values(TILE_METRICS)){
    for(let i=-10;i<=10;i++)for(let j=-10;j<=10;j++){
      const point=tileToPoint(i,j,hw,hh);
      assert.deepEqual(tileFromPoint(point.x,point.y,hw,hh),{i,j});
      assert.deepEqual(tileFromPoint(point.x+hw*.25,point.y+hh*.25,hw,hh),{i,j});
    }
    // Exactly on the edge selects one deterministic tile, not two.
    const point=tileToPoint(0,0,hw,hh);
    const edge=tileFromPoint(point.x+hw,point.y,hw,hh);
    assert.ok(edge);
    assert.deepEqual(tileFromPoint(point.x+hw,point.y,hw,hh),edge);
  }
});
test("US-UIX-003: camera pan is inverted before hit testing",()=>{
  const {hw,hh}=TILE_METRICS.detail;
  const origin={x:17,y:23};
  assert.deepEqual(screenToWorld(MAP_VIEW.cx,MAP_VIEW.cy,origin,100,hw,hh),origin);
  const next=tileToPoint(1,0,hw,hh);
  assert.deepEqual(screenToWorld(next.x,next.y,origin,100,hw,hh),{x:18,y:23});
  assert.deepEqual(screenToWorld(next.x+13,next.y+8,origin,100,hw,hh,{x:13,y:8}),{x:18,y:23});
  assert.equal(screenToWorld(0,0,origin,100,hw,hh),null);
  assert.equal(screenToWorld(680,500,origin,100,hw,hh),null);
});
