import type { Notification } from "./notice.types";

function clip(src?: string, max = 36) {
  if (!src) return "";
  const s = src.trim();
  return s.length > max ? s.slice(0, max) + "…" : s;
}

export function buildNoticeCopy(n: Notification): {
  snippet: string;
  suffix: string;
} {
  const c = n.context;
  switch (n.type) {
    case "comment":
      return { snippet: clip(c?.title), suffix: "에 댓글이 달렸습니다." };
    case "reply":
      return { snippet: clip(c?.myComment), suffix: "에 답글이 달렸습니다." };
    case "system":
    default:
      return { snippet: n.text ?? "", suffix: "" };
  }
}
