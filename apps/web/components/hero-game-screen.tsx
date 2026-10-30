"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import type {ReactNode} from "react";
import {HeritagePortrait} from "./heritage-art";
import type {CityForces} from "../lib/server-api";

type Hero=CityForces["heroes"][number];
export type HeroScreenTab="inventory"|"formation"|"army";
const sections=[
  {id:"inventory",label:"Inventaire"},
  {id:"formation",label:"Formation"},
  {id:"army",label:"Armée"}
] as const;

/** One game screen at a time, not one scrollable web article.
 * Browser scroll is confined to collections of heroes/objects, never the
 * command window or the complete hero workspace. All three panels are
 * preserved in React when switching between views, so unsaved formations
 * do not disappear simply because the player opens the inventory.
 */
export function HeroGameScreen({cityId,hero,heroes,initialTab,
  portraitSheet,fallbackMight,fallbackMagic,
  inventory,formation,army,artifactNotice,formationNotice}:{
  cityId:string;hero:Hero;heroes:Hero[];initialTab:HeroScreenTab;
  portraitSheet:string|null;fallbackMight:string;fallbackMagic:string;
  inventory:ReactNode;formation:ReactNode;army:ReactNode;
  artifactNotice?:ReactNode;formationNotice?:ReactNode;
}){
  const [tab,setTab]=useState<HeroScreenTab>(initialTab);
  useEffect(()=>setTab(initialTab),[hero.hero_id,initialTab]);
  useEffect(()=>{
    const readHash=()=>{
      const destination=window.location.hash;
      if(destination==="#hero-formation")setTab("formation");
      else if(destination==="#hero-army")setTab("army");
      else if(destination==="#hero-equipment")setTab("inventory");
    };
    readHash();
    window.addEventListener("hashchange",readHash);
    return ()=>window.removeEventListener("hashchange",readHash);
  },[hero.hero_id]);
  function select(next:HeroScreenTab){
    setTab(next);
    const destination=next==="formation"?"#hero-formation":
      next==="army"?"#hero-army":"#hero-equipment";
    window.history.replaceState(window.history.state,"",
      window.location.pathname+window.location.search+destination);
  }
  return <div className="mmhk-single-hero-screen" data-testid="hero-game-screen"
    data-active-screen={tab}>
    <header className="mmhk-hero-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>{hero.name}</strong>
        <small>{hero.archetype==="magic"?"Voie de la Magie":"Voie de la Force"}
          {" · Niveau "+hero.level+" · "+hero.experience.toLocaleString("fr-FR")+" XP"}</small>
      </div>
      <div className="mmhk-command-tabs" role="tablist" aria-label="Écrans du héros">
        {sections.map(item=><button key={item.id} type="button" role="tab"
          id={"hero-screen-tab-"+item.id}
          aria-selected={tab===item.id}
          aria-controls={"hero-screen-panel-"+item.id}
          onClick={()=>select(item.id)}>{item.label}</button>)}
        <span className="mmhk-locked-tab" title="Fonction non encore développée">Talents</span>
        <span className="mmhk-locked-tab" title="Fonction non encore développée">Sorts</span>
      </div>
    </header>
    <div className="mmhk-hero-screen-grid">
      <div className="mmhk-hero-active-screen">
        <section role="tabpanel" id="hero-screen-panel-inventory"
          aria-labelledby="hero-screen-tab-inventory"
          hidden={tab!=="inventory"} data-testid="hero-inventory-screen">
          {tab==="inventory"&&artifactNotice}
          {inventory}
        </section>
        <section role="tabpanel" id="hero-screen-panel-formation"
          aria-labelledby="hero-screen-tab-formation"
          hidden={tab!=="formation"} data-testid="hero-formation-screen">
          {tab==="formation"&&formationNotice}
          {formation}
        </section>
        <section role="tabpanel" id="hero-screen-panel-army"
          aria-labelledby="hero-screen-tab-army"
          hidden={tab!=="army"} data-testid="hero-army-screen">{army}</section>
      </div>
      <aside className="mmhk-hero-screen-roster" aria-label="Héros présents">
        <div className="mmhk-roster-caption">HÉROS DE LA CITÉ
          <span>{heroes.length}</span></div>
        <div className="mmhk-roster-scroll">
          {heroes.map(h=><Link key={h.hero_id}
            href={"/cities/"+cityId+"/heroes?hero="+h.hero_id}
            aria-current={h.hero_id===hero.hero_id?"page":undefined}
            className={"mmhk-roster-compact-choice"+(h.hero_id===hero.hero_id?" selected":"")}>
            <HeritagePortrait heroId={h.hero_id} archetype={h.archetype}
              sheet={portraitSheet}
              fallback={h.archetype==="magic"?fallbackMagic:fallbackMight}/>
            <span><strong>{h.name}</strong><small>niveau {h.level} · {h.status==="idle"?
              "Présent":h.status==="on_mission"?"Mission":h.status}</small></span>
          </Link>)}
        </div>
        <Link className="mmhk-hero-garrison-link" href={"/cities/"+cityId+"/forces"}>
          ⚔ Garnison
        </Link>
      </aside>
    </div>
  </div>;
}
