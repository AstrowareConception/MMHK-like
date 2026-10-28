import type {RegionView,CityForces,PveMissionsResponse} from "../lib/server-api";
import {resolveAssetUrl} from "../lib/assets/runtime";
import {RegionSceneInteractive} from "./region-scene-interactive";
export function RegionScene({region,forces,missions}:{region:RegionView;forces:CityForces|null;missions:PveMissionsResponse|null}) {
  return <RegionSceneInteractive region={region} forces={forces} missions={missions}
    background={resolveAssetUrl("region.background")}/>;
}
