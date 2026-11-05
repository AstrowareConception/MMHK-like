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
const settlementStatus:Record<string,string>={
  not_enabled:"Règlement expérimental désactivé pour ce monde au départ",
  pre_v102_no_settlement:"Mission antérieure à V102 : aucun règlement rétroactif",
  zero_hero_profile_not_qualified:"Caractéristiques du héros non qualifiées pour le laboratoire",
  fled_without_combat:"Fuite avant combat : aucune perte permanente calculée",
  weapon_classification_incomplete:"Classes d'armes incomplètes : pertes permanentes non appliquées",
  pre_shots_not_qualified:"Tirs préalables non qualifiés : règlement refusé",
  nonordinary_verdict:"Verdict particulier : règlement permanent non qualifié",
  special_jactari_ending_not_qualified:"Égalité ou faux nul Jactari : règlement permanent non qualifié"
};
const neutralResolutionStatus:Record<string,string>={
  pre_v103_not_applicable:"Mission ancienne : aucune résolution neutre rétroactive",
  policy_disabled:"La résolution des rencontres neutres était désactivée au départ",
  neutral_profile_unqualified:"Profil du PNJ sans héros et sans attrition non qualifié",
  attacker_settlement_not_qualified:"Règlement de l'attaquant non qualifié : aucune résolution",
  flight_no_resolution:"Fuite de l'attaquant : rencontre maintenue",
  neutral_defended:"Le défenseur neutre a résisté : rencontre maintenue",
  draw_or_unknown_outcome:"Égalité ou résultat non qualifié : rencontre maintenue",
  weapon_classification_incomplete:"Classification d'armes incomplète : rencontre maintenue",
  pre_shots_not_qualified:"Tirs préalables non qualifiés : rencontre maintenue",
  special_ending_not_qualified:"Issue Jactari particulière : rencontre maintenue"
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
              {!duel?.line_outcome&&slot?.unit_code===r.unit_code&&
                <small>Peloton du duel expérimental</small>}
            </div>;
          })}
        </div>
        <p className="mmhk-mission-ledger-note">Le rapport conserve
          la composition enregistrée par le serveur. {duel?.line_outcome
            ?"Les positions occupées participent à une simulation séquentielle Jactari ; aucune perte durable n'est appliquée."
            :"Les missions plus anciennes utilisent encore un seul peloton dans le duel expérimental."}</p>
      </div>}
      duel={<div className="mmhk-mission-duel">
        <header className="mmhk-mission-pane-heading">
          <span aria-hidden="true">⚔</span>
          <div><h2>Admission et résolution Jactari</h2>
            <p>Résultat transmis par le serveur à l'arrivée.</p></div>
        </header>
        {duel?.engagement_inputs&&<div className="mmhk-mission-inputs" data-testid="pve-engagement-inputs">
          <strong>Forces utilisées lors de l'engagement</strong>
          <p>{duel.engagement_inputs.source_status==="frozen_at_departure"
            ?"Les effectifs et puissances des deux camps ont été figés au départ. Une modification ultérieure de la rencontre ne change pas ce rapport."
            :"Mission ancienne : les forces adverses ont été relevées à l'arrivée, car aucun instantané de départ n'existait."}</p>
          <div><span>Attaquant</span>
            <strong>{duel.engagement_inputs.attacker.unit_count.toLocaleString("fr-FR")}
              {" × "+duel.engagement_inputs.attacker.unit_power.toLocaleString("fr-FR")}
            </strong>
          </div>
          <div><span>Défenseur</span>
            <strong>{duel.engagement_inputs.defender.unit_count.toLocaleString("fr-FR")}
              {" × "+duel.engagement_inputs.defender.unit_power.toLocaleString("fr-FR")}
            </strong>
          </div>
          {duel.engagement_inputs.attacker_line&&<div className="mmhk-pve-line-snapshot">
            <strong>Ligne de l'attaquant figée au départ</strong>
            <ol>{duel.engagement_inputs.attacker_line.map(s=>
              <li key={s.position}>Position {s.position} : {s.count} × {units[s.unit_code]??s.unit_code}
                {" · puissance "+s.unit_power} · classe {s.weapon_code??"non qualifiée"}</li>)}</ol>
          </div>}
          <small>Profil : {duel.engagement_inputs.defender.policy_id}</small>
        </div>}
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
          <p><strong>Rapport enregistré au contact</strong> — {duel.line_outcome
            ?"simulation séquentielle de la ligne ordinaire (jusqu'à sept pelotons)"
            :"simulation mono-peloton historique"}. {duel.settlement?.effects_applied
              ?"Une perte durable expérimentale de l'attaquant a été enregistrée."
              :"Aucune perte durable n'a été appliquée."}
            {" "}{duel.neutral_resolution?.encounter_resolved
              ?"La rencontre neutre a été résolue en laboratoire."
              :"La rencontre neutre reste inchangée."}
            {" "}Aucune XP, aucun butin, revenu minier ou contrôle territorial attribué.</p>
          {duel.line_outcome&&<div data-testid="pve-ordinary-line-result" className="mmhk-mission-line-result">
            <div className="mmhk-mission-verdict" role="status">
              <span>Verdict de la simulation de la ligne</span>
              <strong>{duel.line_outcome.verdict==="attacker"?"Avantage de l'attaquant":
                duel.line_outcome.verdict==="defender"?"Avantage du défenseur":
                duel.line_outcome.verdict==="draw"?"Égalité":"Fuite avant combat"}</strong>
            </div>
            <div><span>Échanges Jactari enregistrés</span>
              <strong>{duel.line_outcome.events.length}</strong></div>
            <p>Pelotons attaquants, effectifs initiaux et simulés restants :</p>
            <ol>{duel.line_outcome.attacker.map(s=><li key={s.position}>
              Position {s.position} · {s.unit_code} : {s.initial} → {s.remaining}
            </li>)}</ol>
            {!duel.line_outcome.weapon_classification_complete&&
              <p className="mmhk-mission-ledger-note">Certaines classes d'armes
                ne sont pas qualifiées : les bonus de contre-arme correspondants
                ne peuvent pas être certifiés.</p>}
            <p className="mmhk-mission-ledger-note">Les talents, sorts,
              récompenses et productions minières restent exclues du
              laboratoire. Les pertes du défenseur PNJ sans héros peuvent
              être appliquées uniquement si sa branche sans attrition et
              les politiques V102/V103 ont été explicitement qualifiées.</p>
          </div>}
          {duel.settlement&&<div data-testid="pve-attacker-settlement"
              className="mmhk-mission-verdict" role="status">
            <span>Règlement expérimental des pertes de l'attaquant</span>
            {duel.settlement.status==="applied"?<>
              <strong>{duel.settlement.total_deaths.toLocaleString("fr-FR")}
                {" mort(s) permanente(s) enregistrée(s)"}</strong>
              <p>Le calcul à 30 % ne concerne que les pelotons ordinaires
                de l'attaquant, selon les données figées au départ.
                Les soldats non morts restent affectés au héros.</p>
              <ol>{duel.settlement.entries.map(s=><li key={s.position}>
                Position {s.position} · {units[s.unit_code]??s.unit_code}
                {" : "+s.dispersed+" dispersé(s), "+s.permanent_deaths+" mort(s)"}
              </li>)}</ol>
            </>:<strong>{settlementStatus[duel.settlement.status]??
              "Règlement non appliqué"}</strong>}
            <small>Politique : {duel.settlement.policy_id}
              {" · ce registre décrit uniquement les pertes de l'attaquant."}</small>
          </div>}
          {duel.neutral_resolution&&<div data-testid="pve-neutral-resolution"
              className="mmhk-mission-verdict" role="status">
            <span>Résolution de la rencontre neutre (laboratoire)</span>
            {duel.neutral_resolution.encounter_resolved?<>
              <strong>Défenseur neutralisé · {duel.neutral_resolution.neutral_deaths.toLocaleString("fr-FR")}
                {" unité(s) PNJ définitivement perdues"}</strong>
              <p>Rencontre désormais résolue : elle n'est plus proposée
                parmi les adversaires actifs de la région.</p>
            </>:<strong>{neutralResolutionStatus[duel.neutral_resolution.status]??
                "Rencontre inchangée"}</strong>}
            <small>Aucune mine activée, aucune XP, aucun butin et aucun
              territoire attribués. Politique : {duel.neutral_resolution.policy_id}</small>
          </div>}
          {duel.interpretation&&<div className="mmhk-mission-verdict" role="status">
            <span>Verdict du duel simulé</span>
            <strong>{duel.interpretation.verdict==="attacker"?"Avantage de l'attaquant":
              duel.interpretation.verdict==="defender"?"Avantage du défenseur":
              duel.interpretation.verdict==="draw"?"Égalité":"Résultat non tranché"}</strong>
          </div>}
          {duel.interpretation?.ending?.kind==="false_draw"&&<p className="mmhk-mission-ledger-note">
            Faux nul Jactari : le marqueur technique départage le duel
            sans jet aléatoire. Le peloton désigné vainqueur peut finir
            avec zéro unité active ; aucune mort définitive n'est déduite
            de ce marqueur.
          </p>}
          {duel.interpretation?.ending?.kind==="true_draw"&&
            <p className="mmhk-mission-ledger-note">
              Égalité véritable : les deux pelotons sont dispersés
              dans la simulation. Cela ne constitue pas leur destruction
              définitive.
            </p>}
          {duel.interpretation?.overwhelming?.overwhelming&&
            <div className="mmhk-mission-verdict">
              <span>Écrasement Jactari — victoire technique</span>
              <strong>{duel.interpretation.overwhelming.winner==="attacker"
                ?"Camp attaquant":"Camp défenseur"}</strong>
              <span>Écart après arrondi : {
                duel.interpretation.overwhelming.power_delta_after_floor
              } · base du camp vainqueur : {
                duel.interpretation.overwhelming.winner_base_power
              }.</span>
              <small>Le marqueur −1 de Jactari n'est pas une quantité de morts.</small>
            </div>}
          {duel.interpretation&&<>
            {duel.interpretation.ending&&<div>
              <span>Unités dispersées pendant le duel (non persistantes)</span>
              <strong>{metric(duel.interpretation.ending.theoretical_dispersions.attacker)}
                {" / "}{metric(duel.interpretation.ending.theoretical_dispersions.defender)}</strong>
            </div>}
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
          {!duel.line_outcome&&<><div><span>Puissance de l'attaquant</span>
            <strong>{metric(duel.outcome?.totalPower?.attacker)}</strong></div>
          <div><span>Puissance des défenseurs</span>
            <strong>{metric(duel.outcome?.totalPower?.defender)}</strong></div>
          <div><span>Unités actives restantes (simulation)</span>
            <strong>{metric(duel.outcome?.remaining?.attacker)} / {metric(duel.outcome?.remaining?.defender)}</strong></div></>}
        </div>:<div className="mmhk-mission-duel-pending">
          <span aria-hidden="true">⌛</span>
          <strong>Le héros n'a pas encore atteint sa destination</strong>
          <p>Aucun résultat n'est calculé avant l'événement d'arrivée du worker.</p>
        </div>}
        <p className="mmhk-mission-ledger-note">Le laboratoire peut enregistrer
          les pertes ordinaires de l'attaquant via V102 et la résolution
          d'une rencontre neutre sans héros ni attrition via V103, uniquement
          sous deux politiques de laboratoire et des données qualifiées.
          Aucun revenu minier, XP, butin ou contrôle territorial n'est
          encore certifié pour MMHK saison 2.</p>
      </div>}
    />
  </GameShell>;
}
