#!/usr/bin/env node
/** Copies ONLY known recovered historical files into a gitignored local pack. */
import { existsSync, mkdirSync, readFileSync, writeFileSync, copyFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
const args=process.argv.slice(2), index=args.indexOf('--root');
if(index>=0&&!args[index+1])throw Error('--root needs path');
const root=index>=0?resolve(args[index+1]):resolve(dirname(fileURLToPath(import.meta.url)),'..');
const target=resolve(root,'data/assets-private-original');
const recipes=[{
  id:'building.haven.tavern.1',
  relative:'4.1.27-MTR/img/city/HAVEN/TAVERN.gif',
  sources:[
    'data/assets-recovered/cdn-bulk/4.1.27-MTR/img/city/HAVEN/TAVERN.gif',
    'data/assets-recovered/ubisoft-archive/4.1.27-MTR/img/city/HAVEN/TAVERN.gif'
  ]
},...[
  ["ui.page.background","img/backgroundGame/bg_haven.jpg"],
  ["ui.panel.main","img/background/metal.jpg"],
  ["timeline.background","img/timeLine/background.jpg"],
  ["world.background","img/worldMap/zoom1/background.jpg"],
  ["world.background.political","img/worldMap/zoom2/background.jpg"],
  ["region.background","img/region/background_region.jpg"]
].map(([id,asset])=>({id,relative:"4.1.13-MTR/"+asset,sources:[
  "data/assets-recovered/cdn-bulk/4.1.13-MTR/"+asset,
  "data/assets-recovered/ubisoft-archive/4.1.13-MTR/"+asset
]}))];

const uiRecipes=[
  ["hero.background.haven","hero/equipementBg_Haven.jpg"],
  ["hero.portrait.might","hero/green.jpg"],
  ["hero.portrait.magic","hero/purple.jpg"],
  ["hero.frame","hero/management/hero_frame_container_bg.gif"],
  ["hero.backpack","hero/backpackBg.gif"],
  ["hero.slot.head","hero/management/headSelected.gif"],
  ["hero.slot.neck","hero/management/necklaceSelected.gif"],
  ["hero.slot.chest","hero/management/chestSelected.gif"],
  ["hero.slot.weapon","hero/management/rightHandSelected.gif"],
  ["hero.slot.shield","hero/management/leftHandSelected.gif"],
  ["hero.slot.hands","hero/management/leftHandSelected.gif"],
  ["hero.slot.feet","hero/management/feetSelected.gif"],
  ["hero.slot.ring","hero/management/ringSelected.gif"],
  ["hero.artifact.backdrop","hero/management/artefactTrash.jpg"],
  ["army.garrison.background","recruit/recruitUnitStackBg.jpg"],
  ["army.tavern.background","recruit/recruitTownHeroBg.gif"]
].map(([id,asset])=>({
  id,relative:"4.1.13-MTR/img/"+asset,
  sources:["data/assets-recovered/cdn-bulk/4.1.13-MTR/img/"+asset,
           "data/assets-recovered/ubisoft-archive/4.1.13-MTR/img/"+asset]
}));
recipes.push(...uiRecipes);
const sha=filename=>createHash('sha256').update(readFileSync(filename)).digest('hex');
const manifestFile=join(target,'manifest.json');
const existing=existsSync(manifestFile)?JSON.parse(readFileSync(manifestFile,'utf8')):{};
if(!existing||typeof existing!=='object'||Array.isArray(existing))throw Error('Invalid private manifest');
let copied=0, reused=0, unavailable=[];
for(const row of recipes) {
  const candidate=row.sources.map(s=>resolve(root,s)).find(existsSync);
  if(!candidate){unavailable.push(row.id);continue;}
  const dest=join(target,row.relative);
  mkdirSync(dirname(dest),{recursive:true});
  if(existsSync(dest)){
    if(sha(dest)!==sha(candidate))throw Error('Refusing to overwrite different local asset: '+row.relative);
    reused++;
  }else{
    copyFileSync(candidate,dest);
    if(sha(dest)!==sha(candidate))throw Error('Copy integrity error: '+row.relative);
    copied++;
  }
  // Never overwrite an explicit user mapping.
  if(!Object.prototype.hasOwnProperty.call(existing,row.id))existing[row.id]=row.relative;
}
mkdirSync(target,{recursive:true});
writeFileSync(manifestFile,JSON.stringify(existing,null,2)+'\n',{mode:0o600});
console.log(JSON.stringify({private_root:'data/assets-private-original',copied,reused,unavailable,
  manifest_keys:Object.keys(existing).sort(),mode:'private_historical_opt_in'},null,2));
