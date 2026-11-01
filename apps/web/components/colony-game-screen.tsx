"use client";

import Link from "next/link";
import {useEffect,useState,type ReactNode} from "react";

type ColonyActivity="rights"|"prepare"|"orders";
const tabs=[
  {id:"rights",label:"Droits du royaume",hash:"#colony-rights"},
  {id:"prepare",label:"Préparer",hash:"#colony-form"},
  {id:"orders",label:"Expéditions",hash:"#colony-orders"}
] as const;

/** Player-facing navigation around the existing server-scoped eligibility,
 * quote and order journal. No synthetic mine, unit, site or resource is
 * created. Selecting an activity never dispatches a founding transaction. */
export function ColonyGameScreen({worldId,sourceCityId,initialTab="rights",
  notices,rights,prepare,orders}:{
  worldId:string;sourceCityId?:string;initialTab?:ColonyActivity;
  notices?:ReactNode;rights:ReactNode;prepare:ReactNode;orders:ReactNode;
}){
  const [active,setActive]=useState<ColonyActivity>(initialTab);
  useEffect(()=>setActive(initialTab),[worldId,initialTab]);
  useEffect(()=>{
    const sync=()=>{const found=tabs.find(t=>t.hash===window.location.hash);
      if(found)setActive(found.id);};
    sync();window.addEventListener("hashchange",sync);
    window.addEventListener("popstate",sync);
    return ()=>{window.removeEventListener("hashchange",sync);
      window.removeEventListener("popstate",sync);};
  },[worldId]);
  function select(next:ColonyActivity){
    setActive(next);
    const entry=tabs.find(t=>t.id===next);if(!entry)return;
    const url=new URL(window.location.href);url.hash=entry.hash;
    window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
  }
  return <div className="mmhk-colony-game-screen" data-testid="colony-game-screen"
    data-active-screen={active}>
    <header className="mmhk-colony-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>Conseil des fondations</strong>
        <small>Protection, devis et suivi des nouvelles cités</small>
      </div>
      <div className="mmhk-command-tabs" role="tablist" aria-label="Écrans de colonisation">
        {tabs.map((tab,i)=><button key={tab.id} role="tab" type="button"
          id={"colony-screen-tab-"+tab.id}
          aria-controls={"colony-screen-panel-"+tab.id}
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
      <nav className="mmhk-colony-shortcuts" aria-label="Navigation de l'expansion">
        <Link href={"/worlds/"+worldId}>Carte du monde</Link>
        {sourceCityId&&<Link href={"/cities/"+sourceCityId}>Cité d'origine</Link>}
      </nav>
    </header>
    {notices&&<div className="mmhk-colony-notices">{notices}</div>}
    <div className="mmhk-colony-active-screen">
      {tabs.map(tab=><section role="tabpanel" key={tab.id}
        id={"colony-screen-panel-"+tab.id}
        aria-labelledby={"colony-screen-tab-"+tab.id}
        data-testid={"colony-"+tab.id+"-screen"}
        hidden={active!==tab.id}>
        <div className="mmhk-colony-scroll">
          {tab.id==="rights"?<>
            {rights}
            <button type="button" className="mmhk-colony-primary-action"
              onClick={()=>select("prepare")}>Examiner une fondation possible</button>
          </>:tab.id==="prepare"?prepare:orders}
        </div>
      </section>)}
    </div>
  </div>;
}
