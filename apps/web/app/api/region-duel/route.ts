import {NextRequest,NextResponse} from "next/server";
import {sessionToken} from "../../../lib/server-api";

export const runtime="nodejs";
export const dynamic="force-dynamic";

export async function POST(request:NextRequest) {
  const token=await sessionToken();
  if(!token)return NextResponse.json({error:"Connexion nécessaire"},{status:401});
  let body:unknown;
  try{body=await request.json();}catch{return NextResponse.json({error:"Requête invalide"},{status:400});}
  if(!body||typeof body!=="object"||Array.isArray(body))
    return NextResponse.json({error:"Requête invalide"},{status:400});
  const obj=body as Record<string,unknown>,uuid=/^[0-9a-f-]{36}$/i;
  const {city_id,encounter_id,hero_id,unit_code}=obj;
  if(typeof city_id!=="string"||!uuid.test(city_id)||
     typeof encounter_id!=="string"||!uuid.test(encounter_id)||
     typeof hero_id!=="string"||!uuid.test(hero_id)||
     typeof unit_code!=="string"||!/^[a-z][a-z0-9_]{1,47}$/.test(unit_code))
    return NextResponse.json({error:"Identifiants incorrects"},{status:422});
  const url=new URL("/api/v1/me/cities/"+city_id+"/encounters/"+encounter_id+"/preview",
    process.env.MMHK_API_INTERNAL_URL??"http://127.0.0.1:8000");
  try{
    const result=await fetch(url,{method:"POST",headers:{
      Authorization:"Bearer "+token,"Content-Type":"application/json"
    },body:JSON.stringify({hero_id,unit_code}),cache:"no-store",signal:AbortSignal.timeout(8000)});
    if(!result.ok)return NextResponse.json({error:result.status===409?
      "Héros indisponible ou armée non configurée":"Rencontre ou héros inaccessible"},
      {status:result.status,headers:{"Cache-Control":"private, no-store"}});
    return NextResponse.json(await result.json(),{headers:{"Cache-Control":"private, no-store"}});
  }catch{
    return NextResponse.json({error:"Le simulateur est momentanément indisponible"},
      {status:503,headers:{"Cache-Control":"private, no-store"}});
  }
}
