/** Stable keys; source names and paths must never leak into callers. */
export const ASSETS = {
  "ui.header.background": { publicPath: "/themes/public-safe/header.svg" },
  "ui.panel.main": { publicPath: null },
  "ui.page.background": { publicPath: null },
  "world.background": { publicPath: null },
  "world.background.political": { publicPath: null },
  "region.background": { publicPath: null },
  "timeline.background": { publicPath: null },
  "resource.gold": { publicPath: "/themes/public-safe/gold.svg" },
  "resource.wood": { publicPath: "/themes/public-safe/wood.svg" },
  "resource.ore": { publicPath: "/themes/public-safe/ore.svg" },
  "resource.crystal": { publicPath: "/themes/public-safe/crystal.svg" },
  "resource.gems": { publicPath: "/themes/public-safe/gems.svg" },
  "resource.sulfur": { publicPath: "/themes/public-safe/sulfur.svg" },
  "resource.mercury": { publicPath: "/themes/public-safe/mercury.svg" },
  "city.haven.background": { publicPath: null },
  "building.haven.tavern.1": { publicPath: null },
  "hero.background.haven": { publicPath: null },
  // Historic sprite sheets; never public URLs. The fallback assets below
  // are redistributable placeholders when private opt-in is disabled.
  "hero.sheet.haven": { publicPath: null },
  "hero.sheet.academy": { publicPath: null },
  "hero.sheet.inferno": { publicPath: null },
  "hero.sheet.necropolis": { publicPath: null },
  "hero.sheet.sylvan": { publicPath: null },
  "army.sheet.haven": { publicPath: null },
  "army.sheet.haven.small": { publicPath: null },
  "hero.slot.sheet.haven": { publicPath: null },

  "hero.portrait.might": { publicPath: "/themes/public-safe/hero-vanguard.svg" },
  "hero.portrait.magic": { publicPath: "/themes/public-safe/hero-arcanist.svg" },
  "hero.frame": { publicPath: null },
  "hero.backpack": { publicPath: null },
  "hero.slot.head": { publicPath: null },
  "hero.slot.neck": { publicPath: null },
  "hero.slot.chest": { publicPath: null },
  "hero.slot.weapon": { publicPath: null },
  "hero.slot.shield": { publicPath: null },
  "hero.slot.hands": { publicPath: null },
  "hero.slot.feet": { publicPath: null },
  "hero.slot.ring": { publicPath: null },
  "army.garrison.background": { publicPath: null },
  "army.tavern.background": { publicPath: null },
  "hero.artifact.backdrop": { publicPath: null },
  "hero.artifact.icon": { publicPath: null },
  "timeline.construction": { publicPath: null },
  "timeline.hero_return": { publicPath: null },
  "timeline.attack_incoming": { publicPath: null }
} as const;
export type AssetId = keyof typeof ASSETS;
export type AssetTheme = "public-safe" | "private-historical";
export function publicAssetUrl(id: AssetId): string | null {
  return ASSETS[id].publicPath;
}
export function isAssetId(id: string): id is AssetId {
  return Object.prototype.hasOwnProperty.call(ASSETS,id);
}
