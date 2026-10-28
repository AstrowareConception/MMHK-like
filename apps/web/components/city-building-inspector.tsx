import Link from "next/link";
import { startUrbanConstruction } from "../app/actions";
import type { CityDetail, ConstructionCatalog } from "../lib/server-api";

const NAMES: Record<string,string> = {
  village_hall:"Hôtel du village",town_hall:"Hôtel de ville",
  marketplace:"Marché",resource_silo:"Silos",tavern:"Taverne",
  recruit_t1:"Demeure des miliciens",recruit_t2:"Demeure des archers",
  fort:"Fortifications",blacksmith:"Forge",mage_guild:"Guilde des mages",
  stables:"Écuries",watchtower:"Tour de guet",
};
const RESOURCES = [
  ["gold","or"],["wood","bois"],["ore","minerai"],["crystal","cristal"],
  ["gems","gemmes"],["sulfur","soufre"],["mercury","mercure"]
] as const;
export function buildingName(code:string):string{
  return Object.prototype.hasOwnProperty.call(NAMES,code)?NAMES[code]:code;
}

/** Selection is navigation only; owner-scoped records and payments stay on FastAPI. */
export function CityBuildingInspector({city,catalog,selectedBuilding}:{
  city:CityDetail;catalog?:ConstructionCatalog;selectedBuilding?:string;
}){
  const code=selectedBuilding && /^[a-z][a-z0-9_]{1,47}$/.test(selectedBuilding) &&
    catalog && (catalog.options.some(o=>o.building_code===selectedBuilding)||
      catalog.buildings.some(b=>b.building_code===selectedBuilding)||
      catalog.active?.building_code===selectedBuilding)
      ? selectedBuilding : null;
  const built=code?catalog?.buildings.find(b=>b.building_code===code):undefined;
  const next=code?catalog?.options.find(o=>o.building_code===code):undefined;
  const active=code && catalog?.active?.building_code===code?catalog.active:null;
  const records=code?(catalog?.history??[]).filter(h=>h.building_code===code).slice(0,3):[];
  return <section id="city-inspector" className="city-building-inspector"
    aria-label="Fiche du bâtiment sélectionné" data-selected-building={code??""}>
    {!selectedBuilding?<>
      <strong>Explorez les bâtiments du panorama</strong>
      <p>Cliquez sur un bâtiment ou un emplacement pour consulter son niveau,
        ses prérequis et ses devis, puis agir depuis cette fiche.</p>
    </>:!catalog?<>
      <strong>Le registre des bâtiments est momentanément indisponible.</strong>
    </>:!code?<>
      <strong>Ce bâtiment n'est pas accessible dans le catalogue de votre cité.</strong>
      <p><Link href={"/cities/"+city.city_id+"#city-scene"}>Retour au panorama</Link></p>
    </>:<>
      <div className="city-inspector-heading">
        <div><span className="eyebrow">FICHE URBAINE · ÉTAT RÉEL</span>
          <h3>{buildingName(code)}</h3>
          <p>{built?"Niveau "+built.level+" · "+(built.active?"opérationnel":"inactif"):
            active?"En construction":"Pas encore construit"}</p>
        </div>
        <Link href={"/cities/"+city.city_id+"#city-scene"}>Fermer la fiche</Link>
      </div>
      {built&&Object.keys(built.prerequisites).length>0&&
        <p>Prérequis du niveau actuel : {Object.entries(built.prerequisites)
          .map(([key,level])=>buildingName(key)+" niveau "+level).join(" · ")}.</p>}
      {active&&<p className="city-inspector-progress" role="status">
        Construction du niveau {active.target_level} · fin prévue le
        {" "}{new Date(active.due_at).toLocaleString("fr-FR",{timeZone:"Europe/Paris"})}.
        Coût déjà débité ; aucun second chantier possible.
      </p>}
      {next?<>
        <h4>Projet proposé : niveau {next.target_level}</h4>
        <p>Politique {next.policy_id} · devis de laboratoire non certifié saison 2.</p>
        {next.missing_prerequisites.length>0&&<p className="city-inspector-blocked">
          Prérequis manquants : {next.missing_prerequisites.map(buildingName).join(", ")}.</p>}
        {catalog.active&&!active&&<p className="city-inspector-blocked">
          Un autre chantier est en cours dans la cité : attendez son achèvement.</p>}
        <div className="city-inspector-quotes">
          {next.modes.map(mode=>{
            const lines=RESOURCES.filter(([resource])=>(mode.costs[resource]??0)>0);
            const canPay=lines.every(([resource])=>
              typeof city.stocks[resource]==="number"&&city.stocks[resource]>=mode.costs[resource]);
            const allowed=next.available&&!catalog.active&&canPay;
            return <form key={mode.mode} action={startUrbanConstruction}
              className="city-inspector-quote">
              <input type="hidden" name="cityId" value={city.city_id}/>
              <input type="hidden" name="buildingCode" value={code}/>
              <input type="hidden" name="mode" value={mode.mode}/>
              <strong>{mode.mode==="normal"?"Standard":mode.mode==="rapid"?"Rapide":"Économique"}</strong>
              <small>Durée : {Math.ceil(mode.duration_seconds/60)} min</small>
              <ul>
                {lines.length===0&&<li>Sans coût de ressources dans le profil de test</li>}
                {lines.map(([resource,label])=>{
                  const cost=mode.costs[resource];
                  const available=city.stocks[resource];
                  const deficit=typeof available==="number"?Math.max(0,cost-available):null;
                  return <li key={resource} className={deficit===0?"":"resource-shortage"}>
                    {cost.toLocaleString("fr-FR")} {label}
                    {deficit===null?" · stock inconnu":
                      deficit>0?" · manque "+deficit.toLocaleString("fr-FR"):" · disponible"}
                  </li>;
                })}
              </ul>
              <button type="submit" disabled={!allowed}>
                {allowed?"Lancer le chantier":!next.available?"Prérequis manquants":
                  catalog.active?"Un chantier est déjà actif":"Ressources insuffisantes"}
              </button>
            </form>;
          })}
        </div>
        <p className="city-inspector-disclaimer">FastAPI revérifie prérequis et stocks
          lors du paiement transactionnel. L'affichage ne réserve aucune ressource.</p>
      </>:!active&&<p>Aucun niveau supplémentaire n'est proposé dans le catalogue expérimental.</p>}
      {code==="village_hall"&&catalog.options.some(o=>o.building_code==="town_hall")&&
        <p>Administration : <Link href={"/cities/"+city.city_id+"?inspect=town_hall#city-inspector"}>
          examiner l'Hôtel de ville</Link>.</p>}
      {["recruit_t1","recruit_t2","tavern"].includes(code)&&
        <p><Link href={"/cities/"+city.city_id+"/forces"}>Accéder à la garnison et à la taverne</Link></p>}
      {code==="marketplace"&&
        <p><Link href={"/cities/"+city.city_id+"/market"}>Entrer dans le marché</Link></p>}
      {records.length>0&&<div className="city-inspector-past">
        <h4>Derniers travaux sur cet édifice</h4>
        <ul>{records.map(order=><li key={order.order_id}>
          Niveau {order.target_level} · {order.status==="completed"?"terminé":"en cours"}
        </li>)}</ul>
      </div>}
      <a href="#urban-construction" className="building-inspect-link">
        Voir le catalogue et l'historique complet
      </a>
    </>}
  </section>;
}
