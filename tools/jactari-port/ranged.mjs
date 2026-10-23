/** Pure pre-battle salvo extracted from tir_engins_siege in Jactari.
 * SPDX-License-Identifier: GPL-3.0-or-later. The original applies salvo casualties after collecting attacks.
 * Slots are ordered, 1..7; each nonempty slot is {count,unitPower,weapon,siege}.
 */
export function calculateSalvo({shooters,targets,kind='R',percent=100}) {
  if(!Array.isArray(shooters)||!Array.isArray(targets)||shooters.length!==7||targets.length!==7)throw new RangeError('Seven slots per army required');
  if(!['R','T','E'].includes(kind)||!Number.isFinite(percent)||percent<0)throw new RangeError('Invalid salvo');
  for(const stack of [...shooters,...targets].filter(Boolean)) {
    if(!Number.isSafeInteger(stack.count)||stack.count<0||!Number.isFinite(stack.unitPower)||stack.unitPower<=0)throw new RangeError('Invalid stack');
  }
  let strength=0;
  for(const s of shooters.filter(Boolean)) {
    if(kind==='R'&&s.weapon!=='R')continue;
    if(kind==='E'&&!s.siege)continue;
    const unit=kind==='E'?(s.unitPower===300?1100:1600):s.unitPower;
    strength+=unit*s.count;
  }
  const available=strength*(percent/100), casualties=Array(7).fill(0);
  let remaining=available;
  for(let i=0;i<7&&remaining>0;i++) {
    const t=targets[i];if(!t)continue;
    const defence=t.unitPower*t.count;
    if(remaining<=defence){casualties[i]=Math.floor(remaining/t.unitPower);remaining=0;}
    else{casualties[i]=t.count;remaining-=defence;}
  }
  return {kind,percent,strength:available,casualties,unspentPower:remaining};
}
/** Compute both sides from the same initial snapshot and apply casualty totals once. */
export function resolveSimultaneousSalvos({attackers,defenders,attackerSalvos=[],defenderSalvos=[]}) {
  if(!Array.isArray(attackers)||attackers.length!==7||!Array.isArray(defenders)||defenders.length!==7)throw new RangeError('Seven slots required');
  const hitsOnDefenders=attackerSalvos.map(s=>calculateSalvo({shooters:attackers,targets:defenders,...s}));
  const hitsOnAttackers=defenderSalvos.map(s=>calculateSalvo({shooters:defenders,targets:attackers,...s}));
  function apply(stacks,salvos){
    const killed=Array.from({length:7},(_,i)=>Math.min(stacks[i]?.count??0,salvos.reduce((n,s)=>n+s.casualties[i],0)));
    const survivors=stacks.map((s,i)=>s?{...s,count:s.count-killed[i]}:null);
    return {killed,survivors};
  }
  return {attacker:apply(attackers,hitsOnAttackers),defender:apply(defenders,hitsOnDefenders),hitsOnDefenders,hitsOnAttackers};
}
