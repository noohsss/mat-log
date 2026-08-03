import { createRestaurant } from "../actions";
import { RestaurantForm } from "../restaurant-form";

export default function NewRestaurantPage() {
  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="mb-6 text-xl font-semibold text-black">맛집 등록</h1>
        <RestaurantForm action={createRestaurant} submitLabel="등록" />
      </div>
    </div>
  );
}
