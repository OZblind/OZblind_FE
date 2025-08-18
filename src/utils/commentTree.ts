import type { CommentMeta } from "@src/types/post";

export type AnyId = string | number;

const idsEqual = (a: AnyId, b: AnyId) => String(a) === String(b);

/** 트리 내 최대 '숫자' id */
export function getMaxNumericId<T extends { id: AnyId; replies?: T[] }>(
  nodes: T[]
): number {
  let max = 0;
  const walk = (arr?: T[]) => {
    if (!arr) return;
    for (const n of arr) {
      if (typeof n.id === "number") max = Math.max(max, n.id);
      if (n.replies?.length) walk(n.replies);
    }
  };
  walk(nodes);
  return max;
}

export function nextNumericId<T extends { id: AnyId; replies?: T[] }>(
  nodes: T[],
  fallbackBase = Date.now()
): number {
  const max = getMaxNumericId(nodes);
  return max > 0 ? max + 1 : fallbackBase;
}

/** 특정 id 노드 업데이트 */
export function updateCommentTree<T extends { id: AnyId; replies?: T[] }>(
  nodes: T[],
  id: T["id"],
  updater: (c: T) => T
): T[] {
  return nodes.map((n) => {
    if (idsEqual(n.id, id)) return updater(n);
    if (n.replies?.length)
      return { ...n, replies: updateCommentTree(n.replies, id, updater) };
    return n;
  });
}

/** 특정 id 노드 삭제 */
export function deleteFromCommentTree<T extends { id: AnyId; replies?: T[] }>(
  nodes: T[],
  id: T["id"]
): T[] {
  const mapped = nodes.map((n) =>
    n.replies?.length
      ? { ...n, replies: deleteFromCommentTree(n.replies, id) }
      : n
  );
  return mapped.filter((n) => !idsEqual(n.id, id));
}

/** 최상위(rootId)의 replies에 대댓글 추가 */
export function addReplyToRoot<
  T extends { id: AnyId; replies?: T[]; hasReplies?: boolean }
>(nodes: T[], rootId: T["id"], reply: T): T[] {
  return nodes.map((n) => {
    if (idsEqual(n.id, rootId)) {
      const nextReplies = [...(n.replies ?? []), reply];
      return { ...n, hasReplies: true, replies: nextReplies };
    }
    if (n.replies?.length)
      return { ...n, replies: addReplyToRoot(n.replies, rootId, reply) };
    return n;
  });
}

/** CommentMeta 전용 래퍼 (편의용) */
export const commentTree = {
  update: (
    nodes: CommentMeta[],
    id: CommentMeta["id"],
    updater: (c: CommentMeta) => CommentMeta
  ) => updateCommentTree(nodes, id, updater),
  remove: (nodes: CommentMeta[], id: CommentMeta["id"]) =>
    deleteFromCommentTree(nodes, id),
  addToRoot: (
    nodes: CommentMeta[],
    rootId: CommentMeta["id"],
    reply: CommentMeta
  ) => addReplyToRoot(nodes, rootId, reply),
  getMaxNumericId: (arr: CommentMeta[]) => getMaxNumericId(arr),
  nextNumericId: (arr: CommentMeta[]) => nextNumericId(arr),
};
