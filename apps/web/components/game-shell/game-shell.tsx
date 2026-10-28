import Link from "next/link";
import type {ReactNode} from "react";
import {signOut} from "../../app/actions";
import {AssetImage} from "../asset-image";
import {resolveAssetUrl} from "../../lib/assets/runtime";
import {privateApi} from "../../lib/server-api";
import type {TimelineResponse} from "../../lib/timeline";
import {TopTimelineBar} from "../top-timeline-bar";
const RESOURCE_LIST=[
  ["gold","Or"],["wood","Bois"],["ore","Minerai"],["crystal","Cristal"],
  ["gems","Gemmes"],["sulfur","Soufre"],["mercury","Mercure"]
] as const;
export async function GameShell({token,title,eyebrow,description,worldId,cityId,stocks,children}:{
  token:string;title:string;eyebrow:string;description:string;
  worldId?:string;cityId?:string;stocks?:Record<string,number>;children:ReactNode;
}) {
  const response=await privateApi<TimelineResponse>("/api/v1/me/timeline?hours=12",token);
  const backdrop=resolveAssetUrl("ui.page.background");
  const paper=resolveAssetUrl("ui.panel.main");
  return <main className="shell kingdom-shell"
    style={backdrop?{backgroundImage:"linear-gradient(180deg,#101a21a8,#101820e8),url("+JSON.stringify(backdrop)+")"}:undefined}>
    <div className="kingdom-frame">
      <TopTimelineBar initial={response.ok?response.data??null:null}/>
      <header className="kingdom-masthead">
        <div className="kingdom-emblem" aria-hidden="true">✦</div>
        <div className="kingdom-brand"><span>MIGHT &amp; MAGIC · HEROES KINGDOMS</span>
          <strong>Le Royaume des Larmes</strong></div>
        <span className="kingdom-realm-badge">SAISON II · RECONSTITUTION</span>
      </header>
      <nav className="kingdom-navbar" aria-label="Navigation principale du royaume">
        <Link href="/">♜ Mes mondes</Link>
        {worldId&&<Link href={"/worlds/"+encodeURIComponent(worldId)}>♧ Carte du monde</Link>}
        {cityId&&<>
          <Link href={"/cities/"+encodeURIComponent(cityId)+"/region"}>◆ Ma région</Link>
          <Link href={"/cities/"+encodeURIComponent(cityId)}>⌂ Entrer en ville</Link>
        </>}
        <form action={signOut}><button type="submit">Déconnexion</button></form>
      </nav>
      <div className="kingdom-treasury" aria-label="Ressources du royaume">
        {RESOURCE_LIST.map(([key,label])=><div key={key} className="kingdom-resource"
          title={stocks?label+" : "+(stocks[key]??0).toLocaleString("fr-FR"):label+" : stock consultable en ville"}>
          <AssetImage id={("resource."+key) as "resource.gold"}/>
          <span>{label}</span><strong>{stocks?(stocks[key]??0).toLocaleString("fr-FR"):"—"}</strong>
        </div>)}
      </div>
      <div className="kingdom-main-panel" style={paper?{backgroundImage:"linear-gradient(155deg,#17252ce0,#111c23ef),url("+JSON.stringify(paper)+")"}:undefined}>
        <div className="kingdom-screen-heading"><span className="eyebrow">{eyebrow}</span>
          <h1>{title}</h1><p>{description}</p></div>
        <div className="panel kingdom-screen-content">{children}</div>
      </div>
      <footer className="kingdom-footer">MMHK-like · Reconstitution privée · État du royaume synchronisé avec le serveur</footer>
    </div>
  </main>;
}
