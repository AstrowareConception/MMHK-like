import Link from "next/link";
import {notFound,redirect} from "next/navigation";
import {GameShell} from "../../../../../../components/game-shell/game-shell";
import {PrivateScreenFailure} from "../../../../../../components/game-ui/private-screen-failure";
import {RegionDiscoveryBoard,type WorldRegionInspection} from "../../../../../../components/region-discovery-board";
import {privateApi,sessionToken} from "../../../../../../lib/server-api";

export const dynamic="force-dynamic";

export default async function WorldRegionPage({params}:{
  params:Promise<{worldId:string;x:string;y:string}>;
}){
  const {worldId,x,y}=await params;
  if(!/^[a-z0-9_-]{1,64}$/.test(worldId)
    || !/^[1-9]\d{0,5}$/.test(x)
    || !/^[1-9]\d{0,5}$/.test(y))notFound();
  const token=await sessionToken();
  if(!token)redirect("/");
  const result=await privateApi<WorldRegionInspection>(
    "/api/v1/me/worlds/"+encodeURIComponent(worldId)+
    "/regions/"+x+"/"+y,token,
  );
  if(result.status===401)redirect("/");
  if(result.status===404||result.status===422)notFound();
  if(!result.ok||!result.data)
    return <PrivateScreenFailure status={result.status} scope="Région"
      retryHref={"/worlds/"+worldId+"/regions/"+x+"/"+y}/>;
  const region=result.data;
  const militaryResponse=await privateApi<{
    target_kind:"own_city"|"discovered_opponent"|"target_not_identified";
    target_name:string|null;
    heroes:{city_id:string;city_name:string;hero_id:string;hero_name:string;
      status:string;troop_count:number;distance_steps:number;
      preparation_ready:boolean}[];
    attack_enabled:boolean;raid_enabled:boolean;blocking_reasons:string[];
  }>(
    "/api/v1/me/worlds/"+encodeURIComponent(worldId)+
    "/regions/"+x+"/"+y+"/military-readiness",token,
  );
  return <GameShell screen="region" token={token}
    title={"Région "+region.x+", "+region.y}
    eyebrow="MONDE · RECONNAISSANCE TERRITORIALE"
    description="Gisements naturels et découvertes autorisées"
    worldId={worldId} cityId={region.city?.ownership==="own"?region.city.city_id:undefined}>
    <RegionDiscoveryBoard region={region} military={militaryResponse.ok?militaryResponse.data??null:null}/>
    <div className="region-actions">
      <Link className="scene-action" href={"/worlds/"+worldId}>Retour à l'atlas</Link>
    </div>
  </GameShell>;
}
