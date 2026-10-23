/** Pure final temporary resurrection cleanup; Jactari simulation_rencontre, GPL-3.0-or-later.
 * Projection for displayed final combat count; never persist temporary units.
 */
export function projectTerminalTemporaryRevival({status,attacker,defender,lastRevival=null}){
 if(!['attacker','defender','mutual-dispersion'].includes(status))throw new RangeError('Invalid battle result');
 const groups={attacker,defender};
 for(const army of Object.values(groups))
  if(!Array.isArray(army)||army.length!==7)throw new RangeError('Seven slots required');
 const displayed=Object.fromEntries(Object.entries(groups).map(([side,slots])=>[
  side,slots.map(s=>s?s.remaining:null)]));
 let cleanup=null;
 if(status!=='mutual-dispersion'&&lastRevival?.mode==='tmp'&&lastRevival.side===status){
  const slots=groups[status],i=lastRevival.slot-1;
  if(!Number.isSafeInteger(i)||i<0||i>=7)throw new RangeError('Invalid revival slot');
  const lastActive=slots.findIndex(s=>s&&s.remaining>0&&!s.dispersed);
  if(lastActive===i){
   const stack=slots[i];
   if(!Number.isSafeInteger(lastRevival.revived)||lastRevival.revived<0)throw new RangeError('Invalid revival');
   const before=stack.remaining;
   displayed[status][i]=Math.max(0,before-lastRevival.revived);
   cleanup={phase:'terminal-temporary-cleanup',side:status,slot:i+1,
    temporaryUnitsRemoved:before-displayed[status][i],before,after:displayed[status][i]};
  }
 }
 return {displayed,cleanup};
}
