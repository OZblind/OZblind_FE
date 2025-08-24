export type Pos = "front" | "back" | "startup" | "design";
export function posToClass(pos: Pos): "FE" | "BE" | undefined {
  if (pos === "front") return "FE";
  if (pos === "back") return "BE";
  return undefined; // startup/design은 현재 무시
}
