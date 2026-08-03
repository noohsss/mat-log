import { createClient } from "@/lib/supabase/server";

export async function getRestaurants({ onlyUserId }: { onlyUserId?: string } = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("restaurants")
    .select(
      "id, user_id, name, region, food_type, price_range, rating, memo, created_at, users(nickname), restaurant_tags(tags(name, type))"
    )
    .order("created_at", { ascending: false });

  if (onlyUserId) {
    query = query.eq("user_id", onlyUserId);
  }

  const { data, error } = await query;

  if (error) throw error;
  return data;
}
