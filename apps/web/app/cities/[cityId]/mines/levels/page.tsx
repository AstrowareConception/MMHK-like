import Link from "next/link";
import {randomUUID} from "node:crypto";
import {startQualifiedMineUpgrade} from "../../../../actions";
import {notFound,redirect} from "next/navigation";
import {GameShell} from "../../../../../components/game-shell/game-shell";
import {PrivateScreenFailure} from "../../../../../components/game-ui/private-screen-failure";
import {privateApi,sessionToken,type CityDetail,type G11MineLevelReference,
  type LabMineUpgradesResponse}
  from "../../../../../lib/server-api";

export const dynamic="force-dynamic";
const names:Record<string,string>={
  gold:"Or",wood:"Bois",ore:"Minerai",crystal:"Cristal",
  gems:"Gemmes",sulfur:"Soufre",mercury:"Mercure"
};

export default async function MineLevelReferencePage({params,searchParams}:{
  params:Promise<{cityId:string}>;
  searchParams:Promise<{upgrade?:string}>;
}){
  const {cityId}=await params,token=await sessionToken();
  if(!token)redirect("/");
  if(!/^[a-f0-9-]{36}$/i.test(cityId))notFound();
  const [data,city,upgrades]=await Promise.all([
    privateApi<G11MineLevelReference>(
      "/api/v1/me/cities/"+cityId+"/mines/level-reference",token),
    privateApi<CityDetail>("/api/v1/me/cities/"+cityId,token),
    privateApi<LabMineUpgradesResponse>(
      "/api/v1/me/cities/"+cityId+"/mine-upgrades",token)
  ]);
  if(data.status===401||city.status===401||upgrades.status===401)redirect("/");
  if(data.status===404||city.status===404)notFound();
  if(!data.ok||!data.data||!city.ok||!city.data)
    return <PrivateScreenFailure status={data.status}
      scope="Référentiel minier" retryHref={"/cities/"+cityId+"/mines/levels"}/>;
  const upgradeData=upgrades.ok&&upgrades.data?upgrades.data:null;
  return <GameShell screen="region" token={token} title="Registre des mines"
    eyebrow="G11 · RÉFÉRENCE DOCUMENTAIRE 2013"
    description={"Cité de "+city.data.name+" · G11 et laboratoire contrôlé"}
    worldId={city.data.world_id} cityId={cityId} stocks={city.data.stocks}>
      <section className="mmhk-city-collection" data-testid="g11-mine-reference">
        <h2>Niveaux et rendements de référence</h2>
        <p className="notice">
          Cette grille est transcrite du guide G11 (novembre 2013).
          Elle ne représente pas le niveau réel de vos mines :
          les prérequis du héros, les cumuls d'extensions et les
          arrondis des modes rapides ou économiques restent à qualifier.
          Les valeurs documentaires ne constituent pas des ordres.
          Les rares mines explicitement qualifiées en laboratoire
          disposent d'un chantier distinct et encadré ci-dessous.
        </p>
        {data.data.mines.map(m=><article key={m.resource}>
          <h3>{names[m.resource]??m.resource}</h3>
          <table>
            <thead><tr>
              <th>Progression</th><th>Coût en or</th><th>Durée de base</th>
              <th>Production de base avant/après (par jour)</th>
            </tr></thead>
            <tbody>{m.steps.map(s=><tr key={s.from_level}>
              <td>{s.from_level} → {s.to_level}</td>
              <td>{s.cost_gold.toLocaleString("fr-FR")}</td>
              <td>{s.base_duration_hours} h</td>
              <td>{s.base_daily_before.toLocaleString("fr-FR")} → {s.base_daily_after.toLocaleString("fr-FR")}</td>
            </tr>)}</tbody>
          </table>
          <small>La production de base se poursuit pendant une montée
            de niveau selon G11 ; la disponibilité des travaux n'est pas validée.</small>
        </article>)}
        <section id="qualified-g11-mine-upgrades" data-testid="g11-qualified-upgrades">
          <h2>Améliorations qualifiées en laboratoire</h2>
          {(await searchParams).upgrade==="started"&&<p role="status"
            className="construction-notice">Travaux enregistrés : le coût a été débité une fois.
            La mine continue à produire à son ancien taux durant le chantier.</p>}
          {(await searchParams).upgrade==="conflict"&&<p role="alert" className="error">
            Ordre refusé : mine non qualifiée, héros indisponible,
            ressource insuffisante ou chantier déjà actif.</p>}
          {(await searchParams).upgrade==="unavailable"&&<p role="alert" className="error">
            Confirmation incertaine : consultez l'ordre enregistré
            avant de recommencer. Aucun débit n'est relancé automatiquement.</p>}
          {(await searchParams).upgrade==="missing"&&<p role="alert" className="error">
            Cette mine ou ce héros ne vous appartient pas.</p>}
          {!upgrades.ok&&<p role="alert" className="error">
            Le registre des chantiers n'est pas disponible.
            Aucune commande n'est proposée.</p>}
          {upgradeData&&upgradeData.mines.length===0&&
            <p className="notice">Aucune mine de cette cité n'a reçu
              de qualification pour améliorer son niveau selon G11.
              Les taux expérimentaux existants ne suffisent pas.</p>}
          {upgradeData&&upgradeData.mines.map(m=>
            <article key={m.resource}>
              <h3>{names[m.resource]??m.resource} · niveau {m.level}</h3>
              {m.active_order?
                <p role="status">Travaux de niveau {m.active_order.target_level} en cours.
                  Coût : {m.active_order.cost_gold.toLocaleString("fr-FR")} or.
                  Échéance : {new Date(m.active_order.due_at).toLocaleString("fr-FR",{
                    timeZone:"Europe/Paris"})}.
                  Le nouveau rendement sera appliqué lorsque
                  l'horloge économique aura réglé les anciens cycles.</p>:
              m.quote&&m.gate_activated?<>
                <p>Amélioration normale vers le niveau {m.quote.target_level} :
                  {" "+m.quote.cost_gold.toLocaleString("fr-FR")} or,
                  durée {m.quote.duration_seconds/3600} h.
                  Production de base : {m.quote.old_rate} → {m.quote.new_rate} / jour.
                  Niveau de héros exigé par la qualification du laboratoire :
                  {" "+m.required_hero_level}.</p>
                <form action={startQualifiedMineUpgrade}>
                  <input type="hidden" name="cityId" value={cityId}/>
                  <input type="hidden" name="resource" value={m.resource}/>
                  <input type="hidden" name="orderId" value={randomUUID()}/>
                  <label>Héros constructeur
                    <select name="heroId" required defaultValue="">
                      <option value="" disabled>Choisir un héros disponible</option>
                      {upgradeData.available_heroes.filter(h=>
                        h.status==="idle"&&h.level>=(m.required_hero_level??101)
                      ).map(h=><option key={h.hero_id} value={h.hero_id}>
                        {h.name} · niveau {h.level}</option>)}
                    </select>
                  </label>
                  <button type="submit" className="scene-action"
                    disabled={upgradeData.available_heroes.every(h=>
                      h.status!=="idle"||h.level<(m.required_hero_level??101))}>
                    Lancer les travaux normaux (LAB)
                  </button>
                </form>
              </>:<p>Le niveau suivant n'est pas qualifié
                ou la mine n'est pas encore exploitée.
                Aucun chantier ne peut être lancé.</p>}
            </article>)}
        </section>
        <p className="notice">Source : {data.data.source_ref}.
          Document de référence seulement, pas un ordre de construction.</p>
        <Link className="scene-action" href={"/cities/"+cityId}>
          Retour à la cité
        </Link>
      </section>
    </GameShell>;
}
