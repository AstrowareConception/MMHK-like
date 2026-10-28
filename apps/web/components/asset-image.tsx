import { resolveAssetUrl } from "../lib/assets/runtime";
import type { AssetId } from "../lib/assets/registry";

export function AssetImage({ id, className }: { id: AssetId; className?: string }) {
  const src = resolveAssetUrl(id);
  if (!src) return <span aria-hidden="true" className={className} />;
  return <img src={src} alt="" aria-hidden="true" className={className} width={28} height={28} />;
}
