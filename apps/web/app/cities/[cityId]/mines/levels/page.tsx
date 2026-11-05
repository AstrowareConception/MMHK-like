import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {GameShell} from "../../../../../components/game-shell/game-shell";
import {PrivateScreenFailure} from "../../../../../components/game-ui/private-screen-failure";
import {privateApi,sessionToken,type CityDetail,type G11MineLevelReference}
  from "../../../../../lib/server-api";

export const dynamic="force-dynamic";
const names:Record<string,string>={
  gold:"Or",wood:"Bois",ore:"Minerai",crystal:"Cristal",
  gems:"Gemmes",sulfur:"Soufre",mercury:"Mercure"
};

export default async function MineLevelReferencePage({params}:{
  params:Promise<{cityId:string}>;
}){
  const {cityId}=await params,token=await sessionToken();
  if(!token)redirect("/");
  if(!/^[a-f0-9-]{36}$/i.test(cityId))notFound();
  const [data,city]=await Promise.all([
    privateApi<G11MineLevelReference>(
      "/api/v1/me/cities/"+cityId+"/mines/level-reference",token),
    privateApi<CityDetail>("/api/v1/me/cities/"+cityId,token)
  ]);
  if(data.status===401||city.status===401)redirect("/");
  if(data.status===404||city.status===404)notFound();
  if(!data.ok||!data.data||!city.ok||!city.data)
    return <PrivateScreenFailure status={data.status}
      scope="Référentiel minier" retryHref={"/cities/"+cityId+"/mines/levels"}/>;
  return <GameShell screen="region" token={token} title="Registre des mines"
    eyebrow="G11 · RÉFÉRENCE DOCUMENTAIRE 2013"
    description={"Cité de "+city.data.name+" · grille non commandable"}
    worldId={city.data.world_id} cityId={cityId} stocks={city.data.stocks}>
      <section className="mmhk-city-collection" data-testid="g11-mine-reference">
        <h2>Niveaux et rendements de référence</h2>
        <p className="notice">
          Cette grille est transcrite du guide G11 (novembre 2013).
          Elle ne représente pas le niveau réel de vos mines :
          les prérequis du héros, les cumuls d'extensions et les
          arrondis des modes rapides ou économiques restent à qualifier.
          Aucun devis commandable ni débit n'est proposé.
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
        <p className="notice">Source : {data.data.source_ref}.
          Document de référence seulement, pas un ordre de construction.</p>
        <Link className="scene-action" href={"/cities/"+cityId}>
          Retour à la cité
        </Link>
      </section>
    </GameShell>;
}
