type Health = { status: string; service: string };
type JactariStatus = {
  engine: string;
  python_port_scope: string;
  js_oracle_retained: boolean;
  historically_certified_s2: boolean;
  public_battle_api_enabled: boolean;
};

// Server-side fetch: the internal FastAPI URL is never exposed to the browser.
async function apiJson<T>(pathname: string): Promise<T | null> {
  const base = process.env.MMHK_API_INTERNAL_URL ?? "http://127.0.0.1:8000";
  try {
    const result = await fetch(new URL(pathname, base), {
      cache: "no-store",
      signal: AbortSignal.timeout(2000),
    });
    return result.ok ? ((await result.json()) as T) : null;
  } catch {
    return null;
  }
}

export const dynamic = "force-dynamic";

export default async function Home() {
  const [health, jactari] = await Promise.all([
    apiJson<Health>("/api/v1/health"),
    apiJson<JactariStatus>("/api/v1/jactari/status"),
  ]);
  const connected =
    health?.status === "ok" &&
    health.service === "mmhk-api" &&
    jactari?.engine === "Jactari";

  return (
    <main className="shell">
      <header className="masthead">
        <span className="eyebrow">PROJET · GUERRE DES LARMES</span>
        <h1>MMHK-like</h1>
        <p className="intro">Les fondations du prochain royaume.</p>
      </header>
      <section className="panel" aria-labelledby="status-heading">
        <div className="panel-title">
          <span className="eyebrow">ARCHITECTURE · TRANCHE 1</span>
          <h2 id="status-heading">État des services</h2>
        </div>
        <div className="statusline" role="status">
          <span className={connected ? "dot online" : "dot offline"} />
          {connected
            ? "API FastAPI joignable depuis Next.js"
            : "API non joignable depuis le serveur Next.js"}
        </div>
        <div className="tiles">
          <article>
            <span className="tile-title">Interface</span>
            <strong>Next.js / React</strong>
            <p>Première page exécutée avec l’App Router.</p>
          </article>
          <article>
            <span className="tile-title">API</span>
            <strong>Python / FastAPI</strong>
            <p>Contrat de santé REST côté serveur.</p>
          </article>
          <article>
            <span className="tile-title">Moteur</span>
            <strong>Jactari</strong>
            <p>
              {jactari?.js_oracle_retained
                ? "Référence JavaScript préservée."
                : "Moteur historique non connecté."}
            </p>
          </article>
        </div>
        <p className="notice">
          Ce site est une fondation technique, pas encore un jeu jouable.
          Aucun combat PvP public, compte joueur ou moteur économique n’est activé.
        </p>
      </section>
      <footer>Projet expérimental · conformité MMHK saison 2 non certifiée</footer>
    </main>
  );
}
