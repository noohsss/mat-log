import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantById } from "../queries";
import { Logo } from "@/components/logo";
import { RestaurantDetailBody } from "./restaurant-detail-body";

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

  const isOwner = restaurant.user_id === user?.id;

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

        <RestaurantDetailBody restaurant={restaurant} isOwner={isOwner} />
      </main>
    </div>
  );
}
