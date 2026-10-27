import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { signOut } from "../../actions";
import { privateApi, sessionToken, type City, type World } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

export default async function WorldPage({
  params,
}: {
  params: Promise<{ worldId: string }>;
}) {
  const { worldId } = await params;
  const token = await sessionToken();
  if (!token) redirect("/");
  const listed = await privateApi<World[]>("/api/v1/me/worlds", token);
  if (listed.status === 401) redirect("/");
  const world = listed.data?.find((w) => w.world_id === worldId);
  if (!world) notFound();

  const result = await privateApi<City[]>(
    `/api/v1/me/worlds/${encodeURIComponent(worldId)}/cities`, token,
  );
  if (!result.ok) {
    return <main className="shell"><p>La liste des villes est momentanément inaccessible.</p>
      <Link href="/">Retour</Link></main>;
  }
  return (
    <main className="shell">
      <header className="masthead compact">
        <span className="eyebrow">CARTE DU MONDE · PREMIÈRE PROVINCE</span>
        <h1>{world.name}</h1>
        <p className="intro">Monde torique de {world.world_size} × {world.world_size} régions.</p>
      </header>
      <section className="panel">
        <nav className="nav"><Link href="/">Mes mondes</Link>
          <form action={signOut}><button type="submit">Déconnexion</button></form></nav>
        <h2>Mes villes</h2>
        <div className="tile-links">
          {(result.data ?? []).map((city) => (
            <Link className="tile-link" href={`/cities/${city.city_id}`} key={city.city_id}>
              <span className="eyebrow">{city.first_city ? "CAPITALE INITIALE" : "VILLE"}</span>
              <strong>{city.name}</strong>
              <span>Région ({city.x}, {city.y})</span>
            </Link>
          ))}
        </div>
        {result.data?.length === 0 && <p>Vous ne possédez pas encore de ville dans ce monde.</p>}
        <p className="notice">Les villes des autres joueurs ne sont pas exposées par cette API.</p>
      </section>
    </main>
  );
}
