import Link from "next/link";
import {randomUUID} from "node:crypto";
import {notFound,redirect} from "next/navigation";
import {GameShell} from "../../../../components/game-shell/game-shell";
import {LiveRefresh} from "../../../../components/live-refresh";
import {dispatchFoundingExpedition,reclaimFailedFounding} from "../../../actions";
import {privateApi,sessionToken,type ColonizationCatalog,
  type ColonizationQuote,type CityDetail} from "../../../../lib/server-api";

export const dynamic="force-dynamic";
const RESOURCES=[
  ["gold","Or"],["wood","Bois"],["ore","Minerai"],
  ["crystal","Cristal"],["gems","Gemmes"],["sulfur","Soufre"],
  ["mercury","Mercure"],
] as const;
const fmt=(value:number)=>value.toLocaleString("fr-FR");
const at=(time:string)=>new Date(time).toLocaleString("fr-FR",{timeZone:"Europe/Paris"});
const feedback:Record<string,string>={
  started:"Expédition enregistrée : le héros est mobilisé et les ressources sont réservées. Le worker confirmera la fondation à l'échéance.",
  conflict:"Fondation refusée : protection débutant, ressource insuffisante, emplacement, héros, droit ou devis devenu invalide.",
  unavailable:"Résultat incertain : consultez le journal avant toute nouvelle tentative. Aucun nouvel ordre n'est envoyé automatiquement.",
  invalid:"Les coordonnées ou le nom de la colonie sont invalides.",
  refunded:"Les ressources d'une expédition bloquée ont été restituées une seule fois.",
  storage:"Restitution refusée : libérez de la capacité de stockage dans la cité d'origine, puis redemandez le remboursement.",
};
const reasons:Record<string,string>={
  newbie_protection:"La protection de sept jours interdit de fonder une deuxième cité.",
  city_cap:"Le nombre de cités et d'expéditions simultanées a atteint la limite de ce monde.",
  hero_busy:"Le héros est actuellement indisponible.",
  resources:"La cité d'origine ne possède pas toutes les ressources nécessaires.",
};
const stage:Record<string,string>={
  traveling:"En marche vers l'emplacement réservé",
  founded:"Cité fondée et opérationnelle",
  blocked:"Expédition interrompue, ressources conservées en réserve",
  refunded:"Ressources restituées",
};

export default async function ColonizePage({params,searchParams}:{
  params:Promise<{worldId:string}>;
  searchParams:Promise<{x?:string;y?:string;plot?:string;source?:string;hero?:string;colony?:string}>;
}){
  const {worldId}=await params;
  if(!/^[a-z0-9_-]{1,64}$/.test(worldId))notFound();
  const token=await sessionToken();
  if(!token)redirect("/");
  const [catalogResponse,query]=await Promise.all([
    privateApi<ColonizationCatalog>(
      "/api/v1/me/worlds/"+encodeURIComponent(worldId)+"/colonization",token),
    searchParams,
  ]);
  if(catalogResponse.status===401)redirect("/");
  if(catalogResponse.status===404)notFound();
  if(!catalogResponse.ok||!catalogResponse.data)
    return <main className="shell"><p>Les droits de colonisation sont momentanément indisponibles.</p>
      <Link href={"/worlds/"+worldId}>Revenir au monde</Link></main>;
  const colony=catalogResponse.data;
  const selectedSite=colony.qualified_sites.find(s=>
    (String(s.x)===query.x&&String(s.y)===query.y) ||
    query.plot===String(s.x)+":"+String(s.y)
  )??colony.qualified_sites[0];
  const sourceCity=colony.cities.find(c=>c.city_id===query.source)??colony.cities[0];
  const founder=colony.heroes.find(h=>h.hero_id===query.hero&&
    h.city_id===sourceCity?.city_id) ??
    colony.heroes.find(h=>h.city_id===sourceCity?.city_id&&h.status==="idle") ??
    colony.heroes.find(h=>h.city_id===sourceCity?.city_id);
  const canQuote=Boolean(selectedSite&&sourceCity&&founder&&colony.colonization_policy);
  const quoteResponse=canQuote?await privateApi<ColonizationQuote>(
    "/api/v1/me/worlds/"+encodeURIComponent(worldId)+"/colonization/quote?"+
    new URLSearchParams({
      source_city_id:sourceCity!.city_id,hero_id:founder!.hero_id,
      x:String(selectedSite!.x),y:String(selectedSite!.y),
    }).toString(),token):undefined;
  const quote=quoteResponse?.ok?quoteResponse.data:undefined;
  const sourceResponse=sourceCity?await privateApi<CityDetail>(
    "/api/v1/me/cities/"+sourceCity.city_id,token):undefined;
  const costs=quote?.applied_costs??colony.colonization_policy?.costs;
  const locked=colony.newbie_protected;
  const pending=colony.expeditions.some(e=>e.status==="traveling");
  return <GameShell token={token} title="Fonder une nouvelle cité"
    eyebrow="EXPLORATION · INFLUENCE · EXPANSION"
    description="Colonisation sécurisée, protections et expéditions suivies par le serveur"
    worldId={worldId} cityId={sourceCity?.city_id}
    stocks={sourceResponse?.ok?sourceResponse.data?.stocks:undefined}>
    <nav className="city-shortcuts" aria-label="Navigation de l'expansion">
      <Link href={"/worlds/"+worldId}>Carte du monde</Link>
      {sourceCity&&<Link href={"/cities/"+sourceCity.city_id}>Cité d'origine</Link>}
      <a href="#colony-form">Préparer l'expédition</a>
      <a href="#colony-orders">Journal des fondations</a>
    </nav>
    <section className="colony-intro">
      <h2>Établir une nouvelle colonie</h2>
      <p>Choisissez une région placée sous votre <strong>influence propre attestée</strong>.
        L'emplacement doit avoir été qualifié par le monde : aucun terrain, aucune
        mine et aucune position d'adversaire ne sont inventés par le navigateur.</p>
      <p>Un héros disponible mène l'expédition et revient ensuite à son point
        de départ. La nouvelle ville possède des stocks et des mines indépendants ;
        elle ne reçoit aucun bâtiment, soldat ou héros supplémentaire gratuit.
        Selon la configuration du monde, elle peut recevoir un catalogue
        de recrues à acheter après construction des demeures et des offres
        payantes de taverne.</p>
    </section>
    <div className="colony-rules">
      <article>
        <span className="eyebrow">PROTECTION DÉBUTANT</span>
        <strong>{locked?"Protégé · deuxième ville interdite":"Période initiale terminée"}</strong>
        <small>Protection non annulable de 7 jours. Échéance :
          {" "}{at(colony.protection_until)}</small>
      </article>
      <article>
        <span className="eyebrow">DROITS DU ROYAUME</span>
        <strong>{colony.owned_cities} cités · {colony.pending_expeditions} expédition(s)</strong>
        <small>Plafond de laboratoire : {colony.colonization_policy?.max_owned_cities??"Non configuré"}.
          Les expéditions en cours comptent dans cette limite.</small>
      </article>
      <article>
        <span className="eyebrow">DOMAINE AUTORISÉ</span>
        <strong>{colony.qualified_sites.length} emplacement(s) qualifié(s)</strong>
        <small>Emplacements prouvés par les profils de monde et leurs droits
          d'influence ; les contrôles sont réexécutés à chaque départ et arrivée.</small>
      </article>
    </div>
    {query.colony&&Object.prototype.hasOwnProperty.call(feedback,query.colony)&&
      <p role={["started","refunded"].includes(query.colony)?"status":"alert"}
        className={["started","refunded"].includes(query.colony)?
          "construction-notice":"error"}>{feedback[query.colony]}</p>}
    <section className="colony-preparation" id="colony-form"
      aria-label="Préparation d'une expédition">
      <h3>Choix de l'emplacement et du fondateur</h3>
      {!colony.colonization_policy?<p className="error">
        Aucun profil de colonisation n'est activé dans ce monde. Les règles
        historiques non qualifiées ne sont pas remplacées par un tarif supposé.</p>:null}
      {colony.qualified_sites.length===0?<p className="colony-locked">
        Aucune région possédée et validée pour la colonisation n'est disponible.
        Explorez votre monde : seules les cases d'influence et les sites
        explicitement enregistrés permettent une fondation.
      </p>:null}
      {colony.cities.length>0&&colony.qualified_sites.length>0&&
      <form method="get" className="colony-selector"
        action={"/worlds/"+worldId+"/colonize"}>
        <label>Région admissible
          <select name="plot" defaultValue={selectedSite?
            String(selectedSite.x)+":"+String(selectedSite.y):""}>
            {colony.qualified_sites.map(p=><option key={p.x+":"+p.y} value={p.x+":"+p.y}>
              Région ({p.x}, {p.y}) · mines déclarées : {p.mine_types.join(", ")}
              {p.qualification==="terrain_registry"?" · terrain qualifié":""}
            </option>)}
          </select>
        </label>

        <label>Cité d'origine
          <select name="source" defaultValue={sourceCity?.city_id}>
            {colony.cities.map(c=><option key={c.city_id} value={c.city_id}>
              {c.name} ({c.x}, {c.y})
            </option>)}
          </select>
        </label>
        <label>Héros fondateur
          <select name="hero" defaultValue={founder?.hero_id??""}>
            {colony.heroes.map(h=><option key={h.hero_id} value={h.hero_id}>
              {h.name} · {colony.cities.find(c=>c.city_id===h.city_id)?.name??"Cité"} ·
              {" "}{h.status==="idle"?"disponible":"occupé"}
            </option>)}
          </select>
        </label>
        <button type="submit">Examiner l'emplacement</button>
      </form>}
      {colony.qualified_sites.length>0&&
      <div className="colony-site-list" aria-label="Emplacements qualifiés">
        {colony.qualified_sites.map(p=><Link
          key={p.x+":"+p.y} href={"/worlds/"+worldId+"/colonize?"+
            new URLSearchParams({x:String(p.x),y:String(p.y)}).toString()+"#colony-form"}
          className={p.x===selectedSite?.x&&p.y===selectedSite?.y?"selected":""}>
          ◇ ({p.x}, {p.y})
        </Link>)}
      </div>}
      {quote?<div className="colony-quote">
        <h3>Devis serveur — {selectedSite?.x}, {selectedSite?.y}</h3>
        <p>Terrain qualifié par : <strong>{quote.site_qualification==="terrain_registry"?
          "registre indépendant de l'influence":"ancien profil opérateur territorial"}</strong>.
          La domination réelle reste obligatoire jusqu'à l'arrivée.</p>
        <p>Contrat : <strong>{quote.policy_id}</strong> ·
          distance torique : <strong>{quote.distance_steps} case(s)</strong> ·
          durée d'expédition : <strong>{quote.travel_seconds} secondes</strong>.</p>
        {costs&&<div className="colony-cost-grid">
          {RESOURCES.map(([code,label])=><div key={code}>
            <span>{label}</span>
            <strong>{fmt(costs[code]??0)}</strong>
            <small>Réserve actuelle : {fmt(sourceResponse?.data?.stocks[code]??0)}</small>
          </div>)}
        </div>}
        {quote.blocking_reasons.length>0&&<div className="colony-blockers">
          {quote.blocking_reasons.map(r=><p key={r}>• {reasons[r]??r}</p>)}
        </div>}
        <form action={dispatchFoundingExpedition} className="colony-confirm">
          <input type="hidden" name="worldId" value={worldId}/>
          <input type="hidden" name="sourceCityId" value={quote.source_city_id}/>
          <input type="hidden" name="heroId" value={quote.hero_id}/>
          <input type="hidden" name="orderId" value={randomUUID()}/>
          <input type="hidden" name="policyId" value={quote.policy_id}/>
          <input type="hidden" name="x" value={quote.x}/>
          <input type="hidden" name="y" value={quote.y}/>
          <label>Nom de la nouvelle cité
            <input name="colonyName" type="text" maxLength={80} minLength={2}
              defaultValue={"Colonie ("+quote.x+", "+quote.y+")"} required/>
          </label>
          <button type="submit" disabled={!quote.can_start}>
            {quote.can_start?"Engager le héros et réserver les ressources":
              "Colonisation interdite ou indisponible"}
          </button>
        </form>
        <p className="market-disclaimer">La confirmation revérifie la protection,
          l'influence, les stocks et la disponibilité du héros dans une unique
          transaction PostgreSQL. Le devis ne réserve aucune ressource.</p>
      </div>:colony.qualified_sites.length>0&&
      <p className="colony-locked">Aucun devis admissible pour la sélection :
        sélectionnez un héros de votre cité et une case autorisée et libre.</p>}
    </section>
    <section className="colony-orders" id="colony-orders"
      aria-label="Journal des expéditions">
      <h3>Expéditions et nouvelles cités</h3>
      {colony.expeditions.length?(
        <ol>{colony.expeditions.map(o=><li key={o.order_id}
          data-testid="colonization-order" className="colony-order">
          <div>
            <strong>{o.colony_name} · ({o.x}, {o.y})</strong>
            <small>{stage[o.status]??o.status}</small>
            <small>Coût réservé : {Object.entries(o.applied_costs).filter(([,v])=>v>0)
              .map(([k,v])=>fmt(v)+" "+k).join(" · ")}</small>
            <small>Fondation confiée à {o.hero_name??"un héros"} ·
              départ : {o.source_city_name??"votre cité"}</small>
            <small>Expédition : {at(o.started_at)} · arrivée prévue {at(o.due_at)}</small>
            {(o.events??[]).length>0&&<ol className="colony-event-history"
              aria-label={"Événements de "+o.colony_name}>
              {(o.events??[]).map(e=><li key={e.phase}>
                {e.phase==="departed"?"Héros parti":e.phase==="founded"?
                  "Cité fondée":e.phase==="blocked"?"Expédition bloquée":
                  "Ressources restituées"} · {at(e.occurred_at)}
              </li>)}
            </ol>}
            {o.completed_at&&<small>Fondation confirmée : {at(o.completed_at)}</small>}
            {o.blocked_reason&&<small>Blocage : emplacement ou droit
              modifié pendant le trajet. Les ressources sont en attente de restitution.</small>}
          </div>
          <div className="colony-order-actions">
            {o.status==="founded"&&o.new_city_id&&<Link
              href={"/cities/"+o.new_city_id}>Entrer dans la cité fondée</Link>}
            {o.status==="blocked"&&<form action={reclaimFailedFounding}>
              <input type="hidden" name="worldId" value={worldId}/>
              <input type="hidden" name="orderId" value={o.order_id}/>
              <input type="hidden" name="refundOrderId" value={randomUUID()}/>
              <button type="submit">Restituer le dépôt</button>
            </form>}
          </div>
        </li>)}</ol>
      ):<p>Aucune expédition n'a encore été engagée.</p>}
    </section>
    {pending&&<LiveRefresh intervalSeconds={10}/>}
    <p className="market-disclaimer">
      Les coûts, trajets, profils de mine et plafonds proviennent de politiques
      expérimentales versionnées. Le classement Richesse, les extensions hors
      influence et les règles MMHK saison 2 restent à reconstituer.
      La protection débutant de sept jours ne peut être désactivée par un joueur.
    </p>
  </GameShell>;
}
