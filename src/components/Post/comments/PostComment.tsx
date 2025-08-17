import { useEffect, useMemo, useRef, useState } from "react";
import type { CommentMeta } from "@src/mocks/post.demo";
import { fmtNum } from "@src/utils/utils";
import CommentItem from "./CommentItem";
import { commentTree } from "@src/utils/commentTree";

type SortKey = "newest" | "oldest" | "likes";

/** 안정적 색 생성용 팔레트 + 해시 */
const THREAD_COLORS = [
  "#5B8DEF",
  "#50C878",
  "#F59E0B",
  "#EF4444",
  "#A78BFA",
  "#10B981",
  "#F472B6",
  "#22D3EE",
  "#E879F9",
  "#F97316",
  "#34D399",
  "#60A5FA",
];
function hashId(id: string | number): number {
  const s = String(id);
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}
function colorFor(id: CommentMeta["id"]) {
  return THREAD_COLORS[hashId(id) % THREAD_COLORS.length];
}

export default function PostComment({ comments }: { comments: CommentMeta[] }) {
  const [list, setList] = useState<CommentMeta[]>(comments);
  useEffect(() => setList(comments), [comments]);

  // id 발급기 (숫자 id 없을 때도 안전)
  const idRef = useRef<number>(commentTree.getMaxNumericId(comments) || 0);
  const [sortKey, setSortKey] = useState<SortKey>("newest");

  const topLevelSorted = useMemo(() => {
    const arr = [...list];
    switch (sortKey) {
      case "newest":
        arr.sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt));
        break;
      case "oldest":
        arr.sort((a, b) => +new Date(a.createdAt) - +new Date(b.createdAt));
        break;
      case "likes":
        arr.sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
        break;
    }
    return arr;
  }, [list, sortKey]);

  const handleEdit = (id: CommentMeta["id"], content: string) => {
    setList((prev) => commentTree.update(prev, id, (c) => ({ ...c, content })));
    // TODO: PATCH /comments/:id
  };

  const handleDelete = (id: CommentMeta["id"]) => {
    setList((prev) => commentTree.remove(prev, id));
    // TODO: DELETE /comments/:id
  };

  /** 규칙:
   * - depth=0: rootId 자신의 replies에 인라인 추가
   * - depth>0: 더 깊게 안 들어가고 동일 rootId의 replies에 추가 (같은 라인)
   */
  const handleAddReply = (rootId: CommentMeta["id"], content: string) => {
    const newId =
      typeof rootId === "number" ? ++idRef.current : String(Date.now());
    const reply: CommentMeta = {
      id: newId as CommentMeta["id"],
      author: "나", // TODO: 로그인 유저명
      content,
      createdAt: new Date().toISOString(),
      likes: 0,
      dislikes: 0,
      liked: false,
      disliked: false,
      hasReplies: false,
      replies: [],
    };
    setList((prev) => commentTree.addToRoot(prev, rootId, reply));
    // TODO: POST /comments (parentId = rootId)
  };

  return (
    <section className="mt-8">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">댓글 {fmtNum(list.length)}</h2>

        <div className="flex items-center gap-2">
          <select
            id="comment-sort"
            className="select select-sm select-bordered"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value as SortKey)}
            aria-label="댓글 정렬"
          >
            <option value="newest">최신순</option>
            <option value="oldest">오래된순</option>
            <option value="likes">좋아요순</option>
          </select>
        </div>
      </div>

      <div className="space-y-8">
        {topLevelSorted.map((c) => {
          const branchColor = colorFor(c.id);
          return (
            <div key={c.id} className="relative pl-6">
              {/* 스레드 세로 라인 (최상위 댓글~모든 대댓글을 감쌈) */}
              <span
                aria-hidden
                className="absolute left-0 top-0 bottom-0 w-[2px] rounded-full"
                style={{ backgroundColor: branchColor, opacity: 0.6 }}
              />
              <CommentItem
                key={c.id}
                data={c}
                depth={0}
                rootId={c.id}
                branchColor={branchColor}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAddReply={handleAddReply}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}
