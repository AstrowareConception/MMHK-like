import Link from "next/link";
import {randomUUID} from "node:crypto";
import { notFound, redirect } from "next/navigation";
import { GameShell } from "../../../../components/game-shell/game-shell";
import {PrivateScreenFailure} from "../../../../components/game-ui/private-screen-failure";
import { RegionScene } from "../../../../components/region-scene";
import { activateRegionalLabMine } from "../../../actions";
import {LiveRefresh} from "../../../../components/live-refresh";
import { privateApi, sessionToken, type RegionView, type CityDetail, type CityForces, type PveMissionsResponse, type LabMineUnlocksResponse } from "../../../../lib/server-api";

export const dynamic = "force-dynamic";

export default async function RegionPage({
  params, searchParams,
}: {
  params: Promise<{ cityId: string }>;
  searchParams:Promise<{mission?:string;tile?:string;mine?:string}>;
}) {
  const { cityId } = await params;
  const requested=(await searchParams).tile??"";
  const tile=/^[0-4]-[0-4]$/.test(requested)
    ? {i:Number(requested[0]),j:Number(requested[2])} : undefined;
  const token = await sessionToken();
  if (!token) redirect("/");
  if (!/^[0-9a-f-]{36}$/i.test(cityId)) notFound();
  const response = await privateApi<RegionView>(
    `/api/v1/me/cities/${encodeURIComponent(cityId)}/region`, token,
  );
  if (response.status === 401) redirect("/");
  if (response.status === 404) notFound();
  if (!response.ok || !response.data)
    return <PrivateScreenFailure status={response.status}
      scope="Région" retryHref={"/cities/"+encodeURIComponent(cityId)+"/region"}/>;
  const region = response.data;
  const [ownCity,forces,missions,mineState]=await Promise.all([
    privateApi<CityDetail>("/api/v1/me/cities/"+encodeURIComponent(cityId),token),
    privateApi<CityForces>("/api/v1/me/cities/"+encodeURIComponent(cityId)+"/forces",token),
    privateApi<PveMissionsResponse>("/api/v1/me/cities/"+encodeURIComponent(cityId)+"/missions",token),
    privateApi<LabMineUnlocksResponse>("/api/v1/me/cities/"+encodeURIComponent(cityId)+"/mine-unlocks",token)
  ]);
  return (
    <GameShell screen="region" token={token} title={region.city_name}
      eyebrow="ROYAUME · VUE RÉGIONALE"
      description={"Région ("+region.world_x+", "+region.world_y+") · "+region.world_id}
      worldId={region.world_id} cityId={region.city_id}
      stocks={ownCity.ok?ownCity.data?.stocks:undefined}>
        <LiveRefresh intervalSeconds={8}/>
        {(await searchParams).mission&&<p role={(await searchParams).mission==="ok"?"status":"alert"}
          className={(await searchParams).mission==="ok"?"construction-notice":"error"}>
          {(await searchParams).mission==="ok"?"Le héros est parti. Son trajet est désormais suivi par le worker.":
            "Départ refusé : héros occupé, rencontre déjà ciblée ou trajet indisponible."}
        </p>}
        <RegionScene region={region} forces={forces.ok?forces.data??null:null}
          missions={missions.ok?missions.data??null:null} initialSelection={tile}/>

        {mineState.ok&&mineState.data&&mineState.data.mines.length>0&&
          <section id="lab-mines" className="mmhk-city-collection" data-testid="lab-mine-unlocks">
            <h2>Gisements et exploitation</h2>
            <p>Ces mines existent déjà dans la cité. Leur exploitation
              expérimentale est suspendue jusqu'à la disparition de leur
              gardien, puis la confirmation du propriétaire. Aucun nouveau
              gisement ni taux de production n'est créé.</p>
            {(await searchParams).mine==="active"&&<p role="status" className="construction-notice">
              Mine activée : la production reprendra à partir du prochain
              cycle entier admissible, sans rappel des cycles antérieurs.</p>}
            {(await searchParams).mine==="conflict"&&<p role="alert" className="error">
              Exploitation non confirmée : la mine est déjà activée ou
              les conditions de libération ne sont pas réunies.</p>}
            {(await searchParams).mine==="unavailable"&&<p role="alert" className="error">
              État de l'ordre incertain. Vérifiez la mine avant toute
              nouvelle tentative : aucun ordre n'est relancé automatiquement.</p>}
            {(await searchParams).mine==="missing"&&<p role="alert" className="error">
              Cette mine n'est pas disponible pour votre cité.</p>}
            <div className="resource-grid">
              {mineState.data.mines.map(m=><article key={m.resource}>
                <strong>{({gold:"Or",wood:"Bois",ore:"Minerai",
                  crystal:"Cristal",gems:"Gemmes",sulfur:"Soufre",
                  mercury:"Mercure"} as Record<string,string>)[m.resource]}</strong>
                <small>Gisement #{m.deposit_slot+1} · case {m.i}, {m.j}</small>
                <small>Taux configuré : {m.base_units_per_day} / jour</small>
                {m.state==="guarded"&&<p>Gardien en place : exploitation suspendue.</p>}
                {m.state==="active"&&<p>Exploitation active depuis
                  {" "+new Date(m.activated_at!).toLocaleString("fr-FR",{
                    timeZone:"Europe/Paris"})}.</p>}
                {m.state==="ready"&&<>
                  <p>Gardien neutralisé. Vous pouvez mettre la mine en exploitation.</p>
                  <form action={activateRegionalLabMine}>
                    <input type="hidden" name="cityId" value={cityId}/>
                    <input type="hidden" name="resource" value={m.resource}/>
                    <input type="hidden" name="orderId" value={randomUUID()}/>
                    <button type="submit" className="scene-action">
                      Activer cette mine
                    </button>
                  </form>
                </>}
              </article>)}
            </div>
            <p className="notice">La production provient exclusivement
              du profil économique PostgreSQL préexistant.
              L'activation de mines historiques non qualifiées reste indisponible.</p>
          </section>}
        <div className="region-actions">
          <Link className="scene-action" href={`/cities/${region.city_id}`}>
            Ouvrir la cité {region.city_name}
          </Link>
          <Link className="scene-action" href={`/worlds/${encodeURIComponent(region.world_id)}`}>
            Revenir à la carte du monde
          </Link>
        </div>
        <p className="notice">
          Les mines de votre cité possèdent désormais des emplacements stables
          dans la région. Ces configurations sont générées pour notre reconstruction,
          et ne prétendent pas reproduire des positions historiques certifiées.
          Les autres terrains restent non cartographiés ; les missions et rencontres
          disponibles sont gérées séparément par le serveur.
        </p>
    </GameShell>
  );
}
