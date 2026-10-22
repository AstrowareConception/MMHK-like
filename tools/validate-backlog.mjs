#!/usr/bin/env node
// Validation documentaire du backlog ; aucun moteur de jeu n’est exécuté.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

function validateBacklog(model, files, repositoryPaths) {
  const errors = [], warnings = [];
  let assertions = 0, linksChecked = 0;
  const check = (ok, msg) => { assertions++; if (!ok) errors.push(msg); };
  const paths = new Set([...repositoryPaths, ...Object.keys(files)]);
  const stories = model.stories || [], categories = model.categories || [];
  const ids = new Set(stories.map(s => s.id));
  const reqText = files["docs/specifications/FONCTIONNEL.md"] || "";
  const sourceReqIds = new Set([...reqText.matchAll(/^\| (REQ-[A-Z]+-\d+) \|/gm)].map(x=>x[1]));
  const uText = files["docs/research/INCERTITUDES.md"] || "";
  const sourceUIds = new Set([...uText.matchAll(/^\| (U\d+) \|/gm)].map(x=>x[1]));
  const reqs = model.requirements || [], reqIds = new Set(reqs.map(r=>r.id));
  const us = model.uncertainties || [], uIds = new Set(us.map(u=>u.id));
  check(stories.length === model.targetStoryCount, "Nombre de stories différent du total attendu");
  check(ids.size === stories.length, "Identifiants de stories dupliqués");
  check(new Set(stories.map(s=>s.card)).size === stories.length, "Cards intégralement dupliquées");
  check(new Set(stories.map(s=>s.title)).size === stories.length, "Titres dupliqués");
  check(categories.reduce((n,c)=>n+c.target,0) === stories.length, "Somme des catégories incohérente");
  check(sourceReqIds.size === reqIds.size && [...sourceReqIds].every(id=>reqIds.has(id)), "Exigences différentes du référentiel fonctionnel");
  check(sourceUIds.size === uIds.size && [...sourceUIds].every(id=>uIds.has(id)), "Inconnues différentes du registre");
  check(reqIds.size === reqs.length && uIds.size === us.length, "Références documentaires dupliquées");
  check(model.definitionOfDone.length === 10, "DoD commune incomplète");
  const dodIds = new Set(model.definitionOfDone.map(d=>d.id));
  const acIds = new Set();
  for (const c of categories) {
    const ss = stories.filter(s=>s.category === c.code), content = files[c.file] || "";
    check(ss.length === c.target, "Effectif de catégorie incorrect : "+c.code);
    check(Boolean(content), "Fichier de catégorie absent : "+c.file);
    check([...content.matchAll(/^## US-[A-Z]{3}-\d{3} — /gm)].length === ss.length, "Nombre de fiches Markdown incorrect : "+c.code);
    ss.forEach((s,i)=>check(s.id === `US-${c.code}-${String(i+1).padStart(3,"0")}`, "Numérotation incohérente : "+s.id));
  }
  for (const s of stories) {
    const prefix = s.id+": ";
    const cat = categories.find(c=>c.code === s.category);
    check(Boolean(cat), prefix+"catégorie inconnue");
    check(/^US-[A-Z]{3}-\d{3}$/.test(s.id), prefix+"format ID invalide");
    check(["P0","P1","P2"].includes(s.priority), prefix+"priorité inconnue");
    check(["read","write"].includes(s.kind), prefix+"nature inconnue");
    check(Boolean(model.evidenceNames[s.evidence]), prefix+"marque de preuve inconnue");
    check(s.phases.length > 0 && s.phases.every(p=>Boolean(model.phaseNames[p])) && new Set(s.phases).size === s.phases.length, prefix+"phases invalides");
    for (const field of ["actor","want","value","given","success","negative","boundary","rules","discussion","source"]) check(typeof s[field]==="string" && s[field].trim().length>0, prefix+"champ manquant "+field);
    check(s.card === `En tant que ${s.actor}, je souhaite ${s.want} afin de ${s.value}.`, prefix+"Card divergente");
    check(s.requirements.length > 0 && s.requirements.every(r=>reqIds.has(r)), prefix+"référence d’exigence invalide");
    check(s.requirements.every(r=>reqs.find(x=>x.id===r)?.inScope), prefix+"exigence hors périmètre dans une fiche active");
    check(s.uncertainties.every(u=>uIds.has(u)), prefix+"inconnue invalide");
    check(s.dependencies.every(id=>ids.has(id) && id!==s.id), prefix+"dépendance invalide");
    check(new Set(s.dependencies).size===s.dependencies.length, prefix+"dépendance dupliquée");
    check(s.sourceReferences.every(path=>paths.has(path)) && paths.has(s.source), prefix+"source absente");
    check(s.acceptanceCriteria.length === 5, prefix+"cinq critères requis");
    check(["nominal","refus_ou_exception","frontiere","coherence","autorisation"].every(t=>s.acceptanceCriteria.some(a=>a.type===t)), prefix+"famille de critère absente");
    for (const [i,a] of s.acceptanceCriteria.entries()) {
      check(a.id === s.id+"-CA"+String(i+1).padStart(2,"0") && !acIds.has(a.id), prefix+"ID de critère invalide/dupliqué");
      acIds.add(a.id);
      check([a.given,a.when,a.then].every(v=>typeof v==="string" && v.trim()), a.id+": scénario incomplet");
    }
    check(Object.keys(s.invest).sort().join("")==="EINSTV", prefix+"INVEST incomplet");
    for (const item of Object.values(s.invest)) check(Boolean(item.status && item.assessment), prefix+"évaluation INVEST vide");
    check(s.definitionOfDone.required.length===dodIds.size && s.definitionOfDone.required.every(id=>dodIds.has(id)), prefix+"références DoD incomplètes");
    check(Boolean(s.definitionOfDone.demonstration && s.definitionOfDone.priorityBoundary), prefix+"DoD spécifique absente");
    check(Boolean(s.conversation.question) && s.conversation.question===s.discussion, prefix+"Conversation divergente");
    const content = cat ? files[cat.file] || "" : "";
    const anchor=`<a id="${s.id.toLowerCase()}"></a>`;
    const start=content.indexOf(anchor), end=start>=0?content.indexOf('<a id="us-', start+anchor.length):-1;
    const section=start>=0?content.slice(start,end<0?undefined:end):"";
    check(start>=0 && section.includes(s.card), prefix+"fiche Markdown ou Card absente");
    check(section.includes(s.discussion) && section.includes(s.rules), prefix+"règles ou Conversation Markdown divergentes");
    for (const a of s.acceptanceCriteria) check(section.includes(a.id) && [a.given,a.when,a.then].every(v=>section.includes(v)), a.id+": Markdown divergent");
    for (const item of Object.values(s.invest)) check(section.includes(item.assessment), prefix+"INVEST Markdown divergent");
    check(section.includes(s.definitionOfDone.demonstration) && section.includes(s.boundary.replace("=>"," → ")), prefix+"DoD Markdown divergente");
  }
  const active=reqs.filter(r=>r.inScope), uncovered=active.filter(r=>!stories.some(s=>s.requirements.includes(r.id))).map(r=>r.id);
  check(uncovered.length===0,"Exigences actives sans fiche : "+uncovered.join(", "));
  check(reqs.filter(r=>!r.inScope).map(r=>r.id).sort().join(",")==="REQ-COOP-01,REQ-TOURNAMENT-01","Exclusions de profil inattendues");
  const state={}, visit=(id,stack=[])=>{
    if(state[id]===1) { check(false,"Cycle : "+[...stack,id].join(" -> ")); return; }
    if(state[id]===2 || !ids.has(id)) return;
    state[id]=1;
    stories.find(s=>s.id===id).dependencies.forEach(d=>visit(d,[...stack,id]));
    state[id]=2;
  };
  stories.forEach(s=>visit(s.id));
  check(Object.values(state).every(v=>v===2),"Parcours de dépendances incomplet");
  const normalize=(path)=>{
    const parts=[]; for(const part of path.split("/")){if(!part||part===".")continue; if(part==="..")parts.pop();else parts.push(part);}return parts.join("/");
  };
  for (const [path,content] of Object.entries(files).filter(([p])=>p.endsWith(".md"))) {
    for(const hit of content.matchAll(/\[[^\]]*\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)){
      const target=hit[1]; if(/^[a-z]+:/i.test(target)||target.startsWith("//"))continue;
      const [file,fragment]=target.split("#");
      const dest=file?normalize(path.split("/").slice(0,-1).join("/")+"/"+decodeURIComponent(file)):path;
      linksChecked++;
      check(paths.has(dest),path+": lien local absent "+target);
      if(fragment && files[dest] && (dest.startsWith("docs/backlog/") || dest==="data/backlog/README.md")) {
        check(files[dest].includes(`id="${fragment}"`) || files[dest].includes(`name="${fragment}"`),path+": ancre absente "+target);
      }
    }
    for(const hit of content.matchAll(/\bUS-[A-Z]{3}-\d{3}\b/g)) check(ids.has(hit[0]), path+": ID de story inconnu "+hit[0]);
  }
  const parsed=JSON.parse(files["data/backlog/user-stories.json"]);
  check(JSON.stringify(parsed)===JSON.stringify(model),"JSON publié différent du modèle validé");
  check(stories.every(s=>files["docs/backlog/INDEX-STORIES.md"]?.includes(s.id)), "Index incomplet");
  check(stories.every(s=>files["docs/backlog/STORY-MAP.md"]?.includes(s.id)), "Story map incomplète");
  check(stories.every(s=>files["docs/backlog/COUVERTURE.md"]?.includes(s.id)), "Couverture incomplète");
  const conditional=stories.filter(s=>s.evidence==="HYP").length;
  const unqualified=stories.filter(s=>s.uncertainties.length).length;
  warnings.push(`${conditional} fiches conditionnelles HYP ; ${unqualified} fiches avec inconnues locales. Aucune vérification documentaire ne qualifie leurs règles historiques.`);
  return {ok:errors.length===0, assertions, linksChecked, errors, warnings, metrics:{stories:stories.length,categories:categories.length,acceptanceCriteria:acIds.size,activeRequirements:active.length,coveredRequirements:active.length-uncovered.length,excludedRequirements:reqs.filter(r=>!r.inScope).length,conditionalStories:conditional,storiesWithUnknowns:unqualified}};
}

const root = fileURLToPath(new URL("../", import.meta.url));
const repositoryPaths=[];
function walk(dir) {
  for (const entry of fs.readdirSync(dir,{withFileTypes:true})) {
    if ([".git","node_modules",".next"].includes(entry.name)) continue;
    const absolute=path.join(dir,entry.name);
    if (entry.isDirectory()) walk(absolute);
    else repositoryPaths.push(path.relative(root,absolute).split(path.sep).join("/"));
  }
}
walk(root);
const required=["README.md","docs/specifications/FONCTIONNEL.md","docs/specifications/PLAN-DE-RECONSTRUCTION.md","docs/research/INCERTITUDES.md","data/backlog/user-stories.json","data/backlog/README.md"];
const names=[...new Set([...required,...repositoryPaths.filter(p=>p.startsWith("docs/backlog/")&&p.endsWith(".md"))])];
try {
  const files=Object.fromEntries(names.map(p=>[p,fs.readFileSync(path.join(root,p),"utf8")]));
  const model=JSON.parse(files["data/backlog/user-stories.json"]);
  const report=validateBacklog(model,files,repositoryPaths);
  console.log(JSON.stringify(report,null,2));
  process.exitCode=report.ok?0:1;
} catch(error) {
  console.error("Validation du backlog impossible :",error.message);
  process.exitCode=1;
}
