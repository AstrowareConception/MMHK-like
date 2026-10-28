"use client";
import {useState,type KeyboardEvent} from "react";
import type {RegionView,CityForces,PveMissionsResponse} from "../lib/server-api";
import {RegionEncounterPanel} from "./region-encounter-panel";
import {RegionJourneyLayer,RegionMissionsPanel} from "./region-missions";
import {REGION_VIEW,regionCellCenter,regionPolygon,type RegionCell} from "../lib/region-geometry";

const MINE_LABELS:Record<string,string>={gold:"Or",wood:"Bois",ore:"Minerai",crystal:"Cristal",
  gems:"Gemmes",sulfur:"Soufre",mercury:"Mercure"};
const cellLabel=(c:RegionCell|null)=>c?"("+c.i+", "+c.j+")":"—";

export function RegionSceneInteractive({region,background,forces,missions,initialSelection}:{region:RegionView;background:string|null;forces:CityForces|null;missions:PveMissionsResponse|null;initialSelection?:RegionCell}){
  const [hover,setHover]=useState<RegionCell|null>(null);
  const [selected,setSelected]=useState<RegionCell>(initialSelection??{i:2,j:2});
  const [showGuide,setShowGuide]=useState(!background);
  const known=region.cells.find(c=>c.i===selected.i&&c.j===selected.j);
  const currentEncounter=region.encounters?.find(e=>e.i===selected.i&&e.j===selected.j)??null;
  const activate=(cell:RegionCell)=>setSelected({i:cell.i,j:cell.j});
  const key=(e:KeyboardEvent<SVGGElement>,cell:RegionCell)=>{
    if(e.key==="Enter"||e.key===" "){e.preventDefault();activate(cell);}
  };
  return <section className="region-scene-container" aria-labelledby="region-view-title">
    <div className="map-section-heading">
      <div><span className="eyebrow">RÉGION · VUE 5 × 5</span>
        <h2 id="region-view-title">Autour de {region.city_name}</h2></div>
      <span className="map-section-legend">25 emplacements schématiques</span>
    </div>
    <div className="map-coordinate-status" role="status" aria-live="off">
      <span>Région du monde : <strong>({region.world_x}, {region.world_y})</strong></span>
      <span>Survol local : <strong data-testid="region-hover">{cellLabel(hover)}</strong></span>
      <span>Sélection locale : <strong data-testid="region-selection">{cellLabel(selected)}</strong></span>
      <label className="map-grid-switch"><input type="checkbox" checked={showGuide}
        onChange={e=>setShowGuide(e.target.checked)}/>Afficher le quadrillage</label>
    </div>
    <svg className="region-scene" viewBox={"0 0 "+REGION_VIEW.width+" "+REGION_VIEW.height}
      aria-label="25 cases régionales : survol, sélection et ville centrale"
      role="group" onMouseLeave={()=>setHover(null)}>
      <rect width="680" height="562" fill="#203a42"/>
      {background?<image href={background} x="0" y="0" width="680" height="562"
        preserveAspectRatio="xMidYMid meet" pointerEvents="none"/>:
        <path d="M0 230 L200 100 L400 185 L680 72 L680 562 L0 562Z" fill="#426f56" pointerEvents="none"/>}
      {region.cells.map(cell=>{
        const {x:cx,y:cy}=regionCellCenter(cell.i,cell.j);
        const encounter=region.encounters?.find(e=>e.i===cell.i&&e.j===cell.j);
        const owned=cell.kind==="owned_city";
        const chosen=cell.i===selected.i&&cell.j===selected.j;
        const hovered=cell.i===hover?.i&&cell.j===hover?.j;
        return <g key={cell.i+":"+cell.j} data-region-i={cell.i} data-region-j={cell.j}
          className="region-selectable-cell"
          role="button" tabIndex={0}
          aria-label={"Sélectionner la case régionale ("+cell.i+", "+cell.j+")"+
            (owned?" : ville "+region.city_name:encounter?" : rencontre "+encounter.name:" : non cartographiée")}
          onMouseEnter={()=>setHover({i:cell.i,j:cell.j})}
          onClick={()=>activate(cell)} onKeyDown={e=>key(e,cell)}>
          <title>{"Case ("+cell.i+", "+cell.j+") · "+(owned?"Ville du joueur":encounter?"Rencontre : "+encounter.name:"Terrain inconnu")}</title>
          <polygon points={regionPolygon(cell.i,cell.j)}
            data-testid={"region-tile-"+cell.i+"-"+cell.j}
            fill={chosen?"#c79c4f":owned?"#a48b60":"#7da18a"}
            fillOpacity={chosen?.32:owned?.22:background?.005:.23}
            stroke={chosen?"#ffe7a3":hovered?"#fff4c8":"#c0d0c2"}
            strokeWidth={chosen?3:hovered?3:1}
            strokeOpacity={chosen||hovered?1:showGuide?.6:0}
            vectorEffect="non-scaling-stroke"/>
          {owned&&<a href={"/cities/"+region.city_id}
            aria-label={"Entrer dans la ville "+region.city_name}>
            <path d={"M"+(cx-18)+" "+(cy+6)+"L"+(cx-18)+" "+(cy-27)+"L"+cx+" "+(cy-43)+
              "L"+(cx+18)+" "+(cy-27)+"L"+(cx+18)+" "+(cy+6)+"Z"}
              fill="#dfc388" stroke="#253c42" strokeWidth="2"/>
            <path d={"M"+(cx-10)+" "+(cy-27)+"L"+cx+" "+(cy-49)+"L"+(cx+10)+" "+(cy-27)+"Z"}
              fill="#725d4b" stroke="#253c42" strokeWidth="1.5"/>
            <rect x={cx-5} y={cy-11} width="10" height="17" fill="#435358"/>
            <text x={cx} y={cy+26} textAnchor="middle" fontSize="12"
              fill="#fff3d1" stroke="#172e36" strokeWidth="3" paintOrder="stroke">Ville</text>
          </a>}
          {encounter&&<image href={encounter.unit_code==="wolves"?
            "/themes/public-safe/region-wolf.svg":"/themes/public-safe/region-bandit.svg"}
            x={cx-25} y={cy-48} width="50" height="50" pointerEvents="none"/>}
          {!owned&&!encounter&&(hovered||chosen||!background)&&<text x={cx} y={cy+4} textAnchor="middle"
            fill="#fff3cf" fontSize="12" pointerEvents="none">?</text>}
        </g>;
      })}
      <RegionJourneyLayer missions={missions}/>
      <rect x="8" y="523" width="430" height="28" rx="3" fill="#10232cdd" pointerEvents="none"/>
      <text x="20" y="542" fontSize="11" fill="#f1dfb8" pointerEvents="none">
        Décor historique · cases encore non cartographiées
      </text>
    </svg>
    <div className="region-selected-details" role="status">
      <strong>{"Case sélectionnée "+cellLabel(selected)}</strong>
      <span>{known?.kind==="owned_city"?"Cité du joueur : "+region.city_name:
        currentEncounter?"Rencontre : "+currentEncounter.name+" · "+currentEncounter.unit_count+" créatures":
        "Terrain, forêt, mine, site ou PNJ : non cartographié"}</span>
      {known?.kind==="owned_city"&&<a href={"/cities/"+region.city_id}>Entrer dans la cité</a>}
    </div>
    <RegionMissionsPanel missions={missions}/>
    <RegionEncounterPanel encounter={currentEncounter} forces={forces} cityId={region.city_id} missions={missions}/>
    <div className="region-legend">
      <div><strong>Mines rattachées à cette cité</strong>
        <p>{region.mine_types_unlocated.map(k=>MINE_LABELS[k]??k).join(" · ")||"Aucune mine enregistrée"}</p>
        <small>Types connus en base, emplacements non déterminés.</small></div>
      <div><strong>Régions voisines (monde torique)</strong>
        <div className="region-neighbors">
          {region.surrounding_world_regions.map(c=><span key={c.dx+":"+c.dy}
            className={c.is_current?"current":""}
            title={c.is_current?"Région actuelle":"Coordonnées seulement, aucune reconnaissance"}>
            {c.x},{c.y}</span>)}
        </div>
        <small>Coordonnées mondiales distinctes des cases locales (i,j).</small></div>
    </div>
  </section>;
}
