"use client";
import {useEffect,useState} from "react";
import Link from "next/link";
import {regionCellCenter} from "../lib/region-geometry";
import type {PveMissionsResponse,PveMission} from "../lib/server-api";

const clamp=(x:number)=>Math.max(0,Math.min(1,x));
export function RegionJourneyLayer({missions}:{missions:PveMissionsResponse|null}) {
  const [localNow,setLocalNow]=useState<number|null>(null);
  const [offset,setOffset]=useState(0);
  useEffect(()=>{
    if(!missions)return;
    setOffset(Date.parse(missions.server_now)-Date.now());
    setLocalNow(Date.now());
  },[missions]);
  useEffect(()=>{
    const update=()=>{if(document.visibilityState==="visible")setLocalNow(Date.now());};
    const timer=window.setInterval(update,1000);
    document.addEventListener("visibilitychange",update);
    return ()=>{window.clearInterval(timer);document.removeEventListener("visibilitychange",update);};
  },[]);
  const now=(localNow??0)+offset;
  return <g className="region-mission-map" aria-label="Trajets visibles des héros en mission">
    {(missions?.missions??[]).filter(m=>m.stage!=="completed").map(m=>{
      const source=regionCellCenter(2,2),target=regionCellCenter(m.target_i,m.target_j);
      const outbound=m.stage==="outbound";
      const started=Date.parse(outbound?m.started_at:(m.arrived_at??m.arrival_due_at));
      const end=Date.parse(outbound?m.arrival_due_at:m.return_due_at);
      const progress=localNow===null?0:clamp((now-started)/(end-started));
      const from=outbound?source:target,to=outbound?target:source;
      const x=from.x+(to.x-from.x)*progress;
      const y=from.y+(to.y-from.y)*progress;
      return <g key={m.mission_id} data-mission-id={m.mission_id}
        data-mission-stage={m.stage} pointerEvents="none">
        <line x1={source.x} y1={source.y} x2={target.x} y2={target.y}
          stroke="#f0d49a" strokeWidth="2.5" strokeDasharray="7 5" opacity=".92"/>
        <circle cx={target.x} cy={target.y} r="22" fill="#dfad5380"
          stroke="#fff0a6" strokeDasharray="4 4" strokeWidth="2"/>
        <g transform={"translate("+x+" "+(y-20)+")"}>
          <ellipse cy="17" rx="14" ry="6" fill="#0d292c" opacity=".6"/>
          <circle r="19" fill="#243c45" stroke="#eec67e" strokeWidth="2.5"/>
          <text x="0" y="7" textAnchor="middle" fill="#f6e2b3" fontSize="26"
            aria-hidden="true">♞</text>
          <rect x="-51" y="-33" width="102" height="18" rx="4"
            fill="#172a34" stroke="#d4b57c"/>
          <text textAnchor="middle" y="-20" fontSize="11" fill="#f8e3b1">
            {outbound?"Aller "+Math.round(progress*100)+" %":"Retour "+Math.round(progress*100)+" %"}</text>
        </g>
      </g>;
    })}
  </g>;
}
export function RegionMissionsPanel({missions}:{missions:PveMissionsResponse|null}) {
  const [tick,setTick]=useState<number|null>(null);
  const [offset,setOffset]=useState(0);
  useEffect(()=>{
    if(!missions)return;
    setTick(Date.now());setOffset(Date.parse(missions.server_now)-Date.now());
  },[missions]);
  useEffect(()=>{
    const interval=window.setInterval(()=>{
      if(document.visibilityState==="visible")setTick(Date.now());
    },1000);
    return ()=>window.clearInterval(interval);
  },[]);
  if(!missions)return null;
  const active=missions.missions.filter(m=>m.stage!=="completed");
  const historical=missions.missions.filter(m=>m.stage==="completed").slice(0,3);
  const fmt=(date:string)=>new Date(date).toLocaleTimeString("fr-FR",{hour:"2-digit",minute:"2-digit",second:"2-digit"});
  const now=(tick??0)+offset;
  function remaining(m:PveMission){
    const due=Date.parse(m.stage==="outbound"?m.arrival_due_at:m.return_due_at);
    if(tick===null)return "—";
    const secs=Math.max(0,Math.ceil((due-now)/1000));
    return secs===0?"Échéance atteinte, confirmation du worker attendue":
      Math.floor(secs/60)+" min "+String(secs%60).padStart(2,"0")+" s";
  }
  return <section className="regional-mission-status" aria-label="Missions régionales">
    <h3>Missions de la région</h3>
    {active.map(m=><article key={m.mission_id} className="regional-mission-row">
      <strong>{m.hero_name}</strong>
      <span>{m.stage==="outbound"?"En marche vers":"Sur le chemin du retour depuis"} {m.encounter_name}</span>
      <span>Case ({m.target_i}, {m.target_j}) · {m.travel_seconds} s par trajet</span>
      <span>{m.stage==="outbound"?"Arrivée":"Retour"} : {fmt(m.stage==="outbound"?m.arrival_due_at:m.return_due_at)}</span>
      <strong className="journey-countdown">{remaining(m)}</strong>
      <Link className="mission-report-link" href={"/cities/"+missions.city_id+
        "/missions/"+m.mission_id}>Voir le rapport et le trajet</Link>
      {m.duel_report&&<small>
        Rapport Jactari enregistré à l’arrivée (simulation mono-peloton, sans pertes ni butin).
        Attaque {m.duel_report.outcome?.totalPower.attacker} ·
        Défense {m.duel_report.outcome?.totalPower.defender}.
      </small>}
    </article>)}
    {!active.length&&<p>Aucun héros actuellement en déplacement.</p>}
    {historical.length>0&&<details><summary>Dernières missions achevées</summary>
      {historical.map(m=><p key={m.mission_id}>{m.hero_name} · {m.encounter_name} ·
        retour confirmé à {fmt(m.returned_at??m.return_due_at)} ·
        <Link href={"/cities/"+missions.city_id+"/missions/"+m.mission_id}>Rapport</Link></p>)}
    </details>}
    <small>Délais et progression proviennent du serveur. Une arrivée calculée sur le
      navigateur n’achève jamais la mission : seul le worker valide l’étape et le retour.</small>
  </section>;
}
