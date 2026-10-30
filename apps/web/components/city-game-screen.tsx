"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import type {MouseEvent,ReactNode} from "react";

export type CityActivity="panorama"|"reserves"|"construction"|"history";
const tabs=[
  {id:"panorama",label:"Panorama",hash:"#city-scene"},
  {id:"reserves",label:"Réserves",hash:"#city-resources"},
  {id:"construction",label:"Chantiers",hash:"#urban-construction"},
  {id:"history",label:"Historique",hash:"#city-history"}
] as const;

function fromHash(hash:string):CityActivity|null{
  if(hash==="#city-scene"||hash==="#city-inspector")return "panorama";
  if(hash==="#city-resources")return "reserves";
  if(hash==="#urban-construction")return "construction";
  if(hash==="#city-history")return "history";
  return null;
}

/** Each activity is a real game surface, not a giant article behind overflow:hidden.
 * Server-rendered content is preserved in all four panels. Only individual
 * collections and the building inspector scroll. Switching never mutates the
 * city, its treasury, construction orders or navigation history.
 */
export function CityGameScreen({cityId,worldId,cityName,initialTab="panorama",
  notices,panorama,reserves,construction,history}:{
  cityId:string;worldId:string;cityName:string;initialTab?:CityActivity;
  notices?:ReactNode;panorama:ReactNode;reserves:ReactNode;
  construction:ReactNode;history:ReactNode;
}){
  const [active,setActive]=useState<CityActivity>(initialTab);
  useEffect(()=>setActive(initialTab),[initialTab,cityId]);
  useEffect(()=>{
    const sync=()=>{const destination=fromHash(window.location.hash);
      if(destination)setActive(destination);};
    sync();
    window.addEventListener("hashchange",sync);
    window.addEventListener("popstate",sync);
    return ()=>{window.removeEventListener("hashchange",sync);
      window.removeEventListener("popstate",sync);};
  },[cityId]);

  function select(tab:CityActivity){
    setActive(tab);
    const entry=tabs.find(t=>t.id===tab);
    if(!entry)return;
    // replaceState does not scroll into an old, hidden panel.
    const url=new URL(window.location.href);
    url.hash=entry.hash;
    window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
  }
  function handleAnchor(event:MouseEvent<HTMLDivElement>){
    const node=event.target;
    if(!(node instanceof Element))return;
    const link=node.closest("a[href]");
    const href=link?.getAttribute("href")??"";
    if(!href.startsWith("#"))return;
    const destination=fromHash(href);
    if(!destination)return;
    event.preventDefault();
    select(destination);
  }

  return <div className="mmhk-city-game-screen" data-testid="city-game-screen"
    data-active-screen={active} onClick={handleAnchor}>
    <header className="mmhk-city-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>Conseil de {cityName}</strong>
        <small>Édifices, ressources et ordres de construction</small>
      </div>
      <div role="tablist" aria-label="Écrans de la cité" className="mmhk-command-tabs">
        {tabs.map((tab,i)=><button type="button" role="tab" key={tab.id}
          id={"city-screen-tab-"+tab.id} aria-controls={"city-screen-panel-"+tab.id}
          aria-selected={active===tab.id} tabIndex={active===tab.id?0:-1}
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
      <nav className="mmhk-city-quicklinks" aria-label="Autres activités de la cité">
        <Link href={"/cities/"+cityId+"/heroes"}>Héros et artefacts</Link>
        <Link href={"/cities/"+cityId+"/forces"}>Garnison et recrutement</Link>
        <Link href={"/cities/"+cityId+"/market"}>Marché</Link>
        <Link href={"/worlds/"+worldId+"/colonize"}>Expansion</Link>
      </nav>
    </header>
    {notices&&<div className="mmhk-city-notices">{notices}</div>}
    <div className="mmhk-city-active-screen">
      {tabs.map(tab=><section key={tab.id} role="tabpanel"
        id={"city-screen-panel-"+tab.id}
        aria-labelledby={"city-screen-tab-"+tab.id}
        data-testid={"city-"+tab.id+"-screen"}
        hidden={active!==tab.id}>
        {tab.id==="panorama"?panorama:
          tab.id==="reserves"?reserves:
          tab.id==="construction"?construction:history}
      </section>)}
    </div>
  </div>;
}
