import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";
import { deleteRestaurant } from "./restaurants/actions";
import { Logo } from "@/components/logo";

type TagRow = { tags: { name: string; type: string } | null };

async function getRestaurants() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id, user_id, name, region, food_type, price_range, rating, memo, restaurant_tags(tags(name, type))"
    )
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
          <Logo markClassName="h-9 w-12" textClassName="text-2xl" />
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

        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-black">추천 게시판</h1>
          <Link
            href="/restaurants/new"
            className="flex h-10 items-center rounded-full bg-foreground px-5 text-sm font-medium text-background transition-colors hover:bg-[#383838]"
          >
            + 맛집 등록
          </Link>
        </div>

        <ul className="flex flex-col gap-4">
          {restaurants.map((r) => {
            const tags = (r.restaurant_tags as unknown as TagRow[])
              .map((t) => t.tags)
              .filter((t): t is { name: string; type: string } => !!t);
            const isOwner = r.user_id === user?.id;

            return (
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
                {tags.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-2 text-sm text-orange-600">
                    {tags.map((t) => (
                      <span key={`${t.type}-${t.name}`}>#{t.name}</span>
                    ))}
                  </p>
                )}
                {r.memo && <p className="mt-3 text-sm text-zinc-700">{r.memo}</p>}

                {isOwner && (
                  <div className="mt-4 flex gap-3 border-t border-black/5 pt-3 text-sm">
                    <Link
                      href={`/restaurants/${r.id}/edit`}
                      className="font-medium text-zinc-600 hover:text-black"
                    >
                      수정
                    </Link>
                    <form action={deleteRestaurant}>
                      <input type="hidden" name="id" value={r.id} />
                      <button
                        type="submit"
                        className="font-medium text-red-500 hover:text-red-700"
                      >
                        삭제
                      </button>
                    </form>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </main>
    </div>
  );
}
