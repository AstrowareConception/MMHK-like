import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GameShell } from "../../../../components/game-shell/game-shell";
import { RegionScene } from "../../../../components/region-scene";
import { privateApi, sessionToken, type RegionView, type CityDetail } from "../../../../lib/server-api";

export const dynamic = "force-dynamic";

export default async function RegionPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
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
  const ownCity=await privateApi<CityDetail>("/api/v1/me/cities/"+encodeURIComponent(cityId),token);
  return (
    <GameShell token={token} title={region.city_name}
      eyebrow="ROYAUME · VUE RÉGIONALE"
      description={"Région ("+region.world_x+", "+region.world_y+") · "+region.world_id}
      worldId={region.world_id} cityId={region.city_id}
      stocks={ownCity.ok?ownCity.data?.stocks:undefined}>
        <RegionScene region={region}/>
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
