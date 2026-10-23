/** Exact bounded extraction of Jactari's post-duel spell resurrection arithmetic.
 * GPL-3.0-or-later. This does not determine spell selection, power or mana.
 */
export function resolvePostDuelRevival({remaining,losses,roundStart,mode,percent}){
 if(!['tmp','def'].includes(mode))throw new RangeError('Unsupported revival mode');
 for(const v of [remaining,losses,roundStart,percent])if(!Number.isFinite(v)||v<0)throw new RangeError('Invalid revival input');
 if(!Number.isInteger(remaining)||!Number.isInteger(roundStart))throw new RangeError('Unit counts must be integers');
 if(remaining===0)return {revived:0,remaining,recordedLossAdjustment:0,temporary:mode==='tmp'};
 const basis=mode==='tmp'?(losses===-1?0:losses):remaining;
 const quota=Math.floor(basis*percent/100);
 const revived=Math.max(0,Math.min(quota,roundStart-remaining));
 return {revived,remaining:remaining+revived,recordedLossAdjustment:mode==='def'?-revived:0,temporary:mode==='tmp'};
}
