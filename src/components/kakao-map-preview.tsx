"use client";

import { useEffect, useRef, useState } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

let sdkLoadPromise: Promise<void> | null = null;

function loadKakaoMapsSdk(appkey: string): Promise<void> {
  if (window.kakao?.maps) return Promise.resolve();
  if (sdkLoadPromise) return sdkLoadPromise;

  sdkLoadPromise = new Promise((resolve, reject) => {
    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false`;
    script.onload = () => {
      window.kakao.maps.load(() => resolve());
    };
    script.onerror = () => {
      sdkLoadPromise = null;
      reject(new Error("카카오맵 스크립트를 불러오지 못했어요."));
    };
    document.head.appendChild(script);
  });

  return sdkLoadPromise;
}

export function KakaoMapPreview({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const appkey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    if (!appkey) {
      setStatus("error");
      setErrorMessage("카카오맵 키가 설정되어 있지 않아요.");
      return;
    }

    let cancelled = false;

    loadKakaoMapsSdk(appkey)
      .then(() => {
        if (cancelled || !containerRef.current) return;
        const center = new window.kakao.maps.LatLng(lat, lng);
        const map = new window.kakao.maps.Map(containerRef.current, { center, level: 4 });
        new window.kakao.maps.Marker({ position: center }).setMap(map);
        setStatus("ready");
      })
      .catch((e: Error) => {
        if (cancelled) return;
        setStatus("error");
        setErrorMessage(e.message || "지도를 불러오지 못했어요.");
      });

    return () => {
      cancelled = true;
    };
  }, [lat, lng]);

  return (
    <div className="relative h-48 w-full overflow-hidden rounded-lg border border-black/10">
      <div ref={containerRef} className="h-full w-full" />
      {status !== "ready" && (
        <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 text-xs text-zinc-400">
          {status === "loading" ? "지도를 불러오는 중..." : errorMessage}
        </div>
      )}
    </div>
  );
}
