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
  history: ConstructionOrder[];
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
  influence_mode: "qualified_manual"|"experimental_dynamic";
  influence_revision:number|null;
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


export type MerchantCatalog = {
  city_id:string;
  merchant_unlocked:boolean;
  auctions_available:false;
  caravans_available:false;
  rounding_policy:string;
  historically_certified:false;
  rates:{pay_resource:string;receive_resource:string;policy_id:string;
    numerator:number;denominator:number}[];
  history:{order_id:string;pay_resource:string;receive_resource:string;
    pay_amount:number;receive_amount:number;policy_id:string;
    numerator:number;denominator:number;completed_at:string}[];
};

export type MerchantQuote = {
  city_id:string;pay_resource:string;receive_resource:string;
  pay_amount:number;receive_amount:number;policy_id:string;
  numerator:number;denominator:number;
  current_pay_stock:number;current_receive_stock:number;
  expected_pay_balance:number|null;expected_receive_balance:number|null;
  affordable:boolean;capacity_sufficient:boolean;can_execute:boolean;
  rounding_policy:string;historically_certified:false;
};


export type MarketplaceOffer = {
  offer_id:string;resource:string;quantity:number;
  price_resource:string;price_amount:number;
  policy_id:string;status:"active"|"sold"|"expired"|"cancelled";
  created_at:string;expires_at:string;
  escrow_claimed?:boolean;can_withdraw?:boolean;closed_at?:string|null;
};
export type MarketplacePolicy = {
  policy_id:string;max_quantity:number;max_price:number;
  min_duration_seconds:number;max_duration_seconds:number;
  delivery_mode:"instant_lab";
};
export type MarketplaceCatalog = {
  city_id:string;marketplace_unlocked:boolean;
  marketplace_policy:MarketplacePolicy|null;
  historically_certified:false;delivery_mode:"instant_lab"|null;
  offers:MarketplaceOffer[];my_offers:MarketplaceOffer[];
};

export type HeroFormation={
  city_id:string;hero_id:string;status:string;slots_count:7;
  historically_certified_s2:false;positions:{
    position:number;jactari_index:number;unit_code:string;quantity:number
  }[];saved:boolean;needs_configuration:boolean;
  available_units:{unit_code:string;name:string;quantity:number}[];jactari_scope:string;
};
export type MissionReport={
  mission_id:string;city_id:string;hero_id:string;hero_name:string;
  encounter_name:string;target_i:number;target_j:number;stage:PveMission["stage"];
  unit_code:string;stack_count:number;travel_policy_id:string;
  started_at:string;arrival_due_at:string;return_due_at:string;
  arrived_at:string|null;returned_at:string|null;
  historically_certified:false;
  formation_snapshot:{position:number;jactari_index:number;unit_code:string;quantity:number}[];
  duel_report:(PveMission["duel_report"]&{no_losses_applied?:boolean;no_rewards?:boolean})|null;
  events:{phase:"departed"|"arrived"|"returned";occurred_at:string}[];
};


export type CaravanPolicy={
  policy_id:string;capacity_units:number;
  resource_weights:Record<string,number>;seconds_per_tile:number;
};
export type CaravanShipment={
  shipment_id:string;world_id:string;
  source_city_id:string;destination_city_id:string;
  source_name:string;destination_name:string;
  policy_id:string;cargo:Record<string,number>;
  resource_weights:Record<string,number>;
  load_units:number;capacity_units:number;
  distance_steps:number;travel_seconds:number;
  dispatched_at:string;arrival_due_at:string;
  return_due_at:string|null;next_attempt_at:string|null;
  completed_at:string|null;
  status:"in_transit"|"returning"|"awaiting_storage"|"delivered"|"returned";
  return_leg:boolean;program_id:string|null;program_sequence:number|null;
  replayed:boolean;historically_certified:false;
};
export type CaravanCatalog={
  city_id:string;marketplace_active:boolean;
  transport_policy:CaravanPolicy|null;
  destinations:{city_id:string;name:string;x:number;y:number}[];
  shipments:CaravanShipment[];
  programs:CaravanProgram[];
  repetition_enabled:true;ally_destinations_enabled:false;
  historically_certified:false;
};
export type CaravanQuote={
  city_id:string;destination_city_id:string;destination_name:string;
  cargo:Record<string,number>;
  load_units:number;capacity_units:number;
  distance_steps:number;travel_seconds:number;
  policy_id:string;resource_weights:Record<string,number>;
  marketplace_active:boolean;missing_stocks:Record<string,number>;
  can_send:boolean;historically_certified:false;
};


export type CaravanProgram={
  program_id:string;world_id:string;
  source_city_id:string;destination_city_id:string;
  policy_id:string;cargo_template:Record<string,number>;
  quantity_mode:"exact"|"available_up_to";
  shipments_total:number;shipments_sent:number;
  wait_seconds:number;capacity_units:number;
  resource_weights:Record<string,number>;seconds_per_tile:number;
  status:"active"|"waiting_stock"|"paused"|"stopped"|"completed";
  status_reason:string|null;
  created_at:string;next_departure_at:string|null;
  last_departed_at:string|null;closed_at:string|null;
  replayed:boolean;historically_certified:false;
};


/** Operator-qualified colony sites. No unverified terrain is rendered. */
export type ColonizationPolicy={
  policy_id:string;costs:Record<string,number>;
  max_owned_cities:number;max_distance_steps:number;
  seconds_per_step:number;
};
export type ColonizationHero={
  hero_id:string;city_id:string;name:string;status:string;
};
export type ColonizationExpedition={
  order_id:string;world_id:string;
  source_city_id:string;hero_id:string;new_city_id:string|null;
  colony_name:string;x:number;y:number;
  policy_id:string;applied_costs:Record<string,number>;
  mine_types:string[];travel_seconds:number;
  started_at:string;due_at:string;
  status:"traveling"|"founded"|"blocked"|"refunded";
  completed_at:string|null;blocked_at:string|null;
  blocked_reason:string|null;refunded_at:string|null;
  replayed:boolean;historically_certified:false;
  site_qualification:"legacy_operator"|"terrain_registry";
  source_city_name?:string;hero_name?:string;
  events?:{phase:"departed"|"founded"|"blocked"|"refunded";
    occurred_at:string;details:Record<string,unknown>}[];
};
export type ColonizationCatalog={
  world_id:string;world_size:number;server_now:string;
  protection_until:string;newbie_protected:boolean;
  newbie_protection_days:7;protection_cannot_be_cancelled:true;
  colonization_policy:ColonizationPolicy|null;
  owned_cities:number;pending_expeditions:number;
  cities:City[];heroes:ColonizationHero[];
  qualified_sites:{x:number;y:number;mine_types:string[];source_ref:string;
    qualification:"legacy_operator"|"terrain_registry"}[];
  expeditions:ColonizationExpedition[];
  historically_certified:false;
  influence_source:"operator_qualified_record_only";
};
export type ColonizationQuote={
  world_id:string;source_city_id:string;hero_id:string;x:number;y:number;
  policy_id:string;applied_costs:Record<string,number>;
  distance_steps:number;travel_seconds:number;protection_until:string;
  protected:boolean;current_cities:number;pending_expeditions:number;
  max_owned_cities:number;hero_available:boolean;
  missing_resources:Record<string,number>;
  can_start:boolean;
  blocking_reasons:(
    "newbie_protection"|"city_cap"|"hero_busy"|"resources"
  )[];
  site_qualification:"legacy_operator"|"terrain_registry";
  historically_certified:false;
};

export type InfluenceSummary={
  world_id:string;policy_id:string|null;enabled:boolean;revision:number;
  last_refresh_at:string|null;next_refresh_at:string|null;
  lookback_days:4;owned_cells:number;
  cities:{
    city_id:string;name:string;military_average:string|null;
    building_domination:number|null;total_domination:string|null;
    radius:number|null;sample_days:number;
  }[];
  historically_certified_s2:false;
  spatial_method:string;historical_reference:string;
};
