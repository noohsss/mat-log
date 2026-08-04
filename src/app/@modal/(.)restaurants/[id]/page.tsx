import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRestaurantById } from "@/app/restaurants/queries";
import { RestaurantDetailBody } from "@/app/restaurants/[id]/restaurant-detail-body";
import { Modal } from "@/components/modal";

export default async function RestaurantDetailModal({
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
    <Modal>
      <RestaurantDetailBody restaurant={restaurant} isOwner={isOwner} compact />
    </Modal>
  );
}
