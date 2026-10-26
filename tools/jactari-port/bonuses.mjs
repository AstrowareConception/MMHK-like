/** Pure Jactari bonus_attaque_defense adapter. GPL-3.0-or-later derivative.
 * heroPolicy='jactari-original' preserves upstream legendary-warrior predicate error.
 * heroPolicy='normalized' is an explicit, NON-historical proposed correction.
 */
const value=(o,k)=>Number(o?.[k]??0),pct=(o,k)=>value(o,k)/100;
const beats=(a,d)=>(a==='I'&&d==='C')||(a==='R'&&d==='I')||(a==='C'&&d==='R');
export function calculateBonuses({attackerWeapon:aw,defenderWeapon:dw,attackerHero:a=null,defenderHero:d=null,morale={},special={},weaponAdvantageFactor=0,fortification={},heroPolicy='jactari-original'}){
  if(!['jactari-original','normalized'].includes(heroPolicy))throw new RangeError('Unknown hero fidelity mode');
  if(!['I','R','C'].includes(aw)||!['I','R','C'].includes(dw))throw new RangeError('Unsupported weapon type');
  const m={attackStackHero:0,attackUnitsHero:0,attackWeapon:0,attackSpecial:0,defendStackHero:0,defendUnitsHero:0,defendWeapon:0,defendSpecial:0,defendFortification:0};
  if(a){
    m.attackUnitsHero+=value(a,'bonus_harangueur')+value(a,({I:'bonus_aui',R:'bonus_aur',C:'bonus_auc'})[aw])+value(a,'bonus_legendary_sovereign_a');
    m.attackStackHero+=value(a,'attaque_modifiee')*.005+pct(a,'bonus_tacticien');
    if(beats(aw,dw))m.attackStackHero+=pct(a,({I:'bonus_commandant_infanterie',R:'bonus_tireur_elite',C:'bonus_ecuyer'})[aw]);
  }
  if(d){
    m.defendUnitsHero+=value(d,'bonus_bon_payeur')+value(d,'bonus_du')+(dw==='I'?value(d,'bonus_dui'):0);
    m.defendStackHero+=value(d,'defense_modifiee')*.005+pct(d,'bonus_tacticien_defenseur');
    if(beats(dw,aw))m.defendStackHero+=pct(d,({I:'bonus_inebranlable',R:'bonus_expert_tirs_barrage',C:'bonus_ecuyer_defenseur'})[dw]);
    if(heroPolicy==='jactari-original'){
      // Original function checks the ATTACKER hero field twice, then adds
      // the DEFENDER hero field twice. Preserve this versioned anomaly.
      if(a&&Object.prototype.hasOwnProperty.call(a,'bonus_legendary_legwarrior_b')){
        const valueOriginal=d.bonus_legendary_legwarrior_b/100;
        m.defendStackHero+=valueOriginal;
        m.defendStackHero+=valueOriginal;
      }
    }else m.defendStackHero+=pct(d,'bonus_legendary_legwarrior_b');
  }
  if(a)m.attackStackHero+=Number(morale.attacker??0)/100;
  if(d)m.defendStackHero+=Number(morale.defender??0)/100;
  m.attackSpecial+=Number(special.attackerTraps??0)*Number(special.trapBonus??0)/100;
  m.defendSpecial+=Number(special.defenderTraps??0)*Number(special.trapBonus??0)/100;
  if(beats(aw,dw))m.attackWeapon+=weaponAdvantageFactor;
  if(beats(dw,aw))m.defendWeapon+=weaponAdvantageFactor;
  const place=fortification.place??0;let bonus=0;
  if(place===1)bonus+=(Number(fortification.city??0)+Number(fortification.tears??0))/100;
  if(place===2)bonus+=Number(fortification.region??0)/100;
  if(place===1||place===2)bonus+=pct(d,'bonus_batisseur_fortifications')-pct(a,'bonus_sapeur')-pct(a,'bonus_legendary_legwarrior_c')-pct(a,'bonus_legendary_ethernalnight_b');
  m.defendFortification=Math.max(0,bonus);
  if(Object.values(m).some(x=>!Number.isFinite(x)))throw new RangeError('Non-finite modifier (including possible original legendary-warrior bug)');
  return m;
}
