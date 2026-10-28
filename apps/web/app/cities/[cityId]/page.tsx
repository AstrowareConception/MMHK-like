import Link from "next/link";
import { CityScene } from "../../../components/city-scene";
import { AssetImage } from "../../../components/asset-image";
import { LiveRefresh } from "../../../components/live-refresh";
import { notFound, redirect } from "next/navigation";
import { signOut, startUrbanConstruction } from "../../actions";
import { privateApi, sessionToken, type CityDetail, type ConstructionCatalog } from "../../../lib/server-api";

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
  searchParams,
}: {
  params: Promise<{ cityId: string }>;
  searchParams: Promise<{ build?: string }>;
}) {
  const { cityId } = await params;
  const token = await sessionToken();
  if (!token) redirect("/");
  if (!/^[a-f0-9-]{36}$/i.test(cityId)) notFound();
  const [answer, buildingAnswer, query] = await Promise.all([
    privateApi<CityDetail>(
      `/api/v1/me/cities/${encodeURIComponent(cityId)}`, token,
    ),
    privateApi<ConstructionCatalog>(
      `/api/v1/me/cities/${encodeURIComponent(cityId)}/construction`, token,
    ),
    searchParams,
  ]);
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
          <Link href="/">Mes mondes</Link>
          <Link href={`/worlds/${encodeURIComponent(city.world_id)}`}>Carte du monde</Link>
          <Link href={`/cities/${cityId}/region`}>Ma région</Link>
          <form action={signOut}><button type="submit">Déconnexion</button></form>
        </nav>
        <CityScene city={city} catalog={buildingAnswer.data} />
        {(city.production_active || !!buildingAnswer.data?.active) && <LiveRefresh intervalSeconds={10} />}
        <h2>Réserves de la ville</h2>
        <div className="resource-grid">
          {RESOURCES.map(([key, label]) => (
            <article key={key}>
              <span className="tile-title resource-heading"><AssetImage id={`resource.${key}`} className="resource-asset" />{label}</span>
              <strong>{(city.stocks[key] ?? 0).toLocaleString("fr-FR")}</strong>
              {city.stock_capacities[key] != null &&
                <small>Capacité effective : {city.stock_capacities[key]?.toLocaleString("fr-FR")}</small>}
              <small>{city.mines.includes(key) ? "Mine présente" : "Pas de mine initiale"}</small>
              {city.production_active && city.production_per_day[key] !== undefined && (
                <small>+{Number(city.production_per_day[key]).toLocaleString("fr-FR")} / jour (profil expérimental)</small>
              )}
            </article>
          ))}
        </div>
        <div className="construction-panel" id="urban-construction">
          <span className="eyebrow">CHANTIERS URBAINS · PROFILS EXPÉRIMENTAUX</span>
          <h2>Construire dans la cité</h2>
          {query.build === "started" && (
            <p role="status" className="construction-notice">Chantier enregistré et ressources payées.</p>
          )}
          {query.build === "conflict" && (
            <p role="alert" className="error">Construction impossible : ressources insuffisantes, chantier déjà actif ou profil indisponible.</p>
          )}
          {query.build === "unavailable" && (
            <p role="alert" className="error">Le chantier n'a pas pu être confirmé. Consultez son état avant de réessayer.</p>
          )}
          {buildingAnswer.ok && buildingAnswer.data ? (
            <>
              {buildingAnswer.data.buildings.length > 0 && (
                <p>Bâtiments terminés : {buildingAnswer.data.buildings.map(
                  (b) => `${b.building_code} niveau ${b.level} (${b.active ? "actif" : "inactif — prérequis indisponible"})`,
                ).join(", ")}.</p>
              )}
              {buildingAnswer.data.active ? (
                <article className="active-project">
                  <strong>{buildingAnswer.data.active.building_code} — niveau {buildingAnswer.data.active.target_level}</strong>
                  <p>En construction · fin prévue le {new Date(buildingAnswer.data.active.due_at).toLocaleString(
                    "fr-FR", {timeZone:"Europe/Paris"}
                  )}</p>
                  <small>Chantier payé au lancement. Aucun second chantier ni annulation n'est possible.</small>
                </article>
              ) : buildingAnswer.data.options.length ? (
                <div className="build-options">
                  {buildingAnswer.data.options.flatMap((o) => o.modes.map((mode) => (
                    <form action={startUrbanConstruction} key={`${o.building_code}-${mode.mode}`} className="build-option">
                      <input type="hidden" name="cityId" value={cityId}/>
                      <input type="hidden" name="buildingCode" value={o.building_code}/>
                      <input type="hidden" name="mode" value={mode.mode}/>
                      <strong>{o.building_code} · niveau {o.target_level}</strong>
                      <span>{mode.mode === "normal" ? "Standard" : mode.mode === "rapid" ? "Rapide" : "Économique"}</span>
                      <small>Durée : {mode.duration_seconds.toLocaleString("fr-FR")} secondes</small>
                      <small>Coût : {Object.entries(mode.costs).filter(([,v])=>v>0).map(([k,v])=>`${v} ${k}`).join(", ") || "Gratuit"}</small>
                      {!o.available && (
                        <small>Prérequises indisponibles : {o.missing_prerequisites.join(", ")}</small>
                      )}
                      <button disabled={!o.available} type="submit">
                        {o.available ? "Lancer ce chantier" : "Construction verrouillée"}
                      </button>
                    </form>
                  )))}
                </div>
              ) : (
                <p>Aucun bâtiment n'est proposé : l'opérateur n'a pas encore configuré de profil pour le prochain niveau.</p>
              )}
            </>
          ) : (
            <p>Les offres de construction sont momentanément indisponibles.</p>
          )}
          {Object.keys(buildingAnswer.data?.effects.mine_additive_bonus ?? {}).length > 0 && (
            <p>Bonus de mine actifs (additifs) : {Object.entries(
              buildingAnswer.data!.effects.mine_additive_bonus,
            ).map(([resource,value]) => `${resource} +${Number(value)*100} %`).join(", ")}.</p>
          )}
          <p className="notice">Une construction active par cité, débit immédiat et achèvement par worker PostgreSQL.
          La convention d'arrondi à l'entier supérieur est expérimentale, pas une règle historique certifiée.</p>
        </div>
        <p className="notice">
          {city.production_active
            ? <>Production expérimentale activée : crédits périodiques par worker
                PostgreSQL, à cadence explicitement définie par l’administrateur.
                {city.next_credit_at && (
                  <> Prochaine échéance serveur : {new Date(city.next_credit_at).toLocaleString("fr-FR", { timeZone: "Europe/Paris" })}.</>
                )}
              </>
            : <>Production inactive : l’administrateur n’a pas encore configuré
                les cadences et capacités de cette ville.</>}
          {" "}Les quatre mines initiales du Havre sont or, bois, minerai
          et cristal. Les quantités et cadences historiques restent à vérifier.
          Les stocks sont lus dans PostgreSQL, pas dans Redis.
        </p>
      </section>
    </main>
  );
}
