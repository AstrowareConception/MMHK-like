import {NextResponse} from "next/server";
import {sessionToken,privateApi} from "../../../lib/server-api";
import type {TimelineResponse} from "../../../lib/timeline";
export const dynamic="force-dynamic";
export async function GET(request:Request) {
  const token=await sessionToken();
  if(!token)return NextResponse.json({error:"unauthorized"},{status:401,headers:{"Cache-Control":"no-store"}});
  const hours=new URL(request.url).searchParams.get("hours")??"12";
  if(!/^\d{1,2}$/.test(hours)||Number(hours)<1||Number(hours)>48)
    return NextResponse.json({error:"invalid hours"},{status:422});
  const response=await privateApi<TimelineResponse>("/api/v1/me/timeline?hours="+hours,token);
  if(!response.ok)return NextResponse.json({error:"timeline unavailable"},{status:response.status,headers:{"Cache-Control":"no-store"}});
  return NextResponse.json(response.data,{headers:{"Cache-Control":"private,no-store"}});
}
