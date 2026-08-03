export const FOOD_TYPES = ["한식", "중식", "일식", "양식", "카페·디저트", "술집·바", "기타"];
export const PRICE_RANGES = ["저렴", "보통", "비쌈"];

export const SORT_OPTIONS = [
  { value: "latest", label: "최신순" },
  { value: "rating", label: "평점 높은순" },
] as const;

export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
