import type { CommentMeta } from "@src/types/post";

export type CommentWithReactions = CommentMeta & {
  viewerReaction?: "like" | "dislike" | null;
  reactions?: { like: number; dislike: number };
  // 백엔드가 주는 기존 필드(있을 수도 있고 없을 수도 있음)
  liked?: boolean;
  disliked?: boolean;
  likes?: number;
  dislikes?: number;
  replies?: CommentWithReactions[];
};

export function normalizeComment<T extends CommentWithReactions>(c: T): T {
  const viewerReaction =
    c.viewerReaction ?? (c.liked ? "like" : c.disliked ? "dislike" : null);

  const reactions = {
    like:
      typeof c.reactions?.like === "number"
        ? c.reactions!.like
        : typeof c.likes === "number"
        ? c.likes!
        : 0,
    dislike:
      typeof c.reactions?.dislike === "number"
        ? c.reactions!.dislike
        : typeof c.dislikes === "number"
        ? c.dislikes!
        : 0,
  };

  return {
    ...c,
    viewerReaction,
    reactions,
    replies: Array.isArray(c.replies) ? c.replies.map(normalizeComment) : [],
  };
}
