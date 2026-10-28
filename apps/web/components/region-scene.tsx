import type {RegionView} from "../lib/server-api";
import {resolveAssetUrl} from "../lib/assets/runtime";
import {RegionSceneInteractive} from "./region-scene-interactive";
export function RegionScene({region}:{region:RegionView}) {
  return <RegionSceneInteractive region={region}
    background={resolveAssetUrl("region.background")}/>;
}
