import { Suspense } from "react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { signOut } from "./login/actions";
import {
  getRestaurants,
  getFilterOptions,
  parseFilters,
  countAppliedFilters,
  type SearchParams,
} from "./restaurants/queries";
import { RestaurantList } from "./restaurants/restaurant-list";
import { Logo } from "@/components/logo";
import { BoardTabs } from "@/components/board-tabs";
import { FilterBar } from "@/components/filter-bar";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const filters = parseFilters(await searchParams);
  const [restaurants, { regions, topics, targets }] = await Promise.all([
    getRestaurants(filters),
    getFilterOptions(),
  ]);

  return (
    <div className="flex flex-col flex-1 items-center bg-[#fdf6f1] font-sans">
      <main className="flex w-full max-w-3xl flex-col gap-6 py-16 px-6">
        <div className="flex items-center justify-between border-b-2 border-[#ffe3d3] pb-5">
          <Logo markClassName="h-11 w-14" textClassName="text-2xl" />
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
          <BoardTabs />
          <Link
            href="/restaurants/new"
            className="flex h-10 items-center rounded-full bg-[#ff6a3d] px-5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-[#e85a2f]"
          >
            + 맛집 등록
          </Link>
        </div>

        <Suspense>
          <FilterBar
            regions={regions}
            topics={topics}
            targets={targets}
            totalCount={restaurants.length}
            appliedCount={countAppliedFilters(filters)}
          />
        </Suspense>

        <RestaurantList
          restaurants={restaurants}
          currentUserId={user?.id}
          emptyMessage="조건에 맞는 맛집이 없어요."
        />
      </main>
    </div>
  );
}
