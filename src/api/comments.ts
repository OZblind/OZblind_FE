/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@api/client";
import type { CommentMeta } from "@src/types/post";
import { fetchRandomNickname } from "@src/api/nickname";
import { fetchPostDetailSingleflight } from "./posts";

/** 닉네임 태그 유틸 */
export const DELETED_PLACEHOLDER = "작성자에 의해 삭제된 댓글입니다.";
const NICK_OPEN = "[[NICK]]";
const NICK_CLOSE = "[[/NICK]]";

export function normalizeDate(input: unknown): string {
  if (input == null) return new Date().toISOString();
  if (typeof input === "number") return new Date(input).toISOString();
  let s = String(input).trim();

  // 공백 구분인 "YYYY-MM-DD HH:mm:ss" 형태면 T로 치환
  if (/^\d{4}-\d{2}-\d{2}\s+\d{2}:\d{2}:\d{2}/.test(s) && !s.includes("T")) {
    s = s.replace(" ", "T");
  }

  const t = Date.parse(s);
  return Number.isNaN(t) ? new Date().toISOString() : new Date(t).toISOString();
}

function embedNickHeader(nick: string, body: string) {
  return `${NICK_OPEN}${nick}${NICK_CLOSE}${body ?? ""}`;
}

function extractNickHeader(body: string | undefined): {
  nick?: string;
  content: string;
} {
  const text = String(body ?? "");
  if (text.startsWith(NICK_OPEN)) {
    const end = text.indexOf(NICK_CLOSE, NICK_OPEN.length);
    if (end > -1)
      return {
        nick: text.slice(NICK_OPEN.length, end),
        content: text.slice(end + NICK_CLOSE.length),
      };
  }
  return { content: text };
}
function isDeletedContent(body: string | undefined) {
  const { content } = extractNickHeader(body);
  return content.trim() === DELETED_PLACEHOLDER;
}

/** 서버 응답 → 클라이언트 모델 변환 */
export function toClientFromPostDetail(c: any): CommentMeta {
  const rawReplies: any[] = Array.isArray(c.thread_comments)
    ? c.thread_comments
    : [];
  const cleaned = rawReplies.filter((r) => String(r?.id) !== String(c?.id));
  const { nick, content } = extractNickHeader(c.content);
  const replies = cleaned.map(toClientFromPostDetail);
  return {
    id: String(c.id),
    author: nick ?? "익명",
    authorId: String(c.user ?? ""),
    authorName: nick ?? "익명",
    content,
    createdAt: normalizeDate(c.created_at ?? c.createdAt),
    likes: c.like_count ?? 0,
    dislikes: c.dislike_count ?? 0,
    liked: false,
    disliked: false,
    hasReplies: replies.length > 0,
    replies,
  };
}

/** 삭제 가시성 필터 */
export function filterDeletedThread(
  nodes: CommentMeta[],
  isRoot = true
): CommentMeta[] {
  const out: CommentMeta[] = [];
  for (const n of nodes) {
    const kids = filterDeletedThread(n.replies ?? [], false);
    const del = isDeletedContent(n.content);
    const hide = (!isRoot && del) || (isRoot && del && kids.length === 0);
    if (!hide) out.push({ ...n, replies: kids, hasReplies: kids.length > 0 });
  }
  return out;
}

/** 목록: 동시중복만 합쳐 1회 호출 (캐시 없음) */
export async function listCommentsByPost(
  postId: string | number
): Promise<CommentMeta[]> {
  const post: any = await fetchPostDetailSingleflight(postId);
  const roots = Array.isArray(post?.root_comments) ? post.root_comments : [];
  const tree = roots.map(toClientFromPostDetail);
  return filterDeletedThread(tree, true);
}

/** 루트 댓글 작성 — 서버만 호출 (UI 즉시 반영은 PostComment의 낙관적 추가가 담당) */
export async function createRootComment(
  postId: string | number,
  content: string
): Promise<CommentMeta> {
  let nick = "익명";
  try {
    nick = (await fetchRandomNickname()) || "익명";
  } catch {
    /* empty */
  }
  const payload = { post: postId, content: embedNickHeader(nick, content) };
  const res = await api.post(`/api/comments/`, payload, {
    withCredentials: true,
  });

  // DRF 기본: 201 + 생성된 객체 반환
  const created = res?.data;
  if (created && created.id != null) {
    // 서버 포맷 -> UI 포맷
    return toClientFromPostDetail(created);
  }

  // 혹시 응답이 비어있다면(드물지만) 최소한의 정보로 생성
  return {
    id: `temp_${Date.now()}`, // 임시
    author: nick,
    authorId: String(created?.user ?? ""),
    authorName: nick,
    content,
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    liked: false,
    disliked: false,
    hasReplies: false,
    replies: [],
  };
}

/** 대댓글 작성 — 서버만 호출 (UI 즉시 반영은 PostComment의 낙관적 추가가 담당) */
export async function createReply(opts: {
  postId: string | number;
  rootId: string | number;
  content: string;
}): Promise<CommentMeta> {
  let nick = "익명";
  try {
    nick = (await fetchRandomNickname()) || "익명";
  } catch {
    /* empty */
  }

  const payload = {
    post: opts.postId,
    root:
      typeof opts.rootId === "string" ? parseInt(opts.rootId, 10) : opts.rootId,
    content: embedNickHeader(nick, opts.content),
  };

  const res = await api.post(`/api/comments/`, payload, {
    withCredentials: true,
  });
  const created = res?.data;
  if (created && created.id != null) {
    return toClientFromPostDetail(created);
  }

  // 폴백 (응답이 비었을 때)
  return {
    id: `temp_${Date.now()}`,
    author: nick,
    authorId: String(created?.user ?? ""),
    authorName: nick,
    content: opts.content,
    createdAt: new Date().toISOString(),
    likes: 0,
    dislikes: 0,
    liked: false,
    disliked: false,
    hasReplies: false,
    replies: [],
  };
}

/** 수정 */
export async function updateComment(
  id: string | number,
  content: string,
  opts?: { nick?: string }
): Promise<void> {
  let nick = opts?.nick;
  if (!nick) {
    try {
      const { data } = await api.get(`/api/comments/me`, {
        withCredentials: true,
      });
      const mine = Array.isArray(data)
        ? data.find((c: any) => String(c.id) === String(id))
        : undefined;
      if (mine) nick = extractNickHeader(mine.content).nick;
    } catch {
      /* empty */
    }
  }
  const payload = { content: nick ? embedNickHeader(nick, content) : content };
  await api.patch(`/api/comments/${id}`, payload, { withCredentials: true });
}
export async function deleteComment(id: string | number): Promise<void> {
  await api.delete(`/api/comments/${id}`, { withCredentials: true });
}
