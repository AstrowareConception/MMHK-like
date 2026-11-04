"use client";

import {useState,type KeyboardEvent} from "react";
import Link from "next/link";
import {REGION_VIEW,regionCellCenter,regionPolygon} from "../lib/region-geometry";

export type WorldRegionInspection={
  world_id:string;x:number;y:number;
  city:{city_id:string;name:string;ownership:"own"|"discovered"}|null;
  city_known:boolean;mines:string[];mines_known:boolean;
  regional_resources:string[]|null;regional_resources_known:boolean;
  natural_deposits:{slot:number;resource:string;i:number;j:number}[];
  special_site:{kind:string;label:string}|null;
  terrain:string|null;terrain_known:boolean;
  colonization_site_qualified:boolean;
};

const NAMES:Record<string,string>={
  gold:"Or",wood:"Bois",ore:"Minerai",crystal:"Cristal",
  gems:"Gemmes",sulfur:"Soufre",mercury:"Mercure"
};
const COLORS:Record<string,string>={
  gold:"#d9b267",wood:"#8eae75",ore:"#b6c1c9",crystal:"#7bccd5",
  gems:"#c39be0",sulfur:"#e8d46f",mercury:"#b4dce2"
};

type MilitaryReadiness={
  target_kind:"own_city"|"discovered_opponent"|"target_not_identified";
  target_name:string|null;
  heroes:{city_id:string;city_name:string;hero_id:string;hero_name:string;
    status:string;troop_count:number;distance_steps:number;
    preparation_ready:boolean}[];
  attack_enabled:boolean;raid_enabled:boolean;blocking_reasons:string[];
};

export function RegionDiscoveryBoard({region,military}:{
  region:WorldRegionInspection;military:MilitaryReadiness|null;
}){
  const [selected,setSelected]=useState({i:2,j:2});
  const mine=region.natural_deposits?.find(d=>d.i===selected.i&&d.j===selected.j);
  const city=region.city;
  const onKey=(e:KeyboardEvent<SVGGElement>,i:number,j:number)=>{
    if(e.key==="Enter"||e.key===" "){
      e.preventDefault();setSelected({i,j});
    }
  };
  return <div className="mmhk-discovery-layout" data-testid="world-region-discovery">
    <div className="mmhk-discovery-map">
      <div className="map-section-heading">
        <div>
          <span className="eyebrow">RECONNAISSANCE · RÉGION {region.x}, {region.y}</span>
          <h2>Le territoire et ses gisements</h2>
        </div>
        <span className="map-section-legend">25 emplacements</span>
      </div>
      <svg viewBox={"0 0 "+REGION_VIEW.width+" "+REGION_VIEW.height}
        className="region-scene" role="group"
        aria-label="Carte régionale schématique : choisissez l'une des 25 cases">
        <rect width="680" height="562" fill="#1d3439"/>
        <path d="M0 195 Q185 82 360 184 T680 145 V562 H0Z"
          fill="#304c47" pointerEvents="none"/>
        <path d="M0 385 Q180 295 350 387 T680 330 V562 H0Z"
          fill="#273b36" pointerEvents="none"/>
        {Array.from({length:25},(_,n)=>{
          const i=n%5,j=Math.floor(n/5),p=regionCellCenter(i,j);
          const d=region.natural_deposits?.find(s=>s.i===i&&s.j===j);
          const active=i===selected.i&&j===selected.j;
          const center=i===2&&j===2;
          return <g key={n} role="button" tabIndex={0}
            className="region-selectable-cell" data-region-i={i} data-region-j={j}
            aria-label={"Case "+i+", "+j+(d?" : gisement de "+(NAMES[d.resource]??d.resource):center&&city?" : cité "+city.name:" : contenu non cartographié")}
            onClick={()=>setSelected({i,j})} onKeyDown={e=>onKey(e,i,j)}>
            <title>{"Case "+i+", "+j}</title>
            <polygon points={regionPolygon(i,j)}
              fill={active?"#b89661":d?"#567569":center&&city?"#77684f":"#547166"}
              fillOpacity={active ? 0.55 : 0.28}
              stroke={active?"#f8e4ad":"#b5b99b"} strokeOpacity={active?1:.48}
              strokeWidth={active?3:1}/>
            {d&&<g pointerEvents="none">
              <path d={"M"+(p.x-18)+" "+(p.y+4)+"l10-19 17 2 10 17-13 8Z"}
                fill={COLORS[d.resource]??"#d6ccaa"} stroke="#26373a" strokeWidth="2"/>
              <text x={p.x} y={p.y+27} textAnchor="middle"
                fill="#f7e9c9" fontSize="11" stroke="#0b1c23"
                strokeWidth="3" paintOrder="stroke">
                {NAMES[d.resource]??d.resource}
              </text>
            </g>}
            {center&&city&&<g pointerEvents="none">
              <path d={"M"+(p.x-19)+" "+(p.y+5)+"v-29l19-16 19 16v29Z"}
                fill="#d6bc83" stroke="#30434a" strokeWidth="3"/>
              <text x={p.x} y={p.y+28} textAnchor="middle" fill="#fff2cd"
                stroke="#15252b" strokeWidth="3" paintOrder="stroke" fontSize="11">
                Cité connue
              </text>
            </g>}
          </g>;
        })}
      </svg>
    </div>
    <aside className="mmhk-region-inspector" aria-live="polite">
      <span className="eyebrow">FICHE DE RECONNAISSANCE</span>
      <h3>Case ({selected.i}, {selected.j})</h3>
      <p>{mine?"Gisement naturel : "+(NAMES[mine.resource]??mine.resource)
        :selected.i===2&&selected.j===2&&city?"Cité connue : "+city.name
        :"Aucun détail régional confirmé pour cette case."}</p>
      {city&&<p>Occupant connu : <strong>{city.name}</strong></p>}
      <h4>Composition régionale</h4>
      <p>{region.regional_resources_known&&region.regional_resources
        ?region.regional_resources.map(r=>NAMES[r]??r).join(" · ")
        :"Ressources non découvertes"}</p>
      <h4>Exploitations connues</h4>
      <p>{region.mines_known
        ?(region.mines.length?region.mines.map(r=>NAMES[r]??r).join(" · "):"Aucune mine déclarée")
        :"Informations non disponibles"}</p>
      {region.special_site&&<p>Site : {region.special_site.label}</p>}
      {city?.ownership==="own"&&<Link className="scene-action"
        href={"/cities/"+city.city_id+"/region"}>Ouvrir la région de votre cité</Link>}
      {region.colonization_site_qualified&&<Link className="scene-action"
        href={"/worlds/"+encodeURIComponent(region.world_id)+"/colonize?"+
          new URLSearchParams({x:String(region.x),y:String(region.y)}).toString()+
          "#colony-form"}>
        Examiner une fondation sur cette région
      </Link>}
      <section className="mmhk-discovery-military" aria-label="Préparation des expéditions militaires">
        <h4>Préparation militaire</h4>
        {!military?<p>État des armées momentanément indisponible.</p>:<>
          <p>{military.target_kind==="own_city"
            ?"Votre propre cité ne peut pas être attaquée."
            :military.target_kind==="discovered_opponent"
              ?"Cité adverse découverte : "+military.target_name
              :"Aucune cible militaire confirmée à cette position."}</p>
          <div className="mmhk-discovery-hero-list">
            {military.heroes.map(hero=><div key={hero.hero_id}
              className="mmhk-discovery-hero">
              <strong>{hero.hero_name}</strong>
              <small>{hero.city_name} · {hero.troop_count.toLocaleString("fr-FR")} soldats ·
                {hero.distance_steps} cases</small>
              <small>{hero.status==="idle"?"Disponible":"Occupé"}
                {hero.preparation_ready?" · Armée affectée":" · Non prêt au départ"}</small>
            </div>)}
            {!military.heroes.length&&<p>Aucun héros engagé dans vos cités.</p>}
          </div>
          <div className="mmhk-discovery-locked-orders">
            <button type="button" disabled title="Les ordres PvP ne sont pas encore disponibles">Attaquer · verrouillé</button>
            <button type="button" disabled title="Le pillage PvP reste indisponible">Piller · verrouillé</button>
          </div>
          <small>Préparation informative uniquement. Aucun départ, coût,
            pillage ou combat n'est déclenché depuis cet écran.</small>
        </>}
      </section>
      <p className="map-qualification">Les emplacements non renseignés ne sont pas nécessairement libres.
        Cette carte n'indique aucun terrain, adversaire ou chemin qui n'ait été révélé par le serveur.</p>
      <Link className="scene-action" href={"/worlds/"+encodeURIComponent(region.world_id)}>
        Revenir à la carte du monde
      </Link>
    </aside>
  </div>;
}
