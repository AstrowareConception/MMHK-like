#!/usr/bin/env node
/** Verify the 300-story implementation review stays synchronized with the
 * authoritative backlog index. This does NOT attest gameplay acceptance.
 */
import {readFileSync} from "node:fs";
import {fileURLToPath} from "node:url";
import path from "node:path";

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),"..");
const index=readFileSync(path.join(root,"docs/backlog/INDEX-STORIES.md"),"utf8");
const csv=readFileSync(path.join(root,"data/backlog/implementation-review-2026-11-04.csv"),"utf8");
const expected=[...index.matchAll(/\[US-([A-Z]{3})-(\d{3})\]\(([^)]+)\)\s*\|\s*([^|]+)\|\s*(P[0-2])/g)]
  .map(m=>({id:`US-${m[1]}-${m[2]}`,priority:m[5]}));
if(expected.length!==300)throw new Error(`Expected 300 backlog US; found ${expected.length}`);

function parseCSV(input){
  const lines=[];let fields=[],part="",quoted=false;
  for(let i=0;i<input.length;i++){
    const c=input[i];
    if(quoted&&c==='"'&&input[i+1]==='"'){part+='"';i++;continue;}
    if(c==='"'){quoted=!quoted;continue;}
    if(!quoted&&c===','){fields.push(part);part="";continue;}
    if(!quoted&&c==='\n'){fields.push(part);part="";lines.push(fields);
      fields=[];part="";continue;}
    if(c!=='\r'||quoted)part+=c;
  }
  if(quoted)throw new Error("Unclosed CSV quote");
  if(part||fields.length){fields.push(part);lines.push(fields);}
  return lines;
}
const rows=parseCSV(csv);
const columns=["us_id","priorite","besoin","etat_audit","preuve_code_candidate","dod","commentaire"];
if(JSON.stringify(rows.shift())!==JSON.stringify(columns))
  throw new Error("Review file columns changed");
if(rows.length!==300)throw new Error(`Expected 300 tracked rows; found ${rows.length}`);
const actual=new Map();
for(const row of rows){
  if(row.length!==columns.length)throw new Error("Invalid field count");
  const [id,priority,,state,source,dod]=row;
  if(actual.has(id))throw new Error("Duplicate "+id);
  if(!["code_candidat_a_recetter","implementation_non_verifiee"].includes(state))
    throw new Error("Unsupported status "+state);
  if(state==="code_candidat_a_recetter"&&!source)
    throw new Error("Missing candidate evidence "+id);
  if(dod!=="non_acceptee")
    throw new Error("Acceptance must be tracked separately with five executed criteria and explicit approval");
  actual.set(id,{priority});
}
for(const item of expected){
  const row=actual.get(item.id);
  if(!row||row.priority!==item.priority)
    throw new Error("Missing/changed backlog US "+item.id);
}
console.log("OK — 300/300 stories traced; no acceptance inferred from source files.");
