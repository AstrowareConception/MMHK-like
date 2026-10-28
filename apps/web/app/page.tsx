import Link from "next/link";
import { signIn, signOut } from "./actions";
import { privateApi, sessionToken, type World } from "../lib/server-api";

type Health = { status: string; service: string };
type JactariStatus = { engine: string; js_oracle_retained: boolean };

async function apiHealth<T>(pathname: string): Promise<T | null> {
  const base = process.env.MMHK_API_INTERNAL_URL ?? "http://127.0.0.1:8000";
  try {
    const response = await fetch(new URL(pathname, base), {
      cache: "no-store", signal: AbortSignal.timeout(3000),
    });
    return response.ok ? ((await response.json()) as T) : null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const token = await sessionToken();
  const [health, engine, worlds] = await Promise.all([
    apiHealth<Health>("/api/v1/health"),
    apiHealth<JactariStatus>("/api/v1/jactari/status"),
    token ? privateApi<World[]>("/api/v1/me/worlds", token) : null,
  ]);
  const connected = health?.status === "ok" && engine?.engine === "Jactari";
  const loggedIn = !!token && worlds?.ok;
  return (
    <main className="shell">
      <header className="masthead">
        <span className="eyebrow">PROJET · GUERRE DES LARMES</span>
        <h1>MMHK-like</h1>
        <p className="intro">Les premiers territoires du royaume.</p>
      </header>
      <section className="panel" aria-labelledby="worlds-heading">
        <div className="panel-title">
          <span className="eyebrow">FONDATIONS · PREMIER MONDE PERSISTANT</span>
          <h2 id="worlds-heading">{loggedIn ? "Mes mondes" : "Accéder au royaume"}</h2>
        </div>
        <div className="statusline" role="status">
          <span className={connected ? "dot online" : "dot offline"} />
          {connected ? "API FastAPI joignable" : "API momentanément inaccessible"}
        </div>
        {loggedIn ? (
          <>
            <nav className="nav">
              <span>Votre compte est connecté.</span>
              <form action={signOut}><button type="submit">Déconnexion</button></form>
            </nav>
            <div className="tile-links">
              {worlds.data?.map((world) => (
                <Link className="tile-link"
                  href={`/worlds/${encodeURIComponent(world.world_id)}`}
                  key={world.world_id}>
                  <span className="eyebrow">MONDE DISPONIBLE</span>
                  <strong>{world.name}</strong>
                  <span>Carte {world.world_size} × {world.world_size}</span>
                </Link>
              ))}
            </div>
            {worlds.data?.length === 0 && (
              <p>Votre compte n'est associé à aucun monde pour le moment.</p>
            )}
          </>
        ) : (
          <>
            <p className="form-intro">Connectez-vous avec un compte provisionné
              par l'administrateur de ce laboratoire.</p>
            {error === "limited" && <p className="error" role="alert">
              Trop de tentatives de connexion. Réessayez dans quelques minutes.</p>}
            {error === "credentials" && <p className="error" role="alert">
              Identifiants invalides ou connexion refusée.</p>}
            {error === "unavailable" && <p className="error" role="alert">
              Le serveur ne répond pas actuellement.</p>}
            <form action={signIn} className="login-form">
              <label htmlFor="username">Identifiant</label>
              <input id="username" name="username" autoComplete="username"
                minLength={3} maxLength={32} required />
              <label htmlFor="password">Mot de passe</label>
              <input id="password" name="password" type="password"
                autoComplete="current-password" required />
              <button type="submit">Entrer dans le royaume</button>
            </form>
          </>
        )}
        <p className="notice">Version de développement : monde et ressources
          persistants, avec production économique expérimentale en local, sans combat PvP ni inscription
          publique. Moteur Jactari conservé comme référence historique.</p>
      </section>
      <footer>MMHK-like · Saison 2 recherchée · Prototype expérimental</footer>
    </main>
  );
}
