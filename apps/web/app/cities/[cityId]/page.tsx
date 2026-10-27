import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { signOut } from "../../actions";
import { privateApi, sessionToken, type CityDetail } from "../../../lib/server-api";

export const dynamic = "force-dynamic";

const RESOURCES = [
  ["gold", "Or"],
  ["wood", "Bois"],
  ["ore", "Minerai"],
  ["crystal", "Cristal"],
  ["gems", "Gemmes"],
  ["sulfur", "Soufre"],
  ["mercury", "Mercure"],
] as const;

export default async function CityPage({
  params,
}: {
  params: Promise<{ cityId: string }>;
}) {
  const { cityId } = await params;
  const token = await sessionToken();
  if (!token) redirect("/");
  if (!/^[a-f0-9-]{36}$/i.test(cityId)) notFound();
  const answer = await privateApi<CityDetail>(
    `/api/v1/me/cities/${encodeURIComponent(cityId)}`, token,
  );
  if (answer.status === 401) redirect("/");
  if (answer.status === 404) notFound();
  if (!answer.ok || !answer.data)
    return <main className="shell"><p>La ville est momentanément inaccessible.</p>
      <Link href="/">Retour</Link></main>;
  const city = answer.data;
  return (
    <main className="shell">
      <header className="masthead compact">
        <span className="eyebrow">VILLE · HAVRE · ÉCONOMIE EXPÉRIMENTALE</span>
        <h1>{city.name}</h1>
        <p className="intro">Coordonnées ({city.x}, {city.y})</p>
      </header>
      <section className="panel">
        <nav className="nav">
          <Link href={`/worlds/${encodeURIComponent(city.world_id)}`}>Mes villes</Link>
          <form action={signOut}><button type="submit">Déconnexion</button></form>
        </nav>
        <h2>Réserves de la ville</h2>
        <div className="resource-grid">
          {RESOURCES.map(([key, label]) => (
            <article key={key}>
              <span className="tile-title">{label}</span>
              <strong>{(city.stocks[key] ?? 0).toLocaleString("fr-FR")}</strong>
              <small>{city.mines.includes(key) ? "Mine présente" : "Pas de mine initiale"}</small>
            </article>
          ))}
        </div>
        <p className="notice">Les quatre mines du Havre initial sont : or, bois,
          minerai et cristal. Aucun débit de production ni montant de départ
          historique n'est encore appliqué. Les réserves viennent directement
          de PostgreSQL, sans cache Redis.</p>
      </section>
    </main>
  );
}
