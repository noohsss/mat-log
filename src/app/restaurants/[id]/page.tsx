import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantById } from "../queries";
import { Logo } from "@/components/logo";
import { DetailDeleteForm } from "./detail-delete-form";

type TagRow = { tags: { name: string; type: string } | null };

export default async function RestaurantDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const restaurant = await getRestaurantById(id);
  if (!restaurant) notFound();

  const tags = (restaurant.restaurant_tags as unknown as TagRow[])
    .map((t) => t.tags)
    .filter((t): t is { name: string; type: string } => !!t);
  const isOwner = restaurant.user_id === user?.id;
  const author = (restaurant.users as unknown as { nickname: string | null } | null)?.nickname;
  const createdAt = new Date(restaurant.created_at).toLocaleDateString("ko-KR");
  const notYetVisited = isOwner && !restaurant.visited;

  return (
    <div className="flex flex-col flex-1 items-center bg-[#fdf6f1] font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6">
        <div className="flex items-center justify-between border-b-2 border-[#ffe3d3] pb-5">
          <Logo markClassName="h-11 w-14" textClassName="text-2xl" />
          <Link
            href="/"
            className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-black/[.04]"
          >
            ← 목록으로
          </Link>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-6 shadow-sm md:col-span-2">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-semibold text-[#2b2b2b]">{restaurant.name}</h1>
              {!notYetVisited && (
                <span className="flex items-center gap-1 rounded-full bg-[#fff1ea] px-3 py-1 text-sm font-medium text-[#e85a2f]">
                  ★ {restaurant.rating}
                </span>
              )}
            </div>

            <div className="flex flex-wrap gap-2 text-sm font-medium text-zinc-600">
              {restaurant.region && (
                <span className="rounded-full bg-zinc-100 px-3 py-1">{restaurant.region}</span>
              )}
              <span className="rounded-full bg-zinc-100 px-3 py-1">{restaurant.food_type}</span>
              <span className="rounded-full bg-zinc-100 px-3 py-1">{restaurant.price_range}</span>
            </div>

            {tags.length > 0 && (
              <p className="flex flex-wrap gap-1.5">
                {tags.map((t) => (
                  <span
                    key={`${t.type}-${t.name}`}
                    className="rounded-full bg-[#fff1ea] px-3 py-1 text-sm font-medium text-[#ff6a3d]"
                  >
                    #{t.name}
                  </span>
                ))}
              </p>
            )}

            {notYetVisited ? (
              <p className="text-sm leading-relaxed text-amber-600">
                방문 후 별점과 한줄평을 작성해주세요.
              </p>
            ) : (
              restaurant.memo && (
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-zinc-700">
                  {restaurant.memo}
                </p>
              )
            )}
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-black/5 bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm font-medium text-zinc-700">등록자</p>
              <p className="mt-1 text-sm text-zinc-500">{author ?? "익명"}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-zinc-700">등록일</p>
              <p className="mt-1 text-sm text-zinc-500">{createdAt}</p>
            </div>

            {isOwner && (
              <div className="mt-2 flex gap-2 border-t border-black/5 pt-4 text-sm">
                <Link
                  href={`/restaurants/${restaurant.id}/edit`}
                  className="rounded-full bg-zinc-100 px-3 py-1 font-medium text-zinc-600 transition-colors hover:bg-zinc-200 hover:text-black"
                >
                  수정
                </Link>
                <DetailDeleteForm id={restaurant.id} />
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
