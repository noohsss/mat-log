"use client";

import { useRouter } from "next/navigation";
import { deleteRestaurant } from "../actions";
import { SubmitButton } from "@/components/submit-button";

export function DetailDeleteForm({ id }: { id: string }) {
  const router = useRouter();

  async function handleDelete(formData: FormData) {
    await deleteRestaurant(formData);
    router.push("/");
  }

  return (
    <form action={handleDelete}>
      <input type="hidden" name="id" value={id} />
      <SubmitButton
        pendingLabel="삭제 중..."
        className="rounded-full bg-red-50 px-3 py-1 font-medium text-red-500 transition-colors hover:bg-red-100 hover:text-red-700 disabled:opacity-50"
      >
        삭제
      </SubmitButton>
    </form>
  );
}
