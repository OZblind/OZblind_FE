import { api } from "@api/client";

export type ReactionBody = {
  target_type: "post" | "comment";
  target_id: number | string; // ← 문자열도 허용
  reaction: "like" | "dislike";
};

function toIntId(id: number | string): number {
  const n = typeof id === "string" ? parseInt(id, 10) : id;
  if (!Number.isFinite(n)) throw new Error("Invalid target_id");
  return n;
}

export async function toggleReaction(body: ReactionBody) {
  const payload = { ...body, target_id: toIntId(body.target_id) }; // ← 여기서 정규화
  const { data } = await api.post("/api/reactions/", payload, {
    withCredentials: true,
  });
  return data as {
    status: "success" | "error";
    message: string;
    data?: {
      id: number;
      reaction: "like" | "dislike";
      reaction_type?: "like" | "dislike";
    };
  };
}

// === 기존 좋아요 전용 API와 동일한 시그니처를 유지하는 어댑터 ===
export async function toggleLikeOnPost(postId: number) {
  return toggleReaction({
    target_type: "post",
    target_id: postId,
    reaction: "like",
  });
}
export async function toggleDislikeOnPost(postId: number) {
  return toggleReaction({
    target_type: "post",
    target_id: postId,
    reaction: "dislike",
  });
}
export async function toggleLikeOnComment(commentId: number) {
  return toggleReaction({
    target_type: "comment",
    target_id: commentId,
    reaction: "like",
  });
}
export async function toggleDislikeOnComment(commentId: number) {
  return toggleReaction({
    target_type: "comment",
    target_id: commentId,
    reaction: "dislike",
  });
}
