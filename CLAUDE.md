@AGENTS.md

# 커밋 규칙 (Conventional Commits)

## 형식

```
<type>(<scope>): <description>

[body]

[footer]
```

- **type**: 아래 타입 중 하나 (영문 소문자)
- **scope**: 변경 범위 (선택, 예: `auth`, `restaurants`, `db`)
- **description**: 무엇을 했는지 한 줄 요약 (한국어, 명령형, 마침표 없음)
- **body**: 필요할 때만 — 왜 바꿨는지, 어떤 트레이드오프가 있었는지 (선택)
- **footer**: 이슈 참조나 `BREAKING CHANGE:` 등 (선택)

## 타입

| type | 용도 |
| --- | --- |
| `feat` | 새 기능 추가 |
| `fix` | 버그 수정 |
| `docs` | 문서 변경 (PLANNING.md, README 등) |
| `style` | 코드 동작에 영향 없는 스타일/포맷 변경 |
| `refactor` | 기능 변경 없는 코드 구조 개선 |
| `perf` | 성능 개선 |
| `test` | 테스트 추가/수정 |
| `chore` | 빌드, 패키지, 설정 등 잡무성 변경 |
| `db` | Supabase 마이그레이션/스키마 변경 |

## 예시

```
feat(auth): 이메일/비밀번호 회원가입·로그인 구현

feat(restaurants): 맛집 등록 폼 추가

fix(login): 이메일 인증 전 로그인 시 에러 메시지 미표시 수정

chore: app/lib을 src/ 하위로 이동

docs: PLANNING.md 인증 방식을 이메일/비밀번호로 갱신

db: restaurants 테이블에 RLS 정책 추가
```

## 규칙

- 커밋 하나 = 논리적으로 하나의 변경. 서로 관련 없는 변경을 한 커밋에 섞지 않는다
- 기능 단위(PLANNING.md의 "MVP 기능 범위" 항목)로 작업이 끝나면 커밋한다
- `--no-verify`, `--amend`(이미 push된 커밋)는 사용하지 않는다

# 프로젝트 배경

"맛로그(mat-log)" — 맛집을 주제/대상/음식종류로 정리해 기록하고, 다른 로그인 사용자에게도 추천 게시판 형태로 공개되는 웹앱. 상세 기능 범위·스키마·화면 구성은 [PLANNING.md](PLANNING.md)가 살아있는 스펙 문서이므로 항상 그쪽을 최신 기준으로 참고한다.

## 기술 스택
- **프론트/백엔드**: Next.js App Router(`src/` 디렉터리) + TypeScript + Tailwind CSS v4, Vercel 배포(리전 `icn1`, 서울 — `vercel.json`)
- **DB/인증**: Supabase(Postgres + Auth 이메일/비밀번호), `@supabase/ssr`로 server/client/middleware 클라이언트 분리, RLS로 권한 강제
- **AI**: `@google/genai`로 Gemini(`gemini-2.5-flash`) 연동, `GEMINI_API_KEY`는 로컬 `.env.local` + Vercel 프로젝트 환경변수(Production) 양쪽에 등록 필요

# 기술 컨벤션·패턴 (이 프로젝트에서 겪은 함정들)

- **인터셉팅 라우트 모달**: 등록/수정 폼은 `@modal` 병렬 라우트로 모달처럼 뜬다. Server Action에서 `redirect()`를 호출하면 모달 슬롯이 제대로 안 닫히므로, 액션 자체는 `redirect` 없이 `revalidatePath`만 하고, 폼을 감싸는 클라이언트 컴포넌트에서 `await action(formData)` 후 `router.back()`으로 닫는다 (`src/app/restaurants/restaurant-form.tsx` 참고)
- **PostgREST 임베디드 조인 필터의 한계**: `.eq()`를 여러 번 걸어도 같은 조인 행 하나에만 적용되므로, "태그 A AND 태그 B"처럼 서로 다른 행에 걸친 AND 조건은 표현이 안 됨. 태그별로 별도 쿼리 후 id 교집합으로 처리한다 (`src/app/restaurants/queries.ts`의 `tagFilterIds` 로직)
- **RLS 기본 방향**: `user_id = auth.uid()`로 본인 행만 UPDATE/DELETE 가능하게, SELECT는 로그인 사용자 전체 허용 — 애플리케이션 코드가 아니라 DB에서 권한을 강제한다
- **Tailwind `peer`/`peer-checked`**: 반드시 형제(sibling) 요소에만 적용된다. 감싸는 wrapper의 자식은 안 먹히므로 토글 스위치 등을 만들 때 DOM 구조를 평탄화해야 한다
- **서버리스 함수-DB 리전 매칭**: Vercel 함수 리전과 Supabase 리전이 다르면 매 요청마다 지연이 누적된다. `vercel.json`의 `regions`를 DB 리전과 맞춘다
- **Gemini 구조화 출력 + 환각 방지**: LLM에게 DB 데이터를 기반으로 추천/선택을 시킬 때는 `responseSchema`로 JSON 스키마를 강제하고, 응답으로 온 id/값은 반드시 원본 후보 집합과 대조 검증한 뒤에만 사용한다 (`src/app/restaurants/ai.ts`)

# 작업 프로세스·협업 습관

- **수정사항 다건 요청 시**: 구현 → 브라우저(Preview)에서 실제 로그인 계정으로 시나리오 검증(정상 동작 + 회귀 없음 확인) → 사용자가 명시적으로 "커밋 푸시"라고 할 때만 커밋한다. 검증 없이 먼저 커밋하지 않는다
- **논리적으로 분리된 변경은 별도 커밋으로 나눈다** (예: 모델 변경과 기능 추가는 같은 요청이어도 커밋 분리)
- **PLANNING.md는 살아있는 스펙 문서**: 기능/스키마/동작이 바뀔 때마다 즉시 갱신하고, "진행 로그" 체크리스트도 함께 갱신한다
- **배포 확인**: push 후 `npx vercel ls`로 최신 배포 확인, `npx vercel inspect <url> --wait`로 빌드 완료(`Ready`) 및 리전까지 확인한다 (Vercel MCP가 연결 안 되어 있으면 CLI로 대체)
- **테스트 계정/데이터**: 시드 계정(`seed.*@example.com`, 비밀번호 `devtest1234`)으로 실제 화면에서 크로스 계정 검증 후, 테스트로 만든 데이터는 SQL로 정리해 운영 DB를 깨끗하게 유지한다
- **비밀키(API 키 등)는 대화창에 다시 노출하지 않는다**: 사용자가 채팅으로 값을 준 경우에도, 이후 확인/재사용 시 파일 내용을 그대로 cat/echo하지 않고 grep/sed 등으로 파일 간 이동만 시킨다
