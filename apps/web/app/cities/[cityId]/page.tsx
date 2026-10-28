import Link from "next/link";
import { CityScene } from "../../../components/city-scene";
import { AssetImage } from "../../../components/asset-image";
import { LiveRefresh } from "../../../components/live-refresh";
import { CityForcesPanel } from "../../../components/city-forces-panel";
import { notFound, redirect } from "next/navigation";
import { startUrbanConstruction } from "../../actions";
import { GameShell } from "../../../components/game-shell/game-shell";
import { privateApi, sessionToken, type CityDetail, type ConstructionCatalog, type CityForces } from "../../../lib/server-api";

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
  searchParams: Promise<{ build?: string; recruit?:string; hero?:string;transfer?:string }>;
}) {
  const { cityId } = await params;
  const token = await sessionToken();
  if (!token) redirect("/");
  if (!/^[a-f0-9-]{36}$/i.test(cityId)) notFound();
  const [answer, buildingAnswer, forcesAnswer, query] = await Promise.all([
    privateApi<CityDetail>(
      `/api/v1/me/cities/${encodeURIComponent(cityId)}`, token,
    ),
    privateApi<ConstructionCatalog>(
      `/api/v1/me/cities/${encodeURIComponent(cityId)}/construction`, token,
    ),
    privateApi<CityForces>(`/api/v1/me/cities/${encodeURIComponent(cityId)}/forces`, token),
    searchParams,
  ]);
  if (answer.status === 401) redirect("/");
  if (answer.status === 404) notFound();
  if (!answer.ok || !answer.data)
    return <main className="shell"><p>La ville est momentanément inaccessible.</p>
      <Link href="/">Retour</Link></main>;
  const city = answer.data;
  return (
    <GameShell token={token} title={city.name}
      eyebrow="HAVRE · VUE DE LA CITÉ"
      description={"Région ("+city.x+", "+city.y+") · Édifices et trésorerie"}
      worldId={city.world_id} cityId={cityId} stocks={city.stocks}>
        <nav className="city-shortcuts" aria-label="Accès rapide à la cité">
          <a href="#city-scene">Panorama</a><a href="#city-resources">Ressources</a>
          <a href="#urban-construction">Chantiers</a><a href="#military-panel">Héros et armée</a>
        </nav>
        <CityScene city={city} catalog={buildingAnswer.data} />
        {(city.production_active || !!buildingAnswer.data?.active) && <LiveRefresh intervalSeconds={10} />}
        <h2 id="city-resources">Réserves de la ville</h2>
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
        <CityForcesPanel cityId={cityId} forces={forcesAnswer.ok?forcesAnswer.data??null:null}
          message={{hero:query.hero,recruit:query.recruit,transfer:query.transfer}} />
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
                  {buildingAnswer.data.options.slice()
                    .sort((a,b)=>Number(b.available)-Number(a.available) ||
                      a.building_code.localeCompare(b.building_code))
                    .map(o=>(
                      <article className={"building-plan "+(o.available?"can-build":"locked-build")}
                        key={o.building_code}>
                        <div className="building-plan-header">
                          <div>
                            <span className="eyebrow">{o.available?"PROJET DISPONIBLE":"PRÉREQUIS MANQUANTS"}</span>
                            <h3>{({
                              village_hall:"Hôtel du village",town_hall:"Hôtel de ville",
                              marketplace:"Marché",resource_silo:"Silos",tavern:"Taverne",
                              recruit_t1:"Demeure des miliciens",recruit_t2:"Demeure des archers",
                              fort:"Fortifications",blacksmith:"Forge",mage_guild:"Guilde des mages",
                              stables:"Écuries",watchtower:"Tour de guet",
                            } as Record<string,string>)[o.building_code]??o.building_code}</h3>
                            <small>Niveau {o.target_level} · Contrat {o.policy_id}</small>
                          </div>
                          <span className="building-plan-rank">NIV. {o.target_level}</span>
                        </div>
                        {!o.available&&<p className="building-blockers">
                          Nécessite : {o.missing_prerequisites.join(", ")}</p>}
                        <div className="building-plan-modes">
                          {o.modes.map(mode=><form action={startUrbanConstruction}
                            key={o.building_code+"-"+mode.mode} className="build-option">
                            <input type="hidden" name="cityId" value={cityId}/>
                            <input type="hidden" name="buildingCode" value={o.building_code}/>
                            <input type="hidden" name="mode" value={mode.mode}/>
                            <strong>{mode.mode==="normal"?"Standard":mode.mode==="rapid"?"Rapide":"Économique"}</strong>
                            <small>⏳ {Math.ceil(mode.duration_seconds/60)} min</small>
                            <small>Coût : {Object.entries(mode.costs)
                              .filter(([,value])=>value>0)
                              .map(([name,value])=>value.toLocaleString("fr-FR")+" "+name).join(" · ")||"Aucun"}</small>
                            <button type="submit" disabled={!o.available}>
                              {o.available?"Lancer ce chantier":"Construction verrouillée"}
                            </button>
                          </form>)}
                        </div>
                      </article>
                    ))}
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
    </GameShell>
  );
}
