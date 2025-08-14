// constants/animations.ts
export const ANIMATION_TIMINGS = {
  // 페이지 전환 애니메이션
  PAGE_TRANSITION: 400, // MyPosts, MyComments, MyBookmarks 페이지 전환
  CARD_EXPAND: 400, // MyPageMain 카드 확장 애니메이션

  // 리스트 아이템 순차 등장
  ITEM_STAGGER_BASE: 50, // 각 아이템 간격 (index * 50ms)
  ITEM_APPEAR: 500, // 개별 아이템 등장 애니메이션

  // 실행 취소 관련
  UNDO_TIMEOUT: 5000, // 5초 후 자동 삭제
  UNDO_TOAST_DURATION: 5000, // 토스트 표시 시간

  // 로딩 및 API 호출
  LOADING_DELAY: 800, // 로딩 시뮬레이션 (MyComments)
  LOADING_DELAY_POSTS: 1000, // 로딩 시뮬레이션 (MyPosts)
  LOADING_DELAY_BOOKMARKS: 1200, // 로딩 시뮬레이션 (MyBookmarks)

  // 디바운스
  SEARCH_DEBOUNCE: 150, // 검색 디바운스
  API_DEBOUNCE: 300, // 일반 API 디바운스

  // 호버 및 인터랙션
  HOVER_TRANSITION: 200, // 버튼 호버 전환
  SCALE_TRANSITION: 300, // 스케일 애니메이션
} as const;

// 애니메이션 이징 함수들
export const ANIMATION_EASINGS = {
  DEFAULT: "cubic-bezier(0.4, 0, 0.2, 1)", // 기본 이징
  BOUNCE: "cubic-bezier(0.68, -0.55, 0.265, 1.55)", // 바운스 효과
  SMOOTH: "cubic-bezier(0.25, 0.46, 0.45, 0.94)", // 부드러운 전환
  SHARP: "cubic-bezier(0.4, 0, 1, 1)", // 날카로운 시작
} as const;

// CSS 클래스 상수
export const ANIMATION_CLASSES = {
  // 페이지 전환
  PAGE_ENTER: "opacity-100 translate-x-0",
  PAGE_EXIT: "opacity-0 -translate-x-8",
  PAGE_INITIAL: "opacity-0 translate-x-8",

  // 버티컬 전환
  HEADER_ENTER: "opacity-100 translate-y-0",
  HEADER_EXIT: "opacity-0 -translate-y-4",

  // 스케일 전환
  CONTAINER_ENTER: "opacity-100 scale-100",
  CONTAINER_EXIT: "opacity-0 scale-95",

  // 아이템 등장
  ITEM_ENTER: "opacity-100 translate-x-0",
  ITEM_INITIAL: "opacity-0 translate-x-8",
} as const;

// Tailwind CSS duration 클래스 매핑 헬퍼
export const getDurationClass = (ms: number): string => {
  if (ms <= 150) return "duration-150";
  if (ms <= 200) return "duration-200";
  if (ms <= 300) return "duration-300";
  if (ms <= 500) return "duration-500";
  if (ms <= 700) return "duration-700";
  return "duration-1000";
};
