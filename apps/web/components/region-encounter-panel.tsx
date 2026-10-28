"use client";
import {useState} from "react";
import {launchRegionalPveMission} from "../app/actions";
import Link from "next/link";
import type {CityForces,DuelPreview,RegionEncounter,PveMissionsResponse} from "../lib/server-api";

export function RegionEncounterPanel({encounter,forces,cityId,missions}:{
  encounter:RegionEncounter|null;forces:CityForces|null;cityId:string;missions:PveMissionsResponse|null;
}) {
  const pairs=(forces?.hero_armies??[]).flatMap(army=>{
    const hero=forces?.heroes.find(h=>h.hero_id===army.hero_id&&h.status==="idle");
    return hero&&army.quantity>0?[{key:hero.hero_id+"|"+army.unit_code,
      hero,army}]:[];
  });
  const [chosen,setChosen]=useState("");
  const [busy,setBusy]=useState(false);
  const [report,setReport]=useState<DuelPreview|null>(null);
  const [error,setError]=useState("");
  const active=pairs.find(p=>p.key===chosen)??pairs[0];
  const activeJourneys=missions?.missions.filter(m=>m.stage!=="completed")??[];
  const hasActiveHero=activeJourneys.some(m=>m.hero_id===active?.hero.hero_id);
  const targetReserved=activeJourneys.some(m=>m.target_i===encounter?.i&&m.target_j===encounter?.j);
  const availablePolicy=missions?.travel_policy;
  const plannedSeconds=encounter&&availablePolicy?
    (Math.abs(encounter.i-2)+Math.abs(encounter.j-2))*availablePolicy.seconds_per_step:null;

  const preview=async()=>{
    if(!encounter||!active||busy)return;
    setBusy(true);setReport(null);setError("");
    try{
      const response=await fetch("/api/region-duel",{
        method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
        body:JSON.stringify({city_id:cityId,encounter_id:encounter.encounter_id,
          hero_id:active.hero.hero_id,unit_code:active.army.unit_code})
      });
      const data=await response.json();
      if(!response.ok)throw new Error(typeof data.error==="string"?data.error:"Simulation refusée");
      setReport(data as DuelPreview);
    }catch(err){setError(err instanceof Error?err.message:"Simulation indisponible");}
    finally{setBusy(false);}
  };
  if(!encounter)return <aside className="region-encounter-panel">
    <strong>Aucune rencontre connue sur cette case</strong>
    <p>Les autres emplacements conservent un état inconnu, sans population inventée.</p>
  </aside>;
  return <aside className="region-encounter-panel" data-encounter-id={encounter.encounter_id}>
    <div className="encounter-title"><span aria-hidden="true">⚔</span>
      <div><span className="eyebrow">RENCONTRE RÉGIONALE · LABORATOIRE</span>
        <h3>{encounter.name}</h3>
        <p>Case ({encounter.i}, {encounter.j}) · {encounter.unit_count} créatures ·
          puissance nominale {encounter.unit_power.toLocaleString("fr-FR")}</p></div>
    </div>
    <p>Rencontre issue du scénario de démonstration. Le combat complet, les pertes
      définitives, l'expérience et les récompenses restent à qualifier.</p>
    {pairs.length?<div className="encounter-preview-controls">
      <label>Héros et peloton
        <select aria-label="Héros et peloton pour la simulation" value={active?.key??""}
          onChange={e=>{setChosen(e.target.value);setReport(null);}}>
          {pairs.map(({key,hero,army})=><option key={key} value={key}>
            {hero.name} · {army.quantity} {army.name}</option>)}
        </select>
      </label>
      <button type="button" disabled={busy} onClick={preview}>
        {busy?"Simulation en cours":"Tester un duel Jactari"}
      </button>
    </div>:<div className="encounter-no-army">
      Aucun héros disponible ne possède de peloton. <Link href={"/cities/"+cityId+"/forces"}>
        Affecter des troupes depuis la garnison</Link>.
    </div>}
    <div className="region-launch">
      <h4>Envoyer réellement le héros — aller et retour</h4>
      {plannedSeconds!==null&&<p>
        Durée aller : <strong>{plannedSeconds} secondes</strong> ·
        Durée retour : <strong>{plannedSeconds} secondes</strong> ·
        cycle de déplacement : <strong>{plannedSeconds*2} secondes</strong>.
        Ces durées expérimentales sont calculées par le serveur avec la politique
        {availablePolicy?.policy_id}; elles ne constituent pas les règles historiques.
      </p>}
      <form action={launchRegionalPveMission}>
        <input type="hidden" name="cityId" value={cityId}/>
        <input type="hidden" name="encounterId" value={encounter.encounter_id}/>
        <input type="hidden" name="heroId" value={active?.hero.hero_id??""}/>
        <input type="hidden" name="unitCode" value={active?.army.unit_code??""}/>
        <button type="submit" disabled={!active||!availablePolicy||hasActiveHero||targetReserved}>
          {targetReserved?"Rencontre déjà ciblée":
           hasActiveHero?"Héros déjà en mission":
           !availablePolicy?"Trajet non configuré":"Lancer la marche et préparer le retour"}
        </button>
      </form>
      <small>Aucune perte ni récompense n'est appliquée à ce stade.
        Le héros reste indisponible jusqu'à son arrivée réelle à la cité.</small>
    </div>
    {error&&<p className="error" role="alert">{error}</p>}
    {report&&<div className="encounter-report" role="status">
      <strong>Rapport de simulation — sans effet sur la partie</strong>
      <div><span>Puissance de {report.hero_name}</span><b>{report.outcome.totalPower.attacker}</b></div>
      <div><span>Puissance des défenseurs</span><b>{report.outcome.totalPower.defender}</b></div>
      <div><span>Peloton attaquant restant dans la simulation</span><b>{report.outcome.remaining.attacker}</b></div>
      <div><span>Peloton défenseur restant dans la simulation</span><b>{report.outcome.remaining.defender}</b></div>
      <small>Les dispersions de Jactari ne sont pas des pertes définitives.
        Rien n'est débité, libéré ou attribué dans PostgreSQL.</small>
    </div>}
  </aside>;
}
