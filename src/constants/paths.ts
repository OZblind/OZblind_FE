export const PATHS = {
  ROOT: "/", // 루트 엔트리: 인증/오즈 인증 상태 분기
  AUTH: "/auth", // 로비(랜딩)+로그인,회원가입 페이지
  MAIN: "/main",
  KEY_VERIFY: "/key-verify",

  SEARCH_BOARD: "/boards/search",

  // 게시판
  BOARD_HOME: "/board",
  FREE_BOARD: "/board/free",
  JOBS_BOARD: "/board/jobs",
  INFO_BOARD: "/board/info",
  SURVEY_BOARD: "/board/survey",
  GITHUB_BOARD: "/board/github",

  // 게시글
  POST_DETAIL: "/posts/:id",
  POST_CREATE: "/write", // 쿼리로 board 구분
  POST_EDIT: "/post/:id/edit",

  // 마이페이지 (중첩 라우팅으로 상대 경로 설정)
  MYPAGE: "/mypage",
  MYPAGE_POSTS: "posts",
  MYPAGE_COMMENTS: "comments",
  MYPAGE_BOOKMARKS: "bookmarks",

  ERROR_403: "/403",
  ERROR_404: "/404",
  ERROR_500: "/500",
} as const;
