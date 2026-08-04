"use client";

import { useActionState, useState } from "react";
import { recommendWithAi, saveRestaurant, type AiRecommendState } from "@/app/restaurants/actions";
import { SubmitButton } from "@/components/submit-button";

const initialState: AiRecommendState = { results: [], error: null };

export function AiSearchBar() {
  const [open, setOpen] = useState(false);
  const [state, formAction, pending] = useActionState(recommendWithAi, initialState);

  return (
    <div className="rounded-xl border border-[#ffe3d3] bg-[#fff8f4] p-4">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full cursor-pointer items-center justify-between text-sm font-medium text-[#e85a2f]"
      >
        <span>✨ AI에게 자연어로 맛집 추천받기</span>
        <span>{open ? "접기" : "펼치기"}</span>
      </button>

      {open && (
        <div className="mt-3 flex flex-col gap-3">
          <form action={formAction} className="flex gap-2">
            <input
              name="query"
              placeholder="예: 여자친구랑 갈만한 조용한 한식집 추천해줘"
              className="h-11 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30"
            />
            <button
              type="submit"
              disabled={pending}
              className="h-11 shrink-0 cursor-pointer rounded-lg bg-[#ff6a3d] px-5 text-sm font-medium text-white transition-colors hover:bg-[#e85a2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {pending ? "찾는 중..." : "AI 추천 받기"}
            </button>
          </form>

          {state.error && <p className="text-sm text-red-500">{state.error}</p>}

          {!state.error && state.results.length > 0 && (
            <ul className="flex flex-col gap-3">
              {state.results.map(({ restaurant, reason }) => (
                <li
                  key={restaurant.id}
                  className="rounded-lg border border-black/5 bg-white p-4 shadow-sm"
                >
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-[#2b2b2b]">{restaurant.name}</h3>
                    {restaurant.rating != null && (
                      <span className="rounded-full bg-[#fff1ea] px-2.5 py-1 text-sm font-medium text-[#e85a2f]">
                        ★ {restaurant.rating}
                      </span>
                    )}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-2 text-xs font-medium text-zinc-600">
                    {restaurant.region && (
                      <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                        {restaurant.region}
                      </span>
                    )}
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                      {restaurant.food_type}
                    </span>
                    <span className="rounded-full bg-zinc-100 px-2.5 py-1">
                      {restaurant.price_range}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-[#e85a2f]">💡 {reason}</p>
                  <form action={saveRestaurant} className="mt-3 border-t border-black/5 pt-3">
                    <input type="hidden" name="restaurantId" value={restaurant.id} />
                    <SubmitButton
                      pendingLabel="저장 중..."
                      className="rounded-full bg-[#fff1ea] px-3 py-1 text-sm font-medium text-[#ff6a3d] transition-colors hover:bg-[#ffe3d3]"
                    >
                      저장
                    </SubmitButton>
                  </form>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
