import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function getEditableRestaurant(id: string) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: restaurant, error } = await supabase
    .from("restaurants")
    .select("id, user_id, name, region, food_type, price_range, rating, memo")
    .eq("id", id)
    .single();

  if (error || !restaurant) notFound();
  if (restaurant.user_id !== user.id) redirect("/");

  const { data: tagRows } = await supabase
    .from("restaurant_tags")
    .select("tags(name, type)")
    .eq("restaurant_id", id);

  const topicTags =
    tagRows
      ?.map((r) => r.tags as unknown as { name: string; type: string })
      .filter((t) => t?.type === "topic")
      .map((t) => t.name)
      .join(", ") ?? "";
  const targetTags =
    tagRows
      ?.map((r) => r.tags as unknown as { name: string; type: string })
      .filter((t) => t?.type === "target")
      .map((t) => t.name)
      .join(", ") ?? "";

  return {
    initialValues: {
      name: restaurant.name,
      region: restaurant.region ?? undefined,
      food_type: restaurant.food_type,
      price_range: restaurant.price_range,
      rating: restaurant.rating,
      memo: restaurant.memo,
      topicTags,
      targetTags,
    },
  };
}
