import { NextRequest, NextResponse } from "next/server";
import { readFileSync } from "node:fs";
import { privateAssetFile } from "../../../../lib/assets/runtime";
import { privateApi, sessionToken } from "../../../../lib/server-api";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
const denied = () => new NextResponse(null, {
  status: 404, headers: { "Cache-Control":"private, no-store", "X-Robots-Tag":"noindex" }
});
export async function GET(request: NextRequest, context: {params:Promise<{id:string}>}) {
  // The local Docker preview publishes port 3000 to the LOOPBACK interface only.
  if (!["localhost","127.0.0.1","[::1]","::1"].includes(request.nextUrl.hostname))
    return denied();
  const {id} = await context.params;
  const token = await sessionToken();
  if (!token || !privateAssetFile(id)) return denied();
  const who = await privateApi<unknown[]>("/api/v1/me/worlds",token);
  if (!who.ok) return denied();
  const file = privateAssetFile(id);
  if (!file) return denied();
  try {
    return new NextResponse(new Uint8Array(readFileSync(file.path)), {
      headers: {
        "Content-Type":file.mime, "Cache-Control":"private, no-store",
        "X-Content-Type-Options":"nosniff", "X-Robots-Tag":"noindex"
      }
    });
  } catch {return denied();}
}
