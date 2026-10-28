import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { signOut } from "../../../actions";
import { RegionScene } from "../../../../components/region-scene";
import { privateApi, sessionToken, type RegionView } from "../../../../lib/server-api";

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
  return (
    <main className="shell">
      <header className="masthead compact">
        <span className="eyebrow">GUERRE DES LARMES · RÉGION</span>
        <h1>{region.city_name}</h1>
        <p className="intro">
          Région ({region.world_x}, {region.world_y}) · Monde {region.world_id}
        </p>
      </header>
      <section className="panel">
        <nav className="nav" aria-label="Navigation du royaume">
          <Link href="/">Mes mondes</Link>
          <Link href={`/worlds/${encodeURIComponent(region.world_id)}`}>
            Carte du monde
          </Link>
          <Link href={`/cities/${region.city_id}`}>Entrer en ville</Link>
          <form action={signOut}><button type="submit">Déconnexion</button></form>
        </nav>
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
      </section>
    </main>
  );
}
