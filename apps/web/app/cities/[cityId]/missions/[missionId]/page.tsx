import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {GameShell} from "../../../../../components/game-shell/game-shell";
import {privateApi,sessionToken,type CityDetail,type MissionReport} from "../../../../../lib/server-api";
export const dynamic="force-dynamic";
const stateName:Record<string,string>={
  outbound:"Aller en cours",returning:"Retour en cours",completed:"Héros rentré"
};
const phaseName:Record<string,string>={departed:"Départ de la cité",
  arrived:"Arrivée et duel de laboratoire",returned:"Retour à la cité"};
const time=(at:string|null)=>at?new Date(at).toLocaleString("fr-FR",{
  day:"2-digit",month:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit"
}):"En attente de confirmation";
export default async function MissionReportPage({params}:{
  params:Promise<{cityId:string;missionId:string}>;
}){
  const {cityId,missionId}=await params,token=await sessionToken();
  if(!token)redirect("/");
  const uuid=/^[0-9a-f-]{36}$/i;
  if(!uuid.test(cityId)||!uuid.test(missionId))notFound();
  const [city,report]=await Promise.all([
    privateApi<CityDetail>("/api/v1/me/cities/"+cityId,token),
    privateApi<MissionReport>("/api/v1/me/cities/"+cityId+"/missions/"+missionId+"/report",token)
  ]);
  if(city.status===401||report.status===401)redirect("/");
  if(city.status===404||report.status===404)notFound();
  if(!city.data||!report.data)return <main className="shell"><p>Rapport momentanément inaccessible.</p>
    <Link href={"/cities/"+cityId+"/region"}>Retour à la région</Link></main>;
  const r=report.data,duel=r.duel_report;
  return <GameShell token={token} title="Chronique de mission"
    eyebrow="RAPPORT DU ROYAUME · PVE EXPÉRIMENTAL"
    description={r.hero_name+" · "+r.encounter_name+" · "+stateName[r.stage]}
    worldId={city.data.world_id} cityId={cityId} stocks={city.data.stocks}>
    <nav className="city-shortcuts">
      <Link href={"/cities/"+cityId+"/region?tile="+r.target_i+"-"+r.target_j}>Suivre sur la carte</Link>
      <Link href={"/cities/"+cityId+"/heroes?hero="+r.hero_id}>Fiche du héros</Link>
      <Link href={"/cities/"+cityId+"/forces"}>Garnison et recrutements</Link>
    </nav>
    <div className="mission-report-header">
      <div><span className="eyebrow">JOURNAL IMMUTABLE · {r.travel_policy_id}</span>
        <h2>{r.encounter_name}</h2>
        <p>Case régionale ({r.target_i}, {r.target_j}) · {r.hero_name}</p></div>
      <strong>{stateName[r.stage]}</strong>
    </div>
    <div className="mission-report-legs">
      <article><span className="eyebrow">MARCHE ALLER</span>
        <strong>{time(r.started_at)}</strong>
        <span>Arrivée prévue : {time(r.arrival_due_at)}</span>
        <span>Arrivée confirmée : {time(r.arrived_at)}</span></article>
      <article><span className="eyebrow">MARCHE RETOUR</span>
        <strong>{r.arrived_at?time(r.arrived_at):"Non commencée"}</strong>
        <span>Retour prévu : {time(r.return_due_at)}</span>
        <span>Retour confirmé : {time(r.returned_at)}</span></article>
    </div>
    <h2>Journal des événements serveur</h2>
    <ol className="mission-report-events">
      {r.events.map(event=><li key={event.phase}>
        <span>{phaseName[event.phase]??event.phase}</span>
        <time dateTime={event.occurred_at}>{time(event.occurred_at)}</time>
      </li>)}
    </ol>
    <h2>Composition enregistrée au départ</h2>
    <div className="mission-report-formation">
      {Array.from({length:7},(_,i)=>{
        const slot=r.formation_snapshot.find(x=>x.position===i+1);
        return <div key={i} className={slot?"occupied":"empty"}>
          <strong>Position {i+1}</strong>
          <small>Jactari {i+2}</small>
          <span>{slot?slot.quantity+" × "+slot.unit_code:"Libre"}</span>
          {slot?.unit_code===r.unit_code&&
            <small>Peloton du duel expérimental</small>}
        </div>;
      })}
    </div>
    <h2>Résolution du duel Jactari</h2>
    {duel?<div className="mission-duel-results">
      <p><strong>Rapport enregistré au contact</strong> — simulation mono-peloton,
        sans pertes permanentes, récompense, XP ou libération de la case.</p>
      <div><span>Puissance de l'attaquant</span>
        <strong>{duel.outcome?.totalPower?.attacker??"—"}</strong></div>
      <div><span>Puissance des défenseurs</span>
        <strong>{duel.outcome?.totalPower?.defender??"—"}</strong></div>
      <div><span>Unités actives restantes (simulation)</span>
        <strong>{duel.outcome?.remaining?.attacker??"—"} / {duel.outcome?.remaining?.defender??"—"}</strong></div>
    </div>:<p className="notice">Le héros n'a pas encore atteint sa destination.
      Aucun résultat n'est calculé avant l'événement d'arrivée du worker.</p>}
    <p className="notice">Le rapport enregistre les faits du serveur. Les sept emplacements
      sont une préparation du moteur futur : seul le peloton identifié ci-dessus
      participe aujourd'hui au duel de laboratoire. Le combat complet MMHK S2
      n'est pas encore certifié.</p>
  </GameShell>;
}
