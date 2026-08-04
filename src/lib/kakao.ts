"use server";

const KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json";

export type KakaoPlace = {
  place_name: string;
  address_name: string;
  road_address_name: string;
  x: string;
  y: string;
};

export async function searchKakaoAddress(query: string): Promise<KakaoPlace[]> {
  const restApiKey = process.env.KAKAO_REST_API_KEY;
  const trimmed = query.trim();
  if (!restApiKey || !trimmed) return [];

  const res = await fetch(`${KEYWORD_SEARCH_URL}?query=${encodeURIComponent(trimmed)}`, {
    headers: { Authorization: `KakaoAK ${restApiKey}` },
  });
  if (!res.ok) return [];

  const data = await res.json();
  return (data.documents ?? []) as KakaoPlace[];
}
