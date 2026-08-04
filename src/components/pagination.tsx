"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";

export function Pagination({ page, pageSize, totalCount }: { page: number; pageSize: number; totalCount: number }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));

  if (totalPages <= 1) return null;

  function goToPage(target: number) {
    const params = new URLSearchParams(searchParams.toString());
    if (target > 1) params.set("page", String(target));
    else params.delete("page");
    router.push(params.toString() ? `${pathname}?${params.toString()}` : pathname);
  }

  return (
    <div className="flex items-center justify-center gap-3 pt-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => goToPage(page - 1)}
        className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-40"
      >
        이전
      </button>
      <span className="text-sm text-zinc-500">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        disabled={page >= totalPages}
        onClick={() => goToPage(page + 1)}
        className="rounded-full border border-black/10 px-4 py-2 text-sm font-medium text-zinc-600 transition-colors hover:bg-black/[.04] disabled:cursor-not-allowed disabled:opacity-40"
      >
        다음
      </button>
    </div>
  );
}
