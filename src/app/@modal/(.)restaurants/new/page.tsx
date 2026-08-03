import { createRestaurant } from "@/app/restaurants/actions";
import { RestaurantForm } from "@/app/restaurants/restaurant-form";
import { Modal } from "@/components/modal";

export default function NewRestaurantModal() {
  return (
    <Modal>
      <h1 className="mb-6 text-xl font-semibold text-black">맛집 등록</h1>
      <RestaurantForm action={createRestaurant} submitLabel="등록" />
    </Modal>
  );
}
