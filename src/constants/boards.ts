export type BoardSlug = "free" | "job" | "info" | "survey" | "github";

export const BOARD_ID: Record<BoardSlug, number> = {
  free: 1,
  info: 2,
  job: 3,
  survey: 4,
  github: 5,
};
