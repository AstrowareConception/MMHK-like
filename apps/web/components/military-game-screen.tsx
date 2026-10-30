"use client";

import {useEffect,useState} from "react";
import Link from "next/link";
import type {ReactNode} from "react";

type Tab="garrison"|"recruitment"|"tavern";
const tabs=[
  {id:"garrison",label:"Garnison"},
  {id:"recruitment",label:"Recrutement"},
  {id:"tavern",label:"Taverne"},
] as const;

export function MilitaryGameScreen({garrison,recruitment,tavern,heroesCount=0,
  initialTab="garrison",garrisonEmpty=false,tavernLocked=false,cityHref=""}:{
  garrison:ReactNode;recruitment:ReactNode;tavern:ReactNode;heroesCount?:number;
  initialTab?:Tab;garrisonEmpty?:boolean;tavernLocked?:boolean;
  cityHref?:string;
}){
  const [screen,setScreen]=useState<Tab>(initialTab);
  useEffect(()=>setScreen(initialTab),[initialTab]);
  return <div className="mmhk-military-game-screen" data-testid="military-game-screen"
    data-active-screen={screen}>
    <header className="mmhk-hero-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>Commandement des armées</strong>
        <small>{heroesCount} héros présents dans la cité</small>
      </div>
      <div role="tablist" aria-label="Écrans militaires" className="mmhk-command-tabs">
        {tabs.map((tab,i)=><button key={tab.id} id={"military-tab-"+tab.id}
          type="button" role="tab" aria-selected={screen===tab.id}
          tabIndex={screen===tab.id?0:-1}
          aria-controls={"military-panel-"+tab.id}
          onKeyDown={e=>{
            if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
            e.preventDefault();
            const next=e.key==="Home"?0:e.key==="End"?tabs.length-1:
              (i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
            setScreen(tabs[next].id);
            e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
          }}
          onClick={()=>setScreen(tab.id)}>{tab.label}</button>)}
      </div>
    </header>
    <div className="mmhk-military-active-screen">
      <section role="tabpanel" id="military-panel-garrison"
        aria-labelledby="military-tab-garrison"
        hidden={screen!=="garrison"} data-testid="military-garrison-screen">
        {garrison}
        {garrisonEmpty&&<div className="mmhk-screen-empty mmhk-garrison-empty">
          <span className="mmhk-empty-symbol" aria-hidden="true">⚔</span>
          <strong>Vos murailles attendent leur garnison</strong>
          <p>La cité ne compte aucun soldat. Recrutez dans une demeure,
            puis affectez vos pelotons aux héros depuis ce plateau.</p>
          <button type="button" onClick={()=>setScreen("recruitment")}>
            Ouvrir le recrutement
          </button>
        </div>}
      </section>
      <section role="tabpanel" id="military-panel-recruitment"
        aria-labelledby="military-tab-recruitment"
        hidden={screen!=="recruitment"} data-testid="military-recruitment-screen">{recruitment}</section>
      <section role="tabpanel" id="military-panel-tavern"
        aria-labelledby="military-tab-tavern"
        hidden={screen!=="tavern"} data-testid="military-tavern-screen">
        {tavern}
        {tavernLocked&&cityHref&&<div className="mmhk-screen-empty mmhk-tavern-empty">
          <span className="mmhk-empty-symbol" aria-hidden="true">♜</span>
          <strong>La taverne est encore fermée</strong>
          <p>Construisez la taverne pour ouvrir les offres de compagnons.
            Vos héros déjà engagés restent disponibles dans la salle des héros.</p>
          <Link href={cityHref}>Examiner le chantier de la taverne</Link>
        </div>}
      </section>
    </div>
  </div>;
}
