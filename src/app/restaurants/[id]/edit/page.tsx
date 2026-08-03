import { updateRestaurant } from "../../actions";
import { RestaurantForm } from "../../restaurant-form";
import { getEditableRestaurant } from "./data";

export default async function EditRestaurantPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { initialValues } = await getEditableRestaurant(id);
  const boundUpdate = updateRestaurant.bind(null, id);

  return (
    <div className="flex flex-1 justify-center bg-zinc-50 px-6 py-16">
      <div className="w-full max-w-lg rounded-2xl border border-black/10 bg-white p-8">
        <h1 className="mb-6 text-xl font-semibold text-black">맛집 수정</h1>
        <RestaurantForm action={boundUpdate} submitLabel="수정" initialValues={initialValues} />
      </div>
    </div>
  );
}
