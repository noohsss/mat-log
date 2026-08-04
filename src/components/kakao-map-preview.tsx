"use client";

import { useEffect, useRef } from "react";

declare global {
  interface Window {
    kakao: any;
  }
}

export function KakaoMapPreview({ lat, lng }: { lat: number; lng: number }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const appkey = process.env.NEXT_PUBLIC_KAKAO_MAP_KEY;
    const container = containerRef.current;
    if (!appkey || !container) return;

    function render() {
      if (!container) return;
      const center = new window.kakao.maps.LatLng(lat, lng);
      const map = new window.kakao.maps.Map(container, { center, level: 4 });
      new window.kakao.maps.Marker({ position: center }).setMap(map);
    }

    if (window.kakao?.maps) {
      window.kakao.maps.load(render);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${appkey}&autoload=false`;
    script.async = true;
    script.onload = () => window.kakao.maps.load(render);
    document.head.appendChild(script);
  }, [lat, lng]);

  return <div ref={containerRef} className="h-48 w-full rounded-lg border border-black/10" />;
}
