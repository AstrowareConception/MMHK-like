"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type FormEvent, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from "react";
import type { City, WorldOverview } from "../lib/server-api";
import {
  MAP_VIEW, TILE_METRICS, polygonAt, screenToWorld, tileFromPoint, tileToPoint,
  worldDelta, worldWrap, type MapCoordinate, type MapScale
} from "../lib/map-geometry";

type Drag = { pointerId:number; startX:number; startY:number; dx:number; dy:number; moved:boolean };
const {width:W,height:H,cx:CX,cy:CY}=MAP_VIEW;
const readable=(coord:MapCoordinate|null):string=>coord?"("+coord.x+", "+coord.y+")":"—";

/** Decorative corner arrows are painted into Ubisoft's original JPG.
 * These SVG hit areas make their positions actionable, including keyboard use.
 * No gameplay order, resource debit or terrain exposure is performed.
 */
const CORNERS = [
  {id:"north-west",x:127,y:120,dx:-1,dy:-1,symbol:"↖",label:"Flèche de carte : nord-ouest"},
  {id:"north-east",x:527,y:120,dx:1,dy:-1,symbol:"↗",label:"Flèche de carte : nord-est"},
  {id:"south-west",x:127,y:391,dx:-1,dy:1,symbol:"↙",label:"Flèche de carte : sud-ouest"},
  {id:"south-east",x:527,y:391,dx:1,dy:1,symbol:"↘",label:"Flèche de carte : sud-est"}
] as const;

export function WorldAtlasInteractive({world,cities,detailBackground,politicalBackground}:{
  world:WorldOverview; cities:City[]; detailBackground:string|null; politicalBackground:string|null;
}) {
  const size=world.world_size;
  const first=cities[0];
  const home={x:first?.x??1,y:first?.y??1};
  const [center,setCenter]=useState<MapCoordinate>(home);
  const [zoom,setZoom]=useState<MapScale>("detail");
  const [hover,setHover]=useState<MapCoordinate|null>(null);
  const [selected,setSelected]=useState<MapCoordinate|null>(null);
  const [jumpX,setJumpX]=useState(String(home.x));
  const [jumpY,setJumpY]=useState(String(home.y));
  const [error,setError]=useState("");
  const [pan,setPan]=useState({x:0,y:0});
  // The recovered background already contains the original grid. Do not add
  // a second visible grid by default; an optional *diagnostic* overlay remains.
  const [showGrid,setShowGrid]=useState(false);
  const [showSites,setShowSites]=useState(true);
  const [showInfluence,setShowInfluence]=useState(true);
  const [showDiscoveredCities,setShowDiscoveredCities]=useState(true);
  const drag=useRef<Drag|null>(null);
  const svgRef=useRef<SVGSVGElement|null>(null);
  const {hw,hh}=TILE_METRICS[zoom];
  const background=zoom==="detail"
    ?(detailBackground??politicalBackground):(politicalBackground??detailBackground);
  const storageKey="mmhk-map-camera:"+world.world_id;

  useEffect(()=>{
    try {
      const saved=sessionStorage.getItem(storageKey);
      if(!saved)return;
      const old=JSON.parse(saved) as {x?:number;y?:number;zoom?:MapScale;selected?:MapCoordinate};
      if(Number.isInteger(old.x)&&Number.isInteger(old.y)&&old.x!>=1&&old.x!<=size&&old.y!>=1&&old.y!<=size)
        setCenter({x:old.x!,y:old.y!});
      if(old.zoom==="detail"||old.zoom==="political")setZoom(old.zoom);
      if(old.selected&&Number.isInteger(old.selected.x)&&Number.isInteger(old.selected.y)
        &&old.selected.x>=1&&old.selected.x<=size&&old.selected.y>=1&&old.selected.y<=size)
        setSelected(old.selected);
    } catch { /* Session storage is optional. */ }
  },[size,storageKey]);
  useEffect(()=>{
    try { sessionStorage.setItem(storageKey,JSON.stringify({...center,zoom,selected})); }
    catch { /* No storage is required for gameplay. */ }
  },[center,zoom,selected,storageKey]);

  const shift=(dx:number,dy:number)=>{
    setCenter(previous=>({x:worldWrap(previous.x+dx,size),y:worldWrap(previous.y+dy,size)}));
    setHover(null);
  };
  const centerOn=(x:number,y:number)=>{
    setCenter({x,y});setJumpX(String(x));setJumpY(String(y));
    setError("");setHover(null);
  };
  const jump=(event:FormEvent<HTMLFormElement>)=>{
    event.preventDefault();
    const x=Number(jumpX),y=Number(jumpY);
    if(!/^\d+$/.test(jumpX)||!/^\d+$/.test(jumpY)||!Number.isInteger(x)||!Number.isInteger(y)
      ||x<1||y<1||x>size||y>size){setError("Coordonnées invalides : de 1 à "+size+".");return;}
    centerOn(x,y);
  };

  const marks=useMemo(()=>cities.map(city=>{
    const i=worldDelta(city.x,center.x,size),j=worldDelta(city.y,center.y,size);
    const p=tileToPoint(i,j,hw,hh);
    return {city,...p,visible:p.x>=27&&p.x<=W-27&&p.y>=36&&p.y<=H-42};
  }).filter(p=>p.visible),[cities,center,size,hw,hh]);

  const discoveredMarks=useMemo(()=>world.discovered_cities.map(city=>{
    const pos=tileToPoint(worldDelta(city.x,center.x,size),worldDelta(city.y,center.y,size),hw,hh);
    return {city,...pos};
  }).filter(p=>p.x>=25&&p.x<=W-25&&p.y>=25&&p.y<=H-36),
  [world.discovered_cities,center,size,hw,hh]);
  const siteMarks=useMemo(()=>world.visible_sites.map(site=>{
    const pos=tileToPoint(worldDelta(site.x,center.x,size),worldDelta(site.y,center.y,size),hw,hh);
    return {site,...pos};
  }).filter(p=>p.x>=25&&p.x<=W-25&&p.y>=25&&p.y<=H-36),
  [world.visible_sites,center,size,hw,hh]);
  const influenceTiles=useMemo(()=>world.visible_influence.map(cell=>{
    const pos=tileToPoint(worldDelta(cell.x,center.x,size),worldDelta(cell.y,center.y,size),hw,hh);
    return {cell,...pos};
  }).filter(p=>p.x>=8-hw&&p.x<=W-8+hw&&p.y>=8-hh&&p.y<=H-8+hh),
  [world.visible_influence,center,size,hw,hh]);
  const selectedForeign=world.discovered_cities.find(city=>city.x===selected?.x&&city.y===selected?.y);
  const selectedSite=world.visible_sites.find(site=>site.x===selected?.x&&site.y===selected?.y);
  const selectedInfluence=world.visible_influence.find(tile=>tile.x===selected?.x&&tile.y===selected?.y);
  const kindLabels:Record<string,string>={sphinx:"Sphinx",obelisk:"Obélisque",dolmen:"Dolmen",
    portal:"Portail",relic:"Relique",special:"Site remarquable"};
  const kindSymbols:Record<string,string>={sphinx:"♟",obelisk:"♜",dolmen:"◆",
    portal:"◎",relic:"✦",special:"✧"};

  // Build the optional diagnostic grid within the actual viewport, and only
  // when requested. Raster grids are *not* historical server terrain.
  const drawGrid=showGrid || !background;
  const lines=useMemo(()=>{
    if(!drawGrid)return [];
    const cells:{i:number;j:number;x:number;y:number}[]=[];
    const corners=[[8,8],[W-8,8],[8,H-8],[W-8,H-8]];
    const coords=corners.map(([x,y])=>{
      const u=(x-CX)/hw,v=(y-CY)/hh;
      return {i:(u+v)/2,j:(v-u)/2};
    });
    const mini=Math.floor(Math.min(...coords.map(p=>p.i)))-2;
    const maxi=Math.ceil(Math.max(...coords.map(p=>p.i)))+2;
    const minj=Math.floor(Math.min(...coords.map(p=>p.j)))-2;
    const maxj=Math.ceil(Math.max(...coords.map(p=>p.j)))+2;
    for(let i=mini;i<=maxi;i++)for(let j=minj;j<=maxj;j++){
      const p=tileToPoint(i,j,hw,hh);
      if(p.x>=8-hw&&p.x<=W-8+hw&&p.y>=8-hh&&p.y<=H-8+hh)
        cells.push({i,j,...p});
    }
    return cells;
  },[drawGrid,hw,hh]);

  // SVG current transformation matrix resolves the exact viewBox conversion,
  // including responsive dimensions and CSS borders.
  const toLocal=(e:ReactPointerEvent<SVGSVGElement>)=>{
    const matrix=e.currentTarget.getScreenCTM();
    if(!matrix)return null;
    const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());
    return {x:point.x,y:point.y};
  };
  const pointerCoordinate=(e:ReactPointerEvent<SVGSVGElement>):MapCoordinate|null=>{
    const point=toLocal(e);
    return point?screenToWorld(point.x,point.y,center,size,hw,hh,pan):null;
  };
  const onPointerDown=(e:ReactPointerEvent<SVGSVGElement>)=>{
    if(e.button!==0||(e.target instanceof Element&&e.target.closest("a,[data-map-control]")))return;
    drag.current={pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,dx:0,dy:0,moved:false};
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const onPointerMove=(e:ReactPointerEvent<SVGSVGElement>)=>{
    if(drag.current?.pointerId===e.pointerId){
      const matrix=e.currentTarget.getScreenCTM();
      if(!matrix)return;
      const unitX=Math.hypot(matrix.a,matrix.b),unitY=Math.hypot(matrix.c,matrix.d);
      const dx=(e.clientX-drag.current.startX)/(unitX||1);
      const dy=(e.clientY-drag.current.startY)/(unitY||1);
      drag.current={...drag.current,dx,dy,moved:drag.current.moved||Math.abs(dx)+Math.abs(dy)>6};
      if(drag.current.moved){setPan({x:dx,y:dy});setHover(null);}
    }else if(!drag.current)setHover(pointerCoordinate(e));
  };
  const onPointerUp=(e:ReactPointerEvent<SVGSVGElement>)=>{
    const active=drag.current;
    if(!active||active.pointerId!==e.pointerId)return;
    if(e.currentTarget.hasPointerCapture(e.pointerId))e.currentTarget.releasePointerCapture(e.pointerId);
    drag.current=null;
    if(active.moved){
      const offset=tileFromPoint(CX+active.dx,CY+active.dy,hw,hh);
      if(offset&&(offset.i||offset.j))shift(-offset.i,-offset.j);
    }else{
      const coord=pointerCoordinate(e);
      if(coord)setSelected(coord);
    }
    setPan({x:0,y:0});
  };

  // Native non-passive listener permits preventing page scroll while zooming.
  useEffect(()=>{
    const node=svgRef.current;
    if(!node)return;
    const wheel=(event:WheelEvent)=>{
      event.preventDefault();
      if(event.deltaY===0)return;
      setZoom(event.deltaY<0?"detail":"political");
    };
    node.addEventListener("wheel",wheel,{passive:false});
    return ()=>node.removeEventListener("wheel",wheel);
  },[]);
  const onKeyboard=(e:KeyboardEvent<SVGSVGElement>)=>{
    if(e.target!==e.currentTarget)return;
    const movements:Record<string,[number,number]>={
      ArrowUp:[0,-1],ArrowDown:[0,1],ArrowLeft:[-1,0],ArrowRight:[1,0],
      w:[0,-1],s:[0,1],a:[-1,0],d:[1,0]
    };
    const direction=movements[e.key];
    if(direction){e.preventDefault();shift(direction[0],direction[1]);}
    else if(e.key==="+"||e.key==="="){e.preventDefault();setZoom("detail");}
    else if(e.key==="-"){e.preventDefault();setZoom("political");}
    else if(e.key==="Home"){e.preventDefault();centerOn(home.x,home.y);}
  };
  const highlight=(coord:MapCoordinate|null,fill:string,stroke:string,opacity:number,width:number)=>{
    if(!coord)return null;
    const pos=tileToPoint(worldDelta(coord.x,center.x,size),worldDelta(coord.y,center.y,size),hw,hh);
    if(pos.x<8-hw||pos.x>W-8+hw||pos.y<8-hh||pos.y>H-8+hh)return null;
    return <polygon points={polygonAt(pos.x,pos.y,hw,hh)} fill={fill} fillOpacity={opacity}
      stroke={stroke} strokeWidth={width} pointerEvents="none"/>;
  };
  const cityOnSelection=cities.find(city=>city.x===selected?.x&&city.y===selected?.y);

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
          onChange={event=>setJumpX(event.target.value)}/></label>
        <label> Y <input aria-label="Coordonnée Y" inputMode="numeric" value={jumpY}
          onChange={event=>setJumpY(event.target.value)}/></label>
        <button type="submit">Centrer</button>
      </form>
      <div className="map-layer-switches" role="group" aria-label="Couches du monde">
        <label><input type="checkbox" checked={showDiscoveredCities}
          onChange={e=>setShowDiscoveredCities(e.target.checked)}/>Villes découvertes</label>
        <label><input type="checkbox" checked={showSites}
          onChange={e=>setShowSites(e.target.checked)}/>Sites</label>
        <label><input type="checkbox" checked={showInfluence}
          onChange={e=>setShowInfluence(e.target.checked)}/>Influence connue</label>
      </div>
      <label className="map-grid-switch">
        <input type="checkbox" checked={showGrid} onChange={event=>setShowGrid(event.target.checked)}/>
        Grille indicative
      </label>
    </div>
    {error&&<p className="map-navigation-error" role="alert">{error}</p>}
    <div className="map-coordinate-status" role="status" aria-live="off">
      <span>Centre : <strong data-testid="world-center">{readable(center)}</strong></span>
      <span>Survol : <strong data-testid="world-hover">{readable(hover)}</strong></span>
      <span>Sélection : <strong data-testid="world-selection">{readable(selected)}</strong></span>
      <span>{!background?"Grille schématique de substitution":showGrid?"Grille de diagnostic (non historique)":"Grille d’origine préservée"}</span>
    </div>
    <svg ref={svgRef} className="world-atlas world-atlas-interactive" viewBox="0 0 680 500"
      role="group" tabIndex={0} onKeyDown={onKeyboard}
      style={{touchAction:"none",cursor:pan.x||pan.y?"grabbing":"grab"}}
      aria-label={"Monde "+world.name+" : déplacement, zoom et sélection des coordonnées"}
      onPointerDown={onPointerDown} onPointerMove={onPointerMove} onPointerUp={onPointerUp}
      onPointerCancel={()=>{drag.current=null;setPan({x:0,y:0});}}
      onPointerLeave={()=>{if(!drag.current)setHover(null);}}>
      <defs><clipPath id="mmhk-world-viewport"><rect x="8" y="8" width="664" height="484" rx="3"/></clipPath></defs>
      <rect x="8" y="8" width="664" height="484" fill="#1d3942"/>
      {background&&<image href={background} x="8" y="8" width="664" height="484"
        preserveAspectRatio="xMidYMid slice" pointerEvents="none"/>}
      <g clipPath="url(#mmhk-world-viewport)" transform={"translate("+pan.x+" "+pan.y+")"}>
        {drawGrid&&<g className="map-diagnostic-grid" pointerEvents="none">
          {lines.map(cell=><polygon key={cell.i+":"+cell.j} points={polygonAt(cell.x,cell.y,hw,hh)}
            fill="none" stroke="#f6e9b3" strokeOpacity=".18" strokeWidth=".5"/>)}
        </g>}
        {showInfluence&&influenceTiles.map(({cell,x,y})=>
          <polygon key={"influence-"+cell.x+"-"+cell.y} data-world-influence={cell.x+","+cell.y}
            points={polygonAt(x,y,hw,hh)}
            fill={cell.is_mine?"#e4b356":"#6491aa"} fillOpacity=".34"
            stroke={cell.is_mine?"#f4dc9a":"#a6cbe0"} strokeOpacity=".85"
            strokeWidth="1.2" strokeDasharray="2 2" pointerEvents="none">
            <title>{"Influence connue : "+cell.controller+" ("+cell.x+", "+cell.y+")"}</title>
          </polygon>)}
        {highlight(selected,"#dbad55","#f9d997",.23,2.2)}
        {highlight(hover,"#f9e5a8","#fff6c6",.25,1.7)}
        {showDiscoveredCities&&discoveredMarks.map(({city,x,y})=>
          <g key={"discovered-"+city.city_id} data-map-control="true" role="button"
            tabIndex={0} className="world-discovered-city"
            aria-label={"Cité découverte "+city.name+" ("+city.x+", "+city.y+")"}
            onPointerDown={e=>e.stopPropagation()}
            onClick={()=>setSelected({x:city.x,y:city.y})}
            onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected({x:city.x,y:city.y});}}}>
            <title>{city.name+" : cité découverte"}</title>
            <circle cx={x} cy={y} r="17" fill="#1f3645" stroke="#a9cad6" strokeWidth="2"/>
            <text x={x} y={y+5} textAnchor="middle" fontSize="18" fill="#d4e0e6">⌂</text>
            <text x={x} y={y+29} textAnchor="middle" fontSize="11" fontWeight="bold"
              fill="#e8f3f6" stroke="#1b2832" strokeWidth="3" paintOrder="stroke">
              {city.name}</text>
          </g>)}
        {showSites&&siteMarks.map(({site,x,y})=>
          <g key={"site-"+site.site_id} data-map-control="true" role="button"
            tabIndex={0} className="world-map-site"
            aria-label={kindLabels[site.kind]+" : "+site.label+" ("+site.x+", "+site.y+")"}
            onPointerDown={e=>e.stopPropagation()}
            onClick={()=>setSelected({x:site.x,y:site.y})}
            onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();setSelected({x:site.x,y:site.y});}}}>
            <title>{kindLabels[site.kind]+" · "+site.label}</title>
            <circle cx={x} cy={y} r="17" fill="#52422b" stroke="#f1d38f" strokeWidth="2"/>
            <text x={x} y={y+6} textAnchor="middle" fontSize="19" fill="#fff1bc">
              {kindSymbols[site.kind]}</text>
            <text x={x} y={y+29} textAnchor="middle" fontSize="10" fontWeight="bold"
              fill="#fff2c2" stroke="#1b2832" strokeWidth="3" paintOrder="stroke">
              {site.label}</text>
          </g>)}
        {marks.map(({city,x,y})=><Link href={"/cities/"+city.city_id+"/region"} key={city.city_id}
          aria-label={"Ouvrir la région de "+city.name+", coordonnées "+city.x+", "+city.y}>
          <title>{city.name+" ("+city.x+", "+city.y+")"}</title>
          <circle cx={x} cy={y} r="17" fill="#182a30" opacity=".8"/>
          <path d={"M "+x+" "+(y-15)+" L "+(x+11)+" "+y+" L "+x+" "+(y+15)+" L "+(x-11)+" "+y+" Z"}
            fill="#eac986" stroke="#172a36" strokeWidth="2"/>
          <circle cx={x} cy={y} r="3" fill="#2e444a"/>
          <text x={x} y={y+27} fill="#fff1c9" fontSize="12" fontWeight="bold"
            textAnchor="middle" stroke="#15232c" strokeWidth="3" paintOrder="stroke">{city.name}</text>
        </Link>)}
      </g>
      {CORNERS.map(corner=><g key={corner.id} data-map-control="true"
        className="map-edge-control" role="button" tabIndex={0}
        aria-label={corner.label} aria-keyshortcuts="Enter Space"
        transform={"translate("+corner.x+" "+corner.y+")"}
        onPointerDown={e=>e.stopPropagation()}
        onClick={e=>{e.stopPropagation();shift(corner.dx,corner.dy);}}
        onKeyDown={e=>{
          if(e.key==="Enter"||e.key===" "){e.preventDefault();e.stopPropagation();shift(corner.dx,corner.dy);}
        }}>
        <title>{corner.label}</title>
        <circle r="20" fill="#1c3335cd" stroke="#e4c47f" strokeWidth="1.5"/>
        <text x="0" y="8" textAnchor="middle" fontSize="25" fill="#ffebbc"
          fontWeight="bold" pointerEvents="none">{corner.symbol}</text>
      </g>)}
      <text x="17" y="28" fill="#f0d89b" fontSize="12" pointerEvents="none">NORD</text>
      <rect x="13" y="461" width="382" height="24" rx="3" fill="#101f28dd" pointerEvents="none"/>
      <text x="24" y="478" fontSize="11" fill="#efdeb3" pointerEvents="none">
        Flèches • glisser • molette • clavier · exploration sans mission
      </text>
    </svg>
    <div className="map-city-shortcuts">
      {cities.map(city=><button key={city.city_id} type="button"
        onClick={()=>{centerOn(city.x,city.y);setSelected({x:city.x,y:city.y});}}
        aria-label={"Recentrer sur "+city.name}>⌖ {city.name} ({city.x}, {city.y})</button>)}
    </div>
    <div className="map-selected-info" aria-live="polite">
      <strong>{selected?"Région "+readable(selected):"Sélectionnez une région"}</strong>
      {cityOnSelection
        ?<Link href={"/cities/"+cityOnSelection.city_id+"/region"}>Explorer {cityOnSelection.name}</Link>
        :selectedForeign
        ?<span>Cité découverte : {selectedForeign.name} · informations privées non disponibles</span>
        :selectedSite
        ?<span>{kindLabels[selectedSite.kind]} : {selectedSite.label} · emplacement découvert</span>
        :selectedInfluence
        ?<span>Influence connue : {selectedInfluence.controller} ·
          {" "}{selectedInfluence.observed_at.slice(0,10)}
          {selectedInfluence.is_mine&&selected&&
            <Link className="world-colony-link"
              href={"/worlds/"+world.world_id+"/colonize?x="+selected.x+"&y="+selected.y}>
              Examiner pour colonisation
            </Link>}
          </span>
        :<span>Contenu non découvert : aucune information géographique ou militaire supposée.</span>}
    </div>
    <div className="world-layer-legend">
      <span>⌂ Vos villes : {cities.length}</span>
      <span>⌂ Cités découvertes : {world.discovered_cities.length}</span>
      <span>✦ Sites découverts : {world.visible_sites.length}</span>
      <span>◇ Cases d'influence connues : {world.visible_influence.length}</span>
    </div>
    <p className="map-qualification">
      Le décor historique est une image illustrative fixe et contient déjà son quadrillage.
      Les coordonnées et les hitboxes sont des repères de navigation modernes, non une carte
      des terrains confirmée par le serveur. Seules vos villes sont actuellement révélées.
    </p>
  </section>;
}
