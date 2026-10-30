"use client";
import {useId,useState} from "react";
import type {ReactNode,KeyboardEvent,FocusEvent} from "react";

/** Contextual game information: hover/focus on desktop, tap to toggle.
 * The player never needs to leave the world to read a rule explanation.
 */
export function GameHint({title,children}:{title:string;children:ReactNode}){
  const [open,setOpen]=useState(false);
  const id=useId();
  const keyDown=(e:KeyboardEvent<HTMLButtonElement>)=>{
    if(e.key==="Escape"){setOpen(false);e.stopPropagation();}
  };
  const blur=(event:FocusEvent<HTMLSpanElement>)=>{
    if(!event.currentTarget.contains(event.relatedTarget))setOpen(false);
  };
  return <span className="gui-hint" onMouseEnter={()=>setOpen(true)}
    onMouseLeave={()=>setOpen(false)} onBlur={blur}>
    <button type="button" aria-label={"Informations : "+title}
      aria-expanded={open} aria-describedby={open?id:undefined}
      onClick={()=>setOpen(value=>!value)} onKeyDown={keyDown}>?</button>
    {open&&<span className="gui-hint-content" role="tooltip" id={id}>
      <strong>{title}</strong><span>{children}</span>
    </span>}
  </span>;
}
