import { createClient } from "@/lib/supabase/server";
import { PAGE_SIZE } from "./constants";
import type { SortValue } from "./constants";

// region은 카카오 주소 검색으로 채워지는 상세 주소 문자열이라, 필터 옵션은
// "시/도 + 시/군/구" 단위까지만 잘라서 사용한다 (예: "서울 송파구 오금로 131" → "서울 송파구").
function extractDistrict(region: string): string {
  const tokens = region.trim().split(/\s+/);
  let end = tokens[1] && /(시|군|구|도)$/.test(tokens[1]) ? 2 : 1;
  if (tokens[1] && /시$/.test(tokens[1]) && tokens[2] && /(구|군)$/.test(tokens[2])) end = 3;
  return tokens.slice(0, end).join(" ");
}

export type RestaurantFilters = {
  onlyUserId?: string;
  excludeUserId?: string;
  q?: string;
  topic?: string;
  target?: string;
  foodType?: string;
  region?: string;
  sort?: SortValue;
};

function restaurantsSelectBuilder(
  supabase: Awaited<ReturnType<typeof createClient>>,
  withCount?: boolean
) {
  return supabase
    .from("restaurants")
    .select(
      "id, user_id, name, region, food_type, price_range, rating, memo, visited, photo_url, lat, lng, created_at, users(nickname), restaurant_tags(tags(name, type))",
      withCount ? { count: "exact" } : undefined
    );
}

export type RestaurantRow = NonNullable<
  Awaited<ReturnType<typeof restaurantsSelectBuilder>>["data"]
>[number];

export type RestaurantPage = {
  data: RestaurantRow[];
  count: number;
};

export async function getRestaurants(
  filters?: RestaurantFilters & { page?: undefined }
): Promise<RestaurantRow[]>;
export async function getRestaurants(
  filters: RestaurantFilters & { page: number }
): Promise<RestaurantPage>;
export async function getRestaurants({
  onlyUserId,
  excludeUserId,
  q,
  topic,
  target,
  foodType,
  region,
  sort,
  page,
}: RestaurantFilters & { page?: number } = {}) {
  const supabase = await createClient();

  // Filtering by topic AND target tags can't be done with a single embedded
  // join filter (PostgREST would require one restaurant_tags row to match both
  // tag names at once). Resolve each tag filter to a restaurant id set first,
  // then intersect them.
  let tagFilterIds: string[] | undefined;
  if (topic || target) {
    const idSets: Set<string>[] = [];

    for (const [name, type] of [
      [topic, "topic"],
      [target, "target"],
    ] as const) {
      if (!name) continue;
      const { data: tagMatches, error: tagError } = await supabase
        .from("restaurant_tags")
        .select("restaurant_id, tags!inner(name, type)")
        .eq("tags.name", name)
        .eq("tags.type", type);
      if (tagError) throw tagError;
      idSets.push(new Set((tagMatches ?? []).map((r) => r.restaurant_id)));
    }

    tagFilterIds = [...idSets.reduce((a, b) => new Set([...a].filter((id) => b.has(id))))];
    if (tagFilterIds.length === 0) return page !== undefined ? { data: [], count: 0 } : [];
  }

  let query = restaurantsSelectBuilder(supabase, page !== undefined);

  if (tagFilterIds) query = query.in("id", tagFilterIds);
  if (onlyUserId) query = query.eq("user_id", onlyUserId);
  if (excludeUserId) {
    query = query.neq("user_id", excludeUserId);

    const { data: savedRows } = await supabase
      .from("restaurants")
      .select("source_restaurant_id")
      .eq("user_id", excludeUserId)
      .not("source_restaurant_id", "is", null);
    const savedIds = (savedRows ?? [])
      .map((r) => r.source_restaurant_id)
      .filter((id): id is string => !!id);
    if (savedIds.length > 0) {
      query = query.not("id", "in", `(${savedIds.join(",")})`);
    }
  }
  if (foodType) query = query.eq("food_type", foodType);
  if (region) query = query.ilike("region", `${region}%`);
  if (q) query = query.or(`name.ilike.%${q}%,memo.ilike.%${q}%`);

  if (sort === "rating") {
    query = query.order("rating", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  if (page !== undefined) {
    const from = (page - 1) * PAGE_SIZE;
    query = query.range(from, from + PAGE_SIZE - 1);
  }

  const { data, error, count } = await query;

  if (error) throw error;
  return page !== undefined ? { data: data ?? [], count: count ?? 0 } : data;
}

export type SearchParams = { [key: string]: string | string[] | undefined };

export function parseFilters(sp: SearchParams) {
  const get = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : undefined);
  const pageRaw = Number(get("page"));
  return {
    q: get("q"),
    topic: get("topic"),
    target: get("target"),
    foodType: get("foodType"),
    region: get("region"),
    sort: get("sort") as SortValue | undefined,
    page: Number.isInteger(pageRaw) && pageRaw > 0 ? pageRaw : 1,
  };
}

export function countAppliedFilters(f: {
  q?: string;
  topic?: string;
  target?: string;
  foodType?: string;
  region?: string;
}) {
  return [f.q, f.topic, f.target, f.foodType, f.region].filter(Boolean).length;
}

export async function getRestaurantById(id: string): Promise<RestaurantRow | null> {
  const supabase = await createClient();
  const { data, error } = await restaurantsSelectBuilder(supabase).eq("id", id).single();

  if (error) {
    if (error.code === "PGRST116") return null;
    throw error;
  }
  return data;
}

export async function getFilterOptions() {
  const supabase = await createClient();

  const [{ data: regionRows }, { data: tagRows }] = await Promise.all([
    supabase.from("restaurants").select("region").not("region", "is", null),
    supabase.from("tags").select("name, type").order("name"),
  ]);

  const regions = [
    ...new Set(
      (regionRows ?? [])
        .map((r) => r.region)
        .filter((r): r is string => !!r)
        .map(extractDistrict)
    ),
  ].sort();
  const topics = (tagRows ?? []).filter((t) => t.type === "topic").map((t) => t.name);
  const targets = (tagRows ?? []).filter((t) => t.type === "target").map((t) => t.name);

  return { regions, topics, targets };
}
