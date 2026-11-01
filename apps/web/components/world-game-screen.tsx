"use client";

import {useEffect,useState} from "react";
import type {ReactNode} from "react";

type WorldActivity="map"|"cities"|"influence"|"expansion";
const sections=[
  {id:"map",label:"Carte",hash:"#atlas"},
  {id:"cities",label:"Mes cités",hash:"#world-cities"},
  {id:"influence",label:"Influence",hash:"#territory"},
  {id:"expansion",label:"Expansion",hash:"#world-expansion"}
] as const;
function fromHash(hash:string):WorldActivity|null{
  if(hash==="#world-city-list"||hash==="#world-stocks")return "cities";
  return sections.find(s=>s.hash===hash)?.id??null;
}

/** Four exclusive, bounded world activities. All server-provided discoveries,
 * city records and influence remain unaltered. No action is synthesized here.
 * Keep tab panels mounted, so camera state survives normal tab switches.
 */
export function WorldGameScreen({worldId,worldName,map,cities,influence,expansion}:{
  worldId:string;worldName:string;map:ReactNode;cities:ReactNode;
  influence:ReactNode;expansion:ReactNode;
}){
  const [active,setActive]=useState<WorldActivity>("map");
  useEffect(()=>{
    const sync=()=>{const destination=fromHash(window.location.hash);
      if(destination)setActive(destination);};
    sync();
    window.addEventListener("hashchange",sync);
    window.addEventListener("popstate",sync);
    return ()=>{window.removeEventListener("hashchange",sync);
      window.removeEventListener("popstate",sync);};
  },[worldId]);
  const select=(id:WorldActivity)=>{
    setActive(id);
    const tab=sections.find(s=>s.id===id);
    if(!tab)return;
    const url=new URL(window.location.href);url.hash=tab.hash;
    window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
  };
  return <div className="mmhk-world-game-screen" data-testid="world-game-screen"
    data-active-screen={active}>
    <header className="mmhk-world-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>Atlas de {worldName}</strong>
        <small>Territoire, cités et expansion du royaume</small>
      </div>
      <div className="mmhk-command-tabs" role="tablist" aria-label="Écrans du monde">
        {sections.map((s,i)=><button key={s.id} type="button" role="tab"
          id={"world-screen-tab-"+s.id}
          aria-controls={"world-screen-panel-"+s.id}
          aria-selected={active===s.id} tabIndex={active===s.id?0:-1}
          onClick={()=>select(s.id)}
          onKeyDown={e=>{
            if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
            e.preventDefault();
            const next=e.key==="Home"?0:e.key==="End"?sections.length-1:
              (i+(e.key==="ArrowRight"?1:-1)+sections.length)%sections.length;
            select(sections[next].id);
            e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
          }}>{s.label}</button>)}
      </div>
    </header>
    <div className="mmhk-world-active-screen">
      {sections.map(s=><section key={s.id} role="tabpanel"
        id={"world-screen-panel-"+s.id}
        aria-labelledby={"world-screen-tab-"+s.id}
        data-testid={"world-"+s.id+"-screen"}
        hidden={active!==s.id}>
        {s.id==="map"?map:s.id==="cities"?cities:
          s.id==="influence"?influence:expansion}
      </section>)}
    </div>
  </div>;
}
