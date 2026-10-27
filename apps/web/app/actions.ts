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
  try {
    const response = await fetch(apiUrl("/api/v1/sessions"), {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
      cache: "no-store",
      signal: AbortSignal.timeout(4000),
    });
    if (response.ok) {
      const payload = (await response.json()) as { access_token?: string };
      bearer = payload.access_token;
    }
  } catch {
    redirect("/?error=unavailable");
  }
  if (!bearer) redirect("/?error=credentials");
  (await cookies()).set("mmhk_session", bearer, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
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
