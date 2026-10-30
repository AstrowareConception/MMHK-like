import type {CSSProperties} from "react";

/** 19 individually documented HAVEN crops in the recovered Jactari sheet.
 * This is a visual representative of the class, NOT a historical assertion
 * that a new sandbox hero's name corresponds to a particular Ubisoft face.
 * The original 71 x 72 portrait is exposed only by the localhost theme route.
 */
function faceIndex(id:string,archetype:"might"|"magic"):number {
  // Use stable, predictable variation for local fantasy heroes.
  // No claim of identity correspondence until a portrait id is persisted.
  let h=archetype==="magic"?4:1;
  for(const char of id) h=(Math.imul(h,33)+char.charCodeAt(0))>>>0;
  const fighters=[1,2,3,4,5,6,10,14,15,18];
  const mages=[0,7,8,9,11,12,13,16,17];
  return (archetype==="magic"?mages:fighters)[h%(archetype==="magic"?mages.length:fighters.length)];
}

export function HeritagePortrait({heroId,archetype,sheet,fallback,scale=1,className=""}:{
  heroId:string;archetype:"might"|"magic";sheet:string|null;fallback:string;
  scale?:number;className?:string;
}){
  const crop=faceIndex(heroId,archetype);
  const style:CSSProperties={width:71*scale,height:72*scale};
  const inner:CSSProperties=sheet?{
    width:71,height:72,backgroundImage:`url(${JSON.stringify(sheet)})`,
    backgroundPosition:`-${71*crop}px 0`,backgroundRepeat:"no-repeat",
    transform:`scale(${scale})`,transformOrigin:"0 0",
  }:{width:"100%",height:"100%"};
  return <span className={"heritage-portrait "+className}
    style={style} role="img"
    aria-label={"Portrait illustratif du héros, collection Havre, "+(sheet?"graphisme historique":"illustration de remplacement")}>
    {sheet?<span className="heritage-portrait-sprite" style={inner}/>:
      <img src={fallback} width={71*scale} height={72*scale}
        alt="" draggable={false}/>}
  </span>;
}

/** The first two faction-sheet sprites represent the sandbox units.
 * Classification is illustrative; the lab's militia/archers are not
 * claimed to be the exact historical unit identifiers of these sprites.
 */
export function HeritageUnitArt({unitCode,sheet,fallback,scale=1}:{
  unitCode:string;sheet:string|null;fallback?:string;scale?:number;
}){
  const index=unitCode==="archers"?2:0;
  const historic=sheet&&["militia","archers"].includes(unitCode);
  return <span className="heritage-unit-art" style={{width:51*scale,height:52*scale}}
    role="img" aria-label="Illustration de peloton issue de la collection Havre">
    {historic?<span style={{display:"block",width:51,height:52,
      backgroundImage:`url(${JSON.stringify(sheet)})`,
      backgroundPosition:`-${51*index}px 0`,
      backgroundRepeat:"no-repeat",transform:`scale(${scale})`,
      transformOrigin:"0 0"}}/>:
      fallback?<img src={fallback} width={51*scale} height={52*scale} alt="" draggable={false}/>:
      <span aria-hidden="true">⚔</span>}
  </span>;
}
