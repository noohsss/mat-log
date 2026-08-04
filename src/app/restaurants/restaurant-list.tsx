import Link from "next/link";
import Image from "next/image";
import { deleteRestaurant, saveRestaurant } from "./actions";
import type { RestaurantRow } from "./queries";
import { SubmitButton } from "@/components/submit-button";

type TagRow = { tags: { name: string; type: string } | null };

export function RestaurantList({
  restaurants,
  currentUserId,
  emptyMessage,
}: {
  restaurants: RestaurantRow[];
  currentUserId?: string;
  emptyMessage: string;
}) {
  if (restaurants.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-black/10 bg-white/60 p-8 text-center text-sm text-zinc-500">
        {emptyMessage}
      </p>
    );
  }

  return (
    <ul className="flex flex-col gap-4">
      {restaurants.map((r) => {
        const tags = (r.restaurant_tags as unknown as TagRow[])
          .map((t) => t.tags)
          .filter((t): t is { name: string; type: string } => !!t);
        const isOwner = r.user_id === currentUserId;
        const author = (r.users as unknown as { nickname: string | null } | null)
          ?.nickname;
        const createdAt = new Date(r.created_at).toLocaleDateString("ko-KR");
        const notYetVisited = isOwner && !r.visited;

        return (
          <li
            key={r.id}
            className="rounded-xl border border-black/5 border-l-4 border-l-[#ff6a3d] bg-white p-5 shadow-sm transition-shadow hover:shadow-md"
          >
            <Link href={`/restaurants/${r.id}`} className="flex gap-4">
              {r.photo_url ? (
                <Image
                  src={r.photo_url}
                  alt=""
                  width={80}
                  height={80}
                  className="h-20 w-20 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg bg-zinc-100 text-xs text-zinc-400">
                  사진 없음
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-[#2b2b2b]">{r.name}</h2>
                  {!notYetVisited && (
                    <span className="flex items-center gap-1 rounded-full bg-[#fff1ea] px-2.5 py-1 text-sm font-medium text-[#e85a2f]">
                      ★ {r.rating}
                    </span>
                  )}
                </div>
                <div className="mt-1 flex items-center gap-2">
                  <p className="text-xs text-zinc-400">
                    {author ?? "익명"} · {createdAt}
                  </p>
                  {isOwner && (
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                        r.visited
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-600"
                      }`}
                    >
                      {r.visited ? "방문함" : "방문 안함"}
                    </span>
                  )}
                </div>
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
                {notYetVisited ? (
                  <p className="mt-3 text-sm leading-relaxed text-amber-600">
                    방문 후 별점과 한줄평을 작성해주세요.
                  </p>
                ) : (
                  r.memo && (
                    <p className="mt-3 text-sm leading-relaxed text-zinc-700">{r.memo}</p>
                  )
                )}
              </div>
            </Link>

            {isOwner ? (
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
            ) : (
              currentUserId && (
                <div className="mt-4 border-t border-black/5 pt-3 text-sm">
                  <form action={saveRestaurant}>
                    <input type="hidden" name="restaurantId" value={r.id} />
                    <SubmitButton
                      pendingLabel="저장 중..."
                      className="rounded-full bg-[#fff1ea] px-3 py-1 font-medium text-[#ff6a3d] transition-colors hover:bg-[#ffe3d3]"
                    >
                      저장
                    </SubmitButton>
                  </form>
                </div>
              )
            )}
          </li>
        );
      })}
    </ul>
  );
}
