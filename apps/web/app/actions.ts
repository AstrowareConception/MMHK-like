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
  let selectedTile="";
  try{
    const response=await fetch(apiUrl("/api/v1/me/cities/"+cityId+"/missions"),{
      method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      body:JSON.stringify({mission_id:randomUUID(),hero_id:heroId,encounter_id:encounterId,
        unit_code:unitCode}),cache:"no-store",signal:AbortSignal.timeout(7000)
    });
    status=response.status;
    if(response.ok){
      const receipt=(await response.json()) as {target_i?:number;target_j?:number};
      if(Number.isInteger(receipt.target_i)&&Number.isInteger(receipt.target_j)&&
        (receipt.target_i??-1)>=0&&(receipt.target_i??5)<=4&&
        (receipt.target_j??-1)>=0&&(receipt.target_j??5)<=4)
        selectedTile="&tile="+receipt.target_i+"-"+receipt.target_j;
    }
  }catch { /* Unknown result is not automatically retried with a new UUID. */ }
  if(status===401)redirect("/");
  redirect("/cities/"+cityId+"/region?mission="+(status===200||status===201?"ok":
    status===409?"conflict":"unavailable")+selectedTile);
}


/** Confirm a server-provided merchant quote. The quote form supplies ONE UUID
 * generated at render time, so double-clicks replay the same order. Never
 * generate a new UUID while retrying an uncertain payment.
 */
export async function tradeCityResources(form:FormData) {
  const cityId=form.get("cityId"),orderId=form.get("orderId");
  const pay=form.get("payResource"),receive=form.get("receiveResource");
  const amount=form.get("payAmount"),expected=form.get("expectedReceive");
  const policy=form.get("policyId");
  const numerator=form.get("expectedNumerator"),denominator=form.get("expectedDenominator");
  const uuid=/^[a-f0-9-]{36}$/i;
  const isResource=(x:FormDataEntryValue|null):x is string=>
    typeof x==="string" && /^(gold|wood|ore|crystal|gems|sulfur|mercury)$/.test(x);
  if(typeof cityId!=="string"||!uuid.test(cityId)||
     typeof orderId!=="string"||!uuid.test(orderId)||
     !isResource(pay)||!isResource(receive)||pay===receive||
     typeof amount!=="string"||!/^[0-9]{1,7}$/.test(amount)||
     typeof expected!=="string"||!/^[0-9]{1,13}$/.test(expected)||
     typeof numerator!=="string"||!/^[0-9]{1,7}$/.test(numerator)||
     typeof denominator!=="string"||!/^[0-9]{1,7}$/.test(denominator)||
     typeof policy!=="string"||policy.length<3||policy.length>100)
    redirect("/");
  const paid=Number(amount),given=Number(expected);
  const num=Number(numerator),den=Number(denominator);
  if(!Number.isSafeInteger(paid)||paid<1||paid>1000000||
     !Number.isSafeInteger(given)||given<1||given>1000000000000||
     !Number.isSafeInteger(num)||num<1||num>1000000||
     !Number.isSafeInteger(den)||den<1||den>1000000)
    redirect("/cities/"+cityId+"/market?trade=invalid");
  const token=(await cookies()).get("mmhk_session")?.value;
  if(!token)redirect("/");
  let status=503;
  try{
    const response=await fetch(apiUrl("/api/v1/me/cities/"+cityId+"/market"),{
      method:"POST",
      headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      body:JSON.stringify({order_id:orderId,pay_resource:pay,
        receive_resource:receive,pay_amount:paid,
        expected_policy_id:policy,expected_receive_amount:given,
        expected_numerator:num,expected_denominator:den}),
      cache:"no-store",signal:AbortSignal.timeout(7000),
    });
    status=response.status;
  }catch{/* Unknown result: consult the transaction ledger, do NOT auto-retry. */}
  if(status===401)redirect("/");
  redirect("/cities/"+cityId+"/market?trade="+
    (status===200||status===201?"ok":status===409?"conflict":"unavailable"));
}


/** Fixed price marketplace: all UUIDs originate in server-rendered forms.
 * A timeout does not create a new command. PostgreSQL is the only arbiter.
 */
function marketUuid(value: FormDataEntryValue|null):value is string {
  return typeof value==="string" && /^[a-f0-9-]{36}$/i.test(value);
}
function marketResource(value: FormDataEntryValue|null):value is string {
  return typeof value==="string" &&
    /^(gold|wood|ore|crystal|gems|sulfur|mercury)$/.test(value);
}
function marketInteger(value: FormDataEntryValue|null, maximum:number):number|null {
  if(typeof value!=="string" || !/^[0-9]{1,7}$/.test(value))return null;
  const number=Number(value);
  return Number.isSafeInteger(number)&&number>=1&&number<=maximum?number:null;
}
async function marketPost(path:string,payload:unknown){
  const token=(await cookies()).get("mmhk_session")?.value;
  if(!token)return 401;
  try{
    const result=await fetch(apiUrl(path),{
      method:"POST",headers:{"Authorization":"Bearer "+token,"Content-Type":"application/json"},
      body:JSON.stringify(payload),cache:"no-store",signal:AbortSignal.timeout(7000),
    });
    if(result.status===401)return 401;
    if(result.status===200||result.status===201){
      if(path.endsWith("/withdraw")){
        const receipt=await result.json() as {escrow_recovered?:boolean};
        return receipt.escrow_recovered?"recovered":"stored";
      }
      return "ok";
    }
    return result.status===409||result.status===404?"conflict":"unavailable";
  }catch {return "unavailable";}
}
export async function publishMarketplaceOffer(form:FormData){
  const cityId=form.get("cityId"),orderId=form.get("orderId");
  const resource=form.get("resource"),priceResource=form.get("priceResource");
  const quantity=marketInteger(form.get("quantity"),1000000);
  const price=marketInteger(form.get("priceAmount"),1000000);
  const duration=marketInteger(form.get("durationSeconds"),604800);
  if(!marketUuid(cityId)||!marketUuid(orderId)||!marketResource(resource)||
     !marketResource(priceResource)||resource===priceResource||
     quantity===null||price===null||duration===null||duration<60)redirect("/");
  const result=await marketPost("/api/v1/me/cities/"+cityId+"/market/offers",{
    order_id:orderId,resource,quantity,price_resource:priceResource,
    price_amount:price,duration_seconds:duration,
  });
  if(result===401)redirect("/");
  redirect("/cities/"+cityId+"/market?offer="+(result==="ok"?"published":result)+"#marketplace");
}
export async function buyMarketplaceOffer(form:FormData){
  const cityId=form.get("cityId"),orderId=form.get("orderId");
  const offerId=form.get("offerId");
  const resource=form.get("resource"),priceResource=form.get("priceResource");
  const quantity=marketInteger(form.get("quantity"),1000000);
  const price=marketInteger(form.get("priceAmount"),1000000);
  if(!marketUuid(cityId)||!marketUuid(offerId)||!marketUuid(orderId)||
     !marketResource(resource)||!marketResource(priceResource)||
     resource===priceResource||quantity===null||price===null)redirect("/");
  const result=await marketPost(
    "/api/v1/me/cities/"+cityId+"/market/offers/"+offerId+"/buy",
    {order_id:orderId,expected_resource:resource,expected_quantity:quantity,
     expected_price_resource:priceResource,expected_price_amount:price});
  if(result===401)redirect("/");
  redirect("/cities/"+cityId+"/market?offer="+(result==="ok"?"bought":result)+"#marketplace");
}
export async function withdrawMarketplaceOffer(form:FormData){
  const cityId=form.get("cityId"),orderId=form.get("orderId");
  const offerId=form.get("offerId");
  if(!marketUuid(cityId)||!marketUuid(offerId)||!marketUuid(orderId))redirect("/");
  const result=await marketPost(
    "/api/v1/me/cities/"+cityId+"/market/offers/"+offerId+"/withdraw",
    {order_id:orderId});
  if(result===401)redirect("/");
  redirect("/cities/"+cityId+"/market?offer="+result+"#marketplace");
}
