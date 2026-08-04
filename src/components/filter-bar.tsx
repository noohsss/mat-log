"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { FOOD_TYPES, SORT_OPTIONS } from "@/app/restaurants/constants";

export function FilterBar({
  regions,
  topics,
  targets,
  totalCount,
  appliedCount,
}: {
  regions: string[];
  topics: string[];
  targets: string[];
  totalCount: number;
  appliedCount: number;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentSort = searchParams.get("sort") || "latest";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (value) params.set(key, value);
    else params.delete(key);
    params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  function handleSearchSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    updateParam("q", ((formData.get("q") as string) ?? "").trim());
  }

  return (
    <div className="flex flex-col gap-4">
      <form onSubmit={handleSearchSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400">
            🔍
          </span>
          <input
            name="q"
            defaultValue={searchParams.get("q") ?? ""}
            placeholder="맛집 이름 또는 한줄평 검색"
            className="h-11 w-full rounded-lg border border-black/10 bg-white pl-9 pr-3 text-sm outline-none focus:border-black/30"
          />
        </div>
        <button
          type="submit"
          className="h-11 shrink-0 rounded-lg bg-[#ff6a3d] px-5 text-sm font-medium text-white transition-colors hover:bg-[#e85a2f]"
        >
          검색
        </button>
      </form>

      <div className="flex flex-wrap gap-2">
        <FilterSelect
          label="주제"
          value={searchParams.get("topic") ?? ""}
          options={topics}
          onChange={(v) => updateParam("topic", v)}
        />
        <FilterSelect
          label="대상"
          value={searchParams.get("target") ?? ""}
          options={targets}
          onChange={(v) => updateParam("target", v)}
        />
        <FilterSelect
          label="음식 종류"
          value={searchParams.get("foodType") ?? ""}
          options={FOOD_TYPES}
          onChange={(v) => updateParam("foodType", v)}
        />
        <FilterSelect
          label="지역"
          value={searchParams.get("region") ?? ""}
          options={regions}
          onChange={(v) => updateParam("region", v)}
        />
      </div>

      <div className="flex items-center justify-between border-t border-black/5 pt-3">
        <span className="text-sm text-zinc-500">
          맛집 {totalCount}개 ·{" "}
          <span className={appliedCount > 0 ? "font-medium text-[#ff6a3d]" : ""}>
            필터 {appliedCount}개 적용
          </span>
        </span>
        <div className="flex gap-3 text-sm">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateParam("sort", opt.value === "latest" ? "" : opt.value)}
              className={`cursor-pointer font-medium transition-colors ${
                currentSort === opt.value
                  ? "text-black"
                  : "text-zinc-400 hover:text-zinc-600"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

function FilterSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="h-9 rounded-full border border-black/10 bg-white px-3 text-sm text-zinc-600 outline-none"
    >
      <option value="">{label} 전체</option>
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  );
}
