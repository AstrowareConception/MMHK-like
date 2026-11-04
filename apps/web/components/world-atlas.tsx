import type {City,WorldOverview,ColonizationCatalog} from "../lib/server-api";
import {resolveAssetUrl} from "../lib/assets/runtime";
import {WorldAtlasInteractive} from "./world-atlas-interactive";

export function WorldAtlas({world,cities,qualifiedSites,cityMines}:{world:WorldOverview;cities:City[];qualifiedSites:ColonizationCatalog["qualified_sites"];cityMines:{cityId:string;mines:string[]}[]}) {
  // Server-only resolver: private historical paths never become build assets.
  return <WorldAtlasInteractive world={world} cities={cities} qualifiedSites={qualifiedSites} cityMines={cityMines}
    detailBackground={resolveAssetUrl("world.background")}
    politicalBackground={resolveAssetUrl("world.background.political")}/>;
}
