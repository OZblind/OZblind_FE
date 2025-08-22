// UI 관련 상수들

// 페이지네이션 설정
export const PAGINATION = {
  MAX_VISIBLE_PAGES: 5, // 한 번에 보여줄 페이지 번호 개수
  DEFAULT_PAGE: 1 as number, // 기본 페이지
  DEFAULT_TOTAL_PAGES: {
    POSTS: 5 as number, // MyPosts 기본 총 페이지 수
    COMMENTS: 3 as number, // MyComments 기본 총 페이지 수
    BOOKMARKS: 4 as number, // MyBookmarks 기본 총 페이지 수
  },
} as const;

// 리스트 관련 설정
export const LIST_SETTINGS = {
  ITEMS_PER_PAGE: 10 as number, // 페이지당 아이템 수
  PREVIEW_ITEMS: 4 as number, // 카드에서 미리보기로 보여줄 아이템 수
  MAX_TITLE_LENGTH: 30 as number, // 제목 최대 길이 (삭제 토스트용)
} as const;

// 모달/다이얼로그 설정
export const MODAL = {
  BACKDROP_OPACITY: 0.5, // 모달 배경 투명도 (50%)
  MAX_WIDTH: "max-w-md", // 모달 최대 너비
  PADDING: "p-6", // 모달 내부 패딩
} as const;

// 토스트 설정
export const TOAST = {
  DEFAULT_DURATION: 3000 as number, // 3초
  SUCCESS_DURATION: 3000 as number, // 성공 토스트 지속 시간
  ERROR_DURATION: 5000 as number, // 에러 토스트 지속 시간
  WARNING_DURATION: 4000 as number, // 경고 토스트 지속 시간
} as const;

// 확률 설정 (시뮬레이션용)
export const SIMULATION = {
  ERROR_PROBABILITY: 0.1 as number, // 10% 에러 발생 확률
  LOADING_MIN_TIME: 500 as number, // 최소 로딩 시간 (ms)
} as const;

// 브레이크포인트 관련
export const BREAKPOINTS = {
  SM: 640, // px
  MD: 768, // px
  LG: 1024, // px
  XL: 1280, // px
} as const;

// 아이콘 크기
export const ICON_SIZES = {
  SMALL: {
    WIDTH: 6, // w-6 (24px)
    HEIGHT: 6, // h-6 (24px)
  },
  MEDIUM: {
    WIDTH: 8, // w-8 (32px)
    HEIGHT: 8, // h-8 (32px)
  },
  LARGE: {
    WIDTH: 16, // w-16 (64px)
    HEIGHT: 16, // h-16 (64px)
  },
  EXTRA_LARGE: {
    WIDTH: 20, // w-20 (80px)
    HEIGHT: 20, // h-20 (80px)
  },
} as const;

// 프로필 관련 설정
export const PROFILE = {
  GENERATION: {
    ELEVENTH: "11기",
    TWELFTH: "12기",
  },
  USER_TYPE: {
    FRONTEND: "FE",
    BACKEND: "BE",
  },
  COLORS: {
    GENERATION_11: "bg-gradient-to-r from-orange-500 to-red-500",
    GENERATION_12: "bg-gradient-to-r from-purple-500 to-pink-500",
    GENERATION_DEFAULT: "bg-gradient-to-r from-gray-500 to-gray-600",
    FE: "bg-gradient-to-r from-blue-500 to-purple-600",
    BE: "bg-gradient-to-r from-green-500 to-teal-600",
    DEFAULT: "bg-gradient-to-r from-blue-500 to-purple-600",
  },
} as const;

// 카드 관련 설정
export const CARD = {
  MIN_HEIGHT: 350, // px - 카드 최소 높이
  MAX_WIDTH: "max-w-xs", // 카드 최대 너비
  SCALE_EXPANDED: 1.5, // 확장 시 스케일
  SCALE_NORMAL: 1, // 일반 스케일
  SCALE_COLLAPSED: 0, // 축소 시 스케일
} as const;

// 빈 상태 메시지
export const EMPTY_MESSAGES = {
  POSTS: "작성한 글이 없습니다.",
  COMMENTS: "작성한 댓글이 없습니다.",
  BOOKMARKS: "북마크한 글이 없습니다.",
  FALLBACK: "항목이 없습니다.",
} as const;

// 에러 메시지
export const ERROR_MESSAGES = {
  LOAD_POSTS: "서버에서 데이터를 가져오는데 실패했습니다.",
  LOAD_COMMENTS: "댓글 데이터를 불러오는데 실패했습니다.",
  LOAD_BOOKMARKS: "북마크 데이터를 불러오는데 실패했습니다.",
  UNKNOWN: "알 수 없는 오류가 발생했습니다.",
  GENERAL: "오류가 발생했습니다",
} as const;

// 버튼 텍스트
export const BUTTON_TEXT = {
  BACK: "뒤로가기",
  RETRY: "다시 시도",
  WRITE: "글쓰기",
  VIEW_BOARD: "게시판 보기",
  SELECT_ALL: "전체 선택",
  DELETE_SELECTED: "선택 삭제",
} as const;

// 로딩 메시지
export const LOADING_MESSAGES = {
  POSTS: "게시글을 불러오는 중…",
  COMMENTS: "댓글을 불러오는 중…",
  BOOKMARKS: "북마크를 불러오는 중…",
} as const;

// 더 불러올 게 없음
export const LIST_MESSAGES = {
  NO_MORE: "목록의 마지막입니다.",
} as const;
