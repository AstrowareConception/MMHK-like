"use client";
import {useEffect,useRef,useState,useTransition} from "react";
import type {DragEvent,KeyboardEvent,MouseEvent,PointerEvent} from "react";
import {transferHeroUnits} from "../app/actions";
import {HeritagePortrait,HeritageUnitArt} from "./heritage-art";
import {GameDialog} from "./game-ui/game-dialog";
import {GameQuantity} from "./game-ui/game-quantity";
import type {CityForces} from "../lib/server-api";

type Hero=CityForces["heroes"][number];
type Stack={unit_code:string;name:string;quantity:number;tier:number;heroId:string|null;portion?:number};
type Destination={heroId:string|null};
const MIME="application/x-mmhk-troop";
const IMAGES:Record<string,string>={
  militia:"/themes/public-safe/haven-militia.svg",
  archers:"/themes/public-safe/haven-archer.svg"
};
const nice=(n:number)=>n.toLocaleString("fr-FR");

export function TroopDeploymentBoard({cityId,forces,portrait,portraitSheet,unitSheet,backdrop}:{
  cityId:string;forces:CityForces;
  portrait:{might:string;magic:string};portraitSheet:string|null;
  unitSheet:string|null;backdrop:string|null;
}){
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const [selected,setSelected]=useState<Stack|null>(null);
  const [destination,setDestination]=useState<Destination|null>(null);
  const [quantity,setQuantity]=useState(1);
  const [error,setError]=useState("");
  const [hover,setHover]=useState("");
  const [prepared,setPrepared]=useState<Record<string,number[]>>({});
  const [stackToSplit,setStackToSplit]=useState<Stack|null>(null);
  const [splitQuantity,setSplitQuantity]=useState(1);
  const [pending,startTransition]=useTransition();
  // Track a real pointer gesture when a browser does not dispatch native
  // HTML5 dragstart/drop. Never transfer a unit until the user confirms qty.
  const pointerStart=useRef<{item:Stack;x:number;y:number}|null>(null);
  const suppressClick=useRef(false);
  const roster:Stack[]=forces.garrison.filter(u=>u.quantity>0).map(u=>({...u,heroId:null}));
  const visibleGarrison=roster.flatMap(unit=>
    (prepared[unit.unit_code]?.reduce((a,n)=>a+n,0)===unit.quantity?
      prepared[unit.unit_code]:[unit.quantity]).map((quantity,index)=>
      ({...unit,quantity,portion:index})));
  const byHero=(id:string):Stack[]=>forces.hero_armies.filter(
    u=>u.hero_id===id&&u.quantity>0).map(u=>({...u,heroId:id}));
  function approve(src:Stack|null,dest:Destination){
    if(pending||!ready||!src)return false;
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
  function splitStack(item:Stack){
    if(item.heroId!==null||item.quantity<2||pending)return;
    setStackToSplit(item);
    setSplitQuantity(Math.floor(item.quantity/2));
  }
  function confirmStackSplit(){
    if(!stackToSplit||!Number.isSafeInteger(splitQuantity)||
       splitQuantity<1||splitQuantity>=stackToSplit.quantity)return;
    const base=roster.find(u=>u.unit_code===stackToSplit.unit_code);
    if(!base)return;
    const source=prepared[base.unit_code]?.reduce((a,n)=>a+n,0)===base.quantity?
      prepared[base.unit_code]:[base.quantity];
    const idx=stackToSplit.portion??0;
    if(source[idx]!==stackToSplit.quantity)return;
    const replacement=source.flatMap((n,i)=>i===idx?[n-splitQuantity,splitQuantity]:[n]);
    setPrepared(prev=>({...prev,[base.unit_code]:replacement}));
    setSelected(null);setDestination(null);setStackToSplit(null);setError("");
  }
  function mergeStack(item:Stack){
    const base=roster.find(u=>u.unit_code===item.unit_code);
    if(!base||pending)return;
    setPrepared(prev=>({...prev,[item.unit_code]:[base.quantity]}));
    setSelected(null);setDestination(null);
  }
  function stack(item:Stack){
    const active=selected?.unit_code===item.unit_code&&selected.heroId===item.heroId;
    const portions=prepared[item.unit_code];
    const canMerge=item.heroId===null&&Boolean(portions&&portions.length>1);
    return <div key={item.unit_code+(item.heroId??"garrison")+":"+String(item.portion??0)}
      className={"mmhk-unit-stack "+(active?"selected":"")}
      data-testid="troop-stack"
      data-unit-code={item.unit_code}
      data-holder={item.heroId??"garrison"}
      draggable={ready&&!pending&&(!item.heroId||forces.heroes.some(
        h=>h.hero_id===item.heroId&&h.status==="idle"))}
      onPointerDown={event=>{
        if(!ready||pending||event.button!==0)return;
        pointerStart.current={item,x:event.clientX,y:event.clientY};
      }}
      onPointerCancel={()=>{pointerStart.current=null;}}
      onDragStart={event=>{
        pointerStart.current=null; // native drag/drop takes priority
        const value=JSON.stringify({unit:item.unit_code,hero:item.heroId,portion:item.portion});
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
        <HeritageUnitArt unitCode={item.unit_code} sheet={unitSheet}
          fallback={IMAGES[item.unit_code]} scale={1.08}/>
      </span>
      <strong>{item.name}</strong>
      <small>Rang {item.tier}</small>
      <span className="mmhk-stack-count">×{nice(item.quantity)}</span>
      {item.heroId===null&&<span className="gui-stack-actions">
        <button type="button" draggable={false} disabled={pending||item.quantity<2}
          onPointerDown={event=>event.stopPropagation()}
          onClick={event=>{event.stopPropagation();splitStack(item);}}
          aria-label={"Diviser "+item.name+", "+item.quantity+" soldats"}>Diviser</button>
        {canMerge&&<button type="button" draggable={false} disabled={pending}
          onPointerDown={event=>event.stopPropagation()}
          onClick={event=>{event.stopPropagation();mergeStack(item);}}
          aria-label={"Fusionner les groupes de "+item.name}>Fusionner</button>}
      </span>}
    </div>;
  }
  function drop(event:DragEvent<HTMLElement>,dest:Destination){
    event.preventDefault();event.stopPropagation();setHover("");
    event.currentTarget.focus(); // restore keyboard focus here when the game dialog closes
    try{
      const raw=JSON.parse(event.dataTransfer.getData(MIME)) as {
        unit:string;hero:string|null;portion?:number
      };
      const src=[...visibleGarrison,...forces.heroes.flatMap(h=>byHero(h.hero_id))]
        .find(s=>s.unit_code===raw.unit&&s.heroId===raw.hero&&
          (raw.hero!==null||(s.portion??0)===(raw.portion??0)));
      if(src)choose(src,dest);
    }catch{setError("Glisser-déposer de troupe non reconnu.");}
  }
  function targetEvents(dest:Destination,key:string){
    return {
      role:"button" as const,tabIndex:0,
      "aria-label":dest.heroId?"Déposer le peloton sur ce héros":
        "Rapatrier le peloton sélectionné à la garnison",
      onDragOver:(event:DragEvent<HTMLElement>)=>{
        if(!pending&&ready){event.preventDefault();event.dataTransfer.dropEffect="move";setHover(key);}
      },
      onDragLeave:()=>setHover(""),
      onDrop:(event:DragEvent<HTMLElement>)=>drop(event,dest),
      onPointerUp:(event:PointerEvent<HTMLElement>)=>{
        const gesture=pointerStart.current;
        pointerStart.current=null;
        if(!gesture||pending||!ready)return;
        if(Math.hypot(event.clientX-gesture.x,event.clientY-gesture.y)<12)return;
        suppressClick.current=true;
        choose(gesture.item,dest);
      },
      onClick:(event:MouseEvent<HTMLElement>)=>{
        if(suppressClick.current){suppressClick.current=false;return;}
        if(selected){event.currentTarget.focus();choose(selected,dest);}
      },
      onKeyDown:(event:KeyboardEvent<HTMLElement>)=>{
        if(selected&&(event.key==="Enter"||event.key===" ")){
          event.preventDefault();event.currentTarget.focus();choose(selected,dest);
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
    setError("");startTransition(async()=>{await transferHeroUnits(command);});
  }
  const destinationName=destination?.heroId?
    forces.heroes.find(h=>h.hero_id===destination.heroId)?.name:"Garnison";
  const buttonConfirm=Boolean(selected&&destination&&approve(selected,destination)&&
    Number.isSafeInteger(quantity)&&quantity>=1&&quantity<=1000&&
    quantity<=selected.quantity);
  return <section className="mmhk-war-room" data-testid="troop-deployment-board"
    aria-label="Salle de déploiement des armées" aria-busy={pending}
    data-ready={ready?"true":"false"}>
    <header className="mmhk-board-heading">
      <div><span className="eyebrow">ORGANISER VOS TROUPES</span>
        <h3>Garnison et héros</h3>
        <p>Déplacez une troupe de la ville vers le héros, ou inversement.
          Choisissez ensuite le nombre exact de soldats.</p></div>
      <div className="mmhk-war-count"><strong>{
        nice(forces.garrison.reduce((n,u)=>n+u.quantity,0)+
          forces.hero_armies.reduce((n,u)=>n+u.quantity,0))
      }</strong><small>soldats au total</small></div>
    </header>
    {!ready&&<p className="mmhk-hydrating" role="status">Chargement des commandes militaires…</p>}
    {error&&<p className="error" role="alert">{error}</p>}
    <div className="mmhk-deployment-field"
      style={backdrop?{backgroundImage:"linear-gradient(#16222cbe,#111b25e0),url("+JSON.stringify(backdrop)+")"}:undefined}>
      <div className={"mmhk-garrison-keep "+(hover==="garrison"?"hover":"")}
        data-testid="garrison-drop-zone"
        {...targetEvents({heroId:null},"garrison")}>
        <div className="mmhk-keep-heading"><span aria-hidden="true">♜</span>
          <h4>Dans la cité</h4>
          <small>{nice(roster.reduce((n,u)=>n+u.quantity,0))} soldats</small></div>
        <div className="mmhk-battle-stacks">{roster.length?visibleGarrison.map(stack):
          <p className="mmhk-empty-room">Aucun soldat en garnison · recrutez dans vos demeures.</p>}</div>
      </div>
      <div className="mmhk-deployment-arrow" aria-hidden="true">⇄</div>
      <div className="mmhk-deployment-heroes">
        {forces.heroes.map(hero=><div key={hero.hero_id}
          className={"mmhk-deployment-hero "+(hover===hero.hero_id?"hover":"")}
          data-testid="hero-drop-zone" data-hero-id={hero.hero_id}
          {...targetEvents({heroId:hero.hero_id},hero.hero_id)}>
          <div className="mmhk-hero-card-head hero-profile-info">
            <HeritagePortrait heroId={hero.hero_id} archetype={hero.archetype}
              sheet={portraitSheet} fallback={portrait[hero.archetype]}/>
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
    {selected&&!destination&&<div className="mmhk-troop-picked" role="status">
      <strong>{selected.name}</strong> · {nice(selected.quantity)} soldats.
      Sélectionnez la ville ou le portrait d'un héros comme destination.
      <button type="button" className="mmhk-cancel" onClick={()=>{
        setSelected(null);setDestination(null);setError("");
      }}>Annuler la sélection</button>
    </div>}
    <GameDialog open={stackToSplit!==null} title="Diviser le peloton"
      eyebrow="PRÉPARER LA GARNISON" size="compact"
      testId="garrison-split-dialog" onClose={()=>setStackToSplit(null)}
      footer={<>
        <button type="button" className="gui-button gui-button--secondary"
          onClick={()=>setStackToSplit(null)}>Annuler</button>
        <button type="button" className="gui-button gui-button--primary"
          onClick={confirmStackSplit} disabled={!stackToSplit||pending}>
          Diviser le peloton
        </button>
      </>}>
      {stackToSplit&&<>
        <div className="gui-stack-balance">
          <div><small>PREMIER GROUPE</small>
            <strong>{nice(stackToSplit.quantity-splitQuantity)}</strong></div>
          <span aria-hidden="true">+</span>
          <div><small>SECOND GROUPE</small>
            <strong>{nice(splitQuantity)}</strong></div>
          <span aria-hidden="true">=</span>
          <div><small>TOTAL INCHANGÉ</small>
            <strong>{nice(stackToSplit.quantity)}</strong></div>
        </div>
        <GameQuantity label="Soldats à détacher" min={1}
          max={Math.max(1,stackToSplit.quantity-1)}
          value={splitQuantity} onChange={setSplitQuantity}
          testId="garrison-split-quantity"/>
        <p className="gui-help">Les groupes sont préparés visuellement.
          Le stock reste agrégé dans le château ; un transfert réel est enregistré
          uniquement après confirmation d'un ordre.</p>
      </>}
    </GameDialog>
    <GameDialog open={Boolean(selected&&destination)}
      title="Transférer des troupes" eyebrow="ORDRE DU COMMANDANT"
      testId="transfer-confirmation" busy={pending} size="compact"
      onClose={()=>setDestination(null)}
      footer={<>
        <button type="button" className="gui-button gui-button--secondary"
          onClick={()=>setDestination(null)} disabled={pending}>Modifier la destination</button>
        <button type="button" className="gui-button gui-button--primary"
          disabled={!buttonConfirm||pending} onClick={submit}>
          {pending?"Ordre en cours…":"Confirmer le transfert"}
        </button>
      </>}>
      {selected&&destination&&<div className="gui-transfer-summary">
        <div><small>PELOTON</small>
          <strong>{selected.name}</strong>
          <span>{nice(selected.quantity)} soldats disponibles</span>
        </div>
        <span className="gui-transfer-arrow" aria-hidden="true">➜</span>
        <div><small>DESTINATION</small>
          <strong>{destinationName}</strong>
          <span>{destination.heroId?"Héros dans la cité":"Garnison du château"}</span>
        </div>
      </div>}
      {selected&&destination&&<GameQuantity label="Nombre à déplacer"
        testId="transfer-quantity" max={Math.min(1000,selected.quantity)}
        value={quantity} onChange={setQuantity}/>}
      <p className="gui-help">L'ordre sera vérifié par le royaume : les effectifs
        sont conservés et la formation du héros sera réinitialisée.</p>
    </GameDialog>
    <p className="mmhk-quiet">Les déplacements ne créent aucune troupe.
      La quantité, le propriétaire et la disponibilité du héros sont vérifiés
      dans une transaction PostgreSQL. Après un changement d'effectif,
      une formation de sept positions doit être enregistrée à nouveau.</p>
  </section>;
}
