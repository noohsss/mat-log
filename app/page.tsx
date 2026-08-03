import { createClient } from "@/lib/supabase";

// TEMPORARY: signs in as a seed dev account so RLS ("authenticated" role)
// lets us read data before Google login is wired up. Remove once real auth lands.
async function getRestaurants() {
  const supabase = createClient();

  await supabase.auth.signInWithPassword({
    email: process.env.DEV_SEED_EMAIL!,
    password: process.env.DEV_SEED_PASSWORD!,
  });

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, region, food_type, price_range, rating, memo")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export default async function Home() {
  const restaurants = await getRestaurants();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans dark:bg-black">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6">
        <h1 className="text-3xl font-semibold text-black dark:text-zinc-50">
          맛집 메모장
        </h1>

        <ul className="flex flex-col gap-4">
          {restaurants.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-black/10 bg-white p-5 dark:border-white/10 dark:bg-zinc-900"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-black dark:text-zinc-50">
                  {r.name}
                </h2>
                <span className="text-sm text-zinc-500 dark:text-zinc-400">
                  ★ {r.rating}
                </span>
              </div>
              <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
                {r.region} · {r.food_type} · {r.price_range}
              </p>
              {r.memo && (
                <p className="mt-3 text-sm text-zinc-700 dark:text-zinc-300">
                  {r.memo}
                </p>
              )}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
