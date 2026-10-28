"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type FormEvent } from "react";
import type { City, World } from "../lib/server-api";

type Coordinate = { x:number; y:number };
type Zoom = "detail" | "political";
type Drag = { startX:number; startY:number; dx:number; dy:number; moved:boolean };
const W=680,H=500,CX=340,CY=250;
const wrap=(value:number,size:number)=>((value-1)%size+size)%size+1;
function difference(value:number,center:number,size:number):number {
  const raw=value-center;
  return ((raw+Math.floor(size/2))%size+size)%size-Math.floor(size/2);
}
function projected(i:number,j:number,hw:number,hh:number) {
  return {x:CX+(i-j)*hw,y:CY+(i+j)*hh};
}
function diamond(x:number,y:number,hw:number,hh:number):string {
  return String(x)+","+String(y-hh)+" "+String(x+hw)+","+String(y)+" "+
    String(x)+","+String(y+hh)+" "+String(x-hw)+","+String(y);
}
function fromScreen(x:number,y:number,hw:number,hh:number) {
  const u=(x-CX)/hw,v=(y-CY)/hh;
  return { i:Math.round((u+v)/2),j:Math.round((v-u)/2) };
}
const readable=(value:Coordinate|null)=>value?"("+value.x+", "+value.y+")":"—";
export function WorldAtlasInteractive({world,cities,detailBackground,politicalBackground}:{
  world:World;cities:City[];detailBackground:string|null;politicalBackground:string|null;
}) {
  const size=world.world_size;
  const first=cities[0];
  const [center,setCenter]=useState<Coordinate>({x:first?.x??1,y:first?.y??1});
  const [zoom,setZoom]=useState<Zoom>("detail");
  const [hover,setHover]=useState<Coordinate|null>(null);
  const [selected,setSelected]=useState<Coordinate|null>(null);
  const [jumpX,setJumpX]=useState(String(first?.x??1));
  const [jumpY,setJumpY]=useState(String(first?.y??1));
  const [error,setError]=useState("");
  const [pan,setPan]=useState({x:0,y:0});
  const drag=useRef<Drag|null>(null);
  const svgRef=useRef<SVGSVGElement|null>(null);
  const hw=zoom==="detail"?38:23;
  const hh=zoom==="detail"?19:11.5;
  const background=zoom==="detail"?(detailBackground??politicalBackground):(politicalBackground??detailBackground);
  const storageKey="mmhk-map-camera:"+world.world_id;
  useEffect(()=>{
    try {
      const saved=sessionStorage.getItem(storageKey);
      if(!saved)return;
      const o=JSON.parse(saved) as {x?:number;y?:number;zoom?:Zoom;selected?:Coordinate};
      if(Number.isInteger(o.x)&&Number.isInteger(o.y)&&o.x!>=1&&o.x!<=size&&o.y!>=1&&o.y!<=size)
        setCenter({x:o.x!,y:o.y!});
      if(o.zoom==="detail"||o.zoom==="political")setZoom(o.zoom);
      if(o.selected&&Number.isInteger(o.selected.x)&&Number.isInteger(o.selected.y)
        &&o.selected.x>=1&&o.selected.x<=size&&o.selected.y>=1&&o.selected.y<=size)
        setSelected(o.selected);
    }catch {/* an invalid bookmark has no effect on the map */}
  },[storageKey,size]);
  useEffect(()=>{
    try {sessionStorage.setItem(storageKey,JSON.stringify({...center,zoom,selected}));}
    catch {/* private browsing may disable storage; navigation still works */}
  },[storageKey,center,zoom,selected]);
  const shift=(dx:number,dy:number)=>{
    setCenter(previous=>({x:wrap(previous.x+dx,size),y:wrap(previous.y+dy,size)}));
    setHover(null);
  };
  const centerOn=(x:number,y:number)=>{
    setCenter({x,y});setJumpX(String(x));setJumpY(String(y));setError("");setHover(null);
  };
  const jump=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const x=Number(jumpX),y=Number(jumpY);
    if(!/^\d+$/.test(jumpX)||!/^\d+$/.test(jumpY)||!Number.isInteger(x)||!Number.isInteger(y)
      ||x<1||y<1||x>size||y>size){setError("Coordonnées invalides : de 1 à "+size+".");return;}
    centerOn(x,y);
  };
  const visible=useMemo(()=>{
    const cells:{i:number;j:number;x:number;y:number;coord:Coordinate}[]=[];
    const radius=zoom==="detail"?17:27;
    for(let j=-radius;j<=radius;j++)for(let i=-radius;i<=radius;i++){
      const point=projected(i,j,hw,hh);
      if(point.x<-hw||point.x>W+hw||point.y<-hh||point.y>H+hh)continue;
      cells.push({...point,i,j,coord:{x:wrap(center.x+i,size),y:wrap(center.y+j,size)}});
    }
    return cells;
  },[center,size,zoom,hw,hh]);
  const marks=useMemo(()=>cities.map(city=>{
    const i=difference(city.x,center.x,size),j=difference(city.y,center.y,size);
    const pos=projected(i,j,hw,hh);
    return {city,...pos,visible:pos.x>=22&&pos.x<=W-22&&pos.y>=28&&pos.y<=H-42};
  }).filter(p=>p.visible),[cities,center,size,hw,hh]);
  const pointerCoordinate=(event:ReactPointerEvent<SVGSVGElement>):Coordinate|null=>{
    const rect=event.currentTarget.getBoundingClientRect();
    if(!rect.width||!rect.height)return null;
    const x=(event.clientX-rect.left)*W/rect.width-pan.x;
    const y=(event.clientY-rect.top)*H/rect.height-pan.y;
    const offset=fromScreen(x,y,hw,hh);
    const projectedPoint=projected(offset.i,offset.j,hw,hh);
    if(projectedPoint.x<0||projectedPoint.x>W||projectedPoint.y<0||projectedPoint.y>H)return null;
    return {x:wrap(center.x+offset.i,size),y:wrap(center.y+offset.j,size)};
  };
  const onPointerDown=(e:ReactPointerEvent<SVGSVGElement>)=>{
    if(e.button!==0||(e.target instanceof Element && e.target.closest("a")))return;
    drag.current={startX:e.clientX,startY:e.clientY,dx:0,dy:0,moved:false};
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove=(e:ReactPointerEvent<SVGSVGElement>)=>{
    if(drag.current){
      const dx=(e.clientX-drag.current.startX)*W/e.currentTarget.getBoundingClientRect().width;
      const dy=(e.clientY-drag.current.startY)*H/e.currentTarget.getBoundingClientRect().height;
      drag.current={...drag.current,dx,dy,moved:drag.current.moved||Math.abs(dx)+Math.abs(dy)>5};
      if(drag.current.moved){setPan({x:dx,y:dy});setHover(null);}
    }else setHover(pointerCoordinate(e));
  };
  const onPointerUp=(e:ReactPointerEvent<SVGSVGElement>)=>{
    const active=drag.current;
    if(!active)return;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current=null;
    if(active.moved){
      const offset=fromScreen(CX+active.dx,CY+active.dy,hw,hh);
      if(offset.i||offset.j)shift(-offset.i,-offset.j);
      else setHover(null);
    }else{
      const coord=pointerCoordinate(e);
      if(coord)setSelected(coord);
    }
    setPan({x:0,y:0});
  };
  const selectedOffset=selected?{i:difference(selected.x,center.x,size),j:difference(selected.y,center.y,size)}:null;
  const hoveredOffset=hover?{i:difference(hover.x,center.x,size),j:difference(hover.y,center.y,size)}:null;
  return <section className="world-atlas-wrap" aria-labelledby="world-atlas-heading">
    <div className="map-section-heading">
      <div><span className="eyebrow">ATLAS · CARTE DU MONDE</span>
        <h2 id="world-atlas-heading">Mes positions dans le monde</h2></div>
      <span className="map-section-legend">Carte torique · {size} × {size}</span>
    </div>
    <div className="map-controls" aria-label="Commandes de la carte du monde">
      <div className="map-compass" aria-label="Déplacer la carte">
        <button type="button" aria-label="Déplacer vers le nord" onClick={()=>shift(0,-1)}>N ↑</button>
        <button type="button" aria-label="Déplacer vers l'ouest" onClick={()=>shift(-1,0)}>O ←</button>
        <button type="button" aria-label="Déplacer vers le sud" onClick={()=>shift(0,1)}>S ↓</button>
        <button type="button" aria-label="Déplacer vers l'est" onClick={()=>shift(1,0)}>E →</button>
      </div>
      <div className="map-zoom-controls" aria-label="Échelle du monde">
        <button type="button" aria-label="Zoom avant" disabled={zoom==="detail"} onClick={()=>setZoom("detail")}>＋</button>
        <span>{zoom==="detail"?"Vue détaillée":"Vue éloignée"}</span>
        <button type="button" aria-label="Zoom arrière" disabled={zoom==="political"} onClick={()=>setZoom("political")}>−</button>
      </div>
      <form onSubmit={jump} className="map-jump-form" aria-label="Aller aux coordonnées">
        <label> X <input aria-label="Coordonnée X" inputMode="numeric" value={jumpX}
          onChange={event=>setJumpX(event.target.value)} /></label>
        <label> Y <input aria-label="Coordonnée Y" inputMode="numeric" value={jumpY}
          onChange={event=>setJumpY(event.target.value)} /></label>
        <button type="submit">Centrer</button>
      </form>
    </div>
    {error&&<p className="map-navigation-error" role="alert">{error}</p>}
    <div className="map-coordinate-status" role="status" aria-live="off">
      <span>Centre : <strong data-testid="world-center">{readable(center)}</strong></span>
      <span>Survol : <strong data-testid="world-hover">{readable(hover)}</strong></span>
      <span>Sélection : <strong data-testid="world-selection">{readable(selected)}</strong></span>
    </div>
    <svg ref={svgRef} className="world-atlas world-atlas-interactive" viewBox="0 0 680 500" role="group"
      style={{touchAction:"none",cursor:pan.x||pan.y?"grabbing":"grab"}}
      aria-label={"Monde "+world.name+" : déplacement, zoom et sélection des coordonnées"}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      onPointerCancel={()=>{drag.current=null;setPan({x:0,y:0});}}
      onPointerLeave={()=>{if(!drag.current)setHover(null);}}>
      <defs><clipPath id="mmhk-world-viewport"><rect x="8" y="8" width="664" height="484" rx="3"/></clipPath></defs>
      <rect x="8" y="8" width="664" height="484" fill="#1d3942"/>
      {background&&<image href={background} x="8" y="8" width="664" height="484"
        preserveAspectRatio="xMidYMid slice"/>}
      <g clipPath="url(#mmhk-world-viewport)" transform={"translate("+pan.x+" "+pan.y+")"}>
        {visible.map(cell=><polygon key={cell.i+":"+cell.j}
          points={diamond(cell.x,cell.y,hw,hh)} fill="transparent"
          stroke="#d8cea0" strokeOpacity={zoom==="detail"?.24:.17}
          strokeWidth={.85}/>)}
        {selectedOffset&&(()=>{
          const p=projected(selectedOffset.i,selectedOffset.j,hw,hh);
          return <polygon points={diamond(p.x,p.y,hw,hh)} fill="#e1b55c"
            fillOpacity=".35" stroke="#ffdc86" strokeWidth="3" pointerEvents="none"/>;
        })()}
        {hoveredOffset&&(()=>{
          const p=projected(hoveredOffset.i,hoveredOffset.j,hw,hh);
          return <polygon points={diamond(p.x,p.y,hw,hh)} fill="#f0deb1"
            fillOpacity=".3" stroke="#fff5c9" strokeWidth="2.4" pointerEvents="none"/>;
        })()}
        {marks.map(({city,x,y})=><Link href={"/cities/"+city.city_id+"/region"} key={city.city_id}
          aria-label={"Ouvrir la région de "+city.name+", coordonnées "+city.x+", "+city.y}>
          <title>{city.name+" ("+city.x+", "+city.y+")"}</title>
          <circle cx={x} cy={y} r="19" fill="#182a30" opacity=".8"/>
          <path d={"M "+x+" "+(y-16)+" L "+(x+12)+" "+y+" L "+x+" "+(y+16)+" L "+(x-12)+" "+y+" Z"}
            fill="#eac986" stroke="#172a36" strokeWidth="2"/>
          <circle cx={x} cy={y} r="3" fill="#2e444a"/>
          <text x={x} y={y+29} fill="#fff1c9" fontSize="13" fontWeight="bold"
            textAnchor="middle" stroke="#15232c" strokeWidth="3" paintOrder="stroke">{city.name}</text>
        </Link>)}
      </g>
      <text x="17" y="28" fill="#f0d89b" fontSize="12">NORD</text>
      <rect x="13" y="462" width="365" height="22" rx="3" fill="#101f28dd"/>
      <text x="24" y="477" fontSize="11" fill="#efdeb3">Coordonnées toriques · navigation sans ordre militaire</text>
    </svg>
    <div className="map-city-shortcuts">
      {cities.map(city=><button key={city.city_id} type="button"
        onClick={()=>{centerOn(city.x,city.y);setSelected({x:city.x,y:city.y});}}
        aria-label={"Recentrer sur "+city.name}>⌖ {city.name} ({city.x}, {city.y})</button>)}
    </div>
    <p className="map-qualification">
      Les cases correspondent aux coordonnées logiques du monde, pas à un terrain découvert.
      Seules vos villes sont connues ; les positions adverses, reliques et mines ne sont pas divulguées.
      Les fonds historiques restent illustratifs tant que la cartographie métier n&apos;est pas disponible.
    </p>
  </section>;
}
