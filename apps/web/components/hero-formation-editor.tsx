"use client";
import {useEffect,useMemo,useState} from "react";
import type {DragEvent} from "react";
import {saveHeroFormation} from "../app/actions";
import type {HeroFormation} from "../lib/server-api";

type Cell={unit_code:string;quantity:number};
const empty=():Cell=>({unit_code:"",quantity:0});
const ART:Record<string,string>={
  militia:"/themes/public-safe/haven-militia.svg",
  archers:"/themes/public-safe/haven-archer.svg"
};
function hydrate(initial:HeroFormation):Cell[]{
  const result=Array.from({length:7},empty);
  for(const p of initial.positions)
    if(p.position>=1&&p.position<=7)
      result[p.position-1]={unit_code:p.unit_code,quantity:p.quantity};
  return result;
}

export function HeroFormationEditor({cityId,formation}:{
  cityId:string;formation:HeroFormation;
}){
  const [ready,setReady]=useState(false);
  const [rows,setRows]=useState<Cell[]>(()=>hydrate(formation));
  const [selected,setSelected]=useState<number|null>(null);
  const [dragging,setDragging]=useState<number|null>(null);
  const [touched,setTouched]=useState(false);
  useEffect(()=>{setReady(true);},[]);
  useEffect(()=>{setRows(hydrate(formation));setSelected(null);setTouched(false);},[formation]);
  const totals=useMemo(()=>{
    const m=new Map<string,number>();
    for(const r of rows)if(r.unit_code)m.set(r.unit_code,(m.get(r.unit_code)??0)+r.quantity);
    return m;
  },[rows]);
  const remaining=formation.available_units.map(u=>({
    ...u,remaining:u.quantity-(totals.get(u.unit_code)??0),
  }));
  const balanced=remaining.every(u=>u.remaining===0)&&
    rows.every(r=>!r.unit_code||Number.isSafeInteger(r.quantity)&&r.quantity>0&&r.quantity<=1000000);
  const editable=ready&&formation.status==="idle";
  const unit=(code:string)=>formation.available_units.find(u=>u.unit_code===code);

  function swap(a:number,b:number){
    if(!editable||a===b||a<0||a>=7||b<0||b>=7)return;
    setRows(prev=>{
      const next=prev.map(v=>({...v}));
      [next[a],next[b]]=[next[b],next[a]];
      return next;
    });
    setTouched(true);setSelected(null);setDragging(null);
  }
  function split(i:number){
    const original=rows[i],target=rows.findIndex(r=>!r.unit_code);
    if(!editable||!original.unit_code||original.quantity<2||target<0)return;
    const n=Math.floor(original.quantity/2);
    setRows(prev=>prev.map((v,k)=>k===i?{...v,quantity:v.quantity-n}:
      k===target?{unit_code:original.unit_code,quantity:n}:v));
    setTouched(true);
  }
  function merge(i:number){
    const src=rows[i],target=rows.findIndex((v,k)=>k!==i&&
      v.unit_code&&v.unit_code===src.unit_code);
    if(!editable||!src.unit_code||target<0||
       src.quantity+rows[target].quantity>1000000)return;
    setRows(prev=>prev.map((v,k)=>k===i?{...v,quantity:v.quantity+prev[target].quantity}:
      k===target?empty():v));
    setTouched(true);
  }
  function drop(e:DragEvent<HTMLButtonElement>,to:number){
    e.preventDefault();const from=Number(e.dataTransfer.getData("application/x-mmhk-slot"));
    if(Number.isInteger(from))swap(from,to);
  }
  function edit(index:number,patch:Partial<Cell>){
    setRows(prev=>prev.map((v,i)=>i===index?{...v,...patch}:v));
    setTouched(true);
  }
  return <section id="hero-formation" className="formation-editor mmhk-formation-board"
    aria-label="Formation de combat du héros" data-testid="formation-visual-board"
    data-ready={ready?"true":"false"}>
    <header className="mmhk-board-heading">
      <div><span className="eyebrow">CHAMP DE BATAILLE · SEPT PELOTONS</span>
        <h3>Formation de combat</h3>
        <p>Glissez un peloton sur un autre emplacement pour les permuter.
          Au clavier ou au tactile : sélectionnez un peloton, puis une destination.</p>
      </div>
      <span className="formation-state">{formation.saved&&!touched?
        "Formation sauvegardée":touched?"Disposition modifiée":"Formation proposée"}</span>
    </header>
    {!editable&&<p className="formation-warning">
      Le héros est absent : impossible de réorganiser les troupes jusqu'à son retour.</p>}
    {formation.needs_configuration&&<p className="formation-warning">
      Plus de sept types d'unités : répartissez vos pelotons avant d'enregistrer.</p>}
    <div className="mmhk-battle-ground" aria-label="Positions des sept unités">
      <div className="mmhk-battle-ranks" aria-hidden="true">
        <span>FLANC GAUCHE</span><span>CENTRE</span><span>FLANC DROIT</span>
      </div>
      <div className="formation-slots">
        {rows.map((r,i)=>{
          const u=unit(r.unit_code);
          return <div className={"formation-slot mmhk-formation-slot "+
              (selected===i?"selected ":"")+(dragging===i?"dragging ":"")+
              (r.unit_code?"filled":"empty")} key={i} data-position={i+1}>
            <button type="button" className="mmhk-formation-tile"
              aria-label={"Position "+(i+1)+": "+(u?.name??"vide")+
                (r.quantity?" x"+r.quantity:"")}
              aria-pressed={selected===i}
              disabled={!editable}
              draggable={editable&&Boolean(r.unit_code)}
              onDragStart={e=>{
                e.dataTransfer.setData("application/x-mmhk-slot",String(i));
                e.dataTransfer.effectAllowed="move";setDragging(i);
              }}
              onDragEnd={()=>setDragging(null)}
              onDragOver={e=>{if(editable)e.preventDefault();}}
              onDrop={e=>drop(e,i)}
              onClick={()=>{
                if(selected!==null&&selected!==i)swap(selected,i);
                else setSelected(selected===i?null:i);
              }}>
              <span className="formation-slot-number">0{i+1}</span>
              <span className="mmhk-formation-art">
                {r.unit_code&&ART[r.unit_code]?
                  <img src={ART[r.unit_code]} width={90} height={90} alt="" draggable={false}/>:
                  <span aria-hidden="true">{r.unit_code?"⚔":"+"}</span>}
              </span>
              <strong>{u?.name??(r.unit_code||"Emplacement libre")}</strong>
              <span className="mmhk-formation-qty">{r.unit_code?
                "×"+r.quantity.toLocaleString("fr-FR"):"Disponible"}</span>
              <small>Jactari {i+2}</small>
            </button>
            {r.unit_code&&editable&&<div className="mmhk-formation-tools">
              <button type="button" onClick={()=>split(i)}
                disabled={r.quantity<2||!rows.some(v=>!v.unit_code)}
                aria-label={"Diviser le peloton "+(i+1)}>½ Diviser</button>
              <button type="button" onClick={()=>merge(i)}
                disabled={!rows.some((v,k)=>k!==i&&v.unit_code===r.unit_code)}
                aria-label={"Fusionner le peloton "+(i+1)}>⇄ Fusionner</button>
            </div>}
          </div>;
        })}
      </div>
    </div>
    <form action={saveHeroFormation} className="mmhk-formation-save">
      <input type="hidden" name="cityId" value={cityId}/>
      <input type="hidden" name="heroId" value={formation.hero_id}/>
      {rows.map((r,i)=><div key={i}>
        <input type="hidden" name={"unit-"+(i+1)} value={r.unit_code}/>
        <input type="hidden" name={"quantity-"+(i+1)} value={r.quantity}/>
      </div>)}
      <details className="mmhk-formation-advanced">
        <summary>Ajuster finement les effectifs</summary>
        <p>Pour fractionner un même type sur plusieurs positions,
          modifiez les quantités. La somme doit rester égale aux soldats
          réellement affectés au héros.</p>
        <div className="mmhk-formation-edit-grid">
          {rows.map((r,i)=><label key={i}>Position {i+1}
            <select disabled={!editable} value={r.unit_code} onChange={e=>edit(i,{
              unit_code:e.target.value,quantity:e.target.value?(r.quantity||1):0
            })}>
              <option value="">Vide</option>
              {formation.available_units.map(u=><option key={u.unit_code}
                value={u.unit_code}>{u.name}</option>)}
            </select>
            <input type="number" min="1" max="1000000" disabled={!editable||!r.unit_code}
              value={r.unit_code?r.quantity:""} onChange={e=>edit(i,{quantity:Number(e.target.value)})}/>
          </label>)}
        </div>
      </details>
      <div className="formation-totals">
        {remaining.map(u=><span key={u.unit_code} className={
          u.remaining===0?"balanced":"unbalanced"}>
          {u.name} : {totals.get(u.unit_code)??0} / {u.quantity}
          {u.remaining!==0?" · écart "+u.remaining:" · complet"}
        </span>)}
      </div>
      <footer className="formation-footer">
        <p>Les effectifs ne changent pas lorsque vous réorganisez les positions.
          Seule la formation préparée est enregistrée auprès du serveur.</p>
        <button type="submit" disabled={!balanced||!editable}>
          Enregistrer les sept positions
        </button>
      </footer>
    </form>
  </section>;
}
