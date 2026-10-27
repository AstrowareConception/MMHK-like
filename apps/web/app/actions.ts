"use server";

import { cookies } from "next/headers";
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
