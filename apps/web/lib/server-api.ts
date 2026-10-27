import "server-only";
import { cookies } from "next/headers";

export type World = { world_id: string; name: string; world_size: number };
export type City = {
  city_id: string;
  name: string;
  x: number;
  y: number;
  first_city: boolean;
};
export type CityDetail = City & {
  world_id: string;
  stocks: Record<string, number>;
  mines: string[];
  production_active: boolean;
  historical_economy_certified: boolean;
};

export async function sessionToken(): Promise<string | undefined> {
  return (await cookies()).get("mmhk_session")?.value;
}

// Runs only on the Next.js server. This private bearer never enters the HTML.
export async function privateApi<T>(
  pathname: string,
  token: string,
): Promise<{ ok: boolean; status: number; data?: T }> {
  const base = process.env.MMHK_API_INTERNAL_URL ?? "http://127.0.0.1:8000";
  try {
    const response = await fetch(new URL(pathname, base), {
      cache: "no-store",
      headers: { Authorization: `Bearer ${token}` },
      signal: AbortSignal.timeout(4000),
    });
    return {
      ok: response.ok,
      status: response.status,
      data: response.ok ? ((await response.json()) as T) : undefined,
    };
  } catch {
    return { ok: false, status: 503 };
  }
}
