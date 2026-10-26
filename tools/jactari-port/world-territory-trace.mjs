/**
 * V7.0 experimental, candidate toroidal tile traversal and territory labels.
 * The centre-to-centre line is a GEOMETRIC HYPOTHESIS; no Ubisoft S2 route
 * selection or diplomacy defaults are inferred.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {validateWorldCoordinate,jactariToroidalDistance} from './world-distance.mjs';

const ID=/^[A-Za-z0-9_-]{1,64}$/;
const identifier=(v,name)=>{if(typeof v!=='string'||!ID.test(v))
 throw new RangeError('Invalid '+name);return v;};
const record=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
const key=({x,y})=>x+','+y;
const wrap=(v,size)=>((v-1)%size+size)%size+1;
const MAX_SPANS=8192;
const EPS=1e-12;
const finite=(v,name)=>{if(typeof v!=='number'||!Number.isFinite(v)||v<0)
 throw new RangeError('Invalid '+name);return v;};

export function traceToroidalTileLine(from,to,worldSize){
 validateWorldCoordinate(from,worldSize);
 validateWorldCoordinate(to,worldSize);
 let dx=to.x-from.x,dy=to.y-from.y;
 if(dx>worldSize/2)dx-=worldSize;
 if(dx< -worldSize/2)dx+=worldSize;
 if(dy>worldSize/2)dy-=worldSize;
 if(dy< -worldSize/2)dy+=worldSize;
 const distance=jactariToroidalDistance(from,to,worldSize);
 if(distance===0)return [];
 if(Math.abs(dx)+Math.abs(dy)+1>MAX_SPANS)
  throw new RangeError('Candidate trace exceeds safe tile crossing limit');
 const ts=[0,1];
 for(const delta of [dx,dy])
  for(let j=0;j<Math.abs(delta);j++)ts.push((j+.5)/Math.abs(delta));
 ts.sort((a,b)=>a-b);
 const times=ts.filter((t,i)=>i===0||t-ts[i-1]>EPS);
 const spans=[];
 for(let i=1;i<times.length;i++){
  const start=times[i-1],end=times[i];
  if(end-start<=EPS)continue;
  const mid=(start+end)/2;
  const tile={x:wrap(Math.floor(from.x+dx*mid+.5),worldSize),
   y:wrap(Math.floor(from.y+dy*mid+.5),worldSize)};
  const part=distance*(end-start);
  const prev=spans.at(-1);
  if(prev&&prev.tile.x===tile.x&&prev.tile.y===tile.y){
   prev.exitT=end;prev.distanceUnits+=part;
  }else{
   if(spans.length===MAX_SPANS)throw new RangeError('Too many crossed tiles');
   spans.push({tile,entryT:start,exitT:end,distanceUnits:part});
  }
 }
 return spans;
}
const validateSnapshot=(snapshot)=>{
 if(!record(snapshot)||typeof snapshot.worldId!=='string'||
  !Number.isSafeInteger(snapshot.worldSize)||snapshot.worldSize<2||
  !Number.isSafeInteger(snapshot.revision)||snapshot.revision<0)
  throw new TypeError('Versioned trusted territory snapshot required');
 for(const field of ['cities','claims','memberships','relations','alliances'])
  if(!Array.isArray(snapshot[field]))throw new TypeError('Snapshot missing '+field);
 return snapshot;
};
/**
 * No relation entry for an occupied rival tile means UNKNOWN, never neutral.
 * 'targetAlliance' is an explicit server-supplied Grail scope override.
 */
export function deriveCandidateTerritorialSegments({
 snapshot,actingPlayerId,targetAllianceId=null,waypoints
}){
 validateSnapshot(snapshot);
 identifier(actingPlayerId,'acting player');
 if(targetAllianceId!==null)identifier(targetAllianceId,'target alliance');
 if(!Array.isArray(waypoints)||waypoints.length<2||waypoints.length>256)
  throw new RangeError('2..256 world waypoints required');
 const size=snapshot.worldSize;
 const points=waypoints.map(p=>({...validateWorldCoordinate(p,size)}));
 const alliances=new Set(snapshot.alliances.map(a=>identifier(a,'alliance')));
 if(targetAllianceId!==null&&!alliances.has(targetAllianceId))
  throw new Error('Unknown target alliance in this world');
 const memberships=new Map();
 for(const m of snapshot.memberships){
  identifier(m.playerId,'membership player');identifier(m.allianceId,'membership alliance');
  if(!alliances.has(m.allianceId)||memberships.has(m.playerId))
   throw new Error('Inconsistent snapshot membership');
  memberships.set(m.playerId,m.allianceId);
 }
 const myAlliance=memberships.get(actingPlayerId)??null;
 if(targetAllianceId!==null&&targetAllianceId===myAlliance)
  throw new Error('Cannot designate own alliance as target');
 const claims=new Map();
 const cities=new Map();
 for(const c of snapshot.cities){
  validateWorldCoordinate(c,size);identifier(c.ownerPlayerId,'city owner');
  if(cities.has(key(c)))throw new Error('Duplicate city tile snapshot');
  cities.set(key(c),{ownerPlayerId:c.ownerPlayerId,ownerAllianceId:null});
 }
 for(const c of snapshot.claims){
  validateWorldCoordinate(c,size);
  const ownPlayer=c.ownerPlayerId??null,ownAlliance=c.ownerAllianceId??null;
  if((ownPlayer===null)===(ownAlliance===null))
   throw new Error('Territory claims require exactly one owner type');
  if(ownPlayer!==null)identifier(ownPlayer,'claim player');
  if(ownAlliance!==null&&!alliances.has(ownAlliance))
   throw new Error('Claim has unknown owner alliance');
  if(cities.has(key(c))||claims.has(key(c)))
   throw new Error('Duplicate or city-overlapping territory claim');
  claims.set(key(c),{ownerPlayerId:ownPlayer,ownerAllianceId:ownAlliance});
 }
 const relations=new Map();
 for(const r of snapshot.relations){
  if(!['allied','hostile','neutral'].includes(r.relation)||
   !alliances.has(r.allianceA)||!alliances.has(r.allianceB)||
   r.allianceA>=r.allianceB)
   throw new Error('Invalid diplomatic relation snapshot');
  const code=r.allianceA+'|'+r.allianceB;
  if(relations.has(code))throw new Error('Duplicate diplomatic relation');
  relations.set(code,r.relation);
 }
 const classify=tile=>{
  const owner=claims.get(key(tile))??cities.get(key(tile));
  if(!owner)return 'neutral'; // explicit absence of a city or claim
  if(owner.ownerPlayerId===actingPlayerId)return 'friendly';
  const alliance=owner.ownerAllianceId??memberships.get(owner.ownerPlayerId)??null;
  if(alliance===myAlliance&&alliance!==null)return 'allied';
  if(alliance===targetAllianceId&&alliance!==null)return 'targetAlliance';
  if(!alliance||!myAlliance)
   throw new Error('Unknown diplomacy for independent player or alliance');
  const relation=relations.get([alliance,myAlliance].sort().join('|'));
  if(!relation)throw new Error('Unknown diplomacy between alliances');
  return relation==='allied'?'allied':relation==='hostile'?'hostile':'neutral';
 };
 const segments=[];
 let distance=0;
 for(let i=1;i<points.length;i++){
  for(const span of traceToroidalTileLine(points[i-1],points[i],size)){
   const territory=classify(span.tile);
   const last=segments.at(-1);
   const tile=span.tile;
   // Merge only within a single straight leg: using a new leg could
   // conceal a waypoint turn that must remain an audit boundary.
   if(last&&last.legIndex===i-1&&last.territory===territory){
    last.distanceUnits+=span.distanceUnits;
    last.exitTile=tile;
   }else{
    segments.push({legIndex:i-1,entryTile:tile,exitTile:tile,
     territory,distanceUnits:span.distanceUnits,durationFactor:1});
   }
   distance+=span.distanceUnits;
  }
 }
 if(!segments.length)throw new Error('Zero-distance territorial route');
 if(segments.length>MAX_SPANS)throw new RangeError('Too many territorial segments');
 const expected=points.slice(1).reduce((sum,p,i)=>sum+jactariToroidalDistance(points[i],p,size),0);
 if(Math.abs(distance-expected)>Math.max(1,expected)*1e-9)
  throw new Error('Toroidal tile partition does not preserve distance');
 return {worldId:snapshot.worldId,worldSize:size,worldRevision:snapshot.revision,
  actingPlayerId,targetAllianceId,waypoints:points,
  totalDistance:distance,segments,authoritativeArrivalTime:false,
  historicalCertification:false,
  provenance:'Explicit persisted tile claims + city tile ownership; centre-line toroidal partition is a candidate geometry',
  limitations:['No territorial radius inferred from a city','Unknown diplomacy blocks preview',
   'No Ubisoft S2 server route or PvP authorization certified']};
}
