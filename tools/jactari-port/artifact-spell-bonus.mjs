/**
 * Pure port of Jactari bonus_magie_artefacts() eligibility arithmetic.
 * Catalog must be trusted and versioned; never take effects from client JSON.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
const includes=(xs,id)=>Array.isArray(xs)&&xs.includes(id);
function categoryOf(sets,id,names){
  for(const [value,name] of names)if(includes(sets[name],id))return value;
  return -1;
}
export function calculateArtifactSpellBonus({
 artifactIds,spell,castingWeapon,opposingWeapon,catalog
}){
 const {artifacts,effects,categories,slotCount}=catalog??{};
 if(!Array.isArray(artifacts)||!Array.isArray(effects)||!categories||
   !Number.isSafeInteger(slotCount)||slotCount<0||
   !Array.isArray(artifactIds)||artifactIds.length!==slotCount)
  throw new RangeError('Trusted Jactari artifact catalog and every slot required');
 if(!spell||!Number.isInteger(spell.school)||!Number.isInteger(spell.type)||
   !Number.isInteger(spell.target)||!Number.isInteger(spell.unit)||!Number.isInteger(spell.circle))
  throw new RangeError('Resolved historic spell signature required');
 if(!['I','R','C'].includes(castingWeapon)||!['I','R','C'].includes(opposingWeapon))
  throw new RangeError('Both creature weapons required');
 let bonus=0;const applications=[];
 for(let slot=0;slot<slotCount;slot++){
  const id=artifactIds[slot],artifact=artifacts[id];
  if(!Number.isSafeInteger(id)||!artifact||!Array.isArray(artifact.effets))
   throw new RangeError('Invalid equipped artifact in slot '+slot);
  for(const effect of artifact.effets){
   if(!includes(categories.ensemble,effect.id))continue;
   const school=categoryOf(categories,effect.id,[
    [0,'e_invocation'],[1,'e_tenebres'],[2,'e_lumiere'],[3,'e_destruction']]);
   const affectedWeapon=categoryOf(categories,effect.id,[
    ['I','infanterie'],['R','archerie'],['C','cavalerie']]);
   let circle=-1;
   for(let i=1;i<=5;i++)if(includes(categories.cercle[i],effect.id)){circle=i;break;}
   const type=categoryOf(categories,effect.id,[[0,'degats'],[1,'invocation']]);
   const target=categoryOf(categories,effect.id,[[5,'attaque'],[6,'defense']]);
   const units=includes(categories.degats_zone,effect.id)?[1,7]:
     includes(categories.degats_directs,effect.id)?[3]:null;
   const needsHero=includes(categories.heros,effect.id);
   if(school!==-1&&school!==spell.school)continue;
   if(affectedWeapon!==-1){
    if((spell.type===4||spell.type===2)&&affectedWeapon!==castingWeapon)continue;
    if(spell.type!==4&&spell.type!==2&&affectedWeapon!==opposingWeapon)continue;
    if(spell.unit===5&&spell.type===3)continue;
    if(spell.target===7)continue;
   }
   if(circle!==-1&&circle!==spell.circle)continue;
   if(type!==-1&&type!==spell.type)continue;
   if(target!==-1&&target!==spell.target)continue;
   if(units&&!units.includes(spell.unit))continue;
   if(needsHero&&spell.unit!==5&&spell.unit!==6)continue;
   const value=effects[effect.id]?.v?.[effect.niv-1];
   if(!Number.isFinite(value))throw new RangeError('Invalid historical artifact effect');
   bonus+=value;
   applications.push({slot,artifactId:id,effectId:effect.id,level:effect.niv,bonus:value});
  }
 }
 return {bonus,applications,
  provenance:'Jactari bonus_magie_artefacts exact eligibility; injected trusted catalog'};
}
