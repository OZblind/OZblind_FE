export type BoardSlug = "free" | "jobs" | "info" | "survey" | "github";

export const BOARD_ID: Record<BoardSlug, number> = {
  free: 1,
  info: 2,
  jobs: 3,
  survey: 4,
  github: 5,
};

export const BOARD_SLUG_BY_ID: Record<number, BoardSlug> = {
  1: "free",
  2: "jobs",
  3: "info",
  4: "survey",
  5: "github",
};
