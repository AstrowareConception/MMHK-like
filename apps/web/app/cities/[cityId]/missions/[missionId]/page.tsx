import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {GameShell} from "../../../../../components/game-shell/game-shell";
import {MissionReportGameScreen} from "../../../../../components/mission-report-game-screen";
import {privateApi,sessionToken,type CityDetail,type MissionReport} from "../../../../../lib/server-api";
export const dynamic="force-dynamic";

const stateName:Record<string,string>={
  outbound:"Aller en cours",returning:"Retour en cours",completed:"Héros rentré"
};
const phaseName:Record<string,string>={
  departed:"Départ de la cité",arrived:"Arrivée et duel",returned:"Retour à la cité"
};
const units:Record<string,string>={
  militia:"Miliciens du Havre",archers:"Archers du Havre",
  wolves:"Loups",bandits:"Brigands"
};
const metric=(value:number|null|undefined)=>typeof value==="number"&&Number.isFinite(value)
  ?value.toLocaleString("fr-FR",{maximumFractionDigits:2}):"—";
const time=(at:string|null)=>at?new Date(at).toLocaleString("fr-FR",{
  timeZone:"Europe/Paris",
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
  if(!city.data||!report.data)return <main className="shell">
    <p>Rapport momentanément inaccessible.</p>
    <Link href={"/cities/"+cityId+"/region"}>Retour à la région</Link>
  </main>;
  const r=report.data,duel=r.duel_report;

  return <GameShell screen="report" token={token} title="Chronique de mission"
    eyebrow="RAPPORT DU ROYAUME · CAMPAGNES RÉGIONALES"
    description={r.hero_name+" · "+r.encounter_name+" · "+stateName[r.stage]}
    worldId={city.data.world_id} cityId={cityId} stocks={city.data.stocks}>
    <MissionReportGameScreen cityId={cityId} heroId={r.hero_id}
      heroName={r.hero_name} encounterName={r.encounter_name}
      stage={stateName[r.stage]??r.stage}
      journey={<div className="mmhk-mission-journey">
        <header className="mmhk-mission-pane-heading">
          <span aria-hidden="true">♞</span>
          <div><h2>Le voyage de {r.hero_name}</h2>
            <p>Vers {r.encounter_name} · case régionale ({r.target_i}, {r.target_j})</p>
          </div>
          <strong className="mmhk-mission-status">{stateName[r.stage]??r.stage}</strong>
        </header>
        <div className="mission-report-legs">
          <article><span className="eyebrow">MARCHE ALLER</span>
            <strong>{time(r.started_at)}</strong>
            <span>Arrivée prévue : {time(r.arrival_due_at)}</span>
            <span>Arrivée confirmée : {time(r.arrived_at)}</span>
          </article>
          <article><span className="eyebrow">MARCHE RETOUR</span>
            <strong>{r.arrived_at?time(r.arrived_at):"Non commencée"}</strong>
            <span>Retour prévu : {time(r.return_due_at)}</span>
            <span>Retour confirmé : {time(r.returned_at)}</span>
          </article>
        </div>
        <Link className="mmhk-mission-map-return"
          href={"/cities/"+cityId+"/region?tile="+r.target_i+"-"+r.target_j}>
          Suivre sur la carte
        </Link>
        <p className="mmhk-mission-ledger-note">Ces étapes sont confirmées par
          le serveur. Les heures de trajet n'entraînent aucune modification
          automatique depuis votre navigateur.</p>
      </div>}
      events={<div className="mmhk-mission-events">
        <header className="mmhk-mission-pane-heading">
          <span aria-hidden="true">✦</span>
          <div><h2>Journal des événements serveur</h2>
            <p>Chaque étape du voyage est enregistrée chronologiquement.</p></div>
        </header>
        <ol className="mission-report-events">
          {r.events.map(event=><li key={event.phase}>
            <span>{phaseName[event.phase]??event.phase}</span>
            <time dateTime={event.occurred_at}>{time(event.occurred_at)}</time>
          </li>)}
        </ol>
        {r.events.length===0&&<p>Le voyage ne contient pas encore d'événement confirmé.</p>}
      </div>}
      formation={<div className="mmhk-mission-formation">
        <header className="mmhk-mission-pane-heading">
          <span aria-hidden="true">⚔</span>
          <div><h2>Composition enregistrée au départ</h2>
            <p>Sept positions conservées telles qu'elles ont été envoyées.</p></div>
        </header>
        <div className="mission-report-formation">
          {Array.from({length:7},(_,i)=>{
            const slot=r.formation_snapshot.find(x=>x.position===i+1);
            return <div key={i} className={slot?"occupied":"empty"}>
              <strong>Position {i+1}</strong>
              <span className="mmhk-mission-troop-symbol" aria-hidden="true">{slot?"♟":"◇"}</span>
              <span>{slot?slot.quantity+" × "+(units[slot.unit_code]??slot.unit_code):"Libre"}</span>
              {slot?.unit_code===r.unit_code&&
                <small>Peloton du duel expérimental</small>}
            </div>;
          })}
        </div>
        <p className="mmhk-mission-ledger-note">Le rapport présente
          exactement la composition enregistrée par le serveur. Seul le
          peloton engagé participe à la simulation actuelle.</p>
      </div>}
      duel={<div className="mmhk-mission-duel">
        <header className="mmhk-mission-pane-heading">
          <span aria-hidden="true">⚔</span>
          <div><h2>Admission et résolution Jactari</h2>
            <p>Résultat transmis par le serveur à l'arrivée.</p></div>
        </header>
        {duel?.fled_before_combat&&duel.admission?
          <div className="mission-duel-results mmhk-pve-flight" role="status">
            <strong>Fuite PvE — combat non engagé</strong>
            <p>L'armée attaquante n'atteignait pas le seuil d'admission
              du calculateur Jactari. Le retour du héros a été planifié
              sans lancer de duel ni appliquer de pertes.</p>
            <div><span>Puissance brute de l'attaquant</span>
              <strong>{duel.admission.attacker_raw_power}</strong></div>
            <div><span>Puissance brute du défenseur</span>
              <strong>{duel.admission.defender_raw_power}</strong></div>
            <div><span>Seuil de fuite inclusif</span>
              <strong>{duel.admission.threshold}</strong></div>
            <p>Ce contrôle n'utilise ni bonus du héros, ni contre-armes,
              ni tirs préalables. Il ne représente pas un combat gagné
              ou perdu avec des morts définitives.</p>
          </div>
          :duel?<div className="mission-duel-results">
          <p><strong>Rapport enregistré au contact</strong> — simulation mono-peloton,
            sans pertes permanentes, récompense, XP ou libération de la case.</p>
          {duel.interpretation&&<div className="mmhk-mission-verdict" role="status">
            <span>Verdict du duel simulé</span>
            <strong>{duel.interpretation.verdict==="attacker"?"Avantage de l'attaquant":
              duel.interpretation.verdict==="defender"?"Avantage du défenseur":
              duel.interpretation.verdict==="draw"?"Égalité":"Résultat non tranché"}</strong>
          </div>}
          {duel.interpretation&&<>
            <div><span>Dispersion de l'attaquant / du défenseur</span>
              <strong>{duel.interpretation.attacker.dispersed?"Oui":"Non"} /
                {duel.interpretation.defender.dispersed?"Oui":"Non"}</strong></div>
            <div><span>Pertes théoriques Jactari, non appliquées</span>
              <strong>{duel.interpretation.attacker.overwhelming_victory?"Victoire écrasante (sentinelle −1)":
                metric(duel.interpretation.attacker.simulated_losses)} /
                {duel.interpretation.defender.overwhelming_victory?"Victoire écrasante (sentinelle −1)":
                  metric(duel.interpretation.defender.simulated_losses)}</strong></div>
            {duel.interpretation.ordinary_attacker_loss_projection&&
              <div><span>Projection des morts attaquantes (profil ordinaire 30 %, non appliquée)</span>
                <strong>{metric(duel.interpretation.ordinary_attacker_loss_projection.permanent_deaths)}
                  {" sur "}{metric(duel.interpretation.ordinary_attacker_loss_projection.dispersed)}
                  {" dispersées"}</strong>
              </div>}
            <div><span>Effets persistants sur le royaume</span>
              <strong>Aucun · ni morts, ni XP, ni butin, ni libération</strong></div>
          </>}
          <div><span>Puissance de l'attaquant</span>
            <strong>{metric(duel.outcome?.totalPower?.attacker)}</strong></div>
          <div><span>Puissance des défenseurs</span>
            <strong>{metric(duel.outcome?.totalPower?.defender)}</strong></div>
          <div><span>Unités actives restantes (simulation)</span>
            <strong>{metric(duel.outcome?.remaining?.attacker)} / {metric(duel.outcome?.remaining?.defender)}</strong></div>
        </div>:<div className="mmhk-mission-duel-pending">
          <span aria-hidden="true">⌛</span>
          <strong>Le héros n'a pas encore atteint sa destination</strong>
          <p>Aucun résultat n'est calculé avant l'événement d'arrivée du worker.</p>
        </div>}
        <p className="mmhk-mission-ledger-note">La simulation actuelle n'applique
          aucune perte définitive ni récompense ; le combat complet MMHK
          saison 2 n'est pas encore certifié.</p>
      </div>}
    />
  </GameShell>;
}
