import Link from "next/link";
import { GameShell } from "../components/game-shell/game-shell";
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
  searchParams: Promise<{ error?: string; logout?: string }>;
}) {
  const { error, logout } = await searchParams;
  const token = await sessionToken();
  const [health, engine, worlds] = await Promise.all([
    apiHealth<Health>("/api/v1/health"),
    apiHealth<JactariStatus>("/api/v1/jactari/status"),
    token ? privateApi<World[]>("/api/v1/me/worlds", token) : null,
  ]);
  const connected = health?.status === "ok" && engine?.engine === "Jactari";
  const loggedIn = Boolean(token && worlds?.ok);
  // A temporary API outage is not an expired login. Keep the HttpOnly
  // cookie untouched; only an explicit sign-out should remove it.
  const serviceUnavailable = Boolean(token && worlds && !worlds.ok &&
    worlds.status !== 401 && worlds.status !== 403);
  const accessForbidden = Boolean(token && worlds?.status === 403);
  const sessionRejected = Boolean(token && worlds?.status === 401);
  if (loggedIn && token) {
    return <GameShell token={token} title="Mes royaumes" eyebrow="PORTAIL · GUERRE DES LARMES"
      description="Votre domaine, vos cités et les chroniques du royaume.">
      <div className="panel-title"><span className="eyebrow">LES ROYAUMES</span>
        <h2>Mes mondes</h2></div>
      <div className="statusline" role="status"><span className={connected?"dot online":"dot offline"} />
        {connected?"API FastAPI joignable":"API momentanément inaccessible"}</div>
      <div className="tile-links">
        {worlds?.data?.map(world=><Link className="tile-link" key={world.world_id}
          href={"/worlds/"+encodeURIComponent(world.world_id)}>
          <span className="eyebrow">MONDE DISPONIBLE</span>
          <strong>{world.name}</strong><span>Carte {world.world_size} × {world.world_size}</span>
        </Link>)}
      </div>
      {!worlds?.data?.length&&<p>Votre compte ne possède pas encore de monde.</p>}
    </GameShell>;
  }
  return (
    <main className="shell">
      <header className="masthead">
        <span className="eyebrow">PROJET · GUERRE DES LARMES</span>
        <h1>MMHK-like</h1>
        <p className="intro">Les premiers territoires du royaume.</p>
      </header>
      <section className="panel mmhk-entry-panel" aria-labelledby="worlds-heading">
        <div className="panel-title">
          <span className="eyebrow">FONDATIONS · PREMIER MONDE PERSISTANT</span>
          <h2 id="worlds-heading">{serviceUnavailable ? "Service momentanément indisponible" :
            accessForbidden ? "Accès au royaume refusé" : "Accéder au royaume"}</h2>
        </div>
        <div className="mmhk-entry-portal">
          <div className="mmhk-entry-controls">
        <div className="statusline" role="status">
          <span className={connected ? "dot online" : "dot offline"} />
          {serviceUnavailable ? "Service des royaumes momentanément inaccessible" :
            accessForbidden ? "Accès à vos mondes refusé" :
            connected ? "API FastAPI joignable" : "API momentanément inaccessible"}
        </div>
        {serviceUnavailable ? (
          <section className="mmhk-entry-recovery" data-testid="session-service-unavailable">
            <p className="error" role="alert">
              Le royaume ne répond pas actuellement. Votre session est conservée ;
              vous n’avez pas besoin de ressaisir votre mot de passe.
            </p>
            <p className="form-intro">Aucune cité ni ressource privée n’est affichée tant
              que le serveur ne peut pas confirmer votre accès. Réessayez une fois
              le service rétabli : cette action ne déclenche aucune opération de jeu.</p>
            <form action="/" method="get">
              <button type="submit" className="mmhk-entry-retry">
                Réessayer d’accéder au royaume
              </button>
            </form>
            <form action={signOut}>
              <button type="submit" className="mmhk-entry-signout">
                Se déconnecter volontairement
              </button>
            </form>
          </section>
        ) : accessForbidden ? (
          <section className="mmhk-entry-recovery" data-testid="session-access-forbidden">
            <p className="error" role="alert">
              Votre compte n’est pas autorisé à consulter les mondes de ce royaume.
            </p>
            <p className="form-intro">L’accès a été refusé par le serveur.
              Aucune donnée privée ne peut être affichée.</p>
            <form action={signOut}>
              <button type="submit" className="mmhk-entry-signout">
                Se déconnecter
              </button>
            </form>
          </section>
        ) : (
          <>
            <p className="form-intro">Connectez-vous avec un compte provisionné
              par l'administrateur de ce laboratoire.</p>
            {logout === "local" && <p className="error" role="alert"
                data-testid="logout-revocation-unconfirmed">
              Vous êtes déconnecté de ce navigateur, mais le serveur ne répondait pas :
              la révocation de votre session distante n’a pas pu être confirmée.
              Son jeton peut rester valide jusqu’à expiration.
            </p>}
            {logout === "confirmed" && <p role="status"
                className="construction-notice" data-testid="logout-revocation-confirmed">
              Déconnexion confirmée : votre session distante est fermée.
            </p>}
            {sessionRejected && <p className="error" role="alert">
              Votre session a expiré ou a été refusée. Connectez-vous de nouveau.</p>}
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
          </div>
          <aside className="mmhk-entry-landscape"
            aria-label="Illustration de la vallée du Havre">
            <div className="mmhk-entry-landscape-copy">
              <span className="eyebrow">AUX PORTES DU ROYAUME</span>
              <strong>Les terres du Havre</strong>
              <p>Retrouvez votre cité, vos héros et les frontières encore
                à explorer.</p>
            </div>
          </aside>
        </div>
        <p className="notice mmhk-entry-disclaimer">Version de développement : monde et ressources
          persistants, avec production économique expérimentale en local, sans combat PvP ni inscription
          publique. Moteur Jactari conservé comme référence historique.</p>
      </section>
      <footer>MMHK-like · Saison 2 recherchée · Prototype expérimental</footer>
    </main>
  );
}
