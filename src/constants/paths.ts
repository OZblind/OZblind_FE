// constants/paths.ts
export const PATHS = {
  ROOT: "/", // 현재(25.08.10) 테스트 허브
  AUTH: "/auth", // 로비(랜딩)+로그인,회원가입 페이지
  MAIN: "/main",
  KEY_VERIFY: "/key-verify",

  // 게시판
  FREE_BOARD: "/board/free",
  JOBS_BOARD: "/board/career",
  INFORMATION_BOARD: "/board/information",
  SURVEY_BOARD: "/board/survey",
  GITHUB_BOARD: "/board/github",

  // 마이페이지 관련 경로 추가
  MYPAGE: "/mypage",
  MYPAGE_POSTS: "/mypage/posts",
  MYPAGE_COMMENTS: "/mypage/comments",
  MYPAGE_BOOKMARKS: "/mypage/bookmarks",

  ERROR_403: "/403",
  ERROR_404: "/404",
  ERROR_500: "/500",
} as const;
