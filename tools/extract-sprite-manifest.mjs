/** Correspondances visuelles dérivées de Jactari/Aspirin/Aendawyn, GPL-3.0-or-later.
 * Lit uniquement les six tables déclaratives dont les empreintes sont épinglées.
 * Les rectangles sont une transcription des fonctions images.min.js et des CSS,
 * pas une extraction du client Ubisoft. Ne modifie pas les sources historiques.
 */
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const source=read('data/source-manifest.json');
const inv=read('data/analysis/jactari-inventory.json');
const ctx=vm.createContext(Object.create(null),{codeGeneration:{strings:false,wasm:false}});
for(const f of source.files.filter(x=>x.file.startsWith('donnees.'))){
 const b=fs.readFileSync(path.join(root,'data/Jactari/src/scripts',f.file));
 if(crypto.createHash('sha256').update(b).digest('hex')!==f.sha256)throw Error('Source modifiée: '+f.file);
 vm.runInContext(b.toString(),ctx,{timeout:1000});
}
const images=Object.fromEntries(inv.images.map(x=>[path.basename(x.path),x]));
const entries=[];
function add(id,sheet,x,y,w,h,extra={}){
 const asset=images[sheet];
 const rect=[x,y,w,h];
 const status=!asset?'missing_file':rect.every(Number.isFinite)&&x>=0&&y>=0&&x+w<=asset.width&&y+h<=asset.height?'in_bounds':'out_of_bounds';
 entries.push({id,sheet:'data/Jactari/src/images/'+sheet,rect,status,...extra});
}
const faction=f=>f===-1?'NEUTRAL':f===-2?'NEW':ctx._factions[f].nom.en.toUpperCase();
ctx._unites.forEach((u,i)=>{
 const f=faction(u.faction),k=u.icone-1;
 for(const [state,y] of [['normal',0],['grey',22]])add(`unit.reference.${String(i).padStart(3,'0')}.small.${state}`,`UnitStack_${f}.png`,k*23,y,23,22,{unit_index:i,icon_index:u.icone});
 for(const [state,y] of [['normal',0],['defeated',52]])add(`unit.reference.${String(i).padStart(3,'0')}.battle.${state}`,`BattleUnitStack_${f}.jpg`,k*51,y,51,52,{unit_index:i,icon_index:u.icone});
});
ctx._sorts.forEach((s,i)=>add(`spell.reference.${String(i).padStart(3,'0')}`,`SpellStack_${ctx._ecoles_magie[s.ecole].nom_machine}.png`,s.icone!==undefined?(s.icone-1)*40:0,s.icone!==undefined?0:120,40,40,{spell_index:i}));
ctx._carrieres.forEach((c,i)=>add(`career.reference.${i}`,'HeroClass.png',(c.icone-1)*44,0,44,44));
ctx._talents.forEach((ts,c)=>ts.forEach((t,i)=>add(`talent.reference.${c}.${i}`,'HeroClassSkill.png',t.icone===51?250:((t.icone-1)%10)*25,t.icone===51?100:Math.floor((t.icone-1)/10)*25,25,25,{icon_index:t.icone})));
for(let f=0;f<5;f++)for(let n=1;n<=19;n++)add(`hero.reference.${f}.portrait.${n}`,`Hero_${faction(f)}_2.jpg`,(n-1)*71,0,71,72,{selectable_in_builder:true});
Object.entries(ctx._ressources).forEach(([k,r])=>add(`resource.reference.${k}`,'Ressources.png',(r.icone-1)*20+(r.icone>1?1:0),1,18,18));
for(const [arm,x] of [['I',0],['R',22],['C',44]])for(const [state,y] of [['neutral',0],['bonus',22],['malus',44]])add(`arm.${arm}.${state}`,'UnitStack_types.png',x,y,22,22);
ctx._artefacts.forEach((a,i)=>{
 if(i===0)return; // sentinelle, hors 563 entrées
 const icon=a.icone,f=a.faction;
 if(icon===''||f===''){add(`artifact.reference.${i}`,'artefact-inconnu.png',0,0,37,36,{artifact_index:i});return;}
 const sheet=f===-1&&a.type===2?'HEREDITY':f===-1&&a.type===1?'REWARD':a.set!==undefined?'SET':'COMMON';
 let x,y;
 if(sheet==='COMMON'){
  let dx,dy;
  if(f===-1){dx=icon>14?icon-15:icon-1;dy=icon>14?1:0;}
  else if(icon>0){const ddy=1+(f+1)*7;dx=icon>8?icon-9:icon-1;dy=icon>8?ddy:ddy-1;}
  else{dx=ctx._slots[a.slot].icone-1;dy=2+f*7+(a.niv?a.niv-1:(i-143)%5);}
  x=dx*40;y=dy*40;
 }else if(sheet==='SET'){x=((icon-1)%11)*36;y=Math.floor((icon-1)/11)*36;}
 else{x=(icon-1)*37;y=0;}
 // Vue équipement : viewport .choix-artefact (37×36). Le catalogue emploie
 // 36×37 ; ce manifeste indique expressément le contexte choisi.
 add(`artifact.reference.${i}`,`Artefact_${sheet}.png`,x,y,37,36,{artifact_index:i,context:'hero_equipment',stride:sheet==='COMMON'?40:sheet==='SET'?36:37});
});
const counts=entries.reduce((r,e)=>(r[e.status]=(r[e.status]||0)+1,r),{});
fs.writeFileSync(path.join(root,'data/analysis/sprite-manifest.json'),JSON.stringify({source_commit:inv.source_commit,license_of_derived_mapping:'GPL-3.0-or-later',method:'Transcription images.min.js ; rectangles de contexte déclarés, indices historiques conservés',counts,entries},null,2)+'\n');
console.log(JSON.stringify({entries:entries.length,counts}));
