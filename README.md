# 오즈의 여섯가지 그림자 🌑🌒🌓🌔🌕🌖

> **익명 기반 소통 플랫폼** – 오즈 코딩스쿨 구성원들이 자유롭고 자연스럽게 교류하고 협업할 수 있도록 만든 프로젝트입니다.  

[👉 프론트엔드 레포 바로가기](https://github.com/OZblind/OZblind_FE)

---

## 📌 프로젝트 개요
오즈 코딩스쿨은 다양한 기수의 개발자들이 함께 성장하는 공간이지만, 실명 기반의 채널에서는 적극적인 소통이 어려운 경우가 많습니다.  
이를 해결하기 위해 **실명은 제외하고 기수와 소속만 노출**하는 방식을 도입하여, 부담 없는 익명 기반 소통 환경을 제공합니다.  

---

## 🚀 주요 기능 및 장점
1. **자연스러운 소통**  
   - 실명을 제외하고 기수와 소속만 표시 → 익명성 유지 + 참여 유도  

2. **통합 커뮤니티**  
   - 전 기수 간 교류 활성화 (디스코드의 부족한 소통 대체)  

3. **지식 공유 허브**  
   - 각 기수의 GitHub 공유 게시판 → 학습 참고 자료 및 라이브러리 확장  

4. **이벤트 & 참여 유도**  
   - 설문 및 프로젝트 참여 인원 파악  
   - 참여자 중 자동 추첨 → 기프티콘 메시지 전송  

5. **취업 연계 정보 제공**  
   - 선배 기수들의 취업 현황 확인 → 후배들이 목표 설정 가능  

6. **학연 및 네트워킹 형성**  
   - 선후배 간 멘토링 및 격려  
   - 추후 신규 OZ 코딩스쿨 입과자 지원 가능  

7. **채용 연계**  
   - 익명 기반 구인/구직 가능  

8. **정보 공유**  
   - 취업 및 개발 관련 인사이트 공유  

---

## 🛠 기술 스택
### Frontend
- **React + TypeScript + Vite**
- **Tailwind CSS**  
- **React Router DOM**
- **React Query / Zustand** (상태 관리)
- **TOAST UI Editor** (게시글 작성/뷰어)
- **Lucide-React** (아이콘)

### Backend (예정 / 연동)
- **Django REST Framework**  
- **WebSocket + Redis** (실시간 채팅)  
- **Supabase / PostgreSQL** (인증 & 데이터 관리)

### Infra & Tools
- **Vercel** (배포)  
- **Docker** (개발환경 통합)  
- **GitHub Actions** (CI/CD)  

---

## 📂 프로젝트 구조
```bash
OZblind_FE/
├── docs/                # 컨벤션, 기능별 사용 가이드
├── public/              # 정적 리소스 (favicon 등)
├── src/
│   ├── api/             # Axios API 모듈 (auth, board, comments, github 등)
│   ├── assets/          # 아이콘, 이미지, 로고
│   ├── components/      # 공통 UI, 게시판, 사이드바, 모달 등
│   ├── config/          # 환경변수, 에러 설정
│   ├── constants/       # 상수 모음 (애니메이션, 경로, 색상 등)
│   ├── features/        # 핵심 도메인 기능 (알림, 게시글, 태그)
│   ├── hooks/           # 커스텀 훅 (무한스크롤, 인증, 댓글, 깃허브 연동 등)
│   ├── layouts/         # 공용 레이아웃 (Root, Main)
│   ├── mocks/           # Mock 데이터 (게시글, 마이페이지 등)
│   ├── pages/           # 라우팅 페이지 (landing, main, boards, mypage 등)
│   ├── router/          # AppRouter 및 라우터 가드
│   ├── store/           # Zustand 전역 상태 (authStore, toastStore)
│   ├── types/           # 타입 정의 (board, post, job, toast 등)
│   └── utils/           # 공용 유틸 (날짜 포맷, 댓글 트리 변환, GitHub 파싱 등)
├── package.json
├── tailwind.config.js
└── tsconfig.json
