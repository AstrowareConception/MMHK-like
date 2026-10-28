"use server";

import { cookies } from "next/headers";
import { randomUUID } from "node:crypto";
import { redirect } from "next/navigation";

function apiUrl(path: string) {
  const base = process.env.MMHK_API_INTERNAL_URL ?? "http://127.0.0.1:8000";
  return new URL(path, base);
}

// A Server Action keeps the bearer token inside an HttpOnly cookie and never
// stores it in localStorage, a query parameter or a browser-side React state.
export async function signIn(data: FormData) {
  const username = data.get("username");
  const password = data.get("password");
  if (typeof username !== "string" || typeof password !== "string") {
    redirect("/?error=credentials");
  }
  let bearer: string | undefined;
  let limited = false;
  try {
    const response = await fetch(apiUrl("/api/v1/sessions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (response.status === 429) limited = true;
    if (response.ok) {
      const payload = (await response.json()) as { access_token?: string };
      bearer = payload.access_token;
    }
  } catch {
    redirect("/?error=unavailable");
  }
  if (limited) redirect("/?error=limited");
  if (!bearer) redirect("/?error=credentials");
  (await cookies()).set("mmhk_session", bearer, {
    httpOnly: true,
    // Private SSH preview uses HTTP *only on browser localhost*, never public.
    secure: process.env.NODE_ENV === "production" &&
      process.env.MMHK_PREVIEW_LOOPBACK_ONLY !== "true",
    sameSite: "lax",
    path: "/",
    maxAge: 8 * 60 * 60,
  });
  redirect("/");
}

export async function signOut() {
  const jar = await cookies();
  const token = jar.get("mmhk_session")?.value;
  if (token) {
    try {
      await fetch(apiUrl("/api/v1/sessions/current"), {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(4000),
      });
    } catch {
      // Local cookie deletion is still essential if the API is unavailable.
      // Server session expires naturally; surface monitoring is future work.
    }
  }
  jar.delete("mmhk_session");
  redirect("/");
}

/**
 * Construction is a server action, not a browser-owned economic calculation.
 * Fresh idempotency key per submitted form; API enforces one active job/city.
 */
export async function startUrbanConstruction(data: FormData) {
  const cityId = data.get("cityId");
  const buildingCode = data.get("buildingCode");
  const mode = data.get("mode");
  if (typeof cityId !== "string" || !/^[0-9a-f-]{36}$/i.test(cityId) ||
      typeof buildingCode !== "string" || !/^[a-z][a-z0-9_]{1,47}$/.test(buildingCode) ||
      !["normal", "rapid", "economic"].includes(String(mode))) {
    redirect("/");
  }
  const path = `/cities/${cityId}`;
  const token = (await cookies()).get("mmhk_session")?.value;
  if (!token) redirect("/");
  let status = 503;
  try {
    const response = await fetch(apiUrl(`/api/v1/me/cities/${cityId}/construction`), {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
      signal: AbortSignal.timeout(6000),
      body: JSON.stringify({
        order_id: randomUUID(), building_code: buildingCode, mode,
      }),
    });
    status = response.status;
  } catch {
    status = 503;
  }
  if (status === 401) redirect("/");
  if (status === 201 || status === 200) redirect(`${path}?build=started`);
  if (status === 409) redirect(`${path}?build=conflict`);
  redirect(`${path}?build=unavailable`);
}


/** Real city orders: prices and inventory are never taken from the browser. */
export async function recruitCityUnits(data:FormData) {
  const cityId=data.get("cityId"),unitCode=data.get("unitCode"),raw=data.get("quantity");
  if(typeof cityId!=="string"||!/^[0-9a-f-]{36}$/i.test(cityId)||
     typeof unitCode!=="string"||!/^[a-z][a-z0-9_]{1,47}$/.test(unitCode)||
     typeof raw!=="string"||!/^\d{1,4}$/.test(raw))redirect("/");
  const quantity=Number(raw);
  if(!Number.isInteger(quantity)||quantity<1||quantity>1000)redirect("/cities/"+cityId+"/forces?recruit=conflict#military-panel");
  const token=(await cookies()).get("mmhk_session")?.value;
  if(!token)redirect("/");
  let status=503;
  try {
    const response=await fetch(apiUrl("/api/v1/me/cities/"+cityId+"/recruit"),{
      method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      cache:"no-store",signal:AbortSignal.timeout(6000),
      body:JSON.stringify({order_id:randomUUID(),unit_code:unitCode,quantity}),
    });
    status=response.status;
  }catch {/* server down: show an explicit error without retrying a non-idempotent order */}
  if(status===401)redirect("/");
  redirect("/cities/"+cityId+"/forces?recruit="+(status===200||status===201?"ok":status===409?"conflict":"unavailable")+"#military-panel");
}
export async function hireCityHero(data:FormData) {
  const cityId=data.get("cityId"),offerId=data.get("offerId");
  if(typeof cityId!=="string"||!/^[0-9a-f-]{36}$/i.test(cityId)||
    typeof offerId!=="string"||!/^[0-9a-f-]{36}$/i.test(offerId))redirect("/");
  const token=(await cookies()).get("mmhk_session")?.value;
  if(!token)redirect("/");
  let status=503;
  try {
    const response=await fetch(apiUrl("/api/v1/me/cities/"+cityId+"/heroes/hire"),{
      method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      cache:"no-store",signal:AbortSignal.timeout(6000),
      body:JSON.stringify({order_id:randomUUID(),offer_id:offerId}),
    });
    status=response.status;
  }catch {/* Do not automatically retry an order without preserving its UUID. */}
  if(status===401)redirect("/");
  redirect("/cities/"+cityId+"/forces?hero="+(status===200||status===201?"ok":status===409?"conflict":"unavailable")+"#military-panel");
}


export async function transferHeroUnits(data:FormData) {
  const cityId=data.get("cityId"),heroId=data.get("heroId"),unitCode=data.get("unitCode");
  const amount=data.get("quantity"),direction=data.get("direction");
  if(typeof cityId!=="string"||!/^[0-9a-f-]{36}$/i.test(cityId)||
     typeof heroId!=="string"||!/^[0-9a-f-]{36}$/i.test(heroId)||
     typeof unitCode!=="string"||!/^[a-z][a-z0-9_]{1,47}$/.test(unitCode)||
     typeof amount!=="string"||!/^\d{1,4}$/.test(amount)||
     (direction!=="to_hero"&&direction!=="to_garrison"))redirect("/");
  const quantity=Number(amount);
  if(!Number.isInteger(quantity)||quantity<1||quantity>1000)
    redirect("/cities/"+cityId+"/forces?transfer=conflict#military-panel");
  const token=(await cookies()).get("mmhk_session")?.value;
  if(!token)redirect("/");
  let status=503;
  try{
    const response=await fetch(apiUrl("/api/v1/me/cities/"+cityId+"/forces/transfer"),{
      method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      body:JSON.stringify({order_id:randomUUID(),hero_id:heroId,unit_code:unitCode,
        quantity,direction}),
      cache:"no-store",signal:AbortSignal.timeout(6000),
    });
    status=response.status;
  }catch {/* An uncertain order must not be silently resubmitted. */}
  if(status===401)redirect("/");
  redirect("/cities/"+cityId+"/forces?transfer="+(status===200||status===201?"ok":
    status===409?"conflict":"unavailable")+"#military-panel");
}


/** Unique artifact move: never trust browser-side ownership or slot attributes. */
export async function moveCityArtifact(data:FormData) {
  const cityId=data.get("cityId"),artifactId=data.get("artifactId");
  const operation=data.get("operation"),target=data.get("targetHeroId");
  const originHero=data.get("returnHeroId");
  const uuid=/^[0-9a-f-]{36}$/i;
  if(typeof cityId!=="string"||!uuid.test(cityId)||
    typeof artifactId!=="string"||!uuid.test(artifactId)||
    typeof operation!=="string"||
    !["equip","unequip","to_reserve","to_bag","to_hero"].includes(operation)||
    (target!==null&&target!==""&&(typeof target!=="string"||!uuid.test(target))))redirect("/");
  const selected=(typeof originHero==="string"&&uuid.test(originHero))?originHero:"";
  const back="/cities/"+cityId+"/heroes?hero="+selected;
  const token=(await cookies()).get("mmhk_session")?.value;
  if(!token)redirect("/");
  let status=503;
  try{
    const response=await fetch(apiUrl("/api/v1/me/cities/"+cityId+"/artifacts/move"),{
      method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      body:JSON.stringify({order_id:randomUUID(),artifact_id:artifactId,
        operation,target_hero_id:target||null}),
      cache:"no-store",signal:AbortSignal.timeout(6000)
    });
    status=response.status;
  }catch {/* Uncertain command: never silently replay with a new UUID. */}
  if(status===401)redirect("/");
  redirect(back+"&artifact="+(status===200||status===201?"ok":status===409?"conflict":
    status===404?"missing":"unavailable"));
}


/** Confirm a real timed laboratory march; never start a battle from client state. */
export async function launchRegionalPveMission(form:FormData) {
  const cityId=form.get("cityId"),heroId=form.get("heroId");
  const encounterId=form.get("encounterId"),unitCode=form.get("unitCode");
  const uuid=/^[0-9a-f-]{36}$/i;
  if(typeof cityId!=="string"||!uuid.test(cityId)||
     typeof heroId!=="string"||!uuid.test(heroId)||
     typeof encounterId!=="string"||!uuid.test(encounterId)||
     typeof unitCode!=="string"||!/^[a-z][a-z0-9_]{1,47}$/.test(unitCode))redirect("/");
  const token=(await cookies()).get("mmhk_session")?.value;
  if(!token)redirect("/");
  let status=503;
  try{
    const response=await fetch(apiUrl("/api/v1/me/cities/"+cityId+"/missions"),{
      method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      body:JSON.stringify({mission_id:randomUUID(),hero_id:heroId,encounter_id:encounterId,
        unit_code:unitCode}),cache:"no-store",signal:AbortSignal.timeout(7000)
    });
    status=response.status;
  }catch { /* Unknown result is not automatically retried with a new UUID. */ }
  if(status===401)redirect("/");
  redirect("/cities/"+cityId+"/region?mission="+(status===200||status===201?"ok":
    status===409?"conflict":"unavailable"));
}
