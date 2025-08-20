export type BoardSlug = "free" | "job" | "info";

export const BOARD_ID: Record<BoardSlug, number> = {
  free: 1,
  job: 2,
  info: 3,
};
