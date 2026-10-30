"use client";

import {useId,useState} from "react";

type Props={
  label:string;
  min?:number;
  max:number;
  initial?:number;
  value?:number;
  onChange?:(value:number)=>void;
  name?:string;
  disabled?:boolean;
  allowMaximum?:boolean;
  testId?:string;
};

/** One reusable number control for recruits, caravans, troops and items.
 * Server still validates every order: this is purely a UI affordance.
 */
export function GameQuantity({label,min=1,max,initial=1,value,onChange,name,
  disabled=false,allowMaximum=true,testId}:Props){
  const id=useId();
  const floor=Math.max(0,Math.trunc(min));
  const ceiling=Math.max(floor,Math.trunc(max));
  const [internal,setInternal]=useState(()=>Math.max(floor,Math.min(ceiling,initial)));
  const current=value??internal;
  const clamp=(x:number)=>Math.max(floor,Math.min(ceiling,Number.isFinite(x)?Math.trunc(x):floor));
  const set=(x:number)=>{const next=clamp(x);if(value===undefined)setInternal(next);onChange?.(next);};
  const locked=disabled||ceiling<floor;
  return <div className="gui-quantity" data-testid={testId}>
    <label htmlFor={id} className="gui-quantity-label">{label}</label>
    <div className="gui-quantity-controls">
      <button type="button" onClick={()=>set(current-1)}
        aria-label={"Diminuer "+label.toLowerCase()}
        disabled={locked||current<=floor}>−</button>
      <input id={id} type="number" name={name} inputMode="numeric"
        min={floor} max={ceiling} required disabled={locked}
        value={current} onChange={e=>set(Number(e.target.value))}/>
      <button type="button" onClick={()=>set(current+1)}
        aria-label={"Augmenter "+label.toLowerCase()}
        disabled={locked||current>=ceiling}>+</button>
      {allowMaximum&&<button type="button" className="gui-quantity-max"
        onClick={()=>set(ceiling)} disabled={locked||current===ceiling}>
        Max
      </button>}
    </div>
    <small>Maximum autorisé : {ceiling.toLocaleString("fr-FR")}</small>
  </div>;
}
