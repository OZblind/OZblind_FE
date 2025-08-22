import type { CommentFull } from "@src/types/comment";

export type CommentThread = {
  root: CommentFull; // 루트 댓글
  children: CommentFull[]; // 같은 root를 가진 나머지 (시간순)
};

export function groupByThread(comments: CommentFull[]): CommentThread[] {
  const map = new Map<number, CommentThread>();
  for (const c of comments) {
    const rid = (c.root ?? c.id) as number;
    if (!map.has(rid)) {
      map.set(rid, { root: c.root ? ({} as CommentFull) : c, children: [] });
    }
    const slot = map.get(rid)!;
    if (!c.root || c.id === rid) {
      // 루트 댓글
      slot.root = c;
    } else {
      // 대댓글
      slot.children.push(c);
    }
  }
  // created_at 순으로 children 정렬 보정(서버가 이미 정렬하지만 안전장치)
  for (const t of map.values()) {
    t.children.sort((a, b) => a.created_at.localeCompare(b.created_at));
  }
  return Array.from(map.values()).sort((a, b) =>
    a.root.created_at.localeCompare(b.root.created_at)
  );
}
