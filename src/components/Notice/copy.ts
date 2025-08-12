import type { Notification } from "./notice.types";

function quoteSnippet(src?: string, max = 36) {
  if (!src) return "“”";
  const s = src.trim();
  const clipped = s.length > max ? s.slice(0, max) + "…" : s;
  return `“${clipped}”`;
}

/** 1줄(상단) 카피: 타입별 생성 */
export function buildNoticeCopy(n: Notification): string {
  const c = n.context;
  switch (n.type) {
    case "comment":
      return `${quoteSnippet(c?.title)}에 댓글이 달렸습니다.`;
    case "reply":
      return `${quoteSnippet(c?.myComment)}에 답글이 달렸습니다.`;
    case "system":
    default:
      return n.text ?? "";
  }
}
