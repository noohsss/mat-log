"use client";

import { useState } from "react";
import { searchKakaoAddress, type KakaoPlace } from "@/lib/kakao";
import { KakaoMapPreview } from "./kakao-map-preview";

export function KakaoAddressSearch({
  name,
  defaultValue,
  defaultLat,
  defaultLng,
}: {
  name: string;
  defaultValue?: string;
  defaultLat?: number | null;
  defaultLng?: number | null;
}) {
  const [query, setQuery] = useState(defaultValue ?? "");
  const [value, setValue] = useState(defaultValue ?? "");
  const [results, setResults] = useState<KakaoPlace[]>([]);
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [coords, setCoords] = useState<{ lat: number; lng: number } | null>(
    defaultLat != null && defaultLng != null ? { lat: defaultLat, lng: defaultLng } : null
  );

  async function handleSearch() {
    if (!query.trim() || pending) return;
    setPending(true);
    try {
      const places = await searchKakaoAddress(query);
      setResults(places);
      setOpen(true);
    } finally {
      setPending(false);
    }
  }

  function handleSelect(item: KakaoPlace) {
    const address = item.road_address_name || item.address_name;
    setValue(address);
    setQuery(address);
    setOpen(false);
    setResults([]);
    setCoords({ lat: Number(item.y), lng: Number(item.x) });
  }

  return (
    <div className="relative flex flex-col gap-1.5 text-sm">
      <span className="font-medium text-zinc-700">지역·위치</span>
      <p className="text-xs text-zinc-400">검색 결과는 도로명 주소까지 나와요.</p>
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
          disabled={pending}
          className="h-11 shrink-0 cursor-pointer rounded-lg bg-zinc-100 px-4 text-sm font-medium text-zinc-600 transition-colors hover:bg-zinc-200 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {pending ? "검색 중..." : "검색"}
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
      <input type="hidden" name="lat" value={coords?.lat ?? ""} />
      <input type="hidden" name="lng" value={coords?.lng ?? ""} />

      {coords && <KakaoMapPreview lat={coords.lat} lng={coords.lng} />}
    </div>
  );
}
