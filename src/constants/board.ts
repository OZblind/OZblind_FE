export type BoardSlug = "free" | "jobs" | "info" | "survey" | "github";

// 프론트 슬러그 → 백엔드 name
export const BOARD_NAME_BY_SLUG = {
  free: "자유게시판",
  jobs: "취업게시판",
  info: "정보게시판",
  survey: "설문게시판",
  github: "깃헙게시판",
} as const;

export const BOARD_SHORT_NAME: Record<BoardSlug, string> = {
  free: "자유",
  jobs: "취업",
  info: "정보",
  survey: "설문",
  github: "GitHub",
};
