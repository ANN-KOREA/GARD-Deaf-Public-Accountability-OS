# GOOGLE AI STUDIO — APP BUILD MASTER PROMPT
## GARD Deaf Public Accountability OS™ v2.0 (source blueprint v1.0, 2026-11-13)

> **복사·붙여넣기 영역: 이 문서 전체를 Google AI Studio의 Build 모드에 입력하라.** 원본 설계 ZIP의 8개 파일을 프로젝트 입력 자료로 동시에 제공한다. 파일을 읽을 수 없으면 무엇을 읽지 못했는지 명확히 보고하고, 원자료를 추측하거나 허구로 보충하지 말라. 제작 목표는 설명이나 목업이 아니라 실제 작동하고 독립 실행 가능한 두 개의 정적 웹앱이다.

## 0. 당신의 역할과 최상위 완료 조건

당신은 공공재정·농인 언어권·수어통역서비스·사회성과 측정·데이터 출처검증·개인정보보호·접근성·오프라인 웹앱을 이해하는 시니어 제품팀(프로덕트 매니저, 데이터 아키텍트, 감사·검증 담당, 접근성 전문가, 프런트엔드 엔지니어, QA 엔지니어)이다. 한국어로 설계하고 구현한다.

**반드시 코드와 실행파일을 실제로 작성하라.** 주요 산출물은 완전히 별개로 작동하는 `owner.html`과 `reviewer.html`이다. 각각 자체 JS/CSS/검증·계산 로직을 포함하고, 최종 사용 시 네트워크, 클라우드 계정, Gemini API, 서버, CDN, 외부 폰트, OAuth, 원격 DB, npm 실행을 요구하지 않는다. Google AI Studio Build의 개발·미리보기 환경은 온라인이더라도 **고객이 납품받은 두 HTML의 런타임은 독립·오프라인**이어야 한다.

**최종 인수 조건:** 소스/빌드 프로젝트 ZIP, `owner.html`, `reviewer.html`, `sample_public.json`, 원본과 동일한 `schema.json`, `sample_synthetic.json`, `README_KO.md`, `QA_REPORT.md`, 실행 가능한 테스트 자료·스크립트를 제공한다. 실제 작성한 파일의 존재·바이트 수·해시, 실행환경, 각 테스트의 PASS/FAIL/NOT_RUN을 보고한다. 미실행 테스트를 PASS로 표시하지 않는다. 구현 불가능한 기능은 누락 없이 `NOT_IMPLEMENTED`로 명시한다.

### 우선순위
1. **P0—데이터 주권과 안전:** 오너/리뷰어 완전 분리, 합성/실제 구별, 개인정보 기본 미수집, 출처·시점 기록, 원본 보존, 재정 이중계산 방지, 공개 화이트리스트와 작은 셀 보호.
2. **P1—실용성:** JSON 가져오기·검증·저장·검색·상세근거·정확한 재계산·공개승인·내보내기·리뷰·인쇄·백업/복구.
3. **P2—완성도:** 반응형·WCAG 2.2 AA 설계목표·대용량 10만 행 처리·실패 복구·유지보수 테스트.

## 1. 제공 자료 전체를 소스 오브 트루스로 사용

다음 **8개 파일의 역할을 각각 확인**하고 누락 없이 사용하라.

| 파일 | 사용 목적 | 우선순위 |
|---|---|---|
| `GARD_Deaf_Public_Accountability_OS_Blueprint_v1.0.md` | 철학, 10+6 화면, 파이프라인, 수식, 사용자 흐름 U1~U6, 윤리·법률·테스트 T01~T18 | 도메인 규칙 |
| `GARD_DPA_Data_Schema_v1.0.json` | JSON Schema Draft 2020-12의 정확한 필드·enum·형식·참조 계약 | **데이터 규격 최우선** |
| `GARD_DPA_Synthetic_Demo_v1.0.json` | 합성 시설 3개·법인 2개·재정/서비스/성과 기준 데이터 | 수치·UI 회귀검증 |
| `GARD_DPA_Public_Demo_v1.0.json` | 원본 공개 예시의 데이터 형태·메타 검토, 공개 검사 실패 사례 | **무검증 공개 금지** |
| `GARD_DPA_Validate_Demo.py` | 구조·관계·합산·기초변형 검증의 Python 기준 구현(20검사) | 비교 가능한 기준 테스트 |
| `GARD_DPA_App_Build_Master_Prompt_v1.0.md` | 이전 제작 지침과 산출물 요구 | 본 v2.0으로 개선·승계 |
| `README_FIRST.md` | 패키지 사용 순서, 실행 범위·제약·검증 의미 | 가이드·제한사항 |
| `FILE_SHA256SUMS.txt` | 원본 7개 파일의 SHA-256 무결성 체크 | 변조·누락 확인 |

자료 간 충돌의 우선순위는 **v2.0 본 마스터 프롬프트의 안전·완료 조건 → 원본 스키마의 실제 데이터 계약 → 설계도 비즈니스 규칙 → 합성 예시 → v1.0 프롬프트** 순이다. 원본 파일 자체를 소리 없이 고치지 말고 변환이나 마스킹은 새로운 파일로 저장한다. 개발 후에는 원본 파일 체크섬 검증결과를 별도로 보고한다.

원본 `GARD_DPA_Public_Demo_v1.0.json`은 합성자료이지만 **소표본 공개 정책을 충족한 실제 공개용 산출물이라고 가정하지 말라.** `staff_aggregates`의 인원수 `4,1,1,3,1`과 `governance` 민원 `8,5` 등 10 미만 집계가 있다. 이를 안전한 공개 예시의 입력 자료로만 사용하고, 신규 `sample_public.json`은 별도 공개심사 후 생성한다. 합성자료에도 동일한 마스킹 알고리즘을 시험한다. 원본 20개 Python 검사 통과는 브라우저 공개심사 통과가 아니다.

## 2. 제품 목표와 범위

제품명: **GARD Deaf Public Accountability OS™**. 비전: **From Community to Society → Person-Governed, Evidence-Verified Public Service**.

핵심 질문: “누가 공공재정을 결정·집행했고, 어떤 시설·전문인력이 어떤 서비스를 제공했으며, 농인·청각·언어장애인 권리주체에게 어떤 결과가 발생했고, 어떤 근거로 재검증할 수 있는가?”

법인 존속·시설 처리건수·회원 투표율을 곧바로 당사자 자기결정·권리 향상·삶의 변화로 간주하지 않는다. 법인 설립허가, 시설 운영권, 보조금 교부결정, 공공서비스의 권리주체는 서로 다른 개념이다. 수행기관 성과(회계·인력·서비스·민원)와 당사자 성과(이해·선택·결정·문제해결·사회참여)는 다른 시각화로 표시한다. 증거 없는 인과 추론 금지.

**구현 범위:**
- APP A **Owner Ledger**: 오너가 통제하는 공공책임 집계자료 원장, 자료 수동 가져오기, 참조·근거 확인, 고유 ID, 감사·수정 이력, 로컬 저장, 공표 여부 판정, 승인 JSON 내보내기.
- APP B **Public Reviewer**: 승인 공개 JSON만 수동 가져와 원장과 별도로 검증·재계산·검색·비교하고, 근거·결측·이견 보고서를 로컬에서 작성/내보내는 읽기 전용 검증 앱.
- APP C **Personal Outcome Vault**: 개인의 민감한 경험과 동의를 관리하는 미래 별도 제품. **이번 구현 제외**. A/B에 개인명부·개인 얼굴 수어영상·건강정보를 저장하는 기능을 추가하지 말라.

당사자 참여는 지표 선택·검토·반론·공개범위 심사 절차에 반영하되, 개인별 추적이나 특정 조직에 대한 일괄 점수화가 아니다.

## 3. 앱 구성과 네트워크 독립성

### 반드시 만들어야 할 폴더/파일
```text
GARD_DPA_APP_BUILD_v2/
  owner.html                 # 단일 파일: CSS/JS/검증/계산/뷰 코드 내장
  reviewer.html              # 단일 파일: 읽기용 검증/독립 재계산 코드 내장
  schema.json                # v1.0 입력 JSON Schema 원본 그대로
  sample_synthetic.json      # 원본 합성 데모 그대로
  sample_public.json         # 새로 공개게이트를 거친 안전한 합성 공개 샘플
  release_report.json        # 마스킹/제외 항목과 근거만 기록; 숨긴 원값 불포함
  README_KO.md               # Windows Chrome/Edge 운영/백업/복구/제약
  QA_REPORT.md               # 실행환경과 T01~T18 결과; 미실행=NOT_RUN
  tests/                     # 재현 가능한 양·음성 테스트와 스크립트
  source/                    # 선택적 개발용 원본 코드, 배포 HTML에 외부 종속 금지
```

AI Studio가 기본 React/Vite/Node 개발 프로젝트로 시작하더라도 **개발용 런타임과 납품용 정적 파일을 구분**한다. 빌드 결과가 `dist/assets/*.js`에 의존하거나 CDN에서 JS를 받아야 한다면 납품 완료가 아니다. 최종 두 HTML 안에 모든 필수 실행 코드와 스타일이 포함되어야 하며, 소스맵·주석은 자유롭다. Node 서버·Firebase·Cloud Run·AI Studio 공유 URL 없이 파일을 열어 **가져오기→계산→내보내기**가 되어야 한다. 브라우저의 `file://` IndexedDB/WebCrypto 제약을 감지해 사용자에게 알리고, 메모리 사용/매 세션 JSON 백업 대안을 제공한다. 영구 저장 보장을 주장하려면 localhost 또는 HTTPS에서 별도 확인을 요구하라.

고객 대상 빌드에 `fetch`, `XMLHttpRequest`, `WebSocket`, `EventSource`, 원격 스크립트, Google Analytics, 원격 모델 호출, 자동 크롤링을 넣지 않는다. 텍스트의 출처 링크는 사용자가 명시적으로 클릭할 때 새 탭으로만 열도록 안전한 HTTP(S) 검사를 거치며, 자동 데이터 전송은 금지한다. 브라우저 인쇄 및 Blob 다운로드는 가능하다. 외부 라이브러리 사용 시 **빌드 시 번들 내부에 포함**하고 저작권 고지를 남긴다.

사용자 로컬 데이터는 기본적으로 `IndexedDB`에 보관한다. `localStorage`는 테마/글자크기/마지막 탭 등 소량 설정만. 앱 A의 IndexedDB와 앱 B는 다른 데이터 및 저장 키를 사용한다. B는 A의 저장소를 조회/수정하지 않고, 오너가 수동 전달한 JSON만 읽는다. 같은 출처에서 실행될 수 있는 점까지 고려해 A/B에 별도 DB명과 권한·코드 경계를 적용한다. UI에서만 '읽기 전용'으로 표시하지 말고 데이터 변경 API 자체를 제공하지 말라.

## 4. JSON Schema v1.0 계약을 정확하게 구현

**유일한 데이터 규격**은 `GARD_DPA_Data_Schema_v1.0.json`; `$schema = https://json-schema.org/draft/2020-12/schema`, `meta.schema_version`은 정확히 `1.0.0`. 루트는 `additionalProperties:false`이며 필수 열 개 키가 전부 존재해야 한다:

```json
{"meta":{},"organizations":[],"facilities":[],"finances":[],"staff_aggregates":[],"services":[],"outcomes":[],"governance":[],"evidence":[],"reviews":[]}
```

**정확한 필수 필드(원본 스키마를 다시 검사하라):**

| 엔터티 | 필수 필드 |
|---|---|
| `meta` | `schema_version`, `dataset_id`, `title`, `as_of_date`, `dataset_kind`, `publication_scope`, `contains_personal_data`, `facility_reference`, `min_public_cell_n` (+선택 `method_notes`) |
| `organizations[]` | `org_id`, `org_name`, `legal_form`, `role`, `record_status`, `evidence_ids` |
| `facilities[]` | `facility_id`, `facility_name`, `region_code`, `region_name`, `facility_type`, `operator_org_id`, `operating_status`, `as_of_date`, `valid_from`, `valid_to`, `record_status`, `evidence_ids` |
| `finances[]` | `finance_id`, `facility_id`, `fiscal_year`, `funding_type`, `accounting_stage`, `amount_krw`, `money_flow_id`, `purpose_code`, `recipient_org_id`, `record_status`, `evidence_ids` |
| `staff_aggregates[]` | `staff_record_id`, `facility_id`, `as_of_date`, `sign_interpreters`, `deaf_interpreters`, `other_staff`, `fte`, `record_status`, `evidence_ids` |
| `services[]` | `service_record_id`, `facility_id`, `period_start`, `period_end`, `service_type`, `count_unit`, `requests_total`, `completed_requests`, `unserved_requests`, `cancelled_by_user`, `pending_requests`, `completed_service_events`, `unique_users`, `record_status`, `evidence_ids` |
| `outcomes[]` | `outcome_id`, `facility_id`, `period_start`, `period_end`, `outcome_type`, `study_design`, `cohort_population`, `eligible_cohort_count`, `respondents`, `positive_responses`, `record_status`, `evidence_ids` |
| `governance[]` | `governance_id`, `org_id`, `fiscal_year`, `eligible_voters`, `ballots_cast`, `formal_complaints_received`, `formal_complaints_resolved`, `record_status`, `evidence_ids` |
| `evidence[]` | `evidence_id`, `title`, `source_kind`, `issuer`, `document_date`, `access_date`, `url`, `content_sha256`, `access_scope`, `verification_state` |
| `reviews[]` | `review_id`, `target_kind`, `target_id`, `reviewer_role`, `review_date`, `decision`, `notes` |

`meta.facility_reference`는 `{count, as_of_date, source_note}` 세 필수 필드. `dataset_kind=synthetic_demo|real_observation|mixed_internal`; `publication_scope=owner_only|reviewer_approved`; `contains_personal_data`는 boolean; `min_public_cell_n`은 1 이상의 정수. 실제와 합성의 혼합 `mixed_internal`은 자동 공개하지 않는다.

**원본 enum 그대로 사용:**
- `legal_form`: `nonprofit_association|social_welfare_corporation|social_cooperative|public_body|company|other|unknown`
- `organization.role`: `facility_operator|funding_body|service_provider|oversight_body|other`
- `facility_type`: `local_sign_interpretation_center|central_sign_interpretation_center|other`
- `operating_status`: `active|suspended|closed|unknown`
- `funding_type`: `central_government|local_government|mixed_matching|facility_earned_income|organization_unrestricted|donation_restricted|contract_payment|other`
- `accounting_stage`: `appropriation|grant_decision|disbursement|expense|settlement`
- `service_type`: `sign_interpretation|counseling|sign_education|other`
- `outcome_type`: `understood_information|made_own_decision|problem_resolved|independent_participation|other`
- `study_design`: `post_only_self_report|pre_post_uncontrolled|controlled_comparison|administrative_observed|other`
- `source_kind`: `government|parliament|local_government|organization|independent_audit|user_statement|synthetic`
- `access_scope`: `public|owner_only|restricted`
- `record_status/verification_state`: `claim_only|source_documented|reviewed|independently_verified|missing|synthetic_only|disputed`
- `target_kind`: `facility|organization|finance|staff|service|outcome|governance|evidence`
- `reviewer_role`: `data_owner|source_checker|independent_reviewer`
- `review.decision`: `accepted|needs_evidence|rejected|synthetic_only`

`id` 정규식은 `^[A-Za-z0-9][A-Za-z0-9._:-]{2,100}$`; `evidence_ids`는 고유 문자열 배열; 금액/집계수는 **0 이상의 정수 또는 null**, 돈의 단위는 원 KRW, `fte`는 음이 아닌 수 또는 null이다. `fiscal_year`는 finance에서는 2000~2200. 날짜는 유효한 ISO `YYYY-MM-DD`이어야 하고 시작일<=종료일을 검사한다. `content_sha256`은 있으면 소문자 64자리 16진수. 추가 필드/개인식별 필드는 `additionalProperties:false`에 따라 차단하고 문제 행·경로를 표시한다. **스키마 검증과 업무 규칙 검증을 별도 리포트**로 유지한다. JSON Schema를 단순한 몇 개의 문자열 검사로 대체하고 '전체 검증'이라고 부르지 말라. 검증기를 컴파일/번들하거나 v1.0 스키마 기능을 정확히 적용하라.

현재 v1.0 구조의 한계를 숨기지 않는다: `facilities`에 운영기관 이력 배열이 없으므로 **같은 facility_id의 중복 행을 만들어 운영 변경을 표현하지 말라.** 시설의 현재 유일 행을 유지하고 별도 오너 앱 내부 감사로그에 전임·신임·기간·출처를 기록하되 외부 v1.0 JSON에 임의 키를 추가하지 않는다. 운영관계 엔터티 도입은 명시적인 `v1.1` 스키마 변경 후에만. 또한 기관 고유재원 회계와 개인별 outcome 연계는 v1.0만으로 완전 표현하지 못하므로 해당 분석을 비활성화하고 한계를 표시한다.

## 5. 오너 APP A — 10개 화면을 모두 구현

화면 01 `전체현황`: 데이터셋명·기준일·합성 배지·로컬 저장상태·전국자료 아님 경고·시설 수(실제 로드한 행만)·출처 연결 수·누락·논쟁 상태·공개 준비 항목·계산 결과·범위 정의.

화면 02 `시설 원장`: 지역·시설유형·운영상태·기준일 검색 및 정렬·표 페이지네이션, `facility_id` 상세, 운영법인 링크, 설치/폐쇄/변경 이력은 로컬 감사로그에만 저장, 운영법인 null일 때 '미확인'.

화면 03 `법인 원장`: 독립 `org_id`, 법적 형태·역할·운영시설 관계·근거, 법인 회계와 시설 회계를 분리. 회원의 의결권과 전체 농인의 공공서비스 권리를 혼동하지 않음.

화면 04 `재정·자금흐름`: 사업·시설·법인·연도·`funding_type`·`purpose_code`·`money_flow_id`·`accounting_stage` 필터. 예산/교부결정/지급/지출/정산을 명확히 별도 테이블·차트로 표시. 천원 단위 원문은 입력 단계에서 ×1000 후 변환기록을 로컬 감사로그에 남김.

화면 05 `전문인력`: 전문직 유형별 인원, `fte`, 기준일·출처. 특정 기준일 FTE로 다른 기간 누적 서비스 생산성을 무조건 계산하지 않음.

화면 06 `서비스`: 신청건 `request`, 실제 수행횟수 `event`, 시설 내 중복제거 이용자수 `unique_users`를 각각 구별. `completed/unserved/cancelled/pending`과 종결충족률·대기율·취소율 표시. 신청건과 수행횟수는 합산하지 않음.

화면 07 `당사자 집계성과`: `outcome_type`, 조사연구설계, 표본·모집단·응답률·긍정률·문항의 근거와 한계. 자기결정 결과를 사업의 확정적 인과효과라고 표시하지 않음.

화면 08 `자치·민주·책임`: 법인 회원 중 의결권 보유자·투표자·공식 민원 접수·종결, 분모를 표기하고 의견과 공식 행정판정을 구별. 지표 하나로 조직을 '민주적/비민주적'이라 낙인찍지 않음.

화면 09 `Evidence Lab`: 문서명·발행기관·발행일·접근일·원문 URL·해시(해당 파일이 있을 때만)·access_scope·검증상태·증거 ID·검증자의 판단과 범위. 수치 클릭→해당 레코드→출처 링크→검증/상충 기록 추적. 로컬 수정 감사로그에 수정 전후와 근거 기록.

화면 10 `공개 승인·백업`: 후보 미리보기, 원본 유지, 필드 화이트리스트, 공개 가능한 증거만 남기기, 소표본 마스킹, 역산 위험 검사, 유효한 참조 보장, 별도 승인 버튼, 안전한 `sample_public.json` 다운로드와 `release_report.json` 보고서. 오너 전체 백업/복구(merge/replace)와 충돌 미리보기.

**입력 UX:** 실제 사용하는 필드명은 스키마와 일치해야 한다. 필드별 쉬운 한국어 설명, `0/미확인/null/비공개` 구분, 중복 ID 경고, 잘못된 날짜·단위·음수 금액의 즉시 검사, 파일 드래그&드롭/선택, 입력 전체 되돌리기, 저장 성공·오류의 명시적 피드백. 자료 수정과 별도 검증이 완료되기 전 `independently_verified` 자동 부여 금지.

## 6. 리뷰어 APP B — 6개 화면을 모두 구현

화면 01 `공개 JSON 불러오기`: 파일 선택, 스키마·무결성·근거 검증, 공개 승인 여부 확인, 데이터셋 이름/버전/시점/합성 여부를 상단 고정 표시. `owner_only`나 `mixed_internal`, 개인자료가 포함되었다고 표시된 파일은 공개검증 모드로 받아들이지 않음.

화면 02 `대시보드`: 시설/지역/회계연도/회계단계/서비스유형/검증단계 필터, 금액·건수의 표·그래프 병행, 전국 실제 시설 데이터가 없으면 전국 분석 비활성.

화면 03 `시설·법인 상세`: 선택 시설→운영법인→재정·인력·서비스·집계성과→공개 증거의 연결 화면. 원본 비공개 증거를 로컬에서 검색하거나 오너 DB에 접근할 권한 없음.

화면 04 `독립 계산실`: 각 지표의 분자, 분모, 포함·제외 레코드, 필터·기간·단위, 계산식, 소수점 규칙, 출처, 결측·해석 제한 설명. 앱 A가 계산한 결론을 그대로 문자열 복사하지 말고 B 내부 계산 함수로 재생산.

화면 05 `독립검토·반론`: 근거 누락·계산 불일치·시점 불일치·자료의 한계에 대한 검토 의견을 **불러온 원장을 변경하지 않고 별도 로컬 보고서**로 작성; 본 앱이 기관/개인의 법률적 유죄·위법을 자동 확정하지 않음.

화면 06 `검증보고서`: 재계산 결과, 충족/누락 항목, 원본 JSON 파일 정보, 필터·산식·버전·검증 시각, 방법 한계를 HTML 인쇄와 JSON 보고서로 내보내기. PDF는 브라우저 인쇄 'PDF로 저장'을 사용(추가 서버/라이브러리 불필요).

## 7. 정확한 계산 엔진 — 수학·단위·분모 규칙

공통 함수는 두 앱에 각각 **독립적으로 내장**한다.

```typescript
validateSchema(bundle): ValidationIssue[]
validateRelations(bundle): ValidationIssue[]
calculateMetrics(bundle, filters): MetricResult[]
traceLineage(bundle, recordId): EvidenceChain
preparePublicExport(bundle, selection, policy): PublicExportResult
verifyExport(publicBundle): VerificationReport
importBundle(file): ImportResult
backupOwnerData(): Blob
restoreOwnerData(file, strategy: 'merge'|'replace'): RestoreResult
hashEvidence(file): Promise<string|null>
```

`MetricResult`에는 최소 `metric_id`, `value|null`, `numerator|null`, `denominator|null`, `unit`, `period`, `facility_ids`, `source_ids`, `record_ids`, `record_status`, `limitations`, `calculation_allowed`, `reason_if_blocked`를 담는다. 이 내부 타입은 UI 상태/보고서용이며 **v1.0 원장 JSON 루트에 임의 추가하지 않는다.**

**산식과 방어조건:**
1. 동일 회계연도·목적·자금원·시설·단계 안에서만 금액 집계. `appropriation`, `grant_decision`, `disbursement`, `expense`, `settlement`는 서로 더하지 않는다. 같은 `money_flow_id + accounting_stage` 중복 충돌은 검사. 서로 다른 모집단의 회계단계 간 비율도 자동 계산하지 않는다.
2. 신청 상태 합계는 모든 항목이 정수로 확인되었을 때 `requests_total = completed_requests + unserved_requests + cancelled_by_user + pending_requests`여야 한다. 불일치 행은 원인·원본 출처와 함께 격리 또는 저장 전 차단.
3. **종결신청 충족률** = `completed_requests / (completed_requests + unserved_requests)`. 분모 0 또는 필요한 값 null이면 '계산 불가', 0%가 아니다. 대기·이용자취소는 이 비율에서 제외하고 별도 표시.
4. **미종결률** = `pending_requests / requests_total`; **이용자취소율** = `cancelled_by_user / requests_total`. 기간·모집단 동일해야 한다.
5. **자기결정 긍정 응답 비율** = `positive_responses / respondents`; **조사 응답률** = `respondents / eligible_cohort_count`; `positive <= respondents <= eligible` 확인, 설문 표본과 조사방법을 표시한다.
6. **법인 의결 참여율** = `ballots_cast / eligible_voters`. 전체 농인 투표율이나 시민 참여율로 전환하지 않는다. `formal_complaints_resolved <= formal_complaints_received` 검증.
7. `unique_users`는 시설 간 중복 식별 정보가 없으므로 전국 고유 실인원으로 합산 금지; 요청건·수행횟수·실인원은 별개 단위이다.
8. **수행건수/FTE**는 동일기간에 적합한 누적 FTE 등 분모가 확보된 경우에만. `staff_aggregates.as_of_date` 단면 FTE만 있는 v1.0에서는 기간당 생산성 자동계산을 하지 않는다.
9. **건당 원가**는 해당 동일연도·동일사업·정확히 배분된 `expense`와 같은 기간/범위 완료건이 확인된 경우만. `appropriation`으로 원가 계산 금지. v1.0에서 비용배분 정보가 없는 항목은 '불충분한 근거'로 비활성.
10. **법인 자체재원 충당률**은 법인 고유 운영비와 제약 없는 자체재원을 독립적으로 증빙했을 때만. 시설 보조금이 포함되면 차단. v1.0 미지원 명시.
11. `0`은 관찰된 영(0), `null`은 미수집·미확인 또는 공개 마스킹. 표시에서 `0`과 `—`를 구분하고 상세 사유를 표시. 계산 불가를 임의로 0점 변환 금지.
12. 수치 비교마다 근거 문서일/기준일/회계연도·기간/단위/출처·조사설계가 다르면 비교 제한 또는 경고. 관찰값·추정·주장·검증·합성의 시각적 상태를 구별.
13. 전국 센터 수 `206(2026년 3월 언급)` 대 `약 208(다른 공개 페이지)`은 출처와 집계 정의·시점이 다른 값이며 **현재 확정 총수로 하드코딩 금지**. 실제 명부는 가져온 행과 모집단 근거만으로 계산.
14. 검증된 문서가 있더라도 서비스가 개인 삶의 변화를 **인과적으로 창출했다는 결론을 자동 생성하지 않는다**. 자료 커버리지는 사회성과가 아니다.

### 반드시 일치할 합성 데이터 회귀 기준

| 항목 | 원본 레코드 근거 | 기대 결과 |
|---|---|---|
| 합성 시설 수 | `facilities` | **3곳**, 실제 전국 자료 아님 |
| A 예산 | `SYN-FAC-001`, `appropriation` | **400,000,000원** |
| A 지급 | 동일 facility, `disbursement` | **370,000,000원**; 4억+3.7억 합산 금지 |
| A+B 예산 단계만 | `appropriation` | **610,000,000원** (두 센터) |
| 지급 단계만 | `disbursement` | **370,000,000원** (한 센터); 위 예산과 커버리지 다름 |
| A 신청 상태 | `SYN-SRV-001` | **1,200=900+120+100+80** |
| A 종결 충족률 | `900/(900+120)` | **88.235294...%** |
| A+B 종결 충족률 | `1400/(1400+195)` | **87.774294...%** |
| 자기결정 응답자 긍정률 | `60/80` | **75%** |
| 조사 응답률 | `80/220` | **36.363636...%** |
| 법인 회원 의결 참여율 | `32/50` | **64%** |

백분율 표시 기본 소수점 둘째 자리, 내부 값은 충분한 정밀도로 유지. 원자료 값을 변경하거나 서로 다른 조사/기간을 섞어 기대값에 맞추지 않는다.

## 8. 데이터 검증, 무결성, 출처 체인

검증 3단계를 분리하라.

**A. 구조:** JSON 유효성, 스키마 버전, 필수 및 추가필드, 자료형/enum/날짜/ID/부호/정수, 알 수 없는 PII 필드 차단. 문자열에 HTML/스크립트가 있어도 반드시 **텍스트로만 출력**; `innerHTML`에 사용자 문자열 삽입 금지.

**B. 관계·의미:** 각 테이블 내 ID 고유성, 외래키(법인, 시설, 증거, 리뷰 대상) 확인, `operator_org_id` null 허용, 기간 역전 탐지, 중복되는 `(facility_id,fiscal_year,money_flow_id,accounting_stage)` 검출, 동일 시설·기간·서비스유형 중복 검토, 계산 제약/응답 상하한/투표·민원 관계 검증, 합성 record/evidence의 `synthetic_only` 일치.

**C. 출처와 독립검증:** 레코드별 `evidence_ids` 링크, 근거 없는 실제 수치는 `missing` 또는 검증 보류, 출처 발행자·발행일·접근일·권한·해시·근거문서 미수집 표시. `reviewed`는 수치 재계산 검토이고 `independently_verified`는 이해관계 분리된 실제 검증자·대상 범위·근거가 별도로 확인된 경우에만. 앱이 버튼 한 번으로 자동 '독립 검증 완료'를 선언하지 않음. `disputed`는 증거 상충·판정 유보.

원본 URL은 자동 수집 또는 자동 신뢰 판단에 사용하지 않는다. 실제 파일 bytes를 제공받은 경우에만 SHA-256을 계산하고 `content_sha256`에 기록. 없으면 null. 개발용 가짜 해시, 날짜, 실명 기관이나 예산을 만들지 않는다. 검증 이력은 누가 무엇을 검토했는지 **검토 주장과 기술 검증을 구분**해 기록한다.

## 9. 공개심사 게이트 — 핵심 비즈니스 기능

공개 버튼은 단순 `JSON.stringify(allData)`가 아니다. 정확히 다음 단계로 구현하라.

1. **사전 조건:** `schema_version=1.0.0`, `contains_personal_data=false`, 내부 구조·참조·비공개 증거 검사 PASS. 실제·합성 혼합 `mixed_internal` 자동 공개 거부. `real_observation`은 오너의 명시적 승인을 거친 검증 가능한 항목만, `synthetic_demo`는 '합성 실습' 배지 강제 후 데모 배포 가능.
2. **화이트리스트:** 10개 엔터티에서 v1.0 스키마가 허용한 필드만 선택하여 **새 JSON 객체를 조립**한다. 원본 JS 객체를 얕게 복사하여 owner 메타나 첨부 바이트를 끌고 오지 말라. `access_scope != public`인 `evidence` 자체를 제외. 원문 개인자료·내부 경로·비공개 URL·민감 메타는 밖으로 나갈 수 없다.
3. **참조 정리:** 제외한 증거에 대한 `evidence_ids`는 참조 무결성을 보존하도록 처리. 공개 자료만으로 수치 재검증이 불가능하면 **그 수치를 근거충분/독립검증으로 표시하지 않고**, 관련 공개 행 또는 지표를 제외하거나 `missing`로 낮춰 표시하는 등 명시적인 사유가 있어야 한다. 공개 JSON이 새로운 검증을 통과해야 한다.
4. **소표본 보호:** `min_public_cell_n` 기본 10. 공개되는 사람 수·인력·민원·응답 등 소규모 셀은 `0 < n < 10`이면 공개 단계에서 null/미공개로 대체하거나 상위 안전 집계로 변환. 비공개 후 합계·차액·서로 겹치는 테이블로 값이 역산되지 않는지 **보완적 셀 숨김(complementary suppression)** 검사. 0은 무조건 안전하다고 가정하지 말고 재식별 위험을 검토. 인원수와 연결된 FTE 같은 파생값도 별도 점검. 이 임계치만으로 법률상 익명성이 보장된다고 표현하지 않는다.
5. **스키마 유지:** 원본 스키마의 null 허용 필드에는 null을 사용해 마스킹하고, 누락·비공개 사유는 `release_report.json` 또는 `meta.method_notes`에서 설명하되 숨긴 **원값은 공개 리포트에도 넣지 않는다**. 공개 규칙 설명을 위해 스키마에 미정의 필드를 추가하지 말라. 0과 공개마스킹 null의 의미는 UI에서 구분하고 공개 리포트에 근거를 표시한다.
6. **사후 확인:** 생성된 공개 JSON에 대해 구조·참조·표본·비공개필드·역산 가능성·합성 배지·계산 회귀시험 재실행. 어떤 검사가 실패하면 파일 다운로드 대신 '공개 보류'와 실패사유 표시. 승인 상태는 공개심사 PASS 뒤에만 `reviewer_approved`로 표기.
7. **수동 전달:** 안전한 `sample_public.json`을 저장장치·이메일 등으로 오너가 직접 B 사용자에게 전달. 자동 이메일 발송·서버 동기화·공유 링크 발급 없음.
8. **버전/수정:** 공개 데이터셋 ID와 생성 시점, 적용 규칙, 제외 및 마스킹 필드 경로를 별도 보고. 원본 보존, 수동 승인 없는 기존 공개파일 자동 덮어쓰기 금지.

별도 `release_report.json`은 원장 스키마 JSON이 아니라 공개심사 보고서임을 명시하라. 예: `{"report_type":"GARD_DPA_PUBLIC_RELEASE","dataset_id":"...","policy":{"min_public_cell_n":10},"masked_paths":[{"path":"staff_aggregates[0].sign_interpreters","reason":"small_cell"}],"blocked":[],"checks":[]}`. 공개문서에 마스킹된 원값을 포함해서는 안 된다.

## 10. 저장·버전·복구·충돌

- Owner의 원본은 세션 변경 시에도 보존되는 것이 원칙. IndexedDB 열기 실패·용량 초과·사용자가 파일을 직접 실행하는 제약 발생 시 정확한 원인과 '현재 데이터 JSON 내보내기' 대안을 제공; 조용한 데이터 유실 금지.
- 전체 백업 파일은 실제 레코드 JSON과 구별된 자체 백업 포맷일 수 있으나 v1.0 원장을 내보낼 때는 v1.0 규격 유지. 백업에는 버전·시각·데이터셋 ID·무결성 정보, 앱 내부 감사·운영변경 기록을 포함하되 `public export`에는 절대 포함하지 말라.
- 복구에서 `merge`와 `replace`를 분리. `replace` 전 원본 자동 백업 시도·확인 대화상자·변경 예고, 취소/롤백 제공. 충돌은 ID/수정시각/레코드 해시를 근거로 표로 보여주고 수동 해결. `schema_version`이 다르면 무조건 자동 병합하지 말고 호환성 경고.
- A/B 사이 데이터 변경은 없음. B의 의견은 독립적인 `review_report.json` 파일로 작성해 오너에게 전달할 수 있으며, 오너가 내용 검토 후 새로운 검증 기록으로 수동 반영.
- JSON에 담긴 텍스트·링크는 불신 입력. JavaScript 코드 실행·HTML 해석·프로토콜 우회·원격 전송 불허.

## 11. UI·농인 접근성·책임성

브랜드 헤더 `GARD DPA | 데이터 기준일 | 합성/실제 | 로컬 저장 상태 | 공개 범위`; 1024/768/375px 반응형. 한국어를 기본 언어로 하고 기술용어 옆에 **쉬운 한국어 설명**, 필요한 경우 영문 필드명을 보조로 제공한다. 키보드 Tab/Enter/Escape, 명확한 포커스 표시·label·aria, 안내문 구조와 스크린리더 읽기 순서, 확대 글자·고대비·움직임 감소 옵션을 지원하라. **WCAG 2.2 AA는 설계 목표일 뿐 실제 테스트 없이 적합성 인증 주장 금지.**

표/그래프 어느 쪽에서도 읽고 검산 가능하게 표시. 그래프는 내부 SVG/Canvas/HTML/CSS로 구현하고 반드시 동일 수치·기간·분모의 텍스트/표 대안 제공. 색만으로 '검증', '보류', '합성', '없음'을 구분하지 말고 아이콘+텍스트 병행. 수어/설명영상은 적법한 권리·자막·원본 검증 없이 자동 삽입하지 않는다.

실명 기관을 포함한 실제 데이터는 원본 검증없이 '부정', '불법', '비효율', '자기결정 향상'으로 단정하지 않음. 오너와 리뷰어에게 동일한 불확실성 표기를 보여준다. 고유한 사용자 경험은 **수치→분모/기간→증거→반론→인간의 판단**을 하나의 화면에서 왕복할 수 있다는 점이다.

## 12. 이용 시나리오 U1~U6 구현

- **U1 지방예산 등록:** 예산서 내용과 문서출처를 수동 입력→facility ID/연도/`appropriation` 지정→합산·근거 표시; 보조금 결정이나 지출이라고 잘못 표시하지 않음.
- **U2 운영기관 변경:** 기존 시설 ID 유지, 원장 내부 변경로그에 전임·신임·기간·근거, v1.0 공개 스키마 이력 표현 한계 설명; 이전 실적의 귀속을 새 법인으로 자동 이동하지 않음.
- **U3 서비스 실적:** `requests_total`과 `completed_service_events`를 다른 단위로 분리; 실인원이 없으면 이용자 수 표시 중단.
- **U4 자기결정 조사:** 60/80 긍정=75%, 80/220 응답=36.36%; 조사설계 `post_only_self_report`인 경우 인과효과 주장이 아님.
- **U5 재정 검토:** 하나의 `money_flow_id`로 4억원 예산/3.7억원 지급을 연계하되 7.7억원으로 합산하지 않음.
- **U6 공개 승인·검증:** 공개심사→개인/비공개/소표본 제외→동일 공식으로 B에서 독립 재계산→이견/출처누락 보고서 반환.

## 13. 소스 수집·전국 현황 제약

원자료 경로는 다음과 같이 **사용자에게 안내**만 한다: 보건복지부 지역사회재활시설 공개정책 페이지, 2026 장애인복지시설 사업안내, 지방재정365, 보탬e, 지자체 예산·결산·운영평가, 공공데이터포털 지역 센터 현황, 공식 감사문서 및 적법한 집계 연구. 외부 네트워크 자동수집은 본 로컬 납품 앱에 포함하지 않는다. 공식 출처 확인 없이 실명 전국 206개/약 208개 시설·재정·인력·서비스 데이터를 임의 생성하지 않는다. 각 실제 출처에 `문서명·발행주체·문서일·접근일·표/쪽·단위·정정이력·이용권한`을 요구하되 v1.0 JSON이 허용하지 않는 보조 메타는 오너 내부 감사로그에서 관리하고 스키마 변경 없이 외부 JSON에 삽입하지 않는다.

행정·정산·감사·형사적 판단을 자동으로 동급의 확정상태로 표시하지 않는다. `한국수화언어법`, `장애인복지법`, 보조금 관계 법령, 개인정보 보호 규율은 **확인해야 할 규제 맥락**이며 앱에서 법률 자문·불법판정·익명화 인증으로 표기하지 않는다.

## 14. 구현 테스트: T01~T18, 추가 스키마 회귀·공개 심사

원본 `GARD_DPA_Validate_Demo.py`는 Python 기준으로 **20개 설계 데이터 검사(S01~S04 + 자체 T01~T16)**를 제공한다. 이를 브라우저 수동 인수 테스트 T01~T18과 혼동하지 말라. 별도의 테스트 ID 체계와 상태를 사용.

| ID | 승인 테스트 | 완료 조건 |
|---|---|---|
| T01 | 원본 합성 3센터 로드 | 3곳·합성 배지 고정, 실제 명부로 오인하지 않음 |
| T02 | 운영법인 null | 예외없이 '미확인' 표시 |
| T03 | 0과 null | 0 실제 관찰값 vs 미확인/비공개 구별 |
| T04 | 예산 4억·지급 3.7억 | 합계 7.7억이라는 오합산 없음 |
| T05 | 중복 회계단계 | `money_flow_id+stage` 충돌 경고 |
| T06 | 2024 실적+2025 예산 | 건당 원가/비교 자동 차단 |
| T07 | 서비스 상태 합 불일치 | 오류를 잡고 근거/원인 표시 |
| T08 | 900 완료·120 미충족 | 88.2353…% 재현 |
| T09 | 응답 80·긍정 60 | 75%와 응답률 36.36% 분리 |
| T10 | 시설 중복 이용자 | 전국 실제 고유 이용자 합산 없음 |
| T11 | 직원수·회원 의결권 | 인력수를 법인 회원 의결권으로 대체하지 않음 |
| T12 | PII 필드·비공개 증거 | 스키마 거부·공개차단 |
| T13 | 10 미만 작은 셀·보완적 역산 | 공개값 마스킹/보류, 원값 누출 없음 |
| T14 | 연도·단위·기간 불일치 | 부적절한 합산/비교 차단 |
| T15 | 공개 JSON B 검증 | B가 A 원본 없이 동일 계산/출처 상태 재현 |
| T16 | 완전 오프라인 | 두 단일 HTML 파일의 파일선택·검증·내보내기 작동, 외부 호출 0 |
| T17 | 100,000 서비스 레코드 | 검색/필터/가상화 성능 측정·치명적 오류 없음; 미실행 시 NOT_RUN |
| T18 | IndexedDB·스토리지 제한 | 사용자 경고, 현재 데이터 다운로드, 기존 원본 유지 |

**추가 공격/회귀 테스트:** 잘못된 JSON, 필수 필드 삭제, 알 수 없는 필드, 음수/소수 돈, 잘못된 ISO 날짜, 존재하지 않는 시설·법인·증거, `positive_responses>respondents`, `ballots_cast>eligible`, `formal_complaints_resolved>received`, 서비스 상태 불일치, 공개 ZIP처럼 보이지만 `owner_only` 메타인 JSON, 인위적 `dataset_kind` 변경, `<script>` 문자열 삽입, 초대형 데이터, 같은 ID를 가진 버전 충돌, 허용되지 않은 URL 프로토콜, 공개파일 round-trip 일치, SHA-256 조건부 검증. 실패 시 **에러 메시지와 회복 절차**까지 확인한다.

검사 리포트는 다음 형식으로 기록하라: `test_id`, `input_fixture`, `expected`, `actual`, `status(PASS/FAIL/NOT_RUN)`, `environment`, `date`, `evidence_artifact`, `limitations`. 'Build 미리보기 정상'은 `file:// 오프라인 PASS`의 증거가 아니다. 자동테스트만으로 접근성 AA 적합을 선언하지 말라.

## 15. 개발 순서와 각 단계 게이트

**Step A — 소스 확인/계약:** 8개 파일 열람, 체크섬 확인, 스키마 필드 맵 생성, 원본 합성/공개 예시 불일치와 공개위험 표시. 어떤 파일을 읽지 못했다면 가정으로 통과시키지 않는다.

**Step B — 데이터·계산:** 양쪽 앱이 공유할 수 있는 개발단계 공통 계산 코드와 검증 테스트 작성. 최종 납품 때는 각 HTML에 자기완결로 번들. 합성 수치 3센터/4억/3.7억/87.7743%/75%/64% 등 회귀 검증.

**Step C — 앱 A 구현:** 화면 10개·수동 JSON 가져오기·오너 로컬 원장·검증 패널·감사로그·복구·공개 승인 게이트. 백업 실패 시 원본 교체 방지.

**Step D — 안전한 공개 샘플:** 원본 공개 예시의 10 미만 집계 보호/분리, 보완적 숨김 검토, 새 `sample_public.json` 생성, 구조·관계·계산 재검증, `release_report.json` 생성.

**Step E — 앱 B 구현:** 화면 6개·공개 파일만 사용·독립 계산·이견·출처 패널·브라우저 인쇄·JSON 검증 보고서.

**Step F — 접근성과 실제 작동 검증:** 375/768/1024 폭, Windows Chrome/Edge, 키보드, 스크린리더 관련 정적 점검, `file://`/localhost 기능 차이, 외부 요청 0, T01~T18 회귀. 불가능한 테스트는 `NOT_RUN`으로 남긴다.

**Step G — 납품:** 실행파일 2개·JSON 3개·보고서/README/테스트·소스 ZIP·해시와 크기, 사용법, 제한사항. 사용자는 앱을 수동으로 배포하며 **AI Studio/Cloud Run 자동 게시 금지**.

## 16. 출력 순서 및 완성 선언 규칙

응답 첫 부분에 다음의 표를 작성하라.

| 산출물 | 경로 | 구현상태 | 실제 검사상태 |
|---|---|---|---|
| 오너 앱 | `owner.html` | ... | ... |
| 리뷰어 앱 | `reviewer.html` | ... | ... |
| 공개 합성 JSON | `sample_public.json` | ... | ... |
| 스키마·합성 데이터 | `schema.json`, `sample_synthetic.json` | ... | ... |
| 운영 가이드 | `README_KO.md` | ... | ... |
| 공개심사 로그 | `release_report.json` | ... | ... |
| QA 리포트 | `QA_REPORT.md` | ... | ... |
| 다운로드 패키지 | `GARD_DPA_APP_BUILD_v2.zip` | ... | ... |

실행되지 않은 코드/없는 파일을 '생성 완료'로 부르지 않는다. 파일 존재와 프로그램 실행성은 다른 검증이다. **앱 A의 오너 원본·권리·자료와 앱 B의 독립성은 제품의 비가역적 최우선 제약**이다. 기능이 많아 구현이 어려우면 P0을 실제 작동하도록 우선 제공하고 나머지 부분을 목록화한 뒤 이어서 완성하라. 목업 스크린샷만 제공하거나 과장된 합성 전국 통계를 표시하는 결과물은 인수 불가이다.

---

## AI Studio Build에 대한 마지막 실행 명령

**지금부터 설명만 하지 말고 실제 파일을 생성하라.** 프로젝트의 모든 소스와 JSON을 살펴본 다음 `owner.html`과 `reviewer.html`의 구현을 시작하고, 원본 8개 파일의 체크섬·검증 규칙 및 공개 위험까지 실제 코드·테스트에 반영하라. 프리뷰가 React 프로젝트이더라도 최종 두 HTML은 독립적으로 열리고 작동해야 한다. 사용자는 한국어 UI에서 합성 3센터 파일을 가져와 수치→분모→근거→공개 승인→수동 JSON 전달→외부 독립 재검증이라는 전체 경로를 수행할 수 있어야 한다. 최종 답변은 실제 파일·검증 기록·실행 한계만 보고하라.
