import type { ApiNotification } from "@api/notifications";
import type { Notification } from "@components/Notice/notice.types";
import { PATHS } from "@src/constants/paths";

function stripNickSegments(s?: string | null) {
  if (!s) return "";
  const OPEN = "[[NICK]]";
  const CLOSE = "[[/NICK]]";
  let out = "";
  let i = 0;

  while (i < s.length) {
    const a = s.indexOf(OPEN, i);
    if (a === -1) {
      out += s.slice(i);
      break;
    }
    out += s.slice(i, a);
    const b = s.indexOf(CLOSE, a + OPEN.length);
    if (b === -1) {
      break;
    }
    i = b + CLOSE.length;
  }
  return out.replace(/\s{2,}/g, " ").trim();
}

const toPostPath = (id: number) =>
  (PATHS?.POST_DETAIL ?? "/posts/:id").replace(":id", String(id));

export function mapApiToNotice(n: ApiNotification): Notification {
  const hasPost = !!n.post;
  const title = n.post?.title ?? "";
  const path = hasPost ? toPostPath(n.post!.id) : undefined;

  // 닉네임 지우기
  const cleanMsg = stripNickSegments(n.message);

  // 첫째 줄: 게시글 제목 기반 안내문
  const text = hasPost ? `“${title}” 에 댓글이 달렸습니다.` : cleanMsg;

  // 둘째 줄: 실제 댓글 내용(message)- 비어있으면 게시글 제목으로 폴백
  const detail = cleanMsg || title;

  return {
    id: String(n.id),
    type: hasPost ? "comment" : "system",
    text,
    detail,
    read: n.is_read,
    createdAt: n.created_at,
    context: hasPost ? { title, path } : undefined,
  };
}
