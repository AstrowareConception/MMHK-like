#!/usr/bin/env node
import assert from 'node:assert/strict';
import {region,generateMineTypes,specialSites,torusDistance,validateRegion,benchmark} from './mmhk-world-lab.mjs';
import {buildCost,startingWorldBuild,config as heritage} from './mmhk-heritage-lab.mjs';

let checks=0;
const check=(f)=>{f();checks++};
check(()=>assert.equal(heritage.budget,1000));
check(()=>assert.equal(buildCost({}).total,0));
check(()=>assert.equal(buildCost({resource_yield:5}).total,450));
check(()=>assert.equal(buildCost({resource_yield:5,attack:5}).unspent,100));
check(()=>assert.equal(buildCost({resource_yield:5,attack:5,upkeep:5}).valid,false));
check(()=>assert.equal(buildCost({resource_yield:2.5}).valid,false));
check(()=>assert.equal(buildCost({unknown_skill:1}).valid,false));
check(()=>assert.deepEqual(startingWorldBuild({attack:2}).carry_from_other_worlds,0));
check(()=>assert.equal(torusDistance({x:0,y:0},{x:19,y:19},20,20),Math.sqrt(2)));

for(const seed of ['a','b','c','europa','world-20','world-2000']){
 const starter=region(seed,2,4,'c');
 check(()=>assert.equal(validateRegion(starter),true));
 check(()=>assert.deepEqual(starter.mines.map(m=>m.resource).sort(),['G','w','o','c'].sort()));
 check(()=>assert.deepEqual(region(seed,2,4,'c'),starter));
 for(let i=0;i<100;i++)check(()=>assert.equal(validateRegion(region(seed,i,Math.floor(i/11))),true));
 const nodes=specialSites(seed,152,152,15,2);
 const coords=nodes.map(s=>s.x+':'+s.y);
 check(()=>assert.equal(new Set(coords).size,coords.length));
 check(()=>assert.deepEqual(specialSites(seed,152,152,15,2),nodes));
 check(()=>assert.ok(nodes.every(s=>torusDistance(s,s.anchor,152,152)<=2*Math.sqrt(2))));
 const typeCounts=Object.values(nodes.reduce((a,n)=>((a[n.type]=(a[n.type]||0)+1),a),{}));
 check(()=>assert.ok(Math.max(...typeCounts)-Math.min(...typeCounts)<=1));
}
const stats=benchmark(10000,'repeatable');
check(()=>assert.equal(stats.invalid,0));
check(()=>assert.ok(stats.pairedPercent>10&&stats.pairedPercent<28,'pair probability outside broad smoke range'));
console.log('OK:',checks,'assertions; 10k regions;',stats.pairedPercent+'% pair pattern; 0 invalid');
console.log('Not an original MMHK Ubisoft server conformance test.');
