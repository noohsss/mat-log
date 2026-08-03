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
