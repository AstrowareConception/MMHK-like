"use client";
import {useEffect,useMemo,useState} from "react";
import {saveHeroFormation} from "../app/actions";
import type {HeroFormation} from "../lib/server-api";

type Cell={unit_code:string;quantity:number};
const empty=():Cell=>({unit_code:"",quantity:0});
function hydrate(initial:HeroFormation):Cell[] {
  const rows=Array.from({length:7},empty);
  for(const slot of initial.positions){
    if(slot.position>=1&&slot.position<=7)
      rows[slot.position-1]={unit_code:slot.unit_code,quantity:slot.quantity};
  }
  return rows;
}
export function HeroFormationEditor({cityId,formation}:{
  cityId:string;formation:HeroFormation;
}) {
  const [rows,setRows]=useState<Cell[]>(()=>hydrate(formation));
  const [touched,setTouched]=useState(false);
  useEffect(()=>{setRows(hydrate(formation));setTouched(false);},[formation]);
  const totals=useMemo(()=>{
    const map=new Map<string,number>();
    rows.forEach(r=>{if(r.unit_code)map.set(r.unit_code,(map.get(r.unit_code)??0)+r.quantity);});
    return map;
  },[rows]);
  const remaining=formation.available_units.map(unit=>({
    ...unit,remaining:unit.quantity-(totals.get(unit.unit_code)??0)
  }));
  const allCorrect=remaining.every(u=>u.remaining===0) &&
    rows.every(r=>!r.unit_code||Number.isSafeInteger(r.quantity)&&r.quantity>=1&&r.quantity<=1000000);
  const update=(position:number,patch:Partial<Cell>)=>{
    setTouched(true);setRows(prev=>prev.map((row,i)=>i===position?{...row,...patch}:row));
  };
  const swap=(a:number,b:number)=>{
    setTouched(true);setRows(prev=>{
      const next=[...prev];
      [next[a],next[b]]=[next[b],next[a]];
      return next;
    });
  };
  const split=(index:number)=>{
    const src=rows[index];
    const target=rows.findIndex(r=>!r.unit_code);
    if(target<0||src.quantity<2)return;
    const transfer=Math.floor(src.quantity/2);
    setTouched(true);
    setRows(prev=>prev.map((r,i)=>i===index?{...r,quantity:r.quantity-transfer}:
      i===target?{unit_code:src.unit_code,quantity:transfer}:r));
  };
  const fuse=(index:number)=>{
    const origin=rows[index];
    const other=rows.findIndex((r,i)=>i!==index&&r.unit_code===origin.unit_code&&r.unit_code);
    if(other<0||origin.quantity+rows[other].quantity>1000000)return;
    setTouched(true);
    setRows(prev=>prev.map((r,i)=>i===index?{...r,quantity:r.quantity+prev[other].quantity}:
      i===other?empty():r));
  };
  const available=formation.available_units;
  return <section className="formation-editor" aria-label="Formation de combat du héros">
    <header>
      <div><span className="eyebrow">US-ARM-009 À 012 · PRÉPARATION DES PELOTONS</span>
        <h3>Les sept positions de l'armée</h3>
        <p>Les emplacements correspondent aux indices ordinaires 2 à 8 du calculateur Jactari.
          Divisez, fusionnez ou changez l'ordre sans créer ni perdre d'unités.</p>
      </div>
      <span className="formation-state">{formation.saved&&!touched?"Formation sauvegardée":touched?"Modifications locales":"Proposition non validée"}</span>
    </header>
    {formation.status!=="idle"&&<p className="formation-warning">Le héros est en mission.
      Sa formation est verrouillée jusqu'à son retour effectif.</p>}
    {formation.needs_configuration&&<p className="formation-warning">
      Plus de sept types d'unités sont actuellement affectés à ce héros.
      La formation ne peut être enregistrée sans réduire les types distincts.</p>}
    <form action={saveHeroFormation}>
      <input name="cityId" type="hidden" value={cityId}/>
      <input name="heroId" type="hidden" value={formation.hero_id}/>
      <div className="formation-slots">
        {rows.map((r,i)=><div className="formation-slot" key={i}>
          <div className="formation-slot-number"><strong>{i+1}</strong><small>Jactari {i+2}</small></div>
          <label>Type d'unité
            <select name={"unit-"+(i+1)} value={r.unit_code}
              disabled={formation.status!=="idle"}
              onChange={event=>update(i,{unit_code:event.target.value,
                quantity:event.target.value?(r.quantity||1):0})}>
              <option value="">Emplacement libre</option>
              {available.map(unit=><option key={unit.unit_code} value={unit.unit_code}>
                {unit.name} ({unit.quantity})</option>)}
            </select>
          </label>
          <label>Effectif
            <input name={"quantity-"+(i+1)} type="number" min="1" max="1000000"
              disabled={!r.unit_code||formation.status!=="idle"}
              value={r.unit_code?r.quantity:""}
              onChange={event=>update(i,{quantity:Number(event.target.value)})}/>
          </label>
          <div className="formation-slot-actions">
            <button type="button" disabled={i===0||formation.status!=="idle"}
              onClick={()=>swap(i,i-1)} aria-label={"Monter la position "+(i+1)}>↑</button>
            <button type="button" disabled={i===6||formation.status!=="idle"}
              onClick={()=>swap(i,i+1)} aria-label={"Descendre la position "+(i+1)}>↓</button>
            <button type="button" disabled={!r.unit_code||r.quantity<2||
              !rows.some(x=>!x.unit_code)||formation.status!=="idle"}
              onClick={()=>split(i)}>Diviser</button>
            <button type="button" disabled={!r.unit_code||
              !rows.some((x,j)=>j!==i&&x.unit_code===r.unit_code)||
              formation.status!=="idle"} onClick={()=>fuse(i)}>Fusionner</button>
          </div>
        </div>)}
      </div>
      <div className="formation-totals">
        {remaining.map(u=><span key={u.unit_code} className={u.remaining===0?"balanced":"unbalanced"}>
          {u.unit_code} : {totals.get(u.unit_code)??0} / {u.quantity}
          {u.remaining!==0?" (écart "+u.remaining+")":""}</span>)}
      </div>
      <div className="formation-footer">
        <small>Le simulateur PvE actuel ne résout encore qu'un peloton à la fois.
          Cette formation est sauvegardée et photographiée au départ de la mission,
          mais ne modifie pas artificiellement les résultats du moteur.</small>
        <button type="submit" disabled={!allCorrect||formation.status!=="idle"}>
          Enregistrer les sept positions
        </button>
      </div>
    </form>
  </section>;
}
