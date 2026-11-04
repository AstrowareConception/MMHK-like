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
  const [view,setView]=useState<"map"|"missions"|"intel">("map");
  const tabs=[{id:"map",label:"Carte"},{id:"missions",label:"Missions"},
    {id:"intel",label:"Renseignements"}] as const;
  const select=(id:"map"|"missions"|"intel")=>setView(id);
  const known=region.cells.find(c=>c.i===selected.i&&c.j===selected.j);
  const currentEncounter=region.encounters?.find(e=>e.i===selected.i&&e.j===selected.j)??null;
  const selectedMine=region.mine_positions.find(m=>m.i===selected.i&&m.j===selected.j);
  const activate=(cell:RegionCell)=>setSelected({i:cell.i,j:cell.j});
  const key=(e:KeyboardEvent<SVGGElement>,cell:RegionCell)=>{
    if(e.key==="Enter"||e.key===" "){e.preventDefault();activate(cell);}
  };
  return <section className="region-scene-container mmhk-region-game-screen"
    data-testid="region-game-screen" aria-label={"Région de "+region.city_name}>
    <header className="mmhk-region-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>Région de {region.city_name}</strong>
        <small>Exploration, rencontres et déplacements</small>
      </div>
      <div className="mmhk-command-tabs" role="tablist" aria-label="Écrans de la région">
        {tabs.map((tab,i)=><button key={tab.id} type="button" role="tab"
          id={"region-screen-tab-"+tab.id}
          aria-controls={"region-screen-panel-"+tab.id}
          aria-selected={view===tab.id} tabIndex={view===tab.id?0:-1}
          onClick={()=>select(tab.id)}
          onKeyDown={e=>{
            if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
            e.preventDefault();
            const next=e.key==="Home"?0:e.key==="End"?tabs.length-1:
              (i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
            select(tabs[next].id);
            e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
          }}>{tab.label}</button>)}
      </div>
    </header>
    <div className="mmhk-region-active-screen">
      <section role="tabpanel" id="region-screen-panel-map"
        aria-labelledby="region-screen-tab-map"
        data-testid="region-map-screen" hidden={view!=="map"}
        className="mmhk-region-map-panel">
        <div className="mmhk-region-map-column">
    <div className="map-section-heading">
      <div><span className="eyebrow">RÉGION · VUE 5 × 5</span>
        <h2 id="region-view-title">Autour de {region.city_name}</h2></div>
      <span className="map-section-legend">25 cases · {region.mine_positions.length} mines positionnées</span>
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
        const mine=cell.kind==="mine"?cell.resource:null;
        const chosen=cell.i===selected.i&&cell.j===selected.j;
        const hovered=cell.i===hover?.i&&cell.j===hover?.j;
        return <g key={cell.i+":"+cell.j} data-region-i={cell.i} data-region-j={cell.j}
          className="region-selectable-cell"
          role="button" tabIndex={0}
          aria-label={"Sélectionner la case régionale ("+cell.i+", "+cell.j+")"+
            (owned?" : ville "+region.city_name:mine?" : mine de "+(MINE_LABELS[mine]??mine):encounter?" : rencontre "+encounter.name:" : non cartographiée")}
          onMouseEnter={()=>setHover({i:cell.i,j:cell.j})}
          onClick={()=>activate(cell)} onKeyDown={e=>key(e,cell)}>
          <title>{"Case ("+cell.i+", "+cell.j+") · "+(owned?"Ville du joueur":mine?"Mine de "+(MINE_LABELS[mine]??mine):encounter?"Rencontre : "+encounter.name:"Terrain inconnu")}</title>
          <polygon points={regionPolygon(cell.i,cell.j)}
            data-testid={"region-tile-"+cell.i+"-"+cell.j}
            fill={chosen?"#c79c4f":owned?"#a48b60":mine?"#c69b54":"#7da18a"}
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
          {mine&&<g pointerEvents="none" className="mmhk-regional-mine-marker">
            <path d={"M"+(cx-23)+" "+(cy+1)+"L"+(cx-14)+" "+(cy-24)+"L"+cx+" "+(cy-33)+
              "L"+(cx+17)+" "+(cy-19)+"L"+(cx+24)+" "+(cy+1)+"Z"}
              fill="#514d41" stroke="#e4c184" strokeWidth="2"/>
            <path d={"M"+(cx-14)+" "+(cy-24)+"L"+cx+" "+(cy-33)+"L"+(cx+17)+" "+(cy-19)}
              fill="none" stroke="#f0d7a3" strokeWidth="2"/>
            <rect x={cx-9} y={cy-14} width="18" height="15" rx="2"
              fill="#182930" stroke="#c7ad76" strokeWidth="1.5"/>
            <text x={cx} y={cy-2} textAnchor="middle" fontSize="14" fill="#f4cf78">◆</text>
            <text x={cx} y={cy+23} textAnchor="middle" fontSize="11" fontWeight="bold"
              fill="#fff2cd" stroke="#102630" strokeWidth="3" paintOrder="stroke">
              {MINE_LABELS[mine]??mine}</text>
          </g>}
          {encounter&&<image href={encounter.unit_code==="wolves"?
            "/themes/public-safe/region-wolf.svg":"/themes/public-safe/region-bandit.svg"}
            x={cx-25} y={cy-48} width="50" height="50" pointerEvents="none"/>}
          {!owned&&!mine&&!encounter&&(hovered||chosen||!background)&&<text x={cx} y={cy+4} textAnchor="middle"
            fill="#fff3cf" fontSize="12" pointerEvents="none">?</text>}
        </g>;
      })}
      <RegionJourneyLayer missions={missions}/>
      <rect x="8" y="523" width="430" height="28" rx="3" fill="#10232cdd" pointerEvents="none"/>
      <text x="20" y="542" fontSize="11" fill="#f1dfb8" pointerEvents="none">
        Mines positionnées · terrains et reliefs encore non cartographiés
      </text>
    </svg>
    <div className="region-selected-details" role="status">
      <strong>{"Case sélectionnée "+cellLabel(selected)}</strong>
      <span>{known?.kind==="owned_city"?"Cité du joueur : "+region.city_name:
        selectedMine?"Mine de "+(MINE_LABELS[selectedMine.resource]??selectedMine.resource)+" · emplacement enregistré":
        currentEncounter?"Rencontre : "+currentEncounter.name+" · "+currentEncounter.unit_count+" créatures":
        "Terrain, forêt, mine, site ou PNJ : non cartographié"}</span>
      {known?.kind==="owned_city"&&<a href={"/cities/"+region.city_id}>Entrer dans la cité</a>}
    </div>
        </div>
        <div className="mmhk-region-encounter-column">
          <RegionEncounterPanel encounter={currentEncounter} forces={forces}
            cityId={region.city_id} missions={missions}/>
        </div>
      </section>
      <section role="tabpanel" id="region-screen-panel-missions"
        aria-labelledby="region-screen-tab-missions"
        data-testid="region-missions-screen" hidden={view!=="missions"}
        className="mmhk-region-collection">
        <RegionMissionsPanel missions={missions} onExplore={()=>select("map")}/>
      </section>
      <section role="tabpanel" id="region-screen-panel-intel"
        aria-labelledby="region-screen-tab-intel"
        data-testid="region-intel-screen" hidden={view!=="intel"}
        className="mmhk-region-collection">
        <div className="mmhk-region-intel-heading">
          <span aria-hidden="true">◇</span>
          <div><h3>Renseignements de la région</h3>
            <p>Les seules mines et coordonnées attestées pour votre cité.
              Aucune position inconnue n'est révélée par cet écran.</p></div>
        </div>
        <div className="region-legend">
      <div><strong>Mines rattachées à cette cité</strong>
        <p>{region.mine_types_unlocated.map(k=>MINE_LABELS[k]??k).join(" · ")||"Aucune mine enregistrée"}</p>
        <small>{region.mine_positions_known
          ?"Positions persistantes, configuration "+region.layout_policy+"."
          :"Certaines positions ne sont pas encore enregistrées."}</small>
        <div className="mmhk-region-mines-list">
          {region.mine_positions.map(m=><button key={m.resource} type="button"
            onClick={()=>{setSelected({i:m.i,j:m.j});select("map");}}>
            ◆ {MINE_LABELS[m.resource]??m.resource} · ({m.i},{m.j})
          </button>)}
        </div></div>
      <div><strong>Régions voisines (monde torique)</strong>
        <div className="region-neighbors">
          {region.surrounding_world_regions.map(c=><span key={c.dx+":"+c.dy}
            className={c.is_current?"current":""}
            title={c.is_current?"Région actuelle":"Coordonnées seulement, aucune reconnaissance"}>
            {c.x},{c.y}</span>)}
        </div>
        <small>Coordonnées mondiales distinctes des cases locales (i,j).</small></div>
        </div>
      </section>
    </div>
  </section>;
}
