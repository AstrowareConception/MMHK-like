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
  production_per_day: Record<string, string>;
  stock_capacities: Record<string, number | null>;
  building_effects: {
    mine_additive_bonus: Record<string, string>;
    capacity_bonus: Record<string, number>;
  };
  tick_seconds: number | null;
  next_credit_at: string | null;
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

export type ConstructionOrder = {
  order_id: string;
  building_code: string;
  target_level: number;
  mode: "normal" | "rapid" | "economic";
  policy_id: string;
  applied_costs: Record<string, number>;
  started_at: string;
  due_at: string;
  status: "building" | "completed";
  completed_at: string | null;
  historically_certified: boolean;
  replayed?: boolean;
};
export type ConstructionCatalog = {
  buildings: {
    building_code: string;
    level: number;
    active: boolean;
    operator_disabled: boolean;
    prerequisites: Record<string, number>;
  }[];
  active: ConstructionOrder | null;
  options: {
    building_code: string;
    target_level: number;
    policy_id: string;
    available: boolean;
    missing_prerequisites: string[];
    modes: {
      mode: "normal" | "rapid" | "economic";
      costs: Record<string, number>;
      duration_seconds: number;
      rounding_policy: string;
      historically_certified: boolean;
    }[];
  }[];
  effects: {
    mine_additive_bonus: Record<string, string>;
    capacity_bonus: Record<string, number>;
  };
};
