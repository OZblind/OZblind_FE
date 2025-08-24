/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@api/client";
import type { CommentMeta } from "@src/types/post";
import { fetchRandomNickname } from "@src/api/nickname"; // 랜덤 닉네임 API

/** ------------------------------
 * 닉네임 태그(본문 내 임베딩) 유틸
 * ------------------------------ */
export const DELETED_PLACEHOLDER = "작성자에 의해 삭제된 댓글입니다.";

// 본문 앞에 붙일 닉네임 (본문과 구별)
const NICK_OPEN = "[[NICK]]";
const NICK_CLOSE = "[[/NICK]]";

/** 본문에 닉네임을 헤더로 임베딩 */
function embedNickHeader(nick: string, body: string) {
  return `${NICK_OPEN}${nick}${NICK_CLOSE}${body ?? ""}`;
}

/** 본문에서 헤더(닉네임) 분리 */
function extractNickHeader(body: string | undefined): {
  nick?: string;
  content: string;
} {
  const text = String(body ?? "");
  if (text.startsWith(NICK_OPEN)) {
    const end = text.indexOf(NICK_CLOSE, NICK_OPEN.length);
    if (end > -1) {
      const nick = text.slice(NICK_OPEN.length, end);
      const content = text.slice(end + NICK_CLOSE.length);
      return { nick, content };
    }
  }
  return { content: text };
}

/** 삭제 문구 판별(닉 헤더 제거 후 비교) */
function isDeletedContent(body: string | undefined) {
  const { content } = extractNickHeader(body);
  return content.trim() === DELETED_PLACEHOLDER;
}

/** ------------------------------
 * 서버 응답 → 클라이언트 모델 변환
 * ------------------------------ */
export function toClientFromPostDetail(c: any): CommentMeta {
  // 자기 자신이 자식에 섞여온 경우 제거
  const rawReplies: any[] = Array.isArray(c.thread_comments)
    ? c.thread_comments
    : [];
  const cleanedReplies = rawReplies.filter(
    (r) => String(r?.id) !== String(c?.id)
  );

  // 닉 헤더 파싱
  const { nick, content } = extractNickHeader(c.content);

  const replies = cleanedReplies.map(toClientFromPostDetail);
  return {
    id: String(c.id),
    // 닉 헤더가 있으면 닉네임을 작성자에 사용, 없으면 기존 값 대신 '익명'으로 마스킹
    author: nick ?? "익명",
    authorId: String(c.user ?? ""), // 필요하면 그대로 유지
    authorName: nick ?? "익명",
    content,
    createdAt: c.created_at,
    likes: c.like_count ?? 0,
    dislikes: c.dislike_count ?? 0,
    liked: false,
    disliked: false,
    hasReplies: replies.length > 0,
    replies,
  };
}

/** ------------------------------
 * 가시성 필터
 * - 대댓글: 삭제문구면 숨김
 * - 루트  : (자식 먼저 필터) 자식 0 + 삭제문구면 숨김
 * ------------------------------ */
export function filterDeletedThread(
  nodes: CommentMeta[],
  isRoot = true
): CommentMeta[] {
  const out: CommentMeta[] = [];
  for (const n of nodes) {
    const filteredChildren = filterDeletedThread(n.replies ?? [], false);
    // 닉 헤더 제거된 content로 삭제문구 판정
    const deleted = isDeletedContent(n.content);
    const hide =
      (!isRoot && deleted) ||
      (isRoot && deleted && filteredChildren.length === 0);

    if (!hide) {
      out.push({
        ...n,
        replies: filteredChildren,
        hasReplies: filteredChildren.length > 0,
      });
    }
  }
  return out;
}

/** ------------------------------
 * 목록: GET /api/posts/:postId/
 *  - 응답을 트리로 변환하고, 가시성 필터 적용
 * ------------------------------ */
export async function listCommentsByPost(
  postId: string | number
): Promise<CommentMeta[]> {
  const { data } = await api.get(`/api/posts/${postId}/`, {
    withCredentials: true,
  });
  const roots = Array.isArray(data?.root_comments)
    ? (data.root_comments as any[])
    : [];

  // 자기 자신 섞임 제거는 toClientFromPostDetail에서 처리
  const tree = roots.map(toClientFromPostDetail);

  // 삭제 가시성 규칙 적용
  return filterDeletedThread(tree, true);
}

/** ------------------------------
 * 작성/수정/삭제
 * ------------------------------ */

/** (루트) 댓글 작성: DB 저장 전 닉 헤더를 본문 앞에 붙여 보냄 */
export async function createRootComment(
  postId: string | number,
  content: string
): Promise<void> {
  let nick = "익명";
  try {
    nick = (await fetchRandomNickname()) || "익명";
  } catch {
    // 닉네임 API 실패 시 익명
  }
  const payload = { post: postId, content: embedNickHeader(nick, content) };
  await api.post(`/api/comments/`, payload, { withCredentials: true });
}

/** (대댓글) 작성: 동일하게 닉 헤더 임베딩 */
export async function createReply(opts: {
  postId: string | number;
  rootId: string | number;
  content: string;
}): Promise<void> {
  let nick = "익명";
  try {
    nick = (await fetchRandomNickname()) || "익명";
  } catch {
    // ignore
  }
  const payload = {
    post: opts.postId,
    root: opts.rootId,
    content: embedNickHeader(nick, opts.content),
  };
  await api.post(`/api/comments/`, payload, { withCredentials: true });
}

/** 수정
 *  - 일단은 ‘닉 헤더 없이’ 저장되면 다음 로드에서 '익명'이 될 수 있음.
 */
export async function updateComment(
  id: string | number,
  content: string,
  opts?: { nick?: string }
): Promise<void> {
  // 1) 우선 호출부가 닉을 주면 그걸 사용
  let nick = opts?.nick;

  // 2) 없으면 내 댓글 목록에서 해당 id를 찾아 기존 본문에서 닉 추출 (작성자만 수정 가능하므로 항상 조회 가능)
  if (!nick) {
    try {
      const { data } = await api.get(`/api/comments/me`, {
        withCredentials: true,
      });
      const mine = Array.isArray(data)
        ? data.find((c: any) => String(c.id) === String(id))
        : undefined;
      if (mine) {
        const parsed = extractNickHeader(mine.content);
        if (parsed.nick) nick = parsed.nick;
      }
    } catch {
      // 무시: 닉을 못 구해도 계속 진행 (익명 처리됨)
    }
  }

  // 3) 닉이 있으면 헤더 임베딩 후 PATCH, 없으면 본문만 PATCH
  const payload = {
    content: nick ? embedNickHeader(nick, content) : content,
  };
  await api.patch(`/api/comments/${id}`, payload, { withCredentials: true });
}

/** 삭제 (백엔드가 soft/hard 결정) */
export async function deleteComment(id: string | number): Promise<void> {
  await api.delete(`/api/comments/${id}`, { withCredentials: true });
}
