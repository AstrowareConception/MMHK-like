"use client";
import {useEffect,useRef,useState,useTransition} from "react";
import type {DragEvent,KeyboardEvent,PointerEvent} from "react";
import {moveCityArtifact} from "../app/actions";
import type {ArtifactInventory,ArtifactItem,CityForces} from "../lib/server-api";

type Hero=CityForces["heroes"][number];
type Target={place:"slot"|"bag"|"reserve"|"hero";slot?:string;heroId?:string};
const slotNames:Record<string,string>={head:"Heaume",neck:"Collier",chest:"Armure",
  weapon:"Arme",shield:"Bouclier",hands:"Gants",feet:"Bottes",ring:"Anneau"};
const slotGlyphs:Record<string,string>={head:"♛",neck:"◇",chest:"⬡",weapon:"⚔",
  shield:"◈",hands:"✥",feet:"♜",ring:"◉"};
const MIME="application/x-mmhk-artifact";
type Move="equip"|"unequip"|"to_reserve"|"to_bag"|"to_hero";

export function HeroEquipmentBoard({cityId,hero,heroes,inventory,art}:{
  cityId:string;hero:Hero;heroes:Hero[];inventory:ArtifactInventory;
  art:{portrait:string|null;equipment:string|null;frame:string|null;
    backpack:string|null;artifactIcon:string|null;slots:Record<string,string|null>};
}){
  const [ready,setReady]=useState(false);
  useEffect(()=>setReady(true),[]);
  const [selected,setSelected]=useState<string|null>(null);
  const [hover,setHover]=useState<string|null>(null);
  const [error,setError]=useState("");
  const [pending,startTransition]=useTransition();
  // Some browsers/assistive pointer implementations send pointer events but
  // never synthesize HTML dragstart/drop. Preserve a real movement gesture
  // fallback, rather than accepting a click-only substitute for DnD.
  const pointerStart=useRef<{id:string;x:number;y:number}|null>(null);
  const suppressClick=useRef(false);
  const equipped=inventory.artifacts.filter(a=>a.hero_id===hero.hero_id&&a.location==="equipped");
  const bag=inventory.artifacts.filter(a=>a.hero_id===hero.hero_id&&a.location==="bag");
  const reserve=inventory.artifacts.filter(a=>a.location==="reserve");
  const chosen=inventory.artifacts.find(a=>a.artifact_id===selected);
  const cost=equipped.reduce((n,item)=>n+item.required_level,0);
  const idle=hero.status==="idle";
  function allowed(item:ArtifactItem,target:Target):{op:Move;heroId:string|null}|null {
    if(!idle||pending||!ready)return null;
    if(item.location!=="reserve"&&item.hero_id!==hero.hero_id)return null;
    if(target.place==="slot"){
      if(item.location!=="bag"||item.slot!==target.slot||
         equipped.some(a=>a.equipped_slot===target.slot)||
         cost+item.required_level>hero.level)return null;
      return {op:"equip",heroId:null};
    }
    if(target.place==="bag"){
      if(item.location==="reserve")return {op:"to_bag",heroId:hero.hero_id};
      if(item.location==="equipped")return {op:"unequip",heroId:null};
      return null;
    }
    if(target.place==="reserve"){
      if(item.location==="reserve")return null;
      return {op:"to_reserve",heroId:null};
    }
    const receiver=heroes.find(h=>h.hero_id===target.heroId&&h.status==="idle");
    if(!receiver)return null;
    if(item.location==="reserve")return {op:"to_bag",heroId:receiver.hero_id};
    if(item.hero_id!==receiver.hero_id)return {op:"to_hero",heroId:receiver.hero_id};
    return null;
  }
  function move(target:Target,id?:string){
    const item=inventory.artifacts.find(a=>a.artifact_id===(id??selected));
    if(!item)return;
    const result=allowed(item,target);
    if(!result){setError("Destination indisponible : vérifiez le type d'artefact, la place, le niveau et les héros présents.");return;}
    const form=new FormData();
    form.set("cityId",cityId);form.set("artifactId",item.artifact_id);
    form.set("returnHeroId",hero.hero_id);form.set("operation",result.op);
    if(result.heroId)form.set("targetHeroId",result.heroId);
    setSelected(null);setError("");
    startTransition(async()=>{await moveCityArtifact(form);});
  }
  function makeTarget(target:Target,label:string){
    return {
      role:"button" as const,tabIndex:0,
      "aria-label":"Déposer l'artefact sélectionné dans "+label,
      onDragOver:(e:DragEvent<HTMLElement>)=>{
        if(!pending&&ready){e.preventDefault();e.dataTransfer.dropEffect="move";setHover(label);}
      },
      onDragLeave:()=>setHover(null),
      onPointerUp:(e:PointerEvent<HTMLElement>)=>{
        const gesture=pointerStart.current;
        pointerStart.current=null;
        if(!gesture||!idle||pending||!ready)return;
        // A tap still selects objects normally. Only a genuine movement
        // from the source tile to a receiving region counts as a move.
        const distance=Math.hypot(e.clientX-gesture.x,e.clientY-gesture.y);
        if(distance<12)return;
        suppressClick.current=true;
        move(target,gesture.id);
      },
      onDrop:(e:DragEvent<HTMLElement>)=>{
        e.preventDefault();e.stopPropagation();setHover(null);
        const id=e.dataTransfer.getData(MIME)||
          e.dataTransfer.getData("text/plain")||selected;
        if(id)move(target,id);
        else setError("Déposez un objet depuis la besace ou le coffre de cette cité.");
      },
      onClick:()=>{
        if(suppressClick.current){suppressClick.current=false;return;}
        if(chosen)move(target);
      },
      onKeyDown:(e:KeyboardEvent<HTMLElement>)=>{
        if(chosen&&(e.key==="Enter"||e.key===" ")){e.preventDefault();move(target);}
      }
    };
  }
  function tile(item:ArtifactItem){
    const isSelected=selected===item.artifact_id;
    return <div key={item.artifact_id}
      data-testid="artifact-tile" data-artifact-id={item.artifact_id}
      className={"artifact-card mmhk-item "+(isSelected?"selected":"")}
      draggable={ready&&idle&&!pending}
      onPointerDown={e=>{
        if(!idle||pending||!ready||e.button!==0)return;
        pointerStart.current={id:item.artifact_id,x:e.clientX,y:e.clientY};
      }}
      onPointerCancel={()=>{pointerStart.current=null;}}
      onDragStart={e=>{
        // The native DnD path owns this gesture once dragstart fires.
        pointerStart.current=null;
        if(!idle||pending||!ready){e.preventDefault();return;}
        e.dataTransfer.setData(MIME,item.artifact_id);
        e.dataTransfer.setData("text/plain",item.artifact_id);
        e.dataTransfer.effectAllowed="move";setSelected(item.artifact_id);
      }}
      onDragEnd={()=>setHover(null)}
      role="button" tabIndex={0} aria-pressed={isSelected}
      aria-label={item.name+" · sélectionner ou glisser"}
      onClick={e=>{e.stopPropagation();setSelected(isSelected?null:item.artifact_id);setError("");}}
      onKeyDown={e=>{if(e.key==="Enter"||e.key===" "){
        e.stopPropagation();e.preventDefault();setSelected(isSelected?null:item.artifact_id);
      }}}>
      <span className="mmhk-item-jewel" aria-hidden="true">
        {art.artifactIcon?<img src={art.artifactIcon} alt="" width={26} height={26}/>: "✦"}
      </span>
      <strong>{item.name}</strong>
      <small>{slotNames[item.slot]??item.slot} · niv. {item.required_level}</small>
    </div>;
  }
  return <section className="mmhk-equipment" id="hero-equipment"
    aria-label={"Équipement de "+hero.name} data-testid="hero-equipment-board"
    data-ready={ready?"true":"false"}
    aria-busy={pending}>
    <header className="mmhk-board-heading">
      <div><span className="eyebrow">CHAMBRE DU HÉROS · INVENTAIRE</span>
        <h3>Équipement de {hero.name}</h3>
        <p>Glissez les artefacts sur la silhouette, le sac ou le coffre.
          Au tactile : touchez une pièce puis sa destination.</p></div>
      <div className="mmhk-budget"><span>Charge</span>
        <strong>{cost}/{hero.level}</strong>
        <meter min="0" max={Math.max(1,hero.level)}
          value={Math.min(cost,hero.level)}/></div>
    </header>
    {!ready&&<p className="mmhk-hydrating" role="status">Chargement des commandes d'équipement…</p>}
    {hero.status!=="idle"&&<p className="formation-warning">
      Héros en déplacement : équipement verrouillé jusqu'à son retour.</p>}
    {error&&<p role="alert" className="error">{error}</p>}
    {pending&&<p role="status">Enregistrement du déplacement auprès du royaume…</p>}
    {chosen&&<p role="status" className="mmhk-selection-hint">
      <strong>{chosen.name}</strong> sélectionné · choisissez une destination dorée.
      <button type="button" onClick={()=>setSelected(null)}>Annuler</button></p>}
    <div className="mmhk-equipment-stage"
      style={art.equipment?{backgroundImage:"linear-gradient(#131e25a0,#131e25a0),url("+JSON.stringify(art.equipment)+")"}:undefined}>
      <div className="mmhk-hero-portrait"
        style={art.frame?{backgroundImage:"url("+JSON.stringify(art.frame)+")"}:undefined}>
        {art.portrait?<img src={art.portrait} alt={"Portrait de "+hero.name}
          draggable={false}/>:<span aria-hidden="true">♞</span>}
        <div className="mmhk-portrait-label"><strong>{hero.name}</strong>
          <small>{hero.archetype==="magic"?"Maître des arcanes":"Champion du Havre"}
            {" "}· Niveau {hero.level}</small></div>
      </div>
      <div className="mmhk-equipped-areas">
        {inventory.slots.map(slot=>{
          const item=equipped.find(a=>a.equipped_slot===slot);
          const label=slotNames[slot]??slot;
          const target:Target={place:"slot",slot};
          return <div key={slot} className={"equipment-slot mmhk-equip-target slot-"+slot+
            (item?" filled":"")+(hover===label?" hover":"")+
            (chosen&&allowed(chosen,target)?" can-drop":"")}
            data-slot={slot} data-testid="equipment-drop-zone"
            {...makeTarget(target,label)}>
            <span className="mmhk-slot-symbol"
              style={art.slots[slot]?{backgroundImage:"url("+JSON.stringify(art.slots[slot])+")"}:undefined}
              aria-hidden="true">{slotGlyphs[slot]??"✦"}</span>
            <span className="equipment-slot-name">{label}</span>
            {item?tile(item):<span className="mmhk-empty-slot">Emplacement libre</span>}
          </div>;
        })}
      </div>
    </div>
    <div className="mmhk-storage">
      <section id="hero-bag" className={"mmhk-storage-room "+(hover==="Besace"?"hover":"")}
        {...makeTarget({place:"bag"},"Besace")}
        style={art.backpack?{backgroundImage:"linear-gradient(#15222aca,#15222aea),url("+JSON.stringify(art.backpack)+")"}:undefined}>
        <h4>Besace du héros <span>{bag.length}</span></h4>
        <p>Déposez un équipement ici pour le retirer.</p>
        <div className="mmhk-storage-items">{bag.length?bag.map(tile):
          <span className="mmhk-empty-room">Aucune pièce</span>}</div>
      </section>
      <section id="hero-reserve" className={"mmhk-storage-room "+(hover==="Réserve"?"hover":"")}
        {...makeTarget({place:"reserve"},"Réserve")}>
        <h4>Trésor de la cité <span>{reserve.length}</span></h4>
        <p>Accessible aux héros présents dans cette cité.</p>
        <div className="mmhk-storage-items">{reserve.length?reserve.map(tile):
          <span className="mmhk-empty-room">Coffre vide</span>}</div>
      </section>
    </div>
    {heroes.length>1&&<section className="mmhk-hero-recipient">
      <h4>Confier à un autre héros</h4>
      <div className="mmhk-recipient-list">
        {heroes.filter(h=>h.hero_id!==hero.hero_id).map(h=>
          <div key={h.hero_id}
            className={"mmhk-recipient "+(hover===h.name?"hover":"")}
            {...makeTarget({place:"hero",heroId:h.hero_id},h.name)}>
            <strong>{h.name}</strong><small>{h.status==="idle"?"Présent":"Indisponible"}</small>
          </div>)}
      </div>
    </section>}
    <p className="mmhk-quiet">Objets uniques, budget et restrictions validés par le serveur.
      Un emplacement occupé doit d'abord être vidé ; aucun bonus de combat
      historique non vérifié n'est appliqué.</p>
  </section>;
}
