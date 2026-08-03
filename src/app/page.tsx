import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";
import { Logo } from "@/components/logo";

async function getRestaurants() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select("id, name, region, food_type, price_range, rating, memo")
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export default async function Home() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const restaurants = await getRestaurants();

  return (
    <div className="flex flex-col flex-1 items-center bg-zinc-50 font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6">
        <div className="flex items-center justify-between">
          <Logo markClassName="h-9 w-9" textClassName="text-2xl" />
          <form action={signOut} className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">
              {user?.user_metadata?.full_name ?? user?.email}
            </span>
            <button
              type="submit"
              className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[.04]"
            >
              로그아웃
            </button>
          </form>
        </div>

        <ul className="flex flex-col gap-4">
          {restaurants.map((r) => (
            <li
              key={r.id}
              className="rounded-xl border border-black/10 bg-white p-5"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-black">{r.name}</h2>
                <span className="text-sm text-zinc-500">★ {r.rating}</span>
              </div>
              <p className="mt-1 text-sm text-zinc-500">
                {r.region} · {r.food_type} · {r.price_range}
              </p>
              {r.memo && <p className="mt-3 text-sm text-zinc-700">{r.memo}</p>}
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
