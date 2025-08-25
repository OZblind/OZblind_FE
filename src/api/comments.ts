/* eslint-disable @typescript-eslint/no-explicit-any */
import { api } from "@api/client";
import type { CommentMeta } from "@src/types/post";
import { fetchRandomNickname } from "@src/api/nickname";
import {
  fetchPostDetailCached,
  mutatePostDetailCache,
  readPostDetailCache,
} from "./posts";

/** 닉네임 태그 유틸 */
export const DELETED_PLACEHOLDER = "작성자에 의해 삭제된 댓글입니다.";
const NICK_OPEN = "[[NICK]]";
const NICK_CLOSE = "[[/NICK]]";

function embedNickHeader(nick: string, body: string) {
  return `${NICK_OPEN}${nick}${NICK_CLOSE}${body ?? ""}`;
}

export function extractNickHeader(body: string | undefined): {
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

function isDeletedContent(body: string | undefined) {
  const { content } = extractNickHeader(body);
  return content.trim() === DELETED_PLACEHOLDER;
}

/** 서버 응답 → 클라이언트 모델 변환 */
export function toClientFromPostDetail(c: any): CommentMeta {
  const rawReplies: any[] = Array.isArray(c.thread_comments)
    ? c.thread_comments
    : [];
  const cleanedReplies = rawReplies.filter(
    (r) => String(r?.id) !== String(c?.id)
  );
  const { nick, content } = extractNickHeader(c.content);
  const replies = cleanedReplies.map(toClientFromPostDetail);

  return {
    id: String(c.id),
    author: nick ?? "익명",
    authorId: String(c.user ?? ""),
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

/** 삭제 가시성 필터 */
export function filterDeletedThread(
  nodes: CommentMeta[],
  isRoot = true
): CommentMeta[] {
  const out: CommentMeta[] = [];
  for (const n of nodes) {
    const filteredChildren = filterDeletedThread(n.replies ?? [], false);
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

/** 안전한 임시 ID 생성 (연속 작성 대비) */
const genTempId = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? (crypto as any).randomUUID()
    : `temp_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

/** 목록: 상세 캐시에서 트리 변환 */
export async function listCommentsByPost(
  postId: string | number
): Promise<CommentMeta[]> {
  const post: any = await fetchPostDetailCached(String(postId)); // 키 일관화
  const roots = Array.isArray(post?.root_comments) ? post.root_comments : [];
  const tree = roots.map(toClientFromPostDetail);
  return filterDeletedThread(tree, true);
}

/** (루트) 댓글 작성: 저장 후 캐시 즉시 패치 */
export async function createRootComment(
  postId: string | number,
  content: string
): Promise<void> {
  let nick = "익명";
  try {
    nick = (await fetchRandomNickname()) || "익명";
  } catch {
    /* empty */
  }
  const payload = { post: postId, content: embedNickHeader(nick, content) };
  await api.post(`/api/comments/`, payload, { withCredentials: true });

  const current = readPostDetailCache(String(postId)) as any | undefined;
  if (current && Array.isArray(current.root_comments)) {
    const newRaw = {
      id: genTempId(),
      user: null,
      content: payload.content,
      created_at: new Date().toISOString(),
      like_count: 0,
      dislike_count: 0,
      thread_comments: [],
    };
    mutatePostDetailCache(String(postId), (prev: any) => ({
      ...prev,
      root_comments: [newRaw, ...(prev.root_comments ?? [])],
    }));
  }
}

/** (대댓글) 작성: 저장 후 캐시 즉시 패치 */
export async function createReply(opts: {
  postId: string | number;
  rootId: string | number;
  content: string;
}): Promise<void> {
  let nick = "익명";
  try {
    nick = (await fetchRandomNickname()) || "익명";
  } catch {
    /* empty */
  }

  // rootId는 반드시 숫자로 변환 (서버가 number 기대)
  const rootIdNum =
    typeof opts.rootId === "string" ? parseInt(opts.rootId, 10) : opts.rootId;
  if (!Number.isFinite(rootIdNum)) {
    // 임시/비정상 id라면 그냥 캐시만 패치하고 종료(또는 에러 처리)
    return;
  }

  const payload = {
    post: opts.postId,
    root: rootIdNum,
    content: embedNickHeader(nick, opts.content),
  };

  await api.post(`/api/comments/`, payload, { withCredentials: true });

  // 캐시 트리에서 해당 "루트 댓글" 아래에 즉시 삽입
  mutatePostDetailCache(String(opts.postId), (prev: any) => {
    if (!prev || !Array.isArray(prev.root_comments)) return prev;

    const targetIdStr = String(rootIdNum);
    const newReply = {
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? (crypto as any).randomUUID()
          : `temp_r_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      user: null,
      content: payload.content,
      created_at: new Date().toISOString(),
      like_count: 0,
      dislike_count: 0,
      thread_comments: [],
    };

    const nextRoots = prev.root_comments.map((root: any) => {
      // 숫자/문자 모두 안전 비교
      if (String(root.id) === targetIdStr) {
        const prevReplies = Array.isArray(root.thread_comments)
          ? root.thread_comments
          : [];
        return {
          ...root,
          thread_comments: [newReply, ...prevReplies],
        };
      }
      return root;
    });

    return { ...prev, root_comments: nextRoots };
  });
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
      if (mine) {
        const parsed = extractNickHeader(mine.content);
        if (parsed.nick) nick = parsed.nick;
      }
    } catch {
      /* empty */
    }
  }

  const payload = { content: nick ? embedNickHeader(nick, content) : content };
  await api.patch(`/api/comments/${id}`, payload, { withCredentials: true });
}

/** 삭제 */
export async function deleteComment(id: string | number): Promise<void> {
  await api.delete(`/api/comments/${id}`, { withCredentials: true });
}
