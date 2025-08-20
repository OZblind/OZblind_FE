export type BoardKey = "free" | "jobs" | "info" | "survey" | "github";

/** 서버 board id ↔ FE board key 매핑 */
export const BOARD_ID_TO_KEY: Record<number, BoardKey> = {
  1: "free",
  2: "jobs",
  3: "info",
  4: "survey",
  5: "github",
};

/** 서버 board id ↔ FE board key 매핑 */
export const BOARD_KEY_TO_ID: Record<BoardKey, number> = {
  free: 1,
  jobs: 2,
  info: 3,
  survey: 4,
  github: 5,
};

/** 쿼리 파라미터 키(규약) */
export const BOARD_QUERY_KEY = "board" as const;

/** 타입 가드 */
export function isBoardKey(v?: string | null): v is BoardKey {
  return (
    v === "free" ||
    v === "jobs" ||
    v === "info" ||
    v === "survey" ||
    v === "github"
  );
}
