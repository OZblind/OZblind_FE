export type BoardSlug = "free" | "jobs" | "info" | "survey" | "github";

// 프론트 슬러그 → 백엔드 name
export const BOARD_NAME_BY_SLUG = {
  free: "자유 게시판",
  jobs: "취업 게시판",
  info: "정보 게시판",
  survey: "설문 게시판",
  github: "깃헙 게시판",
} as const;
