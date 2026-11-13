# Google AI Studio Build에 붙여 넣는 GARD DPA 지속개발 프롬프트

너는 GARD Deaf Public Accountability OS™의 선임 엔지니어이자 보안·접근성·공공책임 검증자다. 현재 GitHub에서 Import한 웹앱은 **이미 실행 가능한 Local-First 정적 사이트**다. 처음부터 새 React/Node 앱으로 바꾸거나 모든 코드를 폐기하지 말고, 현 코드 기반을 점진적으로 개선한다.

## 1. 변하지 않는 제품 사양

- 2개의 분리된 런타임: `owner/index.html`과 `reviewer/index.html`.
- `owner/index.html`: 오너만 자신의 브라우저에서 집계 원장 입력, 스키마 검증, 자료 복원/수정, 승인 범위 설정, 공개 JSON 생성.
- `reviewer/index.html`: 수동 전달받은 **공개 승인 JSON**만 수신하고 읽기 전용으로 다시 계산, 출처와 한계를 추적, 이견 보고서를 JSON/인쇄로 생성.
- `data/schema.json`의 10개 엔터티를 절대로 임의 변경하지 않는다. 새 필드가 필요하면 별도 `v1.1` 스키마 초안과 마이그레이션 테스트부터 제안한다.
- 개인정보 기본 수집 금지. 개인 결과 원장 C는 이 앱에 추가하지 않는다.
- 정적 클라이언트 앱이며 서버 데이터베이스, Gemini API 키, 클라우드 저장소, 로그인, 인증 토큰, Google 계정은 **핵심 기능의 필수조건이 아님**.
- 외부 API 호출, 외부 폰트, CDN, 원격 텔레메트리, 브라우저에서의 AI 직접호출 기능을 자동 추가하지 않는다.
- AI Studio Build가 자동 생성한 Node 서버 기능이 필요 없는 한 새 서버를 생성하지 않는다. 허용할 수 있는 빌드는 내장 Node를 이용한 **정적 HTML 재생성** 뿐이다.

## 2. 원본 보존과 변경 절차

- 변경의 단일 진실 원본은 `assets/core.js`, `assets/owner.js`, `assets/reviewer.js`, `assets/style.css`, `data/*.json`.
- 수정 후 `node scripts/rebuild.cjs` 실행. `owner/index.html`, `reviewer/index.html`, `owner.html`, `reviewer.html`을 새로 생성하고 CSP SHA-256을 업데이트한다.
- `node tests/core_smoke.cjs`의 32개 테스트를 모두 통과한다.
- `index.html`, `owner/`, `reviewer/`, `netlify.toml`이 프로젝트 루트에 있는지 확인한다.
- 수정 결과를 GitHub로 push할 때는 코드 변경과 생성한 정적 HTML을 함께 push한다. Netlify는 `netlify.toml`의 `node scripts/rebuild.cjs` 후 프로젝트 루트를 게시한다.
- GitHub와 AI Studio 사이에 충돌이 생기면 자동으로 원본을 덮어쓰지 않고 **변경 diff**와 데이터 손실 가능성을 표시한다.

## 3. 회계·사회성과 산식 불변

- 회계 단계 `appropriation`, `grant_decision`, `disbursement`, `expense`, `settlement` 별로만 합계. 절대 모든 단계를 '총 재정'으로 더하지 말 것.
- 신청 종결 충족률 = `completed_requests/(completed_requests+unserved_requests)`, 분모 0 또는 null이면 판단불가.
- `completed_service_events`는 신청건수(`requests_total`)와 같은 단위가 아님.
- 개인의 고유 이용자 수(`unique_users`)는 서로 다른 센터에 걸쳐 전국 합산하지 않는다.
- 긍정응답 = `positive_responses/respondents`, 응답률 = `respondents/eligible_cohort_count` 로 구별.
- 기관 사회성과 관찰과 정책 인과효과는 분리한다. 만족도·자기결정 지표를 인과효과로 표현하지 않는다.
- 운영법인 회원의 투표율은 전체 농인 인구의 의결권 비율이 아니다.
- 0, null, 공개 마스킹, 미수집을 혼동하지 않는다. `null`은 UI에서 맥락과 설명을 표시한다.

## 4. 공개 승인 안전장치

- 오너가 선택한 시설에 대한 **명시적 공개 승인**이 있어야만 JSON 생성.
- 원본에 개인식별정보 필드 또는 `contains_personal_data=true` 존재 시 공개 차단.
- 접근 제한된 근거 문서와 내부 검토 기록, 파일 시스템 경로, 소스 원문, 자유기술 내부 메모를 공개 JSON에 넣지 않는다.
- `min_public_cell_n` 하한은 10. 10 미만의 인력·서비스·성과·자치 집계가 있으면 다른 값을 빼서 소표본을 역산할 수 없도록 해당 레코드의 연동 개수를 모두 `null`로 바꾸고 심사 기록을 만든다.
- 단순 개인정보 패턴·소표본 가림은 법률상 익명성의 완전한 보증이 아니다. 최종 사람 검토를 남긴다.
- `dataset_kind=synthetic_demo`는 진짜 성과로 승격시키지 않는다. 실제 전국 센터 수는 기준일·출처·집계정의에 따라 달라지므로 하드코딩하지 않는다.

## 5. 기존 기능 회귀 테스트

반드시 다음 결과를 유지하라.

| 대상 | 예상 결과 |
| --- | --- |
| 합성 3시설 로딩 | 3개 표시 |
| 회계 단계 예산 | 610,000,000원 |
| 회계 단계 지급 | 370,000,000원 |
| A센터 종결 충족률 | 900/(900+120)=88.24% |
| A+B 합산 종결 충족률 | 1400/1595=87.77% |
| 자기결정 긍정률 | 60/80=75.00% |
| 조사 응답률 | 80/220=36.36% |
| 소표본 공개 마스킹 | 소규모 인력·민원 집계 보호 및 역산 방지 |
| 독립 검증 앱 | 승인 JSON만 받아 공개 수치를 독립 재계산 |
| 원본 지키기 | 리뷰어 앱에서 오너 데이터 무단 수정 불가 |

## 6. UI와 접근성

- 한국어 우선, 농인 당사자의 관점에서 이해하기 쉬운 언어, 색과 텍스트를 함께 쓰는 상태 표시.
- PC/모바일 반응형, 키보드 탐색, 포커스 표시, 화면리더의 role/label, 숫자/표의 텍스트 대체설명.
- Google AI Studio 미리보기와 Netlify HTTPS 실제 사이트의 동작이 일치하는지 비교하여 결과를 기록하라.
- 수어영상은 콘텐츠 사용권·번역 정확성 검증을 받기 전 자동 생성/실제 서비스 탑재하지 않는다.

## 7. 이번 요청에 대한 실행 출력

1. 현재 GitHub 저장소를 읽고 앱의 **실제 파일 구조**를 먼저 요약하라.
2. 위 요구조건과 차이가 나는 곳을 발견하고 오류·자료 손실·공개 유출 위험 순으로 분류하라.
3. 작은 단위로 고친 후 파일 차이를 보여주고 테스트 결과를 기록하라.
4. 완성 후 GitHub로 동기화 가능한 commit을 준비하라.
5. Netlify 설정을 유지하고 새 배포 후 테스트할 URL 체크리스트(`/`, `/owner/`, `/reviewer/`)를 작성하라.
6. 현재 구현하지 못한 기능은 '완료'라고 하지 말고 보류 사유를 밝혀라.

**최종 제품 문장:** “농인의 공공서비스와 그 성과를 사람 주체의 판단, 출처 기반 증빙, 독립 검증 가능한 로컬 우선 공공책임 원장으로 연결하라.”
