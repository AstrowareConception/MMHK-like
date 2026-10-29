"use client";

import {useRef,useState} from "react";
import {CityScene} from "./city-scene";
import {CityBuildingInspector,buildingName} from "./city-building-inspector";
import type {CityDetail,ConstructionCatalog} from "../lib/server-api";

/**
 * The panorama and the building inspector share one client-side selection.
 * All prices and mutations still come from the authenticated FastAPI server.
 * A deep-link is preserved for refreshes, while normal selections avoid RSC
 * navigation and the resulting viewport jump.
 */
export function CityDistrict({city,catalog,initialSelection,tavernArtwork}:{
  city:CityDetail;catalog?:ConstructionCatalog;
  initialSelection?:string;tavernArtwork:string|null;
}){
  const initial=initialSelection||
    catalog?.active?.building_code||
    catalog?.options.find(o=>o.available)?.building_code||
    catalog?.buildings[0]?.building_code;
  const [selected,setSelected]=useState<string|undefined>(initial);
  const inspectorRef=useRef<HTMLDivElement>(null);
  const navigate=(code?:string)=>{
    setSelected(code);
    const url=new URL(window.location.href);
    if(code)url.searchParams.set("inspect",code);
    else url.searchParams.delete("inspect");
    // Other query parameters (construction receipts) must be preserved.
    window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
    if(code&&window.matchMedia("(max-width: 980px)").matches)
      window.requestAnimationFrame(()=>inspectorRef.current?.scrollIntoView({
        behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"auto":"smooth",
        block:"start"
      }));
  };
  const suggested=[...(catalog?.options??[])].sort((a,b)=>
    Number(b.available)-Number(a.available)||
    a.building_code.localeCompare(b.building_code));
  return <section className="mmhk-city-district" aria-label="Atelier de la cité"
    data-testid="city-interactive-district">
    <div className="mmhk-city-district-heading">
      <div><span className="eyebrow">LES DEMEURES DU HAVRE</span>
        <h2>La cité et ses édifices</h2>
        <p>Choisissez un bâtiment dans le paysage ou parmi les projets.
          Son état et ses devis s'ouvrent à côté du panorama.</p></div>
      <span className="mmhk-district-seal" aria-hidden="true">⚜</span>
    </div>
    <div className="mmhk-city-workbench">
      <div className="mmhk-city-scene-column">
        <CityScene city={city} catalog={catalog} selectedBuilding={selected}
          tavernArtwork={tavernArtwork} onSelect={navigate}/>
        <nav className="city-plan-ribbon" aria-label="Bâtiments et projets disponibles">
          <span className="eyebrow">RÉPERTOIRE DES ÉDIFICES</span>
          <div className="city-plan-ribbon-list">
            {suggested.map(o=><button key={o.building_code} type="button"
              className={selected===o.building_code?"selected":""}
              aria-pressed={selected===o.building_code}
              onClick={()=>navigate(o.building_code)}>
              {buildingName(o.building_code)}
              <small>{o.available?"Niv. "+o.target_level+" accessible":"Verrouillé"}</small>
            </button>)}
          </div>
        </nav>
      </div>
      <div className="mmhk-city-inspector-column" ref={inspectorRef}>
        <CityBuildingInspector key={selected??"closed"} city={city}
          catalog={catalog} selectedBuilding={selected}
          onSelect={navigate} onClose={()=>navigate(undefined)}/>
      </div>
    </div>
  </section>;
}
