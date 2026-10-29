import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {HeroEquipmentBoard} from "../../../../components/hero-equipment-board";
import {HeritagePortrait} from "../../../../components/heritage-art";
import {HeroFormationEditor} from "../../../../components/hero-formation-editor";
import {GameShell} from "../../../../components/game-shell/game-shell";
import {resolveAssetUrl} from "../../../../lib/assets/runtime";
import {privateApi,sessionToken,type ArtifactInventory,
  type CityDetail,type CityForces,type HeroFormation} from "../../../../lib/server-api";
export const dynamic="force-dynamic";

export default async function HeroesPage({params,searchParams}:{
  params:Promise<{cityId:string}>;
  searchParams:Promise<{hero?:string;artifact?:string;formation?:string}>;
}) {
  const {cityId}=await params,query=await searchParams;
  const token=await sessionToken();
  if(!token)redirect("/");
  if(!/^[0-9a-f-]{36}$/i.test(cityId))notFound();
  const [cityR,forcesR,artR]=await Promise.all([
    privateApi<CityDetail>("/api/v1/me/cities/"+cityId,token),
    privateApi<CityForces>("/api/v1/me/cities/"+cityId+"/forces",token),
    privateApi<ArtifactInventory>("/api/v1/me/cities/"+cityId+"/artifacts",token),
  ]);
  if(cityR.status===401||forcesR.status===401||artR.status===401)redirect("/");
  if(cityR.status===404||forcesR.status===404||artR.status===404)notFound();
  const city=cityR.data,forces=forcesR.data,inventory=artR.data;
  if(!city||!forces||!inventory)return <main className="shell">
    <p>Le registre des héros est momentanément inaccessible.</p>
    <Link href={"/cities/"+cityId}>Retour à la cité</Link>
  </main>;
  const selected=forces.heroes.find(h=>h.hero_id===query.hero)??forces.heroes[0];
  const formation=selected?await privateApi<HeroFormation>(
    "/api/v1/me/cities/"+cityId+"/heroes/"+selected.hero_id+"/formation",token):null;
  const portrait=(type:"might"|"magic")=>resolveAssetUrl(
    type==="magic"?"hero.portrait.magic":"hero.portrait.might");
  const portraitSheet=resolveAssetUrl("hero.sheet.haven");
  const unitSheet=resolveAssetUrl("army.sheet.haven");
  const gearSlots=Object.fromEntries(inventory.slots.map(slot=>[
    slot,resolveAssetUrl(("hero.slot."+slot) as "hero.slot.head")
  ]));
  return <GameShell token={token} title="Héros et équipement"
    eyebrow="ROYAUME · SALLE DES HÉROS"
    description={"Héros, armées et artefacts · "+city.name}
    cityId={cityId} worldId={city.world_id} stocks={city.stocks}>
    <nav className="city-shortcuts" aria-label="Sections de la ville">
      <Link href={"/cities/"+cityId}>Ville</Link>
      <Link href={"/cities/"+cityId+"/forces"}>Garnison et recrutement</Link>
      <Link href={"/cities/"+cityId+"/region"}>Région</Link>
    </nav>
    {query.artifact&&<p role={query.artifact==="ok"?"status":"alert"}
      className={query.artifact==="ok"?"construction-notice":"error"}>
      {query.artifact==="ok"?"Artefact déplacé : les inventaires ont été mis à jour.":
        "Action refusée : vérifiez le héros, le niveau et l'emplacement d'équipement."}
    </p>}
    {!selected?<section className="mmhk-no-hero">
      <h2>Aucun héros dans cette cité</h2>
      <p>Ouvrez la taverne pour engager votre premier compagnon.</p>
      <Link href={"/cities/"+cityId+"/forces"}>Aller à la taverne</Link>
    </section>:<div className="hero-management mmhk-hero-management mmhk-heritage-heroes" data-testid="heritage-heroes">
      <aside className="hero-pick-list mmhk-roster">
        <div className="mmhk-roster-heading"><small className="eyebrow">MES COMPAGNONS</small>
          <h2>Les héros</h2></div>
        {forces.heroes.map(h=><Link key={h.hero_id}
          href={"/cities/"+cityId+"/heroes?hero="+h.hero_id}
          aria-current={h.hero_id===selected.hero_id?"page":undefined}
          className={"hero-pick mmhk-roster-choice "+(h.hero_id===selected.hero_id?"selected":"")}>
          <HeritagePortrait heroId={h.hero_id} archetype={h.archetype}
            sheet={portraitSheet} fallback={portrait(h.archetype)??"/themes/public-safe/hero-vanguard.svg"}/>
          <span><strong>{h.name}</strong><small>Niveau {h.level} ·
            {" "}{h.status==="idle"?"Au château":h.status==="on_mission"?"En mission":h.status}</small>
          </span>
        </Link>)}
        <div className="hero-explanation">
          <strong>Héros de la cité</strong>
          <p>Choisissez un portrait pour consulter ses artefacts et préparer ses troupes.</p>
        </div>
      </aside>
      <div className="hero-workspace mmhk-hero-workspace">
        <nav className="hero-subnav mmhk-original-tabs" aria-label="Onglets de la gestion du héros">
          <a href="#hero-equipment" aria-current="page">Inventaire</a>
          <a href="#hero-formation">Formation</a>
          <a href="#hero-army">Armée</a>
          <span aria-label="Talents non encore disponibles">Talents · à venir</span>
          <span aria-label="Sorts non encore disponibles">Sorts · à venir</span>
        </nav>
        <div className="hero-workspace-header mmhk-hero-banner mmhk-heritage-title">
          <div><span className="eyebrow">SALLE DES HÉROS</span>
            <h2>{selected.name}</h2>
            <p>{selected.archetype==="magic"?"Voie de la Magie":"Voie de la Force"}
              {" · Niveau "+selected.level+" · "+selected.experience+" expérience"}</p>
          </div>
          <div className="mmhk-hero-seal" aria-hidden="true">
            {selected.archetype==="magic"?"✧":"⚜"}
          </div>
        </div>
        <HeroEquipmentBoard key={selected.hero_id} cityId={cityId} hero={selected}
          heroes={forces.heroes} inventory={inventory}
          art={{
            portrait:portrait(selected.archetype),
            portraitSheet,
            equipment:resolveAssetUrl("hero.background.haven"),
            frame:resolveAssetUrl("hero.frame"),
            backpack:resolveAssetUrl("hero.backpack"),
            artifactIcon:resolveAssetUrl("hero.artifact.icon"),
            slots:gearSlots,
          }}/>
        {query.formation&&<p role={query.formation==="ok"?"status":"alert"}
          className={query.formation==="ok"?"construction-notice":"error"}>
          {query.formation==="ok"?"Formation de combat enregistrée sans modifier les effectifs.":
            "Formation refusée : vérifiez les sept positions, les quantités ou la disponibilité du héros."}
        </p>}
        {formation?.ok&&formation.data&&
          <HeroFormationEditor key={selected.hero_id+"-formation"} cityId={cityId}
            formation={formation.data} sheet={unitSheet}/>}
        <div className="hero-army-summary mmhk-hero-army-summary" id="hero-army">
          <h3>Armée du héros</h3>
          {forces.hero_armies.filter(u=>u.hero_id===selected.hero_id).length?
            forces.hero_armies.filter(u=>u.hero_id===selected.hero_id).map(u=>
              <p key={u.unit_code}><span>⚔</span> {u.name} :
                {" "}<strong>{u.quantity.toLocaleString("fr-FR")}</strong></p>):
            <p>Aucun peloton actuellement confié à ce héros.</p>}
          <Link href={"/cities/"+cityId+"/forces"}>Ouvrir la salle de garnison</Link>
        </div>
        <p className="notice">Les propriétés historiques des artefacts restent à qualifier.
          Les déplacements sont persistés dans PostgreSQL ; les bonus d'artefacts
          ne modifient pas encore les combats Jactari.</p>
      </div>
    </div>}
  </GameShell>;
}
