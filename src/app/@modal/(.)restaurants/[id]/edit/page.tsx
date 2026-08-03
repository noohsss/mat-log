import { updateRestaurant } from "@/app/restaurants/actions";
import { RestaurantForm } from "@/app/restaurants/restaurant-form";
import { getEditableRestaurant } from "@/app/restaurants/[id]/edit/data";
import { Modal } from "@/components/modal";

export default async function EditRestaurantModal({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { initialValues } = await getEditableRestaurant(id);
  const boundUpdate = updateRestaurant.bind(null, id);

  return (
    <Modal>
      <h1 className="mb-6 text-xl font-semibold text-black">맛집 수정</h1>
      <RestaurantForm action={boundUpdate} submitLabel="수정" initialValues={initialValues} />
    </Modal>
  );
}
