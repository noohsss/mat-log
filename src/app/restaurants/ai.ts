import { GoogleGenAI, Type } from "@google/genai";
import { getRestaurants, type RestaurantRow } from "./queries";

const CANDIDATE_LIMIT = 50;
const MAX_RECOMMENDATIONS = 10;

export class AiRecommendError extends Error {}

type TagRow = { tags: { name: string; type: string } | null };

export type AiRecommendation = {
  restaurant: RestaurantRow;
  reason: string;
};

function toCandidateSummary(restaurant: RestaurantRow) {
  const tags = (restaurant.restaurant_tags as unknown as TagRow[])
    .map((t) => t.tags)
    .filter((t): t is { name: string; type: string } => !!t);

  return {
    id: restaurant.id,
    name: restaurant.name,
    region: restaurant.region,
    food_type: restaurant.food_type,
    price_range: restaurant.price_range,
    rating: restaurant.rating,
    tags: tags.map((t) => t.name),
    memo: restaurant.memo,
  };
}

export async function getAiRecommendations(
  query: string,
  excludeUserId?: string
): Promise<AiRecommendation[]> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new AiRecommendError("GEMINI_API_KEY가 설정되어 있지 않습니다.");
  }

  const candidates = await getRestaurants({ excludeUserId, sort: "latest" });
  if (candidates.length === 0) return [];

  const capped = candidates.slice(0, CANDIDATE_LIMIT);
  const candidateSummaries = capped.map(toCandidateSummary);
  const candidateById = new Map(capped.map((r) => [r.id, r]));

  const ai = new GoogleGenAI({ apiKey });

  let response;
  try {
    response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: [
        {
          role: "user",
          parts: [
            {
              text: [
                "너는 맛집 추천 게시판에서 사용자의 자연어 요청에 맞는 맛집을 골라주는 도우미야.",
                "아래 맛집 후보 목록(JSON) 중에서만 골라야 하고, 목록에 없는 맛집을 지어내면 안 돼.",
                `사용자 요청: "${query}"`,
                `맛집 후보 목록: ${JSON.stringify(candidateSummaries)}`,
                `요청과 가장 잘 맞는 순서로 최대 ${MAX_RECOMMENDATIONS}개를 골라, 각 항목마다 id와 한 문장짜리 추천 이유(한국어)를 반환해줘.`,
                "적합한 후보가 하나도 없으면 빈 배열을 반환해.",
              ].join("\n\n"),
            },
          ],
        },
      ],
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendations: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  id: { type: Type.STRING },
                  reason: { type: Type.STRING },
                },
                required: ["id", "reason"],
              },
            },
          },
          required: ["recommendations"],
        },
      },
    });
  } catch (e) {
    console.error("Gemini generateContent failed:", e);
    throw new AiRecommendError("AI 추천 요청 중 오류가 발생했습니다.");
  }

  let parsed: { recommendations: { id: string; reason: string }[] };
  try {
    parsed = JSON.parse(response.text ?? "");
  } catch {
    throw new AiRecommendError("AI 응답을 해석하지 못했습니다.");
  }

  return parsed.recommendations
    .filter((r) => candidateById.has(r.id))
    .map((r) => ({ restaurant: candidateById.get(r.id)!, reason: r.reason }));
}
