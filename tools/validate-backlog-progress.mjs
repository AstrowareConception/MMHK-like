#!/usr/bin/env node
// Validate separate LAB implementation progress; never infer historical DoD.
import fs from "node:fs";
const root=new URL("../",import.meta.url);
const model=JSON.parse(fs.readFileSync(new URL("data/backlog/user-stories.json",root),"utf8"));
const csv=fs.readFileSync(new URL("data/backlog/implementation-progress-2026-11-05.csv",root),"utf8");
function parseCSV(input){
  const rows=[];let row=[],field="",inside=false;
  for(let i=0;i<input.length;i++){
    const x=input[i];
    if(inside&&x==='"'&&input[i+1]==='"'){field+='"';i++;continue}
    if(x==='"'){inside=!inside;continue}
    if(!inside&&x===','){row.push(field);field="";continue}
    if(!inside&&x==='\n'){row.push(field);rows.push(row);row=[];field="";continue}
    if(x!=='\r'||inside)field+=x;
  }
  if(inside)throw Error("Unterminated CSV");
  if(field||row.length){row.push(field);rows.push(row)}
  return rows;
}
const rows=parseCSV(csv);
const header=["us_id","priorite","etat_livraison_lab","acceptation_classique","preuve_technique","reste_a_faire"];
if(JSON.stringify(rows.shift())!==JSON.stringify(header))throw Error("Wrong progress columns");
if(model.stories.length!==300||rows.length!==300)throw Error("Expected exactly 300 stories");
const seen=new Set();let done=0,partial=0;
for(let i=0;i<model.stories.length;i++){
  const s=model.stories[i],r=rows[i];
  if(r.length!==6||r[0]!==s.id||r[1]!==s.priority||seen.has(s.id))
    throw Error("Broken progress record "+s.id);
  seen.add(s.id);
  const implementation=s.implementationLab;
  if(r[2]!== (implementation?.status||"non_evaluee_dans_cette_revue"))
    throw Error("LAB status differs from JSON "+s.id);
  if(r[3]!=="non_acceptee"||s.definitionOfDone.checksComplete!==false
     ||s.status!=="a_affiner"||s.ready!==false)
    throw Error("Historical acceptance changed without approval "+s.id);
  if(implementation){
    if(implementation.historicalAcceptance!==false||
       !implementation.technicalEvidence||!implementation.notYetAccepted)
       throw Error("Unqualified delivery "+s.id);
    if(r[4]!==implementation.technicalEvidence||r[5]!==implementation.notYetAccepted)
       throw Error("Evidence differs "+s.id);
    const category=model.categories.find(c=>c.code===s.category);
    const markdown=fs.readFileSync(new URL(category.file,root),"utf8");
    const from=markdown.indexOf("## "+s.id+" —");
    const to=markdown.indexOf("\n## US-",from+4);
    if(from<0||!markdown.slice(from,to<0?undefined:to).includes(implementation.summary))
       throw Error("Missing Markdown technical status "+s.id);
    if(implementation.status==="terminee_techniquement_lab")done++;
    else if(implementation.status==="partielle_validee_lab")partial++;
    else throw Error("Invalid implementationLab status "+s.id);
  }
}
if(done!==5||partial!==12)throw Error("Progress inventory differs");
console.log("OK — 300/300 US; "+done+" technically done LAB; "+partial+" partially delivered LAB; 0 historical accepted.");
