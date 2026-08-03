"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", label: "추천 게시판" },
  { href: "/my", label: "내 맛집" },
];

export function BoardTabs() {
  const pathname = usePathname();

  return (
    <div className="flex gap-2">
      {TABS.map((tab) => {
        const active = pathname === tab.href;
        return (
          <Link
            key={tab.href}
            href={tab.href}
            className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-[#ff6a3d] text-white shadow-sm"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-black"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </div>
  );
}
