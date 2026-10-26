import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import vm from 'node:vm';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {jactariToroidalDistance,communityDistanceEstimates,validateWorldCoordinate}
 from './world-distance.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const original=fs.readFileSync(path.join(root,
 'data/Jactari/upstream-addon/mmhkplus-utilities-2013.js'),'utf8');
const a=original.indexOf('MMHKPLUS.distance = function(');
const b=original.indexOf('MMHKPLUS.getRegionId = function(',a);
if(a<0||b<a)throw Error('The original 2013 MMHK world distance function changed');
const code=original.slice(a,b);
const sourceEstimator=fs.readFileSync(path.join(root,
 'data/Jactari/upstream-addon/mmhkplus-distances-2013.js'),'utf8');
const originalBlobHash=(buffer)=>createHash('sha1')
 .update(Buffer.from('blob '+buffer.length+String.fromCharCode(0)))
 .update(buffer).digest('hex');

function originalDistance(size,from,to){
 const ctx={MMHKPLUS:{getElement:()=>({get:label=>{
  if(label!=='worldSize')throw Error('Unexpected original property');
  return size;
 }})}};
 vm.createContext(ctx,{name:'unaltered-MMHK-Plus-2013-world-distance'});
 vm.runInContext(code,ctx,{timeout:1000});
 return vm.runInContext('MMHKPLUS.distance(x1,y1,x2,y2)',
  Object.assign(ctx,{x1:from.x,y1:from.y,x2:to.x,y2:to.y}),{timeout:1000});
}
test('500 deterministic wrapped map distances agree with unmodified 2013 MMHK-Plus',()=>{
 let seed=20261026;
 const random=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 for(let i=0;i<500;i++){
  const size=[16,32,100,101,256][i%5];
  const point=()=>({x:1+Math.floor(random()*size),
    y:1+Math.floor(random()*size)});
  const a=point(),b=point();
  assert.equal(jactariToroidalDistance(a,b,size),originalDistance(size,a,b),
   JSON.stringify({size,a,b}));
 }
});
test('opposite map edges wrap, diagonal and same tile behave geometrically',()=>{
 const w=100;
 assert.equal(jactariToroidalDistance({x:1,y:50},{x:100,y:50},w),1);
 assert.equal(jactariToroidalDistance({x:1,y:1},{x:100,y:100},w),Math.sqrt(2));
 assert.equal(jactariToroidalDistance({x:40,y:30},{x:40,y:30},w),0);
 assert.equal(jactariToroidalDistance({x:1,y:1},{x:51,y:1},w),50);
});
test('2013 community movement ratios are INFORMATIONAL not a server arrival calculation',()=>{
 assert.match(sourceEstimator,/dist\/12/);
 assert.match(sourceEstimator,/dist\/4/);
 assert.match(sourceEstimator,/dist\/9\.375/);
 const p=communityDistanceEstimates({x:1,y:1},{x:5,y:1},100);
 assert.equal(p.distance,4);
 assert.equal(p.hours.unaccompaniedHero,4/12);
 assert.equal(p.hours.army,1);
 assert.equal(p.hours.caravan,4/9.375);
 assert.equal(p.authoritativeArrivalTime,false);
 assert.equal('arrivalAtMs' in p,false);
});
test('invalid, fractional and outside coordinates never silently wrap into another world',()=>{
 const pt={x:1,y:1};
 for(const bad of [{x:0,y:1},{x:100,y:1},{x:1,y:99},
  {x:1.5,y:3},{x:-1,y:3},{x:NaN,y:3}])
  assert.throws(()=>validateWorldCoordinate(bad,64),/coordinate|Integer/);
 for(const size of [0,1,1.5,Infinity,-2])
  assert.throws(()=>jactariToroidalDistance(pt,pt,size),/world size/);
});

test('archived world distance and client estimate modules match source-original Git blob hashes',()=>{
 const utilities=fs.readFileSync(path.join(root,
  'data/Jactari/upstream-addon/mmhkplus-utilities-2013.js'));
 const estimates=fs.readFileSync(path.join(root,
  'data/Jactari/upstream-addon/mmhkplus-distances-2013.js'));
 assert.equal(originalBlobHash(utilities),'90d808618ba819df155197752d14508a2a76cc88');
 assert.equal(originalBlobHash(estimates),'fd0ec7c7acfdf0999edb29552be4eeab606d7d21');
});
