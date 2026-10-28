import { randomUUID } from "node:crypto";
import { publishMarketplaceOffer, buyMarketplaceOffer,
  withdrawMarketplaceOffer } from "../app/actions";
import type { MarketplaceCatalog, MarketplaceOffer } from "../lib/server-api";

// Fully server-rendered: no stored bearer, no browser-computed price or authority.
const RESOURCES=[
  ["gold","Or"],["wood","Bois"],["ore","Minerai"],["crystal","Cristal"],
  ["gems","Gemmes"],["sulfur","Soufre"],["mercury","Mercure"],
] as const;
const NAMES=Object.fromEntries(RESOURCES);
function resource(code:string){return NAMES[code]??code;}
function count(n:number){return n.toLocaleString("fr-FR");}
function date(s:string){return new Date(s).toLocaleString("fr-FR",{timeZone:"Europe/Paris"});}
function status(o:MarketplaceOffer){
  return {active:"En vente",sold:"Vendu",expired:"Expiré",cancelled:"Retiré"}[o.status];
}
function ownAction(o:MarketplaceOffer){
  if(o.status==="active")return "Retirer l'offre";
  return o.escrow_claimed?"Lot récupéré":"Récupérer le lot en dépôt";
}

export function MarketplacePanel({cityId,catalog,stocks,notice}:{
  cityId:string;catalog?:MarketplaceCatalog;stocks:Record<string,number>;notice?:string;
}){
  const policy=catalog?.marketplace_policy;
  const durations=policy?
    [600,3600,21600,86400].filter(v=>v>=policy.min_duration_seconds&&
      v<=policy.max_duration_seconds):[];
  if(policy&&durations.length===0)durations.push(policy.min_duration_seconds);
  return <section className="marketplace-panel" id="marketplace"
    aria-labelledby="marketplace-heading">
    <div className="marketplace-heading">
      <div><span className="eyebrow">COMMERCE ENTRE JOUEURS · LABORATOIRE</span>
        <h3 id="marketplace-heading">Hôtel des ventes — offres à prix fixe</h3></div>
      <a href="#market-ledger">Registre du marchand</a>
    </div>
    <p>Les lots mis en vente sont réservés hors de la trésorerie du vendeur.
      Seuls les échanges d'un monde commun sont autorisés ; aucun joueur
      étranger ne peut acheter votre lot deux fois.</p>
    {notice==="published"&&<p className="construction-notice" role="status">
      Offre publiée : le lot est placé en dépôt et n'est plus dépensable.</p>}
    {notice==="bought"&&<p className="construction-notice" role="status">
      Achat confirmé : les deux cités ont été réglées dans une seule transaction.</p>}
    {notice==="recovered"&&<p className="construction-notice" role="status">
      Lot retiré et remis dans les réserves de votre cité.</p>}
    {notice==="stored"&&<p className="construction-notice" role="status">
      Offre retirée mais stocks pleins : le lot demeure protégé en entrepôt.
      Vous pourrez le récupérer dès que suffisamment d'espace sera libre.</p>}
    {notice==="conflict"&&<p className="error" role="alert">
      Opération refusée : lot expiré, stock insuffisant, entrepôt saturé,
      conditions modifiées ou offre déjà clôturée. Actualisez les offres.</p>}
    {notice==="unavailable"&&<p className="error" role="alert">
      Confirmation incertaine : consultez vos offres et réserves avant
      de réessayer ; aucun second ordre n'a été lancé automatiquement.</p>}
    {!catalog?<p role="alert" className="error">
      L'hôtel des ventes est momentanément inaccessible.</p>:<>
      {!catalog.marketplace_unlocked&&<p className="marketplace-locked">
        La publication et les achats exigent un Marché opérationnel et
        une politique commerciale autorisée pour ce monde. Les lots déjà
        réservés restent récupérables par leur propriétaire.</p>}
      {policy&&<p className="market-disclaimer">
        Politique : {policy.policy_id}. Prix fixes sans commissions, livraison
        immédiate expérimentale, unités entières. Aucune règle historique
        d'enchère, de transport ou de balance commerciale n'est certifiée.</p>}
      <div className="marketplace-columns">
        <div className="marketplace-wing">
          <h4>Offres disponibles dans votre monde</h4>
          {catalog.offers.map(o=><article className="marketplace-offer"
              data-testid="marketplace-public-offer" key={o.offer_id}>
            <strong>{count(o.quantity)} {resource(o.resource)}</strong>
            <span>Prix fixe : <b>{count(o.price_amount)} {resource(o.price_resource)}</b></span>
            <small>Fin de l'offre : {date(o.expires_at)}</small>
            <small>Règlement complet · provenance du vendeur non dévoilée</small>
            <form action={buyMarketplaceOffer}>
              <input type="hidden" name="cityId" value={cityId}/>
              <input type="hidden" name="offerId" value={o.offer_id}/>
              <input type="hidden" name="orderId" value={randomUUID()}/>
              <input type="hidden" name="resource" value={o.resource}/>
              <input type="hidden" name="quantity" value={o.quantity}/>
              <input type="hidden" name="priceResource" value={o.price_resource}/>
              <input type="hidden" name="priceAmount" value={o.price_amount}/>
              <button type="submit" disabled={!catalog.marketplace_unlocked}>
                Acheter le lot
              </button>
            </form>
          </article>)}
          {catalog.offers.length===0&&<p className="marketplace-empty">
            Aucune offre d'un autre joueur n'est disponible actuellement.
            Les ventes de votre propre cité figurent dans votre registre personnel.</p>}
        </div>
        <div className="marketplace-wing">
          <h4>Publier une offre</h4>
          {!policy?<p className="marketplace-empty">Aucune politique autorisée
            pour les nouveaux dépôts.</p>:
          <form action={publishMarketplaceOffer} className="marketplace-publish"
            data-testid="marketplace-publish">
            <input type="hidden" name="cityId" value={cityId}/>
            <input type="hidden" name="orderId" value={randomUUID()}/>
            <label>Marchandises
              <select name="resource" defaultValue="wood">
                {RESOURCES.map(([code,label])=><option value={code} key={code}>
                  {label} · stock : {count(stocks[code]??0)}
                </option>)}
              </select>
            </label>
            <label>Quantité mise en vente
              <input type="number" name="quantity" min="1" max={policy.max_quantity}
                defaultValue="4" required/>
            </label>
            <label>Ressource exigée en paiement
              <select name="priceResource" defaultValue="gold">
                {RESOURCES.map(([code,label])=><option value={code} key={code}>{label}</option>)}
              </select>
            </label>
            <label>Prix total du lot
              <input type="number" name="priceAmount" min="1"
                max={policy.max_price} defaultValue="6" required/>
            </label>
            <label>Durée de l'offre
              <select name="durationSeconds">
                {durations.map(seconds=><option key={seconds} value={seconds}>
                  {seconds>=3600?seconds/3600+" h":seconds/60+" min"}
                </option>)}
              </select>
            </label>
            <button type="submit" disabled={!catalog.marketplace_unlocked}>Publier et réserver le lot</button>
            <small>La ressource vendue et la ressource exigée doivent être différentes.
              Les marchandises quittent immédiatement le stock disponible. Prix
              et quantité du lot sont immuables après publication.</small>
          </form>}
        </div>
      </div>
      <section className="marketplace-my-offers" aria-label="Mes offres et dépôts">
        <h4>Mes offres et marchandises en dépôt</h4>
        {catalog.my_offers.map(o=><article className="marketplace-own-offer"
            data-testid="marketplace-my-offer" key={o.offer_id}>
          <div>
            <strong>{count(o.quantity)} {resource(o.resource)}</strong>
            {" "}contre {count(o.price_amount)} {resource(o.price_resource)}
            <small>{status(o)} · échéance {date(o.expires_at)}</small>
            {o.status==="cancelled"||o.status==="expired"?
              <small>{o.escrow_claimed?"Marchandises récupérées":
                "Lot conservé hors des stocks — restitution à demander"}</small>:null}
          </div>
          {o.can_withdraw&&<form action={withdrawMarketplaceOffer}>
            <input type="hidden" name="cityId" value={cityId}/>
            <input type="hidden" name="offerId" value={o.offer_id}/>
            <input type="hidden" name="orderId" value={randomUUID()}/>
            <button type="submit">{ownAction(o)}</button>
          </form>}
        </article>)}
        {catalog.my_offers.length===0&&<p className="marketplace-empty">
          Vous n'avez pas encore publié d'offre dans cette cité.</p>}
      </section>
    </>}
  </section>;
}
