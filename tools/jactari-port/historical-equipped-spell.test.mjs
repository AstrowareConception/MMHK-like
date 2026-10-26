import test from 'node:test';
import assert from 'node:assert/strict';
import {historicalArtifactTables} from './historical-artifact-oracle.mjs';
import {runOriginalSpellPower} from './historical-spell-power-oracle.mjs';
import {calculateEffectiveSpellPower} from './spell-power.mjs';
const catalog=historicalArtifactTables(),c=catalog.categories;
const has=(k,id)=>c[k].includes(id);
const variants=catalog.artifacts.map((artifact,id)=>artifact?.effets?.some(e=>has('ensemble',e.id))?
 {artifact,id}:null).filter(Boolean);
function inputFor(item){
 const {artifact,id}=item;
 const eff=artifact.effets.find(e=>has('ensemble',e.id)).id;
 const school=[['e_invocation',0],['e_tenebres',1],['e_lumiere',2],['e_destruction',3]]
   .find(([key])=>has(key,eff))?.[1]??3;
 let circle=1;
 for(let i=1;i<=5;i++)if(c.cercle[i].includes(eff)){circle=i;break;}
 const unit=has('degats_zone',eff)?1:has('degats_directs',eff)?3:
   has('heros',eff)?5:1;
 const type=has('degats',eff)?0:has('invocation',eff)?1:4;
 const target=has('attaque',eff)?5:has('defense',eff)?6:4;
 const weapon=[['infanterie','I'],['archerie','R'],['cavalerie','C']]
   .find(([key])=>has(key,eff))?.[1]??'I';
 const artifactIds=Array(catalog.slotCount).fill(0);
 const slot=Number(artifact.slot);
 artifactIds[Number.isInteger(slot)&&slot>=0&&slot<artifactIds.length?slot:0]=id;
 return {spell:{school,unit,circle,type,target,power:10,
   factors:{I:1,R:1.5,C:.5}},side:'attacker',
   attackerWeapon:weapon,defenderWeapon:weapon,
   hero:{magie:25,bonus_mp:20,bonus_m:5,
    ['bonus_instinct_'+school]:4,['bonus_expert_'+school]:15},
   artifactIds};
}
test('120 equipped hero spells agree with original full spell-power AND artifact functions',()=>{
 let actualPositive=0;
 for(let i=0;i<120;i++){
  const {artifactIds,...input}=inputFor(variants[i%variants.length]);
  const original=runOriginalSpellPower({...input,artifactIds});
  const port=calculateEffectiveSpellPower({...input,
    artifactContext:{artifactIds,catalog}});
  assert.ok(Number.isFinite(original.power));
  assert.ok(Math.abs(port.power-original.power)<1e-8*
    Math.max(1,Math.abs(port.power),Math.abs(original.power)),
    'case '+i+' original '+original.power+' port '+port.power+' spell '+JSON.stringify(input.spell));
  if(port.bonuses.artifactEfficiencyPercent>0)actualPositive++;
 }
 assert.ok(actualPositive>10,'Real magical equipment must contribute in the fixture set');
});
test('equipped artifacts cannot be stacked with caller-forged efficiency percentage',()=>{
 const {artifactIds,...input}=inputFor(variants[0]);
 assert.throws(()=>calculateEffectiveSpellPower({...input,artifactEfficiencyPercent:25,
  artifactContext:{artifactIds,catalog}}),/cannot both supply/);
});
