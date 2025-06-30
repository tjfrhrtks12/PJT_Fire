src/
├── components/                      #  UI 구성 요소 (재사용 가능한 컴포넌트 모음)
│   ├── InfoContent.tsx              # 주소 입력/리스트 출력 등 전체 레이아웃을 구성하는 상위 컴포넌트
│   ├── LoginContent.tsx             # 로그인 입력 UI 구성 (username, password 입력폼)
│   ├── NavBar.tsx                   # 상단 네비게이션 바 (로그아웃 버튼 포함, 공통 컴포넌트)
│
├── pages/                           #  실제 라우팅이 연결되는 페이지 (Route 단위로 작동)
│   ├── InfoPage.tsx                 # 주소 입력 페이지 (주소, 메모 등록 및 리스트 출력 포함)
│   ├── LoginPage.tsx                # 로그인 페이지 (로그인 성공 시 InfoPage로 이동)
│
├── App.tsx                          #  라우팅 설정 (React Router를 이용해 Page 연결)
│                                    # - "/" 경로 접근 시 "/login"으로 이동
│                                    # - "/login" → LoginPage
│                                    # - "/info"  → InfoPage


