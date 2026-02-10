[2026-02-10] [FEAT] electron-vite 5.0 + React 19 + TailwindCSS v4 + AI SDK로 노래 가사 타자연습 앱 초기 구축
[2026-02-10] [DECISION] AI SDK Google Search Grounding(1단계 가사검색) + generateObject(2단계 구조화출력) 2-pass 방식 채택
[2026-02-10] [CONFIG] ai@6.0.78 + @ai-sdk/google@3.0.23 사용, google.tools.googleSearch({}) 방식으로 Grounding 적용
[2026-02-10] [DECISION] electron-vite v5.0 사용 (v2.x는 npm registry에서 삭제됨, v5.0이 최신 stable)
[2026-02-10] [CONFIG] GOOGLE_GENERATIVE_AI_API_KEY 환경변수는 .env 파일에 설정 (AI SDK가 자동 참조)
[2026-02-10] [DECISION] TailwindCSS v4 @tailwindcss/vite 플러그인 방식 사용 (postcss.config 불필요)
[2026-02-10] [DECISION] 윈도우 레이아웃 가로형(820x340)으로 변경 - 좌측 가사/우측 입력 2-panel 구조, 상단 바에 Stats 인라인 배치
[2026-02-10] [DECISION] UI 테마는 초기 다크 테마(#1e1e2e 배경, 보라 계열 포인트) 유지 - cozy/블러 테마 시도 후 원복