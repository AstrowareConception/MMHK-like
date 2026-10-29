"use client";
import {useState,useTransition} from "react";
import type {DragEvent,KeyboardEvent} from "react";
import {transferHeroUnits} from "../app/actions";
import type {CityForces} from "../lib/server-api";

type Hero=CityForces["heroes"][number];
type Stack={unit_code:string;name:string;quantity:number;tier:number;heroId:string|null};
type Destination={heroId:string|null};
const MIME="application/x-mmhk-troop";
const IMAGES:Record<string,string>={
  militia:"/themes/public-safe/haven-militia.svg",
  archers:"/themes/public-safe/haven-archer.svg"
};
const nice=(n:number)=>n.toLocaleString("fr-FR");

export function TroopDeploymentBoard({cityId,forces,portrait,backdrop}:{
  cityId:string;forces:CityForces;
  portrait:{might:string;magic:string};
  backdrop:string|null;
}){
  const [selected,setSelected]=useState<Stack|null>(null);
  const [destination,setDestination]=useState<Destination|null>(null);
  const [quantity,setQuantity]=useState(1);
  const [error,setError]=useState("");
  const [hover,setHover]=useState("");
  const [pending,startTransition]=useTransition();
  const roster:Stack[]=forces.garrison.filter(u=>u.quantity>0).map(u=>({...u,heroId:null}));
  const byHero=(id:string):Stack[]=>forces.hero_armies.filter(
    u=>u.hero_id===id&&u.quantity>0).map(u=>({...u,heroId:id}));
  function approve(src:Stack|null,dest:Destination){
    if(pending||!src)return false;
    if(src.heroId===dest.heroId)return false;
    if(dest.heroId){
      return src.heroId===null&&forces.heroes.some(
        h=>h.hero_id===dest.heroId&&h.status==="idle");
    }
    return src.heroId!==null&&forces.heroes.some(
      h=>h.hero_id===src.heroId&&h.status==="idle");
  }
  function choose(src:Stack,dest:Destination){
    if(!approve(src,dest)){
      setError("Affectation indisponible : les soldats transitent uniquement entre une garnison et un héros présent dans la même cité.");
      return;
    }
    setSelected(src);setDestination(dest);
    setQuantity(Math.min(1000,src.quantity));
    setError("");
  }
  function stack(item:Stack){
    const active=selected?.unit_code===item.unit_code&&selected.heroId===item.heroId;
    return <div key={item.unit_code+(item.heroId??"garrison")}
      className={"mmhk-unit-stack "+(active?"selected":"")}
      data-testid="troop-stack"
      data-unit-code={item.unit_code}
      data-holder={item.heroId??"garrison"}
      draggable={!pending&&(!item.heroId||forces.heroes.some(
        h=>h.hero_id===item.heroId&&h.status==="idle"))}
      onDragStart={event=>{
        const value=JSON.stringify({unit:item.unit_code,hero:item.heroId});
        event.dataTransfer.setData(MIME,value);
        event.dataTransfer.effectAllowed="move";
        setSelected(item);setDestination(null);
      }}
      onClick={event=>{event.stopPropagation();setSelected(active?null:item);
        setDestination(null);setError("");}}
      onKeyDown={event=>{if(event.key==="Enter"||event.key===" "){
        event.preventDefault();event.stopPropagation();
        setSelected(active?null:item);setDestination(null);setError("");
      }}}
      role="button" tabIndex={0} aria-pressed={active}
      aria-label={item.name+", "+nice(item.quantity)+" soldats. Sélectionner ou déplacer"}>
      <span className="mmhk-stack-art">
        {IMAGES[item.unit_code]?<img src={IMAGES[item.unit_code]}
          width={76} height={76} alt="" draggable={false}/>:
          <span aria-hidden="true">⚔</span>}
      </span>
      <strong>{item.name}</strong>
      <small>Rang {item.tier}</small>
      <span className="mmhk-stack-count">×{nice(item.quantity)}</span>
    </div>;
  }
  function drop(event:DragEvent<HTMLElement>,dest:Destination){
    event.preventDefault();event.stopPropagation();setHover("");
    try{
      const raw=JSON.parse(event.dataTransfer.getData(MIME)) as {
        unit:string;hero:string|null
      };
      const src=[...roster,...forces.heroes.flatMap(h=>byHero(h.hero_id))]
        .find(s=>s.unit_code===raw.unit&&s.heroId===raw.hero);
      if(src)choose(src,dest);
    }catch{setError("Glisser-déposer de troupe non reconnu.");}
  }
  function targetEvents(dest:Destination,key:string){
    return {
      role:"button" as const,tabIndex:0,
      "aria-label":dest.heroId?"Déposer le peloton sur ce héros":
        "Rapatrier le peloton sélectionné à la garnison",
      onDragOver:(event:DragEvent<HTMLElement>)=>{
        if(!pending){event.preventDefault();event.dataTransfer.dropEffect="move";setHover(key);}
      },
      onDragLeave:()=>setHover(""),
      onDrop:(event:DragEvent<HTMLElement>)=>drop(event,dest),
      onClick:()=>{if(selected)choose(selected,dest);},
      onKeyDown:(event:KeyboardEvent<HTMLElement>)=>{
        if(selected&&(event.key==="Enter"||event.key===" ")){
          event.preventDefault();choose(selected,dest);
        }
      }
    };
  }
  function submit(){
    if(!selected||!destination||!approve(selected,destination)||
      !Number.isSafeInteger(quantity)||quantity<1||
      quantity>1000||quantity>selected.quantity)return;
    const heroId=destination.heroId??selected.heroId;
    if(!heroId)return;
    const command=new FormData();
    command.set("cityId",cityId);command.set("heroId",heroId);
    command.set("unitCode",selected.unit_code);
    command.set("quantity",String(quantity));
    command.set("direction",destination.heroId?"to_hero":"to_garrison");
    setError("");startTransition(()=>{void transferHeroUnits(command);});
  }
  const destinationName=destination?.heroId?
    forces.heroes.find(h=>h.hero_id===destination.heroId)?.name:"Garnison";
  const buttonConfirm=Boolean(selected&&destination&&approve(selected,destination)&&
    Number.isSafeInteger(quantity)&&quantity>=1&&quantity<=1000&&
    quantity<=selected.quantity);
  return <section className="mmhk-war-room" data-testid="troop-deployment-board"
    aria-label="Salle de déploiement des armées" aria-busy={pending}>
    <header className="mmhk-board-heading">
      <div><span className="eyebrow">GRAND HALL DES ARMÉES</span>
        <h3>Déployer la garnison</h3>
        <p>Glissez un peloton vers le portrait d'un héros, ou ramenez-le dans
          le château. Une sélection puis un clic fonctionne aussi au tactile.</p></div>
      <div className="mmhk-war-count"><strong>{
        nice(forces.garrison.reduce((n,u)=>n+u.quantity,0)+
          forces.hero_armies.reduce((n,u)=>n+u.quantity,0))
      }</strong><small>soldats au total</small></div>
    </header>
    {error&&<p className="error" role="alert">{error}</p>}
    <div className="mmhk-deployment-field"
      style={backdrop?{backgroundImage:"linear-gradient(#16222cbe,#111b25e0),url("+JSON.stringify(backdrop)+")"}:undefined}>
      <div className={"mmhk-garrison-keep "+(hover==="garrison"?"hover":"")}
        data-testid="garrison-drop-zone"
        {...targetEvents({heroId:null},"garrison")}>
        <div className="mmhk-keep-heading"><span aria-hidden="true">♜</span>
          <h4>Garnison de la cité</h4>
          <small>{nice(roster.reduce((n,u)=>n+u.quantity,0))} soldats</small></div>
        <div className="mmhk-battle-stacks">{roster.length?roster.map(stack):
          <p className="mmhk-empty-room">Aucun soldat en garnison · recrutez dans vos demeures.</p>}</div>
      </div>
      <div className="mmhk-deployment-arrow" aria-hidden="true">⇄</div>
      <div className="mmhk-deployment-heroes">
        {forces.heroes.map(hero=><div key={hero.hero_id}
          className={"mmhk-deployment-hero "+(hover===hero.hero_id?"hover":"")}
          data-testid="hero-drop-zone" data-hero-id={hero.hero_id}
          {...targetEvents({heroId:hero.hero_id},hero.hero_id)}>
          <div className="mmhk-hero-card-head hero-profile-info">
            <img src={portrait[hero.archetype]} width={86} height={112}
              alt="" draggable={false}/>
            <div><strong>{hero.name}</strong>
              <span>Héros niveau {hero.level}</span>
              <small>{hero.status==="idle"?"Présent au château":"Indisponible pour les transferts"}</small></div>
          </div>
          <div className="mmhk-battle-stacks">{byHero(hero.hero_id).length?
            byHero(hero.hero_id).map(stack):
            <span className="mmhk-empty-room">Aucun peloton</span>}</div>
        </div>)}
        {forces.heroes.length===0&&<p className="mmhk-empty-room">
          Engagez un héros à la taverne pour lui confier une armée.</p>}
      </div>
    </div>
    {selected&&<div className="mmhk-troop-picked" role="status">
      <strong>{selected.name}</strong> · {nice(selected.quantity)} disponibles.
      {" "}{destination?"Destination : "+destinationName:
        "Sélectionnez une garnison ou un héros comme destination."}
      {destination&&<div className="mmhk-quantity-dialog" data-testid="transfer-confirmation">
        <label>Nombre à déplacer
          <input type="number" min="1" max={Math.min(1000,selected.quantity)}
            value={quantity} onChange={e=>setQuantity(Number(e.target.value))}/>
        </label>
        <button type="button" onClick={()=>setQuantity(Math.min(1000,selected.quantity))}>Maximum</button>
        <button type="button" disabled={!buttonConfirm||pending} onClick={submit}>
          {pending?"En cours…":"Confirmer le transfert"}
        </button>
      </div>}
      <button type="button" className="mmhk-cancel" onClick={()=>{
        setSelected(null);setDestination(null);setError("");
      }}>Annuler la sélection</button>
    </div>}
    <p className="mmhk-quiet">Les déplacements ne créent aucune troupe.
      La quantité, le propriétaire et la disponibilité du héros sont vérifiés
      dans une transaction PostgreSQL. Après un changement d'effectif,
      une formation de sept positions doit être enregistrée à nouveau.</p>
  </section>;
}
