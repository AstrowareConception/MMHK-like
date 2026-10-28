import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {moveCityArtifact} from "../../../actions";
import {HeroFormationEditor} from "../../../../components/hero-formation-editor";
import {GameShell} from "../../../../components/game-shell/game-shell";
import {privateApi,sessionToken,type ArtifactInventory,type ArtifactItem,
  type CityDetail,type CityForces,type HeroFormation} from "../../../../lib/server-api";
export const dynamic="force-dynamic";
const SLOTS:Record<string,string>={
  head:"Tête",neck:"Cou",chest:"Torse",weapon:"Arme",
  shield:"Bouclier",hands:"Mains",feet:"Pieds",ring:"Anneau"
};
type Hero=CityForces["heroes"][number];

function ArtifactCommand({cityId,artifact,operation,selectedHero,heroes,label}:{
  cityId:string;artifact:ArtifactItem;operation:"equip"|"unequip"|"to_reserve"|"to_bag"|"to_hero";
  selectedHero:Hero;heroes:Hero[];label:string;
}) {
  const choices=operation==="to_hero"?heroes.filter(h=>h.status==="idle"&&h.hero_id!==artifact.hero_id):
    operation==="to_bag"?heroes.filter(h=>h.status==="idle"):[];
  if((operation==="to_bag"||operation==="to_hero")&&!choices.length)return null;
  return <form action={moveCityArtifact} className="artifact-action">
    <input type="hidden" name="cityId" value={cityId}/>
    <input type="hidden" name="artifactId" value={artifact.artifact_id}/>
    <input type="hidden" name="returnHeroId" value={selectedHero.hero_id}/>
    <input type="hidden" name="operation" value={operation}/>
    {choices.length>0&&<select name="targetHeroId" aria-label={"Héros destinataire pour "+artifact.name}
      defaultValue={choices[0].hero_id}>
      {choices.map(hero=><option key={hero.hero_id} value={hero.hero_id}>{hero.name}</option>)}
    </select>}
    <button type="submit">{label}</button>
  </form>;
}

function ArtifactCard({item,cityId,hero,heroes}:{
  item:ArtifactItem;cityId:string;hero:Hero;heroes:Hero[];
}) {
  const effects=Object.entries(item.effects).map(([key,val])=>key+": "+String(val));
  const canMove=hero.status==="idle";
  return <article className="artifact-card" data-artifact-id={item.artifact_id}>
    <span className="artifact-gem" aria-hidden="true">◆</span>
    <div className="artifact-description">
      <strong>{item.name}</strong>
      <small>{SLOTS[item.slot]??item.slot} · Niveau {item.required_level}</small>
      <small>{effects.join(" · ")||"Effets non renseignés"} · {item.policy_id}</small>
      {item.location==="equipped"&&<span className="artifact-label">Équipé</span>}
    </div>
    {canMove&&<div className="artifact-commands">
      {item.location==="bag"&&<>
        <ArtifactCommand cityId={cityId} artifact={item} operation="equip" selectedHero={hero} heroes={heroes} label="Équiper"/>
        <ArtifactCommand cityId={cityId} artifact={item} operation="to_reserve" selectedHero={hero} heroes={heroes} label="Déposer"/>
      </>}
      {item.location==="equipped"&&
        <ArtifactCommand cityId={cityId} artifact={item} operation="unequip" selectedHero={hero} heroes={heroes} label="Déséquiper"/>}
      {item.location!=="reserve"&&<ArtifactCommand cityId={cityId} artifact={item}
        operation="to_hero" selectedHero={hero} heroes={heroes} label="Transférer au héros"/>}
    </div>}
    {item.location==="reserve"&&<ArtifactCommand cityId={cityId} artifact={item}
      operation="to_bag" selectedHero={hero} heroes={heroes} label="Confier à un héros"/>}
  </article>;
}

export default async function HeroesPage({params,searchParams}:{
  params:Promise<{cityId:string}>;searchParams:Promise<{hero?:string;artifact?:string;formation?:string}>;
}) {
  const {cityId}=await params,query=await searchParams;
  const token=await sessionToken();
  if(!token)redirect("/");
  if(!/^[0-9a-f-]{36}$/i.test(cityId))notFound();
  const [cityR,forcesR,artR]=await Promise.all([
    privateApi<CityDetail>("/api/v1/me/cities/"+cityId,token),
    privateApi<CityForces>("/api/v1/me/cities/"+cityId+"/forces",token),
    privateApi<ArtifactInventory>("/api/v1/me/cities/"+cityId+"/artifacts",token)
  ]);
  if(cityR.status===401||forcesR.status===401||artR.status===401)redirect("/");
  if(cityR.status===404||forcesR.status===404||artR.status===404)notFound();
  const city=cityR.data,forces=forcesR.data,inventory=artR.data;
  if(!city||!forces||!inventory)return <main className="shell">
    <p>Le registre des héros est momentanément inaccessible.</p>
    <Link href={"/cities/"+cityId}>Retour à la cité</Link>
  </main>;
  const selected=forces.heroes.find(h=>h.hero_id===query.hero)??forces.heroes[0];
  const formationAnswer=selected
    ?await privateApi<HeroFormation>("/api/v1/me/cities/"+cityId+"/heroes/"+
      selected.hero_id+"/formation",token)
    :null;

  const equipment=inventory.artifacts.filter(a=>a.hero_id===selected?.hero_id&&a.location==="equipped");
  const bag=inventory.artifacts.filter(a=>a.hero_id===selected?.hero_id&&a.location==="bag");
  const reserve=inventory.artifacts.filter(a=>a.location==="reserve");
  const spent=equipment.reduce((sum,a)=>sum+a.required_level,0);
  const slots=inventory.slots.length?inventory.slots:Object.keys(SLOTS);
  return <GameShell token={token} title="Héros et équipement" eyebrow="ROYAUME · FICHES DES HÉROS"
    description={"Commandement de "+city.name+" · équipement, armées et réserve"}
    cityId={cityId} worldId={city.world_id} stocks={city.stocks}>
    <nav className="city-shortcuts" aria-label="Sections de la ville">
      <Link href={"/cities/"+cityId}>Ville</Link>
      <Link href={"/cities/"+cityId+"/forces"}>Garnison et recrutement</Link>
      <Link href={"/cities/"+cityId+"/region"}>Région</Link>
    </nav>
    {query.artifact&&<p role={query.artifact==="ok"?"status":"alert"}
      className={query.artifact==="ok"?"construction-notice":"error"}>
      {query.artifact==="ok"?"Artefact déplacé : les inventaires ont été mis à jour.":
        "Action refusée : vérifiez la disponibilité, le budget et l'emplacement d'équipement."}</p>}
    {!selected?<p>Vous ne disposez d'aucun héros dans cette cité.</p>:<div className="hero-management">
      <aside className="hero-pick-list">
        <h2>Mes héros</h2>
        {forces.heroes.map(h=><Link key={h.hero_id}
          className={"hero-pick "+(h.hero_id===selected.hero_id?"selected":"")}
          href={"/cities/"+cityId+"/heroes?hero="+h.hero_id}>
          <span className="hero-pick-crest" aria-hidden="true">{h.archetype==="magic"?"✧":"♞"}</span>
          <span><strong>{h.name}</strong><small>Niveau {h.level} · {h.status==="idle"?"À la cité":h.status}</small></span>
        </Link>)}
        <div className="hero-explanation">
          <strong>Gestion des artefacts</strong>
          <p>Chaque pièce est unique. Vous pouvez la déplacer entre deux héros présents dans la même cité, ou utiliser la réserve commune.</p>
        </div>
      </aside>
      <div className="hero-workspace">
        <div className="hero-workspace-header">
          <div><span className="eyebrow">FICHE DU HÉROS</span><h2>{selected.name}</h2>
            <p>{selected.archetype==="magic"?"Voie de la Magie":"Voie de la Force"}
              {" · Niveau "+selected.level+" · "+selected.experience+" expérience"}</p></div>
          <div className="hero-workspace-badge" aria-hidden="true">{selected.archetype==="magic"?"✧":"♞"}</div>
        </div>
        <div className="hero-budget">
          <strong>Budget d'équipement expérimental</strong>
          <span>{spent} / {selected.level} niveaux</span>
          <meter min="0" max={Math.max(1,selected.level)} value={Math.min(selected.level,spent)}/>
        </div>
        <h3>Équipement — huit emplacements</h3>
        <div className="equipment-slots">
          {slots.map(slot=>{
            const item=equipment.find(a=>a.equipped_slot===slot);
            return <div key={slot} className={"equipment-slot "+(item?"filled":"")}>
              <span className="equipment-slot-name">{SLOTS[slot]??slot}</span>
              {item?<ArtifactCard item={item} cityId={cityId} hero={selected} heroes={forces.heroes}/>:
                <span className="empty-equipment">Emplacement libre</span>}
            </div>;
          })}
        </div>
        <h3>Sac de {selected.name} <small>{bag.length} objet(s)</small></h3>
        <div className="artifact-list">
          {bag.length?bag.map(item=><ArtifactCard key={item.artifact_id} item={item}
            cityId={cityId} hero={selected} heroes={forces.heroes}/>):
            <p className="military-muted">Le sac de ce héros est vide.</p>}
        </div>
        <h3>Réserve de la cité <small>{reserve.length} objet(s)</small></h3>
        <div className="artifact-list">
          {reserve.length?reserve.map(item=><ArtifactCard key={item.artifact_id} item={item}
            cityId={cityId} hero={selected} heroes={forces.heroes}/>):
            <p className="military-muted">La réserve ne possède aucun artefact.</p>}
        </div>
        {query.formation&&<p role={query.formation==="ok"?"status":"alert"}
          className={query.formation==="ok"?"construction-notice":"error"}>
          {query.formation==="ok"?"Formation de combat enregistrée sans modifier les effectifs.":
            "Formation refusée : vérifiez les sept positions, les quantités ou la disponibilité du héros."}
        </p>}
        {formationAnswer?.ok&&formationAnswer.data&&
          <HeroFormationEditor key={selected.hero_id} cityId={cityId}
            formation={formationAnswer.data}/>}
        <div className="hero-army-summary">
          <h3>Armée portée</h3>
          {forces.hero_armies.filter(u=>u.hero_id===selected.hero_id).map(u=>
            <p key={u.unit_code}>{u.name} : {u.quantity}</p>)}
          <Link href={"/cities/"+cityId+"/forces"}>Gérer les troupes et la garnison</Link>
        </div>
        <p className="notice">Les propriétés et restrictions historiques des artefacts sont encore à qualifier.
          Les effets affichés sont descriptifs et ne sont pas appliqués aux combats.
          Aucun transfert instantané entre cités différentes n'est autorisé.</p>
      </div>
    </div>}
  </GameShell>;
}
