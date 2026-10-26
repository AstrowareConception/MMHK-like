import test from 'node:test';
import assert from 'node:assert/strict';
import {traceToroidalTileLine,deriveCandidateTerritorialSegments} from './world-territory-trace.mjs';

const basic=()=>({
 worldId:'world',worldSize:20,revision:3,alliances:['red','blue','green'],
 memberships:[{playerId:'alice',allianceId:'red'},
 {playerId:'bob',allianceId:'blue'},{playerId:'carl',allianceId:'green'}],
 relations:[{allianceA:'blue',allianceB:'red',relation:'hostile'},
 {allianceA:'green',allianceB:'red',relation:'allied'}],
 cities:[{x:1,y:1,ownerPlayerId:'alice'},{x:5,y:1,ownerPlayerId:'bob'}],
 claims:[{x:2,y:1,ownerPlayerId:null,ownerAllianceId:'red'},
 {x:3,y:1,ownerPlayerId:null,ownerAllianceId:'blue'},
 {x:4,y:1,ownerPlayerId:null,ownerAllianceId:'green'}]
});
test('shortest map-edge crossing preserves Euclidean length and tile spans',()=>{
 const a=traceToroidalTileLine({x:1,y:50},{x:100,y:50},100);
 assert.deepEqual(a.map(x=>x.tile.x),[1,100]);
 assert.equal(a.reduce((n,x)=>n+x.distanceUnits,0),1);
 assert.deepEqual(a.map(x=>x.distanceUnits),[.5,.5]);
 const reversed=traceToroidalTileLine({x:100,y:50},{x:1,y:50},100);
 assert.deepEqual(reversed.map(x=>x.tile.x),[100,1]);
});
test('diagonal corner crossing avoids invented zero-length side tiles',()=>{
 const a=traceToroidalTileLine({x:1,y:1},{x:2,y:2},20);
 assert.deepEqual(a.map(x=>x.tile),[{x:1,y:1},{x:2,y:2}]);
 assert.ok(Math.abs(a[0].distanceUnits-Math.SQRT2/2)<1e-10);
 assert.equal(traceToroidalTileLine({x:1,y:1},{x:1,y:1},20).length,0);
});
test('half-world tie direction is deterministic, and routes reverse correctly',()=>{
 const a=traceToroidalTileLine({x:1,y:1},{x:6,y:1},10);
 const b=traceToroidalTileLine({x:6,y:1},{x:1,y:1},10);
 assert.deepEqual(a.map(s=>s.tile.x),[1,2,3,4,5,6]);
 assert.deepEqual(b.map(s=>s.tile.x),[6,5,4,3,2,1]);
 assert.equal(a.reduce((n,s)=>n+s.distanceUnits,0),5);
});
test('persisted sparse claims and member alliances produce explicit distinct labels',()=>{
 const j=deriveCandidateTerritorialSegments({
  snapshot:basic(),actingPlayerId:'alice',
  waypoints:[{x:1,y:1},{x:5,y:1}]});
 assert.deepEqual(j.segments.map(s=>s.territory),
  ['friendly','allied','hostile','allied','hostile']);
 assert.ok(Math.abs(j.totalDistance-4)<1e-9);
 assert.equal(j.worldRevision,3);
 assert.equal(j.authoritativeArrivalTime,false);
 assert.equal(j.historicalCertification,false);
 assert.equal('trustedSchedule' in j,false);
});
test('designated Grail alliance overrides the generic hostile relation for its cells',()=>{
 const j=deriveCandidateTerritorialSegments({
  snapshot:basic(),actingPlayerId:'alice',targetAllianceId:'blue',
  waypoints:[{x:1,y:1},{x:5,y:1}]});
 assert.deepEqual(j.segments.map(s=>s.territory),
  ['friendly','allied','targetAlliance','allied','targetAlliance']);
});
test('unclaimed tiles remain neutral; a city claims its own tile only',()=>{
 const j=deriveCandidateTerritorialSegments({
  snapshot:basic(),actingPlayerId:'alice',
  waypoints:[{x:1,y:1},{x:1,y:3}]});
 assert.deepEqual(j.segments.map(s=>s.territory),['friendly','neutral']);
 assert.equal(j.totalDistance,2);
});
test('waypoint turning remains visible as separate auditable legs',()=>{
 const j=deriveCandidateTerritorialSegments({
  snapshot:basic(),actingPlayerId:'alice',
  waypoints:[{x:1,y:1},{x:1,y:3},{x:3,y:3}]});
 assert.deepEqual(j.segments.map(s=>s.legIndex),[0,0,1]);
 assert.equal(j.totalDistance,4);
});
test('unknown diplomacy, overlap, duplicate city and invalid snapshots fail closed',()=>{
 const snapshot=basic();
 assert.throws(()=>deriveCandidateTerritorialSegments({
  snapshot:{...snapshot,relations:[]},actingPlayerId:'alice',
  waypoints:[{x:1,y:1},{x:5,y:1}]}),/Unknown diplomacy/);
 assert.throws(()=>deriveCandidateTerritorialSegments({
  snapshot:{...snapshot,claims:[...snapshot.claims,
   {x:1,y:1,ownerPlayerId:'bob',ownerAllianceId:null}]},
  actingPlayerId:'alice',waypoints:[{x:1,y:1},{x:5,y:1}]
 }),/city-overlapping/);
 assert.throws(()=>deriveCandidateTerritorialSegments({
  snapshot:{...snapshot,cities:[...snapshot.cities,snapshot.cities[0]]},
  actingPlayerId:'alice',waypoints:[{x:1,y:1},{x:5,y:1}]
 }),/Duplicate city/);
 assert.throws(()=>deriveCandidateTerritorialSegments({
  snapshot:{...snapshot,revision:-1},
  actingPlayerId:'alice',waypoints:[{x:1,y:1},{x:5,y:1}]
 }),/Versioned trusted/);
 assert.throws(()=>deriveCandidateTerritorialSegments({
  snapshot,actingPlayerId:'alice',targetAllianceId:'red',
  waypoints:[{x:1,y:1},{x:5,y:1}]
 }),/own alliance/);
});
test('huge map crossings fail before allocating unbounded route spans',()=>{
 assert.throws(()=>traceToroidalTileLine({x:1,y:1},{x:10000,y:10000},100000),
 /crossing limit/);
});

test('400 deterministic toroidal traces conserve length and reverse their cells',()=>{
 let seed=0x3a0b71d1;
 const next=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed;};
 for(let i=0;i<400;i++){
  const size=2+next()%97;
  const from={x:1+next()%size,y:1+next()%size};
  const to={x:1+next()%size,y:1+next()%size};
  const a=traceToroidalTileLine(from,to,size);
  const b=traceToroidalTileLine(to,from,size);
  const dx=Math.min(Math.abs(from.x-to.x),size-Math.abs(from.x-to.x));
  const dy=Math.min(Math.abs(from.y-to.y),size-Math.abs(from.y-to.y));
  const expected=Math.hypot(dx,dy);
  assert.ok(Math.abs(a.reduce((s,p)=>s+p.distanceUnits,0)-expected)<1e-9);
  assert.ok(Math.abs(b.reduce((s,p)=>s+p.distanceUnits,0)-expected)<1e-9);
  assert.deepEqual(a.map(x=>x.tile),b.map(x=>x.tile).reverse());
  assert.ok(a.every(x=>x.distanceUnits>0&&x.tile.x>=1&&x.tile.x<=size&&
   x.tile.y>=1&&x.tile.y<=size));
 }
});
