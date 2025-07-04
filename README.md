```
📦 PJT_Fire/
 ┣ 📁 Front/                       # React 기반 재난 대응 통합 프론트엔드
 ┃ ┣ 📁 components/                # 공통 UI + 지도 기능 컴포넌트
 ┃ ┃ ┣ FireMapView.tsx              # 화재/소방서 지도 시각화
 ┃ ┃ ┣ Info2Content.tsx             # 화재 목록 UI
 ┃ ┃ ┣ InfoContent.tsx              # 일반 위험 주소 목록 UI
 ┃ ┃ ┣ LoginContent.tsx             # 로그인 입력 UI
 ┃ ┃ ┣ MapView.tsx                  # 위험지역 + 재난문자 지도
 ┃ ┃ ┣ NavBar.tsx                   # 상단 네비게이션 바
 ┃ ┃ ┗ OldBuildingBlocksMap.tsx     # 노후 건물 지도 시각화
 ┃ ┣ 📁 pages/                     # 라우팅 페이지 구성
 ┃ ┃ ┣ LoginPage.tsx                # 로그인
 ┃ ┃ ┣ RegisterPage.tsx             # 회원가입
 ┃ ┃ ┣ SelectPage.tsx               # 기능 선택 메인
 ┃ ┃ ┣ InfoPage.tsx                 # 사용자 위험지역 등록
 ┃ ┃ ┣ Info2Page.tsx                # 화재 주소 + 소방서 지도
 ┃ ┃ ┗ Info3Page.tsx                # 노후 건물 시각화
 ┃ ┣ 📁 types/
 ┃ ┃ ┗ BlockData.ts                 # 노후 건물 데이터 타입 정의
 ┃ ┣ 📁 public/                    # 정적 파일 경로 
 ┃ ┣ 📄 App.tsx                    # 전체 라우터 구성 
 ┃ ┗ 📄 README.md                  # 프론트엔드 설명 파일
 ┣ 📁 Back/                        # FastAPI 기반 백엔드
 ┃ ┗ 📄 main.py                    # API 서버 진입점 (DB 연결 및 주요 API 포함)
```
