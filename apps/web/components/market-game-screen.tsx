"use client";

import Link from "next/link";
import {useEffect,useState} from "react";
import type {MouseEvent,ReactNode} from "react";

export type MarketActivity="merchant"|"auctions"|"caravans"|"ledger";
const entries=[
  {id:"merchant",label:"Marchand",hash:"#merchant"},
  {id:"auctions",label:"Hôtel des ventes",hash:"#marketplace"},
  {id:"caravans",label:"Caravanes",hash:"#caravans"},
  {id:"ledger",label:"Historique",hash:"#market-ledger"}
] as const;
function forHash(hash:string):MarketActivity|null{
  const selected=entries.find(t=>t.hash===hash);
  if(selected)return selected.id;
  if(hash==="#market-quote")return "merchant";
  return null;
}

/** Real commerce is server-rendered once, with one exclusive visible activity.
 * Switches are visual only and never simulate or submit an economic order.
 * Collections inside each tab may scroll, never the kingdom's outer viewport.
 */
export function MarketGameScreen({cityId,initialTab="merchant",merchantAvailable,
  auctionAvailable,caravanAvailable,notices,merchant,auctions,caravans,ledger}:{
  cityId:string;initialTab?:MarketActivity;
  merchantAvailable:boolean;auctionAvailable:boolean;caravanAvailable:boolean;
  notices?:ReactNode;merchant:ReactNode;auctions:ReactNode;
  caravans:ReactNode;ledger:ReactNode;
}){
  const [active,setActive]=useState<MarketActivity>(initialTab);
  useEffect(()=>setActive(initialTab),[cityId,initialTab]);
  useEffect(()=>{
    const sync=()=>{const desired=forHash(window.location.hash);
      if(desired)setActive(desired);};
    sync();window.addEventListener("hashchange",sync);
    window.addEventListener("popstate",sync);
    return ()=>{window.removeEventListener("hashchange",sync);
      window.removeEventListener("popstate",sync);};
  },[cityId]);

  function select(next:MarketActivity){
    setActive(next);
    const entry=entries.find(e=>e.id===next);
    if(!entry)return;
    const url=new URL(window.location.href);
    url.hash=entry.hash;
    window.history.replaceState(window.history.state,"",url.pathname+url.search+url.hash);
  }
  function anchors(e:MouseEvent<HTMLDivElement>){
    const node=e.target;
    if(!(node instanceof Element))return;
    const link=node.closest("a[href]");
    const href=link?.getAttribute("href")??"";
    if(!href.startsWith("#"))return;
    const next=forHash(href);
    if(!next)return;
    e.preventDefault();select(next);
  }
  const state=(id:MarketActivity)=>{
    if(id==="merchant")return merchantAvailable;
    if(id==="auctions")return auctionAvailable;
    if(id==="caravans")return caravanAvailable;
    return true;
  };
  return <div className="mmhk-market-game-screen" data-testid="market-game-screen"
    data-active-screen={active} onClick={anchors}>
    <header className="mmhk-market-command-header">
      <div className="mmhk-command-hero-heading">
        <strong>Halle des échanges</strong>
        <small>Devis, offres, transports et registre du royaume</small>
      </div>
      <div className="mmhk-command-tabs" role="tablist" aria-label="Écrans du marché">
        {entries.map((t,i)=><button type="button" role="tab" key={t.id}
          id={"market-screen-tab-"+t.id}
          aria-controls={"market-screen-panel-"+t.id}
          aria-selected={active===t.id} tabIndex={active===t.id?0:-1}
          onClick={()=>select(t.id)}
          onKeyDown={e=>{
            if(!["ArrowRight","ArrowLeft","Home","End"].includes(e.key))return;
            e.preventDefault();
            const next=e.key==="Home"?0:e.key==="End"?entries.length-1:
              (i+(e.key==="ArrowRight"?1:-1)+entries.length)%entries.length;
            select(entries[next].id);
            e.currentTarget.parentElement?.querySelectorAll<HTMLButtonElement>('[role="tab"]')[next]?.focus();
          }}>
          {t.label}
          {t.id!=="ledger"&&<small className={"mmhk-market-tab-state "+
            (state(t.id)?"available":"locked")}>{state(t.id)?"Disponible":"Fermé"}</small>}
        </button>)}
      </div>
      <Link className="mmhk-market-city-link"
        href={"/cities/"+cityId+"?inspect=marketplace#city-inspector"}>
        Examiner le Marché
      </Link>
    </header>
    {notices&&<div className="mmhk-market-notices">{notices}</div>}
    <div className="mmhk-market-active-screen">
      {entries.map(entry=><section key={entry.id} role="tabpanel"
        id={"market-screen-panel-"+entry.id}
        aria-labelledby={"market-screen-tab-"+entry.id}
        hidden={active!==entry.id}
        data-testid={"market-"+entry.id+"-screen"}>
        {entry.id==="merchant"?merchant:
          entry.id==="auctions"?auctions:
          entry.id==="caravans"?caravans:ledger}
      </section>)}
    </div>
  </div>;
}
