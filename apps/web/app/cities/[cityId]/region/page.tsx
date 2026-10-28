import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GameShell } from "../../../../components/game-shell/game-shell";
import { RegionScene } from "../../../../components/region-scene";
import {LiveRefresh} from "../../../../components/live-refresh";
import { privateApi, sessionToken, type RegionView, type CityDetail, type CityForces, type PveMissionsResponse } from "../../../../lib/server-api";

export const dynamic = "force-dynamic";

export default async function RegionPage({
  params, searchParams,
}: {
  params: Promise<{ cityId: string }>;
  searchParams:Promise<{mission?:string;tile?:string}>;
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
  if (!response.ok || !response.data) {
    return <main className="shell"><p>La région est momentanément inaccessible.</p>
      <Link href="/">Retour aux mondes</Link></main>;
  }
  const region = response.data;
  const [ownCity,forces,missions]=await Promise.all([
    privateApi<CityDetail>("/api/v1/me/cities/"+encodeURIComponent(cityId),token),
    privateApi<CityForces>("/api/v1/me/cities/"+encodeURIComponent(cityId)+"/forces",token),
    privateApi<PveMissionsResponse>("/api/v1/me/cities/"+encodeURIComponent(cityId)+"/missions",token)
  ]);
  return (
    <GameShell token={token} title={region.city_name}
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
        <div className="region-actions">
          <Link className="scene-action" href={`/cities/${region.city_id}`}>
            Ouvrir la cité {region.city_name}
          </Link>
          <Link className="scene-action" href={`/worlds/${encodeURIComponent(region.world_id)}`}>
            Revenir à la carte du monde
          </Link>
        </div>
        <p className="notice">
          La région présente une grille schématique et des types de mines
          enregistrés, sans localiser artificiellement les mines, les PNJ
          ni les bâtiments régionaux. Aucune action militaire n'est possible ici.
        </p>
    </GameShell>
  );
}
