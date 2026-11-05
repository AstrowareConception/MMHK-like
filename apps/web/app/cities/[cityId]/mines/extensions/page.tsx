import Link from "next/link";
import {randomUUID} from "node:crypto";
import {notFound,redirect} from "next/navigation";
import {GameShell} from "../../../../../components/game-shell/game-shell";
import {LiveRefresh} from "../../../../../components/live-refresh";
import {PrivateScreenFailure} from "../../../../../components/game-ui/private-screen-failure";
import {startQualifiedMineExtension} from "../../../../actions";
import {privateApi,sessionToken,type CityDetail,type LabMineExtensionsResponse}
  from "../../../../../lib/server-api";

export const dynamic="force-dynamic";
const names:Record<string,string>={
  gold:"Or",wood:"Bois",ore:"Minerai",crystal:"Cristal",
  gems:"Gemmes",sulfur:"Soufre",mercury:"Mercure"
};

export default async function MineExtensionsPage({params,searchParams}:{
  params:Promise<{cityId:string}>;searchParams:Promise<{extension?:string}>;
}){
  const {cityId}=await params,token=await sessionToken();
  if(!token)redirect("/");
  if(!/^[a-f0-9-]{36}$/i.test(cityId))notFound();
  const [city,extensions]=await Promise.all([
    privateApi<CityDetail>("/api/v1/me/cities/"+cityId,token),
    privateApi<LabMineExtensionsResponse>(
      "/api/v1/me/cities/"+cityId+"/mine-extensions",token)
  ]);
  if(city.status===401||extensions.status===401)redirect("/");
  if(city.status===404||extensions.status===404)notFound();
  if(!city.ok||!city.data||!extensions.ok||!extensions.data)
    return <PrivateScreenFailure status={extensions.status}
      scope="Extensions minières" retryHref={"/cities/"+cityId+"/mines/extensions"}/>;
  const registry=extensions.data;
  const feedback=(await searchParams).extension;
  return <GameShell screen="region" token={token} title="Extensions minières"
    eyebrow="G11 · LABORATOIRE RÉGIONAL"
    description={"Cité de "+city.data.name+" · une seule extension qualifiée par mine"}
    worldId={city.data.world_id} cityId={cityId} stocks={city.data.stocks}>
    {registry.mines.some(m=>m.order?.status==="building")&&
      <LiveRefresh intervalSeconds={15}/>}
    <section id="lab-mine-extensions" className="mmhk-city-collection"
      data-testid="lab-mine-extensions">
      <h2>Agrandir une mine</h2>
      <p className="notice">Le guide G11 décrit un bonus nominal de 5 %
        par extension, mais une interruption de la production pendant les
        travaux. Les coûts, durées et emplacements ci-dessous ont été
        approuvés individuellement pour notre laboratoire ; ils ne
        représentent pas des barèmes Ubisoft certifiés. Le cumul des
        extensions n'étant pas qualifié, une seule extension est permise
        par mine dans ce mode expérimental.</p>
      {feedback==="started"&&<p role="status" className="construction-notice">
        Chantier enregistré : le prix a été payé une seule fois.
        La production de cette mine est suspendue jusqu'à l'échéance ;
        les autres mines continuent normalement.</p>}
      {feedback==="conflict"&&<p role="alert" className="error">
        Chantier refusé : emplacement non qualifié, héros inadmissible,
        fonds insuffisants, travaux incompatibles ou extension déjà construite.</p>}
      {feedback==="missing"&&<p role="alert" className="error">
        Cette cité ou ce héros n'est pas accessible à votre compte.</p>}
      {feedback==="unavailable"&&<p role="alert" className="error">
        Confirmation incertaine : consultez l'état de la mine avant
        toute nouvelle demande. Aucun ordre n'est renvoyé automatiquement.</p>}
      {registry.mines.length===0&&<p className="notice">
        Aucun site d'extension n'a été qualifié pour les mines de cette
        cité. Il serait incorrect d'afficher un devis historique inventé.
        Les mines existantes continuent leur activité habituelle.</p>}
      {registry.mines.map(m=><article key={m.resource}>
        <h3>{names[m.resource]??m.resource} — site ({m.site_i}, {m.site_j})</h3>
        <p>Bonus annoncé : +{m.extension_bonus_percent} %.
          Coût expérimental attesté : {m.cost_gold.toLocaleString("fr-FR")} or.
          Durée : {Math.round(m.duration_seconds/60)} minutes.
          Héros requis : niveau {m.required_hero_level} minimum.</p>
        {m.order?.status==="completed"?
          <p role="status">Extension achevée. Bonus de 5 %
            appliqué après règlement des anciens cycles.
            Une seconde extension n'est pas proposée sans règle de
            cumul historique qualifiée.</p>:
        m.order?.status==="building"?
          <p role="status">Chantier en cours : mine à l'arrêt
            jusqu'au {new Date(m.order.due_at).toLocaleString("fr-FR",{
              timeZone:"Europe/Paris"})}.
            La reprise et le bonus seront réglés par l'horloge du serveur.</p>:
        m.gate_activated?<>
          <p>Emplacement libre, attesté par l'opérateur.
            La mine doit interrompre sa production pendant ces travaux.</p>
          <form action={startQualifiedMineExtension}>
            <input type="hidden" name="cityId" value={cityId}/>
            <input type="hidden" name="resource" value={m.resource}/>
            <input type="hidden" name="orderId" value={randomUUID()}/>
            <label>Héros constructeur
              <select name="heroId" required defaultValue="">
                <option value="" disabled>Choisir un héros admissible</option>
                {registry.available_heroes.filter(h=>
                  h.status==="idle"&&h.level>=m.required_hero_level
                ).map(h=><option key={h.hero_id} value={h.hero_id}>
                  {h.name} · niveau {h.level}</option>)}
              </select>
            </label>
            <button className="scene-action" type="submit" disabled={
              registry.available_heroes.every(h=>
                h.status!=="idle"||h.level<m.required_hero_level)}>
              Construire l'extension (LAB)
            </button>
          </form>
        </>:<p>Mine non exploitée : l'extension n'est pas admissible.</p>}
        <small>Qualification du site : {m.source_ref}.</small>
      </article>)}
      <p className="notice">Aucune extension supplémentaire, aucun
        aménagement et aucun bonus combiné non qualifié ne sont créés.
        Les revenus de la mine sont traités exclusivement par PostgreSQL.</p>
      <Link className="scene-action" href={"/cities/"+cityId+"/mines/levels"}>
        Retour aux niveaux des mines
      </Link>
    </section>
  </GameShell>;
}
