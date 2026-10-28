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

export type WorldOverview = World & {
  topology: "torus";
  known_scope: "owned_cities_only" | "owned_and_discovered";
  cities: City[];
  enemy_positions_exposed: boolean;
  world_terrain_loaded: boolean;
  discovered_cities: {city_id:string;name:string;x:number;y:number}[];
  visible_sites: {site_id:string;kind:"sphinx"|"obelisk"|"dolmen"|"portal"|"relic"|"special";label:string;x:number;y:number}[];
  visible_influence: {x:number;y:number;controller:string;is_mine:boolean;observed_at:string}[];
};

export type RegionView = {
  city_id: string;
  world_id: string;
  city_name: string;
  world_x: number;
  world_y: number;
  world_size: number;
  region_width: 5;
  region_height: 5;
  cell_layout: "illustrative_unmapped";
  mine_types_unlocated: string[];
  mine_positions_known: false;
  cells: {
    i: number;
    j: number;
    kind: "owned_city" | "unmapped";
    city_id: string | null;
  }[];
  surrounding_world_regions: {
    dx: number;
    dy: number;
    x: number;
    y: number;
    is_current: boolean;
  }[];
  historical_regional_terrain_certified: false;
  encounters: RegionEncounter[];
};

export type CityForces = {
  city_id:string;
  garrison: {unit_code:string;name:string;quantity:number;tier:number}[];
  recruitment: {unit_code:string;name:string;dwelling_code:string;tier:number;
    unit_costs:Record<string,number>;policy_id:string;available:number;unlocked:boolean}[];
  hero_armies:{hero_id:string;unit_code:string;name:string;quantity:number;tier:number}[];
  heroes: {hero_id:string;name:string;archetype:"might"|"magic";
    level:number;experience:number;status:string;hired_at:string}[];
  hero_offers:{offer_id:string;name:string;archetype:"might"|"magic";
    gold_cost:number;policy_id:string}[];
  tavern_unlocked:boolean;
  hero_capacity:number;
  historically_certified:false;
};

export type ArtifactItem = {
  artifact_id:string; artifact_code:string; name:string; slot:string;
  required_level:number; effects:Record<string,unknown>; policy_id:string;
  historically_certified:boolean; location:"reserve"|"bag"|"equipped";
  hero_id:string|null; equipped_slot:string|null;
};
export type ArtifactInventory = {
  city_id:string; slots:string[]; equipment_budget_policy:string;
  effects_applied_to_combat:boolean; artifacts:ArtifactItem[];
};
export type RegionEncounter = {
  encounter_id:string; i:number;j:number;name:string;unit_code:string;
  unit_count:number;unit_power:number;source_ref:string;historically_certified:boolean;
};
export type DuelPreview = {
  scope:string;preview_only:true;note:string;hero_id:string;hero_name:string;
  unit_code:string;encounter_id:string;encounter_name:string;i:number;j:number;
  outcome:{basePower:{attacker:number;defender:number};
    totalPower:{attacker:number;defender:number};
    remaining:{attacker:number;defender:number};
    losses:{attacker:number;defender:number};
    draw:boolean;note:string};
};

export type PveMission={
  mission_id:string;hero_id:string;hero_name:string;encounter_name:string;
  target_i:number;target_j:number;stage:"outbound"|"returning"|"completed";
  unit_code:string;stack_count:number;travel_seconds:number;travel_policy_id:string;
  started_at:string;arrival_due_at:string;return_due_at:string;
  arrived_at:string|null;returned_at:string|null;
  duel_report:{scope:string;preview_only:boolean;outcome:{
    totalPower:{attacker:number;defender:number};remaining:{attacker:number;defender:number}
  }}|null;
};
export type PveMissionsResponse={
  city_id:string;server_now:string;historically_certified:false;
  travel_policy:{seconds_per_step:number;policy_id:string}|null;
  missions:PveMission[];
};
