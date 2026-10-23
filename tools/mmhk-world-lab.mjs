#!/usr/bin/env node
/**
 * MMHK-like: world generation DESIGN LAB, not original Ubisoft algorithm.
 * Node >= 18, zero dependencies.
 * node tools/mmhk-world-lab.mjs --preset 100 --seed demo --samples 10000
 * node tools/mmhk-world-lab.mjs --preset 2000 --seed demo --json
 */
import { pathToFileURL } from 'node:url';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve, dirname } from 'node:path';
const root=resolve(dirname(fileURLToPath(import.meta.url)),'..');
const cfg=JSON.parse(readFileSync(resolve(root,'data/game-design/world-generator-lab.json'),'utf8'));
const hash=(value)=>{let h=2166136261;for(const c of String(value)){h^=c.charCodeAt(0);h=Math.imul(h,16777619);}return h>>>0;};
function random(seed){let x=hash(seed);return ()=>{x+=0x6D2B79F5;let t=x;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);return ((t^t>>>14)>>>0)/4294967296;};}
function int(rng,n){return Math.floor(rng()*n);}
function weightedPick(rng,items,weights) {
 let total=items.reduce((n,k)=>n+weights[k],0),r=rng()*total;
 for(const k of items){r-=weights[k];if(r<0)return k;}
 return items[items.length-1];
}
const codes=['G','w','o','c','g','s','m'];
export function generateMineTypes(seed,starterRare=null) {
 if(starterRare)return ['G','w','o',starterRare];
 const rng=random(seed),weights=cfg.regions.typeWeights,remaining=[...codes],chosen=[];
 const paired=rng()<cfg.regions.pairProbability;
 const count=paired?3:4;
 while(chosen.length<count){const k=weightedPick(rng,remaining,weights);chosen.push(k);remaining.splice(remaining.indexOf(k),1);}
 if(paired)chosen.push(weightedPick(rng,chosen,weights));
 for(let i=chosen.length-1;i>0;i--){const j=int(rng,i+1);[chosen[i],chosen[j]]=[chosen[j],chosen[i]];}
 return chosen;
}
export function minePositions(seed) {
 const rng=random(seed),rings=[[],[]];
 for(let y=0;y<5;y++)for(let x=0;x<5;x++){
  const d=Math.max(Math.abs(x-2),Math.abs(y-2));
  if(d>0)rings[d-1].push([x,y]);
 }
 const result=[];
 for(const ring of rings) for(let i=0;i<2;i++)result.push(ring.splice(int(rng,ring.length),1)[0]);
 for(let i=result.length-1;i>0;i--){const j=int(rng,i+1);[result[i],result[j]]=[result[j],result[i]];}
 return result;
}
export function region(seed,x,y,starterRare=null){
 const id=[seed,x,y].join(':');
 const types=generateMineTypes('type:'+id,starterRare),positions=minePositions('pos:'+id);
 return {x,y,city:[2,2],size:5,starter:!!starterRare,mines:types.map((resource,i)=>({resource,cell:positions[i]}))};
}
export function torusDistance(a,b,width,height){
 const dx=Math.abs(a.x-b.x),dy=Math.abs(a.y-b.y);
 return Math.hypot(Math.min(dx,width-dx),Math.min(dy,height-dy));
}
export function specialSites(seed,width,height,spacing=cfg.sites.spacingCells,jitter=cfg.sites.jitterCells,types=cfg.sites.types){
 if(!Number.isInteger(width)||width<5||!Number.isInteger(height)||height<5)throw Error('invalid map');
 if(spacing<1||jitter<0||jitter>Math.floor(spacing/2))throw Error('invalid spacing/jitter');
 const rng=random('sites:'+seed+':'+width+':'+height+':'+spacing);
 const nx=Math.max(1,Math.floor(width/spacing)),ny=Math.max(1,Math.floor(height/spacing));
 const anchors=[];
 for(let y=0;y<ny;y++)for(let x=0;x<nx;x++)anchors.push({x:Math.floor((x+.5)*width/nx),y:Math.floor((y+.5)*height/ny)});
 for(let i=anchors.length-1;i>0;i--){const j=int(rng,i+1);[anchors[i],anchors[j]]=[anchors[j],anchors[i]];}
 const points=[];
 for(let i=0;i<anchors.length;i++){
  const anchor=anchors[i];
  let point=null;
  for(let tries=0;tries<96;tries++){
   const dx=int(rng,2*jitter+1)-jitter,dy=int(rng,2*jitter+1)-jitter;
   const candidate={x:(anchor.x+dx+width)%width,y:(anchor.y+dy+height)%height};
   if(points.every(p=>p.x!==candidate.x||p.y!==candidate.y)){point=candidate;break;}
  }
  if(!point)throw Error('could not place unique site');
  points.push({...point,type:types[i%types.length],anchor});
 }
 return points.sort((a,b)=>a.y-b.y||a.x-b.x);
}
export function validateRegion(reg){
 const arr=reg.mines.map(x=>x.resource),counts=new Map();
 for(const t of arr)counts.set(t,(counts.get(t)||0)+1);
 return arr.length===4&&counts.size>=3&&Math.max(...counts.values())<=2&&new Set(reg.mines.map(m=>m.cell.join(','))).size===4
 &&reg.mines.every(m=>m.cell[0]>=0&&m.cell[0]<5&&m.cell[1]>=0&&m.cell[1]<5&&m.cell.join(',')!=='2,2');
}
export function benchmark(samples=10000,seed='lab') {
 const frequencies=Object.fromEntries(codes.map(k=>[k,0])),pairs=Object.create(null);
 let paired=0,invalid=0;
 for(let i=0;i<samples;i++){
  const r=region(seed,i%251,Math.floor(i/251)),c=new Set(r.mines.map(x=>x.resource));
  if(!validateRegion(r))invalid++;
  if(c.size===3)paired++;
  for(const m of r.mines)frequencies[m.resource]++;
 }
 return {samples,invalid,paired,pairedPercent:100*paired/samples,frequencies};
}
function argumentsFromCli(argv){const o={};for(let i=0;i<argv.length;i++)if(argv[i].startsWith('--')){let k=argv[i].slice(2),v=argv[i+1];if(v&&!v.startsWith('--')){o[k]=v;i++;}else o[k]=true;}return o;}
if(process.argv[1]&&import.meta.url===pathToFileURL(resolve(process.argv[1])).href){
 const opts=argumentsFromCli(process.argv.slice(2)),players=Number(opts.preset||100),preset=cfg.worldPresets.find(x=>x.maxPlayers>=players)||cfg.worldPresets.at(-1);
 const sampleCount=Number(opts.samples||10000),seed=String(opts.seed||'demo');
 const result={profile:preset,map:{width:preset.side,height:preset.side,topology:'torus'},region:region(seed,5,5,'c'),sites:specialSites(seed,preset.side,preset.side),statistics:benchmark(sampleCount,seed)};
 console.log(JSON.stringify(opts.json?result:{profile:result.profile,region:result.region,siteCount:result.sites.length,stats:result.statistics},null,2));
}
