import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";
import { deleteRestaurant } from "./restaurants/actions";
import { Logo } from "@/components/logo";
import { SubmitButton } from "@/components/submit-button";

type TagRow = { tags: { name: string; type: string } | null };

async function getRestaurants() {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("restaurants")
    .select(
      "id, user_id, name, region, food_type, price_range, rating, memo, created_at, users(nickname), restaurant_tags(tags(name, type))"
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
    <div className="flex flex-col flex-1 items-center bg-[#fdf6f1] font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6">
        <div className="flex items-center justify-between border-b-2 border-[#ffe3d3] pb-5">
          <Logo markClassName="h-9 w-12" textClassName="text-2xl" />
          <form action={signOut} className="flex items-center gap-3">
            <span className="text-sm text-zinc-500">
              {user?.user_metadata?.nickname ?? user?.email}
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
          <h1 className="text-xl font-semibold text-[#2b2b2b]">추천 게시판</h1>
          <Link
            href="/restaurants/new"
            className="flex h-10 items-center rounded-full bg-[#ff6a3d] px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#e85a2f]"
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
            const author = (r.users as unknown as { nickname: string | null } | null)
              ?.nickname;
            const createdAt = new Date(r.created_at).toLocaleDateString("ko-KR");

            return (
              <li
                key={r.id}
                className="rounded-xl border border-black/5 border-l-4 border-l-[#ff6a3d] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#2b2b2b]">
                    {r.name}
                  </h2>
                  <span className="flex items-center gap-1 rounded-full bg-[#fff1ea] px-2.5 py-1 text-sm font-medium text-[#e85a2f]">
                    ★ {r.rating}
                  </span>
                </div>
                <p className="mt-1 text-xs text-zinc-400">
                  {author ?? "익명"} · {createdAt}
                </p>
                <div className="mt-2 flex flex-wrap gap-2 text-xs font-medium text-zinc-600">
                  {r.region && (
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                      {r.region}
                    </span>
                  )}
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                    {r.food_type}
                  </span>
                  <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                    {r.price_range}
                  </span>
                </div>
                {tags.length > 0 && (
                  <p className="mt-2 flex flex-wrap gap-1.5">
                    {tags.map((t) => (
                      <span
                        key={`${t.type}-${t.name}`}
                        className="rounded-full bg-[#fff1ea] px-2.5 py-1 text-xs font-medium text-[#ff6a3d]"
                      >
                        #{t.name}
                      </span>
                    ))}
                  </p>
                )}
                {r.memo && (
                  <p className="mt-3 text-sm leading-relaxed text-zinc-700">
                    {r.memo}
                  </p>
                )}

                {isOwner && (
                  <div className="mt-4 flex gap-2 border-t border-black/5 pt-3 text-sm">
                    <Link
                      href={`/restaurants/${r.id}/edit`}
                      className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-black"
                    >
                      수정
                    </Link>
                    <form action={deleteRestaurant}>
                      <input type="hidden" name="id" value={r.id} />
                      <SubmitButton
                        pendingLabel="삭제 중..."
                        className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
                      >
                        삭제
                      </SubmitButton>
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
