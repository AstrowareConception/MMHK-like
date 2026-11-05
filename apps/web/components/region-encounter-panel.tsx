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
      {lineReport.sequence.admission.fled?<div className="mmhk-pve-flight">
        <strong>Fuite avant combat — seuil d'admission PvE atteint</strong>
        <p>Puissance brute attaquante : {lineReport.sequence.admission.attacker_raw_power}
          {" · Défense : "+lineReport.sequence.admission.defender_raw_power}
          {" · Seuil inclusif : "+lineReport.sequence.admission.threshold}</p>
        <p>Aucun barrage, duel, mort définitive, XP ou butin n'est
          appliqué par cette simulation.</p>
      </div>:<p>{lineReport.sequence.events.length} échanges · Verdict provisoire :
        {lineReport.sequence.verdict==="attacker"?" attaquant":
         lineReport.sequence.verdict==="defender"?" défenseur":" égalité"}</p>}
      <p role="status">{!lineReport.sequence.combat_started
        ?"Aucun bonus du héros n'a été appliqué : fuite avant combat."
        :lineReport.attacker_hero_profile_applied
        ?"Caractéristiques de combat du héros qualifiées : attaque +0,5 % par point."
        :"Caractéristiques de combat du héros non qualifiées : aucun bonus de héros supposé."}
      </p>
      <p role="status">{!lineReport.sequence.combat_started
        ?"Les contre-armes ne sont pas utilisées pour décider de la fuite."
        :lineReport.weapon_classification_complete
        ?"Types d'armes renseignés : les avantages I/R/C sont appliqués à chaque échange."
        :"Classification d'armes incomplète : aucun avantage n'est inventé pour les unités non qualifiées."}
      </p>
      {lineReport.sequence.combat_started&&lineReport.attacker_conditional_talent_configured&&<p>
        Talent du héros : activé échange par échange uniquement si l'unité
        attaquante possède l'avantage de contre-arme correspondant.
      </p>}
      {!lineReport.sequence.combat_started&&<p className="map-qualification">
        Les bonus du héros et les tirs préalables sont exclus du rapport
        brut utilisé pour décider de cette fuite.
      </p>}
      <div className="mmhk-pre-shot-phase" data-testid="combat-pre-shot-phase">
        <strong>Phase préalable — avant les duels</strong>
        {!lineReport.sequence.combat_started
          ?<p>Fuite avant tout tir : les capacités éventuellement configurées
            ne se déclenchent pas.</p>
          :lineReport.sequence.pre_shots.configured?<>
          <p>Les tirs des deux camps sont calculés sur les effectifs initiaux,
            puis appliqués ensemble avant les échanges ordinaires.</p>
          <ol>
            {lineReport.sequence.pre_shots.events.map(shot=><li key={shot.order}>
              <strong>{shot.kind==="barrage"?"Barrage":
                shot.kind==="ballista"?"Balistes":"Bombardement"}</strong>
              {" · "+(shot.side==="attacker"?"Attaquant":"Défenseur")}
              {" · Puissance "+shot.shot_power.toLocaleString("fr-FR")}
              <small>Source : {shot.source_ref} · {shot.percent} %</small>
            </li>)}
          </ol>
          <p>Pertes simulées avant duel — attaquant :
            {" "+lineReport.sequence.pre_shots.simulated_losses.attacker.reduce((n,v)=>n+v,0)}
            {" · Défenseur : "+
              lineReport.sequence.pre_shots.simulated_losses.defender.reduce((n,v)=>n+v,0)}
          </p>
          {lineReport.sequence.pre_shots.overlap_capped&&<small>
            Plusieurs tirs visaient les mêmes unités : le résultat
            a été borné aux effectifs initiaux.
          </small>}
        </>:<p>Aucune capacité de tir préalable n'est qualifiée pour cette simulation.
          Aucun tir n'a été ajouté automatiquement.</p>}
        <small>Ces pertes sont temporaires dans le laboratoire :
          elles ne retirent aucune unité des armées en base.</small>
      </div>
      <ol className="mmhk-regional-line-events">
        {lineReport.sequence.events.map(event=><li key={event.exchange}>
          <strong>Échange {event.exchange}</strong>
          <span>Peloton {event.attacker_position} ({event.attacker_unit_code})
            contre {event.defender_position} ({event.defender_unit_code})</span>
          <small>Attaquant {event.started.attacker} → {event.remaining.attacker} ·
            Défenseur {event.started.defender} → {event.remaining.defender}</small>
          <small>Puissances calculées : {event.total_power.attacker.toLocaleString("fr-FR")} /
            {event.total_power.defender.toLocaleString("fr-FR")}</small>
          <small>Héros :
            {event.hero_attributes
              ?" "+event.hero_attributes.attack_points+" points d'attaque"+
                " · +"+(Number(event.hero_attributes.attackStackHero)*100)+" %"+
                " · +"+event.hero_attributes.attackUnitsHero+" par unité"+
                " · Source : "+event.hero_attributes.source_ref
              :" caractéristiques non renseignées"}
          </small>
          {event.conditional_talent&&<small>
            Talent conditionnel expérimental : {event.conditional_talent.active
              ?"actif (+ "+(Number(event.conditional_talent.additional_attack_fraction)*100)+" %)"
              :"inactif (+ 0 %)"}
            {" · Condition : avantage de contre-arme du héros"}
            {" · Source : "+event.conditional_talent.source_ref}
          </small>}
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
        Sans magie, autres talents, tirs préalables, XP, pertes définitives ni
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
