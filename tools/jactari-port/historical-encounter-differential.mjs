/**
 * Compare exact original Jactari full-encounter execution in a headless shim
 * with the unified port. Includes final irreversible losses by regular slot.
 * SPDX-License-Identifier: GPL-3.0-or-later
 */
import {runHistoricalEncounter} from './historical-encounter-harness.mjs';
import {simulateUnifiedBattle} from './unified-battle.mjs';

export function compareHistoricalEncounter(input) {
  const legacy=runHistoricalEncounter(input);
  const modern=simulateUnifiedBattle({...input,lossPolicy:{
    lossFactor:input.lossFactor??0.25,source:'V62_TEST_NON_S2'
  }});
  const differences=[];
  const check=(path,expected,actual)=>{
    if(typeof expected==='number' && typeof actual==='number'?
      !(Number.isFinite(expected)&&Number.isFinite(actual)&&
        Math.abs(expected-actual)<=1e-9*Math.max(1,Math.abs(expected),Math.abs(actual))) :
      expected!==actual)
      differences.push({path,historical:expected,unified:actual});
  };
  check('status',legacy.status,modern.status);
  const hd=legacy.events.filter(x=>x.phase==='duel');
  const md=modern.events.filter(x=>x.phase==='duel');
  check('rounds',hd.length,md.length);
  for(let i=0;i<Math.min(hd.length,md.length);i++){
    const a=hd[i],b=md[i],key='duel['+i+']';
    for(const f of ['turn','attackerSlot','defenderSlot'])check(key+'.'+f,a[f],b[f]);
    for(const side of ['attacker','defender']){
      check(key+'.losses.'+side,a.losses[side],b.duel.losses[side]);
      check(key+'.remaining.'+side,a.remaining[side],b.duel.remaining[side]);
      const modernUnit=modern.battlefield[side][b[side+'Slot']];
      if (modernUnit)
        check(key+'.startPower.'+side,
          a.before[side]*modernUnit.unitPower,b.duel.basePower[side]);
    }
    check(key+'.draw',a.draw,b.duel.draw);
    check(key+'.falseDraw',a.falseDraw,b.duel.falseDraw);
  }
  for(const side of ['attacker','defender']){
    const historicSpells=legacy.events.filter(x=>x.phase==='spell'&&x.side===side);
    const modernDeclared=modern.events.filter(x=>x.side===side&&
      ['summon','summon-no-effect','spell','spell-declared'].includes(x.phase));
    check('spells.'+side+'.count',historicSpells.length,modernDeclared.length);
    for(let i=0;i<Math.min(historicSpells.length,modernDeclared.length);i++){
      check('spells.'+side+'['+i+'].turn',historicSpells[i].turn,modernDeclared[i].turn);
    }
    for(let i=0;i<7;i++){
      const a=legacy.battlefield[side][i+2],b=modern.battlefield[side][i+2];
      check('battlefield.'+side+'['+i+'].present',Boolean(a),Boolean(b));
      if(a&&b){
        for(const [from,to] of [
          ['remaining','remaining'],['roundLosses','roundLosses'],
          ['magicLosses','magicLosses'],['bonusLost','bonusLost'],
          ['raisedDuringBattle','raisedDuringBattle'],['bonusTroops','bonusTroops']
        ])check('battlefield.'+side+'['+i+'].'+from,a[from],b[to]);
      }
      check('permanent.'+side+'['+i+']',
        legacy.permanent[side][i],modern.permanent[side].reports[i]?.permanent??null);
    }
    for(let i=0;i<2;i++){
      const a=legacy.battlefield[side][i],b=modern.battlefield[side][i];
      check('summon.'+side+'['+i+'].present',Boolean(a),Boolean(b));
      if(a&&b)check('summon.'+side+'['+i+'].remaining',a.remaining,b.remaining);
    }
  }
  for(const [side,stat] of [['attacker','attaque_modifiee'],['defender','defense_modifiee']])
    if(legacy.hero[side][stat]!==undefined && modern.heroes[side]?.[stat]!==undefined)
      check('hero.'+side+'.'+stat,legacy.hero[side][stat],modern.heroes[side][stat]);
  return {equal:differences.length===0,differences,
    historic:legacy,modern,
    scope:'original encounter + original spell function + original duel / injected effective spell power and bonuses'};
}
