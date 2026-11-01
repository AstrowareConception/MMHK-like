"use client";

import {useEffect,useState,type ReactNode} from "react";
import Link from "next/link";
type MissionTab="journey"|"events"|"formation"|"duel";
const tabs=[
  {id:"journey",label:"Trajet",hash:"#mission-journey"},
  {id:"events",label:"Journal",hash:"#mission-events"},
  {id:"formation",label:"Formation",hash:"#mission-formation"},
  {id:"duel",label:"Duel",hash:"#mission-duel"}
] as const;

/** A report is a read-only, immutable server record: tabs never change its
 * chronology, duel outcome, formation snapshot or persistence. All four
 * sections stay mounted, so keyboard and fragment navigation are stable.
 */
export function MissionReportGameScreen({cityId,heroId,heroName,encounterName,stage,
  journey,events,formation,duel}:{
  cityId:string;heroId:string;heroName:string;encounterName:string;stage:string;
  journey:ReactNode;events:ReactNode;formation:ReactNode;duel:ReactNode;
}){
  const [active,setActive]=useState<MissionTab>("journey");
  useEffect(()=>{
    const sync=()=>{
      const item=tabs.find(t=>t.hash===window.location.hash);
      if(item)setActive(item.id);
    };
    sync();window.addEventListener("hashchange",sync);
    window.addEventListener("popstate",sync);
    return ()=>{window.removeEventListener("hashchange",sync);
      window.removeEventListener("popstate",sync);};
  },[cityId]);
  function select(next:MissionTab){
    setActive(next);
    const entry=tabs.find(t=>t.id===next);
    if(!entry)return;
    const url=new URL(window.location.href);url.hash=entry.hash;
    window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
  }
  return <div className="mmhk-mission-report-game-screen"
    data-testid="mission-report-game-screen" data-active-screen={active}>
    <header className="mmhk-mission-report-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>{encounterName}</strong>
        <small>{heroName} · {stage}</small>
      </div>
      <div role="tablist" aria-label="Écrans du rapport de mission"
        className="mmhk-command-tabs">
        {tabs.map((tab,i)=><button key={tab.id} type="button" role="tab"
          id={"report-screen-tab-"+tab.id}
          aria-controls={"report-screen-panel-"+tab.id}
          aria-selected={active===tab.id} tabIndex={active===tab.id?0:-1}
          onClick={()=>select(tab.id)}
          onKeyDown={e=>{
            if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
            e.preventDefault();
            const j=e.key==="Home"?0:e.key==="End"?tabs.length-1:
              (i+(e.key==="ArrowRight"?1:-1)+tabs.length)%tabs.length;
            select(tabs[j].id);
            e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[j]?.focus();
          }}>{tab.label}</button>)}
      </div>
      <nav className="mmhk-mission-report-shortcuts" aria-label="Navigation depuis le rapport">
        <Link href={"/cities/"+cityId+"/region"}>Retour à la région</Link>
        <Link href={"/cities/"+cityId+"/heroes?hero="+encodeURIComponent(heroId)}>Fiche du héros</Link>
        <Link href={"/cities/"+cityId+"/forces"}>Garnison</Link>
      </nav>
    </header>
    <div className="mmhk-mission-report-active-screen">
      {tabs.map(tab=><section key={tab.id} role="tabpanel"
        id={"report-screen-panel-"+tab.id}
        aria-labelledby={"report-screen-tab-"+tab.id}
        data-testid={"report-"+tab.id+"-screen"}
        hidden={active!==tab.id}>
        <div className="mmhk-mission-report-scroll">
          {tab.id==="journey"?journey:tab.id==="events"?events:
            tab.id==="formation"?formation:duel}
        </div>
      </section>)}
    </div>
  </div>;
}
