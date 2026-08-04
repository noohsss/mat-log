"use client";

import { useEffect, useRef, useState } from "react";
import { recommendWithAi, saveRestaurant } from "@/app/restaurants/actions";
import type { AiRecommendation } from "@/app/restaurants/ai";
import { SubmitButton } from "@/components/submit-button";

type ChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; error: string }
  | { id: string; role: "assistant"; results: AiRecommendation[] };

export function AiChatWidget() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [pending, setPending] = useState(false);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    listRef.current?.scrollTo({ top: listRef.current.scrollHeight });
  }, [messages, open, pending]);

  async function handleSend() {
    const query = input.trim();
    if (!query || pending) return;

    setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: "user", text: query }]);
    setInput("");
    setPending(true);
    try {
      const { results, error } = await recommendWithAi(query);
      setMessages((prev) => [
        ...prev,
        error
          ? { id: crypto.randomUUID(), role: "assistant", error }
          : { id: crypto.randomUUID(), role: "assistant", results },
      ]);
    } finally {
      setPending(false);
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-[#ff6a3d] text-2xl text-white shadow-lg transition-transform hover:scale-105"
        aria-label="AI 맛집 추천 채팅 열기"
      >
        {open ? "✕" : "💬"}
      </button>

      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[32rem] w-96 max-w-[calc(100vw-3rem)] flex-col overflow-hidden rounded-2xl border border-black/10 bg-white shadow-2xl">
          <div className="flex items-center justify-between border-b border-black/5 bg-[#fff8f4] px-4 py-3">
            <span className="text-sm font-semibold text-[#e85a2f]">✨ AI 맛집 추천</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="cursor-pointer text-zinc-400 hover:text-zinc-600"
            >
              ✕
            </button>
          </div>

          <div ref={listRef} className="flex flex-1 flex-col gap-3 overflow-y-auto p-4">
            {messages.length === 0 && (
              <p className="text-sm text-zinc-400">
                &quot;여자친구랑 갈만한 조용한 한식집 추천해줘&quot;처럼 자유롭게 물어보세요.
              </p>
            )}

            {messages.map((m) =>
              m.role === "user" ? (
                <div key={m.id} className="flex justify-end">
                  <p className="max-w-[80%] rounded-2xl rounded-br-sm bg-[#ff6a3d] px-3 py-2 text-sm text-white">
                    {m.text}
                  </p>
                </div>
              ) : (
                <div key={m.id} className="flex justify-start">
                  {"error" in m ? (
                    <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-red-50 px-3 py-2 text-sm text-red-500">
                      {m.error}
                    </p>
                  ) : m.results.length === 0 ? (
                    <p className="max-w-[80%] rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-500">
                      조건에 맞는 맛집을 찾지 못했어요.
                    </p>
                  ) : (
                    <ul className="flex max-w-[85%] flex-col gap-2">
                      {m.results.map(({ restaurant, reason }) => (
                        <li
                          key={restaurant.id}
                          className="rounded-xl border border-black/5 bg-zinc-50 p-3"
                        >
                          <div className="flex items-center justify-between">
                            <h3 className="text-sm font-semibold text-[#2b2b2b]">
                              {restaurant.name}
                            </h3>
                            {restaurant.rating != null && (
                              <span className="rounded-full bg-[#fff1ea] px-2 py-0.5 text-xs font-medium text-[#e85a2f]">
                                ★ {restaurant.rating}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex flex-wrap gap-1.5 text-xs font-medium text-zinc-600">
                            {restaurant.region && (
                              <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                                {restaurant.region}
                              </span>
                            )}
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                              {restaurant.food_type}
                            </span>
                            <span className="rounded-full bg-zinc-100 px-2 py-0.5">
                              {restaurant.price_range}
                            </span>
                          </div>
                          <p className="mt-2 text-xs leading-relaxed text-[#e85a2f]">
                            💡 {reason}
                          </p>
                          <form action={saveRestaurant} className="mt-2 border-t border-black/5 pt-2">
                            <input type="hidden" name="restaurantId" value={restaurant.id} />
                            <SubmitButton
                              pendingLabel="저장 중..."
                              className="rounded-full bg-[#fff1ea] px-2.5 py-1 text-xs font-medium text-[#ff6a3d] transition-colors hover:bg-[#ffe3d3]"
                            >
                              저장
                            </SubmitButton>
                          </form>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            )}

            {pending && (
              <div className="flex justify-start">
                <p className="rounded-2xl rounded-bl-sm bg-zinc-100 px-3 py-2 text-sm text-zinc-400">
                  찾는 중...
                </p>
              </div>
            )}
          </div>

          <div className="flex gap-2 border-t border-black/5 p-3">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="예: 조용한 한식집 추천해줘"
              className="h-10 flex-1 rounded-lg border border-black/10 bg-white px-3 text-sm outline-none focus:border-black/30"
            />
            <button
              type="button"
              onClick={handleSend}
              disabled={pending}
              className="h-10 shrink-0 cursor-pointer rounded-lg bg-[#ff6a3d] px-4 text-sm font-medium text-white transition-colors hover:bg-[#e85a2f] disabled:cursor-not-allowed disabled:opacity-60"
            >
              전송
            </button>
          </div>
        </div>
      )}
    </>
  );
}
