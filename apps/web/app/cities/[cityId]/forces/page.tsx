import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {GameShell} from "../../../../components/game-shell/game-shell";
import {CityForcesPanel} from "../../../../components/city-forces-panel";
import {privateApi,sessionToken,type CityDetail,type CityForces} from "../../../../lib/server-api";
export const dynamic="force-dynamic";

export default async function ForcesPage({params,searchParams}:{
  params:Promise<{cityId:string}>;
  searchParams:Promise<{hero?:string;recruit?:string;transfer?:string}>;
}) {
  const {cityId}=await params,query=await searchParams,token=await sessionToken();
  if(!token)redirect("/");
  if(!/^[0-9a-f-]{36}$/i.test(cityId))notFound();
  const [city,forces]=await Promise.all([
    privateApi<CityDetail>("/api/v1/me/cities/"+cityId,token),
    privateApi<CityForces>("/api/v1/me/cities/"+cityId+"/forces",token)
  ]);
  if(city.status===401||forces.status===401)redirect("/");
  if(city.status===404||forces.status===404)notFound();
  if(!city.ok||!city.data||!forces.ok||!forces.data){
    return <main className="shell"><p>Les forces de cette cité sont indisponibles.</p>
      <Link href={"/cities/"+cityId}>Retour à la cité</Link></main>;
  }
  return <GameShell token={token} title="Forces et garnisons" eyebrow="ROYAUME · COMMANDEMENT"
    description={"Réserve de troupes, taverne et affectations · "+city.data.name}
    worldId={city.data.world_id} cityId={cityId} stocks={city.data.stocks}>
    <nav className="city-shortcuts">
      <Link href={"/cities/"+cityId}>Ville</Link>
      <Link href={"/cities/"+cityId+"/heroes"}>Fiches de héros et artefacts</Link>
      <Link href={"/cities/"+cityId+"/region"}>Région et rencontres</Link>
    </nav>
    <CityForcesPanel cityId={cityId} forces={forces.data} message={query}/>
  </GameShell>;
}
