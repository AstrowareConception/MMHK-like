"use client";
import {useState,type KeyboardEvent} from "react";
import type {RegionView} from "../lib/server-api";
const MINE_LABELS:Record<string,string>={
  gold:"Or",wood:"Bois",ore:"Minerai",crystal:"Cristal",
  gems:"Gemmes",sulfur:"Soufre",mercury:"Mercure"
};
type Cell={i:number;j:number};
const cellLabel=(c:Cell|null)=>c?"("+c.i+", "+c.j+")":"—";
export function RegionSceneInteractive({region,background}:{region:RegionView;background:string|null}) {
  const [hover,setHover]=useState<Cell|null>(null);
  const [selected,setSelected]=useState<Cell>({i:2,j:2});
  const known=region.cells.find(c=>c.i===selected.i&&c.j===selected.j);
  const activate=(c:Cell)=>setSelected({i:c.i,j:c.j});
  const key=(e:KeyboardEvent<SVGGElement>,c:Cell)=>{
    if(e.key==="Enter"||e.key===" "){e.preventDefault();activate(c);}
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
    </div>
    <svg className="region-scene" viewBox="0 0 680 500" role="group"
      aria-label="25 emplacements régionaux interactifs, sans terrains ni mines fictifs"
      onMouseLeave={()=>setHover(null)}>
      <defs>
        <linearGradient id="region-ground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#56765f"/><stop offset="100%" stopColor="#304f49"/>
        </linearGradient>
      </defs>
      <rect width="680" height="500" rx="9" fill="#203a42"/>
      {background&&<image href={background} x="0" y="0" width="680" height="500"
        preserveAspectRatio="xMidYMid slice"/>}
      {!background && <path d="M0 220 L200 90 L400 150 L680 65 L680 500 L0 500 Z"
        fill="#496b67" opacity=".24" pointerEvents="none"/>}
      {region.cells.map(cell=>{
        // One logical tile occupies one isometric diamond, anchored to the floor.
        const cx=340+(cell.i-cell.j)*57,cy=116+(cell.i+cell.j)*36;
        const polygon=String(cx)+","+String(cy-35)+" "+String(cx+57)+","+String(cy)+" "+
          String(cx)+","+String(cy+35)+" "+String(cx-57)+","+String(cy);
        const owned=cell.kind==="owned_city";
        const chosen=cell.i===selected.i&&cell.j===selected.j;
        const hovered=cell.i===hover?.i&&cell.j===hover?.j;
        return <g key={cell.i+":"+cell.j} data-region-i={cell.i} data-region-j={cell.j}
          role="button" tabIndex={0}
          aria-label={"Sélectionner la case régionale ("+cell.i+", "+cell.j+")"+
            (owned?" : ville "+region.city_name:" : contenu non cartographié")}
          onClick={()=>activate(cell)}
          onKeyDown={event=>key(event,cell)}
          onMouseEnter={()=>setHover({i:cell.i,j:cell.j})}
          className="region-selectable-cell">
          <title>{"Case régionale ("+cell.i+", "+cell.j+") — "+
            (owned?"Votre cité":"Occupation et terrain non cartographiés")}</title>
          <polygon points={polygon} strokeWidth={chosen?3:hovered?2:1}
            fill={chosen?"#b99456":hovered?"#eedba0":owned?"#a48b60":"url(#region-ground)"}
            fillOpacity={chosen?.55:hovered?.3:owned?.82:background?.065:.82}
            stroke={chosen?"#fff0bc":hovered?"#f3dba1":"#a4b5a0"}
            strokeOpacity={chosen||hovered||owned?1:background?.22:.85} />
          {owned?<a href={"/cities/"+region.city_id}
            aria-label={"Entrer dans la ville "+region.city_name}>
            <path d={"M"+(cx-22)+" "+(cy+8)+" L"+(cx-22)+" "+(cy-30)+
              " L"+cx+" "+(cy-51)+" L"+(cx+22)+" "+(cy-30)+" L"+(cx+22)+" "+(cy+8)+"Z"}
              fill="#dfc388" stroke="#253c42" strokeWidth="2"/>
            <path d={"M"+(cx-12)+" "+(cy-30)+" L"+cx+" "+(cy-55)+" L"+(cx+12)+" "+(cy-30)+"Z"}
              fill="#725d4b" stroke="#253c42" strokeWidth="1.5"/>
            <rect x={cx-6} y={cy-11} width="12" height="20" fill="#435358"/>
            <text x={cx} y={cy+31} textAnchor="middle" fill="#fff3d1"
              fontSize="12" stroke="#172e36" strokeWidth="3" paintOrder="stroke">Ville</text>
          </a>:(!background||chosen||hovered) ? <text x={cx} y={cy+4} textAnchor="middle" fill="#d1d9c9"
            fontSize="12" pointerEvents="none">?</text> : null}
        </g>;
      })}
      <rect x="10" y="455" width="406" height="32" rx="4" fill="#10232ccc" pointerEvents="none"/>
      <text x="22" y="475" fill="#e5d8b2" fontSize="11" pointerEvents="none">
        Décor historique · occupations non cartographiées
      </text>
    </svg>
    <div className="region-selected-details" role="status">
      <strong>{"Case sélectionnée "+cellLabel(selected)}</strong>
      <span>{known?.kind==="owned_city"?"Cité du joueur : "+region.city_name:
        "Terrain, forêt, mine, site ou PNJ : non cartographié"}</span>
      {known?.kind==="owned_city"&&<a href={"/cities/"+region.city_id}>Entrer dans la cité</a>}
    </div>
    <div className="region-legend">
      <div><strong>Mines rattachées à cette cité</strong>
        <p>{region.mine_types_unlocated.map(k=>MINE_LABELS[k]??k).join(" · ")||"Aucune mine enregistrée"}</p>
        <small>Types connus dans PostgreSQL, emplacements non définis sur les 25 cases.</small>
      </div>
      <div><strong>Régions voisines (monde torique)</strong>
        <div className="region-neighbors">
          {region.surrounding_world_regions.map(c=><span key={c.dx+":"+c.dy}
            className={c.is_current?"current":""}
            title={c.is_current?"Région actuelle":"Coordonnées seules ; contenu non découvert"}>
            {c.x},{c.y}</span>)}
        </div>
        <small>Coordonnées du monde, distinctes des cases locales (i,j).</small>
      </div>
    </div>
  </section>;
}
