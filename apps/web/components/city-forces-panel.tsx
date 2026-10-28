import {hireCityHero,recruitCityUnits} from "../app/actions";
import type {CityForces} from "../lib/server-api";

const money=(value:number)=>value.toLocaleString("fr-FR");
const UNIT_ART:Record<string,string>={militia:"/themes/public-safe/haven-militia.svg",archers:"/themes/public-safe/haven-archer.svg"};
const translations:Record<string,string>={idle:"À la cité",on_mission:"En mission",wounded:"Convalescence"};
export function CityForcesPanel({cityId,forces,message}:{cityId:string;
  forces:CityForces|null;message:{hero?:string;recruit?:string}}) {
  const state=(kind:"hero"|"recruit",status?:string)=>{
    if(!status)return null;
    const success=status==="ok";
    return <p className={success?"construction-notice":"error"}
      role={success?"status":"alert"}>
      {success?(kind==="hero"?"Héros engagé : il figure désormais dans votre royaume.":
        "Recrutement confirmé. La garnison et les stocks ont été mis à jour."):
        status==="conflict"?(kind==="hero"?"Offre non disponible, limite atteinte ou or insuffisant.":
        "Recrutement refusé : caserne, réserves ou recrues insuffisantes."):
        "L'ordre n'a pas pu être confirmé. Contrôlez les effectifs avant de réessayer."}
    </p>;
  };
  return <section className="military-panel" id="military-panel">
    <div className="military-panel-heading">
      <div><span className="eyebrow">FORCES DU ROYAUME · GARNISON &amp; TAVERNE</span>
        <h2>Armées et héros</h2>
        <p>Vos recrues, garnisons et compagnons sont enregistrés dans PostgreSQL.</p></div>
      <span className="military-side-tag">HAVRE · ÉTAPE EXPÉRIMENTALE</span>
    </div>
    {!forces?<p className="error">Le registre des héros et de la garnison est inaccessible.</p>:<>
      {state("hero",message.hero)}
      {state("recruit",message.recruit)}
      <div className="military-columns">
        <div className="military-wing">
          <h3>Les héros de la cité <small>{forces.heroes.length} / {forces.hero_capacity}</small></h3>
          <div className="hero-roster">
            {forces.heroes.map(hero=><article className="hero-profile" key={hero.hero_id}>
              <div className="hero-portrait" aria-hidden="true">
                <svg viewBox="0 0 80 90" width="70" height="76">
                  <defs><linearGradient id={"hero-grad-"+hero.hero_id} x2="0" y2="1">
                    <stop stopColor="#c7ab78"/><stop offset="1" stopColor="#4b5d66"/>
                  </linearGradient></defs>
                  <path d="M8 84Q12 55 39 54Q67 54 73 84Z" fill={hero.archetype==="magic"?"#426c82":"#6a5d54"} stroke="#e4c789" strokeWidth="2"/>
                  <ellipse cx="40" cy="34" rx="17" ry="21" fill="#d8b58f"/>
                  <path d="M19 36Q14 6 40 7Q63 3 62 34L51 20L29 21Z" fill={hero.archetype==="magic"?"#a9bbc7":"#65513f"}/>
                  <path d="M15 67L39 55 63 67" fill="none" stroke="#a99670" strokeWidth="3"/>
                  <circle cx="33" cy="33" r="2" fill="#554536"/><circle cx="46" cy="33" r="2" fill="#554536"/>
                  <path d="M35 44Q40 47 46 43" fill="none" stroke="#885e50" strokeWidth="2"/>
                </svg>
              </div>
              <div className="hero-profile-info">
                <strong>{hero.name}</strong>
                <small>{hero.archetype==="might"?"Voie de la Force":"Voie de la Magie"} · Niveau {hero.level}</small>
                <span>{translations[hero.status]??hero.status} · {money(hero.experience)} expérience</span>
              </div>
            </article>)}
            {!forces.heroes.length&&<p className="military-muted">Aucun héros n'est encore affecté à cette cité.</p>}
          </div>
          <h3>Taverne <small>{forces.tavern_unlocked?"Ouverte":"Fermée"}</small></h3>
          {!forces.tavern_unlocked&&<p className="military-muted">
            Construisez la taverne pour comparer et engager les héros proposés.</p>}
          {forces.hero_offers.map(offer=><form className="hero-offer" key={offer.offer_id}
            action={hireCityHero}>
            <input type="hidden" name="cityId" value={cityId}/>
            <input type="hidden" name="offerId" value={offer.offer_id}/>
            <div><strong>{offer.name}</strong>
              <small>{offer.archetype==="might"?"Force":"Magie"} · Profil expérimental</small></div>
            <button type="submit" disabled={forces.heroes.length>=forces.hero_capacity}>
              Engager · {money(offer.gold_cost)} or
            </button>
          </form>)}
          {forces.tavern_unlocked&&forces.hero_offers.length===0&&
            <p className="military-muted">Aucune offre disponible pour le moment.</p>}
        </div>
        <div className="military-wing">
          <h3>Garnison <small>{forces.garrison.reduce((sum,u)=>sum+u.quantity,0)} unités</small></h3>
          <div className="garrison-grid">
            {forces.garrison.map(troop=><article className="garrison-unit" key={troop.unit_code}>
              <div className="unit-emblem" aria-hidden="true">
                {UNIT_ART[troop.unit_code]?<img src={UNIT_ART[troop.unit_code]} width="42" height="42"
                  alt="" loading="lazy"/>:<span>{troop.tier===1?"⚔":"➶"}</span>}</div>
              <strong>{troop.name}</strong>
              <span>Tier {troop.tier} · {money(troop.quantity)} soldats</span>
            </article>)}
            {forces.garrison.length===0&&
              <p className="military-muted">La garnison ne comporte encore aucune unité.</p>}
          </div>
          <h3>Recrutement <small>Disponibilité réelle</small></h3>
          {forces.recruitment.map(unit=><form className="unit-recruit-offer"
            action={recruitCityUnits} key={unit.unit_code}>
            <input type="hidden" name="cityId" value={cityId}/>
            <input type="hidden" name="unitCode" value={unit.unit_code}/>
            <div className="unit-recruit-info">
              <div className="unit-recruit-title">
                {UNIT_ART[unit.unit_code]&&<img src={UNIT_ART[unit.unit_code]} alt="" width="42" height="42"/>}
                <strong>{unit.name}</strong>
              </div>
              <span>Tier {unit.tier} · {unit.available} recrues en réserve</span>
              <small>{unit.unlocked?"Demeure opérationnelle":
                "Bâtiment requis : "+unit.dwelling_code}</small>
              <small>Coût unitaire : {Object.entries(unit.unit_costs)
                .filter(([,value])=>value>0).map(([k,v])=>money(v)+" "+k).join(" · ")}</small>
            </div>
            <label>Quantité
              <input type="number" name="quantity" min="1"
                max={Math.max(1,Math.min(unit.available,1000))}
                defaultValue={Math.min(1,unit.available)} required
                disabled={!unit.unlocked||unit.available===0}/>
            </label>
            <button type="submit" disabled={!unit.unlocked||unit.available===0}>Recruter</button>
          </form>)}
          <p className="military-muted">
            Le stock de recrues du laboratoire est fini. Leur croissance et les
            files de recrutement historiques restent à intégrer.</p>
        </div>
      </div>
      <p className="notice">Aucun héros n'est encore entraîné ou envoyé en mission depuis cet écran.
        Le recrutement débite immédiatement les ressources, sans lancer de bataille
        Jactari fictive. Les coûts et limites sont ceux du laboratoire, pas des
        règles de saison 2 certifiées.</p>
    </>}
  </section>;
}
