import type {City,World} from "../lib/server-api";
import {resolveAssetUrl} from "../lib/assets/runtime";
import {WorldAtlasInteractive} from "./world-atlas-interactive";

export function WorldAtlas({world,cities}:{world:World;cities:City[]}) {
  // Server-only resolver: private historical paths never become build assets.
  return <WorldAtlasInteractive world={world} cities={cities}
    detailBackground={resolveAssetUrl("world.background")}
    politicalBackground={resolveAssetUrl("world.background.political")}/>;
}
