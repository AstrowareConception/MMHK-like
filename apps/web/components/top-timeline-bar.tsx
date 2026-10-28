"use client";
import {useEffect,useMemo,useState} from "react";
import Link from "next/link";
import {useRouter} from "next/navigation";
import {timeRemaining,timelinePercent,type TimelineEvent,type TimelineResponse} from "../lib/timeline";

function dueLabel(at:string):string {
  return new Date(at).toLocaleString("fr-FR",{day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit"});
}
export function TopTimelineBar({initial}:{initial:TimelineResponse|null}) {
  const router=useRouter();
  const [state,setState]=useState<TimelineResponse|null>(initial);
  const [clock,setClock]=useState(0);
  const [offset,setOffset]=useState(0);
  useEffect(()=>{
    setClock(Date.now());
    if(initial)setOffset(Date.parse(initial.server_now)-Date.now());
  },[initial]);
  useEffect(()=>{
    const tick=()=>{if(document.visibilityState!=="hidden")setClock(Date.now());};
    const interval=window.setInterval(tick,1000);
    document.addEventListener("visibilitychange",tick);
    return ()=>{window.clearInterval(interval);document.removeEventListener("visibilitychange",tick);};
  },[]);
  useEffect(()=>{
    let alive=true;
    const sync=async()=>{
      if(document.visibilityState==="hidden")return;
      try {
        const res=await fetch("/api/game-timeline?hours=12",{cache:"no-store"});
        if(!res.ok)return;
        const next=await res.json() as TimelineResponse;
        if(!alive||!Array.isArray(next.events))return;
        setOffset(Date.parse(next.server_now)-Date.now());
        setClock(Date.now());
        setState(previous=>{
          if(previous?.events.some(old=>!next.events.some(current=>current.id===old.id)))router.refresh();
          return next;
        });
      }catch {/* Preserve prior state when temporarily disconnected. */}
    };
    const interval=window.setInterval(sync,30000);
    const visible=()=>{if(document.visibilityState==="visible")void sync();};
    document.addEventListener("visibilitychange",visible);
    return ()=>{alive=false;window.clearInterval(interval);document.removeEventListener("visibilitychange",visible);};
  },[router]);
  const now=clock+offset;
  const hours=state?.horizon_hours??12;
  const clusters=useMemo(()=>{
    const buckets=new Map<number,{event:TimelineEvent;position:number}[]>();
    for(const event of state?.events??[]) {
      const position=timelinePercent(event.occurs_at,now,hours);
      const bucket=Math.floor(position/4);
      buckets.set(bucket,[...(buckets.get(bucket)??[]),{event,position}]);
    }
    return [...buckets.values()];
  },[state,now,hours]);
  return (
    <section role="region" aria-label="Frise temporelle du royaume" className="kingdom-timeline">
      <div className="timeline-title">
        <span className="timeline-crest" aria-hidden="true">⌛</span>
        <div><strong>Chronique du royaume</strong><small>Échéances des {hours} prochaines heures</small></div>
        <span className="timeline-clock" suppressHydrationWarning>{clock?new Date(now).toLocaleTimeString("fr-FR"):"—:—"}</span>
      </div>
      <div className="timeline-track" role="group" aria-label="Du présent vers les prochaines heures">
        <div className="timeline-graduations" aria-hidden="true">
          {Array.from({length:hours+1},(_,i)=><span key={i} style={{left:String(i/hours*100)+"%"}}>
            {i===0?"Maintenant":"+"+i+"h"}</span>)}
        </div>
        <div className="timeline-ticks" aria-hidden="true">
          {Array.from({length:hours+1},(_,i)=><i key={i} style={{left:String(i/hours*100)+"%"}}/>)}
        </div>
        {clusters.map((group,index)=>{
          const first=group[0];
          const location={left:String(first.position)+"%",top:String(22+index%2*25)+"px"};
          if(group.length===1){
            const event=first.event;
            const details=event.title+" · "+event.city_name+" · "+dueLabel(event.occurs_at)+" · "+timeRemaining(event.occurs_at,now);
            return <Link key={event.id} href={event.target_url} className="timeline-event" style={location}
              title={details} aria-label={details} data-timeline-type={event.type}>⚒</Link>;
          }
          return <details key={group.map(x=>x.event.id).join(":")} className="timeline-cluster" style={location}>
            <summary aria-label={String(group.length)+" événements proches"}>⚒ {group.length}</summary>
            <div className="timeline-cluster-content">
              {group.map(({event})=><Link key={event.id} href={event.target_url}>
                {event.title} · {event.city_name}<small>{timeRemaining(event.occurs_at,now)}</small>
              </Link>)}
            </div>
          </details>;
        })}
        {state?.events.length===0&&<p className="timeline-empty">Aucun chantier annoncé · Le royaume est paisible.</p>}
        {!state&&<p className="timeline-empty">Frise momentanément indisponible.</p>}
      </div>
      <div className="timeline-footer"><span>Présent</span>
        <span>Les échéances sont confirmées par le serveur.</span><span>+{hours} h</span>
      </div>
      {state?.truncated&&<small>Affichage limité aux 200 premières échéances.</small>}
    </section>
  );
}
