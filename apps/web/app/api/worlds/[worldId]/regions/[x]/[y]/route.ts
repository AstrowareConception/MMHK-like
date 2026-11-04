import {NextResponse} from "next/server";
import {privateApi,sessionToken} from "../../../../../../../lib/server-api";

export const dynamic="force-dynamic";

export async function GET(_request:Request,{params}:{
  params:Promise<{worldId:string;x:string;y:string}>
}){
  const {worldId,x,y}=await params;
  if(!/^[a-z0-9_-]{1,64}$/.test(worldId)||
    !/^\d{1,6}$/.test(x)||!/^\d{1,6}$/.test(y)){
    return NextResponse.json({error:"Invalid coordinates"},{status:400});
  }
  const token=await sessionToken();
  if(!token)return NextResponse.json({error:"Unauthenticated"},{status:401});
  const result=await privateApi(
    "/api/v1/me/worlds/"+encodeURIComponent(worldId)+
    "/regions/"+x+"/"+y,token
  );
  return NextResponse.json(result.ok?result.data:{error:"Region unavailable"},{
    status:result.ok?200:result.status,
    headers:{"Cache-Control":"private, no-store"}
  });
}
