import {randomUUID} from "node:crypto";
import {sendCityCaravan,createCityCaravanProgram,
  stopCityCaravanProgram} from "../app/actions";
import {privateApi,type CaravanCatalog,type CaravanQuote} from "../lib/server-api";
import {LiveRefresh} from "./live-refresh";

const RESOURCE_LIST=[
  ["gold","Or"],["wood","Bois"],["ore","Minerai"],["crystal","Cristal"],
  ["gems","Gemmes"],["sulfur","Soufre"],["mercury","Mercure"],
] as const;
const labels=Object.fromEntries(RESOURCE_LIST);
type Resource=typeof RESOURCE_LIST[number][0];
type CaravanQuery={
  caravan_quote?:string;destination_city_id?:string;
  load_gold?:string;load_wood?:string;load_ore?:string;
  load_crystal?:string;load_gems?:string;load_sulfur?:string;load_mercury?:string;
  convoy?:string;program?:string;
};
function format(n:number){return n.toLocaleString("fr-FR");}
function date(s:string){return new Date(s).toLocaleString("fr-FR",{timeZone:"Europe/Paris"});}
function contents(cargo:Record<string,number>){
  return RESOURCE_LIST.filter(([r])=>cargo[r]>0).map(([r,name])=>
    format(cargo[r])+" "+name.toLowerCase()).join(" · ");
}
function duration(seconds:number){
  const min=Math.ceil(seconds/60);
  return min>=60?(Math.floor(min/60)+" h "+(min%60)+" min"):min+" min";
}
const programStatus:Record<string,string>={
  active:"Actif · prochain départ prévu",
  waiting_stock:"En attente de ressources",
  paused:"Suspendu · nouvelle autorisation nécessaire",
  stopped:"Arrêté par le propriétaire",
  completed:"Tous les départs effectués",
};
const currentStatus:Record<string,string>={
  in_transit:"En route",returning:"Retour vers l'origine",
  awaiting_storage:"En dépôt à l'arrivée, stockage différé",
  delivered:"Livrée",returned:"Revenue à l'origine",
};

export async function CaravanPanel({cityId,token,catalog,stocks,query}:{
  cityId:string;token:string;catalog?:CaravanCatalog;
  stocks:Record<string,number>;query:CaravanQuery;
}){
  const tried=query.caravan_quote==="1";
  const cargo=Object.fromEntries(RESOURCE_LIST.map(([key])=>{
    const value=query[("load_"+key) as keyof CaravanQuery];
    return [key,typeof value==="string"?Number(value):0];
  })) as Record<Resource,number>;
  const cargoValid=RESOURCE_LIST.every(([key])=>{
    const value=query[("load_"+key) as keyof CaravanQuery];
    return value===undefined || (
      typeof value==="string" && /^\d{1,7}$/.test(value) &&
      Number.isSafeInteger(cargo[key]) && cargo[key]>=0 && cargo[key]<=1000000
    );
  });
  const dest=typeof query.destination_city_id==="string"?query.destination_city_id:"";
  const destValid=/^[a-f0-9-]{36}$/i.test(dest) &&
    catalog?.destinations.some(c=>c.city_id===dest);
  const valid=tried&&cargoValid&&destValid&&RESOURCE_LIST.some(([k])=>cargo[k]>0);
  const url=valid?"/api/v1/me/cities/"+cityId+"/caravans/quote?"+
    new URLSearchParams({
      destination_city_id:dest,
      ...Object.fromEntries(RESOURCE_LIST.map(([k])=>[k,String(cargo[k])])),
    }).toString():null;
  const quoteResponse=url?await privateApi<CaravanQuote>(url,token):null;
  const quote=quoteResponse?.ok?quoteResponse.data:null;
  const active=(catalog?.shipments.some(s=>
    s.status==="in_transit"||s.status==="returning"||s.status==="awaiting_storage")??false) ||
    (catalog?.programs.some(p=>p.status==="active"||p.status==="waiting_stock")??false);
  return <section id="caravans" className="caravan-panel" aria-labelledby="caravan-heading">
    <div className="caravan-heading">
      <span className="eyebrow">LOGISTIQUE · US-ECH-010 À 013</span>
      <h3 id="caravan-heading">Caravanes entre mes cités</h3>
      <p>Préparez un chargement mixte parmi les sept ressources, puis confiez-le
        au worker du royaume. Un ordre envoyé est réellement débité ; aucune
        ressource n'est créée ou livrée par la simple animation du navigateur.</p>
    </div>
    {query.program==="created"&&<p className="construction-notice" role="status">
      Programme enregistré. Le prochain passage du worker décidera du premier départ
      après revalidation des ressources. Aucun chargement futur n'a été réservé.</p>}
    {query.program==="stopped"&&<p className="construction-notice" role="status">
      Programme arrêté. Les caravanes déjà parties poursuivent leur trajet.</p>}
    {query.program==="conflict"&&<p className="error" role="alert">
      Programme refusé : politique, droits, capacité, délai ou état modifiés.
      Vérifiez les paramètres et consultez le registre.</p>}
    {query.program==="unavailable"&&<p className="error" role="alert">
      Confirmation incertaine : contrôlez le registre avant de créer un autre
      programme ou de répéter la commande.</p>}
    {query.program==="invalid"&&<p className="error" role="alert">
      Programme invalide : vérifiez le nombre total de départs, la cadence
      et les quantités de toutes les ressources.</p>}
    {query.convoy==="sent"&&<p className="construction-notice" role="status">
      Convoi enregistré et marchandises réservées. Son arrivée sera confirmée par le serveur.</p>}
    {query.convoy==="conflict"&&<p className="error" role="alert">
      Départ refusé : devis ou politique modifiés, charge excessive, destination non autorisée
      ou stocks insuffisants. Consultez un nouveau devis.</p>}
    {query.convoy==="invalid"&&<p className="error" role="alert">
      Formulaire de chargement invalide : vérifiez les sept quantités et la destination.</p>}
    {query.convoy==="unavailable"&&<p className="error" role="alert">
      Confirmation incertaine : vérifiez le journal avant un nouvel envoi.
      Le formulaire n'est jamais automatiquement rejoué.</p>}
    {!catalog?<p className="error" role="alert">Le registre des caravanes est momentanément inaccessible.</p>:<>
      <p className="caravan-limits">
        {catalog.transport_policy?
          <>Politique {catalog.transport_policy.policy_id} · capacité mixte
            {" "}{format(catalog.transport_policy.capacity_units)} unités de charge ·
            {" "}{catalog.transport_policy.seconds_per_tile} s par case torique</>
          :"Aucune politique de transport n'est encore activée dans ce monde."}
      </p>
      {!catalog.marketplace_active&&<p className="caravan-blocked">
        Le Marché de cette cité doit être construit et opérationnel pour envoyer des convois.</p>}
      {catalog.destinations.length===0&&<p className="caravan-blocked">
        Aucune autre cité que vous possédez dans ce monde n'est disponible.
        Le prototype ne permet pas de créer artificiellement une deuxième cité.
        Les transferts alliés restent désactivés tant que leurs droits ne sont pas établis.</p>}
      {catalog.transport_policy&&catalog.marketplace_active&&
       catalog.destinations.length>0&&
      <div className="caravan-layout">
        <form method="get" action={"/cities/"+cityId+"/market"} className="caravan-plan"
          data-testid="caravan-quote-form">
          <input type="hidden" name="caravan_quote" value="1"/>
          <h4>Préparer le chargement</h4>
          <label>Destination (l'une de vos cités)
            <select name="destination_city_id" defaultValue={destValid?dest:catalog.destinations[0].city_id}>
              {catalog.destinations.map(c=><option key={c.city_id} value={c.city_id}>
                {c.name} ({c.x}, {c.y})</option>)}
            </select>
          </label>
          <div className="caravan-cargo-grid">
            {RESOURCE_LIST.map(([key,label])=><label key={key}>
              <span>{label} <small>réserve : {format(stocks[key]??0)}</small></span>
              <input type="number" name={"load_"+key} min="0" max="1000000"
                defaultValue={tried&&cargoValid?cargo[key]:key==="wood"?2:0}
                required/>
            </label>)}
          </div>
          <button type="submit">Calculer la charge et le trajet</button>
        </form>
        <section className="caravan-quote-result" aria-label="Devis du chargement">
          <h4>Devis et autorisation</h4>
          {!tried?<p>Renseignez vos sept quantités et consultez la charge totale.
            Le poids de chaque ressource et la vitesse proviennent exclusivement du profil serveur.</p>:
          !quote?<p className="error" role="alert">
            Devis impossible : chargement vide, charge excessive, destination indisponible
            ou profil de transport non autorisé. Aucun stock n'a été modifié.</p>:<>
            <p>Destination : <strong>{quote.destination_name}</strong></p>
            <p>Charge mixte : <strong>{format(quote.load_units)} /
              {" "}{format(quote.capacity_units)}</strong></p>
            <p>Distance torique : {quote.distance_steps} cases ·
              durée estimée : {duration(quote.travel_seconds)}</p>
            <p>Marchandises : {contents(quote.cargo)}</p>
            {Object.keys(quote.missing_stocks).length>0&&<p className="error">
              Réserves insuffisantes : {Object.entries(quote.missing_stocks).map(
                ([k,v])=>format(v)+" "+(labels[k]??k)).join(" · ")} manquants.</p>}
            <form action={sendCityCaravan} className="caravan-confirm">
              <input type="hidden" name="cityId" value={cityId}/>
              <input type="hidden" name="destinationId" value={quote.destination_city_id}/>
              <input type="hidden" name="shipmentId" value={randomUUID()}/>
              <input type="hidden" name="policyId" value={quote.policy_id}/>
              {RESOURCE_LIST.map(([k])=><input key={k} type="hidden"
                name={"cargo_"+k} value={quote.cargo[k]}/>)}
              <button type="submit" disabled={!quote.can_send}>
                {quote.can_send?"Confirmer le départ du convoi":
                  "Marché inactif ou réserves insuffisantes"}
              </button>
            </form>
            <small>La capacité, les stocks et les droits sont revérifiés
              transactionnellement au départ. Ce devis ne réserve rien.</small>
            <div className="caravan-program-offer">
              <h4>Programmer plusieurs départs</h4>
              <p>Chaque départ sera une caravane indépendante. Un programme
                ne réserve <strong>aucun stock futur</strong> : le worker vérifie
                à chaque fois le Marché, les droits, le contrat et les réserves.</p>
              <form action={createCityCaravanProgram} data-testid="caravan-program-form">
                <input type="hidden" name="cityId" value={cityId}/>
                <input type="hidden" name="destinationId" value={quote.destination_city_id}/>
                <input type="hidden" name="programId" value={randomUUID()}/>
                <input type="hidden" name="policyId" value={quote.policy_id}/>
                {RESOURCE_LIST.map(([k])=><input key={k} type="hidden"
                  name={"cargo_"+k} value={quote.cargo[k]}/>)}
                <label>Nombre de départs au total
                  <select name="shipmentsTotal" defaultValue="2">
                    {[2,4,8,12].map(n=><option key={n} value={n}>{n} départs au total</option>)}
                  </select>
                </label>
                <label>Politique de quantité
                  <select name="quantityMode" defaultValue="exact">
                    <option value="exact">Quantité exacte · attendre si insuffisante</option>
                    <option value="available_up_to">Jusqu'au stock disponible (laboratoire)</option>
                  </select>
                </label>
                <label>Intervalle minimal entre deux départs
                  <select name="waitSeconds" defaultValue="60">
                    <option value="60">Sans attente supplémentaire · minimum lab 60 s</option>
                    <option value="120">2 minutes</option>
                    <option value="300">5 minutes</option>
                    <option value="900">15 minutes</option>
                    <option value="3600">1 heure</option>
                  </select>
                </label>
                <button type="submit" disabled={!quote.can_send}>
                  Enregistrer le programme de caravanes
                </button>
              </form>
              <small>« 4 fois » signifie ici 4 départs au total, et non 4
                répétitions après le premier. C'est une convention explicite du
                laboratoire, pas une règle historique confirmée.</small>
            </div>
          </>}
        </section>
      </div>}
      <section className="caravan-records" aria-label="Journal des caravanes">
        <h4>Mes convois et livraisons</h4>
        {catalog.shipments.length>0?
          <ol>{catalog.shipments.map(s=><li key={s.shipment_id}
            data-testid="caravan-record" className="caravan-record">
            <div>
              <strong>{s.source_name} → {s.destination_name}</strong>
              <small>{contents(s.cargo)}</small>
              <small>Départ : {date(s.dispatched_at)} ·
                durée contractuelle : {duration(s.travel_seconds)}</small>
              <small>{s.return_leg&&s.return_due_at?
                "Retour prévu : "+date(s.return_due_at):
                "Arrivée prévue : "+date(s.arrival_due_at)}</small>
              <small>Contrat : {s.policy_id} · charge {format(s.load_units)}</small>
              {s.program_id&&<small>Programme {s.program_id.slice(0,8)} ·
                départ n° {s.program_sequence}</small>}
            </div>
            <div className="caravan-record-status">
              <strong>{currentStatus[s.status]??s.status}</strong>
              {s.status==="awaiting_storage"&&<small>
                Les ressources restent protégées. Nouvelle vérification automatique à
                {" "}{s.next_attempt_at?date(s.next_attempt_at):"l'échéance serveur"}.
              </small>}
              {s.completed_at&&<small>Confirmé : {date(s.completed_at)}</small>}
            </div>
          </li>)}</ol>:
          <p>Aucune caravane n'est encore enregistrée pour cette cité.</p>}
      </section>
      <section className="caravan-programs" aria-label="Programmes de convois">
        <h4>Programmes de transport</h4>
        {(catalog.programs??[]).length>0?
          <ol>{catalog.programs.map(p=><li key={p.program_id}
            className="caravan-program" data-testid="caravan-program">
            <div>
              <strong>{p.shipments_sent} / {p.shipments_total} départs</strong>
              <small>Mode : {p.quantity_mode==="exact"?"Quantité exacte":
                "Plafonnée aux stocks disponibles"} · intervalle {duration(p.wait_seconds)}</small>
              <small>Chargement type : {contents(p.cargo_template)}</small>
              <small>{p.next_departure_at?
                "Prochaine tentative : "+date(p.next_departure_at):
                p.closed_at?"Clôturé : "+date(p.closed_at):
                "Aucun prochain départ"}</small>
              {p.status_reason&&<small>Motif : {p.status_reason==="insufficient_stock"?
                "Ressources insuffisantes, nouvelle vérification prévue":
                p.status_reason==="rights_market_or_policy_changed"?
                "Droits, Marché ou politique modifiés — aucun nouveau départ":
                p.status_reason==="dispatch_rejected"?
                "Départ refusé, révision nécessaire":
                "Programme arrêté"}</small>}
            </div>
            <div className="caravan-program-state">
              <strong>{programStatus[p.status]??p.status}</strong>
              {["active","waiting_stock","paused"].includes(p.status)&&
                <form action={stopCityCaravanProgram}>
                  <input type="hidden" name="cityId" value={cityId}/>
                  <input type="hidden" name="programId" value={p.program_id}/>
                  <input type="hidden" name="stopOrderId" value={randomUUID()}/>
                  <button type="submit">Arrêter les prochains départs</button>
                </form>}
            </div>
          </li>)}</ol>:
          <p>Aucun programme enregistré pour cette cité.</p>}
      </section>
      {active&&<LiveRefresh intervalSeconds={10}/>}
      <p className="market-disclaimer">
        Trajets non interceptables, transfert entre cités du même propriétaire uniquement.
        En cas de stockage saturé, le chargement reste en dépôt protégé jusqu'à sa livraison.
        Les délais, poids et capacités de cette tranche ne sont pas des données MMHK S2 certifiées.
        Les programmes répétitifs relèvent de conventions explicites de laboratoire,
        avec revalidation avant chaque départ. Les transferts alliés restent exclus.</p>
    </>}
  </section>;
}
