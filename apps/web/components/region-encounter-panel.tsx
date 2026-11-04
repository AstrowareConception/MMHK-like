"use client";
import {useState} from "react";
import {launchRegionalPveMission} from "../app/actions";
import Link from "next/link";
import type {CityForces,DuelPreview,LineSequencePreview,RegionEncounter,PveMissionsResponse} from "../lib/server-api";

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
  const [lineReport,setLineReport]=useState<LineSequencePreview|null>(null);
  const [error,setError]=useState("");
  const active=pairs.find(p=>p.key===chosen)??pairs[0];
  const activeJourneys=missions?.missions.filter(m=>m.stage!=="completed")??[];
  const hasActiveHero=activeJourneys.some(m=>m.hero_id===active?.hero.hero_id);
  const targetReserved=activeJourneys.some(m=>m.target_i===encounter?.i&&m.target_j===encounter?.j);
  const availablePolicy=missions?.travel_policy;
  const plannedSeconds=encounter&&availablePolicy?
    (Math.abs(encounter.i-2)+Math.abs(encounter.j-2))*availablePolicy.seconds_per_step:null;

  const previewLines=async()=>{
    if(!encounter||!active||busy)return;
    setBusy(true);setLineReport(null);setError("");
    try{
      const response=await fetch("/api/region-lines",{
        method:"POST",headers:{"Content-Type":"application/json"},cache:"no-store",
        body:JSON.stringify({
          city_id:cityId,encounter_id:encounter.encounter_id,
          hero_id:active.hero.hero_id
        })
      });
      const data=await response.json();
      if(!response.ok)throw new Error(typeof data.error==="string"
        ?data.error:"Simulation de la formation refusée");
      setLineReport(data as LineSequencePreview);
    }catch(err){setError(err instanceof Error?err.message:"Simulation indisponible");}
    finally{setBusy(false);}
  };
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
  if(!encounter)return <aside className="region-encounter-panel mmhk-region-encounter-empty"
    role="status">
    <span aria-hidden="true">◇</span>
    <strong>Aucune rencontre connue sur cette case</strong>
    <p>Choisissez une autre case dans la carte pour examiner les rencontres
      réellement découvertes. Les autres emplacements conservent un état inconnu,
      sans population inventée.</p>
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
          onChange={e=>{setChosen(e.target.value);setReport(null);setLineReport(null);}}>
          {pairs.map(({key,hero,army})=><option key={key} value={key}>
            {hero.name} · {army.quantity} {army.name}</option>)}
        </select>
      </label>
      <button type="button" disabled={busy} onClick={preview}>
        {busy?"Simulation en cours":"Tester un duel Jactari"}
      </button>
      <button type="button" disabled={busy} onClick={previewLines}>
        {busy?"Simulation en cours":"Tester la formation (7 pelotons max.)"}
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
    {lineReport&&<div className="encounter-report" role="status"
      data-testid="region-line-sequence-preview">
      <strong>Enchaînement expérimental — aucun effet sur la partie</strong>
      <p>{lineReport.sequence.events.length} échanges · Verdict provisoire :
        {lineReport.sequence.verdict==="attacker"?" attaquant":
         lineReport.sequence.verdict==="defender"?" défenseur":" égalité"}</p>
      <p role="status">{lineReport.weapon_classification_complete
        ?"Types d'armes renseignés : les avantages I/R/C sont appliqués à chaque échange."
        :"Classification d'armes incomplète : aucun avantage n'est inventé pour les unités non qualifiées."}
      </p>
      <ol className="mmhk-regional-line-events">
        {lineReport.sequence.events.map(event=><li key={event.exchange}>
          <strong>Échange {event.exchange}</strong>
          <span>Peloton {event.attacker_position} ({event.attacker_unit_code})
            contre {event.defender_position} ({event.defender_unit_code})</span>
          <small>Attaquant {event.started.attacker} → {event.remaining.attacker} ·
            Défenseur {event.started.defender} → {event.remaining.defender}</small>
          <small>Puissances calculées : {event.total_power.attacker.toLocaleString("fr-FR")} /
            {event.total_power.defender.toLocaleString("fr-FR")}</small>
          <small>Contre-armes :
            {event.counter_weapons.qualified
              ? " "+(event.counter_weapons.attacker_weapon??"—")+" / "+
                (event.counter_weapons.defender_weapon??"—")+
                " · Bonus attaque "+(Number(event.counter_weapons.attacker_bonus)*100)+" %"+
                " · Bonus défense "+(Number(event.counter_weapons.defender_bonus)*100)+" %"
              :" non qualifiées pour cet échange"}
          </small>
          <small>{event.dispersed.attacker?"Attaquant dispersé. ":""}
            {event.dispersed.defender?"Défenseur dispersé. ":""}</small>
        </li>)}
      </ol>
      <small>Contre-armes appliquées seulement si leurs types sont renseignés.
        Sans magie, bonus du héros, tirs préalables, XP, pertes définitives ni
        libération de mine. Ceci n'est pas un devis de bataille.</small>
    </div>}
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
