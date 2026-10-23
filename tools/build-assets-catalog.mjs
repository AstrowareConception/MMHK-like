#!/usr/bin/env node
/**
 * Génère le catalogue des images MMHK à partir des preuves versionnées.
 * Aucun réseau, aucune capture de contenu externe, aucune modification des originaux.
 *
 * Usage : node tools/build-assets-catalog.mjs
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';

const root = resolve(import.meta.dirname, '..');
const read = path => JSON.parse(readFileSync(resolve(root, path), 'utf8'));
const cdx = read('data/analysis/wayback-mmhk-cdx-2026-10-23.json');
const expected = read('data/analysis/expected-city-files.json').files;
const recovered = read('data/analysis/recovered-assets-2026-10-23.json').assets;
const jactari = read('data/analysis/jactari-inventory.json').images;
const screenshots = read('data/analysis/screenshots-inventory.json').files;
const acidcave = read('data/analysis/acidcave-referenced-images.json');

const logical = input => {
  const clean = input.replaceAll('\\', '/');
  const i = clean.indexOf('/img/');
  return i < 0 ? null : 'img/' + clean.slice(i + 5).replace(/\\/{2,}/g, '/');
};
const basename = s => s.split('/').at(-1);
const category = key => {
  if (/^img\\/city\\/[A-Z]+\\/base\\.jpg$/.test(key)) return 'ville/fond_vierge';
  if (/^img\\/city\\/[A-Z]+\\//.test(key)) return 'ville/calque_batiment';
  if (/^img\\/cityBuildingList\\/.*_building\\.gif$/i.test(key)) return 'ville/planche_miniatures';
  if (key.startsWith('img/cityBuildingList/')) return 'ville/arbre_construction';
  if (/^img\\/backgroundGame\\//.test(key)) return 'habillage/fond_faction';
  if (/^img\\/hero\\//.test(key)) return 'heros/interface';
  if (/^img\\/worldMap\\//.test(key)) return 'monde';
  if (/^img\\/(region|zone)\\//.test(key)) return 'region';
  if (/^img\\/firstConnection\\/creaturesSlideShow\\//.test(key)) return 'unites/illustration';
  if (/^img\\/(portal|firstConnection|news|strategyguide)\\//.test(key)) return 'portail/presentation';
  if (/^img\\/(frame|contentSlider|gameFooter|sideBar)\\//.test(key)) return 'interface';
  return 'autre';
};
const priority = (cat, key) =>
  cat === 'ville/fond_vierge' || cat === 'ville/calque_batiment' ? 1 :
  cat === 'ville/planche_miniatures' || cat === 'ville/arbre_construction' || cat === 'heros/interface' || cat === 'region' || cat === 'monde' || key.startsWith('jactari:Hero_') ? 2 :
  cat.startsWith('portail/') ? 4 : 3;

const byLocal = new Map();
for (const a of recovered) if (/\\.(gif|png|jpe?g|webp)$/i.test(a.path || '')) {
  const key = logical(a.path);
  if (key) byLocal.set(key, a);
}
const entries = new Map();
function insert(item) {
  if (entries.has(item.id)) throw new Error('Identifiant dupliqué : ' + item.id);
  entries.set(item.id, item);
}
for (const [index, record] of cdx.entries()) {
  if (index === 0 || !record[1].startsWith('image/')) continue;
  const [original, mime, timestamp, digest] = record;
  const key = logical(original);
  if (!key) continue;
  const id = 'cdn:' + key;
  let item = entries.get(id);
  if (!item) {
    const cat = category(key);
    item = {
      id, logical_path: key, category: cat, priority: priority(cat, key),
      provenance: 'ubisoft_cdn_via_wayback_cdx',
      availability: 'wayback_index_only', in_repo: false,
      repo_path: null, sha256: null, expected_city: false,
      original_url: original, archive_url: null, archive_timestamp: timestamp,
      cdx_url_count: 0, cdx_digest_count: 0,
      cdx_digests: [], versions: [], notes: ''
    };
    insert(item);
  }
  item.cdx_url_count++;
  if (!item.cdx_digests.includes(digest)) item.cdx_digests.push(digest);
  const match = original.match(/\\/(\\d+\\.\\d+\\.\\d+(?:\\.\\d+)?(?:-\\d+)?-MTR)\\//);
  if (match && !item.versions.includes(match[1])) item.versions.push(match[1]);
  if (timestamp < item.archive_timestamp || original.includes('/4.1.13-MTR/')) {
    item.archive_timestamp = timestamp;
    item.original_url = original;
  }
  item.cdx_digest_count = item.cdx_digests.length;
}
for (const item of entries.values()) {
  item.archive_url = 'https://web.archive.org/web/' + item.archive_timestamp + 'id_/' + item.original_url;
  const local = byLocal.get(item.logical_path);
  if (local) {
    item.availability = 'in_repo';
    item.in_repo = true;
    item.repo_path = local.path;
    item.sha256 = local.sha256;
  }
  item.versions.sort();
}
for (const e of expected) {
  const id = 'cdn:' + e.relative_path;
  let item = entries.get(id);
  if (!item) {
    const cat = category(e.relative_path);
    item = {
      id, logical_path: e.relative_path, category: cat,
      priority: 1, provenance: 'original_client_4.1.3_layout',
      availability: 'expected_not_indexed', in_repo: false,
      repo_path: null, sha256: null, expected_city: true,
      building_tags: e.building_tags || [],
      original_url: null, archive_url: null, archive_timestamp: null,
      cdx_url_count: 0, cdx_digest_count: 0, cdx_digests: [],
      versions: ['4.1.3-MTR'], notes: 'Chemin déduit du client, aucune capture CDX identifiée'
    };
    insert(item);
  } else {
    item.expected_city = true;
    item.priority = 1;
    item.building_tags = e.building_tags || [];
  }
}
for (const a of recovered) {
  if (!a.path || !/\\.(gif|png|jpe?g|webp)$/i.test(a.path)) continue;
  const cdnPath = logical(a.path);
  if (cdnPath) continue;
  const id = 'recovered:' + a.path;
  const cat = a.kind === 'flattened_town_scene' ? 'ville/scene_assemblee' : 'reference/externe';
  insert({
    id, logical_path: a.path, category: cat, priority: 2,
    provenance: a.provider || 'external_archive',
    availability: 'in_repo', in_repo: true,
    repo_path: a.path, sha256: a.sha256 || null,
    expected_city: false, original_url: a.source_url || null,
    archive_url: null, archive_timestamp: null,
    cdx_url_count: 0, cdx_digest_count: 0, cdx_digests: [],
    versions: [], notes: a.notes || '',
    width: a.width, height: a.height
  });
}
for (const a of jactari) {
  const key = 'jactari:' + basename(a.path);
  const cat = /^Hero_[A-Z]+_2\\.jpg$/.test(basename(a.path)) ? 'heros/planche_portraits' :
    /^BattleUnitStack_/.test(basename(a.path)) ? 'unites/portraits_bataille' :
    /^UnitStack_/.test(basename(a.path)) ? 'unites/sprites' : 'jactari/autre';
  insert({
    id: key, logical_path: a.path, category: cat, priority: priority(cat, key),
    provenance: 'jactari_user_corpus',
    availability: 'in_repo', in_repo: true,
    repo_path: a.path, sha256: a.sha256,
    expected_city: false, original_url: null,
    archive_url: null, archive_timestamp: null,
    cdx_url_count: 0, cdx_digest_count: 0, cdx_digests: [], versions: [],
    notes: 'Planche/référence communautaire ; ne démontre pas la possession du calque Ubisoft correspondant',
    width: a.width, height: a.height
  });
}
for (const a of screenshots) {
  insert({
    id: 'screenshot:' + a.id, logical_path: a.path,
    category: 'reference/capture_ecran', priority: 3,
    provenance: 'screenshots_user_corpus',
    availability: 'in_repo', in_repo: true,
    repo_path: a.path, sha256: a.sha256,
    expected_city: false, original_url: null,
    archive_url: null, archive_timestamp: null,
    cdx_url_count: 0, cdx_digest_count: 0, cdx_digests: [], versions: [],
    duplicate_of: a.duplicate_of || null,
    notes: 'Capture composite non réutilisable comme calque de décor',
    width: a.width, height: a.height
  });
}
const acidRefs = new Map();
for (const p of acidcave) for (const a of p.images || []) {
  if (!a.src?.startsWith('sphinx/')) continue;
  const key = 'acidcave:' + a.src;
  const pages = acidRefs.get(key) || new Set();
  pages.add(p.page);
  acidRefs.set(key, pages);
}
const haveAcid = new Set(recovered.filter(x => x.path?.includes('/acidcave/')).map(x=>basename(x.path)));
for (const [id, pageSet] of acidRefs) {
  const src = id.slice('acidcave:'.length);
  if (haveAcid.has(basename(src))) continue;
  const cat = /^sphinx\\/unit_/.test(src) ? 'unites/illustration_communautaire' :
    /^sphinx\\/mini\\//.test(src) ? 'ville/miniature_communautaire' :
    'reference/guide_acidcave';
  insert({
    id, logical_path: src, category: cat, priority: cat.startsWith('ville/') ? 2 : 3,
    provenance: 'acidcave_guide_html',
    availability: 'external_reference_only', in_repo: false,
    repo_path: null, sha256: null, expected_city: false,
    original_url: 'https://www.heroeskingdoms.acidcave.net/' + src,
    archive_url: null, archive_timestamp: null,
    cdx_url_count: 0, cdx_digest_count: 0, cdx_digests: [],
    versions: [], source_pages: [...pageSet].sort(),
    notes: 'URL relevée dans le HTML du guide ; téléchargement non contrôlé'
  });
}
const records = [...entries.values()].sort((a,b)=>a.priority-b.priority ||
  a.category.localeCompare(b.category) || a.logical_path.localeCompare(b.logical_path));
const statuses = {};
const categories = {};
for (const a of records) {
  statuses[a.availability] = (statuses[a.availability] || 0) + 1;
  categories[a.category] = (categories[a.category] || 0) + 1;
}
const cityRecords = records.filter(x=>x.expected_city);
const asset = {
  schema_version: 1, date: '2026-10-23',
  description: 'Référentiel des fichiers identifiés, non exhaustif. Une URL CDX 200 historique ne prouve pas que le fichier est encore téléchargeable.',
  sources: [
    'data/analysis/wayback-mmhk-cdx-2026-10-23.json',
    'data/analysis/expected-city-files.json',
    'data/analysis/recovered-assets-2026-10-23.json',
    'data/analysis/jactari-inventory.json',
    'data/analysis/screenshots-inventory.json',
    'data/analysis/acidcave-referenced-images.json'
  ],
  counts: {
    records: records.length,
    statuses, categories,
    cdx_image_urls: cdx.slice(1).filter(x=>x[1].startsWith('image/')).length,
    cdx_distinct_content_digests: new Set(cdx.slice(1).filter(x=>x[1].startsWith('image/')).map(x=>x[3])).size,
    cdx_logical_paths: records.filter(x=>x.id.startsWith('cdn:') && x.cdx_url_count>0).length,
    expected_city_files: cityRecords.length,
    expected_city_in_repo: cityRecords.filter(x=>x.in_repo).length,
    expected_city_not_local: cityRecords.filter(x=>!x.in_repo).length
  },
  images: records
};
writeFileSync(resolve(root, 'data/analysis/assets-catalog.json'), JSON.stringify(asset,null,2)+'\\n');
const cols=['id','category','priority','logical_path','availability','in_repo','expected_city',
  'provenance','repo_path','sha256','original_url','archive_url','cdx_url_count','cdx_digest_count',
  'versions','notes'];
const csvVal = s => {
  const v = String(s ?? '').replaceAll('\\r',' ').replaceAll('\\n',' ');
  return /[;"\\n]/.test(v) ? '"'+v.replaceAll('"','""')+'"' : v;
};
const csv = [cols.join(';'),...records.map(a=>cols.map(k=>csvVal(Array.isArray(a[k]) ? a[k].join('|') : a[k])).join(';'))].join('\\n')+'\\n';
writeFileSync(resolve(root,'data/analysis/assets-catalog.csv'),csv);
console.log(JSON.stringify(asset.counts,null,2));
