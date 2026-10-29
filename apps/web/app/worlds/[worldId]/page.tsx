import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { GameShell } from "../../../components/game-shell/game-shell";
import { WorldAtlas } from "../../../components/world-atlas";
import { privateApi, sessionToken, type WorldOverview, type CityDetail,
  type ColonizationCatalog, type InfluenceSummary } from "../../../lib/server-api";

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
  const currentCity=world.cities[0];
  const [details,colonyResponse,influenceResponse]=await Promise.all([
    Promise.all(world.cities.map(c=>
      privateApi<CityDetail>("/api/v1/me/cities/"+encodeURIComponent(c.city_id),token))),
    privateApi<ColonizationCatalog>(
      "/api/v1/me/worlds/"+encodeURIComponent(worldId)+"/colonization",token),
    privateApi<InfluenceSummary>(
      "/api/v1/me/worlds/"+encodeURIComponent(worldId)+"/influence",token),
  ]);
  const cityDetail=details[0];
  const cityModels=world.cities.map((c,i)=>{
    const result=details[i];
    return {city:c,detail:result?.ok?result.data:undefined};
  });
  const colonies=colonyResponse.ok?colonyResponse.data:undefined;
  const territory=influenceResponse.ok?influenceResponse.data:undefined;
  return (
    <GameShell token={token} title={world.name}
      eyebrow="ROYAUME · CARTE DU MONDE"
      description={"Carte torique de "+world.world_size+" × "+world.world_size+" régions"}
      worldId={world.world_id} cityId={currentCity?.city_id}
      stocks={cityDetail?.ok?cityDetail.data?.stocks:undefined}>
        <WorldAtlas world={world} cities={world.cities}/>

        <section className="realm-influence-summary" aria-label="Rayons d'influence territoriale">
          <div className="realm-influence-head">
            <div>
              <span className="eyebrow">DOMINATION · TERRITOIRE</span>
              <h2>Influence de mes cités</h2>
              <p>La carte indique uniquement les cases dont la visibilité vous
                est autorisée. Les zones contestées n'impliquent aucun droit
                d'alliance, siège ou transfert de propriété d'une ville.</p>
            </div>
            <div className="realm-influence-stat">
              <strong>{territory?.enabled?
                territory.owned_cells.toLocaleString("fr-FR"):"—"}</strong>
              <small>cases d'influence calculée sous votre contrôle</small>
            </div>
          </div>
          {!territory?<p>Le calcul d'influence est momentanément inaccessible.</p>:
          !territory.enabled?<p>Le modèle territorial dynamique n'est pas encore
            activé dans ce monde. Seules les cases explicitement qualifiées
            par l'opérateur sont utilisées.</p>:<>
            <p className="notice">Profil expérimental : {territory.policy_id} ·
              moyenne militaire sur {territory.lookback_days} jours ·
              révision n° {territory.revision} ·
              {territory.last_refresh_at?
                " dernière projection "+new Date(territory.last_refresh_at).toLocaleString("fr-FR"):
                " première projection non encore calculée"}.
              La loi d'atténuation inverse-carré et l'absence d'alliances ne sont
              pas des règles MMHK S2 certifiées.</p>
            <div className="realm-influence-cities">
              {territory.cities.map(c=><article key={c.city_id}>
                <strong>{c.name}</strong>
                <span>{c.radius===null?"Pas de puissance mesurée":
                  "Rayon "+c.radius+" case(s)"}</span>
                <small>Domination militaire moyenne : {c.military_average??"Non mesurée"}</small>
                <small>Apport des bâtiments déclaré : {c.building_domination??"Non mesuré"}</small>
                <small>Jours de mesure : {c.sample_days}/4</small>
              </article>)}
            </div>
            <p>Les mesures militaires et les apports des bâtiments doivent avoir
              une provenance réelle ou être configurés comme données
              expérimentales. Aucun point de puissance n'est inventé
              automatiquement à partir du nombre de soldats.</p>
          </>}
        </section>
        <section className="world-expansion-entry" aria-label="Colonisation et protection">
          <div>
            <span className="eyebrow">INFLUENCE · COLONISATION</span>
            <h2>Développer votre royaume</h2>
            <p>{colonies?.newbie_protected?
              "Votre protection débutant reste active pendant sept jours. Il est impossible d'acquérir une deuxième cité avant son échéance.":
              "Préparez une expédition de fondation vers une région qualifiée de votre influence."}</p>
            {colonies&&<small>
              {colonies.owned_cities} cité(s) · {colonies.pending_expeditions} expédition(s)
              {" "}· {colonies.qualified_sites.length} site(s) qualifié(s)
              {colonies.newbie_protected?" · Protection jusqu'au "+
                new Date(colonies.protection_until).toLocaleDateString("fr-FR"):""}
            </small>}
          </div>
          <Link className="scene-action" href={"/worlds/"+worldId+"/colonize"}>
            Examiner les droits de colonisation
          </Link>
        </section>
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
                <Link href={`/cities/${city.city_id}/market#caravans`}>Caravanes</Link>
              </div>
            </div>
          ))}
        </div>
        {world.cities.length>1&&<section className="realm-treasury-summary"
          aria-label="Comparaison des réserves des cités">
          <h2>Réserves locales de mes cités</h2>
          <p>Chaque cité possède ses propres stocks et capacités.
            Ces montants ne constituent pas un portefeuille global et ne sont
            pas immédiatement utilisables depuis une autre ville.
            Préparez une caravane pour transférer vos ressources.</p>
          <div className="realm-stock-scroll">
            <table>
              <thead><tr>
                <th scope="col">Cité</th>
                <th scope="col">Or</th><th scope="col">Bois</th>
                <th scope="col">Minerai</th><th scope="col">Cristal</th>
                <th scope="col">Gemmes</th><th scope="col">Soufre</th>
                <th scope="col">Mercure</th>
                <th scope="col">Action</th>
              </tr></thead>
              <tbody>{cityModels.map(({city,detail})=><tr key={city.city_id}>
                <th scope="row">{city.name}</th>
                {(["gold","wood","ore","crystal","gems","sulfur","mercury"] as const)
                  .map(k=><td key={k}>
                    {detail?.stocks[k]!==undefined?
                      detail.stocks[k].toLocaleString("fr-FR"):"—"}
                  </td>)}
                <td><Link href={"/cities/"+city.city_id+"/market#caravans"}>
                  Caravanes</Link></td>
              </tr>)}</tbody>
            </table>
          </div>
        </section>}
        {world.cities.length === 0 && (
          <p>Vous ne possédez pas encore de ville dans ce monde.</p>
        )}
        <p className="notice">
          Cette carte n'affiche que vos propres villes. Les autres positions,
          le terrain et la reconnaissance ne sont pas disponibles dans cette tranche.
        </p>
    </GameShell>
  );
}
