# 배포 전후 검수표 (사용자 운영 기록)

- [ ] 1. ZIP 압축 해제한 루트에 `index.html`, `netlify.toml`, `owner/`, `reviewer/`, `data/`, `scripts/`가 있다.
- [ ] 2. GitHub 신규 저장소를 만들고 원본 전체를 올렸다. 오너 백업 JSON이나 개인 기록은 올리지 않았다.
- [ ] 3. GitHub Actions 검사 32개 항목이 PASS이다.
- [ ] 4. AI Studio Build > Import from GitHub로 같은 저장소를 불러왔다.
- [ ] 5. AI Studio에서 `AI_STUDIO_CONTINUE_PROMPT_KO.md`를 사용하고 변경내용을 GitHub로 동기화했다.
- [ ] 6. Netlify에서 같은 GitHub 저장소를 선택했다. Build command `node scripts/rebuild.cjs`, Publish directory `.`.
- [ ] 7. Netlify 실제 HTTPS 기본 URL(`/`)이 열린다.
- [ ] 8. `/owner/`에서 **합성 3시설**, **예산 610,000,000원**, **지급 370,000,000원**을 확인했다.
- [ ] 9. `/owner/`에서 **87.77%** 및 **합성 자료** 표시를 확인했다.
- [ ] 10. HTTPS에서 `로컬 저장` → 새로고침 → 복원, `원장 백업`을 시험했다.
- [ ] 11. 공개 승인 시 미승인·비공개 출처 데이터의 유출이 없고 소표본 계수를 가리는지 확인했다.
- [ ] 12. `/reviewer/`에서 공개 JSON 파일을 불러와 87.77%를 재계산했다.
- [ ] 13. `독립검증·보고서`에서 JSON 보고서를 내려받았다.
- [ ] 14. 네트워크 끊은 상태에서 별도 `owner.html` 및 `reviewer.html`을 열어 핵심 조회가 가능한지 확인했다(파일 URL 저장 기능은 별도 점검).
- [ ] 15. GitHub에 변경을 push한 뒤 Netlify 자동 재배포와 이전 버전 복원 방법을 확인했다.
- [ ] 16. 실제 자료를 공개하기 전에 권한·출처·법령·익명성·표본 재식별 위험에 대한 인간 검토를 마쳤다.

기록 칸: GitHub 저장소 URL / Netlify HTTPS URL / AI Studio 프로젝트 / 검증 일시 / 사용자 확인.
