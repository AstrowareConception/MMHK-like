import Link from "next/link";
import { randomUUID } from "node:crypto";
import { notFound, redirect } from "next/navigation";
import { tradeCityResources } from "../../../actions";
import { GameShell } from "../../../../components/game-shell/game-shell";
import { MarketplacePanel } from "../../../../components/marketplace-panel";
import { CaravanPanel } from "../../../../components/caravan-panel";
import { privateApi, sessionToken, type CityDetail,
  type MerchantCatalog, type MerchantQuote, type MarketplaceCatalog,
  type CaravanCatalog } from "../../../../lib/server-api";

export const dynamic="force-dynamic";

const NAMES:Record<string,string>={
  gold:"or",wood:"bois",ore:"minerai",crystal:"cristal",
  gems:"gemmes",sulfur:"soufre",mercury:"mercure",
};
function name(code:string):string{return NAMES[code]??code;}
function amount(value:number):string{return value.toLocaleString("fr-FR");}

export default async function MarketPage({params,searchParams}:{
  params:Promise<{cityId:string}>;
  searchParams:Promise<{
    pay_resource?:string;receive_resource?:string;pay_amount?:string;
    trade?:string;offer?:string;convoy?:string;
    caravan_quote?:string;destination_city_id?:string;
    load_gold?:string;load_wood?:string;load_ore?:string;
    load_crystal?:string;load_gems?:string;load_sulfur?:string;load_mercury?:string;
  }>;
}){
  const {cityId}=await params;
  if(!/^[a-f0-9-]{36}$/i.test(cityId))notFound();
  const token=await sessionToken();
  if(!token)redirect("/");
  const [cityResponse,marketResponse,offerResponse,caravanResponse,query]=await Promise.all([
    privateApi<CityDetail>("/api/v1/me/cities/"+cityId,token),
    privateApi<MerchantCatalog>("/api/v1/me/cities/"+cityId+"/market",token),
    privateApi<MarketplaceCatalog>("/api/v1/me/cities/"+cityId+"/market/offers",token),
    privateApi<CaravanCatalog>("/api/v1/me/cities/"+cityId+"/caravans",token),
    searchParams,
  ]);
  if(cityResponse.status===401||marketResponse.status===401||offerResponse.status===401||
     caravanResponse.status===401)redirect("/");
  if(cityResponse.status===404||marketResponse.status===404||offerResponse.status===404||
     caravanResponse.status===404)notFound();
  if(!cityResponse.ok||!cityResponse.data)
    return <main className="shell"><p>La cité est momentanément inaccessible.</p>
      <Link href="/">Retour aux mondes</Link></main>;
  const city=cityResponse.data;
  const market=marketResponse.ok?marketResponse.data:undefined;
  const requested=[query.pay_resource,query.receive_resource,query.pay_amount]
    .some(x=>x!==undefined);
  const validQuery=typeof query.pay_resource==="string"&&
    typeof query.receive_resource==="string"&&
    typeof query.pay_amount==="string"&&query.pay_amount.length<=7&&
    Object.hasOwn(NAMES,query.pay_resource)&&Object.hasOwn(NAMES,query.receive_resource);
  const quoteResponse=requested && validQuery && market?.merchant_unlocked
    ? await privateApi<MerchantQuote>(
        "/api/v1/me/cities/"+cityId+"/market/quote?"+
        new URLSearchParams({pay_resource:query.pay_resource!,
          receive_resource:query.receive_resource!,
          pay_amount:query.pay_amount!}).toString(),token)
    : undefined;
  const quote=quoteResponse?.ok?quoteResponse.data:undefined;
  const orderId=quote?randomUUID():null;
  return <GameShell token={token} title={"Marché de "+city.name}
    eyebrow="CITÉ DU HAVRE · COMMERCE"
    description="Marchand, ventes et caravanes · contrats expérimentaux"
    worldId={city.world_id} cityId={cityId} stocks={city.stocks}>
    <div className="market-headline">
      <div><span className="eyebrow">REGISTRE DU COMMERCE</span>
        <h2>La halle des échanges</h2>
        <p>Les marchandises circulent dans les limites des stocks de votre cité.
          Les offres sont calculées par le serveur, jamais par le navigateur.</p>
      </div>
      <Link className="scene-action" href={"/cities/"+cityId+"?inspect=marketplace#city-inspector"}>
        Voir le bâtiment Marché
      </Link>
    </div>
    {query.trade==="ok"&&<p role="status" className="construction-notice">
      Échange confirmé : les deux stocks ont été modifiés ensemble. Consultez le registre ci-dessous.
    </p>}
    {query.trade==="conflict"&&<p role="alert" className="error">
      Échange refusé : devis expiré, marché fermé, ressources ou capacité insuffisantes.
      Obtenez un nouveau devis avant toute nouvelle tentative.
    </p>}
    {query.trade==="unavailable"&&<p role="alert" className="error">
      Confirmation incertaine : consultez votre registre avant de recommencer.
      Aucun nouvel ordre n'est automatiquement envoyé.
    </p>}
    {query.trade==="invalid"&&<p role="alert" className="error">
      Demande d'échange invalide : contrôlez les quantités.
    </p>}
    {!market?<p role="alert" className="error">
      Le registre marchand est momentanément inaccessible.
    </p>:<>
      <div className="market-service-grid" aria-label="Services du marché">
        <article className={"market-service "+(market.merchant_unlocked?"open":"locked")}>
          <span aria-hidden="true">⚖</span>
          <h3>Marchand</h3>
          <strong>{market.merchant_unlocked?"Disponible":"Bâtiment requis"}</strong>
          <p>Conversions immédiates avec devis, validation et journal de transactions.</p>
        </article>
        <article className={"market-service "+(offerResponse.data?.marketplace_unlocked?"open":"locked")}>
          <span aria-hidden="true">♜</span>
          <h3>Hôtel des ventes</h3>
          <strong>{offerResponse.data?.marketplace_unlocked?
            "Offres à prix fixe disponibles":"Service indisponible"}</strong>
          <p>Publication, achat et retrait de lots avec dépôt séquestre en laboratoire.
            Les enchères historiques ne sont pas encore reproduites.</p>
          <a href="#marketplace">Consulter les offres</a>
        </article>
        <article className={"market-service "+(caravanResponse.data?.marketplace_active&&
          caravanResponse.data?.transport_policy?"open":"locked")}>
          <span aria-hidden="true">♞</span>
          <h3>Caravanes</h3>
          <strong>{caravanResponse.data?.marketplace_active&&caravanResponse.data?.transport_policy?
            "Transport autorisé":"Transport verrouillé"}</strong>
          <p>Convois réels entre vos cités, chargement mixte et livraison par worker PostgreSQL.</p>
          <a href="#caravans">Préparer un convoi</a>
        </article>
      </div>
      {!market.merchant_unlocked?(
        <section className="market-locked">
          <h3>Le marché attend son ouverture</h3>
          <p>Construisez le Marché, puis attendez son achèvement effectif.
            Les simples plans et les chantiers en cours ne permettent aucun échange.</p>
          <Link href={"/cities/"+cityId+"?inspect=marketplace#city-inspector"}>
            Examiner les prérequis du Marché
          </Link>
        </section>
      ):<>
        <section className="merchant-offers" aria-label="Tarifs marchands du monde">
          <h3>Devis du marchand</h3>
          <p className="market-disclaimer">
            Taux du laboratoire définis par l'opérateur. Chaque conversion arrondit
            la quantité reçue à l'entier inférieur. Aucun taux MMHK saison 2 n'est certifié.
          </p>
          <div className="merchant-rate-grid">
            {market.rates.map(rate=>(
              <form method="get" action={"/cities/"+cityId+"/market"}
                className="merchant-rate" key={rate.pay_resource+"-"+rate.receive_resource}>
                <input type="hidden" name="pay_resource" value={rate.pay_resource}/>
                <input type="hidden" name="receive_resource" value={rate.receive_resource}/>
                <strong>{name(rate.pay_resource)} contre {name(rate.receive_resource)}</strong>
                <small>Taux : {rate.numerator} / {rate.denominator} · {rate.policy_id}</small>
                <label>Quantité de {name(rate.pay_resource)} à céder
                  <input type="number" name="pay_amount" min="1" max="1000000"
                    defaultValue="6" required/>
                </label>
                <button type="submit">Obtenir un devis</button>
              </form>
            ))}
          </div>
          {market.rates.length===0&&<p>Aucun taux autorisé n'a été configuré
            par l'opérateur pour ce monde.</p>}
        </section>
        {requested&&<section id="market-quote" className="merchant-quote" aria-live="polite">
          <h3>Devis de conversion</h3>
          {!quote?<p role="alert">
            Impossible d'établir ce devis : paire indisponible, quantité invalide
            ou trop faible pour produire une unité. Choisissez une proposition autorisée.
          </p>:<>
            <div className="merchant-quote-figures">
              <div><span>Vous cédez</span><strong>{amount(quote.pay_amount)} {name(quote.pay_resource)}</strong>
                <small>Stock actuel : {amount(quote.current_pay_stock)}</small>
              </div>
              <span aria-hidden="true">→</span>
              <div><span>Vous recevez</span><strong>{amount(quote.receive_amount)} {name(quote.receive_resource)}</strong>
                <small>Stock actuel : {amount(quote.current_receive_stock)}</small>
              </div>
            </div>
            <p>Après validation : {quote.expected_pay_balance===null?"stock débiteur insuffisant":
              amount(quote.expected_pay_balance)+" "+name(quote.pay_resource)}
              {" "}· {quote.expected_receive_balance===null?"capacité de stockage insuffisante":
                amount(quote.expected_receive_balance)+" "+name(quote.receive_resource)}.</p>
            <p className="market-disclaimer">
              Politique {quote.policy_id}. La confirmation revérifie le taux,
              vos réserves et votre capacité de stockage dans PostgreSQL.
            </p>
            <form action={tradeCityResources} className="merchant-confirm-form">
              <input type="hidden" name="cityId" value={cityId}/>
              <input type="hidden" name="orderId" value={orderId??""}/>
              <input type="hidden" name="payResource" value={quote.pay_resource}/>
              <input type="hidden" name="receiveResource" value={quote.receive_resource}/>
              <input type="hidden" name="payAmount" value={quote.pay_amount}/>
              <input type="hidden" name="expectedReceive" value={quote.receive_amount}/>
              <input type="hidden" name="expectedNumerator" value={quote.numerator}/>
              <input type="hidden" name="expectedDenominator" value={quote.denominator}/>
              <input type="hidden" name="policyId" value={quote.policy_id}/>
              <button type="submit" disabled={!quote.can_execute}>
                {quote.can_execute?"Confirmer cet échange":!quote.affordable?
                  "Ressources insuffisantes":"Capacité insuffisante"}
              </button>
            </form>
            <p className="market-disclaimer">
              Identifiant de règlement unique pour cette confirmation. Un double clic
              ne doit jamais générer un second paiement.
            </p>
          </>}
        </section>}
      </>}
      <MarketplacePanel cityId={cityId} catalog={offerResponse.ok?offerResponse.data:undefined}
        stocks={city.stocks} notice={query.offer}/>
      <CaravanPanel cityId={cityId} token={token}
        catalog={caravanResponse.ok?caravanResponse.data:undefined}
        stocks={city.stocks} query={query}/>
      <section className="merchant-ledger" id="market-ledger" aria-label="Registre des échanges">
        <h3>Transactions enregistrées</h3>
        {market.history.length?(
          <ol>{market.history.map(row=>(
            <li className="merchant-ledger-row" data-testid="market-history-row" key={row.order_id}>
              <strong>{amount(row.pay_amount)} {name(row.pay_resource)} vers
                {" "}{amount(row.receive_amount)} {name(row.receive_resource)}</strong>
              <span>{new Date(row.completed_at).toLocaleString("fr-FR",
                {timeZone:"Europe/Paris"})}</span>
              <small>Contrat : {row.policy_id} · taux conservé :
                {" "}{row.numerator} / {row.denominator}</small>
            </li>
          ))}</ol>
        ):<p>Aucune transaction n'a été enregistrée pour cette cité.</p>}
      </section>
    </>}
    <p className="notice">
      Marchand local opérationnel uniquement lorsque le bâtiment est actif.
      Offres à prix fixe expérimentales disponibles selon les droits du monde ;
      enchères historiques et caravanes alliées ou répétées ne sont pas encore actives.
      <Link href={"/cities/"+cityId}> Retourner dans la cité.</Link>
    </p>
  </GameShell>;
}
