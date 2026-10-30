"use client";
import Link from "next/link";
import {useEffect,useState} from "react";

export type GameTab={id:string;label:string;href?:string;disabled?:boolean};
/** Navigation stays on the game screen and reflects the last chosen tab.
 * Disabled panels have no fictitious destination or placeholder page.
 */
export function GameTabs({items,active,label="Sections du royaume"}:{
  items:GameTab[];active:string;label?:string;
}){
  const [chosen,setChosen]=useState(active);
  useEffect(()=>{
    const fromHash=()=>{
      const hash=window.location.hash;
      const match=items.find(item=>item.href===hash&&!item.disabled);
      if(match)setChosen(match.id);
    };
    fromHash();
    window.addEventListener("hashchange",fromHash);
    return ()=>window.removeEventListener("hashchange",fromHash);
  },[items]);
  return <nav className="gui-tabs" aria-label={label}>
    {items.map(item=>item.disabled||!item.href?
      <span key={item.id} className="gui-tab gui-tab--disabled"
        aria-disabled="true">{item.label}</span>:
      <Link key={item.id} href={item.href} onClick={()=>setChosen(item.id)}
        className={"gui-tab"+(chosen===item.id?" gui-tab--active":"")}
        aria-current={chosen===item.id?"location":undefined}>{item.label}</Link>)}
  </nav>;
}
