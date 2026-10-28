import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { signOut } from "../../actions";
import { WorldAtlas } from "../../../components/world-atlas";
import { privateApi, sessionToken, type WorldOverview } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

export default async function WorldPage({
  params,
}: {
  params: Promise<{ worldId: string }>;
}) {
  const { worldId } = await params;
  const token = await sessionToken();
  if (!token) redirect("/");
  const result = await privateApi<WorldOverview>(
    `/api/v1/me/worlds/${encodeURIComponent(worldId)}/overview`, token,
  );
  if (result.status === 401) redirect("/");
  if (result.status === 404) notFound();
  if (!result.ok || !result.data) {
    return <main className="shell"><p>Le monde est momentanément inaccessible.</p>
      <Link href="/">Retour aux mondes</Link></main>;
  }
  const world = result.data;
  return (
    <main className="shell">
      <header className="masthead compact">
        <span className="eyebrow">GUERRE DES LARMES · MONDE PERSISTANT</span>
        <h1>{world.name}</h1>
        <p className="intro">Atlas de vos territoires — {world.world_size} × {world.world_size} régions toriques.</p>
      </header>
      <section className="panel">
        <nav className="nav" aria-label="Navigation du royaume">
          <Link href="/">Mes mondes</Link>
          <span className="nav-current">Monde : {world.name}</span>
          <form action={signOut}><button type="submit">Déconnexion</button></form>
        </nav>
        <WorldAtlas world={world} cities={world.cities}/>
        <h2>Mes cités</h2>
        <div className="tile-links">
          {world.cities.map((city) => (
            <div className="tile-link world-city-link" key={city.city_id}>
              <span className="eyebrow">{city.first_city ? "CAPITALE INITIALE" : "CITÉ"}</span>
              <strong>{city.name}</strong>
              <span>Région ({city.x}, {city.y})</span>
              <div className="map-card-actions">
                <Link href={`/cities/${city.city_id}/region`}>Voir la région</Link>
                <Link href={`/cities/${city.city_id}`}>Entrer en ville</Link>
              </div>
            </div>
          ))}
        </div>
        {world.cities.length === 0 && (
          <p>Vous ne possédez pas encore de ville dans ce monde.</p>
        )}
        <p className="notice">
          Cette carte n'affiche que vos propres villes. Les autres positions,
          le terrain et la reconnaissance ne sont pas disponibles dans cette tranche.
        </p>
      </section>
    </main>
  );
}
