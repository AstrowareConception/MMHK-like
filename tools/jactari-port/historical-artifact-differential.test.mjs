import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalArtifactTables,runOriginalArtifactSpellBonus} from './historical-artifact-oracle.mjs';
import {calculateArtifactSpellBonus} from './artifact-spell-bonus.mjs';
const catalog=historicalArtifactTables();
const cat=catalog.categories;
const includes=(key,id)=>cat[key]?.includes(id);
const schools=[['e_invocation',0],['e_tenebres',1],['e_lumiere',2],['e_destruction',3]];
const weapons=[['infanterie','I'],['archerie','R'],['cavalerie','C']];
const all=catalog.artifacts.map((a,id)=>a?.effets?.some(e=>includes('ensemble',e.id))?
 {artifact:a,id}:null).filter(Boolean);
function guided(effect){
 const id=effect.id;
 let circle=2;
 for(let i=1;i<=5;i++)if(cat.cercle[i].includes(id)){circle=i;break;}
 const school=schools.find(([key])=>includes(key,id))?.[1]??3;
 const type=includes('degats',id)?0:includes('invocation',id)?1:4;
 const target=includes('attaque',id)?5:includes('defense',id)?6:4;
 const unit=includes('degats_zone',id)?1:includes('degats_directs',id)?3:
   includes('heros',id)?5:1;
 const weapon=weapons.find(([key])=>includes(key,id))?.[1]??'I';
 return {spell:{school,type,target,unit,circle},
  castingWeapon:weapon,opposingWeapon:weapon};
}
function compare(gear,spell,castingWeapon,opposingWeapon,label){
 const a=runOriginalArtifactSpellBonus({artifactIds:gear,spell,castingWeapon,opposingWeapon});
 const b=calculateArtifactSpellBonus({artifactIds:gear,spell,castingWeapon,opposingWeapon,catalog});
 assert.equal(b.bonus,a.bonus,label+' source='+a.bonus+' port='+b.bonus+
  ' spell='+JSON.stringify(spell)+' gear='+gear.join(','));
 return a.bonus;
}
test('original Jactari artifact catalog is populated and contains real spell effects',()=>{
 assert.ok(catalog.slotCount>=6);
 assert.ok(all.length>=10);
 assert.ok(cat.ensemble.includes(41));
 assert.ok(catalog.effects[41]?.v?.length>0);
});
test('real artifact bonus eligibility: 100 guided cases against original source',()=>{
 let nonzero=0;
 const eligible=all.filter(({artifact})=>artifact.effets.some(e=>includes('ensemble',e.id)));
 for(let i=0;i<100;i++){
  const {artifact,id}=eligible[i%eligible.length];
  const effect=artifact.effets.find(e=>includes('ensemble',e.id));
  const gear=Array(catalog.slotCount).fill(0);
  const slot=Number(artifact.slot);
  gear[Number.isInteger(slot)&&slot>=0&&slot<gear.length?slot:0]=id;
  const input=guided(effect);
  if(compare(gear,input.spell,input.castingWeapon,input.opposingWeapon,'guided '+i)>0)nonzero++;
 }
 assert.ok(nonzero>5,'reference fixture must exercise actual nonzero magical artefact bonuses');
});
test('180 seeded multi-equipment spells compared to authentic catalog filtering',()=>{
 let seed=20261026;
 const rnd=()=>{seed^=seed<<13;seed^=seed>>>17;seed^=seed<<5;return(seed>>>0)/4294967296;};
 const pick=a=>a[Math.floor(rnd()*a.length)];
 for(let i=0;i<180;i++){
  const chosen=pick(all),art=chosen.artifact,gear=Array(catalog.slotCount).fill(0);
  const slot=Number(art.slot);
  gear[Number.isInteger(slot)&&slot>=0&&slot<gear.length?slot:0]=chosen.id;
  const e=pick(art.effets.filter(e=>includes('ensemble',e.id)));
  const input=guided(e);
  // Flip some dimensions deliberately to verify filtering out effects.
  if(i%3===0)input.spell.circle=pick([1,2,3,4,5]);
  if(i%5===0)input.opposingWeapon=pick(['I','R','C']);
  if(i%7===0)input.spell.school=pick([0,1,2,3]);
  compare(gear,input.spell,input.castingWeapon,input.opposingWeapon,'seed '+i);
 }
});
test('artifact effects never come from an untrusted forged slot',()=>{
 assert.throws(()=>calculateArtifactSpellBonus({
  artifactIds:[999999,...Array(catalog.slotCount-1).fill(0)],
  spell:{school:0,type:1,target:0,unit:0,circle:1},
  castingWeapon:'I',opposingWeapon:'I',catalog
 }),/Invalid equipped artifact/);
});
