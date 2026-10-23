/** DOM-free bounded extraction of Jactari simulation_combat. SPDX-License-Identifier: GPL-3.0-or-later. */
export function resolveStackDuel({attacker:a,defender:d,modifiers:m={}}){
  for(const x of [a,d])if(!x||!Number.isSafeInteger(x.count)||x.count<=0||!Number.isFinite(x.unitPower)||x.unitPower<=0)throw new RangeError('Invalid stack');
  const keys=['attackStackHero','attackUnitsHero','attackWeapon','attackSpecial','defendStackHero','defendUnitsHero','defendWeapon','defendSpecial','defendFortification'];
  const b=Object.fromEntries(keys.map(k=>[k,m[k]??0]));if(keys.some(k=>!Number.isFinite(b[k])))throw new RangeError('Invalid modifier');
  const ba=a.count*a.unitPower,bd=d.count*d.unitPower;
  const xa=ba*(b.attackStackHero+b.attackWeapon+b.attackSpecial)+a.count*b.attackUnitsHero;
  const xd=bd*(b.defendStackHero+b.defendWeapon+b.defendSpecial+b.defendFortification)+d.count*b.defendUnitsHero;
  const pa=ba+xa,pd=bd+xd;let la,ld,ra=a.count,rd=d.count,da=false,dd=false,draw=false,falseDraw=0;
  if(pa>pd){
    ld=d.count;rd=0;dd=true;
    const delta=Math.floor(pa)-Math.floor(pd);
    if(delta>ba)la=-1;
    else{la=Math.floor((Math.floor(pd)-Math.floor(xa))/a.unitPower);ra-=la;if(ra===0)falseDraw=1;}
  }else{
    la=a.count;ra=0;da=true;
    const delta=Math.floor(pd)-Math.floor(pa);
    if(delta>bd)ld=-1;
    else{
      ld=Math.floor((Math.floor(pa)-Math.floor(xd))/d.unitPower);
      if(delta>0){rd-=ld;if(rd===0)falseDraw=-1;}
      else{ld=d.count;rd=0;dd=true;draw=true;}
    }
  }
  return {basePower:{attacker:ba,defender:bd},bonusPower:{attacker:xa,defender:xd},totalPower:{attacker:pa,defender:pd},losses:{attacker:la,defender:ld},remaining:{attacker:ra,defender:rd},dispersed:{attacker:da,defender:dd},draw,falseDraw,scope:'single-stack-only',note:'Jactari -1 loss sentinel means overwhelming victory; do not interpret as negative casualties'};
}
export function validateArmySlots(slots){
  if(!Array.isArray(slots)||slots.length!==7)throw new RangeError('Seven ordered slots required');
  slots.forEach((x,i)=>{if(x!=null&&(!Number.isSafeInteger(x.count)||x.count<=0||!Number.isFinite(x.unitPower)||x.unitPower<=0))throw new RangeError('Invalid slot '+(i+1));});return true;
}
