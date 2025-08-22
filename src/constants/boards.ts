export type BoardSlug = "free" | "jobs" | "info" | "survey" | "github";

export const BOARD_ID: Record<BoardSlug, number> = {
  free: 1,
  info: 2,
  jobs: 3,
  survey: 4,
  github: 5,
};
