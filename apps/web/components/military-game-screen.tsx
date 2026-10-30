"use client";

import {useState} from "react";
import type {ReactNode} from "react";

type Tab="garrison"|"recruitment"|"tavern";
const tabs=[
  {id:"garrison",label:"Garnison"},
  {id:"recruitment",label:"Recrutement"},
  {id:"tavern",label:"Taverne"},
] as const;

export function MilitaryGameScreen({garrison,recruitment,tavern,heroesCount=0}:{
  garrison:ReactNode;recruitment:ReactNode;tavern:ReactNode;heroesCount?:number;
}){
  const [screen,setScreen]=useState<Tab>("garrison");
  return <div className="mmhk-military-game-screen" data-testid="military-game-screen"
    data-active-screen={screen}>
    <header className="mmhk-hero-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>Commandement des armées</strong>
        <small>{heroesCount} héros présents dans la cité</small>
      </div>
      <div role="tablist" aria-label="Écrans militaires" className="mmhk-command-tabs">
        {tabs.map(tab=><button key={tab.id} id={"military-tab-"+tab.id}
          type="button" role="tab" aria-selected={screen===tab.id}
          aria-controls={"military-panel-"+tab.id}
          onClick={()=>setScreen(tab.id)}>{tab.label}</button>)}
      </div>
    </header>
    <div className="mmhk-military-active-screen">
      <section role="tabpanel" id="military-panel-garrison"
        aria-labelledby="military-tab-garrison"
        hidden={screen!=="garrison"} data-testid="military-garrison-screen">{garrison}</section>
      <section role="tabpanel" id="military-panel-recruitment"
        aria-labelledby="military-tab-recruitment"
        hidden={screen!=="recruitment"} data-testid="military-recruitment-screen">{recruitment}</section>
      <section role="tabpanel" id="military-panel-tavern"
        aria-labelledby="military-tab-tavern"
        hidden={screen!=="tavern"} data-testid="military-tavern-screen">{tavern}</section>
    </div>
  </div>;
}
