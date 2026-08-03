import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { updateRestaurant } from "../../actions";
import { RestaurantForm } from "../../restaurant-form";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
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

  const boundUpdate = updateRestaurant.bind(null, id);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="mb-6 text-xl font-semibold text-black">맛집 수정</h1>
        <RestaurantForm
          action={boundUpdate}
          submitLabel="수정"
          initialValues={{
            name: restaurant.name,
            region: restaurant.region ?? undefined,
            food_type: restaurant.food_type,
            price_range: restaurant.price_range,
            rating: restaurant.rating,
            memo: restaurant.memo,
            topicTags,
            targetTags,
          }}
        />
      </div>
    </div>
  );
}
