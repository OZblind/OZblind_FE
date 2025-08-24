import type { PositionValue } from "@src/types/tag";

/** UI 포지션 → 서버 class */
export function posToTagClass(pos?: PositionValue): "FE" | "BE" | undefined {
  if (pos === "front") return "FE";
  if (pos === "back") return "BE";
  return undefined; // startup/design은 현재 태깅 대상 아님
}
