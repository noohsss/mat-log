"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

type PlaceResult = {
  place_name: string;
  address_name: string;
  road_address_name?: string;
};

export function KakaoAddressSearch({
  name,
  defaultValue,
}: {
  name: string;
  defaultValue?: string;
}) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [value, setValue] = useState(defaultValue ?? "");
  const [results, setResults] = useState<PlaceResult[]>([]);
  const [open, setOpen] = useState(false);
  const placesRef = useRef<any>(null);

  useEffect(() => {
    const appkey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!appkey) return;

    if (window.kakao?.maps?.services) {
      placesRef.current = new window.kakao.maps.services.Places();
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&libraries=services&autoload=false`;
    script.async = true;
    script.onload = () => {
      window.kakao.maps.load(() => {
        placesRef.current = new window.kakao.maps.services.Places();
      });
    };
    document.head.appendChild(script);
  }, []);

  function handleSearch() {
    if (!placesRef.current || !query.trim()) return;
    placesRef.current.keywordSearch(query, (data: PlaceResult[], status: string) => {
      setOpen(true);
      setResults(status === window.kakao.maps.services.Status.OK ? data : []);
    });
  }

  function handleSelect(item: PlaceResult) {
    const address = item.road_address_name || item.address_name;
    setValue(address);
    setQuery(address);
    setOpen(false);
    setResults([]);
  }

  return (
    <div className="relative flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-700">지역·위치</span>
      <div className="flex gap-2">
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setValue(e.target.value);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleSearch();
            }
          }}
          placeholder="예: 서울 마포구 또는 상호명으로 검색"
          className="h-11 flex-1 rounded-lg border border-black/10 bg-transparent px-3 text-black outline-none focus:border-black/30"
        />
        <button
          type="button"
          onClick={handleSearch}
          className="h-11 shrink-0 rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200"
        >
          검색
        </button>
      </div>

      {open && results.length > 0 && (
        <ul className="absolute top-full z-10 mt-1 max-h-56 w-full overflow-y-auto rounded-lg border border-black/10 bg-white shadow-md">
          {results.map((r, i) => (
            <li key={i}>
              <button
                type="button"
                onClick={() => handleSelect(r)}
                className="block w-full px-3 py-2 text-left hover:bg-zinc-50"
              >
                <span className="block font-medium text-zinc-700">{r.place_name}</span>
                <span className="block text-xs text-zinc-400">
                  {r.road_address_name || r.address_name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
      {open && results.length === 0 && (
        <p className="absolute top-full z-10 mt-1 w-full rounded-lg border border-black/10 bg-white px-3 py-2 text-xs text-zinc-400 shadow-md">
          검색 결과가 없어요. 직접 입력해도 괜찮아요.
        </p>
      )}

      <input type="hidden" name={name} value={value} />
    </div>
  );
}
