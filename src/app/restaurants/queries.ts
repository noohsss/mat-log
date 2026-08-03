import { createClient } from "@/lib/supabase/server";
import type { SortValue } from "./constants";

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

export async function getRestaurants({
  onlyUserId,
  excludeUserId,
  q,
  topic,
  target,
  foodType,
  region,
  sort,
}: RestaurantFilters = {}) {
  const supabase = await createClient();

  const needsTagJoin = Boolean(topic || target);
  const tagsSelect = needsTagJoin ? "restaurant_tags!inner(tags!inner(name, type))" : "restaurant_tags(tags(name, type))";

  let query = supabase
    .from("restaurants")
    .select(
      `id, user_id, name, region, food_type, price_range, rating, memo, visited, created_at, users(nickname), ${tagsSelect}`
    );

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
  if (region) query = query.eq("region", region);
  if (q) query = query.or(`name.ilike.%${q}%,memo.ilike.%${q}%`);
  if (topic) query = query.eq("restaurant_tags.tags.name", topic).eq("restaurant_tags.tags.type", "topic");
  if (target) query = query.eq("restaurant_tags.tags.name", target).eq("restaurant_tags.tags.type", "target");

  if (sort === "rating") {
    query = query.order("rating", { ascending: false, nullsFirst: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}

export type SearchParams = { [key: string]: string | string[] | undefined };

export function parseFilters(sp: SearchParams) {
  const get = (key: string) => (typeof sp[key] === "string" ? (sp[key] as string) : undefined);
  return {
    q: get("q"),
    topic: get("topic"),
    target: get("target"),
    foodType: get("foodType"),
    region: get("region"),
    sort: get("sort") as SortValue | undefined,
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

export async function getFilterOptions() {
  const supabase = await createClient();

  const [{ data: regionRows }, { data: tagRows }] = await Promise.all([
    supabase.from("restaurants").select("region").not("region", "is", null),
    supabase.from("tags").select("name, type").order("name"),
  ]);

  const regions = [...new Set((regionRows ?? []).map((r) => r.region).filter(Boolean))].sort();
  const topics = (tagRows ?? []).filter((t) => t.type === "topic").map((t) => t.name);
  const targets = (tagRows ?? []).filter((t) => t.type === "target").map((t) => t.name);

  return { regions, topics, targets };
}
