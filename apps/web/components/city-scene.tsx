"use client";
import Link from "next/link";
import {buildingName} from "../lib/city-buildings";
import type {MouseEvent} from "react";
import type {ConstructionCatalog,CityDetail} from "../lib/server-api";

/** These anchors are cross-referenced against CITYVIEW_CONF 4.1.3-MTR.
 * Blacksmith and the magic guild keep their original verified buildIcon anchors.
 * Stables/watchtower are not positioned: never pretend their origins are known.
 * All overlay drawings are ORIGINAL vector sprites, not Ubisoft files.
 */
const SPOTS=[
  {code:"village_hall",label:"Hôtel du village",x:304,y:138,style:"hall"},
  {code:"town_hall",label:"Hôtel de ville",x:304,y:111,style:"hall"},
  {code:"tavern",label:"Taverne",x:339,y:355,style:"tavern"},
  {code:"marketplace",label:"Marché",x:203,y:345,style:"market"},
  {code:"resource_silo",label:"Silos",x:153,y:364,style:"silo"},
  {code:"fort",label:"Fortifications",x:273,y:417,style:"fort"},
  {code:"recruit_t1",label:"Demeure T1",x:523,y:430,style:"barracks"},
  {code:"recruit_t2",label:"Demeure T2",x:282,y:239,style:"barracks"},
  {code:"blacksmith",label:"Forge",x:126,y:321,style:"forge"},
  {code:"mage_guild",label:"Guilde des mages",x:490,y:210,style:"magic"}
] as const;

function OriginalSprite({style,level,disabled}:{
  style:string;level:number;disabled:boolean;
}){
  const timber=style==="tavern"||style==="market"||style==="barracks"||style==="forge";
  const tower=style==="hall"||style==="fort"||style==="magic";
  const roof=style==="magic"?"#446b82":style==="fort"?"#53616b":
    style==="market"?"#b66a42":style==="tavern"?"#7b4b43":"#85644b";
  const walls=timber?"#d2aa79":"#bdc0ad";
  return <g opacity={disabled?.56:1}>
    <ellipse cx="0" cy="8" rx="45" ry="15" fill="#111b1c" opacity=".46"/>
    <path d="M-40 4L0-16 41 4 0 23Z" fill="#8d8065" stroke="#453d30" strokeWidth="2"/>
    {style==="silo" ? <>
      {[-19,10].map(x=><g key={x}>
        <path d={"M"+(x-11)+" -28h22v32q-11 13-22 0Z"} fill="#c1b498" stroke="#574e42" strokeWidth="2"/>
        <path d={"M"+(x-14)+" -28l14-29 14 29Z"} fill="#82583d" stroke="#ddc39a" strokeWidth="2"/>
        <path d={"M"+(x-5)+" -18h10"} stroke="#725e4d" strokeWidth="3"/>
      </g>)}
    </> : <>
      <path d="M-32-33L1-50 31-33V2L1 19-32 2Z" fill={walls} stroke="#645745" strokeWidth="2"/>
      <path d="M-32-33L1-50V19L-32 2Z" fill="#8c7967" opacity=".35"/>
      <path d="M-37-35L0-68 37-35 2-48Z" fill={roof} stroke="#4b4038" strokeWidth="2"/>
      <path d="M0-68L2-48 37-35" fill="none" stroke="#d3b681" strokeWidth="2"/>
      <path d="M-10-2V-21q11-12 19 0V12L0 17Z" fill="#4e4037" stroke="#bca077" strokeWidth="2"/>
      <path d="M-25-25h8v11h-8zM18-25h8v11h-8z" fill="#e7c879" stroke="#605043" strokeWidth="2"/>
      {tower&&<g>
        <path d="M-28-42V-85H-9V-42Z" fill="#b5b5a5" stroke="#635a4f" strokeWidth="2"/>
        <path d="M-32-84L-19-112-6-84Z" fill="#576f77" stroke="#e2c38d" strokeWidth="2"/>
        <path d="M13-41V-82H29V-41Z" fill="#a4a69a" stroke="#635a4f" strokeWidth="2"/>
        <path d="M10-80L21-103 32-80Z" fill="#52616f" stroke="#e2c38d" strokeWidth="2"/>
        <path d="M-22-71h6v12h-6zM19-70h5v12h-5z" fill="#e7bd72"/>
        {style==="magic"&&<path d="M-19-115L-25-126-19-142-11-126Z" fill="#8ccad2" stroke="#d9f1ff" strokeWidth="2"/>}
      </g>}
      {style==="tavern"&&<g>
        <path d="M28-35h22v30H28z" fill="#654338" stroke="#f0d39a" strokeWidth="2"/>
        <text x="39" y="-13" fontSize="20" textAnchor="middle" fill="#ffe6a6">✦</text>
        <path d="M34-42v7" stroke="#c9ac71" strokeWidth="2"/>
      </g>}
      {style==="market"&&<g>
        <path d="M-47-20L-29-40 3-20Z" fill="#c67b55" stroke="#ead3a6" strokeWidth="2"/>
        <path d="M-46-20v22M2-20v22" stroke="#dfcda7" strokeWidth="3"/>
        <path d="M-44-1h47" stroke="#d8ad69" strokeWidth="5"/>
      </g>}
      {style==="fort"&&<g>
        <path d="M-43-16L-43-51-29-51-29-43-21-43-21-51-6-51-6-12Z" fill="#9f9d91" stroke="#534d41" strokeWidth="2"/>
        <path d="M30-18V-58H41V-51H51V-18Z" fill="#9e9d94" stroke="#534d41" strokeWidth="2"/>
      </g>}
      {style==="forge"&&<g>
        <path d="M24-59v-25h13v29" fill="#7d6860" stroke="#473c37" strokeWidth="2"/>
        <path d="M25-87Q45-96 46-116" stroke="#bcbab1" strokeWidth="5" opacity=".65" fill="none"/>
      </g>}
      {style==="barracks"&&<g>
        <path d="M-43-18v-53M-38-18v-59M-43-67l18 7-18 8Z" fill="#d8ba77" stroke="#4a453b" strokeWidth="2"/>
        <path d="M32-25l5-47" stroke="#dac5a3" strokeWidth="3"/>
        <path d="M37-72l-7 11h14Z" fill="#bfc4ca"/>
      </g>}
    </>}
    <path d="M-37 3L0 24 40 4" fill="none" stroke="#e9d4a4" strokeOpacity=".35" strokeWidth="2"/>
    <g transform="translate(35,-74)"><circle r="12" fill="#263b45" stroke="#dec78d" strokeWidth="2"/>
      <text y="5" textAnchor="middle" fill="#f9e7b0" fontSize="13" fontWeight="bold">{level}</text></g>
  </g>;
}

export function CityScene({city,catalog,selectedBuilding,onSelect,tavernArtwork}:{
  city:CityDetail;catalog?:ConstructionCatalog;selectedBuilding?:string;
  onSelect?:(code:string)=>void;tavernArtwork:string|null;
}){
  const buildings=catalog?.buildings??[];
  const options=catalog?.options??[];
  const active=catalog?.active;
  const tavern=tavernArtwork;
  function inspect(event:MouseEvent<HTMLAnchorElement>,code:string){
    // Keep a real URL as progressive enhancement / middle-click fallback.
    if(!onSelect||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey)return;
    event.preventDefault();onSelect(code);
  }
  // A Town Hall visually upgrades the Village Hall, not a second building
  // standing on top of it. One centre survives at a time.
  const hallUpgraded=buildings.some(b=>b.building_code==="town_hall"&&b.active);
  const points=SPOTS.filter(spot=>
    (spot.code!=="town_hall"||hallUpgraded) &&
    (spot.code!=="village_hall"||!hallUpgraded)
  ).map(spot=>{
    const done=buildings.find(b=>b.building_code===spot.code);
    const option=options.find(o=>o.building_code===spot.code);
    return {...spot,done,option,building:active?.building_code===spot.code};
  });
  const unmapped=buildings.filter(b=>!SPOTS.some(p=>p.code===b.building_code));
  const unlocked=points.filter(p=>p.done?.active).length;
  const available=points.filter(p=>p.option?.available&&!p.done).length;
  return <section className="city-scene-section" id="city-scene" aria-labelledby="city-scene-heading">
    <div className="city-scene-header">
      <div><span className="eyebrow">CITÉ DU HAVRE · PANORAMA</span>
        <h2 id="city-scene-heading">{city.name}</h2>
        <p>{unlocked} bâtiments actifs · {available} nouveaux projets accessibles
          {active?" · un chantier en cours":""}</p>
      </div>
      <Link href="#urban-construction" className="scene-action">Ouvrir les chantiers</Link>
    </div>
    <div className="city-scene-frame haven-city-frame">
      <svg className="haven-city-svg" viewBox="0 0 680 552" role="img"
        aria-label={"Vue originale et interactive de la ville "+city.name}>
        <image href="/themes/public-safe/haven-landscape.svg" x="0" y="0" width="680" height="552"
          preserveAspectRatio="xMidYMid meet"/>
        <defs>
          <radialGradient id="haven-lot"><stop stopColor="#e4c881" stopOpacity=".65"/>
            <stop offset="1" stopColor="#927747" stopOpacity=".06"/></radialGradient>
        </defs>
        {points.map(spot=>{
          const done=spot.done;
          const status=done?(done.active?"construit et actif":"construit, inactif"):
            spot.building?"en chantier":spot.option?.available?"disponible":"verrouillé";
          return <a href={"/cities/"+city.city_id+"?inspect="+spot.code+"#city-inspector"}
            key={spot.code}
            className={"haven-plot "+(done?"has-building":"empty-plot")+
              (selectedBuilding===spot.code?" selected-plot":"")}
            data-building-code={spot.code}
            aria-current={selectedBuilding===spot.code?"location":undefined}
            aria-label={"Examiner "+spot.label+" — "+status}
            onClick={event=>inspect(event,spot.code)}
            tabIndex={0}>
            <title>{spot.label+" · "+status+(done?" · niveau "+done.level:"")}</title>
            <g transform={"translate("+spot.x+" "+spot.y+")"}>
              {done?<>
                {spot.code==="tavern"&&tavern&&done.active?
                  <image href={tavern} x="-45" y="-76" width="90" height="80"/>:
                  <OriginalSprite style={spot.style} level={done.level} disabled={!done.active}/>}
              </>:<>
                <ellipse cx="0" cy="1" rx="28" ry="11" fill="url(#haven-lot)" stroke="#d5b779"
                  strokeDasharray="3 4" strokeWidth="1.4"/>
                <path d="M-6-7h12v14H-6Z" fill="#445653bb" stroke="#d7c492" strokeWidth="1.3"/>
                {spot.building?<text y="5" textAnchor="middle" fontSize="13" fill="#ffe3a5">⚒</text>:
                  <text y="5" textAnchor="middle" fontSize="14" fill={spot.option?.available?"#f7e3b5":"#a0a9a0"}>+</text>}
              </>}
              <rect x="-53" y={done?"29":"12"} width="106" height="19" rx="4"
                fill={done?"#1d322fdc":"#223038c9"} stroke={done?"#cbb17a":"#8f947e"} strokeWidth="1"/>
              <text x="0" y={done?"42":"25"} textAnchor="middle"
                fontSize="10" fontWeight="bold" fill={done?"#f8e9ba":"#d2d4c6"}>
                {spot.label}</text>
            </g>
          </a>;
        })}
        {active&&<g>
          <rect x="460" y="18" width="205" height="34" rx="6" fill="#142932ed"
            stroke="#e0c789" strokeWidth="1.5"/>
          <text x="563" y="39" textAnchor="middle" fill="#fff0ba" fontSize="13">
            ⚒ Chantier : {buildingName(active.building_code)}</text>
        </g>}
        <rect x="14" y="516" width="315" height="24" rx="3" fill="#10252fe0" stroke="#ac9968"/>
        <text x="23" y="532" fontSize="11" fill="#efdab0">
          Décor original · bâtiments réellement construits</text>
      </svg>
    </div>
    <div className="haven-scene-key">
      <span><b>●</b> Bâtiment construit</span><span><b>+</b> Emplacement à développer</span>
      <span><b>⚒</b> Chantier en cours</span>
      <span>Les bâtiments historiques absents utilisent des illustrations originales.</span>
    </div>
    {unmapped.length>0&&<p className="city-scene-unmapped">
      Autres bâtiments enregistrés : {unmapped.map(b=>b.building_code+" niveau "+b.level).join(", ")}.
      Leurs emplacements ne sont pas attestés dans le client historique.</p>}
  </section>;
}
