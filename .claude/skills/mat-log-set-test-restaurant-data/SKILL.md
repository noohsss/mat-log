---
name: mat-log-set-test-restaurant-data
description: >
  맛로그(mat-log) 프로젝트에서, 맛집 리뷰/정보 웹페이지 URL 하나를 받아 그 안의
  실제 데이터(이름, 사진, 카테고리, 평점, 한줄평)로 restaurants 테이블에 테스트
  데이터를 1건 생성한다. 이름으로 카카오 주소를 검색해 실제 주소·좌표를 채우고,
  사진을 다운로드해 Supabase Storage에 업로드한 뒤 DB에 등록까지 전체 파이프라인을
  수행한다. 사용자가 "이 URL로 테스트 데이터 만들어줘", "이 맛집 등록해줘",
  "트립어드바이저/네이버플레이스/카카오맵 링크인데 여기서 하나 만들어줘" 같이
  URL을 주며 맛로그 앱에 테스트용 맛집을 채워달라고 할 때 반드시 사용한다.
  여러 개를 한번에 만들어달라는 요청이면 이 스킬을 URL 개수만큼 반복 호출한다.
---

# mat-log 테스트 맛집 데이터 생성

맛집 소개 URL 하나에서 실제 데이터를 뽑아 맛로그 앱에 진짜 맛집처럼 보이는 테스트
데이터를 만든다. 핵심은 "가짜처럼 보이지 않는 것" — 이름/사진/주소가 실제로
말이 되어야 하므로, 각 단계에서 진짜 API 호출과 실제 파일 업로드를 거친다.

한 번 실행 = 맛집 1건. 여러 URL이 주어지면 이 과정을 URL마다 반복한다.

## 사전 확인

프로젝트 루트(`/Users/ianpark/Documents/noohss/mat-log`)의 `.env.local`에 아래 값이
있어야 한다. 값 자체는 절대 채팅에 출력하지 말고, 변수로만 다뤄라 (`awk`로 읽어서
바로 curl에 넘기는 식).

- `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `KAKAO_REST_API_KEY` (카카오 로컬 API용 REST 키. JavaScript 키와 다르니 혼동 금지)

Supabase 프로젝트 ID는 `cyhcnezdevjiuyqxoles` (Supabase MCP의 `execute_sql` 등에서 사용).

## 1단계 — URL에서 데이터 추출

대상 URL을 열어서(TripAdvisor·네이버플레이스·카카오맵 플레이스 등은 JS로 렌더링되므로
Browser 도구로 열 것 — 단순 정적 페이지면 WebFetch로도 충분할 수 있음) 아래를 뽑는다:

- **이름** (가게명)
- **대표 사진 URL** 1장 (썸네일이나 대표 이미지 하나면 충분, 화질 좋을 필요 없음)
- **카테고리/음식 종류** (예: "바베큐", "이탈리아 요리", "카페")
- **가격대 표기** (예: "$$-$$$", "저렴한 편" 등)
- **평점** (5점 만점 기준으로 환산 가능한 값)
- **한줄평/리뷰 문구** 하나 (진짜 리뷰 인용문이나 페이지 설명 문구 중 자연스러운 것 하나)

URL이 여러 맛집이 나열된 목록 페이지라면, 목록의 첫 번째 항목을 쓰거나 사용자에게
어떤 걸 원하는지 확인한다 — 이 스킬은 "URL 하나 = 맛집 하나"가 원칙이다.

사진은 실제 존재하는 이미지 URL을 그대로 써야 하며, 있지도 않은 사진을 지어내면 안 된다.
페이지에 쓸만한 사진이 정말 없으면 사진 없이 진행해도 된다 (앱은 사진 없는 카드도
정상적으로 "사진 없음" 플레이스홀더로 처리한다).

## 2단계 — food_type / price_range 매핑

원본 사이트의 표기를 아래 enum 중 하나로 매핑한다 (없는 값은 만들지 말 것):

- `food_type`: 한식 / 중식 / 일식 / 양식 / 카페·디저트 / 술집·바 / 기타
- `price_range`: 저렴 / 보통 / 비쌈

애매하면 "기타"/"보통"으로 fallback. `$` 표기는 대략 `$`→저렴, `$$~$$$`→보통,
`$$$$`→비쌈으로 본다.

## 3단계 — 카카오 주소 검색으로 실제 주소·좌표 확보

Kakao Local 키워드 검색 REST API를 이름으로 호출:

```bash
KEY=$(awk -F= '/^KAKAO_REST_API_KEY=/{print $2}' .env.local)
curl -s -H "Authorization: KakaoAK $KEY" \
  "https://dapi.kakao.com/v2/local/search/keyword.json?query=$(python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "가게이름")"
```

`documents[0]`의 `road_address_name`(없으면 `address_name`)과 `x`(경도)/`y`(위도)를 쓴다.

결과가 없으면:
1. 원본 페이지에 지역/동네 힌트가 있으면 붙여서 재검색 (예: "가게이름 이태원")
2. 그래도 없으면 이름을 단순화하거나("숯불구이" 같은 수식어 제거) 재시도
3. 그래도 안 되면, 원본 페이지에서 알 수 있는 지역의 실제 장소로 검색해 근사 좌표를
   쓰고, 정확한 주소가 아니라 근사치라는 걸 최종 보고에서 사용자에게 알린다
   (지어낸 주소를 쓰지 않는다 — 항상 실제 검색 결과여야 함).

## 4단계 — 사진 다운로드 및 Storage 업로드

```bash
mkdir -p /tmp/mat-log-test-photo
curl -sL -A "Mozilla/5.0" -o /tmp/mat-log-test-photo/photo.jpg "<추출한 사진 URL>"
```

시드 계정으로 로그인해 접근 토큰을 받는다 (RLS가 본인 폴더에만 업로드를 허용하므로
익명 키만으로는 업로드 불가 — 반드시 실제 로그인 토큰 필요):

```bash
SUPABASE_URL=$(awk -F= '/^NEXT_PUBLIC_SUPABASE_URL=/{print $2}' .env.local)
ANON_KEY=$(awk -F= '/^NEXT_PUBLIC_SUPABASE_ANON_KEY=/{print $2}' .env.local)
curl -s -X POST "${SUPABASE_URL}/auth/v1/token?grant_type=password" \
  -H "apikey: ${ANON_KEY}" -H "Content-Type: application/json" \
  -d '{"email":"seed.suji@example.com","password":"devtest1234"}' \
  > /tmp/mat-log-test-photo/auth.json
```

시드 계정 `seed.suji@example.com`의 user_id는 `e768569a-6108-484c-8eb5-7b52e3d20c47`
(수지). 다른 시드 계정을 쓰고 싶다고 특별히 요청받지 않는 한 이 계정을 기본으로 쓴다.

맛집 id를 미리 uuid로 만들고(`python3 -c "import uuid; print(uuid.uuid4())"`), 그 id를
파일명으로 써서 업로드한다:

```bash
ACCESS_TOKEN=$(python3 -c "import json; print(json.load(open('/tmp/mat-log-test-photo/auth.json'))['access_token'])")
RESTAURANT_ID="<생성한 uuid>"
USER_ID="e768569a-6108-484c-8eb5-7b52e3d20c47"
curl -s -o /dev/null -w "%{http_code}\n" -X POST \
  "${SUPABASE_URL}/storage/v1/object/restaurant-photos/${USER_ID}/${RESTAURANT_ID}.jpg" \
  -H "Authorization: Bearer ${ACCESS_TOKEN}" -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: image/jpeg" --data-binary "@/tmp/mat-log-test-photo/photo.jpg"
```

200이 나와야 성공. `photo_url`은
`${SUPABASE_URL}/storage/v1/object/public/restaurant-photos/${USER_ID}/${RESTAURANT_ID}.jpg`.

## 5단계 — DB에 등록 (Supabase MCP `execute_sql`, project_id: `cyhcnezdevjiuyqxoles`)

```sql
WITH new_restaurant AS (
  INSERT INTO restaurants (id, user_id, name, region, food_type, price_range, rating, visited, memo, lat, lng, photo_url)
  VALUES ('<uuid>', '<user_id>', '<이름>', '<도로명 주소>', '<food_type>', '<price_range>', <rating>, true, '<한줄평>', <lat>, <lng>, '<photo_url>')
  RETURNING id
)
INSERT INTO restaurant_tags (restaurant_id, tag_id)
SELECT nr.id, t.id FROM new_restaurant nr
JOIN tags t ON t.name IN ('<주제 태그>', '<대상 태그>')
WHERE t.type IN ('topic', 'target');
```

태그는 DB에 이미 있는 것 위주로 고른다 — topic: 기념일/데이트/외식/점심/혼밥/회식,
target: 가족/연인/직장동료/친구. 카테고리·한줄평에서 자연스럽게 맞는 걸 1~2개씩
고르고, 정말 안 맞으면 태그 없이 등록해도 된다 (새 태그를 마음대로 만들 필요는 없음
— 다만 앱은 새 태그 추가도 허용하니 절대 금지는 아니다).

먼저 `list_tables`나 `execute_sql`로 실제 태그 목록을 한 번 조회해서 정확한 이름을
확인하고 쓸 것 (프로젝트가 바뀌면서 태그 목록이 달라졌을 수 있음).

## 6단계 — 정리 및 보고

`/tmp/mat-log-test-photo` 임시 파일을 지운다. 사용자에게 등록한 맛집의 이름·주소·
음식종류·가격대·평점·태그·사진 반영 여부를 요약해서 알려주고, 주소가 근사치였다면
그 사실도 명확히 알린다.

가능하면 로컬 프리뷰(`npm run dev` 등)나 브라우저로 실제 카드/상세 화면에 반영됐는지
한 번 확인해서 보여주면 좋다 (필수는 아니고, 사용자가 바로 이어서 확인 요청할 걸
대비한 선택 사항).
