# GARD Deaf Public Accountability OS™ — 3개 플랫폼 실행 배포 안내 v0.3

작성 기준일: 2026-11-13  /  상태: **동작 검증된 실행형 정적 웹앱 프로토타입. 계정에 직접 배포된 상태는 아님.**

## 1. 개발·운영 체계

```text
Google AI Studio Build (아이디어, 생성·보완, 코드 검토)
          ⇅ GitHub 동기화
GitHub (단일 소스 원본 / 변경 기록 / 자동테스트)
          ↓ push 시 Netlify 자동 배포
Netlify HTTPS (index.html / owner/ / reviewer/)
          ↓ 사용자가 수동 JSON 파일을 교환
Owner A - 공개 JSON → Reviewer B - 독립 재계산 → 리뷰 JSON
```

이 앱은 생성형 AI API를 필수로 사용하지 않습니다. Google AI Studio는 **개발 플랫폼**, GitHub는 **형상관리**, Netlify는 **정적 호스팅**입니다. 사용자 데이터는 Netlify로 자동 업로드하지 않습니다.

## 2. 다운로드 ZIP 내부 필수 파일

- `index.html`: 앱 A/B 안내 화면, Netlify 기본 주소에 대응.
- `owner/index.html`: 오너 독립 원장 웹앱 A. CSS·JS·검증 스키마·합성 예시를 **자체 내장**.
- `reviewer/index.html`: 검증자 읽기 전용 앱 B. 공개용 합성 JSON 자체 내장.
- `owner.html`, `reviewer.html`: 각각의 HTML을 단일 파일로 별도 전달할 때 쓰는 버전.
- `assets/*.js`, `assets/style.css`: HTML을 재생성하는 개발용 원본.
- `data/schema.json`, `data/synthetic.json`, `data/public-safe-synthetic.json`: 스키마·합성 입력·소표본 보호 공개 예시.
- `scripts/rebuild.cjs`: 외부 라이브러리 없이 자체완결 HTML을 재생성.
- `tests/core_smoke.cjs`: Node 22 기반 32개 엔진 단위 검사.
- `tests/browser_smoke.py`: Playwright 환경에서 화면·공개 JSON 교환 테스트(선택).
- `.github/workflows/verify.yml`: GitHub Actions 테스트.
- `netlify.toml`: Netlify 자동 빌드 및 정적 사이트 게시 설정.
- `_headers`, `robots.txt`: 기본 보안 응답 헤더 및 로봇 지침.
- `AI_STUDIO_CONTINUE_PROMPT_KO.md`: Google AI Studio에 붙여넣을 수정·개선 프롬프트.

**중요:** ZIP 압축을 풀었을 때 `index.html`과 `netlify.toml`이 **저장소 최상위**에 있어야 합니다. ZIP 폴더 전체를 또 하나의 상위 디렉터리로 올리면 Netlify 기본 게시 경로가 어긋납니다.

## 3. GitHub에 새 저장소 만들기

1. https://github.com/new 에서 새 저장소를 만듭니다. 예시 이름은 `GARD-Deaf-Public-Accountability-OS`입니다. 기존에 운영 중인 다른 `GARD` 저장소의 `index.html`을 덮어쓰지 마세요.
2. 공개/비공개는 사용자가 선택합니다. **소스코드와 합성 JSON만** 올리며, 실제 비공개 원장 백업은 절대로 올리지 않습니다.
3. ZIP의 내용물(`index.html`, `owner/`, `reviewer/` 등)을 저장소 루트에 추가합니다. UI에서 업로드하거나 다음 Git 명령을 실행합니다.

```bash
git init
git branch -M main
git add .
git commit -m "GARD DPA v0.3: owner and reviewer offline-first apps"
git remote add origin https://github.com/ANN-KOREA/GARD-Deaf-Public-Accountability-OS.git
git push -u origin main
```

> 위 원격 저장소 주소는 **새 저장소를 위 이름으로 만들었다고 가정한 예시**입니다. 생성 전부터 존재하는 URL이 아닙니다. 저장소 이름을 다르게 만들면 본인 주소로 대체해야 합니다.

4. GitHub Actions의 `GARD DPA static-app tests` 성공 표시를 확인합니다. Node 22에서 32개 항목을 검사합니다.

## 4. Google AI Studio의 Build에 GitHub 가져오기

1. https://aistudio.google.com/ 의 Build 모드에 들어갑니다.
2. 입력창의 **+ > Import from GitHub**를 선택해 방금 만든 저장소를 가져옵니다.
3. `AI_STUDIO_CONTINUE_PROMPT_KO.md` 전체를 프롬프트로 입력합니다.
4. 수정 중인 프로젝트의 GitHub 설정에서 해당 저장소를 연결하고 **Push/Pull 양방향 동기화**합니다.
5. 중요: AI Studio 기본값은 React/Node 풀스택일 수 있습니다. 그러나 본 제품은 Netlify에서 오프라인 사용 가능한 **정적 HTML**이 최종 산출물입니다. Gemini API 키·클라우드 데이터베이스·인증 서버를 자동 추가하지 않도록 주의합니다.
6. JS 또는 CSS 파일을 고친 경우 `node scripts/rebuild.cjs`를 실행하여 `owner/index.html`과 `reviewer/index.html`을 다시 생성한 다음 GitHub에 반영해야 합니다. Netlify도 이 빌드 과정을 자동 실행합니다.

공식 문서: https://ai.google.dev/gemini-api/docs/aistudio-build-mode

## 5. Netlify에 GitHub 연결하여 실제 운영

1. https://app.netlify.com/ 에 로그인합니다.
2. **Add new project > Import an existing project > GitHub**를 선택합니다.
3. 새로 만든 GitHub 저장소를 승인·선택합니다.
4. 배포 설정은 다음과 같습니다.
   - Production branch: `main`
   - Base directory: **비워둠**
   - Build command: `node scripts/rebuild.cjs` (`netlify.toml`에 이미 작성됨)
   - Publish directory: `.` (프로젝트 루트, `netlify.toml` 설정)
   - Environment variables: **없음** (AI 추론을 위한 키 사용 안 함)
5. **Deploy**를 누르면 Netlify가 제공하는 HTTPS 주소가 만들어집니다. 아래 상대 URL로 접속합니다.
   - `/` : 제품 안내 및 앱 선택
   - `/owner/` : 오너 원장 A
   - `/reviewer/` : 공개 검증 B
6. 이후 GitHub `main`에 변경을 push하면 Netlify가 자동으로 새 버전을 게시합니다. 별도로 수동 업로드할 필요가 없습니다.

Netlify 공식 문서: https://docs.netlify.com/start/quickstarts/deploy-from-repository/

### 대안: Netlify에 먼저 정적 폴더 직접 배포

`https://app.netlify.com/drop`에서 압축해제한 **프로젝트 루트 폴더**를 드래그하면 임시 HTTPS 주소로 신속하게 시범 운영할 수 있습니다. 그다음 Netlify 사이트의 `Project configuration > Developer settings > Continuous deployment > Repository`에서 GitHub 저장소를 연결합니다. 현재 Netlify에는 기존 사이트에서 새로운 GitHub 저장소를 생성하는 방식도 안내되어 있으므로 계정 UI에서 기능이 보이면 활용할 수 있습니다.

문서: https://docs.netlify.com/build/git-workflows/create-a-repo-from-netlify/

## 6. 실제 실행 순서 (합성 3센터)

1. Netlify 홈에서 `오너 앱 A 실행`을 누릅니다.
2. 기준일 `2026-11-13`, 합성 실습자료, 시설 `3`개인지 확인합니다.
3. 예산(appropriation) `610,000,000원`, 지급(disbursement) `370,000,000원`이 **따로** 보이는지 확인합니다.
4. 종결 신청 충족률 `87.77%` (1400/1595)를 확인합니다.
5. `증거·검증`에서 스키마·관계 검증 결과를 확인합니다.
6. `공개·내보내기` → 시설 선택 → 공개 확인 체크 → `공개본 재계산·미리보기` → `공개 JSON 다운로드`.
7. Netlify `/reviewer/`에서 공개 JSON을 수동 가져옵니다.
8. `독립검증·보고서`에서 산식을 재현하고 **독립 검증 보고서 JSON**을 다운로드합니다.

## 7. 개인정보·공개 보안 경계

- 초기 데이터는 가상 기관 3곳의 합성 정보입니다. 전국 실제 센터 206/208개와 **절대 혼동하지 않습니다**.
- `owner/index.html`이 공개 웹주소에 존재한다는 사실은 **그 앱을 쓰는 사람의 브라우저 원장에 접근할 수 있다는 뜻이 아닙니다**. 원장 데이터는 각 브라우저의 IndexedDB에 저장되고 서버에 자동 전송되지 않습니다.
- 하지만 **오너 앱에 로그인/인증/암호화 기능이 있는 것은 아닙니다.** 같은 기기를 공유하면 브라우저 데이터 노출 위험이 있습니다. 민감정보·개인식별정보를 넣지 마세요.
- 공개 버튼은 보안·법적 익명성 인증이 아닙니다. 소표본 계수 가림, 공개 출처 선택, 이메일/전화번호 등 단순 패턴 검사는 재식별 방지를 완전히 보증하지 않습니다.
- 실제 법인·시설 자료는 출처, 사용권, 권한, 시점과 회계기준을 사람 검토자가 확인한 경우에만 사용해야 합니다.
- 오너의 비공개 백업 JSON, `.env`, API 키, 민원 원문, 회원 명부, 개인영상은 GitHub·Netlify·AI Studio에 업로드하지 않습니다.
- 브라우저 저장소는 삭제될 수 있으므로 오너가 **원장 백업 JSON을 정기적으로 다운로드**해야 합니다.
- 100% 오프라인 이용은 각각의 자체완결 `owner.html`·`reviewer.html` 파일로 가능하지만 `file://` 브라우저의 IndexedDB/WebCrypto 지원은 브라우저별 차이가 있으므로, 지속적 저장이 필요하면 HTTPS/localhost를 사용하세요.

## 8. 구현과 검증 범위

- 이번 산출물은 **v0.3 정적 실행 프로토타입**입니다. 설계도 전체 v1.0/전국 명부 수집·실제 감사를 구현하거나 검증한 제품이 아닙니다.
- 검증 완료: Node 엔진 테스트 32항목; 브라우저 HTML 렌더링, 합성 수치 표시, 공개본 JSON 다운로드, 읽기전용 앱 JSON 가져오기와 독립 재계산.
- 미검증: Netlify 실제 게시와 HTTPS에서의 IndexedDB 영속 저장(사용자 계정 권한 필요), 대용량 10만건 스트레스 테스트, WCAG 2.2 AA 외부 감사, 개인정보 법률 적합성, 실제 센터 자료 진위.
- 개인 결과 원장 C 및 개인-기관 자동결합은 범위에 없습니다.

## 9. 프로그램 변경·운영 원칙

`assets/core.js`는 스키마·검증·산식·공개 정책을 정의합니다. `assets/owner.js`와 `assets/reviewer.js`는 화면 기능을 정의합니다. 수정 후 아래를 실행합니다.

```bash
node scripts/rebuild.cjs
node tests/core_smoke.cjs
```

의도치 않은 외부 API·CDN·테크 스택 교체가 발생하면 이전 GitHub 버전으로 롤백합니다. `Netlify > Deploys`에서도 게시 이력을 이용해 이전 버전으로 되돌릴 수 있습니다. 동일한 계정 및 브라우저에서 데이터 저장 상태를 시험한 뒤 실제 서비스 사용을 승인하세요.
