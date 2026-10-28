import type {RegionView,CityForces,PveMissionsResponse} from "../lib/server-api";
import {resolveAssetUrl} from "../lib/assets/runtime";
import {RegionSceneInteractive} from "./region-scene-interactive";
export function RegionScene({region,forces,missions,initialSelection}:{region:RegionView;forces:CityForces|null;missions:PveMissionsResponse|null;initialSelection?:{i:number;j:number}}) {
  return <RegionSceneInteractive region={region} forces={forces} missions={missions} initialSelection={initialSelection}
    background={resolveAssetUrl("region.background")}/>;
}
