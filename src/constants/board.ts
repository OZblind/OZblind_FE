export type BoardSlug = "free" | "job" | "info";

// 프론트 슬러그 → 백엔드 name
export const BOARD_NAME_BY_SLUG = {
  free: "자유게시판",
  info: "정보게시판",
  job: "취업게시판",
} as const;
