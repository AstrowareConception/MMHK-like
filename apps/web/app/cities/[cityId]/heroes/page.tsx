import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {HeroEquipmentBoard} from "../../../../components/hero-equipment-board";
import {HeroGameScreen,type HeroScreenTab} from "../../../../components/hero-game-screen";
import {GamePanel} from "../../../../components/game-ui/game-panel";
import {HeroFormationEditor} from "../../../../components/hero-formation-editor";
import {GameShell} from "../../../../components/game-shell/game-shell";
import {resolveAssetUrl} from "../../../../lib/assets/runtime";
import {privateApi,sessionToken,type ArtifactInventory,
  type CityDetail,type CityForces,type HeroFormation} from "../../../../lib/server-api";
export const dynamic="force-dynamic";

export default async function HeroesPage({params,searchParams}:{
  params:Promise<{cityId:string}>;
  searchParams:Promise<{hero?:string;artifact?:string;formation?:string;screen?:string}>;
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
  const initialTab:HeroScreenTab=query.formation?"formation":
    query.screen==="formation"?"formation":query.screen==="army"?"army":"inventory";
  return <GameShell token={token} title="Héros et équipement" screen="heroes"
    eyebrow="ROYAUME · SALLE DES HÉROS"
    description={"Héros, armées et artefacts · "+city.name}
    cityId={cityId} worldId={city.world_id} stocks={city.stocks}>
    {!selected?<section className="mmhk-no-hero">
      <h2>Aucun héros dans cette cité</h2>
      <p>Ouvrez la taverne pour engager votre premier compagnon.</p>
      <Link href={"/cities/"+cityId+"/forces"}>Aller à la taverne</Link>
    </section>:<HeroGameScreen key={selected.hero_id} cityId={cityId}
      hero={selected} heroes={forces.heroes} initialTab={initialTab}
      portraitSheet={portraitSheet}
      fallbackMight={portrait("might")??"/themes/public-safe/hero-vanguard.svg"}
      fallbackMagic={portrait("magic")??"/themes/public-safe/hero-arcanist.svg"}
      artifactNotice={query.artifact&&<p role={query.artifact==="ok"?"status":"alert"}
        className={query.artifact==="ok"?"construction-notice":"error"}>
        {query.artifact==="ok"?"Artefact déplacé : équipement mis à jour.":
          "Action refusée : niveau, emplacement ou héros indisponible."}
      </p>}
      formationNotice={query.formation&&<p role={query.formation==="ok"?"status":"alert"}
        className={query.formation==="ok"?"construction-notice":"error"}>
        {query.formation==="ok"?"Formation enregistrée sans modifier les effectifs.":
          "Formation refusée : positions, quantités ou héros indisponible."}
      </p>}
      inventory={<HeroEquipmentBoard cityId={cityId} hero={selected}
        heroes={forces.heroes} inventory={inventory}
        art={{
          portrait:portrait(selected.archetype),portraitSheet,
          slotSheet:resolveAssetUrl("hero.slot.sheet.haven"),
          painting:resolveAssetUrl(selected.archetype==="magic"?"hero.painting.magic":"hero.painting.might"),
          equipment:resolveAssetUrl("hero.background.haven"),
          frame:resolveAssetUrl("hero.frame"),backpack:resolveAssetUrl("hero.backpack"),
          artifactIcon:resolveAssetUrl("hero.artifact.icon"),slots:gearSlots
        }}/>}
      formation={formation?.ok&&formation.data?
        <HeroFormationEditor cityId={cityId} formation={formation.data} sheet={unitSheet}/>:
        <div className="mmhk-no-hero">Formation indisponible.</div>}
      army={<GamePanel title="Armée du héros" eyebrow="COMMANDEMENT"
        id="hero-army" className="hero-army-summary mmhk-hero-army-summary" decorativeSymbol="⚔">
        <div className="mmhk-army-roster-list">
          {forces.hero_armies.filter(u=>u.hero_id===selected.hero_id).length?
            forces.hero_armies.filter(u=>u.hero_id===selected.hero_id).map(u=>
              <div key={u.unit_code} className="mmhk-army-row">
                <span aria-hidden="true">⚔</span><strong>{u.name}</strong>
                <b>× {u.quantity.toLocaleString("fr-FR")}</b>
              </div>):
            <p>Aucun peloton affecté à ce héros.</p>}
        </div>
        <Link className="mmhk-hero-garrison-link" href={"/cities/"+cityId+"/forces"}>
          Ouvrir la garnison pour affecter des soldats
        </Link>
      </GamePanel>}/>}
  </GameShell>;
}
