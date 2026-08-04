"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getAiRecommendations, AiRecommendError, type AiRecommendation } from "./ai";

function parseTags(input: string) {
  return input
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

async function ensureTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  wanted: { name: string; type: "topic" | "target" }[]
) {
  if (wanted.length === 0) return [];

  const names = [...new Set(wanted.map((t) => t.name))];
  const { data: existing, error } = await supabase
    .from("tags")
    .select("id, name, type")
    .in("name", names);
  if (error) throw error;

  const has = (name: string, type: string) =>
    existing!.some((t) => t.name === name && t.type === type);
  const missing = wanted.filter((t) => !has(t.name, t.type));

  let inserted: { id: string; name: string; type: string }[] = [];
  if (missing.length > 0) {
    const { data, error: insertError } = await supabase
      .from("tags")
      .insert(missing)
      .select("id, name, type");
    if (insertError) throw insertError;
    inserted = data ?? [];
  }

  return [
    ...existing!.filter((t) => wanted.some((w) => w.name === t.name && w.type === t.type)),
    ...inserted,
  ];
}

async function replaceTags(
  supabase: Awaited<ReturnType<typeof createClient>>,
  restaurantId: string,
  topicInput: string,
  targetInput: string
) {
  await supabase.from("restaurant_tags").delete().eq("restaurant_id", restaurantId);

  const topics = parseTags(topicInput).map((name) => ({ name, type: "topic" as const }));
  const targets = parseTags(targetInput).map((name) => ({ name, type: "target" as const }));
  const all = [...topics, ...targets];
  if (all.length === 0) return;

  const tags = await ensureTags(supabase, all);

  const links = tags.map((t) => ({ restaurant_id: restaurantId, tag_id: t.id }));
  const { error: linkError } = await supabase.from("restaurant_tags").insert(links);
  if (linkError) throw linkError;
}

async function uploadRestaurantPhoto(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  restaurantId: string,
  file: File
) {
  const ext = file.name.split(".").pop() || "jpg";
  const path = `${userId}/${restaurantId}.${ext}`;
  const { error } = await supabase.storage
    .from("restaurant-photos")
    .upload(path, file, { upsert: true, contentType: file.type });
  if (error) throw error;

  const { data } = supabase.storage.from("restaurant-photos").getPublicUrl(path);
  return data.publicUrl;
}

function readForm(formData: FormData) {
  const lat = formData.get("lat");
  const lng = formData.get("lng");
  return {
    name: formData.get("name") as string,
    region: formData.get("region") as string,
    food_type: formData.get("food_type") as string,
    price_range: formData.get("price_range") as string,
    rating: formData.get("rating") ? Number(formData.get("rating")) : null,
    memo: (formData.get("memo") as string) || null,
    topicTags: (formData.get("topicTags") as string) ?? "",
    targetTags: (formData.get("targetTags") as string) ?? "",
    visited: formData.get("visited") === "on",
    lat: lat ? Number(lat) : null,
    lng: lng ? Number(lng) : null,
  };
}

export async function createRestaurant(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { name, region, food_type, price_range, rating, memo, topicTags, targetTags, visited, lat, lng } =
    readForm(formData);

  const id = crypto.randomUUID();
  const photoFile = formData.get("photo");
  const photo_url =
    photoFile instanceof File && photoFile.size > 0
      ? await uploadRestaurantPhoto(supabase, user.id, id, photoFile)
      : null;

  const { error } = await supabase
    .from("restaurants")
    .insert({ id, user_id: user.id, name, region, food_type, price_range, rating, memo, visited, photo_url, lat, lng });

  if (error) throw error;

  try {
    await replaceTags(supabase, id, topicTags, targetTags);
  } catch (tagError) {
    await supabase.from("restaurants").delete().eq("id", id);
    throw tagError;
  }

  revalidatePath("/");
  revalidatePath("/my");
}

export async function updateRestaurant(id: string, formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { name, region, food_type, price_range, rating, memo, topicTags, targetTags, visited, lat, lng } =
    readForm(formData);

  const photoFile = formData.get("photo");
  const photo_url =
    photoFile instanceof File && photoFile.size > 0
      ? await uploadRestaurantPhoto(supabase, user.id, id, photoFile)
      : undefined;

  const { error } = await supabase
    .from("restaurants")
    .update({
      name,
      region,
      food_type,
      price_range,
      rating,
      memo,
      visited,
      lat,
      lng,
      updated_at: new Date().toISOString(),
      ...(photo_url !== undefined ? { photo_url } : {}),
    })
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  await replaceTags(supabase, id, topicTags, targetTags);

  revalidatePath("/");
  revalidatePath("/my");
}

export async function saveRestaurant(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const restaurantId = formData.get("restaurantId") as string;

  const { data: source, error } = await supabase
    .from("restaurants")
    .select("name, region, food_type, price_range, photo_url, lat, lng, restaurant_tags(tag_id)")
    .eq("id", restaurantId)
    .single();
  if (error || !source) throw error ?? new Error("맛집을 찾을 수 없습니다.");

  const { data: inserted, error: insertError } = await supabase
    .from("restaurants")
    .insert({
      user_id: user.id,
      name: source.name,
      region: source.region,
      food_type: source.food_type,
      price_range: source.price_range,
      photo_url: source.photo_url,
      lat: source.lat,
      lng: source.lng,
      rating: null,
      memo: null,
      visited: false,
      source_restaurant_id: restaurantId,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;

  const tagIds = (source.restaurant_tags as unknown as { tag_id: string }[]).map(
    (t) => t.tag_id
  );
  if (tagIds.length > 0) {
    const { error: linkError } = await supabase
      .from("restaurant_tags")
      .insert(tagIds.map((tag_id) => ({ restaurant_id: inserted.id, tag_id })));
    if (linkError) throw linkError;
  }

  revalidatePath("/");
  revalidatePath("/my");
}

export type AiRecommendState = {
  results: AiRecommendation[];
  error: string | null;
};

export async function recommendWithAi(rawQuery: string): Promise<AiRecommendState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const query = rawQuery.trim();
  if (!query) {
    return { results: [], error: "찾고 싶은 맛집을 자연어로 입력해주세요." };
  }

  try {
    const results = await getAiRecommendations(query, user.id);
    return { results, error: null };
  } catch (e) {
    const message =
      e instanceof AiRecommendError ? e.message : "추천을 가져오지 못했어요. 잠시 후 다시 시도해주세요.";
    return { results: [], error: message };
  }
}

export async function deleteRestaurant(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const id = formData.get("id") as string;

  const { error } = await supabase
    .from("restaurants")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) throw error;

  revalidatePath("/");
}
