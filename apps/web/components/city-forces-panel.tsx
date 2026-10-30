import {hireCityHero,recruitCityUnits} from "../app/actions";
import {TroopDeploymentBoard} from "./troop-deployment-board";
import {HeritagePortrait,HeritageUnitArt} from "./heritage-art";
import {GameQuantity} from "./game-ui/game-quantity";
import type {CityForces} from "../lib/server-api";
import Link from "next/link";

const money=(value:number)=>value.toLocaleString("fr-FR");
const ART:Record<string,string>={
  militia:"/themes/public-safe/haven-militia.svg",
  archers:"/themes/public-safe/haven-archer.svg"
};

export function CityForcesPanel({cityId,forces,message,visuals}:{
  cityId:string;forces:CityForces|null;
  message:{hero?:string;recruit?:string;transfer?:string};
  visuals:{portrait:{might:string;magic:string};
    portraitSheet:string|null;unitSheet:string|null;
    garrison:string|null;tavern:string|null};
}) {
  function status(kind:"hero"|"recruit",value?:string){
    if(!value)return null;
    return <p role={value==="ok"?"status":"alert"}
      className={value==="ok"?"construction-notice":"error"}>{
        value==="ok"?(kind==="hero"?
          "Héros engagé : il figure désormais dans votre royaume.":
          "Recrutement confirmé. La garnison et les stocks ont été mis à jour."):
        value==="conflict"?(kind==="hero"?
          "Offre non disponible, limite atteinte ou or insuffisant.":
          "Recrutement refusé : caserne, réserves ou recrues insuffisantes."):
        "Ordre non confirmé : vérifiez vos effectifs avant une nouvelle tentative."
      }</p>;
  }
  return <section className="military-panel mmhk-military-panel mmhk-heritage-armies" id="military-panel"
    data-testid="heritage-garrison">
    <header className="military-panel-heading mmhk-war-banner">
      <div><span className="eyebrow">LE HALL DES ARMÉES · HAVRE</span>
        <h2>Gestion des armées</h2>
        <p>Organisez les pelotons et le commandement de votre royaume.
          Les cartes correspondent à vos véritables effectifs.</p>
        <Link href={"/cities/"+cityId+"/heroes"} className="scene-action">
          Ouvrir les fiches de héros et leurs artefacts
        </Link>
      </div>
      <div className="mmhk-war-emblem" aria-hidden="true">⚔</div>
    </header>
    {!forces?<p className="error">Le registre de la garnison n'est pas disponible.</p>:<>
      {message.transfer&&<p className={message.transfer==="ok"?"construction-notice":"error"}
        role={message.transfer==="ok"?"status":"alert"}>
        {message.transfer==="ok"?
          "Transfert confirmé : les effectifs sont conservés et la formation a été réinitialisée.":
          "Transfert non confirmé : effectifs insuffisants ou héros indisponible."}
      </p>}
      {status("hero",message.hero)}
      {status("recruit",message.recruit)}
      <TroopDeploymentBoard cityId={cityId} forces={forces}
        portrait={visuals.portrait} portraitSheet={visuals.portraitSheet}
        unitSheet={visuals.unitSheet} backdrop={visuals.garrison}/>
      <div className="mmhk-military-market">
        <section className="military-wing mmhk-recruit-hall">
          <header>
            <span className="eyebrow">LES DEMEURES</span>
            <h3>Recruter les troupes</h3>
            <p>Les recrues disponibles sont des effectifs réels à acheter,
              pas des soldats déjà présents dans la garnison.</p>
          </header>
          <div className="mmhk-recruit-list">
            {forces.recruitment.map(unit=><form key={unit.unit_code}
              className="unit-recruit-offer mmhk-recruit-card"
              action={recruitCityUnits}>
              <input type="hidden" name="cityId" value={cityId}/>
              <input type="hidden" name="unitCode" value={unit.unit_code}/>
              <div className="mmhk-recruit-unit-art">
                <HeritageUnitArt unitCode={unit.unit_code} sheet={visuals.unitSheet}
                  fallback={ART[unit.unit_code]} scale={1.25}/>
              </div>
              <div className="unit-recruit-info">
                <strong>{unit.name}</strong>
                <span>Rang {unit.tier} · {money(unit.available)} recrues</span>
                <small>{unit.unlocked?"Demeure opérationnelle":
                  "Construire : "+unit.dwelling_code}</small>
                <small>Coût par recrue : {Object.entries(unit.unit_costs)
                  .filter(([,v])=>v>0).map(([name,count])=>money(count)+" "+name).join(" · ")}</small>
              </div>
              <div className="mmhk-recruit-action">
                <GameQuantity label="Quantité" name="quantity" allowMaximum
                  max={Math.max(1,Math.min(unit.available,1000))} initial={1}
                  disabled={!unit.unlocked||unit.available===0}/>
                <button type="submit" disabled={!unit.unlocked||unit.available===0}>Recruter</button>
              </div>
            </form>)}
          </div>
          {!forces.recruitment.length&&
            <p className="mmhk-empty-room">Aucune réserve de recrutement dans cette cité.</p>}
        </section>
        <section className="military-wing mmhk-tavern-hall"
          style={visuals.tavern?{backgroundImage:
            "linear-gradient(#101b23dd,#101b23ee),url("+JSON.stringify(visuals.tavern)+")"}:undefined}>
          <header><span className="eyebrow">LA TAVERNE</span>
            <h3>Rencontrer des compagnons</h3>
            <p>Offres limitées et payantes. Le héros rejoindra réellement
              votre cité après confirmation de l'engagement.</p></header>
          {!forces.tavern_unlocked&&<p className="mmhk-locked-tavern">
            Construisez la Taverne pour engager de nouveaux héros.</p>}
          <div className="mmhk-tavern-offers">{forces.hero_offers.map(offer=>
            <form key={offer.offer_id} action={hireCityHero}
              className="hero-offer mmhk-tavern-offer">
              <input type="hidden" name="cityId" value={cityId}/>
              <input type="hidden" name="offerId" value={offer.offer_id}/>
              <HeritagePortrait heroId={offer.offer_id} archetype={offer.archetype}
                sheet={visuals.portraitSheet} fallback={visuals.portrait[offer.archetype]}/>
              <div><strong>{offer.name}</strong>
                <small>{offer.archetype==="might"?"Voie de la Force":"Voie de la Magie"}
                  {" "}· Candidat de laboratoire</small>
                <span>{money(offer.gold_cost)} or</span></div>
              <button type="submit" disabled={!forces.tavern_unlocked||
                forces.heroes.length>=forces.hero_capacity}>
                Engager
              </button>
            </form>)}</div>
          {forces.tavern_unlocked&&!forces.hero_offers.length&&
            <p className="mmhk-empty-room">Aucun héros disponible à la taverne pour le moment.</p>}
          <div className="mmhk-tavern-capacity">
            {forces.heroes.length}/{forces.hero_capacity} places de héros occupées
          </div>
        </section>
      </div>
      <p className="notice">Le prix des unités et les offres de héros sont
        des paramètres du monde expérimental, pas des règles MMHK S2 certifiées.
        Aucun effectif n'est créé lors d'un simple glisser-déposer.</p>
    </>}
  </section>;
}
