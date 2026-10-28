#!/usr/bin/env node
/* Local visual-asset inventory. No network, no copying or image publication. */
import { createHash } from 'node:crypto';
import { existsSync, readdirSync, readFileSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, join, dirname, relative, extname, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
const args = process.argv.slice(2);
const i = args.indexOf('--root');
if (i >= 0 && !args[i + 1]) throw new Error('--root requires a path');
const root = i < 0 ? resolve(dirname(fileURLToPath(import.meta.url)), '..') : resolve(args[i + 1]);
const check = args.includes('--check');
const roots = ['data/assets-recovered', 'data/Jactari/src/images', 'data/Screenshots',
  'data/assets-private-original', 'data/assets-private-reconstructed',
  'data/assets-public-safe', 'apps/web/public/themes'];
const included = new Set(['png','gif','jpg','jpeg','webp','ico','svg','css','js','xml','swf','flv']);
function* walk(dir) {
  if (!existsSync(dir)) return;
  for (const e of readdirSync(dir,{withFileTypes:true})) {
    const path = join(dir,e.name);
    if (e.isDirectory()) yield* walk(path);
    else if (e.isFile()) yield path;
  }
}
function meta(bytes, ext) {
  try {
    if (ext==='png' && bytes.toString('ascii',1,4)==='PNG')
      return {width:bytes.readUInt32BE(16),height:bytes.readUInt32BE(20),
        transparency:[4,6].includes(bytes[25])?'alpha_channel':'not_confirmed'};
    if (ext==='gif' && bytes.toString('ascii',0,3)==='GIF')
      return {width:bytes.readUInt16LE(6),height:bytes.readUInt16LE(8),
        transparency:bytes.includes(Buffer.from([0x21,0xf9,0x04]))?'possible_transparency':'not_confirmed'};
    if (['jpg','jpeg'].includes(ext) && bytes[0]===255 && bytes[1]===216) {
      let p=2;
      while (p+9<bytes.length) {
        if (bytes[p]!==255) {p++;continue;}
        const m=bytes[p+1];
        if ([0xc0,0xc1,0xc2,0xc3,0xc5,0xc6,0xc7,0xc9,0xca,0xcb,0xcd,0xce,0xcf].includes(m))
          return {width:bytes.readUInt16BE(p+7),height:bytes.readUInt16BE(p+5),transparency:'opaque'};
        const len=bytes.readUInt16BE(p+2); if(len<2)break; p+=len+2;
      }
    }
    if (ext==='webp' && bytes.toString('ascii',0,4)==='RIFF' &&
        bytes.toString('ascii',12,16)==='VP8X')
      return {width:1+bytes.readUIntLE(24,3),height:1+bytes.readUIntLE(27,3),
        transparency:(bytes[20]&16)?'alpha_channel':'opaque'};
  } catch {/* Invalid or truncated header. */}
  return {width:null,height:null,transparency:'unknown'};
}
function category(path) {
  if (/\/img\/city\/[A-Z]+\/base\.jpg$/i.test(path)) return 'city_background';
  if (/\/img\/city\/[A-Z]+\//i.test(path)) return 'city_building';
  if (/\/cityBuildingList\//i.test(path)) return 'city_thumbnail';
  if (/\/img\/(region|zone)\//i.test(path)) return 'region';
  if (/\/img\/worldMap\//i.test(path)) return 'world';
  if (/\/img\/(frame|backgroundGame|css_sprite|gameFooter|sideBar)\//i.test(path)) return 'interface';
  if (/\/img\/hero\//i.test(path)) return 'hero';
  if (path.includes('/Screenshots/')) return 'screenshot';
  if (path.includes('/acidcave/')) return 'composite_reference';
  if (path.includes('/Jactari/')) return 'jactari_reference';
  if (path.includes('/themes/public-safe/')) return 'public_safe';
  return 'other';
}
const cdxFile=resolve(root,'data/analysis/wayback-mmhk-cdx-2026-10-23.json');
const archives=new Map();
if(existsSync(cdxFile)){
  const rows=JSON.parse(readFileSync(cdxFile,'utf8'));
  for(const record of rows.slice(1)){
    if(!Array.isArray(record)||record.length<4) continue;
    const [original,mime,timestamp,digest]=record;
    const marker='mightandmagicheroeskingdoms.ubi.com/';
    const offset=original.indexOf(marker);
    if(offset<0) continue;
    const logical=original.slice(offset+marker.length).split('?')[0];
    archives.set(logical,{original_url:original,
      archive_url:'https://web.archive.org/web/'+timestamp+'id_/'+original,
      archived_at:timestamp,archive_digest:digest,archived_mime:mime});
  }
}
const assets=[];
for (const dir of roots) for (const full of walk(resolve(root,dir))) {
  const path=relative(root,full).split(sep).join('/');
  const ext=extname(path).slice(1).toLowerCase();
  if (!included.has(ext)) continue;
  const bytes=readFileSync(full);
  const match=path.match(/\/(?:cdn-bulk|ubisoft-archive)\/[^/]+\/(.*)$/);
  const source=path.includes('/cdn-bulk/')||path.includes('/ubisoft-archive/')?'ubisoft_cdn':
    path.includes('/acidcave/')?'acidcave':path.includes('/Jactari/')?'jactari':
    path.includes('/Screenshots/')?'capture':path.includes('/themes/public-safe/')?'project_original':'unknown';
  const archiveKey=path.split('/cdn-bulk/')[1] || path.split('/ubisoft-archive/')[1];
  const archive=archiveKey ? archives.get(archiveKey) : null;
  const privateSource=source!=='project_original';
  const image=['png','gif','jpg','jpeg','webp','svg'].includes(ext);
  assets.push({
    id:'file:'+path, name:path.split('/').at(-1), path, category:category(path),
    faction:path.match(/\/(HAVEN|ACADEMY|INFERNO|NECROPOLIS|SYLVAN|DUNGEON)\//i)?.[1]?.toUpperCase()??null,
    format:ext, kind:image?'image':'related_source', ...meta(bytes,ext),
    bytes:bytes.length, sha256:createHash('sha256').update(bytes).digest('hex'),
    source_exact:archive?.archive_url || 'repository:'+path,
    archive_url:archive?.archive_url || null, archive_timestamp:archive?.archived_at || null,
    archive_digest:archive?.archive_digest || null,
    original_url:archive?.original_url || null,
    original_url_inferred:archive?null:(match?'http://static5.cdn.ubi.com/u/HOMMK/mightandmagicheroeskingdoms.ubi.com/'+match[1]:null),
    provenance:source, provenance_confidence:archive?'cdx_indexed': 'path_based',
    historical_fidelity_confidence:source==='project_original'?'original_project_art':
      archive?'archived_url_matched_file_path_not_authenticity_proof':'unverified',
    availability:'on_disk', redistribution:privateSource?'restricted_or_unverified':'project_owned',
    needs_reconstruction:false
  });
}
assets.sort((a,b)=>a.path.localeCompare(b.path));
const hashes=new Map();
for(const a of assets)hashes.set(a.sha256,[...(hashes.get(a.sha256)||[]),a.path]);
const duplicates=[...hashes.entries()].filter(([,v])=>v.length>1)
  .map(([sha256,paths])=>({sha256,paths}));
const expectedPath=resolve(root,'data/analysis/expected-city-files.json');
const expected=existsSync(expectedPath)?JSON.parse(readFileSync(expectedPath,'utf8')).files:[];
const missing=expected.filter(e=>!assets.some(a=>a.path.endsWith('/'+e.relative_path)))
  .map(e=>({id:'city:'+e.relative_path,path:e.relative_path,
    faction:e.relative_path.split('/')[2],building_tags:e.building_tags||[],
    priority:e.relative_path.endsWith('/base.jpg')||e.relative_path.includes('/HAVEN/')?1:2,
    availability:'missing_on_disk',reconstruction:'archive_or_private_reconstruction',
    redistribution:'restricted_or_unverified'}))
  .sort((a,b)=>a.priority-b.priority||a.path.localeCompare(b.path));
const categories={};
for(const a of assets)categories[a.category]=(categories[a.category]||0)+1;
const summary={schema_version:1,generated_at:new Date().toISOString(),roots,
  found:assets.length,archive_index_matches:assets.filter(a=>a.provenance_confidence==='cdx_indexed').length,
  unique_sha256:hashes.size,duplicate_groups:duplicates.length,
  duplicate_excess:assets.length-hashes.size,expected_city_files:expected.length,
  missing_city_files:missing.length,categories,visual_similarity_tested:false};
if(!check){
  const out=resolve(root,'data/asset-catalog/generated');mkdirSync(out,{recursive:true});
  for(const [file,obj] of [['inventory.json',{...summary,assets}],
    ['exact-duplicates.json',{...summary,groups:duplicates}],
    ['missing-priority.json',{...summary,missing}]])
      writeFileSync(join(out,file),JSON.stringify(obj,null,2)+'\n');
}
console.log(JSON.stringify(summary,null,2));
