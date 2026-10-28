import "server-only";
import { existsSync, readFileSync, realpathSync, statSync } from "node:fs";
import { resolve, relative, isAbsolute, sep, extname } from "node:path";
import { ASSETS, isAssetId, publicAssetUrl, type AssetId } from "./registry";

const ALLOWED_MIME: Record<string,string> = {
  ".png":"image/png", ".gif":"image/gif", ".jpg":"image/jpeg",
  ".jpeg":"image/jpeg", ".webp":"image/webp"
};
export function historicalModeEnabled(): boolean {
  return process.env.MMHK_HISTORICAL_ASSETS === "true"
    && process.env.MMHK_PREVIEW_LOOPBACK_ONLY === "true";
}
export function privateAssetFile(id: string): {path:string; mime:string} | null {
  if (!historicalModeEnabled() || !isAssetId(id)) return null;
  const root = process.env.MMHK_PRIVATE_ASSETS_ROOT || "/opt/mmhk-private";
  try {
    const manifest = JSON.parse(readFileSync(resolve(root,"manifest.json"),"utf8")) as unknown;
    if (!manifest || typeof manifest !== "object" || Array.isArray(manifest)) return null;
    const fileName = (manifest as Record<string,unknown>)[id];
    if (typeof fileName !== "string" || !fileName || isAbsolute(fileName)) return null;
    const mime = ALLOWED_MIME[extname(fileName).toLowerCase()];
    if (!mime) return null;
    const rootReal = realpathSync(root);
    const target = resolve(rootReal,fileName);
    const rel = relative(rootReal,target);
    if (!rel || rel === ".." || rel.startsWith(".."+sep) || isAbsolute(rel)) return null;
    if (!existsSync(target) || !statSync(target).isFile()) return null;
    const real = realpathSync(target);
    const safeRelative = relative(rootReal,real);
    if (!safeRelative || safeRelative === ".." || safeRelative.startsWith(".."+sep) || isAbsolute(safeRelative)) return null;
    return {path:real,mime};
  } catch {
    return null; // Missing private pack must never affect public-safe rendering.
  }
}
export function resolveAssetUrl(id: AssetId): string | null {
  if (historicalModeEnabled() && privateAssetFile(id))
    return "/api/theme-assets/" + encodeURIComponent(id);
  return publicAssetUrl(id);
}
export function publicThemeIsDefault(): boolean {
  return !historicalModeEnabled();
}
