import type {RegionView,CityForces} from "../lib/server-api";
import {resolveAssetUrl} from "../lib/assets/runtime";
import {RegionSceneInteractive} from "./region-scene-interactive";
export function RegionScene({region,forces}:{region:RegionView;forces:CityForces|null}) {
  return <RegionSceneInteractive region={region} forces={forces}
    background={resolveAssetUrl("region.background")}/>;
}
