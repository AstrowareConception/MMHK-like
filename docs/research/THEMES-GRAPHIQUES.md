# Graphical themes — tranche A

The application defaults to public-safe. Stable IDs are declared in apps/web/lib/assets/registry.ts. Components should request assets by ID, never by physical filename. A missing ID deliberately falls back to the existing CSS view.

Public-safe graphics are original vector icons in apps/web/public/themes/public-safe. They are the ONLY graphics copied into the public Next.js Docker image.

## Historical pack (local, optional)

1. Run node tools/prepare-private-historical.mjs from the repo root. This copies the verified recovered HAVEN/TAVERN.gif into the ignored private pack and creates manifest.json without overwriting custom mappings. You may add other historically verified files manually. Do not git add these files.
2. Create data/assets-private-original/manifest.json, mapping stable IDs to RELATIVE paths. Example: { "building.haven.tavern.1": "4.1.27-MTR/img/city/HAVEN/TAVERN.gif" }. For icons displayed today, map resource.gold etc. to matching historic images after validation.
3. With the normal local stack already initialized, use the Compose overlay: docker compose --env-file .env.local -f compose.local.yaml -f compose.historical.yaml up -d --build web.
4. The frontend remains available only on 127.0.0.1 and the runtime mounts the historical pack read-only. The frontend route /api/theme-assets/[id] requires a valid session, a loopback hostname, the explicit opt-in and a file inside the allowed private root.

Every private file must be PNG, GIF, JPEG or WebP. Path traversal and symlinks escaping the mount are rejected. No asset is copied into Next.js public or a Docker build layer. No historical content is exposed in server rendering unless explicitly configured.

Do not commit screenshots made with the historical pack. The CI runs public-safe by default and uses no private mount.

The Haven tavern uses the known full-size 80 × 75 GIF only when that building is active in PostgreSQL and the historical pack is enabled. Otherwise the marker remains original CSS. The image version 4.1.27 and historical positions 4.1.3 have not been proven compatible.

Known limitation: the genuine city base and 169 of 170 full-scene building GIFs are still missing. The current city remains schematic, not a flattened fully-built screenshot.

## Fallbacks and reconstructions

The private manifest accepts a simple legacy string (original path), or a mapping object for each stable ID: { "original": "4.1.27-MTR/img/city/HAVEN/TAVERN.gif", "reconstructed": "haven/tavern-reconstruction.png" }. The resolver tries the exact original in data/assets-private-original, then the local reconstruction in data/assets-private-reconstructed, then the public-safe mapping. Both directories are mounted read-only using compose.historical.yaml. Never put reconstructed Ubisoft-derived graphics in the public theme. Create both private directories before starting the optional Compose overlay.
