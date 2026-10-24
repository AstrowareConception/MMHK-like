import test from 'node:test';
import assert from 'node:assert/strict';
import {runHistoricalEncounter} from './historical-encounter-harness.mjs';
import {simulateUnifiedBattle} from './unified-battle.mjs';
const unit=(count,weapon='I',unitPower=10)=>({count,weapon,unitPower,goldCost:5});
const slots=(...s)=>Array.from({length:7},(_,i)=>s[i]??null);
const catalog=[{faction:1,weapon:'I',unitPower:10},
  {faction:1,weapon:'R',unitPower:10},{faction:2,weapon:'I',unitPower:10},
  {faction:2,weapon:'R',unitPower:10}];
const heroes={attackerHero:{faction:1,attaque_modifiee:0},
  defenderHero:{faction:2,defense_modifiee:0}};
const scenarios=[
  {id:'ordinary-100-50',attackers:slots(unit(100)),defenders:slots(unit(50))},
  {id:'ordinary-50-100',attackers:slots(unit(50)),defenders:slots(unit(100))},
  {id:'mutual-equal-50',attackers:slots(unit(50)),defenders:slots(unit(50))},
  {id:'ordered-defender',attackers:slots(unit(120)),defenders:slots(unit(30),unit(40))},
  {id:'ordered-attacker',attackers:slots(unit(25),unit(60)),defenders:slots(unit(70))},
  {id:'weapon-advantage',attackers:slots(unit(100,'I')),defenders:slots(unit(80,'C')),
    context:{weaponAdvantageFactor:.25}},
  {id:'hero-bonuses',attackers:slots(unit(110,'R')),defenders:slots(unit(100,'I')),
    context:{attackerHero:{faction:1,attaque_modifiee:40},weaponAdvantageFactor:.25}}
];
const fixtures=scenarios.map(x=>({...x,unitCatalog:catalog,context:{...heroes,...x.context},
    lossFactor:.25}));
function analyze(input){
  const historic=runHistoricalEncounter(input);
  const modern=simulateUnifiedBattle({...input,
    lossPolicy:{lossFactor:input.lossFactor,source:'V62_TEST_NON_S2'}});
  const changes=[];
  const check=(name,a,b)=>{if(a!==b)changes.push({name,historic:a,modern:b});};
  check('status',historic.status,modern.status);
  const duels=modern.events.filter(x=>x.phase==='duel');
  check('duel-count',historic.rounds,duels.length);
  for(let i=0;i<Math.min(historic.rounds,duels.length);i++){
    const a=historic.events.filter(x=>x.phase==='duel')[i],b=duels[i];
    for (const field of ['turn','attackerSlot','defenderSlot'])check('duels['+i+'].'+field,a[field],b[field]);
    for(const side of ['attacker','defender']){
      check('duels['+i+'].losses.'+side,a.losses[side],b.duel.losses[side]);
      check('duels['+i+'].remaining.'+side,a.remaining[side],b.duel.remaining[side]);
    }
  }
  for(const side of ['attacker','defender']){
    for(let i=0;i<7;i++){
      check('permanent.'+side+'['+i+']',historic.permanent[side][i],
        modern.permanent[side].reports[i]?.permanent??null);
    }
  }
  return {historic,modern,changes};
}
for(const input of fixtures){
  test('real Jactari full encounter: '+input.id,()=>{
    const result=analyze(input);
    assert.deepEqual(result.changes,[],input.id+': '+JSON.stringify(result.changes.slice(0,12)));
  });
}
test('historical encounter reports native rows and permanent losses separately',()=>{
 const r=runHistoricalEncounter(fixtures[0]);
 assert.equal(r.rounds,1);
 assert.equal(r.permanent.attacker[0],12);
 assert.equal(r.permanent.defender[0],12);
 assert.equal(r.htmlRows.losses,1);
});
test('historic full-encounter sandbox rejects unsupported PvE modes',()=>{
 assert.throws(()=>runHistoricalEncounter({...fixtures[0],context:{pvp:false}}),/Unported phase/);
});
test('historical full-encounter source is immutable and replay deterministic',()=>{
 const input=structuredClone(fixtures[0]),original=structuredClone(input);
 const a=runHistoricalEncounter(input),b=runHistoricalEncounter(input);
 assert.deepEqual(a.events,b.events);assert.deepEqual(input,original);
});
