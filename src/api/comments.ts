/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@api/client";
import type { CommentMeta } from "@src/types/post";

// 삭제 문구 상수
export const DELETED_PLACEHOLDER = "작성자에 의해 삭제된 댓글입니다.";

// 삭제 문구 판별
export function isDeletedPlaceholder(text?: string) {
  return (text ?? "").trim() === DELETED_PLACEHOLDER;
}

/** PostDetailSerializer.Comment 구조 → CommentMeta 변환 */
export function toClientFromPostDetail(c: any): CommentMeta {
  const rawReplies: any[] = Array.isArray(c.thread_comments)
    ? c.thread_comments
    : [];
  const cleanedReplies = rawReplies.filter(
    (r) => String(r.id) !== String(c.id)
  );

  return {
    id: String(c.id),
    author: String(c.user ?? ""),
    authorId: String(c.user ?? ""),
    authorName: String(c.user ?? ""),
    content: c.content,
    createdAt: c.created_at,
    likes: c.like_count ?? 0,
    dislikes: c.dislike_count ?? 0,
    liked: false,
    disliked: false,
    hasReplies: cleanedReplies.length > 0,
    replies: cleanedReplies.map(toClientFromPostDetail),
  };
}

/** 가시성 필터
 * - 대댓글: 내용이 삭제문구면 숨김
 * - 루트 : (재귀적으로 자식 먼저 필터) 자식이 0개이고 내용이 삭제문구면 숨김
 */
export function filterDeletedThread(
  nodes: CommentMeta[],
  isRoot = true
): CommentMeta[] {
  const out: CommentMeta[] = [];
  for (const n of nodes) {
    const filteredChildren = filterDeletedThread(n.replies ?? [], false);
    const deleted = isDeletedPlaceholder(n.content);
    const hide =
      (!isRoot && deleted) || // 대댓글이면 삭제문구 → 숨김
      (isRoot && deleted && filteredChildren.length === 0); // 루트이고 자식 0 + 삭제문구 → 숨김

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

/** 목록: GET /api/posts/:postId/ → data.root_comments 사용 */
export async function listCommentsByPost(
  postId: string | number
): Promise<CommentMeta[]> {
  const { data } = await api.get(`/api/posts/${postId}/`, {
    withCredentials: true,
  });
  const roots = Array.isArray(data?.root_comments)
    ? (data.root_comments as any[])
    : [];
  const tree = roots.map(toClientFromPostDetail);

  // 가시성 필터 적용 (루트/대댓글 규칙 모두 반영)
  return filterDeletedThread(tree, true);
}

/** (상단 입력) 루트 댓글 작성 */
export async function createRootComment(
  postId: string | number,
  content: string
): Promise<void> {
  await api.post(
    `/api/comments/`,
    { post: postId, content },
    { withCredentials: true }
  );
}

/** (댓글 영역) 대댓글 작성: root는 스레드의 루트 댓글 id */
export async function createReply(opts: {
  postId: string | number;
  rootId: string | number;
  content: string;
}): Promise<void> {
  await api.post(
    `/api/comments/`,
    { post: opts.postId, root: opts.rootId, content: opts.content },
    { withCredentials: true }
  );
}

/** 댓글 수정 */
export async function updateComment(
  id: string | number,
  content: string
): Promise<void> {
  await api.patch(
    `/api/comments/${id}`,
    { content },
    { withCredentials: true }
  );
}

/** 댓글 삭제 (대댓글 있으면 soft, 없으면 hard) */
export async function deleteComment(id: string | number): Promise<void> {
  await api.delete(`/api/comments/${id}`, { withCredentials: true });
}
